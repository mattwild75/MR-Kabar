<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Form 8 (Rencana & Realisasi Pengkomunikasian) + Form 9 (Rencana &
 * Realisasi Pemantauan) atas Kegiatan Pengendalian — Lampiran 5 Perdep PPKD
 * No.4/2019. Satu baris = satu RTP sumber (irs_pemda/irs_pd/iro_pd/cee_rtp)
 * yang dilengkapi kolom monitoring komunikasi & pemantauannya.
 */
class MonitoringRtp extends Model
{
    use SoftDeletes;

    protected $table = 'monitoring_rtp';

    protected $fillable = [
        'rtp_sumber_tipe',
        'rtp_sumber_id',
        'opd_id',
        'tahun_penilaian',
        'media_komunikasi',
        'penyedia_informasi',
        'penerima_informasi',
        'triwulan_rencana_komunikasi',
        'tahun_rencana_komunikasi',
        'realisasi_waktu_komunikasi',
        'keterangan_komunikasi',
        'metode_pemantauan',
        'penanggung_jawab_pemantauan',
        'triwulan_rencana_pemantauan',
        'tahun_rencana_pemantauan',
        'realisasi_waktu_pemantauan',
        'keterangan_pemantauan',
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

    /**
     * Model RTP sumber terkait (IrsPemda/IrsPd/IroPd/CeeRtp) — dipakai utk
     * memproyeksi kolom "Kegiatan Pengendalian yang Dibutuhkan" (b) SECARA
     * LIVE, bukan disimpan sbg salinan di tabel ini (sama pola dgn
     * LaporanKejadianRisiko::risikoTerdaftar()). Query 1x per pemanggilan —
     * JANGAN dipanggil di dalam loop/map atas banyak baris (N+1), pakai
     * batch-lookup whereIn()->keyBy('id') per tipe utk daftar.
     */
    public function rtpSumber(): ?Model
    {
        $map = [
            'irs_pemda' => IrsPemda::class,
            'irs_pd' => IrsPd::class,
            'iro_pd' => IroPd::class,
            'cee_rtp' => CeeRtp::class,
        ];

        $modelClass = $map[$this->rtp_sumber_tipe] ?? null;

        return $modelClass ? $modelClass::find($this->rtp_sumber_id) : null;
    }
}
