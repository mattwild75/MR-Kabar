<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Kewajiban dua faktor DIMATIKAN secara baku di lingkungan uji.
        //
        // Tanpa ini, 61 uji yang tidak ada hubungannya dengan 2FA langsung
        // gagal: semuanya berperan sebagai admin atau super-admin, dan
        // middleware WajibDuaFaktor memantulkan mereka ke halaman pemasangan
        // sebelum sempat menyentuh apa yang sedang diuji. Yang gagal bukan
        // fiturnya, melainkan pemeragaan loginnya.
        //
        // Kewajibannya sendiri TETAP DIUJI — DuaFaktorTest menyalakannya
        // kembali secara eksplisit lewat config() dan memeriksa pantulannya.
        // Sengaja dimatikan di sini, bukan lewat variabel lingkungan: kalau
        // daftarnya dapat ditentukan dari .env, satu salah ketik di server
        // sungguhan akan mematikan lapisan kedua tanpa suara.
        config(['mrkabar.dua_faktor.peran_wajib' => []]);
    }
}
