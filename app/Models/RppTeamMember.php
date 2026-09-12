<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RppTeamMember extends Model
{
    /** Susunan baku tim penugasan APIP (arahan 12 September 2026). */
    public const PERAN = [
        'pj' => 'Penanggung Jawab',
        'wpj' => 'Wakil Penanggung Jawab',
        'dalnis' => 'Pengendali Teknis',
        'kt' => 'Ketua Tim',
        'at' => 'Anggota Tim',
    ];

    public const PERAN_SINGKAT = ['pj' => 'PJ', 'wpj' => 'WPJ', 'dalnis' => 'Dalnis', 'kt' => 'KT', 'at' => 'AT'];

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
