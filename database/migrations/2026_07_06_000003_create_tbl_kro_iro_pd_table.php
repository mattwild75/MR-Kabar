<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel derived/generated — diregenerasi penuh oleh KroIroPdSyncService
     * setiap ada perubahan di tbl_kro_pd/tbl_iro_pd, persis pola
     * tbl_krs_irs_pd (KrsIrsPdSyncService). Dipakai oleh halaman
     * /kro_iro_pd (tabel gabungan) dan /kro_iro_pd_visualisasi (diagram).
     *
     * Hierarki diagram mencakup penuh dari VISI (Pemda) sampai ke Skala
     * Prioritas (atribut Risiko) di dasar, melewati SASARAN_RENSTRA
     * (rujukan ke KRS_PD) di tengah — jadi VISI/MISI/TUJUAN_RPJMD/
     * SASARAN_RPJMD/TUJUAN_STRATEGIS_PD/SASARAN_STRATEGIS_PD ikut disalin
     * (dua tingkat lookup: Pemda lewat Sasaran RPJMD, lalu KRS_PD lewat
     * Sasaran Renstra) sebagai level tambahan di atas SASARAN_RENSTRA.
     *
     * PENTING: risiko (IRO_PD) di-join di level KEGIATAN_PD (bukan
     * SUBKEGIATAN_PD) — sesuai basis Perdep bahwa risiko operasional
     * melekat ke Kegiatan, bukan SubKegiatan. Urutan kolom dari
     * URAIAN_RISIKO ke bawah harus tetap identik pola tbl_krs_irs_pd —
     * KaeresRoController meniru pola KaeresPdController yang mengambil
     * "semua kolom setelah URAIAN_RISIKO" sebagai rantai atribut level
     * diagram secara dinamis dari skema tabel.
     */
    public function up(): void
    {
        Schema::create('tbl_kro_iro_pd', function (Blueprint $table) {
            $table->id();
            $table->text('VISI')->nullable();
            $table->text('MISI')->nullable();
            $table->text('TUJUAN_RPJMD')->nullable();
            $table->text('SASARAN_RPJMD')->nullable();
            $table->text('TUJUAN_STRATEGIS_PD')->nullable();
            $table->text('SASARAN_STRATEGIS_PD')->nullable();
            $table->text('SASARAN_RENSTRA')->nullable();
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
            $table->text('TAHAP')->nullable();
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
        Schema::dropIfExists('tbl_kro_iro_pd');
    }
};
