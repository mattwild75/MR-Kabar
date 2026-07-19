<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Form 8 (Rencana & Realisasi Pengkomunikasian atas Kegiatan
     * Pengendalian) + Form 9 (Rencana & Realisasi Pemantauan atas Kegiatan
     * Pengendalian) — Lampiran 5 Perdep PPKD No.4/2019. Kedua form berbagi
     * basis data yg SAMA (satu baris RTP = 1 baris di kedua form, kolom
     * "Kegiatan Pengendalian yang Dibutuhkan" TIDAK disimpan di sini —
     * selalu diproyeksi live dari RTP sumbernya, sama pola dgn Form 6/7
     * yg tidak menyimpan uraian/kode risiko sendiri), makanya disatukan
     * jadi SATU tabel, bukan dua.
     *
     * RTP sumber bisa dari 4 tempat berbeda (polymorphic via
     * rtp_sumber_tipe+rtp_sumber_id, sama pola dgn
     * LaporanKejadianRisiko::risikoTerdaftar()):
     * - irs_pemda / irs_pd / iro_pd -> field 'RENCANA TINDAK PENGENDALIAN'
     *   pada tabel risiko (RTP atas risiko, sumber Form 7).
     * - cee_rtp -> RTP atas kelemahan Lingkungan Pengendalian (sumber
     *   Form 6, hasil isian Form Input 1d).
     *
     * unique(rtp_sumber_tipe, rtp_sumber_id) — SATU baris RTP sumber hanya
     * boleh py SATU baris monitoring (Form 8+9 sekaligus), user
     * melengkapi/mengedit kolom yg relevan, bukan menambah baris baru per
     * RTP yg sama.
     */
    public function up(): void
    {
        Schema::create('monitoring_rtp', function (Blueprint $table) {
            $table->id();
            $table->string('rtp_sumber_tipe'); // irs_pemda | irs_pd | iro_pd | cee_rtp
            $table->unsignedBigInteger('rtp_sumber_id');
            $table->foreignId('opd_id')->constrained('opd')->cascadeOnDelete();
            $table->unsignedSmallInteger('tahun_penilaian');

            // ── Form 8: Rencana & Realisasi Pengkomunikasian (kolom c-h) ──
            $table->string('media_komunikasi')->nullable();
            $table->string('penyedia_informasi')->nullable();
            $table->string('penerima_informasi')->nullable();
            $table->string('triwulan_rencana_komunikasi')->nullable();
            $table->unsignedSmallInteger('tahun_rencana_komunikasi')->nullable();
            $table->string('realisasi_waktu_komunikasi')->nullable();
            $table->text('keterangan_komunikasi')->nullable();

            // ── Form 9: Rencana & Realisasi Pemantauan (kolom c-g) ──
            $table->string('metode_pemantauan')->nullable();
            $table->string('penanggung_jawab_pemantauan')->nullable();
            $table->string('triwulan_rencana_pemantauan')->nullable();
            $table->unsignedSmallInteger('tahun_rencana_pemantauan')->nullable();
            $table->string('realisasi_waktu_pemantauan')->nullable();
            $table->text('keterangan_pemantauan')->nullable();

            $table->foreignId('submitted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['rtp_sumber_tipe', 'rtp_sumber_id'], 'monitoring_rtp_sumber_unique');
            $table->index(['opd_id', 'tahun_penilaian']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monitoring_rtp');
    }
};
