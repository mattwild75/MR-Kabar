<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * DashboardController memfilter ketiga tabel ini HANYA dgn
 * where('tahun_penilaian', $tahun) tanpa opd_id (mis. buildKepatuhan(),
 * buildProgresTahapan(), buildTrenEfektivitasPengendalian()) — index
 * komposit yg sudah ada (opd_id, tahun_penilaian) pada monitoring_rtp/
 * pencatatan_kejadian_risiko, dan (opd_id, tahun_penilaian, cee_unsur_id)
 * pada cee_simpulan, TIDAK bisa dipakai efisien utk filter tahun_penilaian
 * SENDIRIAN krn opd_id ada di depan (leading column) — MySQL/MariaDB tidak
 * bisa "skip" kolom pertama index komposit. Index tunggal ini melengkapi
 * (bukan menggantikan) index komposit yg sudah ada, ditemukan lewat audit
 * performa 2026-07-26.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('monitoring_rtp', function (Blueprint $table) {
            $table->index('tahun_penilaian');
        });

        Schema::table('pencatatan_kejadian_risiko', function (Blueprint $table) {
            $table->index('tahun_penilaian');
        });

        Schema::table('cee_simpulan', function (Blueprint $table) {
            $table->index('tahun_penilaian');
        });
    }

    public function down(): void
    {
        Schema::table('monitoring_rtp', function (Blueprint $table) {
            $table->dropIndex(['tahun_penilaian']);
        });

        Schema::table('pencatatan_kejadian_risiko', function (Blueprint $table) {
            $table->dropIndex(['tahun_penilaian']);
        });

        Schema::table('cee_simpulan', function (Blueprint $table) {
            $table->dropIndex(['tahun_penilaian']);
        });
    }
};
