<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\PenyimpananService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Utilities > Storage: hanya super-admin; potret memuat semua kelompok;
 * penghapusan hanya menyentuh yang dinyatakan aman dan menolak jalur di
 * luar foldernya.
 */
class PenyimpananTest extends TestCase
{
    use RefreshDatabase;

    private function superAdmin(): User
    {
        Role::findOrCreate('super-admin', 'web');
        $u = User::factory()->create();
        $u->assignRole('super-admin');

        return $u;
    }

    public function test_hanya_super_admin_dan_potret_lengkap(): void
    {
        Cache::forget(PenyimpananService::CACHE);
        $this->actingAs(User::factory()->create())->get('/penyimpanan')->assertForbidden();

        $this->actingAs($this->superAdmin())->get('/penyimpanan')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('storage/Index')
                ->has('potret.disk.total')
                ->has('potret.kelompok', 13)
                ->where('potret.kelompok.0.kode', 'kode')
                ->where('potret.kelompok.0.aman', false)
                ->where('potret.kelompok.12.kode', 'sistem'));
    }

    public function test_hapus_log_lama_boleh_log_hari_ini_dan_jalur_liar_ditolak(): void
    {
        $admin = $this->superAdmin();
        $lama = storage_path('logs/laravel-2020-01-01.log');
        File::put($lama, 'uji');
        touch($lama, strtotime('2020-01-01'));
        $hariIni = storage_path('logs/uji-hari-ini.log');
        File::put($hariIni, 'uji');

        try {
            $this->actingAs($admin)->delete('/penyimpanan', ['butir' => [['jenis' => 'log', 'id' => 'laravel-2020-01-01.log']]])->assertSessionHas('success');
            $this->assertFileDoesNotExist($lama);

            $this->actingAs($admin)->delete('/penyimpanan', ['butir' => [['jenis' => 'log', 'id' => 'uji-hari-ini.log']]])->assertSessionHas('error');
            $this->assertFileExists($hariIni);

            $this->actingAs($admin)->delete('/penyimpanan', ['butir' => [['jenis' => 'log', 'id' => '../../.env']]])->assertSessionHas('error');
            $this->actingAs($admin)->delete('/penyimpanan', ['butir' => [['jenis' => 'sementara', 'id' => '../.env']]])->assertSessionHas('error');
            $this->actingAs($admin)->delete('/penyimpanan', ['butir' => [['jenis' => 'sementara', 'id' => 'private']]])->assertSessionHas('error');
            $this->assertFileExists(base_path('.env'));
            $this->actingAs($admin)->delete('/penyimpanan', ['butir' => [['jenis' => 'kode', 'id' => 'vendor']]])->assertSessionHasErrors('butir.0.jenis');
        } finally {
            @unlink($lama);
            @unlink($hariIni);
        }
    }
}
