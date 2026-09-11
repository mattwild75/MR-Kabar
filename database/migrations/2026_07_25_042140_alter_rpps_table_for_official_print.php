<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rpps', function (Blueprint $table) {
            $table->dropUnique(['nomor_rpp', 'year']);
            $table->unsignedTinyInteger('bulan')->nullable()->after('year');
            $table->text('surat_dasar_uraian')->nullable()->after('uraian');
        });
    }

    public function down(): void
    {
        Schema::table('rpps', function (Blueprint $table) {
            $table->dropColumn(['bulan', 'surat_dasar_uraian']);
            $table->unique(['nomor_rpp', 'year']);
        });
    }
};
