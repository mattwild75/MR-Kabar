<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RppObrik extends Model
{
    protected $fillable = [
        'rpp_id',
        'nama',
        'order',
    ];

    public function rpp(): BelongsTo
    {
        return $this->belongsTo(Rpp::class);
    }
}
