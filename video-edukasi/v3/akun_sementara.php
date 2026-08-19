<?php

/**
 * Akun sementara untuk mengambil tangkapan layar aplikasi.
 *
 * Sengaja MEMBUAT akun baru, bukan meminjam akun yang sudah ada. Cara meminjam
 * (lihat video-tutorial/akun.php) mengganti sandi akun sungguhan dan
 * mengembalikannya belakangan — kalau langkah pengembaliannya terlewat,
 * pemilik akun terkunci dari aplikasinya sendiri tanpa pesan galat apa pun
 * yang menjelaskan sebabnya. Untuk keperluan sekadar memotret layar, risiko
 * itu tidak sepadan.
 *
 * Sandinya acak, dicetak ke layar sekali, dan disimpan di luar repositori.
 *
 *   php akun_sementara.php buat   -> buat akun, cetak "username sandi"
 *   php akun_sementara.php hapus  -> hapus akun itu sampai habis
 *   php akun_sementara.php cek    -> masih ada atau tidak
 */
require __DIR__.'/../../vendor/autoload.php';
$app = require_once __DIR__.'/../../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

const NAMA = 'shot_sementara';
const SUREL = 'shot-sementara@mrkabar.local';

$aksi = $argv[1] ?? 'cek';

/** User tidak memakai SoftDeletes, jadi pencarian biasa sudah menemukan semuanya. */
function cari(): ?User
{
    return User::where('username', NAMA)->first();
}

if ($aksi === 'buat') {
    if (cari()) {
        fwrite(STDERR, "Akun sementara sudah ada. Jalankan 'hapus' dulu.\n");
        exit(1);
    }
    $sandi = Str::random(28);
    $u = User::create([
        'name' => 'Pengambil Tangkapan Layar',
        'username' => NAMA,
        'email' => SUREL,
        'password' => Hash::make($sandi),
    ]);
    // super-admin: tangkapan layar harus memperlihatkan seluruh OPD dan menu
    // yang hanya terbuka bagi peran itu (Backup/Excel, Keterangan Pendukung,
    // Log Aktivitas).
    $u->assignRole('super-admin');
    echo NAMA.' '.$sandi."\n";
    exit(0);
}

if ($aksi === 'hapus') {
    $u = cari();
    if (! $u) {
        echo "Tidak ada akun sementara.\n";
        exit(0);
    }
    $id = $u->id;
    $u->forceDelete();
    echo "Akun sementara (id {$id}) dihapus sampai habis.\n";
    exit(cari() ? 1 : 0);
}

$u = cari();
echo $u
    ? "MASIH ADA: id {$u->id}, dibuat {$u->created_at}\n"
    : "bersih, tidak ada akun sementara\n";
