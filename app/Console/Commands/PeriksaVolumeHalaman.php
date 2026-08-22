<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Mengukur seberapa dekat halaman terberat dengan ambang paginasi — R-17.
 *
 * KENAPA PERINTAH INI ADA, dan bukan paginasinya. Audit menandai "paginasi
 * hanya di 5 dari 64 controller". Diukur di aplikasi berjalan, halaman
 * terberat 1.530 KB dan dilayani 459 ms — jauh di bawah ambang yang
 * ditetapkan: 3 MB atau 1 detik.
 *
 * Halaman-halaman ini adalah register yang dikerjakan sebagai satu kesatuan:
 * digulir, disaring, dicocokkan antar-baris, dan dicetak. Memotongnya jadi
 * halaman 25 baris menyelesaikan masalah bita sambil merusak cara kerjanya.
 * Jalan yang benar ketika waktunya tiba adalah virtualisasi tabel dengan
 * penyaringan di sisi server — pekerjaan berminggu-minggu yang mengubah cara
 * orang memakai aplikasi, jadi keputusan pemiliknya.
 *
 * Menunda dengan ambang hanya aman kalau ada yang MENGUKUR ULANG. Tanpa itu,
 * "nanti kalau sudah besar" berarti "tidak pernah", dan yang menyadarkan
 * akhirnya adalah pemakai yang halamannya berhenti terbuka.
 *
 *   php artisan volume:periksa
 *
 * Dasar perhitungan diambil dari pengukuran 22 Agustus 2026 di peramban
 * sungguhan. Bita per baris dianggap tetap — memang tidak persis, tetapi
 * cukup untuk mengetahui kapan harus mulai khawatir.
 */
class PeriksaVolumeHalaman extends Command
{
    protected $signature = 'volume:periksa {--ambang-kb=3072 : Ambang ukuran halaman dalam KB}';

    protected $description = 'Mengukur seberapa dekat halaman terberat dengan ambang yang menuntut paginasi';

    /**
     * Dasar ukur: halaman, tabel sumbernya, dan hasil pengukuran 22 Agustus 2026.
     *
     * `baris` adalah CACAH BARIS SUMBER pada hari pengukuran, bukan jumlah
     * baris yang tergambar di layar. Keduanya berbeda — satu baris sumber bisa
     * jadi beberapa baris tampilan, atau tidak muncul sama sekali — dan
     * memasangkan angka tampilan dengan cacah sumber menghasilkan perkiraan
     * yang meleset sejak awal. Sempat begitu: KRO/IRO PD diperkirakan 1.589 KB
     * padahal terukur 970 KB, semata karena pasangannya tidak sejenis.
     *
     * @var array<int, array{nama: string, tabel: array<int, string>, baris: int, kb: int}>
     */
    private const DASAR = [
        ['nama' => 'Monitoring 8-9', 'tabel' => ['monitoring_rtp', 'tbl_irs_pemda', 'tbl_irs_pd', 'tbl_iro_pd'], 'baris' => 258, 'kb' => 1530],
        ['nama' => 'Data Risiko Gabungan', 'tabel' => ['tbl_irs_pemda', 'tbl_irs_pd', 'tbl_iro_pd'], 'baris' => 258, 'kb' => 1098],
        ['nama' => 'KRS/IRS Pemda', 'tabel' => ['tbl_krs_pemda'], 'baris' => 372, 'kb' => 975],
        ['nama' => 'KRO/IRO PD', 'tabel' => ['tbl_kro_pd', 'tbl_iro_pd'], 'baris' => 308, 'kb' => 970],
        ['nama' => 'KRS/IRS PD', 'tabel' => ['tbl_krs_pd', 'tbl_irs_pd'], 'baris' => 158, 'kb' => 726],
    ];

    public function handle(): int
    {
        $ambang = max(1, (int) $this->option('ambang-kb'));

        $this->line("Ambang: {$ambang} KB per halaman.");
        $this->line('Dasar ukur: pengukuran 22 Agustus 2026 di peramban sungguhan.');
        $this->newLine();

        $baris = [];
        $tertinggi = 0.0;

        foreach (self::DASAR as $d) {
            $sekarang = $this->cacahBaris($d['tabel']);
            if ($sekarang === null) {
                continue;
            }

            // Bita per baris dianggap tetap. Kasar, dan memang tidak persis —
            // tetapi cukup untuk menjawab satu pertanyaan: sudah waktunya
            // khawatir atau belum.
            $perBaris = $d['baris'] > 0 ? $d['kb'] / $d['baris'] : 0;
            $perkiraan = (int) round($perBaris * $sekarang);
            $persen = $ambang > 0 ? $perkiraan / $ambang * 100 : 0;
            $tertinggi = max($tertinggi, $persen);

            $baris[] = [
                $d['nama'],
                number_format($d['baris']),
                number_format($sekarang),
                number_format($perkiraan).' KB',
                number_format($persen, 0).'%',
                $this->penilaian($persen),
            ];
        }

        $this->table(['Halaman', 'Baris saat diukur', 'Baris kini', 'Perkiraan', '% ambang', 'Keadaan'], $baris);
        $this->newLine();

        if ($tertinggi >= 100) {
            $this->error('AMBANG TERLAMPAUI. Saatnya mengerjakan virtualisasi tabel + penyaringan sisi server.');

            return self::FAILURE;
        }

        if ($tertinggi >= 70) {
            $this->warn('Mendekati ambang. Mulai rencanakan virtualisasi tabel sebelum terlampaui.');

            return self::SUCCESS;
        }

        $this->info('Masih lapang. Paginasi belum diperlukan.');

        return self::SUCCESS;
    }

    private function penilaian(float $persen): string
    {
        return match (true) {
            $persen >= 100 => 'TERLAMPAUI',
            $persen >= 70 => 'mendekati',
            default => 'lapang',
        };
    }

    /**
     * Jumlah baris hidup pada tabel-tabel sumber halaman.
     *
     * Baris terhapus lunak tidak dihitung — ia tidak ikut dikirim ke halaman,
     * jadi tidak menambah beratnya.
     */
    private function cacahBaris(array $tabel): ?int
    {
        $total = 0;
        $adaSatuPun = false;

        foreach ($tabel as $t) {
            if (! DB::getSchemaBuilder()->hasTable($t)) {
                continue;
            }
            $adaSatuPun = true;

            $q = DB::table($t);
            if (DB::getSchemaBuilder()->hasColumn($t, 'deleted_at')) {
                $q->whereNull('deleted_at');
            }
            $total += $q->count();
        }

        return $adaSatuPun ? $total : null;
    }
}
