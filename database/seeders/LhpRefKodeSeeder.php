<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Muat kode baku LHP dari database/data/lhp_ref_kode.json ke tabel
 * lhp_ref_kode. Idempoten: isi tabel diganti seluruhnya. Master data
 * standar BPKP (bukan isian) — aman berada di repositori.
 */
class LhpRefKodeSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('data/lhp_ref_kode.json');
        if (! is_file($path)) {
            $this->command?->warn("Berkas referensi tidak ada: {$path}");

            return;
        }
        $data = json_decode(file_get_contents($path), true);
        DB::table('lhp_ref_kode')->truncate();
        foreach (array_chunk($data, 500) as $bagian) {
            DB::table('lhp_ref_kode')->insert(array_map(fn ($r) => [
                'jenis' => $r['jenis'],
                'kode' => (string) $r['kode'],
                'kode_group' => $r['kode_group'] !== null ? (string) $r['kode_group'] : null,
                'nama' => $r['nama'],
            ], $bagian));
        }
        Cache::forget('lhp_ref_kode');
        $this->command?->info('Kode referensi LHP: '.count($data).' baris.');
    }
}
