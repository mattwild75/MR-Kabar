<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * PEMILIK_PENANGGUNGJAWAB di 3 tabel derived hanya menyimpan nama
     * Unit/OPD (utk visualisasi hirarki). Kolom baru ini menampung jabatan
     * pejabat spesifik (Perdep Form 6/7), disinkronkan dari kolom
     * 'PENANGGUNG JAWAB PENGENDALIAN' di tbl_irs_pemda/tbl_irs_pd/tbl_iro_pd.
     */
    private const TABLES = ['tbl_krs_irs_pemda', 'tbl_krs_irs_pd', 'tbl_kro_iro_pd'];

    public function up(): void
    {
        foreach (self::TABLES as $table) {
            if (!Schema::hasTable($table)) {
                continue;
            }

            if (!Schema::hasColumn($table, 'PENANGGUNG_JAWAB_PENGENDALIAN_JABATAN')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->text('PENANGGUNG_JAWAB_PENGENDALIAN_JABATAN')->nullable()->after('PEMILIK_PENANGGUNGJAWAB');
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

            if (Schema::hasColumn($table, 'PENANGGUNG_JAWAB_PENGENDALIAN_JABATAN')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->dropColumn('PENANGGUNG_JAWAB_PENGENDALIAN_JABATAN');
                });
            }
        }
    }
};
