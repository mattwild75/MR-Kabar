<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RppSetting extends Model
{
    protected $fillable = [
        'tarif_per_hari',
        'inspektur_employee_id',
    ];

    public function inspektur(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'inspektur_employee_id');
    }

    public static function current(): self
    {
        return static::firstOrCreate([]);
    }
}
