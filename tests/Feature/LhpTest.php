<?php

namespace Tests\Feature;

use App\Models\Lhp;
use App\Models\User;
use Database\Seeders\LhpRefKodeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * ERPIKA > Laporan Penugasan > Database LHP: daftar, detail berjenjang,
 * simpan/sunting rantai Temuan → Penyebab → Rekomendasi → Tindak Lanjut,
 * dan soft delete. ERPIKA sementara hanya admin/super-admin.
 */
class LhpTest extends TestCase
{
    use RefreshDatabase;

    private function adminBaru(): User
    {
        Role::findOrCreate('admin', 'web');
        $u = User::factory()->create();
        $u->assignRole('admin');

        return $u;
    }

    private function lhpContoh(): Lhp
    {
        $lhp = Lhp::create(['nomor_lhp' => '700/01/LHP/2026', 'tanggal_lhp' => '2026-03-01', 'nama_obrik' => 'Dinas Contoh', 'status_lhp' => '02', 'nama_pj' => 'Budi']);
        $t = $lhp->temuan()->create(['no' => 1, 'kode' => '0810', 'nilai' => 1000, 'memo' => 'Kas kurang']);
        $s = $t->sebab()->create(['no' => 1, 'memo' => 'Lalai']);
        $r = $s->rekomendasi()->create(['no' => 1, 'nilai' => 1000, 'memo' => 'Setor kembali']);
        $r->tindakLanjut()->create(['no' => 1, 'nilai' => 1000, 'tanggal' => '2026-04-01', 'memo' => 'Sudah disetor']);

        return $lhp;
    }

    private const BASE = '/erpika/laporan-penugasan/database-lhp';

    public function test_daftar_menampilkan_lhp_dan_ringkasan(): void
    {
        $u = $this->adminBaru();
        $this->lhpContoh();

        $this->actingAs($u)->get(self::BASE)->assertOk()->assertInertia(fn ($page) => $page
            ->component('erpika/lhp/Index')
            ->has('lhp.data', 1)
            ->where('lhp.data.0.nomor_lhp', '700/01/LHP/2026')
            ->where('lhp.data.0.jml_temuan', 1)
            ->where('ringkasan.total', 1)
            ->where('ringkasan.sebagian', 1));
    }

    public function test_pencarian_dan_saring_status(): void
    {
        $u = $this->adminBaru();
        $this->lhpContoh();
        Lhp::create(['nomor_lhp' => '700/02/LHP/2026', 'nama_obrik' => 'Badan Lain', 'status_lhp' => '03']);

        $this->actingAs($u)->get(self::BASE.'?cari=Badan')->assertInertia(fn ($page) => $page->has('lhp.data', 1)->where('lhp.data.0.nomor_lhp', '700/02/LHP/2026'));
        $this->actingAs($u)->get(self::BASE.'?status=03')->assertInertia(fn ($page) => $page->has('lhp.data', 1)->where('lhp.data.0.status_lhp', '03'));

        // Pencarian menembus uraian temuan/penyebab/rekomendasi/tindak lanjut (lhpContoh).
        foreach (['Kas kurang', 'Lalai', 'Setor kembali', 'disetor'] as $kata) {
            $this->actingAs($u)->get(self::BASE.'?cari='.urlencode($kata))
                ->assertInertia(fn ($page) => $page->has('lhp.data', 1)->where('lhp.data.0.nomor_lhp', '700/01/LHP/2026'));
        }
    }

    public function test_detail_menampilkan_rantai_lengkap(): void
    {
        $u = $this->adminBaru();
        $lhp = $this->lhpContoh();

        $this->actingAs($u)->get(self::BASE."/{$lhp->id}")->assertOk()->assertInertia(fn ($page) => $page
            ->component('erpika/lhp/Show')
            ->where('lhp.nomor_lhp', '700/01/LHP/2026')
            ->has('lhp.temuan', 1)
            ->where('lhp.temuan.0.memo', 'Kas kurang')
            ->where('lhp.temuan.0.sebab.0.memo', 'Lalai')
            ->where('lhp.temuan.0.sebab.0.rekomendasi.0.memo', 'Setor kembali')
            ->where('lhp.temuan.0.sebab.0.rekomendasi.0.tindak_lanjut.0.memo', 'Sudah disetor'));
    }

    public function test_simpan_lhp_baru_beserta_rantai(): void
    {
        $u = $this->adminBaru();

        $this->actingAs($u)->post(self::BASE, [
            'nomor_lhp' => '700/09/LHP/2026',
            'nama_obrik' => 'Sekretariat',
            'status_lhp' => '01',
            'temuan' => [[
                'kode' => '01', 'nilai' => 500, 'memo' => 'Temuan A',
                'sebab' => [['memo' => 'Sebab A', 'rekomendasi' => [['nilai' => 500, 'memo' => 'Rekom A', 'tindak_lanjut' => [['nilai' => 500, 'tanggal' => '2026-05-01', 'memo' => 'TL A']]]]]],
            ]],
        ])->assertRedirect();

        $lhp = Lhp::where('nomor_lhp', '700/09/LHP/2026')->first();
        $this->assertNotNull($lhp);
        $this->assertSame(1, $lhp->jml_tp);
        $this->assertEquals(500, (float) $lhp->nilai_tp);
        $this->assertSame('Temuan A', $lhp->temuan->first()->memo);
        $this->assertSame('TL A', $lhp->temuan->first()->sebab->first()->rekomendasi->first()->tindakLanjut->first()->memo);
    }

