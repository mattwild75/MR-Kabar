<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

/**
 * Salin baris activity_log baru ke berkas bulanan
 * storage/app/private/audit/YYYY-MM.jsonl (satu JSON per baris). Tabelnya
 * sendiri dipangkas activitylog:clean sesudah 730 hari; berkas ini ikut
 * tercadangkan bersama storage/app (cron berkas-*.tar.gz.enc dan Drive)
 * sehingga jejak audit tersimpan jauh lebih lama tanpa membebani tabel.
 * Hanya menambah di ujung berkas; tidak pernah menulis ulang.
 */
class ArsipkanLogAudit extends Command
{
    protected $signature = 'audit:arsip';

    protected $description = 'Arsipkan baris activity_log baru ke berkas bulanan di storage/app/private/audit';

    public function handle(): int
    {
        $folder = storage_path('app/private/audit');
        File::ensureDirectoryExists($folder);
        $terakhir = (int) Cache::get('audit_arsip_id_terakhir', 0);
        $jumlah = 0;
        DB::table('activity_log')->where('id', '>', $terakhir)->orderBy('id')->chunk(500, function ($baris) use ($folder, &$terakhir, &$jumlah) {
            $perBulan = [];
            foreach ($baris as $b) {
                $perBulan[substr((string) $b->created_at, 0, 7)][] = json_encode($b, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                $terakhir = max($terakhir, (int) $b->id);
                $jumlah++;
            }
            foreach ($perBulan as $bulan => $daftar) {
                File::append($folder.'/'.$bulan.'.jsonl', implode(PHP_EOL, $daftar).PHP_EOL);
            }
        });
        Cache::forever('audit_arsip_id_terakhir', $terakhir);
        $this->info("{$jumlah} baris diarsipkan (id terakhir {$terakhir}).");

        return self::SUCCESS;
    }
}
