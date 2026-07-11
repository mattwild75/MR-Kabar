<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RiskLevel extends Model
{
    protected $table = 'risk_levels';

    protected $fillable = [
        'label',
        'skala_min',
        'skala_max',
        'warna_class',
        'urutan',
    ];
}
