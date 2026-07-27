<?php

namespace Database\Seeders;

use App\Models\ProgramBupatiRisiko;
use App\Models\ProgramPembangunanBupati;
use Illuminate\Database\Seeder;

/**
 * Seed tabel pivot program_bupati_risiko dari pemetaan analitis di
 * database/seeders/data/program_bupati_risiko_mapping.php — dasar halaman
 * "Miscellaneous > Risiko 100 Program Bupati".
 *
 * IDEMPOTEN: updateOrCreate by (program_pembangunan_bupati_id, risiko_tipe,
 * risiko_id) — aman dijalankan ulang, tidak menduplikasi.
 */
class ProgramBupatiRisikoSeeder extends Seeder
{
    public function run(): void
    {
        $mapping = require __DIR__ . '/data/program_bupati_risiko_mapping.php';

        $programsByNomor = ProgramPembangunanBupati::pluck('id', 'nomor');

        $total = 0;
        foreach ($mapping as $nomor => $risikoList) {
            $programId = $programsByNomor[$nomor] ?? null;
            if (!$programId) {
                $this->command?->warn("  Program nomor {$nomor} tidak ditemukan di tabel program_pembangunan_bupati — dilewati.");
                continue;
            }

            foreach ($risikoList as $r) {
                ProgramBupatiRisiko::updateOrCreate([
                    'program_pembangunan_bupati_id' => $programId,
                    'risiko_tipe' => $r['tipe'],
                    'risiko_id' => $r['id'],
                ]);
                $total++;
            }
        }

        $this->command?->info("Program Bupati x Risiko: {$total} pasangan ter-seed.");
    }
}
