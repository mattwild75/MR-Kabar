<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RiskJenis extends Model
{
    protected $table = 'risk_jenis';

    protected $fillable = [
        'kode',
        'nama',
        'urutan',
    ];

    /** Format tampilan gabungan "kode - nama", sesuai format lama JENIS_RISIKO_OPTIONS. */
    public function getLabelAttribute(): string
    {
        return "{$this->kode} - {$this->nama}";
    }
}
