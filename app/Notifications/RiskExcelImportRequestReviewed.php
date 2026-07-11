<?php

namespace App\Notifications;

use App\Models\RiskExcelImportRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Dikirim ke pengaju (submitter) saat permintaan impor Excel-nya
 * diputuskan (disetujui/ditolak) oleh Admin/Super Admin — baik alur
 * admin 6-modul maupun PIC OPD 3-modul KRS.
 */
class RiskExcelImportRequestReviewed extends Notification
{
    use Queueable;

    public function __construct(private readonly RiskExcelImportRequest $importRequest)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $isPicOpd = $this->importRequest->scope === 'pic_opd';
        $approved = $this->importRequest->status === 'approved';
        $reviewerName = $this->importRequest->reviewer?->name ?? 'Admin';

        $body = $approved
            ? "Impor Excel Anda (\"{$this->importRequest->original_filename}\") telah disetujui oleh {$reviewerName}."
            : "Impor Excel Anda (\"{$this->importRequest->original_filename}\") ditolak oleh {$reviewerName}"
                . ($this->importRequest->rejection_reason ? ": {$this->importRequest->rejection_reason}" : '.');

        return [
            'kind' => 'risk_excel_import_reviewed',
            'import_request_id' => $this->importRequest->id,
            'scope' => $this->importRequest->scope,
            'status' => $this->importRequest->status,
            'title' => $approved ? 'Impor Excel disetujui' : 'Impor Excel ditolak',
            'body' => $body,
            'url' => $isPicOpd ? '/krs-excel' : '/backup/excel',
        ];
    }
}
