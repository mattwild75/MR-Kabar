<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\GeneratesKodeRisiko;
use App\Http\Controllers\Concerns\SharesCetakContext;
use App\Models\CeeRtp;
use App\Models\CeeUnsur;
use App\Models\DataUmum;
use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\IrsPemda;
use App\Models\PengaturanPemda;
use App\Models\RiskLevel;
use App\Services\PdfPrintService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Form Cetak Risiko — 6 (Penilaian atas Kegiatan Pengendalian yang Ada dan
 * Masih Dibutuhkan/ RTP atas Kelemahan Lingkungan Pengendalian/RTP atas CEE)
 * & 7 (Penilaian atas Kegiatan Pengendalian yang Ada dan Masih Dibutuhkan/
 * RTP atas Hasil Identifikasi Risiko), sesuai Lampiran 5 Form 6 & Form 7
 * Perdep PPKD No.4/2019 — DUA JENIS RTP YANG BEDA SUMBER:
 * - Form 6: RTP atas kelemahan Lingkungan Pengendalian (CEE), dikelompokkan
 *   per 8 unsur SPIP, PER-OPD (beda dari Form 4/5/7 yg lintas-OPD).
 * - Form 7: RTP atas risiko PRIORITAS (Skala Risiko >= ambang "Tinggi/Sangat
 *   Tinggi", sama kriteria dgn Form 5 — sempat dihilangkan filternya lalu
 *   dikembalikan lagi krn dikoreksi ulang oleh user), sama pola lintas-OPD
 *   dgn Form 4/5 (lintas 3
 *   tingkat: Pemda/OPD Strategis/OPD Operasional), tapi kolomnya field RTP
 *   (Uraian Pengendalian/Celah/Rencana Tindak/Penanggung Jawab/Target
 *   Waktu) bukan field analisis risiko (Skala Dampak/Kemungkinan/dsb spt
 *   Form 5).
 */
class CetakRtpController extends Controller
{
    use GeneratesKodeRisiko;
    use SharesCetakContext;

    // pengaturan() & dataUmumForInertia() dipindah ke trait SharesCetakContext.

    /**
     * PIC biasa (punya opd_id) hanya boleh cetak/unduh Form 6 utk OPD
     * miliknya sendiri — sama pola dgn CetakRisikoController::
     * ensureOpdAccess() (Form 6 PER-OPD, beda dari Form 7 yg lintas-OPD
     * spt Form 4/5).
     */
    private function ensureOpdAccess(Request $request, ?int $opdId): void
    {
        $this->ensureOpdAccessWith($request, $opdId, 'Anda hanya dapat mengakses RTP CEE untuk OPD Anda sendiri.');
    }

    private function opdOptions(Request $request)
    {
        $user = $request->user();
        if ($user->opd_id && !$user->hasAnyRole(['admin', 'super-admin'])) {
            return \App\Models\Opd::where('id', $user->opd_id)->get(['id', 'nama']);
        }

        return \App\Models\Opd::orderBy('nama')->get(['id', 'nama']);
    }

    // ── Form 6: RTP atas CEE ─────────────────────────────────────────────

