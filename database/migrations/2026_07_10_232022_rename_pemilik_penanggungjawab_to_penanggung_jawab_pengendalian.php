<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Label lama 'PEMILIK / PENANGGUNGJAWAB' membingungkan krn kata
     * "Pemilik" bikin rancu dgn field 'PEMILIK RISIKO' yg konsepnya
     * berbeda (Perdep Bab II.B.4 — Penanggung Jawab vs Unit Pemilik
     * Risiko/UPR adalah peran terpisah). Field ini sebenarnya utk
     * "Penanggung Jawab Pengendalian" (siapa yg melaksanakan RTP,
     * istilah Perdep Form 6/7: "Penanggung Jawab Pengendalian yang
     * Dibutuhkan") — bukan Pemilik Risiko itu sendiri.
     */
    private const TABLES = ['tbl_irs_pemda', 'tbl_irs_pd', 'tbl_iro_pd'];

    public function up(): void
    {
        foreach (self::TABLES as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'PEMILIK / PENANGGUNGJAWAB')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->renameColumn('PEMILIK / PENANGGUNGJAWAB', 'PENANGGUNG JAWAB PENGENDALIAN');
                });
            }
        }
    }

    public function down(): void
    {
        foreach (self::TABLES as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'PENANGGUNG JAWAB PENGENDALIAN')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->renameColumn('PENANGGUNG JAWAB PENGENDALIAN', 'PEMILIK / PENANGGUNGJAWAB');
                });
            }
        }
    }
};
