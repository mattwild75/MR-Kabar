<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel CEE yang mendapat SoftDeletes — hapus jadi menandai deleted_at
     * (bukan hilang permanen), agar salah-hapus bisa dipulihkan dari menu
     * "Data Terhapus", sama seperti tabel data risiko lain.
     */
    private const TABLES = [
        'cee_jawaban',
        'cee_kelemahan_dokumen',
        'cee_simpulan',
    ];

    public function up(): void
    {
        foreach (self::TABLES as $table) {
            if (Schema::hasTable($table) && !Schema::hasColumn($table, 'deleted_at')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->softDeletes();
                });
            }
        }
    }

    public function down(): void
    {
        foreach (self::TABLES as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'deleted_at')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->dropSoftDeletes();
                });
            }
        }
    }
};
