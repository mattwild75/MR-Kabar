<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RppTeamMember extends Model
{
    protected $fillable = [
        'rpp_id',
        'employee_id',
        'role',
        'nama',
        'nip',
        'pangkat',
        'golongan',
        'hari_kantor',
        'hari_lapangan',
        'order',
    ];

    public function rpp(): BelongsTo
    {
        return $this->belongsTo(Rpp::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
