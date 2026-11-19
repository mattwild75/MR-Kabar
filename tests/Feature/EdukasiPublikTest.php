<?php

namespace Tests\Feature;

use App\Models\SettingApp;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Halaman tonton video publik /edukasi: terbuka tanpa login, tetapi tidak
 * boleh membawa apa pun selain setelan video (pola yang sama dengan
 * PropHalamanPublikTest untuk /panduan-publik).
 */
class EdukasiPublikTest extends TestCase
{
    use RefreshDatabase;

    private function siapkanSetting(): void
    {
        SettingApp::clearCached();
        SettingApp::create([
            'nama_app' => 'MR KABAR',
            'contact_email' => 'rahasia-super-admin@contoh.test',
            'edu_video_subtitle_size' => 80,
        ]);
        SettingApp::clearCached();
    }

    public function test_tamu_bisa_membuka_halaman_edukasi(): void
    {
        $this->siapkanSetting();

        $this->get('/edukasi')->assertOk()->assertInertia(fn ($page) => $page
            ->component('edukasi/Index')
            ->where('setting.edu_video_subtitle_size', 80)
            ->where('auth.user', null));
    }

    public function test_hanya_kolom_video_yang_dikirim(): void
    {
        $this->siapkanSetting();

        $isi = $this->get('/edukasi')->assertOk()->getContent();

        $this->assertStringNotContainsString('rahasia-super-admin@contoh.test', $isi);
        $this->assertStringNotContainsString('contact_email', $isi);
        $this->assertStringNotContainsString('nama_app', $isi);
    }

    public function test_daftar_rute_tidak_ikut_terkirim(): void
    {
        $this->siapkanSetting();

        $isi = $this->get('/edukasi')->assertOk()->getContent();

        $this->assertStringNotContainsString('users.reset-password', $isi);
        $this->assertSame(0, preg_match_all('/"[a-z0-9._-]+":\{"uri":/', $isi));
    }

    public function test_tercantum_di_robots_dan_sitemap(): void
    {
        $this->get('/robots.txt')->assertOk()->assertSee('Allow: /edukasi');
        $this->get('/sitemap.xml')->assertOk()->assertSee('/edukasi');
    }
}
