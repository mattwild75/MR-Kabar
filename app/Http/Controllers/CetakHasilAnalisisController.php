<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\GeneratesKodeRisiko;
use App\Http\Controllers\Concerns\SharesCetakContext;
use App\Models\DataUmum;
use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\IrsPemda;
use App\Models\PengaturanPemda;
use App\Models\RiskImpactCriteria;
use App\Models\RiskLevel;
use App\Models\RiskLikelihoodCriteria;
use App\Services\PdfPrintService;
use App\Services\RiskReferenceDataService;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;

/**
 * Form Cetak Risiko — 4 (Kertas Kerja Hasil Analisis Risiko) & 5 (Kertas
 * Kerja Daftar Risiko Prioritas), sesuai Lampiran 5 Form 4 & Form 5 Perdep
 * PPKD No.4/2019 — BEDA POLA dari Form 2a/2b/2c & 3a/3b/3c yg terpisah per
 * tingkat (Pemda/OPD Strategis/OPD Operasional): Form 4/5 mengGABUNGKAN
 * KETIGA tingkat risiko (I. Risiko Strategis, II. Risiko Strategis OPD,
 * III. Risiko Operasional OPD) dalam SATU halaman cetak, persis contoh
 * Perdep & sheet Form_4a/Form_4b MR_Kabar_Unlocked.xlsm — makanya TIDAK
 * pakai ensureOpdAccess()/opdOptions() spt CetakRisikoController (form ini
 * lintas-OPD by design, semua user yg py akses menu ini boleh melihat
 * seluruh OPD, bukan cuma OPD sendiri).
 */
class CetakHasilAnalisisController extends Controller
{
    use GeneratesKodeRisiko;
    use SharesCetakContext;

    public function __construct(private readonly RiskReferenceDataService $riskRef)
    {
    }

    /**
     * Data Umum Pemda-wide UTK TAHUN TERTENTU (sama pola dgn
     * CetakRisikoController::dataUmumForOpd(null, $tahun), DataUmum sudah
     * per-tahun sejak migration 2026_07_17_050000_make_data_umum_per_tahun)
     * — dipakai header/blok PIC Form 4/5 krn form ini lintas-OPD, tidak
     * terikat satu OPD tertentu.
     */
    private function dataUmumPemda(int $tahun): ?DataUmum
    {
        $dataUmum = DataUmum::forOpdAndTahun(null, $tahun);

        if ($dataUmum && (!$dataUmum->nama_kepala_daerah || !$dataUmum->jabatan_kepala_daerah)) {
            $default = $this->pengaturan();
            $dataUmum->nama_kepala_daerah ??= $default->nama_kepala_daerah;
            $dataUmum->jabatan_kepala_daerah ??= $default->jabatan_kepala_daerah;
        }

        return $dataUmum;
    }

    /**
     * PIC (nama_pic) yg ditampilkan di bawah Matriks Analisis Risiko UTK
     * TAHUN TERTENTU — kalau PIC biasa (form sudah discope ke OPD-nya
     * sendiri, $opdId terisi), tampilkan nama_pic milik OPD ybs pd tahun
     * tsb (bukan data Pemda-wide dari dataUmumPemda(), yg bisa jadi
     * kepunyaan OPD lain) — sama pola dgn
     * CetakRisikoController::dataUmumForOpd($opdId, $tahun). Admin/Super
     * Admin (lintas-OPD, $opdId null) tidak py satu PIC tunggal yg relevan,
     * jadi tidak ditampilkan sama sekali (lihat picListAll() utk versi
     * Admin, daftar SEMUA PIC).
     */
    private function picNamaForOpd(?int $opdId, int $tahun): ?string
    {
        if (!$opdId) {
            return null;
        }

        return DataUmum::forOpdAndTahun($opdId, $tahun)?->nama_pic;
    }

    // pengaturan() & dataUmumForInertia() dipindah ke trait SharesCetakContext.

