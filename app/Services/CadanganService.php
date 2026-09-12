<?php

namespace App\Services;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use ZipArchive;

/**
 * Membuat dan memulihkan cadangan basis data — inti dari halaman Backup.
 *
 * Dipisahkan dari BackupController 12 September 2026 (temuan audit R-16)
 * karena kini ada dua pemanggil: halaman Backup dan pengunggah Google Drive
 * (CadanganDriveController + perintah terjadwal). Semua yang menyentuh berkas
 * zip, sandi arsip, dan PDO ada di sini; controller tinggal mengubah hasilnya
 * menjadi redirect.
 *
 * Arsip yang dihasilkan `backup:run` terkunci AES-256 bila
 * BACKUP_ARCHIVE_PASSWORD terisi (config/backup.php) — wajib di produksi,
 * karena dump-nya memuat seluruh tabel termasuk hash sandi semua pengguna.
 */
class CadanganService
{
    /**
     * Folder cadangan Spatie: 'private/<APP_NAME>'. Nama folder mengikuti
     * APP_NAME (config backup.backup.name), jadi setelah APP_NAME berubah,
     * cadangan lama tertinggal di folder nama lama.
     */
    public function folderCadangan(): string
    {
        return storage_path('app/private/'.config('backup.backup.name', 'Laravel'));
    }

    /**
     * Dump basis data (hanya DB, tanpa berkas) lalu sisakan satu berkas
     * terbaru. Mengembalikan jalur zip yang baru dibuat.
     */
    public function buatCadanganDb(): string
    {
        Artisan::call('backup:run', ['--only-db' => true]);
        $this->simpanHanyaTerbaru();

        $terbaru = $this->berkasTerbaru();
        if ($terbaru === null) {
            throw new \RuntimeException('backup:run selesai tetapi tidak ada berkas zip di '.$this->folderCadangan());
        }

        return $terbaru;
    }

    /** Jalur zip cadangan paling baru, null bila belum ada. */
    public function berkasTerbaru(): ?string
    {
        $folder = $this->folderCadangan();
        if (! File::exists($folder)) {
            return null;
        }

        $zip = collect(File::files($folder))
            ->filter(fn ($file) => $file->getExtension() === 'zip')
            ->sortByDesc(fn ($file) => $file->getMTime())
            ->first();

        return $zip?->getPathname();
    }

    /** Arsip zip yang dibuat sekarang terkunci sandi atau tidak. */
    public function arsipTerkunci(): bool
    {
        return filled(config('backup.backup.password'));
    }

