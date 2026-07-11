<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class MenuController extends Controller
{
    /**
     * Lapis kedua di luar permission_name menu — Menu Management bisa
     * mengubah permission_name yang menggerbang route apa pun (termasuk
     * melonggarkan gerbang menu lain), jadi dikunci ke role super-admin
     * secara eksplisit di kode, tidak hanya bergantung pada assignment
     * permission "menu-view" yang bisa diubah kapan saja lewat UI
     * Permission Management. Sama pola dengan
     * AuditLogController/BackupController/RoleController/PermissionController.
     */
    private function ensureSuperAdmin(): void
    {
        if (!auth()->user()?->hasRole('super-admin')) {
            abort(403, 'Manajemen Menu hanya dapat diakses oleh Super Admin.');
        }
    }

    public function index(Request $request)
    {
        $this->ensureSuperAdmin();

        /** @var User $user */
        $user = $request->user();

        $menus = Menu::with([
            'children' => fn($q) => $q->orderBy('order')->with([
                'children' => fn($q2) => $q2->orderBy('order'),
            ]),
        ])
            ->whereNull('parent_id')
            ->orderBy('order')
            ->get();

        return Inertia::render('menus/Index', [
            'menuItems' => $menus,
        ]);
    }

    public function create()
    {
        $this->ensureSuperAdmin();

        $menus = Menu::orderBy('title')->get();
        $permissions = Permission::orderBy('name')->pluck('name');

        return Inertia::render('menus/Form', [
            'parentMenus' => $menus,
            'permissions' => $permissions,
        ]);
    }

    public function store(Request $request)
    {
        $this->ensureSuperAdmin();

        $data = $request->validate([
            'title' => 'required|string',
            'icon' => 'nullable|string',
            'route' => 'nullable|string',
            'parent_id' => 'nullable|exists:menus,id',
            'order' => 'nullable|integer',
            'permission_name' => 'nullable|string|exists:permissions,name',
        ]);

        if (!isset($data['order'])) {
            $data['order'] = Menu::where('parent_id', $data['parent_id'] ?? null)->max('order') + 1;
        }

        Menu::create($data);

        return redirect()->route('menus.index')->with('success', 'Menu berhasil ditambahkan.');
    }

    public function edit(Menu $menu)
    {
        $this->ensureSuperAdmin();

        $menus = Menu::where('id', '!=', $menu->id)->orderBy('title')->get();
        $permissions = Permission::orderBy('name')->pluck('name');

        return Inertia::render('menus/Form', [
            'menu' => $menu,
            'parentMenus' => $menus,
            'permissions' => $permissions,
        ]);
    }

    public function update(Request $request, Menu $menu)
    {
        $this->ensureSuperAdmin();

        $data = $request->validate([
            'title' => 'required|string',
            'icon' => 'nullable|string',
            'route' => 'nullable|string',
            'parent_id' => 'nullable|exists:menus,id|not_in:' . $menu->id,
            'order' => 'nullable|integer',
            'permission_name' => 'nullable|string|exists:permissions,name',
        ]);

        if (!isset($data['order'])) {
            $data['order'] = Menu::where('parent_id', $data['parent_id'] ?? null)->max('order') + 1;
        }

        $menu->update($data);

        return redirect()->route('menus.index')->with('success', 'Menu berhasil diperbarui.');
    }

    public function destroy(Menu $menu)
    {
        $this->ensureSuperAdmin();

        $menu->children()->delete();
        $menu->delete();

        return redirect()->route('menus.index')->with('success', 'Menu berhasil dihapus.');
    }

    public function reorder(Request $request)
    {
        $this->ensureSuperAdmin();

        $menus = $request->input('menus');

        $updateOrder = function ($items, $parentId = null) use (&$updateOrder) {
            foreach ($items as $index => $item) {
                Menu::where('id', $item['id'])->update([
                    'order' => $index + 1,
                    'parent_id' => $parentId,
                ]);

                if (!empty($item['children'])) {
                    $updateOrder($item['children'], $item['id']);
                }
            }
        };

        $updateOrder($menus);

        return redirect()->back()->with('success', 'Urutan menu berhasil disimpan.');
    }
}
