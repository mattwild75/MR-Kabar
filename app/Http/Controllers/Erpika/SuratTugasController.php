<?php

namespace App\Http\Controllers\Erpika;

use App\Http\Controllers\Controller;
use App\Models\RppPenugasan;
use App\Services\Arep\ArepData;
use App\Services\Arep\ArepWordService;
use App\Services\NaskahWordService;
use App\Services\PdfPrintService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Inertia\Inertia;

/**
 * ERPIKA > AREP > Surat Tugas — menerbitkan paket penugasan dari data RPP
 * Perencanaan: Surat Tugas (ST), Surat Pengantar/Penyampaian (SP), dan
 * Pernyataan Independensi dan Integritas. Cetak PDF (Browsershot dari
 * pratinjau React, satu jalur dengan seluruh Form Cetak) dan Word (.docx).
 */
class SuratTugasController extends Controller
{
    use ArepPenugasanQuery;

    public function index(Request $request)
    {
        return Inertia::render('erpika/arep/surat-tugas/Index', $this->daftarPenugasan($request));
    }

    public function preview(Request $request, RppPenugasan $penugasan, ArepData $data)
    {
        return Inertia::render('erpika/arep/surat-tugas/Cetak', [
            'data' => $data->untukPenugasan($penugasan),
            'dokumen' => $request->input('dok', 'semua'),
            'mulaiSunting' => $request->boolean('edit'),
        ]);
    }

    /** Halaman render HTML hasil suntingan (dikunjungi Browsershot untuk PDF). */
    public function suntingan(string $token)
    {
        $html = Cache::get('arep-st-suntingan:'.$token) ?? abort(404);

        return Inertia::render('erpika/arep/surat-tugas/Cetak', ['suntingan' => $html]);
    }

    /** PDF dari HTML yang sudah disunting di pratinjau. */
    public function pdfSuntingan(Request $request, RppPenugasan $penugasan)
    {
        $v = $request->validate(['html' => ['required', 'string', 'max:3000000'], 'dok' => ['nullable', 'string']]);
        $token = Str::random(32);
        Cache::put('arep-st-suntingan:'.$token, $v['html'], 600);

        return PdfPrintService::downloadFromUrl($request, url('/erpika/arep/surat-tugas/suntingan/'.$token), $this->namaBerkas($penugasan, $v['dok'] ?? 'semua').'-suntingan', PdfPrintService::ukuranDariCss());
    }

    /** Word dari HTML yang sudah disunting di pratinjau. */
    public function wordSuntingan(Request $request, RppPenugasan $penugasan, NaskahWordService $word)
    {
        $v = $request->validate(['html' => ['required', 'string', 'max:3000000'], 'dok' => ['nullable', 'string']]);
        $isi = $word->dariHtml($v['html']);

        return response($isi, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition' => 'attachment; filename="'.$this->namaBerkas($penugasan, $v['dok'] ?? 'semua').'-suntingan.docx"',
        ]);
    }

    public function pdf(Request $request, RppPenugasan $penugasan)
    {
        $dok = $request->input('dok', 'semua');
        $url = url("/erpika/arep/surat-tugas/{$penugasan->id}/preview?dok={$dok}");

        return PdfPrintService::downloadFromUrl($request, $url, $this->namaBerkas($penugasan, $dok), PdfPrintService::ukuranDariCss());
    }

    public function word(Request $request, RppPenugasan $penugasan, ArepData $data, ArepWordService $word)
    {
        $dok = $request->input('dok', 'semua');
        $isi = $word->paketSuratTugas($data->untukPenugasan($penugasan), $dok);

        return response($isi, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition' => 'attachment; filename="'.$this->namaBerkas($penugasan, $dok).'.docx"',
        ]);
    }

    private function namaBerkas(RppPenugasan $penugasan, string $dok): string
    {
        $label = match ($dok) {
            'st' => 'Surat-Tugas',
            'sp' => 'Surat-Pengantar',
            'pernyataan' => 'Pernyataan-Independensi',
            default => 'Paket-Surat-Tugas',
        };

        return $label.'-'.str($penugasan->nomor_st)->slug()->limit(40, '');
    }
}
