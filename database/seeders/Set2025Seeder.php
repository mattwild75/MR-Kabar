<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Satu set penuh data Tahun Penilaian 2025, dari penilaian lingkungan
 * pengendalian sampai pelaporan.
 *
 * Register Risiko 2025 — 8 Risiko Strategis Pemda, 95 Risiko Strategis
 * Perangkat Daerah, dan 155 Risiko Operasional — SUDAH ADA dan berasal dari
 * pengisian sungguhan. Seeder ini TIDAK MENYENTUH isinya: yang dikerjakan
 * hanya melengkapi tahapan di sekelilingnya, dan satu-satunya kolom Risiko yang
 * disentuh adalah CELAH PENGENDALIAN — itu pun hanya menambahkan centang
 * kriteria Perdep di atas uraian yang sudah ada, tanpa mengubah atau membuang
 * uraiannya.
 *
 * Urutan pemanggilan mengikuti ketergantungan datanya, bukan urutan menu:
 *
 * 1. Arahan Penilaian Risiko — jadwal yang menaungi seluruh tahapan di
 *    bawahnya, sekaligus sumber data widget jadwal pada Dasbor.
 * 2. Struktur Pengelolaan Risiko — susunan pengelola; dibaca blok tanda tangan
 *    Laporan 14, jadi harus ada sebelum laporan dibuat.
 * 3. Kriteria celah pengendalian — melengkapi Risiko yang sudah ada.
 * 4. CEE Form 1a sampai 1c, lalu Form 1d yang menurunkan RTP dari simpulan
 *    Kurang Memadai; 1d wajib sesudah 1c karena membacanya.
 * 5. Monitoring Form 8 dan 9 — membaca RTP dari register Risiko DAN dari RTP
 *    CEE, jadi wajib sesudah keduanya ada.
 * 6. Narasi laporan Form 11 sampai 14.
 *
 * Seluruh seeder di dalamnya idempotent per tahun, sehingga aman dijalankan
 * berulang kali:
 *
 *     php artisan db:seed --class=Set2025Seeder
 */
class Set2025Seeder extends Seeder
{
    public function run(): void
    {
        $this->command?->info('Menyusun set data Tahun Penilaian 2025 — register Risiko yang sudah ada tidak diubah.');

        $this->call([
            ArahanPenilaian2025Seeder::class,
            StrukturPengelola2025Seeder::class,
            CelahPengendalianKriteria2025Seeder::class,
            CeeContoh2025Seeder::class,
            CeeRtp2025Seeder::class,
            MonitoringRtp2025Seeder::class,
            LaporanNarasi2025Seeder::class,
        ]);

        $this->command?->info('Set data 2025 selesai.');
    }
}
