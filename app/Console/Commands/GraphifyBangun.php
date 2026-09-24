<?php

namespace App\Console\Commands;

use App\Services\Graphify\GraphifyService;
use Illuminate\Console\Command;

/** Bangun ulang peta pengetahuan Graphify (Utilities > Graphify). */
class GraphifyBangun extends Command
{
    protected $signature = 'graphify:bangun';

    protected $description = 'Bangun ulang peta pengetahuan Graphify seluruh MR Kabar';

    public function handle(GraphifyService $graphify): int
    {
        $meta = $graphify->bangun();
        $this->info("Graphify: {$meta['simpul']} simpul, {$meta['relasi']} relasi, {$meta['komunitas']} komunitas ({$meta['durasi_detik']} detik).");

        return self::SUCCESS;
    }
}
