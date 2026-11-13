<?php

use App\Models\Menu;
use Spatie\Permission\Models\Permission;

// Pasang permission 'storage-view' dan menu Utilities > Storage ke basis data
// yang sudah ada TANPA menjalankan MenuSeeder (seeder itu menimpa urutan menu
// yang diatur manual).
$perm = Permission::firstOrCreate(['name' => 'storage-view', 'guard_name' => 'web'], ['group' => 'Utilities']);
$util = Menu::where('title', 'Utilities')->whereNull('parent_id')->firstOrFail();
$menu = Menu::updateOrCreate(
    ['title' => 'Storage', 'parent_id' => $util->id],
    ['icon' => 'HardDrive', 'route' => '/penyimpanan', 'order' => 8, 'permission_name' => 'storage-view']
);
echo 'permission #'.$perm->id.', menu #'.$menu->id.PHP_EOL;
