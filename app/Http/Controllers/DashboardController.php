<?php

namespace App\Http\Controllers;

use App\Models\Opd;
use App\Services\DasborService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Dashboard MR Kabar.
 *
 * Sejak 12 September 2026 controller ini hanya MERANGKAI: menyaring OPD dari
 * Request, lalu meminta tiap widget ke DasborService. Seluruh logika
 * pembangun widget — enam seksi yang berdasar Perdep PPKD No.4/2019 — ada di
 * layanan itu (temuan audit R-16). Yang tersisa di sini adalah satu-satunya
 * bagian yang menyentuh Request: siapa yang sedang melihat, dan OPD mana.
 */
class DashboardController extends Controller
{
    public function __construct(private readonly DasborService $dasbor) {}

    public function index(Request $request)
    {
        $opdId = $this->scopedOpdId($request);
        // Role sebenarnya (Admin/Super Admin) — TERPISAH dari "sedang lihat
        // OPD mana": admin boleh mempersempit ke 1 OPD via dropdown filter
        // (opdId tidak null), tapi widget khusus admin (mis. filter OPD itu
        // sendiri) tetap harus tampil; widget lintas-OPD spt Ranking
        // Eksposur baru bermakna kalau memang sedang lihat SEMUA OPD.
        $isAdmin = $request->user()->canViewAllOpd();
        $tahun = $request->integer('tahun') ?: (int) $this->dasbor->pengaturan()->tahun_penilaian;

        $riskRows = $this->dasbor->rowsForTahun($tahun, $opdId);
        // riskLevelsOrdered()/ambangSeleraRisiko() di-cache di service (tabel
        // referensi kecil, sebelumnya di-query ulang tiap request tanpa
        // cache — temuan audit performa), invalidasi otomatis saat Admin
        // edit Level Risiko lewat Keterangan Pendukung.
        $riskLevels = $this->dasbor->riskRef->riskLevelsOrdered();
        $ambangTinggi = $this->dasbor->riskRef->ambangSeleraRisiko();
        // Dihitung sekali & dipakai bersama Ringkasan + widget Kepatuhan —
        // sebelumnya buildKepatuhan() dipanggil 2x dgn argumen identik
        // (sekali di dalam buildRingkasan, sekali di sini), dobel query
        // MonitoringRtp/PencatatanKejadianRisiko + loop OPD tanpa manfaat.
        $kepatuhan = $this->dasbor->buildKepatuhan($tahun, $opdId, $this->dasbor->opdIdsWithRiskRows($tahun, $opdId));

        return Inertia::render('dashboard', [
            'isAdmin' => $isAdmin,
            'opdId' => $opdId,
            'opdOptions' => $isAdmin ? Opd::orderBy('nama')->get(['id', 'nama']) : [],
            'tahun' => $tahun,
            'tahunOptions' => $this->dasbor->tahunOptions($opdId),
            'jadwalPenilaian' => $this->dasbor->buildJadwalPenilaian($tahun),
            'ringkasan' => $this->dasbor->buildRingkasan($riskRows, $ambangTinggi, $kepatuhan),
            'matriks' => $this->dasbor->buildMatriks($riskRows),
            'matriksDetail' => $this->dasbor->buildMatriksDetail($riskRows),
            'matrixCells' => $this->dasbor->buildMatrixCells(),
            'riskLevels' => $riskLevels,
            // Skala terkecil yang sudah di luar Selera Risiko, dipakai widget
            // Peta Risiko menggambar garis batasnya. Null berarti belum ada
            // level yang ditandai melampaui selera — garisnya lalu tidak
            // digambar sama sekali, alih-alih digambar di tempat yang
            // menyesatkan. Sengaja TIDAK memakai ambangSeleraRisiko(), yang
            // jatuh ke 16 supaya penetapan Risiko Prioritas tetap jalan;
            // untuk sebuah garis, menebak letaknya lebih buruk daripada
            // tidak menggambarnya. Nilainya diturunkan dari sumber yang sama
            // dengan halaman Keterangan Pendukung supaya kedua halaman
            // menggambarkan batas yang persis sama.
            'seleraAmbang' => $riskLevels->where('melampaui_selera', true)->min('skala_min'),
            'progresTahapan' => $this->dasbor->buildProgresTahapan($tahun, $opdId, $ambangTinggi),
            'distribusiTingkat' => $this->dasbor->buildDistribusiTingkat($riskRows),
            'distribusiKategori' => $this->dasbor->buildDistribusiKategori($riskRows),
            'inherenResidual' => $this->dasbor->buildInherenResidual($riskRows),
            'risikoPrioritas' => $this->dasbor->buildRisikoPrioritas($riskRows, $ambangTinggi),
            'trenTahunan' => $this->dasbor->buildTrenTahunan($opdId, $tahun),
            'trenEfektivitasPengendalian' => $this->dasbor->buildTrenEfektivitasPengendalian($opdId, $tahun),
            // Ranking lintas-OPD hanya bermakna kalau sedang lihat SEMUA
            // OPD (opdId null) — kalau admin sudah mempersempit ke 1 OPD
            // via filter, ranking 1-item tidak berguna.
            'rankingOpd' => ($isAdmin && $opdId === null) ? $this->dasbor->buildRankingOpd($tahun) : [],
            'logKejadian' => $this->dasbor->buildLogKejadian($opdId),
            'kepatuhanForm8910' => $kepatuhan,
            'activityFeed' => $this->dasbor->buildActivityFeed($opdId, $isAdmin),
        ]);
    }

    /**
     * PIC biasa selalu terkunci ke OPD-nya sendiri. Admin/Super Admin
     * defaultnya null (lintas-OPD, "Semua OPD") TAPI boleh mempersempit ke
     * 1 OPD tertentu lewat ?opd_id= (dropdown filter khusus admin di
     * Dashboard) — sama pola dgn CetakHasilAnalisisController/
     * MonitoringEvaluasiController yg jg terima opd_id dari query string.
     */
    private function scopedOpdId(Request $request): ?int
    {
        $user = $request->user();
        if ($user->canViewAllOpd()) {
            return $request->integer('opd_id') ?: null;
        }

        return $user->opd_id;
    }
}
