<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Process;

/**
 * Pemeriksaan keadaan repo git di server INI sebelum kode ditarik dari
 * GitHub (tombol Deploy/Pull) atau didorong ke sana (tombol Push).
 *
 * Latar: aplikasi ini boleh disalin instansi lain. Salinan itu biasanya
 * masih menunjuk origin ke repo asal dan lambat laun kodenya diubah
 * sendiri. Kalau dalam keadaan begitu tombol Deploy ditekan, `git pull`
 * gagal di tengah jalan (konflik, "would be overwritten by merge"), atau
 * lebih buruk: lolos tetapi menghasilkan gabungan kode yang tidak pernah
 * diuji siapa pun. Karena itu setiap perbedaan antara kode lokal dan kode
 * di GitHub dianggap HALANGAN — tidak ada tombol paksa. Pemiliknya harus
 * merapikan repo lewat terminal (commit/push/stash/reset) sampai
 * pemeriksaan ini bersih.
 *
 * Yang dianggap halangan:
 *  - remote tidak terjangkau (fetch gagal) — tidak bisa tahu bedanya;
 *  - ada berkas terlacak yang berubah atau berkas baru yang belum di-commit;
 *  - ada commit lokal yang tidak ada di GitHub (kode di sini "di depan");
 *  - riwayat bercabang (lokal dan GitHub sama-sama punya commit sendiri),
 *    sehingga pull tidak bisa fast-forward.
 *
 * Yang hanya informasi: jumlah commit yang akan masuk, berapa migrasi baru
 * ikut serta, dan apakah composer.lock / package-lock.json berubah.
 */
class PemeriksaanGitService
{
    public function __construct(private readonly string $base = '') {}

    private function base(): string
    {
        return $this->base !== '' ? $this->base : base_path();
    }

    /**
     * `git status` tanpa filter Git LFS.
     *
     * Deploy menarik video LFS sebagai root. Berkas yang ditulis pada detik
     * yang sama dengan indeks dianggap git "meragukan" dan isinya diperiksa
     * ulang lewat filter clean LFS, yang harus menulis ke .git/lfs/tmp milik
     * root. Pemeriksaan ini berjalan sebagai www-data, jadi status gagal
     * ("permission denied") dan tombol Deploy terkunci walau kodenya sama
     * persis dengan GitHub (13 November 2026, sesudah video tutorial baru).
     * Tanpa filter, berkas LFS yang meragukan tampak berubah; kecocokannya
     * diperiksa sendiri di buangLfsYangSama() tanpa menulis apa pun.
     */
    private const TANPA_LFS = ['-c', 'filter.lfs.process=', '-c', 'filter.lfs.clean=', '-c', 'filter.lfs.smudge=', '-c', 'filter.lfs.required=false'];

    /**
     * Buang dari daftar `status --porcelain` berkas LFS yang isinya ternyata
     * sama persis dengan penunjuk LFS di HEAD (ukuran dan SHA-256 cocok).
     * Hasil hash disimpan per ukuran+waktu ubah berkas, jadi berkas ratusan
     * MB hanya dihitung sekali.
     *
     * @param  list<string>  $baris
     * @return list<string>
     */
    private function buangLfsYangSama(array $baris): array
    {
        return array_values(array_filter($baris, function (string $b) {
            if (! str_starts_with($b, ' M ')) {
                return true;
            }
            $jalur = substr($b, 3);
            [$ok, $penunjuk] = $this->git(['cat-file', '-p', 'HEAD:'.$jalur]);
            if (! $ok || ! preg_match('/^oid sha256:([0-9a-f]{64})$/m', $penunjuk, $oid) || ! preg_match('/^size (\d+)$/m', $penunjuk, $ukuran)) {
                return true;
            }
            $berkas = $this->base().DIRECTORY_SEPARATOR.$jalur;
            if (! is_file($berkas) || filesize($berkas) !== (int) $ukuran[1]) {
                return true;
            }
            $kunci = 'git_lfs_sha:'.md5($jalur.'|'.filesize($berkas).'|'.filemtime($berkas));
            $sha = Cache::remember($kunci, now()->addDays(30), fn () => hash_file('sha256', $berkas));

            return $sha !== $oid[1];
        }));
    }

