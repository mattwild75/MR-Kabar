<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Menu sidebar "Video Edukasi" (/edukasi), tepat di bawah menu Panduan.
 *
 * Lewat migrasi, bukan hanya MenuSeeder, karena deploy produksi menjalankan
 * `migrate` saja. Urutan menu lain TIDAK ditimpa dengan angka tetap: yang
 * digeser hanya menu tingkat atas di bawah Panduan, masing-masing satu
 * langkah, sehingga urutan yang pernah diatur Admin lewat Menu Management
 * tetap terjaga.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (DB::table('menus')->whereNull('parent_id')->where('route', '/edukasi')->exists()) {
            return;
        }

        $acuan = DB::table('menus')->whereNull('parent_id')->where('route', '/panduan')->value('order');
        $urutan = $acuan === null ? 3 : (int) $acuan + 1;

        DB::transaction(function () use ($urutan) {
            DB::table('menus')->whereNull('parent_id')->where('order', '>=', $urutan)->increment('order');

            DB::table('menus')->insert([
                'title' => 'Video Edukasi',
                'icon' => 'MonitorPlay',
                'route' => '/edukasi',
                'parent_id' => null,
                'order' => $urutan,
                'permission_name' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });
    }

    public function down(): void
    {
        $menu = DB::table('menus')->whereNull('parent_id')->where('route', '/edukasi')->first();
        if (! $menu) {
            return;
        }

        DB::transaction(function () use ($menu) {
            DB::table('menus')->where('id', $menu->id)->delete();
            DB::table('menus')->whereNull('parent_id')->where('order', '>', $menu->order)->decrement('order');
        });
    }
};
