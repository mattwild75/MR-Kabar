<?php

namespace App\Services\Tes;

use App\Models\TesJawaban;
use App\Models\TesPelatihan;
use App\Models\TesPeserta;
use App\Models\TesSesi;
use App\Models\TesSoal;
use Illuminate\Support\Collection;

/**
 * Nilai, peringkat, dan analisis pre-test/post-test.
 *
 * - Nilai = benar / jumlah soal x 100. Soal yang tidak dijawab dihitung salah.
 *   Tidak ada batas lulus (keputusan pemilik aplikasi): yang diukur murni
 *   pengetahuan tiap peserta.
 * - Benar/salah selalu dihitung dari kunci bank soal SAAT INI, jadi kunci
 *   yang dikoreksi sesudah tes langsung memperbaiki seluruh nilai.
 * - Peringkat: nilai tertinggi; bila nilai sama, jumlah milidetik pada
 *   jawaban yang benar paling sedikit (keputusan pemilik aplikasi); lalu
 *   milidetik seluruh jawaban; lalu yang lebih dulu bergabung.
 * - Peserta pre dan post dipasangkan lewat NIP; peserta bukan ASN lewat nama
 *   dan instansinya.
 * - N-gain (Hake): (post - pre) / (100 - pre); tinggi >= 0,7, sedang
 *   0,3-0,7, rendah < 0,3. Uji-t berpasangan dua sisi dan ukuran efek dz.
 * - Analisis butir: tingkat kesukaran (proporsi benar) dan daya beda
 *   (kelompok atas dikurangi kelompok bawah, masing-masing 27%).
 */
class AnalisisTesService
{
    public const BATAS_PAHAM = 75.0;

    public const BATAS_CUKUP = 50.0;

    /** @return Collection<int, TesSoal> dikunci per nomor */
    public function bankSoal(string $jenis): Collection
    {
        return TesSoal::where('jenis', $jenis)->orderBy('nomor')->get()->keyBy('nomor');
    }

    public function jumlahSoal(string $jenis): int
    {
        $n = TesSoal::where('jenis', $jenis)->count();

        return $n > 0 ? $n : TesSesi::JUMLAH_SOAL;
    }

    /** @return array<int, int> jumlah soal per bagian */
    public function jumlahPerBagian(string $jenis): array
    {
        $hasil = array_fill_keys(array_keys(TesSoal::BAGIAN), 0);
        foreach ($this->bankSoal($jenis) as $soal) {
            $hasil[$soal->bagian] = ($hasil[$soal->bagian] ?? 0) + 1;
        }

        return $hasil;
    }

