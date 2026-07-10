<?php

namespace App\Observers;

use App\Models\User;

class UserFolderObserver
{
    /**
     * Setiap user baru otomatis mendapat satu folder root (parent_id null)
     * di File Management miliknya sendiri — supaya "Root Folder" adalah
     * folder nyata milik user tersebut, bukan sekadar label virtual, dan
     * fitur file management langsung siap dipakai tanpa langkah manual.
     */
    public function created(User $user): void
    {
        $user->mediaFolders()->create([
            'name' => $user->name,
            'parent_id' => null,
        ]);
    }
}
