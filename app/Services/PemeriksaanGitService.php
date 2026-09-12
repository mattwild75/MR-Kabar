<?php

namespace App\Services;

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

    /** Jalankan satu perintah git; kembalikan [sukses, keluaran-terpangkas]. */
    private function git(array $arg, int $timeout = 30): array
    {
        $r = Process::timeout($timeout)->run(array_merge(['git', '-C', $this->base()], $arg));

        return [$r->successful(), trim($r->output() !== '' ? $r->output() : $r->errorOutput())];
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

        [$ok, $status] = $this->git(['status', '--porcelain']);
        $berubah = $ok ? array_values(array_filter(explode("\n", $status))) : [];
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

        return [
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
