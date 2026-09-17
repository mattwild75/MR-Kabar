<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Database LHP (ERPIKA > Laporan Penugasan > Database LHP) — manajemen data
 * Laporan Hasil Pemeriksaan berikut Temuan → Penyebab → Rekomendasi →
 * Tindak Lanjut, hasil pemindahan dari aplikasi lama SimHPPemda (BPKP).
 *
 * Berdiri sendiri seperti seluruh modul ERPIKA: prefix tabel `lhp_`, TANPA
 * kunci asing ke tabel domain MR Kabar; kelak mudah dicabut ke aplikasi
 * ERPIKA terpisah. Field mengikuti kolom SimHP yang BENAR-BENAR terisi
 * (analisis 1.212 LHP): kolom yang selalu kosong di SimHP — Opini, TPL,
 * Kode Obrik, akuntabilitas, nilai obrik — sengaja tidak dibuat.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lhp', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_lhp', 120)->unique();
            $table->date('tanggal_lhp')->nullable();
            $table->string('nomor_st', 60)->nullable();
            $table->date('tanggal_st')->nullable();
            $table->string('tahun_anggaran', 12)->nullable();
            $table->string('nama_obrik', 950);
            $table->string('kode_unit_pemeriksa', 8)->nullable();
            $table->string('kode_departemen', 16)->nullable();
            $table->string('kode_group_jenis_obrik', 4)->nullable();
            $table->string('kode_jenis_obrik', 6)->nullable();
            $table->string('kode_group_jenis_periksa', 4)->nullable();
            $table->string('kode_jenis_periksa', 6)->nullable();
            $table->string('tahun_pkpt', 12)->nullable();
            $table->date('tanggal_entry')->nullable();
            $table->string('kode_jenis_anggaran', 4)->nullable();
            $table->decimal('nilai_anggaran', 19, 2)->nullable();
            $table->decimal('realisasi_anggaran', 19, 2)->nullable();
            $table->decimal('anggaran_diaudit', 19, 2)->nullable();
            // Temuan Pemeriksaan (TP), Temuan Pengembalian ke Kas (TPB), dan
            // Potensi Kerugian — jumlah kejadian + nilai rupiah.
            $table->integer('jml_tp')->nullable();
            $table->decimal('nilai_tp', 19, 2)->nullable();
            $table->integer('jml_tpb')->nullable();
            $table->decimal('nilai_tpb', 19, 2)->nullable();
            $table->integer('jml_potensi')->nullable();
            $table->decimal('nilai_potensi', 19, 2)->nullable();
            // 00 Cacat/Tidak Lengkap · 01 Belum ada TL · 02 TL Sebagian · 03 Tuntas
            $table->string('status_lhp', 2)->default('01');
            $table->string('nip_pj', 30)->nullable();
            $table->string('nama_pj', 100)->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index('status_lhp');
            $table->index('tahun_anggaran');
        });

        Schema::create('lhp_temuan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lhp_id')->constrained('lhp')->cascadeOnDelete();
            $table->unsignedInteger('no');
            $table->string('kode_group', 4)->nullable();
            $table->string('kode', 6)->nullable();
            $table->decimal('nilai', 19, 2)->nullable();
            $table->longText('memo')->nullable();
            $table->string('status', 2)->nullable();
            $table->timestamps();
            $table->index(['lhp_id', 'no']);
        });

        Schema::create('lhp_sebab', function (Blueprint $table) {
            $table->id();
            $table->foreignId('temuan_id')->constrained('lhp_temuan')->cascadeOnDelete();
            $table->unsignedInteger('no');
            $table->string('kode_group', 4)->nullable();
            $table->string('kode', 6)->nullable();
            $table->longText('memo')->nullable();
            $table->timestamps();
            $table->index(['temuan_id', 'no']);
        });

        Schema::create('lhp_rekomendasi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sebab_id')->constrained('lhp_sebab')->cascadeOnDelete();
            $table->unsignedInteger('no');
            $table->string('kode_group', 4)->nullable();
            $table->string('kode', 6)->nullable();
            $table->decimal('nilai', 19, 2)->nullable();
            $table->longText('memo')->nullable();
            $table->timestamps();
            $table->index(['sebab_id', 'no']);
        });

        Schema::create('lhp_tindak_lanjut', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rekomendasi_id')->constrained('lhp_rekomendasi')->cascadeOnDelete();
            $table->unsignedInteger('no');
            $table->string('kode_group', 4)->nullable();
            $table->string('kode', 6)->nullable();
            $table->decimal('nilai', 19, 2)->nullable();
            $table->date('tanggal')->nullable();
            $table->date('tanggal_laporan')->nullable();
            $table->longText('memo')->nullable();
            $table->string('kode_status', 2)->nullable();
            $table->timestamps();
            $table->index(['rekomendasi_id', 'no']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lhp_tindak_lanjut');
        Schema::dropIfExists('lhp_rekomendasi');
        Schema::dropIfExists('lhp_sebab');
        Schema::dropIfExists('lhp_temuan');
        Schema::dropIfExists('lhp');
    }
};
