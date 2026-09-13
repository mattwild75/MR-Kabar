<?php

namespace App\Services;

use App\Models\LaporanKecurangan;
use App\Models\LaporanKejadianRisiko;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Potret pemakaian ruang disk untuk menu Utilities > Storage: berapa yang
 * terpakai dari disk yang diberikan, dipecah per kelompok, dan kelompok mana
 * yang berkasnya AMAN dihapus dari halaman itu.
 *
 * Yang boleh dihapus hanya yang hilangnya tidak merusak aplikasi dan bisa
 * dibuat/diunggah ulang: unggahan File Manager, bukti laporan, cadangan
 * aplikasi (kecuali yang terbaru), log lama, berkas sementara, dan cache.
 * Kode program, vendor, basis data, cadangan cron root, video bawaan, dan
 * berkas Setting App HANYA dibaca — menghapusnya berarti aplikasi rusak
 * atau logo/video di pengaturan menunjuk berkas yang tidak ada.
 *
 * Menghitung ukuran vendor/node_modules berarti menyusuri puluhan ribu
 * berkas, jadi hasilnya disimpan di cache 10 menit; tombol "Hitung ulang"
 * membuangnya.
 */
class PenyimpananService
{
    public const CACHE = 'penyimpanan:potret';

    public function __construct(private readonly CadanganService $cadangan) {}

    /** @return array<string, mixed> */
    public function potret(bool $segar = false): array
    {
        if ($segar) {
            Cache::forget(self::CACHE);
        }

        return Cache::remember(self::CACHE, 600, fn () => $this->hitung());
    }

    /** @return array<string, mixed> */
    private function hitung(): array
    {
        $kelompok = [
            $this->kelompokKode(),
            $this->kelompokBasisData(),
            $this->kelompokVideoBawaan(),
            $this->kelompokSettingApp(),
            $this->kelompokArsip(),
            $this->kelompokFileManager(),
            $this->kelompokBukti(),
            $this->kelompokCadangan(),
            $this->kelompokCadanganCron(),
            $this->kelompokLog(),
            $this->kelompokCache(),
            $this->kelompokSementara(),
        ];

        $total = (float) (@disk_total_space(base_path()) ?: 0);
        $bebas = (float) (@disk_free_space(base_path()) ?: 0);
        $terpakai = max(0, $total - $bebas);
        $terhitung = array_sum(array_column($kelompok, 'ukuran'));

        // Sisa yang tidak masuk kelompok mana pun: sistem operasi, paket,
        // log sistem, dan apa pun di luar folder aplikasi. Hanya dibaca.
        $kelompok[] = [
            'kode' => 'sistem',
            'judul' => 'Sistem operasi dan lainnya di luar aplikasi',
            'keterangan' => 'Ubuntu, paket server (nginx, PHP, MySQL), log sistem, dan berkas lain di luar folder aplikasi. Tidak dikelola dari sini.',
            'ukuran' => max(0, $terpakai - $terhitung),
            'jumlah' => null,
            'aman' => false,
            'butir' => [],
        ];

        return [
            'disk' => [
                'total' => $total,
                'terpakai' => $terpakai,
                'bebas' => $bebas,
                'persen' => $total > 0 ? round($terpakai / $total * 100, 1) : 0,
            ],
            'kelompok' => $kelompok,
            'dihitung_pada' => now()->toDateTimeString(),
        ];
    }

    // ── kelompok hanya-baca ─────────────────────────────────────────────

    private function kelompokKode(): array
    {
        $bagian = [];
        foreach ([
            'app', 'bootstrap', 'config', 'database', 'resources', 'routes', 'lang', 'docs', 'tests',
            'video-edukasi', 'video-tutorial',
        ] as $d) {
            if (is_dir(base_path($d))) {
                $bagian[] = $this->butir($d, $this->ukuranFolder(base_path($d)), null, 'kode program');
            }
        }
        $bagian[] = $this->butir('vendor', $this->ukuranFolder(base_path('vendor')), null, 'pustaka PHP (composer)');
        if (is_dir(base_path('node_modules'))) {
            $bagian[] = $this->butir('node_modules', $this->ukuranFolder(base_path('node_modules')), null, 'pustaka JavaScript (npm), dipakai saat build');
        }
        $bagian[] = $this->butir('public/build', $this->ukuranFolder(public_path('build')), null, 'hasil build tampilan');
        $bagian[] = $this->butir('.git', $this->ukuranFolder(base_path('.git')), null, 'riwayat versi kode');
        usort($bagian, fn ($a, $b) => $b['ukuran'] <=> $a['ukuran']);

        return [
            'kode' => 'kode',
            'judul' => 'Kode program dan pustaka',
            'keterangan' => 'Aplikasi MR Kabar dan ERPIKA berikut pustakanya. Berubah hanya lewat deploy dari GitHub.',
            'ukuran' => array_sum(array_column($bagian, 'ukuran')),
            'jumlah' => count($bagian),
            'aman' => false,
            'butir' => $bagian,
        ];
    }

