<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;

/**
 * Membuang metadata tersembunyi dari foto sebelum disimpan.
 *
 * Foto dari ponsel membawa EXIF: koordinat GPS tempat pengambilan, merek dan
 * seri ponsel, waktu pemotretan, kadang nama pemilik. Untuk pelapor kecurangan
 * yang memilih anonim, satu foto bukti bisa menunjuk balik ke dirinya lebih
 * pasti daripada namanya sendiri. Memperingatkan saja tidak cukup — sebagian
 * besar orang tidak tahu metadata itu ada.
 *
 * CARANYA: gambar dibaca lalu ditulis ulang dari piksel mentahnya lewat GD.
 * Hasil tulisan ulang tidak memuat EXIF, XMP, maupun IPTC, karena GD memang
 * tidak menyalinnya. Ini lebih dapat diandalkan daripada "menghapus segmen
 * EXIF" — yang harus tahu setiap tempat metadata bisa bersembunyi.
 *
 * JEBAKAN ORIENTASI. Ponsel sering menyimpan foto dalam posisi sensor, lalu
 * menaruh arah putarnya di EXIF. Kalau EXIF dibuang begitu saja, foto tegak
 * mendadak tampil rebah. Karena itu orientasinya DITERAPKAN dulu ke pikselnya,
 * baru metadatanya dibuang.
 *
 * PDF tidak disentuh. Metadata PDF (penyusun, perangkat lunak) tidak bisa
 * dibersihkan dengan andal tanpa pustaka khusus, dan lebih jujur mengatakannya
 * di formulir daripada berpura-pura.
 */
class PembersihMetadataGambar
{
    /**
     * Membersihkan berkas di tempatnya. Mengembalikan true kalau berkasnya
     * gambar dan berhasil ditulis ulang; false kalau bukan gambar (dibiarkan).
     */
    public function bersihkan(UploadedFile $berkas): bool
    {
        $jalur = $berkas->getRealPath();
        $mime = $berkas->getMimeType();

        $gambar = match ($mime) {
            'image/jpeg' => @imagecreatefromjpeg($jalur),
            'image/png' => @imagecreatefrompng($jalur),
            default => null,
        };

        if (! $gambar) {
            return false;
        }

        if ($mime === 'image/jpeg') {
            $gambar = $this->terapkanOrientasi($gambar, $jalur);
        }

        if ($mime === 'image/png') {
            // Pertahankan transparansi; tanpa dua baris ini latar tembus
            // pandang menjadi hitam pekat setelah ditulis ulang.
            imagealphablending($gambar, false);
            imagesavealpha($gambar, true);
        }

        $berhasil = match ($mime) {
            'image/jpeg' => imagejpeg($gambar, $jalur, 90),
            'image/png' => imagepng($gambar, $jalur, 6),
        };

        imagedestroy($gambar);

        return (bool) $berhasil;
    }

    /**
     * Memutar piksel sesuai tag Orientation EXIF, supaya setelah EXIF-nya
     * hilang fotonya tetap tegak.
     */
    private function terapkanOrientasi(\GdImage $gambar, string $jalur): \GdImage
    {
        if (! function_exists('exif_read_data')) {
            return $gambar;
        }

        $exif = @exif_read_data($jalur);
        $orientasi = (int) ($exif['Orientation'] ?? 1);

        $diputar = match ($orientasi) {
            3 => imagerotate($gambar, 180, 0),
            6 => imagerotate($gambar, -90, 0),
            8 => imagerotate($gambar, 90, 0),
            default => null,
        };

        if ($diputar) {
            imagedestroy($gambar);

            return $diputar;
        }

        return $gambar;
    }
}
