<?php

namespace App\Models\Pkpt;

use App\Models\KrsPemda;
use App\Models\Opd;
use App\Models\ProgramPembangunanBupati;
use App\Observers\GlobalActivityLogger;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Formulir 1 — Peta Auditan. Satu baris = satu Area Pengawasan (auditable
 * unit) pada satu periode.
 *
 * Pagu anggaran DITAMPUNG DI SINI, bukan di tbl_krs_pemda/tbl_krs_pd/
 * tbl_kro_pd. Pagu adalah masukan perencanaan pengawasan milik Inspektorat,
 * bukan atribut risiko milik SKPK, dan menaruhnya di sini membuat modul PKPT
 * tidak perlu mengubah satu kolom pun pada tabel MR Kabar.
 */
#[ObservedBy([GlobalActivityLogger::class])]
class PkptAreaPengawasan extends Model
{
    use SoftDeletes;

    protected $table = 'pkpt_area_pengawasan';

    protected $fillable = [
        'periode_id', 'kelompok', 'nama', 'tujuan_sasaran', 'opd_id',
        'opd_pendukung', 'urusan', 'pagu_anggaran', 'irban',
        'tahun_terakhir_diawasi', 'jenis_penugasan_terakhir', 'keterangan',
        'krs_pemda_id', 'program_bupati_id',
    ];

    protected function casts(): array
    {
        return [
            'pagu_anggaran' => 'integer',
            'tahun_terakhir_diawasi' => 'integer',
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

    public function krsPemda(): BelongsTo
    {
        return $this->belongsTo(KrsPemda::class, 'krs_pemda_id');
    }

    public function programBupati(): BelongsTo
    {
        return $this->belongsTo(ProgramPembangunanBupati::class, 'program_bupati_id');
    }

    public function faktorRisiko(): HasOne
    {
        return $this->hasOne(PkptFaktorRisiko::class, 'area_id');
    }

    public function penilaian(): HasOne
    {
        return $this->hasOne(PkptPenilaian::class, 'area_id');
    }
}
