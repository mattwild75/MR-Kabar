import {
  type KriteriaDampakRow,
  type KriteriaKemungkinanRow,
  TabelKriteriaDampak,
  TabelKriteriaKemungkinan,
} from '@/components/ui/matrix-criteria-popover';
import { findRiskLevel, type RiskLevelBand } from '@/lib/risk-level';
import { cn } from '@/lib/utils';

export interface MatriksRisiko {
  dampakLabels: string[];
  kemungkinanLabels: string[];
  cells: { dampak: number; kemungkinan: number; skala_risiko: number | null; warna_class: string }[];
}

/**
 * Langkah penilaian risiko sesudah isian Existing Control: PIC memilih level
 * LANGSUNG dari tabel Kriteria Kemungkinan dan Kriteria Dampak (isi yg sama
 * dgn /keterangan-pendukung), dan skala risikonya langsung keluar dari
 * Matriks Analisis Risiko 5×5 — tanpa lagi mengetik angka 1–5 sendiri.
 *
 * Yang diisi lewat tabel ini (lihat ExistingControlToggleSection):
 * - Existing Control "Tidak": skala Inheren = skala Residual/Current.
 * - Existing Control "Ya": skala Residual/Current; skala Inheren diisi
 *   sesudahnya lewat fitur Isi Nilai Risiko.
 */
export default function PilihKriteriaRisiko({
  judul,
  keterangan,
  dampak,
  kemungkinan,
  onPilih,
  kriteriaDampak,
  kriteriaKemungkinan,
  matriks,
  riskLevels,
}: {
  judul: string;
  keterangan: React.ReactNode;
  dampak: number | null;
  kemungkinan: number | null;
  onPilih: (dampak: number | null, kemungkinan: number | null) => void;
  kriteriaDampak: KriteriaDampakRow[];
  kriteriaKemungkinan: KriteriaKemungkinanRow[];
  matriks: MatriksRisiko;
  riskLevels: RiskLevelBand[];
}) {
  const sel = dampak && kemungkinan ? matriks.cells.find((c) => c.dampak === dampak && c.kemungkinan === kemungkinan) : undefined;
  const skala = sel?.skala_risiko ?? null;
  const level = findRiskLevel(skala, riskLevels);
  const namaK = kriteriaKemungkinan.find((r) => r.level === kemungkinan)?.nama;
  const namaD = kriteriaDampak.find((r) => r.level === dampak)?.label;

  return (
    <div className="space-y-3 rounded-md border border-sky-200 bg-sky-50/40 p-3 dark:border-sky-900 dark:bg-sky-950/20">
      <div>
        <p className="text-sm font-semibold">{judul}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{keterangan}</p>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-semibold">
          a. Kemungkinan — klik satu baris{' '}
          {kemungkinan ? (
            <span className="font-normal text-sky-700 dark:text-sky-300">
              (terpilih: {kemungkinan} - {namaK})
            </span>
          ) : null}
        </p>
        <div className="overflow-x-auto rounded border bg-background [contain:inline-size]">
          <TabelKriteriaKemungkinan rows={kriteriaKemungkinan} pilihan={kemungkinan} onPilih={(k) => onPilih(dampak, k)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-semibold">
          b. Dampak — klik satu level (kolom); bila beberapa area dampak terkena, pakai level yang tertinggi{' '}
          {dampak ? (
            <span className="font-normal text-sky-700 dark:text-sky-300">
              (terpilih: {dampak} - {namaD})
            </span>
          ) : null}
        </p>
        <div className="overflow-x-auto rounded border bg-background [contain:inline-size]">
          <TabelKriteriaDampak rows={kriteriaDampak} pilihan={dampak} onPilih={(d) => onPilih(d, kemungkinan)} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-md border bg-background p-2.5" aria-live="polite">
        {skala !== null ? (
          <>
            <span className={cn('inline-flex min-w-10 justify-center rounded px-2 py-1 text-lg font-bold', sel?.warna_class)}>{skala}</span>
            <div className="text-sm">
              <p className="font-semibold">
                Skala Risiko {skala}
                {level ? ` — ${level.label}` : ''}
              </p>
              <p className="text-xs text-muted-foreground">
                Kemungkinan {kemungkinan} × Dampak {dampak}, dibaca dari Matriks Analisis Risiko 5×5 (peringkat 1–25, bukan perkalian).
              </p>
            </div>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            Skala risiko muncul di sini begitu satu level Kemungkinan dan satu level Dampak dipilih.
          </p>
        )}
      </div>
    </div>
  );
}
