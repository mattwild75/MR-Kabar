<?php

namespace App\Http\Controllers;

use App\Models\CeeRtp;
use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\IrsPemda;
use App\Models\LaporanKejadianRisiko;
use App\Models\MonitoringRtp;
use App\Models\Opd;
use App\Models\PencatatanKejadianRisiko;
use App\Models\PengaturanPemda;
use App\Services\RiskReferenceDataService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * Form Input "Monitoring dan Evaluasi" — Lampiran 5 Form 8, 9 & 10 Perdep
 * PPKD No.4/2019, menu BARU di antara "Form Input" dan "Form Cetak" (dari
 * Tahap 4 & 5 Bab III: Informasi & Komunikasi, dan Pemantauan).
 *
 * - Form 8 & 9: berbagi basis data SAMA (satu baris RTP = satu baris di
 *   kedua form sekaligus, lihat MonitoringRtp) — RTP sumbernya proyeksi
 *   LIVE dari 4 tempat: IrsPemda/IrsPd/IroPd ('RENCANA TINDAK
 *   PENGENDALIAN', RTP atas risiko) & CeeRtp ('rencana_tindak_pengendalian',
 *   RTP atas CEE/Form 1d). Form 8 = Rencana & Realisasi Pengkomunikasian,
 *   Form 9 = Rencana & Realisasi Pemantauan.
 * - Form 10: Pencatatan Kejadian Risiko & Pelaksanaan RTP — basisnya
 *   RISIKO (bukan RTP), proyeksi LIVE dari IrsPemda/IrsPd/IroPd. BEDA dari
 *   fitur "Lapor Kejadian Risiko" (laporan insiden publik via QR) — ini
 *   kertas kerja resmi UPR, per-OPD, wajib pilih OPD sama seperti CEE.
 */
class MonitoringEvaluasiController extends Controller
{
    public const TRIWULAN_OPTIONS = ['I', 'II', 'III', 'IV'];

    public const TRIWULAN_LABELS = [
        'I' => 'Triwulan I (Januari/Februari/Maret)',
        'II' => 'Triwulan II (April/Mei/Juni)',
        'III' => 'Triwulan III (Juli/Agustus/September)',
        'IV' => 'Triwulan IV (Oktober/November/Desember)',
    ];

    public function __construct(private RiskReferenceDataService $riskRef)
    {
    }

    private function opdOptions(Request $request)
    {
        $user = $request->user();
        if ($user->opd_id && !$user->hasAnyRole(['admin', 'super-admin'])) {
            return Opd::where('id', $user->opd_id)->get(['id', 'nama']);
        }

        return Opd::orderBy('nama')->get(['id', 'nama']);
    }

    /**
     * PIC biasa (punya opd_id) hanya boleh akses Monitoring & Evaluasi OPD
     * miliknya sendiri — sama pola dgn CeeFormController::ensureOpdAccess().
     */
    private function ensureOpdAccess(Request $request, ?int $opdId): void
    {
        $user = $request->user();
        if (!$opdId || !$user->opd_id || $user->hasAnyRole(['admin', 'super-admin'])) {
            return;
        }

        if ($opdId !== $user->opd_id) {
            abort(403, 'Anda hanya dapat mengakses Monitoring & Evaluasi untuk OPD Anda sendiri.');
        }
    }

    /** Peta tipe RTP/risiko polimorfik ke kelas model sumbernya. */
    private const RISK_MODELS = [
        'irs_pemda' => IrsPemda::class,
        'irs_pd' => IrsPd::class,
        'iro_pd' => IroPd::class,
        'cee_rtp' => CeeRtp::class,
    ];

