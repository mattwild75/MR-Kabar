<?php

namespace App\Services;

use App\Models\RiskEntitasPenilai;
use App\Models\RiskImpactCriteria;
use App\Models\RiskJenis;
use App\Models\RiskLevel;
use App\Models\RiskLikelihoodCriteria;
use App\Models\RiskMatrixCell;

/**
 * Sumber tunggal utk data referensi risiko yang sebelumnya di-duplikasi 3x
 * (byte-identical) di IrsPemdaController, IrsPdController, IroPdController:
 * JENIS_RISIKO_OPTIONS, SKALA_RISIKO_MATRIX, SKALA_PRIORITAS_MAP. Sekarang
 * sumber datanya tabel DB (risk_jenis, risk_matrix_cells) — bisa diedit
 * Admin/Super Admin lewat Settings > Keterangan Pendukung — bukan lagi
 * array const yang harus diubah manual di 3 tempat kalau ada perubahan.
 *
 * Skala Prioritas (1-25, invers dari skala risiko) TETAP dihitung via
 * rumus (26 - skala_risiko), bukan tabel terpisah — karena hubungannya
 * selalu tetap 1:1 terbalik utk skala 1-25, tidak butuh fleksibilitas edit
 * seperti Matriks/Level Risiko yang warnanya memang perlu bisa diubah.
 */
class RiskReferenceDataService
{
    /**
     * Faktor reduksi Skala Kemungkinan per kategori efektivitas kontrol
     * (TE=Tidak Efektif, KE=Kurang Efektif, CE=Cukup Efektif, E=Efektif) —
     * dipakai menghitung K_residual/K_target/K_aktual dari basis
     * K_INHEREN. Duplikat sadar dgn FAKTOR_REDUKSI_KONTROL di
     * irs-reference-data.ts (frontend preview real-time) — kalau nilai di
     * sini berubah, frontend WAJIB ikut diubah.
     */
    private const FAKTOR_REDUKSI_KONTROL = ['TE' => 1.0, 'KE' => 0.8, 'CE' => 0.6, 'E' => 0.4];

    /**
     * K yang diproyeksikan turun sesuai efektivitas kontrol, basis SELALU
     * Skala Kemungkinan INHEREN (titik awal "tanpa kontrol") — Residual,
     * Target, dan Aktual sama-sama dihitung dari basis yang sama, hanya
     * kategori efektivitas yang dipakai berbeda (existing control saat
     * ini / proyeksi RTP / aktual hasil monitoring). Dibulatkan round
     * half-up standar, clamp 1-5. Null kalau K inheren belum diisi —
     * skor turunan tidak bisa dihitung sampai baseline inherennya ada.
     */
    public function hitungKemungkinanTerkendali(?int $kemungkinanInheren, ?string $kategoriEfektivitas): ?int
    {
        return $this->terapkanFaktorReduksi($kemungkinanInheren, $kategoriEfektivitas);
    }

    /**
     * Sama persis dengan hitungKemungkinanTerkendali(), dipakai utk sumbu
     * Dampak — RTP yg sifatnya Mitigate/Share-Transfer (lihat
     * arahReduksiRtp()) menekan DAMPAK, bukan Kemungkinan, sesuai prinsip
     * COSO ERM: preventive control -> likelihood, mitigative/corrective
     * control -> impact/consequence.
     */
    public function hitungDampakTerkendali(?int $dampakInheren, ?string $kategoriEfektivitas): ?int
    {
        return $this->terapkanFaktorReduksi($dampakInheren, $kategoriEfektivitas);
    }

    private function terapkanFaktorReduksi(?int $nilaiInheren, ?string $kategoriEfektivitas): ?int
    {
        if (!$nilaiInheren || $nilaiInheren < 1 || $nilaiInheren > 5) {
            return null;
        }

        $faktor = self::FAKTOR_REDUKSI_KONTROL[$kategoriEfektivitas] ?? 1.0;

        return max(1, min(5, (int) round($nilaiInheren * $faktor)));
    }

