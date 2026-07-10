<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menyeragamkan penamaan tabel Risiko Strategis Pemda (1a) mengikuti pola
     * tabel lain (tbl_krs_pd, tbl_kro_pd): tbl_pembangunandaerah -> tbl_krs_pemda.
     * Hanya RENAME (data 261 baris tetap utuh), idempotent — aman dijalankan
     * ulang / pada database yang sudah memakai nama baru.
     */
    public function up(): void
    {
        if (Schema::hasTable('tbl_pembangunandaerah') && !Schema::hasTable('tbl_krs_pemda')) {
            Schema::rename('tbl_pembangunandaerah', 'tbl_krs_pemda');
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('tbl_krs_pemda') && !Schema::hasTable('tbl_pembangunandaerah')) {
            Schema::rename('tbl_krs_pemda', 'tbl_pembangunandaerah');
        }
    }
};
