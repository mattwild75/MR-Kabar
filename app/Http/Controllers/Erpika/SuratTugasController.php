<?php

namespace App\Http\Controllers\Erpika;

use App\Http\Controllers\Controller;
use App\Models\RppPenugasan;
use App\Services\Arep\ArepData;
use App\Services\Arep\ArepWordService;
use App\Services\PdfPrintService;
use Illuminate\Http\Request;
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
        ]);
    }

    public function pdf(Request $request, RppPenugasan $penugasan)
    {
        $dok = $request->input('dok', 'semua');
        $url = url("/erpika/arep/surat-tugas/{$penugasan->id}/preview?dok={$dok}");

        return PdfPrintService::downloadFromUrl($request, $url, $this->namaBerkas($penugasan, $dok));
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
