<?php

namespace Database\Seeders;

use App\Models\RiskLevel;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
        ]);

        // Enam tabel referensi Risiko — matriks 5x5, level Risiko berikut
        // Selera Risiko, kriteria dampak, kriteria kemungkinan, Jenis Risiko,
        // dan Entitas Penilai — dibentuk KOSONG oleh migrasinya. Tanpa isinya
        // matriks analisis kosong dan seluruh penilaian Risiko mati, tanpa
        // pesan galat yang menjelaskan kenapa.
        //
        // Dijalankan HANYA saat tabelnya memang masih kosong. RiskReference-
        // DataSeeder memakai updateOrCreate, sehingga memanggilnya di basis
        // data yang matriks atau Selera Risikonya sudah disesuaikan Admin
        // akan mengembalikan nilai awalnya diam-diam — dan `db:seed` termasuk
        // perintah yang gampang terlanjur dijalankan di tempat yang salah.
        if (RiskLevel::count() === 0) {
            $this->call([
                RiskReferenceDataSeeder::class,
            ]);
        }

        // Akun admin awal hanya dibuat pada basis data yang benar-benar masih
        // kosong. Sebelumnya pencariannya lewat alamat surel `admin@admin.com`
        // saja, sehingga di basis data yang adminnya memakai surel lain tetapi
        // nama pengguna 'admin' — keadaan yang justru lazim — seeder ini
        // membuat pengguna kedua dan gagal dengan galat kunci ganda
        // `users.users_username_unique`. Gejalanya tidak menyebut soal admin
        // sama sekali, dan `db:seed` jadi tidak bisa diulang.
        //
        // Password SENGAJA acak, bukan tebakan-mudah semacam "admin123":
        // seeder ini bisa saja terlanjur dijalankan di lingkungan yang dapat
        // diakses publik. Ditampilkan SEKALI di konsol — segera catat, atau
        // reset lewat menu Users sesudah masuk pertama kali.
        if (User::count() === 0) {
            $tempPassword = Str::password(16);

            $user = User::create([
                'name' => 'Admin',
                'username' => 'admin',
                'email' => 'admin@admin.com',
                'password' => Hash::make($tempPassword),
            ]);
            $user->assignRole('admin');

            $this->command?->warn("Akun admin awal dibuat: username 'admin' / password sementara: {$tempPassword}");
            $this->command?->warn('Segera catat password di atas dan/atau ganti setelah login pertama — tidak akan ditampilkan lagi.');
        } else {
            $this->command?->info('Sudah ada pengguna di basis data — akun admin awal tidak dibuat.');
        }

        $this->call([
            MenuSeeder::class,
        ]);
    }
}
