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

interface SubKegiatanGroup {
  id: string;
  /** Baris pertama untuk SubKegiatan ini — dipakai untuk field non-risiko (IK SubKegiatan dll, identik di semua baris SubKegiatan yang sama). */
  row: Row;
  /** Semua baris yang punya URAIAN_RISIKO untuk SubKegiatan ini — satu SubKegiatan bisa punya lebih dari satu Risiko. */
  risikoRows: Row[];
  hasRisiko: boolean;
}

interface KegiatanGroup {
  id: string;
  kegiatan: string;
  ikKegiatan: Row | null;
  subkegiatans: SubKegiatanGroup[];
}

interface ProgramGroup {
  id: string;
  program: string;
  ikProgram: Row | null;
  kegiatans: KegiatanGroup[];
}

interface SasaranPdGroup {
  id: string;
  sasaran: string;
  ikSasaran: Row | null;
  programs: ProgramGroup[];
}

interface TujuanGroup {
  id: string;
  tujuan: string;
  ikTujuan: Row | null;
  sasarans: SasaranPdGroup[];
}

interface SasaranRpjmdGroup {
  id: string;
  sasaran: string;
  tujuans: TujuanGroup[];
}

/**
 * Data sumbernya flat (satu baris = satu SubKegiatan, kadang diulang kalau
 * satu Sasaran Strategis PD punya banyak Risiko) — dikelompokkan ulang di
 * sini jadi SasaranRPJMD > Tujuan > Sasaran PD > Program > Kegiatan >
 * SubKegiatan, sama pola dengan krs_irs_pemda/Index.tsx tapi dua level
 * lebih dalam (Kegiatan, SubKegiatan).
 */