    /**
     * Satu baris Form 4/5 — field yg sama utk ketiga tingkat risiko
     * (Pemda/OPD Strategis/OPD Operasional), diproyeksikan dari kolom yg
     * sudah ada di IrsPemda/IrsPd/IroPd. $opdNama null utk Risiko
     * Strategis Pemda (section I, tidak terikat OPD tertentu).
     */
    private function analisisRow($row, string $prefix, ?string $opdNama, ?string $nomorUrut): array
    {
        return [
            'opd' => $opdNama,
            'uraian_risiko' => $row->{'URAIAN RISIKO'},
            'kode_risiko' => $this->generateKodeRisiko(
                $prefix,
                $row->{'TAHUN DINILAI RISIKO'},
                $row->{'JENIS RISIKO'},
                $row->{'ENTITAS PD YANG MENILAI'},
                $nomorUrut,
            ),
            'skala_dampak' => $row->{'SKALA DAMPAK'},
            'skala_kemungkinan' => $row->{'SKALA KEMUNGKINAN'},
            'skala_risiko' => $row->{'SKALA RISIKO'},
            'pemilik_risiko' => $row->{'PEMILIK RISIKO'},
            'sebab' => $row->{'URAIAN PENYEBAB RISIKO'},
            'dampak' => $row->{'URAIAN DAMPAK RISIKO'},
        ];
    }

    /**
     * Kumpulkan seluruh risiko (Pemda + semua OPD) utk tahun terpilih,
     * dikelompokkan 3 section sesuai Perdep: I. Risiko Strategis (Pemda),
     * II. Risiko Strategis OPD (semua OPD digabung, diurut nama OPD lalu
     * nomor urut risiko), III. Risiko Operasional OPD (sama pola II).
     * Nomor urut & Kode Risiko dihitung dgn logic SAMA PERSIS dgn Form
     * 3a/3b/3c & Form Input IRS/IRO (nomorUrutFor per kombinasi Tahun+
     * Jenis+Entitas Penilai, lihat GeneratesKodeRisiko::nomorUrutFor()) —
     * supaya kode risiko yg tercetak di Form 4/5 identik dgn yg tercetak
     * di Form 3 & yg terlihat di Form Input, bukan angka berbeda utk
     * risiko yg sama.
     *
     * $opdId: kalau diisi (PIC biasa — lihat cetak4()/cetak5()), SEMUA
     * section (I, II, III) DIFILTER hanya milik OPD tsb SETELAH nomor
     * urut/kode risiko dihitung dari SELURUH data (bukan difilter dulu
     * baru dihitung) — supaya kode risiko yg tampil ke PIC tetap identik
     * dgn yg tercetak di Form 3a/3b/3c OPD-nya, bukan nomor urut yg
     * berubah krn basis penghitungannya beda.
     *
     * PENTING: Risiko Strategis Pemda (IrsPemda, Section I) BUKAN cuma
     * relevan utk Admin — baris di tabel itu tetap py kepemilikan per-OPD
     * lewat user_id->User.opd_id (siapa PIC yg MENILAI risiko itu, kolom
     * "ENTITAS PD YANG MENILAI" di tabelnya), sama persis pola IrsPd/IroPd.
     * PIC OPD ybs (mis. Dinas Kesehatan mengisi baris Risiko Strategis
     * Pemda terkait Sasaran RPJMD kesehatan) TETAP HARUS bisa melihat baris
     * yg dia sendiri isi di Form 4/5 — versi awal (Section I disembunyikan
     * total kalau $opdId diisi) SALAH, ditemukan lewat laporan user: baris
     * IrsPemda yg diisi Dinas Kesehatan tidak muncul sama sekali di Form
     * 4/5 versi PIC Dinas Kesehatan.
     */
    private function buildAnalisisRisiko(int $tahun, ?int $opdId = null): array
    {
        // Kolom "OPD" utk Section I (Risiko Strategis Pemda) SELALU
        // menampilkan nama Pemda (mis. "Pemerintah Kabupaten Aceh Barat",
        // dari PengaturanPemda::pemerintah_kabkota) — BUKAN nama OPD PIC
        // yg mengisi baris tsb (beda dari Section II/III yg memang per-OPD).
        // Kepemilikan (siapa yg BOLEH melihat baris ini saat discope
        // $opdId) tetap ditentukan lewat user_id->User.opd_id spt biasa,
        // hanya LABEL yg ditampilkan yg beda.
        $namaPemda = $this->pengaturan()->pemerintah_kabkota ?: 'Pemerintah Kabupaten Aceh Barat';

        // select() dibatasi ke kolom yg dibaca analisisRow()/nomorUrutFor()
        // di bawah — nomor urut & kode risiko tetap dihitung dari SELURUH
        // baris (semua OPD) sebelum difilter per-OPD, TIDAK mengubah data
        // yg dikembalikan ke frontend, murni mengurangi kolom teks lebar
        // yg tidak dipakai supaya transfer lebih ringan.
        $analisisColumns = [
            'id', 'user_id', 'URAIAN RISIKO', 'TAHUN DINILAI RISIKO', 'JENIS RISIKO',
            'ENTITAS PD YANG MENILAI', 'SKALA DAMPAK', 'SKALA KEMUNGKINAN', 'SKALA RISIKO',
            'PEMILIK RISIKO', 'URAIAN PENYEBAB RISIKO', 'URAIAN DAMPAK RISIKO',
        ];

        $strategisPemda = IrsPemda::whereHas('user')
            ->where('TAHUN DINILAI RISIKO', (string) $tahun)
            ->select($analisisColumns)
            ->with(['user:id,opd_id', 'user.opd:id,nama'])
            ->orderBy('id')
            ->get()
            ->filter(fn ($r) => trim((string) $r->{'URAIAN RISIKO'}) !== '');
        $nomorPemda = $this->nomorUrutFor($strategisPemda);

        $sectionI = $strategisPemda
            ->filter(fn ($r) => !$opdId || $r->user?->opd_id === $opdId)
            ->map(fn ($r) => $this->analisisRow($r, 'RSP', $namaPemda, $nomorPemda[$r->id] ?? null))
            ->sortBy(fn ($r) => [$r['opd'] ?? '', $r['kode_risiko'] ?? ''])
            ->values();

        $strategisOpd = IrsPd::whereHas('user')
            ->where('TAHUN DINILAI RISIKO', (string) $tahun)
            ->select($analisisColumns)
            ->with(['user:id,opd_id', 'user.opd:id,nama'])
            ->orderBy('id')
            ->get()
            ->filter(fn ($r) => trim((string) $r->{'URAIAN RISIKO'}) !== '');
        $nomorOpdStrategis = $this->nomorUrutFor($strategisOpd);

        $sectionII = $strategisOpd
            ->filter(fn ($r) => !$opdId || $r->user?->opd_id === $opdId)
            ->map(fn ($r) => $this->analisisRow($r, 'RSO', $r->user?->opd?->nama, $nomorOpdStrategis[$r->id] ?? null))
            ->sortBy(fn ($r) => [$r['opd'] ?? '', $r['kode_risiko'] ?? ''])
            ->values();

        $operasionalOpd = IroPd::whereHas('user')
            ->where('TAHUN DINILAI RISIKO', (string) $tahun)
            ->select($analisisColumns)
            ->with(['user:id,opd_id', 'user.opd:id,nama'])
            ->orderBy('id')
            ->get()
            ->filter(fn ($r) => trim((string) $r->{'URAIAN RISIKO'}) !== '');
        $nomorOpdOperasional = $this->nomorUrutFor($operasionalOpd);

        $sectionIII = $operasionalOpd
            ->filter(fn ($r) => !$opdId || $r->user?->opd_id === $opdId)
            ->map(fn ($r) => $this->analisisRow($r, 'ROO', $r->user?->opd?->nama, $nomorOpdOperasional[$r->id] ?? null))
            ->sortBy(fn ($r) => [$r['opd'] ?? '', $r['kode_risiko'] ?? ''])
            ->values();

        return [
            'strategis_pemda' => $sectionI,
            'strategis_opd' => $sectionII,
            'operasional_opd' => $sectionIII,
        ];
    }

