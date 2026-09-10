<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Nomor tiket, tiga tingkat kerahasiaan, dan utas tanya-jawab.
 *
 * MASALAH YANG DIPERBAIKI. Versi pertama formulir lapor kecurangan menyediakan
 * pilihan anonim tanpa menyediakan cara menghubungi balik — sehingga laporan
 * anonim benar-benar putus begitu terkirim. Padahal Inspektorat menerima
 * laporan anonim sebagai dasar penelaahan, dan penelaahan hampir selalu
 * memunculkan pertanyaan lanjutan.
 *
 * CARANYA: NOMOR TIKET + KODE AKSES, pola baku pada Whistleblowing System
 * pemerintah. Pelapor menerima keduanya sekali saat mengirim, menyimpannya
 * sendiri, lalu kembali untuk melihat perkembangan dan MENJAWAB pertanyaan
 * penindaklanjut — tanpa pernah menyebut siapa dirinya. Komunikasinya dua arah,
 * kerahasiaannya utuh.
 *
 * KODE AKSES DISIMPAN SEBAGAI HASH, bukan teks. Kalau tersimpan apa adanya,
 * siapa pun yang bisa membaca basis data bisa membuka utas pelapor mana pun dan
 * menyamar sebagai dirinya. Konsekuensinya kode itu TIDAK BISA DIPULIHKAN kalau
 * hilang — dan itu memang harganya: memulihkannya menuntut identitas, persis
 * yang sedang dijaga.
 *
 * TIGA TINGKAT, bukan dua. "Anonim" sebelumnya menggabungkan dua orang yang
 * berbeda kebutuhan: yang tidak mau namanya muncul di berkas, dan yang tidak
 * mau dihubungi sama sekali. Yang pertama biasanya bersedia dihubungi
 * Inspektorat — memaksanya memilih salah satu ujung membuat sebagian orang
 * memilih tidak melapor sama sekali.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('laporan_kecurangan', function (Blueprint $table) {
            // terbuka | anonim_kontak | anonim_penuh
            $table->string('mode_pelapor')->default('terbuka')->after('anonim');

            $table->string('nomor_tiket')->nullable()->unique()->after('id');
            $table->string('kode_akses_hash')->nullable()->after('nomor_tiket');
        });

        // Baris yang sudah ada (kalau ada) mengikuti kolom `anonim` lamanya,
        // lalu kolom itu DIBUANG. Membiarkan keduanya berarti dua sumber
        // kebenaran untuk satu hal, dan cepat atau lambat keduanya berbeda.
        DB::table('laporan_kecurangan')->where('anonim', true)->update(['mode_pelapor' => 'anonim_penuh']);
        DB::table('laporan_kecurangan')->where('anonim', false)->update(['mode_pelapor' => 'terbuka']);

        Schema::table('laporan_kecurangan', function (Blueprint $table) {
            $table->dropColumn('anonim');
        });

        Schema::create('pesan_laporan_kecurangan', function (Blueprint $table) {
            $table->id();

            $table->foreignId('laporan_kecurangan_id')->constrained('laporan_kecurangan')->cascadeOnDelete();

            // 'penindaklanjut' atau 'pelapor'. Disimpan sebagai peran, BUKAN
            // sebagai user_id, karena pelapor anonim memang tidak punya akun —
            // ia menulis lewat tiketnya.
            $table->string('dari');

            // Hanya terisi untuk pesan dari penindaklanjut. Pesan pelapor
            // sengaja tidak menyimpan penulisnya sama sekali.
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->text('isi');

            $table->timestamps();

            $table->index(['laporan_kecurangan_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pesan_laporan_kecurangan');

        Schema::table('laporan_kecurangan', function (Blueprint $table) {
            $table->boolean('anonim')->default(false);
        });

        DB::table('laporan_kecurangan')->where('mode_pelapor', '!=', 'terbuka')->update(['anonim' => true]);

        Schema::table('laporan_kecurangan', function (Blueprint $table) {
            $table->dropUnique(['nomor_tiket']);
            $table->dropColumn(['mode_pelapor', 'nomor_tiket', 'kode_akses_hash']);
        });
    }
};
