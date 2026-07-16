<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Dikirim ke Admin/Super Admin saat ada file baru diunggah ke Folder Umum
 * yang menunggu persetujuan sebelum tampil ke pengguna lain (lihat
 * UserFileController::store()/approve()/reject()).
 */
class SharedFileUploadSubmitted extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Media $media,
        private readonly string $uploaderName,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'kind' => 'shared_file_upload_submitted',
            'media_id' => $this->media->id,
            'file_name' => $this->media->file_name,
            'title' => 'File baru menunggu persetujuan di Folder Umum',
            'body' => $this->uploaderName . ' mengunggah "' . $this->media->file_name . '" ke Folder Umum, menunggu persetujuan Anda.',
            'url' => '/files?scope=shared',
        ];
    }
}
