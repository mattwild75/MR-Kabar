<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\SharesCetakContext;
use App\Models\CeeRtp;
use App\Models\DataUmum;
use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\IrsPemda;
use App\Models\MonitoringRtp;
use App\Models\Opd;
use App\Models\PencatatanKejadianRisiko;
use App\Models\PengaturanPemda;
use App\Services\PdfPrintService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Form Cetak — 8 (Rencana & Realisasi Pengkomunikasian atas Kegiatan
 * Pengendalian), 9 (Rencana & Realisasi Pemantauan atas Kegiatan
 * Pengendalian), 10 (Pencatatan Kejadian Risiko & Pelaksanaan RTP) — sesuai
 * Lampiran 5 Perdep PPKD No.4/2019. Ketiganya PER-OPD (wajib pilih OPD),
 * sama pola dgn Form 6 (RTP atas CEE) — beda dari Form 4/5/7 yg lintas-OPD.
 */
class CetakMonitoringEvaluasiController extends Controller
{
    use SharesCetakContext;

    // pengaturan() & dataUmumForInertia() dipindah ke trait SharesCetakContext.

    private function ensureOpdAccess(Request $request, ?int $opdId): void
    {
        $this->ensureOpdAccessWith($request, $opdId, 'Anda hanya dapat mengakses Form Cetak Monitoring & Evaluasi untuk OPD Anda sendiri.');
    }

    private function opdOptions(Request $request)
    {
        $user = $request->user();
        if ($user->opd_id && !$user->hasAnyRole(['admin', 'super-admin'])) {
            return Opd::where('id', $user->opd_id)->get(['id', 'nama']);
        }

        return Opd::orderBy('nama')->get(['id', 'nama']);
    }

    /**
     * "Triwulan I 2026" dari kode TRIWULAN + TAHUN terpisah. Kode idealnya
     * cuma romawi ("I".."IV"), tapi strip prefix "Triwulan " dulu (case-
     * insensitive) kalau data lama sudah menyimpannya penuh — supaya TIDAK
     * dobel jadi "Triwulan Triwulan I". Logika identik dgn
     * CetakRtpController::formatTriwulanTahun() (dulu controller ini
     * concat langsung tanpa strip — inkonsistensi yg diperbaiki).
     */
    private function formatTriwulanTahun(?string $triwulan, ?int $tahun): ?string
    {
        if (!$triwulan && !$tahun) {
            return null;
        }

        $kode = $triwulan ? trim(preg_replace('/^triwulan\s*/i', '', $triwulan)) : null;
        $label = $kode ? "Triwulan {$kode}" : null;

        return trim(implode(' ', array_filter([$label, $tahun ? (string) $tahun : null])));
    }

    /**
     * Label "Kegiatan Pengendalian yang Dibutuhkan" (kolom b Form 8/9)
     * diproyeksi LIVE dari RTP sumber — sama pola dgn CetakRtpController yg
     * tidak menyimpan uraian/kode risiko sbg kolom sendiri. Dipanggil per
     * baris MonitoringRtp yg SUDAH di-load dgn with() batch, bukan query
     * satu-satu (N+1) di dalam loop.
     */
    private function labelRtpSumber(MonitoringRtp $m, array $irsPemdaMap, array $irsPdMap, array $iroPdMap, array $ceeRtpMap): ?string
    {
        $sumber = match ($m->rtp_sumber_tipe) {
            'irs_pemda' => $irsPemdaMap[$m->rtp_sumber_id] ?? null,
            'irs_pd' => $irsPdMap[$m->rtp_sumber_id] ?? null,
            'iro_pd' => $iroPdMap[$m->rtp_sumber_id] ?? null,
            'cee_rtp' => $ceeRtpMap[$m->rtp_sumber_id] ?? null,
            default => null,
        };

        if (!$sumber) {
            return null;
        }

        return $m->rtp_sumber_tipe === 'cee_rtp'
            ? $sumber->rencana_tindak_pengendalian
            : $sumber->{'RENCANA TINDAK PENGENDALIAN'};
    }

