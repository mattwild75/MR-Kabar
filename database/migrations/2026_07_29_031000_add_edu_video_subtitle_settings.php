<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Setelan subtitle video edukasi.
     *
     * Bisa diatur karena subtitle video bawaan TIDAK lagi dibakar ke gambar —
     * ia dikirim sebagai track .vtt terpisah, sehingga dapat dimatikan dan
     * diubah ukurannya dari sisi pemutar tanpa me-render ulang videonya.
     *
     * `edu_video_subtitle_size` dalam persen (50–200); 100 = ukuran bawaan
     * peramban yang, pada layar besar, memang terasa terlalu besar.
     */
    public function up(): void
    {
        Schema::table('settingapp', function (Blueprint $table) {
            $table->boolean('edu_video_subtitle_enabled')->default(true)->after('edu_video_gain_sfx');
            $table->unsignedTinyInteger('edu_video_subtitle_size')->default(70)->after('edu_video_subtitle_enabled');
        });
    }

    public function down(): void
    {
        Schema::table('settingapp', function (Blueprint $table) {
            $table->dropColumn(['edu_video_subtitle_enabled', 'edu_video_subtitle_size']);
        });
    }
};
