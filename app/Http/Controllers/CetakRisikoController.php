<?php

namespace App\Http\Controllers;

use App\Models\DataUmum;
use App\Models\IrsPemda;
use App\Models\KroPd;
use App\Models\KrsPd;
use App\Models\KrsPemda;
use App\Models\Opd;
use App\Models\PengaturanPemda;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

/**
 * Form Cetak Risiko — 2a (Penetapan Konteks Risiko Strategis Pemda),
 * 2b (Penetapan Konteks Risiko Strategis OPD), 2c (Penetapan Konteks
 * Risiko Operasional OPD), sesuai Form_I_a, Form_II_a, Form_III_a Perdep
 * PPKD No.4/2019 — HANYA blok penetapan konteks (Visi/Misi/Tujuan/Sasaran/
 * IKU/Program + tanda tangan), TIDAK memuat tabel identifikasi risiko
 * (itu ranahnya Form_I_b/II_b/III_b, cetakan terpisah). Cetak ukuran A4
 * portrait. Read-only — datanya sama dgn yg diisi lewat Form Input KRS
 * Pemda/KRS PD/KRO PD.
 */
class CetakRisikoController extends Controller
{
    /**
     * PIC biasa (role 'user', punya opd_id) hanya melihat OPD miliknya
     * sendiri di dropdown — akun bersama & Admin/Super Admin (opd_id null /
     * role admin) tetap melihat semua OPD.
     */
    private function opdOptions(Request $request)
    {
        $user = $request->user();
        if ($user->opd_id && !$user->hasAnyRole(['admin', 'super-admin'])) {
            return Opd::where('id', $user->opd_id)->get(['id', 'nama']);
        }

        return Opd::orderBy('nama')->get(['id', 'nama']);
    }

    /**
     * PIC biasa (punya opd_id) hanya boleh cetak/unduh Risiko OPD miliknya
     * sendiri. Akun Admin/Super Admin tidak dibatasi.
     */
    private function ensureOpdAccess(Request $request, ?int $opdId): void
    {
        $user = $request->user();
        if (!$opdId || !$user->opd_id || $user->hasAnyRole(['admin', 'super-admin'])) {
            return;
        }

        if ($opdId !== $user->opd_id) {
            abort(403, 'Anda hanya dapat mengakses Risiko untuk OPD Anda sendiri.');
        }
    }

    private function pengaturan(): PengaturanPemda
    {
        return PengaturanPemda::current();
    }

    /**
     * Data Umum (header identitas + penanda tangan Bupati/Kepala Dinas)
     * milik PIC dari OPD terpilih — dicari dari User dgn opd_id yg sesuai.
     * $opdId null berarti level Pemda (Form 2a) — pakai Data Umum PERTAMA
     * yg sudah diisi siapa saja (mis. Sekda/Admin), krn identitasnya
     * Pemda-wide, bukan per-OPD.
     */
    private function dataUmumForOpd(?int $opdId): ?DataUmum
    {
        if (!$opdId) {
            return DataUmum::whereNotNull('user_id')->first();
        }

        $user = User::where('opd_id', $opdId)->whereHas('dataUmum')->first();

        return $user?->dataUmum;
    }

