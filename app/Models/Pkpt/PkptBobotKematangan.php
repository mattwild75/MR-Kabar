<?php

namespace App\Models\Pkpt;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * Tabel acuan: karakteristik tingkat kematangan manajemen risiko, strategi
 * pengawasannya, dan komposisi bobot Register Risiko lawan Faktor
 * Pertimbangan Manajemen — Tabel 3, 5, dan 6 Lampiran Keputusan Inspektur,
 * menurunkan Tabel 3.3, 3.5, dan angka pembobotan Perdep PPKD 08/2020.
 *
 * level_mr 0 berarti satuan kerja belum menerapkan manajemen risiko dan belum
 * punya Register Risiko: bobot 0 banding 100.
 */
class PkptBobotKematangan extends Model
{
    public const CACHE_KEY = 'pkpt.bobot_kematangan';

    protected $table = 'pkpt_bobot_kematangan';

    protected $fillable = [
        'level_mr', 'sebutan', 'karakteristik', 'strategi_assurance',
        'strategi_consulting', 'bobot_register', 'bobot_faktor',
    ];

    protected function casts(): array
    {
        return [
            'level_mr' => 'integer',
            'bobot_register' => 'integer',
            'bobot_faktor' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::saved(fn () => Cache::forget(self::CACHE_KEY));
        static::deleted(fn () => Cache::forget(self::CACHE_KEY));
    }

    /** @return Collection<int, self> berkunci level_mr */
    public static function terurut(): Collection
    {
        return Cache::rememberForever(
            self::CACHE_KEY,
            fn () => self::orderBy('level_mr')->get()->keyBy('level_mr')
        );
    }
}
