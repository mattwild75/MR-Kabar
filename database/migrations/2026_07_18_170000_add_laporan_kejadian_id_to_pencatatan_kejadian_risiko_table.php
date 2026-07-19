<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Jembatan Lapor Kejadian Risiko (laporan warga via QR) <-> Form 10
     * (Pencatatan Kejadian Risiko resmi UPR) — SEBELUM migrasi ini kedua
     * fitur adalah silo terisolasi total: tidak ada cara Admin/Unit
     * Kepatuhan "menaikkan" laporan warga tervalidasi jadi entri resmi,
     * dan Dashboard bisa menampilkan kejadian nyata yang sama dua kali
     * (sekali sbg laporan warga, sekali sbg Form 10) tanpa keterkaitan.
     *
     * Nullable — mayoritas Form 10 tetap diisi manual tanpa asal dari
     * laporan warga; kolom ini HANYA terisi kalau baris dibuat via alur
     * "Catat ke Form 10" di halaman Rekap Lapor Kejadian.
     */
    public function up(): void
    {
        Schema::table('pencatatan_kejadian_risiko', function (Blueprint $table) {
            $table->foreignId('laporan_kejadian_id')->nullable()->after('risiko_id')
                ->constrained('laporan_kejadian_risiko')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('pencatatan_kejadian_risiko', function (Blueprint $table) {
            $table->dropConstrainedForeignId('laporan_kejadian_id');
        });
    }
};
