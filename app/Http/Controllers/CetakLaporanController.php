<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\SharesCetakContext;
use App\Models\CeeRtp;
use App\Models\DataUmum;
use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\IrsPemda;
use App\Models\LaporanNarasi;
use App\Models\MonitoringRtp;
use App\Models\Opd;
use App\Models\PencatatanKejadianRisiko;
use App\Models\PengaturanPemda;
use App\Models\RiskLevel;
use App\Services\PdfPrintService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Form Cetak > Laporan — Form 11 (Laporan Pelaksanaan Penilaian Risiko),
 * Form 12 (Laporan Berkala Pengelolaan Risiko), Form 13 (Laporan
 * Pemantauan Unit Kepatuhan), sesuai Bab IV Pelaporan & Lampiran 7 Perdep
 * PPKD No.4/2019 — 3 jenis laporan naratif berjenjang yang SEBELUMNYA tidak
 * direpresentasikan sama sekali di aplikasi (dashboard hanya menampilkan
 * proxy angka kepatuhan, bukan dokumen laporan formal).
 *
 * Bagian narasi (Latar Belakang, Dasar Hukum, Rencana/Realisasi, Hambatan,
 * dst) disimpan di LaporanNarasi, auto-diisi template default saat pertama
 * dibuka lalu bisa diedit & disimpan pengguna. Bagian data terstruktur
 * (daftar risiko, RTP, monitoring) SELALU diproyeksi live dari tabel yg
 * sudah ada — TIDAK disalin, sama prinsip dgn Form 6/7/8/9/10.
 */
class CetakLaporanController extends Controller
{
    use SharesCetakContext;

    // pengaturan() & dataUmumForInertia() dipindah ke trait SharesCetakContext.

    /** Sama pola dgn CetakMonitoringEvaluasiController — PIC hanya boleh akses OPD sendiri, Admin/Super Admin bebas (termasuk opd_id null = level Pemda). */
    private function ensureOpdAccess(Request $request, ?int $opdId): void
    {
        $this->ensureOpdAccessWith($request, $opdId, 'Anda hanya dapat mengakses Form Cetak Laporan untuk OPD Anda sendiri.');
    }

    private function opdOptions(Request $request)
    {
        $user = $request->user();
        if ($user->opd_id && !$user->hasAnyRole(['admin', 'super-admin'])) {
            return Opd::where('id', $user->opd_id)->get(['id', 'nama']);
        }

        return Opd::orderBy('nama')->get(['id', 'nama']);
    }

    private function canEditLaporan(Request $request): bool
    {
        return $request->user()->hasAnyRole(['admin', 'super-admin']);
    }

    // ── Template default narasi (auto-generate, bisa diedit manual) ──────

