<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    /**
     * Lapis kedua di luar permission_name menu — Permission Management bisa
     * membuat/mengubah/menghapus izin akses mentah di seluruh sistem, jadi
     * dikunci ke role super-admin secara eksplisit di kode, tidak hanya
     * bergantung pada assignment permission "permission-view" yang bisa
     * diubah kapan saja lewat UI ini sendiri. Sama pola dengan
     * AuditLogController/BackupController/RoleController.
     */
    private function ensureSuperAdmin(): void
    {
        if (!auth()->user()?->hasRole('super-admin')) {
            abort(403, 'Manajemen Permission hanya dapat diakses oleh Super Admin.');
        }
    }

    public function index(Request $request)
    {
        $this->ensureSuperAdmin();

        $query = Permission::query();

        if ($request->filled('group')) {
            $query->where('group', $request->group);
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $permissions = $query
            ->orderBy('group')
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        $groups = Permission::select('group')->distinct()->pluck('group')->filter()->values();

        return Inertia::render('permissions/Index', [
            'permissions' => $permissions,
            'groups' => $groups,
            'filters' => $request->only('group', 'search'),
        ]);
    }

    public function create()
    {
        $this->ensureSuperAdmin();

        $groups = Permission::select('group')->distinct()->pluck('group')->filter()->values();

        return Inertia::render('permissions/Form', [
            'groups' => $groups,
        ]);
    }

    public function store(Request $request)
    {
        $this->ensureSuperAdmin();

        $data = $request->validate([
            'name' => 'required|string|max:255|unique:permissions,name',
            'group' => 'nullable|string|max:255',
        ]);

        Permission::create($data);

        return redirect()->route('permissions.index')->with('success', 'Permission berhasil dibuat.');
    }

    public function edit(Permission $permission)
    {
        $this->ensureSuperAdmin();

        $groups = Permission::select('group')->distinct()->pluck('group')->filter()->values();

        return Inertia::render('permissions/Form', [
            'permission' => $permission,
            'groups' => $groups,
        ]);
    }

    public function update(Request $request, Permission $permission)
    {
        $this->ensureSuperAdmin();

        $data = $request->validate([
            'name' => 'required|string|max:255|unique:permissions,name,' . $permission->id,
            'group' => 'nullable|string|max:255',
        ]);

        $permission->update($data);

        return redirect()->route('permissions.index')->with('success', 'Permission berhasil diperbarui.');
    }

    public function destroy(Permission $permission)
    {
        $this->ensureSuperAdmin();

        $permission->delete();

        return redirect()->route('permissions.index')->with('success', 'Permission berhasil dihapus.');
    }
}