    /**
     * Baris nilai setiap peserta sah satu sesi, sudah diurutkan dan diberi
     * peringkat.
     *
     * @return list<array<string, mixed>>
     */
    public function nilaiSesi(TesSesi $sesi): array
    {
        $soal = $this->bankSoal($sesi->jenis);
        $jumlah = $this->jumlahSoal($sesi->jenis);

        $peserta = $sesi->peserta()
            ->whereNotNull('biodata_pada')
            ->whereNull('dikeluarkan_pada')
            ->with('opd:id,nama')
            ->get();
        $jawaban = TesJawaban::where('sesi_id', $sesi->id)->get()->groupBy('peserta_id');

        $baris = [];
        foreach ($peserta as $p) {
            $miliknya = $jawaban->get($p->id, collect());
            $pilihan = [];
            $waktu = [];
            $dijawabPada = [];
            $benar = 0;
            $totalWaktu = 0;
            $waktuBenar = 0;
            $perBagian = array_fill_keys(array_keys(TesSoal::BAGIAN), 0);

            foreach ($miliknya as $j) {
                $pilihan[$j->nomor] = $j->pilihan;
                $waktu[$j->nomor] = (int) $j->waktu_ms;
                $dijawabPada[$j->nomor] = $j->dijawab_pada?->toIso8601String();
                $totalWaktu += (int) $j->waktu_ms;
                $butir = $soal->get($j->nomor);
                if ($butir && $j->pilihan === $butir->kunci) {
                    $benar++;
                    $waktuBenar += (int) $j->waktu_ms;
                    $perBagian[$butir->bagian] = ($perBagian[$butir->bagian] ?? 0) + 1;
                }
            }

            $baris[] = [
                'id' => $p->id,
                'nama' => (string) $p->nama,
                'nip' => $p->nip,
                'bukan_asn' => (bool) $p->bukan_asn,
                'jabatan' => (string) $p->jabatan,
                'opd_id' => $p->opd_id,
                'instansi' => $p->namaInstansi(),
                'benar' => $benar,
                'dijawab' => $miliknya->count(),
                'jumlah_soal' => $jumlah,
                'nilai' => round($benar / $jumlah * 100, 2),
                'total_waktu_ms' => $totalWaktu,
                // Penentu peringkat bila nilai sama (keputusan pemilik aplikasi):
                // jumlah milidetik pada jawaban yang BENAR. Jumlah jawaban benar
                // kedua peserta itu pasti sama, jadi yang dibandingkan setara;
                // peserta yang melewatkan soal tidak diuntungkan.
                'waktu_benar_ms' => $waktuBenar,
                'per_bagian' => $perBagian,
                'pilihan' => $pilihan,
                'waktu' => $waktu,
                'soal_pertama' => $miliknya->min('nomor'),
                // Kapan peserta mengisi: bergabung (token benar), biodata
                // dikirim, jawaban pertama dan terakhir, serta jam tiap jawaban.
                'bergabung_pada' => $p->created_at?->toIso8601String(),
                'biodata_pada' => $p->biodata_pada?->toIso8601String(),
                'dijawab_pada' => $dijawabPada,
                'jawaban_pertama' => $miliknya->min('dijawab_pada')?->toIso8601String(),
                'jawaban_terakhir' => $miliknya->max('dijawab_pada')?->toIso8601String(),
                'jumlah_keluar' => (int) $p->jumlah_keluar,
                'pindah_perangkat' => (int) $p->pindah_perangkat,
            ];
        }

        // Nilai tertinggi; bila sama, milidetik jawaban benar tersedikit; bila
        // masih sama, milidetik seluruh jawaban; terakhir yang lebih dulu
        // bergabung.
        usort($baris, fn ($a, $b) => [$b['nilai'], $a['waktu_benar_ms'], $a['total_waktu_ms'], $a['id']]
            <=> [$a['nilai'], $b['waktu_benar_ms'], $b['total_waktu_ms'], $b['id']]);
        foreach ($baris as $i => &$r) {
            $r['peringkat'] = $i + 1;
        }
        unset($r);

        return $baris;
    }

    /**
     * Seluruh analisis satu pelatihan untuk halaman Hasil, ekspor Excel, dan
     * cetak.
     *
     * @return array<string, mixed>
     */
    public function lengkap(TesPelatihan $pelatihan): array
    {
        $pelatihan->loadMissing('sesi');
        $sesiPre = $pelatihan->sesiJenis('pre');
        $sesiPost = $pelatihan->sesiJenis('post');

        $pre = $sesiPre ? $this->nilaiSesi($sesiPre) : [];
        $post = $sesiPost ? $this->nilaiSesi($sesiPost) : [];
        $pasangan = $this->pasangkan($pre, $post);

        $selisih = array_map(fn ($p) => $p['post'] - $p['pre'], $pasangan);
        $ngain = array_values(array_filter(array_map(fn ($p) => $p['ngain'], $pasangan), fn ($g) => $g !== null));

        $kategori = ['tinggi' => 0, 'sedang' => 0, 'rendah' => 0];
        foreach ($pasangan as $p) {
            if ($p['kategori'] !== null) {
                $kategori[$p['kategori']]++;
            }
        }

        return [
            'pre' => [
                'deskripsi' => $this->deskripsi(array_column($pre, 'nilai')),
                'peserta' => $pre,
                'butir' => $sesiPre ? $this->analisisButir($sesiPre, $pre) : [],
            ],
            'post' => [
                'deskripsi' => $this->deskripsi(array_column($post, 'nilai')),
                'peserta' => $post,
                'butir' => $sesiPost ? $this->analisisButir($sesiPost, $post) : [],
            ],
            'pasangan' => $pasangan,
            'peningkatan' => [
                'n' => count($pasangan),
                'rata_kenaikan' => $selisih === [] ? null : round(array_sum($selisih) / count($selisih), 2),
                'rata_ngain' => $ngain === [] ? null : round(array_sum($ngain) / count($ngain), 3),
                'kategori_ngain' => $kategori,
                'uji_t' => self::ujiTBerpasangan($selisih),
            ],
            'bagian' => $this->perBagian($pre, $post),
            'skpk' => $this->perSkpk($pre, $post, $pasangan),
        ];
    }

