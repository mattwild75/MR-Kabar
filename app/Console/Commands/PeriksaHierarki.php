<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Mencari simpul hierarki yang PECAH — temuan audit R-09.
 *
 * MASALAHNYA. Hierarki Visi → Misi → Tujuan → Sasaran → Program tidak
 * disimpan sebagai tautan induk-anak, melainkan sebagai teks yang diulang di
 * setiap baris. Kalau teks satu simpul diubah pada sebagian baris saja, simpul
 * itu PECAH JADI DUA di pohon hierarki — dan tidak ada galat apa pun yang
 * muncul. Diagramnya tetap tergambar, angkanya tetap terjumlah, hanya saja
 * satu simpul kini berdiri dua kali dengan anak terbagi di antaranya.
 *
 * Penyuntingan lewat aplikasi memperbarui seluruh baris sekaligus sehingga
 * aman. Yang tidak terlindungi: impor Excel dan penyuntingan langsung di
 * basis data.
 *
 * KENAPA PERINTAH INI TIDAK MEMPERBAIKI SENDIRI. Godaannya besar: satukan saja
 * ke tulisan yang paling banyak dipakai. Data sungguhan menunjukkan itu keliru.
 * Pada pemeriksaan pertama ditemukan satu misi tertulis dua cara — 98 baris
 * tanpa awalan "Misi 6 :" dan 4 baris dengan awalan. Suara terbanyak akan
 * memilih yang tanpa awalan, padahal enam misi lainnya SEMUA memakai awalan;
 * yang benar justru yang empat. Menyatukan otomatis akan membuat datanya
 * konsisten ke arah yang salah, diam-diam, dan itu lebih buruk daripada
 * membiarkannya pecah dan terlihat.
 *
 *   php artisan hierarki:periksa
 *   php artisan hierarki:periksa --tabel=tbl_krs_pemda
 */
class PeriksaHierarki extends Command
{
    protected $signature = 'hierarki:periksa {--tabel= : Batasi ke satu tabel saja}';

    protected $description = 'Mencari simpul hierarki yang pecah karena tulisannya berbeda di sebagian baris';

    /**
     * Tingkatan hierarki per tabel, dari akar ke daun.
     *
     * @var array<string, array<int, string>>
     */
    private const TINGKATAN = [
        'tbl_krs_pemda' => ['VISI', 'MISI', 'TUJUAN RPJMD', 'SASARAN RPJMD', 'PROGRAM PRIORITAS'],
        'tbl_krs_pd' => ['SASARAN RPJMD', 'TUJUAN STRATEGIS PD', 'SASARAN STRATEGIS PD', 'PROGRAM PD', 'KEGIATAN PD', 'SUBKEGIATAN PD'],
        'tbl_kro_pd' => ['SASARAN RENSTRA', 'PROGRAM PD', 'KEGIATAN PD'],
    ];

    /**
     * Tabel yang hierarkinya BERBEDA per Perangkat Daerah.
     *
     * Pemeriksaan pertama di produksi (10 September 2026) melaporkan empat
     * simpul "pecah": "2.1 Pengelolaan Persampahan" vs "1.1 Pengelolaan
     * Persampahan", dan sepasang lagi untuk koordinasi pemerintahan kecamatan.
     * Ditelusuri, keduanya berasal dari OPD BERBEDA — DLH vs PUPR, Kecamatan
     * Johan Pahlawan vs Pante Ceureumen. Tiap OPD memberi nomor kegiatannya
     * sendiri mengikuti Renstra-nya, jadi 1.1 dan 2.1 sama-sama benar.
     *
     * Pemeriksa yang membandingkan teks lintas OPD akan terus berteriak
     * untuk hal yang wajar, dan pemeriksa yang tidak dipercaya sama tak
     * bergunanya dengan yang tidak ada. Untuk tabel ini, simpul dibandingkan
     * HANYA di dalam OPD yang sama. tbl_krs_pemda tidak termasuk: hierarkinya
     * memang satu untuk seluruh kabupaten.
     */
    private const PER_OPD = ['tbl_krs_pd', 'tbl_kro_pd'];

