<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settingapp', function (Blueprint $table) {
            // Background color rendered behind the (typically transparent-PNG)
            // logo wherever it's displayed. Null/empty means no background —
            // logo renders on whatever surface it sits on, as-is.
            $table->string('logo_bg')->nullable()->after('logo');
        });
    }

    public function down(): void
    {
        Schema::table('settingapp', function (Blueprint $table) {
            $table->dropColumn('logo_bg');
        });
    }
};
