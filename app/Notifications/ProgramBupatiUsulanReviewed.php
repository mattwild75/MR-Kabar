<?php

namespace App\Notifications;

use App\Models\ProgramBupatiRisikoUsulan;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Dikirim balik ke PIC pengusul setelah Admin/Super Admin menyetujui atau
 * menolak usulannya. Sama pola dgn RiskExcelImportRequestReviewed — tanpa
 * ini pengusul tidak punya cara tahu keputusannya selain membuka halamannya
 * lagi dan menebak.
 */
class ProgramBupatiUsulanReviewed extends Notification
{
    use Queueable;

    public function __construct(private readonly ProgramBupatiRisikoUsulan $usulan)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $disetujui = $this->usulan->status === 'approved';
        $tambah = $this->usulan->aksi === 'tambah';
        $nomor = $this->usulan->program?->nomor ?? '?';

        return [
            'kind' => 'program_bupati_usulan_reviewed',
            'usulan_id' => $this->usulan->id,
            'status' => $this->usulan->status,
            'aksi' => $this->usulan->aksi,
            'reviewer_name' => $this->usulan->peninjau?->name,
            'title' => $disetujui ? 'Usulan kaitan risiko disetujui' : 'Usulan kaitan risiko ditolak',
            'body' => 'Usulan ' . ($tambah ? 'penambahan' : 'pelepasan')
                . ' kaitan risiko pada Program #' . $nomor . ' '
                . ($disetujui
                    ? 'telah disetujui dan sudah berlaku.'
                    : 'ditolak.' . ($this->usulan->rejection_reason ? ' Alasan: ' . $this->usulan->rejection_reason : '')),
            'url' => '/program-bupati-risiko',
        ];
    }
}