    /**
     * Tentukan sumbu mana yang ditekan faktor reduksi kategori efektivitas,
     * berdasarkan kategori RESPON RISIKO (RENCANA TINDAK PENGENDALIAN) yang
     * SUDAH diisi di RTP terkait — bukan field baru, cukup dibaca ulang.
     * Prinsip COSO ERM: kontrol preventif (Avoid/Abate) menekan
     * KEMUNGKINAN kejadian; kontrol mitigatif/pengalihan (Mitigate/Share-
     * Transfer) menekan besaran DAMPAK saat risiko terjadi. RTP campuran
     * (mis. "Abate; Mitigate" dicentang keduanya) menekan KEDUA sumbu
     * sekaligus dengan faktor yang sama (asumsi "efektivitas keseluruhan
     * X%" berlaku ke sumbu manapun yang relevan). Accept (atau RTP kosong)
     * = tidak menekan sumbu manapun (dianggap tidak ada tindakan aktif).
     *
     * Return ['kemungkinan' => bool, 'dampak' => bool] — kalau keduanya
     * false (RTP kosong/Accept-only/tidak dikenali), fallback ke K supaya
     * PERILAKU LAMA (sebelum penyesuaian ini) tetap jalan utk data lama yg
     * RTP-nya belum eksplisit menyebut respon risiko.
     */
    public function arahReduksiRtp(?string $rencanaTindakPengendalian): array
    {
        $nilai = mb_strtolower(trim((string) $rencanaTindakPengendalian));

        $keK = $nilai !== '' && (str_contains($nilai, 'avoid') || str_contains($nilai, 'abate'));
        $keD = $nilai !== '' && (str_contains($nilai, 'mitigate') || str_contains($nilai, 'share/transfer'));

        if (!$keK && !$keD) {
            return ['kemungkinan' => true, 'dampak' => false];
        }

        return ['kemungkinan' => $keK, 'dampak' => $keD];
    }

    /**
     * Ambil kode kategori efektivitas (TE/KE/CE/E) dari nilai tersimpan
     * format CategorizedTextarea: "E (uraian penjelasan)" atau bare "E".
     * Urutan cek 2-huruf dulu (TE/KE/CE) sebelum "E" supaya "TE (...)"
     * tidak salah tertangkap sbg "E". Null kalau tidak cocok pola apa pun
     * (termasuk teks bebas data lama).
     */
    public function ekstrakKategoriKontrol(?string $value): ?string
    {
        $value = trim((string) $value);
        if ($value === '') {
            return null;
        }

        foreach (['TE', 'KE', 'CE', 'E'] as $kategori) {
            if ($value === $kategori || str_starts_with($value, $kategori . ' (')) {
                return $kategori;
            }
        }

        return null;
    }