    /**
     * Matriks Analisis Risiko 5x5 (Dampak x Kemungkinan) — tiap sel berisi
     * daftar risiko yg (Skala Dampak, Skala Kemungkinan)-nya jatuh di sel
     * itu, dari SELURUH section (I+II+III) sekaligus, sesuai sheet
     * Form_4b MR_Kabar_Unlocked.xlsm. Baris = Kemungkinan (1-5), Kolom =
     * Dampak (1-5) — standar matriks risiko Perdep.
     */
    private function buildMatriks(array $sections): array
    {
        $semua = collect($sections['strategis_pemda'])
            ->concat($sections['strategis_opd'])
            ->concat($sections['operasional_opd']);

        $cells = [];
        for ($kemungkinan = 1; $kemungkinan <= 5; $kemungkinan++) {
            for ($dampak = 1; $dampak <= 5; $dampak++) {
                $cells["{$kemungkinan}-{$dampak}"] = $semua
                    ->filter(fn ($r) => (int) ($r['skala_dampak'] ?? 0) === $dampak && (int) ($r['skala_kemungkinan'] ?? 0) === $kemungkinan)
                    ->map(fn ($r) => [
                        'kode_risiko' => $r['kode_risiko'],
                        'uraian_risiko' => $r['uraian_risiko'],
                    ])
                    ->values()
                    ->all();
            }
        }

        return $cells;
    }

