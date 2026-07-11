<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Permintaan impor Excel yang ditahan sebagai "pending" sampai disetujui/
 * ditolak, karena impor Excel adalah aksi tulis-massal. Dipakai oleh DUA
 * alur berbeda, dibedakan lewat kolom `scope`:
 * - scope='admin' (default, alur lama): submitter admin (bukan
 *   super-admin — super-admin selalu diproses langsung, tidak pernah
 *   membuat baris di sini), mencakup 6 modul risiko, approver
 *   super-admin-only. Lihat RiskExcelController.
 * - scope='pic_opd' (alur baru): submitter PIC OPD (role 'user'),
 *   mencakup 3 modul perencanaan (KRS Pemda referensi + KRS PD/KRO PD
 *   sbg target tulis), approver admin ATAU super-admin. Lihat
 *   KrsPicExcelController.
 */
class RiskExcelImportRequest extends Model
{
    protected $fillable = [
        'user_id',
        'scope',
        'file_path',
        'original_filename',
        'status',
        'preview_result',
        'reviewed_by',
        'reviewed_at',
        'final_result',
        'rejection_reason',
    ];

    protected $casts = [
        'preview_result' => 'array',
        'final_result' => 'array',
        'reviewed_at' => 'datetime',
    ];

    // "processing" adalah status transisi sangat singkat (di dalam lock
    // approve()) menandai permintaan sudah "diklaim" utk diproses — kalau
    // proses gagal di tengah jalan (exception tak terduga), baris akan
    // tersangkut di status ini alih-alih "pending" (supaya tidak diklaim
    // ulang & diproses dobel oleh percobaan approve berikutnya). Butuh
    // intervensi manual (lihat query super-admin) kalau ini terjadi — kasus
    // sangat jarang, hanya kalau approve() crash tepat setelah klaim lock.
    public const STATUSES = ['pending', 'processing', 'approved', 'rejected'];

    public const SCOPES = ['admin', 'pic_opd'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
