<?php

namespace App\Models\Pkpt;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Daftar sektor unggulan daerah per periode — masukan Faktor Risiko 2. */
class PkptSektorUnggulan extends Model
{
    protected $table = 'pkpt_sektor_unggulan';

    protected $fillable = ['periode_id', 'nama'];

    public function periode(): BelongsTo
    {
        return $this->belongsTo(PkptPeriode::class, 'periode_id');
    }
}
