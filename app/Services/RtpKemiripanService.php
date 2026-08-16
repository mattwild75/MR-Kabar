<?php

namespace App\Services;

use App\Models\RtpKemiripanDiabaikan;

/**
 * Menandai Rencana Tindak Pengendalian yang rumusannya saling mirip.
 *
 * Perdep PPKD 4/2019 meminta dokumen RTP akhir diselaraskan agar tidak
 * duplikatif: RTP perbaikan lingkungan pengendalian (lahir dari CEE Form 1d)
 * dan RTP perbaikan kegiatan pengendalian (lahir dari register risiko) bisa
 * menghasilkan kebutuhan pengendalian yang sama persis, misalnya "menyusun SOP
 * verifikasi berkas". Tanpa penyelarasan, satu pekerjaan yang sama dipantau
 * dua kali sebagai dua RTP berbeda, dan capaiannya terhitung ganda.
 *
 * Hanya MENANDAI, tidak pernah memblokir. Pencocokan kalimat tidak akan pernah
 * selalu benar — dua RTP bisa berbunyi mirip tetapi sungguh berbeda sasarannya.
 * Menghalangi orang menyimpan karena tebakan mesin lebih merugikan daripada
 * satu lencana yang keliru, yang toh bisa ditutup lewat "sudah diperiksa".
 */
class RtpKemiripanService
{
    /**
     * Ambang kemiripan, 0 sampai 1. Lihat kesamaan() untuk cara menghitungnya.
     */
    private const AMBANG = 0.6;

    /**
     * Kata pokok paling sedikit pada sisi yang lebih pendek agar sepasang RTP
     * layak dibandingkan sama sekali. Rumusan sesingkat "Menyusun SOP" tidak
     * memuat cukup keterangan untuk dinilai mirip atau tidak; memaksakannya
     * hanya menghasilkan peringatan yang menyesatkan.
     */
    private const MINIMAL_KATA = 3;

    /**
     * Kata yang terlalu sering muncul di hampir semua RTP sehingga tidak
     * membedakan apa pun. Dibuang lebih dulu supaya dua RTP yang hanya
     * berbagi kata-kata ini tidak terhitung mirip.
     */
    private const KATA_UMUM = [
        'yang', 'untuk', 'dengan', 'pada', 'dari', 'dan', 'atau', 'agar', 'akan',
        'oleh', 'dalam', 'serta', 'secara', 'telah', 'sudah', 'belum', 'tidak',
        'melakukan', 'dilakukan', 'melaksanakan', 'dilaksanakan', 'terhadap',
        'adanya', 'sesuai', 'setiap', 'seluruh', 'kepada', 'tersebut',
    ];

    /**
     * Lengkapi tiap baris RTP dengan daftar RTP lain yang mirip dengannya.
     *
     * Pembandingan dibatasi pada baris yang SATU OPD dan SATU TAHUN. Di luar
     * itu kemiripan tidak berarti apa-apa: dua OPD memang boleh punya rencana
     * serupa, dan RTP tahun berbeda memang boleh berulang. Pembatasan ini
     * sekaligus menjaga biaya, karena pembandingan bersifat pasangan-per-
     * pasangan dan hanya berjalan di dalam kelompok yang kecil.
     *
     * @param  array<int, array<string, mixed>>  $daftar  keluaran rtpGabungan()
     * @return array<int, array<string, mixed>> daftar yang sama, plus 'kemiripan'
     */
    public function tandai(array $daftar): array
    {
        $diabaikan = $this->pasanganDiabaikan();

        // Kelompokkan berdasarkan OPD dan tahun, simpan indeks aslinya supaya
        // hasilnya bisa ditempelkan kembali tanpa mengubah urutan daftar.
        $kelompok = [];
        foreach ($daftar as $i => $baris) {
            $kunci = ($baris['opd_id'] ?? 'x').'|'.($baris['tahun'] ?? 'x');
            $kelompok[$kunci][] = $i;
        }

        $kemiripan = array_fill_keys(array_keys($daftar), []);
        $token = [];

        foreach ($kelompok as $indeks) {
            foreach ($indeks as $i) {
                $token[$i] ??= $this->token((string) ($daftar[$i]['label'] ?? ''));
            }

            foreach ($indeks as $a) {
                foreach ($indeks as $b) {
                    if ($a >= $b) {
                        continue;
                    }

                    $skor = $this->kesamaan($token[$a], $token[$b]);
                    if ($skor < self::AMBANG) {
                        continue;
                    }

                    $kunciPasangan = RtpKemiripanDiabaikan::kunci(
                        (string) $daftar[$a]['tipe'],
                        (int) $daftar[$a]['id'],
                        (string) $daftar[$b]['tipe'],
                        (int) $daftar[$b]['id'],
                    );
                    if (isset($diabaikan[$kunciPasangan])) {
                        continue;
                    }

                    $kemiripan[$a][] = $this->ringkas($daftar[$b], $skor);
                    $kemiripan[$b][] = $this->ringkas($daftar[$a], $skor);
                }
            }
        }

        foreach ($daftar as $i => $baris) {
            $daftar[$i]['kemiripan'] = $kemiripan[$i];
        }

        return $daftar;
    }

