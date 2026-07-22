<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\GeneratesKodeRisiko;
use App\Models\CeeRtp;
use App\Models\CeeSimpulan;
use App\Models\CeeUnsur;
use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\IrsPemda;
use App\Models\LaporanKejadianRisiko;
use App\Models\MonitoringRtp;
use App\Models\Opd;
use App\Models\PencatatanKejadianRisiko;
use App\Models\PengaturanPemda;
use App\Models\RiskLevel;
use App\Models\RiskMatrixCell;
use App\Services\RiskReferenceDataService;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

/**
 * Dashboard MR Kabar — HANYA widget yang berdasar langsung pada Perdep PPKD
 * No.4/2019 (bukan katalog widget generik), dikonfirmasi user setelah audit
 * gap data. Enam seksi:
 * 1. Ringkasan (Bab III Tahap 2 & 3, Bab IV Pelaporan)
 * 2. Analisis & Peta Risiko — Matriks 5x5 (Bab II.D), Progres Tahapan (Bab III)
 * 3. Distribusi Risiko — per Tingkat (Form 2a/2b/2c), per Kategori (Jenis Risiko),
 *    Inheren vs Residual (Pasal 1 angka 10 — Sisa Risiko)
 * 4. Prioritas & Tren — Daftar Risiko Prioritas (Form 5), Tren Skala Risiko per Tahun
 * 5. Kinerja UPR — Ranking Eksposur per OPD, Log Kejadian Risiko (Form 10 + Lapor Kejadian)
 * 6. Kepatuhan & Aktivitas — Kepatuhan Form 8/9/10 per OPD (Bab IV), Activity Feed
 *
 * Semua widget di-scope sama seperti halaman lain di app: PIC biasa (role
 * 'user'/'admin-instansi', punya opd_id) hanya melihat data OPD-nya sendiri;
 * Admin/Super Admin melihat lintas-OPD — lihat scopedOpdId().
 */
class DashboardController extends Controller
{
    use GeneratesKodeRisiko;

    /**
     * Cache baris risiko per-tahun (array<int, Collection>) — collectRiskRows()
     * dipanggil puluhan kali per request (2 tren berbasis loop 5-tahun + widget
     * lain), tiap kali re-query 3 tabel penuh. Memoize per tahun+opd supaya
     * query 3 tabel cuma jalan sekali per kombinasi tahun/opd. Key: "tahun:opd".
     */
    protected array $rowsCache = [];

    public function __construct(private readonly RiskReferenceDataService $riskRef)
    {
    }

    /** Aksesor memoized ke collectRiskRows() — semua widget lewat sini. */
    private function rowsForTahun(int $tahun, ?int $opdId): Collection
    {
        $key = $tahun . ':' . ($opdId ?? 'all');

        return $this->rowsCache[$key] ??= $this->collectRiskRows($tahun, $opdId);
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
        if ($user->hasAnyRole(['admin', 'super-admin'])) {
            return $request->integer('opd_id') ?: null;
        }

        return $user->opd_id;
    }

    private function pengaturan(): PengaturanPemda
    {
        return PengaturanPemda::current();
    }

    public function index(Request $request)
    {
        $opdId = $this->scopedOpdId($request);
        // Role sebenarnya (Admin/Super Admin) — TERPISAH dari "sedang lihat
        // OPD mana": admin boleh mempersempit ke 1 OPD via dropdown filter
        // (opdId tidak null), tapi widget khusus admin (mis. filter OPD itu
        // sendiri) tetap harus tampil; widget lintas-OPD spt Ranking
        // Eksposur baru bermakna kalau memang sedang lihat SEMUA OPD.
        $isAdmin = $request->user()->hasAnyRole(['admin', 'super-admin']);
        $tahun = $request->integer('tahun') ?: (int) $this->pengaturan()->tahun_penilaian;

        $riskRows = $this->rowsForTahun($tahun, $opdId);
        $riskLevels = RiskLevel::orderBy('urutan')->get(['label', 'skala_min', 'skala_max', 'warna_class']);
        // Fallback ?? 16 / ?? 20 di bawah mengasumsikan label RiskLevel
        // 'Tinggi'/'Sangat Tinggi' selalu ada & ambangnya konvensional (16/20)
        // — dipakai HANYA saat tabel RiskLevel kosong/label diubah. Bukan
        // fix aman utk diubah otomatis (butuh keputusan produk apakah label
        // level risiko harus imutable); dibiarkan sbg asumsi terdokumentasi.
        $ambangTinggi = RiskLevel::whereIn('label', ['Tinggi', 'Sangat Tinggi'])->min('skala_min') ?? 16;
        // Dihitung sekali & dipakai bersama Ringkasan + widget Kepatuhan —
        // sebelumnya buildKepatuhan() dipanggil 2x dgn argumen identik
        // (sekali di dalam buildRingkasan, sekali di sini), dobel query
        // MonitoringRtp/PencatatanKejadianRisiko + loop OPD tanpa manfaat.
        $kepatuhan = $this->buildKepatuhan($tahun, $opdId, $this->opdIdsWithRiskRows($tahun, $opdId));

        return Inertia::render('dashboard', [
            'isAdmin' => $isAdmin,
            'opdId' => $opdId,
            'opdOptions' => $isAdmin ? Opd::orderBy('nama')->get(['id', 'nama']) : [],
            'tahun' => $tahun,
            'tahunOptions' => $this->tahunOptions($opdId),
            'ringkasan' => $this->buildRingkasan($riskRows, $ambangTinggi, $kepatuhan),
            'matriks' => $this->buildMatriks($riskRows),
            'matriksDetail' => $this->buildMatriksDetail($riskRows),
            'matrixCells' => $this->buildMatrixCells(),
            'riskLevels' => $riskLevels,
            'progresTahapan' => $this->buildProgresTahapan($tahun, $opdId),
            'distribusiTingkat' => $this->buildDistribusiTingkat($riskRows),
            'distribusiKategori' => $this->buildDistribusiKategori($riskRows),
            'inherenResidual' => $this->buildInherenResidual($riskRows),
            'risikoPrioritas' => $this->buildRisikoPrioritas($riskRows, $ambangTinggi),
            'trenTahunan' => $this->buildTrenTahunan($opdId, $tahun),
            'trenEfektivitasPengendalian' => $this->buildTrenEfektivitasPengendalian($opdId, $tahun),
            // Ranking lintas-OPD hanya bermakna kalau sedang lihat SEMUA
            // OPD (opdId null) — kalau admin sudah mempersempit ke 1 OPD
            // via filter, ranking 1-item tidak berguna.
            'rankingOpd' => ($isAdmin && $opdId === null) ? $this->buildRankingOpd($tahun) : [],
            'logKejadian' => $this->buildLogKejadian($opdId),
            'kepatuhanForm8910' => $kepatuhan,
            'activityFeed' => $this->buildActivityFeed($opdId, $isAdmin),
        ]);
    }