    /**
     * Cegah IDOR: pastikan baris risiko/RTP yg dirujuk (tipe+id) benar2
     * MILIK opd_id yg dikirim di request — validasi 'exists' saja tidak
     * mengecek keterkaitan sumber<->opd, jadi PIC bisa menyisipkan id risiko
     * OPD lain di bawah opd_id-nya sendiri. Sama semangat dgn
     * RiskEvidenceController::findRowOrFail(). CeeRtp py opd_id langsung;
     * IRS/IRO py kepemilikan lewat user->opd_id.
     */
    private function ensureSumberBelongsToOpd(string $tipe, int $id, int $opdId): void
    {
        $modelClass = self::RISK_MODELS[$tipe] ?? null;
        if ($modelClass === null) {
            abort(404, 'Jenis data tidak dikenal.');
        }

        if ($modelClass === CeeRtp::class) {
            $ownerOpdId = CeeRtp::whereKey($id)->value('opd_id');
        } else {
            $row = $modelClass::with('user')->find($id);
            $ownerOpdId = $row?->user?->opd_id;
        }

        if ($ownerOpdId === null || (int) $ownerOpdId !== $opdId) {
            abort(403, 'Data yang dirujuk bukan milik OPD tersebut.');
        }
    }

    /**
     * Kumpulkan seluruh RTP milik satu OPD+tahun dari 4 sumber sekaligus,
     * digabung jadi satu daftar dgn label "Kegiatan Pengendalian yang
     * Dibutuhkan" (kolom b Form 8/9) yg diproyeksi live dari tiap sumber —
     * dipasangkan dgn baris MonitoringRtp yg sudah ada (kalau ada).
     */
    private function rtpGabungan(int $opdId, int $tahun): array
    {
        $daftar = [];

        $irsPemda = IrsPemda::whereHas('user', fn ($q) => $q->where('opd_id', $opdId))
            ->where('TAHUN DINILAI RISIKO', (string) $tahun)
            ->whereNotNull('RENCANA TINDAK PENGENDALIAN')
            ->where('RENCANA TINDAK PENGENDALIAN', '!=', '')
            ->orderBy('id')
            ->get();
        foreach ($irsPemda as $r) {
            $daftar[] = [
                'tipe' => 'irs_pemda',
                'id' => $r->id,
                'label' => $r->{'RENCANA TINDAK PENGENDALIAN'},
                'konteks' => 'Risiko Strategis Pemda: ' . $r->{'URAIAN RISIKO'},
                'skala_dampak' => $r->{'SKALA DAMPAK'},
                'skala_kemungkinan' => $r->{'SKALA KEMUNGKINAN'},
                'skala_dampak_inheren' => $r->{'SKALA DAMPAK INHEREN'},
                'skala_kemungkinan_inheren' => $r->{'SKALA KEMUNGKINAN INHEREN'},
                'skala_dampak_target' => $r->{'SKALA DAMPAK TARGET'},
                'skala_kemungkinan_target' => $r->{'SKALA KEMUNGKINAN TARGET'},
            ];
        }

        $irsPd = IrsPd::whereHas('user', fn ($q) => $q->where('opd_id', $opdId))
            ->where('TAHUN DINILAI RISIKO', (string) $tahun)
            ->whereNotNull('RENCANA TINDAK PENGENDALIAN')
            ->where('RENCANA TINDAK PENGENDALIAN', '!=', '')
            ->orderBy('id')
            ->get();
        foreach ($irsPd as $r) {
            $daftar[] = [
                'tipe' => 'irs_pd',
                'id' => $r->id,
                'label' => $r->{'RENCANA TINDAK PENGENDALIAN'},
                'konteks' => 'Risiko Strategis OPD: ' . $r->{'URAIAN RISIKO'},
                'skala_dampak' => $r->{'SKALA DAMPAK'},
                'skala_kemungkinan' => $r->{'SKALA KEMUNGKINAN'},
                'skala_dampak_inheren' => $r->{'SKALA DAMPAK INHEREN'},
                'skala_kemungkinan_inheren' => $r->{'SKALA KEMUNGKINAN INHEREN'},
                'skala_dampak_target' => $r->{'SKALA DAMPAK TARGET'},
                'skala_kemungkinan_target' => $r->{'SKALA KEMUNGKINAN TARGET'},
            ];
        }

        $iroPd = IroPd::whereHas('user', fn ($q) => $q->where('opd_id', $opdId))
            ->where('TAHUN DINILAI RISIKO', (string) $tahun)
            ->whereNotNull('RENCANA TINDAK PENGENDALIAN')
            ->where('RENCANA TINDAK PENGENDALIAN', '!=', '')
            ->orderBy('id')
            ->get();
        foreach ($iroPd as $r) {
            $daftar[] = [
                'tipe' => 'iro_pd',
                'id' => $r->id,
                'label' => $r->{'RENCANA TINDAK PENGENDALIAN'},
                'konteks' => 'Risiko Operasional OPD: ' . $r->{'URAIAN RISIKO'},
                'skala_dampak' => $r->{'SKALA DAMPAK'},
                'skala_kemungkinan' => $r->{'SKALA KEMUNGKINAN'},
                'skala_dampak_inheren' => $r->{'SKALA DAMPAK INHEREN'},
                'skala_kemungkinan_inheren' => $r->{'SKALA KEMUNGKINAN INHEREN'},
                'skala_dampak_target' => $r->{'SKALA DAMPAK TARGET'},
                'skala_kemungkinan_target' => $r->{'SKALA KEMUNGKINAN TARGET'},
            ];
        }

        $ceeRtp = CeeRtp::with('unsur')
            ->where('opd_id', $opdId)
            ->where('tahun_penilaian', $tahun)
            ->whereNotNull('rencana_tindak_pengendalian')
            ->where('rencana_tindak_pengendalian', '!=', '')
            ->orderBy('id')
            ->get();
        foreach ($ceeRtp as $r) {
            $daftar[] = [
                'tipe' => 'cee_rtp',
                'id' => $r->id,
                'label' => $r->rencana_tindak_pengendalian,
                'konteks' => 'RTP atas CEE (' . ($r->unsur?->kode ?? '-') . '. ' . ($r->unsur?->nama ?? '-') . '): ' . $r->kondisi_kurang_memadai,
                // CEE tidak punya skala risiko (bukan penilaian risiko) —
                // Skala Aktual di Form 9 tidak relevan utk sumber ini.
                'skala_dampak' => null,
                'skala_kemungkinan' => null,
                'skala_dampak_inheren' => null,
                'skala_kemungkinan_inheren' => null,
                'skala_dampak_target' => null,
                'skala_kemungkinan_target' => null,
            ];
        }

        return $daftar;
    }

