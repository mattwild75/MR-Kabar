<?php

namespace App\Http\Middleware;

use App\Models\SettingApp;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
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
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user()?->load('roles:id,name'),
                // Dipakai frontend untuk menyembunyikan tombol aksi. Ini
                // MURNI kosmetik — penjaga sesungguhnya ada di middleware
                // ViewerReadOnly di sisi server.
                'isViewer' => (bool) $request->user()?->isViewerOnly(),
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
            ],
            'setting' => fn() => SettingApp::cached(),
            // Penanda versi berkas video edukasi bawaan, ditempelkan sebagai
            // query string pada URL-nya di sisi klien. Nama berkasnya tetap
            // sama tiap kali video di-deploy ulang, sehingga tanpa penanda ini
            // peramban akan terus memakai salinan lamanya dari cache — berkas
            // 70MB tidak akan diminta ulang hanya karena isinya berubah.
            'eduVideoVersion' => fn() => @filemtime(public_path('video/video-edukasi-mr-kabar.mp4')) ?: null,
            'unreadNotificationsCount' => fn() => $request->user()?->unreadNotifications()->count() ?? 0,
        ]);
    }
}
