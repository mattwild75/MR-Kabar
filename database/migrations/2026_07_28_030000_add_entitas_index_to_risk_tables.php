<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Index pada kolom "ENTITAS PD YANG MENILAI" di 3 tabel risiko utama
 * (tbl_irs_pemda/tbl_irs_pd/tbl_iro_pd) — dipakai GROUP BY di
 * HasOpdFillStatus::opdFillStatusByColumn() (dipanggil tiap kali Admin
 * membuka Form Input IRS Pemda/IRS PD/IRO PD, lihat panel "Lihat status
 * pengisian seluruh OPD") tanpa index sebelumnya (temuan audit performa —
 * full scan+filesort tiap render utk Admin).
 *
 * Kolom ini bertipe TEXT (bukan VARCHAR) di ketiga tabel — MySQL/MariaDB
 * mewajibkan key length eksplisit utk index pada kolom TEXT/BLOB, Blueprint
 * tidak punya API native utk itu, jadi pakai DB::statement mentah, sama
 * pola dgn migrasi add_missing_indexes_to_derived_and_cee_tables.
 */
return new class extends Migration
{
    private const TABLES = [
        'tbl_irs_pemda',
        'tbl_irs_pd',
        'tbl_iro_pd',
    ];

    public function up(): void
    {
        foreach (self::TABLES as $table) {
            if (! Schema::hasTable($table)) {
                continue;
            }

            $indexName = "{$table}_entitas_penilai_index";
            if ($this->indexExists($table, $indexName)) {
                continue;
            }

            DB::statement("ALTER TABLE `{$table}` ADD INDEX `{$indexName}` (`ENTITAS PD YANG MENILAI`(100))");
        }
    }

    public function down(): void
    {
        foreach (self::TABLES as $table) {
            if (! Schema::hasTable($table)) {
                continue;
            }

            $indexName = "{$table}_entitas_penilai_index";
            if ($this->indexExists($table, $indexName)) {
                DB::statement("ALTER TABLE `{$table}` DROP INDEX `{$indexName}`");
            }
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
