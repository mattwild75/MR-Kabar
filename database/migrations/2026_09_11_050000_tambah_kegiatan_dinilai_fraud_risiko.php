<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Nama kegiatan/proses bisnis yang dinilai — baris ketiga judul kertas kerja.
 *
 * Kertas kerja FRA yang sesungguhnya (Register Risiko Fraud Dinas Pendidikan
 * 2026) berjudul tiga baris: "IDENTIFIKASI RISIKO / DINAS PENDIDIKAN
 * KABUPATEN ACEH BARAT TAHUN 2026 / KEGIATAN SELEKSI PENERIMAAN MURID BARU
 * (SPMB) TA. 2026/2027". Baris ketiga itu menyatakan PROSES BISNIS yang
 * dinilai — satu kertas kerja untuk satu kegiatan, dengan tahapan prosesnya
 * (pendaftaran, seleksi, pengumuman) sebagai baris-barisnya.
 *
 * Rancangan pertama tidak punya kolom ini; tahapan proses ada, tapi kegiatan
 * yang tahapannya itu tidak. Tanpa ini judul kertas kerja tidak bisa dicetak
 * utuh, dan risiko dari dua kegiatan berbeda di satu OPD tercampur.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fraud_risiko', function (Blueprint $table) {
            $table->string('kegiatan_dinilai')->nullable()->after('nomor_urut');
        });
    }

    public function down(): void
    {
        Schema::table('fraud_risiko', function (Blueprint $table) {
            $table->dropColumn('kegiatan_dinilai');
        });
    }
};
