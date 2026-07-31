<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Bagian "Hasil Pembinaan" untuk Laporan Komite Pengelolaan Risiko.
 *
 * Perdep PPKD 4/2019 halaman berlabel 148 sampai 149 memuat outline laporan
 * Komite dengan empat bagian: A Rencana dan Realisasi Kegiatan, B Hambatan
 * Pelaksanaan Kegiatan, C Hasil Pembinaan Terhadap Pengelolaan Risiko
 * Pemerintah Daerah, dan D Rekomendasi/Feedback bagi UPR.
 *
 * Bagian A, B, dan D sudah punya kolomnya (dipakai bersama Laporan 12 dan 13).
 * Bagian C berbeda maksudnya dari kolom `monitoring_risiko_rtp` yang dipakai
 * Laporan 12 dan 13: yang itu tentang hasil PEMANTAUAN atas pelaksanaan
 * pengendalian, sedangkan ini tentang hasil PEMBINAAN — sosialisasi,
 * bimbingan, supervisi, pelatihan, dan fasilitasi Komite kepada UPR. Menumpang
 * kolom yang sama akan membuat dua hal berbeda tersimpan di satu tempat dan
 * saling menimpa bila satu OPD mengisi keduanya.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('laporan_narasi', 'hasil_pembinaan')) {
            return;
        }

        Schema::table('laporan_narasi', function (Blueprint $table) {
            $table->text('hasil_pembinaan')->nullable()->after('monitoring_risiko_rtp');
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('laporan_narasi', 'hasil_pembinaan')) {
            Schema::table('laporan_narasi', function (Blueprint $table) {
                $table->dropColumn('hasil_pembinaan');
            });
        }
    }
};
