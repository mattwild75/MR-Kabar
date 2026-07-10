<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // OPD milik akun PIC (nullable — Admin/Super Admin/akun bersama
        // CEE_Survey tidak terikat 1 OPD). Dipakai membatasi PIC biasa hanya
        // bisa akses Input & Cetak CEE OPD miliknya sendiri.
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('opd_id')->nullable()->after('username')->constrained('opd')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('opd_id');
        });
    }
};
