<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Usulan PIC OPD untuk mengaitkan atau melepas risiko pada satu Program
 * Pembangunan Bupati — ditahan sampai disetujui/ditolak Admin atau Super
 * Admin.
 *
 * Alasannya sama dengan yang membuat impor Excel ditahan (lihat
 * RiskExcelImportRequest): halaman ini menghasilkan dokumen tingkat Pemda
 * yang ikut dicetak untuk Bupati, jadi PIC boleh mengusulkan perubahan atas
 * risiko miliknya sendiri, tapi bukan menerapkannya sendiri.
 *
 * Admin & Super Admin TIDAK pernah membuat baris di sini — perubahan
 * mereka langsung berlaku.
 */
class ProgramBupatiRisikoUsulan extends Model
{
    protected $table = 'program_bupati_risiko_usulan';

    protected $fillable = [
        'program_pembangunan_bupati_id',
        'risiko_tipe',
        'risiko_id',
        'aksi',
        'user_id',
        'status',
        'reviewed_by',
        'reviewed_at',
        'rejection_reason',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public const AKSI = ['tambah', 'lepas'];

    public const STATUSES = ['pending', 'approved', 'rejected'];

    private const RISIKO_MODELS = [
        'irs_pemda' => IrsPemda::class,
        'irs_pd' => IrsPd::class,
        'iro_pd' => IroPd::class,
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(ProgramPembangunanBupati::class, 'program_pembangunan_bupati_id');
    }

    /** Pengusul (PIC OPD). */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Admin/Super Admin yang memutuskan. */
    public function peninjau(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Baris risiko yang diusulkan — sama pola dgn ProgramBupatiRisiko::risiko().
     * JANGAN dipanggil di dalam loop banyak baris (N+1).
     */
    public function risiko(): ?Model
    {
        $modelClass = self::RISIKO_MODELS[$this->risiko_tipe] ?? null;

        return $modelClass ? $modelClass::find($this->risiko_id) : null;
    }
}
