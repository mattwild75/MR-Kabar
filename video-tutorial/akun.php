<?php
/**
 * Kata sandi sementara untuk akun perekam, berikut pemulihannya.
 *
 * Perekaman menyetir peramban sungguhan, jadi ia harus benar-benar masuk lewat
 * halaman login. Sandi asli akun PIC tidak diketahui dan tidak perlu diketahui:
 * skrip ini MENYIMPAN hash yang sekarang ke berkas, memasang sandi sementara
 * yang dibuat acak, lalu MENGEMBALIKAN hash aslinya persis seperti semula
 * sesudah rekaman selesai. Akun pemiliknya tidak kehilangan apa pun.
 *
 * Sandinya sengaja TIDAK ditulis di dalam berkas ini. Sebelumnya ia berupa
 * teks tetap, dan itu berarti siapa pun yang membaca repositori tahu sandi apa
 * yang akan terpasang seandainya perintah ini dijalankan di pemasangan yang
 * sungguhan. Sekarang ia dibuat acak tiap kali dan hanya hidup di berkas
 * simpanan yang di-gitignore.
 *
 *   php akun.php pasang     -> simpan hash lama, pasang sandi acak
 *   php akun.php pulihkan   -> kembalikan hash lama, hapus berkasnya
 *   php akun.php periksa    -> lihat keadaan sekarang
 *   php akun.php sandi      -> cetak sandi sementara (dipakai skrip perekam)
 */
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Str;

const USERNAME = 'PIC_INSPEKTORAT';
const SIMPANAN = __DIR__ . '/.sandi-lama';

$aksi = $argv[1] ?? 'periksa';

function simpanan(): ?array
{
    if (! file_exists(SIMPANAN)) {
        return null;
    }

    return json_decode(trim(file_get_contents(SIMPANAN)), true) ?: null;
}

// Dipisah supaya 'sandi' tidak perlu menyentuh basis data sama sekali.
if ($aksi === 'sandi') {
    $s = simpanan();
    if (! $s) {
        fwrite(STDERR, "sandi sementara belum dipasang - jalankan 'php akun.php pasang'\n");
        exit(1);
    }
    echo $s['sandi'];
    exit(0);
}

$user = User::where('username', USERNAME)->firstOrFail();

if ($aksi === 'pasang') {
    if (simpanan()) {
        exit("Sudah ada simpanan. Jalankan 'pulihkan' lebih dulu.\n");
    }
    $sandi = Str::password(28, true, true, false, false);
    file_put_contents(SIMPANAN, json_encode([
        'hash' => $user->getAttributes()['password'],
        'sandi' => $sandi,
    ]));
    $user->password = $sandi;   // model men-cast 'password' => 'hashed'
    $user->saveQuietly();
    echo 'Sandi sementara terpasang untuk ' . USERNAME . ".\n";
    echo "Hash lama tersimpan di " . basename(SIMPANAN) . " - WAJIB dipulihkan.\n";
} elseif ($aksi === 'pulihkan') {
    $s = simpanan();
    if (! $s) {
        exit("Tidak ada simpanan; tidak ada yang dipulihkan.\n");
    }
    $user->forceFill(['password' => $s['hash']])->saveQuietly();
    unlink(SIMPANAN);
    echo 'Hash sandi asli ' . USERNAME . " sudah dikembalikan.\n";
} else {
    echo 'Akun    : ' . $user->username . ' (id ' . $user->id . ', opd_id ' . $user->opd_id . ")\n";
    echo 'Simpanan: ' . (simpanan() ? 'ADA - sandi masih sementara' : 'tidak ada') . "\n";
}