    public function form89(Request $request)
    {
        $opdId = $request->integer('opd_id') ?: $request->user()->opd_id;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;

        $rtpGabungan = $opdId ? $this->rtpGabungan($opdId, $tahun) : [];

        $existing = $opdId
            ? MonitoringRtp::where('opd_id', $opdId)->where('tahun_penilaian', $tahun)->get()
                ->keyBy(fn ($m) => $m->rtp_sumber_tipe . ':' . $m->rtp_sumber_id)
            : collect();

        $rows = collect($rtpGabungan)->map(function ($rtp) use ($existing) {
            $key = $rtp['tipe'] . ':' . $rtp['id'];
            $monitoring = $existing->get($key);

            return [
                'rtp_sumber_tipe' => $rtp['tipe'],
                'rtp_sumber_id' => $rtp['id'],
                'label' => $rtp['label'],
                'konteks' => $rtp['konteks'],
                'monitoring_id' => $monitoring?->id,
                'media_komunikasi' => $monitoring?->media_komunikasi,
                'penyedia_informasi' => $monitoring?->penyedia_informasi,
                'penerima_informasi' => $monitoring?->penerima_informasi,
                'triwulan_rencana_komunikasi' => $monitoring?->triwulan_rencana_komunikasi,
                'tahun_rencana_komunikasi' => $monitoring?->tahun_rencana_komunikasi,
                'realisasi_waktu_komunikasi' => $monitoring?->realisasi_waktu_komunikasi,
                'keterangan_komunikasi' => $monitoring?->keterangan_komunikasi,
                'metode_pemantauan' => $monitoring?->metode_pemantauan,
                'penanggung_jawab_pemantauan' => $monitoring?->penanggung_jawab_pemantauan,
                'triwulan_rencana_pemantauan' => $monitoring?->triwulan_rencana_pemantauan,
                'tahun_rencana_pemantauan' => $monitoring?->tahun_rencana_pemantauan,
                'realisasi_waktu_pemantauan' => $monitoring?->realisasi_waktu_pemantauan,
                'keterangan_pemantauan' => $monitoring?->keterangan_pemantauan,
                // Basis hitung Skala Aktual — arah reduksi (K/D) ditentukan
                // dari kategori RESPON RISIKO pada `label` (RENCANA TINDAK
                // PENGENDALIAN, sudah ada di atas). D default = Dampak
                // Residual, K default = K Inheren, null utk sumber cee_rtp
                // (tidak py skala risiko sama sekali). Inheren/Residual/
                // Target diteruskan APA ADANYA (read-only) utk dipakai
                // matriks "Isi Nilai Risiko Aktual" — hanya titik Aktual yg
                // bisa diedit di sana, 3 lainnya sekadar tampil sbg konteks.
                'skala_dampak' => $rtp['skala_dampak'],
                'skala_kemungkinan' => $rtp['skala_kemungkinan'],
                'skala_dampak_inheren' => $rtp['skala_dampak_inheren'],
                'skala_kemungkinan_inheren' => $rtp['skala_kemungkinan_inheren'],
                'skala_dampak_target' => $rtp['skala_dampak_target'],
                'skala_kemungkinan_target' => $rtp['skala_kemungkinan_target'],
                'kategori_existing_control_aktual' => $monitoring?->kategori_existing_control_aktual,
                'skala_dampak_aktual' => $monitoring?->skala_dampak_aktual,
                'skala_kemungkinan_aktual' => $monitoring?->skala_kemungkinan_aktual,
                'skala_risiko_aktual' => $monitoring?->skala_risiko_aktual,
            ];
        })->values()->all();

        return Inertia::render('monitoring-evaluasi/Form89', [
            'opdOptions' => $this->opdOptions($request),
            'opdId' => $opdId,
            'tahun' => $tahun,
            'triwulanOptions' => self::TRIWULAN_OPTIONS,
            'triwulanLabels' => self::TRIWULAN_LABELS,
            'rows' => $rows,
            // Dipakai dialog "Isi Nilai Risiko Aktual" (matriks 5x5) — sama
            // data referensi dgn IRS/IRO, cukup ambil bagian matriksRisiko.
            'riskReference' => ['matriksRisiko' => $this->riskRef->referenceDialogPayload()['matriksRisiko']],
        ]);
    }

