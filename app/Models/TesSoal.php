<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Bank soal pre-test dan post-test: 20 butir per jenis, nomor yang sama
 * mengukur indikator yang sama (soal setara, "sama makna beda penyoalan").
 *
 * Isinya tidak pernah ditulis di kode karena repositori GitHub publik; diimpor
 * lewat halaman Kelola. Kunci tidak pernah dikirim ke ponsel peserta.
 */
class TesSoal extends Model
{
    /** Lima bagian kisi-kisi, empat soal per bagian. */
    public const BAGIAN = [
        1 => 'Mengenal Laut',
        2 => 'Awak Kapal',
        3 => 'Lima Pelampung',
        4 => 'Membaca Peta',
        5 => 'Membunyikan Lonceng',
    ];

    public const PILIHAN = ['A', 'B', 'C', 'D'];

    protected $table = 'tes_soal';

    protected $fillable = [
        'jenis', 'nomor', 'bagian', 'indikator', 'pertanyaan',
        'pilihan_a', 'pilihan_b', 'pilihan_c', 'pilihan_d', 'kunci', 'pembahasan',
    ];

    public static function namaBagian(int $bagian): string
    {
        return self::BAGIAN[$bagian] ?? 'Bagian '.$bagian;
    }

    /** @return array<string, string> */
    public function pilihan(): array
    {
        return ['A' => $this->pilihan_a, 'B' => $this->pilihan_b, 'C' => $this->pilihan_c, 'D' => $this->pilihan_d];
    }
}
