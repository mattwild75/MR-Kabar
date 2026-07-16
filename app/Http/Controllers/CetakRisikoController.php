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
use App\Models\RiskEntitasPenilai;
use App\Models\RiskJenis;
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
     * Label dokumen sumber (RPJMD/Renstra/Renja-DPA) utk baris "Sumber
     * Data" Form 2a-2c/3a-3c — override per-PIC (DataUmum) diutamakan,
     * fallback ke default Pemda-wide (PengaturanPemda) kalau PIC belum
     * mengisi field-nya, sama pola fallback dgn nama_kepala_daerah di
     * dataUmumForOpd().
     */
    private function dokumenSumber(?DataUmum $dataUmum, string $kolom): ?string
    {
        return $dataUmum?->{$kolom} ?: $this->pengaturan()->{$kolom};
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
     *
     * CATATAN: PengaturanPemda TIDAK py kolom tempat_pembuatan/
     * tanggal_pembuatan/penandatangan (field itu murni milik DataUmum
     * per-PIC, tidak ada versi Pemda-wide-nya) — shg utk field2 itu TIDAK
     * ADA fallback yg bisa diterapkan spt nama_kepala_daerah di atas.
     * `orderBy('id')` dipakai (bukan tanpa urutan sama sekali) supaya baris
     * "pertama" yg dipilih MINIMAL deterministik/konsisten antar request
     * (row mana yg terpilih tidak berubah-ubah tanpa alasan), meski baris
     * itu tetap bisa saja milik PIC OPD lain yg kosong field2 tsb — kalau
     * ini jadi masalah nyata, solusi sebenarnya adalah PIC ybs (biasanya
     * Sekda/Admin) melengkapi Data Umum-nya, bukan perbaikan kode.
     */
    private function dataUmumForOpd(?int $opdId): ?DataUmum
    {
        if (!$opdId) {
            $dataUmum = DataUmum::whereNotNull('user_id')->orderBy('id')->first();

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
     * Bangun Kode Risiko sesuai format Perdep PPKD:
     * [JENIS].[TAHUN 2-digit].[KODE JENIS RISIKO].[URUTAN ENTITAS PENILAI].[NOMOR URUT],
     * mis. "RSP.25.37.30.01" (RSP=Risiko Strategis Pemda, tahun 2025, jenis
     * risiko 37=Keuangan dan Pendapatan, entitas penilai urutan ke-30=
     * Inspektorat, urut ke-01). Semua komponen SUDAH ADA sbg kolom
     * tersimpan (TAHUN DINILAI RISIKO, JENIS RISIKO "kode - nama", ENTITAS
     * PD YANG MENILAI dicocokkan ke RiskEntitasPenilai.urutan, NOMOR URUT
     * RISIKO dihitung withNomorUrut() di controller data masing2) — TIDAK
     * ada kolom kode_risiko baru yg perlu ditambah ke database, kode ini
     * murni tampilan yg dihitung ulang saat cetak, sama pola dgn Skala
     * Risiko/Prioritas yg juga dihitung dari kolom lain, bukan disimpan.
     *
     * $prefix: 'RSP' (IrsPemda), 'RSO' (IrsPd), atau 'ROO' (IroPd) — sesuai
     * TINGKAT_RISIKO_VALUE masing2 controller data.
     */
    private function generateKodeRisiko(string $prefix, ?string $tahunDinilai, ?string $jenisRisiko, ?string $entitasPenilai, ?string $nomorUrut): ?string
    {
        if (!$tahunDinilai || !$jenisRisiko || !$entitasPenilai || !$nomorUrut) {
            return null;
        }

        $tahun2Digit = substr($tahunDinilai, -2);

        // "JENIS RISIKO" tersimpan format "37 - Keuangan dan Pendapatan"
        // (lihat RiskReferenceDataService::jenisRisikoOptions()) — ambil
        // angka kode di depan tanda "-".
        if (!preg_match('/^(\d+)\s*-/', trim($jenisRisiko), $m)) {
            return null;
        }
        $kodeJenis = str_pad($m[1], 2, '0', STR_PAD_LEFT);

        // "ENTITAS PD YANG MENILAI" tersimpan nama OPD polos — cocokkan ke
        // urutan RiskEntitasPenilai (itulah "kode entitas" 2-digit di
        // contoh RSP.25.37.30.01, 30=urutan INSPEKTORAT).
        $entitas = RiskEntitasPenilai::whereRaw('LOWER(TRIM(nama)) = ?', [Str::lower(trim($entitasPenilai))])->first();
        if (!$entitas) {
            return null;
        }
        $kodeEntitas = str_pad((string) $entitas->urutan, 2, '0', STR_PAD_LEFT);

        return "{$prefix}.{$tahun2Digit}.{$kodeJenis}.{$kodeEntitas}.{$nomorUrut}";
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
        // matchKey() (BUKAN trim() polos) — sama alasan dgn buildKonteksRo():
        // teks Sasaran RPJMD bisa py kapitalisasi beda antara baris KrsPemda
        // (konteks) dgn baris IrsPemda (risiko teregister) utk maksud yg
        // SAMA PERSIS, kalau dibandingkan case-sensitive akan gagal match
        // shg "bold" tidak menyala walau risikonya sudah terdaftar.
        $registeredSasaran = IrsPemda::whereNotNull('SASARAN RPJMD')
            ->where('TAHUN DINILAI RISIKO', (string) $tahun)
            ->pluck('SASARAN RPJMD')
            ->map(fn ($s) => $this->matchKey((string) $s))
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
        // bukan kolom tersimpan. groupBy pakai matchKey() (case-insensitive)
        // — BUKAN trim() polos — supaya baris dgn kapitalisasi beda utk
        // teks Misi/Tujuan/Sasaran yg SAMA tidak pecah jadi grup "beda"
        // (bug yg sama pernah ditemukan & diperbaiki di buildKonteksRo()).
        $misiGroups = $rows->groupBy(fn ($r) => $this->matchKey(trim($r->MISI)))->values();

        $misiList = $misiGroups->map(function ($misiRows, $mi) use ($registeredSasaran) {
            $misiNomor = $mi + 1;
            $misiTeks = trim((string) ($misiRows->first()->MISI ?? ''));

            $tujuanGroups = $misiRows->filter(fn ($r) => trim((string) ($r->{'TUJUAN RPJMD'} ?? '')) !== '')
                ->groupBy(fn ($r) => $this->matchKey(trim($r->{'TUJUAN RPJMD'})))
                ->values();

            $tujuanList = $tujuanGroups->map(function ($tujuanRows, $ti) use ($misiNomor, $registeredSasaran) {
                $tujuanNomor = "{$misiNomor}." . ($ti + 1);
                $g = $tujuanRows->first();

                $sasaranGroups = $tujuanRows->filter(fn ($r) => trim((string) ($r->{'SASARAN RPJMD'} ?? '')) !== '')
                    ->groupBy(fn ($r) => $this->matchKey(trim($r->{'SASARAN RPJMD'})))
                    ->values();

                $sasaranList = $sasaranGroups->map(function ($sasaranRows, $si) use ($tujuanNomor, $registeredSasaran) {
                    $sasaranNomor = "{$tujuanNomor}." . ($si + 1);
                    $sasaranTeks = trim($sasaranRows->first()->{'SASARAN RPJMD'});
                    $isRegistered = $registeredSasaran->has($this->matchKey($sasaranTeks));

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
            ->groupBy(fn ($r) => $this->matchKey(trim($r->{'PROGRAM PRIORITAS'})))
            ->map(function ($group) use ($registeredSasaran) {
                $bold = $group->contains(fn ($r) => $registeredSasaran->has($this->matchKey(trim((string) ($r->{'SASARAN RPJMD'} ?? '')))));

                return [
                    // Label tampil TETAP teks asli baris pertama (bukan
                    // hasil matchKey() dari groupBy di atas, yg sudah
                    // di-lowercase & prefix-nya dibuang — groupBy key HANYA
                    // dipakai utk pengelompokan, bukan utk ditampilkan).
                    'program' => trim($group->first()->{'PROGRAM PRIORITAS'}),
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

    /**
     * "Sumber Data" Form 2a/3a: label dokumen sumber (mis. "RPJMD") diambil
     * dari isian menu Data Umum (DataUmum::dokumen_sumber_rsp milik PIC,
     * fallback ke PengaturanPemda::dokumen_sumber_rsp kalau PIC belum
     * mengisi) — BUKAN hardcode "RPJMD", supaya konsisten dgn label yg
     * dikonfigurasi Admin/PIC di /data-umum.
     */
    private function sumberDataPemda(string $pemerintahKabkota, ?string $periode, ?string $dokumenSumber): string
    {
        $label = $dokumenSumber ?: 'RPJMD';

        return mb_strtoupper(trim("{$label} {$pemerintahKabkota} " . ($periode ?? '')));
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
            'sumberData' => $this->sumberDataPemda($pemerintahKabkota, $pengaturan->periode_penilaian, $this->dokumenSumber($dataUmum, 'dokumen_sumber_rsp')),
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

        // groupBy pakai matchKey() (case-insensitive) — sama alasan dgn
        // buildKonteksPemda()/buildKonteksRo(): kapitalisasi Tujuan/Sasaran
        // bisa beda antar baris KrsPd utk teks yg maksudnya sama.
        $tujuanGroups = $rows->groupBy(fn ($r) => $this->matchKey(trim($r->{'TUJUAN STRATEGIS PD'})))->values();

        $tujuanList = $tujuanGroups->map(function ($tujuanRows, $ti) use ($registeredSasaranPd) {
            $tujuanNomor = (string) ($ti + 1);
            $g = $tujuanRows->first();

            $sasaranGroups = $tujuanRows->filter(fn ($r) => trim((string) ($r->{'SASARAN STRATEGIS PD'} ?? '')) !== '')
                ->groupBy(fn ($r) => $this->matchKey(trim($r->{'SASARAN STRATEGIS PD'})))
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
            ->groupBy(fn ($r) => $this->matchKey(trim($r->{'PROGRAM PD'})))
            ->map(fn ($group) => [
                // Label tampil teks asli, bukan hasil matchKey() groupBy.
                'program' => trim($group->first()->{'PROGRAM PD'}),
                'indikator_list' => $this->indikatorRows($group, 'IK PROGRAM PD', null, 'TARGET IK PROGRAM PD', 'SATUAN IK PROGRAM PD', 'OPD PENANGGUNG JAWAB KEGIATAN'),
            ])->values();

        return [
            'tujuan_list' => $tujuanList,
            'sasaran_flat' => $sasaranFlat,
            'program_list' => $programGroups,
        ];
    }

    /** "Sumber Data" Form 2b/3b — label dokumen sumber (mis. "Renstra") diambil dari isian menu Data Umum, sama pola dgn sumberDataPemda(). */
    private function sumberDataRenstra(string $opdNama, ?string $periode, ?string $dokumenSumber): string
    {
        $label = $dokumenSumber ?: 'Renstra';

        return mb_strtoupper(trim("{$label} {$opdNama} " . ($periode ?? '')));
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
            'sumberData' => $opd ? $this->sumberDataRenstra($opd->nama, $pengaturan->periode_penilaian, $this->dokumenSumber($dataUmum, 'dokumen_sumber_rso')) : null,
            'urusanPemerintahan' => $dataUmum?->nama_urusan,
            'dataUmum' => $this->dataUmumForInertia($dataUmum),
        ]);
    }

    public function pdf2b(Request $request)
    {
        // Fallback ke opd_id milik user (BUKAN null) kalau tidak dikirim di
        // query string — konsisten dgn cetak2b(), supaya PIC yg mengakses
        // URL unduh PDF ini langsung (tanpa lewat tombol di halaman
        // preview, yg SELALU menyertakan opd_id eksplisit) tidak 404.
        $opdId = $request->integer('opd_id') ?: $request->user()->opd_id;
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

        // groupBy case-insensitive (matchKey(), BUKAN trim() polos) — data
        // KroPd bisa py kapitalisasi beda utk teks Sasaran yg sama persis
        // (mis. "...dan Penyakit..." vs "...Dan Penyakit..."), yg kalau
        // di-groupBy trim() biasa akan pecah jadi 2 Sasaran "beda" padahal
        // seharusnya 1 (bug yg sama pernah ditemukan & diperbaiki di
        // buildKonteksPemda()/buildKonteksPd(), sekarang diterapkan jg di
        // sini krn dipakai bersama Form 2c & 3c).
        $sasaranGroups = $rows->groupBy(fn ($r) => $this->matchKey(trim($r->{'SASARAN RENSTRA'})))->values();

        $sasaranList = $sasaranGroups->map(function ($sasaranRows, $si) use ($registeredKegiatan) {
            $sasaranNomor = (string) ($si + 1);
            $g = $sasaranRows->first();

            $programGroups = $sasaranRows->filter(fn ($r) => trim((string) ($r->{'PROGRAM PD'} ?? '')) !== '')
                ->groupBy(fn ($r) => $this->matchKey(trim($r->{'PROGRAM PD'})))
                ->values();

            $programList = $programGroups->map(function ($programRows, $pi) use ($sasaranNomor, $registeredKegiatan) {
                $programNomor = "{$sasaranNomor}." . ($pi + 1);

                $kegiatanGroups = $programRows->filter(fn ($r) => trim((string) ($r->{'KEGIATAN PD'} ?? '')) !== '')
                    ->groupBy(fn ($r) => $this->matchKey(trim($r->{'KEGIATAN PD'})))
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

    /** "Sumber Data" Form 2c/3c — label dokumen sumber (mis. "Renja / DPA") diambil dari isian menu Data Umum, sama pola dgn sumberDataPemda(). */
    private function sumberDataRenja(string $opdNama, int $tahun, ?string $dokumenSumber): string
    {
        $label = $dokumenSumber ?: 'Renja / DPA';

        return mb_strtoupper(trim("{$label} {$opdNama} {$tahun}"));
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
            'sumberData' => $opd ? $this->sumberDataRenja($opd->nama, $tahun, $this->dokumenSumber($dataUmum, 'dokumen_sumber_roo')) : null,
            'urusanPemerintahan' => $dataUmum?->nama_urusan,
            'dataUmum' => $this->dataUmumForInertia($dataUmum),
        ]);
    }

    public function pdf2c(Request $request)
    {
        // Fallback ke opd_id milik user (BUKAN null) kalau tidak dikirim di
        // query string — konsisten dgn cetak2c().
        $opdId = $request->integer('opd_id') ?: $request->user()->opd_id;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $opd = $opdId ? Opd::findOrFail($opdId) : abort(404);

        $url = url("/cetak/risiko/2c?opd_id={$opdId}&tahun={$tahun}");

        return PdfPrintService::downloadFromUrl($request, $url, "Form-2c-Konteks-Operasional-OPD-{$opd->nama}-{$tahun}");
    }

    /**
     * Hitung ulang "Nomor Urut Risiko" per kelompok — REPLIKASI PERSIS
     * withNomorUrut() di IrsPemdaController/IrsPdController/IroPdController
     * (tidak bisa dipanggil langsung krn private method controller lain),
     * supaya nomor yg tercetak di Form 3a/3b/3c SAMA PERSIS dgn yg tampil
     * di tabel Form Input IRS/IRO — kalau beda logic, angkanya bisa beda
     * dan membingungkan user (kode risiko cetak vs kode risiko yg terlihat
     * sehari-hari saat isi data akan berbeda nomor urutnya).
     */
    private function nomorUrutFor($rows, string $groupCol): array
    {
        $prevGroup = null;
        $counter = 0;
        $result = [];

        foreach ($rows as $row) {
            // matchKey() (BUKAN trim() polos) — konsisten dgn groupBy() di
            // buildKonteks*() supaya batas grup di sini SELALU sinkron dgn
            // pengelompokan Sasaran/Kegiatan yg dipakai utk menampilkan
            // baris, mencegah nomor urut risiko reset di tempat yg salah
            // kalau kapitalisasi teks groupCol tidak konsisten.
            $group = $this->matchKey(trim((string) ($row->{$groupCol} ?? '')));

            if ($group !== $prevGroup) {
                $counter = 0;
                $prevGroup = $group;
            }

            if (trim((string) $row->{'URAIAN RISIKO'}) !== '') {
                $counter++;
                $result[$row->id] = str_pad((string) $counter, 2, '0', STR_PAD_LEFT);
            } else {
                $result[$row->id] = null;
            }
        }

        return $result;
    }

    /**
     * Satu baris tabel Identifikasi Risiko (Form 3a/3b/3c), field-nya sudah
     * sesuai kolom a-l Lampiran 5 Perdep PPKD No.4/2019 (No, Sasaran/
     * Kegiatan, Indikator, Uraian Risiko, Kode Risiko, Pemilik, Sebab,
     * Sumber, C/UC, Dampak, Pihak Terkena) — TIDAK menambah field baru,
     * murni proyeksi dari kolom yg sudah ada di IrsPemda/IrsPd/IroPd.
     * Uraian Sebab/Sumber/C-UC ditampilkan APA ADANYA (sudah tersimpan
     * berformat "(Kategori) Uraian..." dari form input, lihat
     * MultiCategoryTextarea/CategorizedTextarea di irs/Index.tsx dkk).
     */
    private function identifikasiRow($row, string $prefix, ?string $konteksLabel, ?string $nomorUrut): array
    {
        return [
            'konteks' => $konteksLabel,
            'uraian_risiko' => $row->{'URAIAN RISIKO'},
            'kode_risiko' => $this->generateKodeRisiko(
                $prefix,
                $row->{'TAHUN DINILAI RISIKO'},
                $row->{'JENIS RISIKO'},
                $row->{'ENTITAS PD YANG MENILAI'},
                $nomorUrut,
            ),
            'pemilik_risiko' => $row->{'PEMILIK RISIKO'},
            'sebab' => $row->{'URAIAN PENYEBAB RISIKO'},
            'sumber' => $row->{'SUMBER SEBAB RISIKO'},
            'c_uc' => $row->{'C / UC'},
            'dampak' => $row->{'URAIAN DAMPAK RISIKO'},
            'pihak_terkena' => $row->{'PIHAK YANG TERKENA DAMPAK RISIKO'},
        ];
    }

    /**
     * Ratakan struktur bertingkat Misi>Tujuan>Sasaran dari buildKonteksPemda()
     * jadi baris tampil utk Form 3a — REUSE nomor "asli" yg SAMA PERSIS dgn
     * yg tercetak di Form 2a (mis. Tujuan "1.1", Sasaran "1.1.2"), BUKAN
     * menghitung ulang nomor sendiri, supaya kedua form selalu konsisten.
     * Hanya baris Sasaran yg py risiko teridentifikasi (IrsPemda) yg
     * disertakan — form ini murni identifikasi risiko yg SUDAH ada, beda
     * dari Form 2a yg menampilkan seluruh konteks meski belum ada risikonya.
     * Tujuan (dan Misi, kalau py >1 Tujuan bold) disertakan sbg baris
     * header kalau minimal salah satu Sasaran anaknya tampil.
     */
    private function flattenKonteksUntukIdentifikasi(array $konteks, string $sasaranKeyName, callable $sasaranRisikoResolver): array
    {
        $result = [];

        foreach ($konteks['misi_list'] ?? [$konteks] as $misi) {
            $tujuanList = $misi['tujuan_list'] ?? [];
            $misiPunyaSasaranTampil = false;

            $tujuanBuffer = [];
            foreach ($tujuanList as $tujuan) {
                $sasaranBuffer = [];

                foreach ($tujuan['sasaran_list'] as $sasaran) {
                    $risikoList = $sasaranRisikoResolver($sasaran[$sasaranKeyName]);
                    if (empty($risikoList)) {
                        continue;
                    }

                    $sasaranBuffer[] = [
                        'type' => 'sasaran',
                        'nomor' => $sasaran['nomor'],
                        'label' => $sasaran[$sasaranKeyName],
                        // List UTUH {ik, baseline, target, satuan} dari
                        // indikatorRows() (sumber sama dgn Form 2a) — BUKAN
                        // digabung jadi satu string, supaya kolom Indikator
                        // Kinerja di Form 3a/3b bisa dipecah 3 sub-kolom
                        // (Indikator/Baseline/Target) spt IndikatorTable di
                        // Cetak2a.tsx.
                        'indikator_list' => collect($sasaran['indikator_list'] ?? [])->values()->all(),
                        'risiko_list' => $risikoList,
                    ];
                }

                if (empty($sasaranBuffer)) {
                    continue;
                }

                $misiPunyaSasaranTampil = true;
                $tujuanBuffer[] = [
                    'type' => 'tujuan',
                    'nomor' => $tujuan['nomor'],
                    'label' => $tujuan['tujuan'],
                    // IK Tujuan (beda dari IK Sasaran di baris Sasaran
                    // anaknya) — ditampilkan di kolom IK terpisah, sama pola
                    // dgn IK Program di flattenKonteksRoUntukIdentifikasi().
                    'indikator_list' => collect($tujuan['indikator_list'] ?? [])->values()->all(),
                ];
                array_push($tujuanBuffer, ...$sasaranBuffer);
            }

            if ($misiPunyaSasaranTampil && isset($konteks['misi_list']) && count($konteks['misi_list']) > 1) {
                $result[] = ['type' => 'misi', 'nomor' => (string) $misi['nomor'], 'label' => $misi['misi']];
            }
            array_push($result, ...$tujuanBuffer);
        }

        return $result;
    }

    /**
     * Ratakan struktur bertingkat Sasaran>Program>Kegiatan dari
     * buildKonteksRo() jadi baris tampil utk Form 3c — REUSE nomor "asli"
     * yg SAMA PERSIS dgn yg tercetak di Form 2c (mis. Program "1.1",
     * Kegiatan "1.1.1"), pola identik dgn flattenKonteksUntukIdentifikasi()
     * tapi berbasis Sasaran/Program/Kegiatan (bukan Misi/Tujuan/Sasaran)
     * krn basis risiko operasional adalah Kegiatan pada Renja/DPA OPD.
     * Hanya baris Kegiatan yg py risiko teridentifikasi (IroPd) yg
     * disertakan; Program (dan Sasaran, kalau py >1 Program) disertakan
     * sbg baris header kalau minimal satu Kegiatan anaknya tampil.
     */
    private function flattenKonteksRoUntukIdentifikasi(array $konteks, callable $kegiatanRisikoResolver): array
    {
        $result = [];

        foreach ($konteks['sasaran_list'] as $sasaran) {
            $programBuffer = [];
            $sasaranPunyaProgramTampil = false;

            foreach ($sasaran['program_list'] as $program) {
                $kegiatanBuffer = [];

                foreach ($program['kegiatan_list'] as $kegiatan) {
                    $risikoList = $kegiatanRisikoResolver($kegiatan['kegiatan']);
                    if (empty($risikoList)) {
                        continue;
                    }

                    $kegiatanBuffer[] = [
                        'type' => 'kegiatan',
                        'nomor' => $kegiatan['nomor'],
                        'label' => $kegiatan['kegiatan'],
                        'indikator_list' => collect($kegiatan['indikator_list'] ?? [])->values()->all(),
                        'risiko_list' => $risikoList,
                    ];
                }

                if (empty($kegiatanBuffer)) {
                    continue;
                }

                $sasaranPunyaProgramTampil = true;
                $programBuffer[] = [
                    'type' => 'program',
                    'nomor' => $program['nomor'],
                    'label' => $program['program'],
                    // IK Program (beda dari IK Kegiatan di baris Kegiatan
                    // anaknya) — ditampilkan di kolom IK terpisah, sesuai
                    // permintaan: kolom IK Form 3c disisipkan antara kolom b
                    // (Program/Kegiatan) & kolom Tahapan, BUKAN menimpa kolom
                    // c resmi Perdep yg = Tahapan Kegiatan.
                    'indikator_list' => collect($program['indikator_list'] ?? [])->values()->all(),
                ];
                array_push($programBuffer, ...$kegiatanBuffer);
            }

            if ($sasaranPunyaProgramTampil && count($konteks['sasaran_list']) > 1) {
                $result[] = ['type' => 'sasaran_renstra', 'nomor' => $sasaran['nomor'], 'label' => $sasaran['sasaran']];
            }
            array_push($result, ...$programBuffer);
        }

        return $result;
    }

    /**
     * Form 3a — Identifikasi Risiko Strategis Pemda. Nomor Tujuan/Sasaran
     * REUSE dari buildKonteksPemda() (sama fungsi yg dipakai Form 2a) agar
     * label "1.1", "1.1.2" dst identik antar kedua form — lihat
     * flattenKonteksUntukIdentifikasi().
     */
    private function buildIdentifikasiPemda(int $tahun)
    {
        $konteks = $this->buildKonteksPemda($tahun);
        if (!$konteks) {
            return [];
        }

        $rows = IrsPemda::where('TAHUN DINILAI RISIKO', (string) $tahun)
            ->orderBy('id')
            ->get()
            ->filter(fn ($r) => trim((string) $r->{'URAIAN RISIKO'}) !== '');

        $nomorUrutMap = $this->nomorUrutFor($rows, 'SASARAN RPJMD');
        $sasaranGroups = $rows->groupBy(fn ($r) => $this->matchKey(trim((string) $r->{'SASARAN RPJMD'})));

        $resolver = function (string $sasaranTeks) use ($sasaranGroups, $nomorUrutMap) {
            $groupRows = $sasaranGroups->get($this->matchKey($sasaranTeks));
            if (!$groupRows || $groupRows->isEmpty()) {
                return [];
            }

            return $groupRows->map(fn ($r) => $this->identifikasiRow($r, 'RSP', $sasaranTeks, $nomorUrutMap[$r->id] ?? null))->values()->all();
        };

        return $this->flattenKonteksUntukIdentifikasi($konteks, 'sasaran', $resolver);
    }

    public function cetak3a(Request $request)
    {
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $identifikasi = $this->buildIdentifikasiPemda($tahun);
        $pengaturan = $this->pengaturan();
        $pemerintahKabkota = $pengaturan->pemerintah_kabkota ?: 'Pemerintah Kabupaten Aceh Barat';
        $dataUmum = $this->dataUmumForOpd(null);

        return Inertia::render('risiko/cetak/Cetak3a', [
            'tahun' => $tahun,
            'periode' => $pengaturan->periode_penilaian,
            'identifikasi' => $identifikasi,
            // Visi ditampilkan sbg baris info tersendiri di atas tabel
            // (SAMA seperti Form 2a, lihat Cetak2a.tsx <Baris label="Visi">)
            // — TIDAK bernomor, krn 1 Pemda hanya py 1 Visi.
            'visi' => $this->buildKonteksPemda($tahun)['visi'] ?? null,
            'pemerintahKabkota' => $pemerintahKabkota,
            'sumberData' => $this->sumberDataPemda($pemerintahKabkota, $pengaturan->periode_penilaian, $this->dokumenSumber($dataUmum, 'dokumen_sumber_rsp')),
            'dataUmum' => $this->dataUmumForInertia($dataUmum),
        ]);
    }

    public function pdf3a(Request $request)
    {
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $url = url("/cetak/risiko/3a?tahun={$tahun}");

        return PdfPrintService::downloadFromUrl($request, $url, "Form-3a-Identifikasi-Risiko-Strategis-Pemda-{$tahun}");
    }

    /**
     * Form 3b — Identifikasi Risiko Strategis OPD. Nomor Tujuan/Sasaran
     * REUSE dari buildKonteksPd() (sama fungsi yg dipakai Form 2b) agar
     * label identik antar kedua form — lihat flattenKonteksUntukIdentifikasi().
     * buildKonteksPd() tidak py level Misi (khusus OPD), jadi nomor Sasaran
     * 2-level ("1.1", "1.2"), bukan 3-level spt versi Pemda.
     */
    private function buildIdentifikasiPd(int $opdId, string $opdNama, int $tahun)
    {
        $konteks = $this->buildKonteksPd($opdNama, $tahun);
        if (!$konteks) {
            return [];
        }

        // IrsPd tidak punya kolom OPD sendiri — kepemilikan ditentukan
        // lewat user_id -> User.opd_id (sama pola dgn IrsPdController::
        // index(), BUKAN via "ENTITAS PD YANG MENILAI" yg maknanya beda:
        // itu nama entitas PENILAI risiko utk kode risiko, bukan
        // kepemilikan/OPD pemilik baris risikonya).
        $rows = IrsPd::whereHas('user', fn ($q) => $q->where('opd_id', $opdId))
            ->where('TAHUN DINILAI RISIKO', (string) $tahun)
            ->orderBy('id')
            ->get()
            ->filter(fn ($r) => trim((string) $r->{'URAIAN RISIKO'}) !== '');

        $nomorUrutMap = $this->nomorUrutFor($rows, 'SASARAN RENSTRA');
        $sasaranGroups = $rows->groupBy(fn ($r) => $this->matchKey(trim((string) $r->{'SASARAN RENSTRA'})));

        $resolver = function (string $sasaranTeks) use ($sasaranGroups, $nomorUrutMap) {
            $groupRows = $sasaranGroups->get($this->matchKey($sasaranTeks));
            if (!$groupRows || $groupRows->isEmpty()) {
                return [];
            }

            return $groupRows->map(fn ($r) => $this->identifikasiRow($r, 'RSO', $sasaranTeks, $nomorUrutMap[$r->id] ?? null))->values()->all();
        };

        return $this->flattenKonteksUntukIdentifikasi($konteks, 'sasaran', $resolver);
    }

    public function cetak3b(Request $request)
    {
        $opdId = $request->integer('opd_id') ?: $request->user()->opd_id;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $opd = $opdId ? Opd::find($opdId) : null;
        $pengaturan = $this->pengaturan();

        $identifikasi = $opd ? $this->buildIdentifikasiPd($opd->id, $opd->nama, $tahun) : null;
        $dataUmum = $this->dataUmumForOpd($opdId);

        return Inertia::render('risiko/cetak/Cetak3b', [
            'opdOptions' => $this->opdOptions($request),
            'opd' => $opd,
            'tahun' => $tahun,
            'periode' => $pengaturan->periode_penilaian,
            'identifikasi' => $identifikasi,
            'pemerintahKabkota' => $pengaturan->pemerintah_kabkota ?: 'Pemerintah Kabupaten Aceh Barat',
            'sumberData' => $opd ? $this->sumberDataRenstra($opd->nama, $pengaturan->periode_penilaian, $this->dokumenSumber($dataUmum, 'dokumen_sumber_rso')) : null,
            'urusanPemerintahan' => $dataUmum?->nama_urusan,
            'dataUmum' => $this->dataUmumForInertia($dataUmum),
        ]);
    }

    public function pdf3b(Request $request)
    {
        // Fallback ke opd_id milik user (BUKAN null) kalau tidak dikirim di
        // query string — konsisten dgn cetak3b().
        $opdId = $request->integer('opd_id') ?: $request->user()->opd_id;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $opd = $opdId ? Opd::findOrFail($opdId) : abort(404);

        $url = url("/cetak/risiko/3b?opd_id={$opdId}&tahun={$tahun}");

        return PdfPrintService::downloadFromUrl($request, $url, "Form-3b-Identifikasi-Risiko-Strategis-OPD-{$opd->nama}-{$tahun}");
    }

    /**
     * Form 3c — Identifikasi Risiko Operasional OPD, hierarki bertingkat
     * Sasaran Renstra > Program > Kegiatan (sesuai Lampiran 5 Perdep PPKD
     * No.4/2019 — basis risiko operasional adalah Kegiatan pada Renja/DPA
     * OPD). Nomor REUSE dari buildKonteksRo() (sama fungsi yg dipakai Form
     * 2c) agar layout/penomoran konsisten dgn Form 3a/3b — lihat
     * flattenKonteksRoUntukIdentifikasi().
     */
    private function buildIdentifikasiRo(int $opdId, string $opdNama, int $tahun)
    {
        $konteks = $this->buildKonteksRo($opdNama, $tahun);
        if (!$konteks) {
            return [];
        }

        // IroPd juga tidak punya kolom OPD sendiri — sama alasan dgn
        // buildIdentifikasiPd() di atas.
        $rows = IroPd::whereHas('user', fn ($q) => $q->where('opd_id', $opdId))
            ->where('TAHUN DINILAI RISIKO', (string) $tahun)
            ->orderBy('id')
            ->get()
            ->filter(fn ($r) => trim((string) $r->{'URAIAN RISIKO'}) !== '');

        $nomorUrutMap = $this->nomorUrutFor($rows, 'KEGIATAN PD');
        $kegiatanGroups = $rows->groupBy(fn ($r) => $this->matchKey(trim((string) $r->{'KEGIATAN PD'})));

        $resolver = function (string $kegiatanTeks) use ($kegiatanGroups, $nomorUrutMap) {
            $groupRows = $kegiatanGroups->get($this->matchKey($kegiatanTeks));
            if (!$groupRows || $groupRows->isEmpty()) {
                return [];
            }

            return $groupRows->map(fn ($r) => array_merge(
                $this->identifikasiRow($r, 'ROO', $kegiatanTeks, $nomorUrutMap[$r->id] ?? null),
                ['tahap' => $r->TAHAP],
            ))->values()->all();
        };

        return $this->flattenKonteksRoUntukIdentifikasi($konteks, $resolver);
    }

    public function cetak3c(Request $request)
    {
        $opdId = $request->integer('opd_id') ?: $request->user()->opd_id;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $opd = $opdId ? Opd::find($opdId) : null;
        $pengaturan = $this->pengaturan();

        $identifikasi = $opd ? $this->buildIdentifikasiRo($opd->id, $opd->nama, $tahun) : null;
        $dataUmum = $this->dataUmumForOpd($opdId);

        return Inertia::render('risiko/cetak/Cetak3c', [
            'opdOptions' => $this->opdOptions($request),
            'opd' => $opd,
            'tahun' => $tahun,
            'periode' => $pengaturan->periode_penilaian,
            'identifikasi' => $identifikasi,
            'pemerintahKabkota' => $pengaturan->pemerintah_kabkota ?: 'Pemerintah Kabupaten Aceh Barat',
            'sumberData' => $opd ? $this->sumberDataRenja($opd->nama, $tahun, $this->dokumenSumber($dataUmum, 'dokumen_sumber_roo')) : null,
            'urusanPemerintahan' => $dataUmum?->nama_urusan,
            'dataUmum' => $this->dataUmumForInertia($dataUmum),
        ]);
    }

    public function pdf3c(Request $request)
    {
        // Fallback ke opd_id milik user (BUKAN null) kalau tidak dikirim di
        // query string — konsisten dgn cetak3c().
        $opdId = $request->integer('opd_id') ?: $request->user()->opd_id;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $opd = $opdId ? Opd::findOrFail($opdId) : abort(404);

        $url = url("/cetak/risiko/3c?opd_id={$opdId}&tahun={$tahun}");

        return PdfPrintService::downloadFromUrl($request, $url, "Form-3c-Identifikasi-Risiko-Operasional-OPD-{$opd->nama}-{$tahun}");
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
