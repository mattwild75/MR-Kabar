<?php

namespace Tests\Feature;

use App\Models\Opd;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Penjaga celah KRITIS yang ditemukan audit PASS 1 (17 Agustus 2026).
 *
 * Celahnya: siapa pun TANPA AKUN dapat mencetak kertas kerja CEE milik
 * perangkat daerah mana pun. Rantainya empat langkah — /login/cee-survey
 * adalah rute publik tanpa sandi, RestrictCeeSurveyRole mengizinkan
 * /cetak/cee, penjaga di CetakCeeController membebaskan peran cee-survey,
 * lalu opd_id dari URL dipakai apa adanya.
 *
 * Celah dengan bentuk yang sama sudah pernah ditutup di SharesCetakContext
 * dan dipakai enam controller cetak lain; CetakCeeController tertinggal
 * memakai salinan penjaganya sendiri. Itulah kenapa uji ini ada: perbaikan
 * yang benar sudah pernah ada, dan tetap saja satu tempat luput. Tanpa uji,
 * ia bisa luput lagi tanpa ada yang menyadari.
 */
class KeamananAksesOpdTest extends TestCase
{
    use RefreshDatabase;

    private function siapkan(): array
    {
        foreach (['admin', 'super-admin', 'user', 'cee-survey'] as $n) {
            Role::findOrCreate($n, 'web');
        }

        $opdA = Opd::create(['nama' => 'DINAS UJI A']);
        $opdB = Opd::create(['nama' => 'DINAS UJI B']);

        return [$opdA, $opdB];
    }

    /**
     * Inti temuan KRITIS: akun bersama CEE_Survey — yang kredensialnya memang
     * publik lewat kode QR — tidak boleh mencetak CEE perangkat daerah mana pun.
     */
    public function test_akun_cee_survey_tidak_dapat_mencetak_cee_opd_mana_pun(): void
    {
        [$opdA] = $this->siapkan();

        $akunBersama = User::factory()->create(['opd_id' => null]);
        $akunBersama->assignRole('cee-survey');

        foreach (['1a', '1b', '1c'] as $form) {
            $this->actingAs($akunBersama)
                ->get("/cetak/cee/{$form}?opd_id={$opdA->id}&tahun=2025")
                ->assertForbidden();
        }
    }

    /** PIC hanya boleh perangkat daerahnya sendiri, bukan tetangganya. */
    public function test_pic_tidak_dapat_mencetak_cee_opd_lain(): void
    {
        [$opdA, $opdB] = $this->siapkan();

        $pic = User::factory()->create(['opd_id' => $opdA->id]);
        $pic->assignRole('user');

        $this->actingAs($pic)
            ->get("/cetak/cee/1a?opd_id={$opdB->id}&tahun=2025")
            ->assertForbidden();

        $this->actingAs($pic)
            ->get("/cetak/cee/1a?opd_id={$opdA->id}&tahun=2025")
            ->assertOk();
    }

    /**
     * Akun tanpa opd_id DAN tanpa hak lintas OPD harus ditolak.
     *
     * Inilah bentuk penjaga yang keliru pada versi lama: ia memperlakukan
     * "opd_id kosong" sebagai "boleh lintas OPD". Keanggotaan lintas OPD
     * harus ditentukan PERAN yang diberikan eksplisit, bukan disimpulkan dari
     * kolom yang kebetulan kosong.
     */
    public function test_akun_tanpa_opd_dan_tanpa_hak_lintas_opd_ditolak(): void
    {
        [$opdA] = $this->siapkan();

        $yatim = User::factory()->create(['opd_id' => null]);
        $yatim->assignRole('user');

        $this->actingAs($yatim)
            ->get("/cetak/cee/1a?opd_id={$opdA->id}&tahun=2025")
            ->assertForbidden();
    }

    /** Yang memang berhak harus tetap bisa — perbaikan tidak boleh mengunci admin. */
    public function test_super_admin_tetap_dapat_mencetak_cee_opd_mana_pun(): void
    {
        [$opdA, $opdB] = $this->siapkan();

        $super = User::factory()->create(['opd_id' => null]);
        $super->assignRole('super-admin');

        foreach ([$opdA, $opdB] as $opd) {
            $this->actingAs($super)
                ->get("/cetak/cee/1a?opd_id={$opd->id}&tahun=2025")
                ->assertOk();
        }
    }

