<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * CEE (Control Environment Evaluation) — Lampiran 5 Form 1a/1b/1c Perdep
     * PPKD No.4/2019. Dinilai PER-OPD (per urusan wajib/pilihan) — Perdep bab
     * 3.2.c: "Survei ini dilakukan... terhadap kondisi Lingkungan Pengendalian
     * URUSAN WAJIB/PILIHAN pemerintah daerah" (contoh: Urusan Wajib Kesehatan
     * = Dinas Kesehatan). Redaksi 37 pertanyaan kuesioner BAKU/SAMA di semua
     * OPD (cee_pertanyaan tidak diulang per-OPD) — yang dipisah per-OPD adalah
     * JAWABAN, TEMUAN, dan SIMPULANNYA (opd_id).
     *
     * Alur: 1a (kuesioner, banyak responden OPD ybs) + 1b (kelemahan dari
     * reviu dokumen OPD ybs) -> digabung jadi 1c (simpulan akhir per unsur utk
     * OPD ybs, disahkan Kepala OPD/UPR yg datanya diambil dari Data Umum
     * pengisi).
     */
    public function up(): void
    {
        // 8 unsur Lingkungan Pengendalian (A-H) sesuai PP 60/2008 & Perdep.
        Schema::create('cee_unsur', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 2); // A..H
            $table->string('nama');
            $table->unsignedInteger('urutan');
            $table->timestamps();
        });

        // Pertanyaan kuesioner Form 1a — SATU set baku dipakai di semua OPD.
        // Redaksi HANYA boleh diubah admin/super-admin (ditegakkan di
        // controller, bukan di sini).
        Schema::create('cee_pertanyaan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cee_unsur_id')->constrained('cee_unsur')->cascadeOnDelete();
            $table->text('pertanyaan');
            $table->unsignedInteger('urutan');
            $table->boolean('aktif')->default(true);
            $table->timestamps();
        });

        // Form 1a: satu baris = satu jawaban satu responden atas satu
        // pertanyaan, untuk satu OPD & satu tahun penilaian. Identitas
        // responden dicatat per-submission (bukan terikat user_id tertentu)
        // karena akun CEE_Survey dipakai bergantian oleh siapa saja min.
        // eselon IV di OPD tersebut.
        Schema::create('cee_jawaban', function (Blueprint $table) {
            $table->id();
            $table->foreignId('opd_id')->constrained('opd')->cascadeOnDelete();
            $table->foreignId('cee_pertanyaan_id')->constrained('cee_pertanyaan')->cascadeOnDelete();
            $table->unsignedSmallInteger('tahun_penilaian');
            // Identitas responden (diisi manual tiap submit oleh akun CEE_Survey).
            $table->string('responden_nama');
            $table->string('responden_jabatan');
            $table->foreignId('submitted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedTinyInteger('nilai'); // 1-4
            $table->timestamps();
        });

        // Form 1b: kelemahan Lingkungan Pengendalian OPD ybs berdasar reviu
        // dokumen (LHP BPK, SK Inspektur, media massa, dll), diklasifikasikan
        // ke salah satu dari 8 unsur.
        Schema::create('cee_kelemahan_dokumen', function (Blueprint $table) {
            $table->id();
            $table->foreignId('opd_id')->constrained('opd')->cascadeOnDelete();
            $table->unsignedSmallInteger('tahun_penilaian');
            $table->foreignId('cee_unsur_id')->constrained('cee_unsur')->cascadeOnDelete();
            $table->string('sumber_data');
            $table->text('uraian_kelemahan');
            // Identitas pengisi (sama pola dgn 1a — akun CEE_Survey bergantian).
            $table->string('pengisi_nama');
            $table->string('pengisi_jabatan');
            $table->foreignId('submitted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // Form 1c: simpulan akhir per unsur utk OPD ybs (gabungan hasil 1a +
        // 1b), diisi Sekretaris Dinas/Badan (Koordinator MR OPD), disahkan/
        // ditandatangani Kepala OPD (data kepala OPD di-snapshot dari Data
        // Umum pengisi saat submit).
        Schema::create('cee_simpulan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('opd_id')->constrained('opd')->cascadeOnDelete();
            $table->unsignedSmallInteger('tahun_penilaian');
            $table->foreignId('cee_unsur_id')->constrained('cee_unsur')->cascadeOnDelete();
            $table->text('penjelasan')->nullable();
            // Identitas penyusun simpulan (Sekretaris Dinas/Badan).
            $table->string('penyusun_nama');
            $table->string('penyusun_jabatan');
            $table->foreignId('submitted_by')->nullable()->constrained('users')->nullOnDelete();
            // Kepala OPD (penandatangan/UPR) — di-snapshot dari Data Umum
            // pengisi pada saat submit, supaya cetakan tidak berubah kalau
            // Data Umum diedit belakangan.
            $table->string('kepala_opd_nama')->nullable();
            $table->string('kepala_opd_jabatan')->nullable();
            $table->timestamps();
            // Satu simpulan per (OPD, tahun, unsur) — submit ulang = update.
            $table->unique(['opd_id', 'tahun_penilaian', 'cee_unsur_id'], 'cee_simpulan_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cee_simpulan');
        Schema::dropIfExists('cee_kelemahan_dokumen');
        Schema::dropIfExists('cee_jawaban');
        Schema::dropIfExists('cee_pertanyaan');
        Schema::dropIfExists('cee_unsur');
    }
};
