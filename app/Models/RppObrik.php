<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    public function laporans(): HasMany
    {
        return $this->hasMany(RppLaporan::class, 'rpp_obrik_id')->orderBy('order');
    }
}
