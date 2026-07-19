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