    private function monitoringValidationRules(): array
    {
        return [
            'rtp_sumber_tipe' => ['required', Rule::in(['irs_pemda', 'irs_pd', 'iro_pd', 'cee_rtp'])],
            'rtp_sumber_id' => ['required', 'integer'],
            'opd_id' => ['required', 'exists:opd,id'],
            'tahun' => ['required', 'integer', 'min:2000', 'max:2100'],
            'media_komunikasi' => ['nullable', 'string', 'max:255'],
            'penyedia_informasi' => ['nullable', 'string', 'max:255'],
            'penerima_informasi' => ['nullable', 'string', 'max:255'],
            'triwulan_rencana_komunikasi' => ['nullable', Rule::in(self::TRIWULAN_OPTIONS)],
            'tahun_rencana_komunikasi' => ['nullable', 'integer', 'digits:4'],
            'realisasi_waktu_komunikasi' => ['nullable', 'string', 'max:255'],
            'keterangan_komunikasi' => ['nullable', 'string'],
            'metode_pemantauan' => ['nullable', 'string', 'max:255'],
            'penanggung_jawab_pemantauan' => ['nullable', 'string', 'max:255'],
            'triwulan_rencana_pemantauan' => ['nullable', Rule::in(self::TRIWULAN_OPTIONS)],
            'tahun_rencana_pemantauan' => ['nullable', 'integer', 'digits:4'],
            'realisasi_waktu_pemantauan' => ['nullable', 'string', 'max:255'],
            'keterangan_pemantauan' => ['nullable', 'string'],
            // Skala Aktual (hasil re-assessment risiko saat monitoring) —
            // dipindah dari form input IRS/IRO ke sini krn levelnya per-RTP,
            // bukan per-risiko. Kategori tersimpan format CategorizedTextarea
            // "KODE (uraian)", kode-nya diekstrak & skala dihitung di
            // storeOrUpdate89() (sama pola dgn RiskReferenceDataService).
            'kategori_existing_control_aktual' => ['nullable', 'string'],
            'skala_dampak_aktual' => ['nullable', 'integer', 'min:1', 'max:5'],
            'skala_kemungkinan_aktual' => ['nullable', 'integer', 'min:1', 'max:5'],
        ];
    }

