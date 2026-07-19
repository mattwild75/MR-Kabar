<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Form 10: Pencatatan Kejadian Risiko (Risk Event) & Pelaksanaan RTP —
 * Lampiran 5 Perdep PPKD No.4/2019. Satu baris = satu risiko sumber
 * (irs_pemda/irs_pd/iro_pd) yang dicatat kejadian & realisasi RTP-nya utk
 * satu tahun penilaian.
 */
class PencatatanKejadianRisiko extends Model
{
    use SoftDeletes;

    protected $table = 'pencatatan_kejadian_risiko';

    protected $fillable = [
        'risiko_tipe',
        'risiko_id',
        'laporan_kejadian_id',
        'opd_id',
        'tahun_penilaian',
        'tanggal_terjadi',
        'sebab_saat_kejadian',
        'dampak_saat_kejadian',
        'keterangan_kejadian',
        'triwulan_rencana_rtp',
        'tahun_rencana_rtp',
        'realisasi_pelaksanaan_rtp',
        'keterangan_rtp',
        'submitted_by',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_terjadi' => 'date',
        ];
    }

    public function opd(): BelongsTo
    {
        return $this->belongsTo(Opd::class);
    }

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    /** Laporan warga (QR) asal baris ini, kalau dibuat via alur "Catat ke Form 10" — null utk Form 10 yg diisi manual tanpa asal laporan warga. */
    public function laporanKejadian(): BelongsTo
    {
        return $this->belongsTo(LaporanKejadianRisiko::class, 'laporan_kejadian_id');
    }

    /**
     * Model risiko sumber terkait (IrsPemda/IrsPd/IroPd) — dipakai utk
     * memproyeksi Uraian Risiko & Kode Risiko SECARA LIVE, sama pola dgn
     * MonitoringRtp::rtpSumber() / LaporanKejadianRisiko::risikoTerdaftar().
     * Query 1x per pemanggilan — JANGAN dipanggil di dalam loop/map.
     */
    public function risikoSumber(): ?Model
    {
        $map = [
            'irs_pemda' => IrsPemda::class,
            'irs_pd' => IrsPd::class,
            'iro_pd' => IroPd::class,
        ];

        $modelClass = $map[$this->risiko_tipe] ?? null;

        return $modelClass ? $modelClass::find($this->risiko_id) : null;
    }
}
