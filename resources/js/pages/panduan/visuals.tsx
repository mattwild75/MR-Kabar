import type { ReactNode } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';

/**
 * Komponen visual reusable untuk halaman /panduan (bagan alur, tabel,
 * diagram pohon, timeline, dsb) — dipisah dari sections.tsx supaya konten
 * teks & komponen visual tidak bercampur dalam satu file raksasa. Semua
 * dibangun HTML/CSS/Tailwind murni (tanpa library chart/diagram baru)
 * supaya ringan dan otomatis ikut tema dark/light aplikasi.
 */

// ─── Flow horizontal (mis. 3 tingkat risiko, 5 respon risiko) ──────────────
interface FlowBoxItem {
  label: string;
  desc?: string;
  tone?: 'default' | 'accent' | 'muted';
}

const toneClass = (tone: FlowBoxItem['tone']) => {
  switch (tone) {
    case 'accent':
      return 'border-sky-500/50 bg-sky-500/10';
    case 'muted':
      return 'border-border bg-muted/40';
    default:
      return 'border-border bg-card';
  }
};

export function FlowHorizontal({ items }: { items: FlowBoxItem[] }) {
  return (
    <div className="not-prose my-3 flex flex-col items-stretch gap-2 overflow-x-auto sm:flex-row sm:items-center">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`min-w-[9rem] flex-1 rounded-lg border p-3 text-center ${toneClass(item.tone)}`}>
            <p className="text-sm font-semibold text-foreground">{item.label}</p>
            {item.desc && <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>}
          </div>
          {i < items.length - 1 && (
            <ArrowRight className="hidden h-5 w-5 shrink-0 text-muted-foreground sm:block" />
          )}
          {i < items.length - 1 && <ArrowDown className="h-5 w-5 shrink-0 self-center text-muted-foreground sm:hidden" />}
        </div>
      ))}
    </div>
  );
}

// ─── Flow vertikal bernomor (mis. 5 tahap proses, langkah tata cara) ───────
interface FlowStepItem {
  title: string;
  desc: ReactNode;
}

