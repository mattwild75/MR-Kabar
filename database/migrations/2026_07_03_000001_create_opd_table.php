<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('opd', function (Blueprint $table) {
            $table->id();
            $table->string('nama')->unique();
            $table->timestamps();
        });

        // `tbl_pembangunandaerah` adalah tabel legacy pre-existing di database
        // produksi (bukan dibuat oleh migration manapun di proyek ini), jadi
        // tidak ada di database yang di-migrate dari nol (mis. test suite
        // dengan RefreshDatabase, atau instalasi baru) — lewati seeding OPD
        // awal jika tabelnya belum ada, agar migration ini tidak meruntuhkan
        // migrate/test di environment tersebut.
        if (!Schema::hasTable('tbl_pembangunandaerah')) {
            return;
        }

        $existing = DB::table('tbl_pembangunandaerah')
            ->distinct()
            ->pluck('OPD PENANGGUNGJAWAB PROGRAM')
            ->map(fn ($v) => trim((string) $v))
            ->filter(fn ($v) => $v !== '' && $v !== 'Tidak Ada Data')
            ->unique()
            ->values();

        $now = now();
        foreach ($existing as $nama) {
            DB::table('opd')->insertOrIgnore([
                'nama' => $nama,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('opd');
    }
};
