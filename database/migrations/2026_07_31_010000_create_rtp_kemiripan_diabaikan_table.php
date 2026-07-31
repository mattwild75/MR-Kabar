<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pasangan RTP yang sudah diperiksa dan dinyatakan memang berbeda.
 *
 * Perdep PPKD 4/2019 meminta dokumen RTP akhir diselaraskan agar tidak
 * duplikatif, sebab RTP perbaikan lingkungan pengendalian (dari CEE) dan RTP
 * perbaikan kegiatan pengendalian (dari register risiko) bisa menghasilkan
 * kebutuhan pengendalian yang sama.
 *
 * Kemiripan hanya DITANDAI, tidak pernah memblokir penyimpanan: pencocokan
 * kalimat tidak akan pernah selalu benar, dan menghalangi orang bekerja karena
 * tebakan mesin lebih merugikan daripada satu lencana yang tidak perlu. Tabel
 * ini menyimpan pasangan yang sudah ditinjau manusia supaya lencananya tidak
 * muncul lagi dan tidak menjadi bising.
 *
 * Pasangan disimpan dalam urutan yang sudah dibakukan (lihat
 * RtpKemiripanDiabaikan::kunci) agar A-B dan B-A tidak tersimpan dua kali.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('rtp_kemiripan_diabaikan')) {
            return;
        }

        Schema::create('rtp_kemiripan_diabaikan', function (Blueprint $table) {
            $table->id();
            // Tipe sumber RTP: irs_pemda, irs_pd, iro_pd, atau cee_rtp.
            // Sengaja TIDAK memakai foreign key: keempat sumber ada di tabel
            // berbeda, jadi relasinya polimorfik dan tidak bisa dijamin
            // database. Baris yatim tidak berbahaya — hanya menandai pasangan
            // yang salah satunya sudah terhapus, dan tidak akan pernah cocok
            // dengan pasangan mana pun yang masih ada.
            $table->string('tipe_a', 20);
            $table->unsignedBigInteger('id_a');
            $table->string('tipe_b', 20);
            $table->unsignedBigInteger('id_b');
            $table->foreignId('diabaikan_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->string('alasan', 500)->nullable();
            $table->timestamps();

            $table->unique(['tipe_a', 'id_a', 'tipe_b', 'id_b'], 'rtp_kemiripan_pasangan_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rtp_kemiripan_diabaikan');
    }
};
