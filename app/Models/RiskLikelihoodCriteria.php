<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RiskLikelihoodCriteria extends Model
{
    protected $table = 'risk_likelihood_criteria';

    protected $fillable = [
        'level',
        'nama',
        'probabilitas',
        'frekuensi',
        'toleransi',
    ];
}
