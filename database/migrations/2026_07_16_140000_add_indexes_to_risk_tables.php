<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

/**
 * Index komposit (TAHUN DINILAI RISIKO, deleted_at) pada tabel risiko
 * teregister (IRS_Pemda/IRS_PD/IRO_PD) — kedua kolom ini SELALU difilter
 * bersamaan di CetakRisikoController/IrsPemdaController/IrsPdController/
 * IroPdController (where TAHUN DINILAI RISIKO = ? + implicit soft-delete
 * scope deleted_at IS NULL), tapi sebelumnya tanpa index sama sekali —
 * jadi full table scan tiap query filter tahun. Tidak berdampak terlihat
 * saat data masih sedikit (beberapa OPD, beberapa tahun), tapi jadi
 * masalah nyata begitu data terkumpul lintas-tahun & lintas-OPD.
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
            if (!Schema::hasTable($table)) {
                continue;
            }

            Schema::table($table, function (Blueprint $t) use ($table) {
                $indexName = "{$table}_tahun_deleted_at_index";
                if (!$this->indexExists($table, $indexName)) {
                    $t->index(['TAHUN DINILAI RISIKO', 'deleted_at'], $indexName);
                }
            });
        }
    }

    public function down(): void
    {
        foreach (self::TABLES as $table) {
            if (!Schema::hasTable($table)) {
                continue;
            }

            Schema::table($table, function (Blueprint $t) use ($table) {
                $indexName = "{$table}_tahun_deleted_at_index";
                if ($this->indexExists($table, $indexName)) {
                    $t->dropIndex($indexName);
                }
            });
        }
    }

    private function indexExists(string $table, string $indexName): bool
    {
        $indexes = Schema::getIndexes($table);

        foreach ($indexes as $index) {
            if ($index['name'] === $indexName) {
                return true;
            }
        }

        return false;
    }
};
