<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    /**
     * Lapis kedua di luar permission_name menu — Role Management mengatur
     * seluruh sistem izin akses (termasuk bisa mengubah izin role admin
     * itu sendiri), jadi dikunci ke role super-admin secara eksplisit di
     * kode, tidak hanya bergantung pada assignment permission "roles-view"
     * yang bisa diubah kapan saja lewat UI Permission Management. Sama
     * pola dengan AuditLogController/BackupController.
     */
    private function ensureSuperAdmin(): void
    {
        if (!auth()->user()?->hasRole('super-admin')) {
            abort(403, 'Manajemen Role hanya dapat diakses oleh Super Admin.');
        }
    }

    public function index()
    {
        $this->ensureSuperAdmin();

        $roles = Role::with('permissions')->get();
        $permissions = Permission::all()->groupBy('group');

        return Inertia::render('roles/Index', [
            'roles' => $roles,
            'groupedPermissions' => $permissions,
        ]);
    }

    public function store(Request $request)
    {
        $this->ensureSuperAdmin();

        $data = $request->validate([
            'name' => 'required|unique:roles,name',
            'permissions' => 'array',
        ]);

        $role = Role::create(['name' => $data['name']]);
        $role->syncPermissions($data['permissions'] ?? []);

        return redirect()->route('roles.index')->with('success', 'Role created');
    }

    public function create()
    {
        $this->ensureSuperAdmin();

        $permissions = Permission::all()->groupBy('group');
        return Inertia::render('roles/Form', [
            'groupedPermissions' => $permissions,
        ]);
    }

    public function edit(Role $role)
    {
        $this->ensureSuperAdmin();

        $permissions = Permission::all()->groupBy('group');
        $role->load('permissions');
        return Inertia::render('roles/Form', [
            'role' => $role,
            'groupedPermissions' => $permissions,
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $this->ensureSuperAdmin();

        $data = $request->validate([
            'name' => 'required|unique:roles,name,' . $role->id,
            'permissions' => 'array',
        ]);

        $role->update(['name' => $data['name']]);
        $role->syncPermissions($data['permissions'] ?? []);

        return redirect()->route('roles.index')->with('success', 'Role updated');
    }

    public function destroy(Role $role)
    {
        $this->ensureSuperAdmin();

        $role->delete();
        return redirect()->route('roles.index')->with('success', 'Role deleted');
    }
}
