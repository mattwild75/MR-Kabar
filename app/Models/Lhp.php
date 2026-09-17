<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Laporan Hasil Pemeriksaan (Database LHP, ERPIKA). Berdiri sendiri — tanpa
 * relasi ke tabel domain MR Kabar. Detail berjenjang: Temuan -> Penyebab ->
 * Rekomendasi -> Tindak Lanjut.
 */
class Lhp extends Model
{
    use SoftDeletes;

    protected $table = 'lhp';

    protected $guarded = ['id'];

    protected $casts = [
        'tanggal_lhp' => 'date',
        'tanggal_st' => 'date',
        'tanggal_entry' => 'date',
        'nilai_anggaran' => 'decimal:2',
        'realisasi_anggaran' => 'decimal:2',
        'anggaran_diaudit' => 'decimal:2',
        'nilai_tp' => 'decimal:2',
        'nilai_tpb' => 'decimal:2',
        'nilai_potensi' => 'decimal:2',
    ];

    public const STATUS = [
        '00' => 'Entry Tidak Lengkap',
        '01' => 'Belum Ada Tindak Lanjut',
        '02' => 'Tindak Lanjut Sebagian',
        '03' => 'Tuntas',
    ];

    /** @return HasMany<LhpTemuan, $this> */
    public function temuan(): HasMany
    {
        return $this->hasMany(LhpTemuan::class)->orderBy('no');
    }

    /** @return HasMany<LhpTim, $this> */
    public function tim(): HasMany
    {
        return $this->hasMany(LhpTim::class)->orderBy('no');
    }
}
