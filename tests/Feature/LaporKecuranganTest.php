<?php

namespace Tests\Feature;

use App\Models\LaporanKecurangan;
use App\Models\Opd;
use App\Models\PesanLaporanKecurangan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Lapor Dugaan Kecurangan — tab kedua pada halaman Lapor, muara MR Fraud.
 *
 * Yang dijaga di sini adalah janji-janji yang kalau diingkari tidak menimbulkan
 * galat apa pun, dan justru itu yang paling merugikan orang:
 *
 *   1. ANONIM berarti identitasnya TIDAK DISIMPAN — bukan disimpan lalu
 *      disembunyikan di layar.
 *   2. Rekapnya TIDAK boleh terbuka bagi akun bersama LAPOR, yang kredensialnya
 *      dipegang publik lewat QR code.
 */
class LaporKecuranganTest extends TestCase
{
    use RefreshDatabase;

    private function pelapor(): User
    {
        return User::factory()->create();
    }

    public function test_halaman_lapor_memuat_kedua_formulir_dalam_satu_halaman(): void
    {
        $this->actingAs($this->pelapor());

        // Satu QR menunjuk ke sini, dan halaman ini yang menawarkan pilihannya.
        $this->get('/lapor-kejadian')->assertOk();
    }

    public function test_laporan_terkirim_dan_berstatus_baru(): void
    {
        $opd = Opd::create(['nama' => 'DINAS KESEHATAN']);

        $this->actingAs($this->pelapor())->post('/lapor-kecurangan', [
            'mode_pelapor' => 'terbuka',
            'nama_pelapor' => 'Budi',
            'email' => 'budi@example.test',
            'uraian_kejadian' => 'Dugaan mark up harga pada pengadaan alat kesehatan',
            'opd_id' => $opd->id,
            'tahapan_proses' => 'Pengadaan Barang dan Jasa',
            'dugaan_kelompok' => ['Perbuatan Curang'],
        ])->assertRedirect();

        $this->assertDatabaseHas('laporan_kecurangan', [
            'nama_pelapor' => 'Budi',
            'status' => 'baru',
            'opd_id' => $opd->id,
        ]);
    }

    /**
     * Inti janji formulir ini. Identitas yang tersimpan tapi "tidak
     * ditampilkan" tetap terbaca oleh siapa pun yang bisa membuka basis data —
     * jadi anonim harus berarti tidak tersimpan.
     */
    public function test_laporan_anonim_tidak_menyimpan_identitas_sama_sekali(): void
    {
        $this->actingAs($this->pelapor())->post('/lapor-kecurangan', [
            'mode_pelapor' => 'anonim_penuh',
            // Sengaja tetap dikirim: peramban yang keliru urutan, atau yang
            // sengaja mengirimnya, tidak boleh membuat identitas tersimpan.
            'nama_pelapor' => 'Budi',
            'email' => 'budi@example.test',
            'no_hp' => '08123456789',
            'uraian_kejadian' => 'Dugaan gratifikasi pada proses perizinan',
        ])->assertRedirect();

        $laporan = LaporanKecurangan::first();

        $this->assertTrue($laporan->anonim);
        $this->assertNull($laporan->nama_pelapor);
        $this->assertNull($laporan->email);
        $this->assertNull($laporan->no_hp);
        $this->assertSame('Anonim', $laporan->pelapor);
    }

    public function test_uraian_kejadian_wajib_diisi(): void
    {
        $this->actingAs($this->pelapor())
            ->post('/lapor-kecurangan', ['mode_pelapor' => 'terbuka', 'uraian_kejadian' => ''])
            ->assertSessionHasErrors('uraian_kejadian');

        $this->assertDatabaseCount('laporan_kecurangan', 0);
    }

    public function test_dugaan_delik_di_luar_tujuh_pilihan_ditolak(): void
    {
        $this->actingAs($this->pelapor())->post('/lapor-kecurangan', [
            'mode_pelapor' => 'terbuka',
            'uraian_kejadian' => 'Sesuatu terjadi',
            'dugaan_kelompok' => ['Korupsi biasa'],
        ])->assertSessionHasErrors('dugaan_kelompok.0');
    }

    /**
     * Akun bersama LAPOR dipegang publik lewat QR. Kalau ia bisa membuka rekap,
     * siapa pun yang memindai QR bisa membaca seluruh laporan kecurangan —
     * kebalikan dari tujuan formulirnya.
     */
    public function test_pelapor_biasa_tidak_bisa_membuka_rekap(): void
    {
        $this->actingAs($this->pelapor())
            ->get('/fraud/rekap-lapor')
            ->assertForbidden();
    }

    public function test_tamu_tidak_bisa_mengirim_laporan(): void
    {
        $this->post('/lapor-kecurangan', ['mode_pelapor' => 'terbuka', 'uraian_kejadian' => 'Sesuatu'])
            ->assertRedirect('/login');
    }

