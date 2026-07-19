<?php

namespace Database\Seeders;

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

        // Password akun admin awal SENGAJA dibuat acak (bukan hardcode
        // "admin123") — kalau seeder ini pernah ke-jalankan di lingkungan
        // produksi/staging yang bisa diakses publik, password tebakan-mudah
        // adalah celah keamanan langsung. Password acak ini ditampilkan
        // SEKALI di konsol saat seeding — segera catat & simpan, atau
        // reset lewat menu User Management setelah login pertama.
        $tempPassword = Str::password(16);

        $user = User::firstOrNew(['email' => 'admin@admin.com']);
        $user->fill([
            'name' => 'Admin',
            'username' => $user->username ?: 'admin',
            'password' => Hash::make($tempPassword),
        ])->save();

        if (!$user->hasRole('admin')) {
            $user->assignRole('admin');
        }

        $this->command?->warn("Akun admin awal dibuat: username 'admin' / password sementara: {$tempPassword}");
        $this->command?->warn('Segera catat password di atas dan/atau ganti setelah login pertama — tidak akan ditampilkan lagi.');

        $this->call([
            MenuSeeder::class,
        ]);
    }
}
