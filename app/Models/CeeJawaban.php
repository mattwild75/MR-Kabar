<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/** Form 1a: satu jawaban satu responden atas satu pertanyaan kuesioner CEE, untuk satu OPD. */
class CeeJawaban extends Model
{
    use SoftDeletes;

    protected $table = 'cee_jawaban';

    protected $fillable = [
        'opd_id',
        'cee_pertanyaan_id',
        'tahun_penilaian',
        'responden_nama',
        'responden_jabatan',
        'submitted_by',
        'nilai',
    ];

    public function opd(): BelongsTo
    {
        return $this->belongsTo(Opd::class);
    }

    public function pertanyaan(): BelongsTo
    {
        return $this->belongsTo(CeePertanyaan::class, 'cee_pertanyaan_id');
    }

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }
}
