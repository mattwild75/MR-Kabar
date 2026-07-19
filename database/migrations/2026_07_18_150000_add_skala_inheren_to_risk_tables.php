<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Skala Risiko INHEREN (sebelum mempertimbangkan pengendalian yang
     * sudah ada) — Perdep PPKD No.4/2019 Pasal 1 angka 10 mendefinisikan
     * "Sisa Risiko" sebagai risiko SETELAH mempertimbangkan pengendalian
     * yang ada, secara implisit membedakannya dari risiko inheren
     * (sebelum pengendalian). Kolom SKALA DAMPAK/KEMUNGKINAN/RISIKO yang
     * SUDAH ADA di ketiga tabel ini SELALU berarti skala RESIDUAL (dinilai
     * dengan mempertimbangkan KATEGORI EXISTING CONTROL) — tidak pernah
     * ada snapshot "sebelum pengendalian" tersimpan di mana pun.
     *
     * Kolom baru ini OPSIONAL/nullable — PIC boleh mengisi manual saat
     * identifikasi risiko (skala seandainya TANPA pengendalian yang ada),
     * dipakai widget Dashboard "Risiko Inheren vs Sisa Risiko" untuk
     * menampilkan efektivitas pengendalian. Baris lama/tidak diisi PIC
     * tetap null — widget dashboard mengabaikan baris yang skala
     * inherennya belum diisi (bukan dianggap 0).
     *
     * SKALA RISIKO INHEREN dihitung ulang otomatis dari matriks yang sama
     * (RiskMatrixCell) — sama pola dgn SKALA RISIKO residual yg sudah ada,
     * BUKAN kolom bebas diisi manual, supaya konsisten dgn definisi
     * matriks yg berlaku (bisa berubah kalau Admin edit Settings >
     * Keterangan Pendukung).
     */
    public function up(): void
    {
        foreach (['tbl_irs_pemda', 'tbl_irs_pd', 'tbl_iro_pd'] as $table) {
            Schema::table($table, function (Blueprint $t) use ($table) {
                if (!Schema::hasColumn($table, 'SKALA DAMPAK INHEREN')) {
                    $t->unsignedTinyInteger('SKALA DAMPAK INHEREN')->nullable()->after('SKALA PRIORITAS');
                }
                if (!Schema::hasColumn($table, 'SKALA KEMUNGKINAN INHEREN')) {
                    $t->unsignedTinyInteger('SKALA KEMUNGKINAN INHEREN')->nullable()->after('SKALA DAMPAK INHEREN');
                }
                if (!Schema::hasColumn($table, 'SKALA RISIKO INHEREN')) {
                    $t->unsignedTinyInteger('SKALA RISIKO INHEREN')->nullable()->after('SKALA KEMUNGKINAN INHEREN');
                }
            });
        }
    }

    public function down(): void
    {
        foreach (['tbl_irs_pemda', 'tbl_irs_pd', 'tbl_iro_pd'] as $table) {
            Schema::table($table, function (Blueprint $t) use ($table) {
                foreach (['SKALA DAMPAK INHEREN', 'SKALA KEMUNGKINAN INHEREN', 'SKALA RISIKO INHEREN'] as $col) {
                    if (Schema::hasColumn($table, $col)) {
                        $t->dropColumn($col);
                    }
                }
            });
        }
    }
};
