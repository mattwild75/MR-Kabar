<?php

namespace App\Console\Commands;

use App\Services\KesehatanServerService;
use App\Services\PeringatanServerService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

/**
 * Dua tugas dalam satu perintah:
 *  - tanpa opsi: pemeriksaan cepat (dijadwalkan tiap jam) — bila ada butir
 *    "bahaya", kirim peringatan ke Super Admin (dijeda 12 jam per butir);
 *  - --mingguan: laporan lengkap semua butir ke Super Admin, apa pun
 *    hasilnya, supaya "tidak ada kabar" tidak pernah disalahartikan sebagai
 *    "semua baik".
 * Hasil terakhir disimpan di cache untuk kartu Kesehatan Server.
 */
class LaporanKesehatan extends Command
{
    protected $signature = 'kesehatan:laporan {--mingguan : kirim laporan lengkap ke Super Admin}';

    protected $description = 'Periksa kesehatan server; peringatkan Super Admin bila ada bahaya, atau kirim laporan mingguan';

    public function handle(KesehatanServerService $kesehatan, PeringatanServerService $peringatan): int
    {
        $potret = $kesehatan->potret();
        Cache::forever('kesehatan_server_terakhir', $potret);

        $bahaya = array_values(array_filter($potret['butir'], fn ($b) => $b['status'] === 'bahaya'));
        $perhatian = array_values(array_filter($potret['butir'], fn ($b) => $b['status'] === 'perhatian'));
        foreach ($potret['butir'] as $b) {
            $this->line(str_pad(strtoupper($b['status']), 14).$b['judul'].': '.$b['nilai'].($b['keterangan'] ? ' - '.$b['keterangan'] : ''));
        }

        if ($this->option('mingguan')) {
            $baris = array_map(fn ($b) => strtoupper($b['status']).' '.$b['judul'].': '.$b['nilai'].($b['keterangan'] ? ' - '.$b['keterangan'] : ''), $potret['butir']);
            $ringkas = count($bahaya).' bahaya, '.count($perhatian).' perhatian dari '.count($potret['butir']).' butir. Kode terakhir: '.trim((string) shell_exec('git -C '.escapeshellarg(base_path()).' rev-parse --short HEAD 2>/dev/null'));
            $peringatan->kirim('mingguan-'.now()->format('Y-W'), 'Laporan kesehatan server mingguan', $ringkas, $baris, '/backup', 24 * 6);
            $this->info('Laporan mingguan dikirim: '.$ringkas);

            return self::SUCCESS;
        }

        foreach ($bahaya as $b) {
            $peringatan->kirim('bahaya-'.$b['kode'], 'BAHAYA: '.$b['judul'], $b['nilai'].($b['keterangan'] ? ' - '.$b['keterangan'] : ''));
        }

        return $bahaya === [] ? self::SUCCESS : self::FAILURE;
    }
}
