<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Melengkapi index 'created_at' tunggal (migrasi 2026_07_19_000100) — jalur
 * Activity Feed Dashboard utk PIC non-admin (DashboardController::
 * buildActivityFeed()) memfilter whereIn('causer_id', ...)->where(
 * 'causer_type', ...) SEBELUM latest()->limit(200). Dengan index tunggal
 * created_at saja, MySQL/MariaDB harus scan berdasar urutan created_at lalu
 * filter causer_id/causer_type belakangan — utk OPD yg jarang beraktivitas
 * dibanding OPD lain, scan bisa jauh melampaui 200 baris pertama sebelum
 * cukup 200 baris yg cocok causer-nya ditemukan. Index komposit ini
 * mendukung filter+urutan sekaligus utk jalur non-admin (ditemukan lewat
 * audit performa 2026-07-26).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::connection(config('activitylog.database_connection'))
            ->table(config('activitylog.table_name'), function (Blueprint $table) {
                $table->index(['causer_type', 'causer_id', 'created_at'], 'activity_log_causer_created_at_index');
            });
    }

    public function down(): void
    {
        Schema::connection(config('activitylog.database_connection'))
            ->table(config('activitylog.table_name'), function (Blueprint $table) {
                $table->dropIndex('activity_log_causer_created_at_index');
            });
    }
};
