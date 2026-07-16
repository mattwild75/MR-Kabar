<?php

namespace App\Notifications;

use App\Models\LaporanKejadianRisiko;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Dikirim ke pelapor (jika akun login yang melapor, bukan lewat akun
 * bersama LAPOR tanpa identitas akun) saat status tindak lanjut laporannya
 * diubah oleh PIC OPD/Admin/Super Admin.
 */
class LaporanKejadianRisikoStatusChanged extends Notification
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
        $statusLabel = match ($this->laporan->status) {
            'diverifikasi' => 'diverifikasi',
            'ditindaklanjuti' => 'sedang ditindaklanjuti',
            'selesai' => 'selesai ditangani',
            default => $this->laporan->status,
        };

        return [
            'kind' => 'laporan_kejadian_risiko_status_changed',
            'laporan_id' => $this->laporan->id,
            'status' => $this->laporan->status,
            'title' => 'Status laporan kejadian risiko diperbarui',
            'body' => 'Laporan kejadian Anda "' . str($this->laporan->kejadian)->limit(60) . '" ' . $statusLabel . '.',
            'url' => '/lapor-kejadian/rekap',
        ];
    }
}