    /**
     * Pasangan pre-post. NIP lebih dulu; peserta tanpa NIP lewat nama dan
     * instansi.
     *
     * @param  list<array<string, mixed>>  $pre
     * @param  list<array<string, mixed>>  $post
     * @return list<array<string, mixed>>
     */
    public function pasangkan(array $pre, array $post): array
    {
        $petaPre = [];
        foreach ($pre as $r) {
            $petaPre[$this->kunciPasangan($r)] = $r;
        }

        $hasil = [];
        foreach ($post as $r) {
            $kunci = $this->kunciPasangan($r);
            if (! isset($petaPre[$kunci])) {
                continue;
            }
            $awal = (float) $petaPre[$kunci]['nilai'];
            $akhir = (float) $r['nilai'];
            $ngain = $awal >= 100 ? null : round(($akhir - $awal) / (100 - $awal), 3);
            $hasil[] = [
                'nama' => $r['nama'],
                'nip' => $r['nip'],
                'jabatan' => $r['jabatan'],
                'instansi' => $r['instansi'],
                'id_pre' => $petaPre[$kunci]['id'],
                'id_post' => $r['id'],
                'pre' => $awal,
                'post' => $akhir,
                'kenaikan' => round($akhir - $awal, 2),
                'ngain' => $ngain,
                'kategori' => $ngain === null ? null : ($ngain >= 0.7 ? 'tinggi' : ($ngain >= 0.3 ? 'sedang' : 'rendah')),
                'waktu_benar_post_ms' => (int) $r['waktu_benar_ms'],
            ];
        }

        usort($hasil, fn ($a, $b) => [$b['ngain'] ?? -INF, $b['kenaikan'], $b['post'], $a['waktu_benar_post_ms']]
            <=> [$a['ngain'] ?? -INF, $a['kenaikan'], $a['post'], $b['waktu_benar_post_ms']]);
        foreach ($hasil as $i => &$h) {
            $h['peringkat'] = $i + 1;
        }
        unset($h);

        return $hasil;
    }

    /** @param array<string, mixed> $r */
    private function kunciPasangan(array $r): string
    {
        if (! empty($r['nip'])) {
            return 'nip:'.$r['nip'];
        }
        $nama = mb_strtolower(trim((string) preg_replace('/\s+/u', ' ', (string) $r['nama'])));

        return 'nama:'.$nama.'|'.mb_strtolower((string) $r['instansi']);
    }

