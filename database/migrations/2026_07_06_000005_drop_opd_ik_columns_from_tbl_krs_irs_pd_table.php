<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Mengikuti penghapusan OPD IK TUJUAN/SASARAN STRATEGIS PD dari
     * tbl_krs_pd — kolom turunannya di tabel derived ini juga dihapus.
     * Kedua kolom berada sebelum URAIAN_RISIKO, jadi tidak mengganggu
     * urutan kolom setelah URAIAN_RISIKO yang dipakai KaeresPdController
     * untuk membangun rantai atribut diagram secara dinamis.
     */
    public function up(): void
    {
        Schema::table('tbl_krs_irs_pd', function (Blueprint $table) {
            $table->dropColumn(['OPD_IK_TUJUAN_STRATEGIS_PD', 'OPD_IK_SASARAN_STRATEGIS_PD']);
        });
    }

    public function down(): void
    {
        Schema::table('tbl_krs_irs_pd', function (Blueprint $table) {
            $table->text('OPD_IK_TUJUAN_STRATEGIS_PD')->nullable();
            $table->text('OPD_IK_SASARAN_STRATEGIS_PD')->nullable();
        });
    }
};