    private function kelompokBasisData(): array
    {
        $butir = [];
        try {
            $baris = DB::select(
                'SELECT table_name AS nama, (data_length + index_length) AS ukuran, table_rows AS baris
                 FROM information_schema.tables WHERE table_schema = ? ORDER BY ukuran DESC',
                [DB::getDatabaseName()]
            );
            foreach ($baris as $b) {
                $butir[] = $this->butir($b->nama, (float) $b->ukuran, null, number_format((int) $b->baris, 0, ',', '.').' baris');
            }
        } catch (\Throwable) {
            // Selain MySQL (mis. SQLite saat uji): ukuran basis data tidak terbaca.
        }

        return [
            'kode' => 'basis_data',
            'judul' => 'Basis data MySQL',
            'keterangan' => 'Seluruh isian MR Kabar dan ERPIKA. Ukuran data + indeks per tabel.',
            'ukuran' => array_sum(array_column($butir, 'ukuran')),
            'jumlah' => count($butir),
            'aman' => false,
            'butir' => array_slice($butir, 0, 40),
        ];
    }

    private function kelompokVideoBawaan(): array
    {
        $butir = $this->daftarBerkas(public_path('video'), true, 'video');

        return [
            'kode' => 'video',
            'judul' => 'Video edukasi dan tutorial bawaan',
            'keterangan' => 'Bagian dari kode (Git LFS); dipasang ulang otomatis saat deploy.',
            'ukuran' => array_sum(array_column($butir, 'ukuran')),
            'jumlah' => count($butir),
            'aman' => false,
            'butir' => $butir,
        ];
    }

    private function kelompokSettingApp(): array
    {
        $butir = $this->daftarBerkas(storage_path('app/public'), true, 'setting');

        return [
            'kode' => 'setting',
            'judul' => 'Berkas Setting App (logo, favicon, video unggahan)',
            'keterangan' => 'Ganti atau hapus lewat Settings > Setting App supaya pengaturannya ikut diperbarui.',
            'ukuran' => array_sum(array_column($butir, 'ukuran')),
            'jumlah' => count($butir),
            'aman' => false,
            'butir' => $butir,
        ];
    }

    private function kelompokArsip(): array
    {
        $butir = [];
        foreach ($this->daftarBerkas(storage_path('app/private/audit'), false, 'audit') as $b) {
            $b['keterangan'] = 'arsip log audit bulanan';
            $butir[] = $b;
        }
        foreach ($this->daftarBerkas(storage_path('app/private/risk-excel-imports'), false, 'impor') as $b) {
            $b['keterangan'] = 'berkas impor Excel yang menunggu persetujuan';
            $butir[] = $b;
        }

        return [
            'kode' => 'arsip',
            'judul' => 'Arsip log audit dan impor Excel menunggu',
            'keterangan' => 'Arsip audit adalah jejak permanen; berkas impor dihapus sendiri setelah disetujui atau ditolak.',
            'ukuran' => array_sum(array_column($butir, 'ukuran')),
            'jumlah' => count($butir),
            'aman' => false,
            'butir' => $butir,
        ];
    }

    private function kelompokCadanganCron(): array
    {
        $folder = KesehatanServerService::FOLDER_CRON;
        $butir = is_dir($folder) && is_readable($folder) ? $this->daftarBerkas($folder, false, 'cron') : [];

        return [
            'kode' => 'cadangan_cron',
            'judul' => 'Cadangan harian cron root (/var/backups/mrkabar)',
            'keterangan' => 'Dibuat dan dirotasi oleh cron root, terkunci AES-256, disalin ke Google Drive. Tidak bisa dihapus dari aplikasi.',
            'ukuran' => array_sum(array_column($butir, 'ukuran')),
            'jumlah' => is_dir($folder) ? count($butir) : null,
            'aman' => false,
            'butir' => $butir,
        ];
    }

