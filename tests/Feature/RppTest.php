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
 * ERPIKA > Perencanaan > RPP — modul yang dipindahkan dari proyek ERPIKA.
 *
 * Yang dijaga: halamannya terbuka di MR Kabar, RPP tersimpan berikut anggota
 * timnya (dan Employee-nya terbentuk sebagai sumber tunggal), dan scoping
 * per-pembuat tetap berlaku — pengguna biasa tidak bisa menyunting RPP orang
 * lain, sementara akun lintas OPD bisa.
 */
class RppTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RppCategorySeeder::class);
    }

    public function test_halaman_input_dan_cetak_terbuka(): void
    {
        $this->actingAs(User::factory()->create());

        $this->get('/rpp')->assertOk();
        $this->get('/rpp/create')->assertOk();
        $this->get('/rpp-cetak')->assertOk();
    }

    public function test_rpp_tersimpan_berikut_tim_dan_pegawainya(): void
    {
        $pengguna = User::factory()->create();

        $this->actingAs($pengguna)->post('/rpp', [
            'rpp_category_id' => RppCategory::first()->id,
            'year' => 2026,
            'nomor_rpp' => 'RPP-001/2026',
            'status' => 'draft',
            'team_members' => [
                ['role' => 'ketua_tim', 'nama' => 'Budi Santoso', 'nip' => '198001012005011001', 'hari_kantor' => 2, 'hari_lapangan' => 5],
            ],
        ])->assertRedirect();

        $rpp = Rpp::first();

        $this->assertSame($pengguna->id, $rpp->user_id, 'RPP harus tercatat atas nama pembuatnya');
        $this->assertCount(1, $rpp->teamMembers);
        // Anggota tim baru harus terdaftar sebagai Employee (sumber tunggal).
        $this->assertDatabaseHas('employees', ['nip' => '198001012005011001']);
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
            'status' => 'draft',
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
            'status' => 'draft',
        ]);
        $rpp->teamMembers()->create(['employee_id' => $pegawai->id, 'role' => 'ketua_tim', 'nama' => $pegawai->nama]);

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
            'status' => 'draft',
        ]);
        $rpp->teamMembers()->create(['employee_id' => $pegawai->id, 'role' => 'anggota_tim', 'nama' => $pegawai->nama]);

        $this->actingAs($admin)->delete("/erpika/pegawai/{$pegawai->id}")->assertRedirect();

        $this->assertDatabaseHas('employees', ['id' => $pegawai->id]);
    }
}
