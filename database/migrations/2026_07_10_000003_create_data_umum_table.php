<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * "Data Umum" per-PIC (per-OPD): identitas kertas kerja penilaian risiko +
     * daftar penanda tangan (dinamis). Dipakai sebagai header & blok tanda
     * tangan pada Form Cetak. Satu baris per user (user_id unik) — mengikuti
     * pola kepemilikan row-level data risiko (KrsPd/IrsPd dll).
     */
    public function up(): void
    {
        Schema::create('data_umum', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->unique()->constrained('users')->nullOnDelete();

            // Header identitas (mengikuti kertas kerja penilaian risiko).
            $table->string('pemerintah_kabkota')->nullable();
            $table->string('nama_urusan')->nullable();
            $table->string('nama_sub_urusan')->nullable();
            $table->string('nama_dinas_opd')->nullable();
            $table->string('periode_penilaian')->nullable();
            $table->string('tahun_penilaian')->nullable();

            $table->string('nama_kepala_daerah')->nullable();
            $table->string('jabatan_kepala_daerah')->nullable();

            $table->string('nama_kepala_dinas')->nullable();
            $table->string('jabatan_kepala_dinas')->nullable();
            $table->string('nip_kepala_dinas')->nullable();

            $table->string('nama_pic')->nullable();
            $table->string('jabatan_pic')->nullable();
            $table->string('nip_pic')->nullable();

            $table->string('dokumen_sumber_rss')->nullable();
            $table->string('dokumen_sumber_rso')->nullable();
            $table->string('dokumen_sumber_roo')->nullable();

            $table->string('tempat_pembuatan')->nullable();
            $table->date('tanggal_pembuatan')->nullable();

            // Daftar penanda tangan dinamis: [{jabatan, nama, nip}, ...].
            $table->json('penandatangan')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('data_umum');
    }
};
