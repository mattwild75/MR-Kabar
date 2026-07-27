<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class RiskEntitasPenilai extends Model
{
    protected $table = 'risk_entitas_penilai';

    protected $fillable = [
        'nama',
        'urutan',
    ];

    /** Kunci cache dipakai RiskReferenceDataService — tabel referensi kecil yg di-query ulang tiap request tanpa cache sebelumnya (temuan audit performa). */
    public const CACHE_KEY = 'risk_entitas_penilai_ordered';

    protected static function booted(): void
    {
        static::saved(fn () => Cache::forget(self::CACHE_KEY));
        static::deleted(fn () => Cache::forget(self::CACHE_KEY));
    }
}
