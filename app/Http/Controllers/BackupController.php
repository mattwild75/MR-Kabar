<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;
use Inertia\Inertia;

class BackupController extends Controller
{
    /**
     * Lapis kedua di luar permission_name menu — backup database (dump
     * PENUH seluruh tabel termasuk hash password semua user) dan push kode
     * ke GitHub dianggap aksi paling sensitif di aplikasi ini, jadi dikunci
     * ke role super-admin secara eksplisit di kode, tidak hanya bergantung
     * pada assignment permission "backup-view" yang bisa diubah kapan saja
     * lewat UI Permission Management (admin biasa TIDAK dapat mengubah
     * permission dirinya sendiri untuk lolos cek ini). Sama pola dengan
     * AuditLogController.
     */
    private function ensureSuperAdmin(): void
    {
        if (!auth()->user()?->hasRole('super-admin')) {
            abort(403, 'Backup database & push GitHub hanya dapat diakses oleh Super Admin.');
        }
    }

    /**
     * Folder tujuan backup Spatie ikut config('backup.backup.name'), yang
     * defaultnya env('APP_NAME') — BUKAN selalu "Laravel". Sempat hardcode
     * 'private/Laravel' di sini, jadi setelah APP_NAME diubah ke "MR KABAR"
     * backup baru tertulis ke folder lain & terlihat seolah gagal/hilang.
     */
    protected function backupPath(): string
    {
        return 'private/' . config('backup.backup.name', 'Laravel');
    }

    public function index()
    {
        $this->ensureSuperAdmin();

        $realPath = storage_path('app/' . $this->backupPath());

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
            'canPushGit' => true,
        ]);
    }

    /**
     * Hapus semua backup KECUALI yang paling baru — dipanggil setelah tiap
     * backup:run supaya daftar backup tidak menumpuk & membingungkan.
     * Selalu maksimal 1 file backup tersimpan setiap saat.
     */
    private function keepOnlyLatestBackup(): void
    {
        $realPath = storage_path('app/' . $this->backupPath());
        if (!File::exists($realPath)) {
            return;
        }

        $zips = collect(File::files($realPath))
            ->filter(fn($file) => $file->getExtension() === 'zip')
            ->sortByDesc(fn($file) => $file->getMTime())
            ->values();

        $zips->skip(1)->each(fn($file) => File::delete($file->getPathname()));
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
        $this->ensureSuperAdmin();

        // Langkah 1: backup database dulu — kalau ini gagal, batalkan push
        // supaya tidak ada snapshot kode tanpa cadangan data yg sepadan.
        try {
            Artisan::call('backup:run', ['--only-db' => true]);
            $this->keepOnlyLatestBackup();
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
        $this->ensureSuperAdmin();

        Artisan::call('backup:run', ['--only-db' => true]);
        $this->keepOnlyLatestBackup();
        return redirect()->back()->with('success', 'Backup berhasil dibuat.');
    }

    public function download($file)
    {
        $this->ensureSuperAdmin();

        $file = basename($file);
        if (!str_ends_with($file, '.zip')) {
            abort(404, 'File tidak ditemukan.');
        }

        $path = storage_path('app/' . $this->backupPath() . '/' . $file);

        if (!file_exists($path)) {
            abort(404, 'File tidak ditemukan.');
        }

        return response()->download($path);
    }

    public function delete($file)
    {
        $this->ensureSuperAdmin();

        $file = basename($file);
        if (!str_ends_with($file, '.zip')) {
            return redirect()->back()->with('error', 'File tidak ditemukan.');
        }

        $path = storage_path('app/' . $this->backupPath() . '/' . $file);

        if (!file_exists($path)) {
            return redirect()->back()->with('error', 'File tidak ditemukan.');
        }

        unlink($path);

        return redirect()->back()->with('success', 'Backup berhasil dihapus.');
    }
}
