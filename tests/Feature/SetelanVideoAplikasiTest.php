<?php

namespace Tests\Feature;

use App\Models\SettingApp;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Setelan video & splash di /settingsapp.
 *
 * Ketiga video aplikasi (edukasi, tutorial, edukasi Lapor Dugaan Kecurangan)
 * diatur dengan cara yang sama lewat satu penanganan
 * (SettingAppController::terapkanBerkasVideo). Video kecurangan semula tidak
 * punya setelan sendiri dan menumpang setelan subtitle video edukasi; splash
 * kini membawa efek suara dengan volume yang bisa diatur.
 */
class SetelanVideoAplikasiTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        Role::findOrCreate('super-admin', 'web');
        $u = User::factory()->create();
        $u->assignRole('super-admin');

        return $u;
    }

    /** Isian minimum yang selalu dikirim formulir. */
    private function isian(array $tambahan = []): array
    {
        return array_merge([
            'nama_app' => 'MR Kabar',
            'login_splash_enabled' => true,
            'login_splash_muted' => false,
            'login_splash_volume' => 60,
            'edu_video_enabled' => true,
            'edu_video_subtitle_enabled' => true,
            'tutorial_video_enabled' => true,
            'tutorial_video_subtitle_enabled' => true,
            'kecurangan_video_enabled' => true,
            'kecurangan_video_subtitle_enabled' => true,
        ], $tambahan);
    }

    public function test_setelan_splash_dan_video_kecurangan_tersimpan(): void
    {
        $this->actingAs($this->admin())->post('/settingsapp', $this->isian([
            'kecurangan_video_enabled' => false,
            'kecurangan_video_gain_narration' => 120,
            'kecurangan_video_gain_music' => 40,
            'kecurangan_video_gain_sfx' => 0,
            'kecurangan_video_subtitle_enabled' => false,
            'kecurangan_video_subtitle_size' => 90,
        ]))->assertSessionHasNoErrors()->assertRedirect();

        $s = SettingApp::first();
        $this->assertFalse($s->login_splash_muted);
        $this->assertSame(60, $s->login_splash_volume);
        $this->assertFalse($s->kecurangan_video_enabled);
        $this->assertSame([120, 40, 0], [$s->kecurangan_video_gain_narration, $s->kecurangan_video_gain_music, $s->kecurangan_video_gain_sfx]);
        $this->assertFalse($s->kecurangan_video_subtitle_enabled);
        $this->assertSame(90, $s->kecurangan_video_subtitle_size);
        // Setelan video edukasi tidak ikut berubah.
        $this->assertTrue($s->edu_video_subtitle_enabled);
    }

    public function test_subtitle_srt_video_kecurangan_diubah_ke_vtt_lalu_bisa_dihapus(): void
    {
        Storage::fake('public');
        $admin = $this->admin();
        $srt = UploadedFile::fake()->createWithContent('sub.srt', "1\n00:00:01,500 --> 00:00:03,000\nHalo, Aceh Barat\n");

        $this->actingAs($admin)->post('/settingsapp', $this->isian(['kecurangan_video_subtitle_path' => $srt]))->assertSessionHasNoErrors();

        $path = SettingApp::first()->kecurangan_video_subtitle_path;
        $this->assertStringStartsWith('kecurangan-video/subtitle-', $path);
        $isi = Storage::disk('public')->get($path);
        $this->assertStringStartsWith('WEBVTT', $isi);
        $this->assertStringContainsString('00:00:01.500 --> 00:00:03.000', $isi);
        $this->assertStringContainsString('Halo, Aceh Barat', $isi);

        $this->actingAs($admin)->post('/settingsapp', $this->isian(['kecurangan_video_subtitle_remove' => true]))->assertSessionHasNoErrors();
        $this->assertNull(SettingApp::first()->kecurangan_video_subtitle_path);
    }

    public function test_berkas_video_pengganti_ketiga_video_ditangani_sama(): void
    {
        Storage::fake('public');
        $admin = $this->admin();

        $this->actingAs($admin)->post('/settingsapp', $this->isian([
            'edu_video_path' => UploadedFile::fake()->create('a.mp4', 100, 'video/mp4'),
            'tutorial_video_path' => UploadedFile::fake()->create('b.mp4', 100, 'video/mp4'),
            'kecurangan_video_path' => UploadedFile::fake()->create('c.mp4', 100, 'video/mp4'),
        ]))->assertSessionHasNoErrors();

        $s = SettingApp::first();
        $this->assertStringStartsWith('edu-video/', $s->edu_video_path);
        $this->assertStringStartsWith('tutorial-video/', $s->tutorial_video_path);
        $this->assertStringStartsWith('kecurangan-video/', $s->kecurangan_video_path);

        // Disimpan tanpa berkas & tanpa permintaan hapus: berkasnya tetap.
        $this->actingAs($admin)->post('/settingsapp', $this->isian())->assertSessionHasNoErrors();
        $this->assertSame($s->kecurangan_video_path, SettingApp::first()->kecurangan_video_path);

        $this->actingAs($admin)->post('/settingsapp', $this->isian(['kecurangan_video_remove' => true]))->assertSessionHasNoErrors();
        $s = SettingApp::first();
        $this->assertNull($s->kecurangan_video_path);
        $this->assertNotNull($s->edu_video_path);
    }

    public function test_angka_setelan_dijaga_dan_kosong_tidak_menimpa(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)->post('/settingsapp', $this->isian(['login_splash_volume' => 150]))
            ->assertSessionHasErrors('login_splash_volume');

        $this->actingAs($admin)->post('/settingsapp', $this->isian(['kecurangan_video_gain_music' => 70]))->assertSessionHasNoErrors();
        $this->actingAs($admin)->post('/settingsapp', $this->isian([
            'login_splash_volume' => '',
            'kecurangan_video_gain_music' => '',
        ]))->assertSessionHasNoErrors();

        $s = SettingApp::first();
        $this->assertSame(60, $s->login_splash_volume);
        $this->assertSame(70, $s->kecurangan_video_gain_music);
    }

    public function test_pengguna_biasa_tidak_bisa_mengubah_setelan(): void
    {
        $this->actingAs(User::factory()->create())->post('/settingsapp', $this->isian())->assertForbidden();
    }

    public function test_video_kecurangan_dimatikan_mengembalikan_ke_formulir_lapor(): void
    {
        SettingApp::create(['nama_app' => 'MR Kabar', 'kecurangan_video_enabled' => false]);

        $this->actingAs(User::factory()->create())->get('/lapor-kejadian/video-kecurangan')
            ->assertRedirect(route('lapor-kejadian.create'));
    }

    public function test_video_kecurangan_membaca_setelan_bersama(): void
    {
        SettingApp::create(['nama_app' => 'MR Kabar', 'kecurangan_video_gain_sfx' => 50]);

        $this->actingAs(User::factory()->create())->get('/lapor-kejadian/video-kecurangan')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('lapor-kejadian/VideoKecurangan')
                ->where('setting.kecurangan_video_gain_sfx', 50)
                ->has('kecuranganVideoVersion'));
    }
}
