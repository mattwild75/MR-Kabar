<?php

namespace App\Models\Pkpt;

use App\Observers\GlobalActivityLogger;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Formulir 11 dan 12 — penugasan yang wajib dimuat dalam PKPT tanpa
 * memperhatikan nilai risiko, dan Area Pengawasan yang justru tidak dimuat
 * karena pada tahun yang sama diawasi pihak lain.
 *
 * Satu tabel karena bentuknya identik dan bedanya hanya alasan. Kolom
 * nama_area ada di samping area_id: penugasan wajib seperti reviu Laporan
 * Keuangan Pemerintah Daerah adalah amanat peraturan, bukan Area Pengawasan
 * hasil pemeringkatan, jadi tidak selalu punya baris di Peta Auditan.
 */
#[ObservedBy([GlobalActivityLogger::class])]
class PkptPenugasanWajib extends Model
{
    use SoftDeletes;

    protected $table = 'pkpt_penugasan_wajib';

    protected $fillable = [
        'periode_id', 'jenis', 'area_id', 'nama_area', 'alasan',
        'dasar_hukum', 'keterangan',
    ];

    public function periode(): BelongsTo
    {
        return $this->belongsTo(PkptPeriode::class, 'periode_id');
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(PkptAreaPengawasan::class, 'area_id');
    }
}
