<?php

/**
 * Akun SEMENTARA untuk memotret layar aplikasi (video edukasi v6).
 *
 * Membuat akun baru (bukan meminjam akun sungguhan), menyalakan dua faktor,
 * lalu mencetak sandi acak + satu kode pemulihan. Sesudah pemotretan, akun
 * dihapus sampai habis. Tidak ada sandi yang ditulis ke berkas.
 *
 *   php akun_shot.php buat    -> cetak "USER=.. PASS=.. KODE=.."
 *   php akun_shot.php hapus
 */
require __DIR__.'/../../vendor/autoload.php';
$app = require_once __DIR__.'/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Services\DuaFaktorService;
use Illuminate\Support\Str;

const NAMA = 'shot_v6';

$aksi = $argv[1] ?? 'cek';
$u = User::where('username', NAMA)->first();

if ($aksi === 'buat') {
    $sandi = Str::password(20, symbols: false);
    $u ??= new User(['username' => NAMA]);
    $u->name = 'Inspektorat Aceh Barat';
    $u->email = 'shot-v6@mrkabar.local';
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
