<?php

namespace App\Http\Controllers;

use App\Models\Rpp;
use App\Models\RppCategory;
use App\Models\RppSetting;
use App\Services\PdfPrintService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class RppPrintController extends Controller
{
    private const BULAN = [
        1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
        5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
        9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
    ];

    public function index(Request $request)
    {
        $query = Rpp::with(['category'])
            ->orderByDesc('year')
            ->orderBy('nomor_rpp');

        if (! $request->user()->canViewAllOpd()) {
            $query->where('user_id', $request->user()->id);
        }

        if ($request->filled('year')) {
            $query->where('year', $request->input('year'));
        }

        if ($request->filled('rpp_category_id')) {
            $query->where('rpp_category_id', $request->input('rpp_category_id'));
        }

        $rpps = $query->paginate(25)->withQueryString();

        return Inertia::render('rpp/Cetak', [
            'rpps' => $rpps,
            'categories' => RppCategory::orderBy('order')->get(),
            'filters' => $request->only(['year', 'rpp_category_id']),
        ]);
    }

    /**
     * Pratinjau web (Inertia) SEKALIGUS sumber PDF-nya.
     *
     * Di ERPIKA (asal modul ini) pratinjau dirender React dan PDF-nya dibangun
     * TERPISAH lewat Blade + dompdf, dari data yang sama — dua tampilan yang
     * harus dijaga tetap sinkron tiap kali tata letak berubah. Di MR Kabar
     * aturannya satu: seluruh Form Cetak di-screenshot Browsershot dari halaman
     * React itu sendiri (lihat PdfPrintService), sehingga yang diunduh selalu
     * persis yang dilihat. Blade pdf.rpp-* karena itu TIDAK ikut dibawa.
     */
    public function previewTabel(Request $request, Rpp $rpp)
    {
        $this->authorizeView($request, $rpp);

        $data = $this->buildTabelData($rpp);

        return Inertia::render('rpp/PreviewTabel', $data);
    }

    public function previewPengantar(Request $request, Rpp $rpp)
    {
        $this->authorizeView($request, $rpp);

        $data = $this->buildPengantarData($rpp);

        return Inertia::render('rpp/PreviewPengantar', $data);
    }

    public function tabel(Request $request, Rpp $rpp)
    {
        $this->authorizeView($request, $rpp);

        $url = url("/rpp-cetak/{$rpp->id}/tabel/preview");

        return PdfPrintService::downloadFromUrl($request, $url, 'RPP-Tabel-'.str($rpp->nomor_rpp ?: $rpp->id)->slug()->limit(40, ''));
    }

    public function pengantar(Request $request, Rpp $rpp)
    {
        $this->authorizeView($request, $rpp);

        $url = url("/rpp-cetak/{$rpp->id}/pengantar/preview");

        return PdfPrintService::downloadFromUrl($request, $url, 'RPP-Pengantar-'.str($rpp->nomor_rpp ?: $rpp->id)->slug()->limit(40, ''));
    }

    private function buildTabelData(Rpp $rpp): array
    {
        Carbon::setLocale('id');
        $rpp->load(['category', 'teamMembers', 'obriks', 'laporans']);
        $setting = RppSetting::current()->load('inspektur');

        $tarifPerHari = $setting->tarif_per_hari;
        $totalBiaya = 0;
        foreach ($rpp->teamMembers as $member) {
            $hari = ($member->hari_kantor ?? 0) + ($member->hari_lapangan ?? 0);
            $totalBiaya += $hari * $tarifPerHari;
        }

        return [
            'rpp' => $rpp,
            'setting' => $setting,
            'tarifPerHari' => $tarifPerHari,
            'totalBiaya' => $totalBiaya,
            'bulanNama' => self::BULAN[$rpp->bulan] ?? null,
        ];
    }

    private function buildPengantarData(Rpp $rpp): array
    {
        Carbon::setLocale('id');
        $rpp->load(['category']);
        $setting = RppSetting::current()->load('inspektur');

        return [
            'rpp' => $rpp,
            'setting' => $setting,
        ];
    }

    private function authorizeView(Request $request, Rpp $rpp): void
    {
        if (! $request->user()->canViewAllOpd() && $rpp->user_id !== $request->user()->id) {
            abort(403, 'Anda tidak dapat mencetak RPP milik pengguna lain.');
        }
    }
}
