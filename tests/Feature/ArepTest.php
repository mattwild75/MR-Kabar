<?php

namespace Tests\Feature;

use App\Models\Rpp;
use App\Models\RppCategory;
use App\Models\User;
use Database\Seeders\RppCategorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * ERPIKA > AREP: Surat Tugas (ST/SP/Pernyataan) dan Kendali Mutu (30 formulir
 * KMA + Keputusan Inspektur), datanya dari RPP Perencanaan.
 */
class ArepTest extends TestCase
{
    use RefreshDatabase;

    private function adminBaru(): User
    {
        Role::findOrCreate('admin', 'web');
        $u = User::factory()->create();
        $u->assignRole('admin');

        return $u;
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RppCategorySeeder::class);
    }

    private function penugasanContoh(User $u): Rpp
    {
        $rpp = Rpp::create([
            'rpp_category_id' => RppCategory::where('code', 'A')->value('id'),
            'user_id' => $u->id, 'year' => 2026,
            'nomor_rpp' => '700/27/RPP-Rev/INS/2026', 'tanggal_rpp' => '2026-05-12',
        ]);
        $p = $rpp->penugasan()->create([
            'urutan' => 1, 'uraian' => 'Reviu DAK Fisik Sanitasi', 'sifat' => 'Reviu',
            'nomor_st' => 'ST-27/Rev-INS/2026', 'tanggal_st' => '2026-05-12',
            'masa_tugas_mulai' => '2026-05-12', 'masa_tugas_selesai' => '2026-05-29', 'status' => 'st_terbit',
        ]);
        $p->obriks()->create(['nama' => 'Dinas PUPR Kabupaten Aceh Barat', 'order' => 0]);
        $p->teamMembers()->create(['role' => 'pj', 'nama' => 'Zakaria, S.E.', 'nip' => '197205042001121002', 'pangkat' => 'Inspektur', 'order' => 0]);
        $p->teamMembers()->create(['role' => 'kt', 'nama' => 'Fitriyadi Firman', 'nip' => '199112182019031007', 'pangkat' => 'Auditor Ahli Muda', 'hari_kantor' => 2, 'hari_lapangan' => 8, 'order' => 1]);

        return $rpp;
    }

    public function test_daftar_surat_tugas_menampilkan_penugasan_ber_st(): void
    {
        $u = $this->adminBaru();
        $this->penugasanContoh($u);

        $this->actingAs($u)->get('/erpika/arep/surat-tugas')->assertOk()->assertInertia(fn ($page) => $page
            ->component('erpika/arep/surat-tugas/Index')
            ->has('penugasan', 1)
            ->where('penugasan.0.nomor_st', 'ST-27/Rev-INS/2026'));
    }

    public function test_pratinjau_surat_tugas_membawa_data_dari_rpp(): void
    {
        $u = $this->adminBaru();
        $rpp = $this->penugasanContoh($u);
        $p = $rpp->penugasan->first();

        $this->actingAs($u)->get("/erpika/arep/surat-tugas/{$p->id}/preview")->assertOk()->assertInertia(fn ($page) => $page
            ->component('erpika/arep/surat-tugas/Cetak')
            ->where('data.nomor.st', 'ST-27/Rev-INS/2026')
            ->where('data.nomor.sp', '700/27/SP-Rev/INS/2026')
            ->where('data.objek', 'Dinas PUPR Kabupaten Aceh Barat')
            ->where('data.pj.nama', 'Zakaria, S.E.')
            ->where('data.jenis.kata_kerja', 'Reviu'));
    }

    public function test_word_paket_surat_tugas_terunduh(): void
    {
        $u = $this->adminBaru();
        $rpp = $this->penugasanContoh($u);
        $p = $rpp->penugasan->first();

        $this->actingAs($u)->get("/erpika/arep/surat-tugas/{$p->id}/word?dok=semua")
            ->assertOk()
            ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    }

    public function test_daftar_kendali_mutu_membawa_katalog_30_formulir(): void
    {
        $u = $this->adminBaru();
        $this->penugasanContoh($u);

        $this->actingAs($u)->get('/erpika/arep/kendali-mutu')->assertOk()->assertInertia(fn ($page) => $page
            ->component('erpika/arep/kendali-mutu/Index')
            ->has('katalog', 30)
            ->where('katalog.5.kode', 'KM 6'));
    }

    public function test_pratinjau_kendali_mutu_satu_formulir(): void
    {
        $u = $this->adminBaru();
        $rpp = $this->penugasanContoh($u);
        $p = $rpp->penugasan->first();

        $this->actingAs($u)->get("/erpika/arep/kendali-mutu/{$p->id}/preview?form=6")->assertOk()->assertInertia(fn ($page) => $page
            ->component('erpika/arep/kendali-mutu/Cetak')
            ->where('forms', [6])
            ->where('data.nomor.kp', 'KP-27/Rev-INS/2026'));
    }

    public function test_excel_kendali_mutu_terunduh(): void
    {
        $u = $this->adminBaru();
        $rpp = $this->penugasanContoh($u);
        $p = $rpp->penugasan->first();

        $this->actingAs($u)->get("/erpika/arep/kendali-mutu/{$p->id}/excel?form=6,7,9")
            ->assertOk()
            ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    public function test_keputusan_inspektur_pratinjau_dan_word(): void
    {
        $u = $this->adminBaru();

        $this->actingAs($u)->get('/erpika/arep/kendali-mutu/keputusan/preview')->assertOk()->assertInertia(fn ($page) => $page
            ->component('erpika/arep/kendali-mutu/Keputusan'));
        $this->actingAs($u)->get('/erpika/arep/kendali-mutu/keputusan/word')
            ->assertOk()
            ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    }
}