    private function defaultTemplate(string $key, string $pemerintahKabkota, int $tahun, ?string $triwulan = null): string
    {
        $periodeLabel = $triwulan ? "Triwulan {$triwulan} Tahun {$tahun}" : "Tahun {$tahun}";

        return match ($key) {
            'latar_belakang' => "Dalam rangka mendukung akuntabilitas pengelolaan risiko sesuai Peraturan Deputi Bidang Pengawasan Penyelenggaraan Keuangan Daerah Nomor 4 Tahun 2019 tentang Pedoman Pengelolaan Risiko pada Pemerintah Daerah, {$pemerintahKabkota} menyusun laporan pengelolaan risiko periode {$periodeLabel} sebagai bentuk pertanggungjawaban penyelenggaraan Sistem Pengendalian Intern Pemerintah.",
            'dasar_hukum' => "1. Peraturan Pemerintah Nomor 60 Tahun 2008 tentang Sistem Pengendalian Intern Pemerintah;\n2. Peraturan Deputi Bidang Pengawasan Penyelenggaraan Keuangan Daerah Nomor 4 Tahun 2019 tentang Pedoman Pengelolaan Risiko pada Pemerintah Daerah;\n3. Peraturan Kepala Daerah tentang Penyelenggaraan Sistem Pengendalian Intern Pemerintah pada {$pemerintahKabkota}.",
            'maksud_tujuan' => "Laporan ini disusun dengan maksud dan tujuan memberikan gambaran pelaksanaan pengelolaan risiko, termasuk identifikasi, analisis, dan rencana tindak pengendalian (RTP) atas risiko yang teridentifikasi, sebagai bahan evaluasi dan pengambilan keputusan bagi pimpinan.",
            'ruang_lingkup' => "Ruang lingkup laporan ini meliputi risiko strategis Pemerintah Daerah, risiko strategis Perangkat Daerah, dan risiko operasional Perangkat Daerah yang telah diidentifikasi dan dinilai pada {$periodeLabel}.",
            'penutup' => "Demikian laporan ini disusun sebagai bahan evaluasi penyelenggaraan pengelolaan risiko {$pemerintahKabkota} periode {$periodeLabel}, dengan harapan dapat menjadi dasar perbaikan berkelanjutan pengelolaan risiko pada periode berikutnya.",
            'kondisi_lingkungan_pengendalian' => 'Bagian ini berisi hasil penilaian awal dan hasil survei Control Environment Evaluation (CEE), yang selanjutnya disimpulkan kondisi lingkungan pengendalian urusan wajib/pilihan pada pemerintah daerah.',
            'rencana_perbaikan_lingkungan' => 'Bagian ini berisi strategi yang akan dilakukan guna memperbaiki lingkungan pengendalian yang mendukung penciptaan budaya pengelolaan risiko di pemerintah daerah.',
            'rancangan_informasi_komunikasi' => 'Bagian ini berisi rancangan informasi dan komunikasi yang dibutuhkan agar pihak-pihak yang terlibat dalam pengendalian mengetahui keberadaan dan menjalankan pengendalian sesuai yang diinginkan.',
            'rancangan_pemantauan' => 'Bagian ini berisi mekanisme pemantauan yang akan dijalankan untuk memastikan bahwa risiko dapat dipantau keterjadiannya dan pengendalian yang telah dirancang dilaksanakan dan berjalan efektif.',
            'rencana_kegiatan' => "Bagian ini berisi kegiatan-kegiatan pengendalian terhadap risiko yang direncanakan pada periode {$periodeLabel}, termasuk pemutakhiran risiko dan RTP dari periode sebelumnya.",
            'realisasi_kegiatan' => "Bagian ini berisi kegiatan-kegiatan pengendalian terhadap risiko yang dilaksanakan pada periode {$periodeLabel} beserta uraian mengenai kesenjangan (gap) antara rencana dan realisasinya.",
            'hambatan_pelaksanaan' => 'Bagian ini berisi uraian dan analisis hal-hal yang menjadi kendala atau hambatan dalam pelaksanaan kegiatan pengendalian, atau hal-hal yang menyebabkan terjadinya kesenjangan antara rencana dan realisasi kegiatan pengelolaan risiko.',
            'monitoring_risiko_rtp' => "Bagian ini berisi hasil monitoring atas pengomunikasian risiko dan RTP, keterjadian risiko, pelaksanaan RTP, dan kegiatan pemantauan RTP pada {$periodeLabel}.",
            'rekomendasi_feedback' => 'Bagian ini berisi rekomendasi, saran, ataupun umpan balik atas kendala dan hambatan yang dilaporkan oleh Unit Pemilik Risiko, serta rekomendasi strategis maupun teknis dari hasil pemantauan kegiatan pengendalian.',
            default => '',
        };
    }

    private function narasiRow(?LaporanNarasi $narasi, array $keys, string $pemerintahKabkota, int $tahun, ?string $triwulan): array
    {
        $result = [];
        foreach ($keys as $key) {
            $result[$key] = $narasi?->{$key} ?: $this->defaultTemplate($key, $pemerintahKabkota, $tahun, $triwulan);
        }

        return $result;
    }

