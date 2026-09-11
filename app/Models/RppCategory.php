<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RppCategory extends Model
{
    protected $fillable = [
        'code',
        'name',
        'order',
    ];

    public function rpps(): HasMany
    {
        return $this->hasMany(Rpp::class);
    }
}