    /**
     * updateOrCreate berdasarkan (rtp_sumber_tipe, rtp_sumber_id) — satu RTP
     * sumber cuma py SATU baris monitoring, disimpan/diedit lewat endpoint
     * yg sama (bukan create lalu edit terpisah spt Form 1d).
     */
    /**
     * Skala D/K Inheren + Dampak Residual dari RTP sumber (irs_pemda/
     * irs_pd/iro_pd) — basis hitung Skala Aktual, sama pola persis dgn
     * hitungKemungkinanTerkendali() di RiskReferenceDataService (K basis =
     * Inheren, D basis = Residual/current). cee_rtp tidak py skala risiko
     * sama sekali -> null (Skala Aktual tidak berlaku utk sumber ini).
     */
    private function skalaBasisDariSumber(string $tipe, int $id): array
    {
        $modelClass = self::RISK_MODELS[$tipe] ?? null;
        if ($modelClass === null || $modelClass === CeeRtp::class) {
            return ['dampak' => null, 'dampak_inheren' => null, 'kemungkinan_inheren' => null, 'rtp' => null];
        }

        $row = $modelClass::find($id);

        return [
            'dampak' => $row?->{'SKALA DAMPAK'},
            'dampak_inheren' => $row?->{'SKALA DAMPAK INHEREN'},
            'kemungkinan_inheren' => $row?->{'SKALA KEMUNGKINAN INHEREN'},
            'rtp' => $row?->{'RENCANA TINDAK PENGENDALIAN'},
        ];
    }

