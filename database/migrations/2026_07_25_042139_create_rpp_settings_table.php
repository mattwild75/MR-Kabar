<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rpp_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tarif_per_hari')->default(100000);
            $table->foreignId('inspektur_employee_id')->nullable()->constrained('employees')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rpp_settings');
    }
};
