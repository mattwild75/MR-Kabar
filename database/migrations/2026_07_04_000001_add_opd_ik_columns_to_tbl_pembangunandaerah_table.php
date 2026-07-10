<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('tbl_pembangunandaerah')) {
            return;
        }

        // Perangkat Daerah (OPD) di tabel sumber PDF ternyata melekat pada
        // TIAP indikator (Tujuan, Sasaran, Program) — bukan cuma pada baris
        // Program seperti asumsi sebelumnya (OPD_PENANGGUNGJAWAB_PROGRAM,
        // yang tetap dipertahankan sebagai OPD pelaksana Program). Kolom
        // baru ini menampung OPD-nya indikator itu sendiri, satu baris per
        // indikator, sejajar dengan baris IK/Baseline/Target/Satuan di
        // level yang sama.
        if (!Schema::hasColumn('tbl_pembangunandaerah', 'OPD IK TUJUAN RPJMD')) {
            DB::statement('ALTER TABLE tbl_pembangunandaerah ADD COLUMN `OPD IK TUJUAN RPJMD` TEXT NULL AFTER `SATUAN IK TUJUAN RPJMD`');
        }

        if (!Schema::hasColumn('tbl_pembangunandaerah', 'OPD IK SASARAN RPJMD')) {
            DB::statement('ALTER TABLE tbl_pembangunandaerah ADD COLUMN `OPD IK SASARAN RPJMD` TEXT NULL AFTER `SATUAN IK SASARAN RPJMD`');
        }

        if (!Schema::hasColumn('tbl_pembangunandaerah', 'OPD IK PROGRAM')) {
            DB::statement('ALTER TABLE tbl_pembangunandaerah ADD COLUMN `OPD IK PROGRAM` TEXT NULL AFTER `SATUAN IK PROGRAM`');
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('tbl_pembangunandaerah')) {
            return;
        }

        foreach (['OPD IK TUJUAN RPJMD', 'OPD IK SASARAN RPJMD', 'OPD IK PROGRAM'] as $col) {
            if (Schema::hasColumn('tbl_pembangunandaerah', $col)) {
                DB::statement("ALTER TABLE tbl_pembangunandaerah DROP COLUMN `{$col}`");
            }
        }
    }
};