    // ── kelompok yang aman dihapus ──────────────────────────────────────

    private function kelompokFileManager(): array
    {
        $butir = [];
        $media = Media::query()->where('collection_name', 'files')->orderByDesc('size')->get();
        foreach ($media as $m) {
            $pemilik = $m->model_type === User::class ? optional(User::find($m->model_id))->name : null;
            $butir[] = $this->butir($m->file_name, (float) $m->size, $m->created_at?->toDateTimeString(),
                'milik '.($pemilik ?? '?'), 'media', (string) $m->id);
        }

        return [
            'kode' => 'file_manager',
            'judul' => 'Unggahan File Manager',
            'keterangan' => 'Berkas yang diunggah pengguna di Utilities > File Manager. Menghapus di sini sama dengan menghapus dari File Manager.',
            'ukuran' => array_sum(array_column($butir, 'ukuran')),
            'jumlah' => count($butir),
            'aman' => true,
            'butir' => $butir,
        ];
    }

    private function kelompokBukti(): array
    {
        $butir = [];
        $media = Media::query()->where('collection_name', 'bukti')->orderByDesc('size')->get();
        foreach ($media as $m) {
            $tiket = null;
            if ($m->model_type === LaporanKejadianRisiko::class) {
                $tiket = 'Kejadian Risiko #'.$m->model_id;
            } elseif ($m->model_type === LaporanKecurangan::class) {
                $tiket = 'Dugaan Kecurangan '.(optional(LaporanKecurangan::find($m->model_id))->nomor_tiket ?? '#'.$m->model_id);
            }
            $butir[] = $this->butir($m->file_name, (float) $m->size, $m->created_at?->toDateTimeString(), $tiket ?? 'laporan', 'media', (string) $m->id);
        }

        return [
            'kode' => 'bukti',
            'judul' => 'Bukti laporan (Lapor Kejadian Risiko dan Dugaan Kecurangan)',
            'keterangan' => 'Lampiran pelapor. Laporannya sendiri tetap ada; hanya lampirannya yang hilang.',
            'ukuran' => array_sum(array_column($butir, 'ukuran')),
            'jumlah' => count($butir),
            'aman' => true,
            'butir' => $butir,
        ];
    }

    private function kelompokCadangan(): array
    {
        $folder = $this->cadangan->folderCadangan();
        $berkas = is_dir($folder) ? File::files($folder) : [];
        usort($berkas, fn ($a, $b) => $b->getMTime() <=> $a->getMTime());
        $butir = [];
        foreach ($berkas as $i => $f) {
            if ($f->getExtension() !== 'zip') {
                continue;
            }
            // Cadangan terbaru selalu dipertahankan: itulah yang dipakai
            // pemulihan darurat dan pemeriksaan kesehatan server.
            $terbaru = $i === 0;
            $butir[] = $this->butir($f->getFilename(), (float) $f->getSize(), date('Y-m-d H:i:s', $f->getMTime()),
                $terbaru ? 'terbaru — dipertahankan' : '', $terbaru ? null : 'cadangan', $terbaru ? null : $f->getFilename());
        }

        return [
            'kode' => 'cadangan',
            'judul' => 'Cadangan basis data dari halaman Backup',
            'keterangan' => 'Zip cadangan yang dibuat tombol Backup dan sebelum deploy. Yang terbaru tidak bisa dihapus.',
            'ukuran' => array_sum(array_column($butir, 'ukuran')),
            'jumlah' => count($butir),
            'aman' => true,
            'butir' => $butir,
        ];
    }

