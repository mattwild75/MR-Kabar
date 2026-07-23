<?php

namespace App\Models\Concerns;

use App\Models\MonitoringRtp;
use App\Models\PencatatanKejadianRisiko;

/**
 * MonitoringRtp (Form 8/9) & PencatatanKejadianRisiko (Form 10) menyimpan FK
 * LOGIS (rtp_sumber_tipe+rtp_sumber_id / risiko_tipe+risiko_id) ke baris
 * risiko IrsPemda/IrsPd/IroPd — bukan foreign key database asli, jadi tidak
 * ada ON DELETE CASCADE otomatis. Tanpa trait ini, soft-delete baris risiko
 * meninggalkan baris Monitoring/Pencatatan "yatim" yang masih menunjuk id
 * yang sudah terhapus: metrik kepatuhan dashboard tetap menghitungnya
 * (menghasilkan status "lengkap" yang salah) dan `rtpSumber()`/
 * `risikoSumber()` mengembalikan null diam-diam bila diakses tanpa
 * null-check.
 *
 * Dipakai di IrsPemda/IrsPd/IroPd via `use CascadeSoftDeletesToMonitoring;`
 * — saat model di-soft-delete, baris Monitoring/Pencatatan yg menunjuknya
 * ikut di-soft-delete (bukan force-delete, supaya masih bisa direstore
 * berpasangan lewat menu Data Terhapus/Trash bila risiko-nya direstore).
 */
trait CascadeSoftDeletesToMonitoring
{
    protected static function bootCascadeSoftDeletesToMonitoring(): void
    {
        static::deleting(function ($model) {
            if ($model->isForceDeleting()) {
                // Force-delete permanen (dari menu Trash) — biarkan
                // MonitoringRtp/PencatatanKejadianRisiko ikut dibersihkan
                // permanen juga, bukan cuma soft-delete.
                MonitoringRtp::where('rtp_sumber_tipe', $model->sumberTipe())
                    ->where('rtp_sumber_id', $model->id)
                    ->get()
                    ->each
                    ->forceDelete();

                PencatatanKejadianRisiko::where('risiko_tipe', $model->sumberTipe())
                    ->where('risiko_id', $model->id)
                    ->get()
                    ->each
                    ->forceDelete();

                return;
            }

            MonitoringRtp::where('rtp_sumber_tipe', $model->sumberTipe())
                ->where('rtp_sumber_id', $model->id)
                ->delete();

            PencatatanKejadianRisiko::where('risiko_tipe', $model->sumberTipe())
                ->where('risiko_id', $model->id)
                ->delete();
        });

        static::restoring(function ($model) {
            MonitoringRtp::onlyTrashed()
                ->where('rtp_sumber_tipe', $model->sumberTipe())
                ->where('rtp_sumber_id', $model->id)
                ->restore();

            PencatatanKejadianRisiko::onlyTrashed()
                ->where('risiko_tipe', $model->sumberTipe())
                ->where('risiko_id', $model->id)
                ->restore();
        });
    }

    /**
     * Nilai yg tersimpan di kolom rtp_sumber_tipe/risiko_tipe — konsisten
     * dgn map yg sudah dipakai MonitoringRtp::rtpSumber() &
     * PencatatanKejadianRisiko::risikoSumber() ('irs_pemda'/'irs_pd'/'iro_pd').
     */
    abstract public function sumberTipe(): string;
}
