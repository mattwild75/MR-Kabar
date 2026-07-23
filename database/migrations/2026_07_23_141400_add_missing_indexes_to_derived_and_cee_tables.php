<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 3 tabel derivatif (dibangun ulang penuh oleh KrsIrsSyncService/
     * KrsIrsPdSyncService/KroIroPdSyncService lewat TRUNCATE + rebuild) dan
     * cee_jawaban belum punya index pada kolom yg paling sering difilter —
     * TAHUN_DINILAI_RISIKO di ketiga tabel derivatif (dipakai luas di
     * Dashboard/Cetak/visualisasi), dan (opd_id, tahun_penilaian) di
     * cee_jawaban (dipakai CeeController utk hitung progres per-OPD
     * per-tahun). Tanpa index, tiap render full scan.
     */
    // Tipe kolom TAHUN_DINILAI_RISIKO berbeda antar tabel derivatif (warisan
    // riwayat migrasi masing2) — tbl_krs_irs_pemda sudah INT (index biasa
    // cukup), tbl_krs_irs_pd & tbl_kro_iro_pd masih TEXT (butuh key length
    // eksplisit, lihat komentar di up()).
    private const DERIVED_TABLES = ['tbl_krs_irs_pemda', 'tbl_krs_irs_pd', 'tbl_kro_iro_pd'];
    private const TEXT_COLUMN_TABLES = ['tbl_krs_irs_pd', 'tbl_kro_iro_pd'];

    public function up(): void
    {
        foreach (self::DERIVED_TABLES as $table) {
            if (!Schema::hasTable($table) || $this->indexExists($table, "{$table}_tahun_dinilai_risiko_index")) {
                continue;
            }

            if (in_array($table, self::TEXT_COLUMN_TABLES, true)) {
                // Kolom bertipe TEXT (bukan VARCHAR/INT) — MySQL/MariaDB
                // mewajibkan key length eksplisit utk index di kolom
                // TEXT/BLOB, Blueprint tidak punya API utk itu.
                DB::statement("ALTER TABLE `{$table}` ADD INDEX `{$table}_tahun_dinilai_risiko_index` (`TAHUN_DINILAI_RISIKO`(10))");
                continue;
            }

            Schema::table($table, function (Blueprint $t) use ($table) {
                $t->index('TAHUN_DINILAI_RISIKO', "{$table}_tahun_dinilai_risiko_index");
            });
        }

        if (Schema::hasTable('cee_jawaban') && !$this->indexExists('cee_jawaban', 'cee_jawaban_opd_tahun_index')) {
            Schema::table('cee_jawaban', function (Blueprint $t) {
                $t->index(['opd_id', 'tahun_penilaian'], 'cee_jawaban_opd_tahun_index');
            });
        }
    }

    public function down(): void
    {
        foreach (self::DERIVED_TABLES as $table) {
            if (Schema::hasTable($table) && $this->indexExists($table, "{$table}_tahun_dinilai_risiko_index")) {
                Schema::table($table, function (Blueprint $t) use ($table) {
                    $t->dropIndex("{$table}_tahun_dinilai_risiko_index");
                });
            }
        }

        if (Schema::hasTable('cee_jawaban') && $this->indexExists('cee_jawaban', 'cee_jawaban_opd_tahun_index')) {
            Schema::table('cee_jawaban', function (Blueprint $t) {
                $t->dropIndex('cee_jawaban_opd_tahun_index');
            });
        }
    }

    private function indexExists(string $table, string $indexName): bool
    {
        foreach (Schema::getIndexes($table) as $index) {
            if ($index['name'] === $indexName) {
                return true;
            }
        }

        return false;
    }
};
