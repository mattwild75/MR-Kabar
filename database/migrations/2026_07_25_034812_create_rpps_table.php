<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rpps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rpp_category_id')->constrained('rpp_categories')->onDelete('restrict');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->unsignedInteger('year');
            $table->string('nomor_rpp');
            $table->date('tanggal_rpp')->nullable();
            $table->string('nomor_st')->nullable();
            $table->date('tanggal_st')->nullable();
            $table->text('uraian')->nullable();
            $table->date('masa_tugas_mulai')->nullable();
            $table->date('masa_tugas_selesai')->nullable();
            $table->string('capaian_output')->nullable();
            $table->enum('status', ['draft', 'st_terbit', 'selesai', 'lhp_terbit'])->default('draft');
            $table->softDeletes();
            $table->timestamps();

            $table->unique(['nomor_rpp', 'year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rpps');
    }
};