    /**
     * @param  list<array<string, mixed>>  $nilai
     * @return list<array<string, mixed>>
     */
    public function analisisButir(TesSesi $sesi, array $nilai): array
    {
        $soal = $this->bankSoal($sesi->jenis);
        $n = count($nilai);

        // Kelompok atas dan bawah 27% menurut jumlah benar.
        $urut = $nilai;
        usort($urut, fn ($a, $b) => $b['benar'] <=> $a['benar']);
        $k = $n >= 4 ? max(1, (int) round($n * 0.27)) : 0;
        $atas = array_slice($urut, 0, $k);
        $bawah = $k > 0 ? array_slice($urut, -$k) : [];

        $hasil = [];
        foreach ($soal as $nomor => $butir) {
            $sebaran = ['A' => 0, 'B' => 0, 'C' => 0, 'D' => 0, 'kosong' => 0];
            $waktu = [];
            $benar = 0;
            foreach ($nilai as $r) {
                $pilih = $r['pilihan'][$nomor] ?? null;
                if ($pilih === null) {
                    $sebaran['kosong']++;

                    continue;
                }
                $sebaran[$pilih] = ($sebaran[$pilih] ?? 0) + 1;
                $waktu[] = $r['waktu'][$nomor] ?? 0;
                if ($pilih === $butir->kunci) {
                    $benar++;
                }
            }

            $p = $n > 0 ? $benar / $n : null;
            $benarDi = fn (array $kelompok) => count(array_filter($kelompok, fn ($r) => ($r['pilihan'][$nomor] ?? null) === $butir->kunci));
            $daya = $k > 0 ? round(($benarDi($atas) - $benarDi($bawah)) / $k, 2) : null;

            $pengecohMati = [];
            if ($n >= 5) {
                foreach (TesSoal::PILIHAN as $huruf) {
                    if ($huruf !== $butir->kunci && $sebaran[$huruf] === 0) {
                        $pengecohMati[] = $huruf;
                    }
                }
            }

            $hasil[] = [
                'nomor' => (int) $nomor,
                'bagian' => (int) $butir->bagian,
                'indikator' => $butir->indikator,
                'kunci' => $butir->kunci,
                'benar' => $benar,
                'kesukaran' => $p === null ? null : round($p, 2),
                'kategori_kesukaran' => $p === null ? null : ($p > 0.7 ? 'Mudah' : ($p >= 0.3 ? 'Sedang' : 'Sukar')),
                'daya_beda' => $daya,
                'kategori_daya_beda' => $daya === null ? null : ($daya >= 0.4 ? 'Sangat baik' : ($daya >= 0.3 ? 'Baik' : ($daya >= 0.2 ? 'Cukup' : 'Kurang'))),
                'sebaran' => $sebaran,
                'pengecoh_tidak_dipilih' => $pengecohMati,
                'rata_waktu_detik' => $waktu === [] ? null : round(array_sum($waktu) / count($waktu) / 1000, 1),
            ];
        }

        return $hasil;
    }

    /**
     * @param  list<array<string, mixed>>  $pre
     * @param  list<array<string, mixed>>  $post
     * @return list<array<string, mixed>>
     */
    public function perBagian(array $pre, array $post): array
    {
        $jumlahPre = $this->jumlahPerBagian('pre');
        $jumlahPost = $this->jumlahPerBagian('post');

        $rata = function (array $baris, int $bagian, int $jumlah): ?float {
            if ($baris === [] || $jumlah === 0) {
                return null;
            }
            $persen = array_map(fn ($r) => ($r['per_bagian'][$bagian] ?? 0) / $jumlah * 100, $baris);

            return round(array_sum($persen) / count($persen), 1);
        };

        $hasil = [];
        foreach (TesSoal::BAGIAN as $nomor => $nama) {
            $nPre = $rata($pre, $nomor, $jumlahPre[$nomor] ?? 0);
            $nPost = $rata($post, $nomor, $jumlahPost[$nomor] ?? 0);
            $hasil[] = [
                'bagian' => $nomor,
                'nama' => $nama,
                'pre' => $nPre,
                'post' => $nPost,
                'kategori_pre' => $this->kategoriPaham($nPre),
                'kategori_post' => $this->kategoriPaham($nPost),
            ];
        }

        return $hasil;
    }

    public function kategoriPaham(?float $persen): ?string
    {
        if ($persen === null) {
            return null;
        }

        return $persen >= self::BATAS_PAHAM ? 'Sudah paham' : ($persen >= self::BATAS_CUKUP ? 'Cukup' : 'Perlu diperkuat');
    }

