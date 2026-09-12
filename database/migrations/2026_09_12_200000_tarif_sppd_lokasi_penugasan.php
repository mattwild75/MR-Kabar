<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Tarif per hari adalah tarif SPPD — hanya hari Luar Kantor (LK) yang
 * dibayar, dan besarnya bergantung lokasi penugasan: di dalam Kecamatan
 * Johan Pahlawan (Meulaboh) Rp100.000, di luar kecamatan Rp140.000
 * (arahan 12 September 2026).
 *
 * Kolom `lokasi` pada penugasan menyimpan hasil penetapan (dalam/luar);
 * kosong berarti ditentukan otomatis dari teks obrik (RppPenugasan::lokasiTampil).
 * Data lama: dokumen bertarif 140.000/100.000 dari berkas RPP 2025 menjadi
 * patokan lokasinya; selebihnya ditebak dari teks dan boleh dikoreksi di
 * formulir.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rpp_settings', function (Blueprint $table) {
            $table->unsignedBigInteger('tarif_luar_kota')->default(140000)->after('tarif_per_hari');
        });
        Schema::table('rpp_penugasan', function (Blueprint $table) {
            $table->enum('lokasi', ['dalam', 'luar'])->nullable()->after('sifat');
        });

        DB::table('rpp_settings')->update(['tarif_per_hari' => 100000, 'tarif_luar_kota' => 140000]);

        // Patokan dari berkas asli: tarif dokumen 140.000 = luar kota, 100.000 = dalam kota.
        DB::statement("UPDATE rpp_penugasan p JOIN rpps r ON r.id = p.rpp_id SET p.lokasi = 'luar' WHERE r.tarif_per_hari = 140000");
        DB::statement("UPDATE rpp_penugasan p JOIN rpps r ON r.id = p.rpp_id SET p.lokasi = 'dalam' WHERE r.tarif_per_hari = 100000");
    }

    public function down(): void
    {
        Schema::table('rpp_penugasan', fn (Blueprint $table) => $table->dropColumn('lokasi'));
        Schema::table('rpp_settings', fn (Blueprint $table) => $table->dropColumn('tarif_luar_kota'));
    }
};