    /** Tahun-tahun yang punya minimal 1 baris risiko, utk selector — fallback ke tahun aktif kalau kosong. */
    private function tahunOptions(?int $opdId): array
    {
        $query = fn ($model) => $opdId
            ? $model::whereHas('user', fn ($q) => $q->where('opd_id', $opdId))
            : $model::query();

        $tahuns = $query(IrsPemda::class)->pluck('TAHUN DINILAI RISIKO')
            ->concat($query(IrsPd::class)->pluck('TAHUN DINILAI RISIKO'))
            ->concat($query(IroPd::class)->pluck('TAHUN DINILAI RISIKO'))
            ->filter()
            ->map(fn ($t) => (int) $t)
            ->unique()
            ->sortDesc()
            ->values()
            ->all();

        return $tahuns ?: [(int) $this->pengaturan()->tahun_penilaian];
    }

    /**
     * Kumpulkan SELURUH baris risiko (3 tingkat) utk tahun+opd terpilih,
     * jadi satu Collection array asosiatif seragam — dipakai bersama oleh
     * hampir semua widget supaya query ke 3 tabel cuma dijalankan SEKALI
     * per request (bukan per-widget), sama semangat dgn buildAnalisisRisiko()
     * di CetakHasilAnalisisController.
     */
    private function collectRiskRows(int $tahun, ?int $opdId): Collection
    {
        $namaPemda = $this->pengaturan()->pemerintah_kabkota ?: 'Pemerintah Kabupaten Aceh Barat';

        // Prefix Kode Risiko [PREFIX].[TAHUN].[JENIS].[ENTITAS].[NOMOR_URUT]
        // sesuai TINGKAT_RISIKO_VALUE masing2 controller data — SAMA PERSIS
        // dgn yg dipakai CetakHasilAnalisisController (Form 4/5)/
        // CetakRisikoController (Form 3), supaya kode risiko yg tampil di
        // Dashboard identik dgn yg tercetak di Form Cetak.
        // Skala Aktual (hasil monitoring) tersimpan PER-RTP di monitoring_rtp
        // (satu risiko bisa py >1 RTP masing2 dinilai efektivitasnya
        // sendiri), bukan kolom di tabel risiko — lihat migrasi
        // 2026_07_22_010000. Diambil SEKALI di sini (bukan N+1 per baris),
        // di-keyBy "rtp_sumber_tipe:rtp_sumber_id", grouped ambil skala
        // risiko aktual TERTINGGI (worst-case/conservative — kalau salah
        // satu RTP risiko itu gagal, itu yg merepresentasikan risiko
        // keseluruhan, bukan disamarkan rata-rata dgn RTP lain yg berhasil).
        $skalaAktualMax = MonitoringRtp::whereNotNull('skala_risiko_aktual')
            ->get(['rtp_sumber_tipe', 'rtp_sumber_id', 'skala_risiko_aktual'])
            ->groupBy(fn ($m) => $m->rtp_sumber_tipe . ':' . $m->rtp_sumber_id)
            ->map(fn ($g) => $g->max('skala_risiko_aktual'));

        $map = function ($rows, string $tingkat, string $prefixKode, ?string $opdLabelDefault = null) use ($opdId, $skalaAktualMax) {
            // Nomor urut kode risiko dihitung dari SELURUH baris tingkat ini
            // (lintas-OPD) supaya identik dgn yg tercetak di Form Cetak, BARU
            // difilter ke OPD terpilih — filter tidak boleh didorong ke SQL
            // di sini krn akan mengubah penomoran (lihat nomorUrutFor()).
            $nomorUrut = $this->nomorUrutFor($rows);
            $rtpSumberTipe = self::RTP_SUMBER_TIPE_BY_TIPE[$tingkat] ?? null;

            return $rows
                ->filter(fn ($r) => !$opdId || $r->user?->opd_id === $opdId)
                ->map(fn ($r) => [
                    'id' => $r->id,
                    'tipe' => $tingkat,
                    'opd_id' => $r->user?->opd_id,
                    'opd_nama' => $opdLabelDefault ?? ($r->user?->opd?->nama ?? '-'),
                    // Nama OPD pemilik SEBENARNYA (PIC penyusun) — dipakai widget yg
                    // di-group per opd_id (Ranking Eksposur), BEDA dari opd_nama di
                    // atas yg utk Strategis Pemda sengaja dilabeli nama Pemda (bukan
                    // OPD penyusun) supaya tabel Prioritas menampilkan level yg benar.
                    'owner_opd_nama' => $r->user?->opd?->nama ?? '-',
                    'kode_risiko' => $this->generateKodeRisiko(
                        $prefixKode,
                        $r->{'TAHUN DINILAI RISIKO'},
                        $r->{'JENIS RISIKO'},
                        $r->{'ENTITAS PD YANG MENILAI'},
                        $nomorUrut[$r->id] ?? null,
                    ),
                    'skala_dampak' => $r->{'SKALA DAMPAK'} ? (int) $r->{'SKALA DAMPAK'} : null,
                    'skala_kemungkinan' => $r->{'SKALA KEMUNGKINAN'} ? (int) $r->{'SKALA KEMUNGKINAN'} : null,
                    'skala_risiko' => $r->{'SKALA RISIKO'} ? (int) $r->{'SKALA RISIKO'} : null,
                    'skala_dampak_inheren' => $r->{'SKALA DAMPAK INHEREN'} ? (int) $r->{'SKALA DAMPAK INHEREN'} : null,
                    'skala_kemungkinan_inheren' => $r->{'SKALA KEMUNGKINAN INHEREN'} ? (int) $r->{'SKALA KEMUNGKINAN INHEREN'} : null,
                    'skala_risiko_inheren' => $r->{'SKALA RISIKO INHEREN'} ? (int) $r->{'SKALA RISIKO INHEREN'} : null,
                    'skala_risiko_target' => $r->{'SKALA RISIKO TARGET'} ? (int) $r->{'SKALA RISIKO TARGET'} : null,
                    'skala_risiko_aktual' => $rtpSumberTipe ? $skalaAktualMax->get("{$rtpSumberTipe}:{$r->id}") : null,
                    'jenis_risiko' => $r->{'JENIS RISIKO'},
                    'uraian_risiko' => $r->{'URAIAN RISIKO'},
                    'rencana_tindak_pengendalian' => $r->{'RENCANA TINDAK PENGENDALIAN'},
                ]);
        };

        // Batasi kolom ke yg benar2 dipakai $map()/nomorUrutFor() saja
        // (bukan SELECT *) — 'user_id' WAJIB ada supaya eager-load user.opd
        // tetap jalan. Ke-3 tabel berbagi skema kolom risiko yg sama.
        $kolom = [
            'id', 'user_id',
            'TAHUN DINILAI RISIKO', 'JENIS RISIKO', 'ENTITAS PD YANG MENILAI',
            'SKALA DAMPAK', 'SKALA KEMUNGKINAN', 'SKALA RISIKO',
            'SKALA DAMPAK INHEREN', 'SKALA KEMUNGKINAN INHEREN', 'SKALA RISIKO INHEREN',
            'SKALA DAMPAK TARGET', 'SKALA KEMUNGKINAN TARGET', 'SKALA RISIKO TARGET',
            'URAIAN RISIKO', 'RENCANA TINDAK PENGENDALIAN',
        ];

        $strategisPemda = IrsPemda::whereHas('user')
            ->where('TAHUN DINILAI RISIKO', (string) $tahun)
            ->with('user.opd')
            ->select($kolom)
            ->get()
            ->filter(fn ($r) => trim((string) $r->{'URAIAN RISIKO'}) !== '');

        $strategisOpd = IrsPd::whereHas('user')
            ->where('TAHUN DINILAI RISIKO', (string) $tahun)
            ->with('user.opd')
            ->select($kolom)
            ->get()
            ->filter(fn ($r) => trim((string) $r->{'URAIAN RISIKO'}) !== '');

        $operasionalOpd = IroPd::whereHas('user')
            ->where('TAHUN DINILAI RISIKO', (string) $tahun)
            ->with('user.opd')
            ->select($kolom)
            ->get()
            ->filter(fn ($r) => trim((string) $r->{'URAIAN RISIKO'}) !== '');

        return $map($strategisPemda, 'Strategis Pemda', 'RSP', $namaPemda)
            ->concat($map($strategisOpd, 'Strategis OPD', 'RSO'))
            ->concat($map($operasionalOpd, 'Operasional OPD', 'ROO'))
            ->values();
    }

