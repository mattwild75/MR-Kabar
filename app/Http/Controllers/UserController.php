<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles')->orderBy('username')->paginate(25);

        return Inertia::render('users/Index', [
            'users' => $users,
        ]);
    }

    public function create()
    {
        $roles = Role::all();

        return Inertia::render('users/Form', [
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('manageUsers');

        // Hanya super-admin yang boleh membuat user ber-role super-admin,
        // supaya admin biasa tidak bisa mengangkat privilege lewat form.
        $forbiddenRoles = $request->user()->hasRole('super-admin') ? [] : ['super-admin'];

        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'unique:users,username'],
            'email'    => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role'     => ['required', Rule::exists('roles', 'name'), Rule::notIn($forbiddenRoles)],
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'username' => $validated['username'],
            'email'    => $validated['email'] ?? null,
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole($validated['role']);

        return redirect()->route('users.index')->with('success', 'User berhasil dibuat.');
    }

    public function edit(User $user)
    {
        $roles = Role::all();

        return Inertia::render('users/Form', [
            'user'         => $user->only(['id', 'name', 'username', 'email']),
            'roles'        => $roles,
            'currentRole'  => $user->roles->pluck('name')->first(), // satu role saja
        ]);
    }

    public function update(Request $request, User $user)
    {
        $this->authorize('manageUsers');

        $requester = $request->user();

        // Admin biasa tidak boleh menjadikan user (termasuk dirinya) sebagai
        // super-admin, dan tidak boleh mengubah user yang sudah super-admin.
        if (!$requester->hasRole('super-admin') && $user->hasRole('super-admin')) {
            abort(403, 'Anda tidak dapat mengubah user super-admin.');
        }
        $forbiddenRoles = $requester->hasRole('super-admin') ? [] : ['super-admin'];

        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', Rule::unique('users', 'username')->ignore($user->id)],
            'email'    => ['nullable', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8'],
            'role'     => ['required', Rule::exists('roles', 'name'), Rule::notIn($forbiddenRoles)],
        ]);

        $user->update([
            'name'     => $validated['name'],
            'username' => $validated['username'],
            'email'    => $validated['email'] ?? null,
            'password' => $validated['password']
                ? Hash::make($validated['password'])
                : $user->password,
        ]);

        $user->syncRoles([$validated['role']]);

        return redirect()->route('users.index')->with('success', 'User berhasil diperbarui.');
    }

    public function destroy(Request $request, User $user)
    {
        $this->authorize('manageUsers');

        $requester = $request->user();

        if ($requester->id === $user->id) {
            abort(403, 'Anda tidak dapat menghapus akun sendiri.');
        }

        if ($user->hasRole('super-admin') && !$requester->hasRole('super-admin')) {
            abort(403, 'Anda tidak dapat menghapus super-admin.');
        }

        $user->delete();

        return redirect()->route('users.index')->with('success', 'User berhasil dihapus.');
    }

    public function resetPassword(User $user)
    {
        $this->authorize('manageUsers');

        $tempPassword = \Illuminate\Support\Str::random(12);
        $user->update([
            'password' => Hash::make($tempPassword),
        ]);

        return redirect()->back()->with('success', "Password berhasil direset ke: {$tempPassword}");
    }
}