    public function handle(): int
    {
        $tabelDiminta = $this->option('tabel');
        $tabel = $tabelDiminta ? [$tabelDiminta => self::TINGKATAN[$tabelDiminta] ?? []] : self::TINGKATAN;

        if ($tabelDiminta && empty($tabel[$tabelDiminta])) {
            $this->error("Tabel '{$tabelDiminta}' bukan tabel hierarki. Pilihan: ".implode(', ', array_keys(self::TINGKATAN)));

            return self::FAILURE;
        }

        $totalPecah = 0;
        $totalYatim = 0;

        foreach ($tabel as $nama => $kolomList) {
            if (! DB::getSchemaBuilder()->hasTable($nama)) {
                continue;
            }

            $adaKolom = collect(DB::select("SHOW COLUMNS FROM `{$nama}`"))->pluck('Field');
            $this->newLine();
            $this->line("<fg=cyan>{$nama}</> — ".DB::table($nama)->whereNull('deleted_at')->count().' baris');

            foreach ($kolomList as $kolom) {
                if (! $adaKolom->contains($kolom)) {
                    continue;
                }

                $indukKolom = $this->indukDari($kolomList, $kolom, $adaKolom);
                $pecah = $this->simpulPecah($nama, $kolom, $indukKolom);
                $totalPecah += $pecah->count();

                if ($pecah->isEmpty()) {
                    $this->line("  <fg=green>utuh</>   {$kolom}");

                    continue;
                }

                $this->line("  <fg=red>PECAH</>  {$kolom} — {$pecah->count()} simpul");
                foreach ($pecah as $varian) {
                    foreach ($varian as $v) {
                        $this->line(sprintf('           %5d baris  "%s"', $v['jumlah'], mb_substr($v['teks'], 0, 62)));
                    }
                    $this->line('           ─────');
                }
            }

            // Keterangan tambahan, BUKAN vonis: anak terisi sedangkan
            // induknya kosong. Di pohon, baris itu muncul di bawah simpul
            // tanpa nama.
            //
            // Sengaja tidak dihitung sebagai cacat, dan tidak memengaruhi
            // kode keluar. Sebagian di antaranya WAJAR: 249 baris program
            // pada tbl_krs_pemda memang tidak bertaut ke sasaran mana pun
            // karena berupa program penunjang. Aturan tingkat mana yang
            // boleh kosong adalah urusan perencanaan daerah, bukan urusan
            // perintah ini — jadi angkanya disodorkan untuk ditimbang
            // manusia, tidak dinyatakan salah.
            foreach ($kolomList as $kolom) {
                if (! $adaKolom->contains($kolom)) {
                    continue;
                }
                $indukKolom = $this->indukDari($kolomList, $kolom, $adaKolom);
                if ($indukKolom === null) {
                    continue;
                }

                $yatim = DB::table($nama)
                    ->whereNull('deleted_at')
                    ->whereNotNull($kolom)->where($kolom, '<>', '')
                    ->where(fn ($q) => $q->whereNull($indukKolom)->orWhere($indukKolom, ''))
                    ->count();

                if ($yatim > 0) {
                    $totalYatim += $yatim;
                    $this->line("  <fg=gray>catatan</> {$kolom} terisi tetapi {$indukKolom} kosong — {$yatim} baris");
                }
            }
        }

        $this->newLine();
        if ($totalYatim > 0) {
            $this->line("<fg=gray>Catatan: {$totalYatim} baris punya tingkatan terisi dengan induknya kosong.</>");
            $this->line('<fg=gray>Di pohon, baris itu muncul di bawah simpul tanpa nama. Sebagiannya wajar</>');
            $this->line('<fg=gray>— program penunjang memang tidak bertaut ke sasaran. Perlu ditimbang,</>');
            $this->line('<fg=gray>bukan otomatis salah.</>');
            $this->newLine();
        }

        if ($totalPecah === 0) {
            $this->info('Tidak ada simpul yang pecah.');

            return self::SUCCESS;
        }

        $this->warn("{$totalPecah} simpul hierarki pecah.");
        $this->line('Satukan tulisannya lewat penyuntingan simpul per tingkatan di aplikasi,');
        $this->line('yang memperbarui seluruh baris sekaligus. JANGAN sekadar mengikuti tulisan');
        $this->line('yang paling banyak dipakai — belum tentu itu yang benar.');

        return self::FAILURE;
    }

