<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * laporan_kejadian_risiko tumbuh tanpa batas natural (laporan warga via QR
 * publik, tidak dibatasi per-OPD-per-tahun spt tabel risiko) — index ini
 * menopang LaporanKejadianController::index() yg reguler memfilter
 * where('opd_id', ...) (scoping non-admin) dan where('status', ...) (filter
 * dropdown), dipaginasi + di-latest().
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('laporan_kejadian_risiko', function (Blueprint $table) {
            $table->index(['opd_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('laporan_kejadian_risiko', function (Blueprint $table) {
            $table->dropIndex(['opd_id', 'status']);
        });
    }
};
