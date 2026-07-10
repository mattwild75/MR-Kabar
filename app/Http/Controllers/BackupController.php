<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;
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
            'canPushGit' => $this->isAdmin(),
        ]);
    }

    private function isAdmin(): bool
    {
        return auth()->user()?->hasAnyRole(['admin', 'super-admin']) ?? false;
    }

    /**
     * Push kode terbaru ke remote git (backup versi kode, BUKAN deploy —
     * arahnya searah dari server/lokal INI ke GitHub, tidak menyentuh
     * server produksi manapun). Hanya admin/super-admin — mengirim seluruh
     * riwayat kode ke internet adalah aksi sensitif.
     */
    public function gitPush(Request $request)
    {
        if (!$this->isAdmin()) {
            abort(403, 'Hanya Admin/Super Admin yang dapat melakukan push ke GitHub.');
        }

        $message = trim((string) $request->input('message')) ?: 'Backup kode via aplikasi — ' . now()->toDateTimeString();

        $base = base_path();
        $steps = [
            ['git', '-C', $base, 'add', '-A'],
            ['git', '-C', $base, 'commit', '-m', $message, '--allow-empty-message'],
            ['git', '-C', $base, 'push', 'origin', 'HEAD'],
        ];

        $log = [];
        foreach ($steps as $cmd) {
            $result = Process::timeout(120)->run($cmd);
            $log[] = $result->output() . $result->errorOutput();

            // "nothing to commit" bukan kegagalan — lanjut ke push spt biasa.
            if (!$result->successful() && !str_contains($result->errorOutput(), 'nothing to commit')) {
                return redirect()->back()->with(
                    'error',
                    'Git push gagal: ' . trim($result->errorOutput() ?: $result->output())
                );
            }
        }

        return redirect()->back()->with('success', 'Kode berhasil di-push ke GitHub.');
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
