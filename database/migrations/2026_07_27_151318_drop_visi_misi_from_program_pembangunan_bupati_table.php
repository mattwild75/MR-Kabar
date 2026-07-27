<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Hapus kolom 'visi'/'misi' (teks statis) dari program_pembangunan_bupati
 * — DIGANTI live-lookup ke tbl_krs_pemda (kolom VISI/MISI, gaya #1 SPASI
 * DAN KAPITAL) berdasarkan misi_urutan yang sudah tersimpan, supaya kalau
 * Visi/Misi diedit di KRS Pemda (I_a) otomatis ikut berubah di sini —
 * BUKAN dua sumber teks terpisah yang bisa saling tidak sinkron seperti
 * sebelumnya (lihat komentar model ProgramPembangunanBupati.php).
 * misi_urutan TETAP disimpan (bukan ikut dihapus) krn itu satu-satunya
 * kunci pencocokan ke KRS Pemda yang stabil sepanjang periode RPJM.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('program_pembangunan_bupati', function (Blueprint $table) {
            $table->dropColumn(['visi', 'misi']);
        });
    }

    public function down(): void
    {
        Schema::table('program_pembangunan_bupati', function (Blueprint $table) {
            $table->text('visi')->nullable();
            $table->string('misi')->nullable();
        });
    }
};
