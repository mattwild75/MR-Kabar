<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // `tbl_pembangunandaerah` adalah tabel legacy pre-existing di database
        // produksi, tidak dibuat oleh migration manapun di proyek ini — pada
        // database yang di-migrate dari nol (mis. test suite dengan
        // RefreshDatabase) tabel ini tidak ada, jadi migration ini dilewati
        // agar tidak meruntuhkan migrate/test di environment tersebut.
        if (!Schema::hasTable('tbl_pembangunandaerah')) {
            return;
        }

        Schema::table('tbl_pembangunandaerah', function (Blueprint $table) {
            $table->id()->first();
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('tbl_pembangunandaerah')) {
            return;
        }

        Schema::table('tbl_pembangunandaerah', function (Blueprint $table) {
            $table->dropColumn('id');
        });
    }
};
