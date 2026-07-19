<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Index komposit (user_id, "TAHUN DINILAI RISIKO") pada 3 tabel risiko
     * yg dibatasi kepemilikan per-PIC (IRS_Pemda, IRS_PD, IRO_PD) — hampir
     * semua query scoping di app menyaring persis kombinasi kedua kolom ini
     * (whereHas('user', opd_id) + where('TAHUN DINILAI RISIKO')), mis. di
     * Dashboard/CetakController/MonitoringEvaluasi. Tanpa index komposit,
     * tiap query melakukan full scan lalu filter. Nama kolom memakai
     * spasi/kapital, Schema builder meng-quote otomatis.
     */
    private const TABLES = ['tbl_irs_pemda', 'tbl_irs_pd', 'tbl_iro_pd'];

    public function up(): void
    {
        foreach (self::TABLES as $table) {
            Schema::table($table, function (Blueprint $t) use ($table) {
                $t->index(['user_id', 'TAHUN DINILAI RISIKO'], "{$table}_user_tahun_index");
            });
        }
    }

    public function down(): void
    {
        foreach (self::TABLES as $table) {
            Schema::table($table, function (Blueprint $t) use ($table) {
                $t->dropIndex("{$table}_user_tahun_index");
            });
        }
    }
};
