<?php

namespace App\Http\Middleware;

use App\Models\SettingApp;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Process;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return array_merge(parent::share($request), [
            'name' => config('app.name'),
            // Versi aplikasi dibaca dari tag git terbaru, bukan ditulis di
            // berkas konfigurasi. Nomor versi yang ditulis tangan pasti akan
            // tertinggal dari tag suatu saat, dan ketika itu terjadi tidak ada
            // yang menyadarinya. Hasilnya di-cache 1 jam supaya tidak
            // memanggil git pada setiap permintaan.
            'versi' => cache()->remember('versi-aplikasi', 3600, function () {
                $hasil = Process::path(base_path())
                    ->timeout(5)
                    ->run('git describe --tags --abbrev=0');

                return $hasil->successful() ? trim($hasil->output()) : null;
            }),
            // Commit kode yang sedang berjalan + waktu deploy terakhir: dipakai
            // pita "Aplikasi baru diperbarui" yang tampil sekali per commit di
            // peramban tiap pengguna (localStorage), supaya orang tahu ada
            // yang berubah tanpa mengganggu pekerjaannya.
            'rilis' => cache()->remember('rilis-kode', 600, function () {
                $hasil = Process::path(base_path())->timeout(5)->run('git log -1 --format=%h|%cI|%s');
                if (! $hasil->successful()) {
                    return null;
                }
                [$kode, $waktu, $pesan] = array_pad(explode('|', trim($hasil->output()), 3), 3, '');

                return ['kode' => $kode, 'waktu' => $waktu, 'pesan' => $pesan];
            }),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user()?->load('roles:id,name'),
                // Dipakai frontend untuk menyembunyikan tombol aksi. Ini
                // MURNI kosmetik — penjaga sesungguhnya ada di middleware
                // ViewerReadOnly di sisi server.
                'isViewer' => (bool) $request->user()?->isViewerOnly(),
                // Dibedakan dari isViewer supaya pita penjelasnya jujur: akun
                // APIP memang tidak dapat mengubah data risiko, tetapi bukan
                // berarti tidak dapat mengubah apa pun.
                'isApip' => (bool) $request->user()?->isApip(),
            ],
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
                // Keadaan ketiga: aksi utamanya berhasil, tapi ada bagian yang
                // tidak jadi dikerjakan dan operator harus tahu. Dilaporkan
                // sebagai 'success' akan menyesatkan, sebagai 'error' akan
                // membuat orang mengira semuanya batal.
                'warning' => session('warning'),
                'justLoggedIn' => session('just_logged_in'),
                'importResult' => session('importResult'),
                // Nomor baris risiko yang baru saja dibuat. Dipakai halaman
                // untuk mengunggah bukti dukung yang tadi dipilih sebelum
                // barisnya ada - tanpa ini, berkasnya tidak tahu harus
                // ditempelkan ke mana.
                'createdRiskId' => session('createdRiskId'),
                // Kode QR + kunci teks hasil langkah 'siapkan', dan sepuluh
                // kode pemulihan hasil langkah 'nyalakan'. Keduanya lewat
                // flash, bukan prop tetap: masing-masing hanya boleh tampil
                // sekali, tepat sesudah aksinya, lalu hilang saat halaman
                // dimuat ulang.
                'duaFaktorSiap' => session('duaFaktorSiap'),
                'duaFaktorKodePemulihan' => session('duaFaktorKodePemulihan'),
                // Nomor tiket + kode akses laporan kecurangan yang baru
                // dikirim, dan hasil pemeriksaan tiket. Keduanya lewat flash
                // dengan alasan yang sama seperti kode dua faktor di atas:
                // kode aksesnya hanya boleh muncul SEKALI, dan tidak boleh
                // ikut termuat lagi ketika halamannya dibuka ulang — sebab
                // yang tersimpan di server hanya hashnya.
                'tiketBaru' => session('tiketBaru'),
                'hasilTiket' => session('hasilTiket'),
            ],
            // TIDAK dibagikan ke /panduan-publik. Halaman itu terbuka tanpa
            // login, dan baris settingapp memuat 32 kolom — di antaranya
            // contact_email, yang berisi surel pribadi pemegang akun Super
            // Admin. Seluruhnya ikut terserialisasi ke atribut data-page dan
            // terbaca siapa pun lewat view-source; terbukti pada audit PASS 1.
            //
            // Halaman itu memang tidak memakainya sama sekali (Public.tsx
            // tidak menyentuh prop `setting`), sedangkan halaman login MASIH
            // memerlukannya untuk logo, nama aplikasi, dan video pembuka —
            // jadi penyaringnya berdasarkan nama rute, bukan "sudah login
            // atau belum".
            'setting' => fn () => $request->routeIs('panduan.public')
                ? null
                : SettingApp::cached(),
            // Penanda versi berkas video edukasi bawaan, ditempelkan sebagai
            // query string pada URL-nya di sisi klien. Nama berkasnya tetap
            // sama tiap kali video di-deploy ulang, sehingga tanpa penanda ini
            // peramban akan terus memakai salinan lamanya dari cache — berkas
            // 70MB tidak akan diminta ulang hanya karena isinya berubah.
            'eduVideoVersion' => fn () => @filemtime(public_path('video/video-edukasi-mr-kabar.mp4')) ?: null,
            // Penanda versi video tutorial pengisian, alasannya sama persis.
            'tutorialVideoVersion' => fn () => @filemtime(public_path('video/tutorial-mr-kabar.mp4')) ?: null,
            // Dulu ada 'laporVideoVersion' di sini. Video Lapor sudah tidak
            // ada lagi sebagai video tersendiri sejak 13 Agustus 2026 — isinya
            // jadi bab VIII-XIII di dalam video tutorial. Penanda itu tertinggal
            // menunjuk berkas yang sudah dihapus, sehingga setiap permintaan
            // halaman mana pun memeriksa berkas yang dipastikan tidak ada.
            'unreadNotificationsCount' => fn () => $request->user()?->unreadNotifications()->count() ?? 0,
        ]);
    }
}