    /**
     * Set opd_id yg py minimal 1 baris risiko (identifikasi, tahap manapun)
     * di tahun ybs — dipakai buildKepatuhan() utk membedakan OPD yg memang
     * BELUM melapor (py risiko tapi Form 8/9/10 kosong) dari OPD yg TIDAK
     * PUNYA risiko sama sekali di tahun itu (status 'belum lapor' salah/
     * menyesatkan utk kasus kedua — seharusnya N/A, bukan pelanggaran
     * kepatuhan).
     */
    private function opdIdsWithRiskRows(int $tahun, ?int $opdId): Collection
    {
        $query = fn ($model) => $opdId
            ? $model::whereHas('user', fn ($q) => $q->where('opd_id', $opdId))
            : $model::query();

        return $query(IrsPemda::class)->where('TAHUN DINILAI RISIKO', (string) $tahun)
            ->whereHas('user')->with('user')->get()->pluck('user.opd_id')
            ->concat($query(IrsPd::class)->where('TAHUN DINILAI RISIKO', (string) $tahun)
                ->whereHas('user')->with('user')->get()->pluck('user.opd_id'))
            ->concat($query(IroPd::class)->where('TAHUN DINILAI RISIKO', (string) $tahun)
                ->whereHas('user')->with('user')->get()->pluck('user.opd_id'))
            ->filter()
            ->unique();
    }

    // ── Seksi 1: Ringkasan ───────────────────────────────────────────────

    private function buildRingkasan(Collection $rows, int $ambangTinggi, array $kepatuhan): array
    {
        $prioritas = $rows->filter(fn ($r) => ($r['skala_risiko'] ?? 0) >= $ambangTinggi);

        // RTP tersusun: risiko prioritas yg field RTP-nya (IRS/IRO ATAU
        // sudah dilengkapi di MonitoringRtp) sudah terisi.
        $rtpTerisi = $prioritas->filter(fn ($r) => trim((string) ($r['rencana_tindak_pengendalian'] ?? '')) !== '')->count();

        // OPD 'n/a' (tidak py risiko teridentifikasi tahun ini) dikecualikan
        // dari basis "wajib" — bukan target kepatuhan yg nyata.
        $totalOpdWajib = collect($kepatuhan)->where('status', '!=', 'n/a')->count();
        $opdPatuh = collect($kepatuhan)->where('status', 'lengkap')->count();

        return [
            'total_risiko' => $rows->count(),
            'risiko_prioritas' => $prioritas->count(),
            'rtp_tersusun' => $rtpTerisi,
            'rtp_dibutuhkan' => $prioritas->count(),
            'opd_patuh' => $opdPatuh,
            'total_opd_wajib' => $totalOpdWajib,
        ];
    }

    // ── Seksi 2.1: Matriks Risiko 5x5 ────────────────────────────────────

    /**
     * Jumlah risiko per sel (dampak x kemungkinan) HANYA — skala_risiko &
     * warna_class TIDAK dihitung ulang di sini (dulu FE hitung sendiri
     * dampak*kemungkinan sbg skala, salah: matriks Perdep BUKAN tabel
     * perkalian murni, mis. dampak=2,kemungkinan=3 -> skala 10, bukan 6).
     * Sumber tunggal kebenaran utk skala & warna tiap sel adalah
     * RiskMatrixCell (dikonfigurasi di /keterangan-pendukung, lihat
     * buildMatrixCells()) — dashboard WAJIB ikut tabel itu, bukan
     * menghitung independen, supaya warna Peta Risiko konsisten dgn
     * keterangan pendukung.
     */
    private function buildMatriks(Collection $rows): array
    {
        $cells = [];
        for ($kemungkinan = 1; $kemungkinan <= 5; $kemungkinan++) {
            for ($dampak = 1; $dampak <= 5; $dampak++) {
                $cells["{$kemungkinan}-{$dampak}"] = $rows
                    ->filter(fn ($r) => $r['skala_dampak'] === $dampak && $r['skala_kemungkinan'] === $kemungkinan)
                    ->count();
            }
        }

        return $cells;
    }

