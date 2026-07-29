<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Video edukasi jadi DUA pilihan:
     *   Video 1 = versi ringkas (6.5 menit) yang sudah ada
     *   Video 2 = versi lengkap (17 menit) sesuai 5 tahap Perdep
     * `edu_video_active` menentukan mana yang diputar di halaman login.
     *
     * Tiga kolom gain menyimpan balance mix (narasi / musik / SFX). Video 2
     * dikirim ke pemutar sebagai tiga stem audio terpisah, jadi geseran
     * slider di /settingsapp langsung terdengar tanpa render ulang.
     */
    public function up(): void
    {
        Schema::table('settingapp', function (Blueprint $table) {
            $table->string('edu_video_2_path')->nullable()->after('edu_video_path');
            $table->unsignedTinyInteger('edu_video_active')->default(2)->after('edu_video_2_path');
            $table->unsignedTinyInteger('edu_video_gain_narration')->default(100)->after('edu_video_active');
            $table->unsignedTinyInteger('edu_video_gain_music')->default(100)->after('edu_video_gain_narration');
            $table->unsignedTinyInteger('edu_video_gain_sfx')->default(100)->after('edu_video_gain_music');
        });
    }

    public function down(): void
    {
        Schema::table('settingapp', function (Blueprint $table) {
            $table->dropColumn([
                'edu_video_2_path',
                'edu_video_active',
                'edu_video_gain_narration',
                'edu_video_gain_music',
                'edu_video_gain_sfx',
            ]);
        });
    }
};
