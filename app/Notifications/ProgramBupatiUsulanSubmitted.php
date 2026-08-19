<?php

namespace App\Notifications;

use App\Models\ProgramBupatiRisikoUsulan;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Dikirim ke Admin/Super Admin saat PIC OPD mengusulkan perubahan kaitan
 * risiko pada satu Program Pembangunan Bupati — menunggu keputusan mereka.
 * Sama pola dgn RiskExcelImportRequestSubmitted.
 */
class ProgramBupatiUsulanSubmitted extends Notification
{
    use Queueable;

    public function __construct(private readonly ProgramBupatiRisikoUsulan $usulan) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $tambah = $this->usulan->aksi === 'tambah';

        return [
            'kind' => 'program_bupati_usulan_submitted',
            'usulan_id' => $this->usulan->id,
            'aksi' => $this->usulan->aksi,
            'submitter_name' => $this->usulan->user?->name,
            'title' => 'Usulan kaitan risiko Program Bupati',
            'body' => ($this->usulan->user?->name ?? 'Seorang PIC')
                .' mengusulkan '.($tambah ? 'penambahan' : 'pelepasan')
                .' kaitan risiko pada Program #'.($this->usulan->program?->nomor ?? '?')
                .' — menunggu persetujuan Anda.',
            'url' => '/program-bupati-risiko',
        ];
    }
}
