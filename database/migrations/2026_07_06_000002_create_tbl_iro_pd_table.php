<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Identifikasi Risiko Operasional Perangkat Daerah — identik strukturnya
     * dengan tbl_irs_pd, kecuali:
     * - Kolom pertama merujuk ke KEGIATAN PD (dari tbl_kro_pd), BUKAN
     *   SubKegiatan atau Sasaran Renstra — sesuai Perdep PPKD No.4/2019 BPKP
     *   (objek risiko operasional = Renja OPD, yang disusun per Kegiatan).
     * - Kolom baru TAHAP (tahapan pelaksanaan kegiatan tempat risiko bisa
     *   muncul: Perencanaan/Pengadaan/Pelaksanaan/Monitoring/Pelaporan),
     *   diposisikan setelah NOMOR URUT RISIKO dan sebelum PEMILIK RISIKO,
     *   sesuai urutan field pada sheet III_b_IRO_PD VBA asli.
     */
    public function up(): void
    {
        Schema::create('tbl_iro_pd', function (Blueprint $table) {
            $table->id();
            $table->text('KEGIATAN PD')->nullable();
            $table->text('URAIAN RISIKO')->nullable();
            $table->string('TINGKAT RISIKO')->nullable();
            $table->string('TAHUN DINILAI RISIKO')->nullable();
            $table->text('JENIS RISIKO')->nullable();
            $table->text('ENTITAS PD YANG MENILAI')->nullable();
            $table->string('NOMOR URUT RISIKO')->nullable();
            $table->text('TAHAP')->nullable();
            $table->text('PEMILIK RISIKO')->nullable();
            $table->text('URAIAN PENYEBAB RISIKO')->nullable();
            $table->text('SUMBER SEBAB RISIKO')->nullable();
            $table->string('C / UC')->nullable();
            $table->text('URAIAN DAMPAK RISIKO')->nullable();
            $table->text('PIHAK YANG TERKENA DAMPAK RISIKO')->nullable();
            $table->text('URAIAN PENGENDALIAN YANG SUDAH ADA')->nullable();
            $table->text('CELAH PENGENDALIAN')->nullable();
            $table->text('RENCANA TINDAK PENGENDALIAN')->nullable();
            $table->text('PEMILIK / PENANGGUNGJAWAB')->nullable();
            $table->string('TARGET WAKTU PENYELESAIAN')->nullable();
            $table->unsignedTinyInteger('SKALA DAMPAK')->nullable();
            $table->unsignedTinyInteger('SKALA KEMUNGKINAN')->nullable();
            $table->unsignedTinyInteger('SKALA RISIKO')->nullable();
            $table->unsignedTinyInteger('SKALA PRIORITAS')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_iro_pd');
    }
};
