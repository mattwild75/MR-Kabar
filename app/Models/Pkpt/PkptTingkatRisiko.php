<?php

namespace App\Models\Pkpt;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * Tabel acuan: penamaan tingkat risiko atas Total Nilai Risiko — LIMA pita,
 * sesuai petunjuk pengisian Lampiran 9 Perdep PPKD 08/2020: 0-1 sangat
 * rendah, 1-2 rendah, 2-3 sedang, 3-4 tinggi, 4-5 sangat tinggi.
 *
 * Terpisah dari PkptZonaFrekuensi yang hanya tiga pita. Keduanya sempat
 * disatukan dan itu keliru: contoh Tabel 4.4 Perdep memperlihatkan 3,9
 * bertingkat "Tinggi" dan 4,0 bertingkat "Sangat Tinggi", padahal keduanya
 * sama-sama berzona merah dan diawasi setiap tahun.
 */
class PkptTingkatRisiko extends Model
{
    public const CACHE_KEY = 'pkpt.tingkat_risiko';

    protected $table = 'pkpt_tingkat_risiko';

    protected $fillable = ['nama', 'batas_bawah', 'batas_atas', 'warna', 'urutan'];

    protected function casts(): array
    {
        return ['batas_bawah' => 'float', 'batas_atas' => 'float', 'urutan' => 'integer'];
    }

    protected static function booted(): void
    {
        static::saved(fn () => Cache::forget(self::CACHE_KEY));
        static::deleted(fn () => Cache::forget(self::CACHE_KEY));
    }

    /** @return Collection<int, self> dari tingkat tertinggi ke terendah */
    public static function terurut(): Collection
    {
        return Cache::rememberForever(
            self::CACHE_KEY,
            fn () => self::orderByDesc('batas_bawah')->get()
        );
    }

    /** Batas bawah inklusif; pita tertinggi yang terlampaui yang menang. */
    public static function untukNilai(?float $nilai): ?self
    {
        if ($nilai === null) {
            return null;
        }

        return self::terurut()->first(fn (self $t) => $nilai >= $t->batas_bawah);
    }
}
