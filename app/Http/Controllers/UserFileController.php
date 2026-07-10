<?php

namespace App\Http\Controllers;

use App\Models\MediaFolder;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserFileController extends Controller
{
    /**
     * Menentukan pemilik folder/file yang sedang ditampilkan. Super-admin
     * boleh melihat milik user lain lewat parameter `user_id`; pengguna
     * biasa selalu dipaksa ke akun mereka sendiri, mengabaikan parameter
     * apa pun yang dikirim, supaya tidak bisa mengintip data user lain
     * hanya dengan mengubah query string.
     */
    private function resolveTargetUser(Request $request): User
    {
        $requester = $request->user();

        if ($requester->hasRole('super-admin') && $request->filled('user_id')) {
            return User::findOrFail($request->input('user_id'));
        }

        return $requester;
    }

    public function index(Request $request)
    {
        $requester = $request->user();
        $isSuperAdmin = $requester->hasRole('super-admin');
        $targetUser = $this->resolveTargetUser($request);

        $folderId = $request->input('folder_id');

        $folders = $targetUser->mediaFolders()->orderBy('name')->get();

        // Cek folder aktif
        $currentFolder = $folderId ? $targetUser->mediaFolders()->find($folderId) : null;

        if ($folderId && !$currentFolder) {
            // Jika folder tidak ada, redirect ke root
            return redirect('/files' . ($isSuperAdmin ? '?user_id=' . $targetUser->id : ''));
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
            ]),
            'isSuperAdmin' => $isSuperAdmin,
            'viewingUserId' => $targetUser->id,
            'viewingUserName' => $targetUser->name,
            'users' => $isSuperAdmin ? User::orderBy('name')->get(['id', 'name']) : [],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'files' => 'required|array',
            'files.*' => 'file|max:10240|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,jpg,jpeg,png,gif,zip,rar',
        ]);

        // Super-admin bisa mengunggah ke folder milik user lain (mis. untuk
        // membantu user tersebut); pengguna biasa selalu upload ke akunnya
        // sendiri.
        $requester = $request->user();
        $targetUser = $this->resolveTargetUser($request);

        foreach ($request->file('files') as $file) {
            $media = $targetUser
                ->addMedia($file)
                ->withCustomProperties([
                    'folder_id' => $request->input('folder_id'),
                ])
                ->toMediaCollection('files');

            $this->logFileActivity('uploaded', $media, $requester, $targetUser);
        }

        return back()->with('success', 'Files uploaded successfully');
    }

    public function destroy(Request $request, $id)
    {
        $requester = $request->user();

        $media = $requester->hasRole('super-admin')
            ? \Spatie\MediaLibrary\MediaCollections\Models\Media::where('id', $id)->firstOrFail()
            : $requester->media()->where('id', $id)->firstOrFail();

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
