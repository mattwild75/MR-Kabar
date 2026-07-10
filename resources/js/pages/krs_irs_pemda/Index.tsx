import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import RiskSummaryCard, { type RiskSummaryGroup, type RiskSummaryItem } from '@/components/ui/risk-summary-card';
import { ChevronDown, ChevronRight, ChevronUp, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LEVEL_COLORS } from '@/lib/hierarchy-level-colors';

interface Row {
  [key: string]: string | number | null;
}

interface PageProps {
  rows: Row[];
}

interface ProgramGroup {
  id: string;
  /** Baris pertama untuk Program ini — dipakai untuk field non-risiko (Outcome/IK Program dll, identik di semua baris Program yang sama). */
  row: Row;
  /** Semua baris yang punya URAIAN_RISIKO untuk Program ini — satu Program bisa punya lebih dari satu Risiko. */
  risikoRows: Row[];
  hasRisiko: boolean;
}

interface SasaranGroup {
  id: string;
  sasaran: string;
  ikSasaran: Row | null;
  programs: ProgramGroup[];
}

interface TujuanGroup {
  id: string;
  tujuan: string;
  ikTujuan: Row | null;
  sasarans: SasaranGroup[];
}

interface MisiGroup {
  id: string;
  misi: string;
  tujuans: TujuanGroup[];
}

interface VisiGroup {
  id: string;
  visi: string;
  misis: MisiGroup[];
}

/**
 * Data sumbernya flat (satu baris = satu Program, kadang diulang kalau satu
 * Sasaran punya banyak Risiko) — dikelompokkan ulang di sini jadi
 * Visi > Misi > Tujuan > Sasaran > Program, supaya teks yang sama pada tiap
 * level (mis. Visi/Misi/Tujuan/Sasaran identik di banyak baris) hanya
 * tampil SEKALI, bukan berulang seperti pada tabel/kartu datar.
 */
function groupHierarchy(rows: Row[]): VisiGroup[] {
  const visis = new Map<string, VisiGroup>();
  const misis = new Map<string, MisiGroup>();
  const tujuans = new Map<string, TujuanGroup>();
  const sasarans = new Map<string, SasaranGroup>();
  const programSeenPerSasaran = new Map<string, Set<string>>();

  rows.forEach((row, i) => {
    const visiKey = String(row.VISI ?? `(tanpa visi)-${i}`);
    const misiKey = `${visiKey}||${row.MISI ?? `(tanpa misi)-${i}`}`;
    const tujuanKey = `${misiKey}||${row.TUJUAN_RPJMD ?? `(tanpa tujuan)-${i}`}`;
    const sasaranKey = `${tujuanKey}||${row.SASARAN_RPJMD ?? `(tanpa sasaran)-${i}`}`;

    if (!visis.has(visiKey)) {
      visis.set(visiKey, { id: visiKey, visi: visiKey, misis: [] });
    }
    if (!misis.has(misiKey)) {
      const misiGroup: MisiGroup = { id: misiKey, misi: String(row.MISI ?? '-'), tujuans: [] };
      misis.set(misiKey, misiGroup);
      visis.get(visiKey)!.misis.push(misiGroup);
    }
    if (!tujuans.has(tujuanKey)) {
      const tujuanGroup: TujuanGroup = {
        id: tujuanKey,
        tujuan: String(row.TUJUAN_RPJMD ?? '-'),
        ikTujuan: row.IK_TUJUAN_RPJMD ? row : null,
        sasarans: [],
      };
      tujuans.set(tujuanKey, tujuanGroup);
      misis.get(misiKey)!.tujuans.push(tujuanGroup);
    }
    if (!sasarans.has(sasaranKey)) {
      const sasaranGroup: SasaranGroup = {
        id: sasaranKey,
        sasaran: String(row.SASARAN_RPJMD ?? '-'),
        ikSasaran: row.IK_SASARAN_RPJMD ? row : null,
        programs: [],
      };
      sasarans.set(sasaranKey, sasaranGroup);
      tujuans.get(tujuanKey)!.sasarans.push(sasaranGroup);
      programSeenPerSasaran.set(sasaranKey, new Set());
    }

    const sasaranGroup = sasarans.get(sasaranKey)!;
    const programKey = String(row.PROGRAM_PRIORITAS ?? `(tanpa program)-${i}`);
    const seen = programSeenPerSasaran.get(sasaranKey)!;

    // Program yang sama di bawah Sasaran yang sama hanya perlu satu KARTU
    // (baris tambahan dengan Program identik biasanya cuma perbedaan Risiko
    // yang di-attach) — tapi SETIAP baris yang punya Risiko harus disimpan,
    // bukan cuma yang pertama, karena satu Program bisa punya banyak Risiko
    // berbeda (mis. "Stunting" dan "Pelayanan Kesehatan Lambat" pada Program
    // yang sama sebelumnya saling menimpa dan salah satu hilang dari card).
    if (!seen.has(programKey)) {
      seen.add(programKey);
      sasaranGroup.programs.push({
        id: `${sasaranKey}::${programKey}::${i}`,
        row,
        risikoRows: row.URAIAN_RISIKO ? [row] : [],
        hasRisiko: !!row.URAIAN_RISIKO,
      });
    } else if (row.URAIAN_RISIKO) {
      const existing = sasaranGroup.programs.find((p) => String(p.row.PROGRAM_PRIORITAS ?? '') === programKey);
      if (existing) {
        existing.risikoRows.push(row);
        existing.hasRisiko = true;
      }
    }
  });

  return Array.from(visis.values());
}

