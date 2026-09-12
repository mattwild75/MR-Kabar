<?php

namespace App\Http\Controllers;

use App\Models\RppSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Pengaturan RPP — ERPIKA > Perencanaan.
 *
 * Tarif per hari dan Inspektur penanda tangan (`rpp_settings`). Lembar Cetak
 * RPP menaruh nama dan NIP Inspektur di blok tanda tangan; selama kosong,
 * cetakannya berbunyi "............". Pengelolaan pegawainya ada di
 * Erpika\PegawaiController — milik seluruh ERPIKA, bukan RPP saja.
 *
 * Hanya akun lintas OPD (admin/super-admin): ini pengaturan Inspektorat,
 * bukan milik seorang pembuat RPP.
 */
class RppPengaturanController extends Controller
{
    public function index(Request $request)
    {
        $this->pastikanAdmin($request);

        return Inertia::render('rpp/Pengaturan', [
            'setting' => RppSetting::current(),
            // Penanda tangan hanya Inspektur — bukan pilihan. Diambil dari pegawai
            // berjabatan "Inspektur" di ERPIKA > Pegawai.
            'inspektur' => RppSetting::inspektur()?->only(['id', 'nama', 'nip', 'pangkat', 'golongan']),
        ]);
    }

    public function updateSetting(Request $request)
    {
        $this->pastikanAdmin($request);

        $data = $request->validate([
            'tarif_per_hari' => ['required', 'integer', 'min:0'],
        ]);

        RppSetting::current()->update($data);

        return back()->with('success', 'Pengaturan RPP disimpan.');
    }

    private function pastikanAdmin(Request $request): void
    {
        abort_unless($request->user()->canViewAllOpd(), 403, 'Pengaturan RPP hanya untuk admin.');
    }
}
