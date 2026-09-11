<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rpp_laporans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rpp_id')->constrained('rpps')->onDelete('cascade');
            $table->string('nomor_laporan');
            $table->date('tanggal_laporan')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rpp_laporans');
    }
};
