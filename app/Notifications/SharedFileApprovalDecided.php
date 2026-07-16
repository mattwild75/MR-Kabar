<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Dikirim ke pengunggah saat file yang ia kirim ke Folder Umum
 * disetujui atau ditolak oleh Admin/Super Admin.
 */
class SharedFileApprovalDecided extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Media $media,
        private readonly bool $approved,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'kind' => 'shared_file_approval_decided',
            'media_id' => $this->media->id,
            'file_name' => $this->media->file_name,
            'approved' => $this->approved,
            'title' => $this->approved ? 'File Anda disetujui di Folder Umum' : 'File Anda ditolak di Folder Umum',
            'body' => $this->approved
                ? 'File "' . $this->media->file_name . '" yang Anda unggah ke Folder Umum telah disetujui dan kini terlihat oleh semua pengguna.'
                : 'File "' . $this->media->file_name . '" yang Anda unggah ke Folder Umum ditolak dan telah dihapus.',
            'url' => '/files?scope=shared',
        ];
    }
}
