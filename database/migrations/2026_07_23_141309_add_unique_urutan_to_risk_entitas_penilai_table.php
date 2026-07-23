<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * `urutan` menentukan posisi tampil ENTITAS PD YANG MENILAI di combobox
     * form — dua baris berbagi `urutan` yang sama membuat urutan tampil
     * tak terdefinisi/acak antar-request. Aman ditambah sekarang krn belum
     * ada duplikat di data existing (dicek manual sebelum migrasi ini).
     */
    public function up(): void
    {
        Schema::table('risk_entitas_penilai', function (Blueprint $table) {
            $table->unique('urutan');
        });
    }

    public function down(): void
    {
        Schema::table('risk_entitas_penilai', function (Blueprint $table) {
            $table->dropUnique(['urutan']);
        });
    }
};
