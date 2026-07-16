<?php

namespace App\Notifications;

use App\Models\TroubleshootReport;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Dikirim ke pelapor saat status laporan troubleshoot-nya diubah oleh
 * Admin/Super Admin (mis. dari "baru" ke "diproses" atau "selesai") —
 * TIDAK dikirim saat laporan dihapus (lihat TroubleshootReportController::
 * destroy(), sengaja tidak memicu notifikasi ini).
 */
class TroubleshootReportStatusChanged extends Notification
{
    use Queueable;

    public function __construct(private readonly TroubleshootReport $report)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $statusLabel = match ($this->report->status) {
            'diproses' => 'sedang diproses',
            'selesai' => 'selesai ditangani',
            default => $this->report->status,
        };

        return [
            'kind' => 'troubleshoot_report_status_changed',
            'report_id' => $this->report->id,
            'status' => $this->report->status,
            'title' => 'Status laporan troubleshoot diperbarui',
            'body' => 'Laporan Anda "' . $this->report->subject . '" ' . $statusLabel . '.',
            'url' => '/troubleshoot',
        ];
    }
}
