<?php

namespace App\Http\Controllers\Erpika;

use App\Http\Controllers\Controller;
use App\Models\Rpp;
use App\Models\RppCategory;
use App\Models\RppLaporan;
use App\Models\RppPenugasan;
use App\Models\RppTeamMember;
use App\Services\AnevaExcelService;
use App\Services\PdfPrintService;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;

/**
 * ERPIKA > RPP Analisis dan Evaluasi (aneva).
 *
 * Sisi realisasi dari rantai perencanaan → pelaksanaan (AREP) → pelaporan →
 * analisis dan evaluasi: tiap PENUGASAN (ST) dengan RPP-nya, obrik, tim,
 * TMT, dan laporan hasil (LHA/LHR/LHM/LHE) yang terbit — persis kolom
 * REKAP LAPORAN RPP <tahun>.xlsx Bagian Analisis dan Evaluasi. Datanya SAMA
 * dengan RPP Perencanaan (tabel rpps/rpp_penugasan), jadi yang diubah di
 * satu sisi langsung terlihat di sisi lain.
 */
class AnevaController extends Controller
{
    public function index(Request $request)
    {
        $tahunMasuk = $request->input('tahun', Rpp::max('year') ?: now()->year);
        $tahun = $tahunMasuk === 'semua' ? 'semua' : (int) $tahunMasuk; // 'semua' = seluruh tahun
        $jenis = $request->input('jenis');
        $status = $request->input('status'); // terbit | belum | batal
        $cari = trim((string) $request->input('cari', ''));

        $penugasan = $this->kueri($tahun, $jenis, $cari)->get();
        // merah = baru ST/sedang bertugas, kuning = nomor laporan diminta, hijau = laporan masuk aneva
        $penugasan = match ($status) {
            'hijau', 'terbit' => $penugasan->where('status', 'lhp_terbit'),
            'kuning' => $penugasan->where('status', 'nomor_diminta'),
            'merah', 'belum' => $penugasan->whereNotIn('status', ['lhp_terbit', 'nomor_diminta', 'batal']),
            'batal' => $penugasan->where('status', 'batal'),
            default => $penugasan,
        };

        $baris = $penugasan->values()->map(fn (RppPenugasan $p, int $i) => $this->baris($p, $i + 1));

        return Inertia::render('erpika/Aneva', [
            'baris' => $baris,
            'ringkasan' => $this->ringkasan($this->kueri($tahun, null, '')->get()),
            'nomorTerakhir' => $this->nomorLaporanTerakhir($tahun),
            'categories' => RppCategory::orderBy('order')->get(['id', 'code', 'name', 'kode_nomor']),
            'tahunTersedia' => Rpp::select('year')->distinct()->orderByDesc('year')->pluck('year')->all(),
            'filters' => ['tahun' => $tahun, 'jenis' => $jenis, 'status' => $status, 'cari' => $cari],
            'terakhirSinkron' => RppPenugasan::max('sinkron_aneva_pada'),
        ]);
    }

    public function previewCetak(Request $request)
    {
        $tahunMasuk = $request->input('tahun', Rpp::max('year') ?: now()->year);
        $tahun = $tahunMasuk === 'semua' ? 'semua' : (int) $tahunMasuk;
        $jenis = $request->input('jenis');
        $semua = $this->kueri($tahun, $jenis, '')->get();

        $seksi = $semua->groupBy(fn (RppPenugasan $p) => $p->rpp->category?->code ?? 'Z')
            ->sortKeys()
            ->map(function (Collection $kelompok, string $kode) {
                $kat = $kelompok->first()->rpp->category;

                return [
                    'kode' => $kode,
                    'nama' => $kat?->name ?? 'Lain-lain',
                    'baris' => $kelompok->values()->map(fn (RppPenugasan $p, int $i) => $this->baris($p, $i + 1))->all(),
                ];
            })->values();

        return Inertia::render('erpika/AnevaCetak', [
            'tahun' => $tahun,
            'perTanggal' => now()->day.' '.RppPenugasan::BULAN[now()->month].' '.now()->year,
            'seksi' => $seksi,
            'ringkasan' => $this->ringkasan($semua),
        ]);
    }

