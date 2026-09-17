<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Susunan tim pemeriksa per LHP (ERPIKA > Database LHP). Padanan T_Pemeriksa
 * SimHP: nomor urut, NIP, nama, dan jabatan dalam pemeriksaan (Penanggung
 * Jawab, Wakil PJ, Pengendali Teknis, Ketua Tim, Anggota Tim). Berdiri
 * sendiri — tanpa FK ke tabel domain MR Kabar; nama disalin (bukan dirujuk)
 * agar modul mudah dicabut ke aplikasi ERPIKA terpisah.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lhp_tim', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lhp_id')->constrained('lhp')->cascadeOnDelete();
            $table->unsignedInteger('no');
            $table->string('nip', 30)->nullable();
            $table->string('nama', 120);
            $table->string('jabatan', 200)->nullable();
            $table->timestamps();
            $table->index(['lhp_id', 'no']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lhp_tim');
    }
};