    /**
     * @param  list<array<string, mixed>>  $pre
     * @param  list<array<string, mixed>>  $post
     * @param  list<array<string, mixed>>  $pasangan
     * @return list<array<string, mixed>>
     */
    public function perSkpk(array $pre, array $post, array $pasangan): array
    {
        $kelompok = [];
        foreach (['pre' => $pre, 'post' => $post] as $jenis => $baris) {
            foreach ($baris as $r) {
                $kelompok[$r['instansi']][$jenis][] = (float) $r['nilai'];
            }
        }
        foreach ($pasangan as $p) {
            $kelompok[$p['instansi']]['naik'][] = (float) $p['kenaikan'];
        }

        $rata = fn (array $x) => $x === [] ? null : round(array_sum($x) / count($x), 2);

        $hasil = [];
        foreach ($kelompok as $instansi => $isi) {
            $hasil[] = [
                'instansi' => $instansi,
                'n_pre' => count($isi['pre'] ?? []),
                'n_post' => count($isi['post'] ?? []),
                'rata_pre' => $rata($isi['pre'] ?? []),
                'rata_post' => $rata($isi['post'] ?? []),
                'rata_kenaikan' => $rata($isi['naik'] ?? []),
            ];
        }
        usort($hasil, fn ($a, $b) => [$b['rata_post'] ?? -1, $b['rata_pre'] ?? -1] <=> [$a['rata_post'] ?? -1, $a['rata_pre'] ?? -1]);

        return $hasil;
    }

    /**
     * Hasil untuk ponsel peserta sendiri sesudah sesi selesai.
     *
     * @return array<string, mixed>|null
     */
    public function hasilPeserta(TesPeserta $peserta): ?array
    {
        $sesi = $peserta->sesi;
        if (! $sesi || ! $peserta->sah()) {
            return null;
        }

        $semua = $this->nilaiSesi($sesi);
        $milik = collect($semua)->firstWhere('id', $peserta->id);
        if (! $milik) {
            return null;
        }

        $jumlahPerBagian = $this->jumlahPerBagian($sesi->jenis);
        $bagian = [];
        foreach (TesSoal::BAGIAN as $nomor => $nama) {
            $jumlah = $jumlahPerBagian[$nomor] ?? 0;
            $bagian[] = [
                'bagian' => $nomor,
                'nama' => $nama,
                'persen' => $jumlah > 0 ? round(($milik['per_bagian'][$nomor] ?? 0) / $jumlah * 100) : null,
            ];
        }

        $nilaiPre = null;
        if ($sesi->jenis === 'post') {
            $sesiPre = TesSesi::where('pelatihan_id', $sesi->pelatihan_id)->where('jenis', 'pre')->first();
            if ($sesiPre) {
                $pasangan = $this->pasangkan($this->nilaiSesi($sesiPre), [$milik]);
                $nilaiPre = $pasangan[0]['pre'] ?? null;
            }
        }

        return [
            'nilai' => $milik['nilai'],
            'benar' => $milik['benar'],
            'jumlah_soal' => $milik['jumlah_soal'],
            'peringkat' => $milik['peringkat'],
            'jumlah_peserta' => count($semua),
            'bagian' => $bagian,
            'nilai_pre' => $nilaiPre,
        ];
    }

    /**
     * @param  list<float|int>  $nilai
     * @return array<string, float|int|null>
     */
    public function deskripsi(array $nilai): array
    {
        $n = count($nilai);
        if ($n === 0) {
            return ['n' => 0, 'rata' => null, 'median' => null, 'sd' => null, 'min' => null, 'max' => null];
        }
        sort($nilai);
        $rata = array_sum($nilai) / $n;
        $tengah = intdiv($n, 2);
        $median = $n % 2 ? $nilai[$tengah] : ($nilai[$tengah - 1] + $nilai[$tengah]) / 2;
        $sd = $n > 1 ? sqrt(array_sum(array_map(fn ($x) => ($x - $rata) ** 2, $nilai)) / ($n - 1)) : null;

        return [
            'n' => $n,
            'rata' => round($rata, 2),
            'median' => round((float) $median, 2),
            'sd' => $sd === null ? null : round($sd, 2),
            'min' => round((float) $nilai[0], 2),
            'max' => round((float) $nilai[$n - 1], 2),
        ];
    }

