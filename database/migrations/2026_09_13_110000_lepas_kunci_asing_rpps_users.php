<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * ERPIKA harus mandiri (kelak dipindah ke erpika.acehbaratkab.go.id): tabel
 * ERPIKA tidak boleh bertaut kunci asing ke tabel MR Kabar. Kolom
 * rpps.user_id tetap ada berikut nilainya (siapa pembuat RPP), hanya
 * constraint-nya ke users yang dilepas. Dijaga ErpikaMandiriTest.
 */
return new class extends Migration
{
    public function up(): void
    {
        foreach (Schema::getForeignKeys('rpps') as $fk) {
            if ($fk['columns'] === ['user_id']) {
                Schema::table('rpps', fn (Blueprint $t) => $t->dropForeign($fk['name']));
            }
        }
    }

    public function down(): void
    {
        Schema::table('rpps', fn (Blueprint $t) => $t->foreign('user_id')->references('id')->on('users')->nullOnDelete());
    }
};