    /**
     * Mode tengah: nama tidak disimpan, tetapi kanal kontak tetap ada.
     *
     * Ini yang dibutuhkan orang yang bersedia dihubungi Inspektorat tetapi
     * tidak mau namanya muncul di berkas — dan yang sebelumnya terpaksa
     * memilih salah satu ujung.
     */
    public function test_anonim_kontak_menyimpan_kontak_tanpa_nama(): void
    {
        $this->actingAs($this->pelapor())->post('/lapor-kecurangan', [
            'mode_pelapor' => 'anonim_kontak',
            'nama_pelapor' => 'Budi',
            'email' => 'budi@example.test',
            'uraian_kejadian' => 'Dugaan benturan kepentingan pada pemilihan penyedia',
        ])->assertRedirect();

        $l = LaporanKecurangan::first();

        $this->assertNull($l->nama_pelapor, 'nama tidak boleh tersimpan pada mode anonim');
        $this->assertSame('budi@example.test', $l->email, 'kontak justru harus tersimpan pada mode ini');
        $this->assertTrue($l->anonim);
    }

    /** Tiap laporan mendapat nomor tiket, dan kode aksesnya TIDAK disimpan mentah. */
    public function test_tiket_terbit_dan_kode_akses_hanya_tersimpan_sebagai_hash(): void
    {
        $respons = $this->actingAs($this->pelapor())->post('/lapor-kecurangan', [
            'mode_pelapor' => 'anonim_penuh',
            'uraian_kejadian' => 'Dugaan pemerasan pada pelayanan perizinan',
        ]);

        $tiket = session('tiketBaru');

        $this->assertNotNull($tiket, 'nomor tiket harus dikembalikan ke pelapor sekali jalan');
        $this->assertMatchesRegularExpression('/^FRA-\d{4}-\d{4}$/', $tiket['nomor_tiket']);

        $l = LaporanKecurangan::first();

        $this->assertSame($tiket['nomor_tiket'], $l->nomor_tiket);
        $this->assertNotSame($tiket['kode_akses'], $l->kode_akses_hash, 'kode akses tidak boleh tersimpan apa adanya');
        $this->assertTrue(Hash::check($tiket['kode_akses'], $l->kode_akses_hash));

        $respons->assertRedirect();
    }

    /**
     * Inti jawaban atas "kalau anonim, bagaimana menindaklanjutinya": pelapor
     * kembali dengan tiketnya, membaca pertanyaan, dan menjawab.
     */
    public function test_pelapor_anonim_bisa_kembali_dan_menjawab_lewat_tiket(): void
    {
        $this->actingAs($this->pelapor())->post('/lapor-kecurangan', [
            'mode_pelapor' => 'anonim_penuh',
            'uraian_kejadian' => 'Dugaan mark up pada pengadaan',
        ]);

        $tiket = session('tiketBaru');
        $l = LaporanKecurangan::first();

        // Penindaklanjut bertanya.
        $l->pesan()->create([
            'dari' => PesanLaporanKecurangan::DARI_PENINDAKLANJUT,
            'isi' => 'Pada tanggal berapa pengadaan itu berlangsung?',
        ]);

        // Pelapor membuka status dengan tiketnya dan melihat pertanyaan itu.
        $this->actingAs($this->pelapor())->post('/lapor-kecurangan/status', [
            'nomor_tiket' => $tiket['nomor_tiket'],
            'kode_akses' => $tiket['kode_akses'],
        ])->assertRedirect();

        $hasil = session('hasilTiket');
        $this->assertNotNull($hasil);
        $this->assertCount(1, $hasil['pesan']);

        // Lalu menjawabnya.
        $this->actingAs($this->pelapor())->post('/lapor-kecurangan/balas', [
            'nomor_tiket' => $tiket['nomor_tiket'],
            'kode_akses' => $tiket['kode_akses'],
            'isi' => 'Sekitar Maret 2026.',
        ])->assertRedirect();

        $this->assertDatabaseHas('pesan_laporan_kecurangan', [
            'laporan_kecurangan_id' => $l->id,
            'dari' => 'pelapor',
            'isi' => 'Sekitar Maret 2026.',
        ]);

        // Jawaban pelapor tidak menautkan akun mana pun — akun yang dipakai
        // adalah akun bersama LAPOR, dan mencatatnya tidak menambah keterangan
        // apa pun yang berguna.
        $this->assertNull(
            PesanLaporanKecurangan::where('dari', 'pelapor')->value('user_id'),
            'pesan pelapor tidak boleh menyimpan user_id'
        );
    }

    public function test_kode_akses_salah_ditolak(): void
    {
        $this->actingAs($this->pelapor())->post('/lapor-kecurangan', [
            'mode_pelapor' => 'anonim_penuh',
            'uraian_kejadian' => 'Dugaan gratifikasi',
        ]);

        $tiket = session('tiketBaru');

        $this->actingAs($this->pelapor())->post('/lapor-kecurangan/status', [
            'nomor_tiket' => $tiket['nomor_tiket'],
            'kode_akses' => 'SALAHSEKALI',
        ])->assertSessionHasErrors('nomor_tiket');

        $this->assertNull(session('hasilTiket'));
    }

