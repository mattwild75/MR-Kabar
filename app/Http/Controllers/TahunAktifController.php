<?php

namespace App\Http\Controllers;

use App\Models\PengaturanPemda;
use Illuminate\Http\Request;

/**
 * Satu-satunya endpoint untuk mengubah "Tahun Penilaian" aktif Pemda
 * (PengaturanPemda.tahun_penilaian) — sumber kebenaran tunggal yang dipakai
 * sbg default oleh Data Umum, field "TAHUN DINILAI RISIKO" (IRS_Pemda/
 * IRS_PD/IRO_PD), dan Form Cetak. Diekspos lewat kontrol "Tahun Aktif" di
 * halaman-halaman tsb, bukan hanya dari menu Pengaturan Pemda — supaya
 * Admin/Super Admin bisa langsung ganti tahun tanpa berpindah menu. Baris/
 * data historis yang sudah tersimpan tidak berubah.
 *
 * HANYA Admin/Super Admin — nilai ini Pemda-wide (berlaku utk SEMUA OPD
 * sekaligus), jadi PIC OPD biasa TIDAK boleh mengubahnya (bisa mengacaukan
 * tahun penilaian OPD lain tanpa sepengetahuan mereka). PIC hanya melihat
 * versi read-only di TahunAktifBadge (editable=false).
 */
class TahunAktifController extends Controller
{
    public function update(Request $request)
    {
        if (!$request->user()->hasAnyRole(['admin', 'super-admin'])) {
            abort(403, 'Hanya Admin/Super Admin yang dapat mengubah Tahun Penilaian aktif Pemda.');
        }

        $validated = $request->validate([
            'tahun_penilaian' => ['required', 'digits:4', 'integer', 'min:2000', 'max:2100'],
        ]);

        PengaturanPemda::current()->update(['tahun_penilaian' => $validated['tahun_penilaian']]);

        return back()->with('success', 'Tahun aktif berhasil diperbarui menjadi ' . $validated['tahun_penilaian'] . '.');
    }
}
