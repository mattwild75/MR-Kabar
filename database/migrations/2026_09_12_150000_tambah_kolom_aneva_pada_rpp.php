<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Kolom untuk sisi Analisis dan Evaluasi (aneva) — realisasi tiap penugasan
 * seperti pada REKAP LAPORAN RPP <tahun>.xlsx Bagian Analisis dan Evaluasi:
 * laporan terbit per obrik, keterangan (Batal/pending/jenis laporan), status
 * "batal", dan jejak kapan penugasan terakhir disamakan dengan rekap aneva.
 *
 * Sengaja TIDAK membuat tabel aneva tersendiri: aneva dan perencanaan adalah
 * dua sisi dari penugasan yang sama (RPP → ST → LHP). Satu tabel berarti
 * angka di halaman Perencanaan dan Analisis-Evaluasi tidak pernah berbeda.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rpp_penugasan', function (Blueprint $table) {
            $table->string('keterangan')->nullable()->after('capaian_output');
            $table->timestamp('sinkron_aneva_pada')->nullable()->after('keterangan');
        });
        DB::statement("ALTER TABLE rpp_penugasan MODIFY status ENUM('draft','st_terbit','selesai','lhp_terbit','batal') NOT NULL DEFAULT 'draft'");

        Schema::table('rpp_laporans', function (Blueprint $table) {
            $table->foreignId('rpp_obrik_id')->nullable()->after('rpp_penugasan_id')->constrained('rpp_obriks')->nullOnDelete();
            $table->string('jenis', 12)->nullable()->after('nomor_laporan');
        });
    }

    public function down(): void
    {
        Schema::table('rpp_laporans', function (Blueprint $table) {
            $table->dropConstrainedForeignId('rpp_obrik_id');
            $table->dropColumn('jenis');
        });
        DB::statement("UPDATE rpp_penugasan SET status = 'draft' WHERE status = 'batal'");
        DB::statement("ALTER TABLE rpp_penugasan MODIFY status ENUM('draft','st_terbit','selesai','lhp_terbit') NOT NULL DEFAULT 'draft'");
        Schema::table('rpp_penugasan', fn (Blueprint $table) => $table->dropColumn(['keterangan', 'sinkron_aneva_pada']));
    }
};
