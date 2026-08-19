<?php

namespace Tests\Feature;

use App\Models\SettingApp;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Penjaga temuan R-21: ingatan statis `SettingApp::cached()`.
 *
 * Ingatannya properti statis, jadi umurnya mengikuti umur proses PHP, bukan
 * umur permintaan. Pada PHP-FPM keduanya kebetulan sama panjang; pada
 * pengujian (satu proses untuk seluruh rangkaian) dan pada Octane, tidak.
 *
 * Sebelumnya pembatalannya diserahkan pada ingatan penulis kode: dua tempat
 * memanggil `clearCached()`, dan jalur ketiga yang lupa memanggilnya tidak
 * akan memberi gejala apa pun sampai ada yang mengaudit. Kini terpasang pada
 * peristiwa model, dan uji ini yang menjaganya tetap begitu.
 */
class IngatanSetelanAplikasiTest extends TestCase
{
    use RefreshDatabase;

    public function test_menyimpan_setelan_membatalkan_ingatan_tanpa_diminta(): void
    {
        $setelan = SettingApp::create(['nama_app' => 'SEBELUM']);

        $this->assertSame('SEBELUM', SettingApp::cached()?->nama_app);

        // Disimpan TANPA memanggil clearCached() — itu inti ujinya.
        $setelan->update(['nama_app' => 'SESUDAH']);

        $this->assertSame('SESUDAH', SettingApp::cached()?->nama_app);
    }

    public function test_menghapus_setelan_membatalkan_ingatan_tanpa_diminta(): void
    {
        $setelan = SettingApp::create(['nama_app' => 'ADA']);

        $this->assertNotNull(SettingApp::cached());

        $setelan->delete();

        $this->assertNull(SettingApp::cached());
    }

    /**
     * Baris yang dibuat uji lain tidak boleh terbawa ke uji ini.
     *
     * Gejalanya dulu: satu uji gagal di rangkaian penuh tetapi lulus kalau
     * dijalankan sendiri — bentuk kegagalan yang paling mudah disalahartikan
     * sebagai uji yang kebetulan rewel, lalu diulang sampai hijau.
     */
    public function test_ingatan_tidak_terbawa_dari_uji_sebelumnya(): void
    {
        $this->assertNull(SettingApp::cached());
    }
}
