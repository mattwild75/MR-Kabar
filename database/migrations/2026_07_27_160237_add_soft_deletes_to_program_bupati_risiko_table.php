<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tambah soft delete ke program_bupati_risiko — halaman "Miscellaneous >
 * Risiko 100 Program Bupati" sekarang punya UI editable (tambah/hapus
 * kaitan risiko per program, lihat ProgramBupatiRisikoController), jadi
 * kaitan yang dihapus PIC/Admin perlu bisa dipulihkan sesuai konvensi
 * seluruh data risiko lain di aplikasi ini (lihat docs/KONVENSI_PENAMAAN_KOLOM.md:
 * "Soft Delete + Trash" — semua hapus data risiko = soft delete, bukan
 * hapus permanen langsung).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('program_bupati_risiko', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('program_bupati_risiko', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
