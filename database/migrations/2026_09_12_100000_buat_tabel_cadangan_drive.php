<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tautan Google Drive untuk cadangan basis data — satu baris saja.
 *
 * Kredensial OAuth (client_secret) dan refresh_token disimpan terenkripsi
 * lewat cast model, bukan apa adanya: dump basis data ini sendiri ikut masuk
 * ke cadangan, dan cadangan yang memuat kunci ke tempat penyimpanannya sendiri
 * sama saja dengan tidak dikunci.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cadangan_drive', function (Blueprint $table) {
            $table->id();
            $table->string('client_id')->nullable();
            $table->text('client_secret')->nullable();
            $table->text('refresh_token')->nullable();
            $table->string('akun_email')->nullable();
            $table->string('folder_id')->nullable();
            $table->string('folder_nama')->default('Cadangan MR Kabar');
            $table->timestamp('tautan_pada')->nullable();
            $table->boolean('unggah_otomatis')->default(true);
            $table->unsignedSmallInteger('simpan_terakhir')->default(30);
            $table->timestamp('terakhir_unggah')->nullable();
            $table->string('terakhir_hasil', 500)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cadangan_drive');
    }
};