    public function storeOrUpdate89(Request $request)
    {
        $data = $request->validate($this->monitoringValidationRules());

        $this->ensureOpdAccess($request, (int) $data['opd_id']);
        $this->ensureSumberBelongsToOpd($data['rtp_sumber_tipe'], (int) $data['rtp_sumber_id'], (int) $data['opd_id']);

        // Hitung Skala Risiko Aktual dari kategori (jika diisi) — arah
        // reduksi (K, D, atau keduanya) ditentukan dari RESPON RISIKO pada
        // RTP sumber (Avoid/Abate -> K, Mitigate/Share-Transfer -> D),
        // sesuai prinsip COSO ERM (kontrol preventif vs mitigatif/
        // pengalihan) — sama logika dgn Skala Target di
        // RiskReferenceDataService::hitungSemuaSkala(). Sumbu yg tidak
        // ditekan: K fallback ke K Inheren, D fallback ke D Residual
        // (bukan D Inheren, supaya Aktual tidak tampak lebih buruk dari
        // kondisi sekarang kalau D Inheren jauh lebih tinggi).
        $kategoriAktual = $this->riskRef->ekstrakKategoriKontrol($data['kategori_existing_control_aktual'] ?? null);
        $skalaRisikoAktual = null;
        $dampakAktual = $data['skala_dampak_aktual'] ?? null;
        $kemungkinanAktual = $data['skala_kemungkinan_aktual'] ?? null;

        if ($kategoriAktual !== null || $dampakAktual || $kemungkinanAktual) {
            $basis = $this->skalaBasisDariSumber($data['rtp_sumber_tipe'], (int) $data['rtp_sumber_id']);
            $arah = $this->riskRef->arahReduksiRtp($basis['rtp']);

            $dampakAktual = $dampakAktual ?: (
                $kategoriAktual !== null && $arah['dampak']
                    ? ($this->riskRef->hitungDampakTerkendali($basis['dampak_inheren'], $kategoriAktual) ?? $basis['dampak'])
                    : $basis['dampak']
            );
            $kemungkinanAktual = $kemungkinanAktual ?: (
                $kategoriAktual !== null && $arah['kemungkinan']
                    ? ($this->riskRef->hitungKemungkinanTerkendali($basis['kemungkinan_inheren'], $kategoriAktual) ?? $basis['kemungkinan_inheren'])
                    : $basis['kemungkinan_inheren']
            );
            $skalaRisikoAktual = $this->riskRef->hitungSkala($dampakAktual ?: null, $kemungkinanAktual ?: null)['skala_risiko'];
        }

        // withTrashed()->firstOrNew() (bukan updateOrCreate biasa) — baris
        // Monitoring bisa sudah soft-deleted mengikuti RTP sumbernya yang
        // sempat dihapus lalu di-restore (lihat CascadeSoftDeletesToMonitoring).
        // updateOrCreate() query default MENGECUALIKAN trashed, jadi akan
        // membuat baris DUPLIKAT (rtp_sumber_tipe, rtp_sumber_id) yang sama
        // alih-alih menemukan & memulihkan baris lama.
        $monitoring = MonitoringRtp::withTrashed()->firstOrNew([
            'rtp_sumber_tipe' => $data['rtp_sumber_tipe'],
            'rtp_sumber_id' => $data['rtp_sumber_id'],
        ]);
        if ($monitoring->trashed()) {
            $monitoring->restore();
        }
        $monitoring->fill([
            'opd_id' => $data['opd_id'],
            'tahun_penilaian' => $data['tahun'],
            'media_komunikasi' => $data['media_komunikasi'] ?? null,
            'penyedia_informasi' => $data['penyedia_informasi'] ?? null,
            'penerima_informasi' => $data['penerima_informasi'] ?? null,
            'triwulan_rencana_komunikasi' => $data['triwulan_rencana_komunikasi'] ?? null,
            'tahun_rencana_komunikasi' => $data['tahun_rencana_komunikasi'] ?? null,
            'realisasi_waktu_komunikasi' => $data['realisasi_waktu_komunikasi'] ?? null,
            'keterangan_komunikasi' => $data['keterangan_komunikasi'] ?? null,
            'metode_pemantauan' => $data['metode_pemantauan'] ?? null,
            'penanggung_jawab_pemantauan' => $data['penanggung_jawab_pemantauan'] ?? null,
            'triwulan_rencana_pemantauan' => $data['triwulan_rencana_pemantauan'] ?? null,
            'tahun_rencana_pemantauan' => $data['tahun_rencana_pemantauan'] ?? null,
            'realisasi_waktu_pemantauan' => $data['realisasi_waktu_pemantauan'] ?? null,
            'keterangan_pemantauan' => $data['keterangan_pemantauan'] ?? null,
            'kategori_existing_control_aktual' => $data['kategori_existing_control_aktual'] ?? null,
            'skala_dampak_aktual' => $dampakAktual ?: null,
            'skala_kemungkinan_aktual' => $kemungkinanAktual ?: null,
            'skala_risiko_aktual' => $skalaRisikoAktual,
            'submitted_by' => $request->user()->id,
        ])->save();

        return back()->with('success', 'Monitoring RTP berhasil disimpan.');
    }

    // ── Form 10: Pencatatan Kejadian Risiko & Pelaksanaan RTP ────────────

    private function risikoGabungan(int $opdId, int $tahun): array
    {
        $daftar = [];

        $irsPemda = IrsPemda::whereHas('user', fn ($q) => $q->where('opd_id', $opdId))
            ->where('TAHUN DINILAI RISIKO', (string) $tahun)
            ->where('URAIAN RISIKO', '!=', '')
            ->whereNotNull('URAIAN RISIKO')
            ->orderBy('id')
            ->get();
        foreach ($irsPemda as $r) {
            $daftar[] = [
                'tipe' => 'irs_pemda',
                'id' => $r->id,
                'label' => $r->{'URAIAN RISIKO'},
                'konteks' => 'Risiko Strategis Pemda',
            ];
        }

        $irsPd = IrsPd::whereHas('user', fn ($q) => $q->where('opd_id', $opdId))
            ->where('TAHUN DINILAI RISIKO', (string) $tahun)
            ->where('URAIAN RISIKO', '!=', '')
            ->whereNotNull('URAIAN RISIKO')
            ->orderBy('id')
            ->get();
        foreach ($irsPd as $r) {
            $daftar[] = [
                'tipe' => 'irs_pd',
                'id' => $r->id,
                'label' => $r->{'URAIAN RISIKO'},
                'konteks' => 'Risiko Strategis OPD',
            ];
        }

        $iroPd = IroPd::whereHas('user', fn ($q) => $q->where('opd_id', $opdId))
            ->where('TAHUN DINILAI RISIKO', (string) $tahun)
            ->where('URAIAN RISIKO', '!=', '')
            ->whereNotNull('URAIAN RISIKO')
            ->orderBy('id')
            ->get();
        foreach ($iroPd as $r) {
            $daftar[] = [
                'tipe' => 'iro_pd',
                'id' => $r->id,
                'label' => $r->{'URAIAN RISIKO'},
                'konteks' => 'Risiko Operasional OPD',
            ];
        }

        return $daftar;
    }

