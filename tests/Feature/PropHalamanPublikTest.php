<?php

namespace Tests\Feature;

use App\Models\SettingApp;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Penjaga temuan T-01 dan T-02 audit PASS 1 (17 Agustus 2026).
 *
 * /panduan-publik sengaja terbuka tanpa login. Dua hal ikut terkirim ke sana
 * dan tidak seorang pun memerlukannya:
 *
 *  T-01  seluruh baris settingapp (32 kolom), termasuk contact_email yang
 *        berisi surel pribadi pemegang akun Super Admin;
 *  T-02  seluruh 260 definisi rute Ziggy, termasuk permukaan administrasi
 *        seperti roles.destroy dan users.reset-password.
 *
 * Rutenya sendiri tetap terkunci middleware, tetapi peta lengkap aplikasi
 * jadi tersedia gratis lewat view-source. Uji ini memastikan keduanya tidak
 * kembali terbawa.
 */
class PropHalamanPublikTest extends TestCase
{
    use RefreshDatabase;

    private function siapkanSetting(): void
    {
        // WAJIB dikosongkan lebih dulu. SettingApp::cached() menyimpan
        // hasilnya di properti STATIS, dan properti statis bertahan lintas uji
        // di dalam satu proses PHPUnit. Uji lain yang berjalan lebih dulu saat
        // tabel settingapp masih kosong akan meninggalkan $cached = null dan
        // $cachedResolved = true — sehingga baris yang dibuat di sini tidak
        // pernah terbaca, dan uji ini gagal padahal aplikasinya benar.
        // Terjadi sungguhan: lulus saat dijalankan sendiri, gagal di rangkaian
        // penuh.
        SettingApp::clearCached();

        SettingApp::create([
            'nama_app' => 'MR KABAR',
            'contact_email' => 'rahasia-super-admin@contoh.test',
        ]);

        SettingApp::clearCached();
    }

    public function test_halaman_publik_tidak_membocorkan_surel_kontak(): void
    {
        $this->siapkanSetting();

        $this->get('/panduan-publik')
            ->assertOk()
            ->assertDontSee('rahasia-super-admin@contoh.test');
    }

    public function test_halaman_publik_tidak_mengirim_prop_setting(): void
    {
        $this->siapkanSetting();

        // Dikirim sebagai null, bukan dihilangkan — supaya komponen yang
        // membacanya tidak meledak, tetapi isinya tidak ikut terbawa.
        $this->get('/panduan-publik')
            ->assertOk()
            ->assertDontSee('contact_email')
            ->assertDontSee('nama_app');
    }

    /**
     * Ziggy menuliskan definisi rute sebagai {"uri": ...}. Yang diperiksa
     * bukan sekadar tidak adanya nama rute tertentu, melainkan tidak adanya
     * bentuk itu sama sekali.
     */
    public function test_halaman_publik_tidak_membocorkan_daftar_rute(): void
    {
        $this->siapkanSetting();

        $isi = $this->get('/panduan-publik')->assertOk()->getContent();

        $this->assertStringNotContainsString('roles.destroy', $isi);
        $this->assertStringNotContainsString('users.reset-password', $isi);
        $this->assertSame(
            0,
            preg_match_all('/"[a-z0-9._-]+":\{"uri":/', $isi),
            'Definisi rute Ziggy tidak boleh ada di halaman publik.',
        );
    }

    /** Halaman login MASIH memerlukan keduanya — perbaikan tidak boleh merusaknya. */
    public function test_halaman_login_tetap_menerima_setting_dan_rute(): void
    {
        $this->siapkanSetting();

        $isi = $this->get('/login')->assertOk()->getContent();

        $this->assertStringContainsString('nama_app', $isi);
        $this->assertGreaterThan(
            50,
            preg_match_all('/"[a-z0-9._-]+":\{"uri":/', $isi),
            'Halaman login membutuhkan daftar rute Ziggy.',
        );
    }
}
