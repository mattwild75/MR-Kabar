<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Form 1c: simpulan akhir per unsur utk satu OPD (gabungan hasil 1a + 1b).
 * Diisi Sekretaris Dinas/Badan (Koordinator MR OPD); kepala_opd_* = UPR
 * penandatangan, di-snapshot dari Data Umum pengisi saat submit.
 */
class CeeSimpulan extends Model
{
    use SoftDeletes;

    protected $table = 'cee_simpulan';

    protected $fillable = [
        'opd_id',
        'tahun_penilaian',
        'cee_unsur_id',
        'penjelasan',
        'penyusun_nama',
        'penyusun_jabatan',
        'submitted_by',
        'kepala_opd_nama',
        'kepala_opd_jabatan',
    ];

    public function opd(): BelongsTo
    {
        return $this->belongsTo(Opd::class);
    }

    public function unsur(): BelongsTo
    {
        return $this->belongsTo(CeeUnsur::class, 'cee_unsur_id');
    }

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }
}