    /**
     * [dampak][kemungkinan] => skala risiko, sumber tabel risk_matrix_cells
     * (Settings > Keterangan Pendukung > Matriks Analisis Risiko) — BUKAN
     * dihitung dampak*kemungkinan langsung di frontend (versi awal Form 4
     * salah asumsi begitu; skala_risiko tabel itu field BEBAS diedit Admin,
     * tidak divalidasi harus sama dgn perkalian polos). Dikirim ke
     * Cetak4.tsx supaya warna & angka tiap sel Matriks konsisten dgn
     * pengaturan Admin, sama sumbernya dgn SKALA RISIKO tersimpan di baris
     * IRS/IRO (dihitung RiskReferenceDataService::hitungSkala() saat Form
     * Input disimpan).
     */
    private function matriksSkalaRisiko(): array
    {
        return $this->riskRef->skalaRisikoMatrix();
    }

    /**
     * Daftar SELURUH PIC yg mengidentifikasi risiko (Form Input IRS/IRO)
     * pada tahun terpilih — dipakai Admin/Super Admin ($opdId null) di
     * bawah Matriks Analisis Risiko Form 4, krn tampilan mrk lintas-OPD
     * (beda dari picNamaForOpd() yg cuma 1 nama utk PIC biasa yg sudah
     * discope 1 OPD). Dikumpulkan dari user_id unik pemilik baris
     * IrsPemda/IrsPd/IroPd tahun ybs (BUKAN seluruh User terdaftar — hanya
     * PIC yg BENAR2 mengisi minimal 1 risiko), sesuai literal permintaan:
     * "seluruh PIC yg mengidentifikasi risiko (Input IRS IRO) baik Risiko
     * Strategis Pemda, Risiko Strategis PD dan Risiko Operasional PD".
     * Nama OPD diambil dari DataUmum::nama_dinas_opd milik PIC ybs (bukan
     * User.opd.nama) supaya konsisten dgn CetakRisikoController::
     * buildKonteksPemda()'s pic_list, yg sumbernya sama persis.
     */
    private function picListAll(int $tahun): array
    {
        $userIds = collect()
            ->concat(IrsPemda::where('TAHUN DINILAI RISIKO', (string) $tahun)->whereNotNull('user_id')->pluck('user_id'))
            ->concat(IrsPd::where('TAHUN DINILAI RISIKO', (string) $tahun)->whereNotNull('user_id')->pluck('user_id'))
            ->concat(IroPd::where('TAHUN DINILAI RISIKO', (string) $tahun)->whereNotNull('user_id')->pluck('user_id'))
            ->unique()
            ->values();

        // DataUmum sekarang per-tahun — WAJIB ikut difilter $tahun (bug yg
        // sama persis dgn buildKonteksPemda()'s pic_list di
        // CetakRisikoController kalau baris ini dilewatkan: user_id sudah
        // benar per tahun, tapi baris DataUmum-nya bisa nyasar ke tahun lain
        // milik user yg sama kalau tidak discope juga).
        return DataUmum::whereIn('user_id', $userIds)
            ->where('tahun_penilaian', (string) $tahun)
            ->whereNotNull('nama_pic')
            ->orderBy('nama_dinas_opd')
            ->get(['nama_dinas_opd', 'nama_pic'])
            ->map(fn ($d) => ['opd' => $d->nama_dinas_opd, 'nama' => $d->nama_pic])
            ->values()
            ->all();
    }

    /**
     * PIC biasa (role 'user', punya opd_id) hanya melihat Risiko OPD-nya
     * sendiri di Form 4/5 (Section I, II & III semua difilter by ownership,
     * lihat buildAnalisisRisiko()) — Admin/Super Admin TIDAK
     * dibatasi, tetap melihat seluruh Pemda + semua OPD. Beda dari
     * CetakRisikoController::ensureOpdAccess() (Form 2/3, yg selalu 1 OPD
     * per halaman & PIC WAJIB pilih OPD-nya via query opd_id) — di sini
     * PIC TIDAK perlu mengirim opd_id sama sekali, cukup opd_id akun
     * loginnya sendiri yg dipakai otomatis.
     */
    private function scopedOpdId(Request $request): ?int
    {
        $user = $request->user();
        if ($user->hasAnyRole(['admin', 'super-admin'])) {
            return null;
        }

        return $user->opd_id;
    }

