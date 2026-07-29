<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\SettingApp;
use App\Services\FaviconGenerator;
use Illuminate\Http\Request;

class SettingAppController extends Controller
{
    /**
     * Lapis kedua di luar permission_name menu — sebelumnya tidak ada
     * pengecekan role sama sekali di sini, murni bergantung pada
     * middleware menu.permission ("app-settings-view"). Method ini juga
     * menangani upload file (logo/favicon), jadi celahnya bukan cuma baca-
     * tulis pengaturan tapi juga penulisan file ke storage publik.
     */
    private function ensureAdmin(): void
    {
        if (!auth()->user()?->canViewAllOpd()) {
            abort(403, 'Hanya Admin/Super Admin yang dapat mengelola App Settings.');
        }
    }

    public function edit()
    {
        $this->ensureAdmin();

        $setting = SettingApp::first();
        return Inertia::render('settingapp/Form', ['setting' => $setting]);
    }

    public function update(Request $request)
    {
        $this->ensureAdmin();

        $data = $request->validate([
            'nama_app'                => 'required|string|max:255',
            'deskripsi'               => 'nullable|string',
            'logo'                    => 'nullable|file|image|mimes:png,jpg,jpeg,svg,webp|max:2048',
            'logo_bg'                 => 'nullable|string|max:20',
            'favicon'                 => 'nullable|file|image|mimes:ico,png,jpg,jpeg,webp|max:1024',
            'favicon_from_logo'       => 'nullable|boolean',
            'login_splash_enabled'    => 'nullable|boolean',
            'login_splash_video'      => 'nullable|file|mimes:mp4,webm,mov|max:20480',
            'login_splash_video_remove' => 'nullable|boolean',
            'login_splash_muted'      => 'nullable|boolean',
            'edu_video_enabled'       => 'nullable|boolean',
            'edu_video_path'          => 'nullable|file|mimes:mp4,webm,mov|max:51200',
            'edu_video_remove'        => 'nullable|boolean',
            'edu_video_gain_narration' => 'nullable|integer|min:0|max:200',
            'edu_video_gain_music'    => 'nullable|integer|min:0|max:200',
            'edu_video_gain_sfx'      => 'nullable|integer|min:0|max:200',
            'edu_video_subtitle_enabled' => 'nullable|boolean',
            'edu_video_subtitle_size' => 'nullable|integer|min:50|max:200',
            'warna'                   => 'nullable|string|max:20',
            'seo'                     => 'nullable|array',
            'contact_email'           => 'nullable|email|max:255',
            'contact_email_secondary' => 'nullable|email|max:255',
            'footer_credit'           => 'nullable|string|max:255',
        ]);

        $setting = SettingApp::firstOrNew();
        $generateFaviconFromLogo = (bool) ($data['favicon_from_logo'] ?? false);
        unset($data['favicon_from_logo']);

        // Checkbox HTML yg TIDAK dicentang tidak pernah terkirim ke server
        // sama sekali (bukan terkirim "false") — WAJIB diberi default
        // eksplisit di sini, kalau tidak, kolom boolean ini akan selalu
        // ke-cast jadi null lalu dianggap falsy tiap kali form disimpan
        // (baik dicentang atau tidak), padahal frontend SELALU mengirim
        // nilai eksplisit true/false (lihat Form.tsx: transform() di
        // sana), jadi baris ini murni jaga-jaga kalau request datang dari
        // luar form standar (mis. API lain di masa depan).
        $data['login_splash_enabled'] = $request->boolean('login_splash_enabled');
        $data['login_splash_muted'] = $request->boolean('login_splash_muted');
        $data['edu_video_enabled'] = $request->boolean('edu_video_enabled');
        $data['edu_video_subtitle_enabled'] = $request->boolean('edu_video_subtitle_enabled');

        $removeSplashVideo = (bool) ($data['login_splash_video_remove'] ?? false);
        unset($data['login_splash_video_remove']);

        $removeEduVideo = (bool) ($data['edu_video_remove'] ?? false);
        unset($data['edu_video_remove']);


        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('logo', 'public');
        } else {
            unset($data['logo']);
        }

        if ($request->hasFile('favicon')) {
            $data['favicon'] = $request->file('favicon')->store('favicon', 'public');
        } else {
            unset($data['favicon']);
        }

        if ($request->hasFile('login_splash_video')) {
            $data['login_splash_video'] = $request->file('login_splash_video')->store('login-splash', 'public');
        } elseif ($removeSplashVideo) {
            // Hapus video splash kembali ke "tanpa video kustom" — halaman
            // login-splash.tsx fallback ke video statis bawaan
            // (/media/logo-animation.mp4) kalau kolom ini kosong, BUKAN
            // langsung menonaktifkan splash sama sekali (itu tanggung
            // jawab toggle login_splash_enabled yang terpisah).
            $data['login_splash_video'] = null;
        } else {
            unset($data['login_splash_video']);
        }

        if ($request->hasFile('edu_video_path')) {
            $data['edu_video_path'] = $request->file('edu_video_path')->store('edu-video', 'public');
        } elseif ($removeEduVideo) {
            // Kembali ke "tanpa video kustom" — login.tsx fallback ke video
            // bawaan /video/video-edukasi-mr-kabar.mp4 kalau kolom ini
            // kosong, BUKAN langsung menonaktifkan tombol video sama
            // sekali (itu tanggung jawab toggle edu_video_enabled).
            $data['edu_video_path'] = null;
        } else {
            unset($data['edu_video_path']);
        }


        $setting->fill($data)->save();

        // Auto-generate the favicon from the logo + background color, only
        // when explicitly requested — this never runs silently on its own.
        if ($generateFaviconFromLogo && $setting->logo) {
            $bgColor = $setting->logo_bg ?: '#ffffff';
            $faviconPath = FaviconGenerator::generate($setting->logo, $bgColor, 64);
            $setting->favicon = $faviconPath;
            $setting->save();
        }

        SettingApp::clearCached();

        return redirect()->back()->with('success', 'Pengaturan berhasil disimpan.');
    }
}
