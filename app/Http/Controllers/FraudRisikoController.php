<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\SharesCetakContext;
use App\Models\DataUmum;
use App\Models\FraudKamusRisiko;
use App\Models\FraudRisiko;
use App\Models\Opd;
use App\Models\PengaturanPemda;
use App\Models\RiskLevel;
use App\Models\RiskMatrixCell;
use App\Services\PdfPrintService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * MR Fraud — Penilaian Risiko Kecurangan (Fraud Risk Assessment).
 *
 * Dasar: Perdep BPKP Bidang Investigasi No. 1 Tahun 2019 tentang Pedoman
 * Penilaian Risiko Kecurangan, Perbup Aceh Barat No. 6 Tahun 2025 tentang
 * Pengendalian Kecurangan, dan Format Kertas Kerja FRA.
 *
 * Empat halaman pengisian memandang SATU tabel yang sama dari tiga tahap
 * berbeda (identifikasi -> analisis -> rencana tindak), ditambah register
 * gabungan yang hanya dibaca. Kertas kerja aslinya memisah ketiganya ke lembar
 * berbeda yang disambung dengan mengetik ulang "Nama Risiko" — cara yang sudah
 * terbukti memecah data pada fitur lain (temuan audit R-09).
 */
class FraudRisikoController extends Controller
{
    use SharesCetakContext;

    /** Tahun penilaian yang sedang dilihat; bawaannya Tahun Aktif Pemda. */
    private function tahun(Request $request): int
    {
        $diminta = trim((string) $request->query('tahun', ''));

        return $diminta !== '' && ctype_digit($diminta)
            ? (int) $diminta
            : (int) PengaturanPemda::current()->tahun_penilaian;
    }

    /**
     * Baris yang boleh dilihat pengguna ini.
     *
     * Sama aturannya dengan register risiko biasa: PIC hanya melihat barisnya
     * sendiri, admin melihat semua. Penyaring OPD memakai `opd_id` — kunci
     * asing sungguhan, bukan kolom teks berisi nama yang ejaannya berbeda-beda
     * antar pengisi (temuan audit R-08).
     */
    private function barisTerlihat(Request $request)
    {
        $isAdmin = auth()->user()?->canViewAllOpd() ?? false;

        $query = FraudRisiko::query()
            ->with(['opd:id,nama', 'user:id,name'])
            ->where('tahun_penilaian', $this->tahun($request))
            // Urutan PENGISIAN, bukan abjad tahapan: nomor risiko di kertas
            // kerja mengikuti urutan proses bisnisnya (pendaftaran -> seleksi
            // -> pengumuman), dan itu urutan orang mengisinya.
            ->orderBy('kegiatan_dinilai')
            ->orderBy('id');

        if (! $isAdmin) {
            $query->where('user_id', auth()->id());
        }

        $opdDiminta = (string) $request->query('opd_id', '');
        if ($isAdmin && $opdDiminta !== '' && ctype_digit($opdDiminta)) {
            $query->where('opd_id', (int) $opdDiminta);
        }

        return $query;
    }

    /** Prop yang sama untuk keempat halaman pengisian. */
    private function propBersama(Request $request): array
    {
        $isAdmin = auth()->user()?->canViewAllOpd() ?? false;

        return [
            'rows' => $this->barisTerlihat($request)->get(),
            'tahun' => $this->tahun($request),
            'tahunAktif' => (int) PengaturanPemda::current()->tahun_penilaian,
            'tahunOptions' => FraudRisiko::query()
                ->distinct()->orderByDesc('tahun_penilaian')
                ->pluck('tahun_penilaian')->all(),
            'isAdmin' => $isAdmin,
            'opdList' => $isAdmin ? Opd::orderBy('nama')->get(['id', 'nama']) : [],
            'opdId' => $request->query('opd_id'),
            'opdSendiri' => auth()->user()?->opd?->only(['id', 'nama']),
            'tahapanOptions' => FraudRisiko::TAHAPAN,
            'kelompokOptions' => FraudRisiko::KELOMPOK_RISIKO,
        ];
    }

