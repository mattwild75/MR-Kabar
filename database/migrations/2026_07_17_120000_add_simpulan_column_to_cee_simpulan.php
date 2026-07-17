<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Lampiran 5 Form 1c Perdep PPKD No.4/2019 py kolom (g) "Simpulan"
     * EKSPLISIT (Memadai/Kurang Memadai) — keputusan akhir Sekretaris Dinas/
     * Badan setelah mempertimbangkan Hasil Reviu Dokumen (1b) & Hasil
     * Survei Persepsi (1a), TERPISAH dari kolom (h) "Penjelasan" (uraian
     * teks). Tabel cee_simpulan SEBELUMNYA hanya py kolom 'penjelasan'
     * (uraian teks) TANPA status eksplisit — akibatnya Form 1d (RTP CEE)
     * terpaksa memakai hasil MENTAH kuesioner 1a sbg penanda unsur "Kurang
     * Memadai", BUKAN keputusan final Sekretaris di 1c spt seharusnya
     * (ditemukan lewat pertanyaan user: kenapa Form 1d menyebut "Simpulan
     * (1c)" padahal 1c tidak py toggle penilaian eksplisit).
     */
    public function up(): void
    {
        Schema::table('cee_simpulan', function (Blueprint $table) {
            $table->enum('simpulan', ['Memadai', 'Kurang Memadai'])->nullable()->after('cee_unsur_id');
        });
    }

    public function down(): void
    {
        Schema::table('cee_simpulan', function (Blueprint $table) {
            $table->dropColumn('simpulan');
        });
    }
};
