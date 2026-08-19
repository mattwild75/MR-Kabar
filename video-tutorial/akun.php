<?php

/**
 * Kata sandi sementara untuk akun perekam, berikut pemulihannya.
 *
 * Perekaman menyetir peramban sungguhan, jadi ia harus benar-benar masuk lewat
 * halaman login. Sandi asli akun yang dipinjam tidak diketahui dan tidak perlu
 * diketahui: skrip ini MENYIMPAN hash yang sekarang, memasang sandi acak, lalu
 * MENGEMBALIKAN hash aslinya persis seperti semula sesudah rekaman selesai.
 * Pemilik akunnya tidak kehilangan apa pun.
 *
 * Sandinya sengaja TIDAK ditulis di dalam berkas ini. Sebelumnya ia berupa
 * teks tetap, dan itu berarti siapa pun yang membaca repositori tahu sandi apa
 * yang akan terpasang seandainya perintah ini dijalankan di pemasangan yang
 * sungguhan. Sekarang ia dibuat acak tiap kali dan hanya hidup di berkas
 * simpanan yang di-gitignore.
 *
 * Akun bersama LAPOR TIDAK perlu dipinjam — sandinya memang sudah ada di
 * konfigurasi aplikasi (LAPOR_ACCOUNT_PASSWORD), karena akun itu dipakai
 * publik lewat kode QR.
 *
 *   php akun.php pasang [USERNAME]     -> simpan hash lama, pasang sandi acak
 *   php akun.php pulihkan              -> kembalikan SEMUA hash yang dipinjam
 *   php akun.php periksa               -> lihat keadaan sekarang
 *   php akun.php sandi USERNAME        -> cetak sandi sementara akun itu
 *   php akun.php sandi-lapor           -> cetak sandi akun bersama LAPOR
 */
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Str;

const BAWAAN = 'PIC_INSPEKTORAT';
const SIMPANAN = __DIR__.'/.sandi-lama';

$aksi = $argv[1] ?? 'periksa';
$username = $argv[2] ?? BAWAAN;

/** @return array<string, array{hash:string, sandi:string}> */
function simpanan(): array
{
    if (! file_exists(SIMPANAN)) {
        return [];
    }
    $isi = json_decode(trim(file_get_contents(SIMPANAN)), true) ?: [];

    // Bentuk lama: satu akun saja, tanpa kunci username. Dibaca supaya
    // simpanan yang terlanjur dibuat versi sebelumnya tetap bisa dipulihkan.
    if (isset($isi['hash'])) {
        return [BAWAAN => $isi];
    }

    return $isi;
}

function tulisSimpanan(array $data): void
{
    if ($data) {
        file_put_contents(SIMPANAN, json_encode($data));
    } elseif (file_exists(SIMPANAN)) {
        unlink(SIMPANAN);
    }
}

// Dipisah supaya pembacaan sandi tidak perlu menyentuh basis data.
if ($aksi === 'sandi') {
    $s = simpanan();
    if (! isset($s[$username])) {
        fwrite(STDERR, "sandi sementara untuk $username belum dipasang\n");
        exit(1);
    }
    echo $s[$username]['sandi'];
    exit(0);
}

if ($aksi === 'sandi-lapor') {
    $sandi = env('LAPOR_ACCOUNT_PASSWORD');
    if (! $sandi) {
        fwrite(STDERR, "LAPOR_ACCOUNT_PASSWORD tidak ada di konfigurasi\n");
        exit(1);
    }
    echo $sandi;
    exit(0);
}

if ($aksi === 'pasang') {
    $s = simpanan();
    if (isset($s[$username])) {
        exit("Sandi sementara untuk $username sudah terpasang.\n");
    }
    $user = User::where('username', $username)->firstOrFail();
    $sandi = Str::password(28, true, true, false, false);
    $s[$username] = ['hash' => $user->getAttributes()['password'], 'sandi' => $sandi];
    tulisSimpanan($s);
    $user->password = $sandi;   // model men-cast 'password' => 'hashed'
    $user->saveQuietly();
    echo "Sandi sementara terpasang untuk $username.\n";
    echo 'Hash lama tersimpan di '.basename(SIMPANAN)." - WAJIB dipulihkan.\n";
} elseif ($aksi === 'pulihkan') {
    $s = simpanan();
    if (! $s) {
        exit("Tidak ada simpanan; tidak ada yang dipulihkan.\n");
    }
    foreach ($s as $nama => $isi) {
        $user = User::where('username', $nama)->first();
        if ($user) {
            $user->forceFill(['password' => $isi['hash']])->saveQuietly();
            echo "Hash sandi asli $nama sudah dikembalikan.\n";
        } else {
            echo "Akun $nama tidak ditemukan - dilewati.\n";
        }
    }
    tulisSimpanan([]);
} else {
    $s = simpanan();
    echo 'Akun yang sedang dipinjam: '.($s ? implode(', ', array_keys($s)) : 'tidak ada')."\n";
}
