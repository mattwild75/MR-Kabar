<?php

namespace App\Http\Controllers;

use App\Models\MediaFolder;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class MediaFolderController extends Controller
{
    use AuthorizesRequests;

    // index() lama (pra File Manager unified/Folder Umum) dihapus — sudah
    // digantikan sepenuhnya oleh UserFileController::index(), yg juga
    // menangani scope=shared & admin lintas-user. Tidak ada route yang
    // memanggil method ini lagi (lihat routes/web.php), jadi ini murni
    // dead code peninggalan sebelum refactor tsb.

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:media_folders,id',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $requester = $request->user();

        // scope=shared: SIAPA PUN yang login boleh membuat folder di
        // "Folder Umum" (akun singleton sharedFolderOwner()) — lihat
        // UserFileController::resolveTargetUser() utk penjelasan lengkap.
        // Selain itu: admin/super-admin boleh membuat folder di akun user
        // lain (mis. saat sedang melihat file management milik user
        // tertentu) — TAPI admin (bukan super-admin) tidak boleh membuat
        // folder di akun super-admin; pengguna biasa selalu membuat folder
        // di akunnya sendiri.
        if ($request->string('scope')->toString() === 'shared') {
            $targetUser = \App\Models\User::sharedFolderOwner();
        } elseif ($requester->hasAnyRole(['admin', 'super-admin']) && $request->filled('user_id')) {
            $targetUser = \App\Models\User::findOrFail($request->input('user_id'));

            if (!$requester->hasRole('super-admin') && $targetUser->hasRole('super-admin') && $targetUser->id !== $requester->id) {
                abort(403, 'Admin tidak dapat membuat folder di akun Super Admin.');
            }
        } else {
            $targetUser = $requester;
        }

        $targetUser->mediaFolders()->create([
            'name' => $request->name,
            'parent_id' => $request->parent_id,
        ]);

        return back()->with('success', 'Folder berhasil dibuat.');
    }

    public function destroy(Request $request, MediaFolder $medium)
    {
        $folder = $medium;

        // Folder Folder Umum (dimiliki akun sharedFolderOwner()) boleh
        // dihapus SIAPA PUN yang login. Selain itu: folder hanya boleh
        // dihapus oleh pemiliknya, kecuali admin/super-admin yang boleh
        // mengelola folder siapa pun — TAPI admin (bukan super-admin)
        // tidak boleh menghapus folder milik super-admin.
        $requester = $request->user();
        $isSharedFolder = $folder->user_id === \App\Models\User::sharedFolderOwner()->id;
        $isOwner = $folder->user_id === $requester->id;
        $isAdminOrSuperAdmin = $requester->hasAnyRole(['admin', 'super-admin']);

        if (!$isSharedFolder && !$isOwner && !$isAdminOrSuperAdmin) {
            abort(403, 'Anda tidak memiliki izin untuk menghapus folder ini.');
        }

        if (!$isSharedFolder && !$isOwner && !$requester->hasRole('super-admin') && $folder->user?->hasRole('super-admin')) {
            abort(403, 'Admin tidak dapat menghapus folder milik Super Admin.');
        }

        $user = $folder->user;

        // 🔁 Hapus semua file dalam folder ini
        $files = $user->media()
            ->where('collection_name', 'files')
            ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(custom_properties, '$.folder_id')) = ?", [(string)$folder->id])
            ->get();

        foreach ($files as $file) {
            $file->delete();
        }

        // 🔁 Hapus subfolder langsung (1 level)
        $childFolders = $user->mediaFolders()->where('parent_id', $folder->id)->get();
        foreach ($childFolders as $child) {
            $child->delete();
        }

        // 🗑️ Hapus folder utama
        $folder->delete();

        return redirect('/files')->with('success', 'Folder berhasil dihapus.');
    }
}
