<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Skala Aktual/Treated (hasil re-assessment risiko saat monitoring RTP
     * berjalan) DIPINDAHKAN dari tabel risiko (IrsPemda/IrsPd/IroPd) ke
     * sini — levelnya PER RTP (bukan per risiko), krn satu risiko bisa
     * py lebih dari satu RTP yg masing2 dipantau & dinilai efektivitasnya
     * sendiri-sendiri. Kolom lama SKALA ... AKTUAL di tabel risiko TETAP
     * ada (tidak dihapus, lihat migrasi terpisah kalau nanti perlu di-
     * deprecate) — hanya SUMBER INPUT-nya yg pindah ke Form 9 di sini,
     * bukan migrasi data existing (kolom lama sudah nyaris semua kosong
     * krn fitur ini baru saja dirilis, lihat commit "Tambah Skor Risiko
     * 4-Tahap").
     */
    public function up(): void
    {
        Schema::table('monitoring_rtp', function (Blueprint $table) {
            $table->string('kategori_existing_control_aktual')->nullable()->after('keterangan_pemantauan');
            $table->unsignedTinyInteger('skala_dampak_aktual')->nullable()->after('kategori_existing_control_aktual');
            $table->unsignedTinyInteger('skala_kemungkinan_aktual')->nullable()->after('skala_dampak_aktual');
            $table->unsignedTinyInteger('skala_risiko_aktual')->nullable()->after('skala_kemungkinan_aktual');
        });
    }

    public function down(): void
    {
        Schema::table('monitoring_rtp', function (Blueprint $table) {
            $table->dropColumn([
                'kategori_existing_control_aktual',
                'skala_dampak_aktual',
                'skala_kemungkinan_aktual',
                'skala_risiko_aktual',
            ]);
        });
    }
};
