<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LhpTim extends Model
{
    protected $table = 'lhp_tim';

    protected $guarded = ['id'];

    /** Jabatan baku dalam tim pemeriksa (mengikuti taksonomi SimHP). */
    public const JABATAN = [
        'Penanggung Jawab',
        'Wakil Penanggung Jawab',
        'Pengendali Teknis',
        'Ketua Tim',
        'Anggota Tim',
    ];

    /** @return BelongsTo<Lhp, $this> */
    public function lhp(): BelongsTo
    {
        return $this->belongsTo(Lhp::class);
    }
}
