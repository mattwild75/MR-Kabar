<?php

namespace App\Http\Controllers;

use App\Models\DataUmum;
use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\IrsPemda;
use App\Models\KroPd;
use App\Models\KrsPd;
use App\Models\KrsPemda;
use App\Models\Opd;
use App\Models\PengaturanPemda;
use App\Models\User;
use App\Services\PdfPrintService;
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
     *
     * BUG lama: baris DataUmum "pertama" yg dipakai bisa jadi kepunyaan PIC
     * OPD yg TIDAK mengisi nama_kepala_daerah/jabatan_kepala_daerah (field
     * itu opsional di form-nya masing2 PIC) — padahal field Pemda-wide ini
     * py sumber kebenaran terpusat di PengaturanPemda (lihat
     * DataUmumController::store(), field Pemda-wide yg disimpan Admin
     * ditulis ke PengaturanPemda, BUKAN cuma ke baris DataUmum Admin itu
     * sendiri). Form 2a jadi salah menampilkan "BUPATI" polos tanpa nama,
     * walau Data Umum "Kepala Daerah" sudah diisi lengkap oleh PIC lain.
     * Fix: kalau field ini kosong pada baris DataUmum yg dipakai, isi
     * (bukan timpa) dari PengaturanPemda::current() sblm dikembalikan.
     */
    private function dataUmumForOpd(?int $opdId): ?DataUmum
    {
        if (!$opdId) {
            $dataUmum = DataUmum::whereNotNull('user_id')->first();

            if ($dataUmum && (!$dataUmum->nama_kepala_daerah || !$dataUmum->jabatan_kepala_daerah)) {
                $default = $this->pengaturan();
                $dataUmum->nama_kepala_daerah ??= $default->nama_kepala_daerah;
                $dataUmum->jabatan_kepala_daerah ??= $default->jabatan_kepala_daerah;
            }

            return $dataUmum;
        }

        $user = User::where('opd_id', $opdId)->whereHas('dataUmum')->first();

        return $user?->dataUmum;
    }

    /**
     * Versi $dataUmum utk Inertia (React) — bukan objek Model mentah.
     * Kolom 'tanggal_pembuatan' di-cast 'date' (Carbon) pada model, dan
     * Carbon di-serialize Laravel sbg ISO 8601 penuh (mis.
     * "2026-07-11T00:00:00.000000Z") saat lolos ke JSON props Inertia —
     * itulah yg tampil apa adanya di blok TTD React krn di sana cuma
     * ditulis {dataUmum?.tanggal_pembuatan} tanpa format ulang. Blade PDF
     * TIDAK kena masalah ini krn di sana masih computed dari objek Carbon
     * asli lewat optional($x)->format('d F Y'), jadi tetap dikirim $dataUmum
     * Model asli ke Blade — HANYA versi Inertia yg diubah ke array dgn
     * tanggal sudah diformat teks Indonesia ("11 Juli 2026").
     */
    private function dataUmumForInertia(?DataUmum $dataUmum): ?array
    {
        if (!$dataUmum) {
            return null;
        }

        $array = $dataUmum->toArray();
        // tanggal_pembuatan_raw (Y-m-d, utk <input type="date"> di form edit
        // TTD) dipisah dari tanggal_pembuatan (teks Indonesia, utk DISPLAY di
        // blok tanda tangan) — keduanya dibutuhkan sekaligus di halaman yg
        // sama, tidak bisa dipakai bergantian.
        $array['tanggal_pembuatan_raw'] = $dataUmum->tanggal_pembuatan?->format('Y-m-d');
        $array['tanggal_pembuatan'] = $dataUmum->tanggal_pembuatan?->locale('id')->translatedFormat('d F Y');

        return $array;
    }

    /**
     * Buang label kode di awal teks (mis. "Sasaran 1.1 : ...", "Kegiatan
     * 2.3.1 : ...") lalu normalisasi (rapikan spasi ganda, lowercase, trim)
     * — dipakai utk mencocokkan teks Sasaran Strategis PD / Kegiatan PD
     * antara KRS_PD/KRO_PD (konteks) dgn IRS_PD/IRO_PD (risiko teregister),
     * SAMA PERSIS logikanya dgn KrsIrsPdSyncService::matchKey() /
     * KroIroPdSyncService::matchKey() — supaya "bold = dipilih sbg
     * Penetapan Konteks Risiko" di Form 2b/2c konsisten dgn cara tabel
     * gabungan /krs_irs_pd & /kro_iro_pd menentukan kecocokan.
     */
    private function matchKey(string $value): string
    {
        $value = trim($value);
        if ($value !== '' && preg_match('/^(?:[A-Za-z]+\s+){1,3}\d+(?:\.\d+)*\s*:\s*(.*)$/s', $value, $m)) {
            $value = trim($m[1]);
        }

        $value = preg_replace('/\s+/u', ' ', $value);

        return mb_strtolower(trim($value));
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
    /**
     * $fallbackOpdCol: dipakai kalau kolom $opdCol utama kosong utk baris
     * ybs. Kasus nyata: "OPD IK PROGRAM" di tbl_krs_pemda SELALU NULL utk
     * semua baris (kolom itu tidak pernah diisi lewat form/import manapun),
     * padahal "OPD PENANGGUNGJAWAB PROGRAM" SELALU terisi dgn OPD yg benar
     * — akibatnya sebelum fallback ini, kolom OPD di tabel indikator
     * Program selalu tampil "-" walau OPD penanggung jawabnya sebenarnya
     * diketahui. Fallback level BARIS (bukan level SEL/indikator individual,
     * krn OPD PENANGGUNGJAWAB PROGRAM tidak mendukung multi-baris per
     * indikator spt IK PROGRAM), jadi dipakai sbg nilai SAMA utk semua
     * indikator dlm grup itu.
     */
    private function indikatorRows($rows, string $ikCol, ?string $baselineCol, string $targetCol, string $satuanCol, string $opdCol, ?string $fallbackOpdCol = null)
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
        $fallbackOpd = $fallbackOpdCol ? trim((string) ($first->{$fallbackOpdCol} ?? '')) : '';

        return $ikList->filter(fn ($v) => $v !== '')->values()->map(fn ($ik, $i) => [
            'ik' => $ik,
            'baseline' => $baselineList[$i] ?? null,
            'target' => $targetList[$i] ?? null,
            'satuan' => $satuanList[$i] ?? null,
            'opd' => ($opdList[$i] ?? null) ?: ($fallbackOpd !== '' ? $fallbackOpd : null),
        ]);
    }

    private function buildKonteksPemda(int $tahun)
    {
        $rows = KrsPemda::orderBy('id')->get()->filter(function ($r) {
            $misi = trim((string) ($r->MISI ?? ''));

            return $misi !== '' && $misi !== '-' && $misi !== 'Tidak Ada Data';
        })->values();

        if ($rows->isEmpty()) {
            return null;
        }

        $first = $rows->first();

        // "bold" (dipilih sbg Penetapan Konteks Risiko) HARUS mengikuti
        // Tahun Penilaian yg dipilih di picker — sebelumnya query ini
        // menghimpun SEMUA tahun sekaligus, sehingga ganti tahun di picker
        // cuma mengubah label "Tahun Penilaian" tanpa memengaruhi Sasaran/
        // Program mana yg ter-bold (bug: hasil cetak 2025 vs 2026 identik
        // kecuali labelnya).
        $registeredSasaran = IrsPemda::whereNotNull('SASARAN RPJMD')
            ->where('TAHUN DINILAI RISIKO', (string) $tahun)
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
                    'indikator_list' => $this->indikatorRows($group, 'IK PROGRAM', 'BASELINE IK PROGRAM', 'TARGET IK PROGRAM', 'SATUAN IK PROGRAM', 'OPD IK PROGRAM', 'OPD PENANGGUNGJAWAB PROGRAM'),
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
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $konteks = $this->buildKonteksPemda($tahun);
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
            'dataUmum' => $this->dataUmumForInertia($dataUmum),
        ]);
    }

    /**
     * Cetak PDF via Browsershot (screenshot Chromium dari halaman React
     * preview /cetak/risiko/2a yg sama persis) — BUKAN DomPDF lagi. Lihat
     * PdfPrintService utk penjelasan lengkap kenapa: DomPDF adalah mesin
     * render terpisah dgn banyak keterbatasan CSS yg bikin hasil cetak tak
     * pernah 100% identik dgn tampilan web, meski sudah berkali-kali
     * dipatch. Screenshot langsung dari halaman yg sama menjamin
     * kesesuaian visual, krn memang browser yg sama yg dipakai user utk
     * melihatnya sendiri.
     */
    public function pdf2a(Request $request)
    {
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $url = url("/cetak/risiko/2a?tahun={$tahun}");

        return PdfPrintService::downloadFromUrl($request, $url, "Form-2a-Konteks-Strategis-Pemda-{$tahun}");
    }

    /**
     * Kelompokkan baris KrsPd flat (per OPD) jadi struktur konteks sesuai
     * Form_II_a, hierarki bernomor Tujuan > Sasaran (sama pola dgn
     * buildKonteksPemda()) supaya tampilan 2b konsisten & rapi dgn 2a —
     * nomor dihitung dari urutan kemunculan (posisi), bukan kolom
     * tersimpan.
     */
    private function buildKonteksPd(string $opdNama, int $tahun)
    {
        $rows = KrsPd::whereRaw('LOWER(TRIM(`OPD PENANGGUNG JAWAB KEGIATAN`)) = ?', [Str::lower(trim($opdNama))])
            ->orderBy('id')
            ->get()
            ->filter(fn ($r) => trim((string) ($r->{'TUJUAN STRATEGIS PD'} ?? '')) !== '')
            ->values();

        if ($rows->isEmpty()) {
            return null;
        }

        // Sasaran Strategis PD dianggap "dipilih sbg Penetapan Konteks
        // Risiko" (bold) kalau ada MINIMAL SATU risiko teregister (IrsPd)
        // PADA TAHUN TERPILIH yg "SASARAN RENSTRA"-nya cocok teks — match
        // key sama persis dgn KrsIrsPdSyncService::matchKey(), supaya
        // konsisten dgn cara tabel gabungan /krs_irs_pd menentukan
        // kecocokan. Difilter per tahun (lihat buildKonteksPemda()).
        $registeredSasaranPd = IrsPd::whereNotNull('SASARAN RENSTRA')
            ->where('TAHUN DINILAI RISIKO', (string) $tahun)
            ->pluck('SASARAN RENSTRA')
            ->map(fn ($s) => $this->matchKey((string) $s))
            ->filter()
            ->unique()
            ->flip();

        $tujuanGroups = $rows->groupBy(fn ($r) => trim($r->{'TUJUAN STRATEGIS PD'}))->values();

        $tujuanList = $tujuanGroups->map(function ($tujuanRows, $ti) use ($registeredSasaranPd) {
            $tujuanNomor = (string) ($ti + 1);
            $g = $tujuanRows->first();

            $sasaranGroups = $tujuanRows->filter(fn ($r) => trim((string) ($r->{'SASARAN STRATEGIS PD'} ?? '')) !== '')
                ->groupBy(fn ($r) => trim($r->{'SASARAN STRATEGIS PD'}))
                ->values();

            $sasaranList = $sasaranGroups->map(function ($sasaranRows, $si) use ($tujuanNomor, $registeredSasaranPd) {
                $sasaranNomor = "{$tujuanNomor}." . ($si + 1);
                $sasaranTeks = trim($sasaranRows->first()->{'SASARAN STRATEGIS PD'});

                return [
                    'nomor' => $sasaranNomor,
                    'sasaran' => $sasaranTeks,
                    'indikator_list' => $this->indikatorRows($sasaranRows, 'IK SASARAN STRATEGIS PD', 'BASELINE IK SASARAN STRATEGIS PD', 'TARGET IK SASARAN STRATEGIS PD', 'SATUAN IK SASARAN STRATEGIS PD', 'OPD IK SASARAN STRATEGIS PD', 'OPD PENANGGUNG JAWAB KEGIATAN'),
                    'bold' => $registeredSasaranPd->has($this->matchKey($sasaranTeks)),
                ];
            })->values();

            return [
                'nomor' => $tujuanNomor,
                'tujuan' => trim($g->{'TUJUAN STRATEGIS PD'}),
                'indikator_list' => $this->indikatorRows($tujuanRows, 'IK TUJUAN STRATEGIS PD', 'BASELINE IK TUJUAN STRATEGIS PD', 'TARGET IK TUJUAN STRATEGIS PD', 'SATUAN IK TUJUAN STRATEGIS PD', 'OPD IK TUJUAN STRATEGIS PD', 'OPD PENANGGUNG JAWAB KEGIATAN'),
                'sasaran_list' => $sasaranList,
                // Tujuan ikut bold kalau punya minimal satu Sasaran anak yg bold.
                'bold' => $sasaranList->contains('bold', true),
            ];
        })->values();

        $sasaranFlat = $tujuanList->flatMap(fn ($t) => collect($t['sasaran_list'])->map(fn ($s) => array_merge($s, ['tujuan_nomor' => $t['nomor'], 'tujuan' => $t['tujuan']])))->values();

        $programGroups = $rows->filter(fn ($r) => trim((string) ($r->{'PROGRAM PD'} ?? '')) !== '')
            ->groupBy(fn ($r) => trim($r->{'PROGRAM PD'}))
            ->map(fn ($group, $program) => [
                'program' => $program,
                'indikator_list' => $this->indikatorRows($group, 'IK PROGRAM PD', null, 'TARGET IK PROGRAM PD', 'SATUAN IK PROGRAM PD', 'OPD PENANGGUNG JAWAB KEGIATAN'),
            ])->values();

        return [
            'tujuan_list' => $tujuanList,
            'sasaran_flat' => $sasaranFlat,
            'program_list' => $programGroups,
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
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $opd = $opdId ? Opd::find($opdId) : null;
        $pengaturan = $this->pengaturan();

        $konteks = $opd ? $this->buildKonteksPd($opd->nama, $tahun) : null;
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
            'dataUmum' => $this->dataUmumForInertia($dataUmum),
        ]);
    }

    public function pdf2b(Request $request)
    {
        $opdId = $request->integer('opd_id') ?: null;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $opd = $opdId ? Opd::findOrFail($opdId) : abort(404);

        $url = url("/cetak/risiko/2b?opd_id={$opdId}&tahun={$tahun}");

        return PdfPrintService::downloadFromUrl($request, $url, "Form-2b-Konteks-Strategis-OPD-{$opd->nama}-{$tahun}");
    }

    /**
     * Kelompokkan baris KroPd flat (per OPD) jadi struktur konteks sesuai
     * Form_III_a, hierarki bernomor Sasaran Renstra > Program > Kegiatan
     * (sama pola dgn buildKonteksPemda()/buildKonteksPd()) supaya tampilan
     * 2c konsisten & rapi dgn 2a/2b — nomor dihitung dari urutan
     * kemunculan (posisi), bukan kolom tersimpan.
     */
    private function buildKonteksRo(string $opdNama, int $tahun)
    {
        $rows = KroPd::whereRaw('LOWER(TRIM(`OPD PENANGGUNG JAWAB KEGIATAN`)) = ?', [Str::lower(trim($opdNama))])
            ->orderBy('id')
            ->get()
            ->filter(fn ($r) => trim((string) ($r->{'SASARAN RENSTRA'} ?? '')) !== '')
            ->values();

        if ($rows->isEmpty()) {
            return null;
        }

        // Kegiatan PD dianggap "dipilih sbg Penetapan Konteks Risiko" (bold)
        // kalau ada MINIMAL SATU risiko teregister (IroPd) PADA TAHUN
        // TERPILIH yg "KEGIATAN PD"-nya cocok teks — match key sama persis
        // dgn KroIroPdSyncService::matchKey(), supaya konsisten dgn cara
        // tabel gabungan /kro_iro_pd menentukan kecocokan. Bold merambat
        // naik ke Program & Sasaran induknya (sama pola dgn
        // buildKonteksPemda()). Difilter per tahun (lihat
        // buildKonteksPemda()).
        $registeredKegiatan = IroPd::whereNotNull('KEGIATAN PD')
            ->where('TAHUN DINILAI RISIKO', (string) $tahun)
            ->pluck('KEGIATAN PD')
            ->map(fn ($k) => $this->matchKey((string) $k))
            ->filter()
            ->unique()
            ->flip();

        $sasaranGroups = $rows->groupBy(fn ($r) => trim($r->{'SASARAN RENSTRA'}))->values();

        $sasaranList = $sasaranGroups->map(function ($sasaranRows, $si) use ($registeredKegiatan) {
            $sasaranNomor = (string) ($si + 1);
            $g = $sasaranRows->first();

            $programGroups = $sasaranRows->filter(fn ($r) => trim((string) ($r->{'PROGRAM PD'} ?? '')) !== '')
                ->groupBy(fn ($r) => trim($r->{'PROGRAM PD'}))
                ->values();

            $programList = $programGroups->map(function ($programRows, $pi) use ($sasaranNomor, $registeredKegiatan) {
                $programNomor = "{$sasaranNomor}." . ($pi + 1);

                $kegiatanGroups = $programRows->filter(fn ($r) => trim((string) ($r->{'KEGIATAN PD'} ?? '')) !== '')
                    ->groupBy(fn ($r) => trim($r->{'KEGIATAN PD'}))
                    ->values();

                $kegiatanList = $kegiatanGroups->map(function ($kegiatanRows, $ki) use ($programNomor, $registeredKegiatan) {
                    $kegiatanTeks = trim($kegiatanRows->first()->{'KEGIATAN PD'});

                    return [
                        'nomor' => "{$programNomor}." . ($ki + 1),
                        'kegiatan' => $kegiatanTeks,
                        'indikator_list' => $this->indikatorRows($kegiatanRows, 'IK KEGIATAN PD', 'BASELINE IK KEGIATAN PD', 'TARGET IK KEGIATAN PD', 'SATUAN IK KEGIATAN PD', 'OPD PENANGGUNG JAWAB KEGIATAN'),
                        'bold' => $registeredKegiatan->has($this->matchKey($kegiatanTeks)),
                    ];
                })->values();

                return [
                    'nomor' => $programNomor,
                    'program' => trim($programRows->first()->{'PROGRAM PD'}),
                    'indikator_list' => $this->indikatorRows($programRows, 'IK PROGRAM PD', 'BASELINE IK PROGRAM PD', 'TARGET IK PROGRAM PD', 'SATUAN IK PROGRAM PD', 'OPD PENANGGUNG JAWAB KEGIATAN'),
                    'kegiatan_list' => $kegiatanList,
                    // Program ikut bold kalau punya minimal satu Kegiatan anak yg bold.
                    'bold' => $kegiatanList->contains('bold', true),
                ];
            })->values();

            return [
                'nomor' => $sasaranNomor,
                'sasaran' => trim($g->{'SASARAN RENSTRA'}),
                'program_list' => $programList,
                // Sasaran ikut bold kalau punya minimal satu Program anak yg bold.
                'bold' => $programList->contains('bold', true),
            ];
        })->values();

        $programFlat = $sasaranList->flatMap(fn ($s) => collect($s['program_list'])->map(fn ($p) => array_merge($p, ['sasaran_nomor' => $s['nomor'], 'sasaran' => $s['sasaran']])))->values();
        $kegiatanFlat = $programFlat->flatMap(fn ($p) => collect($p['kegiatan_list'])->map(fn ($k) => array_merge($k, ['program_nomor' => $p['nomor'], 'program' => $p['program']])))->values();

        return [
            'sasaran_list' => $sasaranList,
            'program_flat' => $programFlat,
            'kegiatan_flat' => $kegiatanFlat,
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
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $opd = $opdId ? Opd::find($opdId) : null;
        $pengaturan = $this->pengaturan();

        $konteks = $opd ? $this->buildKonteksRo($opd->nama, $tahun) : null;
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
            'dataUmum' => $this->dataUmumForInertia($dataUmum),
        ]);
    }

    public function pdf2c(Request $request)
    {
        $opdId = $request->integer('opd_id') ?: null;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $opd = $opdId ? Opd::findOrFail($opdId) : abort(404);

        $url = url("/cetak/risiko/2c?opd_id={$opdId}&tahun={$tahun}");

        return PdfPrintService::downloadFromUrl($request, $url, "Form-2c-Konteks-Operasional-OPD-{$opd->nama}-{$tahun}");
    }

    /**
     * Edit manual tempat/tanggal/jabatan/nama penandatangan langsung dari
     * halaman Form Cetak (2a/2b/2c) — disimpan PERMANEN ke Data Umum
     * terkait (bukan cuma override sekali-pakai utk PDF ybs), sesuai
     * keputusan: satu sumber data, supaya ikut terbawa ke pencetakan
     * berikutnya & halaman Data Umum. Field yg bisa diedit dibedakan per
     * level: Form 2a (Pemda) -> nama/jabatan Kepala Daerah; Form 2b/2c
     * (OPD) -> nama/jabatan/NIP Kepala Dinas. Tempat & tanggal sama utk
     * ketiganya.
     */
    public function updateTtd(Request $request, DataUmum $dataUmum)
    {
        $user = $request->user();
        $isAdmin = $user->hasAnyRole(['admin', 'super-admin']);
        $sameOpd = $user->opd_id && $dataUmum->user?->opd_id === $user->opd_id;

        if (!$isAdmin && $dataUmum->user_id !== $user->id && !$sameOpd) {
            abort(403, 'Anda tidak memiliki akses untuk mengubah penanda tangan ini.');
        }

        $validated = $request->validate([
            'tempat_pembuatan' => ['nullable', 'string', 'max:255'],
            'tanggal_pembuatan' => ['nullable', 'date'],
            'nama_kepala_daerah' => ['nullable', 'string', 'max:255'],
            'jabatan_kepala_daerah' => ['nullable', 'string', 'max:255'],
            'nama_kepala_dinas' => ['nullable', 'string', 'max:255'],
            'jabatan_kepala_dinas' => ['nullable', 'string', 'max:255'],
            'nip_kepala_dinas' => ['nullable', 'string', 'max:100'],
        ]);

        $dataUmum->update($validated);

        return back()->with('success', 'Penanda tangan berhasil disimpan.');
    }
}
