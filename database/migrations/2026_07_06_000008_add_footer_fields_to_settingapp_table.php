<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Field footer aplikasi — email tujuan tombol "Contact Us"/"Troubleshoot"
     * dan kredit developer, diatur lewat halaman Application Settings
     * (admin/super-admin), ditampilkan di footer semua halaman.
     */
    public function up(): void
    {
        Schema::table('settingapp', function (Blueprint $table) {
            $table->string('contact_email')->nullable()->after('seo');
            $table->string('troubleshoot_email')->nullable()->after('contact_email');
            $table->string('footer_credit')->nullable()->after('troubleshoot_email');
        });
    }

    public function down(): void
    {
        Schema::table('settingapp', function (Blueprint $table) {
            $table->dropColumn(['contact_email', 'troubleshoot_email', 'footer_credit']);
        });
    }
};
