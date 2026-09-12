<?php

namespace Tests\Feature;

use App\Models\Rpp;
use App\Models\RppCategory;
use App\Models\User;
use Database\Seeders\RppCategorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * ERPIKA > RPP Analisis dan Evaluasi: baris per ST dari data yang sama dengan
 * RPP Perencanaan, ringkasan terbit/belum/batal, laporan per obrik, dan
 * halaman AREP / Laporan Penugasan yang disiapkan kosong.
 */
class AnevaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RppCategorySeeder::class);
    }

    private function rppContoh(User $u): Rpp
    {
        $rpp = Rpp::create(['rpp_category_id' => RppCategory::where('code', 'A')->value('id'), 'user_id' => $u->id, 'year' => 2026, 'nomor_rpp' => '700/01/RPP-Rev/INS/2026', 'tanggal_rpp' => '2026-01-20']);
        $p1 = $rpp->penugasan()->create(['urutan' => 1, 'uraian' => 'Reviu DAK', 'sifat' => 'Reviu', 'nomor_st' => 'ST-01/Rev-INS/2026', 'status' => 'lhp_terbit', 'masa_tugas_mulai' => '2026-01-20', 'masa_tugas_selesai' => '2026-01-29']);
        $ob = $p1->obriks()->create(['nama' => 'DPMG', 'order' => 0]);
        $p1->laporans()->create(['rpp_obrik_id' => $ob->id, 'nomor_laporan' => '700.1.2.8/06/LHR-INS/2026', 'jenis' => 'LHR', 'tanggal_laporan' => '2026-02-10', 'order' => 0]);
        $p1->teamMembers()->create(['role' => 'kt', 'nama' => 'Erfendi, S.E', 'hari_kantor' => 2, 'hari_lapangan' => 2, 'order' => 0]);
        $rpp->penugasan()->create(['urutan' => 2, 'uraian' => 'Reviu LKPD', 'status' => 'st_terbit', 'nomor_st' => 'ST-02/Rev-INS/2026']);
        $rpp->penugasan()->create(['urutan' => 3, 'uraian' => 'Dibatalkan', 'status' => 'batal', 'keterangan' => 'Batal']);

        return $rpp;
    }

    public function test_halaman_aneva_menampilkan_baris_per_st_dan_ringkasan(): void
    {
        $u = User::factory()->create();
        $this->rppContoh($u);

        $this->actingAs($u)->get('/erpika/aneva?tahun=2026')->assertOk()->assertInertia(fn ($page) => $page
            ->has('baris', 3)
            ->where('baris.0.nomor_st', 'ST-01/Rev-INS/2026')
            ->where('baris.0.obriks.0.laporan.nomor', '700.1.2.8/06/LHR-INS/2026')
            ->where('baris.0.tmt', 'TMT 20 - 29 Januari 2026')
            ->where('ringkasan.penugasan', 3)
            ->where('ringkasan.terbit', 1)
            ->where('ringkasan.belum', 1)
            ->where('ringkasan.batal', 1)
            ->where('nomorTerakhir.0.jenis', 'LHR')
            ->where('nomorTerakhir.0.nomor', '700.1.2.8/06/LHR-INS/2026'));

        $this->actingAs($u)->get('/erpika/aneva?tahun=2026&status=terbit')->assertInertia(fn ($page) => $page->has('baris', 1));
        $this->actingAs($u)->get('/erpika/aneva?tahun=2026&cari=LKPD')->assertInertia(fn ($page) => $page->has('baris', 1)->where('baris.0.uraian', 'Reviu LKPD'));
    }

    public function test_pratinjau_rekap_dikelompokkan_per_jenis(): void
    {
        $u = User::factory()->create();
        $this->rppContoh($u);

        $this->actingAs($u)->get('/erpika/aneva/cetak/preview?tahun=2026')->assertOk()->assertInertia(fn ($page) => $page
            ->where('tahun', 2026)
            ->has('seksi', 1)
            ->where('seksi.0.kode', 'A')
            ->has('seksi.0.baris', 3));
    }

    public function test_menu_arep_dan_laporan_penugasan_terbuka_kosong(): void
    {
        $u = User::factory()->create();
        $this->actingAs($u)->get('/erpika/arep')->assertOk();
        $this->actingAs($u)->get('/erpika/laporan-penugasan')->assertOk();
    }

    public function test_data_terhapus_erpika_memulihkan_dokumen_rpp_berikut_penugasannya(): void
    {
        $u = User::factory()->create();
        $rpp = $this->rppContoh($u);
        $this->actingAs($u)->delete("/rpp/{$rpp->id}")->assertRedirect();
        $this->assertSoftDeleted('rpps', ['id' => $rpp->id]);

        $this->actingAs($u)->get('/erpika/data-terhapus')->assertOk()->assertInertia(fn ($page) => $page
            ->where('basePath', '/erpika/data-terhapus')
            ->has('rows', 1)
            ->where('rows.0.title', '700/01/RPP-Rev/INS/2026 — BULAN JANUARI 2026'));

        $this->actingAs($u)->put("/erpika/data-terhapus/rpp/{$rpp->id}/restore")->assertRedirect();
        $this->assertDatabaseHas('rpps', ['id' => $rpp->id, 'deleted_at' => null]);
        $this->assertCount(3, $rpp->fresh()->penugasan);
    }
}
