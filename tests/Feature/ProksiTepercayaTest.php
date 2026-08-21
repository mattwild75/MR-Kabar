<?php

namespace Tests\Feature;

use Illuminate\Http\Middleware\TrustProxies;
use Tests\TestCase;

/**
 * Penjaga temuan R-12: proksi tepercaya.
 *
 * Aplikasi ini dibuka ke luar lewat `cloudflared`, yang berjalan DI MESIN INI
 * dan menyerahkan permintaannya ke Herd dari 127.0.0.1. Tanpa setelan ini,
 * Laravel mengabaikan keterangan X-Forwarded-* dan menganggap SETIAP
 * pengunjung datang dari 127.0.0.1.
 *
 * Terbukti di basis data sungguhan sebelum diperbaiki: 51 sesi, satu alamat,
 * termasuk yang masuk lewat tunnel. Tiga akibatnya nyata:
 *
 *   1. Pembatas percobaan masuk dan pembatas 2FA dihitung per alamat IP.
 *      Kalau semua pengunjung beralamat sama, satu orang yang salah sandi
 *      berkali-kali mengunci pintu bagi semua orang.
 *   2. Jejak audit mencatat 127.0.0.1 untuk semua orang.
 *   3. Alamat aset dibuat menurut nama host yang diterima Herd, bukan alamat
 *      yang dipakai pengunjung — sehingga halaman lokal dan halaman tunnel
 *      tidak pernah bisa benar sekaligus.
 *
 * Setelan semacam ini gampang hilang tanpa ketahuan: aplikasinya tetap jalan,
 * hanya diam-diam salah lagi. Uji inilah yang menahannya.
 */
class ProksiTepercayaTest extends TestCase
{
    /** Alamat pengunjung yang sebenarnya dibaca, bukan alamat proksinya. */
    public function test_alamat_pengunjung_dibaca_dari_keterangan_proksi(): void
    {
        $this->get('/login', ['X-Forwarded-For' => '103.179.248.183'])->assertOk();

        $this->assertSame('103.179.248.183', request()->ip());
    }

    /**
     * Nama host asal dibaca — inilah yang membuat alamat aset benar untuk
     * pengunjung tunnel MAUPUN pengunjung lokal, tanpa menyentuh .env.
     */
    public function test_nama_host_asal_dibaca_dari_keterangan_proksi(): void
    {
        $this->get('/login', [
            'X-Forwarded-Host' => 'contoh-tunnel.trycloudflare.com',
            'X-Forwarded-Proto' => 'https',
        ])->assertOk();

        $this->assertSame('contoh-tunnel.trycloudflare.com', request()->getHost());
        $this->assertTrue(request()->isSecure());
    }

    /** Tanpa keterangan apa pun, tidak ada yang berubah. */
    public function test_tanpa_keterangan_proksi_permintaan_biasa_tetap_apa_adanya(): void
    {
        $this->get('/login')->assertOk();

        $this->assertSame('127.0.0.1', request()->ip());
    }

    /**
     * Daftar proksinya HANYA localhost.
     *
     * Bukan rentang Cloudflare: alamat milik Cloudflare tidak pernah menyentuh
     * server ini — cloudflared-lah yang berbicara ke Herd, dari mesin yang
     * sama. Dan bukan '*': mempercayai semua pengirim berarti nama host palsu
     * bisa menyelinap ke tautan yang dikirim aplikasi, mis. pemulihan sandi.
     */
    public function test_hanya_localhost_yang_dipercaya(): void
    {
        // Disimpan Laravel pada properti STATIS lewat TrustProxies::at(),
        // bukan pada instansnya — membaca $this->proxies pada objek baru
        // selalu menghasilkan null dan uji ini akan hijau palsu.
        $proksi = (fn () => static::$alwaysTrustProxies)
            ->call(new TrustProxies);

        $this->assertSame(['127.0.0.1', '::1'], $proksi);
        $this->assertNotContains('*', $proksi);
    }
}
