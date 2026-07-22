<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Skor Risiko 4-Tahap — melengkapi Inheren & Residual yang sudah ada
     * dengan dua tahap lanjutan siklus RTP (plan -> act -> check):
     *
     * - TARGET (proyeksi): skala yang DIHARAPKAN tercapai setelah RTP yang
     *   direncanakan benar-benar dijalankan. K_target dihitung otomatis =
     *   round(K_inheren x faktor reduksi KATEGORI PROYEKSI RTP), D_target
     *   default menyalin D_inheren — keduanya tetap bisa di-override
     *   manual (mis. RTP yang sifatnya Mitigate/mengurangi dampak).
     *
     * - AKTUAL (treated): skala hasil re-assessment SETELAH RTP berjalan,
     *   dinilai saat pemantauan — kategori efektivitasnya TERPISAH
     *   (KATEGORI EXISTING CONTROL AKTUAL) karena efektivitas riil bisa
     *   berbeda dari yang diproyeksikan. Gap Target vs Aktual adalah
     *   insight utama: "OPD janji turun ke X, kenyataannya cuma ke Y".
     *
     * Basis perkalian faktor reduksi SELALU Skala Kemungkinan INHEREN
     * (titik awal "tanpa kontrol"), BUKAN residual — tiga kategori
     * efektivitas (existing/proyeksi/aktual) adalah tiga penilaian
     * independen atas kondisi kontrol pada tiga titik waktu berbeda,
     * bukan pengurangan berjenjang. Semua kolom nullable — baris lama
     * tetap null sampai PIC mengisinya, tidak ada migrasi data.
     */
    public function up(): void
    {
        foreach (['tbl_irs_pemda', 'tbl_irs_pd', 'tbl_iro_pd'] as $table) {
            Schema::table($table, function (Blueprint $t) use ($table) {
                if (!Schema::hasColumn($table, 'KATEGORI PROYEKSI RTP')) {
                    $t->string('KATEGORI PROYEKSI RTP')->nullable()->after('SKALA RISIKO INHEREN');
                }
                if (!Schema::hasColumn($table, 'SKALA DAMPAK TARGET')) {
                    $t->unsignedTinyInteger('SKALA DAMPAK TARGET')->nullable()->after('KATEGORI PROYEKSI RTP');
                }
                if (!Schema::hasColumn($table, 'SKALA KEMUNGKINAN TARGET')) {
                    $t->unsignedTinyInteger('SKALA KEMUNGKINAN TARGET')->nullable()->after('SKALA DAMPAK TARGET');
                }
                if (!Schema::hasColumn($table, 'SKALA RISIKO TARGET')) {
                    $t->unsignedTinyInteger('SKALA RISIKO TARGET')->nullable()->after('SKALA KEMUNGKINAN TARGET');
                }
                if (!Schema::hasColumn($table, 'KATEGORI EXISTING CONTROL AKTUAL')) {
                    $t->string('KATEGORI EXISTING CONTROL AKTUAL')->nullable()->after('SKALA RISIKO TARGET');
                }
                if (!Schema::hasColumn($table, 'SKALA DAMPAK AKTUAL')) {
                    $t->unsignedTinyInteger('SKALA DAMPAK AKTUAL')->nullable()->after('KATEGORI EXISTING CONTROL AKTUAL');
                }
                if (!Schema::hasColumn($table, 'SKALA KEMUNGKINAN AKTUAL')) {
                    $t->unsignedTinyInteger('SKALA KEMUNGKINAN AKTUAL')->nullable()->after('SKALA DAMPAK AKTUAL');
                }
                if (!Schema::hasColumn($table, 'SKALA RISIKO AKTUAL')) {
                    $t->unsignedTinyInteger('SKALA RISIKO AKTUAL')->nullable()->after('SKALA KEMUNGKINAN AKTUAL');
                }
            });
        }
    }

    public function down(): void
    {
        foreach (['tbl_irs_pemda', 'tbl_irs_pd', 'tbl_iro_pd'] as $table) {
            Schema::table($table, function (Blueprint $t) use ($table) {
                foreach ([
                    'KATEGORI PROYEKSI RTP',
                    'SKALA DAMPAK TARGET', 'SKALA KEMUNGKINAN TARGET', 'SKALA RISIKO TARGET',
                    'KATEGORI EXISTING CONTROL AKTUAL',
                    'SKALA DAMPAK AKTUAL', 'SKALA KEMUNGKINAN AKTUAL', 'SKALA RISIKO AKTUAL',
                ] as $col) {
                    if (Schema::hasColumn($table, $col)) {
                        $t->dropColumn($col);
                    }
                }
            });
        }
    }
};
