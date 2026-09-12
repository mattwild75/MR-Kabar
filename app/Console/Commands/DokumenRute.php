<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

/**
 * Tulis docs/RUTE.md: seluruh rute aplikasi (metode, URI, nama, penangan,
 * middleware) dari pendaftaran rute yang sebenarnya — dokumentasi yang tidak
 * bisa basi karena dihasilkan ulang, bukan ditulis tangan.
 */
class DokumenRute extends Command
{
    protected $signature = 'rute:dokumen';

    protected $description = 'Hasilkan docs/RUTE.md dari daftar rute aplikasi';

    public function handle(): int
    {
        $awalan = 'App\\Http\\Controllers\\';
        $baris = [];
        foreach (Route::getRoutes() as $r) {
            $uri = $r->uri();
            if (str_starts_with($uri, '_') || str_starts_with($uri, 'sanctum') || str_starts_with($uri, 'storage/')) {
                continue;
            }
            $metode = implode('|', array_values(array_diff($r->methods(), ['HEAD'])));
            $aksi = str_replace($awalan, '', $r->getActionName());
            $mw = collect($r->gatherMiddleware())->map(fn ($m) => str_contains($m, '\\') ? class_basename($m) : $m)->unique()->implode(', ');
            $baris[$uri.' '.$metode] = '| '.$metode.' | `'.$uri.'` | '.($r->getName() ?? '').' | `'.$aksi.'` | '.$mw.' |';
        }
        ksort($baris);
        $isi = "# Daftar Rute MR Kabar\n\nDihasilkan otomatis dari pendaftaran rute (".now()->format('Y-m-d').', '.count($baris).' rute). '
            ."Jangan disunting tangan; jalankan `php artisan rute:dokumen` untuk memperbarui.\n\n"
            ."| Metode | URI | Nama | Penangan | Middleware |\n|---|---|---|---|---|\n".implode("\n", $baris)."\n";
        File::put(base_path('docs/RUTE.md'), $isi);
        $this->info(count($baris).' rute ditulis ke docs/RUTE.md');

        return self::SUCCESS;
    }
}
