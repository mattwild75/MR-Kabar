<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rpp_team_members', function (Blueprint $table) {
            $table->foreignId('employee_id')->nullable()->after('rpp_id')->constrained('employees')->onDelete('set null');
            $table->string('nip')->nullable()->after('nama');
            $table->string('pangkat')->nullable()->after('nip');
            $table->string('golongan')->nullable()->after('pangkat');
        });
    }

    public function down(): void
    {
        Schema::table('rpp_team_members', function (Blueprint $table) {
            $table->dropConstrainedForeignId('employee_id');
            $table->dropColumn(['nip', 'pangkat', 'golongan']);
        });
    }
};
