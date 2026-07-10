<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * "RSS" (salah singkatan) -> "RSP" (Risiko Strategis Pemda), konsisten
     * dengan RSO (Risiko Strategis OPD) & ROO (Risiko Operasional OPD). Pakai
     * SQL native (bukan Schema::renameColumn) supaya tidak bergantung doctrine/dbal.
     */
    public function up(): void
    {
        if (Schema::hasColumn('data_umum', 'dokumen_sumber_rss') && !Schema::hasColumn('data_umum', 'dokumen_sumber_rsp')) {
            DB::statement('ALTER TABLE data_umum CHANGE dokumen_sumber_rss dokumen_sumber_rsp VARCHAR(255) NULL');
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('data_umum', 'dokumen_sumber_rsp') && !Schema::hasColumn('data_umum', 'dokumen_sumber_rss')) {
            DB::statement('ALTER TABLE data_umum CHANGE dokumen_sumber_rsp dokumen_sumber_rss VARCHAR(255) NULL');
        }
    }
};