    /**
     * Daftar ringkas risiko per sel matriks (dipakai popover hover + dialog
     * rincian di FE) — TERPISAH dari buildMatriks() (jumlah saja) supaya
     * kontrak lama tidak berubah. Field dibatasi ke yg relevan ditampilkan,
     * bukan seluruh baris IRS/IRO.
     */
    private function buildMatriksDetail(Collection $rows): array
    {
        $cells = [];
        for ($kemungkinan = 1; $kemungkinan <= 5; $kemungkinan++) {
            for ($dampak = 1; $dampak <= 5; $dampak++) {
                $cells["{$kemungkinan}-{$dampak}"] = $rows
                    ->filter(fn ($r) => $r['skala_dampak'] === $dampak && $r['skala_kemungkinan'] === $kemungkinan)
                    ->map(fn ($r) => [
                        'id' => $r['id'],
                        'tipe' => $r['tipe'],
                        'opd_nama' => $r['owner_opd_nama'],
                        'uraian_risiko' => $r['uraian_risiko'],
                        'rtp_terisi' => trim((string) ($r['rencana_tindak_pengendalian'] ?? '')) !== '',
                        'url' => $this->urlKeBarisRisiko($r['tipe'], $r['id']),
                    ])
                    ->values()
                    ->all();
            }
        }

        return $cells;
    }

    /**
     * URL ke halaman index IRS/IRO dgn ?highlight_id={id} — begitu halaman
     * dimuat, baris risiko itu langsung di-scroll & disorot (ring oranye,
     * sama tampilan dgn hasil pencarian teks), TANPA pengguna perlu
     * mengetik apapun di kolom pencarian. Lihat highlightRow() di
     * use-row-search.ts.
     */
    private function urlKeBarisRisiko(string $tipe, int $id): string
    {
        $base = self::URL_INDEX_BY_TIPE[$tipe] ?? '/irs_pemda';

        return "{$base}?highlight_id={$id}";
    }

    /** Skala & warna resmi tiap sel matriks, dari RiskMatrixCell (lihat buildMatriks()). */
    private function buildMatrixCells(): array
    {
        return RiskMatrixCell::all()
            ->map(fn ($c) => [
                'dampak' => $c->dampak,
                'kemungkinan' => $c->kemungkinan,
                'skala_risiko' => $c->skala_risiko,
                'warna_class' => $c->warna_class,
            ])
            ->values()
            ->all();
    }

    // ── Seksi 2.2: Progres Tahapan per UPR ───────────────────────────────

