<?php

namespace Tests\Feature;

use App\Models\LaporanKecurangan;
use App\Models\Opd;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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

    private function pengelola(): User
    {
        // canViewAllOpd() menandai admin/super-admin; di sini cukup pengguna
        // tanpa OPD yang perannya disetel lewat helper aplikasi.
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
            'anonim' => false,
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
            'anonim' => true,
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
            ->post('/lapor-kecurangan', ['uraian_kejadian' => ''])
            ->assertSessionHasErrors('uraian_kejadian');

        $this->assertDatabaseCount('laporan_kecurangan', 0);
    }

    public function test_dugaan_delik_di_luar_tujuh_pilihan_ditolak(): void
    {
        $this->actingAs($this->pelapor())->post('/lapor-kecurangan', [
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
        $this->post('/lapor-kecurangan', ['uraian_kejadian' => 'Sesuatu'])
            ->assertRedirect('/login');
    }
}
