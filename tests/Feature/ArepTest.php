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
    /** Tim lima peran lengkap (format RPP 2026) untuk uji KM 6/7. */
    private function timLengkap(User $u): \App\Models\RppPenugasan
    {
        $p = $this->penugasanContoh($u)->penugasan->first();
        $p->teamMembers()->create(['role' => 'wpj', 'nama' => 'Ivan Vanova', 'hari_kantor' => 3, 'hari_lapangan' => 2, 'order' => 2]);
        $p->teamMembers()->create(['role' => 'dalnis', 'nama' => 'Zarkasyi', 'hari_kantor' => 3, 'hari_lapangan' => 2, 'order' => 3]);
        $p->teamMembers()->create(['role' => 'at', 'nama' => 'Wakidi', 'hari_kantor' => 6, 'hari_lapangan' => 4, 'order' => 4]);
        $p->teamMembers()->create(['role' => 'at', 'nama' => 'Nurhikmat', 'hari_kantor' => 6, 'hari_lapangan' => 4, 'order' => 5]);

        return $p->fresh();
    }

    public function test_km7_hari_dan_jam_dihitung_dari_rpp(): void
    {
        $p = $this->timLengkap($this->adminBaru());
        $aw = app(\App\Services\Arep\ArepData::class)->untukPenugasan($p)['anggaran_waktu'];

        // Total per peran = DK + LK di RPP; Jam = HP x 6,5.
        $this->assertSame(['hp' => 5, 'jam' => 32.5], $aw['total']['wpj']);
        $this->assertSame(['hp' => 5, 'jam' => 32.5], $aw['total']['dalnis']);
        $this->assertSame(['hp' => 10, 'jam' => 65], $aw['total']['kt']);
        // AT: HP per orang (10), Jam = seluruh anggota (2 x 10 x 6,5).
        $this->assertSame(['hp' => 10, 'jam' => 130], $aw['total']['at']);
        // Pelaksanaan (II) = hari lapangan.
        $this->assertSame(8, $aw['baris'][1]['kt']['hp']);
        // KM 6 no. 8: per orang.
        $this->assertSame([5, 5, 10, 10, 10], array_column($aw['orang'], 'hp'));
    }

    public function test_hari_kerja_surat_tugas_mengikuti_hari_ketua_tim_di_rpp(): void
    {
        $p = $this->penugasanContoh($this->adminBaru())->penugasan->first();
        $j = app(\App\Services\Arep\ArepData::class)->untukPenugasan($p)['jangka'];

        $this->assertSame(10, $j['hari_kerja']);
        $this->assertSame('sepuluh', $j['hari_kerja_terbilang']);
    }

    public function test_tanpa_dalnis_wpj_merangkap_pengendali_teknis(): void
    {
        $u = $this->adminBaru();
        $p = $this->penugasanContoh($u)->penugasan->first();
        $p->teamMembers()->create(['role' => 'wpj', 'nama' => 'Fahrizal', 'order' => 2]);
        $d = app(\App\Services\Arep\ArepData::class)->untukPenugasan($p->fresh());

        $this->assertTrue($d['dalnis_rangkap']);
        $this->assertSame('Fahrizal', $d['dalnis']['nama']);
        $this->assertContains('PPJ / Pengendali Teknis', array_column($d['tim'], 'peran'));
    }

    public function test_objek_gabungan_dan_alamat_surat_pengantar(): void
    {
        $u = $this->adminBaru();
        $p = $this->penugasanContoh($u)->penugasan->first();
        $p->update(['uraian' => 'Reviu pada Dinas Setdakab terhadap RKA tambahan TKDD TA 2026']);
        $p->obriks()->update(['nama' => 'Reviu pada Dinas PUPR terhadap DAK Fisik TA 2026']);
        $d = app(\App\Services\Arep\ArepData::class)->untukPenugasan($p->fresh());

        $this->assertSame('Reviu pada Dinas Setdakab terhadap RKA tambahan TKDD TA 2026. Dan Reviu pada Dinas PUPR terhadap DAK Fisik TA 2026', $d['objek']);
        $this->assertSame(['Sekretaris Daerah Kabupaten Aceh Barat', 'Kepala Dinas PUPR'], $d['kepada']);
    }

    public function test_seluruh_formulir_kma_memiliki_bentuk_dan_tampil(): void
    {
        $u = $this->adminBaru();
        $p = $this->timLengkap($u);
        $d = app(\App\Services\Arep\ArepData::class)->untukPenugasan($p);
        foreach (range(1, 30) as $n) {
            if (! in_array($n, [6, 7], true)) {
                $this->assertNotNull(\App\Support\Arep\KmFormulir::untuk($n, $d), "KMA {$n} tanpa bentuk");
            }
        }

        $this->actingAs($u)->get("/erpika/arep/kendali-mutu/{$p->id}/preview")->assertOk()->assertInertia(fn ($page) => $page
            ->has('spek', 28)
            ->where('spek.8.blok.0.baris.0', 'LAPORAN MINGGUAN'));
    }

    public function test_excel_dari_suntingan(): void
    {
        $u = $this->adminBaru();
        $p = $this->penugasanContoh($u)->penugasan->first();
        $html = '<section class="km-lembar portrait"><div>Formulir KMA 12</div><div>LEMBAR REVIU (DISUNTING)</div><table><tr><td class="border">No</td><td class="border">Isi</td></tr></table></section>';

        $r = $this->actingAs($u)->post("/erpika/arep/kendali-mutu/{$p->id}/excel-suntingan", ['html' => $html]);
        $r->assertOk()->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $ss = \PhpOffice\PhpSpreadsheet\IOFactory::load($r->baseResponse->getFile()->getPathname());
        $this->assertSame('KM 12', $ss->getSheet(0)->getTitle());
        $this->assertSame('LEMBAR REVIU (DISUNTING)', $ss->getSheet(0)->getCell('A2')->getValue());
    }

    public function test_keputusan_memuat_lampiran_pedoman(): void
    {
        $u = $this->adminBaru();
        $this->actingAs($u)->get('/erpika/arep/kendali-mutu/keputusan/preview')->assertInertia(fn ($page) => $page
            ->has('pedoman.bab', 10)
            ->has('pedoman.formulir', 30)
            ->where('pedoman.bab.0.nomor', 'BAB I'));
    }

    public function test_koreksi_peran_dari_daftar_dan_dapat_dibalik(): void
    {
        $p = $this->timLengkap($this->adminBaru());
        $m = $p->teamMembers()->where('nama', 'Wakidi')->first();
        $berkas = tempnam(sys_get_temp_dir(), 'kor');
        file_put_contents($berkas, json_encode([['member_id' => $m->id, 'st' => $p->nomor_st, 'nama' => 'Wakidi', 'lama' => 'at', 'baru' => 'kt', 'alasan' => 'Uji: sumber']]));

        $this->artisan('rpp:koreksi-peran', ['berkas' => $berkas, '--uji' => true])->assertSuccessful();
        $this->assertSame('at', $m->fresh()->role);
        $this->artisan('rpp:koreksi-peran', ['berkas' => $berkas])->assertSuccessful();
        $this->assertSame('kt', $m->fresh()->role);
        $this->artisan('rpp:koreksi-peran', ['--balik' => 'Uji:'])->assertSuccessful();
        $this->assertSame('at', $m->fresh()->role);
        @unlink($berkas);
    }
}
