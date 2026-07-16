<?php

namespace App\Notifications;

use App\Models\LaporanKejadianRisiko;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Dikirim ke PIC OPD terkait (jika ada opd_id) dan ke semua Admin/Super
 * Admin saat ada laporan kejadian risiko baru masuk (dari form publik lewat
 * akun bersama LAPOR, atau user login biasa) — lihat
 * LaporanKejadianController::store().
 */
class LaporanKejadianRisikoSubmitted extends Notification
{
    use Queueable;

    public function __construct(private readonly LaporanKejadianRisiko $laporan)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'kind' => 'laporan_kejadian_risiko_submitted',
            'laporan_id' => $this->laporan->id,
            'nama_lengkap' => $this->laporan->nama_lengkap,
            'title' => 'Laporan kejadian risiko baru',
            'body' => $this->laporan->nama_lengkap . ' melaporkan kejadian: "'
                . str($this->laporan->kejadian)->limit(80) . '".',
            'url' => '/lapor-kejadian/rekap',
        ];
    }
}
