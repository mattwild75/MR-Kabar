<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\Rpp;
use App\Models\RppCategory;
use App\Models\User;
use Database\Seeders\RppCategorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * ERPIKA > Perencanaan > RPP Perencanaan.
 *
 * Yang dijaga: halamannya terbuka, satu dokumen RPP tersimpan berikut
 * penugasan dan timnya (Employee terbentuk sebagai sumber tunggal), cetakan
 * tabel/pengantar menampilkan Inspektur sebagai satu-satunya penanda tangan,
 * dan scoping per-pembuat tetap berlaku.
 */
class RppTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RppCategorySeeder::class);
    }

    public function test_halaman_daftar_dan_formulir_terbuka_dan_menu_cetak_tidak_ada(): void
    {
        $this->actingAs(User::factory()->create());

        $this->get('/rpp')->assertOk();
        $this->get('/rpp/create')->assertOk();
        $this->get('/rpp-cetak')->assertNotFound();
    }

    private function muatanRpp(array $ubah = []): array
    {
        return array_merge([
            'rpp_category_id' => RppCategory::where('code', 'I')->value('id'),
            'year' => 2026,
            'bulan' => 3,
            'nomor_rpp' => '700/01/RPP-AKJ/INS/2026',
            'tanggal_rpp' => '2026-03-10',
            'dengan_penutup' => true,
            'penugasan' => [[
                'uraian' => 'Audit Kinerja atas Program Ketahanan Pangan TA 2025',
                'sifat' => 'Kinerja',
                'jumlah_laporan' => 1,
                'masa_tugas_mulai' => '2026-03-12',
                'masa_tugas_selesai' => '2026-04-09',
                'status' => 'draft',
                'obriks' => ['Dinas Pangan', 'Dinas Pertanian'],
                'tim' => [
                    ['role' => 'pj', 'nama' => 'Zakaria, S.E., CGCAE', 'nip' => '197205042001121002', 'hari_kantor' => 1, 'hari_lapangan' => 1],
                    ['role' => 'kt', 'nama' => 'Budi Santoso', 'nip' => '198001012005011001', 'hari_kantor' => 2, 'hari_lapangan' => 12],
                ],
            ]],
        ], $ubah);
    }

    public function test_dokumen_rpp_tersimpan_berikut_penugasan_tim_dan_pegawainya(): void
    {
        $pengguna = User::factory()->create();

        $this->actingAs($pengguna)->post('/rpp', $this->muatanRpp())->assertRedirect();

        $rpp = Rpp::first();
        $this->assertSame($pengguna->id, $rpp->user_id, 'RPP harus tercatat atas nama pembuatnya');
        $this->assertCount(1, $rpp->penugasan);
        $this->assertCount(2, $rpp->penugasan->first()->teamMembers);
        $this->assertSame(['Dinas Pangan', 'Dinas Pertanian'], $rpp->penugasan->first()->obriks->pluck('nama')->all());
        $this->assertSame('TMT 12 Maret - 9 April 2026', $rpp->penugasan->first()->tmtTampil());
        // Anggota tim baru harus terdaftar sebagai Employee (sumber tunggal).
        $this->assertDatabaseHas('employees', ['nip' => '198001012005011001']);
        // Nomor yang sama pada tahun yang sama ditolak.
        $this->actingAs($pengguna)->post('/rpp', $this->muatanRpp())->assertSessionHasErrors('nomor_rpp');
    }

    public function test_cetakan_memakai_inspektur_sebagai_satu_satunya_penanda_tangan(): void
    {
        $pengguna = User::factory()->create();
        Employee::create(['nama' => 'Zakaria, S.E., CGCAE', 'nip' => '197205042001121002', 'jabatan' => 'Inspektur']);
        $this->actingAs($pengguna)->post('/rpp', $this->muatanRpp())->assertRedirect();
        $rpp = Rpp::first();

        $this->actingAs($pengguna)->get("/rpp-cetak/{$rpp->id}/tabel/preview")->assertOk()->assertInertia(fn ($page) => $page
            ->where('inspektur.nama', 'Zakaria, S.E., CGCAE')
            ->where('inspektur.nip_rapat', '197205042001121002')
            ->where('rpp.sub_judul', 'BULAN MARET 2026')
            ->where('rpp.penugasan.0.tim.0.peran', 'Penanggung Jawab'));

        $this->actingAs($pengguna)->get("/rpp-cetak/{$rpp->id}/pengantar/preview")->assertOk()->assertInertia(fn ($page) => $page
            ->where('inspektur.nip_spasi', '19720504 200112 1 002')
            ->where('rpp.tujuan', 'Ketua Tim Audit Kinerja')
            ->where('rpp.hal', 'Penyampaian Rencana Penugasan Audit Kinerja Tahun 2026'));
    }

    public function test_daftar_disaring_per_tahun_dan_jenis(): void
    {
        $pengguna = User::factory()->create();
        $this->actingAs($pengguna)->post('/rpp', $this->muatanRpp())->assertRedirect();
        $this->actingAs($pengguna)->post('/rpp', $this->muatanRpp(['year' => 2025, 'nomor_rpp' => '700/01/RPP-Rev/INS/2025', 'rpp_category_id' => RppCategory::where('code', 'A')->value('id')]))->assertRedirect();

        $this->actingAs($pengguna)->get('/rpp?tahun=2025')->assertInertia(fn ($page) => $page->has('rpps', 1)->where('rpps.0.nomor_rpp', '700/01/RPP-Rev/INS/2025'));
        $this->actingAs($pengguna)->get('/rpp?tahun=2026&jenis='.RppCategory::where('code', 'A')->value('id'))->assertInertia(fn ($page) => $page->has('rpps', 0));
        $this->actingAs($pengguna)->get('/rpp?tahun=2026')->assertInertia(fn ($page) => $page->has('rpps', 1)->where('rpps.0.ringkasan.hari', 16));
    }

    public function test_pengguna_biasa_tidak_bisa_menyunting_rpp_orang_lain(): void
    {
        $pemilik = User::factory()->create();
        $lain = User::factory()->create();

        $rpp = Rpp::create([
            'rpp_category_id' => RppCategory::first()->id,
            'user_id' => $pemilik->id,
            'year' => 2026,
            'nomor_rpp' => 'RPP-002/2026',
        ]);

        $this->actingAs($lain)->get("/rpp/{$rpp->id}/edit")->assertForbidden();
        $this->actingAs($lain)->get("/rpp-cetak/{$rpp->id}/tabel/preview")->assertForbidden();
        $this->actingAs($pemilik)->get("/rpp/{$rpp->id}/edit")->assertOk();
    }

    private function admin(): User
    {
        Role::findOrCreate('super-admin', 'web');
        $a = User::factory()->create(['opd_id' => null]);
        $a->assignRole('super-admin');

        return $a;
    }

    public function test_pengaturan_rpp_hanya_untuk_admin(): void
    {
        $this->actingAs(User::factory()->create())->get('/rpp-pengaturan')->assertForbidden();
        $this->actingAs(User::factory()->create())->get('/erpika/pegawai')->assertForbidden();
        $admin = $this->admin();
        $this->actingAs($admin)->get('/rpp-pengaturan')->assertOk();
        $this->actingAs($admin)->get('/erpika/pegawai')->assertOk();
    }

    /**
     * Perbaikan data pegawai harus ikut ke baris tim yang memakainya — kalau
     * tidak, NIP yang baru diisi tidak pernah muncul di cetakan mana pun.
     */
    public function test_mengubah_pegawai_memperbarui_baris_tim_yang_memakainya(): void
    {
        $admin = $this->admin();
        $pegawai = Employee::create(['nama' => 'Rufran, S.Ag.,M.Si']);

        $rpp = Rpp::create([
            'rpp_category_id' => RppCategory::first()->id,
            'user_id' => $admin->id,
            'year' => 2026,
            'nomor_rpp' => 'RPP-003/2026',
        ]);
        $rpp->penugasan()->create(['uraian' => 'uji'])->teamMembers()->create(['employee_id' => $pegawai->id, 'role' => 'kt', 'nama' => $pegawai->nama]);

        $this->actingAs($admin)->put("/erpika/pegawai/{$pegawai->id}", [
            'nama' => 'Rufran, S.Ag., M.Si',
            'nip' => '197001012000031001',
        ])->assertRedirect();

        $this->assertDatabaseHas('rpp_team_members', [
            'employee_id' => $pegawai->id,
            'nama' => 'Rufran, S.Ag., M.Si',
            'nip' => '197001012000031001',
        ]);
    }

    /** Pegawai yang masih dipakai tim tidak boleh hilang diam-diam. */
    public function test_pegawai_yang_dipakai_tim_tidak_bisa_dihapus(): void
    {
        $admin = $this->admin();
        $pegawai = Employee::create(['nama' => 'Zakaria, S.E., CGCAE']);

        $rpp = Rpp::create([
            'rpp_category_id' => RppCategory::first()->id,
            'user_id' => $admin->id,
            'year' => 2026,
            'nomor_rpp' => 'RPP-004/2026',
        ]);
        $rpp->penugasan()->create(['uraian' => 'uji'])->teamMembers()->create(['employee_id' => $pegawai->id, 'role' => 'at', 'nama' => $pegawai->nama]);

        $this->actingAs($admin)->delete("/erpika/pegawai/{$pegawai->id}")->assertRedirect();

        $this->assertDatabaseHas('employees', ['id' => $pegawai->id]);
    }
}
