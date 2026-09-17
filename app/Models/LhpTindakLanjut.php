<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LhpTindakLanjut extends Model
{
    protected $table = 'lhp_tindak_lanjut';

    protected $guarded = ['id'];

    protected $casts = ['nilai' => 'decimal:2', 'tanggal' => 'date', 'tanggal_laporan' => 'date'];

    /** @return BelongsTo<LhpRekomendasi, $this> */
    public function rekomendasi(): BelongsTo
    {
        return $this->belongsTo(LhpRekomendasi::class, 'rekomendasi_id');
    }
}