    /** Jalankan satu perintah git; kembalikan [sukses, keluaran-terpangkas]. */
    private function git(array $arg, int $timeout = 30, bool $pangkasKiri = true): array
    {
        $r = Process::timeout($timeout)->run(array_merge(['git', '-C', $this->base()], $arg));
        $keluaran = $r->output() !== '' ? $r->output() : $r->errorOutput();

        // `status --porcelain` diawali spasi bermakna (" M jalur" = berubah
        // tetapi belum di-stage); trim() biasa memakannya di baris pertama.
        return [$r->successful(), $pangkasKiri ? trim($keluaran) : rtrim($keluaran)];
    }

    /**
     * @return array{
     *   remote:string, cabang:string, lokal:string, jauh:string,
     *   berubah:list<string>, di_depan:int, di_belakang:int, bisa_maju:bool,
     *   migrasi_masuk:int, lock_berubah:list<string>, halangan:list<string>,
     *   diperiksa_pada:string
     * }
     */
    public function periksa(): array
    {
        $halangan = [];

        [$ok, $remote] = $this->git(['remote', 'get-url', 'origin']);
        if (! $ok) {
            $remote = '';
            $halangan[] = 'Repo ini tidak punya remote "origin" — tidak ada sumber untuk ditarik.';
        }

        [$ok, $cabang] = $this->git(['rev-parse', '--abbrev-ref', 'HEAD']);
        if (! $ok || $cabang === 'HEAD') {
            $halangan[] = 'Kode sedang tidak berada di sebuah cabang (detached HEAD), biasanya sisa checkout ke tag. Kembalikan ke cabang utama dulu.';
            $cabang = $ok ? $cabang : '';
        }

        [$ok, $lokal] = $this->git(['rev-parse', '--short', 'HEAD']);
        $lokal = $ok ? $lokal : '';

        [$ok, $status] = $this->git([...self::TANPA_LFS, 'status', '--porcelain'], pangkasKiri: false);
        $berubah = $ok ? $this->buangLfsYangSama(array_values(array_filter(explode("\n", $status)))) : [];
        if (! $ok) {
            $halangan[] = 'git status gagal: '.$status;
        } elseif ($berubah !== []) {
            $halangan[] = count($berubah).' berkas di server ini berbeda dari commit terakhir (diubah atau ditambah tanpa commit). Menarik kode di atasnya bisa menimpa atau bentrok.';
        }

        $jauh = '';
        $diDepan = 0;
        $diBelakang = 0;
        $bisaMaju = false;
        $migrasiMasuk = 0;
        $lockBerubah = [];

        if ($remote !== '' && $cabang !== '' && $cabang !== 'HEAD') {
            [$ok, $pesan] = $this->git(['fetch', '--quiet', 'origin', $cabang], 60);
            if (! $ok && PHP_OS_FAMILY !== 'Windows') {
                // Di server produksi repo milik root, jadi www-data tidak bisa
                // menulis .git/FETCH_HEAD. Satu baris sudoers mengizinkan
                // persis perintah fetch ini (lihat docs/server/deploy-mrkabar.sh).
                $r = Process::timeout(60)->run(['sudo', '-n', 'git', '-C', $this->base(), 'fetch', '--quiet', 'origin', $cabang]);
                if ($r->successful()) {
                    $ok = true;
                }
            }
            if (! $ok) {
                $halangan[] = 'GitHub tidak terjangkau dari server ini ('.mb_substr($pesan, 0, 160).'). Tanpa itu perbedaan kode tidak bisa dipastikan.';
            } else {
                $acuan = 'origin/'.$cabang;
                [$ok, $jauh] = $this->git(['rev-parse', '--short', $acuan]);
                $jauh = $ok ? $jauh : '';

                [$ok, $hitung] = $this->git(['rev-list', '--left-right', '--count', 'HEAD...'.$acuan]);
                if ($ok && preg_match('/^(\d+)\s+(\d+)$/', $hitung, $m)) {
                    $diDepan = (int) $m[1];
                    $diBelakang = (int) $m[2];
                }

                [$bisaMaju] = $this->git(['merge-base', '--is-ancestor', 'HEAD', $acuan]);

                if ($diDepan > 0) {
                    $halangan[] = $diDepan.' commit di server ini tidak ada di GitHub. Kode di sini sudah menyimpang dari sumbernya — push dulu ke repo sendiri, atau kembalikan ke commit GitHub, sebelum menarik pembaruan.';
                }
                if (! $bisaMaju && $diDepan === 0 && $diBelakang > 0) {
                    $halangan[] = 'Riwayat kode server ini dan GitHub bercabang sehingga tidak bisa digabung otomatis.';
                }

                if ($diBelakang > 0) {
                    [$ok, $berkas] = $this->git(['diff', '--name-only', 'HEAD', $acuan]);
                    $daftar = $ok ? array_filter(explode("\n", $berkas)) : [];
                    foreach ($daftar as $f) {
                        if (str_starts_with($f, 'database/migrations/')) {
                            $migrasiMasuk++;
                        }
                        if (in_array($f, ['composer.lock', 'package-lock.json'], true)) {
                            $lockBerubah[] = $f;
                        }
                    }
                }
            }
        }

        // Hasil CI GitHub untuk commit yang akan ditarik: CI gagal = halangan,
        // belum selesai = informasi. Hanya untuk remote GitHub; repo lain
        // dilewati diam-diam.
        $ci = $jauh !== '' ? $this->statusCi($remote, $acuan ?? '') : null;
        if ($ci && $ci['kesimpulan'] === 'failure') {
            $halangan[] = 'Pemeriksaan otomatis (CI) untuk commit GitHub '.$jauh.' GAGAL. Perbaiki dulu di repo sampai hijau.';
        }

        return [
            'ci' => $ci,
            'remote' => $remote,
            'cabang' => $cabang,
            'lokal' => $lokal,
            'jauh' => $jauh,
            'berubah' => array_slice($berubah, 0, 30),
            'di_depan' => $diDepan,
            'di_belakang' => $diBelakang,
            'bisa_maju' => $bisaMaju,
            'migrasi_masuk' => $migrasiMasuk,
            'lock_berubah' => $lockBerubah,
            'halangan' => $halangan,
            'diperiksa_pada' => now()->toDateTimeString(),
        ];
    }

