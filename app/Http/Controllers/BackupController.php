<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class BackupController extends Controller
{
    protected string $backupPath = 'private/Laravel';

    public function index()
    {
        $realPath = storage_path('app/' . $this->backupPath);

        $files = File::exists($realPath) ? File::files($realPath) : [];

        $backups = collect($files)
            ->filter(fn($file) => $file->getExtension() === 'zip')
            ->map(fn($file) => [
                'name' => $file->getFilename(),
                'size' => $file->getSize(),
                'last_modified' => $file->getMTime(),
                'download_url' => route('backup.download', ['file' => $file->getFilename()]),
            ])
            ->sortByDesc('last_modified')
            ->values();

        return Inertia::render('backup/Index', [
            'backups' => $backups,
        ]);
    }

    public function run()
    {
        Artisan::call('backup:run', ['--only-db' => true]);
        return redirect()->back()->with('success', 'Backup berhasil dibuat.');
    }

    public function download($file)
    {
        $file = basename($file);
        if (!str_ends_with($file, '.zip')) {
            abort(404, 'File tidak ditemukan.');
        }

        $path = storage_path('app/' . $this->backupPath . '/' . $file);

        if (!file_exists($path)) {
            abort(404, 'File tidak ditemukan.');
        }

        return response()->download($path);
    }

    public function delete($file)
    {
        $file = basename($file);
        if (!str_ends_with($file, '.zip')) {
            return redirect()->back()->with('error', 'File tidak ditemukan.');
        }

        $path = storage_path('app/' . $this->backupPath . '/' . $file);

        if (!file_exists($path)) {
            return redirect()->back()->with('error', 'File tidak ditemukan.');
        }

        unlink($path);

        return redirect()->back()->with('success', 'Backup berhasil dihapus.');
    }
}
