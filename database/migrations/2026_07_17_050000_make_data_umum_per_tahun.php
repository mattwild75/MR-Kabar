<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * DataUmum SEBELUMNYA 1 baris per user (unique user_id) — nama PIC/TTD
     * yg tersimpan SELALU versi TERKINI, tidak ada riwayat per Tahun
     * Penilaian. Akibatnya ganti tahun di picker Form Cetak (2a/2b/2c/3a-3c/
     * 4/5) TIDAK PERNAH mengubah nama PIC yg tampil, walau PIC th 2026 &
     * 2027 bisa beda org. Migration ini mengubah DataUmum jadi PER-TAHUN:
     * unique (user_id, tahun_penilaian) — satu user bisa py banyak baris,
     * satu per Tahun Penilaian yg pernah dia isi.
     *
     * Backfill baris LAMA: tahun_penilaian diisi tahun_penilaian AKTIF
     * (dari pengaturan_pemda) SAAT MIGRATION INI DIJALANKAN — BUKAN
     * fallback "berlaku semua tahun", krn itu cuma memindahkan bug yg
     * sama (baris sembarang tahun dipakai utk tahun manapun yg diminta).
     * Histori PIC tahun2 SEBELUM migration ini memang tidak pernah
     * tersimpan & tidak bisa direkonstruksi — user PIC ybs perlu
     * melengkapi Data Umum utk tahun2 yg belum py baris, sesuai filosofi
     * "PIC ybs yg melengkapi, bukan perbaikan kode" yg sudah dipakai di
     * CetakRisikoController::dataUmumForOpd().
     */
    public function up(): void
    {
        $tahunAktif = DB::table('pengaturan_pemda')->value('tahun_penilaian') ?: '2026';

        DB::table('data_umum')
            ->whereNull('tahun_penilaian')
            ->orWhere('tahun_penilaian', '')
            ->update(['tahun_penilaian' => $tahunAktif]);

        Schema::table('data_umum', function (Blueprint $table) use ($tahunAktif) {
            $table->string('tahun_penilaian')->nullable(false)->default($tahunAktif)->change();
        });

        // Index unique(user_id) SAAT INI dipakai sbg backing index utk FK
        // constraint user_id->users.id — MySQL menolak drop-nya langsung
        // (error 1553) selama tidak ada index lain yg bisa jadi backing FK
        // tsb. Urutan aman: tambah unique COMPOSITE dulu (jadi backing index
        // baru yg jg valid utk FK krn user_id ada di posisi pertama), BARU
        // drop unique(user_id) yg lama.
        Schema::table('data_umum', function (Blueprint $table) {
            $table->unique(['user_id', 'tahun_penilaian']);
        });

        Schema::table('data_umum', function (Blueprint $table) {
            $table->dropUnique(['user_id']);
        });
    }

    /**
     * Reverse DESTRUKTIF kalau sudah ada >1 baris per user (data hasil
     * pemakaian normal pasca-migrasi) — tidak ada usaha mengembalikan jadi
     * 1 baris/user, cukup restore constraint lama; baris duplikat per user
     * akan GAGAL constraint unique(user_id) kalau memang ada >1 baris,
     * shg rollback ini hanya aman dijalankan SEGERA setelah up() (sebelum
     * ada data multi-tahun baru).
     */
    public function down(): void
    {
        Schema::table('data_umum', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'tahun_penilaian']);
        });

        Schema::table('data_umum', function (Blueprint $table) {
            $table->string('tahun_penilaian')->nullable()->default(null)->change();
            $table->unique(['user_id']);
        });
    }
};
