<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\Rpp;
use App\Models\RppCategory;
use App\Models\User;
use App\Services\Erpika\PemeriksaanErpikaService;
use Database\Seeders\RppCategorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tampilan turunan ERPIKA (Pemeriksaan, Kalender, Beban Kerja) hanya
 * membaca data RPP: pengujian memastikan temuan dihitung benar dan tidak
 * ada satu pun baris yang berubah setelah halaman dibuka.
 */
class ErpikaAnalisisTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RppCategorySeeder::class);
    }

    private function contoh(User $u): array
    {
        $erfendi = Employee::create(['nama' => 'Erfendi, S.E', 'nip' => '198001012005011001', 'jabatan' => 'Auditor']);
        $tanpaNip = Employee::create(['nama' => 'Budi', 'nip' => null, 'jabatan' => 'Auditor']);
        $rpp = Rpp::create(['rpp_category_id' => RppCategory::where('code', 'A')->value('id'), 'user_id' => $u->id, 'year' => 2026, 'nomor_rpp' => '700/01/RPP-Rev/INS/2026', 'tanggal_rpp' => '2026-01-20']);
        $p1 = $rpp->penugasan()->create(['urutan' => 1, 'uraian' => 'Reviu DAK', 'sifat' => 'Reviu', 'nomor_st' => 'ST-01/Rev-INS/2026', 'tanggal_st' => '2026-01-19', 'status' => 'st_terbit', 'masa_tugas_mulai' => '2026-01-20', 'masa_tugas_selesai' => '2026-01-29']);
        $ob = $p1->obriks()->create(['nama' => 'DPMG', 'order' => 0]);
        // laporan sudah ada tetapi status masih st_terbit -> tidak selaras
        $p1->laporans()->create(['rpp_obrik_id' => $ob->id, 'nomor_laporan' => '700/06/LHR-INS/2026', 'jenis' => 'LHR', 'tanggal_laporan' => '2026-02-10', 'order' => 0]);
        $p1->teamMembers()->create(['employee_id' => $erfendi->id, 'role' => 'kt', 'nama' => $erfendi->nama, 'hari_kantor' => 2, 'hari_lapangan' => 8, 'order' => 0]);
        $p1->teamMembers()->create(['employee_id' => $tanpaNip->id, 'role' => 'at', 'nama' => $tanpaNip->nama, 'hari_kantor' => 0, 'hari_lapangan' => 8, 'order' => 1]);
        // penugasan kedua: ST sama (ganda), beririsan dengan p1 untuk Erfendi, tanpa uraian, ST tanpa tanggal
        $p2 = $rpp->penugasan()->create(['urutan' => 2, 'uraian' => '-', 'nomor_st' => 'ST-01/Rev-INS/2026', 'status' => 'st_terbit', 'masa_tugas_mulai' => '2026-01-25', 'masa_tugas_selesai' => '2026-02-05']);
        $p2->teamMembers()->create(['employee_id' => $erfendi->id, 'role' => 'at', 'nama' => $erfendi->nama, 'hari_kantor' => 1, 'hari_lapangan' => 5, 'order' => 0]);
        $rpp->penugasan()->create(['urutan' => 3, 'uraian' => 'Dibatalkan', 'status' => 'batal', 'masa_tugas_mulai' => '2026-01-01', 'masa_tugas_selesai' => '2026-01-31']);

        return [$rpp, $erfendi];
    }

    public function test_pemeriksaan_menandai_temuan_tanpa_mengubah_data(): void
    {
        $u = User::factory()->create();
        [$rpp] = $this->contoh($u);
        $sebelum = $rpp->penugasan()->orderBy('id')->get()->map(fn ($p) => $p->only(['uraian', 'nomor_st', 'status']))->all();

        $hasil = app(PemeriksaanErpikaService::class)->periksa(2026);

        $this->assertCount(1, $hasil['temuan']['st_ganda']);
        $this->assertCount(2, $hasil['temuan']['st_ganda'][0]['penugasan']);
        $this->assertCount(1, $hasil['temuan']['tanpa_uraian']);
        $this->assertCount(1, $hasil['temuan']['st_tanpa_tanggal']);
        $this->assertCount(1, $hasil['temuan']['status_tidak_selaras']);
        $this->assertCount(1, $hasil['temuan']['tumpang_tindih']);
        $this->assertSame('Erfendi, S.E', $hasil['temuan']['tumpang_tindih'][0]['nama']);
        $this->assertCount(1, $hasil['temuan']['pegawai_tanpa_nip']);
        $this->assertSame([], $hasil['temuan']['belum_sinkron_aneva']);
        $this->assertSame($sebelum, $rpp->penugasan()->orderBy('id')->get()->map(fn ($p) => $p->only(['uraian', 'nomor_st', 'status']))->all());

        $this->actingAs($u)->get('/erpika/pemeriksaan?tahun=2026')->assertOk()
            ->assertInertia(fn ($page) => $page->where('hasil.jumlah', 6)->where('filters.tahun', 2026));
    }

    public function test_kalender_menampilkan_penugasan_bulan_dan_tumpang_tindih_per_orang(): void
    {
        $u = User::factory()->create();
        $this->contoh($u);

        $this->actingAs($u)->get('/erpika/kalender?bulan=1&tahun=2026')->assertOk()->assertInertia(fn ($page) => $page
            ->has('penugasan', 2) // yang batal tidak ikut
            ->where('jumlahHari', 31)
            ->where('perOrang.0.nama', 'Erfendi, S.E')
            ->where('perOrang.0.tumpang_tindih', 1)
            ->where('perOrang.1.tumpang_tindih', 0));

        $this->actingAs($u)->get('/erpika/kalender?bulan=3&tahun=2026')->assertOk()->assertInertia(fn ($page) => $page->has('penugasan', 0));
    }

    public function test_beban_kerja_menjumlahkan_hari_dan_biaya_sppd_per_pegawai(): void
    {
        $u = User::factory()->create();
        $this->contoh($u);

        $this->actingAs($u)->get('/erpika/beban-kerja?tahun=2026')->assertOk()->assertInertia(fn ($page) => $page
            ->has('baris', 2)
            ->where('baris.0.nama', 'Erfendi, S.E')
            ->where('baris.0.penugasan', 2)
            ->where('baris.0.dk', 3)
            ->where('baris.0.lk', 13)
            ->where('total.lk', 21)
            ->where('total.penugasan', 2));
    }
}
