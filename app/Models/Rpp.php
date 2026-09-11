<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Rpp extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'rpp_category_id',
        'user_id',
        'year',
        'bulan',
        'nomor_rpp',
        'tanggal_rpp',
        'nomor_st',
        'tanggal_st',
        'uraian',
        'surat_dasar_uraian',
        'masa_tugas_mulai',
        'masa_tugas_selesai',
        'capaian_output',
        'status',
    ];

    protected $casts = [
        'tanggal_rpp' => 'date',
        'tanggal_st' => 'date',
        'masa_tugas_mulai' => 'date',
        'masa_tugas_selesai' => 'date',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(RppCategory::class, 'rpp_category_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function teamMembers(): HasMany
    {
        return $this->hasMany(RppTeamMember::class)->orderBy('order');
    }

    public function obriks(): HasMany
    {
        return $this->hasMany(RppObrik::class)->orderBy('order');
    }

    public function laporans(): HasMany
    {
        return $this->hasMany(RppLaporan::class)->orderBy('order');
    }
}