    /**
     * Hitung SEMUA skala turunan satu baris risiko sekaligus (Residual,
     * Inheren, Target, Aktual) + tegakkan invariant antar-skor — dipanggil
     * dari withCalculatedScales() di IrsPemdaController/IrsPdController/
     * IroPdController (sebelumnya logika ini diduplikasi 3x byte-identical
     * di ketiganya; logika baru Target/Aktual jauh lebih panjang, jadi
     * dipusatkan di sini supaya tidak triple-maintenance).
     *
     * Alur skenario (disepakati eksplisit dgn pemilik proses):
     * - Skenario A (KATEGORI EXISTING CONTROL dinilai): baseline Inheren
     *   WAJIB — skala residual tanpa pembanding "sebelum pengendalian"
     *   tidak bermakna utk analisis efektivitas.
     * - Skenario B (tanpa existing control = risiko baru murni): Inheren
     *   otomatis DISALIN dari Residual (tanpa kontrol, keduanya identik) —
     *   PIC cukup mengisi skala sekali, langsung lanjut menyusun RTP.
     * - Target (proyeksi setelah RTP jalan) dihitung dari K_INHEREN x
     *   faktor KATEGORI PROYEKSI RTP; Aktual (hasil monitoring) dari
     *   K_INHEREN x faktor KATEGORI EXISTING CONTROL AKTUAL — dua penilaian
     *   independen dari basis yg sama, gap keduanya = insight "RTP tidak
     *   berjalan sesuai rencana". Nilai auto-hitung bisa di-override
     *   manual; kolom Dampak Target/Aktual default menyalin Dampak Inheren
     *   (utk RTP preventif) tapi bebas diubah (utk RTP mitigatif).
     */
    public function hitungSemuaSkala(array $data): array
    {
        $dampak = (int) ($data['SKALA DAMPAK'] ?? 0);
        $kemungkinan = (int) ($data['SKALA KEMUNGKINAN'] ?? 0);

        $kategoriExisting = $this->ekstrakKategoriKontrol($data['KATEGORI EXISTING CONTROL'] ?? null);
        $dampakInheren = (int) ($data['SKALA DAMPAK INHEREN'] ?? 0);
        $kemungkinanInheren = (int) ($data['SKALA KEMUNGKINAN INHEREN'] ?? 0);

        // Skenario A — existing control dinilai: Inheren wajib.
        if ($kategoriExisting !== null && (!$dampakInheren || !$kemungkinanInheren)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'SKALA DAMPAK INHEREN' => 'Skala Dampak & Kemungkinan Inheren wajib diisi bila Kategori Existing Control dinilai — skala risiko yang Anda isi adalah skala RESIDUAL (setelah pengendalian), jadi baseline "sebelum pengendalian" (Inheren) harus ada sebagai pembanding.',
            ]);
        }

        // Skenario B — risiko baru tanpa existing control: Inheren dan
        // Residual/Current SALING mengisi (form "Apakah sudah ada Existing
        // Control?" -> "Tidak" hanya menampilkan SATU pasang field,
        // berlabel Inheren — PIC tidak lagi mengisi SKALA DAMPAK/KEMUNGKINAN
        // residual sama sekali, jadi arah copy-nya Inheren->Residual, BUKAN
        // sebaliknya seperti sebelumnya). Arah lama (Residual->Inheren)
        // tetap dipertahankan utk kompatibilitas data/alur lama yg mengisi
        // Residual duluan tanpa Inheren.
        if ($kategoriExisting === null && !$dampakInheren && !$kemungkinanInheren && $dampak && $kemungkinan) {
            $dampakInheren = $dampak;
            $kemungkinanInheren = $kemungkinan;
            $data['SKALA DAMPAK INHEREN'] = $dampakInheren;
            $data['SKALA KEMUNGKINAN INHEREN'] = $kemungkinanInheren;
        } elseif ($kategoriExisting === null && !$dampak && !$kemungkinan && $dampakInheren && $kemungkinanInheren) {
            $dampak = $dampakInheren;
            $kemungkinan = $kemungkinanInheren;
            $data['SKALA DAMPAK'] = $dampak;
            $data['SKALA KEMUNGKINAN'] = $kemungkinan;
        }

        // Salah satu dari Residual/Current ATAU Inheren wajib terisi —
        // rule 'required' di controller sengaja dilonggarkan jadi
        // 'nullable' krn form "Tidak ada Existing Control" hanya mengisi
        // Inheren (lihat blok di atas), tapi minimal SATU pasang tetap
        // wajib supaya baris risiko tidak tersimpan tanpa skala sama sekali.
        if (!$dampak && !$kemungkinan && !$dampakInheren && !$kemungkinanInheren) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'SKALA DAMPAK INHEREN' => 'Skala Dampak & Kemungkinan wajib diisi — pilih dulu "Apakah risiko ini sudah memiliki Pengendalian yang Sudah Ada?" lalu isi skala yang muncul.',
            ]);
        }

        $hasil = $this->hitungSkala($dampak ?: null, $kemungkinan ?: null);
        $data['SKALA RISIKO'] = $hasil['skala_risiko'];
        $data['SKALA PRIORITAS'] = $hasil['skala_prioritas'];

        $hasilInheren = $this->hitungSkala($dampakInheren ?: null, $kemungkinanInheren ?: null);
        $data['SKALA RISIKO INHEREN'] = $hasilInheren['skala_risiko'];

        // Invariant: Inheren (sebelum pengendalian) >= Residual (sesudah) —
        // pengendalian hanya bisa MENGURANGI risiko (Perdep Pasal 1 angka
        // 10), tidak pernah menambahnya.
        if ($data['SKALA RISIKO INHEREN'] !== null && $data['SKALA RISIKO INHEREN'] < $data['SKALA RISIKO']) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'SKALA DAMPAK INHEREN' => 'Skala Risiko Inheren (' . $data['SKALA RISIKO INHEREN'] . ') tidak boleh lebih rendah dari Skala Risiko setelah pengendalian/Sisa Risiko (' . $data['SKALA RISIKO'] . ') — risiko sebelum pengendalian harus selalu lebih besar atau sama dengan risiko setelah pengendalian.',
            ]);
        }

        // ── Skala TARGET (proyeksi setelah RTP direncanakan berjalan) ──
        // Arah reduksi (K, D, atau keduanya) ditentukan dari kategori
        // RESPON RISIKO yg sudah dipilih di RENCANA TINDAK PENGENDALIAN —
        // sesuai prinsip COSO ERM: kontrol preventif (Avoid/Abate) menekan
        // Kemungkinan, kontrol mitigatif/pengalihan (Mitigate/Share-
        // Transfer) menekan Dampak. Sebelumnya faktor SELALU dikalikan ke
        // K saja, tidak mencerminkan RTP yg sifatnya menurunkan konsekuensi
        // (Mitigate) — lihat arahReduksiRtp().
        $kategoriProyeksi = $this->ekstrakKategoriKontrol($data['KATEGORI PROYEKSI RTP'] ?? null);
        $dampakTarget = (int) ($data['SKALA DAMPAK TARGET'] ?? 0);
        $kemungkinanTarget = (int) ($data['SKALA KEMUNGKINAN TARGET'] ?? 0);

        if ($kategoriProyeksi !== null || $dampakTarget || $kemungkinanTarget) {
            $arah = $this->arahReduksiRtp($data['RENCANA TINDAK PENGENDALIAN'] ?? null);

            // Sumbu Dampak: HANYA dihitung (basis D Inheren x faktor) kalau
            // RTP menyasar Dampak (Mitigate/Share-Transfer). Kalau tidak
            // ditekan, default = D RESIDUAL/current (BUKAN D Inheren) —
            // dipertahankan sesuai koreksi sebelumnya: D Inheren yg jauh
            // lebih tinggi dari D Residual bikin Target tampak lebih buruk
            // dari kondisi sekarang, membingungkan narasinya.
            $dampakTarget = $dampakTarget ?: (
                $kategoriProyeksi !== null && $arah['dampak']
                    ? ($this->hitungDampakTerkendali($dampakInheren ?: null, $kategoriProyeksi) ?? $dampak)
                    : $dampak
            );
            // Sumbu Kemungkinan: basis SELALU K Inheren (baseline "tanpa
            // kontrol") — baik saat dihitung (RTP menyasar K) maupun saat
            // fallback (RTP tidak menyasar K sama sekali, mis. murni
            // Mitigate) — konsisten dgn desain awal fitur ini.
            $kemungkinanTarget = $kemungkinanTarget ?: (
                $kategoriProyeksi !== null && $arah['kemungkinan']
                    ? ($this->hitungKemungkinanTerkendali($kemungkinanInheren ?: null, $kategoriProyeksi) ?? $kemungkinanInheren)
                    : $kemungkinanInheren
            );

            $hasilTarget = $this->hitungSkala($dampakTarget ?: null, $kemungkinanTarget ?: null);
            $data['SKALA DAMPAK TARGET'] = $dampakTarget ?: null;
            $data['SKALA KEMUNGKINAN TARGET'] = $kemungkinanTarget ?: null;
            $data['SKALA RISIKO TARGET'] = $hasilTarget['skala_risiko'];

            if ($data['SKALA RISIKO TARGET'] !== null && $data['SKALA RISIKO INHEREN'] !== null && $data['SKALA RISIKO TARGET'] > $data['SKALA RISIKO INHEREN']) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'SKALA KEMUNGKINAN TARGET' => 'Skala Risiko Target (' . $data['SKALA RISIKO TARGET'] . ') tidak boleh lebih tinggi dari Skala Risiko Inheren (' . $data['SKALA RISIKO INHEREN'] . ') — proyeksi RTP dihitung dari kondisi tanpa kontrol, hasilnya harus selalu lebih baik atau sama dengan kondisi itu.',
                ]);
            }
        } else {
            $data['SKALA DAMPAK TARGET'] = null;
            $data['SKALA KEMUNGKINAN TARGET'] = null;
            $data['SKALA RISIKO TARGET'] = null;
        }

        // Skala AKTUAL/Treated (hasil re-assessment saat monitoring) TIDAK
        // lagi dihitung di sini — dipindah ke Form 9 Monitoring
        // (MonitoringEvaluasiController::storeOrUpdate89(), tabel
        // monitoring_rtp), krn levelnya PER RTP (satu risiko bisa py >1 RTP
        // yg masing2 dinilai efektivitasnya sendiri), bukan per-risiko.
        // Kolom SKALA ... AKTUAL di tabel risiko ini TETAP ada (legacy,
        // nullable) tapi tidak lagi diproses/divalidasi di sini.

        return $data;
    }

    /** Format "kode - nama", identik dgn format lama JENIS_RISIKO_OPTIONS. */
    public function jenisRisikoOptions(): array
    {
        return RiskJenis::orderBy('urutan')
            ->get()
            ->map(fn (RiskJenis $j) => "{$j->kode} - {$j->nama}")
            ->all();
    }

    /** [dampak][kemungkinan] => skala risiko (1-25), sumber tabel risk_matrix_cells. */
    public function skalaRisikoMatrix(): array
    {
        $matrix = [];
        foreach (RiskMatrixCell::all() as $cell) {
            $matrix[$cell->dampak][$cell->kemungkinan] = $cell->skala_risiko;
        }

        return $matrix;
    }

    /** Skala Risiko (1-25) => Skala Prioritas (1-25, 1 = paling prioritas). */
    public function skalaPrioritas(int $skalaRisiko): int
    {
        // Clamp ke rentang valid 1-25 dulu — nilai tersimpan yg korup/di luar
        // rentang tidak boleh menghasilkan prioritas negatif atau > 25.
        $skalaRisiko = max(1, min(25, $skalaRisiko));

        return 26 - $skalaRisiko;
    }

    /** Hitung Skala Risiko & Skala Prioritas dari Dampak x Kemungkinan (dipanggil dari withCalculatedScales di 3 controller). */
    public function hitungSkala(?int $dampak, ?int $kemungkinan): array
    {
        if (!$dampak || !$kemungkinan || $dampak < 1 || $dampak > 5 || $kemungkinan < 1 || $kemungkinan > 5) {
            return ['skala_risiko' => null, 'skala_prioritas' => null];
        }

        $matrix = $this->skalaRisikoMatrix();
        $skalaRisiko = $matrix[$dampak][$kemungkinan] ?? null;

        if ($skalaRisiko === null) {
            return ['skala_risiko' => null, 'skala_prioritas' => null];
        }

        return [
            'skala_risiko' => $skalaRisiko,
            'skala_prioritas' => $this->skalaPrioritas($skalaRisiko),
        ];
    }

    /** Daftar nama entitas penilai risiko, urut sesuai kolom `urutan`. */
    public function entitasPenilaiOptions(): array
    {
        return RiskEntitasPenilai::orderBy('urutan')->pluck('nama')->all();
    }

    /**
     * Payload lengkap 3 kelompok data referensi yang dipakai dialog
     * "Lihat Daftar" di form IRS Pemda/IRS PD/IRO PD (Kriteria Dampak,
     * Kriteria Kemungkinan, Matriks Analisis Risiko) — dikirim sbg satu
     * prop gabungan `riskReference` ke Inertia supaya frontend tidak perlu
     * lagi import konstanta statis dari irs-reference-data.ts.
     */
    public function referenceDialogPayload(): array
    {
        $impact = RiskImpactCriteria::orderBy('level')->get();
        $likelihood = RiskLikelihoodCriteria::orderBy('level')->get();
        $cells = RiskMatrixCell::all()->keyBy(fn ($c) => "{$c->dampak}-{$c->kemungkinan}");

        return [
            'kriteriaDampak' => $impact->map(fn (RiskImpactCriteria $c) => [
                'level' => $c->level,
                'label' => $c->label,
                'kerugian_negara' => $c->kerugian_negara,
                'penurunan_reputasi' => $c->penurunan_reputasi,
                'penurunan_kinerja' => $c->penurunan_kinerja,
                'gangguan_pelayanan' => $c->gangguan_pelayanan,
                'tuntutan_hukum' => $c->tuntutan_hukum,
            ])->values(),
            'kriteriaKemungkinan' => $likelihood->map(fn (RiskLikelihoodCriteria $c) => [
                'level' => $c->level,
                'nama' => $c->nama,
                'probabilitas' => $c->probabilitas,
                'frekuensi' => $c->frekuensi,
                'toleransi' => $c->toleransi,
            ])->values(),
            'matriksRisiko' => [
                'dampakLabels' => $impact->pluck('label')->values(),
                'kemungkinanLabels' => $likelihood->pluck('nama')->values(),
                'cells' => collect(range(1, 5))->flatMap(function ($dampak) use ($cells) {
                    return collect(range(1, 5))->map(function ($kemungkinan) use ($dampak, $cells) {
                        $cell = $cells->get("{$dampak}-{$kemungkinan}");

                        return [
                            'dampak' => $dampak,
                            'kemungkinan' => $kemungkinan,
                            'skala_risiko' => $cell?->skala_risiko,
                            'warna_class' => $cell?->warna_class ?? 'bg-muted',
                        ];
                    });
                })->values(),
            ],
            'riskLevels' => RiskLevel::orderBy('urutan')->get(['label', 'skala_min', 'skala_max', 'warna_class']),
        ];
    }

    /** Cari kelas warna Tailwind utk badge skala risiko, sumber tabel risk_levels (menggantikan skalaBadgeClass() hardcoded di 3 halaman frontend). */
    public function warnaForSkala(?int $skala): string
    {
        if ($skala === null) {
            return 'bg-muted text-muted-foreground';
        }

        $level = RiskLevel::where('skala_min', '<=', $skala)->where('skala_max', '>=', $skala)->first();

        return $level?->warna_class ?? 'bg-muted text-muted-foreground';
    }
}
