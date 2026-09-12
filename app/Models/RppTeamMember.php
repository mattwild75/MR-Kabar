<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RppTeamMember extends Model
{
    public const PERAN = [
        'penanggung_jawab' => 'Penanggungjawab',
        'koordinator' => 'Koordinator',
        'ppj' => 'PPJ/Pengendali Teknis',
        'ketua_tim' => 'Ketua Tim',
        'anggota_tim' => 'Anggota Tim',
    ];

    protected $fillable = [
        'rpp_penugasan_id',
        'employee_id',
        'role',
        'peran_teks',
        'nama',
        'nip',
        'pangkat',
        'golongan',
        'hari_kantor',
        'hari_lapangan',
        'tarif_per_hari',
        'order',
    ];

    public function penugasan(): BelongsTo
    {
        return $this->belongsTo(RppPenugasan::class, 'rpp_penugasan_id');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /** Label peran pada cetakan: teks bebas bila diisi, selain itu label baku. */
    public function peranTampil(): string
    {
        return $this->peran_teks ?: (self::PERAN[$this->role] ?? $this->role);
    }
}
