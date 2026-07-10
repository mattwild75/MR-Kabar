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
     * Satu tombol, dua langkah: (1) backup database — TETAP LOKAL saja,
     * TIDAK PERNAH ikut ke GitHub (storage/app/private/.gitignore = "*"
     * mengabaikan seluruh isi folder itu, termasuk file .sql/.zip backup);
     * (2) push kode terbaru ke remote git (BUKAN deploy — arahnya searah
     * dari server/lokal INI ke GitHub, tidak menyentuh server produksi
     * manapun). Hanya admin/super-admin — mengirim seluruh riwayat kode ke
     * internet adalah aksi sensitif.
     */
    public function gitPush(Request $request)
    {
        if (!$this->isAdmin()) {
            abort(403, 'Hanya Admin/Super Admin yang dapat melakukan push ke GitHub.');
        }

        // Langkah 1: backup database dulu — kalau ini gagal, batalkan push
        // supaya tidak ada snapshot kode tanpa cadangan data yg sepadan.
        try {
            Artisan::call('backup:run', ['--only-db' => true]);
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Backup database gagal, push dibatalkan: ' . $e->getMessage());
        }

        // Langkah 2: commit + push kode.
        $message = trim((string) $request->input('message')) ?: 'Backup kode via aplikasi — ' . now()->toDateTimeString();

        $base = base_path();
        $steps = [
            ['git', '-C', $base, 'add', '-A'],
            ['git', '-C', $base, 'commit', '-m', $message, '--allow-empty-message'],
            ['git', '-C', $base, 'push', 'origin', 'HEAD'],
        ];

        foreach ($steps as $cmd) {
            $result = Process::timeout(120)->run($cmd);

            // "nothing to commit" bukan kegagalan — lanjut ke push spt biasa.
            if (!$result->successful() && !str_contains($result->errorOutput(), 'nothing to commit')) {
                return redirect()->back()->with(
                    'error',
                    'Backup database berhasil, tapi git push gagal: ' . trim($result->errorOutput() ?: $result->output())
                );
            }
        }

        return redirect()->back()->with('success', 'Backup database (lokal) & push kode ke GitHub berhasil.');
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