    /**
     * Kelompokkan entri cee_rtp per unsur (I-VIII sesuai urutan cee_unsur),
     * PERSIS pola Lampiran 5 Form 6 — hanya unsur yg PUNYA minimal 1 entri
     * RTP yg disertakan (unsur "Memadai" tanpa RTP tidak perlu tampil).
     */
    private function buildRtpCee(int $opdId, int $tahun): array
    {
        $entries = CeeRtp::where('opd_id', $opdId)
            ->where('tahun_penilaian', $tahun)
            ->with('unsur')
            ->get()
            ->groupBy('cee_unsur_id');

        return CeeUnsur::orderBy('urutan')->get()
            ->map(function ($unsur) use ($entries) {
                $rows = ($entries[$unsur->id] ?? collect())->values();
                if ($rows->isEmpty()) {
                    return null;
                }

                return [
                    'unsur_kode' => $unsur->kode,
                    'unsur_nama' => $unsur->nama,
                    'rows' => $rows->map(fn ($r) => [
                        'kondisi_kurang_memadai' => $r->kondisi_kurang_memadai,
                        'rencana_tindak_pengendalian' => $r->rencana_tindak_pengendalian,
                        'penanggung_jawab' => $r->penanggung_jawab,
                        'target' => $this->formatTriwulanTahun($r->triwulan_target, $r->tahun_target_penyelesaian),
                        'realisasi' => $this->formatTriwulanTahun($r->triwulan_realisasi, $r->tahun_realisasi_penyelesaian),
                    ])->values()->all(),
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    /**
     * "Triwulan I 2026" dari kolom TRIWULAN + TAHUN terpisah — null kalau
     * keduanya kosong. Kolom TRIWULAN idealnya cuma kode romawi ("I".."IV",
     * lihat IrsPdController::TRIWULAN_OPTIONS), TAPI sebagian data lama
     * (hasil sinkronisasi/import sebelum kolom ini distandarkan) tersimpan
     * sudah berupa "Triwulan I" penuh — strip prefix itu dulu (case-
     * insensitive) sebelum menambahkan "Triwulan " sendiri, supaya TIDAK
     * dobel jadi "Triwulan Triwulan I".
     */
    private function formatTriwulanTahun(?string $triwulan, ?int $tahun): ?string
    {
        if (!$triwulan && !$tahun) {
            return null;
        }

        $kode = $triwulan ? trim(preg_replace('/^triwulan\s*/i', '', $triwulan)) : null;
        $label = $kode ? "Triwulan {$kode}" : null;

        return trim(implode(' ', array_filter([$label, $tahun ? (string) $tahun : null])));
    }

    public function cetak6(Request $request)
    {
        $opdId = $request->integer('opd_id') ?: $request->user()->opd_id;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $opd = $opdId ? \App\Models\Opd::find($opdId) : null;
        $pengaturan = $this->pengaturan();
        $dataUmum = $opdId ? DataUmum::forOpdAndTahun($opdId, $tahun) : null;

        return Inertia::render('risiko/cetak/Cetak6', [
            'opdOptions' => $this->opdOptions($request),
            'opd' => $opd,
            'tahun' => $tahun,
            'periode' => $pengaturan->periode_penilaian,
            'unsurList' => $opd ? $this->buildRtpCee($opd->id, $tahun) : [],
            'pemerintahKabkota' => $pengaturan->pemerintah_kabkota ?: 'Pemerintah Kabupaten Aceh Barat',
            'dataUmum' => $this->dataUmumForInertia($dataUmum),
        ]);
    }

    public function pdf6(Request $request)
    {
        $opdId = $request->integer('opd_id') ?: $request->user()->opd_id;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $opd = $opdId ? \App\Models\Opd::findOrFail($opdId) : abort(404);

        $url = url("/cetak/risiko/6?opd_id={$opdId}&tahun={$tahun}");

        return PdfPrintService::downloadFromUrl($request, $url, "Form-6-RTP-atas-CEE-{$opd->nama}-{$tahun}");
    }

    // ── Form 7: RTP atas Hasil Identifikasi Risiko ──────────────────────

    /**
     * Satu baris Form 7 (kolom a-h) — proyeksi field RTP yg SUDAH ADA di
     * IrsPemda/IrsPd/IroPd (URAIAN PENGENDALIAN YANG SUDAH ADA/CELAH
     * PENGENDALIAN/RENCANA TINDAK PENGENDALIAN/PEMILIK / PENANGGUNGJAWAB/
     * TRIWULAN+TAHUN TARGET PENYELESAIAN) — TIDAK perlu form input baru,
     * beda dari Form 6 yg butuh Form 1d baru krn field RTP CEE memang belum
     * ada di DB manapun.
     */
    private function rtpRow($row, string $prefix, ?string $opdNama, ?string $nomorUrut): array
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
            'skala_risiko' => $row->{'SKALA RISIKO'},
            'uraian_pengendalian' => $row->{'URAIAN PENGENDALIAN YANG SUDAH ADA'},
            'kategori_existing_control' => $row->{'KATEGORI EXISTING CONTROL'},
            'celah_pengendalian' => $row->{'CELAH PENGENDALIAN'},
            'rencana_tindak_pengendalian' => $row->{'RENCANA TINDAK PENGENDALIAN'},
            // Kolom "Pemilik/Penanggung Jawab" Form 7 — field lama
            // 'PEMILIK / PENANGGUNGJAWAB' SUDAH TIDAK ADA di DB (di-rename
            // lalu dipecah jadi 2 kolom, lihat migration
            // 2026_07_10_232022 & 2026_07_10_234525): sekarang
            // 'PENANGGUNG JAWAB PENGENDALIAN' (jabatan/pejabat spesifik yg
            // berwenang membangun kontrol, teks bebas) TERPISAH dari
            // 'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' (nama OPD/unit
            // pelaksana). Form 7 pakai yg pertama (jabatan spesifik),
            // sesuai literal user: "Pemilik/Penanggungjawab dalam Form RTP
            // atas Risiko adalah isian Penanggungjawab Pengendalian dalam
            // isian IRS IRO".
            'penanggung_jawab' => $row->{'PENANGGUNG JAWAB PENGENDALIAN'},
            'target' => $this->formatTriwulanTahun($row->{'TRIWULAN'}, $row->{'TAHUN TARGET PENYELESAIAN'}),
        ];
    }

    /**
     * Ambang skala risiko "Tinggi/Sangat Tinggi" dari tabel risk_levels
     * (dinamis, bukan hardcode) — sama pola dgn
     * CetakHasilAnalisisController::filterPrioritas() utk Form 5, krn Form 7
     * ("Risiko Prioritas") ternyata JUGA cuma mencakup risiko prioritas
     * (Tinggi/Sangat Tinggi), BUKAN keseluruhan risiko teridentifikasi —
     * koreksi user membalikkan asumsi sebelumnya di kode ini.
     */
    private function ambangPrioritas(): ?int
    {
        return RiskLevel::whereIn('label', ['Tinggi', 'Sangat Tinggi'])->min('skala_min');
    }

    /**
     * Kumpulkan risiko PRIORITAS (Skala Risiko >= ambang "Tinggi/Sangat
     * Tinggi") dari ketiga tingkat, dgn field RTP-nya — sama kriteria dgn
     * Form 5, krn kolom "Risiko Prioritas" pada Lampiran 5 Form 7 memang
     * berarti risiko yg sudah masuk kategori prioritas utk ditangani, bukan
     * seluruh risiko teridentifikasi. $opdId kalau diisi (PIC biasa) SEMUA
     * section difilter by ownership — pola IDENTIK dgn
     * CetakHasilAnalisisController::buildAnalisisRisiko(), termasuk
     * Section I (Risiko Strategis Pemda) yg tetap py kepemilikan per-OPD
     * lewat user_id->User.opd_id.
     */
    private function buildRtpRisiko(int $tahun, ?int $opdId = null): array
    {
        $ambangTinggi = $this->ambangPrioritas();
        $namaPemda = $this->pengaturan()->pemerintah_kabkota ?: 'Pemerintah Kabupaten Aceh Barat';

        $strategisPemda = IrsPemda::whereHas('user')
            ->where('TAHUN DINILAI RISIKO', (string) $tahun)
            ->with('user.opd')
            ->orderBy('id')
            ->get()
            ->filter(fn ($r) => trim((string) $r->{'URAIAN RISIKO'}) !== '');
        $nomorPemda = $this->nomorUrutFor($strategisPemda);

        $sectionI = $strategisPemda
            ->filter(fn ($r) => !$opdId || $r->user?->opd_id === $opdId)
            ->filter(fn ($r) => $ambangTinggi !== null && (int) $r->{'SKALA RISIKO'} >= $ambangTinggi)
            ->map(fn ($r) => $this->rtpRow($r, 'RSP', $namaPemda, $nomorPemda[$r->id] ?? null))
            ->sortByDesc('skala_risiko')
            ->values();

        $strategisOpd = IrsPd::whereHas('user')
            ->where('TAHUN DINILAI RISIKO', (string) $tahun)
            ->with('user.opd')
            ->orderBy('id')
            ->get()
            ->filter(fn ($r) => trim((string) $r->{'URAIAN RISIKO'}) !== '');
        $nomorOpdStrategis = $this->nomorUrutFor($strategisOpd);

        $sectionII = $strategisOpd
            ->filter(fn ($r) => !$opdId || $r->user?->opd_id === $opdId)
            ->filter(fn ($r) => $ambangTinggi !== null && (int) $r->{'SKALA RISIKO'} >= $ambangTinggi)
            ->map(fn ($r) => $this->rtpRow($r, 'RSO', $r->user?->opd?->nama, $nomorOpdStrategis[$r->id] ?? null))
            ->sortByDesc('skala_risiko')
            ->values();

        $operasionalOpd = IroPd::whereHas('user')
            ->where('TAHUN DINILAI RISIKO', (string) $tahun)
            ->with('user.opd')
            ->orderBy('id')
            ->get()
            ->filter(fn ($r) => trim((string) $r->{'URAIAN RISIKO'}) !== '');
        $nomorOpdOperasional = $this->nomorUrutFor($operasionalOpd);

        $sectionIII = $operasionalOpd
            ->filter(fn ($r) => !$opdId || $r->user?->opd_id === $opdId)
            ->filter(fn ($r) => $ambangTinggi !== null && (int) $r->{'SKALA RISIKO'} >= $ambangTinggi)
            ->map(fn ($r) => $this->rtpRow($r, 'ROO', $r->user?->opd?->nama, $nomorOpdOperasional[$r->id] ?? null))
            ->sortByDesc('skala_risiko')
            ->values();

        return [
            'strategis_pemda' => $sectionI,
            'strategis_opd' => $sectionII,
            'operasional_opd' => $sectionIII,
        ];
    }

    /** Sama pola dgn CetakHasilAnalisisController::scopedOpdId(). */
    private function scopedOpdId(Request $request): ?int
    {
        $user = $request->user();
        if ($user->hasAnyRole(['admin', 'super-admin'])) {
            return null;
        }

        return $user->opd_id;
    }

    public function cetak7(Request $request)
    {
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $pengaturan = $this->pengaturan();
        $opdId = $this->scopedOpdId($request);
        // Admin/Super Admin (scopedOpdId() null) BOLEH mempersempit lintas-OPD
        // ke 1 OPD via query opd_id — opsional, default (opd_id kosong) tetap
        // seluruh OPD spt semula. PIC biasa TIDAK terpengaruh (opd_id akunnya
        // sendiri, tidak bisa dioverride oleh query param).
        $isAdmin = $opdId === null;
        if ($isAdmin && $request->filled('opd_id')) {
            $opdId = $request->integer('opd_id');
        }
        // Data Umum HARUS ikut discope $opdId — PIC biasa (di-scope 1 OPD)
        // wajib mendapat Data Umum OPD-nya sendiri (utk penandatangan Kepala
        // Dinas & penandatangan[] yg benar), BUKAN selalu Pemda-wide (bug
        // lama: PIC bisa melihat Kepala Dinas OPD LAIN krn forOpdAndTahun(null)
        // selalu dipanggil apa pun nilai $opdId).
        $dataUmum = DataUmum::forOpdAndTahun($opdId, $tahun);

        return Inertia::render('risiko/cetak/Cetak7', [
            'tahun' => $tahun,
            'periode' => $pengaturan->periode_penilaian,
            'sections' => $this->buildRtpRisiko($tahun, $opdId),
            'isScopedToOwnOpd' => $opdId !== null,
            'isAdmin' => $isAdmin,
            'opdOptions' => $isAdmin ? $this->opdOptions($request) : [],
            'opdId' => $isAdmin ? $opdId : null,
            'pemerintahKabkota' => $pengaturan->pemerintah_kabkota ?: 'Pemerintah Kabupaten Aceh Barat',
            'dataUmum' => $this->dataUmumForInertia($dataUmum),
        ]);
    }

    public function pdf7(Request $request)
    {
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;
        $opdId = $this->scopedOpdId($request) === null && $request->filled('opd_id') ? $request->integer('opd_id') : null;
        $url = url("/cetak/risiko/7?tahun={$tahun}" . ($opdId ? "&opd_id={$opdId}" : ''));

        return PdfPrintService::downloadFromUrl($request, $url, "Form-7-RTP-Hasil-Identifikasi-Risiko-{$tahun}");
    }
}