    public function form10(Request $request)
    {
        $opdId = $request->integer('opd_id') ?: $request->user()->opd_id;
        $this->ensureOpdAccess($request, $opdId);
        $tahun = $request->integer('tahun') ?: (int) PengaturanPemda::current()->tahun_penilaian;

        $risikoGabungan = $opdId ? $this->risikoGabungan($opdId, $tahun) : [];

        $existing = $opdId
            ? PencatatanKejadianRisiko::where('opd_id', $opdId)->where('tahun_penilaian', $tahun)->get()
                ->keyBy(fn ($p) => $p->risiko_tipe . ':' . $p->risiko_id)
            : collect();

        $rows = collect($risikoGabungan)->map(function ($risiko) use ($existing) {
            $key = $risiko['tipe'] . ':' . $risiko['id'];
            $pencatatan = $existing->get($key);

            return [
                'risiko_tipe' => $risiko['tipe'],
                'risiko_id' => $risiko['id'],
                'label' => $risiko['label'],
                'konteks' => $risiko['konteks'],
                'pencatatan_id' => $pencatatan?->id,
                'laporan_kejadian_id' => $pencatatan?->laporan_kejadian_id,
                'tanggal_terjadi' => $pencatatan?->tanggal_terjadi?->format('Y-m-d'),
                'sebab_saat_kejadian' => $pencatatan?->sebab_saat_kejadian,
                'dampak_saat_kejadian' => $pencatatan?->dampak_saat_kejadian,
                'keterangan_kejadian' => $pencatatan?->keterangan_kejadian,
                'triwulan_rencana_rtp' => $pencatatan?->triwulan_rencana_rtp,
                'tahun_rencana_rtp' => $pencatatan?->tahun_rencana_rtp,
                'realisasi_pelaksanaan_rtp' => $pencatatan?->realisasi_pelaksanaan_rtp,
                'keterangan_rtp' => $pencatatan?->keterangan_rtp,
            ];
        })->values()->all();

        return Inertia::render('monitoring-evaluasi/Form10', [
            'opdOptions' => $this->opdOptions($request),
            'opdId' => $opdId,
            'tahun' => $tahun,
            'triwulanOptions' => self::TRIWULAN_OPTIONS,
            'triwulanLabels' => self::TRIWULAN_LABELS,
            'rows' => $rows,
            // Prefill dari tombol "Catat ke Form 10" (halaman Rekap Lapor
            // Kejadian) — murni informasi UI (auto-scroll/expand/isi kartu
            // terkait), request simpan tetap lewat storeOrUpdate10() biasa.
            // null kalau halaman dibuka langsung (bukan dari tombol itu).
            'prefill' => $request->filled('prefill_risiko_tipe') ? [
                'risiko_tipe' => $request->string('prefill_risiko_tipe')->toString(),
                'risiko_id' => $request->integer('prefill_risiko_id'),
                'tanggal_terjadi' => $request->string('prefill_tanggal_terjadi')->toString() ?: null,
                'sebab' => $request->string('prefill_sebab')->toString() ?: null,
                'dampak' => $request->string('prefill_dampak')->toString() ?: null,
                'laporan_kejadian_id' => $request->integer('prefill_laporan_kejadian_id') ?: null,
            ] : null,
        ]);
    }

