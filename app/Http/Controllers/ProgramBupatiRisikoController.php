<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\GeneratesKodeRisiko;
use App\Http\Controllers\Concerns\SharesCetakContext;
use App\Models\DataUmum;
use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\IrsPemda;
use App\Models\KrsPemda;
use App\Models\PengaturanPemda;
use App\Models\ProgramBupatiRisiko;
use App\Models\ProgramPembangunanBupati;
use App\Services\PdfPrintService;
use App\Services\RiskReferenceDataService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * Halaman "Miscellaneous > Risiko 100 Program Bupati" — untuk tiap 100
 * Program Pembangunan Bupati (Tabel 3.7 RPJM 2025-2029), tampilkan risiko
 * teridentifikasi tahun 2025 (IRS Pemda/IRS PD/IRO PD) yang secara nyata
 * dapat mengganggu pencapaian program tsb. Klik satu risiko mengarahkan ke
 * halaman IRS/IRO asalnya dengan baris tersorot (?highlight_id=, sama pola
 * dgn DashboardController).
 *
 * EDITABLE lewat UI (tambah/lepas kaitan risiko per program) — pemetaan
 * AWAL diisi lewat ProgramBupatiRisikoSeeder (analisis satu kali per
 * periode RPJM), tapi bisa dikoreksi/dilengkapi kapan saja lewat halaman
 * ini.
 *
 * MENAMBAH kaitan terbuka untuk semua user yang login, termasuk PIC OPD —
 * ini keputusan eksplisit user: halaman ini informasi read-mostly, dan PIC
 * yang paling tahu risiko OPD-nya sendiri.
 *
 * MELEPAS kaitan dibatasi Admin & Super Admin sejak 29 Juli 2026, atas
 * permintaan user setelah melihat tombol hapus muncul di akun PIC. Semula
 * ikut terbuka seperti tambah, tapi sifatnya berbeda: satu klik
 * menghilangkan hasil analisis yang dipakai seluruh Pemda dan ikut tercetak
 * untuk Bupati, sementara kaitan yang keliru masih bisa ditinjau dan
 * dikoreksi belakangan. Hapus kaitan = SOFT DELETE (lihat migrasi
 * 2026_07_27_160237_add_soft_deletes_to_program_bupati_risiko_table),
 * konsisten dgn konvensi hapus data risiko lain di aplikasi ini.
 */
class ProgramBupatiRisikoController extends Controller
{
    use GeneratesKodeRisiko;
    use SharesCetakContext;

    public function __construct(private readonly RiskReferenceDataService $riskRef)
    {
    }

    private const URL_INDEX_BY_TIPE = [
        'irs_pemda' => '/irs_pemda',
        'irs_pd' => '/irs_pd',
        'iro_pd' => '/iro_pd',
    ];

    private const RISIKO_MODELS = [
        'irs_pemda' => IrsPemda::class,
        'irs_pd' => IrsPd::class,
        'iro_pd' => IroPd::class,
    ];

    /**
     * Prefix Kode Risiko [PREFIX].[TAHUN].[JENIS].[ENTITAS].[NOMOR_URUT] per
     * tipe — SAMA PERSIS dgn DashboardController::collectRiskRows() (RSP/
     * RSO/ROO), supaya kode yg tampil di halaman ini identik dgn yg tercetak
     * di Form Cetak & terlihat di Form Input.
     */
    private const PREFIX_KODE_BY_TIPE = [
        'irs_pemda' => 'RSP',
        'irs_pd' => 'RSO',
        'iro_pd' => 'ROO',
    ];

    public function index()
    {
        return Inertia::render('program-bupati-risiko/Index', [
            'programs' => $this->buildProgramData(),
            'riskLevels' => $this->riskRef->riskLevelsOrdered(),
            'totalRisikoTerpetakan' => $this->hitungTotalRisikoTerpetakan(),
            'visiMisiPemda' => $this->visiMisiPerMisi(),
            // Dipakai frontend utk menyembunyikan tombol hapus. Ini MURNI
            // kosmetik — penjaga sesungguhnya ada di destroyRisiko().
            'bolehHapus' => $this->bolehMengelolaKaitan(),
        ]);
    }

