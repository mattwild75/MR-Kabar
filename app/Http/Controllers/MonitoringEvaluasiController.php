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
use App\Models\RtpKemiripanDiabaikan;
use App\Services\RiskReferenceDataService;
use App\Services\RtpKemiripanService;
use App\Support\SafeUpsert;
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

    public function __construct(
        private RiskReferenceDataService $riskRef,
        private RtpKemiripanService $kemiripan,
    ) {}

    private function opdOptions(Request $request)
    {
        $user = $request->user();
        if ($user->opd_id && ! $user->canViewAllOpd()) {
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
        if (! $opdId || ! $user->opd_id || $user->canViewAllOpd()) {
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
     * Kumpulkan seluruh RTP dari 4 sumber sekaligus, digabung jadi satu
     * daftar dgn label "Kegiatan Pengendalian yang Dibutuhkan" (kolom b
     * Form 8/9) yg diproyeksi live dari tiap sumber. $opdId null berarti
     * LINTAS-OPD (hanya boleh dipanggil utk admin/super-admin, lihat
     * form89()); $tahun null berarti LINTAS-TAHUN — monitoring memang bisa
     * dilakukan utk RTP yg target pelaksanaannya tahun depan/lebih, jadi
     * "belum pilih tahun" seharusnya menampilkan RIWAYAT semua tahun, bukan
     * dikosongkan. opd_nama & tahun disertakan per-baris supaya frontend
     * bisa menampilkan asal baris saat tampilan lintas-OPD/lintas-tahun.
     */
    private function rtpGabungan(?int $opdId, ?int $tahun): array
    {
        $daftar = [];

        $scopeOpd = fn ($q) => $opdId ? $q->where('opd_id', $opdId) : $q;

        $irsPemda = IrsPemda::whereHas('user', fn ($q) => $scopeOpd($q))
            ->when($tahun, fn ($q) => $q->where('TAHUN DINILAI RISIKO', (string) $tahun))
            ->whereNotNull('RENCANA TINDAK PENGENDALIAN')
            ->where('RENCANA TINDAK PENGENDALIAN', '!=', '')
            ->with('user.opd')
            ->orderBy('id')
            ->get();
        foreach ($irsPemda as $r) {
            $daftar[] = [
                'tipe' => 'irs_pemda',
                'id' => $r->id,
                'label' => $r->{'RENCANA TINDAK PENGENDALIAN'},
                'konteks' => 'Risiko Strategis Pemda: '.$r->{'URAIAN RISIKO'},
                'opd_id' => $r->user?->opd_id,
                'opd_nama' => $r->user?->opd?->nama,
                'tahun' => $this->toIntOrNull($r->{'TAHUN DINILAI RISIKO'}),
                'skala_dampak' => $r->{'SKALA DAMPAK'},
                'skala_kemungkinan' => $r->{'SKALA KEMUNGKINAN'},
                'skala_dampak_inheren' => $r->{'SKALA DAMPAK INHEREN'},
                'skala_kemungkinan_inheren' => $r->{'SKALA KEMUNGKINAN INHEREN'},
                'skala_dampak_target' => $r->{'SKALA DAMPAK TARGET'},
                'skala_kemungkinan_target' => $r->{'SKALA KEMUNGKINAN TARGET'},
            ];
        }

        $irsPd = IrsPd::whereHas('user', fn ($q) => $scopeOpd($q))
            ->when($tahun, fn ($q) => $q->where('TAHUN DINILAI RISIKO', (string) $tahun))
            ->whereNotNull('RENCANA TINDAK PENGENDALIAN')
            ->where('RENCANA TINDAK PENGENDALIAN', '!=', '')
            ->with('user.opd')
            ->orderBy('id')
            ->get();
        foreach ($irsPd as $r) {
            $daftar[] = [
                'tipe' => 'irs_pd',
                'id' => $r->id,
                'label' => $r->{'RENCANA TINDAK PENGENDALIAN'},
                'konteks' => 'Risiko Strategis OPD: '.$r->{'URAIAN RISIKO'},
                'opd_id' => $r->user?->opd_id,
                'opd_nama' => $r->user?->opd?->nama,
                'tahun' => $this->toIntOrNull($r->{'TAHUN DINILAI RISIKO'}),
                'skala_dampak' => $r->{'SKALA DAMPAK'},
                'skala_kemungkinan' => $r->{'SKALA KEMUNGKINAN'},
                'skala_dampak_inheren' => $r->{'SKALA DAMPAK INHEREN'},
                'skala_kemungkinan_inheren' => $r->{'SKALA KEMUNGKINAN INHEREN'},
                'skala_dampak_target' => $r->{'SKALA DAMPAK TARGET'},
                'skala_kemungkinan_target' => $r->{'SKALA KEMUNGKINAN TARGET'},
            ];
        }

        $iroPd = IroPd::whereHas('user', fn ($q) => $scopeOpd($q))
            ->when($tahun, fn ($q) => $q->where('TAHUN DINILAI RISIKO', (string) $tahun))
            ->whereNotNull('RENCANA TINDAK PENGENDALIAN')
            ->where('RENCANA TINDAK PENGENDALIAN', '!=', '')
            ->with('user.opd')
            ->orderBy('id')
            ->get();
        foreach ($iroPd as $r) {
            $daftar[] = [
                'tipe' => 'iro_pd',
                'id' => $r->id,
                'label' => $r->{'RENCANA TINDAK PENGENDALIAN'},
                'konteks' => 'Risiko Operasional OPD: '.$r->{'URAIAN RISIKO'},
                'opd_id' => $r->user?->opd_id,
                'opd_nama' => $r->user?->opd?->nama,
                'tahun' => $this->toIntOrNull($r->{'TAHUN DINILAI RISIKO'}),
                'skala_dampak' => $r->{'SKALA DAMPAK'},
                'skala_kemungkinan' => $r->{'SKALA KEMUNGKINAN'},
                'skala_dampak_inheren' => $r->{'SKALA DAMPAK INHEREN'},
                'skala_kemungkinan_inheren' => $r->{'SKALA KEMUNGKINAN INHEREN'},
                'skala_dampak_target' => $r->{'SKALA DAMPAK TARGET'},
                'skala_kemungkinan_target' => $r->{'SKALA KEMUNGKINAN TARGET'},
            ];
        }

        $ceeRtp = CeeRtp::with(['unsur', 'opd'])
            ->when($opdId, fn ($q) => $q->where('opd_id', $opdId))
            ->when($tahun, fn ($q) => $q->where('tahun_penilaian', $tahun))
            ->whereNotNull('rencana_tindak_pengendalian')
            ->where('rencana_tindak_pengendalian', '!=', '')
            ->orderBy('id')
            ->get();
        foreach ($ceeRtp as $r) {
            $daftar[] = [
                'tipe' => 'cee_rtp',
                'id' => $r->id,
                'label' => $r->rencana_tindak_pengendalian,
                'konteks' => 'RTP atas CEE ('.($r->unsur?->kode ?? '-').'. '.($r->unsur?->nama ?? '-').'): '.$r->kondisi_kurang_memadai,
                'opd_id' => $r->opd_id,
                'opd_nama' => $r->opd?->nama,
                'tahun' => $r->tahun_penilaian,
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

        // RTP terbaru dulu (Tahun Dinilai Risiko tertinggi) — monitoring bisa
        // dilakukan atas RTP yg target pelaksanaannya tahun depan/lebih,
        // jadi urutan ini relevan terutama saat tampilan lintas-tahun.
        usort($daftar, fn ($a, $b) => ($b['tahun'] ?? 0) <=> ($a['tahun'] ?? 0));

        return $daftar;
    }

    /** Kolom TAHUN DINILAI RISIKO kadang berisi teks kosong/non-digit. */
    private function toIntOrNull($value): ?int
    {
        $value = trim((string) $value);

        return ctype_digit($value) ? (int) $value : null;
    }

    public function form89(Request $request)
    {
        $user = $request->user();
        $isAdmin = $user->canViewAllOpd();

        // Admin/super-admin: opd_id null = LINTAS-OPD (sesuai request query,
        // termasuk sengaja dikosongkan). PIC biasa: SELALU terkunci ke
        // OPD-nya sendiri, tidak pernah null — beda dari CEE/form lain yg
        // mewajibkan pilih OPD dulu, monitoring RTP defaultnya langsung
        // tampil (baik utk PIC maupun admin) krn tujuannya justru melihat
        // riwayat tanpa perlu klik apa pun dulu.
        $opdId = $isAdmin ? ($request->integer('opd_id') ?: null) : $user->opd_id;
        $this->ensureOpdAccess($request, $opdId);

        // tahun TIDAK di-fallback ke tahun_penilaian aktif — biarkan null
        // ("Semua Tahun") kalau user belum memilih, supaya default landing
        // langsung menampilkan riwayat RTP lintas-tahun (2 lines of defense:
        // PIC tetap lingkup OPD sendiri, hanya admin yg juga lintas-OPD).
        $tahun = $request->filled('tahun') ? $request->integer('tahun') : null;

        $rtpGabungan = ($opdId || $isAdmin) ? $this->rtpGabungan($opdId, $tahun) : [];

        // Perdep meminta dokumen RTP akhir diselaraskan agar tidak duplikatif:
        // RTP dari CEE dan RTP dari register risiko bisa merumuskan kebutuhan
        // pengendalian yang sama, lalu satu pekerjaan dipantau dua kali dan
        // capaiannya terhitung ganda. Di sini hanya ditandai — lihat
        // RtpKemiripanService.
        $rtpGabungan = $this->kemiripan->tandai($rtpGabungan);

        // unique(rtp_sumber_tipe, rtp_sumber_id) TANPA tahun_penilaian —
        // satu RTP sumber cuma py SATU baris monitoring sepanjang waktu
        // (kolom tahun_penilaian di MonitoringRtp cuma mencatat tahun submit
        // terakhir, bukan bagian dari identitas unik). Jadi key lookup tetap
        // "tipe:id" sama seperti sebelumnya, TIDAK boleh disertai tahun —
        // kalau opd_id di-scope (bukan lintas-OPD), filter tahun_penilaian
        // di sini justru bisa menyembunyikan monitoring yg sudah pernah
        // diisi tahun lalu utk RTP yg sama; dibiarkan tanpa filter tahun
        // supaya monitoring_id/isFilled tetap akurat apa pun tahun yg
        // sedang ditampilkan.
        $existingQuery = MonitoringRtp::query();
        if ($opdId) {
            $existingQuery->where('opd_id', $opdId);
        }
        $existing = ($opdId || $isAdmin)
            ? $existingQuery->get()->keyBy(fn ($m) => $m->rtp_sumber_tipe.':'.$m->rtp_sumber_id)
            : collect();

        $rows = collect($rtpGabungan)->map(function ($rtp) use ($existing) {
            $key = $rtp['tipe'].':'.$rtp['id'];
            $monitoring = $existing->get($key);

            return [
                'rtp_sumber_tipe' => $rtp['tipe'],
                'rtp_sumber_id' => $rtp['id'],
                'label' => $rtp['label'],
                'konteks' => $rtp['konteks'],
                'opd_id' => $rtp['opd_id'],
                'opd_nama' => $rtp['opd_nama'],
                'tahun' => $rtp['tahun'],
                'kemiripan' => $rtp['kemiripan'] ?? [],
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
                'uji_coba_triwulan' => $monitoring?->uji_coba_triwulan,
                'uji_coba_tahun' => $monitoring?->uji_coba_tahun,
                'uji_coba_hasil' => $monitoring?->uji_coba_hasil,
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
            'isAdmin' => $isAdmin,
            'triwulanOptions' => self::TRIWULAN_OPTIONS,
            'triwulanLabels' => self::TRIWULAN_LABELS,
            'rows' => $rows,
            // Dipakai dialog "Isi Nilai Risiko Aktual" (matriks 5x5) — sama
            // data referensi dgn IRS/IRO. kriteriaDampak/kriteriaKemungkinan
            // disertakan juga (bukan cuma matriksRisiko) supaya popover info
            // Dampak/Kemungkinan di RiskMatrixPickerDialog bisa dipakai sama
            // persis seperti di IRS/IRO, bukan cuma di Form89.
            'riskReference' => collect($this->riskRef->referenceDialogPayload())
                ->only(['matriksRisiko', 'kriteriaDampak', 'kriteriaKemungkinan'])
                ->all(),
        ]);
    }

    /**
     * Tandai satu pasangan RTP sebagai sudah diperiksa dan memang berbeda,
     * sehingga lencana kemiripannya tidak muncul lagi.
     *
     * Kedua RTP wajib milik OPD yang sama dengan OPD yang boleh diakses
     * pengguna — tanpa itu, siapa pun yang bisa membuka Monitoring dapat
     * membungkam peringatan atas RTP OPD lain hanya dengan menebak id-nya.
     */
    public function abaikanKemiripan(Request $request)
    {
        $data = $request->validate([
            'opd_id' => ['required', 'integer', 'exists:opd,id'],
            'tipe_a' => ['required', Rule::in(array_keys(self::RISK_MODELS))],
            'id_a' => ['required', 'integer'],
            'tipe_b' => ['required', Rule::in(array_keys(self::RISK_MODELS))],
            'id_b' => ['required', 'integer'],
            'alasan' => ['nullable', 'string', 'max:500'],
        ]);

        $opdId = (int) $data['opd_id'];
        $this->ensureOpdAccess($request, $opdId);
        $this->ensureSumberBelongsToOpd($data['tipe_a'], (int) $data['id_a'], $opdId);
        $this->ensureSumberBelongsToOpd($data['tipe_b'], (int) $data['id_b'], $opdId);

        if ($data['tipe_a'] === $data['tipe_b'] && (int) $data['id_a'] === (int) $data['id_b']) {
            return back()->with('error', 'Kedua RTP yang dirujuk sama, tidak ada yang perlu diperiksa.');
        }

        [$tipeA, $idA, $tipeB, $idB] = RtpKemiripanDiabaikan::bakukan(
            $data['tipe_a'],
            (int) $data['id_a'],
            $data['tipe_b'],
            (int) $data['id_b'],
        );

        RtpKemiripanDiabaikan::updateOrCreate(
            ['tipe_a' => $tipeA, 'id_a' => $idA, 'tipe_b' => $tipeB, 'id_b' => $idB],
            ['diabaikan_oleh' => $request->user()->id, 'alasan' => $data['alasan'] ?? null],
        );

        return back()->with('success', 'Pasangan RTP ditandai sudah diperiksa dan memang berbeda.');
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
            // Uji coba penerapan pengendalian — langkah ke-4 dari enam langkah
            // membangun infrastruktur pengendalian pada Perdep halaman
            // berlabel 76. Hasilnya menjadi dasar langkah ke-5, menyempurnakan
            // rancangan sebelum pengendalian ditetapkan berlaku.
            'uji_coba_triwulan' => ['nullable', Rule::in(self::TRIWULAN_OPTIONS)],
            'uji_coba_tahun' => ['nullable', 'integer', 'digits:4'],
            'uji_coba_hasil' => ['nullable', 'string'],
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
        // Dibungkus SafeUpsert krn firstOrNew()+save() di bawah ini SELECT
        // dulu baru INSERT: dua staf OPD yang sama menyimpan monitoring RTP
        // yang sama bersamaan akan menabrak monitoring_rtp_sumber_unique.
        SafeUpsert::run(function () use ($data, $request, $dampakAktual, $kemungkinanAktual, $skalaRisikoAktual) {
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
                'uji_coba_triwulan' => $data['uji_coba_triwulan'] ?? null,
                'uji_coba_tahun' => $data['uji_coba_tahun'] ?? null,
                'uji_coba_hasil' => $data['uji_coba_hasil'] ?? null,
                'realisasi_waktu_pemantauan' => $data['realisasi_waktu_pemantauan'] ?? null,
                'keterangan_pemantauan' => $data['keterangan_pemantauan'] ?? null,
                'kategori_existing_control_aktual' => $data['kategori_existing_control_aktual'] ?? null,
                'skala_dampak_aktual' => $dampakAktual ?: null,
                'skala_kemungkinan_aktual' => $kemungkinanAktual ?: null,
                'skala_risiko_aktual' => $skalaRisikoAktual,
                'submitted_by' => $request->user()->id,
            ])->save();
        });

        return back()->with('success', 'Monitoring RTP berhasil disimpan.');
    }

    // ── Form 10: Pencatatan Kejadian Risiko & Pelaksanaan RTP ────────────

    /**
     * $opdId null = LINTAS-OPD (hanya boleh dipanggil utk admin/super-admin,
     * lihat form10()); $tahun null = LINTAS-TAHUN. Sama pola dgn
     * rtpGabungan() — opd_id/opd_nama/tahun disertakan per-baris supaya
     * frontend bisa menampilkan asal baris saat tampilan lintas.
     */
    private function risikoGabungan(?int $opdId, ?int $tahun): array
    {
        $daftar = [];

        $scopeOpd = fn ($q) => $opdId ? $q->where('opd_id', $opdId) : $q;

        $irsPemda = IrsPemda::whereHas('user', fn ($q) => $scopeOpd($q))
            ->when($tahun, fn ($q) => $q->where('TAHUN DINILAI RISIKO', (string) $tahun))
            ->where('URAIAN RISIKO', '!=', '')
            ->whereNotNull('URAIAN RISIKO')
            ->with('user.opd')
            ->orderBy('id')
            ->get();
        foreach ($irsPemda as $r) {
            $daftar[] = [
                'tipe' => 'irs_pemda',
                'id' => $r->id,
                'label' => $r->{'URAIAN RISIKO'},
                'konteks' => 'Risiko Strategis Pemda',
                'opd_id' => $r->user?->opd_id,
                'opd_nama' => $r->user?->opd?->nama,
                'tahun' => $this->toIntOrNull($r->{'TAHUN DINILAI RISIKO'}),
            ];
        }

        $irsPd = IrsPd::whereHas('user', fn ($q) => $scopeOpd($q))
            ->when($tahun, fn ($q) => $q->where('TAHUN DINILAI RISIKO', (string) $tahun))
            ->where('URAIAN RISIKO', '!=', '')
            ->whereNotNull('URAIAN RISIKO')
            ->with('user.opd')
            ->orderBy('id')
            ->get();
        foreach ($irsPd as $r) {
            $daftar[] = [
                'tipe' => 'irs_pd',
                'id' => $r->id,
                'label' => $r->{'URAIAN RISIKO'},
                'konteks' => 'Risiko Strategis OPD',
                'opd_id' => $r->user?->opd_id,
                'opd_nama' => $r->user?->opd?->nama,
                'tahun' => $this->toIntOrNull($r->{'TAHUN DINILAI RISIKO'}),
            ];
        }

        $iroPd = IroPd::whereHas('user', fn ($q) => $scopeOpd($q))
            ->when($tahun, fn ($q) => $q->where('TAHUN DINILAI RISIKO', (string) $tahun))
            ->where('URAIAN RISIKO', '!=', '')
            ->whereNotNull('URAIAN RISIKO')
            ->with('user.opd')
            ->orderBy('id')
            ->get();
        foreach ($iroPd as $r) {
            $daftar[] = [
                'tipe' => 'iro_pd',
                'id' => $r->id,
                'label' => $r->{'URAIAN RISIKO'},
                'konteks' => 'Risiko Operasional OPD',
                'opd_id' => $r->user?->opd_id,
                'opd_nama' => $r->user?->opd?->nama,
                'tahun' => $this->toIntOrNull($r->{'TAHUN DINILAI RISIKO'}),
            ];
        }

        // Risiko terbaru dulu (Tahun Dinilai Risiko tertinggi) — sama
        // alasannya dgn rtpGabungan(): monitoring/pencatatan kejadian bisa
        // relevan lintas-tahun.
        usort($daftar, fn ($a, $b) => ($b['tahun'] ?? 0) <=> ($a['tahun'] ?? 0));

        return $daftar;
    }

    public function form10(Request $request)
    {
        $user = $request->user();
        $isAdmin = $user->canViewAllOpd();

        // Sama pola dgn form89(): admin boleh lintas-OPD (opd_id null =
        // "Semua OPD"), PIC biasa selalu terkunci ke OPD-nya sendiri.
        $opdId = $isAdmin ? ($request->integer('opd_id') ?: null) : $user->opd_id;
        $this->ensureOpdAccess($request, $opdId);

        // tahun TIDAK di-fallback ke tahun_penilaian aktif — null ("Semua
        // Tahun") berarti tampilkan riwayat lintas-tahun sbg default.
        $tahun = $request->filled('tahun') ? $request->integer('tahun') : null;

        $risikoGabungan = ($opdId || $isAdmin) ? $this->risikoGabungan($opdId, $tahun) : [];

        // BEDA dari monitoring_rtp: unique constraint pencatatan_kejadian_risiko
        // MENYERTAKAN tahun_penilaian (risiko yg sama bisa dicatat kejadian
        // BEDA di tahun berbeda — satu risiko sumber bisa py BEBERAPA baris
        // pencatatan). Saat tahun spesifik dipilih, filter ketat ke tahun itu
        // (perilaku asli, 1 baris per risiko). Saat "Semua Tahun" ($tahun
        // null), ambil pencatatan TERBARU per risiko (bukan sembarang) utk
        // representasi status "sudah dicatat"/prefill form — konsisten dgn
        // urutan "terbaru dulu" yg dipakai risikoGabungan().
        $existingQuery = PencatatanKejadianRisiko::query();
        if ($opdId) {
            $existingQuery->where('opd_id', $opdId);
        }
        if ($tahun) {
            $existingQuery->where('tahun_penilaian', $tahun);
        }
        // orderBy ASCENDING (bukan desc) — Collection::keyBy() menyimpan
        // baris TERAKHIR yg diproses per key (menimpa, bukan mengabaikan
        // duplikat pertama), jadi utk mendapatkan pencatatan tahun TERBESAR
        // per risiko, baris itu justru harus diproses PALING AKHIR.
        $existing = ($opdId || $isAdmin)
            ? $existingQuery->orderBy('tahun_penilaian')->get()
                ->keyBy(fn ($p) => $p->risiko_tipe.':'.$p->risiko_id)
            : collect();

        $rows = collect($risikoGabungan)->map(function ($risiko) use ($existing) {
            $key = $risiko['tipe'].':'.$risiko['id'];
            $pencatatan = $existing->get($key);

            return [
                'risiko_tipe' => $risiko['tipe'],
                'risiko_id' => $risiko['id'],
                'label' => $risiko['label'],
                'konteks' => $risiko['konteks'],
                'opd_id' => $risiko['opd_id'],
                'opd_nama' => $risiko['opd_nama'],
                'tahun' => $risiko['tahun'],
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
            'isAdmin' => $isAdmin,
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
        if (! empty($data['laporan_kejadian_id'])) {
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
        // Dibungkus SafeUpsert dgn alasan yg sama spt storeOrUpdate89():
        // SELECT lalu INSERT, di atas tabel berindeks unik.
        SafeUpsert::run(function () use ($data, $request) {
            $existing = PencatatanKejadianRisiko::withTrashed()
                ->where('risiko_tipe', $data['risiko_tipe'])
                ->where('risiko_id', $data['risiko_id'])
                ->where('tahun_penilaian', $data['tahun'])
                ->first();

            $pencatatan = $existing ?? new PencatatanKejadianRisiko;
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
        });

        return back()->with('success', 'Pencatatan Kejadian Risiko berhasil disimpan.');
    }
}