    private function monitoringRows(int $opdId, int $tahun)
    {
        $rows = MonitoringRtp::where('opd_id', $opdId)
            ->where('tahun_penilaian', $tahun)
            ->orderBy('id')
            ->get();

        $irsPemdaIds = $rows->where('rtp_sumber_tipe', 'irs_pemda')->pluck('rtp_sumber_id');
        $irsPdIds = $rows->where('rtp_sumber_tipe', 'irs_pd')->pluck('rtp_sumber_id');
        $iroPdIds = $rows->where('rtp_sumber_tipe', 'iro_pd')->pluck('rtp_sumber_id');
        $ceeRtpIds = $rows->where('rtp_sumber_tipe', 'cee_rtp')->pluck('rtp_sumber_id');

        $irsPemdaMap = IrsPemda::whereIn('id', $irsPemdaIds)->get()->keyBy('id')->all();
        $irsPdMap = IrsPd::whereIn('id', $irsPdIds)->get()->keyBy('id')->all();
        $iroPdMap = IroPd::whereIn('id', $iroPdIds)->get()->keyBy('id')->all();
        $ceeRtpMap = CeeRtp::whereIn('id', $ceeRtpIds)->get()->keyBy('id')->all();

        return $rows->map(function ($m) use ($irsPemdaMap, $irsPdMap, $iroPdMap, $ceeRtpMap) {
            return [
                'kegiatan_pengendalian' => $this->labelRtpSumber($m, $irsPemdaMap, $irsPdMap, $iroPdMap, $ceeRtpMap),
                'media_komunikasi' => $m->media_komunikasi,
                'penyedia_informasi' => $m->penyedia_informasi,
                'penerima_informasi' => $m->penerima_informasi,
                'rencana_komunikasi' => $this->formatTriwulanTahun($m->triwulan_rencana_komunikasi, $m->tahun_rencana_komunikasi),
                'realisasi_komunikasi' => $m->realisasi_waktu_komunikasi,
                'keterangan_komunikasi' => $m->keterangan_komunikasi,
                'metode_pemantauan' => $m->metode_pemantauan,
                'penanggung_jawab_pemantauan' => $m->penanggung_jawab_pemantauan,
                'rencana_pemantauan' => $this->formatTriwulanTahun($m->triwulan_rencana_pemantauan, $m->tahun_rencana_pemantauan),
                'realisasi_pemantauan' => $m->realisasi_waktu_pemantauan,
                'keterangan_pemantauan' => $m->keterangan_pemantauan,
            ];
        })->filter(fn ($r) => $r['kegiatan_pengendalian'] !== null)->values();
    }

    public function cetak8(Request $request)
    {
        $opdId = $request->integer('opd_id') ?: $request->user()->opd_id;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $opd = $opdId ? Opd::find($opdId) : null;
        $pengaturan = $this->pengaturan();
        $dataUmum = $opdId ? DataUmum::forOpdAndTahun($opdId, $tahun) : null;

        return Inertia::render('monitoring-evaluasi/cetak/Cetak8', [
            'opdOptions' => $this->opdOptions($request),
            'opd' => $opd,
            'tahun' => $tahun,
            'periode' => $pengaturan->periode_penilaian,
            'rows' => $opd ? $this->monitoringRows($opd->id, $tahun) : [],
            'pemerintahKabkota' => $pengaturan->pemerintah_kabkota ?: 'Pemerintah Kabupaten Aceh Barat',
            'dataUmum' => $this->dataUmumForInertia($dataUmum),
        ]);
    }

    public function pdf8(Request $request)
    {
        $opdId = $request->integer('opd_id') ?: $request->user()->opd_id;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $opd = $opdId ? Opd::findOrFail($opdId) : abort(404);

        $url = url("/cetak/monitoring-evaluasi/8?opd_id={$opdId}&tahun={$tahun}");

        return PdfPrintService::downloadFromUrl($request, $url, "Form-8-Rencana-Realisasi-Pengkomunikasian-{$opd->nama}-{$tahun}");
    }

    public function cetak9(Request $request)
    {
        $opdId = $request->integer('opd_id') ?: $request->user()->opd_id;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $opd = $opdId ? Opd::find($opdId) : null;
        $pengaturan = $this->pengaturan();
        $dataUmum = $opdId ? DataUmum::forOpdAndTahun($opdId, $tahun) : null;

        return Inertia::render('monitoring-evaluasi/cetak/Cetak9', [
            'opdOptions' => $this->opdOptions($request),
            'opd' => $opd,
            'tahun' => $tahun,
            'periode' => $pengaturan->periode_penilaian,
            'rows' => $opd ? $this->monitoringRows($opd->id, $tahun) : [],
            'pemerintahKabkota' => $pengaturan->pemerintah_kabkota ?: 'Pemerintah Kabupaten Aceh Barat',
            'dataUmum' => $this->dataUmumForInertia($dataUmum),
        ]);
    }

