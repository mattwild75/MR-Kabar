<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Usulan perubahan kaitan risiko pada 100 Program Pembangunan Bupati.
 *
 * Halaman ini menghasilkan dokumen tingkat Pemda yang ikut dicetak untuk
 * Bupati, jadi perubahannya tidak langsung berlaku bila diusulkan PIC OPD:
 * PIC mengusulkan, Admin/Super Admin yang memutuskan. Admin sendiri tidak
 * lewat tabel ini sama sekali — perubahannya langsung berlaku, sama seperti
 * sebelumnya.
 *
 * Pola kolomnya sengaja disamakan dengan risk_excel_import_requests (status,
 * reviewed_by, reviewed_at, rejection_reason) supaya alur persetujuan di
 * aplikasi ini cuma punya SATU bentuk yang perlu dipahami, bukan dua.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('program_bupati_risiko_usulan', function (Blueprint $table) {
            $table->id();

            // Nama constraint ditulis pendek secara eksplisit. Nama bawaan
            // Laravel (tabel + kolom + "_foreign") menembus batas 64 karakter
            // MySQL untuk gabungan panjang ini dan migrasinya gagal.
            $table->foreignId('program_pembangunan_bupati_id');
            $table->foreign('program_pembangunan_bupati_id', 'pbr_usulan_program_fk')
                ->references('id')->on('program_pembangunan_bupati')
                ->cascadeOnDelete();

            // Sengaja BUKAN relasi polimorfik ke satu tabel: risikonya
            // tersebar di tiga tabel berbeda (tbl_irs_pemda, tbl_irs_pd,
            // tbl_iro_pd), persis seperti kolom yang sama di
            // program_bupati_risiko.
            $table->string('risiko_tipe', 20);
            $table->unsignedBigInteger('risiko_id');

            // 'tambah' = usul mengaitkan risiko ke program.
            // 'lepas'  = usul melepas kaitan yang sudah ada.
            $table->enum('aksi', ['tambah', 'lepas']);

            $table->foreignId('user_id');
            $table->foreign('user_id', 'pbr_usulan_user_fk')
                ->references('id')->on('users')->cascadeOnDelete();

            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');

            $table->foreignId('reviewed_by')->nullable();
            $table->foreign('reviewed_by', 'pbr_usulan_peninjau_fk')
                ->references('id')->on('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('rejection_reason')->nullable();

            $table->timestamps();

            // Dipakai halaman utama utk menandai baris yang sedang menunggu
            // keputusan, dan utk daftar tinjauan Admin.
            $table->index(['status', 'created_at'], 'pbr_usulan_status_idx');
            $table->index(['program_pembangunan_bupati_id', 'status'], 'pbr_usulan_program_status_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('program_bupati_risiko_usulan');
    }
};
