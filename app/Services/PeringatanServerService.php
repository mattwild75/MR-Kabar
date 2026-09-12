<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\PeringatanServer;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Notification;

/**
 * Pengirim peringatan operasional ke semua Super Admin. Peringatan yang
 * sama tidak diulang lebih cepat dari 12 jam (kunci di cache) supaya
 * kegagalan yang berlangsung berhari-hari tidak membanjiri lonceng.
 */
class PeringatanServerService
{
    /** @param  list<string>  $baris */
    public function kirim(string $kunci, string $judul, string $ringkas, array $baris = [], string $url = '/backup', int $jedaJam = 12): bool
    {
        $tanda = 'peringatan_server:'.$kunci;
        if (Cache::has($tanda)) {
            return false;
        }
        $penerima = User::role('super-admin')->get();
        if ($penerima->isEmpty()) {
            return false;
        }
        Notification::send($penerima, new PeringatanServer($judul, $ringkas, $baris, $url));
        Cache::put($tanda, now()->toDateTimeString(), now()->addHours($jedaJam));

        return true;
    }
}
