<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabel 3.7 RPJM Kabupaten Aceh Barat Tahun 2025-2029: "100 Program
 * Pembangunan Pemerintah Kabupaten Aceh Barat" — dikelola Admin/Super
 * Admin lewat menu Settings > Keterangan Pendukung (tab baru), sama pola
 * dengan Jenis Risiko/Entitas Penilai (lihat
 * 2026_07_11_103731_create_risk_reference_tables.php). Kolom visi/misi
 * disertakan literal per baris (bukan tabel visi/misi terpisah + relasi)
 * krn RPJM hanya py 1 Visi & 7 Misi tetap sepanjang periode 2025-2029 —
 * relasi terpisah jadi over-engineering utk data yg tidak berubah-ubah;
 * cukup diedit ulang massal kalau periode RPJM berikutnya berbeda.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('program_pembangunan_bupati', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('nomor')->unique(); // No pada Tabel 3.7, 1-100
            $table->text('program_pembangunan');
            $table->string('branding')->nullable(); // Kolom "Branding" (kadang kosong di sumber, mis. No.56)
            $table->string('perangkat_daerah');
            $table->text('visi');
            $table->string('misi'); // Nama Misi (mis. "Misi 1: Mewujudkan Transformasi Sosial dan Ekonomi...")
            $table->unsignedTinyInteger('misi_urutan'); // 1-7, dipakai sort & pengelompokan tampilan
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('program_pembangunan_bupati');
    }
};
