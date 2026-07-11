<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Label singkat per level dampak (mis. "Tidak Signifikan", "Minor", dst) —
 * dipakai header kolom di dialog Kriteria Dampak & Matriks Analisis Risiko.
 * Sebelumnya cuma ada di frontend const MATRIKS_RISIKO.dampakLabels, kini
 * jadi kolom yang bisa diedit sejajar dgn kolom kriteria lain.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('risk_impact_criteria', function (Blueprint $table) {
            $table->string('label')->nullable()->after('level');
        });
    }

    public function down(): void
    {
        Schema::table('risk_impact_criteria', function (Blueprint $table) {
            $table->dropColumn('label');
        });
    }
};