    /**
     * Kelompokkan baris KrsPemda flat jadi struktur konteks sesuai Form_I_a,
     * dgn hierarki genap Misi > Tujuan > Sasaran > Program (semuanya
     * ditentukan dari POSISI kemunculan data — tbl_krs_pemda tidak punya
     * kolom nomor eksplisit, jadi "1.1", "2.1.2" dst dihitung dari urutan
     * baris, BUKAN nilai tersimpan). Baris yg SELURUH kolomnya "Tidak Ada
     * Data" (RPJMD memang tidak mendefinisikan apa pun utk baris itu)
     * disingkirkan sebelum pengelompokan — tidak bermakna utk dokumen
     * Penetapan Konteks.
     *
     * "Bold" (dipilih sbg Penetapan Konteks Risiko Strategis Pemda)
     * ditentukan OTOMATIS dari data, bukan daftar tetap: sebuah
     * Misi/Tujuan/Sasaran/Program ikut ter-bold kalau ada minimal satu
     * risiko teregister (tbl_irs_pemda) yg SASARAN RPJMD-nya cocok (match
     * teks, sama seperti IrsPemda menyimpan rujukannya) — lalu bold itu
     * merambat naik ke Tujuan & Misi induknya, dan Program ikut bold kalau
     * berada di baris tbl_krs_pemda yg sama dgn Sasaran yg ter-bold
     * (rantai hierarki Sasaran->Program, bukan lewat OPD).
     */
    /**
     * Rakit daftar indikator kinerja (IK) sbg array baris {ik, baseline,
     * target, satuan, opd}. Cara lama (pluck()->unique() terpisah per
     * kolom) BUG: setiap sel IK/BASELINE/TARGET/SATUAN/OPD di tbl_krs_pemda
     * ternyata SUDAH berisi MULTI-INDIKATOR sekaligus dalam SATU cell,
     * dipisah newline (mis. cell "IK TUJUAN RPJMD" utk satu baris berisi
     * "Tingkat Kemiskinan\nIndeks Pembangunan Manusia (IPM)\n..." — bukan
     * satu baris tabel = satu indikator). pluck()->unique() menganggap tiap
     * CELL (bukan tiap BARIS INDIKATOR di dalam cell) sbg satu unit,
     * sehingga baseline/target dari semua baris identik itu ikut ter-unique
     * tapi TIDAK di-split & di-pasangkan per indikator — hasilnya nilai
     * gabungan panjang yg tercampur di kolom cetak. Di sini di-split by
     * newline (baris pertama yg unik di grup sudah representatif krn semua
     * baris duplikat berisi string identik — dikonfirmasi dari data nyata),
     * lalu di-zip by index: item ke-N di ik[] dipasangkan dgn item ke-N di
     * baseline[]/target[]/satuan[]/opd[] — sesuai urutan asli dalam cell.
     */
    private function indikatorRows($rows, string $ikCol, ?string $baselineCol, string $targetCol, string $satuanCol, string $opdCol)
    {
        $first = $rows->first(fn ($r) => trim((string) ($r->{$ikCol} ?? '')) !== '');
        if (!$first) {
            return collect();
        }

        $split = fn (?string $v) => collect(preg_split('/\r\n|\r|\n/', (string) $v))->map(fn ($s) => trim($s))->values();

        $ikList = $split($first->{$ikCol});
        $baselineList = $baselineCol ? $split($first->{$baselineCol}) : collect();
        $targetList = $split($first->{$targetCol});
        $satuanList = $split($first->{$satuanCol});
        $opdList = $split($first->{$opdCol});

        return $ikList->filter(fn ($v) => $v !== '')->values()->map(fn ($ik, $i) => [
            'ik' => $ik,
            'baseline' => $baselineList[$i] ?? null,
            'target' => $targetList[$i] ?? null,
            'satuan' => $satuanList[$i] ?? null,
            'opd' => $opdList[$i] ?? null,
        ]);
    }

