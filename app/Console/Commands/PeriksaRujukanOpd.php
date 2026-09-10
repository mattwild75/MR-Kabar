<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Menjaga rujukan OPD tetap utuh — temuan audit R-08.
 *
 * MASALAHNYA. Tabel risiko tidak menyimpan `opd_id` yang menunjuk tabel `opd`.
 * Yang disimpan adalah NAMA OPD sebagai teks, diulang di tiap baris. Basis
 * data karena itu tidak bisa menolak nama yang salah: satu huruf berbeda, satu
 * spasi ganda, atau nama OPD yang kemudian diubah di tabel `opd`, semuanya
 * diterima tanpa keluhan. Barisnya tidak hilang — ia hanya berhenti ikut
 * terhitung pada tabel dan diagram gabungan, dan tidak ada galat apa pun.
 *
 * KENAPA BUKAN LANGSUNG DIPASANG KUNCI ASING. Kunci asing tidak bisa dipasang
 * ke kolom teks berisi nama; ia menuntut kolom `opd_id` yang belum ada.
 * Mengubah nama menjadi `opd_id` berarti menyentuh skema, model, dan setiap
 * tempat kode yang menyambung lewat nama — pekerjaan berminggu-minggu di atas
 * data yang sudah dipakai 49 Perangkat Daerah. Ada pula penghalang teknis yang
 * mudah terlewat: kolom teks ini bercollation `utf8mb4_0900_ai_ci` sedangkan
 * `opd`.`nama` `utf8mb4_unicode_ci`, dan kunci asing menuntut keduanya sama.
 *
 * Selama konversi itu belum dikerjakan, perintah ini menutup celah yang paling
 * berbahaya: ia membuat kerusakan RUJUKAN berhenti menjadi diam. Pemeriksaan
 * pertama pada data produksi 10 September 2026 menemukan NOL nama yatim dari
 * 652 baris terisi — jendela untuk konversi masih terbuka, dan perintah ini
 * yang akan memberi tahu kalau mulai menutup.
 *
 *   php artisan rujukan:periksa
 */
class PeriksaRujukanOpd extends Command
{
    protected $signature = 'rujukan:periksa';

    protected $description = 'Mencari nama OPD di tabel risiko yang tidak ada di daftar OPD resmi';

    /**
     * Kolom teks yang seharusnya berisi nama OPD dari tabel `opd`.
     *
     * @var array<string, array<int, string>>
     */
    private const RUJUKAN = [
        'tbl_kro_iro_pd' => ['OPD_PENANGGUNGJAWAB_KEGIATAN'],
        'tbl_krs_irs_pd' => ['OPD_PENANGGUNGJAWAB_KEGIATAN'],
        'tbl_krs_irs_pemda' => ['OPD_IK_TUJUAN_RPJMD', 'OPD_IK_SASARAN_RPJMD', 'OPD_PENANGGUNGJAWAB_PROGRAM'],
    ];

    /**
     * Penanda "tidak ada isinya" yang ditulis sebagai teks biasa.
     *
     * Muncul di kolom berbentuk daftar sebagai satu butir "> Tidak Ada Data".
     * Bukan nama OPD, dan bukan kerusakan — jangan dilaporkan sebagai yatim.
     */
    private const PENANDA_KOSONG = 'tidak ada data';

    /**
     * Collation yang dipaksakan saat membandingkan.
     *
     * Tanpa ini MySQL menolak dengan "Illegal mix of collations": kolom teks
     * dan `opd`.`nama` memang berbeda collation. Dipaksa ke satu collation yang
     * TIDAK peka huruf besar-kecil, sengaja — beda kapitalisasi ditangani
     * terpisah di bawah sebagai peringatan, bukan sebagai nama yatim.
     */
    private const BANDING = 'utf8mb4_general_ci';