    public function identifikasi(Request $request)
    {
        return Inertia::render('fraud/Identifikasi', $this->propBersama($request) + [
            // Seluruh kamus dikirim (165 butir, ringan) supaya PIC bisa
            // MEMUNGUT risiko baku langsung dari formulir, alih-alih merumuskan
            // sendiri risiko yang sebenarnya sama dengan OPD lain — dan
            // membuat register gabungannya tak bisa dihitung lintas OPD.
            'kamus' => FraudKamusRisiko::query()
                ->orderBy('area')->orderBy('nomor')
                ->get(['id', 'area', 'tahapan_proses', 'uraian']),
        ]);
    }

    public function analisis(Request $request)
    {
        return Inertia::render('fraud/Analisis', $this->propBersama($request) + [
            'pengendalianAdaOptions' => FraudRisiko::PENGENDALIAN_ADA,
            'pengendalianMemadaiOptions' => FraudRisiko::PENGENDALIAN_MEMADAI,
        ]);
    }

    public function rtp(Request $request)
    {
        return Inertia::render('fraud/Rtp', $this->propBersama($request));
    }

    public function register(Request $request)
    {
        return Inertia::render('fraud/Register', $this->propBersama($request));
    }

    /**
     * Peta Risiko Kecurangan — sebaran risiko inheren dan residual.
     *
     * Sel matriks diambil dari `risk_matrix_cells`, tabel yang sama dengan
     * seluruh aplikasi. Isinya terbukti PERSIS SAMA dengan matriks di kertas
     * kerja FRA, jadi membuat matriks kedua hanya akan mengundang dua jawaban
     * untuk satu angka.
     */
    public function peta(Request $request)
    {
        return Inertia::render('fraud/PetaRisiko', $this->propBersama($request) + [
            'matrixCells' => RiskMatrixCell::all(['dampak', 'kemungkinan', 'skala_risiko', 'warna_class']),
            'riskLevels' => RiskLevel::orderBy('urutan')->get(['label', 'skala_min', 'skala_max', 'warna_class']),
        ]);
    }

    public function kamus(Request $request)
    {
        $area = trim((string) $request->query('area', ''));

        return Inertia::render('fraud/Kamus', [
            'butir' => FraudKamusRisiko::query()
                ->when($area !== '', fn ($q) => $q->where('area', $area))
                ->orderBy('area')->orderBy('nomor')
                ->get(),
            'areas' => FraudKamusRisiko::query()
                ->select('area')->distinct()->orderBy('area')->pluck('area'),
            'areaTerpilih' => $area,
        ]);
    }

