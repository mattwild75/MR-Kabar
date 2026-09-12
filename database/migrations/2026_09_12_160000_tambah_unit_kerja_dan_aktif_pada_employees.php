<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Daftar pegawai ERPIKA mengikuti roster Bagian Analisis dan Evaluasi
 * (lembar Sheet3 REKAP LAPORAN RPP 2026): unit kerja (Sekretariat, Inspektur
 * Pembantu I-IV, Khusus) dan penanda aktif — pegawai lama yang hanya muncul
 * di RPP 2020-2023 tetap tersimpan (cetakan lama butuh namanya) tetapi tidak
 * ditawarkan saat menyusun tim baru.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->string('unit_kerja')->nullable()->after('jabatan');
            $table->boolean('aktif')->default(true)->after('unit_kerja');
        });
    }

    public function down(): void
    {
        Schema::table('employees', fn (Blueprint $table) => $table->dropColumn(['unit_kerja', 'aktif']));
    }
};