    /**
     * Status CI GitHub Actions untuk sebuah ref, diingat 3 menit. Tanpa
     * token (repo publik): batas 60 permintaan/jam sudah lebih dari cukup.
     *
     * @return array{kesimpulan:string,status:string,url:string}|null
     */
    private function statusCi(string $remote, string $acuan): ?array
    {
        if (! preg_match('#github\.com[:/]([^/]+)/([^/.]+)#', $remote, $m) || $acuan === '') {
            return null;
        }
        [$ok, $sha] = $this->git(['rev-parse', $acuan]);
        if (! $ok) {
            return null;
        }

        return Cache::remember('ci_status:'.$sha, 180, function () use ($m, $sha) {
            try {
                $r = Http::timeout(8)->acceptJson()
                    ->get("https://api.github.com/repos/{$m[1]}/{$m[2]}/commits/{$sha}/check-runs", ['per_page' => 20]);
                if (! $r->ok()) {
                    return null;
                }
                $runs = collect($r->json('check_runs', []));
                if ($runs->isEmpty()) {
                    return null;
                }
                $status = $runs->every(fn ($c) => $c['status'] === 'completed') ? 'completed' : 'in_progress';
                $kesimpulan = $status !== 'completed' ? 'pending'
                    : ($runs->contains(fn ($c) => in_array($c['conclusion'], ['failure', 'timed_out', 'cancelled'], true)) ? 'failure' : 'success');

                return ['kesimpulan' => $kesimpulan, 'status' => $status, 'url' => (string) ($runs->first()['html_url'] ?? '')];
            } catch (\Throwable) {
                return null;
            }
        });
    }

    /** Halangan khusus sebelum PUSH: kode lokal tertinggal dari GitHub. */
    public function halanganPush(array $hasil): array
    {
        $halangan = array_values(array_filter($hasil['halangan'], fn ($h) => ! str_contains($h, 'berkas di server ini berbeda') && ! str_contains($h, 'commit di server ini tidak ada di GitHub')));
        if ($hasil['di_belakang'] > 0) {
            $halangan[] = 'GitHub punya '.$hasil['di_belakang'].' commit yang belum ada di sini. Tarik dulu (Deploy/Pull) supaya push tidak menimpa pekerjaan orang lain.';
        }

        return $halangan;
    }
}
