<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabel referensi kode baku Database LHP (klasifikasi standar BPKP, dipindah
 * dari tabel T_Kode_* SimHPPemda). Master data — dipakai untuk dropdown
 * berjenjang (group → kode rinci) beserta keterangannya pada formulir dan
 * halaman baca. jenis: group_jenis|jenis|group_temuan|temuan|group_sebab|
 * sebab|group_rekomendasi|rekomendasi|group_tl|tl.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lhp_ref_kode', function (Blueprint $table) {
            $table->id();
            $table->string('jenis', 24);
            $table->string('kode', 6);
            $table->string('kode_group', 4)->nullable();
            $table->string('nama', 400);
            $table->index(['jenis', 'kode_group']);
            $table->index(['jenis', 'kode']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lhp_ref_kode');
    }
};
