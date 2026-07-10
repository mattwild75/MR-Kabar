<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // troubleshoot_email sudah tidak dipakai — fitur troubleshoot kini
        // berbasis tabel database (TroubleshootReportController), bukan
        // email. Kolom ini di-repurpose jadi recipient KEDUA utk tombol
        // "Contact Us" footer (bersama contact_email yg sudah ada).
        Schema::table('settingapp', function (Blueprint $table) {
            $table->renameColumn('troubleshoot_email', 'contact_email_secondary');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('settingapp', function (Blueprint $table) {
            $table->renameColumn('contact_email_secondary', 'troubleshoot_email');
        });
    }
};