function groupHierarchy(rows: Row[]): SasaranRpjmdGroup[] {
  const sasaranRpjmds = new Map<string, SasaranRpjmdGroup>();
  const tujuans = new Map<string, TujuanGroup>();
  const sasarans = new Map<string, SasaranPdGroup>();
  const programs = new Map<string, ProgramGroup>();
  const kegiatans = new Map<string, KegiatanGroup>();
  const subkegiatanSeenPerKegiatan = new Map<string, Set<string>>();

  rows.forEach((row, i) => {
    const srKey = String(row.SASARAN_RPJMD ?? `(tanpa sasaran rpjmd)-${i}`);
    const tujuanKey = `${srKey}||${row.TUJUAN_STRATEGIS_PD ?? `(tanpa tujuan)-${i}`}`;
    const sasaranKey = `${tujuanKey}||${row.SASARAN_STRATEGIS_PD ?? `(tanpa sasaran)-${i}`}`;
    const programKey = `${sasaranKey}||${row.PROGRAM_PD ?? `(tanpa program)-${i}`}`;
    const kegiatanKey = `${programKey}||${row.KEGIATAN_PD ?? `(tanpa kegiatan)-${i}`}`;

    if (!sasaranRpjmds.has(srKey)) {
      sasaranRpjmds.set(srKey, { id: srKey, sasaran: srKey, tujuans: [] });
    }
    if (!tujuans.has(tujuanKey)) {
      const tujuanGroup: TujuanGroup = {
        id: tujuanKey,
        tujuan: String(row.TUJUAN_STRATEGIS_PD ?? '-'),
        ikTujuan: row.IK_TUJUAN_STRATEGIS_PD ? row : null,
        sasarans: [],
      };
      tujuans.set(tujuanKey, tujuanGroup);
      sasaranRpjmds.get(srKey)!.tujuans.push(tujuanGroup);
    }
    if (!sasarans.has(sasaranKey)) {
      const sasaranGroup: SasaranPdGroup = {
        id: sasaranKey,
        sasaran: String(row.SASARAN_STRATEGIS_PD ?? '-'),
        ikSasaran: row.IK_SASARAN_STRATEGIS_PD ? row : null,
        programs: [],
      };
      sasarans.set(sasaranKey, sasaranGroup);
      tujuans.get(tujuanKey)!.sasarans.push(sasaranGroup);
    }
    if (!programs.has(programKey)) {
      const programGroup: ProgramGroup = {
        id: programKey,
        program: String(row.PROGRAM_PD ?? '-'),
        ikProgram: row.IK_PROGRAM_PD ? row : null,
        kegiatans: [],
      };
      programs.set(programKey, programGroup);
      sasarans.get(sasaranKey)!.programs.push(programGroup);
    }
    if (!kegiatans.has(kegiatanKey)) {
      const kegiatanGroup: KegiatanGroup = {
        id: kegiatanKey,
        kegiatan: String(row.KEGIATAN_PD ?? '-'),
        ikKegiatan: row.IK_KEGIATAN_PD ? row : null,
        subkegiatans: [],
      };
      kegiatans.set(kegiatanKey, kegiatanGroup);
      programs.get(programKey)!.kegiatans.push(kegiatanGroup);
      subkegiatanSeenPerKegiatan.set(kegiatanKey, new Set());
    }

    const kegiatanGroup = kegiatans.get(kegiatanKey)!;
    const subkegiatanValKey = String(row.SUBKEGIATAN_PD ?? `(tanpa subkegiatan)-${i}`);
    const seen = subkegiatanSeenPerKegiatan.get(kegiatanKey)!;

    // SubKegiatan yang sama di bawah Kegiatan yang sama hanya perlu satu
    // KARTU (baris tambahan dengan SubKegiatan identik biasanya cuma
    // perbedaan Risiko yang di-attach) — tapi SETIAP baris yang punya
    // Risiko harus disimpan, bukan cuma yang pertama, karena satu
    // SubKegiatan bisa punya banyak Risiko berbeda.
    if (!seen.has(subkegiatanValKey)) {
      seen.add(subkegiatanValKey);
      kegiatanGroup.subkegiatans.push({
        id: `${kegiatanKey}::${subkegiatanValKey}::${i}`,
        row,
        risikoRows: row.URAIAN_RISIKO ? [row] : [],
        hasRisiko: !!row.URAIAN_RISIKO,
      });
    } else if (row.URAIAN_RISIKO) {
      const existing = kegiatanGroup.subkegiatans.find((sk) => String(sk.row.SUBKEGIATAN_PD ?? '') === subkegiatanValKey);
      if (existing) {
        existing.risikoRows.push(row);
        existing.hasRisiko = true;
      }
    }
  });

  return Array.from(sasaranRpjmds.values());
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

function splitLines(value: string | number | null): string[] {
  if (value === null || value === '') return [];
  return String(value)
    .split('\n')
    .map((v) => v.trim())
    .filter((v) => v !== '');
}

function parseIkLines(value: string | number | null): string[] {
  if (value === null || value === '') return [];
  return String(value)
    .split('\n')
    .filter((line) => /^>\s*/.test(line.trim()))
    .map((line) => line.trim().replace(/^>\s*/, '').trim())
    .filter((line) => line !== '');
}

function IkTable({
  label,
  ik,
  baseline,
  target,
  query,
}: {
  label: string;
  ik: string | number | null;
  baseline: string | number | null;
  target: string | number | null;
  query: string;
}) {
  const ikLines = parseIkLines(ik);
  if (ikLines.length === 0) return null;

  const baselineLines = parseIkLines(baseline);
  const targetLines = parseIkLines(target);
  const rowCount = Math.max(ikLines.length, baselineLines.length, targetLines.length);

  return (
    <div className="overflow-hidden rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">{label}</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Baseline</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Target</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function keyOf(kind: 'sasaranrpjmd' | 'tujuan' | 'sasaran' | 'program' | 'kegiatan' | 'subkegiatan', id: string): string {
  return `${kind}:${id}`;
}

function subkegiatanMatches(sk: SubKegiatanGroup, q: string): boolean {
  const rowMatches = (r: Row) => Object.values(r).some((v) => v !== null && String(v).toLowerCase().includes(q));
  return rowMatches(sk.row) || sk.risikoRows.some(rowMatches);
}

/**
 * Mengumpulkan node yang TEKS-nya SENDIRI cocok dengan query, dalam urutan
 * render (DFS) — sama pola dengan krs_irs_pemda/Index.tsx tapi enam level.
 */
function collectMatches(sasaranRpjmds: SasaranRpjmdGroup[], q: string): { matches: string[]; ancestors: Map<string, string[]> } {
  const matches: string[] = [];
  const ancestors = new Map<string, string[]>();

  for (const sr of sasaranRpjmds) {
    const srKey = keyOf('sasaranrpjmd', sr.id);
    if (sr.sasaran.toLowerCase().includes(q)) {
      matches.push(srKey);
      ancestors.set(srKey, []);
    }
    for (const tujuan of sr.tujuans) {
      const tujuanKey = keyOf('tujuan', tujuan.id);
      if (tujuan.tujuan.toLowerCase().includes(q)) {
        matches.push(tujuanKey);
        ancestors.set(tujuanKey, [srKey]);
      }
      for (const sasaran of tujuan.sasarans) {
        const sasaranKey = keyOf('sasaran', sasaran.id);
        if (sasaran.sasaran.toLowerCase().includes(q)) {
          matches.push(sasaranKey);
          ancestors.set(sasaranKey, [srKey, tujuanKey]);
        }
        for (const program of sasaran.programs) {
          const programKey = keyOf('program', program.id);
          if (program.program.toLowerCase().includes(q)) {
            matches.push(programKey);
            ancestors.set(programKey, [srKey, tujuanKey, sasaranKey]);
          }
          for (const kegiatan of program.kegiatans) {
            const kegiatanKey = keyOf('kegiatan', kegiatan.id);
            if (kegiatan.kegiatan.toLowerCase().includes(q)) {
              matches.push(kegiatanKey);
              ancestors.set(kegiatanKey, [srKey, tujuanKey, sasaranKey, programKey]);
            }
            for (const sk of kegiatan.subkegiatans) {
              if (subkegiatanMatches(sk, q)) {
                const skKey = keyOf('subkegiatan', sk.id);
                matches.push(skKey);
                ancestors.set(skKey, [srKey, tujuanKey, sasaranKey, programKey, kegiatanKey]);
              }
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

function SubKegiatanItem({
  sk,
  query,
  currentMatchKey,
  registerRef,
}: { sk: SubKegiatanGroup } & Omit<TreeCommonProps, 'activeAncestorKeys' | 'expanded' | 'onToggle'>) {
  const [open, setOpen] = useState(false);
  const row = sk.row;
  const opdList = splitLines(row.OPD_PENANGGUNGJAWAB_KEGIATAN);
  const key = keyOf('subkegiatan', sk.id);
  const isCurrent = currentMatchKey === key;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div ref={(el) => registerRef(key, el)} className={`rounded-md border-l-4 ${LEVEL_COLORS.subkegiatan.border} ${isCurrent ? 'ring-2 ring-orange-500' : ''}`}>
        <CollapsibleTrigger className="flex w-full items-start gap-2 rounded-md px-3 py-2 text-left hover:bg-muted/50">
          <ChevronRight className={`mt-0.5 h-4 w-4 shrink-0 transition-transform ${LEVEL_COLORS.subkegiatan.chevron} ${open ? 'rotate-90' : ''}`} />
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-medium ${LEVEL_COLORS.subkegiatan.text}`}>
              <HighlightText text={String(row.SUBKEGIATAN_PD ?? '-')} query={query} />
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {opdList.map((opd) => (
                <Badge key={opd} variant="outline" className="font-normal">
                  <HighlightText text={opd} query={query} />
                </Badge>
              ))}
              {sk.risikoRows.map((risikoRow, i) => (
                <Badge key={i} variant="secondary" className="font-normal">
                  Risiko: <HighlightText text={String(risikoRow.URAIAN_RISIKO ?? '')} query={query} />
                </Badge>
              ))}
            </div>
          </div>
          {sk.risikoRows.length > 1 && <Badge variant="outline" className="shrink-0">{sk.risikoRows.length} risiko</Badge>}
          {sk.risikoRows.length === 1 &&
            (() => {
              const skalaRisiko = sk.risikoRows[0].SKALA_RISIKO != null ? Number(sk.risikoRows[0].SKALA_RISIKO) : null;
              return skalaRisiko !== null ? <Badge className={`shrink-0 ${skalaRisikoColor(skalaRisiko)}`}>Skala {skalaRisiko}</Badge> : null;
            })()}
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="space-y-4 px-3 pb-3 pl-9">
        <section className="space-y-2">
          <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">SubKegiatan</h4>
          <div className="grid grid-cols-1 gap-3 rounded-md border bg-muted/30 p-3 sm:grid-cols-2">
            <Field label="IK SubKegiatan" value={row.IK_SUBKEGIATAN_PD} query={query} />
            <Field label="Baseline IK SubKegiatan" value={row.BASELINE_IK_SUBKEGIATAN_PD} query={query} />
            <Field label="Target IK SubKegiatan" value={row.TARGET_IK_SUBKEGIATAN_PD} query={query} />
          </div>
        </section>

        {sk.risikoRows.map((risikoRow, i) => {
          const skalaRisiko = risikoRow.SKALA_RISIKO != null ? Number(risikoRow.SKALA_RISIKO) : null;
          return (
            <section key={i} className="space-y-2">
              <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Risiko{sk.risikoRows.length > 1 ? ` ${i + 1}` : ''}
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

function KegiatanRow({
  group,
  query,
  currentMatchKey,
  expanded,
  onToggle,
  registerRef,
}: { group: KegiatanGroup } & Omit<TreeCommonProps, 'activeAncestorKeys'>) {
  const key = keyOf('kegiatan', group.id);
  const open = expanded.has(key);
  const isCurrent = currentMatchKey === key;
  const riskCount = group.subkegiatans.reduce((n, sk) => n + sk.risikoRows.length, 0);

  return (
    <Collapsible open={open} onOpenChange={(o) => onToggle(key, o)}>
      <div ref={(el) => registerRef(key, el)} className={`rounded-md border-l-4 ${LEVEL_COLORS.kegiatan.border} ${isCurrent ? 'ring-2 ring-orange-500' : ''}`}>
        <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-muted/50">
          <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${LEVEL_COLORS.kegiatan.chevron} ${open ? 'rotate-90' : ''}`} />
          <span className={`flex-1 font-medium ${LEVEL_COLORS.kegiatan.text}`}>
            <HighlightText text={group.kegiatan} query={query} />
          </span>
          <Badge variant="secondary" className="shrink-0">
            {group.subkegiatans.length} subkegiatan
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
          label="IK Kegiatan"
          ik={group.ikKegiatan?.IK_KEGIATAN_PD ?? null}
          baseline={group.ikKegiatan?.BASELINE_IK_KEGIATAN_PD ?? null}
          target={group.ikKegiatan?.TARGET_IK_KEGIATAN_PD ?? null}
          query={query}
        />
        <div className="mt-2 divide-y rounded-md border">
          {group.subkegiatans.map((sk) => (
            <SubKegiatanItem key={sk.id} sk={sk} query={query} currentMatchKey={currentMatchKey} registerRef={registerRef} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ProgramRow({ group, query, currentMatchKey, activeAncestorKeys, expanded, onToggle, registerRef }: { group: ProgramGroup } & TreeCommonProps) {
  const key = keyOf('program', group.id);
  const open = expanded.has(key) || activeAncestorKeys.has(key);
  const isCurrent = currentMatchKey === key;

  return (
    <Collapsible open={open} onOpenChange={(o) => onToggle(key, o)}>
      <div ref={(el) => registerRef(key, el)} className={`rounded-md border-l-4 ${LEVEL_COLORS.program.border} ${isCurrent ? 'ring-2 ring-orange-500' : ''}`}>
        <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-muted/50">
          <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${LEVEL_COLORS.program.chevron} ${open ? 'rotate-90' : ''}`} />
          <span className={`flex-1 font-medium ${LEVEL_COLORS.program.text}`}>
            <HighlightText text={group.program} query={query} />
          </span>
          <Badge variant="secondary" className="shrink-0">
            {group.kegiatans.length} kegiatan
          </Badge>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2 px-3 pb-3 pl-9">
        <IkTable
          label="IK Program"
          ik={group.ikProgram?.IK_PROGRAM_PD ?? null}
          baseline={group.ikProgram?.BASELINE_IK_PROGRAM_PD ?? null}
          target={group.ikProgram?.TARGET_IK_PROGRAM_PD ?? null}
          query={query}
        />
        <div className="mt-2 divide-y rounded-md border">
          {group.kegiatans.map((kegiatan) => (
            <KegiatanRow
              key={kegiatan.id}
              group={kegiatan}
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

function SasaranPdRow({ group, query, currentMatchKey, activeAncestorKeys, expanded, onToggle, registerRef }: { group: SasaranPdGroup } & TreeCommonProps) {
  const key = keyOf('sasaran', group.id);
  const open = expanded.has(key) || activeAncestorKeys.has(key);
  const isCurrent = currentMatchKey === key;

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
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2 px-3 pb-3 pl-9">
        <IkTable
          label="IK Sasaran"
          ik={group.ikSasaran?.IK_SASARAN_STRATEGIS_PD ?? null}
          baseline={group.ikSasaran?.BASELINE_IK_SASARAN_STRATEGIS_PD ?? null}
          target={group.ikSasaran?.TARGET_IK_SASARAN_STRATEGIS_PD ?? null}
          query={query}
        />
        <div className="mt-2 divide-y rounded-md border">
          {group.programs.map((program) => (
            <ProgramRow
              key={program.id}
              group={program}
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
          ik={group.ikTujuan?.IK_TUJUAN_STRATEGIS_PD ?? null}
          baseline={group.ikTujuan?.BASELINE_IK_TUJUAN_STRATEGIS_PD ?? null}
          target={group.ikTujuan?.TARGET_IK_TUJUAN_STRATEGIS_PD ?? null}
          query={query}
        />
        <div className="mt-2 divide-y rounded-md border">
          {group.sasarans.map((sasaran) => (
            <SasaranPdRow
              key={sasaran.id}
              group={sasaran}
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

function SasaranRpjmdCard({ group, query, currentMatchKey, activeAncestorKeys, expanded, onToggle, registerRef }: { group: SasaranRpjmdGroup } & TreeCommonProps) {
  const key = keyOf('sasaranrpjmd', group.id);
  const open = expanded.has(key) || activeAncestorKeys.has(key);
  const isCurrent = currentMatchKey === key;

  return (
    <Card className={`overflow-hidden border-l-4 ${LEVEL_COLORS.visi.border} shadow-sm`}>
      <Collapsible open={open} onOpenChange={(o) => onToggle(key, o)}>
        <div ref={(el) => registerRef(key, el)} className={isCurrent ? 'ring-2 ring-orange-500 rounded-md' : ''}>
          <CollapsibleTrigger className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/30">
            <ChevronRight className={`h-5 w-5 shrink-0 transition-transform ${LEVEL_COLORS.visi.chevron} ${open ? 'rotate-90' : ''}`} />
            <div className="flex-1">
              <p className={`text-xs font-medium ${LEVEL_COLORS.visi.text}`}>Sasaran RPJMD (rujukan)</p>
              <p className={`font-semibold ${LEVEL_COLORS.visi.text}`}>
                <HighlightText text={group.sasaran} query={query} />
              </p>
            </div>
            <Badge variant="secondary" className="shrink-0">
              {group.tujuans.length} tujuan
            </Badge>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <CardContent className="space-y-1 border-t pt-4">
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
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default function KrsIrsPdIndex({ rows }: PageProps) {
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

  const countSubkegiatans = (groups: SasaranRpjmdGroup[]) =>
    groups.reduce(
      (n, sr) =>
        n +
        sr.tujuans.reduce(
          (n2, t) =>
            n2 +
            t.sasarans.reduce(
              (n3, s) => n3 + s.programs.reduce((n4, p) => n4 + p.kegiatans.reduce((n5, k) => n5 + k.subkegiatans.length, 0), 0),
              0,
            ),
          0,
        ),
      0,
    );

  const totalSubkegiatans = countSubkegiatans(allGroups);

  // Rangkuman risiko per Sasaran Renstra PD (awal tabel paling kiri
  // IRS_PD/II_b_IRS_PD) — di-flatten dari SasaranRPJMD>Tujuan>SasaranPD,
  // risiko sendiri tercatat di level SubKegiatan (leaf).
  const riskSummaryGroups: RiskSummaryGroup[] = useMemo(() => {
    const result: RiskSummaryGroup[] = [];
    allGroups.forEach((sasaranRpjmd) =>
      sasaranRpjmd.tujuans.forEach((tujuan) =>
        tujuan.sasarans.forEach((sasaranPd) => {
          const risikos: RiskSummaryItem[] = [];
          sasaranPd.programs.forEach((program) =>
            program.kegiatans.forEach((kegiatan) =>
              kegiatan.subkegiatans.forEach((sk) =>
                sk.risikoRows.forEach((r) =>
                  risikos.push({
                    uraian: String(r.URAIAN_RISIKO ?? ''),
                    skalaRisiko: r.SKALA_RISIKO != null ? Number(r.SKALA_RISIKO) : null,
                    program: program.program,
                    // Skema PD tidak punya "Outcome Program" seperti KRS_Pemda —
                    // nama Kegiatan dipakai sebagai konteks tambahan pengganti,
                    // karena berfungsi serupa (detail satu tingkat di bawah Program).
                    outcome: kegiatan.kegiatan,
                    opd: splitLines(r.OPD_PENANGGUNGJAWAB_KEGIATAN),
                  }),
                ),
              ),
            ),
          );
          if (risikos.length > 0) {
            result.push({ id: sasaranPd.id, label: sasaranPd.sasaran, risikos });
          }
        }),
      ),
    );
    return result;
  }, [allGroups]);

  return (
    <AppLayout>
      <Head title="KRS_IRS_PD" />

      <div className="space-y-4 p-4">
        <div>
          <h1 className="text-2xl font-semibold">KRS_IRS_PD</h1>
          <p className="text-sm text-muted-foreground">
            Gabungan data Risiko Strategis Perangkat Daerah — Sasaran RPJMD, Tujuan, Sasaran, Program, Kegiatan, dan SubKegiatan.
          </p>
        </div>

        <RiskSummaryCard groups={riskSummaryGroups} title="Rangkuman Risiko per Sasaran Renstra PD" outcomeLabel="Kegiatan" />

        <div className="flex items-center gap-2">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Cari sasaran, tujuan, program, kegiatan, subkegiatan, OPD, risiko... (Enter untuk cari/lanjut)"
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

        {!activeQuery && <p className="text-sm text-muted-foreground">Menampilkan {totalSubkegiatans} subkegiatan.</p>}

        <div className="space-y-3">
          {allGroups.length > 0 ? (
            allGroups.map((group) => (
              <SasaranRpjmdCard
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
