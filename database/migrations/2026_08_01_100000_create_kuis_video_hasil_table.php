<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Jawaban kuis uji pemahaman video edukasi.
 *
 * Sebelumnya kuisnya murni berjalan di peramban: jawabannya hilang begitu
 * halaman dimuat ulang, sehingga rencana "lihat hasilnya di halaman Panduan
 * milik Admin" tidak mungkin terjadi.
 *
 * Yang disimpan bukan sekadar nilai akhir, melainkan pilihan pada SETIAP
 * pertanyaan. Nilai akhir tidak menjawab pertanyaan yang sebenarnya dicari:
 * bagian video mana yang gagal dipahami banyak orang.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kuis_video_hasil', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // Disalin saat pengisian, bukan dibaca lewat relasi: nama dan OPD
            // pengisi harus tetap terbaca pada rekap sekalipun akunnya nanti
            // dihapus atau dipindah ke OPD lain.
            $table->string('nama_pengisi');
            $table->string('opd_nama')->nullable();
            $table->json('jawaban');          // indeks pilihan per soal, urut
            $table->unsignedTinyInteger('benar');
            $table->unsignedTinyInteger('total');
            $table->timestamps();

            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kuis_video_hasil');
    }
};
