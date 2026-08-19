<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Menyeragamkan Periode Penilaian ke periode RPJMD yang berlaku.
     *
     * Pemilihan periode dibiarkan bebas di aplikasi — kalau sebuah perangkat
     * daerah menuliskan periode lain, aplikasi memakainya apa adanya. Kebebasan
     * itu tetap ada dan tidak dicabut oleh migrasi ini.
     *
     * Namun pada data yang terlanjur masuk, empat perangkat daerah menuliskan
     * periode yang tidak sama dengan RPJMD Kabupaten Aceh Barat 2025-2029:
     * tiga menulis 2023-2026 dan satu menulis 2025-2030. Akibatnya penyaring
     * Periode Penilaian menampilkan tiga pilihan, dua di antaranya membuka
     * tabel yang kosong pada KRS Pemda — sebab di sana seluruh barisnya memang
     * 2025-2029. Pemilik aplikasi memutuskan ketiganya diseragamkan.
     *
     * Yang disentuh dua tempat, dan keduanya perlu:
     *
     *   - `data_umum.periode_penilaian`, karena dari sinilah pilihan pada
     *     penyaring dibangkitkan;
     *   - kolom `PERIODE PENILAIAN` pada tbl_krs_pd, karena nilainya sudah
     *     menempel pada barisnya. Memperbaiki Data Umum saja tidak cukup —
     *     barisnya akan tetap tersaring ke periode lama dan hilang dari
     *     halaman.
     *
     * tbl_krs_pemda tidak disentuh: seluruh 367 barisnya sudah 2025-2029.
     *
     * Nilai asli disimpan supaya bisa ditinjau dan dibatalkan.
     */
    private const BAKU = '2025-2029';

    public function up(): void
    {
        if (! DB::getSchemaBuilder()->hasTable('tbl_periode_penilaian_asli')) {
            DB::statement('CREATE TABLE tbl_periode_penilaian_asli (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                tabel VARCHAR(64) NOT NULL,
                baris_id BIGINT UNSIGNED NOT NULL,
                periode_asli VARCHAR(64) NULL,
                diseragamkan_pada TIMESTAMP NULL,
                UNIQUE KEY tabel_baris (tabel, baris_id)
            )');
        }

        $this->seragamkan('data_umum', 'periode_penilaian');
        $this->seragamkan('tbl_krs_pd', 'PERIODE PENILAIAN');
    }

    private function seragamkan(string $tabel, string $kolom): void
    {
        $menyimpang = DB::table($tabel)
            ->select('id', $kolom.' as periode')
            ->whereNotNull($kolom)
            ->where($kolom, '<>', '')
            ->where($kolom, '<>', self::BAKU)
            ->get();

        foreach ($menyimpang as $baris) {
            DB::table('tbl_periode_penilaian_asli')->updateOrInsert(
                ['tabel' => $tabel, 'baris_id' => $baris->id],
                ['periode_asli' => $baris->periode, 'diseragamkan_pada' => now()],
            );
            DB::table($tabel)->where('id', $baris->id)->update([$kolom => self::BAKU]);
        }
    }

    public function down(): void
    {
        if (! DB::getSchemaBuilder()->hasTable('tbl_periode_penilaian_asli')) {
            return;
        }

        $kolom = ['data_umum' => 'periode_penilaian', 'tbl_krs_pd' => 'PERIODE PENILAIAN'];
        foreach (DB::table('tbl_periode_penilaian_asli')->get() as $b) {
            if (! isset($kolom[$b->tabel])) {
                continue;
            }
            DB::table($b->tabel)->where('id', $b->baris_id)
                ->update([$kolom[$b->tabel] => $b->periode_asli]);
        }

        DB::statement('DROP TABLE tbl_periode_penilaian_asli');
    }
};
