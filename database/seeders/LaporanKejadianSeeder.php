<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Seed role 'lapor-risiko' + akun bersama LAPOR (password dari env
 * LAPOR_ACCOUNT_PASSWORD, lihat .env.example) yang dipakai bergantian oleh
 * siapa saja (publik, lewat QR code di /panduan) untuk melaporkan kejadian
 * risiko — dibatasi HANYA ke /lapor-kejadian oleh middleware
 * RestrictLaporRisikoRole, sama pola dengan CeeSeeder/RestrictCeeSurveyRole.
 */
class LaporanKejadianSeeder extends Seeder
{
    public function run(): void
    {
        $role = Role::firstOrCreate(['name' => 'lapor-risiko']);

        // 'utilities-view' dibutuhkan supaya grup menu Utilities (induk dari
        // menu "Lapor Kejadian Risiko") tidak ikut tersaring keluar oleh
        // permission_name-nya sendiri — whitelist judul menu di ShareMenus
        // TIDAK melewati pengecekan permission_name, cuma menambah filter
        // lapisan kedua di atasnya.
        $neededPermissions = ['dashboard-view', 'utilities-view'];
        foreach ($neededPermissions as $permName) {
            $permission = Permission::where('name', $permName)->first();
            if ($permission && !$role->hasPermissionTo($permission)) {
                $role->givePermissionTo($permission);
            }
        }

        $user = User::firstOrCreate(
            ['username' => 'LAPOR'],
            [
                'name' => 'Lapor Kejadian Risiko (Akun Bersama)',
                'email' => 'lapor-risiko@mrkabar.local',
                'password' => env('LAPOR_ACCOUNT_PASSWORD', (string) str()->random(32)),
            ]
        );

        if (!$user->hasRole('lapor-risiko')) {
            $user->assignRole($role);
        }
    }
}