    private function buildKonteksPemda()
    {
        $rows = KrsPemda::orderBy('id')->get()->filter(function ($r) {
            $misi = trim((string) ($r->MISI ?? ''));

            return $misi !== '' && $misi !== '-' && $misi !== 'Tidak Ada Data';
        })->values();

        if ($rows->isEmpty()) {
            return null;
        }

        $first = $rows->first();

        $registeredSasaran = IrsPemda::whereNotNull('SASARAN RPJMD')
            ->pluck('SASARAN RPJMD')
            ->map(fn ($s) => trim($s))
            ->filter()
            ->unique()
            ->flip();

        $opdTerkait = $rows->flatMap(fn ($r) => [
            $r->{'OPD IK TUJUAN RPJMD'},
            $r->{'OPD IK SASARAN RPJMD'},
            $r->{'OPD IK PROGRAM'},
            $r->{'OPD PENANGGUNGJAWAB PROGRAM'},
        ])->filter()->unique()->sort()->values();

        // Misi > Tujuan > Sasaran, nomor dari urutan kemunculan (posisi),
        // bukan kolom tersimpan.
        $misiGroups = $rows->groupBy(fn ($r) => trim($r->MISI))->values();

        $misiList = $misiGroups->map(function ($misiRows, $mi) use ($registeredSasaran) {
            $misiNomor = $mi + 1;
            $misiTeks = trim((string) ($misiRows->first()->MISI ?? ''));

            $tujuanGroups = $misiRows->filter(fn ($r) => trim((string) ($r->{'TUJUAN RPJMD'} ?? '')) !== '')
                ->groupBy(fn ($r) => trim($r->{'TUJUAN RPJMD'}))
                ->values();

            $tujuanList = $tujuanGroups->map(function ($tujuanRows, $ti) use ($misiNomor, $registeredSasaran) {
                $tujuanNomor = "{$misiNomor}." . ($ti + 1);
                $g = $tujuanRows->first();

                $sasaranGroups = $tujuanRows->filter(fn ($r) => trim((string) ($r->{'SASARAN RPJMD'} ?? '')) !== '')
                    ->groupBy(fn ($r) => trim($r->{'SASARAN RPJMD'}))
                    ->values();

                $sasaranList = $sasaranGroups->map(function ($sasaranRows, $si) use ($tujuanNomor, $registeredSasaran) {
                    $sasaranNomor = "{$tujuanNomor}." . ($si + 1);
                    $sasaranTeks = trim($sasaranRows->first()->{'SASARAN RPJMD'});
                    $isRegistered = $registeredSasaran->has($sasaranTeks);

                    return [
                        'nomor' => $sasaranNomor,
                        'sasaran' => $sasaranTeks,
                        'indikator_list' => $this->indikatorRows($sasaranRows, 'IK SASARAN RPJMD', 'BASELINE IK SASARAN RPJMD', 'TARGET IK SASARAN RPJMD', 'SATUAN IK SASARAN RPJMD', 'OPD IK SASARAN RPJMD'),
                        'program' => $sasaranRows->pluck('PROGRAM PRIORITAS')->filter()->unique()->values(),
                        'bold' => $isRegistered,
                    ];
                })->values();

                return [
                    'nomor' => $tujuanNomor,
                    'tujuan' => trim($g->{'TUJUAN RPJMD'}),
                    'indikator_list' => $this->indikatorRows($tujuanRows, 'IK TUJUAN RPJMD', 'BASELINE IK TUJUAN RPJMD', 'TARGET IK TUJUAN RPJMD', 'SATUAN IK TUJUAN RPJMD', 'OPD IK TUJUAN RPJMD'),
                    'sasaran_list' => $sasaranList,
                    // Tujuan ikut bold kalau punya minimal satu Sasaran anak yg bold.
                    'bold' => $sasaranList->contains('bold', true),
                ];
            })->values();

            return [
                'nomor' => $misiNomor,
                'misi' => $misiTeks,
                'tujuan_list' => $tujuanList,
                // Misi ikut bold kalau punya minimal satu Tujuan anak yg bold.
                'bold' => $tujuanList->contains('bold', true),
            ];
        })->values();

        // Sasaran (flat, lintas Misi/Tujuan) — dipakai bagian "Sasaran
        // RPJMD" & "Tujuan, Sasaran, IKU yg akan dinilai" tanpa perlu
        // nested loop 3 level lagi di view.
        $sasaranFlat = $misiList->flatMap(fn ($m) => collect($m['tujuan_list'])->flatMap(fn ($t) => collect($t['sasaran_list'])->map(fn ($s) => array_merge($s, ['tujuan_nomor' => $t['nomor'], 'tujuan' => $t['tujuan']]))))->values();

        // Program: bold kalau berada di baris tbl_krs_pemda yg SASARAN
        // RPJMD-nya ter-bold (rantai hierarki Sasaran->Program), sesuai
        // baris yg sama persis di tabel flat — bukan lewat OPD.
        $programGroups = $rows->filter(function ($r) {
            $program = trim((string) ($r->{'PROGRAM PRIORITAS'} ?? ''));

            return $program !== '' && $program !== '-' && $program !== 'Tidak Ada Data';
        })
            ->groupBy(fn ($r) => trim($r->{'PROGRAM PRIORITAS'}))
            ->map(function ($group, $program) use ($registeredSasaran) {
                $bold = $group->contains(fn ($r) => $registeredSasaran->has(trim((string) ($r->{'SASARAN RPJMD'} ?? ''))));

                return [
                    'program' => $program,
                    'indikator_list' => $this->indikatorRows($group, 'IK PROGRAM', 'BASELINE IK PROGRAM', 'TARGET IK PROGRAM', 'SATUAN IK PROGRAM', 'OPD IK PROGRAM'),
                    'bold' => $bold,
                ];
            })->values();

        // Nama Dinas Terkait: OPD yg teregister risiko strategisnya (utk
        // baris "Nama Dinas Terkait" & sumber daftar multi-PIC TTD) —
        // dicari dari user_id pemilik baris IrsPemda, BUKAN dari kolom OPD
        // di krs_pemda (yg mencampur banyak OPD per Tujuan/Sasaran, tidak
        // spesifik ke siapa yg benar2 punya risiko strategis teregister).
        $picUserIds = IrsPemda::whereNotNull('user_id')->pluck('user_id')->unique()->values();
        $dataUmumRegistrants = DataUmum::whereIn('user_id', $picUserIds)->whereNotNull('nama_pic')->get();

        return [
            'visi' => $first->VISI ?? null,
            'misi_list' => $misiList,
            'sasaran_flat' => $sasaranFlat,
            'opd_terkait' => $opdTerkait,
            'program_list' => $programGroups,
            'dinas_terkait' => $dataUmumRegistrants->pluck('nama_dinas_opd')->filter()->unique()->values(),
            // Urusan Pemerintahan Daerah: satu baris per OPD yg terlibat
            // (Data Umum masing2), sesuai isian mereka sendiri — TIDAK
            // digabung jadi satu string krn user bisa beda urusan antar OPD.
            'urusan_list' => $dataUmumRegistrants->map(fn ($d) => [
                'opd' => $d->nama_dinas_opd,
                'urusan' => $d->nama_urusan,
            ])->filter(fn ($u) => $u['urusan'])->values(),
            'pic_list' => $dataUmumRegistrants->map(fn ($d) => [
                'opd' => $d->nama_dinas_opd,
                'nama' => $d->nama_pic,
            ])->values(),
        ];
    }

