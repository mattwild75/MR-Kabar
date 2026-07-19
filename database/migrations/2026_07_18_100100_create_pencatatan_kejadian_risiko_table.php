<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Form 10: Pencatatan Kejadian Risiko (Risk Event) & Pelaksanaan RTP —
     * Lampiran 5 Perdep PPKD No.4/2019. BEDA dari fitur "Lapor Kejadian
     * Risiko" (laporan_kejadian_risiko, laporan insiden publik via QR) —
     * ini kertas kerja resmi UPR: 1 baris = 1 risiko TERIDENTIFIKASI (dari
     * IRS Pemda/IRS PD/IRO PD), mencatat kapan risiko itu BENAR-BENAR
     * terjadi tahun berjalan beserta realisasi RTP-nya. "Risiko" yang
     * teridentifikasi (uraian & kode risiko) TIDAK disimpan di sini —
     * selalu diproyeksi live dari risiko sumbernya (risiko_tipe+risiko_id),
     * sama pola dgn Form 6/7.
     *
     * unique(risiko_tipe, risiko_id) — SATU risiko cuma boleh py SATU baris
     * pencatatan per tahun (kolom tahun_penilaian ikut di unique krn risiko
     * yg sama bisa dinilai ulang di tahun berikutnya dgn kejadian baru).
     */
    public function up(): void
    {
        Schema::create('pencatatan_kejadian_risiko', function (Blueprint $table) {
            $table->id();
            $table->string('risiko_tipe'); // irs_pemda | irs_pd | iro_pd
            $table->unsignedBigInteger('risiko_id');
            $table->foreignId('opd_id')->constrained('opd')->cascadeOnDelete();
            $table->unsignedSmallInteger('tahun_penilaian');

            // Kolom d-f: Kejadian Risiko (Tanggal Terjadi/Sebab/Dampak) SAAT
            // kejadian tahun berjalan — BEDA dari field 'URAIAN PENYEBAB
            // RISIKO'/'URAIAN DAMPAK RISIKO' di tabel risiko sumber (yg itu
            // penyebab/dampak PERKIRAAN saat identifikasi risiko, ini
            // penyebab/dampak AKTUAL saat risiko benar2 terjadi).
            $table->date('tanggal_terjadi')->nullable();
            $table->text('sebab_saat_kejadian')->nullable();
            $table->text('dampak_saat_kejadian')->nullable();
            // Kolom g.
            $table->text('keterangan_kejadian')->nullable();

            // Kolom i-j: Rencana & Realisasi Pelaksanaan RTP.
            $table->string('triwulan_rencana_rtp')->nullable();
            $table->unsignedSmallInteger('tahun_rencana_rtp')->nullable();
            $table->string('realisasi_pelaksanaan_rtp')->nullable();
            // Kolom k.
            $table->text('keterangan_rtp')->nullable();

            $table->foreignId('submitted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['risiko_tipe', 'risiko_id', 'tahun_penilaian'], 'pencatatan_kejadian_risiko_unique');
            $table->index(['opd_id', 'tahun_penilaian']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pencatatan_kejadian_risiko');
    }
};
