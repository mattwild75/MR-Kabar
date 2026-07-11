<?php

namespace App\Notifications;

use App\Models\RiskExcelImportRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Dikirim ke Admin/Super Admin saat ada permintaan impor Excel baru
 * (baik scope='admin' 6-modul dari /backup/excel, maupun scope='pic_opd'
 * 3-modul KRS dari /krs-excel) menunggu persetujuan mereka.
 */
class RiskExcelImportRequestSubmitted extends Notification
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

        return [
            'kind' => 'risk_excel_import_submitted',
            'import_request_id' => $this->importRequest->id,
            'scope' => $this->importRequest->scope,
            'submitter_name' => $this->importRequest->user?->name,
            'original_filename' => $this->importRequest->original_filename,
            'title' => 'Permintaan impor Excel baru',
            'body' => ($this->importRequest->user?->name ?? 'Seseorang')
                . ' mengajukan impor ' . ($isPicOpd ? 'KRS (Excel)' : 'Excel 6-modul')
                . ' — menunggu persetujuan Anda.',
            'url' => $isPicOpd ? '/krs-excel' : '/backup/excel',
        ];
    }
}
