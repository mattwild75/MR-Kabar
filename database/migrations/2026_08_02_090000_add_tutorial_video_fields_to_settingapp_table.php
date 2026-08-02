<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Setelan video TUTORIAL PENGISIAN, sejajar dengan setelan video edukasi.
     *
     * Dibuat terpisah, bukan ikut menumpang kolom video edukasi, karena
     * keduanya video yang berbeda dan diatur untuk keperluan yang berbeda:
     * yang satu pengenalan konsep di halaman masuk, yang satu rekaman cara
     * mengisi di kaki halaman Panduan. Admin harus bisa mematikan salah
     * satunya tanpa ikut mematikan yang lain.
     *
     * Tidak ada kolom gain untuk efek suara. Video tutorial hanya punya dua
     * lapisan audio — narasi dan musik — dan menyediakan slider untuk lapisan
     * yang tidak ada hanya akan membingungkan.
     */
    public function up(): void
    {
        Schema::table('settingapp', function (Blueprint $table) {
            $table->boolean('tutorial_video_enabled')->default(true)->after('edu_video_subtitle_size');
            $table->string('tutorial_video_path')->nullable()->after('tutorial_video_enabled');
            $table->string('tutorial_video_subtitle_path')->nullable()->after('tutorial_video_path');
            $table->unsignedSmallInteger('tutorial_video_gain_narration')->default(100)->after('tutorial_video_subtitle_path');
            $table->unsignedSmallInteger('tutorial_video_gain_music')->default(100)->after('tutorial_video_gain_narration');
            $table->boolean('tutorial_video_subtitle_enabled')->default(true)->after('tutorial_video_gain_music');
            $table->unsignedTinyInteger('tutorial_video_subtitle_size')->default(70)->after('tutorial_video_subtitle_enabled');
        });
    }

    public function down(): void
    {
        Schema::table('settingapp', function (Blueprint $table) {
            $table->dropColumn([
                'tutorial_video_enabled',
                'tutorial_video_path',
                'tutorial_video_subtitle_path',
                'tutorial_video_gain_narration',
                'tutorial_video_gain_music',
                'tutorial_video_subtitle_enabled',
                'tutorial_video_subtitle_size',
            ]);
        });
    }
};