    private function kelompokLog(): array
    {
        $butir = [];
        foreach (is_dir(storage_path('logs')) ? File::files(storage_path('logs')) : [] as $f) {
            // Log hari ini masih ditulis PHP; menghapusnya di tengah jalan
            // membuat baris berikutnya hilang sampai berkas dibuat ulang.
            $hariIni = date('Y-m-d', $f->getMTime()) === date('Y-m-d');
            $butir[] = $this->butir($f->getFilename(), (float) $f->getSize(), date('Y-m-d H:i:s', $f->getMTime()),
                $hariIni ? 'sedang ditulis — dipertahankan' : '', $hariIni ? null : 'log', $hariIni ? null : $f->getFilename());
        }
        usort($butir, fn ($a, $b) => $b['ukuran'] <=> $a['ukuran']);

        return [
            'kode' => 'log',
            'judul' => 'Log aplikasi',
            'keterangan' => 'Catatan kesalahan dan jadwal harian (storage/logs). Yang lama aman dihapus; log audit di basis data tidak terpengaruh.',
            'ukuran' => array_sum(array_column($butir, 'ukuran')),
            'jumlah' => count($butir),
            'aman' => true,
            'butir' => $butir,
        ];
    }

    private function kelompokCache(): array
    {
        $bagian = [];
        foreach (['framework/cache' => 'cache aplikasi', 'framework/views' => 'tampilan terkompilasi', 'framework/sessions' => 'sesi login'] as $d => $ket) {
            $bagian[] = $this->butir($d, $this->ukuranFolder(storage_path($d)), null, $ket);
        }

        return [
            'kode' => 'cache',
            'judul' => 'Cache dan berkas kerja Laravel',
            'keterangan' => 'Dibuat ulang otomatis. Tombol "Bersihkan cache" mengosongkannya; ringkasan dashboard dihitung ulang saat dibuka.',
            'ukuran' => array_sum(array_column($bagian, 'ukuran')),
            'jumlah' => null,
            'aman' => true,
            'butir' => $bagian,
        ];
    }

    private function kelompokSementara(): array
    {
        $butir = [];
        $root = storage_path('app');
        foreach (File::files($root) as $f) {
            $butir[] = $this->butir($f->getFilename(), (float) $f->getSize(), date('Y-m-d H:i:s', $f->getMTime()), 'berkas lepas di storage/app', 'sementara', $f->getFilename());
        }
        foreach (['backup-temp', 'rpjmd_pages'] as $d) {
            if (is_dir($root.'/'.$d)) {
                $butir[] = $this->butir($d.'/', $this->ukuranFolder($root.'/'.$d), null, 'folder kerja sementara', 'sementara', $d);
            }
        }
        // Folder media-library yang sudah tidak punya baris media (sisa unggahan
        // yang gagal atau dihapus di luar aplikasi) juga dianggap sementara.
        $privat = storage_path('app/private');
        if (is_dir($privat)) {
            $adaMedia = Media::query()->pluck('id')->map(fn ($id) => (string) $id)->flip();
            foreach (File::directories($privat) as $dir) {
                $nama = basename($dir);
                if (ctype_digit($nama) && ! isset($adaMedia[$nama])) {
                    $butir[] = $this->butir('private/'.$nama.'/', $this->ukuranFolder($dir), null, 'folder media yatim (tanpa catatan di basis data)', 'sementara', 'private/'.$nama);
                }
            }
        }

        return [
            'kode' => 'sementara',
            'judul' => 'Berkas sementara dan sisa',
            'keterangan' => 'Berkas lepas di storage/app, folder kerja, dan folder unggahan yang catatannya sudah tidak ada.',
            'ukuran' => array_sum(array_column($butir, 'ukuran')),
            'jumlah' => count($butir),
            'aman' => true,
            'butir' => $butir,
        ];
    }

    // ── penghapusan ─────────────────────────────────────────────────────

    /**
     * Hapus satu butir. Jenis dan id harus persis yang dikeluarkan potret();
     * setiap jalur diperiksa ulang supaya tidak bisa keluar dari foldernya.
     */
    public function hapus(string $jenis, string $id): string
    {
        $hasil = match ($jenis) {
            'media' => $this->hapusMedia($id),
            'cadangan' => $this->hapusBerkas($this->cadangan->folderCadangan(), $id, fn ($f) => str_ends_with($f, '.zip') && $f !== basename((string) $this->cadangan->berkasTerbaru())),
            'log' => $this->hapusBerkas(storage_path('logs'), $id, fn ($f, $jalur) => date('Y-m-d', filemtime($jalur)) !== date('Y-m-d')),
            'sementara' => $this->hapusSementara($id),
            default => throw new \InvalidArgumentException('Jenis tidak dikenal.'),
        };
        Cache::forget(self::CACHE);

        return $hasil;
    }

