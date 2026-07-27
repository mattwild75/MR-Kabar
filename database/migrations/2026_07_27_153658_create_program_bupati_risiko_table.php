<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabel pivot: kaitan antara Program Pembangunan Bupati (Tabel 3.7 RPJM
 * 2025-2029) dan risiko yang teridentifikasi (IRS Pemda/IRS PD/IRO PD) —
 * dasar halaman baru "Miscellaneous > Risiko 100 Program Bupati".
 *
 * Polimorfik lewat kolom `risiko_tipe` (irs_pemda|irs_pd|iro_pd) +
 * `risiko_id` (bukan Eloquent morphTo bawaan, krn 3 model sumber TIDAK
 * berbagi base class yg sama — pola ini SUDAH dipakai konsisten di
 * MonitoringRtp/PencatatanKejadianRisiko rtp_sumber_tipe/rtp_sumber_id,
 * lihat app/Models/MonitoringRtp.php) — satu risiko boleh dikaitkan ke
 * LEBIH DARI SATU program (relevan ke banyak program sekaligus), begitu
 * pula satu program boleh py banyak risiko terkait, jadi TIDAK unique per
 * risiko, hanya unique per PASANGAN (program, risiko) supaya tidak
 * terduplikasi kalau pemetaan di-generate ulang.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('program_bupati_risiko', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_pembangunan_bupati_id')
                ->constrained('program_pembangunan_bupati')
                ->cascadeOnDelete();
            $table->string('risiko_tipe'); // irs_pemda | irs_pd | iro_pd
            $table->unsignedBigInteger('risiko_id');
            $table->timestamps();

            $table->unique(['program_pembangunan_bupati_id', 'risiko_tipe', 'risiko_id'], 'program_risiko_unique');
            $table->index(['risiko_tipe', 'risiko_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('program_bupati_risiko');
    }
};
