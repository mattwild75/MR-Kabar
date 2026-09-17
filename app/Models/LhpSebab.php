<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LhpSebab extends Model
{
    protected $table = 'lhp_sebab';

    protected $guarded = ['id'];

    /** @return BelongsTo<LhpTemuan, $this> */
    public function temuan(): BelongsTo
    {
        return $this->belongsTo(LhpTemuan::class, 'temuan_id');
    }

    /** @return HasMany<LhpRekomendasi, $this> */
    public function rekomendasi(): HasMany
    {
        return $this->hasMany(LhpRekomendasi::class, 'sebab_id')->orderBy('no');
    }
}
