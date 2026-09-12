<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RppObrik extends Model
{
    protected $fillable = [
        'rpp_penugasan_id',
        'nama',
        'order',
    ];

    public function penugasan(): BelongsTo
    {
        return $this->belongsTo(RppPenugasan::class, 'rpp_penugasan_id');
    }
}
