<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * "TARGET WAKTU PENYELESAIAN" diganti dari teks bebas ("Desember 2026",
     * "Triwulan III 2026", dst — tidak konsisten dan sempat salah bertipe
     * integer di tbl_krs_irs_pemda sehingga nilainya selalu hilang saat
     * disalin ke tabel derived) menjadi dua kolom terstruktur: TRIWULAN
     * (dropdown I-IV) dan TAHUN TARGET PENYELESAIAN (angka, diisi manual).
     * Berlaku di 3 tabel sumber (tbl_irs_pemda, tbl_irs_pd, tbl_iro_pd) dan
     * 3 tabel derived (tbl_krs_irs_pemda, tbl_krs_irs_pd, tbl_kro_iro_pd).
     */
    public function up(): void
    {
        $sourceTables = [
            'tbl_irs_pemda' => 'TARGET WAKTU PENYELESAIAN',
            'tbl_irs_pd' => 'TARGET WAKTU PENYELESAIAN',
            'tbl_iro_pd' => 'TARGET WAKTU PENYELESAIAN',
        ];

        foreach ($sourceTables as $table => $oldColumn) {
            Schema::table($table, function (Blueprint $blueprint) use ($oldColumn) {
                $blueprint->string('TRIWULAN')->nullable()->after($oldColumn);
                $blueprint->unsignedSmallInteger('TAHUN TARGET PENYELESAIAN')->nullable()->after('TRIWULAN');
            });
        }

        // tbl_krs_irs_pemda: kolom lama TARGET_WAKTU_PENYELESAIAN salah
        // bertipe int (bug lama) — di-drop total, bukan diubah tipe, karena
        // isinya sudah pasti NULL semua (int tidak pernah menampung teks
        // "Triwulan III 2026").
        DB::statement('ALTER TABLE tbl_krs_irs_pemda DROP COLUMN TARGET_WAKTU_PENYELESAIAN');
        DB::statement('ALTER TABLE tbl_krs_irs_pemda ADD COLUMN TRIWULAN TEXT NULL AFTER PEMILIK_PENANGGUNGJAWAB');
        DB::statement('ALTER TABLE tbl_krs_irs_pemda ADD COLUMN TAHUN_TARGET_PENYELESAIAN SMALLINT UNSIGNED NULL AFTER TRIWULAN');

        Schema::table('tbl_krs_irs_pd', function (Blueprint $blueprint) {
            $blueprint->dropColumn('TARGET_WAKTU_PENYELESAIAN');
            $blueprint->text('TRIWULAN')->nullable()->after('PEMILIK_PENANGGUNGJAWAB');
            $blueprint->unsignedSmallInteger('TAHUN_TARGET_PENYELESAIAN')->nullable()->after('TRIWULAN');
        });

        Schema::table('tbl_kro_iro_pd', function (Blueprint $blueprint) {
            $blueprint->dropColumn('TARGET_WAKTU_PENYELESAIAN');
            $blueprint->text('TRIWULAN')->nullable()->after('PEMILIK_PENANGGUNGJAWAB');
            $blueprint->unsignedSmallInteger('TAHUN_TARGET_PENYELESAIAN')->nullable()->after('TRIWULAN');
        });
    }

    public function down(): void
    {
        foreach (['tbl_irs_pemda', 'tbl_irs_pd', 'tbl_iro_pd'] as $table) {
            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->dropColumn(['TRIWULAN', 'TAHUN TARGET PENYELESAIAN']);
                $blueprint->string('TARGET WAKTU PENYELESAIAN')->nullable();
            });
        }

        Schema::table('tbl_krs_irs_pemda', function (Blueprint $blueprint) {
            $blueprint->dropColumn(['TRIWULAN', 'TAHUN_TARGET_PENYELESAIAN']);
            $blueprint->integer('TARGET_WAKTU_PENYELESAIAN')->nullable();
        });

        Schema::table('tbl_krs_irs_pd', function (Blueprint $blueprint) {
            $blueprint->dropColumn(['TRIWULAN', 'TAHUN_TARGET_PENYELESAIAN']);
            $blueprint->text('TARGET_WAKTU_PENYELESAIAN')->nullable();
        });

        Schema::table('tbl_kro_iro_pd', function (Blueprint $blueprint) {
            $blueprint->dropColumn(['TRIWULAN', 'TAHUN_TARGET_PENYELESAIAN']);
            $blueprint->text('TARGET_WAKTU_PENYELESAIAN')->nullable();
        });
    }
};