    /** Tingkatan tepat di atas $kolom yang kolomnya benar-benar ada. */
    private function indukDari(array $kolomList, string $kolom, Collection $adaKolom): ?string
    {
        $i = array_search($kolom, $kolomList, true);
        for ($j = $i - 1; $j >= 0; $j--) {
            if ($adaKolom->contains($kolomList[$j])) {
                return $kolomList[$j];
            }
        }

        return null;
    }

    /**
     * Kelompok tulisan yang sebenarnya satu simpul tetapi ditulis berbeda.
     *
     * INDUKNYA IKUT DIPERHITUNGKAN, dan itu menentukan. Dua kegiatan bernama
     * mirip di bawah dua program BERBEDA adalah dua simpul yang sah, bukan
     * satu yang pecah — terbukti di data sungguhan: "Perencanaan,
     * Penganggaran, dan Evaluasi..." muncul di bawah "Program Pengelolaan
     * Keuangan Daerah" sekaligus "Program Penunjang Urusan Pemerintahan
     * Daerah". Tanpa memeriksa induknya, pendeteksi ini berteriak untuk hal
     * yang wajar — dan pendeteksi yang berteriak untuk hal wajar lebih buruk
     * daripada tidak ada, karena orang berhenti mempercayainya.
     *
     * @return Collection<int, Collection<int, array{teks: string, jumlah: int}>>
     */
    private function simpulPecah(string $tabel, string $kolom, ?string $indukKolom): Collection
    {
        $perOpd = in_array($tabel, self::PER_OPD, true);

        $pilih = $indukKolom
            ? "t.`{$kolom}` as teks, t.`{$indukKolom}` as induk, COUNT(*) as jumlah"
            : "t.`{$kolom}` as teks, '' as induk, COUNT(*) as jumlah";

        $kelompokkan = $indukKolom ? ["t.{$kolom}", "t.{$indukKolom}"] : ["t.{$kolom}"];

        if ($perOpd) {
            // OPD diambil dari AKUN pemilik baris, bukan dari kolom teks di
            // dalam barisnya — kolom teks itu diisi bebas dan ejaannya
            // berbeda-beda (temuan audit R-08).
            $pilih .= ', COALESCE(u.opd_id, 0) as pemilik';
            $kelompokkan[] = 'u.opd_id';
        } else {
            $pilih .= ', 0 as pemilik';
        }

        $query = DB::table("{$tabel} as t")
            ->whereNull('t.deleted_at')
            ->whereNotNull("t.{$kolom}")
            ->where("t.{$kolom}", '<>', '');

        if ($perOpd) {
            $query->leftJoin('users as u', 'u.id', '=', 't.user_id');
        }

        return $query
            ->selectRaw($pilih)
            ->groupBy($kelompokkan)
            ->get()
            ->map(fn ($r) => [
                'teks' => trim((string) $r->teks),
                'induk' => self::kunci((string) $r->induk),
                'pemilik' => (int) $r->pemilik,
                'jumlah' => (int) $r->jumlah,
            ])
            // Satu simpul = satu pemilik + satu induk + satu bentuk teks
            // yang dinormalkan.
            ->groupBy(fn ($r) => $r['pemilik'].'|'.$r['induk'].'|'.self::kunci($r['teks']))
            ->filter(fn ($g) => $g->pluck('teks')->unique()->count() > 1)
            ->values();
    }

    /**
     * Bentuk banding: dua tulisan yang menghasilkan kunci sama adalah satu
     * simpul yang pecah.
     *
     * Awalan penomoran ("Misi 6 :", "1.1.", "a.") ikut dibuang. Tanpa itu,
     * pecahnya justru tidak terdeteksi — dan pecah-karena-awalan persis yang
     * ditemukan pada pemeriksaan pertama di data sungguhan.
     */
    public static function kunci(string $teks): string
    {
        $t = mb_strtolower(trim($teks));
        $t = preg_replace('/^(visi|misi|tujuan|sasaran|program|kegiatan)\s*\d*\s*[:.]\s*/u', '', $t) ?? $t;
        $t = preg_replace('/^\d+(\.\d+)*\s*[:.)]?\s*/u', '', $t) ?? $t;
        $t = preg_replace('/[^\p{L}\p{N}]+/u', '', $t) ?? $t;

        return $t;
    }
}