export function FlowVertical({ items }: { items: FlowStepItem[] }) {
  return (
    <div className="not-prose my-3 space-y-0">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {i + 1}
            </div>
            {i < items.length - 1 && <div className="my-1 w-px flex-1 bg-border" />}
          </div>
          <div className={`min-w-0 flex-1 ${i < items.length - 1 ? 'pb-4' : ''}`}>
            <p className="font-semibold text-foreground">{item.title}</p>
            <div className="mt-0.5 text-sm text-muted-foreground">{item.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Diagram pohon/hierarki (mis. peta menu, struktur KRS→IRS) ─────────────
interface TreeNode {
  label: string;
  desc?: string;
  children?: TreeNode[];
}

function TreeNodeView({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  return (
    <div className={depth > 0 ? 'ml-4 border-l border-dashed border-border pl-4' : ''}>
      <div className="my-1 inline-block rounded-md border border-border bg-card px-3 py-1.5">
        <p className="text-sm font-medium text-foreground">{node.label}</p>
        {node.desc && <p className="text-xs text-muted-foreground">{node.desc}</p>}
      </div>
      {node.children && node.children.length > 0 && (
        <div>
          {node.children.map((child, i) => (
            <TreeNodeView key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function TreeDiagram({ root }: { root: TreeNode }) {
  return (
    <div className="not-prose my-3 overflow-x-auto rounded-lg border bg-muted/20 p-3">
      <TreeNodeView node={root} />
    </div>
  );
}

// ─── Struktur organisasi berjenjang (mis. UPR, Three Lines of Defense) ─────
interface OrgLevel {
  label: string;
  items: string[];
  tone?: FlowBoxItem['tone'];
}

export function OrgChart({ levels }: { levels: OrgLevel[] }) {
  return (
    <div className="not-prose my-3 space-y-2">
      {levels.map((level, i) => (
        <div key={i}>
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {level.label}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {level.items.map((item, j) => (
              <div key={j} className={`rounded-md border px-3 py-1.5 text-sm ${toneClass(level.tone)}`}>
                {item}
              </div>
            ))}
          </div>
          {i < levels.length - 1 && (
            <div className="mt-2 flex justify-center">
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Timeline siklus (mis. siklus tahunan RPJMD/Renstra/Renja) ─────────────
interface TimelineItem {
  period: string;
  label: string;
  desc?: string;
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="not-prose my-3 space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3">
          <div className="w-20 shrink-0 text-right text-xs font-semibold text-primary">{item.period}</div>
          <div className="relative flex flex-col items-center">
            <div className="h-3 w-3 shrink-0 rounded-full border-2 border-primary bg-background" />
            {i < items.length - 1 && <div className="w-px flex-1 bg-border" />}
          </div>
          <div className={`min-w-0 flex-1 ${i < items.length - 1 ? 'pb-3' : ''}`}>
            <p className="text-sm font-medium text-foreground">{item.label}</p>
            {item.desc && <p className="text-xs text-muted-foreground">{item.desc}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Tabel sederhana dgn header (mis. struktur kode risiko, respon risiko) ─
interface SimpleTableProps {
  headers: string[];
  rows: ReactNode[][];
}

export function SimpleTable({ headers, rows }: SimpleTableProps) {
  return (
    <div className="not-prose my-3 overflow-x-auto rounded-lg border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-muted/50">
            {headers.map((h, i) => (
              <th key={i} className="border-b px-3 py-2 text-left font-semibold text-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 1 ? 'bg-muted/20' : ''}>
              {row.map((cell, j) => (
                <td key={j} className="border-b px-3 py-2 align-top text-muted-foreground last:border-b-0">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Badge kecil berwarna (mis. label kode RSP/RSO/ROO) ────────────────────
export function ColorBadge({ children, color }: { children: ReactNode; color: 'red' | 'amber' | 'emerald' | 'sky' | 'orange' | 'yellow' }) {
  const map = {
    red: 'bg-red-500/15 text-red-600 dark:text-red-400',
    amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    emerald: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    sky: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    orange: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
    yellow: 'bg-yellow-400/20 text-yellow-700 dark:text-yellow-400',
  };
  return <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-semibold ${map[color]}`}>{children}</span>;
}

// ─── Matriks Analisis Risiko 5×5 (Dampak × Kemungkinan → Skala Risiko) ─────
// Warna & rentang skala IDENTIK dgn RiskReferenceDataSeeder::seedRiskLevels()
// (5 level: Sangat Rendah 1-5 s.d. Sangat Tinggi 20-25) & seedSkalaMatrix()
// (nilai per sel dampak×kemungkinan) — kalau Admin mengubah tabel Skala
// Risiko di Settings > Keterangan Pendukung, angka contoh di panduan ini
// bisa saja beda dari kondisi live aplikasi, tapi POLA warnanya tetap sama.
const RISK_MATRIX_SKALA: Record<number, Record<number, number>> = {
  1: { 1: 1, 2: 2, 3: 4, 4: 6, 5: 9 },
  2: { 1: 3, 2: 7, 3: 10, 4: 12, 5: 15 },
  3: { 1: 5, 2: 11, 3: 14, 4: 16, 5: 18 },
  4: { 1: 8, 2: 13, 3: 17, 4: 19, 5: 23 },
  5: { 1: 20, 2: 21, 3: 22, 4: 24, 5: 25 },
};

function warnaSkala(skala: number): string {
  if (skala >= 20) return 'bg-red-500 text-white';
  if (skala >= 16) return 'bg-orange-400 text-white';
  if (skala >= 11) return 'bg-yellow-300 text-black';
  if (skala >= 6) return 'bg-green-400 text-black';
  return 'bg-sky-400 text-white';
}

export function RiskMatrix5x5() {
  const dampakLabels = ['Sangat Rendah', 'Rendah', 'Sedang', 'Tinggi', 'Sangat Tinggi'];
  const kemungkinanLabels = ['Sangat Jarang', 'Jarang', 'Kadang Terjadi', 'Sering Terjadi', 'Hampir Pasti Terjadi'];

  return (
    <div className="not-prose my-3 overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[560px] table-fixed border-collapse text-xs">
        <thead>
          <tr>
            <th colSpan={7} className="border-b bg-muted/50 p-2 text-center text-sm font-bold text-foreground">
              Matriks Analisis Risiko (Dampak × Kemungkinan)
            </th>
          </tr>
          <tr className="bg-muted/40">
            <th colSpan={2} className="border-b px-2 py-1.5 text-left font-semibold text-foreground">
              Level Kemungkinan
            </th>
            <th colSpan={5} className="border-b px-2 py-1.5 text-center font-semibold text-foreground">
              Dampak
            </th>
          </tr>
          <tr className="bg-muted/40">
            <th className="border-b px-2 py-1"></th>
            <th className="border-b px-2 py-1"></th>
            {dampakLabels.map((label, i) => (
              <th key={label} className="border-b px-1 py-1 text-center font-semibold text-foreground">
                {i + 1}
                <div className="text-[10px] font-normal text-muted-foreground">{label}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[5, 4, 3, 2, 1].map((kemungkinan) => (
            <tr key={kemungkinan}>
              <th className="border-b px-2 py-1.5 text-center font-semibold text-foreground">{kemungkinan}</th>
              <th className="border-b px-2 py-1.5 text-left font-semibold whitespace-nowrap text-foreground">
                {kemungkinanLabels[kemungkinan - 1]}
              </th>
              {[1, 2, 3, 4, 5].map((dampak) => {
                const skala = RISK_MATRIX_SKALA[dampak][kemungkinan];
                return (
                  <td key={dampak} className={`border-b px-1 py-1.5 text-center font-semibold ${warnaSkala(skala)}`}>
                    {skala}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Grid kartu statistik mini (mis. 4 kartu Ringkasan Dashboard) ──────────
interface StatCardItem {
  label: string;
  value: string;
  desc?: string;
  tone?: 'default' | 'accent' | 'muted';
}

export function StatCardGrid({ items }: { items: StatCardItem[] }) {
  return (
    <div className="not-prose my-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((item, i) => (
        <div key={i} className={`rounded-lg border p-3 ${toneClass(item.tone)}`}>
          <p className="text-xs text-muted-foreground">{item.label}</p>
          <p className="mt-0.5 text-xl font-bold text-foreground">{item.value}</p>
          {item.desc && <p className="mt-0.5 text-[11px] text-muted-foreground">{item.desc}</p>}
        </div>
      ))}
    </div>
  );
}

// ─── Grid ikon widget berlabel (mis. peta 15 widget Dashboard per seksi) ───
interface WidgetItem {
  title: string;
  desc: string;
}

export function WidgetGrid({ items }: { items: WidgetItem[] }) {
  return (
    <div className="not-prose my-3 grid gap-2 sm:grid-cols-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-md border bg-card p-2.5">
          <p className="text-xs font-semibold text-foreground">{item.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Bar horizontal mini (mis. distribusi kategori risiko, kepatuhan OPD) ──
interface BarItem {
  label: string;
  value: number;
  max: number;
  tone?: 'default' | 'accent' | 'muted';
}

export function MiniBarChart({ items }: { items: BarItem[] }) {
  return (
    <div className="not-prose my-3 space-y-2 rounded-lg border p-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-32 shrink-0 truncate text-xs text-muted-foreground">{item.label}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${item.tone === 'accent' ? 'bg-sky-500' : 'bg-primary'}`}
              style={{ width: `${Math.max(4, (item.value / item.max) * 100)}%` }}
            />
          </div>
          <span className="w-6 shrink-0 text-right text-xs font-semibold text-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Penanda kecil "widget ini bisa diklik utk rincian" ────────────────────
export function InteractiveTag() {
  return (
    <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-sky-600 dark:text-sky-400">
      🖱️ Bisa diklik
    </span>
  );
}

// ─── Diagram siklus 4-Skor Risiko (Inheren → Residual → Target → Aktual) ───
interface SkorTahap {
  label: string;
  skala: number;
  keterangan: string;
  warna: string;
}

export function SkorEmpatTahapDiagram({ items }: { items: SkorTahap[] }) {
  const max = 25;
  return (
    <div className="not-prose my-3 rounded-lg border p-4">
      <div className="flex items-end gap-4 overflow-x-auto pb-2">
        {items.map((item, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-sm font-bold text-foreground">{item.skala}</span>
            <div className="flex h-32 w-full items-end justify-center rounded-md bg-muted/40">
              <div
                className={`w-8 rounded-t-sm ${item.warna}`}
                style={{ height: `${Math.max(6, (item.skala / max) * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-center text-xs font-semibold text-foreground">{item.label}</p>
            <p className="text-center text-[11px] text-muted-foreground">{item.keterangan}</p>
            {i < items.length - 1 && (
              <ArrowRight className="mt-1 hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Mockup matriks 5×5 interaktif (ilustrasi tombol "Isi Nilai Risiko") ───
// BUKAN komponen fungsional (tidak bisa benar-benar diklik) — murni mockup
// visual utk memperlihatkan tampilan risk-matrix-picker-dialog.tsx: sel yg
// sudah ditandai badge titik (I/R/T/A), kursor pointer di sel lain.
interface MatrixMarkedPoint {
  dampak: number;
  kemungkinan: number;
  label: string;
  warna: string;
}

export function RiskMatrixInteractivePreview({ points }: { points: MatrixMarkedPoint[] }) {
  const dampakLabels = ['Sangat Rendah', 'Rendah', 'Sedang', 'Tinggi', 'Sangat Tinggi'];
  const kemungkinanLabels = ['Sangat Jarang', 'Jarang', 'Kadang Terjadi', 'Sering Terjadi', 'Hampir Pasti Terjadi'];

  const pointsAt = (dampak: number, kemungkinan: number) =>
    points.filter((p) => p.dampak === dampak && p.kemungkinan === kemungkinan);

  return (
    <div className="not-prose my-3 overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[560px] table-fixed border-collapse text-xs">
        <thead>
          <tr>
            <th colSpan={7} className="border-b bg-muted/50 p-2 text-center text-sm font-bold text-foreground">
              Isi Nilai Risiko — klik sel utk mengisi titik yang sedang aktif
            </th>
          </tr>
          <tr className="bg-muted/40">
            <th colSpan={2} className="border-b px-2 py-1.5 text-left font-semibold text-foreground">
              Level Kemungkinan
            </th>
            <th colSpan={5} className="border-b px-2 py-1.5 text-center font-semibold text-foreground">
              Dampak
            </th>
          </tr>
          <tr className="bg-muted/40">
            <th className="border-b px-2 py-1"></th>
            <th className="border-b px-2 py-1"></th>
            {dampakLabels.map((label, i) => (
              <th key={label} className="border-b px-1 py-1 text-center font-semibold text-foreground">
                {i + 1}
                <div className="text-[10px] font-normal text-muted-foreground">{label}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[5, 4, 3, 2, 1].map((kemungkinan) => (
            <tr key={kemungkinan}>
              <th className="border-b px-2 py-1.5 text-center font-semibold text-foreground">{kemungkinan}</th>
              <th className="border-b px-2 py-1.5 text-left font-semibold whitespace-nowrap text-foreground">
                {kemungkinanLabels[kemungkinan - 1]}
              </th>
              {[1, 2, 3, 4, 5].map((dampak) => {
                const skala = RISK_MATRIX_SKALA[dampak][kemungkinan];
                const marked = pointsAt(dampak, kemungkinan);
                return (
                  <td
                    key={dampak}
                    className={`relative cursor-pointer border-b px-1 py-1.5 text-center font-semibold ${warnaSkala(skala)}`}
                  >
                    {skala}
                    {marked.length > 0 && (
                      <div className="mt-0.5 flex flex-wrap justify-center gap-0.5">
                        {marked.map((m, i) => (
                          <span
                            key={i}
                            className={`inline-flex h-4 w-4 items-center justify-center rounded-full border text-[9px] font-bold text-white shadow ${m.warna}`}
                            title={m.label}
                          >
                            {m.label[0]}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Mockup dua-kolom "Ya vs Tidak" toggle Existing Control ────────────────
interface ToggleCompareColumn {
  label: string;
  aktif: boolean;
  fields: string[];
}

export function ToggleCompare({ columns }: { columns: ToggleCompareColumn[] }) {
  return (
    <div className="not-prose my-3 grid gap-3 sm:grid-cols-2">
      {columns.map((col, i) => (
        <div
          key={i}
          className={`rounded-lg border p-3 ${col.aktif ? 'border-sky-500/50 bg-sky-500/10' : 'border-border bg-muted/20'}`}
        >
          <div className="mb-2 flex items-center gap-2">
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                col.aktif ? 'bg-sky-500 text-white' : 'border border-border bg-transparent text-foreground'
              }`}
            >
              {col.label}
            </span>
          </div>
          <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            {col.fields.map((f, j) => (
              <li key={j}>{f}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ─── Preview blok penanda tangan majemuk (Form Cetak 6 & 7) ────────────────
interface SignatureItem {
  jabatan: string;
  nama: string;
  nip?: string;
}

export function SignatureBlockPreview({ items }: { items: SignatureItem[] }) {
  return (
    <div className="not-prose my-3 rounded-lg border bg-muted/10 p-4">
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item, i) => (
          <div key={i} className="text-center">
            <p className="text-xs font-semibold text-foreground">{item.jabatan}</p>
            <div className="mt-6">
              <p className="text-xs font-semibold text-foreground underline underline-offset-2">{item.nama}</p>
              {item.nip && <p className="text-[10px] text-muted-foreground">NIP. {item.nip}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