    // ---------------------------------------------------------------------
    // R-10: penjaga yang disalin, bukan dipakai bersama.
    //
    // Audit PASS 4 mencatat POLANYA sebagai temuan, bukan kejadiannya:
    // selama penjaga keamanan boleh disalin, perbaikan keamanan akan
    // tertinggal di salah satu salinan. Ramalan itu terbukti — CeeForm dan
    // MonitoringEvaluasi masing-masing menyimpan salinannya sendiri, dan
    // KEDUANYA masih memuat bentuk IDOR yang sudah diperbaiki di
    // SharesCetakContext berbulan sebelumnya:
    //
    //     if (! $opdId || ! $user->opd_id || $user->canViewAllOpd()) {
    //         return;                     // <- LOLOS
    //     }
    //
    // Uji di bawah menahan bentuk itu di kedua tempat sekaligus.
    // ---------------------------------------------------------------------

    /** Akun tanpa opd_id BUKAN berarti boleh melihat semua perangkat daerah. */
    public function test_pic_tanpa_opd_tidak_dapat_membuka_cee_opd_mana_pun(): void
    {
        [$opdA] = $this->siapkan();

        $belumDitautkan = User::factory()->create(['opd_id' => null]);
        $belumDitautkan->assignRole('user');

        foreach (['1a', '1b', '1c'] as $form) {
            $this->actingAs($belumDitautkan)
                ->get("/cee/{$form}?opd_id={$opdA->id}&tahun=2025")
                ->assertForbidden();
        }
    }

    public function test_pic_tanpa_opd_tidak_dapat_membuka_monitoring_evaluasi_opd_mana_pun(): void
    {
        [$opdA] = $this->siapkan();

        $belumDitautkan = User::factory()->create(['opd_id' => null]);
        $belumDitautkan->assignRole('user');

        foreach (['8-9', '10'] as $form) {
            $this->actingAs($belumDitautkan)
                ->get("/monitoring-evaluasi/{$form}?opd_id={$opdA->id}&tahun=2025")
                ->assertForbidden();
        }
    }

    /** PIC bertautan tetap tidak boleh menyeberang ke tetangganya. */
    public function test_pic_tidak_dapat_membuka_cee_opd_lain(): void
    {
        [$opdA, $opdB] = $this->siapkan();

        $pic = User::factory()->create(['opd_id' => $opdA->id]);
        $pic->assignRole('user');

        $this->actingAs($pic)->get("/cee/1a?opd_id={$opdB->id}&tahun=2025")->assertForbidden();
    }

    /**
     * Monitoring & Evaluasi diuji lewat penyimpanannya, bukan tampilannya.
     *
     * Halaman form89/form10 memang MENGABAIKAN `?opd_id=` untuk PIC — ia
     * selalu dikunci ke perangkat daerahnya sendiri, jadi alamat yang
     * dioprek tidak menghasilkan apa pun. Yang benar-benar menerima opd_id
     * dari pengguna adalah penyimpanannya, dan di situlah penjaganya berdiri.
     */
    public function test_pic_tidak_dapat_menyimpan_monitoring_evaluasi_untuk_opd_lain(): void
    {
        [$opdA, $opdB] = $this->siapkan();

        $pic = User::factory()->create(['opd_id' => $opdA->id]);
        $pic->assignRole('user');

        $this->actingAs($pic)
            ->post('/monitoring-evaluasi/8-9', [
                'opd_id' => $opdB->id,
                'tahun' => 2025,
                'rtp_sumber_tipe' => 'irs_pemda',
                'rtp_sumber_id' => 1,
            ])
            ->assertForbidden();
    }

    /**
     * Sisi sebaliknya, dan sama pentingnya: penjaga yang disatukan TIDAK
     * BOLEH ikut menutup jalan yang memang sah. Akun bersama CEE_Survey
     * dirancang dipakai bergantian lintas OPD — kalau uji ini gagal,
     * pengisian CEE lewat kode QR berhenti untuk semua orang.
     */
    public function test_akun_cee_survey_tetap_dapat_mengisi_cee_lintas_opd(): void
    {
        [$opdA, $opdB] = $this->siapkan();

        $akunBersama = User::factory()->create(['opd_id' => null]);
        $akunBersama->assignRole('cee-survey');

        foreach ([$opdA, $opdB] as $opd) {
            $this->actingAs($akunBersama)
                ->get("/cee/1a?opd_id={$opd->id}&tahun=2025")
                ->assertOk();
        }
    }

    /** Dan PIC tetap bisa membuka miliknya sendiri. */
    public function test_pic_tetap_dapat_membuka_cee_dan_monev_opd_sendiri(): void
    {
        [$opdA] = $this->siapkan();

        $pic = User::factory()->create(['opd_id' => $opdA->id]);
        $pic->assignRole('user');

        $this->actingAs($pic)->get("/cee/1a?opd_id={$opdA->id}&tahun=2025")->assertOk();
        $this->actingAs($pic)->get('/monitoring-evaluasi/8-9')->assertOk();
    }
}
