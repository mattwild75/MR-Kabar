<?php

namespace App\Services;

use App\Models\CadanganDrive;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;

/**
 * Potret kesehatan server yang dibaca halaman Backup dan laporan mingguan:
 * ruang disk, umur sertifikat HTTPS, detak penjadwal, umur cadangan (cron
 * root dan halaman Backup), unggahan Google Drive terakhir, deploy terakhir,
 * dan hasil uji pemulihan terakhir. Tiap butir punya tiga keadaan:
 * baik / perhatian / bahaya, supaya "belum pernah diperiksa" tidak terbaca
 * sebagai "aman". Tidak menulis apa pun kecuali cache.
 */
class KesehatanServerService
{
    public const FOLDER_CRON = '/var/backups/mrkabar';

    public function __construct(private readonly CadanganService $cadangan) {}

    /** @return array{butir: list<array{kode:string,judul:string,status:string,nilai:string,keterangan:string}>, terburuk:string, diperiksa_pada:string} */
    public function potret(): array
    {
        $butir = [
            $this->disk(),
            $this->sertifikat(),
            $this->penjadwal(),
            $this->cadanganCron(),
            $this->cadanganAplikasi(),
            $this->drive(),
            $this->deploy(),
            $this->ujiPemulihan(),
            $this->umurKunci(),
        ];
        $urut = ['bahaya' => 3, 'perhatian' => 2, 'baik' => 1, 'tidak_berlaku' => 0];
        $terburuk = 'baik';
        foreach ($butir as $b) {
            if ($urut[$b['status']] > $urut[$terburuk]) {
                $terburuk = $b['status'];
            }
        }

        return ['butir' => $butir, 'terburuk' => $terburuk, 'diperiksa_pada' => now()->toDateTimeString()];
    }

    private function butir(string $kode, string $judul, string $status, string $nilai, string $keterangan = ''): array
    {
        return compact('kode', 'judul', 'status', 'nilai', 'keterangan');
    }

    private function disk(): array
    {
        $jalur = base_path();
        $bebas = @disk_free_space($jalur);
        $total = @disk_total_space($jalur);
        if (! $bebas || ! $total) {
            return $this->butir('disk', 'Ruang disk', 'perhatian', 'tidak terbaca');
        }
        $persen = (int) round($bebas / $total * 100);
        $gb = round($bebas / 1024 ** 3, 1);
        $status = $persen < 10 ? 'bahaya' : ($persen < 20 ? 'perhatian' : 'baik');

        return $this->butir('disk', 'Ruang disk', $status, "{$gb} GB bebas ({$persen}%)",
            $status === 'baik' ? '' : 'Cadangan harian dan build gagal bila disk penuh. Hapus cadangan lama atau minta penambahan disk.');
    }

    private function sertifikat(): array
    {
        $host = parse_url(config('app.url'), PHP_URL_HOST);
        if (! $host || app()->environment('local') || str_ends_with($host, '.test')) {
            return $this->butir('ssl', 'Sertifikat HTTPS', 'tidak_berlaku', 'lokal');
        }
        $info = Cache::remember('kesehatan_ssl_'.$host, 3600, function () use ($host) {
            try {
                $ctx = stream_context_create(['ssl' => ['capture_peer_cert' => true, 'verify_peer' => false, 'verify_peer_name' => false]]);
                $sock = @stream_socket_client("ssl://{$host}:443", $errno, $errstr, 8, STREAM_CLIENT_CONNECT, $ctx);
                if (! $sock) {
                    return null;
                }
                $cert = stream_context_get_params($sock)['options']['ssl']['peer_certificate'] ?? null;
                fclose($sock);
                $x = $cert ? openssl_x509_parse($cert) : null;

                return $x ? ['sampai' => (int) $x['validTo_time_t']] : null;
            } catch (\Throwable) {
                return null;
            }
        });
        if (! $info) {
            return $this->butir('ssl', 'Sertifikat HTTPS', 'perhatian', 'tidak terbaca', 'Server tidak bisa memeriksa sertifikatnya sendiri.');
        }
        $sisa = (int) floor(($info['sampai'] - time()) / 86400);
        $status = $sisa < 7 ? 'bahaya' : ($sisa < 21 ? 'perhatian' : 'baik');

        return $this->butir('ssl', 'Sertifikat HTTPS', $status, "berlaku {$sisa} hari lagi",
            $status === 'baik' ? '' : 'Let\'s Encrypt seharusnya memperbarui sendiri 30 hari sebelum habis. Jalankan: certbot renew');
    }

    private function penjadwal(): array
    {
        $detak = Cache::get('penjadwal_detak_terakhir');
        if (! $detak) {
            return $this->butir('cron', 'Penjadwal tugas', 'bahaya', 'belum pernah berdetak', 'cron schedule:run tidak berjalan.');
        }
        $menit = (int) floor((now()->timestamp - $detak) / 60);

        return $this->butir('cron', 'Penjadwal tugas', $menit > 10 ? 'bahaya' : 'baik', "detak {$menit} menit lalu",
            $menit > 10 ? 'Cadangan Drive, pembersihan log, dan pemeriksaan mingguan ikut berhenti.' : '');
    }

