<?php

namespace App\Http\Controllers;

use App\Models\SettingApp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use ZipArchive;

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
     * Git Push/Pull menjalankan perintah git SUNGGUHAN di server ini, memakai
     * kredensial git/SSH yang TERPASANG DI SERVER ITU SENDIRI (bukan milik
     * aplikasi) — jadi siapa pun instansi yang meng-clone/fork aplikasi ini
     * dan menjalankannya di server mereka sendiri otomatis punya remote
     * `origin` yang (sesaat setelah clone) masih menunjuk ke repository asal
     * developer template. Tanpa pengaman ini, super-admin DI LINGKUNGAN
     * MEREKA bisa memicu git push/pull yang — kalau server mereka kebetulan
     * masih menyimpan kredensial git developer asal (skenario deploy yang
     * ceroboh) — bisa menyentuh repository developer asal, bukan repo
     * mereka sendiri.
     *
     * Perbaikannya BUKAN memblokir berdasarkan URL remote (repo pemilik asli
     * & repo instansi lain sama-sama bisa punya origin URL apa saja,
     * termasuk sama persis tepat setelah clone) — tapi mewajibkan toggle
     * aktivasi tersendiri (kolom `git_sync_enabled` di settingapp, DEFAULT
     * FALSE) yang HANYA bisa dinyalakan oleh Super Admin lewat halaman
     * Backup itu sendiri (lihat toggleGitSync()). Setiap instalasi baru —
     * termasuk hasil clone/fork oleh siapa pun — SELALU mulai dengan toggle
     * ini mati, sehingga fitur Git Push/Pull nonaktif sampai Super Admin di
     * server itu SENDIRI yang menyalakannya secara sadar. Dipilih simpan di
     * database (bukan file .env) supaya bisa diaktifkan dari UI tanpa
     * aplikasi perlu izin tulis ke file .env server (yang perizinannya
     * berbeda-beda antar hosting dan berisiko merusak .env kalau ditulis
     * otomatis dari kode).
     */
    private function ensureGitSyncEnabled(): void
    {
        if (!SettingApp::cached()?->git_sync_enabled) {
            abort(403, 'Fitur Git Push/Pull belum diaktifkan di server ini. Nyalakan toggle "Aktifkan Git Push/Pull" di halaman Backup ini untuk mengaktifkannya di lingkungan Anda sendiri.');
        }
    }

    /**
     * Nyalakan/matikan toggle Git Sync — hanya efek pada baris `settingapp`
     * server INI, tidak menyentuh file .env maupun kredensial git apa pun.
     */
    public function toggleGitSync(Request $request)
    {
        $this->ensureSuperAdmin();

        $data = $request->validate(['enabled' => ['required', 'boolean']]);

        $setting = SettingApp::firstOrNew();
        $setting->git_sync_enabled = $data['enabled'];
        $setting->save();
        SettingApp::clearCached();

        return redirect()->back()->with(
            'success',
            $data['enabled']
                ? 'Fitur Git Push/Pull diaktifkan untuk server ini.'
                : 'Fitur Git Push/Pull dinonaktifkan untuk server ini.'
        );
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
            'gitSyncEnabled' => (bool) SettingApp::cached()?->git_sync_enabled,
            'gitTags' => $this->listGitTags(),
        ]);
    }

    /**
     * Daftar tag git yang ada di repo lokal server ini (mis. v1.0.0,
     * v1.0.1) — dipakai dropdown "Checkout ke Versi Tag" di halaman
     * Backup. Diurutkan versi terbaru dulu (`--sort=-v:refname`, git native
     * semver-aware sort, bukan sort string biasa supaya v1.0.10 tidak
     * muncul sebelum v1.0.2). Tidak melempar error kalau git tidak
     * tersedia/bukan repo — cukup kembalikan array kosong supaya halaman
     * Backup tetap bisa dibuka.
     */
    private function listGitTags(): array
    {
        $result = Process::timeout(15)->run([
            'git', '-C', base_path(), 'tag', '-l', '--sort=-v:refname',
        ]);

        if (!$result->successful()) {
            return [];
        }

        return array_values(array_filter(array_map('trim', explode("\n", $result->output()))));
    }

    /**
     * Kunci bersama utk SEMUA aksi yang menulis ke folder backup dan/atau
     * working directory git (run/gitPush/gitPull/importDatabase) — tanpa
     * ini, dua super-admin yang mengklik aksi berbeda hampir bersamaan bisa
     * saling menghapus snapshot penyelamat satu sama lain lewat
     * keepOnlyLatestBackup() (dipanggil dari 3 method berbeda), atau
     * menjalankan restore PDO paralel yang saling bentrok DROP/CREATE TABLE
     * pada tabel yang sama. Timeout 10 menit cukup longgar utk backup+push
     * database besar sambil tetap mencegah lock macet permanen kalau
     * request sebelumnya crash tanpa sempat release.
     */
    private function withBackupLock(callable $callback)
    {
        $lock = Cache::lock('backup-operation-lock', 600);

        if (!$lock->get()) {
            abort(409, 'Sedang ada operasi backup/restore/git lain yang berjalan. Coba lagi sebentar.');
        }

        try {
            return $callback();
        } finally {
            $lock->release();
        }
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
        $this->ensureGitSyncEnabled();

        return $this->withBackupLock(function () use ($request) {
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
        });
    }

    public function run()
    {
        $this->ensureSuperAdmin();

        return $this->withBackupLock(function () {
            Artisan::call('backup:run', ['--only-db' => true]);
            $this->keepOnlyLatestBackup();
            return redirect()->back()->with('success', 'Backup berhasil dibuat.');
        });
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

    /**
     * Tarik commit terbaru dari GitHub ke working directory server ini
     * (kebalikan dari gitPush) — TIDAK menyentuh database sama sekali.
     * Bukan deploy: cuma menyamakan kode lokal dengan remote HEAD branch
     * yang sedang aktif. Kalau ada perubahan lokal belum di-commit yang
     * konflik dengan pull, git akan menolak & kita tampilkan error apa
     * adanya — tidak ada --force/reset otomatis di sini.
     */
    public function gitPull(Request $request)
    {
        $this->ensureSuperAdmin();
        $this->ensureGitSyncEnabled();

        return $this->withBackupLock(function () {
            $base = base_path();
            $result = Process::timeout(120)->run(['git', '-C', $base, 'pull', 'origin', 'HEAD']);

            if (!$result->successful()) {
                return redirect()->back()->with(
                    'error',
                    'Git pull gagal: ' . trim($result->errorOutput() ?: $result->output())
                );
            }

            return redirect()->back()->with('success', 'Kode berhasil ditarik dari GitHub: ' . trim($result->output()));
        });
    }

    /**
     * Checkout kode ke tag versi tertentu (mis. "v1.0.0") — jalur rollback
     * resmi utk fitur yg gagal/tidak sesuai setelah dirilis (lihat
     * dokumentasi versioning di README/plan: setiap fitur besar ditandai
     * tag v-x.y.z sebelum & sesudah dikerjakan). BUKAN git pull biasa:
     * `git pull origin HEAD` di gitPull() cuma menyamakan ke HEAD branch
     * aktif, tidak bisa "mundur" ke versi lama begitu ada commit baru di
     * atasnya — checkout ke tag inilah satu-satunya cara mundur dari UI.
     *
     * Destruktif: pakai `git reset --hard <tag>` (BUKAN `git checkout
     * <tag>` yang meninggalkan repo dalam kondisi "detached HEAD" yang
     * membingungkan operator awam) — SEMUA perubahan lokal yg belum
     * di-commit di server ini AKAN HILANG, dan riwayat branch di server
     * ini akan mundur/berbeda dari remote sampai di-push ulang. Karena itu:
     * (1) wajib ketik ulang nama tag persis (frontend, dobel dgn backend),
     * (2) backup database PENUH dulu sebelum checkout — kode versi lama
     * kadang butuh skema kolom yg beda dari migrasi yg sudah jalan
     * sekarang, jadi checkout kode SENDIRIAN tanpa cadangan data berisiko
     * bikin aplikasi crash total kalau skema tidak cocok.
     */
    public function checkoutTag(Request $request)
    {
        $this->ensureSuperAdmin();
        $this->ensureGitSyncEnabled();

        $data = $request->validate([
            'tag' => ['required', 'string', 'max:100'],
        ]);

        $availableTags = $this->listGitTags();
        if (!in_array($data['tag'], $availableTags, true)) {
            return redirect()->back()->with('error', 'Tag "' . $data['tag'] . '" tidak ditemukan di repository ini.');
        }

        return $this->withBackupLock(function () use ($data) {
            try {
                Artisan::call('backup:run', ['--only-db' => true]);
                $this->keepOnlyLatestBackup();
            } catch (\Throwable $e) {
                return redirect()->back()->with('error', 'Backup database gagal, checkout tag dibatalkan: ' . $e->getMessage());
            }

            $base = base_path();
            $result = Process::timeout(60)->run(['git', '-C', $base, 'reset', '--hard', $data['tag']]);

            if (!$result->successful()) {
                return redirect()->back()->with(
                    'error',
                    'Checkout ke tag "' . $data['tag'] . '" gagal: ' . trim($result->errorOutput() ?: $result->output())
                );
            }

            return redirect()->back()->with(
                'success',
                'Kode server berhasil dikembalikan ke versi ' . $data['tag'] . '. Backup database sebelum checkout tersimpan di daftar backup. '
                . 'Jalankan migrasi/rebuild jika perlu menyesuaikan skema database dengan versi kode ini.'
            );
        });
    }

    /**
     * Impor (restore) database dari file backup .zip yang diupload —
     * TIMPA TOTAL: seluruh tabel database saat ini di-drop lalu diganti
     * isi dump SQL dari dalam zip. Ini aksi paling destruktif di halaman
     * ini, jadi: (1) hanya menerima zip hasil "Create Backup"/"Backup &
     * Push" aplikasi ini sendiri (harus berisi tepat satu file .sql di
     * root zip — format yang dihasilkan Spatie Backup --only-db), (2)
     * SELALU backup database saat ini dulu sebelum menimpa apa pun, jadi
     * kalau operator salah upload file, masih ada snapshot "sebelum
     * import" utk dipulihkan lewat Download di daftar backup.
     */
    public function importDatabase(Request $request)
    {
        $this->ensureSuperAdmin();

        $request->validate([
            'backup_file' => ['required', 'file', 'mimes:zip', 'max:512000'], // 500MB
        ]);

        $uploaded = $request->file('backup_file');
        $tmpZipPath = $uploaded->getRealPath();

        $zip = new ZipArchive();
        if ($zip->open($tmpZipPath) !== true) {
            return redirect()->back()->with('error', 'File zip tidak valid atau rusak.');
        }

        // Cari SATU file .sql di root zip — sesuai format Spatie Backup
        // --only-db (bukan backup penuh berisi kode project).
        $sqlEntryName = null;
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = $zip->getNameIndex($i);
            if (str_ends_with(strtolower($name), '.sql')) {
                if ($sqlEntryName !== null) {
                    $zip->close();

                    return redirect()->back()->with('error', 'Zip berisi lebih dari satu file .sql — format tidak dikenali.');
                }
                $sqlEntryName = $name;
            }
        }

        if ($sqlEntryName === null) {
            $zip->close();

            return redirect()->back()->with('error', 'Zip tidak berisi file .sql — pastikan ini file backup database yang benar.');
        }

        $sqlContent = $zip->getFromName($sqlEntryName);
        $zip->close();

        if ($sqlContent === false || trim($sqlContent) === '') {
            return redirect()->back()->with('error', 'Gagal membaca isi dump SQL dari zip.');
        }

        return $this->withBackupLock(function () use ($uploaded, $sqlContent) {
            // Safety net: backup kondisi SEKARANG dulu sebelum ditimpa — kalau
            // gagal, batalkan import sepenuhnya (sama prinsipnya dengan urutan
            // di gitPush()).
            try {
                Artisan::call('backup:run', ['--only-db' => true]);
                $this->keepOnlyLatestBackup();
            } catch (\Throwable $e) {
                return redirect()->back()->with('error', 'Backup pengaman sebelum impor gagal, impor dibatalkan: ' . $e->getMessage());
            }

            $tmpSqlPath = storage_path('app/private/import-' . uniqid() . '.sql');
            File::put($tmpSqlPath, $sqlContent);

            try {
                $failedStatements = $this->restoreFromSqlFile($tmpSqlPath);
            } catch (\Throwable $e) {
                return redirect()->back()->with(
                    'error',
                    'Impor database gagal total: ' . $e->getMessage() . ' — database mungkin dalam kondisi tidak konsisten. '
                    . 'SEGERA pulihkan dari backup pengaman di daftar backup (dibuat tepat sebelum impor ini).'
                );
            } finally {
                File::delete($tmpSqlPath);
            }

            // Smoke-test: pastikan tabel inti benar-benar terisi setelah
            // restore, bukan cuma "tidak melempar exception". DDL MySQL
            // auto-commit per statement dan tidak bisa di-rollback — kalau
            // satu statement di tengah gagal (mis. data mengandung ";\n"
            // yang salah displit jadi 2 statement), sisa tabel setelahnya
            // tidak akan pernah dibuat ulang, tapi loop di
            // restoreFromSqlFile() tetap lanjut sampai akhir tanpa
            // melempar exception. Smoke-test ini yang mendeteksi hasil
            // restore rusak sebelum terlanjur dilaporkan "berhasil".
            $missingTables = [];
            foreach (['users', 'menus'] as $table) {
                if (!Schema::hasTable($table)) {
                    $missingTables[] = $table;
                }
            }

            if (!empty($missingTables) || DB::table('users')->count() === 0) {
                return redirect()->back()->with(
                    'error',
                    'Impor selesai TAPI database hasil restore tampak tidak lengkap (tabel inti kosong/hilang: '
                    . (empty($missingTables) ? 'users' : implode(', ', $missingTables))
                    . '). Kemungkinan ada statement SQL yang gagal di tengah proses. '
                    . 'SEGERA pulihkan dari backup pengaman di daftar backup (dibuat tepat sebelum impor ini) via menu Import lagi.'
                );
            }

            $message = 'Database berhasil diimpor dari ' . $uploaded->getClientOriginalName() . '. Backup kondisi sebelumnya tersimpan di daftar backup.';
            if ($failedStatements > 0) {
                $message .= " Peringatan: {$failedStatements} statement SQL dilewati karena error (lihat log) — periksa data hasil impor.";
            }

            return redirect()->back()->with('success', $message);
        });
    }

    /**
     * Jalankan dump SQL langsung lewat PDO (koneksi Laravel yang sudah
     * ada) — TIDAK memanggil binary `mysql` CLI eksternal. Environment
     * dev/prod aplikasi ini (Laravel Herd di Windows) tidak selalu punya
     * `mysql.exe` di PATH; percobaan sebelumnya via Process::run(['mysql',
     * ...]) gagal SENYAP (proses drop-tabel manual sudah kadung jalan
     * duluan, lalu restore-nya sendiri gagal karena binary tidak
     * ditemukan) dan meninggalkan database KOSONG TOTAL tanpa rollback —
     * insiden nyata, bukan risiko teoretis. Drop tabel manual terpisah
     * SENGAJA DIHAPUS di sini: dump Spatie sudah menyertakan
     * `DROP TABLE IF EXISTS` persis sebelum tiap `CREATE TABLE`, jadi drop
     * & re-create terjadi tabel-per-tabel dalam satu urutan statement yang
     * sama — tidak ada lagi jeda "semua tabel sudah didrop, belum ada yang
     * dibuat ulang" seperti pola lama.
     *
     * Return: jumlah statement yang GAGAL dieksekusi (dicatat ke log,
     * bukan diam) — dipakai pemanggil utk memberi peringatan eksplisit
     * alih-alih melaporkan "berhasil" begitu saja meski ada baris yg gagal.
     * DDL MySQL auto-commit per statement & tidak bisa di-rollback, jadi
     * satu statement gagal tidak membatalkan statement lain yg sudah
     * jalan — loop sengaja TETAP LANJUT ke statement berikutnya (drop satu
     * tabel yang gagal dibuat ulang lebih baik daripada seluruh restore
     * berhenti di tengah dgn separuh tabel hilang total).
     */
    private function restoreFromSqlFile(string $sqlPath): int
    {
        $sql = File::get($sqlPath);
        $statements = $this->splitSqlStatements($sql);

        $pdo = DB::connection()->getPdo();
        $pdo->exec('SET FOREIGN_KEY_CHECKS=0');

        $failed = 0;
        try {
            foreach ($statements as $statement) {
                try {
                    $pdo->exec($statement);
                } catch (\Throwable $e) {
                    $failed++;
                    Log::error('BackupController::restoreFromSqlFile — statement gagal', [
                        'error' => $e->getMessage(),
                        'statement_preview' => substr($statement, 0, 200),
                    ]);
                }
            }
        } finally {
            $pdo->exec('SET FOREIGN_KEY_CHECKS=1');
        }

        return $failed;
    }

    /**
     * Pisahkan dump SQL jadi daftar statement individual, sadar-quote —
     * BUKAN regex naif berbasis ";\n" seperti sebelumnya. mysqldump
     * membungkus SEMUA nilai teks dalam kutip tunggal (dgn escaping `\'`
     * dan `''`), tapi field-field risiko di aplikasi ini (URAIAN RISIKO,
     * RENCANA TINDAK PENGENDALIAN, dst) adalah `text` panjang yang bisa
     * memuat APA SAJA termasuk pola literal ";\n" di dalam nilainya —
     * regex lama akan memotong statement INSERT di tengah string itu,
     * menghasilkan 2 "statement" yang keduanya SQL tidak valid, dan
     * proses restore gagal di titik yg sebenarnya datanya valid. Splitter
     * ini melacak in-string/in-comment state karakter-per-karakter supaya
     * titik-koma di DALAM string literal tidak dianggap pemisah statement.
     */
    private function splitSqlStatements(string $sql): array
    {
        $statements = [];
        $current = '';
        $length = strlen($sql);
        $inString = null; // null | "'" | '"' — kutip yang sedang aktif
        $inLineComment = false;

        for ($i = 0; $i < $length; $i++) {
            $char = $sql[$i];
            $next = $i + 1 < $length ? $sql[$i + 1] : '';

            if ($inLineComment) {
                $current .= $char;
                if ($char === "\n") {
                    $inLineComment = false;
                }
                continue;
            }

            if ($inString !== null) {
                $current .= $char;
                if ($char === '\\' && $next !== '') {
                    // Escape backslash — ikutkan karakter berikutnya apa
                    // adanya supaya tidak salah dianggap penutup quote.
                    $current .= $next;
                    $i++;
                    continue;
                }
                if ($char === $inString) {
                    // Quote ganda ('' atau "") = escaped quote literal,
                    // bukan penutup — cek karakter berikutnya.
                    if ($next === $inString) {
                        $current .= $next;
                        $i++;
                        continue;
                    }
                    $inString = null;
                }
                continue;
            }

            if ($char === "'" || $char === '"') {
                $inString = $char;
                $current .= $char;
                continue;
            }

            if ($char === '-' && $next === '-') {
                $inLineComment = true;
                $current .= $char;
                continue;
            }

            if ($char === ';') {
                $trimmed = trim($current);
                if ($trimmed !== '' && !str_starts_with($trimmed, '--')) {
                    $statements[] = $trimmed;
                }
                $current = '';
                continue;
            }

            $current .= $char;
        }

        $trimmed = trim($current);
        if ($trimmed !== '' && !str_starts_with($trimmed, '--')) {
            $statements[] = $trimmed;
        }

        return $statements;
    }
}