    public function test_sunting_mengganti_rantai(): void
    {
        $u = $this->adminBaru();
        $lhp = $this->lhpContoh();

        $this->actingAs($u)->put(self::BASE."/{$lhp->id}", [
            'nomor_lhp' => $lhp->nomor_lhp,
            'nama_obrik' => 'Dinas Contoh (revisi)',
            'status_lhp' => '03',
            'temuan' => [['memo' => 'Temuan baru saja', 'sebab' => []]],
        ])->assertRedirect();

        $lhp->refresh();
        $this->assertSame('Dinas Contoh (revisi)', $lhp->nama_obrik);
        $this->assertSame('03', $lhp->status_lhp);
        $this->assertSame(1, $lhp->temuan()->count());
        $this->assertSame('Temuan baru saja', $lhp->temuan->first()->memo);
        // Rantai lama benar-benar terbuang (cascade).
        $this->assertSame(0, \DB::table('lhp_sebab')->count());
    }

    public function test_nomor_lhp_wajib_unik(): void
    {
        $u = $this->adminBaru();
        $this->lhpContoh();

        $this->actingAs($u)->post(self::BASE, ['nomor_lhp' => '700/01/LHP/2026', 'nama_obrik' => 'X', 'status_lhp' => '01'])
            ->assertSessionHasErrors('nomor_lhp');
    }

    public function test_simpan_dan_tampil_tim_pemeriksa(): void
    {
        $u = $this->adminBaru();

        $this->actingAs($u)->post(self::BASE, [
            'nomor_lhp' => '700/77/LHP/2026',
            'nama_obrik' => 'Dinas Tim',
            'status_lhp' => '01',
            'tim' => [
                ['nama' => 'Budi', 'nip' => '1990', 'jabatan' => 'Ketua Tim'],
                ['nama' => 'Ani', 'nip' => null, 'jabatan' => 'Anggota Tim'],
                ['nama' => '', 'nip' => null, 'jabatan' => 'Anggota Tim'], // tanpa nama -> dilewati
            ],
        ])->assertRedirect();

        $lhp = Lhp::where('nomor_lhp', '700/77/LHP/2026')->first();
        $this->assertSame(2, $lhp->tim()->count());
        $this->assertSame('Budi', $lhp->tim->first()->nama);
        $this->assertSame('Ketua Tim', $lhp->tim->first()->jabatan);

        $this->actingAs($u)->get(self::BASE."/{$lhp->id}")->assertInertia(fn ($page) => $page
            ->has('lhp.tim', 2)
            ->where('lhp.tim.0.nama', 'Budi')
            ->where('lhp.tim.0.jabatan', 'Ketua Tim'));
    }

    public function test_impor_membersihkan_escape_teks(): void
    {
        $u = $this->adminBaru();
        $berkas = tempnam(sys_get_temp_dir(), 'lhp').'.json';
        file_put_contents($berkas, json_encode([[
            'nomor_lhp' => '700/88/LHP/2026',
            'nama_obrik' => 'BARIS SATU\x0D\x0ABARIS DUA',
            'status_lhp' => '01',
            'tim' => [['no' => 1, 'nama' => 'Cut\x0D\x0ANyak', 'jabatan' => 'Ketua Tim']],
            'temuan' => [['no' => 1, 'memo' => 'Temuan\x0D\x0Aberbaris']],
        ]]));

        $this->artisan('lhp:impor', ['berkas' => $berkas, '--ganti' => true])->assertSuccessful();

        $lhp = Lhp::where('nomor_lhp', '700/88/LHP/2026')->first();
        $this->assertStringNotContainsString('\x0D', $lhp->nama_obrik);
        $this->assertSame("BARIS SATU\nBARIS DUA", $lhp->nama_obrik);
        $this->assertSame("Temuan\nberbaris", $lhp->temuan->first()->memo);
        $this->assertSame("Cut\nNyak", $lhp->tim->first()->nama);
        @unlink($berkas);
    }

