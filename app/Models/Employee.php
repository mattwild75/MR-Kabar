<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends Model
{
    protected $fillable = [
        'nama',
        'nip',
        'pangkat',
        'golongan',
    ];

    public function teamMemberships(): HasMany
    {
        return $this->hasMany(RppTeamMember::class);
    }
}
