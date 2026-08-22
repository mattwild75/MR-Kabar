<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Teks putih pada lencana level risiko tidak terbaca — temuan PASS 6.
 *
 * Diukur di peramban dengan rumus kontras WCAG, bukan dikira-kira dari
 * tampilannya:
 *
 *   putih di atas sky-400     2,18      hitam   9,64
 *   putih di atas orange-400  2,38      hitam   8,83
 *   putih di atas red-500     3,81      hitam   5,52
 *
 * WCAG AA menuntut 4,5 untuk teks biasa dan 3,0 untuk teks besar. Ketiganya
 * gagal dengan putih; "Tinggi" dan "Sangat Rendah" bahkan gagal untuk teks
 * besar sekalipun.
 *
 * Ini bukan soal selera. Level risiko adalah inti aplikasi ini, dan tiga dari
 * lima levelnya — termasuk "Sangat Tinggi", yang paling perlu terbaca —
 * labelnya nyaris tak terbaca di layar sungguhan.
 *
 * Dua level sisanya (Rendah, Sedang) memang sudah memakai hitam sejak awal.
 * Sesudah migrasi ini aturannya seragam: latar berwarna, teks hitam.
 *
 * Nilainya disimpan di basis data dan dapat disunting Admin lewat menu
 * Keterangan Pendukung, jadi migrasi ini hanya membetulkan yang sudah ada —
 * seedernya ikut diperbaiki supaya pemasangan baru langsung benar.
 */
return new class extends Migration
{
    /** @var array<string, string> */
    private const PERBAIKAN = [
        'bg-red-500 text-white' => 'bg-red-500 text-black',
        'bg-orange-400 text-white' => 'bg-orange-400 text-black',
        'bg-sky-400 text-white' => 'bg-sky-400 text-black',
    ];

    public function up(): void
    {
        $this->terapkan(self::PERBAIKAN);
    }

    /**
     * Dapat dibatalkan, sekalipun membalikkannya mengembalikan cacatnya.
     *
     * Migrasi yang tidak bisa dibatalkan memaksa orang memulihkan seluruh
     * basis data hanya untuk mundur satu langkah.
     */
    public function down(): void
    {
        $this->terapkan(array_flip(self::PERBAIKAN));
    }

    /**
     * @param  array<string, string>  $peta
     */
    private function terapkan(array $peta): void
    {
        foreach (['risk_levels', 'risk_matrix_cells'] as $tabel) {
            if (! DB::getSchemaBuilder()->hasTable($tabel)) {
                continue;
            }

            foreach ($peta as $dari => $ke) {
                DB::table($tabel)->where('warna_class', $dari)->update(['warna_class' => $ke]);
            }
        }
    }
};
