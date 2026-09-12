<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Laporan hasil (LHA/LHR/LHM/LHE/...) yang terbit dari satu penugasan; bila
 * penugasan memuat beberapa obrik, laporan menunjuk obriknya (rpp_obrik_id),
 * persis kolom LAPORAN pada rekap Analisis dan Evaluasi.
 */
class RppLaporan extends Model
{
    protected $fillable = [
        'rpp_penugasan_id',
        'rpp_obrik_id',
        'nomor_laporan',
        'jenis',
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

    public function obrik(): BelongsTo
    {
        return $this->belongsTo(RppObrik::class, 'rpp_obrik_id');
    }
}
