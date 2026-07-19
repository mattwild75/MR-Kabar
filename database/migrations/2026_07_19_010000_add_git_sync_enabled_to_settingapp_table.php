<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Toggle aktivasi fitur Git Push/Pull (menu Backup > Super Admin),
     * disimpan di database — BUKAN di file .env — supaya dapat diaktifkan
     * langsung dari UI aplikasi oleh Super Admin tanpa perlu akses tulis ke
     * file .env server (yang berisiko rusak kalau ditulis otomatis dan
     * berbeda perizinan tulis antar hosting). Default false di setiap
     * instalasi baru (termasuk hasil clone/fork oleh siapa pun) — fitur
     * git sync nonaktif sampai Super Admin di server itu SENDIRI yang
     * mengaktifkannya lewat toggle di halaman Backup.
     */
    public function up(): void
    {
        Schema::table('settingapp', function (Blueprint $table) {
            $table->boolean('git_sync_enabled')->default(false)->after('footer_credit');
        });
    }

    public function down(): void
    {
        Schema::table('settingapp', function (Blueprint $table) {
            $table->dropColumn('git_sync_enabled');
        });
    }
};
