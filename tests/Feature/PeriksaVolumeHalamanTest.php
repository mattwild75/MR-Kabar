<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Penjaga temuan R-17 — pengukur ambang paginasi.
 *
 * Paginasi sengaja BELUM dikerjakan. Diukur di aplikasi berjalan, halaman
 * terberat 1.530 KB dan dilayani 459 ms, jauh di bawah ambang 3 MB / 1 detik.
 * Memotong register risiko jadi halaman 25 baris menyelesaikan masalah bita
 * sambil merusak cara halaman itu dipakai — digulir, disaring, dicocokkan
 * antar-baris, dan dicetak sebagai satu kesatuan.
 *
 * Tetapi menunda dengan ambang hanya aman kalau ada yang MENGUKUR ULANG.
 * Tanpa itu, "nanti kalau sudah besar" berarti "tidak pernah", dan yang
 * menyadarkan akhirnya adalah pemakai yang halamannya berhenti terbuka.
 *
 * Yang dijaga di sini: perintahnya benar-benar berbunyi ketika ambangnya
 * terlampaui, dan diam ketika belum. Pengukur yang tidak pernah berbunyi sama
 * tak bergunanya dengan tidak mengukur sama sekali.
 */
class PeriksaVolumeHalamanTest extends TestCase
{
    use RefreshDatabase;

    public function test_pada_basis_data_kosong_dinyatakan_lapang(): void
    {
        $this->artisan('volume:periksa')
            ->expectsOutputToContain('Masih lapang')
            ->assertSuccessful();
    }

    /**
     * Ambang yang sangat kecil HARUS membuatnya berbunyi.
     *
     * Diuji lewat ambangnya, bukan lewat menimbun ribuan baris: yang perlu
     * dibuktikan adalah perbandingannya bekerja, dan perbandingan tidak peduli
     * dari sisi mana angkanya dibuat bertemu.
     */
    public function test_ambang_yang_terlampaui_dilaporkan_dan_gagal(): void
    {
        DB::table('tbl_krs_pemda')->insert([
            'VISI' => 'UJI', 'MISI' => 'UJI',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        $this->artisan('volume:periksa', ['--ambang-kb' => 1])
            ->expectsOutputToContain('AMBANG TERLAMPAUI')
            ->assertFailed();
    }

    /** Baris terhapus lunak tidak dihitung — ia tidak ikut dikirim ke halaman. */
    public function test_baris_terhapus_lunak_tidak_menambah_berat(): void
    {
        DB::table('tbl_krs_pemda')->insert([
            'VISI' => 'UJI', 'MISI' => 'UJI',
            'deleted_at' => now(),
            'created_at' => now(), 'updated_at' => now(),
        ]);

        // Ambang 1 KB akan terlampaui oleh satu baris HIDUP mana pun. Karena
        // satu-satunya baris di sini sudah terhapus lunak, hasilnya tetap
        // lapang.
        $this->artisan('volume:periksa', ['--ambang-kb' => 1])
            ->expectsOutputToContain('Masih lapang')
            ->assertSuccessful();
    }
}
