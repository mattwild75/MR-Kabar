<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class RiskMatrixCell extends Model
{
    protected $table = 'risk_matrix_cells';

    protected $fillable = [
        'dampak',
        'kemungkinan',
        'skala_risiko',
        'warna_class',
    ];

    /** Kunci cache dipakai RiskReferenceDataService::skalaRisikoMatrix() — dipanggil hitungSkala() per baris risiko, tanpa cache sebelumnya berarti query ulang tabel ini (25 baris) di setiap panggilan (temuan audit performa). */
    public const CACHE_KEY = 'risk_matrix_cells_all';

    protected static function booted(): void
    {
        static::saved(fn () => Cache::forget(self::CACHE_KEY));
        static::deleted(fn () => Cache::forget(self::CACHE_KEY));
    }
}
