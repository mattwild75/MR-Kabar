<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\DuaFaktorService;
use Illuminate\Console\Command;

/**
 * Jalan keluar terakhir kalau ponsel pemegang akun hilang.
 *
 * KENAPA PERINTAH INI HARUS ADA. Super Admin di aplikasi ini cuma satu, dan
 * tidak ada siapa pun di atasnya yang bisa membukakan. Kalau ponselnya hilang
 * dan lembar kode pemulihannya ikut hilang, tanpa perintah ini akun itu
 * terkunci selamanya — beserta seluruh data kabupaten di belakangnya.
 *
 * KENAPA INI BUKAN CELAH KEAMANAN. Perintah ini hanya bisa dijalankan dari
 * baris perintah di mesin server. Siapa pun yang sampai ke sana sudah bisa
 * membaca basis datanya langsung, mengganti sandi lewat tinker, atau
 * menyalin seluruh isinya. Lapisan kedua tidak pernah dimaksudkan menahan
 * orang yang sudah memegang mesinnya.
 *
 *   php artisan duafaktor:matikan memet
 *   php artisan duafaktor:matikan memet --paksa   (tanpa bertanya)
 */
class MatikanDuaFaktor extends Command
{
    protected $signature = 'duafaktor:matikan {username : Nama pengguna akun yang akan dibuka} {--paksa : Jangan tanya konfirmasi}';

    protected $description = 'Mematikan autentikasi dua faktor satu akun — jalan keluar kalau ponselnya hilang';

    public function handle(DuaFaktorService $duaFaktor): int
    {
        $username = $this->argument('username');
        $user = User::where('username', $username)->first();

        if (! $user) {
            $this->error("Akun '{$username}' tidak ada.");

            return self::FAILURE;
        }

        if (! $duaFaktor->aktif($user)) {
            $this->info("Akun '{$username}' memang belum memakai autentikasi dua faktor. Tidak ada yang diubah.");

            return self::SUCCESS;
        }

        $peran = $user->getRoleNames()->implode(', ') ?: '(tanpa peran)';
        $this->warn('Akan mematikan autentikasi dua faktor untuk:');
        $this->line("  akun  : {$user->username} (id {$user->id})");
        $this->line("  nama  : {$user->name}");
        $this->line("  peran : {$peran}");

        if (! $this->option('paksa') && ! $this->confirm('Lanjutkan?', false)) {
            $this->info('Dibatalkan.');

            return self::SUCCESS;
        }

        $duaFaktor->matikan($user);

        // Dicatat ke log aplikasi, bukan cuma ke layar. Mematikan lapisan
        // keamanan seseorang harus meninggalkan jejak yang bisa ditengok
        // belakangan, sekalipun yang menjalankannya pemilik server sendiri.
        logger()->warning('Autentikasi dua faktor dimatikan lewat baris perintah', [
            'username' => $user->username,
            'user_id' => $user->id,
            'peran' => $peran,
        ]);

        $this->info("Selesai. '{$user->username}' kini bisa masuk dengan sandi saja.");
        $this->comment('SEGERA pasang kembali sesudah pemiliknya punya ponsel pengganti.');

        return self::SUCCESS;
    }
}
