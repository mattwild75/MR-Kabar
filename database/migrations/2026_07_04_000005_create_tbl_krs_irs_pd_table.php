<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel derived/generated — diregenerasi penuh oleh KrsIrsPdSyncService
     * setiap ada perubahan di tbl_krs_pd/tbl_irs_pd, persis pola
     * tbl_krs_irs_pemda (KrsIrsSyncService). Dipakai oleh halaman
     * /krs_irs_pd (tabel gabungan) dan /krs_irs_pd_visualisasi (diagram).
     *
     * Struktur mengikuti tbl_krs_irs_pemda ditambah dua level (Kegiatan,
     * SubKegiatan) yang ada di KRS_PD tapi tidak ada di KRS_Pemda — kolom
     * OPD_PENANGGUNGJAWAB_KEGIATAN menggantikan peran
     * OPD_PENANGGUNGJAWAB_PROGRAM sebagai OPD pelaksana paling bawah.
     *
     * Hierarki diagram diminta mencakup penuh dari VISI (Pemda) di puncak
     * sampai Skala Prioritas (atribut Risiko) di dasar — jadi VISI/MISI/
     * TUJUAN_RPJMD ikut disalin dari tbl_pembangunandaerah (via Sasaran
     * RPJMD yang dirujuk) sebagai tiga level tambahan di atas SASARAN_RPJMD.
     *
     * PENTING: urutan kolom dari URAIAN_RISIKO ke bawah harus tetap identik
     * dengan tbl_krs_irs_pemda — KaeresPdController meniru pola
     * KaeresController yang mengambil "semua kolom setelah URAIAN_RISIKO"
     * sebagai rantai atribut level diagram secara dinamis dari skema tabel.
     */
    public function up(): void
    {
        Schema::create('tbl_krs_irs_pd', function (Blueprint $table) {
            $table->id();
            $table->text('VISI')->nullable();
            $table->text('MISI')->nullable();
            $table->text('TUJUAN_RPJMD')->nullable();
            $table->text('SASARAN_RPJMD')->nullable();
            $table->text('TUJUAN_STRATEGIS_PD')->nullable();
            $table->text('IK_TUJUAN_STRATEGIS_PD')->nullable();
            $table->text('BASELINE_IK_TUJUAN_STRATEGIS_PD')->nullable();
            $table->text('TARGET_IK_TUJUAN_STRATEGIS_PD')->nullable();
            $table->text('OPD_IK_TUJUAN_STRATEGIS_PD')->nullable();
            $table->text('SASARAN_STRATEGIS_PD')->nullable();
            $table->text('IK_SASARAN_STRATEGIS_PD')->nullable();
            $table->text('BASELINE_IK_SASARAN_STRATEGIS_PD')->nullable();
            $table->text('TARGET_IK_SASARAN_STRATEGIS_PD')->nullable();
            $table->text('OPD_IK_SASARAN_STRATEGIS_PD')->nullable();
            $table->text('PROGRAM_PD')->nullable();
            $table->text('IK_PROGRAM_PD')->nullable();
            $table->text('BASELINE_IK_PROGRAM_PD')->nullable();
            $table->text('TARGET_IK_PROGRAM_PD')->nullable();
            $table->text('KEGIATAN_PD')->nullable();
            $table->text('IK_KEGIATAN_PD')->nullable();
            $table->text('BASELINE_IK_KEGIATAN_PD')->nullable();
            $table->text('TARGET_IK_KEGIATAN_PD')->nullable();
            $table->text('SUBKEGIATAN_PD')->nullable();
            $table->text('IK_SUBKEGIATAN_PD')->nullable();
            $table->text('BASELINE_IK_SUBKEGIATAN_PD')->nullable();
            $table->text('TARGET_IK_SUBKEGIATAN_PD')->nullable();
            $table->text('OPD_PENANGGUNGJAWAB_KEGIATAN')->nullable();
            $table->text('URAIAN_RISIKO')->nullable();
            $table->string('TINGKAT_RISIKO')->nullable();
            $table->text('TAHUN_DINILAI_RISIKO')->nullable();
            $table->text('JENIS_RISIKO')->nullable();
            $table->text('ENTITAS_PD_YANG_MENILAI')->nullable();
            $table->unsignedInteger('NOMOR_URUT_RISIKO')->nullable();
            $table->text('PEMILIK_RISIKO')->nullable();
            $table->text('URAIAN_PENYEBAB_RISIKO')->nullable();
            $table->text('SUMBER_SEBAB_RISIKO')->nullable();
            $table->string('C_UC')->nullable();
            $table->text('URAIAN_DAMPAK_RISIKO')->nullable();
            $table->text('PIHAK_TERKENA_DAMPAK_RISIKO')->nullable();
            $table->text('URAIAN_PENGENDALIAN_YANG_SUDAH_ADA')->nullable();
            $table->text('CELAH_PENGENDALIAN')->nullable();
            $table->text('RENCANA_TINDAK_PENGENDALIAN')->nullable();
            $table->text('PEMILIK_PENANGGUNGJAWAB')->nullable();
            $table->text('TARGET_WAKTU_PENYELESAIAN')->nullable();
            $table->unsignedTinyInteger('SKALA_DAMPAK')->nullable();
            $table->unsignedTinyInteger('SKALA_KEMUNGKINAN')->nullable();
            $table->unsignedTinyInteger('SKALA_RISIKO')->nullable();
            $table->unsignedTinyInteger('SKALA_PRIORITAS')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_krs_irs_pd');
    }
};
