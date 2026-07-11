<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RiskMatrixCell extends Model
{
    protected $table = 'risk_matrix_cells';

    protected $fillable = [
        'dampak',
        'kemungkinan',
        'skala_risiko',
        'warna_class',
    ];
}
