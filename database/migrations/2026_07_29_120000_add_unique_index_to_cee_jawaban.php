<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Satu responden hanya boleh punya SATU jawaban per pertanyaan, untuk OPD dan
 * tahun yang sama.
 *
 * Sebelumnya aturan ini hanya dijaga di PHP dengan pola "cari dulu, kalau
 * tidak ada baru buat". Di antara mencari dan membuat ada celah: dua
 * permintaan yang berjalan bersamaan sama-sama tidak menemukan apa pun, lalu
 * sama-sama menyisipkan baris. Terbukti pada uji beban — enam permintaan
 * dengan nama responden identik menghasilkan 148 baris, bukan 37. Akibatnya
 * bukan sekadar data ganda: modus jawaban per pertanyaan ikut melenceng,
 * padahal itu dasar perhitungan Form 1a.
 *
 * Pemicu yang paling mungkin di lapangan bukan dua orang bernama sama,
 * melainkan satu orang menekan tombol Simpan dua kali.
 *
 * Kolom responden_nama memakai kolasi *_ci, jadi beda kapitalisasi sudah
 * dianggap sama oleh indeks ini; sisi PHP yang memangkas spasi sebelum
 * menyimpan menutup sisanya.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Baris ganda yang sudah terlanjur ada harus dibereskan dulu, kalau
        // tidak indeks uniknya gagal dibuat. Yang dipertahankan yang terbaru
        // (id terbesar) — sesuai perilaku lama yang menimpa jawaban lama.
        $duplikat = DB::table('cee_jawaban')
            ->selectRaw('opd_id, tahun_penilaian, cee_pertanyaan_id, responden_nama, MAX(id) AS simpan')
            ->groupBy('opd_id', 'tahun_penilaian', 'cee_pertanyaan_id', 'responden_nama')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($duplikat as $d) {
            DB::table('cee_jawaban')
                ->where('opd_id', $d->opd_id)
                ->where('tahun_penilaian', $d->tahun_penilaian)
                ->where('cee_pertanyaan_id', $d->cee_pertanyaan_id)
                ->where('responden_nama', $d->responden_nama)
                ->where('id', '!=', $d->simpan)
                ->delete();
        }

        Schema::table('cee_jawaban', function (Blueprint $table) {
            $table->unique(
                ['opd_id', 'tahun_penilaian', 'cee_pertanyaan_id', 'responden_nama'],
                'cee_jawaban_responden_unique',
            );
        });
    }

    public function down(): void
    {
        Schema::table('cee_jawaban', function (Blueprint $table) {
            $table->dropUnique('cee_jawaban_responden_unique');
        });
    }
};
