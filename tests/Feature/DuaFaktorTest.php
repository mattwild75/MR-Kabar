<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\DuaFaktorService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PragmaRX\Google2FA\Google2FA;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Penjaga autentikasi dua faktor.
 *
 * Yang diuji di sini bukan "apakah kodenya cocok" — pustaka TOTP sudah
 * mengurus itu. Yang diuji adalah hal-hal yang gampang runtuh diam-diam saat
 * kode di sekitarnya disunting berbulan-bulan kemudian:
 *
 *  - lapisan kedua benar-benar MENAHAN, bukan sekadar menampilkan layar;
 *  - layar tantangan tidak bisa DILANGKAHI lewat halaman lain;
 *  - kode pemulihan HANGUS sesudah dipakai;
 *  - masih ada JALAN KELUAR kalau ponselnya hilang.
 *
 * Dua yang terakhir menentukan apakah 2FA ini aman dipasang di aplikasi yang
 * Super Admin-nya cuma satu orang dan tidak ada siapa pun di atasnya yang
 * bisa membukakan.
 */
class DuaFaktorTest extends TestCase
{
    use RefreshDatabase;

    private function peran(): void
    {
        // Dinyalakan kembali di sini saja. TestCase mematikannya untuk seluruh
        // suite (lihat alasannya di sana); berkas inilah satu-satunya yang
        // memang menguji kewajibannya.
        config(['mrkabar.dua_faktor.peran_wajib' => ['super-admin', 'admin']]);

        foreach (['super-admin', 'admin', 'user'] as $n) {
            Role::findOrCreate($n, 'web');
        }
    }

    /** Akun berperan wajib, 2FA sudah menyala. */
    private function akunBer2fa(string $peran = 'admin'): array
    {
        $this->peran();

        $user = User::factory()->create();
        $user->assignRole($peran);

        $layanan = app(DuaFaktorService::class);
        $kunci = $layanan->buatKunci();
        $kodePemulihan = $layanan->nyalakan($user, $kunci);

        return [$user->fresh(), $kunci, $kodePemulihan];
    }

    private function kodeSaatIni(string $kunci): string
    {
        return app(Google2FA::class)->getCurrentOtp($kunci);
    }

    // ---------------------------------------------------------------- menahan

