<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pre-test dan post-test langsung (/edukasi/tes).
 *
 * Satu PELATIHAN (angkatan bimtek) punya dua SESI: pre dan post. Peserta
 * bergabung ke sesi dengan token yang diketik pemandu sendiri, mengisi
 * biodata, lalu menjawab A-D setiap kali pemandu membuka soal di layar
 * proyektor. Soal, kunci, dan pembahasan TIDAK pernah ditulis di kode
 * (repositori GitHub bersifat publik): bank soal diimpor lewat halaman
 * Kelola dan hanya hidup di basis data.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tes_pelatihan', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 150);
            $table->date('tanggal')->nullable();
            $table->string('tempat', 150)->nullable();
            $table->foreignId('dibuat_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('tes_sesi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pelatihan_id')->constrained('tes_pelatihan')->cascadeOnDelete();
            $table->enum('jenis', ['pre', 'post']);
            // Token disimpan terenkripsi (bisa ditampilkan ulang di layar
            // tayang), dan dicari lewat sidiknya: nilai terenkripsi tidak
            // bisa dipakai di WHERE.
            $table->text('token');
            $table->char('token_hash', 64)->index();
            // Nama berkas status publik (storage/app/public/tes/{kunci}.json)
            // yang dibaca ponsel peserta; acak, jadi tidak bisa ditebak.
            $table->char('kunci_publik', 40)->unique();
            $table->enum('status', ['draf', 'lobi', 'berjalan', 'selesai'])->default('draf');
            $table->unsignedTinyInteger('soal_aktif')->nullable();
            $table->boolean('soal_terbuka')->default(false);
            // Milidetik epoch saat soal aktif pertama kali dibuka (jam server);
            // dasar pengukuran waktu menjawab.
            $table->unsignedBigInteger('soal_dibuka_ms')->nullable();
            $table->boolean('tampilkan_jawaban')->default(false);
            $table->unsignedInteger('versi')->default(0);
            $table->timestamp('mulai_pada')->nullable();
            $table->timestamp('selesai_pada')->nullable();
            $table->timestamps();
            $table->unique(['pelatihan_id', 'jenis']);
        });

        Schema::create('tes_soal', function (Blueprint $table) {
            $table->id();
            $table->enum('jenis', ['pre', 'post']);
            $table->unsignedTinyInteger('nomor');
            $table->unsignedTinyInteger('bagian');
            $table->string('indikator', 200);
            $table->text('pertanyaan');
            $table->text('pilihan_a');
            $table->text('pilihan_b');
            $table->text('pilihan_c');
            $table->text('pilihan_d');
            $table->char('kunci', 1);
            $table->text('pembahasan')->nullable();
            $table->timestamps();
            $table->unique(['jenis', 'nomor']);
        });

        Schema::create('tes_peserta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sesi_id')->constrained('tes_sesi')->cascadeOnDelete();
            // Sidik kuki perangkat: memulihkan peserta yang sesinya hilang
            // (ponsel dimuat ulang, sesi login aplikasi berakhir) tanpa
            // menyimpan apa pun yang bisa dipakai di luar tes ini.
            $table->char('perangkat_hash', 64)->index();
            $table->string('nama', 150)->nullable();
            $table->string('nip', 18)->nullable();
            $table->boolean('bukan_asn')->default(false);
            $table->string('jabatan', 150)->nullable();
            $table->foreignId('opd_id')->nullable()->constrained('opd')->nullOnDelete();
            $table->string('instansi_lain', 150)->nullable();
            $table->timestamp('biodata_pada')->nullable();
            $table->timestamp('terakhir_aktif')->nullable();
            $table->boolean('di_halaman')->default(true);
            $table->unsignedSmallInteger('jumlah_keluar')->default(0);
            $table->unsignedSmallInteger('pindah_perangkat')->default(0);
            $table->timestamp('dikeluarkan_pada')->nullable();
            $table->timestamps();
            $table->unique(['sesi_id', 'nip']);
        });

        Schema::create('tes_jawaban', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sesi_id')->constrained('tes_sesi')->cascadeOnDelete();
            $table->foreignId('peserta_id')->constrained('tes_peserta')->cascadeOnDelete();
            $table->unsignedTinyInteger('nomor');
            $table->char('pilihan', 1);
            $table->unsignedInteger('waktu_ms');
            $table->unsignedSmallInteger('diubah')->default(0);
            $table->timestamp('dijawab_pada')->nullable();
            $table->timestamps();
            $table->unique(['peserta_id', 'nomor']);
            $table->index(['sesi_id', 'nomor']);
        });

        Schema::create('tes_video', function (Blueprint $table) {
            $table->id();
            $table->enum('jenis', ['pre', 'post'])->unique();
            $table->string('berkas')->nullable();
            // Detik berhenti untuk soal 1..20, berurutan.
            $table->json('isyarat')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tes_video');
        Schema::dropIfExists('tes_jawaban');
        Schema::dropIfExists('tes_peserta');
        Schema::dropIfExists('tes_soal');
        Schema::dropIfExists('tes_sesi');
        Schema::dropIfExists('tes_pelatihan');
    }
};
