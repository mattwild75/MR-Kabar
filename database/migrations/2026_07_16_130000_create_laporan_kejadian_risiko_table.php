<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('laporan_kejadian_risiko', function (Blueprint $table) {
            $table->id();

            // Identitas pelapor — bebas isi manual (akun LAPOR dipakai
            // bergantian, jadi identitas sebenarnya BUKAN akun login,
            // melainkan isian form ini).
            $table->string('nama_lengkap');
            $table->string('email')->nullable();
            $table->string('no_hp')->nullable();

            $table->foreignId('opd_id')->nullable()->constrained('opd')->nullOnDelete();

            $table->text('kejadian');
            $table->dateTime('waktu_kejadian');
            $table->string('tempat')->nullable();
            $table->text('pemicu')->nullable();

            // Mode "cek risiko yang sudah terjadi": pelapor memilih risiko
            // terdaftar (SATU dari salah satu sumber) yang relevan dengan
            // kejadian ini. Ketiganya nullable & morph-like via 2 kolom
            // (tipe + id) karena berasal dari 3 tabel model berbeda
            // (tbl_irs_pemda / tbl_irs_pd / tbl_iro_pd) yang tidak
            // memungkinkan 1 foreign key tunggal.
            $table->string('risiko_terdaftar_tipe')->nullable();
            $table->unsignedBigInteger('risiko_terdaftar_id')->nullable();

            // Status tindak lanjut oleh PIC OPD/admin/super-admin.
            $table->string('status')->default('baru'); // baru, diverifikasi, ditindaklanjuti, selesai
            $table->text('catatan_tindak_lanjut')->nullable();
            $table->foreignId('ditindaklanjuti_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('ditindaklanjuti_at')->nullable();

            $table->foreignId('dilaporkan_oleh_user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['risiko_terdaftar_tipe', 'risiko_terdaftar_id'], 'lkr_risiko_terdaftar_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('laporan_kejadian_risiko');
    }
};
