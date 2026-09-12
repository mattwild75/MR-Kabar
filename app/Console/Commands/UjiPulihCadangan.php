<?php

namespace App\Console\Commands;

use App\Services\CadanganService;
use App\Services\KesehatanServerService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;

/**
 * Uji pemulihan cadangan: buka cadangan terkunci terbaru dan muat ke basis
 * data UJI yang terpisah (DB_UJI_PULIH), lalu bandingkan jumlah tabel dan
 * baris dengan basis data hidup. Cadangan yang belum pernah dipulihkan
 * belum terbukti berguna — inilah buktinya, dijadwalkan bulanan.
 *
 * Pengaman: nama basis data uji WAJIB berbeda dari DB_DATABASE dan wajib
 * mengandung kata "uji"; tanpa itu perintah menolak berjalan. Tidak ada
 * satu pun pernyataan SQL yang menyentuh basis data hidup.
 */
class UjiPulihCadangan extends Command
{
    protected $signature = 'cadangan:uji-pulih {--berkas= : jalur cadangan .sql.gz.enc atau .zip; kosong = cadangan cron terbaru}';

    protected $description = 'Pulihkan cadangan terbaru ke basis data uji terpisah dan bandingkan dengan basis data hidup';

    public function handle(CadanganService $cadangan): int
    {
        $dbHidup = (string) config('database.connections.mysql.database');
        $dbUji = (string) config('database.uji_pulih', '');
        if ($dbUji === '' || $dbUji === $dbHidup || ! str_contains($dbUji, 'uji')) {
            $this->catat(false, '-', 'DB_UJI_PULIH belum disetel, atau namanya tidak mengandung "uji", atau sama dengan basis data hidup.');

            return self::FAILURE;
        }

        $berkas = $this->option('berkas') ?: $this->cadanganTerbaru();
        if (! $berkas || ! is_file($berkas)) {
            $this->catat(false, '-', 'Tidak ada berkas cadangan yang bisa diuji.');

            return self::FAILURE;
        }
        $nama = basename($berkas);
        $this->info("Menguji {$nama} ke basis data {$dbUji}");

        $sqlSementara = storage_path('app/private/uji-pulih-'.getmypid().'.sql');
        try {
            if (str_ends_with($nama, '.zip')) {
                File::put($sqlSementara, $cadangan->sqlDariZip($berkas));
            } else {
                $kunci = (string) config('backup.backup.password');
                if ($kunci === '') {
                    throw new \RuntimeException('BACKUP_ARCHIVE_PASSWORD kosong; berkas .enc tidak bisa dibuka.');
                }
                $r = Process::env(['KUNCI_UJI' => $kunci])->timeout(600)->run(
                    'openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass env:KUNCI_UJI -in '.escapeshellarg($berkas).' | gunzip > '.escapeshellarg($sqlSementara)
                );
                if (! $r->successful()) {
                    throw new \RuntimeException('Gagal membuka cadangan: '.trim($r->errorOutput()));
                }
            }

            // Muat ke basis data uji lewat koneksi terpisah yang hanya tahu
            // basis data uji — kredensial sama, database berbeda.
            config(['database.connections.uji_pulih' => array_merge(config('database.connections.mysql'), ['database' => $dbUji])]);
            DB::purge('uji_pulih');
            $pdo = DB::connection('uji_pulih')->getPdo();
            $pdo->exec('SET FOREIGN_KEY_CHECKS=0');
            foreach (DB::connection('uji_pulih')->select('SHOW TABLES') as $t) {
                $pdo->exec('DROP TABLE IF EXISTS `'.array_values((array) $t)[0].'`');
            }
            $gagal = 0;
            $jumlah = 0;
            foreach ($this->pernyataan(File::get($sqlSementara)) as $stmt) {
                if (preg_match('/^\s*(USE|CREATE\s+DATABASE|DROP\s+DATABASE)\b/i', $stmt)) {
                    continue;
                }
                $jumlah++;
                try {
                    $pdo->exec($stmt);
                } catch (\Throwable $e) {
                    $gagal++;
                }
            }
            $pdo->exec('SET FOREIGN_KEY_CHECKS=1');

            $tabelUji = $this->cacah('uji_pulih', $dbUji);
            $tabelHidup = $this->cacah('mysql', $dbHidup);
            $selisih = [];
            foreach (['users', 'tbl_irs_pd', 'tbl_iro_pd', 'rpps', 'rpp_penugasan', 'employees'] as $t) {
                if (isset($tabelUji[$t], $tabelHidup[$t]) && $tabelUji[$t] !== $tabelHidup[$t]) {
                    $selisih[] = "{$t} {$tabelUji[$t]} vs hidup {$tabelHidup[$t]}";
                }
            }
            $pesan = count($tabelUji).' tabel, '.array_sum($tabelUji).' baris dipulihkan dari '.$jumlah.' pernyataan'
                .($gagal ? ", {$gagal} pernyataan gagal" : '')
                .($selisih ? '; selisih wajar sejak cadangan dibuat: '.implode(', ', $selisih) : '; jumlah baris tabel kunci sama dengan basis data hidup');
            $sukses = $gagal === 0 && count($tabelUji) >= max(1, (int) (count($tabelHidup) * 0.9));
            $this->catat($sukses, $nama, $pesan);

            return $sukses ? self::SUCCESS : self::FAILURE;
        } catch (\Throwable $e) {
            $this->catat(false, $nama, $e->getMessage());

            return self::FAILURE;
        } finally {
            File::delete($sqlSementara);
        }
    }

    private function cadanganTerbaru(): ?string
    {
        $folder = KesehatanServerService::FOLDER_CRON;
        if (is_dir($folder)) {
            $f = collect(File::files($folder))->filter(fn ($f) => str_starts_with($f->getFilename(), 'db-'))
                ->sortByDesc(fn ($f) => $f->getMTime())->first();
            if ($f) {
                return $f->getPathname();
            }
        }
        $app = app(CadanganService::class)->folderCadangan();
        $f = is_dir($app) ? collect(File::files($app))->filter(fn ($f) => str_ends_with($f->getFilename(), '.zip'))->sortByDesc(fn ($f) => $f->getMTime())->first() : null;

        return $f?->getPathname();
    }

    /** @return array<string,int> tabel => jumlah baris */
    private function cacah(string $koneksi, string $db): array
    {
        $hasil = [];
        foreach (DB::connection($koneksi)->select('SELECT table_name t FROM information_schema.tables WHERE table_schema = ?', [$db]) as $r) {
            $hasil[$r->t] = (int) DB::connection($koneksi)->selectOne('SELECT COUNT(*) n FROM `'.$r->t.'`')->n;
        }

        return $hasil;
    }

    /** Pemisah pernyataan sadar-kutip yang sama dengan CadanganService. */
    private function pernyataan(string $sql): array
    {
        $refleksi = new \ReflectionMethod(CadanganService::class, 'splitSqlStatements');

        return $refleksi->invoke(app(CadanganService::class), $sql);
    }

    private function catat(bool $sukses, string $berkas, string $pesan): void
    {
        Cache::forever('uji_pemulihan_terakhir', ['waktu_ts' => now()->timestamp, 'waktu' => now()->toDateTimeString(), 'sukses' => $sukses, 'berkas' => $berkas, 'pesan' => $pesan]);
        $sukses ? $this->info('BERHASIL: '.$pesan) : $this->error('GAGAL: '.$pesan);
    }
}
