<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

/**
 * Ekspor seluruh tabel ERPIKA ke satu berkas SQL (siap dimuat di
 * erpika.acehbaratkab.go.id kelak). Tabel-tabel ini berdiri sendiri: tidak
 * ada kunci asing ke tabel MR Kabar kecuali kolom user_id pada rpps yang
 * hanya menyimpan angka (dijaga pengujian ErpikaMandiriTest). Kalau ada
 * tabel ERPIKA baru, tambahkan ke daftar TABEL — pengujian akan menagihnya.
 */
class ErpikaEkspor extends Command
{
    public const TABEL = ['rpp_categories', 'employees', 'rpp_settings', 'rpps', 'rpp_penugasan', 'rpp_team_members', 'rpp_obriks', 'rpp_laporans'];

    protected $signature = 'erpika:ekspor {--tujuan= : jalur berkas .sql (bawaan: storage/app/private/erpika-<tanggal>.sql)}';

    protected $description = 'Ekspor tabel ERPIKA (RPP, penugasan, tim, obrik, laporan, pegawai, pengaturan) ke satu berkas SQL';

    public function handle(): int
    {
        $tujuan = $this->option('tujuan') ?: storage_path('app/private/erpika-'.now()->format('Ymd-His').'.sql');
        $pdo = DB::connection()->getPdo();
        $keluar = fopen($tujuan, 'w');
        fwrite($keluar, '-- Ekspor ERPIKA '.now()->toDateTimeString().' dari '.config('app.url')."\nSET FOREIGN_KEY_CHECKS=0;\n");
        $total = 0;
        foreach (self::TABEL as $t) {
            $buat = $pdo->query("SHOW CREATE TABLE `{$t}`")->fetch(\PDO::FETCH_ASSOC);
            fwrite($keluar, "DROP TABLE IF EXISTS `{$t}`;\n".$buat['Create Table'].";\n");
            $baris = $pdo->query("SELECT * FROM `{$t}`");
            $n = 0;
            while ($r = $baris->fetch(\PDO::FETCH_ASSOC)) {
                $kolom = implode('`,`', array_keys($r));
                $nilai = implode(',', array_map(fn ($v) => $v === null ? 'NULL' : $pdo->quote((string) $v), array_values($r)));
                fwrite($keluar, "INSERT INTO `{$t}` (`{$kolom}`) VALUES ({$nilai});\n");
                $n++;
            }
            $total += $n;
            $this->line(str_pad($t, 20).$n.' baris');
        }
        fwrite($keluar, "SET FOREIGN_KEY_CHECKS=1;\n");
        fclose($keluar);
        $this->info("Selesai: {$total} baris ke {$tujuan} (".round(File::size($tujuan) / 1024).' KB).');

        return self::SUCCESS;
    }
}