    /** Rekap dalam Excel — tata letak sel demi sel sama dengan REKAP LAPORAN RPP <tahun>.xlsx asli. */
    public function excel(Request $request, AnevaExcelService $excel)
    {
        $tahunMasuk = $request->input('tahun', Rpp::max('year') ?: now()->year);
        $tahun = $tahunMasuk === 'semua' ? 'semua' : (int) $tahunMasuk;
        $penugasan = $this->kueri($tahun, $request->input('jenis'), '')->get();
        $sementara = tempnam(sys_get_temp_dir(), 'aneva');
        $excel->simpanKe($tahun, $penugasan, now()->day.' '.RppPenugasan::BULAN[now()->month].' '.now()->year, $sementara);

        return response()->download($sementara, "Rekap-Laporan-RPP-{$tahun}.xlsx", ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])->deleteFileAfterSend(true);
    }

    public function cetak(Request $request)
    {
        $tahun = $request->input('tahun', Rpp::max('year') ?: now()->year);
        $url = url('/erpika/aneva/cetak/preview?'.http_build_query($request->only(['tahun', 'jenis'])));

        return PdfPrintService::downloadFromUrl($request, $url, 'Rekap-Laporan-RPP-'.$tahun);
    }

    private function kueri(int|string $tahun, $jenis, string $cari)
    {
        $q = RppPenugasan::with(['rpp.category', 'teamMembers', 'obriks', 'laporans'])
            ->whereHas('rpp', function ($r) use ($tahun, $jenis) {
                if ($tahun !== 'semua') {
                    $r->where('year', $tahun);
                }
                if ($jenis) {
                    $r->where('rpp_category_id', $jenis);
                }
            })
            ->join('rpps', 'rpps.id', '=', 'rpp_penugasan.rpp_id')
            ->join('rpp_categories', 'rpp_categories.id', '=', 'rpps.rpp_category_id')
            ->orderByDesc('rpps.year')
            ->orderBy('rpp_categories.order')
            ->orderByRaw('COALESCE(rpp_penugasan.tanggal_st, rpps.tanggal_rpp)')
            ->orderBy('rpps.nomor_rpp')
            ->orderBy('rpp_penugasan.urutan')
            ->select('rpp_penugasan.*');

        if ($cari !== '') {
            $q->where(function ($w) use ($cari) {
                $w->where('rpp_penugasan.uraian', 'like', "%{$cari}%")
                    ->orWhere('rpp_penugasan.nomor_st', 'like', "%{$cari}%")
                    ->orWhere('rpps.nomor_rpp', 'like', "%{$cari}%")
                    ->orWhereHas('obriks', fn ($o) => $o->where('nama', 'like', "%{$cari}%"))
                    ->orWhereHas('laporans', fn ($l) => $l->where('nomor_laporan', 'like', "%{$cari}%"))
                    ->orWhereHas('teamMembers', fn ($t) => $t->where('nama', 'like', "%{$cari}%"));
            });
        }

        return $q;
    }

    private function baris(RppPenugasan $p, int $no): array
    {
        $laporanObrik = $p->laporans->whereNotNull('rpp_obrik_id')->keyBy('rpp_obrik_id');

        return [
            'id' => $p->id,
            'no' => $no,
            'rpp_id' => $p->rpp_id,
            'jenis' => ['code' => $p->rpp->category?->code, 'name' => $p->rpp->category?->name],
            'nomor_rpp' => $p->rpp->nomor_rpp,
            'tahun' => $p->rpp->year,
            'tanggal_rpp' => $p->rpp->tanggal_rpp?->toDateString(),
            'nomor_st' => $p->nomor_st,
            'tanggal_st' => $p->tanggal_st?->toDateString(),
            'uraian' => $p->uraian,
            'obriks' => $p->obriks->map(fn ($o) => [
                'nama' => $o->nama,
                'laporan' => ($l = $laporanObrik->get($o->id)) ? ['nomor' => $l->nomor_laporan, 'tanggal' => $l->tanggal_laporan?->toDateString(), 'jenis' => $l->jenis] : null,
            ])->all(),
            'laporan_lain' => $p->laporans->whereNull('rpp_obrik_id')->values()->map(fn ($l) => ['nomor' => $l->nomor_laporan, 'tanggal' => $l->tanggal_laporan?->toDateString(), 'jenis' => $l->jenis])->all(),
            'jumlah_laporan_terbit' => $p->laporans->count(),
            'sifat' => $p->sifat,
            'lokasi' => $p->lokasiTampil(),
            'tarif_sppd' => $p->tarifSppd(),
            'biaya_sppd' => $p->biayaSppd(),
            'tim' => $p->teamMembers->map(fn ($m) => ['nama' => $m->nama, 'role' => $m->role, 'peran' => $m->peranTampil(), 'singkat' => RppTeamMember::PERAN_SINGKAT[$m->role] ?? '', 'dk' => (int) $m->hari_kantor, 'lk' => (int) $m->hari_lapangan])->all(),
            'tmt' => $p->tmtTampil(),
            'capaian_output' => $p->capaian_output,
            'status' => $p->status,
            'keterangan' => $p->keterangan,
        ];
    }

    private function ringkasan(Collection $penugasan): array
    {
        $perJenis = $penugasan->groupBy(fn (RppPenugasan $p) => $p->rpp->category?->name ?? 'Lain-lain')
            ->map(fn (Collection $k, string $nama) => [
                'jenis' => $nama,
                'penugasan' => $k->count(),
                'terbit' => $k->where('status', 'lhp_terbit')->count(),
                'kuning' => $k->where('status', 'nomor_diminta')->count(),
                'merah' => $k->whereNotIn('status', ['lhp_terbit', 'nomor_diminta', 'batal'])->count(),
                'batal' => $k->where('status', 'batal')->count(),
                'laporan' => $k->sum(fn ($p) => $p->laporans->count()),
            ])->values()->all();

        return [
            'penugasan' => $penugasan->count(),
            'terbit' => $penugasan->where('status', 'lhp_terbit')->count(),
            'kuning' => $penugasan->where('status', 'nomor_diminta')->count(),
            'merah' => $penugasan->whereNotIn('status', ['lhp_terbit', 'nomor_diminta', 'batal'])->count(),
            'belum' => $penugasan->whereNotIn('status', ['lhp_terbit', 'batal'])->count(),
            'batal' => $penugasan->where('status', 'batal')->count(),
            'laporan' => $penugasan->sum(fn ($p) => $p->laporans->count()),
            'orang_hari' => $penugasan->sum(fn ($p) => $p->teamMembers->sum(fn ($m) => (int) $m->hari_kantor + (int) $m->hari_lapangan)),
            'hari_lk' => $penugasan->sum(fn ($p) => $p->teamMembers->sum(fn ($m) => (int) $m->hari_lapangan)),
            'biaya_sppd' => $penugasan->sum(fn ($p) => $p->biayaSppd()),
            'per_jenis' => $perJenis,
        ];
    }

    /**
     * Nomor laporan terakhir per jenis (LHR, LHA, LHM, LHE, ...) — pengganti
     * lembar "Rekap Pengambilan Nomor" pada berkas asli: nomor urut terbesar
     * dari seluruh laporan tahun itu.
     */
    private function nomorLaporanTerakhir(int|string $tahun): array
    {
        return RppLaporan::whereHas('penugasan.rpp', fn ($r) => $tahun === 'semua' ? $r : $r->where('year', $tahun))
            ->get(['nomor_laporan', 'jenis', 'tanggal_laporan'])
            ->filter(fn ($l) => $l->jenis)
            ->groupBy('jenis')
            ->map(function (Collection $k, string $jenis) {
                $terakhir = $k->sortByDesc(fn ($l) => (int) (preg_match('~/(\d+)/~', $l->nomor_laporan, $m) ? $m[1] : 0))->first();

                return ['jenis' => $jenis, 'jumlah' => $k->count(), 'nomor' => $terakhir->nomor_laporan, 'tanggal' => $terakhir->tanggal_laporan?->toDateString()];
            })->sortBy('jenis')->values()->all();
    }
}
