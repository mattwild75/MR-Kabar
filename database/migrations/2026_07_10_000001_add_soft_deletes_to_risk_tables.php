<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

return new class extends Migration
{
    /**
     * Tabel data risiko yang mendapat SoftDeletes — hapus jadi menandai
     * deleted_at (bukan hilang permanen), agar salah-hapus bisa dipulihkan dari
     * menu "Data Terhapus". tbl_krs_pemda (1a) ikut walau lintas-OPD.
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
            if (Schema::hasTable($table) && !Schema::hasColumn($table, 'deleted_at')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->softDeletes();
                });
            }
        }
    }

    public function down(): void
    {
        foreach (self::TABLES as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'deleted_at')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->dropSoftDeletes();
                });
            }
        }
    }
};
