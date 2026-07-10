<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/** Form 1b: kelemahan Lingkungan Pengendalian OPD tertentu berdasar reviu dokumen. */
class CeeKelemahanDokumen extends Model
{
    use SoftDeletes;

    protected $table = 'cee_kelemahan_dokumen';

    protected $fillable = [
        'opd_id',
        'tahun_penilaian',
        'cee_unsur_id',
        'sumber_data',
        'uraian_kelemahan',
        'pengisi_nama',
        'pengisi_jabatan',
        'submitted_by',
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
