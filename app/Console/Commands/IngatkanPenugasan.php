<?php

namespace App\Console\Commands;

use App\Models\RppPenugasan;
use App\Services\PeringatanServerService;
use Illuminate\Console\Command;

/**
 * Pengingat harian ERPIKA ke lonceng Super Admin (dan surel bila SMTP
 * disetel): penugasan yang masa tugasnya sudah lewat lebih dari 14 hari
 * tetapi laporannya belum tercatat, dan penugasan yang mulai dalam 3 hari
 * ke depan tanpa nomor ST. Hanya membaca; satu pengingat per pekan.
 */
class IngatkanPenugasan extends Command
{
    protected $signature = 'erpika:ingatkan';

    protected $description = 'Ingatkan penugasan yang laporannya terlambat dan ST yang belum terbit menjelang masa tugas';

    public function handle(PeringatanServerService $peringatan): int
    {
        $terlambat = RppPenugasan::query()->with('rpp:id,nomor_rpp')
            ->whereNotNull('masa_tugas_selesai')
            ->where('masa_tugas_selesai', '<', now()->subDays(14)->toDateString())
            ->whereNotIn('status', ['lhp_terbit', 'selesai', 'batal', 'draft'])
            ->whereDoesntHave('laporans', fn ($q) => $q->whereNotNull('nomor_laporan'))
            ->orderBy('masa_tugas_selesai')->get();

        $tanpaSt = RppPenugasan::query()->with('rpp:id,nomor_rpp')
            ->whereNotNull('masa_tugas_mulai')
            ->whereBetween('masa_tugas_mulai', [now()->toDateString(), now()->addDays(3)->toDateString()])
            ->where(fn ($q) => $q->whereNull('nomor_st')->orWhere('nomor_st', ''))
            ->where('status', '!=', 'batal')->get();

        $this->line($terlambat->count().' laporan terlambat, '.$tanpaSt->count().' ST belum terbit menjelang masa tugas.');

        if ($terlambat->isNotEmpty()) {
            $baris = $terlambat->take(15)->map(fn ($p) => ($p->nomor_st ?? $p->rpp?->nomor_rpp).' - '.mb_strimwidth((string) $p->uraian, 0, 70, '…').' (selesai '.$p->masa_tugas_selesai->format('d/m/Y').')')->all();
            $peringatan->kirim('erpika-terlambat-'.now()->format('Y-W'), $terlambat->count().' penugasan belum ada laporan >14 hari setelah masa tugas',
                'Tercatat di RPP Aneva tanpa nomor laporan. Periksa apakah laporannya sudah terbit.', $baris, '/erpika/aneva?status=belum', 24 * 6);
        }
        if ($tanpaSt->isNotEmpty()) {
            $baris = $tanpaSt->map(fn ($p) => ($p->rpp?->nomor_rpp ?? '').' - '.mb_strimwidth((string) $p->uraian, 0, 70, '…').' (mulai '.$p->masa_tugas_mulai->format('d/m/Y').')')->all();
            $peringatan->kirim('erpika-tanpa-st-'.now()->format('Y-m-d'), $tanpaSt->count().' penugasan mulai dalam 3 hari tanpa nomor ST',
                'Terbitkan ST atau sesuaikan masa tugasnya di RPP Perencanaan.', $baris, '/erpika/pemeriksaan', 24);
        }

        return self::SUCCESS;
    }
}