    private function simpanNarasi(Request $request, string $jenis, array $allowedKeys): void
    {
        $opdId = $request->integer('opd_id') ?: null;
        $this->ensureOpdAccess($request, $opdId);

        if (!$request->user()->hasAnyRole(['admin', 'super-admin']) && $jenis === 'pemantauan_kepatuhan') {
            abort(403, 'Hanya Admin/Super Admin yang dapat mengubah Laporan Pemantauan Unit Kepatuhan.');
        }

        $tahun = $request->integer('tahun');
        $triwulan = $request->string('triwulan')->toString() ?: null;

        $data = $request->validate(array_fill_keys($allowedKeys, ['nullable', 'string']));

        LaporanNarasi::updateOrCreate(
            ['jenis_laporan' => $jenis, 'opd_id' => $opdId, 'tahun_penilaian' => $tahun, 'triwulan' => $triwulan],
            [...$data, 'submitted_by' => $request->user()->id],
        );
    }

    // ── Form 11: Laporan Pelaksanaan Penilaian Risiko ────────────────────

    private const NARASI_KEYS_1 = [
        'latar_belakang', 'dasar_hukum', 'maksud_tujuan', 'ruang_lingkup',
        'kondisi_lingkungan_pengendalian', 'rencana_perbaikan_lingkungan',
        'rancangan_informasi_komunikasi', 'rancangan_pemantauan', 'penutup',
    ];

    public function cetak1(Request $request)
    {
        $opdId = $request->has('opd_id') ? $request->integer('opd_id') ?: null : $request->user()->opd_id;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $opd = $opdId ? Opd::find($opdId) : null;
        $pengaturan = $this->pengaturan();
        $pemerintahKabkota = $pengaturan->pemerintah_kabkota ?: 'Pemerintah Kabupaten Aceh Barat';
        $dataUmum = DataUmum::forOpdAndTahun($opdId, $tahun);

        $narasi = LaporanNarasi::forKey('pelaksanaan_penilaian', $opdId, $tahun, null);

        return Inertia::render('laporan/cetak/Cetak1', [
            'opdOptions' => $this->opdOptions($request),
            'opd' => $opd,
            'tahun' => $tahun,
            'periode' => $pengaturan->periode_penilaian,
            'pemerintahKabkota' => $pemerintahKabkota,
            'dataUmum' => $this->dataUmumForInertia($dataUmum),
            'ringkasanRisiko' => $this->ringkasanRisiko($opdId, $tahun),
            'canEdit' => true,
            'narasi' => $this->narasiRow($narasi, self::NARASI_KEYS_1, $pemerintahKabkota, $tahun, null),
        ]);
    }

    public function simpanNarasi1(Request $request)
    {
        $this->simpanNarasi($request, 'pelaksanaan_penilaian', self::NARASI_KEYS_1);

        return back();
    }

    public function pdf1(Request $request)
    {
        $opdId = $request->has('opd_id') ? $request->integer('opd_id') ?: null : $request->user()->opd_id;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $label = $opdId ? Opd::findOrFail($opdId)->nama : 'Pemda';

        $url = url("/cetak/laporan/1?" . http_build_query(['opd_id' => $opdId, 'tahun' => $tahun]));

        return PdfPrintService::downloadFromUrl($request, $url, "Form-11-Laporan-Pelaksanaan-Penilaian-Risiko-{$label}-{$tahun}");
    }

    /** Ringkasan hasil identifikasi & analisis risiko (jumlah per tingkat + jumlah prioritas) — dasar bagian III Laporan 11, TANPA menyalin data (proyeksi live). */
    private function ringkasanRisiko(?int $opdId, int $tahun): array
    {
        $ambangTinggi = RiskLevel::whereIn('label', ['Tinggi', 'Sangat Tinggi'])->min('skala_min') ?? 16;

        $hitung = function (string $modelClass) use ($opdId, $tahun, $ambangTinggi) {
            // Filter OPD didorong ke SQL (tak ada penomoran kode risiko yg
            // bergantung pada set penuh di sini — cuma hitung jumlah).
            $rows = $modelClass::when(
                    $opdId,
                    fn ($q) => $q->whereHas('user', fn ($u) => $u->where('opd_id', $opdId)),
                    fn ($q) => $q->whereHas('user'),
                )
                ->where('TAHUN DINILAI RISIKO', (string) $tahun)
                ->with('user')
                ->get()
                ->filter(fn ($r) => trim((string) $r->{'URAIAN RISIKO'}) !== '');

            return [
                'jumlah' => $rows->count(),
                'prioritas' => $rows->filter(fn ($r) => (int) ($r->{'SKALA RISIKO'} ?? 0) >= $ambangTinggi)->count(),
            ];
        };

        return [
            'strategis_pemda' => $hitung(IrsPemda::class),
            'strategis_opd' => $hitung(IrsPd::class),
            'operasional_opd' => $hitung(IroPd::class),
        ];
    }

