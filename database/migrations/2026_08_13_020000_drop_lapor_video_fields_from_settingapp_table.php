<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Buang kolom setelan video Lapor Kejadian Risiko.
 *
 * Video itu tidak lagi berdiri sendiri: sejak 13 Agustus 2026 isinya menjadi
 * bab VIII-XIII di dalam video tutorial yang sama. Setelannya di /settingsapp
 * karena itu ikut dibuang — sakelar yang tidak mengendalikan apa pun justru
 * membingungkan, karena admin bisa menekannya dan tidak terjadi apa-apa.
 *
 * Berkas video lamanya sendiri dihapus dari public/video/ pada langkah deploy.
 */
return new class extends Migration
{
    private const KOLOM = [
        'lapor_video_enabled',
        'lapor_video_path',
        'lapor_video_subtitle_path',
        'lapor_video_gain_narration',
        'lapor_video_gain_music',
        'lapor_video_subtitle_enabled',
        'lapor_video_subtitle_size',
    ];

    public function up(): void
    {
        // Disaring dulu terhadap skema yang sungguhan. Pemasangan yang belum
        // pernah menjalankan migrasi 2026_08_02_140000 tidak punya kolom ini
        // sama sekali, dan dropColumn atas kolom yang tidak ada menggagalkan
        // seluruh migrasi.
        $ada = array_values(array_filter(
            self::KOLOM,
            fn (string $k) => Schema::hasColumn('settingapp', $k),
        ));

        if ($ada === []) {
            return;
        }

        Schema::table('settingapp', function (Blueprint $tabel) use ($ada) {
            $tabel->dropColumn($ada);
        });
    }

    public function down(): void
    {
        Schema::table('settingapp', function (Blueprint $tabel) {
            $tabel->boolean('lapor_video_enabled')->default(true);
            $tabel->string('lapor_video_path')->nullable();
            $tabel->string('lapor_video_subtitle_path')->nullable();
            $tabel->unsignedSmallInteger('lapor_video_gain_narration')->default(100);
            $tabel->unsignedSmallInteger('lapor_video_gain_music')->default(100);
            $tabel->boolean('lapor_video_subtitle_enabled')->default(true);
            $tabel->unsignedSmallInteger('lapor_video_subtitle_size')->default(70);
        });
    }
};