    /**
     * Form Cetak FRA — kertas kerja per Perangkat Daerah, lima lembar.
     *
     * Urutan dan judul kolom mengikuti Format Kertas Kerja FRA (lembar IR, AR,
     * RTP, RR, PR) apa adanya, supaya hasil cetaknya dikenali oleh yang biasa
     * memakai versi Excel-nya. Header, penanda tangan, dan tempat/tanggal
     * diambil dari Data Umum OPD tahun itu — TIDAK ada "Data Umum FRA"
     * tersendiri, sebab identitas kertas kerja sebuah OPD memang satu, bukan
     * satu per modul.
     *
     * Per OPD, bukan gabungan: kertas kerja FRA ditandatangani Kepala OPD
     * masing-masing. Rekap lintas OPD ada di Register (layar), bukan di cetakan.
     */
    public function cetak(Request $request)
    {
        $tahun = $this->tahun($request);
        $user = $request->user();

        $opdId = $request->integer('opd_id') ?: $user->opd_id;

        // Admin/Super Admin tidak punya OPD, dan membuka menu ini tanpa
        // parameter. Versi pertama menjawab 422 "Pilih Perangkat Daerah" —
        // yang dilihat pengguna hanya "Oops! An Error Occurred" (terjadi 11
        // September 2026). Yang benar: pilihkan OPD yang sudah punya data FRA
        // tahun itu (atau OPD pertama), lalu pemilih di layar mengambil alih.
        if (! $opdId && $user->canViewAllOpd()) {
            $opdId = FraudRisiko::where('tahun_penilaian', $tahun)->orderBy('opd_id')->value('opd_id')
                ?? Opd::orderBy('nama')->value('id');
        }

        $this->tolakOpdLain($request, $opdId, 'Anda hanya dapat mencetak kertas kerja FRA perangkat daerah Anda sendiri.');

        abort_if(! $opdId, 404, 'Belum ada Perangkat Daerah yang terdaftar.');

        $opd = Opd::findOrFail($opdId);
        $pengaturan = $this->pengaturan();

        $rows = FraudRisiko::query()
            ->where('opd_id', $opdId)
            ->where('tahun_penilaian', $tahun)
            ->orderBy('kegiatan_dinilai')->orderBy('id')
            ->get();

        return Inertia::render('fraud/cetak/Cetak', [
            'tahun' => $tahun,
            'opd' => $opd->only(['id', 'nama']),
            'pemerintahKabkota' => $pengaturan->pemerintah_kabkota ?: 'Pemerintah Kabupaten Aceh Barat',
            'dataUmum' => $this->dataUmumForInertia($dataUmum = DataUmum::forOpdAndTahun($opdId, $tahun)),
            // Kertas kerja FRA yang asli bertanggal "Meulaboh, Maret 2026" —
            // bulan dan tahun saja, tanpa hari. Berbeda dari Form Cetak MR Kabar
            // yang mencetak tanggal penuh; di sini mengikuti bentuk aslinya.
            'tanggalBulanTahun' => $dataUmum?->tanggal_pembuatan?->locale('id')->translatedFormat('F Y'),
            'rows' => $rows,
            'matrixCells' => RiskMatrixCell::all(['dampak', 'kemungkinan', 'skala_risiko', 'warna_class']),
            'riskLevels' => RiskLevel::orderBy('urutan')->get(['label', 'skala_min', 'skala_max', 'warna_class']),
            'isAdmin' => $user->canViewAllOpd(),
            'opdList' => $user->canViewAllOpd() ? Opd::orderBy('nama')->get(['id', 'nama']) : [],
            // Lembar yang diminta ikut lewat URL supaya Browsershot — yang
            // membuka URL ini sendiri, tanpa keadaan peramban pengguna —
            // merender lembar yang sama dengan yang dipilih di layar.
            'lembar' => in_array($request->query('lembar'), ['ir', 'ar', 'rtp', 'rr', 'peta'], true)
                ? $request->query('lembar')
                : 'semua',
        ]);
    }

    public function pdf(Request $request)
    {
        $tahun = $this->tahun($request);
        $opdId = $request->integer('opd_id') ?: $request->user()->opd_id;

        if (! $opdId && $request->user()->canViewAllOpd()) {
            $opdId = FraudRisiko::where('tahun_penilaian', $tahun)->orderBy('opd_id')->value('opd_id')
                ?? Opd::orderBy('nama')->value('id');
        }

        $this->tolakOpdLain($request, $opdId, 'Anda hanya dapat mencetak kertas kerja FRA perangkat daerah Anda sendiri.');

        $lembar = (string) $request->query('lembar', 'semua');

        $url = url('/fraud/cetak?'.http_build_query(['tahun' => $tahun, 'opd_id' => $opdId, 'lembar' => $lembar]));

        $namaOpd = str(Opd::find($opdId)?->nama ?? 'OPD')->slug()->limit(40, '');
        $akhiran = $lembar === 'semua' ? '' : '-'.strtoupper($lembar);

        return PdfPrintService::downloadFromUrl($request, $url, "FRA-{$namaOpd}-{$tahun}{$akhiran}");
    }

