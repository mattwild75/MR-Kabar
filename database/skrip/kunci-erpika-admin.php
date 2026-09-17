<?php

use App\Models\Menu;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

// ERPIKA sementara hanya untuk admin/super-admin (17 Sep 2026): izin
// `erpika-view` dibuat, diberikan ke admin (super-admin lolos Gate::before),
// dan dipasang pada menu ERPIKA berikut seluruh turunannya supaya menu ini
// hilang dari sidebar peran lain. Penolakan sesungguhnya oleh middleware
// ErpikaHanyaAdmin. Dijalankan lewat tinker di lokal dan produksi.
$izin = Permission::firstOrCreate(['name' => 'erpika-view', 'guard_name' => 'web'], ['group' => 'Miscellaneous']);
Role::findByName('admin')->givePermissionTo($izin);
foreach (Role::where('name', '!=', 'admin')->get() as $r) {
    $r->revokePermissionTo($izin);
}
$akar = Menu::where('title', 'ERPIKA')->firstOrFail();
$ids = [$akar->id];
$antrean = [$akar->id];
while ($antrean) {
    $anak = Menu::whereIn('parent_id', $antrean)->pluck('id')->all();
    $ids = array_merge($ids, $anak);
    $antrean = $anak;
}
$n = Menu::whereIn('id', $ids)->update(['permission_name' => 'erpika-view']);
app(PermissionRegistrar::class)->forgetCachedPermissions();
echo "izin erpika-view: menu diperbarui {$n}".PHP_EOL;
