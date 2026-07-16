<?php

namespace App\Notifications;

use App\Models\TroubleshootReport;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Dikirim ke Admin/Super Admin saat ada laporan troubleshoot baru (dari
 * form di footer, bisa diajukan siapa pun yang login) menunggu ditinjau.
 */
class TroubleshootReportSubmitted extends Notification
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
        return [
            'kind' => 'troubleshoot_report_submitted',
            'report_id' => $this->report->id,
            'reporter_name' => $this->report->user?->name,
            'category' => $this->report->category,
            'title' => 'Laporan troubleshoot baru',
            'body' => ($this->report->user?->name ?? 'Seseorang')
                . ' mengirim laporan "' . $this->report->subject . '" (' . $this->report->category . ').',
            'url' => '/troubleshoot',
        ];
    }
}
