<?php

namespace Tests\Unit;

use App\Services\PembersihMetadataGambar;
use Illuminate\Http\UploadedFile;
use PHPUnit\Framework\TestCase;

/**
 * Pembersih metadata foto — penjaga anonimitas pelapor kecurangan.
 *
 * Diuji dengan JPEG yang BENAR-BENAR membawa EXIF, bukan gambar palsu kosong:
 * tes yang memakai gambar tanpa metadata akan lulus walau pembersihnya tidak
 * berbuat apa-apa.
 */
class PembersihMetadataGambarTest extends TestCase
{
    /**
     * Membuat JPEG kecil lalu menyisipkan segmen EXIF berisi koordinat GPS
     * dan tag Orientation, persis seperti keluaran kamera ponsel.
     */
    private function jpegDenganExif(int $orientasi = 1): string
    {
        $jalur = tempnam(sys_get_temp_dir(), 'exif').'.jpg';

        // Gambar 40x20: lebar > tinggi, supaya putaran 90° terdeteksi dari
        // dimensinya.
        $g = imagecreatetruecolor(40, 20);
        imagefill($g, 0, 0, imagecolorallocate($g, 200, 30, 30));
        imagejpeg($g, $jalur, 90);
        imagedestroy($g);

        $isi = file_get_contents($jalur);

        // Segmen APP1 EXIF minimal (little-endian) memuat dua tag IFD0:
        // Orientation (0x0112) dan GPSInfo (0x8825) yang menunjuk IFD GPS
        // berisi GPSLatitudeRef. Cukup untuk dikenali exif_read_data().
        $tiff = 'II'.pack('v', 42).pack('V', 8);
        $ifd0 = pack('v', 2)
            .pack('vvVV', 0x0112, 3, 1, $orientasi)          // Orientation
            .pack('vvVV', 0x8825, 4, 1, 8 + 2 + 12 * 2 + 4)  // GPSInfo -> offset IFD GPS
            .pack('V', 0);
        $gps = pack('v', 1)
            .pack('vvV', 0x0001, 2, 2).'N'."\0\0\0"          // GPSLatitudeRef = "N"
            .pack('V', 0);
        $exif = "Exif\0\0".$tiff.$ifd0.$gps;
        $app1 = "\xFF\xE1".pack('n', strlen($exif) + 2).$exif;

        // Sisipkan tepat setelah penanda SOI (FFD8).
        file_put_contents($jalur, substr($isi, 0, 2).$app1.substr($isi, 2));

        return $jalur;
    }

    public function test_exif_benar_benar_hilang_setelah_dibersihkan(): void
    {
        $jalur = $this->jpegDenganExif();

        $sebelum = @exif_read_data($jalur);
        $this->assertIsArray($sebelum, 'gambar uji harus memuat EXIF, kalau tidak tes ini tidak menguji apa pun');
        $this->assertArrayHasKey('Orientation', $sebelum);

        (new PembersihMetadataGambar)->bersihkan(new UploadedFile($jalur, 'bukti.jpg', 'image/jpeg', null, true));

        $sesudah = @exif_read_data($jalur);
        $this->assertTrue(
            $sesudah === false || ! isset($sesudah['Orientation']),
            'EXIF masih ada setelah dibersihkan'
        );
        $this->assertTrue(
            $sesudah === false || ! isset($sesudah['GPSLatitudeRef']),
            'data GPS masih ada setelah dibersihkan'
        );

        @unlink($jalur);
    }

    /**
     * Foto dengan Orientation 6 (harus diputar 90°) harus tampil tegak SETELAH
     * EXIF-nya hilang — kalau tidak, pembersih membuat semua foto ponsel rebah.
     */
    public function test_orientasi_diterapkan_sebelum_exif_dibuang(): void
    {
        $jalur = $this->jpegDenganExif(orientasi: 6);
        [$lebarAwal, $tinggiAwal] = getimagesize($jalur);
        $this->assertSame([40, 20], [$lebarAwal, $tinggiAwal]);

        (new PembersihMetadataGambar)->bersihkan(new UploadedFile($jalur, 'bukti.jpg', 'image/jpeg', null, true));

        [$lebar, $tinggi] = getimagesize($jalur);
        $this->assertSame([20, 40], [$lebar, $tinggi], 'piksel harus sudah diputar 90° agar tampil tegak tanpa EXIF');

        @unlink($jalur);
    }

    public function test_pdf_dibiarkan_utuh(): void
    {
        $jalur = tempnam(sys_get_temp_dir(), 'pdf').'.pdf';
        file_put_contents($jalur, "%PDF-1.4\n%uji\n");
        $sebelum = md5_file($jalur);

        $hasil = (new PembersihMetadataGambar)->bersihkan(new UploadedFile($jalur, 'b.pdf', 'application/pdf', null, true));

        $this->assertFalse($hasil);
        $this->assertSame($sebelum, md5_file($jalur), 'PDF tidak boleh diubah');

        @unlink($jalur);
    }
}