    /**
     * Hanya Admin & Super Admin yang boleh MELEPAS kaitan risiko dari
     * program Bupati.
     *
     * Menambah kaitan tetap terbuka untuk PIC OPD (lihat catatan kelas di
     * atas) — yang dibatasi khusus di sini adalah penghapusannya, karena
     * sifatnya beda: satu klik menghilangkan hasil analisis yang dipakai
     * seluruh Pemda, sementara menambah kaitan yang keliru masih bisa
     * ditinjau dan dikoreksi belakangan.
     */
    private function bolehMengelolaKaitan(): bool
    {
        return (bool) request()->user()?->hasAnyRole(['admin', 'super-admin']);
    }

    /**
     * Bentuk data 100 program + risiko terkait siap-tampil (kode risiko,
     * skala, badge "program lain") — SATU sumber kebenaran dipakai bersama
     * index() (halaman interaktif) dan cetak()/pdf() (Form Cetak baru),
     * supaya kedua tampilan selalu identik datanya (bukan 2 implementasi yg
     * bisa saling menyimpang).
     */
    private function buildProgramData(): \Illuminate\Support\Collection
    {
        $programs = ProgramPembangunanBupati::with('risikoTerkait')->orderBy('nomor')->get();

        // Batch-lookup risiko per tipe (whereIn, BUKAN query 1x per baris
        // di dalam loop) — sama pola dgn LaporanKejadianController::index()
        // utk hindari N+1 atas total ratusan baris pivot.
        $idsByTipe = ['irs_pemda' => [], 'irs_pd' => [], 'iro_pd' => []];
        foreach ($programs as $program) {
            foreach ($program->risikoTerkait as $pivot) {
                $idsByTipe[$pivot->risiko_tipe][] = $pivot->risiko_id;
            }
        }

        // Nomor urut Kode Risiko HARUS dihitung dari SELURUH baris tabel per
        // tipe (lintas-OPD, bukan cuma yg terpetakan ke Program Bupati) —
        // sama pola dgn DashboardController::collectRiskRows() — supaya
        // hasilnya identik dgn nomor urut yg tampil di Form Input/Form
        // Cetak utk risiko yg sama. Kalau nomor urut dihitung ulang HANYA
        // dari subset baris yg terpetakan di sini, angkanya akan salah
        // (reset per grup jadi beda krn banyak baris "tetangga" hilang).
        // Kolom dibatasi ke yg benar2 dipakai nomorUrutFor()/
        // generateKodeRisiko()/output di bawah (bukan SELECT * penuh) —
        // sebelumnya menarik SEMUA kolom dari 3 tabel risiko sekaligus
        // (bisa ribuan baris) hanya utk hitung nomor urut & 5 kolom output,
        // pemborosan memori PHP yg signifikan (temuan audit performa).
        $kolomRisiko = [
            'id', 'TAHUN DINILAI RISIKO', 'JENIS RISIKO', 'ENTITAS PD YANG MENILAI',
            'URAIAN RISIKO', 'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN', 'SKALA RISIKO',
        ];
        $risikoByTipe = [];
        $nomorUrutByTipe = [];
        foreach (self::RISIKO_MODELS as $tipe => $modelClass) {
            $semuaBarisTipeIni = $modelClass::orderBy('id')->get($kolomRisiko);
            $nomorUrutByTipe[$tipe] = $this->nomorUrutFor($semuaBarisTipeIni);
            $risikoByTipe[$tipe] = $semuaBarisTipeIni
                ->whereIn('id', array_unique($idsByTipe[$tipe]))
                ->keyBy('id');
        }

        // Ambang "Tinggi" dipakai badge visual saja (bukan filter) — ambil
        // dari RiskLevel (di-cache di service) spy konsisten dgn definisi
        // Level Risiko yg bisa diedit Admin (Settings > Keterangan
        // Pendukung), BUKAN hardcode 16.
        $ambangTinggi = $this->riskRef->ambangTinggi();

        // Peta "risiko (tipe+id) -> daftar {nomor program, pivot_id}" utk
        // SEMUA program yg mengaitkannya, TERMASUK program yg sedang
        // ditampilkan sendiri (bukan cuma "yg lain") — supaya badge "N
        // program yang sama" bisa dipakai utk cycle bolak-balik lewat
        // SEMUA titik kaitan termasuk balik ke dirinya sendiri (mis. Program
        // #1 -> #5 -> #9 -> #1 -> ...), sesuai permintaan user. pivot_id
        // disertakan supaya JS tahu persis baris DOM mana yg harus disorot.
        $programSemuaByRisikoKey = [];
        foreach ($programs as $program) {
            foreach ($program->risikoTerkait as $pivot) {
                $key = "{$pivot->risiko_tipe}#{$pivot->risiko_id}";
                $programSemuaByRisikoKey[$key][] = ['nomor' => $program->nomor, 'pivot_id' => $pivot->id];
            }
        }

        $data = $programs->map(function (ProgramPembangunanBupati $program) use ($risikoByTipe, $nomorUrutByTipe, $ambangTinggi, $programSemuaByRisikoKey) {
            $risikoRows = $program->risikoTerkait
                ->map(function (ProgramBupatiRisiko $pivot) use ($risikoByTipe, $nomorUrutByTipe, $programSemuaByRisikoKey) {
                    $risiko = $risikoByTipe[$pivot->risiko_tipe][$pivot->risiko_id] ?? null;
                    if (!$risiko) {
                        return null; // Risiko sumber sudah dihapus — lewati diam-diam.
                    }

                    $key = "{$pivot->risiko_tipe}#{$pivot->risiko_id}";
                    $programSemua = collect($programSemuaByRisikoKey[$key] ?? [])
                        ->sortBy('nomor')
                        ->values();

                    $nomorUrut = $nomorUrutByTipe[$pivot->risiko_tipe][$risiko->id] ?? null;
                    $kodeRisiko = $this->generateKodeRisiko(
                        self::PREFIX_KODE_BY_TIPE[$pivot->risiko_tipe],
                        $risiko->{'TAHUN DINILAI RISIKO'},
                        $risiko->{'JENIS RISIKO'},
                        $risiko->{'ENTITAS PD YANG MENILAI'},
                        $nomorUrut,
                    );

                    return [
                        'pivot_id' => $pivot->id,
                        'tipe' => $pivot->risiko_tipe,
                        'id' => $pivot->risiko_id,
                        'kode_risiko' => $kodeRisiko,
                        'uraian_risiko' => (string) $risiko->{'URAIAN RISIKO'},
                        // Dikirim supaya kotak pencarian di halaman ini bisa
                        // menemukan program lewat OPD Penanggung Jawab
                        // Pengendalian pada risiko yg dikaitkan, BUKAN cuma
                        // OPD Perangkat Daerah milik program itu sendiri
                        // (dua hal ini bisa beda — program #1 misalnya milik
                        // "BADAN PENGELOLAAN KEUANGAN DAERAH" tapi salah satu
                        // risikonya justru dikendalikan "DINAS KESEHATAN").
                        'opd_penanggung_jawab' => $risiko->{'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN'} ?? null,
                        'skala_risiko' => $risiko->{'SKALA RISIKO'} !== null ? (int) $risiko->{'SKALA RISIKO'} : null,
                        'url' => self::URL_INDEX_BY_TIPE[$pivot->risiko_tipe] . "?highlight_id={$pivot->risiko_id}",
                        'program_semua' => $programSemua,
                    ];
                })
                ->filter()
                ->sortByDesc('skala_risiko')
                ->values();

            return [
                'id' => $program->id,
                'nomor' => $program->nomor,
                'program_pembangunan' => $program->program_pembangunan,
                'branding' => $program->branding,
                'perangkat_daerah' => $program->perangkat_daerah,
                'misi_urutan' => $program->misi_urutan,
                'jumlah_risiko' => $risikoRows->count(),
                'jumlah_risiko_prioritas' => $risikoRows->filter(fn ($r) => ($r['skala_risiko'] ?? 0) >= $ambangTinggi)->count(),
                'risiko' => $risikoRows,
            ];
        });

        return $data;
    }

