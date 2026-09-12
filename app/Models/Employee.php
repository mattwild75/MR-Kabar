<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'nama',
        'nip',
        'pangkat',
        'golongan',
        'jabatan',
        'unit_kerja',
        'aktif',
    ];

    protected $casts = ['aktif' => 'boolean'];

    public function teamMemberships(): HasMany
    {
        return $this->hasMany(RppTeamMember::class);
    }
}
