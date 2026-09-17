<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LhpRekomendasi extends Model
{
    protected $table = 'lhp_rekomendasi';

    protected $guarded = ['id'];

    protected $casts = ['nilai' => 'decimal:2'];

    /** @return BelongsTo<LhpSebab, $this> */
    public function sebab(): BelongsTo
    {
        return $this->belongsTo(LhpSebab::class, 'sebab_id');
    }

    /** @return HasMany<LhpTindakLanjut, $this> */
    public function tindakLanjut(): HasMany
    {
        return $this->hasMany(LhpTindakLanjut::class, 'rekomendasi_id')->orderBy('no');
    }
}
