<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Peringatan operasional untuk Super Admin: cadangan/Drive gagal, deploy
 * ditolak, disk menipis, sertifikat hampir habis, dan laporan kesehatan
 * mingguan. Selalu masuk lonceng notifikasi (database); dikirim juga lewat
 * surel bila MAIL_MAILER bukan "log" — tanpa SMTP pun peringatannya tetap
 * terlihat di aplikasi.
 */
class PeringatanServer extends Notification
{
    use Queueable;

    /** @param  list<string>  $baris */
    public function __construct(
        private readonly string $judul,
        private readonly string $ringkas,
        private readonly array $baris = [],
        private readonly string $url = '/backup',
        private readonly string $jenis = 'peringatan_server',
    ) {}

    public function via(object $notifiable): array
    {
        $saluran = ['database'];
        if (config('mail.default') !== 'log' && filled($notifiable->email ?? null)) {
            $saluran[] = 'mail';
        }

        return $saluran;
    }

    public function toArray(object $notifiable): array
    {
        return ['kind' => $this->jenis, 'title' => $this->judul, 'body' => $this->ringkas, 'url' => $this->url];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $m = (new MailMessage)->subject('[MR Kabar] '.$this->judul)->greeting($this->judul)->line($this->ringkas);
        foreach ($this->baris as $b) {
            $m->line('- '.$b);
        }

        return $m->action('Buka halaman Backup', url($this->url));
    }
}