    /**
     * 7 tahap standar per OPD, sesuai alur Form Input aplikasi (representasi
     * praktis dari Lampiran 5 Perdep — CEE dulu, baru Identifikasi->Analisis
     * ->RTP->Pemantauan): CEE 1a, CEE 1c (simpulan), IRS/IRO (identifikasi
     * risiko) terisi, Skala Dampak/Kemungkinan terisi (analisis), RTP
     * risiko tersusun utk SELURUH risiko prioritas (skala >= ambang
     * Tinggi — BEDA dari widget Ringkasan "RTP Selesai Disusun" yg
     * persentase, tahap ini biner: lengkap HANYA jika semua risiko
     * prioritas OPD sudah py RTP, bukan sebagian), 1d RTP CEE (kalau ada
     * unsur Kurang Memadai), Form 8/9/10 (monitoring+evaluasi) dilengkapi.
     * Tahap "Konteks (KRS/KRO)" SENGAJA tidak dijadikan tahap terpisah —
     * KRS/KRO tidak py status "lengkap/belum" yg jelas beda dari IRS/IRO
     * (keduanya diisi di form yg sama).
     */
    private function buildProgresTahapan(int $tahun, ?int $opdId): array
    {
        $opds = $opdId ? Opd::where('id', $opdId)->get() : Opd::orderBy('nama')->get();
        $totalUnsurCee = CeeUnsur::count();

        $ceeSimpulanCounts = CeeSimpulan::where('tahun_penilaian', $tahun)
            ->selectRaw('opd_id, count(*) as jumlah')
            ->groupBy('opd_id')->pluck('jumlah', 'opd_id');
        $ceeKurangMemadaiOpd = CeeSimpulan::where('tahun_penilaian', $tahun)
            ->where('simpulan', 'Kurang Memadai')->pluck('opd_id')->unique();
        $ceeRtpOpd = CeeRtp::where('tahun_penilaian', $tahun)->pluck('opd_id')->unique();

        $irsPemdaOpd = IrsPemda::whereHas('user')->where('TAHUN DINILAI RISIKO', (string) $tahun)
            ->with('user')->get()->pluck('user.opd_id')->filter()->unique();
        $irsPdOpd = IrsPd::whereHas('user')->where('TAHUN DINILAI RISIKO', (string) $tahun)
            ->with('user')->get()->pluck('user.opd_id')->filter()->unique();
        $iroPdOpd = IroPd::whereHas('user')->where('TAHUN DINILAI RISIKO', (string) $tahun)
            ->with('user')->get()->pluck('user.opd_id')->filter()->unique();
        $risikoTeridentifikasiOpd = $irsPemdaOpd->concat($irsPdOpd)->concat($iroPdOpd)->unique();

        $skalaTerisiOpd = IrsPemda::whereHas('user')->where('TAHUN DINILAI RISIKO', (string) $tahun)
            ->whereNotNull('SKALA DAMPAK')->with('user')->get()->pluck('user.opd_id')
            ->concat(IrsPd::whereHas('user')->where('TAHUN DINILAI RISIKO', (string) $tahun)
                ->whereNotNull('SKALA DAMPAK')->with('user')->get()->pluck('user.opd_id'))
            ->concat(IroPd::whereHas('user')->where('TAHUN DINILAI RISIKO', (string) $tahun)
                ->whereNotNull('SKALA DAMPAK')->with('user')->get()->pluck('user.opd_id'))
            ->filter()->unique();

        $monitoringOpd = MonitoringRtp::where('tahun_penilaian', $tahun)->pluck('opd_id')->unique();
        $pencatatanOpd = PencatatanKejadianRisiko::where('tahun_penilaian', $tahun)->pluck('opd_id')->unique();

        // OPD yg SEMUA risiko prioritasnya (skala >= ambang Tinggi) sudah
        // py 'RENCANA TINDAK PENGENDALIAN' terisi — sebelumnya tahap ini
        // TIDAK ADA sama sekali (celah: OPD bisa tampil 6/6 "Selesai" di
        // widget ini padahal masih py risiko prioritas tanpa RTP, hanya
        // ketahuan dari widget Ringkasan "RTP Selesai Disusun" yg terpisah).
        $ambangTinggiTahapan = RiskLevel::whereIn('label', ['Tinggi', 'Sangat Tinggi'])->min('skala_min') ?? 16;
        $rowsSemuaOpd = $this->rowsForTahun($tahun, null);
        $rtpRisikoLengkapOpd = $rowsSemuaOpd
            ->filter(fn ($r) => $r['opd_id'] !== null)
            ->groupBy('opd_id')
            ->filter(function ($g) use ($ambangTinggiTahapan) {
                $prioritas = $g->filter(fn ($r) => ($r['skala_risiko'] ?? 0) >= $ambangTinggiTahapan);

                return $prioritas->every(fn ($r) => trim((string) ($r['rencana_tindak_pengendalian'] ?? '')) !== '');
            })
            ->keys();

        return $opds->map(function ($opd) use (
            $ceeSimpulanCounts, $totalUnsurCee, $ceeKurangMemadaiOpd, $ceeRtpOpd,
            $risikoTeridentifikasiOpd, $skalaTerisiOpd, $rtpRisikoLengkapOpd, $monitoringOpd, $pencatatanOpd
        ) {
            $jumlahSimpulan = $ceeSimpulanCounts[$opd->id] ?? 0;
            $ceeSelesai = $totalUnsurCee > 0 && $jumlahSimpulan >= $totalUnsurCee;
            $butuhRtpCee = $ceeKurangMemadaiOpd->contains($opd->id);

            // Tiap tahap py 'url' tujuan (form input terkait, di-query
            // ?opd_id= supaya Admin/Super Admin diarahkan ke OPD yg benar
            // saat klik dari widget ini) — dipakai FE utk daftar rincian
            // saat hover + navigasi saat tahap yg belum selesai diklik.
            $tahap = [
                ['nama' => 'CEE (1a-1c)', 'selesai' => $ceeSelesai, 'url' => "/cee/1a?opd_id={$opd->id}"],
                ['nama' => 'Identifikasi Risiko', 'selesai' => $risikoTeridentifikasiOpd->contains($opd->id), 'url' => "/irs_pd?opd_id={$opd->id}"],
                ['nama' => 'Analisis (Skala Dampak/Kemungkinan)', 'selesai' => $skalaTerisiOpd->contains($opd->id), 'url' => "/irs_pd?opd_id={$opd->id}"],
                ['nama' => 'RTP Risiko Prioritas', 'selesai' => $rtpRisikoLengkapOpd->contains($opd->id), 'url' => "/irs_pd?opd_id={$opd->id}"],
                // "Tidak butuh RTP CEE" HANYA valid kalau CEE-nya sendiri
                // sudah selesai dinilai — kalau CEE belum dikerjakan sama
                // sekali, statusnya belum bisa ditentukan (BUKAN otomatis
                // "tidak butuh"). Tanpa guard $ceeSelesai ini, OPD yg belum
                // mulai CEE sama sekali keliru dapat 1 tahap gratis di sini.
                ['nama' => 'RTP CEE (1d)', 'selesai' => $ceeSelesai && (!$butuhRtpCee || $ceeRtpOpd->contains($opd->id)), 'url' => "/cee/1d?opd_id={$opd->id}"],
                ['nama' => 'Monitoring RTP (8-9)', 'selesai' => $monitoringOpd->contains($opd->id), 'url' => "/monitoring-evaluasi/8-9?opd_id={$opd->id}"],
                ['nama' => 'Pencatatan Kejadian (10)', 'selesai' => $pencatatanOpd->contains($opd->id), 'url' => "/monitoring-evaluasi/10?opd_id={$opd->id}"],
            ];

            $selesai = collect($tahap)->where('selesai', true)->count();
            $total = count($tahap);

            return [
                'opd_id' => $opd->id,
                'opd_nama' => $opd->nama,
                'tahap_selesai' => $selesai,
                'total_tahap' => $total,
                'persen' => $total > 0 ? round(($selesai / $total) * 100) : 0,
                'lengkap' => $selesai >= $total,
                'label_tahap_saat_ini' => collect($tahap)->where('selesai', false)->pluck('nama')->first() ?? 'Selesai',
                'tahap' => $tahap,
            ];
        })->sortByDesc('persen')->values()->all();
    }

    // ── Seksi 3.1: Distribusi per Tingkatan ──────────────────────────────

    private function buildDistribusiTingkat(Collection $rows): array
    {
        return $rows->groupBy('tipe')->map(fn ($g, $tipe) => ['tingkat' => $tipe, 'jumlah' => $g->count()])->values()->all();
    }

    // ── Seksi 3.2: Distribusi per Kategori (Jenis Risiko) ────────────────

    // Halaman index per tingkat risiko — dipakai FE utk dialog rincian
    // risiko yg diklik dari daftar per kategori (list biasa, sama pola dgn
    // buildMatriksDetail()).
    private const URL_INDEX_BY_TIPE = [
        'Strategis Pemda' => '/irs_pemda',
        'Strategis OPD' => '/irs_pd',
        'Operasional OPD' => '/iro_pd',
    ];

    /** Label 'tipe' (dipakai widget) -> rtp_sumber_tipe (dipakai MonitoringRtp) — lihat lookupSkalaAktual(). */
    private const RTP_SUMBER_TIPE_BY_TIPE = [
        'Strategis Pemda' => 'irs_pemda',
        'Strategis OPD' => 'irs_pd',
        'Operasional OPD' => 'iro_pd',
    ];

    private function buildDistribusiKategori(Collection $rows): array
    {
        return $rows
            ->filter(fn ($r) => !empty($r['jenis_risiko']))
            ->groupBy('jenis_risiko')
            ->map(fn ($g, $jenis) => [
                'kategori' => $jenis,
                'jumlah' => $g->count(),
                'risiko' => $g->map(fn ($r) => [
                    'id' => $r['id'],
                    'tipe' => $r['tipe'],
                    'opd_nama' => $r['owner_opd_nama'],
                    'uraian_risiko' => $r['uraian_risiko'],
                    'skala_risiko' => $r['skala_risiko'],
                    'rtp_terisi' => trim((string) ($r['rencana_tindak_pengendalian'] ?? '')) !== '',
                    'url' => $this->urlKeBarisRisiko($r['tipe'], $r['id']),
                ])->values()->all(),
            ])
            ->sortByDesc('jumlah')
            ->values()
            ->take(10)
            ->all();
    }

