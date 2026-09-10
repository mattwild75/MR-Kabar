<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Penilaian Risiko Kecurangan (Fraud Risk Assessment) — MR Fraud.
 *
 * Dasar: Peraturan Deputi Kepala BPKP Bidang Investigasi No. 1 Tahun 2019
 * tentang Pedoman Penilaian Risiko Kecurangan (padanan Perdep PPKD No. 4/2019
 * yang mendasari MR Kabar), Perbup Aceh Barat No. 6 Tahun 2025 tentang
 * Pengendalian Kecurangan, dan Format Kertas Kerja FRA.
 *
 * SATU BARIS UNTUK TIGA LEMBAR. Kertas kerja aslinya memisah IR (identifikasi),
 * AR (analisis), dan RTP (rencana tindak) ke tiga lembar yang disambung dengan
 * MENGETIK ULANG "Nama Risiko" di tiap lembar. Itu sumber pecahnya data: satu
 * huruf berbeda dan barisnya berhenti bertaut, tanpa galat apa pun — persis
 * temuan R-09 pada hierarki. Di sini ketiganya satu baris dengan tiga tahap
 * pengisian, sehingga tidak ada yang perlu disambung lewat teks.
 *
 * BESARAN & LEVEL RISIKO TIDAK DISIMPAN. Keduanya turunan dari probabilitas x
 * dampak lewat `risk_matrix_cells` — tabel yang SUDAH dipakai seluruh aplikasi,
 * dan yang ternyata isinya PERSIS SAMA dengan matriks 5x5 di kertas kerja FRA
 * (9,15,18,23,25 / 6,12,16,19,24 / ...). Menyimpannya berarti mengundang dua
 * sumber kebenaran yang bisa menyimpang diam-diam.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fraud_risiko', function (Blueprint $table) {
            $table->id();

            // PIC penyusun. Kolomnya kunci asing sungguhan, bukan nama sebagai
            // teks seperti tabel risiko warisan — lihat temuan audit R-08.
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('opd_id')->constrained('opd')->cascadeOnDelete();

            $table->unsignedSmallInteger('tahun_penilaian')->index();
            $table->unsignedInteger('nomor_urut')->nullable();

            // --- Lembar IR: identifikasi ---
            $table->string('tahapan_proses')->nullable();
            $table->text('nama_risiko');
            $table->text('skenario_risiko')->nullable();
            $table->text('uraian_penyebab')->nullable();
            $table->text('uraian_dampak')->nullable();

            // Kelompok risiko = delik UU Tipikor. Disimpan sebagai daftar
            // karena satu risiko sah memuat lebih dari satu delik (di kertas
            // kerja asli ditulis bebas "Perbuatan curang, kerugian keuangan
            // daerah" dalam satu sel, yang membuatnya tak bisa dihitung).
            $table->json('kelompok_risiko')->nullable();

            // --- Lembar AR: analisis ---
            $table->unsignedTinyInteger('probabilitas_inheren')->nullable();
            $table->unsignedTinyInteger('dampak_inheren')->nullable();

            $table->string('pengendalian_ada')->nullable();      // Ada | Belum Ada
            $table->text('pengendalian_uraian')->nullable();
            $table->string('pengendalian_memadai')->nullable();  // Memadai | Belum Memadai

            $table->unsignedTinyInteger('probabilitas_residual')->nullable();
            $table->unsignedTinyInteger('dampak_residual')->nullable();

            // --- Lembar RTP: rencana tindak ---
            $table->text('pernyataan_penyebab')->nullable();
            $table->text('rencana_mitigasi')->nullable();
            $table->string('jadwal_mitigasi')->nullable();
            $table->string('penanggung_jawab')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['opd_id', 'tahun_penilaian']);
        });

        Schema::create('fraud_kamus_risiko', function (Blueprint $table) {
            $table->id();

            // Kamus risiko kecurangan: daftar risiko baku yang boleh dipungut
            // PIC saat mengisi, supaya tidak setiap OPD merumuskan sendiri
            // risiko yang sebenarnya sama.
            $table->string('sumber');              // mis. "MCP KPK 2025"
            $table->string('area');                // mis. "PEMBERIAN HIBAH"
            $table->string('tahapan_proses')->nullable();
            $table->unsignedInteger('nomor')->nullable();
            $table->text('uraian');

            $table->timestamps();

            $table->index(['sumber', 'area']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fraud_kamus_risiko');
        Schema::dropIfExists('fraud_risiko');
    }
};
