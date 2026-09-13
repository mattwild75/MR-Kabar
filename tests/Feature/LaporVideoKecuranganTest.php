<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Halaman video edukasi Lapor Dugaan Kecurangan harus terbuka untuk akun
 * bersama LAPOR yang masuk lewat kode QR — ia dibatasi ke prefix
 * /lapor-kejadian oleh RestrictLaporRisikoRole, dan halaman ini sengaja
 * ditaruh di bawah prefix itu.
 */
class LaporVideoKecuranganTest extends TestCase
{
    use RefreshDatabase;

    public function test_akun_lapor_dan_pengguna_biasa_dapat_membuka_video_kecurangan(): void
    {
        Role::findOrCreate('lapor-risiko', 'web');
        $lapor = User::factory()->create();
        $lapor->assignRole('lapor-risiko');

        $this->actingAs($lapor)->get('/lapor-kejadian/video-kecurangan')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('lapor-kejadian/VideoKecurangan')->has('versi'));

        $this->actingAs(User::factory()->create())->get('/lapor-kejadian/video-kecurangan')->assertOk();
    }
}
