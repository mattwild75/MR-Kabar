<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

return new class extends Migration
{
    /**
     * Tabel data risiko yang mendapat kolom `delete_batch`: diisi UUID saat
     * SATU operasi hapus-NODE men-soft-delete banyak baris sekaligus, supaya
     * di halaman "Data Terhapus" baris-baris itu bisa dikelompokkan & dipulihkan
     * bersama ("Pulihkan sekelompok"). NULL untuk hapus baris tunggal.
     */
    private const TABLES = [
        'tbl_krs_pemda',
        'tbl_irs_pemda',
        'tbl_krs_pd',
        'tbl_irs_pd',
        'tbl_kro_pd',
        'tbl_iro_pd',
    ];

    public function up(): void
    {
        foreach (self::TABLES as $table) {
            if (Schema::hasTable($table) && !Schema::hasColumn($table, 'delete_batch')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->string('delete_batch', 36)->nullable()->index();
                });
            }
        }
    }

    public function down(): void
    {
        foreach (self::TABLES as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'delete_batch')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->dropColumn('delete_batch');
                });
            }
        }
    }
};
