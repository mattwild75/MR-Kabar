<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Rekapan laporan troubleshoot (kendala/bug/saran) yang dikirim user lewat
     * form di footer. Dilihat & dikelola oleh admin/super-admin lewat menu
     * Utilities => Troubleshoot.
     */
    public function up(): void
    {
        Schema::create('troubleshoot_reports', function (Blueprint $table) {
            $table->id();
            // Pelapor. nullOnDelete agar riwayat laporan tetap ada meski akun
            // pelapor dihapus (kolom user_id jadi NULL, bukan ikut terhapus).
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('subject');
            // bug | error | saran | lainnya
            $table->string('category')->default('lainnya');
            $table->text('description');
            // baru | diproses | selesai — dikelola admin dari halaman rekapan.
            $table->string('status')->default('baru');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('troubleshoot_reports');
    }
};