    /**
     * Form Cetak "Risiko 100 Program Bupati" (Miscellaneous > Risiko 100
     * Program Bupati_Cetak) — SAMA data dgn halaman interaktif (lihat
     * buildProgramData()), dikelompokkan per Misi (1-7) sama pola dgn
     * ProgramPembangunanTab di Keterangan Pendukung & halaman index() di
     * sini. TIDAK terikat 1 OPD (Pemda-wide, lintas seluruh 100 program) —
     * sama level dgn Cetak3.tsx/Form 13, jadi TIDAK ada ensureOpdAccess()
     * & DataUmum diambil forOpdAndTahun(null, ...) (Bupati sbg penandatangan
     * tunggal, bukan Kepala OPD manapun).
     */
    public function cetak(Request $request)
    {
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $pengaturan = $this->pengaturan();
        $pemerintahKabkota = $pengaturan->pemerintah_kabkota ?: 'Pemerintah Kabupaten Aceh Barat';
        $dataUmum = DataUmum::forOpdAndTahun(null, $tahun);

        return Inertia::render('program-bupati-risiko/cetak/Cetak', [
            'tahun' => $tahun,
            'periode' => $pengaturan->periode_penilaian,
            'pemerintahKabkota' => $pemerintahKabkota,
            'dataUmum' => $this->dataUmumForInertia($dataUmum),
            'programs' => $this->buildProgramData(),
            'totalRisikoTerpetakan' => $this->hitungTotalRisikoTerpetakan(),
            'visiMisiPemda' => $this->visiMisiPerMisi(),
        ]);
    }

