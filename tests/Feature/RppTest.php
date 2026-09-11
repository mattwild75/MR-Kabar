<?php

namespace Tests\Feature;

use App\Models\Rpp;
use App\Models\RppCategory;
use App\Models\User;
use Database\Seeders\RppCategorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}
