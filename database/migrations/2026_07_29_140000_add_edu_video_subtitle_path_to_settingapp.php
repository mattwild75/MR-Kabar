<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Berkas subtitle yang diunggah admin.
 *
 * Sebelumnya subtitle hanya ada untuk video bawaan. Begitu admin memasang
 * videonya sendiri, video itu tampil tanpa subtitle sama sekali dan tidak ada
 * cara menambahkannya. Kolom ini menyimpan jalur berkas .vtt hasil unggahan
 * (berkas .srt dikonversi lebih dulu saat disimpan).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settingapp', function (Blueprint $table) {
            $table->string('edu_video_subtitle_path')->nullable()->after('edu_video_path');
        });
    }

    public function down(): void
    {
        Schema::table('settingapp', function (Blueprint $table) {
            $table->dropColumn('edu_video_subtitle_path');
        });
    }
};
