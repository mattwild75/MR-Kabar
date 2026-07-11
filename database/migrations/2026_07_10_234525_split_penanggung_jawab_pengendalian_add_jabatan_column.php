<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Perdep Bab II.B.4 & Form 6/7 membedakan 2 hal yg sebelumnya digabung
     * di 1 kolom 'PENANGGUNG JAWAB PENGENDALIAN' (isinya nama OPD, combobox):
     * - Unit/OPD Penanggung Jawab Pengendalian: institusi yg melaksanakan
     *   RTP (kolom LAMA, di-rename, isi/combobox TIDAK berubah).
     * - Penanggung Jawab Pengendalian: JABATAN/pejabat spesifik yg
     *   berkompeten & berwenang membangun kontrol tsb (kolom BARU, teks
     *   bebas — mis. "Kepala Bidang Kesehatan Masyarakat", atau "Kepala
     *   Daerah" utk risiko strategis Pemda sesuai levelnya).
     */
    private const TABLES = ['tbl_irs_pemda', 'tbl_irs_pd', 'tbl_iro_pd'];

    public function up(): void
    {
        foreach (self::TABLES as $table) {
            if (!Schema::hasTable($table)) {
                continue;
            }

            if (Schema::hasColumn($table, 'PENANGGUNG JAWAB PENGENDALIAN') && !Schema::hasColumn($table, 'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->renameColumn('PENANGGUNG JAWAB PENGENDALIAN', 'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN');
                });
            }

            if (!Schema::hasColumn($table, 'PENANGGUNG JAWAB PENGENDALIAN')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->text('PENANGGUNG JAWAB PENGENDALIAN')->nullable()->after('RENCANA TINDAK PENGENDALIAN');
                });
            }
        }
    }

    public function down(): void
    {
        foreach (self::TABLES as $table) {
            if (!Schema::hasTable($table)) {
                continue;
            }

            if (Schema::hasColumn($table, 'PENANGGUNG JAWAB PENGENDALIAN')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->dropColumn('PENANGGUNG JAWAB PENGENDALIAN');
                });
            }

            if (Schema::hasColumn($table, 'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->renameColumn('UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN', 'PENANGGUNG JAWAB PENGENDALIAN');
                });
            }
        }
    }
};