    // ── Seksi 3.3: Inheren vs Residual ───────────────────────────────────

    /**
     * Hanya baris yg skala inherennya SUDAH diisi PIC (opsional) — lihat
     * migrasi kolom inheren. SELURUH baris yg memenuhi syarat ditampilkan
     * (bukan dipotong ->take(N)) — chart-nya scrollable di FE supaya tidak
     * ada data yg tersembunyi tanpa keterangan. Diurut DESC berdasarkan gap
     * (skala_inheren - skala_residual) — gap terbesar di atas berarti
     * pengendalian PALING efektif menurunkan risiko, jadi widget ini
     * langsung terbaca sbg "ranking efektivitas pengendalian", bukan
     * sekadar daftar risiko.
     *
     * skala_target/skala_aktual DISERTAKAN (bisa null, opsional) supaya
     * widget menampilkan siklus PENUH 4-skor COSO ERM (inherent -> residual
     * -> target/appetite -> monitoring reassessment), bukan cuma 2 titik
     * pertama — Target = sasaran ditetapkan di Form Input Risiko, Aktual =
     * hasil monitoring RTP (nilai TERTINGGI/worst-case antar RTP risiko
     * ini, lihat lookupSkalaAktual di collectRiskRows()).
     */
    private function buildInherenResidual(Collection $rows): array
    {
        return $rows
            ->filter(fn ($r) => $r['skala_risiko_inheren'] !== null && $r['skala_risiko'] !== null)
            ->map(fn ($r) => [
                'id' => $r['id'],
                'tipe' => $r['tipe'],
                'opd_nama' => $r['owner_opd_nama'],
                'kode_risiko' => $r['kode_risiko'],
                'uraian_risiko' => \Illuminate\Support\Str::limit($r['uraian_risiko'], 60),
                'skala_inheren' => $r['skala_risiko_inheren'],
                'skala_residual' => $r['skala_risiko'],
                'skala_target' => $r['skala_risiko_target'],
                'skala_aktual' => $r['skala_risiko_aktual'],
                'rtp_terisi' => trim((string) ($r['rencana_tindak_pengendalian'] ?? '')) !== '',
                'url' => $this->urlKeBarisRisiko($r['tipe'], $r['id']),
            ])
            ->sortByDesc(fn ($r) => $r['skala_inheren'] - $r['skala_residual'])
            ->values()
            ->all();
    }

    // ── Seksi 4.1: Daftar Risiko Prioritas ───────────────────────────────

    /**
     * SELURUH risiko prioritas ditampilkan (bukan dipotong ->take(8)) —
     * list-nya scrollable di FE, sama pola dgn buildInherenResidual(),
     * supaya tidak ada risiko prioritas yg tersembunyi tanpa keterangan.
     */
    private function buildRisikoPrioritas(Collection $rows, int $ambangTinggi): array
    {
        return $rows
            ->filter(fn ($r) => ($r['skala_risiko'] ?? 0) >= $ambangTinggi)
            ->sortByDesc('skala_risiko')
            ->map(fn ($r) => [
                'id' => $r['id'],
                'tipe' => $r['tipe'],
                'opd_nama' => $r['opd_nama'],
                'kode_risiko' => $r['kode_risiko'],
                'uraian_risiko' => $r['uraian_risiko'],
                'skala_risiko' => $r['skala_risiko'],
                'rtp_status' => trim((string) ($r['rencana_tindak_pengendalian'] ?? '')) !== '' ? 'RTP Tersusun' : 'Belum RTP',
                'rtp_terisi' => trim((string) ($r['rencana_tindak_pengendalian'] ?? '')) !== '',
                'url' => $this->urlKeBarisRisiko($r['tipe'], $r['id']),
            ])
            ->values()
            ->all();
    }

    // ── Seksi 4.2: Tren Skala Risiko per Tahun ───────────────────────────

    /**
     * Tren TAHUNAN (bukan triwulanan) — TRIWULAN pada IRS/IRO berarti
     * target penyelesaian RTP, bukan waktu penilaian, jadi tidak representatif
     * dipakai sbg sumbu tren "kapan risiko dinilai". TAHUN DINILAI RISIKO
     * adalah satu2nya dimensi waktu yg konsisten across 3 tabel utk tren ini.
     */
    private function buildTrenTahunan(?int $opdId, int $tahunAktif): array
    {
        $tahunList = range($tahunAktif - 4, $tahunAktif);
        $ambangSangatTinggi = RiskLevel::where('label', 'Sangat Tinggi')->value('skala_min') ?? 20;
        $ambangTinggi = RiskLevel::where('label', 'Tinggi')->value('skala_min') ?? 16;

        return collect($tahunList)->map(function ($tahun) use ($opdId, $ambangSangatTinggi, $ambangTinggi) {
            $rows = $this->rowsForTahun($tahun, $opdId);

            return [
                'tahun' => $tahun,
                'sangat_tinggi' => $rows->filter(fn ($r) => ($r['skala_risiko'] ?? 0) >= $ambangSangatTinggi)->count(),
                'tinggi' => $rows->filter(fn ($r) => ($r['skala_risiko'] ?? 0) >= $ambangTinggi && ($r['skala_risiko'] ?? 0) < $ambangSangatTinggi)->count(),
            ];
        })->values()->all();
    }

    /**
     * OPD Ambang gap dianggap "signifikan" (pengendalian benar2 berdampak,
     * bukan cuma tercatat di kertas) — selisih skala_inheren - skala_residual
     * >= ambang ini. 5 dipilih krn skala minimum yg mungkin (band terendah
     * ke band berikutnya pada matriks 5x5 Perdep, lihat RiskMatrixCell)
     * umumnya beda >=4-5 poin; nilai ini murni ambang tampilan dashboard,
     * bukan ketentuan Perdep — bisa disesuaikan tanpa mengubah data.
     */
    private const GAP_SIGNIFIKAN_MINIMAL = 5;

