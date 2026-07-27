<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Kolom pengaturan Splash Screen setelah login (video logo yang tampil
 * sesaat setelah user berhasil login, lihat resources/js/components/
 * login-splash.tsx) — SEBELUMNYA hardcode path /media/logo-animation.mp4
 * & selalu aktif tanpa cara mematikan/menggantinya lewat UI. Diberi kolom
 * terpisah (bukan pakai `logo`) krn ini video (mp4), bukan gambar statis,
 * dan perlu toggle aktif/nonaktif independen dari logo utama aplikasi.
 *
 * login_splash_enabled default TRUE supaya video contoh yang sudah ada
 * (public/media/logo-animation.mp4) tetap tampil apa adanya utk instalasi
 * yang sudah berjalan sebelum migrasi ini — bukan tiba-tiba mati krn
 * upgrade skema.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settingapp', function (Blueprint $table) {
            $table->boolean('login_splash_enabled')->default(true)->after('favicon');
            $table->string('login_splash_video')->nullable()->after('login_splash_enabled');
            $table->boolean('login_splash_muted')->default(true)->after('login_splash_video');
        });
    }

    public function down(): void
    {
        Schema::table('settingapp', function (Blueprint $table) {
            $table->dropColumn(['login_splash_enabled', 'login_splash_video', 'login_splash_muted']);
        });
    }
};
