<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\SettingApp;
use App\Services\FaviconGenerator;
use Illuminate\Http\Request;

class SettingAppController extends Controller
{
    public function edit()
    {
        $setting = SettingApp::first();
        return Inertia::render('settingapp/Form', ['setting' => $setting]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'nama_app'                => 'required|string|max:255',
            'deskripsi'               => 'nullable|string',
            'logo'                    => 'nullable|file|image|mimes:png,jpg,jpeg,svg,webp|max:2048',
            'logo_bg'                 => 'nullable|string|max:20',
            'favicon'                 => 'nullable|file|image|mimes:ico,png,jpg,jpeg,webp|max:1024',
            'favicon_from_logo'       => 'nullable|boolean',
            'warna'                   => 'nullable|string|max:20',
            'seo'                     => 'nullable|array',
            'contact_email'           => 'nullable|email|max:255',
            'contact_email_secondary' => 'nullable|email|max:255',
            'footer_credit'           => 'nullable|string|max:255',
        ]);

        $setting = SettingApp::firstOrNew();
        $generateFaviconFromLogo = (bool) ($data['favicon_from_logo'] ?? false);
        unset($data['favicon_from_logo']);

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
