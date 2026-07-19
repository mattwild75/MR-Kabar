<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Bagian narasi (Form 11/12/13) — lihat komentar migrasi
 * create_laporan_narasi_table utk penjelasan lengkap skema & kolom.
 */
class LaporanNarasi extends Model
{
    use SoftDeletes;

    protected $table = 'laporan_narasi';

    protected $fillable = [
        'jenis_laporan',
        'opd_id',
        'tahun_penilaian',
        'triwulan',
        'latar_belakang',
        'dasar_hukum',
        'maksud_tujuan',
        'ruang_lingkup',
        'penutup',
        'kondisi_lingkungan_pengendalian',
        'rencana_perbaikan_lingkungan',
        'rancangan_informasi_komunikasi',
        'rancangan_pemantauan',
        'rencana_kegiatan',
        'realisasi_kegiatan',
        'hambatan_pelaksanaan',
        'monitoring_risiko_rtp',
        'rekomendasi_feedback',
        'submitted_by',
    ];

    public function opd(): BelongsTo
    {
        return $this->belongsTo(Opd::class);
    }

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public static function forKey(string $jenis, ?int $opdId, int $tahun, ?string $triwulan): ?self
    {
        return static::where('jenis_laporan', $jenis)
            ->where('opd_id', $opdId)
            ->where('tahun_penilaian', $tahun)
            ->where('triwulan', $triwulan)
            ->first();
    }
}
