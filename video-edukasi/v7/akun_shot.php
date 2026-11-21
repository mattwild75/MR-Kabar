<?php

/**
 * Akun SEMENTARA untuk memotret layar aplikasi lokal (video edukasi v7).
 *
 * Membuat akun baru (bukan meminjam akun sungguhan), menyalakan dua faktor,
 * lalu mencetak sandi acak + kode pemulihan untuk skrip pemotret. Sesudah
 * pemotretan, akun dihapus sampai habis. Tidak ada sandi yang ditulis ke berkas.
 *
 *   php akun_shot.php buat    -> cetak "USER=.. PASS=.. KODE=.."
 *   php akun_shot.php hapus
 */

use App\Models\User;
use App\Services\DuaFaktorService;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Str;

require __DIR__.'/../../vendor/autoload.php';
$app = require_once __DIR__.'/../../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

const NAMA = 'shot_v7';

$aksi = $argv[1] ?? 'cek';
$u = User::where('username', NAMA)->first();

if ($aksi === 'buat') {
    $sandi = Str::password(20, symbols: false);
    $u ??= new User(['username' => NAMA]);
    $u->name = 'Inspektorat Aceh Barat';
    $u->email = 'shot-v7@mrkabar.local';
    $u->password = bcrypt($sandi);
    $u->email_verified_at = now();
    $u->save();
    $u->syncRoles(['super-admin']);
    $layanan = app(DuaFaktorService::class);
    $kode = $layanan->nyalakan($u, $layanan->buatKunci());
    echo 'USER='.NAMA.' PASS='.$sandi.' KODE='.$kode[0].' KODE2='.$kode[1]."\n";
} elseif ($aksi === 'hapus') {
    if ($u) {
        $u->syncRoles([]);
        $u->delete();
    }
    echo 'ada? '.(User::where('username', NAMA)->exists() ? 'ya' : 'tidak')."\n";
} else {
    echo 'ada? '.($u ? 'ya' : 'tidak')."\n";
}
