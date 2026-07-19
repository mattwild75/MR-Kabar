<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menambahkan user_id (nullable, DENGAN FK constraint ke users,
     * nullOnDelete supaya baris risiko tidak ikut terhapus saat user-nya
     * dihapus) ke lima tabel yang dibatasi kepemilikannya per-PIC: IRS_Pemda (I_b),
     * KRS_PD/IRS_PD (II_a/II_b), KRO_PD/IRO_PD (III_a/III_b). KRS_Pemda
     * (I_a) SENGAJA tidak disentuh — levelnya lintas-OPD dan hanya
     * admin/super-admin yang boleh input, bukan row-level ownership.
     */
    public function up(): void
    {
        Schema::table('tbl_irs_pemda', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
        });
        Schema::table('tbl_krs_pd', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
        });
        Schema::table('tbl_irs_pd', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
        });
        Schema::table('tbl_kro_pd', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
        });
        Schema::table('tbl_iro_pd', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        foreach (['tbl_irs_pemda', 'tbl_krs_pd', 'tbl_irs_pd', 'tbl_kro_pd', 'tbl_iro_pd'] as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->dropConstrainedForeignId('user_id');
            });
        }
    }
};
