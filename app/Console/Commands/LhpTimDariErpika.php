<?php

namespace App\Console\Commands;

use App\Models\Lhp;
use App\Models\RppPenugasan;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Isi susunan tim pemeriksa LHP dari data ERPIKA (RPP/penugasan) dengan
 * mencocokkan Nomor Surat Tugas. Ini penyalinan sekali jalan (snapshot):
 * nama & jabatan disalin ke lhp_tim, TANPA kunci asing ke tabel RPP — modul
 * Database LHP tetap berdiri sendiri. Hanya LHP yang nomor ST-nya cocok yang
 * terisi; LHP lama (format ST berbeda, tidak ada di ERPIKA) dilewati.
 *
 *   php artisan lhp:tim-erpika [--ganti]
 */
class LhpTimDariErpika extends Command
{
    protected $signature = 'lhp:tim-erpika {--ganti : ganti tim yang sudah ada}';

    protected $description = 'Salin susunan tim pemeriksa LHP dari ERPIKA (cocokkan Nomor Surat Tugas)';

    public function handle(): int
    {
        $norm = fn (?string $s) => preg_replace('/\s+/', '', mb_strtolower(trim((string) $s)));

        // Peta nomor_st ternormalisasi -> penugasan (dengan tim), dari ERPIKA.
        $peta = [];
        foreach (RppPenugasan::with('teamMembers')->whereNotNull('nomor_st')->get() as $p) {
            $k = $norm($p->nomor_st);
            if ($k !== '' && ! isset($peta[$k])) {
                $peta[$k] = $p;
            }
        }
        $this->info('ERPIKA: '.count($peta).' nomor ST unik dengan tim.');

        $isi = $lewat = $takCocok = 0;
        $lhps = Lhp::whereNotNull('nomor_st')->where('nomor_st', '!=', '')->get();
        $bar = $this->output->createProgressBar($lhps->count());
        foreach ($lhps as $lhp) {
            $p = $peta[$norm($lhp->nomor_st)] ?? null;
            if (! $p || $p->teamMembers->isEmpty()) {
                $takCocok++;
                $bar->advance();

                continue;
            }
            if ($lhp->tim()->exists() && ! $this->option('ganti')) {
                $lewat++;
                $bar->advance();

                continue;
            }
            DB::transaction(function () use ($lhp, $p) {
                $lhp->tim()->delete();
                $no = 0;
                foreach ($p->teamMembers->sortBy('order') as $m) {
                    $lhp->tim()->create([
                        'no' => ++$no,
                        'nip' => $m->nip ?: null,
                        'nama' => $m->nama ?: '(tanpa nama)',
                        'jabatan' => $m->peranTampil(),
                    ]);
                }
            });
            $isi++;
            $bar->advance();
        }
        $bar->finish();
        $this->newLine(2);
        $this->info("Terisi: {$isi} LHP. Dilewati (sudah ada tim): {$lewat}. Tidak cocok ST: {$takCocok}.");
        $this->line('Total baris tim sekarang: '.DB::table('lhp_tim')->count());

        return self::SUCCESS;
    }
}
