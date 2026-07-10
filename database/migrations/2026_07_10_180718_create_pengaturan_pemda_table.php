<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Singleton (satu baris) berisi nilai default Pemda-wide utk Data Umum
        // — dipakai fallback saat field milik PIC kosong. Hanya Admin/Super
        // Admin yang boleh mengubahnya (lihat PengaturanPemdaController).
        Schema::create('pengaturan_pemda', function (Blueprint $table) {
            $table->id();
            $table->string('pemerintah_kabkota')->nullable()->default('Pemerintah Kabupaten Aceh Barat');
            $table->string('periode_penilaian')->nullable()->default('2025-2029');
            $table->string('tahun_penilaian')->nullable()->default('2026');
            $table->string('nama_kepala_daerah')->nullable()->default('Tarmizi, S.P., M.M.');
            $table->string('jabatan_kepala_daerah')->nullable()->default('Bupati Aceh Barat');
            $table->string('dokumen_sumber_rsp')->nullable()->default('RPJMD');
            $table->string('dokumen_sumber_rso')->nullable()->default('Renstra');
            $table->string('dokumen_sumber_roo')->nullable()->default('Renja/RKA/DPA');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengaturan_pemda');
    }
};
