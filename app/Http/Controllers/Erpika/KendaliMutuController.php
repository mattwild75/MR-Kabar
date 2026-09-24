<?php

namespace App\Http\Controllers\Erpika;

use App\Http\Controllers\Controller;
use App\Models\RppPenugasan;
use App\Services\Arep\ArepData;
use App\Services\Arep\ArepWordService;
use App\Services\Arep\KmExcelService;
use App\Services\PdfPrintService;
use App\Support\Arep\KmKatalog;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * ERPIKA > AREP > Kendali Mutu — 30 Formulir Kendali Mutu (KMA 1–30) menurut
 * Pedoman Kendali Mutu Audit Inspektorat. Item teratas: Keputusan Inspektur
 * (Word). Tiap formulir dicetak PDF (Browsershot dari pratinjau React) dan
 * Excel; yang bisa ditarik dari RPP Perencanaan terisi otomatis, sisanya
 * formulir kosong siap isi.
 */
class KendaliMutuController extends Controller
{
    use ArepPenugasanQuery;

    public function index(Request $request)
    {
        return Inertia::render('erpika/arep/kendali-mutu/Index', $this->daftarPenugasan($request) + [
            'katalog' => KmKatalog::semua(),
        ]);
    }

    public function preview(Request $request, RppPenugasan $penugasan, ArepData $data)
    {
        $forms = $this->formList($request);

        return Inertia::render('erpika/arep/kendali-mutu/Cetak', [
            'data' => $data->untukPenugasan($penugasan),
            'katalog' => KmKatalog::semua(),
            'forms' => $forms,
        ]);
    }

    public function pdf(Request $request, RppPenugasan $penugasan)
    {
        $forms = $this->formList($request);
        $q = implode(',', $forms);
        $url = url("/erpika/arep/kendali-mutu/{$penugasan->id}/preview?form={$q}");
        $label = count($forms) === 1 ? 'KM-'.$forms[0] : 'Kendali-Mutu';

        return PdfPrintService::downloadFromUrl($request, $url, $label.'-'.str($penugasan->nomor_st)->slug()->limit(40, ''));
    }

    public function excel(Request $request, RppPenugasan $penugasan, ArepData $data, KmExcelService $excel)
    {
        $forms = $this->formList($request);
        $nama = (count($forms) === 1 ? 'KM-'.$forms[0] : 'Kendali-Mutu').'-'.str($penugasan->nomor_st)->slug()->limit(40, '').'.xlsx';
        $tmp = tempnam(sys_get_temp_dir(), 'km');
        $excel->simpanKe($data->untukPenugasan($penugasan), $forms, $tmp);

        return response()->download($tmp, $nama, ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])->deleteFileAfterSend(true);
    }

    public function keputusanPreview()
    {
        $insp = \App\Models\RppSetting::inspektur();
        $nip = preg_replace('/\D/', '', (string) ($insp?->nip ?? ''));
        $nipSpasi = strlen($nip) === 18
            ? substr($nip, 0, 8).' '.substr($nip, 8, 6).' '.substr($nip, 14, 1).' '.substr($nip, 15)
            : '............................';

        return Inertia::render('erpika/arep/kendali-mutu/Keputusan', [
            'inspektur' => ['nama' => $insp?->nama ?? '............................', 'nip_spasi' => $nipSpasi],
        ]);
    }

    public function keputusanPdf(Request $request)
    {
        return PdfPrintService::downloadFromUrl($request, url('/erpika/arep/kendali-mutu/keputusan/preview'), 'Keputusan-Inspektur-Pedoman-Kendali-Mutu');
    }

    public function keputusanWord(ArepWordService $word)
    {
        $isi = $word->keputusanInspektur();

        return response($isi, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition' => 'attachment; filename="Keputusan-Inspektur-Pedoman-Kendali-Mutu.docx"',
        ]);
    }

    /**
     * Daftar nomor formulir yang diminta (?form=6 atau ?form=6,7,9); default
     * seluruh katalog. Disaring ke nomor yang sah (1–30).
     *
     * @return list<int>
     */
    private function formList(Request $request): array
    {
        $raw = (string) $request->input('form', '');
        if ($raw === '') {
            return array_column(KmKatalog::semua(), 'no');
        }
        $nos = collect(explode(',', $raw))
            ->map(fn ($n) => (int) trim($n))
            ->filter(fn ($n) => KmKatalog::cari($n) !== null)
            ->unique()
            ->values()
            ->all();

        return $nos ?: array_column(KmKatalog::semua(), 'no');
    }
}