    // ── Form 12: Laporan Berkala Pengelolaan Risiko (per Triwulan) ───────

    private const NARASI_KEYS_2 = [
        'latar_belakang', 'dasar_hukum', 'maksud_tujuan', 'ruang_lingkup',
        'rencana_kegiatan', 'realisasi_kegiatan', 'hambatan_pelaksanaan',
        'monitoring_risiko_rtp', 'penutup',
    ];

    public function cetak2(Request $request)
    {
        $opdId = $request->has('opd_id') ? $request->integer('opd_id') ?: null : $request->user()->opd_id;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $triwulan = $request->string('triwulan')->toString() ?: 'I';
        $opd = $opdId ? Opd::find($opdId) : null;
        $pengaturan = $this->pengaturan();
        $pemerintahKabkota = $pengaturan->pemerintah_kabkota ?: 'Pemerintah Kabupaten Aceh Barat';
        $dataUmum = DataUmum::forOpdAndTahun($opdId, $tahun);

        $narasi = LaporanNarasi::forKey('berkala_pengelolaan', $opdId, $tahun, $triwulan);

        return Inertia::render('laporan/cetak/Cetak2', [
            'opdOptions' => $this->opdOptions($request),
            'opd' => $opd,
            'tahun' => $tahun,
            'triwulan' => $triwulan,
            'periode' => $pengaturan->periode_penilaian,
            'pemerintahKabkota' => $pemerintahKabkota,
            'dataUmum' => $this->dataUmumForInertia($dataUmum),
            'monitoringRows' => $this->monitoringRowsForTriwulan($opdId, $tahun, $triwulan),
            'kejadianRows' => $this->kejadianRowsForTriwulan($opdId, $tahun, $triwulan),
            'canEdit' => true,
            'narasi' => $this->narasiRow($narasi, self::NARASI_KEYS_2, $pemerintahKabkota, $tahun, $triwulan),
        ]);
    }

    public function simpanNarasi2(Request $request)
    {
        $this->simpanNarasi($request, 'berkala_pengelolaan', self::NARASI_KEYS_2);

        return back();
    }

    public function pdf2(Request $request)
    {
        $opdId = $request->has('opd_id') ? $request->integer('opd_id') ?: null : $request->user()->opd_id;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $triwulan = $request->string('triwulan')->toString() ?: 'I';
        $label = $opdId ? Opd::findOrFail($opdId)->nama : 'Pemda';

        $url = url("/cetak/laporan/2?" . http_build_query(['opd_id' => $opdId, 'tahun' => $tahun, 'triwulan' => $triwulan]));

        return PdfPrintService::downloadFromUrl($request, $url, "Form-12-Laporan-Triwulan-{$triwulan}-Pengelolaan-Risiko-{$label}-{$tahun}");
    }

