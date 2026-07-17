<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Form 1d: RTP atas Kelemahan Lingkungan Pengendalian (RTP atas CEE) —
     * Lampiran 5 Form 6 Perdep PPKD No.4/2019, kolom (b)-(f): Kondisi
     * Lingkungan Pengendalian yang Kurang Memadai / Rencana Tindak
     * Pengendalian Lingkungan Pengendalian / Penanggung Jawab / Target Waktu
     * Penyelesaian / Realisasi Penyelesaian. Satu baris per (opd, tahun,
     * unsur) — SATU unsur bisa py LEBIH dari satu kondisi kurang memadai
     * (Form 6 asli menampilkan multi-baris per unsur), maka TIDAK unique
     * (opd,tahun,unsur) spt cee_simpulan — mirip pola cee_kelemahan_dokumen
     * (Form 1b) yg juga multi-baris per unsur.
     *
     * Target Waktu & Realisasi Penyelesaian DIPISAH jadi TRIWULAN + TAHUN
     * (bukan teks bebas) — pola SAMA PERSIS dgn IRS/IRO (lihat migration
     * 2026_07_06_000007_replace_target_waktu_penyelesaian_with_triwulan_tahun),
     * supaya konsisten & bisa divalidasi/di-parse, bukan teks bebas tak
     * terstruktur.
     */
    public function up(): void
    {
        Schema::create('cee_rtp', function (Blueprint $table) {
            $table->id();
            $table->foreignId('opd_id')->constrained('opd')->cascadeOnDelete();
            $table->unsignedSmallInteger('tahun_penilaian');
            $table->foreignId('cee_unsur_id')->constrained('cee_unsur')->cascadeOnDelete();

            // Kolom b: kondisi lingkungan pengendalian yg kurang memadai —
            // teks bebas (PIC memilih/menulis sendiri, BUKAN auto-generate
            // dari cee_simpulan.penjelasan, krn penjelasan simpulan 1c belum
            // tentu 1:1 dgn tiap "kondisi kurang memadai" yg mau di-RTP-kan,
            // bisa py granularitas beda).
            $table->text('kondisi_kurang_memadai');
            // Kolom c.
            $table->text('rencana_tindak_pengendalian')->nullable();
            // Kolom d.
            $table->string('penanggung_jawab')->nullable();
            // Kolom e: Target Waktu Penyelesaian (Triwulan + Tahun terpisah).
            $table->string('triwulan_target')->nullable();
            $table->unsignedSmallInteger('tahun_target_penyelesaian')->nullable();
            // Kolom f: Realisasi Penyelesaian (Triwulan + Tahun terpisah,
            // sama pola dgn kolom e) — nullable krn realisasi wajar belum
            // terisi saat RTP baru direncanakan.
            $table->string('triwulan_realisasi')->nullable();
            $table->unsignedSmallInteger('tahun_realisasi_penyelesaian')->nullable();

            $table->foreignId('submitted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cee_rtp');
    }
};