    /**
     * Tren efektivitas pengendalian per tahun — 2 ukuran saling melengkapi:
     * 'rata_rata_gap' (BESARAN: seberapa besar rata2 penurunan skala risiko
     * dari Inheren ke Sisa Risiko) dan 'persen_gap_signifikan' (CAKUPAN:
     * berapa persen risiko yg gap-nya >= GAP_SIGNIFIKAN_MINIMAL, bukan
     * cuma didongkrak segelintir risiko besar). HANYA risiko yg py kedua
     * skala terisi yg dihitung (sama basis dgn buildInherenResidual()) —
     * risiko yg blm py Skala Inheren tidak bisa dinilai efektivitasnya.
     *
     * 'rata_rata_deviasi_target' — metrik BARU pelengkap siklus 4-skor COSO
     * ERM (Review Risk & Performance): seberapa jauh Aktual (hasil nyata
     * monitoring) MELESET dari Target (sasaran RTP yg direncanakan) —
     * Aktual - Target, RATA-RATA dari risiko yg SUDAH py keduanya terisi.
     * Positif = RTP rata2 tidak seefektif rencana (insight utama); negatif/
     * nol = RTP rata2 mencapai atau melampaui target. HANYA dihitung dari
     * subset risiko yg py Target DAN Aktual sekaligus (biasanya subset
     * lebih kecil dari total_dinilai, krn Aktual baru terisi belakangan
     * saat monitoring Form 9 berjalan) — 'total_dinilai_target_aktual'
     * dilaporkan terpisah supaya FE bisa menandai kalau sampelnya kecil.
     */
    private function buildTrenEfektivitasPengendalian(?int $opdId, int $tahunAktif): array
    {
        $tahunList = range($tahunAktif - 4, $tahunAktif);

        return collect($tahunList)->map(function ($tahun) use ($opdId) {
            $rows = $this->rowsForTahun($tahun, $opdId)
                ->filter(fn ($r) => $r['skala_risiko_inheren'] !== null && $r['skala_risiko'] !== null);

            $totalDinilai = $rows->count();
            $gapSignifikanCount = $rows->filter(fn ($r) => ($r['skala_risiko_inheren'] - $r['skala_risiko']) >= self::GAP_SIGNIFIKAN_MINIMAL)->count();

            $rowsTargetAktual = $rows->filter(fn ($r) => $r['skala_risiko_target'] !== null && $r['skala_risiko_aktual'] !== null);
            $totalTargetAktual = $rowsTargetAktual->count();

            return [
                'tahun' => $tahun,
                'rata_rata_gap' => $totalDinilai > 0
                    ? round($rows->avg(fn ($r) => $r['skala_risiko_inheren'] - $r['skala_risiko']), 1)
                    : null,
                'persen_gap_signifikan' => $totalDinilai > 0 ? round(($gapSignifikanCount / $totalDinilai) * 100, 2) : null,
                'total_dinilai' => $totalDinilai,
                'rata_rata_deviasi_target' => $totalTargetAktual > 0
                    ? round($rowsTargetAktual->avg(fn ($r) => $r['skala_risiko_aktual'] - $r['skala_risiko_target']), 1)
                    : null,
                'total_dinilai_target_aktual' => $totalTargetAktual,
            ];
        })->values()->all();
    }

    // ── Seksi 5.1: Ranking Eksposur per OPD (Admin/Super Admin saja) ─────

    /**
     * OPD dgn risiko teridentifikasi < ambang ini ditandai 'sampel_kecil'
     * (BUKAN dikecualikan) — skor_rata_rata dari 1-2 baris risiko gampang
     * menyesatkan (mis. 1 risiko skala 25 -> rata2 25, "terlihat" lebih
     * berisiko dari OPD dgn 30 risiko rata2 18 yg sebenarnya eksposur
     * total-nya jauh lebih besar). Frontend menampilkan badge peringatan,
     * bukan menyembunyikan barisnya.
     */
    private const RANKING_SAMPEL_MINIMAL = 5;

    private function buildRankingOpd(int $tahun): array
    {
        $rows = $this->rowsForTahun($tahun, null);
        $ambangTinggi = RiskLevel::whereIn('label', ['Tinggi', 'Sangat Tinggi'])->min('skala_min') ?? 16;

        return $rows
            ->filter(fn ($r) => $r['opd_id'] !== null)
            ->groupBy('opd_id')
            ->map(function ($g, $opdId) use ($ambangTinggi) {
                return [
                    'opd_id' => (int) $opdId,
                    'opd_nama' => $g->first()['owner_opd_nama'],
                    'total_risiko' => $g->count(),
                    'risiko_tinggi' => $g->filter(fn ($r) => ($r['skala_risiko'] ?? 0) >= $ambangTinggi)->count(),
                    // avg() bisa null kalau SEMUA baris grup ini belum py
                    // skala_risiko terisi (baru sebatas identifikasi, belum
                    // dianalisis) — round(null) deprecated di PHP 8.4.
                    'skor_rata_rata' => $g->avg('skala_risiko') !== null ? round($g->avg('skala_risiko'), 1) : null,
                    'sampel_kecil' => $g->count() < self::RANKING_SAMPEL_MINIMAL,
                ];
            })
            // OPD dgn sampel memadai diprioritaskan tampil di 10 besar drpd
            // OPD sampel kecil yg kebetulan skor rata2-nya tinggi.
            // PENTING: sortBy(array $callbacks) Laravel BUKAN "urutkan per
            // beberapa kriteria independen" — tiap elemen array itu
            // sebenarnya pasangan [callback, direction], jadi array 2
            // closure polos (tanpa direction string) di-treat sbg 1
            // kriteria + direction tidak valid & sort gagal diam-diam
            // (urutan balik ke urutan asal, TIDAK error). Gabungkan jadi
            // SATU closure yg mengembalikan tuple pembanding supaya benar2
            // sort 2 tingkat (grup dulu, baru skor tertinggi dlm grup).
            ->sortBy(fn ($r) => [$r['sampel_kecil'] ? 1 : 0, -($r['skor_rata_rata'] ?? 0)])
            ->values()
            ->take(10)
            ->all();
    }

    // ── Seksi 5.2: Log Kejadian Risiko ────────────────────────────────────