    /**
     * Tiket yang tidak ada dan kode yang salah menghasilkan pesan yang SAMA —
     * supaya endpoint ini tidak bisa dipakai menebak tiket mana yang benar-benar
     * ada.
     */
    public function test_tiket_tak_dikenal_tidak_membocorkan_keberadaannya(): void
    {
        $this->actingAs($this->pelapor())->post('/lapor-kecurangan/status', [
            'nomor_tiket' => 'FRA-2026-9999',
            'kode_akses' => 'APASAJA',
        ])->assertSessionHasErrors('nomor_tiket');
    }

    /**
     * Berkas bukti melekat pada LAPORAN, bukan pada akun pengunggah.
     *
     * Unggahan lewat QR dikirim memakai akun bersama LAPOR. Kalau berkasnya
     * melekat ke akun itu, seluruh bukti dari semua pelapor berkumpul pada satu
     * akun yang kredensialnya dipegang publik — dan ikut muncul di File Manager.
     */
    public function test_berkas_bukti_melekat_pada_laporan_bukan_pada_akun(): void
    {
        Storage::fake(config('media-library.disk_name'));

        $pelapor = $this->pelapor();

        $this->actingAs($pelapor)->post('/lapor-kecurangan', [
            'mode_pelapor' => 'anonim_penuh',
            'uraian_kejadian' => 'Dugaan mark up disertai bukti',
            'bukti' => [UploadedFile::fake()->image('nota.jpg')],
        ])->assertRedirect();

        $l = LaporanKecurangan::first();

        $this->assertCount(1, $l->daftarBukti());
        $this->assertSame(0, $pelapor->getMedia('files')->count(), 'berkas tidak boleh melekat ke akun pengunggah');
    }

    public function test_berkas_selain_gambar_dan_pdf_ditolak(): void
    {
        Storage::fake(config('media-library.disk_name'));

        $this->actingAs($this->pelapor())->post('/lapor-kecurangan', [
            'mode_pelapor' => 'terbuka',
            'uraian_kejadian' => 'Sesuatu',
            'bukti' => [UploadedFile::fake()->create('skrip.exe', 10)],
        ])->assertSessionHasErrors('bukti.0');

        $this->assertDatabaseCount('laporan_kecurangan', 0);
    }

    public function test_lebih_dari_lima_berkas_ditolak(): void
    {
        Storage::fake(config('media-library.disk_name'));

        $berkas = [];
        for ($i = 0; $i < 6; $i++) {
            $berkas[] = UploadedFile::fake()->image("bukti{$i}.jpg");
        }

        $this->actingAs($this->pelapor())->post('/lapor-kecurangan', [
            'mode_pelapor' => 'terbuka',
            'uraian_kejadian' => 'Sesuatu',
            'bukti' => $berkas,
        ])->assertSessionHasErrors('bukti');
    }

    /**
     * Akun bersama LAPOR tidak boleh mengunduh bukti. Kalau bisa, siapa pun
     * yang memindai QR bisa membaca bukti milik pelapor lain.
     */
    public function test_pelapor_biasa_tidak_bisa_mengunduh_bukti(): void
    {
        Storage::fake(config('media-library.disk_name'));

        $this->actingAs($this->pelapor())->post('/lapor-kecurangan', [
            'mode_pelapor' => 'anonim_penuh',
            'uraian_kejadian' => 'Dugaan suap disertai bukti',
            'bukti' => [UploadedFile::fake()->image('bukti.jpg')],
        ]);

        $l = LaporanKecurangan::first();
        $mediaId = $l->daftarBukti()[0]['id'];

        $this->actingAs($this->pelapor())
            ->get("/fraud/rekap-lapor/{$l->id}/bukti/{$mediaId}")
            ->assertForbidden();
    }

    /**
     * Pelapor anonim harus bisa menyerahkan bukti SESUDAH diminta — sebab
     * penindaklanjut sering baru memintanya setelah membaca laporannya.
     */
    public function test_pelapor_anonim_bisa_melampirkan_bukti_lewat_tiket(): void
    {
        Storage::fake(config('media-library.disk_name'));

        $this->actingAs($this->pelapor())->post('/lapor-kecurangan', [
            'mode_pelapor' => 'anonim_penuh',
            'uraian_kejadian' => 'Dugaan gratifikasi',
        ]);

        $tiket = session('tiketBaru');

        $this->actingAs($this->pelapor())->post('/lapor-kecurangan/balas', [
            'nomor_tiket' => $tiket['nomor_tiket'],
            'kode_akses' => $tiket['kode_akses'],
            'isi' => 'Ini buktinya.',
            'bukti' => [UploadedFile::fake()->image('percakapan.png')],
        ])->assertRedirect();

        $this->assertCount(1, LaporanKecurangan::first()->daftarBukti());
    }
}