    /** Peran wajib yang belum memasang 2FA tidak boleh ke mana-mana dulu. */
    public function test_peran_wajib_tanpa_2fa_dipantulkan_ke_pengaturan_profil(): void
    {
        $this->peran();
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin)->get('/dashboard')->assertRedirect(route('profile.edit'));
    }

    /** Peran biasa tidak ikut terkena kewajibannya. */
    public function test_peran_biasa_tanpa_2fa_tidak_terganggu(): void
    {
        $this->peran();
        $biasa = User::factory()->create();
        $biasa->assignRole('user');

        $this->actingAs($biasa)->get('/dashboard')->assertOk();
    }

    /** Sandi benar saja belum membuka apa pun. */
    public function test_2fa_aktif_tanpa_lulus_tantangan_dipantulkan_ke_layar_tantangan(): void
    {
        [$admin] = $this->akunBer2fa();

        $this->actingAs($admin)->get('/dashboard')->assertRedirect(route('dua-faktor.tampil'));
    }

    /**
     * Inti keamanannya: layar tantangan TIDAK BISA DILANGKAHI.
     *
     * Ini pernah bocor pada rancangan pertama — halaman profil dibiarkan
     * terbuka untuk semua keadaan supaya pemasangannya tidak buntu. Akibatnya
     * pemegang sandi curian bisa mengganti surel akun tanpa pernah menyentuh
     * kode dua faktor, lalu mengambil alih lewat pemulihan sandi.
     */
    public function test_2fa_aktif_tanpa_lulus_tantangan_tidak_dapat_membuka_pengaturan_profil(): void
    {
        [$admin] = $this->akunBer2fa();

        $this->actingAs($admin)->get('/settings/profile')->assertRedirect(route('dua-faktor.tampil'));
        $this->actingAs($admin)->patch('/settings/profile', [
            'name' => 'Diambil Alih',
            'email' => 'penyerang@example.test',
        ])->assertRedirect(route('dua-faktor.tampil'));

        $this->assertSame($admin->email, $admin->fresh()->email);
    }

    /** Permintaan JSON tidak dipantulkan, melainkan ditolak terang-terangan. */
    public function test_permintaan_json_ditolak_dengan_423(): void
    {
        [$admin] = $this->akunBer2fa();

        $this->actingAs($admin)
            ->getJson('/notifications')
            ->assertStatus(423);
    }

    // ------------------------------------------------------------- melewatkan

    public function test_kode_benar_melewatkan_tantangan(): void
    {
        [$admin, $kunci] = $this->akunBer2fa();

        $this->actingAs($admin)
            ->post(route('dua-faktor.kirim'), ['kode' => $this->kodeSaatIni($kunci)])
            ->assertRedirect(route('dashboard'));

        $this->assertTrue(session('dua_faktor_lulus'));
        $this->actingAs($admin)->get('/dashboard')->assertOk();
    }

    public function test_kode_salah_tidak_melewatkan_tantangan(): void
    {
        [$admin] = $this->akunBer2fa();

        $this->actingAs($admin)
            ->post(route('dua-faktor.kirim'), ['kode' => '000000'])
            ->assertSessionHasErrors('kode');

        $this->assertNull(session('dua_faktor_lulus'));
    }

    /** Akun tanpa 2FA yang mengetik alamatnya sendiri tidak boleh menabrak error. */
    public function test_akun_tanpa_2fa_yang_membuka_layar_tantangan_dikembalikan(): void
    {
        $this->peran();
        $biasa = User::factory()->create();
        $biasa->assignRole('user');

        $this->actingAs($biasa)->get(route('dua-faktor.tampil'))->assertRedirect(route('dashboard'));
        $this->actingAs($biasa)->post(route('dua-faktor.kirim'), ['kode' => '123456'])->assertRedirect(route('dashboard'));
    }

    // ---------------------------------------------------------- kode pemulihan

    public function test_kode_pemulihan_berlaku_sekali_lalu_hangus(): void
    {
        [$admin, , $kodePemulihan] = $this->akunBer2fa();
        $satu = $kodePemulihan[0];

        $this->actingAs($admin)
            ->post(route('dua-faktor.kirim'), ['kode' => $satu, 'pakai_pemulihan' => true])
            ->assertRedirect(route('dashboard'));

        $this->assertCount(9, app(DuaFaktorService::class)->kodePemulihanTersimpan($admin->fresh()));

        // Sesi baru, kode yang sama — kali ini harus ditolak.
        $this->app['auth']->guard('web')->logout();
        session()->flush();

        $this->actingAs($admin->fresh())
            ->post(route('dua-faktor.kirim'), ['kode' => $satu, 'pakai_pemulihan' => true])
            ->assertSessionHasErrors('kode');
    }

    // ------------------------------------------------------------- pemasangan

    /**
     * Kunci BELUM disimpan saat kode QR ditampilkan.
     *
     * Kalau ia langsung tersimpan, orang yang menutup halaman sebelum
     * memindainya akan terkunci dari akunnya sendiri: server menganggap 2FA
     * aktif, sedangkan ponselnya tidak pernah menyimpan apa pun.
     */
    public function test_menyiapkan_belum_menyimpan_kunci_ke_basis_data(): void
    {
        $this->peran();
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin)->post(route('dua-faktor.siapkan'))->assertRedirect();

        $this->assertNull($admin->fresh()->two_factor_secret);
        $this->assertNotNull(session('dua_faktor_kunci_sementara'));
    }

    public function test_pemasangan_selesai_menyalakan_2fa_dan_memberi_sepuluh_kode_pemulihan(): void
    {
        $this->peran();
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin)->post(route('dua-faktor.siapkan'));
        $kunci = session('dua_faktor_kunci_sementara');

        $this->actingAs($admin)
            ->post(route('dua-faktor.nyalakan'), ['kode' => $this->kodeSaatIni($kunci)])
            ->assertSessionHas('duaFaktorKodePemulihan');

        $this->assertTrue(app(DuaFaktorService::class)->aktif($admin->fresh()));
        $this->assertCount(10, session('duaFaktorKodePemulihan'));
    }

    /**
     * Sesudah memasang, pemiliknya HARUS bisa melihat kode pemulihannya.
     *
     * Cacat sungguhan yang lolos dari seluruh uji per-permintaan dan baru
     * ketahuan saat dijalankan di peramban: begitu 2FA menyala, permintaan
     * berikutnya — yaitu permintaan yang menampilkan kode pemulihan —
     * memenuhi syarat "aktif tetapi belum lulus", jadi penjaga memantulkannya
     * ke layar tantangan. 2FA menyala dengan kode pemulihan yang tidak pernah
     * terlihat siapa pun, dan ponsel yang hilang berarti akun yang hilang.
     */
    public function test_sesudah_memasang_halaman_profil_tidak_dipantulkan_ke_layar_tantangan(): void
    {
        $this->peran();
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin)->post(route('dua-faktor.siapkan'));
        $kunci = session('dua_faktor_kunci_sementara');
        $this->actingAs($admin)->post(route('dua-faktor.nyalakan'), ['kode' => $this->kodeSaatIni($kunci)]);

        $this->get('/settings/profile')->assertOk();
    }

    /** Peran wajib tidak boleh mencabut sendiri, sekalipun POST-nya dikirim langsung. */
    public function test_peran_wajib_tidak_dapat_mematikan_2fa_sendiri(): void
    {
        [$admin, $kunci] = $this->akunBer2fa();

        $this->actingAs($admin)->post(route('dua-faktor.kirim'), ['kode' => $this->kodeSaatIni($kunci)]);

        $this->delete(route('dua-faktor.matikan'), ['password' => 'password'])
            ->assertSessionHasErrors('password');

        $this->assertTrue(app(DuaFaktorService::class)->aktif($admin->fresh()));
    }

    // ------------------------------------------------------------ jalan keluar

    /**
     * Jalan keluar terakhir kalau ponsel DAN lembar kode pemulihannya hilang.
     *
     * Tanpa perintah ini, Super Admin tunggal yang kehilangan ponselnya akan
     * terkunci selamanya, beserta seluruh data kabupaten di belakangnya.
     */
    public function test_perintah_baris_perintah_dapat_mematikan_2fa(): void
    {
        [$admin] = $this->akunBer2fa('super-admin');

        $this->artisan('duafaktor:matikan', ['username' => $admin->username, '--paksa' => true])
            ->assertSuccessful();

        $this->assertFalse(app(DuaFaktorService::class)->aktif($admin->fresh()));
    }

    // ----------------------------------------------------------- kebocoran prop

    /**
     * Kunci terenkripsi tidak boleh ikut terserialisasi ke halaman.
     *
     * Objek User dibagikan utuh lewat Inertia shared props, dan seluruhnya
     * terbaca lewat view-source. Cirinya sama persis dengan kebocoran
     * settingapp yang ditemukan audit PASS 1.
     */
    public function test_kunci_2fa_tidak_ikut_terkirim_ke_halaman(): void
    {
        [$admin, $kunci] = $this->akunBer2fa();

        $this->actingAs($admin)->post(route('dua-faktor.kirim'), ['kode' => $this->kodeSaatIni($kunci)]);

        $halaman = $this->get('/settings/profile')->assertOk()->getContent();

        $this->assertStringNotContainsString('two_factor_secret', $halaman);
        $this->assertStringNotContainsString('two_factor_recovery_codes', $halaman);
    }
}