    /** @return array<string, true> */
    private function pasanganDiabaikan(): array
    {
        return RtpKemiripanDiabaikan::all()
            ->mapWithKeys(fn ($r) => [
                RtpKemiripanDiabaikan::kunci($r->tipe_a, (int) $r->id_a, $r->tipe_b, (int) $r->id_b) => true,
            ])
            ->all();
    }

    /**
     * @param  array<string, mixed>  $baris
     * @return array<string, mixed>
     */
    private function ringkas(array $baris, float $skor): array
    {
        return [
            'tipe' => $baris['tipe'],
            'id' => $baris['id'],
            'label' => $baris['label'],
            'konteks' => $baris['konteks'],
            'skor' => (int) round($skor * 100),
        ];
    }

    /**
     * Pecah rumusan RTP menjadi kata pokoknya.
     *
     * Awalan kategori Respon Risiko — RTP disimpan sebagai "Mitigate (uraian)"
     * oleh isian berkategori — sengaja ikut dibuang bersama tanda baca, sebab
     * dua RTP berbeda yang sama-sama berkategori Mitigate tidak lebih mirip
     * karenanya.
     *
     * @return array<int, string>
     */
    private function token(string $teks): array
    {
        $teks = mb_strtolower(trim($teks));

        // Buang awalan kategori beserta kurungnya, sisakan uraiannya.
        if (preg_match('/^[a-z\/\s]{1,20}\((.*)\)$/su', $teks, $cocok)) {
            $teks = $cocok[1];
        }

        $teks = preg_replace('/[^\p{L}\p{N}\s]+/u', ' ', $teks) ?? '';
        $kata = preg_split('/\s+/u', trim($teks), -1, PREG_SPLIT_NO_EMPTY) ?: [];

        $kata = array_filter(
            $kata,
            fn ($k) => mb_strlen($k) >= 4 && ! in_array($k, self::KATA_UMUM, true)
        );

        return array_values(array_unique($kata));
    }

    /**
     * Kesamaan dua himpunan kata: irisan dibagi ukuran himpunan yang lebih
     * kecil.
     *
     * Dipilih ketimbang jarak huruf seperti levenshtein karena yang ingin
     * ditangkap adalah kesamaan MAKSUD, bukan kesamaan ejaan. Dua RTP yang
     * sama isinya tetapi berbeda susunan kalimatnya tertangkap di sini, dan
     * itu justru bentuk duplikasi yang paling sering terjadi ketika dua orang
     * menuliskan rencana yang sama.
     *
     * Pembaginya himpunan terkecil, bukan gabungan keduanya (Jaccard), karena
     * duplikasi RTP di lapangan hampir selalu berupa satu rumusan yang lebih
     * rinci daripada yang lain — "Menyusun prosedur baku verifikasi berkas
     * peserta" dan "Menyusun standar operasional prosedur verifikasi berkas
     * peserta jaminan kesehatan" berbagi seluruh pokoknya, tetapi Jaccard
     * menghukum selisih panjangnya sampai skornya jatuh di bawah ambang.
     *
     * Harga yang dibayar: rumusan yang sangat pendek jadi mudah dianggap
     * terkandung dalam rumusan panjang. Itulah sebabnya sisi terpendek harus
     * memuat sekurangnya MINIMAL_KATA kata pokok.
     *
     * @param  array<int, string>  $a
     * @param  array<int, string>  $b
     */
    private function kesamaan(array $a, array $b): float
    {
        $terkecil = min(count($a), count($b));

        if ($terkecil < self::MINIMAL_KATA) {
            return 0.0;
        }

        return count(array_intersect($a, $b)) / $terkecil;
    }
}
