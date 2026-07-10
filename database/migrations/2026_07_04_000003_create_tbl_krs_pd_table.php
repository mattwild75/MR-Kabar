<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Risiko Strategis Perangkat Daerah (PD) — turunan dari Risiko Strategis
     * Pemda. Kolom SASARAN RPJMD di sini bukan input bebas, melainkan
     * rujukan ke nilai SASARAN RPJMD yang sudah ada di tbl_pembangunandaerah
     * (I_a_KRS_Pemda) — dipilih lewat dropdown pada form, disimpan sebagai
     * teks (bukan foreign key) karena tbl_pembangunandaerah men-dedup
     * Sasaran berdasarkan teks, bukan id per Sasaran.
     *
     * Struktur mengikuti sheet II_a_KRS_PD pada file Excel VBA sumber:
     * dasarnya adalah dokumen Renstra OPD (bukan RPJMD pemda), dan punya
     * dua level TAMBAHAN dibanding KRS_Pemda — Kegiatan PD dan SubKegiatan
     * PD — karena Renstra OPD lebih rinci daripada RPJMD.
     */
    public function up(): void
    {
        Schema::create('tbl_krs_pd', function (Blueprint $table) {
            $table->id();
            $table->text('SASARAN RPJMD')->nullable();
            $table->text('TUJUAN STRATEGIS PD')->nullable();
            $table->text('IK TUJUAN STRATEGIS PD')->nullable();
            $table->text('BASELINE IK TUJUAN STRATEGIS PD')->nullable();
            $table->text('TARGET IK TUJUAN STRATEGIS PD')->nullable();
            $table->text('SATUAN IK TUJUAN STRATEGIS PD')->nullable();
            $table->text('OPD IK TUJUAN STRATEGIS PD')->nullable();
            $table->text('SASARAN STRATEGIS PD')->nullable();
            $table->text('IK SASARAN STRATEGIS PD')->nullable();
            $table->text('BASELINE IK SASARAN STRATEGIS PD')->nullable();
            $table->text('TARGET IK SASARAN STRATEGIS PD')->nullable();
            $table->text('SATUAN IK SASARAN STRATEGIS PD')->nullable();
            $table->text('OPD IK SASARAN STRATEGIS PD')->nullable();
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
        Schema::dropIfExists('tbl_krs_pd');
    }
};