    /** Proyeksi live baris MonitoringRtp (Form 8/9) yg rencana komunikasi/pemantauannya jatuh di triwulan terpilih — sama query dasar dgn CetakMonitoringEvaluasiController::monitoringRows(), difilter tambahan by triwulan. */
    private function monitoringRowsForTriwulan(?int $opdId, int $tahun, string $triwulan)
    {
        $query = MonitoringRtp::where('tahun_penilaian', $tahun)
            ->where(fn ($q) => $q->where('triwulan_rencana_komunikasi', $triwulan)->orWhere('triwulan_rencana_pemantauan', $triwulan));

        if ($opdId) {
            $query->where('opd_id', $opdId);
        }

        $rows = $query->with('opd')->orderBy('id')->get();

        $irsPemdaIds = $rows->where('rtp_sumber_tipe', 'irs_pemda')->pluck('rtp_sumber_id');
        $irsPdIds = $rows->where('rtp_sumber_tipe', 'irs_pd')->pluck('rtp_sumber_id');
        $iroPdIds = $rows->where('rtp_sumber_tipe', 'iro_pd')->pluck('rtp_sumber_id');
        $ceeRtpIds = $rows->where('rtp_sumber_tipe', 'cee_rtp')->pluck('rtp_sumber_id');

        $irsPemdaMap = IrsPemda::whereIn('id', $irsPemdaIds)->get()->keyBy('id');
        $irsPdMap = IrsPd::whereIn('id', $irsPdIds)->get()->keyBy('id');
        $iroPdMap = IroPd::whereIn('id', $iroPdIds)->get()->keyBy('id');
        $ceeRtpMap = CeeRtp::whereIn('id', $ceeRtpIds)->get()->keyBy('id');

        return $rows->map(function ($m) use ($irsPemdaMap, $irsPdMap, $iroPdMap, $ceeRtpMap, $triwulan) {
            $sumber = match ($m->rtp_sumber_tipe) {
                'irs_pemda' => $irsPemdaMap[$m->rtp_sumber_id] ?? null,
                'irs_pd' => $irsPdMap[$m->rtp_sumber_id] ?? null,
                'iro_pd' => $iroPdMap[$m->rtp_sumber_id] ?? null,
                'cee_rtp' => $ceeRtpMap[$m->rtp_sumber_id] ?? null,
                default => null,
            };

            $kegiatanPengendalian = $m->rtp_sumber_tipe === 'cee_rtp'
                ? $sumber?->rencana_tindak_pengendalian
                : $sumber?->{'RENCANA TINDAK PENGENDALIAN'};

            return [
                'opd_nama' => $m->opd?->nama,
                'kegiatan_pengendalian' => $kegiatanPengendalian,
                'rencana_komunikasi' => $m->triwulan_rencana_komunikasi === $triwulan ? $m->media_komunikasi : null,
                'realisasi_komunikasi' => $m->realisasi_waktu_komunikasi,
                'rencana_pemantauan' => $m->triwulan_rencana_pemantauan === $triwulan ? $m->metode_pemantauan : null,
                'realisasi_pemantauan' => $m->realisasi_waktu_pemantauan,
            ];
        })->filter(fn ($r) => $r['kegiatan_pengendalian'] !== null)->values();
    }

    /** Proyeksi live baris PencatatanKejadianRisiko (Form 10) yg rencana RTP-nya jatuh di triwulan terpilih. */
    private function kejadianRowsForTriwulan(?int $opdId, int $tahun, string $triwulan)
    {
        $query = PencatatanKejadianRisiko::where('tahun_penilaian', $tahun)
            ->where('triwulan_rencana_rtp', $triwulan);

        if ($opdId) {
            $query->where('opd_id', $opdId);
        }

        $rows = $query->with('opd')->orderBy('tanggal_terjadi')->get();

        $irsPemdaIds = $rows->where('risiko_tipe', 'irs_pemda')->pluck('risiko_id');
        $irsPdIds = $rows->where('risiko_tipe', 'irs_pd')->pluck('risiko_id');
        $iroPdIds = $rows->where('risiko_tipe', 'iro_pd')->pluck('risiko_id');

        $irsPemdaMap = IrsPemda::whereIn('id', $irsPemdaIds)->get()->keyBy('id');
        $irsPdMap = IrsPd::whereIn('id', $irsPdIds)->get()->keyBy('id');
        $iroPdMap = IroPd::whereIn('id', $iroPdIds)->get()->keyBy('id');

        return $rows->map(function ($p) use ($irsPemdaMap, $irsPdMap, $iroPdMap) {
            $sumber = match ($p->risiko_tipe) {
                'irs_pemda' => $irsPemdaMap[$p->risiko_id] ?? null,
                'irs_pd' => $irsPdMap[$p->risiko_id] ?? null,
                'iro_pd' => $iroPdMap[$p->risiko_id] ?? null,
                default => null,
            };

            return [
                'opd_nama' => $p->opd?->nama,
                'uraian_risiko' => $sumber?->{'URAIAN RISIKO'},
                'tanggal_terjadi' => $p->tanggal_terjadi?->locale('id')->translatedFormat('d F Y'),
                'realisasi_rtp' => $p->realisasi_pelaksanaan_rtp,
            ];
        })->filter(fn ($r) => $r['uraian_risiko'] !== null)->values();
    }