    public function pdf9(Request $request)
    {
        $opdId = $request->integer('opd_id') ?: $request->user()->opd_id;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $opd = $opdId ? Opd::findOrFail($opdId) : abort(404);

        $url = url("/cetak/monitoring-evaluasi/9?opd_id={$opdId}&tahun={$tahun}");

        return PdfPrintService::downloadFromUrl($request, $url, "Form-9-Rencana-Realisasi-Pemantauan-{$opd->nama}-{$tahun}");
    }

    // ── Form 10: Pencatatan Kejadian Risiko & Pelaksanaan RTP ────────────

    private function labelRisikoSumber(PencatatanKejadianRisiko $p, array $irsPemdaMap, array $irsPdMap, array $iroPdMap): ?string
    {
        $sumber = match ($p->risiko_tipe) {
            'irs_pemda' => $irsPemdaMap[$p->risiko_id] ?? null,
            'irs_pd' => $irsPdMap[$p->risiko_id] ?? null,
            'iro_pd' => $iroPdMap[$p->risiko_id] ?? null,
            default => null,
        };

        return $sumber?->{'URAIAN RISIKO'};
    }

    private function pencatatanRows(int $opdId, int $tahun)
    {
        $rows = PencatatanKejadianRisiko::where('opd_id', $opdId)
            ->where('tahun_penilaian', $tahun)
            ->orderBy('id')
            ->get();

        $irsPemdaIds = $rows->where('risiko_tipe', 'irs_pemda')->pluck('risiko_id');
        $irsPdIds = $rows->where('risiko_tipe', 'irs_pd')->pluck('risiko_id');
        $iroPdIds = $rows->where('risiko_tipe', 'iro_pd')->pluck('risiko_id');

        $irsPemdaMap = IrsPemda::whereIn('id', $irsPemdaIds)->get()->keyBy('id')->all();
        $irsPdMap = IrsPd::whereIn('id', $irsPdIds)->get()->keyBy('id')->all();
        $iroPdMap = IroPd::whereIn('id', $iroPdIds)->get()->keyBy('id')->all();

        return $rows->map(function ($p) use ($irsPemdaMap, $irsPdMap, $iroPdMap) {
            return [
                'uraian_risiko' => $this->labelRisikoSumber($p, $irsPemdaMap, $irsPdMap, $iroPdMap),
                'tanggal_terjadi' => $p->tanggal_terjadi?->locale('id')->translatedFormat('d F Y'),
                'sebab_saat_kejadian' => $p->sebab_saat_kejadian,
                'dampak_saat_kejadian' => $p->dampak_saat_kejadian,
                'keterangan_kejadian' => $p->keterangan_kejadian,
                'rencana_rtp' => $this->formatTriwulanTahun($p->triwulan_rencana_rtp, $p->tahun_rencana_rtp),
                'realisasi_rtp' => $p->realisasi_pelaksanaan_rtp,
                'keterangan_rtp' => $p->keterangan_rtp,
            ];
        })->filter(fn ($r) => $r['uraian_risiko'] !== null)->values();
    }

    public function cetak10(Request $request)
    {
        $opdId = $request->integer('opd_id') ?: $request->user()->opd_id;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $opd = $opdId ? Opd::find($opdId) : null;
        $pengaturan = $this->pengaturan();
        $dataUmum = $opdId ? DataUmum::forOpdAndTahun($opdId, $tahun) : null;

        return Inertia::render('monitoring-evaluasi/cetak/Cetak10', [
            'opdOptions' => $this->opdOptions($request),
            'opd' => $opd,
            'tahun' => $tahun,
            'periode' => $pengaturan->periode_penilaian,
            'rows' => $opd ? $this->pencatatanRows($opd->id, $tahun) : [],
            'pemerintahKabkota' => $pengaturan->pemerintah_kabkota ?: 'Pemerintah Kabupaten Aceh Barat',
            'dataUmum' => $this->dataUmumForInertia($dataUmum),
        ]);
    }

    public function pdf10(Request $request)
    {
        $opdId = $request->integer('opd_id') ?: $request->user()->opd_id;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $opd = $opdId ? Opd::findOrFail($opdId) : abort(404);

        $url = url("/cetak/monitoring-evaluasi/10?opd_id={$opdId}&tahun={$tahun}");

        return PdfPrintService::downloadFromUrl($request, $url, "Form-10-Pencatatan-Kejadian-Risiko-{$opd->nama}-{$tahun}");
    }
}