    /**
     * Gabungan Form 10 (kertas kerja resmi) + Lapor Kejadian Risiko
     * (laporan publik), diurutkan waktu terbaru — DEDUP via
     * laporan_kejadian_id: laporan warga yg sudah "naik status" jadi Form
     * 10 (lihat jembatan Lapor Risiko <-> Form 10, PencatatanKejadianRisiko
     * ::laporan_kejadian_id) HANYA muncul SEKALI sbg entri Form 10, bukan
     * dobel (dulu kejadian nyata yg sama bisa muncul 2x tanpa keterkaitan
     * apa pun antara kedua entrinya).
     *
     * SELURUH kejadian dikembalikan (bukan ->take(10)) — field 'kategori'
     * ('warga' vs 'internal') dipakai FE utk filter toggle, list-nya
     * scrollable, sama pola dgn buildRisikoPrioritas()/buildInherenResidual().
     * Membatasi 10 gabungan sebelumnya bisa bikin salah satu kategori
     * tampil kosong/sedikit hanya krn kalah bersaing masuk 10 besar
     * gabungan, bukan krn datanya memang sedikit.
     */
    private function buildLogKejadian(?int $opdId): array
    {
        $pencatatan = PencatatanKejadianRisiko::with('opd')
            ->whereNotNull('tanggal_terjadi')
            ->when($opdId, fn ($q) => $q->where('opd_id', $opdId))
            ->orderByDesc('tanggal_terjadi')
            ->get()
            ->map(fn ($p) => [
                'sumber' => $p->laporan_kejadian_id ? 'Form 10 (dari Laporan Warga)' : 'Form 10',
                'kategori' => $p->laporan_kejadian_id ? 'warga' : 'internal',
                'tanggal' => $p->tanggal_terjadi?->format('Y-m-d'),
                'opd_nama' => $p->opd?->nama ?? '-',
                'uraian' => \Illuminate\Support\Str::limit($p->dampak_saat_kejadian ?? $p->sebab_saat_kejadian ?? '-', 80),
            ]);

        $laporanIdsSudahDicatat = PencatatanKejadianRisiko::whereNotNull('laporan_kejadian_id')
            ->pluck('laporan_kejadian_id');

        $laporan = LaporanKejadianRisiko::with('opd')
            ->whereNotIn('id', $laporanIdsSudahDicatat)
            ->when($opdId, fn ($q) => $q->where('opd_id', $opdId))
            ->orderByDesc('waktu_kejadian')
            ->get()
            ->map(fn ($l) => [
                'sumber' => 'Lapor Kejadian',
                'kategori' => 'warga',
                'tanggal' => $l->waktu_kejadian?->format('Y-m-d'),
                'opd_nama' => $l->opd?->nama ?? '-',
                'uraian' => \Illuminate\Support\Str::limit($l->kejadian, 80),
                'status' => $l->status,
            ]);

        return $pencatatan->concat($laporan)
            ->sortByDesc('tanggal')
            ->values()
            ->all();
    }

    // ── Seksi 6.1: Kepatuhan Form 8/9/10 per OPD ─────────────────────────

    /**
     * "Lengkap" = OPD sudah punya RTP prioritas & seluruhnya sudah
     * dilengkapi Form 8/9 (MonitoringRtp) DAN sudah ada minimal 1 baris
     * Form 10 (PencatatanKejadianRisiko) utk tahun ybs — proxy realistis
     * dari kelengkapan data existing (Perdep tidak punya kolom
     * due_date/submitted_at eksplisit utk dibandingkan).
     */
    private function buildKepatuhan(int $tahun, ?int $opdId, Collection $opdIdsWithRiskRows): array
    {
        $opds = $opdId ? Opd::where('id', $opdId)->get() : Opd::orderBy('nama')->get();

        $monitoringCounts = MonitoringRtp::where('tahun_penilaian', $tahun)
            ->selectRaw('opd_id, count(*) as jumlah')->groupBy('opd_id')->pluck('jumlah', 'opd_id');
        $pencatatanCounts = PencatatanKejadianRisiko::where('tahun_penilaian', $tahun)
            ->selectRaw('opd_id, count(*) as jumlah')->groupBy('opd_id')->pluck('jumlah', 'opd_id');

        return $opds->map(function ($opd) use ($monitoringCounts, $pencatatanCounts, $opdIdsWithRiskRows) {
            $adaMonitoring = ($monitoringCounts[$opd->id] ?? 0) > 0;
            $adaPencatatan = ($pencatatanCounts[$opd->id] ?? 0) > 0;

            // OPD tanpa risiko teridentifikasi sama sekali di tahun ini
            // tidak punya kewajiban Form 8/9/10 utk dinilai — N/A, bukan
            // 'belum' (yg menyiratkan pelanggaran kepatuhan yg tidak nyata).
            if (!$opdIdsWithRiskRows->contains($opd->id)) {
                $status = 'n/a';
            } else {
                $status = $adaMonitoring && $adaPencatatan ? 'lengkap' : (($adaMonitoring || $adaPencatatan) ? 'sebagian' : 'belum');
            }

            return [
                'opd_id' => $opd->id,
                'opd_nama' => $opd->nama,
                'status' => $status,
                'monitoring_terisi' => $monitoringCounts[$opd->id] ?? 0,
                'pencatatan_terisi' => $pencatatanCounts[$opd->id] ?? 0,
            ];
        })->values()->all();
    }

    // ── Seksi 6.2: Activity Feed ──────────────────────────────────────────

    /**
     * PIC biasa hanya lihat aktivitas yg causer-nya diri sendiri ATAU
     * causer dari OPD yg sama (scoped) — Admin/Super Admin lihat semua,
     * sama filosofi kepemilikan data dgn seluruh app.
     *
     * Dibatasi 200 terbaru (BUKAN seluruh 1900+ baris activity_log — tabel
     * ini tumbuh terus & tidak ada batas alami sprt risiko/OPD) supaya FE
     * tetap ringan; cukup luas utk filter user/aksi/jenis data yg wajar
     * dipakai sehari-hari. List-nya scrollable di FE, sama pola dgn widget
     * lain, TIDAK dipotong tanpa keterangan.
     */
    private const ACTIVITY_FEED_LIMIT = 200;

    private function buildActivityFeed(?int $opdId, bool $isAdmin): array
    {
        $query = Activity::with('causer')->latest()->limit(self::ACTIVITY_FEED_LIMIT);

        if (!$isAdmin && $opdId) {
            $userIdsSameOpd = \App\Models\User::where('opd_id', $opdId)->pluck('id');
            $query->whereIn('causer_id', $userIdsSameOpd)->where('causer_type', \App\Models\User::class);
        }

        return $query->get()->map(function ($a) {
            // description Spatie berformat "{aksi} {Model}" (mis. "updated
            // IrsPemda") — pecah kata pertama sbg jenis aksi utk filter FE,
            // sisanya (subjek) sudah tersedia dari class_basename terpisah.
            preg_match('/^(\w+)/', $a->description ?? '', $m);

            return [
                'deskripsi' => $a->description,
                'aksi' => $m[1] ?? null,
                'causer_nama' => $a->causer?->name ?? $a->causer?->username ?? 'Sistem',
                'subjek' => class_basename($a->subject_type ?? ''),
                'waktu' => $a->created_at?->diffForHumans(),
                'waktu_iso' => $a->created_at?->toIso8601String(),
            ];
        })->values()->all();
    }
}