    private function pencatatanValidationRules(): array
    {
        return [
            'risiko_tipe' => ['required', Rule::in(['irs_pemda', 'irs_pd', 'iro_pd'])],
            'risiko_id' => ['required', 'integer'],
            'opd_id' => ['required', 'exists:opd,id'],
            'tahun' => ['required', 'integer', 'min:2000', 'max:2100'],
            'laporan_kejadian_id' => ['nullable', 'exists:laporan_kejadian_risiko,id'],
            'tanggal_terjadi' => ['nullable', 'date'],
            'sebab_saat_kejadian' => ['nullable', 'string'],
            'dampak_saat_kejadian' => ['nullable', 'string'],
            'keterangan_kejadian' => ['nullable', 'string'],
            'triwulan_rencana_rtp' => ['nullable', Rule::in(self::TRIWULAN_OPTIONS)],
            'tahun_rencana_rtp' => ['nullable', 'integer', 'digits:4'],
            'realisasi_pelaksanaan_rtp' => ['nullable', 'string', 'max:255'],
            'keterangan_rtp' => ['nullable', 'string'],
        ];
    }

    public function storeOrUpdate10(Request $request)
    {
        $data = $request->validate($this->pencatatanValidationRules());

        $this->ensureOpdAccess($request, (int) $data['opd_id']);
        $this->ensureSumberBelongsToOpd($data['risiko_tipe'], (int) $data['risiko_id'], (int) $data['opd_id']);

        // #11: laporan_kejadian_id (kalau ada) jg wajib milik OPD yg sama —
        // cegah menautkan laporan warga OPD lain ke Form 10 OPD ini.
        if (!empty($data['laporan_kejadian_id'])) {
            $laporanOpdId = LaporanKejadianRisiko::whereKey($data['laporan_kejadian_id'])->value('opd_id');
            if ($laporanOpdId === null || (int) $laporanOpdId !== (int) $data['opd_id']) {
                abort(403, 'Laporan kejadian yang dirujuk bukan milik OPD tersebut.');
            }
        }

        // withTrashed() — sama alasan seperti storeOrUpdate89(): baris ini
        // bisa sudah soft-deleted mengikuti risiko sumbernya yang sempat
        // dihapus lalu di-restore (CascadeSoftDeletesToMonitoring). Query
        // updateOrCreate() default mengecualikan trashed, jadi bisa berakhir
        // duplikat (risiko_tipe, risiko_id, tahun_penilaian) alih-alih
        // menemukan & memulihkan baris lama.
        $existing = PencatatanKejadianRisiko::withTrashed()
            ->where('risiko_tipe', $data['risiko_tipe'])
            ->where('risiko_id', $data['risiko_id'])
            ->where('tahun_penilaian', $data['tahun'])
            ->first();

        $pencatatan = $existing ?? new PencatatanKejadianRisiko();
        if ($pencatatan->trashed()) {
            $pencatatan->restore();
        }
        $pencatatan->fill([
            'risiko_tipe' => $data['risiko_tipe'],
            'risiko_id' => $data['risiko_id'],
            'tahun_penilaian' => $data['tahun'],
            'opd_id' => $data['opd_id'],
            // Jangan timpa laporan_kejadian_id yg sudah tertaut jadi null
            // hanya krn request penyimpanan RUTIN (edit biasa) tidak
            // mengirim field ini — field ini HANYA terisi via alur
            // "Catat ke Form 10" (prefill_laporan_kejadian_id di URL),
            // sekali tertaut harus tetap tertaut di edit2 berikutnya.
            'laporan_kejadian_id' => $data['laporan_kejadian_id'] ?? $existing?->laporan_kejadian_id,
            'tanggal_terjadi' => $data['tanggal_terjadi'] ?? null,
            'sebab_saat_kejadian' => $data['sebab_saat_kejadian'] ?? null,
            'dampak_saat_kejadian' => $data['dampak_saat_kejadian'] ?? null,
            'keterangan_kejadian' => $data['keterangan_kejadian'] ?? null,
            'triwulan_rencana_rtp' => $data['triwulan_rencana_rtp'] ?? null,
            'tahun_rencana_rtp' => $data['tahun_rencana_rtp'] ?? null,
            'realisasi_pelaksanaan_rtp' => $data['realisasi_pelaksanaan_rtp'] ?? null,
            'keterangan_rtp' => $data['keterangan_rtp'] ?? null,
            'submitted_by' => $request->user()->id,
        ])->save();

        return back()->with('success', 'Pencatatan Kejadian Risiko berhasil disimpan.');
    }
}
