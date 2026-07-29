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
        Schema::table('settingapp', function (Blueprint $table) {
            $table->boolean('edu_video_enabled')->default(true)->after('login_splash_muted');
            $table->string('edu_video_path')->nullable()->after('edu_video_enabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('settingapp', function (Blueprint $table) {
            $table->dropColumn(['edu_video_enabled', 'edu_video_path']);
        });
    }
};
