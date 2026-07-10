<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable()->unique()->after('name');
        });

        // Backfill username dari email lama supaya tidak ada baris kosong,
        // lalu hasil akhirnya disesuaikan manual lewat data seeder/tinker
        // ke format PIC_NamaInstansi untuk user PIC.
        DB::table('users')->orderBy('id')->get(['id', 'email'])->each(function ($user) {
            $base = Str::of($user->email)->before('@')->slug('');
            DB::table('users')->where('id', $user->id)->update([
                'username' => (string) $base,
            ]);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('username');
        });
    }
};