    public function handle(): int
    {
        $daftarOpd = DB::table('opd')->pluck('nama');

        if ($daftarOpd->isEmpty()) {
            $this->error('Tabel `opd` kosong — tidak ada yang bisa dibandingkan.');

            return self::FAILURE;
        }

        $this->line('Daftar OPD resmi: <fg=cyan>'.$daftarOpd->count().'</> nama.');

        $totalYatim = 0;
        $totalBedaKapital = 0;
        $totalDiperiksa = 0;

        foreach (self::RUJUKAN as $tabel => $kolomList) {
            if (! DB::getSchemaBuilder()->hasTable($tabel)) {
                continue;
            }

            $adaKolom = collect(DB::select("SHOW COLUMNS FROM `{$tabel}`"))->pluck('Field');

            foreach ($kolomList as $kolom) {
                if (! $adaKolom->contains($kolom)) {
                    continue;
                }

                $c = self::BANDING;
                $baris = DB::select(
                    "SELECT TRIM(`{$kolom}`) AS nilai, COUNT(*) AS jumlah
                       FROM `{$tabel}`
                      WHERE TRIM(COALESCE(`{$kolom}`, '')) <> ''
                   GROUP BY TRIM(`{$kolom}`)"
                );

                $terisi = array_sum(array_column($baris, 'jumlah'));
                $totalDiperiksa += $terisi;

                $yatim = [];
                $bedaKapital = [];

                foreach ($baris as $b) {
                    foreach ($this->sebutanOpd($b->nilai) as $nama) {
                        $cocokPersis = $daftarOpd->contains($nama);
                        $cocokAbaiKapital = $daftarOpd->contains(
                            fn ($n) => mb_strtolower($n) === mb_strtolower($nama)
                        );

                        $sebutan = (object) ['nilai' => $nama, 'jumlah' => $b->jumlah];

                        if (! $cocokAbaiKapital) {
                            $yatim[] = $sebutan;
                        } elseif (! $cocokPersis) {
                            $bedaKapital[] = $sebutan;
                        }
                    }
                }

                $totalYatim += array_sum(array_column($yatim, 'jumlah'));
                $totalBedaKapital += array_sum(array_column($bedaKapital, 'jumlah'));

                $ringkas = count($baris).' nama unik, '.$terisi.' baris terisi';

                if ($yatim === [] && $bedaKapital === []) {
                    $this->line("  <fg=green>OK</>   {$tabel}.{$kolom} — {$ringkas}");

                    continue;
                }

                $this->newLine();
                $this->line("  <fg=red>PERIKSA</> {$tabel}.{$kolom} — {$ringkas}");

                foreach ($yatim as $b) {
                    $this->line("         yatim        \"{$b->nilai}\" ({$b->jumlah} baris)");
                }

                foreach ($bedaKapital as $b) {
                    $this->line("         beda kapital \"{$b->nilai}\" ({$b->jumlah} baris)");
                }
            }
        }

        $this->newLine();
        $this->line("Diperiksa {$totalDiperiksa} baris terisi.");

        if ($totalYatim === 0 && $totalBedaKapital === 0) {
            $this->info('Seluruh rujukan OPD utuh.');

            return self::SUCCESS;
        }

        if ($totalYatim > 0) {
            $this->error("{$totalYatim} baris menyebut OPD yang tidak ada di daftar resmi.");
        }

        if ($totalBedaKapital > 0) {
            // Bukan sekadar soal rapi: penggabungan data di aplikasi memakai
            // pencocokan yang mengabaikan kapitalisasi justru KARENA ini, dan
            // kunci asing kelak menuntut nilainya sama persis.
            $this->warn("{$totalBedaKapital} baris memakai kapitalisasi berbeda dari daftar resmi.");
        }

        $this->newLine();
        $this->line('Perbaiki lewat halaman OPD atau impor ulang — jangan menyunting basis data langsung.');

        return self::FAILURE;
    }

    /**
     * Memecah satu sel menjadi nama-nama OPD yang disebutnya.
     *
     * Sebagian kolom memuat SATU nama, sebagian lagi memuat DAFTAR: beberapa
     * baris, masing-masing berawalan "> ". Pemeriksaan pertama sempat membaca
     * seluruh daftar sebagai satu nama, lalu melaporkan 250 baris "yatim" yang
     * sebenarnya utuh. Karena itu keduanya diperlakukan sama di sini: pecah per
     * baris, buang awalan "> ", lalu periksa satu per satu. Sel bernama tunggal
     * cukup menghasilkan satu butir.
     *
     * @return array<int, string>
     */
    private function sebutanOpd(string $sel): array
    {
        $butir = preg_split('/
||
/', $sel) ?: [];

        $bersih = [];

        foreach ($butir as $satu) {
            $satu = trim(preg_replace('/^\s*>\s*/', '', $satu) ?? '');

            if ($satu === '' || mb_strtolower($satu) === self::PENANDA_KOSONG) {
                continue;
            }

            $bersih[] = $satu;
        }

        return $bersih;
    }
}
