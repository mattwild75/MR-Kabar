<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RiskImpactCriteria extends Model
{
    protected $table = 'risk_impact_criteria';

    protected $fillable = [
        'level',
        'label',
        'kerugian_negara',
        'penurunan_reputasi',
        'penurunan_kinerja',
        'gangguan_pelayanan',
        'tuntutan_hukum',
    ];
}
