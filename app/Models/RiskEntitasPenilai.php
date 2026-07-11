<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RiskEntitasPenilai extends Model
{
    protected $table = 'risk_entitas_penilai';

    protected $fillable = [
        'nama',
        'urutan',
    ];
}