    public function pdf(Request $request)
    {
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;

        $url = url('/program-bupati-risiko/cetak?' . http_build_query(['tahun' => $tahun]));

        return PdfPrintService::downloadFromUrl($request, $url, "Risiko-100-Program-Bupati-{$tahun}");
    }

    /**
     * Cari risiko (IRS Pemda/PD, IRO PD) utk dikaitkan ke sebuah program —
     * dipakai combobox pencarian di dialog "Tambah Kaitan Risiko". Sama
     * pola dgn LaporanKejadianController::searchRisiko(), TANPA batas
     * tahun (beda dari halaman index yg fokus 2025) supaya PIC tetap bisa
     * mengaitkan risiko tahun lain kalau memang relevan.
     */
    public function searchRisiko(Request $request)
    {
        $query = $request->string('q')->toString();

        if (mb_strlen($query) < 2) {
            return response()->json([]);
        }

        $results = [];
        foreach (self::RISIKO_MODELS as $tipe => $modelClass) {
            $rows = $modelClass::where(function ($q) use ($query) {
                $q->where('URAIAN RISIKO', 'like', "%{$query}%")
                    ->orWhere('UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN', 'like', "%{$query}%")
                    ->orWhereHas('user.opd', fn ($uq) => $uq->where('nama', 'like', "%{$query}%"));
            })
                ->limit(10)
                ->get();

            foreach ($rows as $row) {
                $results[] = [
                    'tipe' => $tipe,
                    'id' => $row->id,
                    'uraian_risiko' => $row->{'URAIAN RISIKO'},
                    'skala_risiko' => $row->{'SKALA RISIKO'} !== null ? (int) $row->{'SKALA RISIKO'} : null,
                    'opd' => $row->{'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN'} ?? null,
                    'tahun' => $row->{'TAHUN DINILAI RISIKO'} ?? null,
                ];
            }
        }

        return response()->json(array_slice($results, 0, 20));
    }