const skalaRisikoColor = (skala: number | null): string => {
  if (skala === null) return 'bg-muted text-muted-foreground';
  if (skala >= 20) return 'bg-red-500 text-white hover:bg-red-500';
  if (skala >= 16) return 'bg-orange-400 text-white hover:bg-orange-400';
  if (skala >= 11) return 'bg-yellow-300 text-black hover:bg-yellow-300';
  if (skala >= 6) return 'bg-green-400 text-black hover:bg-green-400';
  return 'bg-sky-400 text-white hover:bg-sky-400';
};

function Field({ label, value, query = '' }: { label: string; value: string | number | null; query?: string }) {
  if (value === null || value === '') return null;
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm whitespace-pre-line">
        <HighlightText text={String(value)} query={query} />
      </p>
    </div>
  );
}

/** Satu Program bisa dijalankan lebih dari satu OPD — satu OPD per baris. */
function splitLines(value: string | number | null): string[] {
  if (value === null || value === '') return [];
  return String(value)
    .split('\n')
    .map((v) => v.trim())
    .filter((v) => v !== '');
}

/**
 * Pecah nilai berformat "Label kode :\n> a\n> b" ATAU "> a\n> b" (dua-duanya
 * dipakai backend tergantung field, lihat KrsIrsSyncService::mergeIkColumns/
 * mergeIkNamesOnly/simpleFormat) menjadi array baris polos ["a", "b"], supaya
 * bisa dirender sejajar sebagai tabel alih-alih satu baris teks panjang.
 * Baris yang tidak diawali "> " dianggap baris label judul dan dibuang.
 */
function parseIkLines(value: string | number | null): string[] {
  if (value === null || value === '') return [];
  return String(value)
    .split('\n')
    .filter((line) => /^>\s*/.test(line.trim()))
    .map((line) => line.trim().replace(/^>\s*/, '').trim())
    .filter((line) => line !== '');
}

