<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * OPD IK TUJUAN/SASARAN STRATEGIS PD dihapus dari tbl_krs_pd — berbeda
     * dari KRS_Pemda (RPJMD, lintas-OPD sehingga tiap indikator bisa dipegang
     * OPD berbeda), Renstra PD (KRS_PD) memang milik satu OPD saja, sudah
     * direpresentasikan oleh OPD PENANGGUNG JAWAB KEGIATAN di akhir form.
     */
    public function up(): void
    {
        Schema::table('tbl_krs_pd', function (Blueprint $table) {
            $table->dropColumn(['OPD IK TUJUAN STRATEGIS PD', 'OPD IK SASARAN STRATEGIS PD']);
        });
    }

    public function down(): void
    {
        Schema::table('tbl_krs_pd', function (Blueprint $table) {
            $table->text('OPD IK TUJUAN STRATEGIS PD')->nullable();
            $table->text('OPD IK SASARAN STRATEGIS PD')->nullable();
        });
    }
};
