<?php

namespace App\Console\Commands;

use App\Services\CadanganDriveService;
use App\Services\CadanganService;
use App\Services\PeringatanServerService;
use Illuminate\Console\Command;

/**
 * Cadangkan basis data ke Google Drive — dijadwalkan harian di
 * routes/console.php, bisa juga dijalankan manual.
 *
 * Diam saja (kode 0) bila Drive belum ditautkan atau unggah otomatis
 * dimatikan: itu keadaan yang sah, bukan kegagalan. Kegagalan sungguhan
 * (token dicabut, internet putus) tercatat di kolom `terakhir_hasil` dan
 * terlihat di halaman Backup.
 */
class CadangkanKeDrive extends Command
{
    protected $signature = 'cadangan:drive {--paksa : Jalankan meski unggah otomatis dimatikan}';

    protected $description = 'Buat cadangan basis data dan kirim ke Google Drive yang tertaut';

    public function handle(CadanganDriveService $drive, CadanganService $cadangan): int
    {
        $p = $drive->pengaturan();

        if (! $p->tertaut()) {
            $this->line('Google Drive belum ditautkan — tidak ada yang dikirim.');

            return self::SUCCESS;
        }

        if (! $p->unggah_otomatis && ! $this->option('paksa')) {
            $this->line('Unggah otomatis dimatikan di halaman Backup — lewati.');

            return self::SUCCESS;
        }

        try {
            $hasil = $cadangan->denganKunci(fn () => $drive->cadangkanKeDrive($cadangan));
        } catch (\Throwable $e) {
            $this->error('Gagal: '.$e->getMessage());
            app(PeringatanServerService::class)->kirim('drive-gagal', 'Cadangan ke Google Drive gagal', $e->getMessage(), [], '/backup');

            return self::FAILURE;
        }

        $this->info('Terkirim: '.$hasil['nama'].' ke folder "'.$p->folder_nama.'" ('.$p->akun_email.').');

        return self::SUCCESS;
    }
}
