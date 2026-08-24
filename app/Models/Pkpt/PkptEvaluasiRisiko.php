<?php

namespace App\Models\Pkpt;

use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\IrsPemda;
use App\Models\User;
use App\Observers\GlobalActivityLogger;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Formulir 2 — hasil evaluasi Register Risiko oleh Inspektorat.
 *
 * Yang tersimpan di sini HANYA penilaian Inspektorat. Baris risiko milik SKPK
 * tidak pernah disentuh: sesuai BAB III Lampiran Keputusan Inspektur,
 * pemutakhiran Register Risiko tetap dilakukan SKPK selaku pemilik risiko.
 *
 * Tiga kolom kunci asing terpisah, bukan satu kolom polimorfik, dengan CHECK
 * "tepat satu terisi" di tingkat basis data. Pola polimorfik pada
 * program_bupati_risiko adalah alasan barisnya tidak bisa dijaga kunci asing.
 */
#[ObservedBy([GlobalActivityLogger::class])]
class PkptEvaluasiRisiko extends Model
{
    use SoftDeletes;

    protected $table = 'pkpt_evaluasi_risiko';

    /** Pemetaan tipe risiko ke kolom kunci asingnya. */
    public const KOLOM = [
        'irs_pemda' => 'irs_pemda_id',
        'irs_pd' => 'irs_pd_id',
        'iro_pd' => 'iro_pd_id',
    ];

    protected $fillable = [
        'periode_id', 'irs_pemda_id', 'irs_pd_id', 'iro_pd_id',
        'skala_dampak_evaluasi', 'skala_kemungkinan_evaluasi',
        'nilai_risiko_evaluasi', 'simpulan', 'catatan', 'dinilai_oleh',
    ];

    protected function casts(): array
    {
        return [
            'skala_dampak_evaluasi' => 'integer',
            'skala_kemungkinan_evaluasi' => 'integer',
            'nilai_risiko_evaluasi' => 'integer',
        ];
    }

    public function periode(): BelongsTo
    {
        return $this->belongsTo(PkptPeriode::class, 'periode_id');
    }

    public function irsPemda(): BelongsTo
    {
        return $this->belongsTo(IrsPemda::class, 'irs_pemda_id');
    }

    public function irsPd(): BelongsTo
    {
        return $this->belongsTo(IrsPd::class, 'irs_pd_id');
    }

    public function iroPd(): BelongsTo
    {
        return $this->belongsTo(IroPd::class, 'iro_pd_id');
    }

    public function penilai(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dinilai_oleh');
    }

    /** Tipe risiko yang ditunjuk baris ini. */
    public function tipe(): ?string
    {
        foreach (self::KOLOM as $tipe => $kolom) {
            if ($this->{$kolom} !== null) {
                return $tipe;
            }
        }

        return null;
    }
}