    public function test_simpan_bidang_terstruktur_dan_label_kode(): void
    {
        $u = $this->adminBaru();
        $this->seed(LhpRefKodeSeeder::class);
        Cache::flush(); // buang cache kode yang mungkin kosong dari uji lain

        $this->actingAs($u)->post(self::BASE, [
            'nomor_lhp' => '700/55/LHP/2026',
            'nama_obrik' => 'Dinas Struktur',
            'status_lhp' => '02',
            'tahun_pkpt' => '2026',
            'inspektorat' => 'Inspektorat Aceh Barat',
            'bidang_unit' => 'Inspektur Pembantu Wilayah II',
            'kode_group_jenis_periksa' => '01',
            'kode_jenis_periksa' => '0101',
            'nilai_anggaran' => 1000000,
            'anggaran_diaudit' => 900000,
            'temuan' => [[
                'kode_group' => '08', 'kode' => '0810', 'nilai' => 500, 'memo' => 'Temuan X',
                'ba_kesepakatan' => 'ada', 'kerugian_pada' => 'daerah',
                'sebab' => [[
                    'kode_group' => '04', 'kode' => '0401', 'memo' => 'Sebab X',
                    'rekomendasi' => [[
                        'kode_group' => '10', 'kode' => '1002', 'nilai' => 500, 'memo' => 'Rekom X',
                        'tindak_lanjut' => [['kode_group' => '01', 'kode' => '0101', 'tanggal' => '2026-06-01', 'memo' => 'TL X']],
                    ]],
                ]],
            ]],
        ])->assertRedirect();

        $lhp = Lhp::with('temuan.sebab.rekomendasi.tindakLanjut')->where('nomor_lhp', '700/55/LHP/2026')->first();
        $this->assertSame('2026', $lhp->tahun_pkpt);
        $this->assertSame('Inspektur Pembantu Wilayah II', $lhp->bidang_unit);
        $this->assertSame('01', $lhp->kode_group_jenis_periksa);
        $t = $lhp->temuan->first();
        $this->assertSame('08', $t->kode_group);
        $this->assertSame('ada', $t->ba_kesepakatan);
        $this->assertSame('daerah', $t->kerugian_pada);
        $this->assertSame('04', $t->sebab->first()->kode_group);
        $this->assertSame('1002', $t->sebab->first()->rekomendasi->first()->kode);
        $this->assertSame('0101', $t->sebab->first()->rekomendasi->first()->tindakLanjut->first()->kode);

        // Halaman baca memetakan kode group ke label baku.
        $this->actingAs($u)->get(self::BASE."/{$lhp->id}")->assertInertia(fn ($page) => $page
            ->where('lhp.jenis_label', 'AUDIT OPERASIONAL')
            ->where('lhp.temuan.0.group_label', 'KELEMAHAN ADMINSTRASI (KELEMAHAN TATA USAHA/AKUNTANSI)')
            ->where('lhp.temuan.0.kode_label', 'Kelemahan administrasi keuangan')
            ->where('lhp.temuan.0.sebab.0.group_label', 'KELEMAHAN DALAM PROSEDUR')
            ->where('lhp.temuan.0.sebab.0.rekomendasi.0.kode_label', 'Hukuman teguran tertulis'));
    }

    public function test_hapus_lhp_soft_delete(): void
    {
        $u = $this->adminBaru();
        $lhp = $this->lhpContoh();

        $this->actingAs($u)->delete(self::BASE."/{$lhp->id}")->assertRedirect(self::BASE);
        $this->assertSoftDeleted('lhp', ['id' => $lhp->id]);
    }

    public function test_lhp_terhapus_muncul_di_data_terhapus_erpika_dan_bisa_dipulihkan(): void
    {
        $u = $this->adminBaru();
        $lhp = $this->lhpContoh();
        $this->actingAs($u)->delete(self::BASE."/{$lhp->id}")->assertRedirect();
        $this->assertSoftDeleted('lhp', ['id' => $lhp->id]);

        // Muncul di tab Database LHP pada ERPIKA > Data Terhapus.
        $this->actingAs($u)->get('/erpika/data-terhapus?type=lhp')->assertOk()->assertInertia(fn ($page) => $page
            ->where('activeType', 'lhp')
            ->has('rows', 1)
            ->where('rows.0.title', $lhp->nomor_lhp));

        // Dipulihkan.
        $this->actingAs($u)->put("/erpika/data-terhapus/lhp/{$lhp->id}/restore")->assertRedirect();
        $this->assertDatabaseHas('lhp', ['id' => $lhp->id, 'deleted_at' => null]);

        // Hapus permanen membuang beserta rantainya (cascade).
        $this->actingAs($u)->delete(self::BASE."/{$lhp->id}")->assertRedirect();
        $this->actingAs($u)->delete("/erpika/data-terhapus/lhp/{$lhp->id}")->assertRedirect();
        $this->assertDatabaseMissing('lhp', ['id' => $lhp->id]);
        $this->assertSame(0, \DB::table('lhp_temuan')->where('lhp_id', $lhp->id)->count());
    }

    public function test_bukan_admin_ditolak(): void
    {
        $u = User::factory()->create(); // tanpa peran admin
        $this->actingAs($u)->get(self::BASE)->assertRedirect('/dashboard');
    }
}