    public function bersihkanCache(): void
    {
        foreach (['framework/cache/data', 'framework/views'] as $d) {
            $jalur = storage_path($d);
            if (is_dir($jalur)) {
                foreach (File::allFiles($jalur) as $f) {
                    if ($f->getFilename() !== '.gitignore') {
                        @unlink($f->getPathname());
                    }
                }
            }
        }
        Cache::flush();
    }

    private function hapusMedia(string $id): string
    {
        $m = Media::query()->whereIn('collection_name', ['files', 'bukti'])->find((int) $id);
        if (! $m) {
            throw new \RuntimeException('Berkas tidak ditemukan atau bukan jenis yang boleh dihapus.');
        }
        $nama = $m->file_name;
        $m->delete();

        return $nama;
    }

    private function hapusBerkas(string $folder, string $nama, callable $boleh): string
    {
        $nama = basename($nama);
        $jalur = $folder.'/'.$nama;
        if ($nama === '' || $nama[0] === '.' || ! is_file($jalur) || ! $boleh($nama, $jalur)) {
            throw new \RuntimeException('Berkas tidak ditemukan atau tidak boleh dihapus.');
        }
        unlink($jalur);

        return $nama;
    }

    private function hapusSementara(string $id): string
    {
        $root = realpath(storage_path('app'));
        $jalur = realpath($root.'/'.$id);
        if ($root === false || $jalur === false || ! str_starts_with($jalur, $root.DIRECTORY_SEPARATOR)) {
            throw new \RuntimeException('Jalur tidak sah.');
        }
        $relatif = str_replace('\\', '/', substr($jalur, strlen($root) + 1));
        $bolehFolder = in_array($relatif, ['backup-temp', 'rpjmd_pages'], true)
            || (preg_match('#^private/(\d+)$#', $relatif, $m) && ! Media::query()->whereKey((int) $m[1])->exists());
        if (is_dir($jalur)) {
            if (! $bolehFolder) {
                throw new \RuntimeException('Folder ini tidak boleh dihapus dari sini.');
            }
            File::deleteDirectory($jalur);
        } elseif (! str_contains($relatif, '/')) {
            unlink($jalur);
        } else {
            throw new \RuntimeException('Berkas ini tidak boleh dihapus dari sini.');
        }

        return $relatif;
    }

    // ── util ────────────────────────────────────────────────────────────

    private function butir(string $nama, float $ukuran, ?string $tanggal, string $keterangan, ?string $jenis = null, ?string $id = null): array
    {
        return ['nama' => $nama, 'ukuran' => $ukuran, 'tanggal' => $tanggal, 'keterangan' => $keterangan, 'jenis' => $jenis, 'id' => $id];
    }

    /** @return list<array<string, mixed>> */
    private function daftarBerkas(string $folder, bool $rekursif, string $label): array
    {
        if (! is_dir($folder)) {
            return [];
        }
        $butir = [];
        foreach ($rekursif ? File::allFiles($folder) : File::files($folder) as $f) {
            $butir[] = $this->butir(str_replace('\\', '/', $f->getRelativePathname()), (float) $f->getSize(), date('Y-m-d H:i:s', $f->getMTime()), '');
        }
        usort($butir, fn ($a, $b) => $b['ukuran'] <=> $a['ukuran']);

        return $butir;
    }

    /** Ukuran folder: `du` di Linux (jauh lebih cepat untuk vendor/node_modules), iterator PHP di tempat lain. */
    private function ukuranFolder(string $jalur): float
    {
        if (! is_dir($jalur)) {
            return 0;
        }
        if (PHP_OS_FAMILY === 'Linux') {
            try {
                $hasil = Process::timeout(120)->run(['du', '-sb', $jalur]);
                if ($hasil->successful() && preg_match('/^(\d+)/', $hasil->output(), $m)) {
                    return (float) $m[1];
                }
            } catch (\Throwable) {
                // jatuh ke iterator
            }
        }
        $total = 0;
        try {
            $it = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($jalur, \FilesystemIterator::SKIP_DOTS), \RecursiveIteratorIterator::LEAVES_ONLY, \RecursiveIteratorIterator::CATCH_GET_CHILD);
            foreach ($it as $f) {
                if ($f->isFile()) {
                    $total += $f->getSize();
                }
            }
        } catch (\Throwable) {
            // folder tak terbaca: hitung sebisanya
        }

        return (float) $total;
    }
}
