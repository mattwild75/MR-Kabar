<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/** ERPIKA sementara hanya admin/super-admin; akun LAPOR di dashboard mendapat penanda isLapor. */
class ErpikaHanyaAdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_erpika_ditolak_untuk_peran_lain_dan_terbuka_untuk_admin(): void
    {
        foreach (['admin', 'super-admin', 'user', 'eksekutif', 'lapor-risiko'] as $r) {
            Role::findOrCreate($r, 'web');
        }
        $buat = function (string $peran) {
            $u = User::factory()->create();
            $u->assignRole($peran);

            return $u;
        };

        foreach (['user', 'eksekutif'] as $peran) {
            $u = $buat($peran);
            foreach (['/erpika/pegawai', '/rpp', '/rpp-pengaturan', '/erpika/aneva', '/rpp-cetak/tata-naskah/preview'] as $url) {
                $this->actingAs($u)->get($url)->assertRedirect('/dashboard');
            }
            $this->actingAs($u)->post('/erpika/pegawai', ['nama' => 'x'])->assertRedirect('/dashboard');
            $this->actingAs($u)->get('/dashboard')->assertOk();
        }

        $this->actingAs($buat('admin'))->get('/erpika/pegawai')->assertOk();
        $this->actingAs($buat('super-admin'))->get('/erpika/pegawai')->assertOk();
    }

    public function test_akun_lapor_dashboard_hanya_lihat(): void
    {
        Role::findOrCreate('lapor-risiko', 'web');
        $u = User::factory()->create();
        $u->assignRole('lapor-risiko');
        $this->actingAs($u)->get('/dashboard')->assertOk()->assertInertia(fn ($p) => $p->where('auth.isLapor', true));
        $this->actingAs($u)->get('/erpika/pegawai')->assertRedirect('/dashboard');
    }
}
