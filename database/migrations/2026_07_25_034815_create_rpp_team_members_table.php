<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rpp_team_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rpp_id')->constrained('rpps')->onDelete('cascade');
            $table->enum('role', ['koordinator', 'ppj', 'ketua_tim', 'anggota_tim']);
            $table->string('nama');
            $table->unsignedInteger('hari_kantor')->nullable();
            $table->unsignedInteger('hari_lapangan')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rpp_team_members');
    }
};
