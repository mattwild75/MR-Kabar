<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Buat role admin dan user jika belum ada
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $user = Role::firstOrCreate(['name' => 'user']);

        // Daftar permission berdasarkan menu structure
        $permissions = [
            'Dashboard' => [
                'dashboard-view',
            ],
            'Access' => [
                'access-view',
                'permission-view',
                'users-view',
                'roles-view',
            ],
            'Settings' => [
                'settings-view',
                'menu-view',
                'app-settings-view',
                'backup-view',
                'backup-excel-view',
                'keterangan-pendukung-view',
            ],
            'Utilities' => [
                'utilities-view',
                'log-view',
                'filemanager-view',
                'troubleshoot-view',
            ],
        ];

        // Permission yang SENGAJA TIDAK di-assign ke admin — fitur ini
        // dikunci ke super-admin secara eksplisit di kode (lihat
        // AuditLogController/BackupController/RoleController/
        // PermissionController/MenuController::ensureSuperAdmin()), jadi
        // admin tidak perlu (dan tidak boleh) punya permission-nya. Tetap
        // dibuat sebagai Permission record (bukan dihapus dari daftar di
        // atas) supaya FK 'exists:permissions,name' di form Menu/Role tetap
        // valid & menu tetap bisa dikonfigurasi merujuk permission ini.
        // super-admin tidak butuh assignment eksplisit — Gate::before di
        // AuthServiceProvider membuatnya lolos semua pengecekan otomatis.
        $superAdminOnly = [
            'permission-view',
            'roles-view',
            'menu-view',
            'backup-view',
            'log-view',
        ];

        foreach ($permissions as $group => $perms) {
            foreach ($perms as $name) {
                $permission = Permission::firstOrCreate([
                    'name' => $name,
                    'group' => $group,
                ]);

                if (in_array($name, $superAdminOnly, true)) {
                    // Cabut kalau sebelumnya sempat ter-assign (mis. dari
                    // seed lama sebelum permission ini dikunci ke
                    // super-admin) — supaya menjalankan ulang seeder ini
                    // benar-benar menegakkan pemisahan admin/super-admin,
                    // bukan cuma berlaku utk instalasi baru.
                    if ($admin->hasPermissionTo($permission)) {
                        $admin->revokePermissionTo($permission);
                    }
                    continue;
                }

                // Assign ke admin
                if (!$admin->hasPermissionTo($permission)) {
                    $admin->givePermissionTo($permission);
                }
            }
        }
    }
}