    // ── Form 13: Laporan Pemantauan Unit Kepatuhan (SELALU level Pemda) ──

    private const NARASI_KEYS_3 = [
        'latar_belakang', 'dasar_hukum', 'maksud_tujuan', 'ruang_lingkup',
        'rencana_kegiatan', 'realisasi_kegiatan', 'hambatan_pelaksanaan',
        'rekomendasi_feedback', 'penutup',
    ];

    public function cetak3(Request $request)
    {
        // SELALU level Pemda — semua user (termasuk PIC OPD biasa) boleh
        // melihat (transparansi lintas-OPD), TIDAK ada ensureOpdAccess()
        // krn tidak ada opd_id yg discope. Hanya Admin/Super Admin yg boleh
        // MENGUBAH narasi (lihat simpanNarasi3() & prop canEdit).
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $triwulan = $request->string('triwulan')->toString() ?: 'I';
        $pengaturan = $this->pengaturan();
        $pemerintahKabkota = $pengaturan->pemerintah_kabkota ?: 'Pemerintah Kabupaten Aceh Barat';
        $dataUmum = DataUmum::forOpdAndTahun(null, $tahun);

        $narasi = LaporanNarasi::forKey('pemantauan_kepatuhan', null, $tahun, $triwulan);

        return Inertia::render('laporan/cetak/Cetak3', [
            'tahun' => $tahun,
            'triwulan' => $triwulan,
            'periode' => $pengaturan->periode_penilaian,
            'pemerintahKabkota' => $pemerintahKabkota,
            'dataUmum' => $this->dataUmumForInertia($dataUmum),
            'rekapKepatuhan' => $this->rekapKepatuhanOpd($tahun, $triwulan),
            'canEdit' => $this->canEditLaporan($request),
            'narasi' => $this->narasiRow($narasi, self::NARASI_KEYS_3, $pemerintahKabkota, $tahun, $triwulan),
        ]);
    }

    public function simpanNarasi3(Request $request)
    {
        $this->simpanNarasi($request, 'pemantauan_kepatuhan', self::NARASI_KEYS_3);

        return back();
    }

    public function pdf3(Request $request)
    {
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $triwulan = $request->string('triwulan')->toString() ?: 'I';

        $url = url("/cetak/laporan/3?" . http_build_query(['tahun' => $tahun, 'triwulan' => $triwulan]));

        return PdfPrintService::downloadFromUrl($request, $url, "Form-13-Laporan-Pemantauan-Triwulan-{$triwulan}-{$tahun}");
    }

    /** Rekap kepatuhan lintas-OPD per triwulan — sama semangat dgn DashboardController::buildKepatuhan(), tapi difilter per triwulan (bukan kumulatif tahunan) utk keperluan Laporan Pemantauan. */
    private function rekapKepatuhanOpd(int $tahun, string $triwulan)
    {
        $opds = Opd::orderBy('nama')->get();

        $monitoringOpdIds = MonitoringRtp::where('tahun_penilaian', $tahun)
            ->where(fn ($q) => $q->where('triwulan_rencana_komunikasi', $triwulan)->orWhere('triwulan_rencana_pemantauan', $triwulan))
            ->pluck('opd_id')->unique();

        $kejadianOpdIds = PencatatanKejadianRisiko::where('tahun_penilaian', $tahun)
            ->where('triwulan_rencana_rtp', $triwulan)
            ->pluck('opd_id')->unique();

        return $opds->map(function ($opd) use ($monitoringOpdIds, $kejadianOpdIds) {
            $adaMonitoring = $monitoringOpdIds->contains($opd->id);
            $adaKejadian = $kejadianOpdIds->contains($opd->id);

            return [
                'opd_nama' => $opd->nama,
                'status' => $adaMonitoring && $adaKejadian ? 'lengkap' : (($adaMonitoring || $adaKejadian) ? 'sebagian' : 'belum'),
            ];
        })->values();
    }
}
