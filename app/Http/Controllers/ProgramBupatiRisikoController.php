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
use App\Models\ProgramBupatiRisikoUsulan;
use App\Models\ProgramPembangunanBupati;
use App\Models\User;
use App\Notifications\ProgramBupatiUsulanReviewed;
use App\Notifications\ProgramBupatiUsulanSubmitted;
use App\Services\PdfPrintService;
use App\Services\RiskReferenceDataService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
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
            'usulan' => $this->usulanMenunggu(),
        ]);
    }

    /**
     * Usulan yang masih menunggu keputusan.
     *
     * Admin menerima SEMUANYA (itulah daftar tinjauannya); PIC hanya menerima
     * usulannya sendiri, supaya barisnya bisa ditandai "menunggu persetujuan"
     * dan dia tidak mengusulkan hal yang sama dua kali.
     */
    private function usulanMenunggu(): array
    {
        $user = request()->user();

        return ProgramBupatiRisikoUsulan::with(['program:id,nomor,program_pembangunan', 'user:id,name'])
            ->where('status', 'pending')
            ->when(!$this->bolehMengelolaKaitan(), fn ($q) => $q->where('user_id', $user?->id))
            ->orderBy('created_at')
            ->get()
            ->map(fn (ProgramBupatiRisikoUsulan $u) => [
                'id' => $u->id,
                'aksi' => $u->aksi,
                'program_id' => $u->program_pembangunan_bupati_id,
                'program_nomor' => $u->program?->nomor,
                'program_nama' => $u->program?->program_pembangunan,
                'risiko_tipe' => $u->risiko_tipe,
                'risiko_id' => $u->risiko_id,
                'uraian_risiko' => $u->risiko()?->{'URAIAN RISIKO'},
                'pengusul' => $u->user?->name,
                'diusulkan_pada' => $u->created_at?->toDateTimeString(),
            ])
            ->values()
            ->all();
    }

    /**
     * Hanya Admin & Super Admin yang boleh MENERAPKAN perubahan kaitan
     * risiko pada program Bupati secara langsung, baik menambah maupun
     * melepas.
     *
     * PIC OPD tidak ditolak, melainkan dialihkan menjadi usulan yang
     * menunggu keputusan (lihat catatUsulan) — halaman ini menghasilkan
     * dokumen tingkat Pemda yang ikut dicetak untuk Bupati, jadi
     * perubahannya perlu diputuskan satu pintu. Fungsi yang sama juga
     * menjadi penjaga setujuiUsulan() dan tolakUsulan().
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
        $ambangTinggi = $this->riskRef->ambangSeleraRisiko();

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

        // PIC hanya boleh mengusulkan risiko dari register miliknya sendiri,
        // jadi pencariannya pun dibatasi ke sana — kalau tidak, mereka melihat
        // pilihan yang pasti ditolak begitu dikirim.
        $hanyaMilikSendiri = !$this->bolehMengelolaKaitan();

        $results = [];
        foreach (self::RISIKO_MODELS as $tipe => $modelClass) {
            $rows = $modelClass::where(function ($q) use ($query) {
                $q->where('URAIAN RISIKO', 'like', "%{$query}%")
                    ->orWhere('UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN', 'like', "%{$query}%")
                    ->orWhereHas('user.opd', fn ($uq) => $uq->where('nama', 'like', "%{$query}%"));
            })
                ->when($hanyaMilikSendiri, fn ($q) => $q->where('user_id', $request->user()->id))
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
        $risiko = $modelClass::find($validated['risiko_id']);
        if (!$risiko) {
            abort(422, 'Risiko yang dipilih tidak ditemukan.');
        }

        // PIC OPD mengusulkan, tidak menerapkan langsung.
        if (!$this->bolehMengelolaKaitan()) {
            $this->pastikanRisikoMilikSendiri($request, $risiko);

            return $this->catatUsulan($request, $program, $validated['risiko_tipe'], (int) $validated['risiko_id'], 'tambah');
        }

        $this->kaitkan($program->id, $validated['risiko_tipe'], (int) $validated['risiko_id']);

        return back()->with('success', 'Kaitan risiko berhasil ditambahkan.');
    }

    /** Lepas satu kaitan risiko dari program — SOFT DELETE, bisa dipulihkan lewat /trash. */
    public function destroyRisiko(Request $request, ProgramBupatiRisiko $pivot)
    {
        // Sebelumnya endpoint ini TIDAK memeriksa apa pun: siapa saja yang
        // login, termasuk 49 akun PIC OPD, bisa melepas kaitan risiko mana
        // pun dari program Bupati mana pun. Menyembunyikan tombolnya saja
        // tidak cukup — alamatnya tetap bisa dipanggil langsung.
        if (!$this->bolehMengelolaKaitan()) {
            $risiko = $pivot->risiko();
            if (!$risiko) {
                abort(422, 'Baris risiko yang dikaitkan tidak ditemukan.');
            }
            $this->pastikanRisikoMilikSendiri($request, $risiko);

            return $this->catatUsulan(
                $request,
                $pivot->program,
                $pivot->risiko_tipe,
                (int) $pivot->risiko_id,
                'lepas',
            );
        }

        $pivot->delete();

        return back()->with('success', 'Kaitan risiko berhasil dihapus.');
    }

    /**
     * PIC hanya boleh mengusulkan atas risiko dari REGISTER MILIKNYA SENDIRI.
     *
     * Kepemilikan dibaca dari kolom user_id, definisi yang sama persis dipakai
     * halaman register risiko saat menyaring daftar untuk PIC (lihat
     * IrsPdController::index) dan RiskOwnershipPolicy. Sengaja bukan
     * pencocokan teks nama OPD: kolom "UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN"
     * berisi teks bebas yang ejaannya bisa berbeda-beda, jadi memakainya
     * sebagai dasar izin berarti izin ikut berubah kalau ada yang mengoreksi
     * ketikan.
     */
    private function pastikanRisikoMilikSendiri(Request $request, Model $risiko): void
    {
        if ($risiko->user_id !== $request->user()->id) {
            abort(403, 'Anda hanya dapat mengusulkan risiko dari register milik OPD Anda sendiri.');
        }
    }

    /**
     * Simpan usulan PIC lalu beri tahu para Admin. Usulan yang sama dan masih
     * menunggu keputusan tidak digandakan — tombol yang ditekan dua kali tidak
     * boleh membuat dua antrean tinjauan untuk hal yang sama.
     */
    private function catatUsulan(Request $request, ProgramPembangunanBupati $program, string $tipe, int $risikoId, string $aksi)
    {
        $kunci = [
            'program_pembangunan_bupati_id' => $program->id,
            'risiko_tipe' => $tipe,
            'risiko_id' => $risikoId,
            'aksi' => $aksi,
        ];

        if (ProgramBupatiRisikoUsulan::where($kunci)->where('status', 'pending')->exists()) {
            return back()->with('success', 'Usulan ini sudah terkirim dan masih menunggu persetujuan Admin.');
        }

        $usulan = ProgramBupatiRisikoUsulan::create($kunci + [
            'user_id' => $request->user()->id,
            'status' => 'pending',
        ]);

        Notification::send(
            User::role(['admin', 'super-admin'])->get(),
            new ProgramBupatiUsulanSubmitted($usulan->load('program', 'user')),
        );

        return back()->with(
            'success',
            $aksi === 'tambah'
                ? 'Usulan penambahan kaitan risiko terkirim — menunggu persetujuan Admin.'
                : 'Usulan pelepasan kaitan risiko terkirim — menunggu persetujuan Admin.',
        );
    }

    /** Setujui usulan PIC lalu terapkan perubahannya. Admin & Super Admin saja. */
    public function setujuiUsulan(Request $request, ProgramBupatiRisikoUsulan $usulan)
    {
        $this->pastikanBolehMeninjau($usulan);

        if ($usulan->aksi === 'tambah') {
            $this->kaitkan($usulan->program_pembangunan_bupati_id, $usulan->risiko_tipe, (int) $usulan->risiko_id);
        } else {
            ProgramBupatiRisiko::where('program_pembangunan_bupati_id', $usulan->program_pembangunan_bupati_id)
                ->where('risiko_tipe', $usulan->risiko_tipe)
                ->where('risiko_id', $usulan->risiko_id)
                ->delete();
        }

        $usulan->update([
            'status' => 'approved',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $usulan->user?->notify(new ProgramBupatiUsulanReviewed($usulan->load('program', 'peninjau')));

        return back()->with('success', 'Usulan disetujui dan sudah diterapkan.');
    }

    /** Tolak usulan PIC. Admin & Super Admin saja. */
    public function tolakUsulan(Request $request, ProgramBupatiRisikoUsulan $usulan)
    {
        $this->pastikanBolehMeninjau($usulan);

        $data = $request->validate([
            'rejection_reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $usulan->update([
            'status' => 'rejected',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'rejection_reason' => $data['rejection_reason'] ?? null,
        ]);

        $usulan->user?->notify(new ProgramBupatiUsulanReviewed($usulan->load('program', 'peninjau')));

        return back()->with('success', 'Usulan ditolak.');
    }

    private function pastikanBolehMeninjau(ProgramBupatiRisikoUsulan $usulan): void
    {
        if (!$this->bolehMengelolaKaitan()) {
            abort(403, 'Hanya Admin atau Super Admin yang dapat memutuskan usulan kaitan risiko.');
        }

        if ($usulan->status !== 'pending') {
            abort(422, 'Usulan ini sudah pernah diputuskan.');
        }
    }

    /**
     * Kaitkan risiko ke program — dipakai jalur langsung (Admin) maupun saat
     * usulan PIC disetujui, supaya keduanya menempuh logika yang sama persis.
     *
     * withTrashed: kalau kaitan ini PERNAH ada lalu di-soft-delete, pulihkan
     * baris lama alih-alih membuat baris duplikat baru (unique constraint
     * program+tipe+id tidak mengizinkan insert baru di atas baris yg
     * soft-deleted tapi masih ada di tabel).
     */
    private function kaitkan(int $programId, string $tipe, int $risikoId): void
    {
        $existing = ProgramBupatiRisiko::withTrashed()
            ->where('program_pembangunan_bupati_id', $programId)
            ->where('risiko_tipe', $tipe)
            ->where('risiko_id', $risikoId)
            ->first();

        if ($existing) {
            if ($existing->trashed()) {
                $existing->restore();
            }

            return;
        }

        ProgramBupatiRisiko::create([
            'program_pembangunan_bupati_id' => $programId,
            'risiko_tipe' => $tipe,
            'risiko_id' => $risikoId,
        ]);
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
