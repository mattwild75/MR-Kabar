<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Kaitan Program Pembangunan Bupati <-> risiko teridentifikasi (IRS Pemda/
 * IRS PD/IRO PD) — lihat migrasi
 * 2026_07_27_153658_create_program_bupati_risiko_table.php utk penjelasan
 * pola polimorfik risiko_tipe/risiko_id. SoftDeletes (lihat migrasi
 * 2026_07_27_160237_...) — kaitan yg dihapus lewat UI halaman "Risiko 100
 * Program Bupati" bisa dipulihkan, konsisten dgn konvensi hapus data
 * risiko lain di aplikasi ini (lihat memory "Soft Delete + Trash").
 */
class ProgramBupatiRisiko extends Model
{
    use SoftDeletes;

    protected $table = 'program_bupati_risiko';

    protected $fillable = [
        'program_pembangunan_bupati_id',
        'risiko_tipe',
        'risiko_id',
    ];

    private const RISIKO_MODELS = [
        'irs_pemda' => IrsPemda::class,
        'irs_pd' => IrsPd::class,
        'iro_pd' => IroPd::class,
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(ProgramPembangunanBupati::class, 'program_pembangunan_bupati_id');
    }

    /** Model risiko terkait (IrsPemda/IrsPd/IroPd) — query 1x, JANGAN dipanggil dalam loop banyak baris (N+1). */
    public function risiko(): ?Model
    {
        $modelClass = self::RISIKO_MODELS[$this->risiko_tipe] ?? null;

        return $modelClass ? $modelClass::find($this->risiko_id) : null;
    }

    /**
     * "Program #N — Uraian Risiko" — accessor dipakai TrashController
     * sbg title_field, supaya baris terhapus di halaman /trash langsung
     * terbaca maksudnya (bukan sekadar "irs_pd" / "45" yg tidak informatif
     * tanpa join manual). N+1 aman di sini krn Trash hanya me-load
     * maks 500 baris terhapus dari SATU tipe aktif sekaligus (lihat
     * TrashController::index()), bukan ratusan tipe berbeda dicampur.
     */
    public function getRingkasanAttribute(): string
    {
        $risiko = $this->risiko();
        $uraian = $risiko?->{'URAIAN RISIKO'} ?? '(risiko sumber sudah tidak ada)';

        return "Program #{$this->program?->nomor} — {$uraian}";
    }
}
