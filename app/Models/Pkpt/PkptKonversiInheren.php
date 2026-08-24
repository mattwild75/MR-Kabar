<?php

namespace App\Models\Pkpt;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * Tabel acuan: konversi nilai risiko komposit 1 sampai 25 menjadi skala 1
 * sampai 5 — Tabel 7 Lampiran Keputusan Inspektur, menurunkan baris "Nilai
 * Risiko Inheren" pada Tabel 4.3 Perdep PPKD 08/2020.
 */
class PkptKonversiInheren extends Model
{
    public const CACHE_KEY = 'pkpt.konversi_inheren';

    protected $table = 'pkpt_konversi_inheren';

    protected $fillable = ['skala', 'nilai_min', 'nilai_max'];

    protected function casts(): array
    {
        return ['skala' => 'integer', 'nilai_min' => 'integer', 'nilai_max' => 'integer'];
    }

    protected static function booted(): void
    {
        static::saved(fn () => Cache::forget(self::CACHE_KEY));
        static::deleted(fn () => Cache::forget(self::CACHE_KEY));
    }

    /** @return Collection<int, self> */
    public static function terurut(): Collection
    {
        return Cache::rememberForever(
            self::CACHE_KEY,
            fn () => self::orderBy('skala')->get()
        );
    }
}
