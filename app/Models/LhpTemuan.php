<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LhpTemuan extends Model
{
    protected $table = 'lhp_temuan';

    protected $guarded = ['id'];

    protected $casts = ['nilai' => 'decimal:2'];

    /** @return BelongsTo<Lhp, $this> */
    public function lhp(): BelongsTo
    {
        return $this->belongsTo(Lhp::class);
    }

    /** @return HasMany<LhpSebab, $this> */
    public function sebab(): HasMany
    {
        return $this->hasMany(LhpSebab::class, 'temuan_id')->orderBy('no');
    }
}