    /** "Sumber Data" Form_I_a: label tetap "RPJMD PEMDA PERIODE" (huruf besar), sesuai contoh cetak Excel asli. */
    private function sumberDataPemda(string $pemerintahKabkota, ?string $periode): string
    {
        return mb_strtoupper(trim("RPJMD {$pemerintahKabkota} " . ($periode ?? '')));
    }

    public function cetak2a(Request $request)
    {
        $konteks = $this->buildKonteksPemda();
        $tahun = $request->integer('tahun') ?: (int) date('Y');
        $pengaturan = $this->pengaturan();
        $pemerintahKabkota = $pengaturan->pemerintah_kabkota ?: 'Pemerintah Kabupaten Aceh Barat';
        // dataUmum: sumber tempat/tanggal/jabatan Kepala Daerah utk blok TTD
        // utama (Bupati) — tetap 1 baris representatif Pemda-wide (bukan
        // per-OPD, beda dgn 'pic_list' di buildKonteksPemda() yg memang
        // sengaja multi-baris utk daftar PIC per-OPD di bawah TTD Bupati).
        $dataUmum = $this->dataUmumForOpd(null);

        return Inertia::render('risiko/cetak/Cetak2a', [
            'tahun' => $tahun,
            'periode' => $pengaturan->periode_penilaian,
            'konteks' => $konteks,
            'pemerintahKabkota' => $pemerintahKabkota,
            'sumberData' => $this->sumberDataPemda($pemerintahKabkota, $pengaturan->periode_penilaian),
            'dataUmum' => $dataUmum,
        ]);
    }

    public function pdf2a(Request $request)
    {
        $konteks = $this->buildKonteksPemda();
        $tahun = $request->integer('tahun') ?: (int) date('Y');
        $pengaturan = $this->pengaturan();
        $periode = $pengaturan->periode_penilaian;
        $pemerintahKabkota = $pengaturan->pemerintah_kabkota ?: 'Pemerintah Kabupaten Aceh Barat';
        $sumberData = $this->sumberDataPemda($pemerintahKabkota, $periode);
        $dataUmum = $this->dataUmumForOpd(null);

        $pdf = Pdf::loadView('risiko.pdf-2a', compact('konteks', 'tahun', 'periode', 'pemerintahKabkota', 'sumberData', 'dataUmum'))
            ->setPaper('a4', 'portrait');

        return $pdf->download("Form-1a-Konteks-Strategis-Pemda-{$tahun}.pdf");
    }

