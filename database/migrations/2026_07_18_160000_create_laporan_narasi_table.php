<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Form 11 (Laporan Pelaksanaan Penilaian Risiko), Form 12 (Laporan
     * Berkala Pengelolaan Risiko), Form 13 (Laporan Pemantauan Unit
     * Kepatuhan) — Bab IV Pelaporan & Lampiran 7 Perdep PPKD No.4/2019.
     *
     * Hanya menyimpan bagian NARASI bebas (Latar Belakang, Dasar Hukum,
     * Rencana/Realisasi Kegiatan, Hambatan, dst) yang tidak punya sumber
     * data terstruktur di aplikasi — diisi auto-generate dari template
     * default lalu bisa diedit manual pengguna. Bagian data terstruktur
     * (daftar risiko, RTP, monitoring) TIDAK disimpan di sini, selalu
     * diproyeksi live dari tbl_irs_pemda/tbl_irs_pd/tbl_iro_pd,
     * monitoring_rtp, pencatatan_kejadian_risiko (sama prinsip dgn Form
     * 6/7/8/9/10 yg tidak menyimpan salinan data risiko).
     *
     * Satu tabel gabungan (bukan 3 tabel terpisah) sesuai jenis_laporan,
     * karena field narasinya banyak yg overlap (latar_belakang, dasar_hukum,
     * dst dipakai ketiga jenis) — kolom yg tidak relevan utk suatu jenis
     * laporan tetap nullable, sama pola dgn monitoring_rtp yg menggabungkan
     * Form 8+9 dlm satu tabel.
     *
     * opd_id nullable: NULL = level Pemerintah Daerah (Laporan Kompilasi
     * lintas-OPD, WAJIB utk Laporan Pemantauan Unit Kepatuhan yg SELALU
     * level Pemda, opsional utk Laporan Pelaksanaan/Berkala yg jg py versi
     * kompilasi Pemda selain per-OPD).
     *
     * triwulan nullable: NULL = Laporan Pelaksanaan Penilaian Risiko (sekali
     * per siklus penilaian, bukan per-triwulan) — Laporan Berkala &
     * Pemantauan WAJIB triwulan (I/II/III/IV, dgan IV merangkap laporan
     * tahunan sesuai teks Perdep "triwulanan (Triwulan I, II, III) dan
     * tahunan (Triwulan IV)").
     */
    public function up(): void
    {
        Schema::create('laporan_narasi', function (Blueprint $table) {
            $table->id();
            $table->string('jenis_laporan'); // pelaksanaan_penilaian | berkala_pengelolaan | pemantauan_kepatuhan
            $table->foreignId('opd_id')->nullable()->constrained('opd')->nullOnDelete();
            $table->unsignedSmallInteger('tahun_penilaian');
            $table->string('triwulan')->nullable(); // I | II | III | IV

            // Bagian umum (dipakai ketiga jenis laporan, Bab I Pendahuluan Lampiran 7)
            $table->text('latar_belakang')->nullable();
            $table->text('dasar_hukum')->nullable();
            $table->text('maksud_tujuan')->nullable();
            $table->text('ruang_lingkup')->nullable();
            $table->text('penutup')->nullable();

            // Khusus Laporan Pelaksanaan Penilaian Risiko (bagian II & IV & V)
            $table->text('kondisi_lingkungan_pengendalian')->nullable();
            $table->text('rencana_perbaikan_lingkungan')->nullable();
            $table->text('rancangan_informasi_komunikasi')->nullable();
            $table->text('rancangan_pemantauan')->nullable();

            // Khusus Laporan Berkala & Pemantauan (bagian II/A & III/B)
            $table->text('rencana_kegiatan')->nullable();
            $table->text('realisasi_kegiatan')->nullable();
            $table->text('hambatan_pelaksanaan')->nullable();

            // Khusus Laporan Berkala (bagian IV Monitoring Risiko dan RTP)
            $table->text('monitoring_risiko_rtp')->nullable();

            // Khusus Laporan Pemantauan Unit Kepatuhan (bagian D)
            $table->text('rekomendasi_feedback')->nullable();

            $table->foreignId('submitted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['jenis_laporan', 'opd_id', 'tahun_penilaian', 'triwulan'], 'laporan_narasi_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('laporan_narasi');
    }
};
