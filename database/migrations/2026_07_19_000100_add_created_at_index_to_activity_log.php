<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Index pada activity_log.created_at — Activity Feed Dashboard memakai
     * latest()->limit(200) (ORDER BY created_at DESC LIMIT 200) yg tanpa
     * index memaksa filesort atas seluruh tabel (tumbuh terus). Index ini
     * jg mendukung pembersihan retensi (activitylog:clean, lihat
     * config/activitylog.php delete_records_older_than_days).
     */
    public function up(): void
    {
        Schema::connection(config('activitylog.database_connection'))
            ->table(config('activitylog.table_name'), function (Blueprint $table) {
                $table->index('created_at', 'activity_log_created_at_index');
            });
    }

    public function down(): void
    {
        Schema::connection(config('activitylog.database_connection'))
            ->table(config('activitylog.table_name'), function (Blueprint $table) {
                $table->dropIndex('activity_log_created_at_index');
            });
    }
};