    private function cadanganCron(): array
    {
        if (PHP_OS_FAMILY === 'Windows' || ! is_dir(self::FOLDER_CRON)) {
            return $this->butir('cadangan_cron', 'Cadangan harian (cron)', 'tidak_berlaku', 'bukan server produksi');
        }
        $terbaru = collect(File::files(self::FOLDER_CRON))
            ->filter(fn ($f) => str_starts_with($f->getFilename(), 'db-'))
            ->sortByDesc(fn ($f) => $f->getMTime())->first();
        if (! $terbaru) {
            return $this->butir('cadangan_cron', 'Cadangan harian (cron)', 'bahaya', 'tidak ada berkas', 'Skrip backup-mrkabar.sh belum pernah menghasilkan cadangan.');
        }
        $jam = (int) floor((time() - $terbaru->getMTime()) / 3600);
        $terkunci = str_ends_with($terbaru->getFilename(), '.enc');
        $status = $jam > 48 ? 'bahaya' : ($jam > 26 ? 'perhatian' : 'baik');
        if (! $terkunci) {
            $status = 'perhatian';
        }

        return $this->butir('cadangan_cron', 'Cadangan harian (cron)', $status, $terbaru->getFilename().' ('.$jam.' jam lalu)',
            $terkunci ? ($status === 'baik' ? '' : 'Cadangan terakhir sudah tua; periksa /var/log/backup-mrkabar.log.') : 'Cadangan terakhir TIDAK terkunci.');
    }

    private function cadanganAplikasi(): array
    {
        $folder = $this->cadangan->folderCadangan();
        $terbaru = is_dir($folder) ? collect(File::files($folder))->sortByDesc(fn ($f) => $f->getMTime())->first() : null;
        if (! $terbaru) {
            return $this->butir('cadangan_app', 'Cadangan halaman Backup', 'perhatian', 'belum ada', 'Buat sekali lewat tombol Create Backup.');
        }
        $hari = (int) floor((time() - $terbaru->getMTime()) / 86400);

        return $this->butir('cadangan_app', 'Cadangan halaman Backup', $hari > 14 ? 'perhatian' : 'baik', $terbaru->getFilename().' ('.$hari.' hari lalu)');
    }

    private function drive(): array
    {
        $p = CadanganDrive::query()->first();
        if (! $p || ! $p->tertaut()) {
            return $this->butir('drive', 'Google Drive', 'perhatian', 'tidak tertaut', 'Cadangan tidak pernah keluar VM secara otomatis.');
        }
        if (! $p->terakhir_unggah) {
            return $this->butir('drive', 'Google Drive', 'perhatian', 'tertaut, belum pernah unggah');
        }
        $jam = (int) floor(abs(now()->diffInMinutes(Carbon::parse($p->terakhir_unggah))) / 60);
        $gagal = str_starts_with((string) $p->terakhir_hasil, 'Gagal');
        $status = $gagal || $jam > 48 ? 'bahaya' : ($jam > 26 ? 'perhatian' : 'baik');

        return $this->butir('drive', 'Google Drive', $status, "unggah terakhir {$jam} jam lalu", $gagal ? (string) $p->terakhir_hasil : '');
    }

    private function deploy(): array
    {
        $d = Cache::get('deploy_terakhir');
        if (! $d) {
            return $this->butir('deploy', 'Deploy terakhir', 'tidak_berlaku', 'belum pernah lewat tombol');
        }

        return $this->butir('deploy', 'Deploy terakhir', $d['sukses'] ? 'baik' : 'perhatian', $d['waktu'].' oleh '.($d['oleh'] ?? '-'),
            $d['sukses'] ? '' : 'Deploy terakhir gagal atau ditolak — lihat log di kartu Deploy.');
    }

    /** Umur kunci cadangan: rotasi tahunan (docs/PEMULIHAN_RILIS.md). */
    private function umurKunci(): array
    {
        $jalur = '/etc/mrkabar/kunci-cadangan';
        if (PHP_OS_FAMILY === 'Windows' || ! @is_readable($jalur) && ! @file_exists($jalur)) {
            return $this->butir('kunci', 'Umur kunci cadangan', 'tidak_berlaku', 'bukan server produksi');
        }
        $mtime = @filemtime($jalur);
        if (! $mtime) {
            return $this->butir('kunci', 'Umur kunci cadangan', 'perhatian', 'tidak terbaca');
        }
        $hari = (int) floor((time() - $mtime) / 86400);
        $status = $hari > 400 ? 'perhatian' : 'baik';

        return $this->butir('kunci', 'Umur kunci cadangan', $status, $hari.' hari', $status === 'baik' ? '' : 'Rotasi kunci tahunan: lihat docs/PEMULIHAN_RILIS.md bagian Rotasi Kunci.');
    }

    private function ujiPemulihan(): array
    {
        $u = Cache::get('uji_pemulihan_terakhir');
        if (! $u) {
            return $this->butir('uji_pulih', 'Uji pemulihan cadangan', 'perhatian', 'belum pernah', 'Cadangan yang belum pernah dipulihkan belum terbukti berguna. Jalankan: php artisan cadangan:uji-pulih');
        }
        $hari = (int) floor((now()->timestamp - $u['waktu_ts']) / 86400);
        $status = ! $u['sukses'] ? 'bahaya' : ($hari > 45 ? 'perhatian' : 'baik');

        return $this->butir('uji_pulih', 'Uji pemulihan cadangan', $status, ($u['sukses'] ? 'berhasil' : 'GAGAL').' '.$hari.' hari lalu ('.$u['berkas'].')', $u['pesan'] ?? '');
    }
}
