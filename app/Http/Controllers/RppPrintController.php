<?php

namespace App\Http\Controllers;

use App\Models\Rpp;
use App\Models\RppPenugasan;
use App\Models\RppSetting;
use App\Models\RppTeamMember;
use App\Services\PdfPrintService;
use App\Services\RppExcelService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Cetak RPP: lembar Tabel (persis RPP*.xls, A4 mendatar) dan Surat Pengantar
 * (persis Pengantar RPP*.doc, A4 tegak). Tombolnya ada di tiap baris RPP
 * Perencanaan; tidak ada halaman daftar cetak tersendiri.
 *
 * Pratinjau web (Inertia) SEKALIGUS sumber PDF-nya: seluruh Form Cetak di-
 * screenshot Browsershot dari halaman React itu sendiri (PdfPrintService),
 * sehingga yang diunduh selalu persis yang dilihat.
 */
class RppPrintController extends Controller
{
    public function previewTabel(Request $request, Rpp $rpp)
    {
        $this->authorizeView($request, $rpp);

        return Inertia::render('rpp/PreviewTabel', $this->dataTabel($rpp));
    }

    public function previewPengantar(Request $request, Rpp $rpp)
    {
        $this->authorizeView($request, $rpp);

        return Inertia::render('rpp/PreviewPengantar', $this->dataPengantar($rpp));
    }

    public function tabel(Request $request, Rpp $rpp)
    {
        $this->authorizeView($request, $rpp);

        return PdfPrintService::downloadFromUrl($request, url("/rpp-cetak/{$rpp->id}/tabel/preview"), 'RPP-Tabel-'.str($rpp->nomor_rpp)->slug()->limit(40, ''));
    }

    /** Lembar tabel dalam Excel — tata letak sel demi sel sama dengan berkas RPP*.xls asli. */
    public function excel(Request $request, Rpp $rpp, RppExcelService $excel)
    {
        $this->authorizeView($request, $rpp);

        $nama = 'RPP-Tabel-'.str($rpp->nomor_rpp)->slug()->limit(40, '').'.xlsx';
        $sementara = tempnam(sys_get_temp_dir(), 'rpp');
        $excel->simpanKe($rpp, $sementara);

        return response()->download($sementara, $nama, ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])->deleteFileAfterSend(true);
    }

    public function pengantar(Request $request, Rpp $rpp)
    {
        $this->authorizeView($request, $rpp);

        return PdfPrintService::downloadFromUrl($request, url("/rpp-cetak/{$rpp->id}/pengantar/preview"), 'RPP-Pengantar-'.str($rpp->nomor_rpp)->slug()->limit(40, ''));
    }

    /**
     * Data lembar tabel. Kolom yang dicetak persis berkas asli: NO, OBRIK, TIM
     * (nama + NIP), PANGKAT/GOL, PERAN, DK/LK/JLH, SIFAT AUDIT, JUMLAH LAPORAN
     * + TMT. Tarif dan biaya SENGAJA tidak dibawa — di berkas asli kolom itu
     * di luar area cetak.
     */
    private function dataTabel(Rpp $rpp): array
    {
        $rpp->load(['category', 'penugasan.teamMembers', 'penugasan.obriks']);
        $inspektur = RppSetting::inspektur();

        return [
            'rpp' => [
                'id' => $rpp->id,
                'nomor_rpp' => $rpp->nomor_rpp,
                'judul' => $rpp->judulTampil(),
                'sub_judul' => $rpp->subJudulTampil(),
                'tanggal' => $this->tanggalPanjang($rpp->tanggal_rpp),
                'jenis' => $rpp->category?->name,
                'penugasan' => $rpp->penugasan->map(fn (RppPenugasan $p) => [
                    'urutan' => $p->urutan,
                    'uraian' => $p->uraian,
                    'obriks' => $p->obriks->pluck('nama')->all(),
                    'sifat' => $p->sifat,
                    'jumlah_laporan' => $p->jumlah_laporan,
                    'tmt' => $p->tmtTampil(),
                    'tim' => $p->teamMembers->values()->map(fn (RppTeamMember $m, int $i) => [
                        'no' => $i + 1,
                        'nama' => $m->nama,
                        'nip' => $m->nip,
                        'pangkat' => $m->pangkat,
                        'golongan' => $m->golongan,
                        'peran' => $m->peranTampil(),
                        'dk' => (int) $m->hari_kantor,
                        'lk' => (int) $m->hari_lapangan,
                    ])->all(),
                ])->all(),
            ],
            'inspektur' => $this->inspekturCetak($inspektur),
        ];
    }

    private function dataPengantar(Rpp $rpp): array
    {
        $rpp->load('category');

        return [
            'rpp' => [
                'id' => $rpp->id,
                'nomor_rpp' => $rpp->nomor_rpp,
                'tanggal' => $this->tanggalPanjang($rpp->tanggal_surat ?: $rpp->tanggal_rpp),
                'hal' => $rpp->halTampil(),
                'tujuan' => $rpp->tujuanSuratTampil(),
                'sebutan' => $rpp->category?->sebutan ?: $rpp->category?->name,
                'dasar' => $rpp->surat_dasar_uraian ?: 'Berdasarkan Program Kerja Pengawasan Tahunan Inspektorat Kabupaten Aceh Barat Tahun '.$rpp->year.'.',
                'dengan_penutup' => $rpp->dengan_penutup,
            ],
            'inspektur' => $this->inspekturCetak(RppSetting::inspektur()),
        ];
    }

    /**
     * Nama pada tanda tangan ditulis kapital dan NIP tanpa spasi di lembar
     * tabel ("ZAKARIA, SE., CGCAE." / "NIP 197205042001121002"), tetapi NIP
     * berspasi di surat pengantar ("NIP.19720504 200112 1 002") — keduanya
     * mengikuti berkas aslinya.
     */
    private function inspekturCetak($inspektur): array
    {
        $nip = preg_replace('/\D/', '', (string) ($inspektur?->nip ?? ''));

        return [
            'nama' => $inspektur?->nama ?? '............',
            'nip_rapat' => $nip !== '' ? $nip : '............',
            'nip_spasi' => strlen($nip) === 18 ? substr($nip, 0, 8).' '.substr($nip, 8, 6).' '.substr($nip, 14, 1).' '.substr($nip, 15) : ($nip ?: '............'),
        ];
    }

    private function tanggalPanjang($tanggal): string
    {
        if (! $tanggal) {
            return '..........';
        }

        return $tanggal->day.' '.RppPenugasan::BULAN[$tanggal->month].' '.$tanggal->year;
    }

    private function authorizeView(Request $request, Rpp $rpp): void
    {
        if (! $request->user()->canViewAllOpd() && $rpp->user_id !== $request->user()->id) {
            abort(403, 'Anda tidak dapat mencetak RPP milik pengguna lain.');
        }
    }
}
