<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Setelan video TUTORIAL LAPOR KEJADIAN RISIKO, sejajar dengan dua video
     * sebelumnya.
     *
     * Dibuat terpisah lagi, bukan menumpang kolom video tutorial pengisian,
     * dengan alasan yang sama: ketiganya video berbeda untuk keperluan
     * berbeda, dan admin harus bisa mematikan satu tanpa ikut mematikan yang
     * lain. Video ini menyasar penonton yang paling berbeda — pegawai yang
     * tidak punya akun aplikasi sama sekali.
     *
     * Tidak ada kolom gain efek suara. Sama seperti video tutorial pengisian,
     * video ini hanya punya dua lapisan audio: narasi dan musik.
     */
    public function up(): void
    {
        Schema::table('settingapp', function (Blueprint $table) {
            $table->boolean('lapor_video_enabled')->default(true)->after('tutorial_video_subtitle_size');
            $table->string('lapor_video_path')->nullable()->after('lapor_video_enabled');
            $table->string('lapor_video_subtitle_path')->nullable()->after('lapor_video_path');
            $table->unsignedSmallInteger('lapor_video_gain_narration')->default(100)->after('lapor_video_subtitle_path');
            $table->unsignedSmallInteger('lapor_video_gain_music')->default(100)->after('lapor_video_gain_narration');
            $table->boolean('lapor_video_subtitle_enabled')->default(true)->after('lapor_video_gain_music');
            $table->unsignedTinyInteger('lapor_video_subtitle_size')->default(70)->after('lapor_video_subtitle_enabled');
        });
    }

    public function down(): void
    {
        Schema::table('settingapp', function (Blueprint $table) {
            $table->dropColumn([
                'lapor_video_enabled',
                'lapor_video_path',
                'lapor_video_subtitle_path',
                'lapor_video_gain_narration',
                'lapor_video_gain_music',
                'lapor_video_subtitle_enabled',
                'lapor_video_subtitle_size',
            ]);
        });
    }
};