    /**
     * Kunci bersama untuk SEMUA aksi yang menulis ke folder backup dan/atau
     * working directory git (run/gitPush/gitPull/importDatabase/unggah ke Drive) — tanpa
     * ini, dua super-admin yang mengklik aksi berbeda hampir bersamaan bisa
     * saling menghapus snapshot penyelamat satu sama lain lewat
     * keepOnlyLatestBackup() (dipanggil dari 3 method berbeda), atau
     * menjalankan restore PDO paralel yang saling bentrok DROP/CREATE TABLE
     * pada tabel yang sama. Timeout 10 menit cukup longgar utk backup+push
     * database besar sambil tetap mencegah lock macet permanen kalau
     * request sebelumnya crash tanpa sempat release.
     */
    public function denganKunci(callable $callback)
    {
        $lock = Cache::lock('backup-operation-lock', 600);

        if (! $lock->get()) {
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
    public function simpanHanyaTerbaru(): void
    {
        $realPath = $this->folderCadangan();
        if (! File::exists($realPath)) {
            return;
        }

        $zips = collect(File::files($realPath))
            ->filter(fn ($file) => $file->getExtension() === 'zip')
            ->sortByDesc(fn ($file) => $file->getMTime())
            ->values();

        $zips->skip(1)->each(fn ($file) => File::delete($file->getPathname()));
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
    public function sqlDariZip(string $zipPath): string
    {
        $zip = new ZipArchive;
        if ($zip->open($zipPath) !== true) {
            throw new \RuntimeException('File zip tidak valid atau rusak.');
        }

        // Cadangan yang dibuat sejak 12 September 2026 terkunci AES-256
        // (BACKUP_ARCHIVE_PASSWORD). Tanpa sandi ini getFromName() mengembalikan
        // false — bukan galat yang jelas. Zip lama tanpa kunci tidak terganggu.
        if (filled(config('backup.backup.password'))) {
            $zip->setPassword((string) config('backup.backup.password'));
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
            throw new \RuntimeException(
                'Gagal membaca isi dump SQL dari zip'
                .(filled(config('backup.backup.password')) ? ' — bila zip ini terkunci, pastikan BACKUP_ARCHIVE_PASSWORD sama dengan saat cadangan dibuat.' : '.')
            );
        }

        return $sqlContent;
    }

    /**
     * Timpa seluruh database dengan isi satu dump SQL, didahului backup
     * pengaman atas keadaan sekarang.
     *
     * WAJIB dipanggil dari dalam denganKunci().
     *
     * @return array{sukses: bool, pesan: string}
     */
    public function timpaDatabaseDariSql(string $sqlContent, string $namaSumber): array
    {
        // Safety net: backup kondisi SEKARANG dulu sebelum ditimpa — kalau
        // gagal, batalkan sepenuhnya (sama prinsipnya dengan urutan di
        // gitPush()).
        try {
            $this->buatCadanganDb();
        } catch (\Throwable $e) {
            return ['sukses' => false, 'pesan' => 'Backup pengaman sebelum menimpa database gagal, proses dibatalkan: '.$e->getMessage()];
        }

        $tmpSqlPath = storage_path('app/private/import-'.uniqid().'.sql');
        File::put($tmpSqlPath, $sqlContent);

        try {
            $failedStatements = $this->restoreFromSqlFile($tmpSqlPath);
        } catch (\Throwable $e) {
            return ['sukses' => false, 'pesan' => 'Pemulihan database gagal total: '.$e->getMessage().' — database mungkin dalam kondisi tidak konsisten. '
                .'SEGERA pulihkan dari backup pengaman di daftar backup (dibuat tepat sebelum proses ini).'];
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
            if (! Schema::hasTable($table)) {
                $missingTables[] = $table;
            }
        }

        if (! empty($missingTables) || DB::table('users')->count() === 0) {
            return ['sukses' => false, 'pesan' => 'Pemulihan selesai TAPI database hasilnya tampak tidak lengkap (tabel inti kosong/hilang: '
                .(empty($missingTables) ? 'users' : implode(', ', $missingTables))
                .'). Kemungkinan ada statement SQL yang gagal di tengah proses. '
                .'SEGERA pulihkan dari backup pengaman di daftar backup (dibuat tepat sebelum proses ini) via menu Import lagi.'];
        }

        $message = 'Database berhasil dipulihkan dari '.$namaSumber.'. Backup kondisi sebelumnya tersimpan di daftar backup.';
        if ($failedStatements > 0) {
            $message .= " Peringatan: {$failedStatements} statement SQL dilewati karena error (lihat log) — periksa data hasil pemulihan.";
        }

        return ['sukses' => true, 'pesan' => $message];
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
        $statements = $this->tanpaPerpindahanBasisData($this->splitSqlStatements($sql));

        $pdo = DB::connection()->getPdo();
        $pdo->exec('SET FOREIGN_KEY_CHECKS=0');

        $failed = 0;
        try {
            foreach ($statements as $statement) {
                try {
                    $pdo->exec($statement);
                } catch (\Throwable $e) {
                    $failed++;
                    Log::error('CadanganService::restoreFromSqlFile — statement gagal', [
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
    /**
     * Membuang pernyataan yang MEMINDAHKAN sasaran pemulihan.
     *
     * `mysqldump --databases` menyisipkan `USE \`mrkabar\`;` dan
     * `CREATE DATABASE ...` ke dalam dumpnya. Keduanya dijalankan apa adanya
     * oleh PDO, dan `USE` MEMINDAHKAN koneksi ke basis data yang namanya
     * tertulis di dalam berkas — bukan basis data yang sedang dipakai
     * aplikasi ini.
     *
     * Selama aplikasinya cuma satu, akibatnya tidak terasa: namanya kebetulan
     * sama. Yang berbahaya adalah pemasangan kedua — salinan uji coba atau
     * staging yang menunjuk basis data lain. Mengimpor cadangan produksi di
     * sana akan menimpa PRODUKSI, dari dalam aplikasi, lewat tombol yang
     * tampak aman. Persis kejadian yang menghapus 914 baris pada 17 Agustus
     * 2026 lewat baris perintah; jalur tombol Impor masih terbuka sesudahnya.
     *
     * Penyaringnya di sini, bukan di splitSqlStatements(), supaya pemecahan
     * pernyataan tetap satu-satunya urusan berkas itu.
     *
     * @param  array<int, string>  $statements
     * @return array<int, string>
     */
    public function tanpaPerpindahanBasisData(array $statements): array
    {
        return array_values(array_filter(
            $statements,
            fn (string $s) => ! preg_match(
                '/^(USE\s|CREATE\s+DATABASE\b|CREATE\s+SCHEMA\b)/i',
                $this->tanpaKomentarDepan($s),
            ),
        ));
    }

    /**
     * Membuang komentar dan spasi di depan sebuah pernyataan SQL.
     *
     * Dump sungguhan menaruh blok komentar tepat sebelum pernyataannya:
     *
     *     --
     *     -- Current Database: `mrkabar`
     *     --
     *
     *     USE `mrkabar`
     *
     * Tanpa dibuang lebih dulu, pemeriksaan "apakah pernyataan ini diawali
     * USE" akan melihat tanda hubung, bukan kata USE-nya. Ditulis sebagai
     * perulangan biasa, bukan satu regex besar: yang dicari cuma awalannya,
     * dan regex yang harus mengurus dua bentuk komentar sekaligus lebih mudah
     * salah daripada dibaca.
     */
    private function tanpaKomentarDepan(string $s): string
    {
        $sisa = ltrim($s);

        while ($sisa !== '') {
            if (str_starts_with($sisa, '--')) {
                $akhir = strpos($sisa, "\n");
                $sisa = $akhir === false ? '' : ltrim(substr($sisa, $akhir + 1));

                continue;
            }

            if (str_starts_with($sisa, '/*')) {
                $akhir = strpos($sisa, '*/');
                $sisa = $akhir === false ? '' : ltrim(substr($sisa, $akhir + 2));

                continue;
            }

            break;
        }

        return $sisa;
    }

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
                if ($trimmed !== '' && ! str_starts_with($trimmed, '--')) {
                    $statements[] = $trimmed;
                }
                $current = '';

                continue;
            }

            $current .= $char;
        }

        $trimmed = trim($current);
        if ($trimmed !== '' && ! str_starts_with($trimmed, '--')) {
            $statements[] = $trimmed;
        }

        return $statements;
    }
}