/** Tabel Indikator | Baseline | Target | OPD, satu baris per indikator. */
function IkTable({
  label,
  ik,
  baseline,
  target,
  opd,
  query,
}: {
  label: string;
  ik: string | number | null;
  baseline: string | number | null;
  target: string | number | null;
  opd: string | number | null;
  query: string;
}) {
  const ikLines = parseIkLines(ik);
  if (ikLines.length === 0) return null;

  const baselineLines = parseIkLines(baseline);
  const targetLines = parseIkLines(target);
  const opdLines = parseIkLines(opd);
  const rowCount = Math.max(ikLines.length, baselineLines.length, targetLines.length, opdLines.length);

  return (
    <div className="overflow-hidden rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">{label}</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Baseline</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Target</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">OPD</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }).map((_, i) => (
            <tr key={i} className="border-t align-top">
              <td className="px-3 py-2">{ikLines[i] ? <HighlightText text={ikLines[i]} query={query} /> : '-'}</td>
              <td className="px-3 py-2 text-muted-foreground">
                {baselineLines[i] ? <HighlightText text={baselineLines[i]} query={query} /> : '-'}
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                {targetLines[i] ? <HighlightText text={targetLines[i]} query={query} /> : '-'}
              </td>
              <td className="px-3 py-2 text-muted-foreground">{opdLines[i] ? <HighlightText text={opdLines[i]} query={query} /> : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function keyOf(kind: 'visi' | 'misi' | 'tujuan' | 'sasaran' | 'program', id: string): string {
  return `${kind}:${id}`;
}

/** Semua nilai teks pada baris Program DAN seluruh baris Risiko-nya yang dianggap "isi" pencarian. */
function programMatches(program: ProgramGroup, q: string): boolean {
  const rowMatches = (r: Row) => Object.values(r).some((v) => v !== null && String(v).toLowerCase().includes(q));
  return rowMatches(program.row) || program.risikoRows.some(rowMatches);
}

/**
 * Mengumpulkan node (visi/misi/tujuan/sasaran/program) yang TEKS-nya SENDIRI
 * cocok dengan query, dalam urutan render (DFS) — ini yang jadi target
 * next/previous, seperti Ctrl+F melompat ke teks yang match, bukan ke
 * container-nya. Juga mengembalikan peta ancestor per key supaya node yang
 * tersembunyi bisa di-expand otomatis saat dilompati.
 */
function collectMatches(visis: VisiGroup[], q: string): { matches: string[]; ancestors: Map<string, string[]> } {
  const matches: string[] = [];
  const ancestors = new Map<string, string[]>();

  for (const visi of visis) {
    const visiKey = keyOf('visi', visi.id);
    if (visi.visi.toLowerCase().includes(q)) {
      matches.push(visiKey);
      ancestors.set(visiKey, []);
    }
    for (const misi of visi.misis) {
      const misiKey = keyOf('misi', misi.id);
      if (misi.misi.toLowerCase().includes(q)) {
        matches.push(misiKey);
        ancestors.set(misiKey, [visiKey]);
      }
      for (const tujuan of misi.tujuans) {
        const tujuanKey = keyOf('tujuan', tujuan.id);
        if (tujuan.tujuan.toLowerCase().includes(q)) {
          matches.push(tujuanKey);
          ancestors.set(tujuanKey, [visiKey, misiKey]);
        }
        for (const sasaran of tujuan.sasarans) {
          const sasaranKey = keyOf('sasaran', sasaran.id);
          if (sasaran.sasaran.toLowerCase().includes(q)) {
            matches.push(sasaranKey);
            ancestors.set(sasaranKey, [visiKey, misiKey, tujuanKey]);
          }
          for (const program of sasaran.programs) {
            if (programMatches(program, q)) {
              const programKey = keyOf('program', program.id);
              matches.push(programKey);
              ancestors.set(programKey, [visiKey, misiKey, tujuanKey, sasaranKey]);
            }
          }
        }
      }
    }
  }

  return { matches, ancestors };
}

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;

  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let idx = lower.indexOf(q, cursor);

  if (idx === -1) return <>{text}</>;

  while (idx !== -1) {
    if (idx > cursor) parts.push(text.slice(cursor, idx));
    parts.push(
      <mark key={idx} className="rounded-sm bg-yellow-300 px-0.5 text-inherit dark:bg-yellow-600">
        {text.slice(idx, idx + query.length)}
      </mark>,
    );
    cursor = idx + query.length;
    idx = lower.indexOf(q, cursor);
  }
  if (cursor < text.length) parts.push(text.slice(cursor));

  return <>{parts}</>;
}

interface TreeCommonProps {
  query: string;
  currentMatchKey: string | null;
  activeAncestorKeys: Set<string>;
  expanded: Set<string>;
  onToggle: (key: string, open: boolean) => void;
  registerRef: (key: string, el: HTMLElement | null) => void;
}

function ProgramItem({ program, query, currentMatchKey, registerRef }: { program: ProgramGroup } & Omit<TreeCommonProps, 'activeAncestorKeys' | 'expanded' | 'onToggle'>) {
  const [open, setOpen] = useState(false);
  const row = program.row;
  const opdList = splitLines(row.OPD_PENANGGUNGJAWAB_PROGRAM);
  const key = keyOf('program', program.id);
  const isCurrent = currentMatchKey === key;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div ref={(el) => registerRef(key, el)} className={`rounded-md border-l-4 ${LEVEL_COLORS.program.border} ${isCurrent ? 'ring-2 ring-orange-500' : ''}`}>
        <CollapsibleTrigger className="flex w-full items-start gap-2 rounded-md px-3 py-2 text-left hover:bg-muted/50">
          <ChevronRight className={`mt-0.5 h-4 w-4 shrink-0 transition-transform ${LEVEL_COLORS.program.chevron} ${open ? 'rotate-90' : ''}`} />
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-medium ${LEVEL_COLORS.program.text}`}>
              <HighlightText text={String(row.PROGRAM_PRIORITAS ?? '-')} query={query} />
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {opdList.map((opd) => (
                <Badge key={opd} variant="outline" className="font-normal">
                  <HighlightText text={opd} query={query} />
                </Badge>
              ))}
              {program.risikoRows.map((risikoRow, i) => (
                <Badge key={i} variant="secondary" className="font-normal">
                  Risiko: <HighlightText text={String(risikoRow.URAIAN_RISIKO ?? '')} query={query} />
                </Badge>
              ))}
            </div>
          </div>
          {program.risikoRows.length > 1 && <Badge variant="outline" className="shrink-0">{program.risikoRows.length} risiko</Badge>}
          {program.risikoRows.length === 1 &&
            (() => {
              const skalaRisiko = program.risikoRows[0].SKALA_RISIKO != null ? Number(program.risikoRows[0].SKALA_RISIKO) : null;
              return skalaRisiko !== null ? <Badge className={`shrink-0 ${skalaRisikoColor(skalaRisiko)}`}>Skala {skalaRisiko}</Badge> : null;
            })()}
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="space-y-4 px-3 pb-3 pl-9">
        <section className="space-y-2">
          <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Program Prioritas</h4>
          <div className="grid grid-cols-1 gap-3 rounded-md border bg-muted/30 p-3 sm:grid-cols-2">
            <Field label="Outcome Program" value={row.OUTCOME_PROGRAM_PRIORITAS} query={query} />
            <Field label="IK Program" value={row.IK_PROGRAM_PRIORITAS} query={query} />
            <Field label="Baseline IK Program" value={row.BASELINE_IK_PROGRAM_PRIORITAS} query={query} />
            <Field label="Target IK Program" value={row.TARGET_IK_PROGRAM_PRIORITAS} query={query} />
          </div>
        </section>

        {program.risikoRows.map((risikoRow, i) => {
          const skalaRisiko = risikoRow.SKALA_RISIKO != null ? Number(risikoRow.SKALA_RISIKO) : null;
          return (
            <section key={i} className="space-y-2">
              <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Risiko{program.risikoRows.length > 1 ? ` ${i + 1}` : ''}
              </h4>
              <div className="grid grid-cols-1 gap-3 rounded-md border bg-muted/30 p-3 sm:grid-cols-3">
                <Field label="Uraian Risiko" value={risikoRow.URAIAN_RISIKO} query={query} />
                <Field label="Tingkat Risiko" value={risikoRow.TINGKAT_RISIKO} query={query} />
                <Field label="Tahun Dinilai" value={risikoRow.TAHUN_DINILAI_RISIKO} query={query} />
                <Field label="Jenis Risiko" value={risikoRow.JENIS_RISIKO} query={query} />
                <Field label="Entitas PD yang Menilai" value={risikoRow.ENTITAS_PD_YANG_MENILAI} query={query} />
                <Field label="Nomor Urut Risiko" value={risikoRow.NOMOR_URUT_RISIKO} query={query} />
                <Field label="Pemilik Risiko" value={risikoRow.PEMILIK_RISIKO} query={query} />
                <Field label="Uraian Penyebab Risiko" value={risikoRow.URAIAN_PENYEBAB_RISIKO} query={query} />
                <Field label="Sumber Sebab Risiko" value={risikoRow.SUMBER_SEBAB_RISIKO} query={query} />
                <Field label="C/UC" value={risikoRow.C_UC} query={query} />
                <Field label="Uraian Dampak Risiko" value={risikoRow.URAIAN_DAMPAK_RISIKO} query={query} />
                <Field label="Pihak Terkena Dampak" value={risikoRow.PIHAK_TERKENA_DAMPAK_RISIKO} query={query} />
                <Field label="Pengendalian yang Sudah Ada" value={risikoRow.URAIAN_PENGENDALIAN_YANG_SUDAH_ADA} query={query} />
                <Field label="Celah Pengendalian" value={risikoRow.CELAH_PENGENDALIAN} query={query} />
                <Field label="Rencana Tindak Pengendalian" value={risikoRow.RENCANA_TINDAK_PENGENDALIAN} query={query} />
                <Field label="Pemilik/Penanggung Jawab" value={risikoRow.PEMILIK_PENANGGUNGJAWAB} query={query} />
                <Field label="Triwulan" value={risikoRow.TRIWULAN} query={query} />
                <Field label="Tahun Target Penyelesaian" value={risikoRow.TAHUN_TARGET_PENYELESAIAN} query={query} />
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="outline">Skala Dampak: {risikoRow.SKALA_DAMPAK ?? '-'}</Badge>
                <Badge variant="outline">Skala Kemungkinan: {risikoRow.SKALA_KEMUNGKINAN ?? '-'}</Badge>
                <Badge className={skalaRisikoColor(skalaRisiko)}>Skala Risiko: {skalaRisiko ?? '-'}</Badge>
                <Badge variant="outline">Skala Prioritas: {risikoRow.SKALA_PRIORITAS ?? '-'}</Badge>
              </div>
            </section>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}

function SasaranRow({
  group,
  query,
  currentMatchKey,
  expanded,
  onToggle,
  registerRef,
}: { group: SasaranGroup } & Omit<TreeCommonProps, 'activeAncestorKeys'>) {
  const key = keyOf('sasaran', group.id);
  const open = expanded.has(key);
  const isCurrent = currentMatchKey === key;
  const riskCount = group.programs.reduce((n, p) => n + p.risikoRows.length, 0);

  return (
    <Collapsible open={open} onOpenChange={(o) => onToggle(key, o)}>
      <div ref={(el) => registerRef(key, el)} className={`rounded-md border-l-4 ${LEVEL_COLORS.sasaran.border} ${isCurrent ? 'ring-2 ring-orange-500' : ''}`}>
        <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-muted/50">
          <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${LEVEL_COLORS.sasaran.chevron} ${open ? 'rotate-90' : ''}`} />
          <span className={`flex-1 font-medium ${LEVEL_COLORS.sasaran.text}`}>
            <HighlightText text={group.sasaran} query={query} />
          </span>
          <Badge variant="secondary" className="shrink-0">
            {group.programs.length} program
          </Badge>
          {riskCount > 0 && (
            <Badge variant="outline" className="shrink-0">
              {riskCount} risiko
            </Badge>
          )}
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2 px-3 pb-3 pl-9">
        <IkTable
          label="IK Sasaran"
          ik={group.ikSasaran?.IK_SASARAN_RPJMD ?? null}
          baseline={group.ikSasaran?.BASELINE_IK_SASARAN_RPJMD ?? null}
          target={group.ikSasaran?.TARGET_IK_SASARAN_RPJMD ?? null}
          opd={group.ikSasaran?.OPD_IK_SASARAN_RPJMD ?? null}
          query={query}
        />
        <div className="mt-2 divide-y rounded-md border">
          {group.programs.map((program) => (
            <ProgramItem key={program.id} program={program} query={query} currentMatchKey={currentMatchKey} registerRef={registerRef} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function TujuanRow({ group, query, currentMatchKey, activeAncestorKeys, expanded, onToggle, registerRef }: { group: TujuanGroup } & TreeCommonProps) {
  const key = keyOf('tujuan', group.id);
  const open = expanded.has(key) || activeAncestorKeys.has(key);
  const isCurrent = currentMatchKey === key;

  return (
    <Collapsible open={open} onOpenChange={(o) => onToggle(key, o)}>
      <div ref={(el) => registerRef(key, el)} className={`rounded-md border-l-4 ${LEVEL_COLORS.tujuan.border} ${isCurrent ? 'ring-2 ring-orange-500' : ''}`}>
        <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-muted/50">
          <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${LEVEL_COLORS.tujuan.chevron} ${open ? 'rotate-90' : ''}`} />
          <span className={`flex-1 font-medium ${LEVEL_COLORS.tujuan.text}`}>
            <HighlightText text={group.tujuan} query={query} />
          </span>
          <Badge variant="secondary" className="shrink-0">
            {group.sasarans.length} sasaran
          </Badge>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2 px-3 pb-3 pl-9">
        <IkTable
          label="IK Tujuan"
          ik={group.ikTujuan?.IK_TUJUAN_RPJMD ?? null}
          baseline={group.ikTujuan?.BASELINE_IK_TUJUAN_RPJMD ?? null}
          target={group.ikTujuan?.TARGET_IK_TUJUAN_RPJMD ?? null}
          opd={group.ikTujuan?.OPD_IK_TUJUAN_RPJMD ?? null}
          query={query}
        />
        <div className="mt-2 divide-y rounded-md border">
          {group.sasarans.map((sasaran) => (
            <SasaranRow
              key={sasaran.id}
              group={sasaran}
              query={query}
              currentMatchKey={currentMatchKey}
              expanded={expanded}
              onToggle={onToggle}
              registerRef={registerRef}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function MisiCard({ group, query, currentMatchKey, activeAncestorKeys, expanded, onToggle, registerRef }: { group: MisiGroup } & TreeCommonProps) {
  const key = keyOf('misi', group.id);
  const open = expanded.has(key) || activeAncestorKeys.has(key);
  const isCurrent = currentMatchKey === key;

  return (
    <Collapsible open={open} onOpenChange={(o) => onToggle(key, o)}>
      <div ref={(el) => registerRef(key, el)} className={`rounded-md border-l-4 ${LEVEL_COLORS.misi.border} ${isCurrent ? 'ring-2 ring-orange-500' : ''}`}>
        <CollapsibleTrigger className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/30">
          <ChevronRight className={`h-5 w-5 shrink-0 transition-transform ${LEVEL_COLORS.misi.chevron} ${open ? 'rotate-90' : ''}`} />
          <div className="flex-1">
            <p className={`text-xs font-medium ${LEVEL_COLORS.misi.text}`}>Misi</p>
            <p className={`font-semibold ${LEVEL_COLORS.misi.text}`}>
              <HighlightText text={group.misi} query={query} />
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {group.tujuans.length} tujuan
          </Badge>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="px-3 pb-3">
        <div className="divide-y rounded-md border">
          {group.tujuans.map((tujuan) => (
            <TujuanRow
              key={tujuan.id}
              group={tujuan}
              query={query}
              currentMatchKey={currentMatchKey}
              activeAncestorKeys={activeAncestorKeys}
              expanded={expanded}
              onToggle={onToggle}
              registerRef={registerRef}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function VisiCard({ group, query, currentMatchKey, activeAncestorKeys, expanded, onToggle, registerRef }: { group: VisiGroup } & TreeCommonProps) {
  const key = keyOf('visi', group.id);
  const open = expanded.has(key) || activeAncestorKeys.has(key);
  const isCurrent = currentMatchKey === key;

  return (
    <Card className={`overflow-hidden border-l-4 ${LEVEL_COLORS.visi.border} shadow-sm`}>
      <Collapsible open={open} onOpenChange={(o) => onToggle(key, o)}>
        <div ref={(el) => registerRef(key, el)} className={isCurrent ? 'ring-2 ring-orange-500 rounded-md' : ''}>
          <CollapsibleTrigger className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/30">
            <ChevronRight className={`h-5 w-5 shrink-0 transition-transform ${LEVEL_COLORS.visi.chevron} ${open ? 'rotate-90' : ''}`} />
            <div className="flex-1">
              <p className={`text-xs font-medium ${LEVEL_COLORS.visi.text}`}>Visi</p>
              <p className={`font-semibold ${LEVEL_COLORS.visi.text}`}>
                <HighlightText text={group.visi} query={query} />
              </p>
            </div>
            <Badge variant="secondary" className="shrink-0">
              {group.misis.length} misi
            </Badge>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <CardContent className="space-y-1 border-t pt-4">
            <div className="divide-y rounded-md border">
              {group.misis.map((misi) => (
                <MisiCard
                  key={misi.id}
                  group={misi}
                  query={query}
                  currentMatchKey={currentMatchKey}
                  activeAncestorKeys={activeAncestorKeys}
                  expanded={expanded}
                  onToggle={onToggle}
                  registerRef={registerRef}
                />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default function KrsIrsPemdaIndex({ rows }: PageProps) {
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const nodeRefs = useRef<Map<string, HTMLElement>>(new Map());
  const registerRef = (key: string, el: HTMLElement | null) => {
    if (el) {
      nodeRefs.current.set(key, el);
    } else {
      nodeRefs.current.delete(key);
    }
  };

  const allGroups = useMemo(() => groupHierarchy(rows), [rows]);

  const handleToggle = (key: string, open: boolean) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (open) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  const { matches, ancestors } = useMemo(() => {
    if (!activeQuery) return { matches: [] as string[], ancestors: new Map<string, string[]>() };
    return collectMatches(allGroups, activeQuery);
  }, [allGroups, activeQuery]);

  const currentMatchKey = matches.length > 0 ? (matches[currentMatchIndex] ?? null) : null;

  const activeAncestorKeys = useMemo(() => {
    if (!currentMatchKey) return new Set<string>();
    return new Set(ancestors.get(currentMatchKey) ?? []);
  }, [currentMatchKey, ancestors]);

  const jumpToMatch = (index: number) => {
    if (matches.length === 0) return;
    const wrapped = ((index % matches.length) + matches.length) % matches.length;
    setCurrentMatchIndex(wrapped);

    const key = matches[wrapped];
    const chain = ancestors.get(key) ?? [];
    // Hanya jalur menuju match aktif yang tetap terbuka — cabang lain yang
    // sebelumnya terbuka karena match lain ikut tertutup, supaya fokus
    // pengguna tetap pada satu hasil pada satu waktu (seperti Ctrl+F).
    setExpanded(new Set(chain));
  };

  useEffect(() => {
    if (!currentMatchKey) return;
    const el = nodeRefs.current.get(currentMatchKey);
    if (el) {
      const raf = requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      return () => cancelAnimationFrame(raf);
    }
  }, [currentMatchKey, expanded]);

  const runSearch = () => {
    const q = searchInput.trim().toLowerCase();
    setActiveQuery(q);
    setCurrentMatchIndex(0);

    if (!q) {
      setExpanded(new Set());
      return;
    }

    // Hanya buka jalur menuju hasil pertama — hasil lain tetap tertutup
    // sampai pengguna melompat ke sana lewat next/previous.
    const { matches: found, ancestors: foundAncestors } = collectMatches(allGroups, q);
    const firstChain = found.length > 0 ? (foundAncestors.get(found[0]) ?? []) : [];
    setExpanded(new Set(firstChain));
  };

  const clearSearch = () => {
    setSearchInput('');
    setActiveQuery('');
    setCurrentMatchIndex(0);
    setExpanded(new Set());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeQuery === searchInput.trim().toLowerCase() && matches.length > 0) {
        jumpToMatch(currentMatchIndex + (e.shiftKey ? -1 : 1));
      } else {
        runSearch();
      }
    } else if (e.key === 'Escape') {
      clearSearch();
    }
  };

  const countPrograms = (groups: VisiGroup[]) =>
    groups.reduce(
      (n, v) =>
        n +
        v.misis.reduce(
          (n2, m) => n2 + m.tujuans.reduce((n3, t) => n3 + t.sasarans.reduce((n4, s) => n4 + s.programs.length, 0), 0),
          0,
        ),
      0,
    );

  const totalPrograms = countPrograms(allGroups);

  // Rangkuman risiko per Sasaran RPJMD (awal tabel paling kiri IRS_Pemda) —
  // di-flatten dari struktur Visi>Misi>Tujuan>Sasaran karena kartu ringkasan
  // ini generic per-Sasaran, terlepas dari Visi/Misi/Tujuan mana asalnya.
  const riskSummaryGroups: RiskSummaryGroup[] = useMemo(() => {
    const result: RiskSummaryGroup[] = [];
    allGroups.forEach((visi) =>
      visi.misis.forEach((misi) =>
        misi.tujuans.forEach((tujuan) =>
          tujuan.sasarans.forEach((sasaran) => {
            const risikos: RiskSummaryItem[] = sasaran.programs.flatMap((p) =>
              p.risikoRows.map((r) => ({
                uraian: String(r.URAIAN_RISIKO ?? ''),
                skalaRisiko: r.SKALA_RISIKO != null ? Number(r.SKALA_RISIKO) : null,
                program: String(r.PROGRAM_PRIORITAS ?? '-'),
                outcome: String(r.OUTCOME_PROGRAM_PRIORITAS ?? ''),
                opd: splitLines(r.OPD_PENANGGUNGJAWAB_PROGRAM),
              })),
            );
            if (risikos.length > 0) {
              result.push({ id: sasaran.id, label: sasaran.sasaran, risikos });
            }
          }),
        ),
      ),
    );
    return result;
  }, [allGroups]);

  return (
    <AppLayout>
      <Head title="KRS_IRS_Pemda" />

      <div className="space-y-4 p-4">
        <div>
          <h1 className="text-2xl font-semibold">KRS_IRS_Pemda</h1>
          <p className="text-sm text-muted-foreground">
            Gabungan data RPJMD, Program Prioritas, dan Risiko Strategis — Visi, Misi, Tujuan, Sasaran, dan Program.
          </p>
        </div>

        <RiskSummaryCard groups={riskSummaryGroups} title="Rangkuman Risiko per Sasaran RPJMD" />

        <div className="flex items-center gap-2">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Cari visi, misi, tujuan, sasaran, program, OPD, risiko... (Enter untuk cari/lanjut)"
              className="pr-9 pl-9"
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button type="button" onClick={runSearch}>
            Cari
          </Button>
          {activeQuery && matches.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="mr-1 text-sm text-muted-foreground whitespace-nowrap">
                {currentMatchIndex + 1} / {matches.length}
              </span>
              <Button type="button" variant="outline" size="icon" onClick={() => jumpToMatch(currentMatchIndex - 1)}>
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button type="button" variant="outline" size="icon" onClick={() => jumpToMatch(currentMatchIndex + 1)}>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {activeQuery && (
          <p className="text-sm text-muted-foreground">
            {matches.length > 0 ? `Ditemukan ${matches.length} hasil untuk "${activeQuery}".` : `Tidak ada hasil untuk "${activeQuery}".`}
          </p>
        )}

        {!activeQuery && (
          <p className="text-sm text-muted-foreground">
            Menampilkan {totalPrograms} program.
          </p>
        )}

        <div className="space-y-3">
          {allGroups.length > 0 ? (
            allGroups.map((group) => (
              <VisiCard
                key={group.id}
                group={group}
                query={activeQuery}
                currentMatchKey={currentMatchKey}
                activeAncestorKeys={activeAncestorKeys}
                expanded={expanded}
                onToggle={handleToggle}
                registerRef={registerRef}
              />
            ))
          ) : (
            <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">Tidak ada data.</div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
