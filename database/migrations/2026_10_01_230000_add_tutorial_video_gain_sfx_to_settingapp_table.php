<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Video tutorial v2 (1 Oktober 2026) punya jalur efek suara: klik tetikus,
     * ketukan papan ketik, desir gulir, dan bunyi "tersimpan" yang dibangun
     * dari peristiwa rekaman. Kolom ini menyejajarkan setelannya dengan video
     * edukasi, supaya admin bisa mengecilkan atau mematikan bunyi itu tanpa
     * menyentuh narasi dan musik.
     */
    public function up(): void
    {
        Schema::table('settingapp', function (Blueprint $table) {
            $table->unsignedSmallInteger('tutorial_video_gain_sfx')->default(100)->after('tutorial_video_gain_music');
        });
    }

    public function down(): void
    {
        Schema::table('settingapp', function (Blueprint $table) {
            $table->dropColumn('tutorial_video_gain_sfx');
        });
    }
};
