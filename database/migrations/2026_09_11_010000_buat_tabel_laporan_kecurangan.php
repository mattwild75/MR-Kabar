<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Lapor Dugaan Kecurangan — pintu masuk publik untuk MR Fraud.
 *
 * Dasar: Perdep BPKP Bidang Investigasi No. 1 Tahun 2019 dan Perbup Aceh Barat
 * No. 6 Tahun 2025 tentang Pengendalian Kecurangan.
 *
 * KENAPA TABEL SENDIRI, BUKAN MENUMPANG `laporan_kejadian_risiko`. Keduanya
 * memang sama-sama "laporan kejadian", tetapi berbeda pada hal yang paling
 * menentukan bentuknya:
 *
 *   - Pelapor kecurangan boleh ANONIM. Laporan kejadian risiko biasa selalu
 *     menyertakan nama dan kontak pelapornya. Menyatukan keduanya memaksa
 *     kolom identitas jadi opsional untuk semua, dan menghapus pembeda yang
 *     justru penting.
 *   - Laporan kecurangan menuntut unsur yang tidak ada pada laporan biasa:
 *     pihak yang diduga terlibat, kronologi, dugaan delik, dan perkiraan
 *     kerugian.
 *   - Keduanya ditindaklanjuti pihak berbeda dan tidak boleh tercampur dalam
 *     satu rekap.
 *
 * PERLINDUNGAN PELAPOR. Kolom identitas boleh kosong, dan ketika `anonim`
 * bernilai benar, ketiganya memang tidak diisi sama sekali — bukan diisi lalu
 * disembunyikan di tampilan. Identitas yang tersimpan tapi "tidak ditampilkan"
 * tetap terbaca oleh siapa pun yang bisa membuka basis data.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('laporan_kecurangan', function (Blueprint $table) {
            $table->id();

            // --- Pelapor ---
            $table->boolean('anonim')->default(false);
            $table->string('nama_pelapor')->nullable();
            $table->string('email')->nullable();
            $table->string('no_hp')->nullable();

            // --- Yang dilaporkan ---
            $table->foreignId('opd_id')->nullable()->constrained('opd')->nullOnDelete();
            $table->string('tahapan_proses')->nullable();

            // Dugaan delik menurut UU No. 31/1999 jo. UU No. 20/2001. Daftar,
            // karena satu kejadian sah memuat lebih dari satu delik.
            $table->json('dugaan_kelompok')->nullable();

            // Unsur 4W1H yang dituntut pedoman: apa, di mana, kapan, siapa,
            // bagaimana.
            $table->text('uraian_kejadian');
            $table->string('tempat')->nullable();
            $table->dateTime('waktu_kejadian')->nullable();
            $table->text('pihak_terlibat')->nullable();
            $table->text('kronologi')->nullable();

            $table->string('perkiraan_kerugian')->nullable();
            $table->text('bukti_keterangan')->nullable();

            // Tautan ke baris register risiko kecurangan, kalau kejadiannya
            // ternyata risiko yang sudah teridentifikasi. Diisi penindaklanjut,
            // bukan pelapor.
            $table->foreignId('fraud_risiko_id')->nullable()->constrained('fraud_risiko')->nullOnDelete();

            // --- Tindak lanjut ---
            $table->string('status')->default('baru');
            $table->text('catatan_tindak_lanjut')->nullable();
            $table->foreignId('ditindaklanjuti_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('ditindaklanjuti_at')->nullable();

            // Akun yang dipakai saat mengirim — untuk laporan lewat QR ini
            // adalah akun bersama LAPOR, jadi BUKAN identitas pelapor.
            $table->foreignId('dilaporkan_oleh_user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('laporan_kecurangan');
    }
};
