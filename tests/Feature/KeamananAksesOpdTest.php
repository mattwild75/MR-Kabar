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
}
