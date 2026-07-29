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

        // Peran PENINJAU untuk eksekutif/pemangku kepentingan: boleh melihat
        // SELURUH data risiko lintas-OPD, tidak boleh mengubah apa pun.
        //
        // Cakupan bacanya datang dari User::canViewAllOpd(), larangan
        // menulisnya dari middleware ViewerReadOnly. Permission-nya sengaja
        // MINIM: menu data (Form Input/Monitoring/Cetak/Visualisasi) memang
        // fail-open (permission_name kosong) sehingga otomatis terlihat,
        // sedangkan menu administrasi (Access, Settings, Audit Logs, File
        // Manager, Troubleshoot) terkunci permission — dengan tidak memberi
        // permission itu, seluruh area admin & super-admin tetap tersembunyi.
        $eksekutif = Role::firstOrCreate(['name' => 'eksekutif']);

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

        // Peninjau mendapat PERSIS permission yang sama dengan admin — jadi
        // seluruh halaman yang bisa dibuka admin juga bisa dibuka VIP. Karena
        // daftar admin sendiri sudah TIDAK memuat $superAdminOnly, area
        // super-admin (Permissions, Roles, Menu Manager, Backup DB, Audit
        // Logs) otomatis ikut tertutup untuk peninjau.
        //
        // Yang membedakan VIP dari admin bukan apa yang bisa DILIHAT,
        // melainkan apa yang bisa DIUBAH: seluruh metode penulisan ditolak
        // middleware ViewerReadOnly.
        $izinAdmin = $admin->permissions()->pluck('name')->all();
        foreach (Permission::all() as $permission) {
            $boleh = in_array($permission->name, $izinAdmin, true);
            if ($boleh && !$eksekutif->hasPermissionTo($permission)) {
                $eksekutif->givePermissionTo($permission);
            } elseif (!$boleh && $eksekutif->hasPermissionTo($permission)) {
                $eksekutif->revokePermissionTo($permission);
            }
        }
    }
}
