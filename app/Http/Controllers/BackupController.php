<?php

namespace App\Http\Controllers;

use App\Models\SettingApp;
use App\Services\VersiSnapshotService;
use Carbon\Carbon;
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
    public function __construct(private readonly VersiSnapshotService $versi)
    {
    }

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

        // Sidik jari tiap snapshot versi, dipakai mengenali backup harian yang
        // isinya ternyata sama persis dengan snapshot sebuah versi (memang
        // demikian tepat setelah "Tandai Versi", karena keduanya berasal dari
        // satu dump yang sama). Tanpa penandaan ini operator melihat sederet
        // berkas bertanggal tanpa tahu mana yang bersejarah.
        $sidikVersi = collect($this->versi->manifes())
            ->filter(fn($baris) => !empty($baris['sidik_jari']))
            ->mapWithKeys(fn($baris) => [$baris['sidik_jari'] => $baris['tag']]);

        $backups = collect($files)
            ->filter(fn($file) => $file->getExtension() === 'zip')
            ->map(fn($file) => [
                'name' => $file->getFilename(),
                'size' => $file->getSize(),
                'last_modified' => $file->getMTime(),
                'download_url' => route('backup.download', ['file' => $file->getFilename()]),
                'versi' => $sidikVersi->get(hash_file('sha256', $file->getPathname())),
            ])
            ->sortByDesc('last_modified')
            ->values();

        return Inertia::render('backup/Index', [
            'backups' => $backups,
            'canPushGit' => true,
            'gitSyncEnabled' => (bool) SettingApp::cached()?->git_sync_enabled,
            'gitTags' => $this->listGitTags(),
            'penjadwal' => $this->statusPenjadwal(),
            'versi' => $this->daftarVersi(),
            'commitSekarang' => $this->versi->commitSekarang(),
        ]);
    }

    /**
     * Daftar versi yang punya snapshot database, digabung dengan tag git yang
     * ada di repo tetapi BELUM punya snapshot. Tag tanpa snapshot sengaja
     * tetap ditampilkan dan diberi tanda — itulah tag lama yang dibuat sebelum
     * fitur ini ada, dan operator perlu tahu bahwa rollback ke sana hanya akan
     * memundurkan kode tanpa data yang sepadan.
     */
    private function daftarVersi(): array
    {
        $manifes = collect($this->versi->manifes())->keyBy('tag');

        return collect($this->listGitTags())
            ->map(function (string $tag) use ($manifes) {
                $catatan = $manifes->get($tag);

                return [
                    'tag' => $tag,
                    'commit' => $catatan['commit'] ?? null,
                    'dibuat' => $catatan['dibuat'] ?? null,
                    'ukuran' => $catatan['ukuran'] ?? null,
                    'migrasi_terakhir' => $catatan['migrasi_terakhir'] ?? null,
                    'jumlah_migrasi' => $catatan['jumlah_migrasi'] ?? null,
                    'cacah_tabel' => $catatan['cacah_tabel'] ?? null,
                    'catatan' => $catatan['catatan'] ?? null,
                    'ada_snapshot' => $this->versi->snapshotAda($tag),
                    'unduh_url' => route('backup.versi.unduh', ['tag' => $tag]),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * Keadaan penjadwal tugas berkala, dibaca dari detak yang ditulis tiap
     * menit di routes/console.php.
     *
     * Ditaruh di halaman Backup karena di sinilah pemeliharaan server
     * dilihat, dan halaman ini sudah khusus super-admin. Toleransinya satu
     * jam, jauh di atas selang satu menit — supaya server yang sesaat sibuk
     * atau baru saja di-restart tidak langsung dituduh mati penjadwalnya.
     */
    private function statusPenjadwal(): array
    {
        $detak = Cache::get('penjadwal_detak_terakhir');

        return [
            'terakhir' => $detak ? Carbon::createFromTimestamp($detak)->toDateTimeString() : null,
            'menitLalu' => $detak ? (int) Carbon::createFromTimestamp($detak)->diffInMinutes(now(), true) : null,
            'sehat' => $detak !== null && Carbon::createFromTimestamp($detak)->greaterThan(now()->subHour()),
        ];
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
     * (kebalikan dari gitPush) — didahului backup database, TIDAK mengubah
     * isi database sendiri.
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
            // Backup dulu, baru tarik. Kode yang masuk dari remote bisa membawa
            // migrasi yang mengubah skema begitu dijalankan, dan sesudah itu
            // tidak ada lagi cadangan atas keadaan sebelum penarikan. Sama
            // prinsipnya dengan urutan di gitPush() dan checkoutTag().
            try {
                Artisan::call('backup:run', ['--only-db' => true]);
                $this->keepOnlyLatestBackup();
            } catch (\Throwable $e) {
                return redirect()->back()->with('error', 'Backup database gagal, git pull dibatalkan: ' . $e->getMessage());
            }

            $base = base_path();
            $result = Process::timeout(120)->run(['git', '-C', $base, 'pull', '--tags', 'origin', 'HEAD']);

            if (!$result->successful()) {
                return redirect()->back()->with(
                    'error',
                    'Git pull gagal: ' . trim($result->errorOutput() ?: $result->output())
                );
            }

            return redirect()->back()->with(
                'success',
                'Kode berhasil ditarik dari GitHub: ' . trim($result->output())
                . ' Backup database sebelum penarikan tersimpan di daftar backup.'
            );
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
            'pulihkan_database' => ['nullable', 'boolean'],
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

            // Kode sudah mundur. Kalau operator memilih memulihkan datanya
            // sekalian DAN versi itu memang punya snapshot, lakukan sekarang
            // juga di dalam kunci yang sama — jeda antara "kode sudah versi
            // lama" dan "database masih versi baru" adalah keadaan yang bisa
            // membuat aplikasi crash, jadi jangan dibiarkan menganga menunggu
            // klik berikutnya.
            $pesan = 'Kode server berhasil dikembalikan ke versi ' . $data['tag'] . '. Backup database sebelum checkout tersimpan di daftar backup.';

            if (!empty($data['pulihkan_database'])) {
                if (!$this->versi->snapshotAda($data['tag'])) {
                    return redirect()->back()->with(
                        'warning',
                        $pesan . ' Database TIDAK dipulihkan karena versi ini belum punya snapshot — '
                        . 'tag tersebut dibuat sebelum fitur snapshot versi ada. Jalankan migrasi/rebuild secara manual bila skema tidak cocok.'
                    );
                }

                if (!$this->versi->snapshotUtuh($data['tag'])) {
                    return redirect()->back()->with(
                        'error',
                        $pesan . ' Database TIDAK dipulihkan karena berkas snapshot versi ini rusak '
                        . '(sidik jarinya tidak lagi sama dengan saat direkam). Database sekarang sengaja dibiarkan apa adanya.'
                    );
                }

                try {
                    $sql = $this->sqlDariZip($this->versi->berkasSnapshot($data['tag']));
                } catch (\RuntimeException $e) {
                    return redirect()->back()->with('error', $pesan . ' Database TIDAK dipulihkan: ' . $e->getMessage());
                }

                return $this->timpaDatabaseDariSql($sql, 'snapshot versi ' . $data['tag']);
            }

            $selisih = $this->versi->selisihMigrasi($data['tag']);
            if ($selisih !== null && !$selisih['sepadan']) {
                $pesan .= ' PERHATIAN: database saat ini punya ' . $selisih['sekarang'] . ' migrasi, sedangkan versi '
                    . $data['tag'] . ' tercatat ' . $selisih['tag'] . ' migrasi — skemanya tidak sepadan dengan kode ini. '
                    . 'Pulihkan database dari snapshot versi tersebut, atau sesuaikan skema secara manual.';
            } else {
                $pesan .= ' Jalankan migrasi/rebuild jika perlu menyesuaikan skema database dengan versi kode ini.';
            }

            return redirect()->back()->with('success', $pesan);
        });
    }

    /**
     * Tandai keadaan sekarang sebagai satu versi: commit perubahan, buat tag
     * git, lalu rekam snapshot database yang sepadan dengannya.
     *
     * Inilah satu-satunya jalan resmi membuat tag di aplikasi ini, dan
     * sengaja dibuat sebagai satu tombol — bukan tiga langkah terpisah —
     * karena tag yang dibuat manual lewat terminal tidak akan punya snapshot,
     * dan tag tanpa snapshot tidak bisa dirollback dengan aman.
     *
     * Urutannya dipilih supaya kegagalan di tengah tidak meninggalkan sisa:
     * commit dulu (masih bisa diperbaiki), lalu tag, lalu snapshot. Kalau
     * snapshot gagal, tag yang baru dibuat DIHAPUS lagi — lebih baik tidak ada
     * versi sama sekali daripada ada versi yang mengaku punya cadangan padahal
     * tidak.
     */
    public function tandaiVersi(Request $request)
    {
        $this->ensureSuperAdmin();

        $data = $request->validate([
            'tag' => ['required', 'string', 'max:100', 'regex:' . VersiSnapshotService::POLA_TAG],
            'catatan' => ['nullable', 'string', 'max:500'],
            'push' => ['nullable', 'boolean'],
        ], [
            'tag.regex' => 'Nama versi harus berbentuk v<angka>.<angka>.<angka>, misalnya v1.0.4.',
        ]);

        if (in_array($data['tag'], $this->listGitTags(), true)) {
            return redirect()->back()->with(
                'error',
                'Versi ' . $data['tag'] . ' sudah ada. Memindahkan tag yang sudah dipublikasikan akan membuat '
                . 'salinan orang lain berisi kode berbeda dengan nama versi yang sama — pakai nomor versi berikutnya.'
            );
        }

        $wajibPush = (bool) ($data['push'] ?? false);
        if ($wajibPush) {
            $this->ensureGitSyncEnabled();
        }

        return $this->withBackupLock(function () use ($data, $wajibPush) {
            $base = base_path();
            $pesanCommit = 'Tandai versi ' . $data['tag'] . ($data['catatan'] ? ' — ' . $data['catatan'] : '');

            // Langkah 1: pastikan tidak ada perubahan yang tertinggal di luar
            // versi ini. "nothing to commit" bukan kegagalan — artinya working
            // tree memang sudah bersih dan tag akan menunjuk HEAD apa adanya.
            foreach ([['git', '-C', $base, 'add', '-A'], ['git', '-C', $base, 'commit', '-m', $pesanCommit]] as $cmd) {
                $hasil = Process::timeout(120)->run($cmd);
                if (!$hasil->successful() && !str_contains($hasil->output() . $hasil->errorOutput(), 'nothing to commit')) {
                    return redirect()->back()->with(
                        'error',
                        'Gagal menyimpan perubahan sebelum menandai versi: ' . trim($hasil->errorOutput() ?: $hasil->output())
                    );
                }
            }

            // Langkah 2: buat tag beranotasi (bukan tag ringan) supaya
            // pembuatnya, waktunya, dan catatannya ikut tersimpan di dalam
            // objek tag itu sendiri, bukan cuma di manifes aplikasi.
            $anotasi = $data['catatan'] ?: 'Versi ' . $data['tag'];
            $hasilTag = Process::timeout(60)->run(['git', '-C', $base, 'tag', '-a', $data['tag'], '-m', $anotasi]);
            if (!$hasilTag->successful()) {
                return redirect()->back()->with(
                    'error',
                    'Gagal membuat tag ' . $data['tag'] . ': ' . trim($hasilTag->errorOutput() ?: $hasilTag->output())
                );
            }

            // Langkah 3: snapshot database. Gagal di sini berarti tag dibatalkan.
            try {
                $catatan = $this->versi->rekam($data['tag'], storage_path('app/' . $this->backupPath()), $data['catatan'] ?? null);
                $this->keepOnlyLatestBackup();
            } catch (\Throwable $e) {
                Process::timeout(60)->run(['git', '-C', $base, 'tag', '-d', $data['tag']]);

                return redirect()->back()->with(
                    'error',
                    'Snapshot database gagal, tag ' . $data['tag'] . ' dibatalkan supaya tidak ada versi tanpa cadangan data: ' . $e->getMessage()
                );
            }

            $pesan = 'Versi ' . $data['tag'] . ' ditandai, berikut snapshot database '
                . round($catatan['ukuran'] / 1024) . ' KB pada ' . $catatan['jumlah_migrasi'] . ' migrasi.';

            if ($wajibPush) {
                $hasilPush = Process::timeout(180)->run(['git', '-C', $base, 'push', '--follow-tags', 'origin', 'HEAD']);
                if (!$hasilPush->successful()) {
                    return redirect()->back()->with(
                        'warning',
                        $pesan . ' Tetapi push ke GitHub gagal: ' . trim($hasilPush->errorOutput() ?: $hasilPush->output())
                        . ' — versi tetap tersimpan di lokal dan bisa di-push ulang.'
                    );
                }
                $pesan .= ' Kode dan tag sudah di-push ke GitHub (snapshot database TIDAK ikut, tetap di lokal).';
            }

            return redirect()->back()->with('success', $pesan);
        });
    }

    /**
     * Unduh snapshot database milik satu versi, supaya bisa dipulihkan sendiri
     * lewat menu Import — jalur manual yang diminta tetap ada di samping
     * pemulihan otomatis saat checkout tag.
     */
    public function unduhVersi(string $tag)
    {
        $this->ensureSuperAdmin();

        if (!$this->versi->tagSah($tag) || !$this->versi->snapshotAda($tag)) {
            abort(404, 'Snapshot untuk versi ini tidak ditemukan.');
        }

        return response()->download($this->versi->berkasSnapshot($tag), $tag . '.zip');
    }

    /**
     * Pulihkan database ke snapshot milik satu versi TANPA menyentuh kode.
     * Dipakai ketika kode sudah terlanjur mundur lewat jalur lain, atau ketika
     * operator hanya ingin mengembalikan data ke titik itu.
     */
    public function pulihkanVersi(Request $request, string $tag)
    {
        $this->ensureSuperAdmin();

        if (!$this->versi->tagSah($tag) || !$this->versi->snapshotAda($tag)) {
            return redirect()->back()->with('error', 'Snapshot untuk versi ' . $tag . ' tidak ditemukan.');
        }

        // Ketik ulang nama versi — pengaman yang sama dengan checkout tag,
        // karena akibatnya sama-sama menimpa dan tidak bisa dibatalkan.
        $data = $request->validate(['konfirmasi' => ['required', 'string']]);
        if ($data['konfirmasi'] !== $tag) {
            return redirect()->back()->with('error', 'Konfirmasi tidak cocok — ketik nama versi persis seperti tertulis.');
        }

        if (!$this->versi->snapshotUtuh($tag)) {
            return redirect()->back()->with(
                'error',
                'Berkas snapshot versi ' . $tag . ' rusak (sidik jarinya tidak lagi sama dengan saat direkam). '
                . 'Database sengaja dibiarkan apa adanya.'
            );
        }

        try {
            $sql = $this->sqlDariZip($this->versi->berkasSnapshot($tag));
        } catch (\RuntimeException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }

        return $this->withBackupLock(fn() => $this->timpaDatabaseDariSql($sql, 'snapshot versi ' . $tag));
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

        try {
            $sqlContent = $this->sqlDariZip($uploaded->getRealPath());
        } catch (\RuntimeException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }

        return $this->withBackupLock(function () use ($uploaded, $sqlContent) {
            return $this->timpaDatabaseDariSql($sqlContent, $uploaded->getClientOriginalName());
        });
    }

    /**
     * Ambil isi satu-satunya berkas .sql dari dalam zip backup.
     *
     * Dipakai bersama oleh impor berkas unggahan dan pemulihan snapshot versi,
     * karena keduanya membaca format zip yang sama persis — hasil Spatie Backup
     * `--only-db`. Menolak zip berisi lebih dari satu .sql adalah pengaman
     * sengaja: backup PENUH (berisi kode project) juga berekstensi .zip dan
     * kalau lolos akan dijalankan sebagai dump, merusak database.
     *
     * @throws \RuntimeException dengan pesan yang sudah layak ditampilkan
     */
    private function sqlDariZip(string $zipPath): string
    {
        $zip = new ZipArchive();
        if ($zip->open($zipPath) !== true) {
            throw new \RuntimeException('File zip tidak valid atau rusak.');
        }

        $sqlEntryName = null;
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = $zip->getNameIndex($i);
            if (str_ends_with(strtolower($name), '.sql')) {
                if ($sqlEntryName !== null) {
                    $zip->close();

                    throw new \RuntimeException('Zip berisi lebih dari satu file .sql — format tidak dikenali.');
                }
                $sqlEntryName = $name;
            }
        }

        if ($sqlEntryName === null) {
            $zip->close();

            throw new \RuntimeException('Zip tidak berisi file .sql — pastikan ini file backup database yang benar.');
        }

        $sqlContent = $zip->getFromName($sqlEntryName);
        $zip->close();

        if ($sqlContent === false || trim($sqlContent) === '') {
            throw new \RuntimeException('Gagal membaca isi dump SQL dari zip.');
        }

        return $sqlContent;
    }

    /**
     * Timpa seluruh database dengan isi satu dump SQL, didahului backup
     * pengaman atas keadaan sekarang.
     *
     * WAJIB dipanggil dari dalam withBackupLock() — tidak mengunci sendiri,
     * supaya pemanggil bisa membungkus beberapa langkah (mis. checkout tag lalu
     * pulihkan database) dalam satu kunci yang sama.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    private function timpaDatabaseDariSql(string $sqlContent, string $namaSumber)
    {
        // Safety net: backup kondisi SEKARANG dulu sebelum ditimpa — kalau
        // gagal, batalkan sepenuhnya (sama prinsipnya dengan urutan di
        // gitPush()).
        try {
            Artisan::call('backup:run', ['--only-db' => true]);
            $this->keepOnlyLatestBackup();
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Backup pengaman sebelum menimpa database gagal, proses dibatalkan: ' . $e->getMessage());
        }

        $tmpSqlPath = storage_path('app/private/import-' . uniqid() . '.sql');
        File::put($tmpSqlPath, $sqlContent);

        try {
            $failedStatements = $this->restoreFromSqlFile($tmpSqlPath);
        } catch (\Throwable $e) {
            return redirect()->back()->with(
                'error',
                'Pemulihan database gagal total: ' . $e->getMessage() . ' — database mungkin dalam kondisi tidak konsisten. '
                . 'SEGERA pulihkan dari backup pengaman di daftar backup (dibuat tepat sebelum proses ini).'
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
                'Pemulihan selesai TAPI database hasilnya tampak tidak lengkap (tabel inti kosong/hilang: '
                . (empty($missingTables) ? 'users' : implode(', ', $missingTables))
                . '). Kemungkinan ada statement SQL yang gagal di tengah proses. '
                . 'SEGERA pulihkan dari backup pengaman di daftar backup (dibuat tepat sebelum proses ini) via menu Import lagi.'
            );
        }

        $message = 'Database berhasil dipulihkan dari ' . $namaSumber . '. Backup kondisi sebelumnya tersimpan di daftar backup.';
        if ($failedStatements > 0) {
            $message .= " Peringatan: {$failedStatements} statement SQL dilewati karena error (lihat log) — periksa data hasil pemulihan.";
        }

        return redirect()->back()->with('success', $message);
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
