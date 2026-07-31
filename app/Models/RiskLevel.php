<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class RiskLevel extends Model
{
    protected $table = 'risk_levels';

    protected $fillable = [
        'label',
        'skala_min',
        'skala_max',
        'warna_class',
        'urutan',
        'melampaui_selera',
    ];

    protected $casts = [
        'melampaui_selera' => 'boolean',
    ];

    /** Kunci cache dipakai RiskReferenceDataService — tabel referensi kecil (5 baris) yg di-query ulang puluhan kali per request tanpa cache sebelumnya (temuan audit performa). */
    public const CACHE_KEY = 'risk_levels_ordered';

    protected static function booted(): void
    {
        static::saved(fn () => Cache::forget(self::CACHE_KEY));
        static::deleted(fn () => Cache::forget(self::CACHE_KEY));
    }
}
