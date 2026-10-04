<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Dua tambahan pada App Settings (4 Oktober 2026).
     *
     * 1. Volume efek suara splash. Splash bawaan kini membawa efek suara yang
     *    disusun mengikuti koreografinya (public/media/splash/bunyi.mp3, dari
     *    scripts/splash/bunyi.py), menggantikan nada sintetis sederhana yang
     *    dulu disarankan tetap dibisukan. Karena bunyinya memang dibuat untuk
     *    didengar, splash yang ada dibunyikan sekali saat kolom ini dipasang;
     *    Admin tetap bisa membisukannya lagi dari /settingsapp.
     *
     * 2. Setelan video edukasi Lapor Dugaan Kecurangan, sejajar dengan video
     *    edukasi dan video tutorial: aktif/nonaktif, berkas pengganti,
     *    subtitle, dan mix narasi/musik/efek suara. Sebelumnya video ini tidak
     *    punya setelan sendiri dan menumpang setelan subtitle video edukasi,
     *    sehingga mengubah yang satu diam-diam ikut mengubah yang lain. Nilai
     *    subtitle awalnya disalin dari video edukasi supaya tampilannya tidak
     *    berubah sedikit pun saat migrasi ini berjalan.
     */
    public function up(): void
    {
        Schema::table('settingapp', function (Blueprint $table) {
            $table->unsignedTinyInteger('login_splash_volume')->default(80)->after('login_splash_muted');

            $table->boolean('kecurangan_video_enabled')->default(true)->after('tutorial_video_subtitle_size');
            $table->string('kecurangan_video_path')->nullable()->after('kecurangan_video_enabled');
            $table->string('kecurangan_video_subtitle_path')->nullable()->after('kecurangan_video_path');
            $table->unsignedSmallInteger('kecurangan_video_gain_narration')->default(100)->after('kecurangan_video_subtitle_path');
            $table->unsignedSmallInteger('kecurangan_video_gain_music')->default(100)->after('kecurangan_video_gain_narration');
            $table->unsignedSmallInteger('kecurangan_video_gain_sfx')->default(100)->after('kecurangan_video_gain_music');
            $table->boolean('kecurangan_video_subtitle_enabled')->default(true)->after('kecurangan_video_gain_sfx');
            $table->unsignedTinyInteger('kecurangan_video_subtitle_size')->default(70)->after('kecurangan_video_subtitle_enabled');
        });

        DB::table('settingapp')->update([
            'login_splash_muted' => false,
            'kecurangan_video_subtitle_enabled' => DB::raw('edu_video_subtitle_enabled'),
            'kecurangan_video_subtitle_size' => DB::raw('edu_video_subtitle_size'),
        ]);
    }

    public function down(): void
    {
        Schema::table('settingapp', function (Blueprint $table) {
            $table->dropColumn([
                'login_splash_volume',
                'kecurangan_video_enabled',
                'kecurangan_video_path',
                'kecurangan_video_subtitle_path',
                'kecurangan_video_gain_narration',
                'kecurangan_video_gain_music',
                'kecurangan_video_gain_sfx',
                'kecurangan_video_subtitle_enabled',
                'kecurangan_video_subtitle_size',
            ]);
        });
    }
};