    public function store(Request $request)
    {
        $data = $this->validasi($request);

        // OPD diambil dari AKUN, bukan dari kiriman peramban. HANYA admin
        // yang boleh menyebut `opd_id` sendiri — ia memang perlu mengisikan
        // untuk OPD mana pun. Tanpa pembedaan ini, PIC cukup menyisipkan
        // opd_id di kiriman dan barisnya tercatat atas nama Perangkat Daerah
        // lain, tanpa gejala apa pun di layar siapa pun.
        $isAdmin = auth()->user()?->canViewAllOpd() ?? false;

        $data['user_id'] = auth()->id();
        $data['opd_id'] = $isAdmin
            ? ($data['opd_id'] ?? auth()->user()?->opd_id)
            : auth()->user()?->opd_id;

        abort_if($data['opd_id'] === null, 422, 'Akun Anda belum tertaut ke Perangkat Daerah.');

        FraudRisiko::create($data);

        return back()->with('success', 'Risiko kecurangan ditambahkan.');
    }

    public function update(Request $request, FraudRisiko $fraudRisiko)
    {
        $this->pastikanBoleh($fraudRisiko);

        $data = $this->validasi($request);

        // Alasan yang sama seperti pada store(): PIC tidak boleh memindahkan
        // baris ke Perangkat Daerah lain lewat kiriman peramban.
        if (! (auth()->user()?->canViewAllOpd() ?? false)) {
            unset($data['opd_id']);
        }

        $fraudRisiko->update($data);

        return back()->with('success', 'Risiko kecurangan diperbarui.');
    }

    public function destroy(FraudRisiko $fraudRisiko)
    {
        $this->pastikanBoleh($fraudRisiko);

        $fraudRisiko->delete();

        return back()->with('success', 'Risiko kecurangan dihapus.');
    }

    /** PIC hanya boleh menyentuh barisnya sendiri; admin boleh semua. */
    private function pastikanBoleh(FraudRisiko $baris): void
    {
        $isAdmin = auth()->user()?->canViewAllOpd() ?? false;

        abort_if(! $isAdmin && $baris->user_id !== auth()->id(), 403);
    }

    private function validasi(Request $request): array
    {
        return $request->validate([
            'opd_id' => ['nullable', 'exists:opd,id'],
            'tahun_penilaian' => ['required', 'integer', 'min:2000', 'max:2100'],
            'nomor_urut' => ['nullable', 'integer', 'min:1'],

            'kegiatan_dinilai' => ['nullable', 'string', 'max:255'],
            // Teks bebas, BUKAN pilihan tetap. Kertas kerja yang sungguhan
            // (Register Risiko Fraud Disdik 2026) memakai tahapan khas
            // kegiatannya: "Pendaftaran & Verifikasi Berkas", "Seleksi &
            // Penentuan Kelulusan" — bukan empat tahapan generik. Empat yang
            // generik tetap ditawarkan sebagai saran di formulir.
            'tahapan_proses' => ['nullable', 'string', 'max:255'],
            'nama_risiko' => ['required', 'string'],
            'skenario_risiko' => ['nullable', 'string'],
            'uraian_penyebab' => ['nullable', 'string'],
            'uraian_dampak' => ['nullable', 'string'],

            // Daftar, bukan teks bebas — lihat FraudRisiko::KELOMPOK_RISIKO.
            'kelompok_risiko' => ['nullable', 'array'],
            'kelompok_risiko.*' => [Rule::in(FraudRisiko::KELOMPOK_RISIKO)],

            'probabilitas_inheren' => ['nullable', 'integer', 'between:1,5'],
            'dampak_inheren' => ['nullable', 'integer', 'between:1,5'],
            'pengendalian_ada' => ['nullable', Rule::in(FraudRisiko::PENGENDALIAN_ADA)],
            'pengendalian_uraian' => ['nullable', 'string'],
            'pengendalian_memadai' => ['nullable', Rule::in(FraudRisiko::PENGENDALIAN_MEMADAI)],
            'probabilitas_residual' => ['nullable', 'integer', 'between:1,5'],
            'dampak_residual' => ['nullable', 'integer', 'between:1,5'],

            'pernyataan_penyebab' => ['nullable', 'string'],
            'rencana_mitigasi' => ['nullable', 'string'],
            'jadwal_mitigasi' => ['nullable', 'string'],
            'penanggung_jawab' => ['nullable', 'string'],
        ]);
    }
}
