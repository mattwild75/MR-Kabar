<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Arahan dan Kebijakan Penilaian Risiko yang ditetapkan Bupati lewat Surat
 * Edaran — 5 tahunan mengikuti periode RPJMD, 1 tahunan mengikuti siklus
 * anggaran. Lihat migrasi 2026_07_31_030000 untuk dasar Perdep-nya.
 */
class ArahanPenilaianRisiko extends Model
{
    use SoftDeletes;

    protected $table = 'arahan_penilaian_risiko';

    public const JENIS = ['5_tahunan', '1_tahunan'];

    public const JENIS_LABEL = [
        '5_tahunan' => 'Arahan 5 Tahunan (mengikuti periode RPJMD)',
        '1_tahunan' => 'Arahan 1 Tahunan (mengikuti siklus anggaran)',
    ];

    public const STATUS = ['draf', 'berlaku'];

    protected $fillable = [
        'jenis',
        'tahun_mulai',
        'tahun_selesai',
        'nomor_se',
        'tanggal_se',
        'dasar_hukum',
        'catatan',
        'status',
        'ditetapkan_oleh',
    ];

    protected $casts = [
        'tanggal_se' => 'date',
        'tahun_mulai' => 'integer',
        'tahun_selesai' => 'integer',
    ];

    public function tahapan(): HasMany
    {
        return $this->hasMany(ArahanTahapan::class)->orderBy('urutan')->orderBy('id');
    }

    public function ditetapkanOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ditetapkan_oleh');
    }

    /**
     * Arahan yang sudah ditetapkan dan mencakup satu tahun tertentu.
     *
     * Hanya yang berstatus 'berlaku' — arahan yang masih disusun tidak boleh
     * muncul di jadwal Dasbor dan menagih OPD atas sesuatu yang belum
     * ditetapkan Bupati.
     */
    public function scopeBerlakuPada(Builder $query, int $tahun): Builder
    {
        return $query->where('status', 'berlaku')
            ->where('tahun_mulai', '<=', $tahun)
            ->where('tahun_selesai', '>=', $tahun);
    }
}
