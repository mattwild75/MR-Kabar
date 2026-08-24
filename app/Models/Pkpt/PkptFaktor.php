<?php

namespace App\Models\Pkpt;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * Tabel acuan: lima Faktor Pertimbangan Manajemen, bobotnya, dan uraian
 * kriteria skala 1 sampai 5 masing-masing — Tabel 8 dan 9 Lampiran Keputusan
 * Inspektur, menurunkan Tabel 4.3 Perdep PPKD 08/2020.
 *
 * Bobot bawaan 25, 25, 20, 15, 15 persen. Bisa disunting lewat Pengaturan
 * PPBR karena Keputusan Inspektur yang menetapkannya dan Keputusan bisa
 * diubah, tetapi perubahannya tidak merambat ke periode yang sudah
 * ditetapkan: pkpt_penilaian menyimpan hasil, bukan menghitung ulang.
 */
class PkptFaktor extends Model
{
    public const CACHE_KEY = 'pkpt.faktor';

    protected $table = 'pkpt_faktor';

    protected $fillable = ['kode', 'nama', 'bobot_persen', 'tipe_penilaian', 'kriteria', 'urutan'];

    protected function casts(): array
    {
        return [
            'bobot_persen' => 'integer',
            'kriteria' => 'array',
            'urutan' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::saved(fn () => Cache::forget(self::CACHE_KEY));
        static::deleted(fn () => Cache::forget(self::CACHE_KEY));
    }

    /** @return Collection<string, self> berkunci kode FR1 sampai FR5 */
    public static function terurut(): Collection
    {
        return Cache::rememberForever(
            self::CACHE_KEY,
            fn () => self::orderBy('urutan')->get()->keyBy('kode')
        );
    }
}