    /**
     * Kelompokkan baris KrsPd flat (per OPD) jadi struktur konteks sesuai
     * Form_II_a: Tujuan Strategis Renstra (unik) > per-Sasaran: IK+Target,
     * Program (dgn IK+Target).
     */
    private function buildKonteksPd(string $opdNama)
    {
        $rows = KrsPd::whereRaw('LOWER(TRIM(`OPD PENANGGUNG JAWAB KEGIATAN`)) = ?', [Str::lower(trim($opdNama))])
            ->orderBy('id')
            ->get();

        if ($rows->isEmpty()) {
            return null;
        }

        $tujuanList = $rows->pluck('TUJUAN STRATEGIS PD')
            ->map(fn ($v) => trim((string) ($v ?? '')))
            ->filter(fn ($v) => $v !== '' && $v !== '-' && $v !== 'Tidak Ada Data')
            ->unique()
            ->values();

        $sasaranGroups = $rows->filter(fn ($r) => trim((string) ($r->{'SASARAN STRATEGIS PD'} ?? '')) !== '')
            ->groupBy(fn ($r) => trim($r->{'SASARAN STRATEGIS PD'}))
            ->map(function ($group) {
                $g = $group->first();

                return [
                    'sasaran' => trim($g->{'SASARAN STRATEGIS PD'}),
                    'tujuan' => trim((string) ($g->{'TUJUAN STRATEGIS PD'} ?? '')) ?: null,
                    'ik' => $group->pluck('IK SASARAN STRATEGIS PD')->filter()->unique()->values(),
                    'target' => $group->pluck('TARGET IK SASARAN STRATEGIS PD')->filter()->unique()->values(),
                ];
            })->values();

        $programGroups = $rows->filter(fn ($r) => trim((string) ($r->{'PROGRAM PD'} ?? '')) !== '')
            ->groupBy(fn ($r) => trim($r->{'PROGRAM PD'}))
            ->map(fn ($group) => $group->first())
            ->values();

        return [
            'tujuan_list' => $tujuanList,
            'sasaran_groups' => $sasaranGroups,
            'program_list' => $programGroups->pluck('PROGRAM PD')->values(),
        ];
    }

    /** "Sumber Data" Form_II_a: label tetap "RENSTRA OPD PERIODE" (huruf besar), sesuai contoh cetak Excel asli. */
    private function sumberDataRenstra(string $opdNama, ?string $periode): string
    {
        return mb_strtoupper(trim("RENSTRA {$opdNama} " . ($periode ?? '')));
    }

    public function cetak2b(Request $request)
    {
        $opdId = $request->integer('opd_id') ?: $request->user()->opd_id;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) date('Y');
        $opd = $opdId ? Opd::find($opdId) : null;
        $pengaturan = $this->pengaturan();

        $konteks = $opd ? $this->buildKonteksPd($opd->nama) : null;
        $dataUmum = $this->dataUmumForOpd($opdId);

