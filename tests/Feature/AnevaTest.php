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
 * ERPIKA > RPP Analisis dan Evaluasi: baris per ST dari data yang sama dengan
 * RPP Perencanaan, ringkasan terbit/belum/batal, laporan per obrik, dan
 * halaman AREP / Laporan Penugasan yang disiapkan kosong.
 */
class AnevaTest extends TestCase
{
    use RefreshDatabase;

    /** ERPIKA sementara hanya admin/super-admin (ErpikaHanyaAdmin), jadi pengguna uji diberi peran admin. */
    private function adminBaru(array $atribut = []): User
    {
        Role::findOrCreate('admin', 'web');
        $u = User::factory()->create($atribut);
        $u->assignRole('admin');

        return $u;
    }

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
        $u = $this->adminBaru();
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
        $u = $this->adminBaru();
        $this->rppContoh($u);

        $this->actingAs($u)->get('/erpika/aneva/cetak/preview?tahun=2026')->assertOk()->assertInertia(fn ($page) => $page
            ->where('tahun', 2026)
            ->has('seksi', 1)
            ->where('seksi.0.kode', 'A')
            ->has('seksi.0.baris', 3));
    }

    public function test_menu_arep_mengarah_ke_surat_tugas_dan_database_lhp_tersedia(): void
    {
        $u = $this->adminBaru();
        // AREP kini kelompok menu (Surat Tugas + Kendali Mutu); /erpika/arep diarahkan ke Surat Tugas.
        $this->actingAs($u)->get('/erpika/arep')->assertRedirect(route('erpika.arep.surat-tugas.index'));
        $this->actingAs($u)->get('/erpika/arep/surat-tugas')->assertOk();
        $this->actingAs($u)->get('/erpika/arep/kendali-mutu')->assertOk();
        // Laporan Penugasan kini kelompok menu; anaknya Database LHP.
        $this->actingAs($u)->get('/erpika/laporan-penugasan/database-lhp')->assertOk();
    }

    public function test_data_terhapus_erpika_memulihkan_dokumen_rpp_berikut_penugasannya(): void
    {
        $u = $this->adminBaru();
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

    public function test_unduh_excel_rekap_dan_tabel_rpp_menghasilkan_berkas_xlsx(): void
    {
        $u = $this->adminBaru();
        $rpp = $this->rppContoh($u);

        $this->actingAs($u)->get('/erpika/aneva/cetak/excel?tahun=2026')->assertOk()
            ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $this->actingAs($u)->get("/rpp-cetak/{$rpp->id}/tabel/excel")->assertOk()
            ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    public function test_isian_aneva_menyimpan_laporan_per_obrik_dan_status(): void
    {
        $u = $this->adminBaru();
        $rpp = $this->rppContoh($u);
        $p2 = $rpp->penugasan()->where('urutan', 2)->first();
        $ob = $p2->obriks()->create(['nama' => 'BKD', 'order' => 0]);

        $this->actingAs($u)->from('/erpika/aneva')->put("/erpika/aneva/{$p2->id}", [
            'obriks' => [['id' => $ob->id, 'nomor' => '700/09/LHR-INS/2026', 'tanggal' => '2026-03-01', 'jenis' => 'LHR']],
            'lain' => [['nomor' => '700/10/LHM-INS/2026', 'tanggal' => null, 'jenis' => 'LHM']],
            'status' => 'lhp_terbit',
            'capaian_output' => '100%',
            'keterangan' => null,
        ])->assertRedirect('/erpika/aneva')->assertSessionHas('success');

        $p2->refresh();
        $this->assertSame('lhp_terbit', $p2->status);
        $this->assertSame('100%', $p2->capaian_output);
        $this->assertNotNull($p2->sinkron_aneva_pada);
        $this->assertSame(['700/09/LHR-INS/2026', '700/10/LHM-INS/2026'], $p2->laporans()->orderBy('order')->pluck('nomor_laporan')->all());
        $this->assertSame($ob->id, $p2->laporans()->orderBy('order')->first()->rpp_obrik_id);
    }

    public function test_menyunting_rpp_di_perencanaan_tidak_menghapus_laporan_aneva(): void
    {
        $u = $this->adminBaru();
        $rpp = $this->rppContoh($u);
        $p1 = $rpp->penugasan()->where('urutan', 1)->first();
        $this->assertCount(1, $p1->laporans);

        $halaman = $this->actingAs($u)->get("/rpp/{$rpp->id}/edit")->assertOk();
        $props = $halaman->viewData('page')['props'];
        $isi = $props['rpp'];
        $kirim = [
            'rpp_category_id' => (string) $isi['rpp_category_id'], 'year' => $isi['year'], 'nomor_rpp' => $isi['nomor_rpp'], 'bulan' => $isi['bulan'] ?? null,
            'tanggal_rpp' => '2026-01-21', 'judul' => $isi['judul'] ?? null, 'sub_judul' => $isi['sub_judul'] ?? null, 'tarif_per_hari' => $isi['tarif_per_hari'] ?? null,
            'tanggal_surat' => null, 'surat_dasar_uraian' => null, 'hal' => null, 'tujuan_surat' => null, 'dengan_penutup' => true,
            'penugasan' => array_map(fn ($p) => [
                'uraian' => $p['uraian'].' (rev)', 'sifat' => $p['sifat'], 'lokasi' => $p['lokasi'] ?? null, 'jumlah_laporan' => $p['jumlah_laporan'] ?? null,
                'masa_tugas_mulai' => $p['masa_tugas_mulai'], 'masa_tugas_selesai' => $p['masa_tugas_selesai'], 'tmt_teks' => $p['tmt_teks'] ?? null,
                'nomor_sp' => null, 'nomor_st' => $p['nomor_st'], 'tanggal_st' => $p['tanggal_st'] ?? null, 'nomor_kp' => null,
                'capaian_output' => $p['capaian_output'] ?? null, 'status' => $p['status'],
                'obriks' => array_map(fn ($o) => is_array($o) ? $o['nama'] : $o, $p['obriks'] ?? []),
                // penugasan contoh ke-2/3 tidak punya tim di fixture; formulir mewajibkannya
                'tim' => $p['tim'] !== [] ? array_map(fn ($m) => ['employee_id' => $m['employee_id'] ?? null, 'role' => $m['role'], 'nama' => $m['nama'], 'nip' => $m['nip'] ?? null, 'hari_kantor' => $m['hari_kantor'] ?? 0, 'hari_lapangan' => $m['hari_lapangan'] ?? 0], $p['tim'])
                    : [['employee_id' => null, 'role' => 'kt', 'nama' => 'Erfendi, S.E', 'nip' => null, 'hari_kantor' => 1, 'hari_lapangan' => 1]],
            ], $isi['penugasan']),
        ];
        $this->actingAs($u)->put("/rpp/{$rpp->id}", $kirim)->assertSessionHasNoErrors()->assertRedirect();

        $p1Baru = $rpp->penugasan()->where('urutan', 1)->first();
        $this->assertSame('Reviu DAK (rev)', $p1Baru->uraian);
        $this->assertSame(['700.1.2.8/06/LHR-INS/2026'], $p1Baru->laporans()->pluck('nomor_laporan')->all());
        $this->assertSame($p1Baru->obriks()->first()->id, $p1Baru->laporans()->first()->rpp_obrik_id);
    }
}