    /** Tambah satu kaitan risiko ke program — idempoten lewat unique constraint (program, tipe, id). */
    public function storeRisiko(Request $request, ProgramPembangunanBupati $program)
    {
        $validated = $request->validate([
            'risiko_tipe' => ['required', Rule::in(array_keys(self::RISIKO_MODELS))],
            'risiko_id' => ['required', 'integer'],
        ]);

        $modelClass = self::RISIKO_MODELS[$validated['risiko_tipe']];
        if (!$modelClass::whereKey($validated['risiko_id'])->exists()) {
            abort(422, 'Risiko yang dipilih tidak ditemukan.');
        }

        // withTrashed: kalau kaitan ini PERNAH ada lalu di-soft-delete,
        // pulihkan baris lama alih-alih membuat baris duplikat baru
        // (unique constraint program+tipe+id tidak mengizinkan insert baru
        // di atas baris yg soft-deleted tapi masih ada di tabel).
        $existing = ProgramBupatiRisiko::withTrashed()
            ->where('program_pembangunan_bupati_id', $program->id)
            ->where('risiko_tipe', $validated['risiko_tipe'])
            ->where('risiko_id', $validated['risiko_id'])
            ->first();

        if ($existing) {
            if ($existing->trashed()) {
                $existing->restore();
            }
        } else {
            ProgramBupatiRisiko::create([
                'program_pembangunan_bupati_id' => $program->id,
                'risiko_tipe' => $validated['risiko_tipe'],
                'risiko_id' => $validated['risiko_id'],
            ]);
        }

        return back()->with('success', 'Kaitan risiko berhasil ditambahkan.');
    }

    /** Lepas satu kaitan risiko dari program — SOFT DELETE, bisa dipulihkan lewat /trash. */
    public function destroyRisiko(ProgramBupatiRisiko $pivot)
    {
        // Sebelumnya endpoint ini TIDAK memeriksa apa pun: siapa saja yang
        // login, termasuk 49 akun PIC OPD, bisa melepas kaitan risiko mana
        // pun dari program Bupati mana pun. Menyembunyikan tombolnya saja
        // tidak cukup — alamatnya tetap bisa dipanggil langsung.
        if (!$this->bolehMengelolaKaitan()) {
            abort(403, 'Hanya Admin atau Super Admin yang dapat melepas kaitan risiko dari Program Bupati.');
        }

        $pivot->delete();

        return back()->with('success', 'Kaitan risiko berhasil dihapus.');
    }

    /** Total baris risiko unik (lintas tipe) yg PALING TIDAK punya 1 kaitan program — utk ringkasan header halaman. */
    private function hitungTotalRisikoTerpetakan(): int
    {
        // count() SQL-level langsung (bukan get()->count() yg menarik semua
        // baris distinct ke PHP hanya utk dihitung ulang) — temuan audit
        // performa.
        return ProgramBupatiRisiko::query()
            ->select('risiko_tipe', 'risiko_id')
            ->distinct()
            ->count();
    }

    /**
     * Ambil teks Visi (1, sama utk semua) & Misi (per misi_urutan 1-7)
     * LIVE dari tbl_krs_pemda (kolom VISI/MISI) — SAMA PERSIS dgn
     * KeteranganPendukungController::visiMisiPerMisi(), diduplikasi
     * (bukan diekstrak ke trait/service bersama) krn cuma 2 pemakai &
     * duplikasi kecil ini lebih mudah dibaca drpd abstraksi dini.
     *
     * @return array{visi: string|null, misi: array<int, string|null>}
     */
    private function visiMisiPerMisi(): array
    {
        $visi = KrsPemda::whereNotNull('VISI')->where('VISI', '!=', '')->value('VISI');

        $misiPerUrutan = [];
        for ($urutan = 1; $urutan <= 7; $urutan++) {
            $misiPerUrutan[$urutan] = KrsPemda::where('MISI', 'like', "Misi {$urutan} :%")->value('MISI');
        }

        return ['visi' => $visi, 'misi' => $misiPerUrutan];
    }
}