        return Inertia::render('risiko/cetak/Cetak2b', [
            'opdOptions' => $this->opdOptions($request),
            'opd' => $opd,
            'tahun' => $tahun,
            'periode' => $pengaturan->periode_penilaian,
            'konteks' => $konteks,
            'pemerintahKabkota' => $pengaturan->pemerintah_kabkota ?: 'Pemerintah Kabupaten Aceh Barat',
            'sumberData' => $opd ? $this->sumberDataRenstra($opd->nama, $pengaturan->periode_penilaian) : null,
            'urusanPemerintahan' => $dataUmum?->nama_urusan,
            'dataUmum' => $dataUmum,
        ]);
    }

    public function pdf2b(Request $request)
    {
        $opdId = $request->integer('opd_id') ?: null;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) date('Y');
        $opd = $opdId ? Opd::findOrFail($opdId) : abort(404);
        $pengaturan = $this->pengaturan();

        $konteks = $this->buildKonteksPd($opd->nama);
        $periode = $pengaturan->periode_penilaian;
        $pemerintahKabkota = $pengaturan->pemerintah_kabkota ?: 'Pemerintah Kabupaten Aceh Barat';
        $sumberData = $this->sumberDataRenstra($opd->nama, $periode);
        $dataUmum = $this->dataUmumForOpd($opdId);
        $urusanPemerintahan = $dataUmum?->nama_urusan;

        $pdf = Pdf::loadView('risiko.pdf-2b', compact('opd', 'konteks', 'tahun', 'periode', 'pemerintahKabkota', 'sumberData', 'urusanPemerintahan', 'dataUmum'))
            ->setPaper('a4', 'portrait');

        return $pdf->download("Form-2a-Konteks-Strategis-OPD-{$opd->nama}-{$tahun}.pdf");
    }

    /**
     * Kelompokkan baris KroPd flat (per OPD) jadi struktur konteks sesuai
     * Form_III_a: Sasaran Renstra (root, dari KRS_PD) > Program+Kegiatan >
     * per-Kegiatan: IK+Target.
     */
    private function buildKonteksRo(string $opdNama)
    {
        $rows = KroPd::whereRaw('LOWER(TRIM(`OPD PENANGGUNG JAWAB KEGIATAN`)) = ?', [Str::lower(trim($opdNama))])
            ->orderBy('id')
            ->get();

        if ($rows->isEmpty()) {
            return null;
        }

        $sasaranList = $rows->pluck('SASARAN RENSTRA')
            ->map(fn ($v) => trim((string) ($v ?? '')))
            ->filter(fn ($v) => $v !== '' && $v !== '-' && $v !== 'Tidak Ada Data')
            ->unique()
            ->values();
        $programList = $rows->pluck('PROGRAM PD')
            ->map(fn ($v) => trim((string) ($v ?? '')))
            ->filter(fn ($v) => $v !== '' && $v !== '-' && $v !== 'Tidak Ada Data')
            ->unique()
            ->values();

        $kegiatanGroups = $rows->filter(fn ($r) => trim((string) ($r->{'KEGIATAN PD'} ?? '')) !== '')
            ->groupBy(fn ($r) => trim($r->{'KEGIATAN PD'}))
            ->map(function ($group) {
                $g = $group->first();

                return [
                    'kegiatan' => trim($g->{'KEGIATAN PD'}),
                    'program' => trim((string) ($g->{'PROGRAM PD'} ?? '')) ?: null,
                    'ik' => $group->pluck('IK KEGIATAN PD')->filter()->unique()->values(),
                    'target' => $group->pluck('TARGET IK KEGIATAN PD')->filter()->unique()->values(),
                ];
            })->values();

        return [
            'sasaran_list' => $sasaranList,
            'program_list' => $programList,
            'kegiatan_groups' => $kegiatanGroups,
        ];
    }

    /** "Sumber Data" Form_III_a: label tetap "RENJA / DPA OPD TAHUN" (huruf besar), sesuai contoh cetak Excel asli. */
    private function sumberDataRenja(string $opdNama, int $tahun): string
    {
        return mb_strtoupper(trim("RENJA / DPA {$opdNama} {$tahun}"));
    }

    public function cetak2c(Request $request)
    {
        $opdId = $request->integer('opd_id') ?: $request->user()->opd_id;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) date('Y');
        $opd = $opdId ? Opd::find($opdId) : null;
        $pengaturan = $this->pengaturan();

        $konteks = $opd ? $this->buildKonteksRo($opd->nama) : null;
        $dataUmum = $this->dataUmumForOpd($opdId);

        return Inertia::render('risiko/cetak/Cetak2c', [
            'opdOptions' => $this->opdOptions($request),
            'opd' => $opd,
            'tahun' => $tahun,
            'periode' => $pengaturan->periode_penilaian,
            'konteks' => $konteks,
            'pemerintahKabkota' => $pengaturan->pemerintah_kabkota ?: 'Pemerintah Kabupaten Aceh Barat',
            'sumberData' => $opd ? $this->sumberDataRenja($opd->nama, $tahun) : null,
            'urusanPemerintahan' => $dataUmum?->nama_urusan,
            'dataUmum' => $dataUmum,
        ]);
    }

    public function pdf2c(Request $request)
    {
        $opdId = $request->integer('opd_id') ?: null;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) date('Y');
        $opd = $opdId ? Opd::findOrFail($opdId) : abort(404);
        $pengaturan = $this->pengaturan();

        $konteks = $this->buildKonteksRo($opd->nama);
        $periode = $pengaturan->periode_penilaian;
        $pemerintahKabkota = $pengaturan->pemerintah_kabkota ?: 'Pemerintah Kabupaten Aceh Barat';
        $sumberData = $this->sumberDataRenja($opd->nama, $tahun);
        $dataUmum = $this->dataUmumForOpd($opdId);
        $urusanPemerintahan = $dataUmum?->nama_urusan;

        $pdf = Pdf::loadView('risiko.pdf-2c', compact('opd', 'konteks', 'tahun', 'periode', 'pemerintahKabkota', 'sumberData', 'urusanPemerintahan', 'dataUmum'))
            ->setPaper('a4', 'portrait');

        return $pdf->download("Form-3a-Konteks-Operasional-OPD-{$opd->nama}-{$tahun}.pdf");
    }
}
