<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RppLaporan extends Model
{
    protected $fillable = [
        'rpp_penugasan_id',
        'nomor_laporan',
        'tanggal_laporan',
        'order',
    ];

    protected $casts = [
        'tanggal_laporan' => 'date',
    ];

    public function penugasan(): BelongsTo
    {
        return $this->belongsTo(RppPenugasan::class, 'rpp_penugasan_id');
    }
}
