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
export function ColorBadge({ children, color }: { children: ReactNode; color: 'red' | 'amber' | 'emerald' | 'sky' }) {
  const map = {
    red: 'bg-red-500/15 text-red-600 dark:text-red-400',
    amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    emerald: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    sky: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  };
  return <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-semibold ${map[color]}`}>{children}</span>;
}
