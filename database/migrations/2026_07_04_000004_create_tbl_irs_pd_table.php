<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Risiko Strategis Perangkat Daerah — identik strukturnya dengan
     * tbl_irs_pemda, kecuali kolom pertama merujuk ke SASARAN STRATEGIS PD
     * (dari tbl_krs_pd, bersumber dari Renstra OPD) bukan Sasaran RPJMD.
     */
    public function up(): void
    {
        Schema::create('tbl_irs_pd', function (Blueprint $table) {
            $table->id();
            $table->text('SASARAN RENSTRA')->nullable();
            $table->text('URAIAN RISIKO')->nullable();
            $table->string('TINGKAT RISIKO')->nullable();
            $table->string('TAHUN DINILAI RISIKO')->nullable();
            $table->text('JENIS RISIKO')->nullable();
            $table->text('ENTITAS PD YANG MENILAI')->nullable();
            $table->string('NOMOR URUT RISIKO')->nullable();
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
        Schema::dropIfExists('tbl_irs_pd');
    }
};
