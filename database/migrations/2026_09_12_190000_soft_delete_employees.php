<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Pegawai ERPIKA ikut soft delete supaya muncul di ERPIKA > Data Terhapus. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', fn (Blueprint $table) => $table->softDeletes());
    }

    public function down(): void
    {
        Schema::table('employees', fn (Blueprint $table) => $table->dropSoftDeletes());
    }
};
