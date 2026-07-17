<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Form 1d: RTP atas Kelemahan Lingkungan Pengendalian (RTP atas CEE) —
 * Lampiran 5 Form 6 Perdep PPKD No.4/2019. Satu baris = satu kondisi
 * lingkungan pengendalian yg kurang memadai (per unsur, bisa multi-baris
 * per unsur) beserta rencana tindak, penanggung jawab, target & realisasi
 * penyelesaian.
 */
class CeeRtp extends Model
{
    use SoftDeletes;

    protected $table = 'cee_rtp';

    protected $fillable = [
        'opd_id',
        'tahun_penilaian',
        'cee_unsur_id',
        'kondisi_kurang_memadai',
        'rencana_tindak_pengendalian',
        'penanggung_jawab',
        'triwulan_target',
        'tahun_target_penyelesaian',
        'triwulan_realisasi',
        'tahun_realisasi_penyelesaian',
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
