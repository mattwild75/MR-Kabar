<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Risiko Operasional Perangkat Daerah (Level III) — dasar dokumennya
     * adalah Renja/RKA Perangkat Daerah (bukan Renstra), tapi tetap
     * berakar ke Sasaran Renstra yang sudah ada di tbl_krs_pd (II_a_KRS_PD)
     * lewat kolom SASARAN RENSTRA (rujukan, dipilih lewat dropdown, bukan
     * foreign key — sama pola SASARAN RPJMD di tbl_krs_pd).
     *
     * Struktur mengikuti sheet III_a_KRO_PD pada file Excel VBA sumber:
     * Sasaran Renstra (rujukan) -> Program PD -> Kegiatan PD -> SubKegiatan
     * PD — satu level lebih sedikit dari tbl_krs_pd karena tidak
     * me-re-derive Tujuan Strategis PD / Sasaran Strategis PD (sudah
     * cukup dirujuk lewat Sasaran Renstra).
     */
    public function up(): void
    {
        Schema::create('tbl_kro_pd', function (Blueprint $table) {
            $table->id();
            $table->text('SASARAN RENSTRA')->nullable();
            $table->text('PROGRAM PD')->nullable();
            $table->text('IK PROGRAM PD')->nullable();
            $table->text('BASELINE IK PROGRAM PD')->nullable();
            $table->text('TARGET IK PROGRAM PD')->nullable();
            $table->text('SATUAN IK PROGRAM PD')->nullable();
            $table->text('KEGIATAN PD')->nullable();
            $table->text('IK KEGIATAN PD')->nullable();
            $table->text('BASELINE IK KEGIATAN PD')->nullable();
            $table->text('TARGET IK KEGIATAN PD')->nullable();
            $table->text('SATUAN IK KEGIATAN PD')->nullable();
            $table->text('SUBKEGIATAN PD')->nullable();
            $table->text('IK SUBKEGIATAN PD')->nullable();
            $table->text('BASELINE IK SUBKEGIATAN PD')->nullable();
            $table->text('TARGET IK SUBKEGIATAN PD')->nullable();
            $table->text('SATUAN IK SUBKEGIATAN PD')->nullable();
            $table->text('OPD PENANGGUNG JAWAB KEGIATAN')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_kro_pd');
    }
};