    public function cetak4(Request $request)
    {
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $pengaturan = $this->pengaturan();
        $dataUmum = $this->dataUmumPemda($tahun);
        $opdId = $this->scopedOpdId($request);

        $sections = $this->buildAnalisisRisiko($tahun, $opdId);

        return Inertia::render('risiko/cetak/Cetak4', [
            'tahun' => $tahun,
            'periode' => $pengaturan->periode_penilaian,
            'sections' => $sections,
            'matriks' => $this->buildMatriks($sections),
            'matriksSkalaRisiko' => $this->matriksSkalaRisiko(),
            'pemerintahKabkota' => $pengaturan->pemerintah_kabkota ?: 'Pemerintah Kabupaten Aceh Barat',
            'dataUmum' => $this->dataUmumForInertia($dataUmum),
            'riskLevels' => RiskLevel::orderBy('urutan')->get(['label', 'skala_min', 'skala_max', 'warna_class']),
            // Label sumbu Matriks (Dampak/Kemungkinan) — BUKAN hardcode di
            // frontend, dari RiskImpactCriteria.label & RiskLikelihoodCriteria.nama
            // (Settings > Keterangan Pendukung), supaya ikut berubah kalau
            // Admin mengedit teks kriteria.
            'dampakLabels' => RiskImpactCriteria::orderBy('level')->pluck('label'),
            'kemungkinanLabels' => RiskLikelihoodCriteria::orderBy('level')->pluck('nama'),
            'isScopedToOwnOpd' => $opdId !== null,
            'picNama' => $this->picNamaForOpd($opdId, $tahun),
            // Admin/Super Admin (lintas-OPD): daftar SELURUH PIC yg mengisi
            // risiko (bukan 1 nama tunggal spt PIC biasa) — lihat
            // picListAll(). PIC biasa (opdId terisi) tidak butuh ini krn
            // sudah py picNama sendiri, kirim array kosong.
            'picList' => $opdId ? [] : $this->picListAll($tahun),
        ]);
    }

    public function pdf4(Request $request)
    {
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $url = url("/cetak/risiko/4?tahun={$tahun}");

        return PdfPrintService::downloadFromUrl($request, $url, "Form-4-Hasil-Analisis-Risiko-{$tahun}");
    }

    /**
     * Risiko Prioritas Form 5 = risiko dgn kriteria "Sangat Tinggi" atau
     * "Tinggi" (Perdep Bab III.C: "risiko dengan kriteria 'sangat tinggi'
     * dan 'tinggi' akan diprioritaskan untuk ditangani") — batas skala
     * diambil DINAMIS dari tabel risk_levels (bukan hardcode 16-25),
     * konsisten dgn cara Keterangan Pendukung mengatur level risiko.
     * Diurutkan skala risiko tertinggi dulu (paling prioritas), per
     * section yg sama dgn Form 4.
     */
    private function filterPrioritas(Collection $rows): Collection
    {
        $ambangTinggi = RiskLevel::whereIn('label', ['Tinggi', 'Sangat Tinggi'])->min('skala_min');
        if ($ambangTinggi === null) {
            return collect();
        }

        return $rows
            ->filter(fn ($r) => (int) ($r['skala_risiko'] ?? 0) >= $ambangTinggi)
            ->sortByDesc(fn ($r) => (int) ($r['skala_risiko'] ?? 0))
            ->values();
    }

    public function cetak5(Request $request)
    {
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $pengaturan = $this->pengaturan();
        $dataUmum = $this->dataUmumPemda($tahun);
        $opdId = $this->scopedOpdId($request);

        $sections = $this->buildAnalisisRisiko($tahun, $opdId);

        return Inertia::render('risiko/cetak/Cetak5', [
            'tahun' => $tahun,
            'periode' => $pengaturan->periode_penilaian,
            'sections' => [
                'strategis_pemda' => $this->filterPrioritas($sections['strategis_pemda']),
                'strategis_opd' => $this->filterPrioritas($sections['strategis_opd']),
                'operasional_opd' => $this->filterPrioritas($sections['operasional_opd']),
            ],
            'isScopedToOwnOpd' => $opdId !== null,
            'pemerintahKabkota' => $pengaturan->pemerintah_kabkota ?: 'Pemerintah Kabupaten Aceh Barat',
            'dataUmum' => $this->dataUmumForInertia($dataUmum),
            'riskLevels' => RiskLevel::orderBy('urutan')->get(['label', 'skala_min', 'skala_max', 'warna_class']),
        ]);
    }

    public function pdf5(Request $request)
    {
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $url = url("/cetak/risiko/5?tahun={$tahun}");

        return PdfPrintService::downloadFromUrl($request, $url, "Form-5-Daftar-Risiko-Prioritas-{$tahun}");
    }
}
