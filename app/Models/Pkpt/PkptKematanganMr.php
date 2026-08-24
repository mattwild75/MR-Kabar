<?php

namespace App\Models\Pkpt;

use App\Models\Opd;
use App\Observers\GlobalActivityLogger;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Formulir 3 — tingkat kematangan manajemen risiko dan pembobotan per SKPK.
 *
 * bobot_register dan bobot_faktor DISALIN ke baris ini saat level ditetapkan,
 * bukan dibaca ulang dari pkpt_bobot_kematangan setiap kali menghitung.
 * Alasannya: kertas kerja ini melekat pada Keputusan yang ditandatangani, dan
 * mengubah bobot acuan tahun depan tidak boleh mengubah dokumen yang sudah
 * ditetapkan.
 */
#[ObservedBy([GlobalActivityLogger::class])]
class PkptKematanganMr extends Model
{
    use SoftDeletes;

    protected $table = 'pkpt_kematangan_mr';

    protected $fillable = [
        'periode_id', 'opd_id', 'level_mr', 'sumber_penetapan', 'skor_spip',
        'strategi_pengawasan', 'bobot_register', 'bobot_faktor', 'keterangan',
    ];

    protected function casts(): array
    {
        return [
            'level_mr' => 'integer',
            'skor_spip' => 'float',
            'bobot_register' => 'integer',
            'bobot_faktor' => 'integer',
        ];
    }

    public function periode(): BelongsTo
    {
        return $this->belongsTo(PkptPeriode::class, 'periode_id');
    }

    public function opd(): BelongsTo
    {
        return $this->belongsTo(Opd::class, 'opd_id');
    }
}