    /**
     * Uji-t berpasangan dua sisi atas selisih post - pre.
     *
     * @param  list<float|int>  $selisih
     * @return array<string, float|int|bool|null>|null
     */
    public static function ujiTBerpasangan(array $selisih): ?array
    {
        $n = count($selisih);
        if ($n < 2) {
            return null;
        }
        $rata = array_sum($selisih) / $n;
        $sd = sqrt(array_sum(array_map(fn ($x) => ($x - $rata) ** 2, $selisih)) / ($n - 1));
        if ($sd == 0.0) {
            return ['n' => $n, 'df' => $n - 1, 'rata_selisih' => round($rata, 2), 'sd_selisih' => 0.0, 't' => null, 'p' => null, 'd' => null, 'signifikan' => null];
        }
        $t = $rata / ($sd / sqrt($n));
        $df = $n - 1;
        $p = self::pDuaSisi($t, $df);

        return [
            'n' => $n,
            'df' => $df,
            'rata_selisih' => round($rata, 2),
            'sd_selisih' => round($sd, 2),
            't' => round($t, 3),
            'p' => $p < 0.0001 ? 0.0001 : round($p, 4),
            'p_kurang_dari' => $p < 0.0001,
            'd' => round($rata / $sd, 2),
            'signifikan' => $p < 0.05,
        ];
    }

    /** Nilai-p dua sisi distribusi t Student: I_{df/(df+t^2)}(df/2, 1/2). */
    public static function pDuaSisi(float $t, int $df): float
    {
        $x = $df / ($df + $t * $t);

        return self::betaTerregulasi($df / 2, 0.5, $x);
    }

    public static function betaTerregulasi(float $a, float $b, float $x): float
    {
        if ($x <= 0.0) {
            return 0.0;
        }
        if ($x >= 1.0) {
            return 1.0;
        }
        $bt = exp(self::lnGamma($a + $b) - self::lnGamma($a) - self::lnGamma($b) + $a * log($x) + $b * log(1 - $x));
        if ($x < ($a + 1) / ($a + $b + 2)) {
            return $bt * self::pecahanBeta($a, $b, $x) / $a;
        }

        return 1.0 - $bt * self::pecahanBeta($b, $a, 1 - $x) / $b;
    }

    /** Pecahan berlanjut fungsi beta tak lengkap (metode Lentz). */
    private static function pecahanBeta(float $a, float $b, float $x): float
    {
        $kecil = 1.0e-300;
        $qab = $a + $b;
        $qap = $a + 1;
        $qam = $a - 1;
        $c = 1.0;
        $d = 1.0 - $qab * $x / $qap;
        $d = abs($d) < $kecil ? $kecil : $d;
        $d = 1.0 / $d;
        $h = $d;
        for ($m = 1; $m <= 300; $m++) {
            $m2 = 2 * $m;
            $aa = $m * ($b - $m) * $x / (($qam + $m2) * ($a + $m2));
            $d = 1.0 + $aa * $d;
            $d = abs($d) < $kecil ? $kecil : $d;
            $c = 1.0 + $aa / $c;
            $c = abs($c) < $kecil ? $kecil : $c;
            $d = 1.0 / $d;
            $h *= $d * $c;
            $aa = -($a + $m) * ($qab + $m) * $x / (($a + $m2) * ($qap + $m2));
            $d = 1.0 + $aa * $d;
            $d = abs($d) < $kecil ? $kecil : $d;
            $c = 1.0 + $aa / $c;
            $c = abs($c) < $kecil ? $kecil : $c;
            $d = 1.0 / $d;
            $del = $d * $c;
            $h *= $del;
            if (abs($del - 1.0) < 3.0e-14) {
                break;
            }
        }

        return $h;
    }

    /** Logaritma fungsi gamma (pendekatan Lanczos). */
    private static function lnGamma(float $x): float
    {
        $g = 7;
        $c = [
            0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
            -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
            1.5056327351493116e-7,
        ];
        if ($x < 0.5) {
            return log(M_PI / sin(M_PI * $x)) - self::lnGamma(1 - $x);
        }
        $x -= 1;
        $a = $c[0];
        $t = $x + $g + 0.5;
        for ($i = 1; $i < $g + 2; $i++) {
            $a += $c[$i] / ($x + $i);
        }

        return 0.5 * log(2 * M_PI) + ($x + 0.5) * log($t) - $t + log($a);
    }
}
