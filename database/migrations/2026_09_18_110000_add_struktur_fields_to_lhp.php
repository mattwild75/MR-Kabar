<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Lengkapi header LHP dengan bidang bergaya SimHP: unit APIP (Inspektorat +
 * Bidang/Unit Pengawasan), serta penanda BA Kesepakatan Obrik dan letak
 * kerugian. Kolom lain yang diminta (tahun_pkpt, kode_group_jenis_periksa,
 * kode_jenis_periksa) sudah ada sejak tabel dibuat.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Unit APIP pada header LHP.
        Schema::table('lhp', function (Blueprint $table) {
            $table->string('inspektorat', 120)->nullable()->after('nama_pj');
            $table->string('bidang_unit', 120)->nullable()->after('inspektorat');
        });

        // BA Kesepakatan Obrik & letak kerugian bersifat per-temuan (mengikuti
        // letaknya di SimHP: tepat di bawah nilai temuan).
        Schema::table('lhp_temuan', function (Blueprint $table) {
            $table->string('ba_kesepakatan', 6)->nullable()->after('nilai'); // 'ada' | 'tidak'
            $table->string('kerugian_pada', 8)->nullable()->after('ba_kesepakatan'); // 'negara' | 'daerah'
        });

        // Isi Inspektorat untuk data lama agar tidak kosong.
        \DB::table('lhp')->whereNull('inspektorat')->update(['inspektorat' => 'Inspektorat Aceh Barat']);
    }

    public function down(): void
    {
        Schema::table('lhp', function (Blueprint $table) {
            $table->dropColumn(['inspektorat', 'bidang_unit']);
        });
        Schema::table('lhp_temuan', function (Blueprint $table) {
            $table->dropColumn(['ba_kesepakatan', 'kerugian_pada']);
        });
    }
};
