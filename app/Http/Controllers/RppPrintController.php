<?php

namespace App\Http\Controllers;

use App\Models\Rpp;
use App\Models\RppCategory;
use App\Models\RppPenugasan;
use App\Models\RppSetting;
use App\Models\RppTeamMember;
use App\Services\NaskahWordService;
use App\Services\PdfPrintService;
use App\Services\RppExcelService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
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
    /**
     * Tata naskah penugasan satu jenis satu tahun — agenda penomoran RPP, SP,
     * ST, KP, ketua tim, dan LHP, seperti berkas "0__no agenda penugasan".
     */
    public function previewTataNaskah(Request $request, ?Rpp $rpp = null)
    {
        return Inertia::render('rpp/PreviewTataNaskah', $this->dataTataNaskah($request, $rpp));
    }

    public function tataNaskah(Request $request, ?Rpp $rpp = null)
    {
        $q = http_build_query($request->only(['tahun', 'jenis']));
        $url = $rpp ? url("/rpp-cetak/{$rpp->id}/tata-naskah/preview") : url('/rpp-cetak/tata-naskah/preview?'.$q);

        return PdfPrintService::downloadFromUrl($request, $url, 'Tata-Naskah-'.($rpp ? str($rpp->nomor_rpp)->slug()->limit(40, '') : $request->input('tahun', now()->year)));
    }

    private function dataTataNaskah(Request $request, ?Rpp $rpp = null): array
    {
        if ($rpp) {
            $this->authorizeView($request, $rpp);
        }
        $tahun = $rpp ? (int) $rpp->year : (int) $request->input('tahun', now()->year);
        $kategori = $rpp ? $rpp->category : ($request->filled('jenis') ? RppCategory::find($request->input('jenis')) : null);
        $penugasan = RppPenugasan::query()
            ->with(['rpp:id,nomor_rpp,year,tanggal_rpp,rpp_category_id', 'rpp.category:id,name,kode_nomor', 'teamMembers', 'laporans'])
            ->when($rpp, fn ($q) => $q->where('rpp_id', $rpp->id))
            ->whereHas('rpp', fn ($q) => $q->where('year', $tahun)->when($kategori, fn ($q) => $q->where('rpp_category_id', $kategori->id)))
            ->get()
            ->sortBy(fn ($p) => [$p->rpp->rpp_category_id, RppPenugasan::uraiNomorSt($p->nomor_st)['n'] ?? 999, $p->rpp->nomor_rpp, $p->urutan])
            ->values();

        $baris = $penugasan->map(function (RppPenugasan $p, int $i) {
            $lhp = $p->laporans->sortBy('order')->first();

            return [
                'no' => $i + 1,
                'jenis' => $p->rpp->category?->name,
                'nomor_rpp' => $p->rpp->nomor_rpp,
                'tanggal_rpp' => $p->rpp->tanggal_rpp?->toDateString(),
                'nomor_sp' => $p->nomorSpTampil(),
                'nomor_st' => $p->nomor_st,
                'nomor_kp' => $p->nomorKpTampil(),
                'tanggal_st' => $p->tanggal_st?->toDateString(),
                'ketua_tim' => $p->teamMembers->firstWhere('role', 'kt')?->nama ?? $p->teamMembers->first()?->nama,
                'uraian' => $p->uraian,
                'status' => $p->status,
                'lhp' => $lhp ? ['nomor' => $lhp->nomor_laporan, 'tanggal' => $lhp->tanggal_laporan?->toDateString()] : null,
                'jumlah_lhp' => $p->laporans->count(),
            ];
        })->all();

        $judul = $kategori ? 'TATA NASKAH '.mb_strtoupper($kategori->name) : 'TATA NASKAH PENUGASAN';
        $kolomTim = $kategori && in_array($kategori->name, ['Khusus', 'Monitoring', 'Tujuan Tertentu', 'Kepatuhan Gampong', 'Operasional SKPK'], true) ? 'OBRIK / KETUA TIM' : 'KETUA TIM';

        return [
            'tahun' => $tahun,
            'rpp' => $rpp?->only(['id', 'nomor_rpp']),
            'judul' => $judul,
            'kolomTim' => $kolomTim,
            'jenis' => $kategori?->only(['id', 'name', 'kode_nomor', 'sebutan']),
            'categories' => RppCategory::orderBy('order')->get(['id', 'code', 'name', 'kode_nomor']),
            'tahunTersedia' => Rpp::query()->select('year')->distinct()->orderByDesc('year')->pluck('year')->all(),
            'baris' => $baris,
        ];
    }

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

    /** Unduh Word surat pengantar: dari data (GET) atau dari HTML hasil suntingan pratinjau (POST html). */
    public function pengantarWord(Request $request, Rpp $rpp, NaskahWordService $word)
    {
        $this->authorizeView($request, $rpp);
        $nama = 'RPP-Pengantar-'.str($rpp->nomor_rpp)->slug()->limit(40, '').'.docx';
        if ($request->isMethod('post') && $request->filled('html')) {
            $isi = $word->dariHtml((string) $request->input('html'));
        } else {
            $d = $this->dataPengantar($rpp);
            $isi = $word->pengantarDariData($d['rpp'], $d['inspektur']);
        }

        return response($isi, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition' => 'attachment; filename="'.$nama.'"',
        ]);
    }

    /**
     * PDF surat pengantar yang sudah disunting di pratinjau: HTML suntingan
     * disimpan sementara (10 menit) lalu dirender Browsershot lewat
     * /rpp-cetak/pengantar/suntingan/{token} — jalur yang sama dengan Unduh
     * PDF biasa, hanya isinya dari ketikan pengguna. Data RPP tidak berubah.
     */
    public function pengantarPdfSuntingan(Request $request, Rpp $rpp)
    {
        $this->authorizeView($request, $rpp);
        $data = $request->validate(['html' => ['required', 'string', 'max:2000000']]);
        $token = Str::random(32);
        Cache::put('pengantar-suntingan:'.$token, $data['html'], 600);

        return PdfPrintService::downloadFromUrl($request, url('/rpp-cetak/pengantar/suntingan/'.$token), 'RPP-Pengantar-'.str($rpp->nomor_rpp)->slug()->limit(40, '').'-suntingan');
    }

    public function pengantarSuntingan(string $token)
    {
        $html = Cache::get('pengantar-suntingan:'.$token) ?? abort(404);

        return Inertia::render('rpp/PreviewPengantar', ['suntingan' => $html, 'rpp' => null, 'inspektur' => null]);
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
     * tabel ("ZAKARIA, SE., CGCAE." / "NIP 197001011990031001"), tetapi NIP
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
