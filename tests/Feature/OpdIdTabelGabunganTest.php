<?php

namespace Tests\Feature;

use App\Models\Opd;
use App\Models\User;
use App\Services\KroIroPdSyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Kunci asing `opd_id` pada tabel gabungan — penjaga temuan audit R-08.
 *
 * Tabel gabungan dibangun ulang penuh dari baris sumber, dan `opd_id`
 * diturunkan dari AKUN pemilik baris sumber itu — bukan dari kolom teks nama
 * OPD yang diisi bebas. Tiga hal yang harus tetap benar:
 *
 *   1. Baris milik PIC berisi opd_id akunnya, apa pun tulisan di kolom teks.
 *   2. Baris yang diisi Super Admin (tanpa OPD) jatuh ke pencocokan NAMA
 *      persis — satu-satunya keadaan di mana nama dipakai.
 *   3. Nama yang meleset TIDAK ditautkan ke OPD mana pun, alih-alih ditebak.
 */
class OpdIdTabelGabunganTest extends TestCase
{
    use RefreshDatabase;

    private function kro(User $pemilik, string $opdTeks): void
    {
        DB::table('tbl_kro_pd')->insert([
            'user_id' => $pemilik->id,
            'SASARAN RENSTRA' => 'Sasaran A',
            'PROGRAM PD' => 'Program A',
            'KEGIATAN PD' => 'Kegiatan A',
            'OPD PENANGGUNG JAWAB KEGIATAN' => $opdTeks,
        ]);
    }

    public function test_opd_id_diturunkan_dari_akun_pemilik_bukan_dari_teks(): void
    {
        $dlh = Opd::create(['nama' => 'DINAS LINGKUNGAN HIDUP']);
        Opd::create(['nama' => 'DINAS KESEHATAN']);
        $pic = User::factory()->create(['opd_id' => $dlh->id]);

        // Teksnya SENGAJA menyebut OPD lain: akunlah yang dipercaya.
        $this->kro($pic, 'DINAS KESEHATAN');

        app(KroIroPdSyncService::class)->syncNow();

        $this->assertSame($dlh->id, (int) DB::table('tbl_kro_iro_pd')->value('opd_id'));
    }

    public function test_baris_super_admin_jatuh_ke_pencocokan_nama_persis(): void
    {
        $bkpsdm = Opd::create(['nama' => 'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA']);
        $superAdmin = User::factory()->create(['opd_id' => null]);

        // Kapital berbeda dan spasi ganda tetap cocok — itu bukan "nama lain".
        $this->kro($superAdmin, 'Badan Kepegawaian dan  Pengembangan Sumber Daya Manusia');

        app(KroIroPdSyncService::class)->syncNow();

        $this->assertSame($bkpsdm->id, (int) DB::table('tbl_kro_iro_pd')->value('opd_id'));
    }

    public function test_nama_yang_meleset_tidak_ditebak(): void
    {
        Opd::create(['nama' => 'DINAS KESEHATAN']);
        $superAdmin = User::factory()->create(['opd_id' => null]);

        $this->kro($superAdmin, 'DINAS KESEHATAN KABUPATEN');

        app(KroIroPdSyncService::class)->syncNow();

        $this->assertNull(DB::table('tbl_kro_iro_pd')->value('opd_id'), 'nama yang meleset harus dibiarkan null, bukan dicocokkan ke yang mirip');
    }
}
