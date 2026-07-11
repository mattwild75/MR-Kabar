<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Kolom baru 'KATEGORI EXISTING CONTROL' (Efektif/Kurang Efektif/Tidak
     * Efektif — E/KE/TE) di 3 tabel yg punya field "URAIAN PENGENDALIAN
     * YANG SUDAH ADA" & "CELAH PENGENDALIAN": IRS Pemda, IRS PD, IRO PD.
     * Pola sama seperti 'C / UC' — CategorizedTextarea (kategori + uraian
     * bebas digabung 1 kolom). Sebagai PENANDA/INFO saja, TIDAK mengubah
     * cara skoring SKALA DAMPAK/KEMUNGKINAN/RISIKO yg sudah berjalan.
     */
    private const TABLES = ['tbl_irs_pemda', 'tbl_irs_pd', 'tbl_iro_pd'];

    public function up(): void
    {
        foreach (self::TABLES as $table) {
            if (Schema::hasTable($table) && !Schema::hasColumn($table, 'KATEGORI EXISTING CONTROL')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->text('KATEGORI EXISTING CONTROL')->nullable()->after('URAIAN PENGENDALIAN YANG SUDAH ADA');
                });
            }
        }
    }

    public function down(): void
    {
        foreach (self::TABLES as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'KATEGORI EXISTING CONTROL')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->dropColumn('KATEGORI EXISTING CONTROL');
                });
            }
        }
    }
};
