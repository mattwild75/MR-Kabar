<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Status penugasan mengikuti warna rekap Analisis dan Evaluasi: merah =
 * baru ST/sedang bertugas (st_terbit), kuning = sudah minta nomor laporan
 * (nomor_diminta), hijau = laporan terbit dan masuk aneva (lhp_terbit).
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE rpp_penugasan MODIFY status ENUM('draft','st_terbit','nomor_diminta','selesai','lhp_terbit','batal') NOT NULL DEFAULT 'draft'");
    }

    public function down(): void
    {
        DB::statement("UPDATE rpp_penugasan SET status = 'st_terbit' WHERE status = 'nomor_diminta'");
        DB::statement("ALTER TABLE rpp_penugasan MODIFY status ENUM('draft','st_terbit','selesai','lhp_terbit','batal') NOT NULL DEFAULT 'draft'");
    }
};
