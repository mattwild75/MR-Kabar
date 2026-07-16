<?php

namespace App\Http\Controllers;

use App\Models\MediaFolder;
use App\Models\User;
use App\Notifications\SharedFileApprovalDecided;
use App\Notifications\SharedFileUploadSubmitted;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class UserFileController extends Controller
{
    /**
     * Menentukan pemilik folder/file yang sedang ditampilkan.
     *
     * - `scope=shared` — "Folder Umum": SEMUA user (siapa pun yang login,
     *   bukan cuma admin/super-admin) diarahkan ke akun bersama
     *   `User::sharedFolderOwner()`. Ini satu-satunya pengecualian yang
     *   sengaja dibuka lintas-user — lihat store()/destroy() untuk kenapa
     *   otorisasinya juga dilonggarkan khusus scope ini.
     * - Admin & super-admin boleh melihat milik user lain lewat parameter
     *   `user_id` — TAPI admin (bukan super-admin) DILARANG mengintip
     *   folder milik user yang ber-role super-admin (lihat
     *   `ensureCanViewTargetUser()`). Pengguna biasa selalu dipaksa ke
     *   akun mereka sendiri, mengabaikan parameter apa pun yang dikirim,
     *   supaya tidak bisa mengintip data user lain hanya dengan mengubah
     *   query string.
     */
    private function resolveTargetUser(Request $request): User
    {
        if ($request->string('scope')->toString() === 'shared') {
            return User::sharedFolderOwner();
        }

        $requester = $request->user();

        if ($requester->hasAnyRole(['admin', 'super-admin']) && $request->filled('user_id')) {
            $target = User::findOrFail($request->input('user_id'));

            $this->ensureCanViewTargetUser($requester, $target);

            return $target;
        }

        return $requester;
    }

    /**
     * Admin boleh melihat file/folder SEMUA user KECUALI milik super-admin
     * (super-admin tetap bisa melihat siapa saja, termasuk sesama
     * super-admin). Requester yang bukan admin/super-admin tidak pernah
     * lewat sini (selalu dipaksa ke akunnya sendiri di resolveTargetUser).
     */
    private function ensureCanViewTargetUser(User $requester, User $target): void
    {
        if (!$requester->hasRole('super-admin') && $target->hasRole('super-admin') && $target->id !== $requester->id) {
            abort(403, 'Admin tidak dapat mengakses folder milik Super Admin.');
        }
    }

    /** scope=shared dibolehkan siapa pun yang login — lihat resolveTargetUser(). */
    private function isSharedScope(Request $request): bool
    {
        return $request->string('scope')->toString() === 'shared';
    }

    public function index(Request $request)
    {
        $requester = $request->user();
        $isSuperAdmin = $requester->hasRole('super-admin');
        $isAdminOrSuperAdmin = $requester->hasAnyRole(['admin', 'super-admin']);
        $isShared = $this->isSharedScope($request);
        $targetUser = $this->resolveTargetUser($request);

        $folderId = $request->input('folder_id');

        $folders = $targetUser->mediaFolders()->orderBy('name')->get();

        // Cek folder aktif
        $currentFolder = $folderId ? $targetUser->mediaFolders()->find($folderId) : null;

        if ($folderId && !$currentFolder) {
            // Jika folder tidak ada, redirect ke root
            $redirectQuery = $isShared ? '?scope=shared' : ($isAdminOrSuperAdmin ? '?user_id=' . $targetUser->id : '');
            return redirect('/files' . $redirectQuery);
        }

        $files = $targetUser
            ->media()
            ->where('collection_name', 'files')
            ->when($folderId, function ($query) use ($folderId) {
                $query->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(custom_properties, '$.folder_id')) = ?", [(string)$folderId]);
            }, function ($query) {
                $query->where(function ($q) {
                    $q->whereNull('custom_properties->folder_id')
                        ->orWhereRaw("JSON_EXTRACT(custom_properties, '$.folder_id') IS NULL");
                });
            })
            ->get();

        // Folder Umum: file yg masih "pending" (belum disetujui admin/super-admin)
        // hanya boleh terlihat oleh pengunggahnya sendiri dan admin/super-admin
        // — bukan semua user, supaya konten belum diverifikasi tidak langsung
        // terekspos ke ruang kerja bersama.
        if ($isShared && !$isAdminOrSuperAdmin) {
            $files = $files->filter(function ($media) use ($requester) {
                $status = $media->getCustomProperty('approval_status', 'approved');
                return $status === 'approved' || (int) $media->getCustomProperty('uploader_id') === $requester->id;
            })->values();
        }

        return Inertia::render('files/Index', [
            'folders' => $folders,
            'currentFolderId' => $folderId,
            'currentFolder' => $currentFolder,
            'files' => $files->map(fn($media) => [
                'id' => $media->id,
                'name' => $media->name,
                'size' => $media->humanReadableSize,
                'mime_type' => $media->mime_type,
                'url' => $media->getFullUrl(),
                'created_at' => $media->created_at->diffForHumans(),
                'approvalStatus' => $isShared ? $media->getCustomProperty('approval_status', 'approved') : null,
                'uploaderName' => $isShared ? $media->getCustomProperty('uploader_name') : null,
                // Folder Umum: hapus file hanya boleh admin/super-admin atau
                // pengunggahnya sendiri (bukan siapa pun) — lihat destroy()
                // untuk otorisasi yg sama persis di sisi backend. Folder PIC
                // (bukan shared) selalu boleh, krn di situ hanya file milik
                // sendiri yg pernah ditampilkan.
                'canDelete' => $isShared
                    ? ($isAdminOrSuperAdmin || (int) $media->getCustomProperty('uploader_id') === $requester->id)
                    : true,
            ]),
            'isSuperAdmin' => $isSuperAdmin,
            'isAdminOrSuperAdmin' => $isAdminOrSuperAdmin,
            'isShared' => $isShared,
            'viewingUserId' => $targetUser->id,
            'viewingUserName' => $isShared ? 'Folder Umum' : $targetUser->name,
            // Admin (bukan super-admin) tidak boleh lihat/pilih folder milik
            // super-admin — disaring dari daftar combobox supaya tidak
            // menampilkan pilihan yang akan ditolak `ensureCanViewTargetUser()`.
            'users' => $isAdminOrSuperAdmin && !$isShared
                ? User::when(!$isSuperAdmin, fn ($q) => $q->whereDoesntHave('roles', fn ($r) => $r->where('name', 'super-admin')))
                    ->orderBy('name')->get(['id', 'name'])
                : [],
            // Folder Umum digabung ke File Manager: node "Folder Umum" selalu
            // tampil di bawah root milik user sendiri (kecuali saat sedang
            // berada DI DALAM scope shared itu sendiri, supaya tidak muncul
            // node yg merujuk ke dirinya sendiri).
            'sharedFolderId' => $isShared ? null : User::sharedFolderOwner()->id,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'files' => 'required|array',
            'files.*' => 'file|max:51200|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,jpg,jpeg,png,gif,zip,rar',
        ]);

        // Super-admin bisa mengunggah ke folder milik user lain (mis. untuk
        // membantu user tersebut); scope=shared dibolehkan SIAPA PUN (lihat
        // resolveTargetUser()); pengguna biasa selalu upload ke akunnya sendiri.
        $requester = $request->user();
        $targetUser = $this->resolveTargetUser($request);
        $isShared = $this->isSharedScope($request);

        // folder_id HARUS milik targetUser — tanpa ini, folder_id sembarang
        // (mis. milik user lain) akan tersimpan sebagai custom_properties
        // begitu saja: filenya tetap tersimpan sbg media targetUser (aman
        // dari sisi kepemilikan), tapi tidak akan pernah muncul di folder
        // manapun (baik bagi targetUser sendiri, krn folder_id itu bukan
        // miliknya, maupun bagi pemilik folder aslinya, krn media discope
        // per-pemilik file) — file jadi "orphan" tak terlihat siapa pun.
        $requestedFolderId = $request->input('folder_id');
        $folderId = $requestedFolderId && $targetUser->mediaFolders()->whereKey($requestedFolderId)->exists()
            ? $requestedFolderId
            : null;

        foreach ($request->file('files') as $file) {
            $customProperties = [
                'folder_id' => $folderId,
            ];

            // Upload ke Folder Umum butuh persetujuan admin/super-admin dulu
            // sebelum terlihat oleh user lain (lihat index()/approve()/reject()).
            // Upload oleh admin/super-admin sendiri langsung approved, supaya
            // mereka tidak perlu menyetujui unggahannya sendiri.
            if ($isShared) {
                $customProperties['approval_status'] = $requester->hasRole('super-admin') ? 'approved' : 'pending';
                $customProperties['uploader_id'] = $requester->id;
                $customProperties['uploader_name'] = $requester->name;
            }

            $media = $targetUser
                ->addMedia($file)
                ->withCustomProperties($customProperties)
                ->toMediaCollection('files');

            $this->logFileActivity('uploaded', $media, $requester, $targetUser);

            if ($isShared && $customProperties['approval_status'] === 'pending') {
                Notification::send(
                    User::role(['admin', 'super-admin'])->get(),
                    new SharedFileUploadSubmitted($media, $requester->name),
                );
            }
        }

        return back()->with('success', 'Files uploaded successfully');
    }

    /** Setujui file pending di Folder Umum — admin/super-admin saja. */
    public function approve(Request $request, $id)
    {
        $this->ensureCanReviewSharedFile($request);

        $media = User::sharedFolderOwner()->media()->where('id', $id)->firstOrFail();
        $media->setCustomProperty('approval_status', 'approved');
        $media->save();

        $this->notifyUploader($media, approved: true);

        return back()->with('success', 'File disetujui.');
    }

    /** Tolak file pending di Folder Umum — admin/super-admin saja, file dihapus. */
    public function reject(Request $request, $id)
    {
        $this->ensureCanReviewSharedFile($request);

        $media = User::sharedFolderOwner()->media()->where('id', $id)->firstOrFail();

        $this->notifyUploader($media, approved: false);

        $media->delete();

        return back()->with('success', 'File ditolak dan dihapus.');
    }

    private function ensureCanReviewSharedFile(Request $request): void
    {
        if (!$request->user()?->hasAnyRole(['admin', 'super-admin'])) {
            abort(403, 'Hanya Admin/Super Admin yang dapat menyetujui/menolak file Folder Umum.');
        }
    }

    private function notifyUploader(Media $media, bool $approved): void
    {
        $uploaderId = $media->getCustomProperty('uploader_id');

        if (!$uploaderId) {
            return;
        }

        $uploader = User::find($uploaderId);

        if ($uploader) {
            $uploader->notify(new SharedFileApprovalDecided($media, $approved));
        }
    }

    public function destroy(Request $request, $id)
    {
        $requester = $request->user();

        if ($this->isSharedScope($request)) {
            // Folder Umum: hanya admin/super-admin ATAU pengunggah file itu
            // sendiri yang boleh menghapus — bukan siapa pun (direvisi dari
            // kebijakan awal "terbuka penuh" supaya PIC lain tidak bisa
            // menghapus file milik PIC lain).
            $media = User::sharedFolderOwner()->media()->where('id', $id)->firstOrFail();

            $isUploader = (int) $media->getCustomProperty('uploader_id') === $requester->id;
            if (!$isUploader && !$requester->hasAnyRole(['admin', 'super-admin'])) {
                abort(403, 'Hanya Admin/Super Admin atau pengunggah file ini yang dapat menghapusnya.');
            }
        } else {
            $media = $requester->hasAnyRole(['admin', 'super-admin'])
                ? Media::where('id', $id)->firstOrFail()
                : $requester->media()->where('id', $id)->firstOrFail();

            // Admin (bukan super-admin) tidak boleh menghapus file milik
            // super-admin — sama seperti pembatasan lihat folder di
            // ensureCanViewTargetUser().
            if (!$requester->hasRole('super-admin') && $media->model instanceof User && $media->model->hasRole('super-admin') && $media->model->id !== $requester->id) {
                abort(403, 'Admin tidak dapat menghapus file milik Super Admin.');
            }
        }

        $owner = $media->model instanceof User ? $media->model : null;

        $this->logFileActivity('deleted', $media, $requester, $owner);

        $media->delete();

        return back()->with('success', 'File berhasil dihapus.');
    }

    /**
     * Media (Spatie MediaLibrary) bukan model milik aplikasi ini, jadi tidak
     * bisa di-observe lewat GlobalActivityLogger seperti model lain — dicatat
     * manual di sini. Pemilik folder disertakan hanya kalau BERBEDA dari
     * causer (super-admin upload/hapus file milik user lain), supaya jejak
     * "siapa bertindak atas nama siapa" jelas tanpa membuat log gaduh untuk
     * kasus normal (upload ke folder sendiri).
     */
    private function logFileActivity(string $action, $media, User $causer, ?User $owner): void
    {
        $properties = [
            'file_name' => $media->file_name,
            'size' => $media->humanReadableSize,
            'mime_type' => $media->mime_type,
        ];

        if ($owner && $owner->id !== $causer->id) {
            $properties['owner_id'] = $owner->id;
            $properties['owner_name'] = $owner->name;
        }

        activity('global')
            ->causedBy($causer)
            ->performedOn($media)
            ->withProperties($properties)
            ->log("{$action} File");
    }
}
