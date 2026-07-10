<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('tbl_krs_irs_pemda')) {
            return;
        }

        // Ditempatkan tepat sebelum PROGRAM_PRIORITAS (bukan di antara kolom
        // risiko) supaya urutan kolom RISIKO di KaeresController::
        // visualizationEmbed() — yang mengambil "semua kolom setelah
        // URAIAN_RISIKO" sebagai rantai atribut diagram — tidak bergeser.
        if (!Schema::hasColumn('tbl_krs_irs_pemda', 'OPD_IK_TUJUAN_RPJMD')) {
            DB::statement('ALTER TABLE tbl_krs_irs_pemda ADD COLUMN OPD_IK_TUJUAN_RPJMD TEXT NULL AFTER TARGET_IK_TUJUAN_RPJMD');
        }

        if (!Schema::hasColumn('tbl_krs_irs_pemda', 'OPD_IK_SASARAN_RPJMD')) {
            DB::statement('ALTER TABLE tbl_krs_irs_pemda ADD COLUMN OPD_IK_SASARAN_RPJMD TEXT NULL AFTER TARGET_IK_SASARAN_RPJMD');
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('tbl_krs_irs_pemda')) {
            return;
        }

        foreach (['OPD_IK_TUJUAN_RPJMD', 'OPD_IK_SASARAN_RPJMD'] as $col) {
            if (Schema::hasColumn('tbl_krs_irs_pemda', $col)) {
                DB::statement("ALTER TABLE tbl_krs_irs_pemda DROP COLUMN {$col}");
            }
        }
    }
};
