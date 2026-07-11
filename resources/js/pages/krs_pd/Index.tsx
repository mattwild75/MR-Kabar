import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import AutocompleteTextarea from '@/components/ui/autocomplete-textarea';
import AutocompleteMultiline from '@/components/ui/autocomplete-multiline';
import AutocompleteSelect from '@/components/ui/autocomplete-select';
import FieldInfoPopover from '@/components/ui/field-info-popover';
import { Checkbox } from '@/components/ui/checkbox';
import OpdFillStatusPanel from '@/components/ui/opd-fill-status-panel';
import { KRS_PD_FIELD_INFO } from '@/lib/krs-pd-field-info';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { ChevronRight, Search, Plus, Edit, Trash2, ChevronUp, ChevronDown, X } from 'lucide-react';
import { canManageRow } from '@/lib/ownership';
import { LEVEL_COLORS } from '@/lib/hierarchy-level-colors';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

const SASARAN_RPJMD_FIELD = 'SASARAN RPJMD';

// Field selain SASARAN RPJMD (yang punya dropdown khusus rujukan) — sisanya
// diketik/dipilih via autocomplete biasa, mengikuti pola krs/Index.tsx.
const FIELDS = [
  'TUJUAN STRATEGIS PD',
  'IK TUJUAN STRATEGIS PD',
  'BASELINE IK TUJUAN STRATEGIS PD',
  'TARGET IK TUJUAN STRATEGIS PD',
  'SATUAN IK TUJUAN STRATEGIS PD',
  'SASARAN STRATEGIS PD',
  'IK SASARAN STRATEGIS PD',
  'BASELINE IK SASARAN STRATEGIS PD',
  'TARGET IK SASARAN STRATEGIS PD',
  'SATUAN IK SASARAN STRATEGIS PD',
  'PROGRAM PD',
  'IK PROGRAM PD',
  'BASELINE IK PROGRAM PD',
  'TARGET IK PROGRAM PD',
  'SATUAN IK PROGRAM PD',
  'KEGIATAN PD',
  'IK KEGIATAN PD',
  'BASELINE IK KEGIATAN PD',
  'TARGET IK KEGIATAN PD',
  'SATUAN IK KEGIATAN PD',
  'SUBKEGIATAN PD',
  'IK SUBKEGIATAN PD',
  'BASELINE IK SUBKEGIATAN PD',
  'TARGET IK SUBKEGIATAN PD',
  'SATUAN IK SUBKEGIATAN PD',
] as const;

const OPD_FIELD = 'OPD PENANGGUNG JAWAB KEGIATAN';

// Field rantai-atas yang HANYA relevan untuk program prioritas (menurun dari
// Sasaran RPJMD). Saat mode NON-PRIORITAS aktif, field ini disembunyikan &
// dikosongkan — program non-prioritas langsung Program→Kegiatan→SubKegiatan.
const PARENT_CHAIN_FIELDS = [
  'TUJUAN STRATEGIS PD',
  'IK TUJUAN STRATEGIS PD',
  'BASELINE IK TUJUAN STRATEGIS PD',
  'TARGET IK TUJUAN STRATEGIS PD',
  'SATUAN IK TUJUAN STRATEGIS PD',
  'SASARAN STRATEGIS PD',
  'IK SASARAN STRATEGIS PD',
  'BASELINE IK SASARAN STRATEGIS PD',
  'TARGET IK SASARAN STRATEGIS PD',
  'SATUAN IK SASARAN STRATEGIS PD',
] as const;
const PARENT_CHAIN_SET = new Set<string>(PARENT_CHAIN_FIELDS);

// Field Program yang bisa auto-terisi dari 1a KRS_Pemda saat PROGRAM PD cocok.
const PROGRAM_AUTOFILL = {
  ik: 'IK PROGRAM PD',
  baseline: 'BASELINE IK PROGRAM PD',
  target: 'TARGET IK PROGRAM PD',
  satuan: 'SATUAN IK PROGRAM PD',
} as const;

// Field yang bisa berisi beberapa nilai sekaligus, satu nilai per baris
// (Enter = baris baru), supaya baris ke-N di IK/Baseline/Target/Satuan/OPD
// saling berpasangan — sama pola dengan krs/Index.tsx.
const MULTI_VALUE_FIELDS = new Set<string>([
  'IK TUJUAN STRATEGIS PD',
  'BASELINE IK TUJUAN STRATEGIS PD',
  'TARGET IK TUJUAN STRATEGIS PD',
  'SATUAN IK TUJUAN STRATEGIS PD',
  'IK SASARAN STRATEGIS PD',
  'BASELINE IK SASARAN STRATEGIS PD',
  'TARGET IK SASARAN STRATEGIS PD',
  'SATUAN IK SASARAN STRATEGIS PD',
  'IK PROGRAM PD',
  'BASELINE IK PROGRAM PD',
  'TARGET IK PROGRAM PD',
  'SATUAN IK PROGRAM PD',
  'IK KEGIATAN PD',
  'BASELINE IK KEGIATAN PD',
  'TARGET IK KEGIATAN PD',
  'SATUAN IK KEGIATAN PD',
]);

type RawRow = Record<string, string | null>;

interface SubKegiatanItem {
  id: number;
  user_id: number | null;
  kode: string;
  nama: string;
  ik_subkegiatan: string | null;
  baseline_ik_subkegiatan: string | null;
  target_ik_subkegiatan: string | null;
  satuan_ik_subkegiatan: string | null;
  opd_penanggungjawab: string | null;
  raw: RawRow;
}

interface KegiatanItem {
  id: string;
  kode: string;
  deskripsi: string;
  ik_kegiatan: string | null;
  baseline_ik_kegiatan: string | null;
  target_ik_kegiatan: string | null;
  satuan_ik_kegiatan: string | null;
  subkegiatans: SubKegiatanItem[];
}

interface ProgramItem {
  id: string;
  kode: string;
  deskripsi: string;
  ik_program: string | null;
  baseline_ik_program: string | null;
  target_ik_program: string | null;
  satuan_ik_program: string | null;
  kegiatans: KegiatanItem[];
}

interface SasaranPdItem {
  id: string;
  kode: string;
  deskripsi: string;
  ik_sasaran: string | null;
  baseline_ik_sasaran: string | null;
  target_ik_sasaran: string | null;
  satuan_ik_sasaran: string | null;
  programs: ProgramItem[];
}

interface TujuanItem {
  id: string;
  kode: string;
  deskripsi: string;
  ik_tujuan: string | null;
  baseline_ik_tujuan: string | null;
  target_ik_tujuan: string | null;
  satuan_ik_tujuan: string | null;
  sasarans: SasaranPdItem[];
}

interface SasaranRpjmdItem {
  id: string;
  kode: string;
  deskripsi: string;
  tujuans: TujuanItem[];
}

// Node top-level NON-PRIORITAS: berbentuk Program (punya kegiatans) tapi tanpa
// rantai Tujuan/Sasaran di atasnya. Ditandai is_non_prioritas untuk dirender
// berbeda di seluruh tree view. Berada di array/level yang SAMA dengan Sasaran
// RPJMD sehingga semua program tampil sejajar.
interface NonPrioritasProgramItem extends ProgramItem {
  is_non_prioritas: true;
  is_prioritas: false;
  // OPD penanggung jawab (agregat dari SubKegiatan di bawahnya) — ditampilkan
  // sbg badge di kartu, seperti program 1a.
  opd_penanggungjawab: string | null;
}

type TopLevelItem = SasaranRpjmdItem | NonPrioritasProgramItem;

function isNonPrioritas(item: TopLevelItem): item is NonPrioritasProgramItem {
  return (item as NonPrioritasProgramItem).is_non_prioritas === true;
}

interface Program1aEntry {
  ik: string;
  baseline: string;
  target: string;
  satuan: string;
}

interface PageProps {
  sasaranRpjmds: TopLevelItem[];
  opdOptions: string[];
  opdList: { id: number; nama: string }[];
  opdFillStatus: Record<number, { jumlah_baris: number; sudah_mulai: boolean }>;
  fieldOptions: Record<string, string[]>;
  program1aMap: Record<string, Program1aEntry>;
  currentUserId: number | null;
  isAdmin: boolean;
}

const keyOf = (level: string, id: string | number) => `${level}:${id}`;

// Normalisasi kunci pencocokan teks Program agar auto-fill dari 1a tidak gagal
// karena beda kapitalisasi/spasi. HARUS selaras dengan matchKey() di
// KrsPdController::program1aMap() (lowercase + spasi ganda dirapikan).
const matchKey = (v: string) => v.replace(/\s+/g, ' ').trim().toLowerCase();

function subkegiatanMatches(sk: SubKegiatanItem, q: string): boolean {
  return (
    sk.nama.toLowerCase().includes(q) ||
    (sk.ik_subkegiatan ?? '').toLowerCase().includes(q) ||
    (sk.opd_penanggungjawab ?? '').toLowerCase().includes(q)
  );
}

function kegiatanMatches(kegiatan: KegiatanItem, q: string): boolean {
  return kegiatan.deskripsi.toLowerCase().includes(q) || (kegiatan.ik_kegiatan ?? '').toLowerCase().includes(q);
}

function programMatches(program: ProgramItem, q: string): boolean {
  return program.deskripsi.toLowerCase().includes(q) || (program.ik_program ?? '').toLowerCase().includes(q);
}

function sasaranPdMatches(sasaran: SasaranPdItem, q: string): boolean {
  return (
    sasaran.deskripsi.toLowerCase().includes(q) ||
    (sasaran.ik_sasaran ?? '').toLowerCase().includes(q)
  );
}

function tujuanMatches(tujuan: TujuanItem, q: string): boolean {
  return (
    tujuan.deskripsi.toLowerCase().includes(q) ||
    (tujuan.ik_tujuan ?? '').toLowerCase().includes(q)
  );
}

/**
 * Mengumpulkan node yang TEKS-nya SENDIRI cocok dengan query, dalam urutan
 * render (DFS) — sama pola dengan krs/Index.tsx tapi enam level (Sasaran
 * RPJMD, Tujuan, Sasaran PD, Program, Kegiatan, SubKegiatan).
 */
// Menelusuri Program→Kegiatan→SubKegiatan sebuah node program, mendaftarkan
// match dengan rantai leluhur yang diberikan. Dipakai bersama oleh jalur
// prioritas (ancestor: Sasaran RPJMD→Tujuan→Sasaran PD) & non-prioritas
// (ancestor: hanya node program itu sendiri) supaya SELURUH tree view —
// termasuk program non-prioritas — ikut tersaring pencarian.
function collectProgramMatches(
  program: ProgramItem,
  programKey: string,
  chainAbove: string[],
  q: string,
  matches: string[],
  ancestors: Map<string, string[]>,
) {
  if (programMatches(program, q)) {
    matches.push(programKey);
    ancestors.set(programKey, chainAbove);
  }
  for (const kegiatan of program.kegiatans) {
    const kegiatanKey = keyOf('kegiatan', kegiatan.id);
    if (kegiatanMatches(kegiatan, q)) {
      matches.push(kegiatanKey);
      ancestors.set(kegiatanKey, [...chainAbove, programKey]);
    }
    for (const sk of kegiatan.subkegiatans) {
      if (subkegiatanMatches(sk, q)) {
        const skKey = keyOf('subkegiatan', sk.id);
        matches.push(skKey);
        ancestors.set(skKey, [...chainAbove, programKey, kegiatanKey]);
      }
    }
  }
}

function collectMatches(
  sasaranRpjmds: TopLevelItem[],
  q: string,
): { matches: string[]; ancestors: Map<string, string[]> } {
  const matches: string[] = [];
  const ancestors = new Map<string, string[]>();

  for (const sr of sasaranRpjmds) {
    // Node NON-PRIORITAS (top-level, berbentuk program) — telusuri langsung
    // sebagai program tanpa rantai Sasaran/Tujuan di atasnya. Ancestor = node
    // induk grup non-prioritas, supaya lompat-ke-hasil meng-expand grupnya.
    if (isNonPrioritas(sr)) {
      const programKey = keyOf('program', sr.id);
      collectProgramMatches(sr, programKey, [keyOf('np-group', 'root')], q, matches, ancestors);
      continue;
    }

    const srKey = keyOf('sasaranrpjmd', sr.id);
    if (sr.deskripsi.toLowerCase().includes(q)) {
      matches.push(srKey);
      ancestors.set(srKey, []);
    }
    for (const tujuan of sr.tujuans) {
      const tujuanKey = keyOf('tujuan', tujuan.id);
      if (tujuanMatches(tujuan, q)) {
        matches.push(tujuanKey);
        ancestors.set(tujuanKey, [srKey]);
      }
      for (const sasaran of tujuan.sasarans) {
        const sasaranKey = keyOf('sasaran', sasaran.id);
        if (sasaranPdMatches(sasaran, q)) {
          matches.push(sasaranKey);
          ancestors.set(sasaranKey, [srKey, tujuanKey]);
        }
        for (const program of sasaran.programs) {
          const programKey = keyOf('program', program.id);
          collectProgramMatches(program, programKey, [srKey, tujuanKey, sasaranKey], q, matches, ancestors);
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

type FormData = Record<(typeof FIELDS)[number] | typeof OPD_FIELD | typeof SASARAN_RPJMD_FIELD, string>;

const emptyForm = (): FormData => {
  const obj = {} as FormData;
  obj[SASARAN_RPJMD_FIELD] = '';
  FIELDS.forEach((f) => (obj[f] = ''));
  obj[OPD_FIELD] = '';
  return obj;
};

function IkInfo({
  label,
  kode,
  ik,
  baseline,
  target,
  satuan,
  opd = null,
  query,
}: {
  label: string;
  kode: string;
  ik: string | null;
  baseline: string | null;
  target: string | null;
  satuan: string | null;
  // OPD pelaksana — di 2a/3a (Renstra) satu OPD menaungi seluruh pohonnya,
  // jadi kolom OPD di tiap tabel IK diisi OPD kegiatan pelaksana di bawahnya.
  opd?: string | null;
  query: string;
}) {
  if (!ik) return null;
  return (
    <div className="mt-3 overflow-hidden rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">
              {label} {kode}
            </th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Baseline</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Target</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Satuan</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">OPD</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t align-top">
            <td className="px-3 py-2 whitespace-pre-line">
              <HighlightText text={ik} query={query} />
            </td>
            <td className="px-3 py-2 whitespace-pre-line text-muted-foreground">
              {baseline ? <HighlightText text={baseline} query={query} /> : '-'}
            </td>
            <td className="px-3 py-2 whitespace-pre-line text-muted-foreground">
              {target ? <HighlightText text={target} query={query} /> : '-'}
            </td>
            <td className="px-3 py-2 whitespace-pre-line text-muted-foreground">
              {satuan ? <HighlightText text={satuan} query={query} /> : '-'}
            </td>
            <td className="px-3 py-2 whitespace-pre-line text-muted-foreground">
              {opd ? <HighlightText text={opd} query={query} /> : '-'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// OPD pelaksana unik dari seluruh SubKegiatan di bawah sebuah node (Tujuan/
// Sasaran/Program/Kegiatan) — digabung 1 OPD/baris. Dipakai mengisi kolom OPD
// tabel IK: di 2a/3a satu OPD (Renstra) menaungi seluruh turunannya.
interface OpdBearing {
  sasarans?: SasaranPdItem[];
  programs?: ProgramItem[];
  kegiatans?: KegiatanItem[];
  subkegiatans?: SubKegiatanItem[];
}
function collectOpd(node: OpdBearing): string {
  const opds: string[] = [];
  const add = (raw: string | null) => {
    (raw ?? '')
      .split('\n')
      .map((o) => o.trim())
      .filter((o) => o !== '')
      .forEach((o) => {
        if (!opds.includes(o)) opds.push(o);
      });
  };
  const walk = (n: OpdBearing) => {
    n.sasarans?.forEach(walk);
    n.programs?.forEach(walk);
    n.kegiatans?.forEach(walk);
    n.subkegiatans?.forEach((sk) => add(sk.opd_penanggungjawab));
  };
  walk(node);
  return opds.join('\n');
}

// ── Edit NODE non-leaf (Tujuan/Sasaran PD/Program/Kegiatan) ────────────────
// Level "_np" = varian NON-PRIORITAS (kolom edit sama dgn prioritasnya, tapi
// identifikasi baris via Program/Kegiatan saja — lihat backend NODE_MATCH_FIELDS).
type NodeLevel = 'tujuan' | 'sasaran' | 'program' | 'kegiatan' | 'program_np' | 'kegiatan_np';

const NODE_LEVEL_FIELDS: Record<NodeLevel, string[]> = {
  tujuan: [
    'TUJUAN STRATEGIS PD', 'IK TUJUAN STRATEGIS PD', 'BASELINE IK TUJUAN STRATEGIS PD',
    'TARGET IK TUJUAN STRATEGIS PD', 'SATUAN IK TUJUAN STRATEGIS PD',
  ],
  sasaran: [
    'SASARAN STRATEGIS PD', 'IK SASARAN STRATEGIS PD', 'BASELINE IK SASARAN STRATEGIS PD',
    'TARGET IK SASARAN STRATEGIS PD', 'SATUAN IK SASARAN STRATEGIS PD',
  ],
  program: [
    'PROGRAM PD', 'IK PROGRAM PD', 'BASELINE IK PROGRAM PD',
    'TARGET IK PROGRAM PD', 'SATUAN IK PROGRAM PD',
  ],
  kegiatan: [
    'KEGIATAN PD', 'IK KEGIATAN PD', 'BASELINE IK KEGIATAN PD',
    'TARGET IK KEGIATAN PD', 'SATUAN IK KEGIATAN PD',
  ],
  program_np: [
    'PROGRAM PD', 'IK PROGRAM PD', 'BASELINE IK PROGRAM PD',
    'TARGET IK PROGRAM PD', 'SATUAN IK PROGRAM PD',
  ],
  kegiatan_np: [
    'KEGIATAN PD', 'IK KEGIATAN PD', 'BASELINE IK KEGIATAN PD',
    'TARGET IK KEGIATAN PD', 'SATUAN IK KEGIATAN PD',
  ],
};

const NODE_LEVEL_LABEL: Record<NodeLevel, string> = {
  tujuan: 'Tujuan', sasaran: 'Sasaran PD', program: 'Program', kegiatan: 'Kegiatan',
  program_np: 'Program', kegiatan_np: 'Kegiatan',
};

interface NodeEditTarget {
  level: NodeLevel;
  match: Record<string, string>;
  values: Record<string, string>;
  title: string;
}

type NodeEditFn = (target: NodeEditTarget) => void;

// Hapus node non-leaf: cukup level + match (identifikasi baris) + judul.
interface NodeDeleteTarget {
  level: NodeLevel;
  match: Record<string, string>;
  title: string;
}
type NodeDeleteFn = (target: NodeDeleteTarget) => void;

// Tombol edit satu NODE non-leaf (dipakai di header Tujuan/Sasaran/Program/
// Kegiatan). Berhenti-propagasi supaya tak ikut buka/tutup collapsible.
function NodeEditButton({ onClick, canManage }: { onClick: () => void; canManage: boolean }) {
  if (!canManage) return null;
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 shrink-0"
      title="Edit node ini"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick();
      }}
    >
      <Edit className="h-4 w-4" />
    </Button>
  );
}

// Tombol HAPUS node non-leaf + popup konfirmasi. Menghapus node = menghapus
// SELURUH baris/anak di bawahnya, jadi wajib dikonfirmasi. Penegakan
// kepemilikan sebenarnya ada di backend (per-baris authorize('delete')).
function NodeDeleteButton({
  level,
  match,
  title,
  canManage,
  onDeleteNode,
  levelLabel,
}: {
  level: NodeLevel;
  match: Record<string, string>;
  title: string;
  canManage: boolean;
  onDeleteNode: NodeDeleteFn;
  levelLabel: string;
}) {
  if (!canManage) return null;
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
          title="Hapus node ini"
          // Hanya stopPropagation (cegah toggle collapsible). JANGAN
          // preventDefault — itu memblokir AlertDialogTrigger (Radix) membuka
          // dialog konfirmasi, sehingga tombol tampak "tidak bisa diklik".
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus {levelLabel} "{title}"?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini menghapus <b>{levelLabel}</b> ini beserta{' '}
            <b>SELURUH baris/anak di bawahnya</b> (kegiatan & subkegiatan di dalamnya)
            secara permanen. Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onDeleteNode({ level, match, title })}
            className="bg-destructive hover:bg-destructive/90"
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface TreeCallbacks {
  expanded: Set<string>;
  onToggle: (key: string, open: boolean) => void;
  onEdit: (sk: SubKegiatanItem) => void;
  onEditNode: NodeEditFn;
  onDeleteNode: NodeDeleteFn;
  onDelete: (id: number) => void;
  query: string;
  currentMatchKey: string | null;
  activeAncestorKeys: Set<string>;
  registerRef: (key: string, el: HTMLElement | null) => void;
  currentUserId: number | null;
  isAdmin: boolean;
}

function SubKegiatanRow({ sk, cb }: { sk: SubKegiatanItem; cb: TreeCallbacks }) {
  const key = keyOf('subkegiatan', sk.id);
  const open = cb.expanded.has(key);
  const isCurrent = cb.currentMatchKey === key;

  return (
    <Collapsible open={open} onOpenChange={(o) => cb.onToggle(key, o)}>
      <div
        ref={(el) => cb.registerRef(key, el)}
        className={`flex w-full items-center gap-2 rounded-md border-l-4 ${LEVEL_COLORS.subkegiatan.border} px-3 py-2 hover:bg-muted/50 ${isCurrent ? 'ring-2 ring-orange-500' : ''}`}
      >
        <CollapsibleTrigger className="flex flex-1 items-center gap-2 text-left text-sm">
          <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${LEVEL_COLORS.subkegiatan.chevron} ${open ? 'rotate-90' : ''}`} />
          <span className={`flex-1 font-medium ${LEVEL_COLORS.subkegiatan.text}`}>
            SubKegiatan {sk.kode} : <HighlightText text={sk.nama} query={cb.query} />
          </span>
          {sk.opd_penanggungjawab && (
            <div className="flex shrink-0 flex-col items-end gap-1">
              {sk.opd_penanggungjawab
                .split('\n')
                .map((opd) => opd.trim())
                .filter((opd) => opd !== '')
                .map((opd) => (
                  <Badge key={opd} variant="outline">
                    {opd}
                  </Badge>
                ))}
            </div>
          )}
        </CollapsibleTrigger>
        {canManageRow(sk.user_id, cb.currentUserId, cb.isAdmin) ? (
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="icon" onClick={() => cb.onEdit(sk)}>
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus SubKegiatan ini?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Data SubKegiatan "{sk.nama}" akan dihapus permanen. Nomor kode SubKegiatan lain di bawah Kegiatan ini
                    akan otomatis bergeser setelah dihapus.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={() => cb.onDelete(sk.id)} className="bg-destructive hover:bg-destructive/90">
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : (
          <span className="shrink-0 text-xs text-muted-foreground">Milik PIC lain</span>
        )}
      </div>
      <CollapsibleContent className="px-3 pb-3 pl-9">
        <IkInfo
          label="IK SubKegiatan"
          kode={sk.kode}
          ik={sk.ik_subkegiatan}
          baseline={sk.baseline_ik_subkegiatan}
          target={sk.target_ik_subkegiatan}
          satuan={sk.satuan_ik_subkegiatan}
          opd={sk.opd_penanggungjawab}
          query={cb.query}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}

// chain: nilai deskripsi ancestor (untuk membangun `match` saat edit node).
// Bila undefined (mis. cabang non-prioritas), tombol edit node disembunyikan
// karena rantai identifikasi tak lengkap.
interface NodeChain {
  srDesc?: string;
  tujuanDesc?: string;
  sasaranDesc?: string;
  programDesc?: string;
}

function KegiatanRow({
  kegiatan,
  cb,
  chain,
  npProgramDesc,
}: {
  kegiatan: KegiatanItem;
  cb: TreeCallbacks;
  chain?: NodeChain;
  /** Bila diisi: mode NON-PRIORITAS — identifikasi via Program+Kegiatan saja. */
  npProgramDesc?: string;
}) {
  const key = keyOf('kegiatan', kegiatan.id);
  const open = cb.expanded.has(key);
  const isCurrent = cb.currentMatchKey === key;
  const isActiveAncestor = cb.activeAncestorKeys.has(key);

  // Prioritas: tampil bila rantai lengkap (SR→Tujuan→SasaranPD→Program).
  // Non-prioritas: tampil bila npProgramDesc ada. Tidak dibatasi admin — 2a
  // pakai kepemilikan per-baris (penegakan di backend authorize per baris).
  const isNp = npProgramDesc !== undefined;
  const canEditNode = isNp
    ? true
    : chain?.srDesc !== undefined && chain.tujuanDesc !== undefined &&
      chain.sasaranDesc !== undefined && chain.programDesc !== undefined;
  const nodeTitle = `Kegiatan ${kegiatan.kode}`;
  const nodeLevel: NodeLevel = isNp ? 'kegiatan_np' : 'kegiatan';
  const nodeMatch: Record<string, string> = isNp
    ? { 'PROGRAM PD': npProgramDesc!, 'KEGIATAN PD': kegiatan.deskripsi }
    : canEditNode
      ? {
          'SASARAN RPJMD': chain!.srDesc!,
          'TUJUAN STRATEGIS PD': chain!.tujuanDesc!,
          'SASARAN STRATEGIS PD': chain!.sasaranDesc!,
          'PROGRAM PD': chain!.programDesc!,
          'KEGIATAN PD': kegiatan.deskripsi,
        }
      : {};
  const editThisNode = () =>
    cb.onEditNode({
      level: nodeLevel,
      title: nodeTitle,
      match: nodeMatch,
      values: {
        'KEGIATAN PD': kegiatan.deskripsi,
        'IK KEGIATAN PD': kegiatan.ik_kegiatan ?? '',
        'BASELINE IK KEGIATAN PD': kegiatan.baseline_ik_kegiatan ?? '',
        'TARGET IK KEGIATAN PD': kegiatan.target_ik_kegiatan ?? '',
        'SATUAN IK KEGIATAN PD': kegiatan.satuan_ik_kegiatan ?? '',
      },
    });

  return (
    <Collapsible open={open} onOpenChange={(o) => cb.onToggle(key, o)}>
      <div
        ref={(el) => cb.registerRef(key, el)}
        className={`flex w-full items-center gap-2 rounded-md border-l-4 ${LEVEL_COLORS.kegiatan.border} px-3 py-2 hover:bg-muted/50 ${isCurrent ? 'ring-2 ring-orange-500' : isActiveAncestor ? 'ring-1 ring-orange-300 bg-orange-50 dark:bg-orange-950/30' : ''}`}
      >
        <CollapsibleTrigger className="flex flex-1 items-center gap-2 text-left">
          <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${LEVEL_COLORS.kegiatan.chevron} ${open ? 'rotate-90' : ''}`} />
          <span className={`flex-1 font-medium ${LEVEL_COLORS.kegiatan.text}`}>
            Kegiatan {kegiatan.kode} : <HighlightText text={kegiatan.deskripsi} query={cb.query} />
          </span>
          <Badge variant="secondary" className="shrink-0">
            {kegiatan.subkegiatans.length} subkegiatan
          </Badge>
        </CollapsibleTrigger>
        <NodeEditButton onClick={editThisNode} canManage={canEditNode} />
        <NodeDeleteButton level={nodeLevel} match={nodeMatch} title={nodeTitle} canManage={canEditNode} onDeleteNode={cb.onDeleteNode} levelLabel="Kegiatan" />
      </div>
      <CollapsibleContent className="space-y-1 px-3 pb-3 pl-9">
        <IkInfo
          label="IK Kegiatan"
          kode={kegiatan.kode}
          ik={kegiatan.ik_kegiatan}
          baseline={kegiatan.baseline_ik_kegiatan}
          target={kegiatan.target_ik_kegiatan}
          satuan={kegiatan.satuan_ik_kegiatan}
          opd={collectOpd(kegiatan)}
          query={cb.query}
        />
        <div className="mt-2 divide-y rounded-md border">
          {kegiatan.subkegiatans.map((sk) => (
            <SubKegiatanRow key={sk.id} sk={sk} cb={cb} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ProgramRow({ program, cb, chain }: { program: ProgramItem; cb: TreeCallbacks; chain?: NodeChain }) {
  const key = keyOf('program', program.id);
  const open = cb.expanded.has(key);
  const isCurrent = cb.currentMatchKey === key;
  const isActiveAncestor = cb.activeAncestorKeys.has(key);

  const canEditNode =
    chain?.srDesc !== undefined && chain.tujuanDesc !== undefined && chain.sasaranDesc !== undefined;
  const nodeTitle = `Program ${program.kode}`;
  const nodeMatch: Record<string, string> = canEditNode
    ? {
        'SASARAN RPJMD': chain!.srDesc!,
        'TUJUAN STRATEGIS PD': chain!.tujuanDesc!,
        'SASARAN STRATEGIS PD': chain!.sasaranDesc!,
        'PROGRAM PD': program.deskripsi,
      }
    : {};
  const editThisNode = () =>
    cb.onEditNode({
      level: 'program',
      title: nodeTitle,
      match: nodeMatch,
      values: {
        'PROGRAM PD': program.deskripsi,
        'IK PROGRAM PD': program.ik_program ?? '',
        'BASELINE IK PROGRAM PD': program.baseline_ik_program ?? '',
        'TARGET IK PROGRAM PD': program.target_ik_program ?? '',
        'SATUAN IK PROGRAM PD': program.satuan_ik_program ?? '',
      },
    });

  const childChain: NodeChain = { ...chain, programDesc: program.deskripsi };

  return (
    <Collapsible open={open} onOpenChange={(o) => cb.onToggle(key, o)}>
      <div
        ref={(el) => cb.registerRef(key, el)}
        className={`flex w-full items-center gap-2 rounded-md border-l-4 ${LEVEL_COLORS.program.border} px-3 py-2 hover:bg-muted/50 ${isCurrent ? 'ring-2 ring-orange-500' : isActiveAncestor ? 'ring-1 ring-orange-300 bg-orange-50 dark:bg-orange-950/30' : ''}`}
      >
        <CollapsibleTrigger className="flex flex-1 items-center gap-2 text-left">
          <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${LEVEL_COLORS.program.chevron} ${open ? 'rotate-90' : ''}`} />
          <span className={`flex-1 font-medium ${LEVEL_COLORS.program.text}`}>
            Program {program.kode} : <HighlightText text={program.deskripsi} query={cb.query} />
          </span>
          <Badge variant="secondary" className="shrink-0">
            {program.kegiatans.length} kegiatan
          </Badge>
        </CollapsibleTrigger>
        <NodeEditButton onClick={editThisNode} canManage={canEditNode} />
        <NodeDeleteButton level="program" match={nodeMatch} title={nodeTitle} canManage={canEditNode} onDeleteNode={cb.onDeleteNode} levelLabel="Program" />
      </div>
      <CollapsibleContent className="space-y-1 px-3 pb-3 pl-9">
        <IkInfo
          label="IK Program"
          kode={program.kode}
          ik={program.ik_program}
          baseline={program.baseline_ik_program}
          target={program.target_ik_program}
          satuan={program.satuan_ik_program}
          opd={collectOpd(program)}
          query={cb.query}
        />
        <div className="mt-2 divide-y rounded-md border">
          {program.kegiatans.map((kegiatan) => (
            <KegiatanRow key={kegiatan.id} kegiatan={kegiatan} cb={cb} chain={childChain} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function SasaranPdRow({ sasaran, cb, chain }: { sasaran: SasaranPdItem; cb: TreeCallbacks; chain: NodeChain }) {
  const key = keyOf('sasaran', sasaran.id);
  const open = cb.expanded.has(key);
  const isCurrent = cb.currentMatchKey === key;
  const isActiveAncestor = cb.activeAncestorKeys.has(key);

  const canEditNode = chain.srDesc !== undefined && chain.tujuanDesc !== undefined;
  const nodeTitle = `Sasaran PD ${sasaran.kode}`;
  const nodeMatch: Record<string, string> = canEditNode
    ? {
        'SASARAN RPJMD': chain.srDesc!,
        'TUJUAN STRATEGIS PD': chain.tujuanDesc!,
        'SASARAN STRATEGIS PD': sasaran.deskripsi,
      }
    : {};
  const editThisNode = () =>
    cb.onEditNode({
      level: 'sasaran',
      title: nodeTitle,
      match: nodeMatch,
      values: {
        'SASARAN STRATEGIS PD': sasaran.deskripsi,
        'IK SASARAN STRATEGIS PD': sasaran.ik_sasaran ?? '',
        'BASELINE IK SASARAN STRATEGIS PD': sasaran.baseline_ik_sasaran ?? '',
        'TARGET IK SASARAN STRATEGIS PD': sasaran.target_ik_sasaran ?? '',
        'SATUAN IK SASARAN STRATEGIS PD': sasaran.satuan_ik_sasaran ?? '',
      },
    });

  const childChain: NodeChain = { ...chain, sasaranDesc: sasaran.deskripsi };

  return (
    <Collapsible open={open} onOpenChange={(o) => cb.onToggle(key, o)}>
      <div
        ref={(el) => cb.registerRef(key, el)}
        className={`flex w-full items-center gap-2 rounded-md border-l-4 ${LEVEL_COLORS.sasaran.border} px-3 py-2 hover:bg-muted/50 ${isCurrent ? 'ring-2 ring-orange-500' : isActiveAncestor ? 'ring-1 ring-orange-300 bg-orange-50 dark:bg-orange-950/30' : ''}`}
      >
        <CollapsibleTrigger className="flex flex-1 items-center gap-2 text-left">
          <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${LEVEL_COLORS.sasaran.chevron} ${open ? 'rotate-90' : ''}`} />
          <span className={`flex-1 font-medium ${LEVEL_COLORS.sasaran.text}`}>
            Sasaran {sasaran.kode} : <HighlightText text={sasaran.deskripsi} query={cb.query} />
          </span>
          <Badge variant="secondary" className="shrink-0">
            {sasaran.programs.length} program
          </Badge>
        </CollapsibleTrigger>
        <NodeEditButton onClick={editThisNode} canManage={canEditNode} />
        <NodeDeleteButton level="sasaran" match={nodeMatch} title={nodeTitle} canManage={canEditNode} onDeleteNode={cb.onDeleteNode} levelLabel="Sasaran PD" />
      </div>
      <CollapsibleContent className="space-y-1 px-3 pb-3 pl-9">
        <IkInfo
          label="IK Sasaran"
          kode={sasaran.kode}
          ik={sasaran.ik_sasaran}
          baseline={sasaran.baseline_ik_sasaran}
          target={sasaran.target_ik_sasaran}
          satuan={sasaran.satuan_ik_sasaran}
          opd={collectOpd(sasaran)}
          query={cb.query}
        />
        <div className="mt-2 divide-y rounded-md border">
          {sasaran.programs.map((program) => (
            <ProgramRow key={program.id} program={program} cb={cb} chain={childChain} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function TujuanRow({ tujuan, cb, srDesc }: { tujuan: TujuanItem; cb: TreeCallbacks; srDesc: string }) {
  const key = keyOf('tujuan', tujuan.id);
  const open = cb.expanded.has(key);
  const isCurrent = cb.currentMatchKey === key;
  const isActiveAncestor = cb.activeAncestorKeys.has(key);

  const nodeTitle = `Tujuan ${tujuan.kode}`;
  const nodeMatch = { 'SASARAN RPJMD': srDesc, 'TUJUAN STRATEGIS PD': tujuan.deskripsi };
  const editThisNode = () =>
    cb.onEditNode({
      level: 'tujuan',
      title: nodeTitle,
      match: nodeMatch,
      values: {
        'TUJUAN STRATEGIS PD': tujuan.deskripsi,
        'IK TUJUAN STRATEGIS PD': tujuan.ik_tujuan ?? '',
        'BASELINE IK TUJUAN STRATEGIS PD': tujuan.baseline_ik_tujuan ?? '',
        'TARGET IK TUJUAN STRATEGIS PD': tujuan.target_ik_tujuan ?? '',
        'SATUAN IK TUJUAN STRATEGIS PD': tujuan.satuan_ik_tujuan ?? '',
      },
    });

  const childChain: NodeChain = { srDesc, tujuanDesc: tujuan.deskripsi };

  return (
    <Collapsible open={open} onOpenChange={(o) => cb.onToggle(key, o)}>
      <div
        ref={(el) => cb.registerRef(key, el)}
        className={`flex w-full items-center gap-2 rounded-md border-l-4 ${LEVEL_COLORS.tujuan.border} px-3 py-2 hover:bg-muted/50 ${isCurrent ? 'ring-2 ring-orange-500' : isActiveAncestor ? 'ring-1 ring-orange-300 bg-orange-50 dark:bg-orange-950/30' : ''}`}
      >
        <CollapsibleTrigger className="flex flex-1 items-center gap-2 text-left">
          <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${LEVEL_COLORS.tujuan.chevron} ${open ? 'rotate-90' : ''}`} />
          <span className={`flex-1 font-medium ${LEVEL_COLORS.tujuan.text}`}>
            Tujuan {tujuan.kode} : <HighlightText text={tujuan.deskripsi} query={cb.query} />
          </span>
          <Badge variant="secondary" className="shrink-0">
            {tujuan.sasarans.length} sasaran
          </Badge>
        </CollapsibleTrigger>
        <NodeEditButton onClick={editThisNode} canManage={true} />
        <NodeDeleteButton level="tujuan" match={nodeMatch} title={nodeTitle} canManage={true} onDeleteNode={cb.onDeleteNode} levelLabel="Tujuan" />
      </div>
      <CollapsibleContent className="space-y-1 px-3 pb-3 pl-9">
        <IkInfo
          label="IK Tujuan"
          kode={tujuan.kode}
          ik={tujuan.ik_tujuan}
          baseline={tujuan.baseline_ik_tujuan}
          target={tujuan.target_ik_tujuan}
          satuan={tujuan.satuan_ik_tujuan}
          opd={collectOpd(tujuan)}
          query={cb.query}
        />
        <div className="mt-2 divide-y rounded-md border">
          {tujuan.sasarans.map((sasaran) => (
            <SasaranPdRow key={sasaran.id} sasaran={sasaran} cb={cb} chain={childChain} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function SasaranRpjmdCard({ sr, cb }: { sr: SasaranRpjmdItem; cb: TreeCallbacks }) {
  const key = keyOf('sasaranrpjmd', sr.id);
  const open = cb.expanded.has(key);
  const isCurrent = cb.currentMatchKey === key;
  const isActiveAncestor = cb.activeAncestorKeys.has(key);

  return (
    <Card
      ref={(el) => cb.registerRef(key, el)}
      className={`overflow-hidden border-l-4 ${LEVEL_COLORS.visi.border} shadow-sm ${isCurrent ? 'ring-2 ring-orange-500' : isActiveAncestor ? 'ring-1 ring-orange-300 bg-orange-50 dark:bg-orange-950/30' : ''}`}
    >
      <Collapsible open={open} onOpenChange={(o) => cb.onToggle(key, o)}>
        <CollapsibleTrigger className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/30">
          <ChevronRight className={`h-5 w-5 shrink-0 transition-transform ${LEVEL_COLORS.visi.chevron} ${open ? 'rotate-90' : ''}`} />
          <div className="flex-1">
            <p className={`text-xs font-medium ${LEVEL_COLORS.visi.text}`}>Sasaran RPJMD {sr.kode} (rujukan)</p>
            <p className={`font-semibold ${LEVEL_COLORS.visi.text}`}>
              <HighlightText text={sr.deskripsi} query={cb.query} />
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {sr.tujuans.length} tujuan
          </Badge>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-1 border-t pt-4">
            <div className="divide-y rounded-md border">
              {sr.tujuans.map((tujuan) => (
                <TujuanRow key={tujuan.id} tujuan={tujuan} cb={cb} srDesc={sr.deskripsi} />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Kartu top-level untuk program NON-PRIORITAS. Sejajar dengan SasaranRpjmdCard
// (level yang sama), tapi bergaya berbeda: badge "Non-Prioritas", border
// putus-putus, tanpa label "Sasaran RPJMD (rujukan)". Isinya langsung
// Kegiatan→SubKegiatan program tersebut.
// Node induk collapsible (default tertutup) yang menaungi SELURUH program
// non-prioritas, sejajar dengan Sasaran RPJMD — meng-collapse-nya menyembunyikan
// semua sekaligus. Murni pengelompokan tree view; visualisasi tetap sejajar.
function NonPrioritasGroup({ programs, cb }: { programs: NonPrioritasProgramItem[]; cb: TreeCallbacks }) {
  if (programs.length === 0) return null;

  const groupKey = keyOf('np-group', 'root');
  const open = cb.expanded.has(groupKey);

  return (
    <Card
      ref={(el) => cb.registerRef(groupKey, el)}
      className="border-l-4 border-l-amber-500 border-amber-400/60 bg-amber-50/40 dark:border-amber-500/40 dark:border-l-amber-500 dark:bg-amber-950/10"
    >
      <Collapsible open={open} onOpenChange={(o) => cb.onToggle(groupKey, o)}>
        <CollapsibleTrigger className="flex w-full items-center gap-3 p-4 text-left hover:bg-amber-100/40 dark:hover:bg-amber-900/20">
          <ChevronRight className={`h-5 w-5 shrink-0 text-amber-600 transition-transform ${open ? 'rotate-90' : ''}`} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Badge className="border-transparent bg-amber-500 text-[10px] uppercase tracking-wide text-white hover:bg-amber-500">
                Non-Prioritas
              </Badge>
              <span className="text-xs text-amber-700/80 dark:text-amber-400/70">· Tidak menurun dari Sasaran RPJMD</span>
            </div>
            <p className="font-semibold text-amber-800 dark:text-amber-300">Program Non-Prioritas</p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {programs.length} program
          </Badge>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-3 border-t border-amber-400/30 pt-4">
            {programs.map((program) => (
              <NonPrioritasCard key={program.id} program={program} cb={cb} />
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function NonPrioritasCard({ program, cb }: { program: NonPrioritasProgramItem; cb: TreeCallbacks }) {
  const key = keyOf('program', program.id);
  const open = cb.expanded.has(key);
  const isCurrent = cb.currentMatchKey === key;
  const isActiveAncestor = cb.activeAncestorKeys.has(key);

  // OPD penanggung jawab (agregat dari SubKegiatan) — tampil sbg badge spt 1a.
  const opds = (program.opd_penanggungjawab ?? '')
    .split('\n')
    .map((o) => o.trim())
    .filter((o) => o !== '');

  // Node non-prioritas diidentifikasi via PROGRAM PD saja (level program_np).
  const nodeTitle = `Program ${program.kode}`;
  const nodeMatch: Record<string, string> = { 'PROGRAM PD': program.deskripsi };
  const editThisNode = () =>
    cb.onEditNode({
      level: 'program_np',
      title: nodeTitle,
      match: nodeMatch,
      values: {
        'PROGRAM PD': program.deskripsi,
        'IK PROGRAM PD': program.ik_program ?? '',
        'BASELINE IK PROGRAM PD': program.baseline_ik_program ?? '',
        'TARGET IK PROGRAM PD': program.target_ik_program ?? '',
        'SATUAN IK PROGRAM PD': program.satuan_ik_program ?? '',
      },
    });

  return (
    <Card
      ref={(el) => cb.registerRef(key, el)}
      className={`border-l-4 border-l-amber-500 bg-amber-50/70 dark:bg-amber-950/20 ${isCurrent ? 'ring-2 ring-orange-500' : isActiveAncestor ? 'ring-1 ring-orange-300' : 'border-amber-400/60 dark:border-amber-500/40'}`}
    >
      <Collapsible open={open} onOpenChange={(o) => cb.onToggle(key, o)}>
        <div className="flex w-full items-center gap-3 p-4 hover:bg-muted/30">
          <CollapsibleTrigger className="flex flex-1 items-center gap-3 text-left">
            <ChevronRight className={`h-5 w-5 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Program {program.kode}</p>
                <Badge className="border-transparent bg-amber-500 text-[10px] uppercase tracking-wide text-white hover:bg-amber-500">
                  Non-Prioritas
                </Badge>
              </div>
              <p className="font-semibold">
                <HighlightText text={program.deskripsi} query={cb.query} />
              </p>
              <p className="text-xs text-amber-700/80 dark:text-amber-400/70">Tidak menurun dari Sasaran RPJMD</p>
            </div>
            <Badge variant="secondary" className="shrink-0">
              {program.kegiatans.length} kegiatan
            </Badge>
          </CollapsibleTrigger>
          {opds.length > 0 && (
            <div className="flex shrink-0 flex-col items-end gap-1">
              {opds.map((opd) => (
                <Badge key={opd} variant="outline">
                  {opd}
                </Badge>
              ))}
            </div>
          )}
          <NodeEditButton onClick={editThisNode} canManage={true} />
          <NodeDeleteButton level="program_np" match={nodeMatch} title={nodeTitle} canManage={true} onDeleteNode={cb.onDeleteNode} levelLabel="Program" />
        </div>
        <CollapsibleContent>
          <CardContent className="space-y-1 border-t pt-4">
            <IkInfo
              label="IK Program"
              kode={program.kode}
              ik={program.ik_program}
              baseline={program.baseline_ik_program}
              target={program.target_ik_program}
              satuan={program.satuan_ik_program}
              opd={program.opd_penanggungjawab ?? collectOpd(program)}
              query={cb.query}
            />
            <div className="mt-2 divide-y rounded-md border">
              {program.kegiatans.map((kegiatan) => (
                <KegiatanRow key={kegiatan.id} kegiatan={kegiatan} cb={cb} npProgramDesc={program.deskripsi} />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default function KrsPdIndex({ sasaranRpjmds, opdOptions, opdList, opdFillStatus, fieldOptions, program1aMap, currentUserId, isAdmin }: PageProps) {
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SubKegiatanItem | null>(null);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  // Mode NON-PRIORITAS: program tanpa parent Sasaran RPJMD. Bisa di-toggle
  // manual, TAPI juga auto-detect — mengisi Sasaran RPJMD otomatis mematikan
  // mode ini (jadi prioritas); mengosongkannya menyalakan mode ini.
  const [nonPrioritas, setNonPrioritas] = useState(false);

  const nodeRefs = useRef<Map<string, HTMLElement>>(new Map());
  const registerRef = (key: string, el: HTMLElement | null) => {
    if (el) {
      nodeRefs.current.set(key, el);
    } else {
      nodeRefs.current.delete(key);
    }
  };

  const { data, setData, post, put, processing, reset, errors } = useForm<FormData>(emptyForm());

  // Saat Sasaran RPJMD diubah: kalau diisi -> otomatis PRIORITAS (matikan
  // mode non-prioritas); kalau dikosongkan -> otomatis NON-PRIORITAS.
  const handleSasaranChange = (val: string) => {
    setData(SASARAN_RPJMD_FIELD, val);
    setNonPrioritas(val.trim() === '');
  };

  // Menyalakan/mematikan mode non-prioritas secara manual. Saat ON,
  // field rantai-atas + Sasaran RPJMD dikosongkan.
  const toggleNonPrioritas = (on: boolean) => {
    setNonPrioritas(on);
    if (on) {
      setData((prev) => {
        const next = { ...prev, [SASARAN_RPJMD_FIELD]: '' } as FormData;
        PARENT_CHAIN_FIELDS.forEach((f) => (next[f] = ''));
        return next;
      });
    }
  };

  // Auto-fill IK/Baseline/Target/Satuan Program dari 1a saat PROGRAM PD cocok
  // dengan salah satu Program Prioritas di 1a (tetap bisa diedit setelahnya).
  const handleProgramChange = (val: string) => {
    setData('PROGRAM PD', val);
    const entry = program1aMap[matchKey(val)];
    if (entry) {
      setData((prev) => ({
        ...prev,
        [PROGRAM_AUTOFILL.ik]: entry.ik,
        [PROGRAM_AUTOFILL.baseline]: entry.baseline,
        [PROGRAM_AUTOFILL.target]: entry.target,
        [PROGRAM_AUTOFILL.satuan]: entry.satuan,
      }));
    }
  };

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
    return collectMatches(sasaranRpjmds, activeQuery);
  }, [sasaranRpjmds, activeQuery]);

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

    const { matches: found, ancestors: foundAncestors } = collectMatches(sasaranRpjmds, q);
    const firstChain = found.length > 0 ? (foundAncestors.get(found[0]) ?? []) : [];
    setExpanded(new Set(firstChain));
  };

  // Sama seperti runSearch tapi dgn kata kunci eksplisit (tidak bergantung
  // pada state searchInput yang belum ter-update di render yang sama) —
  // dipakai tombol pilih cepat di panel status pengisian OPD.
  const searchFor = (term: string) => {
    setSearchInput(term);
    const q = term.trim().toLowerCase();
    setActiveQuery(q);
    setCurrentMatchIndex(0);

    if (!q) {
      setExpanded(new Set());
      return;
    }

    const { matches: found, ancestors: foundAncestors } = collectMatches(sasaranRpjmds, q);
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

  const openCreate = () => {
    setEditing(null);
    reset();
    setData(emptyForm());
    setNonPrioritas(false);
    setDialogOpen(true);
  };

  const openEdit = (sk: SubKegiatanItem) => {
    setEditing(sk);
    const values = emptyForm();
    values[SASARAN_RPJMD_FIELD] = sk.raw[SASARAN_RPJMD_FIELD] ?? '';
    FIELDS.forEach((f) => (values[f] = sk.raw[f] ?? ''));
    values[OPD_FIELD] = sk.raw[OPD_FIELD] ?? '';
    setData(values);
    // Auto-detect: baris tanpa Sasaran RPJMD = non-prioritas.
    const sasaran = (sk.raw[SASARAN_RPJMD_FIELD] ?? '').trim();
    setNonPrioritas(sasaran === '' || sasaran === 'Tidak Ada Data');
    setDialogOpen(true);
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (editing) {
      put(`/krs_pd/${editing.id}`, {
        onSuccess: () => {
          toast.success('Data berhasil diperbarui.');
          setDialogOpen(false);
        },
        onError: () => toast.error('Gagal memperbarui data.'),
      });
    } else {
      post('/krs_pd', {
        onSuccess: () => {
          toast.success('Data berhasil ditambahkan.');
          setDialogOpen(false);
        },
        onError: () => toast.error('Gagal menambahkan data.'),
      });
    }
  };

  const handleDelete = (id: number) => {
    router.delete(`/krs_pd/${id}`, {
      onSuccess: () => toast.success('Data berhasil dihapus.'),
      onError: () => toast.error('Gagal menghapus data.'),
    });
  };

  // Dialog EDIT NODE non-leaf (Tujuan/Sasaran PD/Program/Kegiatan).
  const [nodeDialogOpen, setNodeDialogOpen] = useState(false);
  const [nodeTarget, setNodeTarget] = useState<NodeEditTarget | null>(null);
  const nodeForm = useForm<Record<string, string>>({});

  const openNodeEdit = (target: NodeEditTarget) => {
    setNodeTarget(target);
    nodeForm.setData({ ...target.values });
    nodeForm.clearErrors();
    setNodeDialogOpen(true);
  };

  const handleNodeSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!nodeTarget) return;
    router.put(
      '/krs_pd_node/update',
      { level: nodeTarget.level, match: nodeTarget.match, values: nodeForm.data },
      {
        onSuccess: () => {
          toast.success('Node berhasil diperbarui.');
          setNodeDialogOpen(false);
        },
        onError: () => toast.error('Gagal memperbarui node.'),
      },
    );
  };

  // Hapus node non-leaf + seluruh anaknya (konfirmasi via AlertDialog di tombol).
  const handleDeleteNode = (target: NodeDeleteTarget) => {
    router.delete('/krs_pd_node/delete', {
      data: { level: target.level, match: target.match },
      onSuccess: () => toast.success('Node berhasil dihapus.'),
      onError: () => toast.error('Gagal menghapus node.'),
    });
  };

  const cb: TreeCallbacks = {
    expanded,
    onToggle: handleToggle,
    onEdit: openEdit,
    onEditNode: openNodeEdit,
    onDeleteNode: handleDeleteNode,
    onDelete: handleDelete,
    query: activeQuery,
    currentMatchKey,
    activeAncestorKeys,
    registerRef,
    currentUserId,
    isAdmin,
  };

  return (
    <AppLayout>
      <Head title="II_a_KRS_PD" />
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">II_a_KRS_PD</h1>
            <p className="text-sm text-muted-foreground">
              Risiko Strategis Perangkat Daerah — Renstra OPD: Tujuan, Sasaran, Program, Kegiatan, dan SubKegiatan
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Data
          </Button>
        </div>

        {isAdmin && (
          <OpdFillStatusPanel
            opdOptions={opdList}
            opdStatus={opdFillStatus}
            onSelect={searchFor}
            selectedOpdNama={searchInput}
          />
        )}

        <div className="flex items-center gap-2">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Cari tujuan, sasaran, program, kegiatan, subkegiatan, OPD... (Enter untuk cari/lanjut)"
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
            {matches.length > 0
              ? `Ditemukan ${matches.length} hasil untuk "${activeQuery}".`
              : `Tidak ada hasil untuk "${activeQuery}".`}
          </p>
        )}

        <div className="space-y-3">
          {sasaranRpjmds.filter((sr): sr is SasaranRpjmdItem => !isNonPrioritas(sr)).map((sr) => (
            <SasaranRpjmdCard key={sr.id} sr={sr} cb={cb} />
          ))}
          <NonPrioritasGroup programs={sasaranRpjmds.filter(isNonPrioritas)} cb={cb} />
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Data' : 'Tambah Data'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Toggle mode program: Prioritas (menurun dari Sasaran RPJMD) vs
                Non-Prioritas (berdiri sendiri, tanpa parent). Auto-detect dari
                terisi/kosongnya Sasaran RPJMD, tapi bisa juga di-toggle manual. */}
            <div className="flex items-start gap-2 rounded-md border border-dashed p-3">
              <Checkbox
                id="non-prioritas"
                checked={nonPrioritas}
                onCheckedChange={(v) => toggleNonPrioritas(v === true)}
                className="mt-0.5"
              />
              <div className="space-y-0.5">
                <Label htmlFor="non-prioritas" className="cursor-pointer">
                  Program Non-Prioritas (tanpa parent Sasaran RPJMD)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Centang untuk program yang tidak menurun dari Sasaran RPJMD (mis. program
                  pendukung / program level Kecamatan). Otomatis tercentang bila Sasaran RPJMD
                  dikosongkan.
                </p>
              </div>
            </div>

            {!nonPrioritas && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Label>{SASARAN_RPJMD_FIELD}</Label>
                  {KRS_PD_FIELD_INFO[SASARAN_RPJMD_FIELD] && <FieldInfoPopover text={KRS_PD_FIELD_INFO[SASARAN_RPJMD_FIELD]} />}
                </div>
                <AutocompleteSelect
                  value={data[SASARAN_RPJMD_FIELD]}
                  onChange={handleSasaranChange}
                  options={fieldOptions[SASARAN_RPJMD_FIELD] ?? []}
                  placeholder="Pilih Sasaran RPJMD yang sudah ada di KRS_Pemda"
                  dropdownClassName="w-[32rem]"
                />
                {errors[SASARAN_RPJMD_FIELD] && <p className="text-sm text-destructive">{errors[SASARAN_RPJMD_FIELD]}</p>}
              </div>
            )}

            {FIELDS.filter((field) => !(nonPrioritas && PARENT_CHAIN_SET.has(field))).map((field) => {
              const isProgram = field === 'PROGRAM PD';
              return (
                <div key={field} className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor={field}>{field}</Label>
                    {KRS_PD_FIELD_INFO[field] && <FieldInfoPopover text={KRS_PD_FIELD_INFO[field]} />}
                    {isProgram && program1aMap[matchKey(data['PROGRAM PD'] ?? '')] && (
                      <Badge variant="secondary" className="text-[10px]">terisi dari 1a</Badge>
                    )}
                  </div>
                  <AutocompleteTextarea
                    id={field}
                    value={data[field]}
                    onChange={(val) => (isProgram ? handleProgramChange(val) : setData(field, val))}
                    options={fieldOptions[field] ?? []}
                    rows={MULTI_VALUE_FIELDS.has(field) ? 4 : 2}
                  />
                  {errors[field] && <p className="text-sm text-destructive">{errors[field]}</p>}
                </div>
              );
            })}

            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Label>{OPD_FIELD}</Label>
                {KRS_PD_FIELD_INFO[OPD_FIELD] && <FieldInfoPopover text={KRS_PD_FIELD_INFO[OPD_FIELD]} />}
              </div>
              <AutocompleteMultiline id={OPD_FIELD} value={data[OPD_FIELD]} onChange={(val) => setData(OPD_FIELD, val)} options={opdOptions} rows={3} />
              {errors[OPD_FIELD] && <p className="text-sm text-destructive">{errors[OPD_FIELD]}</p>}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={processing}>
                {editing ? 'Simpan Perubahan' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog EDIT NODE non-leaf — hanya field level itu; perubahan
          diterapkan ke SEMUA baris node sekaligus (node tidak pecah). */}
      <Dialog open={nodeDialogOpen} onOpenChange={setNodeDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {nodeTarget ? `Edit ${NODE_LEVEL_LABEL[nodeTarget.level]} — ${nodeTarget.title}` : 'Edit Node'}
            </DialogTitle>
          </DialogHeader>
          {nodeTarget && (
            <form onSubmit={handleNodeSubmit} className="space-y-3">
              <p className="rounded-md border border-dashed bg-muted/30 p-3 text-xs text-muted-foreground">
                Perubahan pada node ini otomatis diterapkan ke <b>seluruh baris/anak</b> di
                bawahnya (node tidak akan terpecah menjadi dua).
              </p>
              {NODE_LEVEL_FIELDS[nodeTarget.level].map((field) => (
                <div key={field} className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor={`node-${field}`}>{field}</Label>
                    {KRS_PD_FIELD_INFO[field] && <FieldInfoPopover text={KRS_PD_FIELD_INFO[field]} />}
                  </div>
                  <AutocompleteTextarea
                    id={`node-${field}`}
                    value={nodeForm.data[field] ?? ''}
                    onChange={(val) => nodeForm.setData(field, val)}
                    options={fieldOptions[field] ?? []}
                    rows={MULTI_VALUE_FIELDS.has(field) ? 4 : 2}
                  />
                  {nodeForm.errors[field] && <p className="text-sm text-destructive">{nodeForm.errors[field]}</p>}
                </div>
              ))}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setNodeDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={nodeForm.processing}>
                  Simpan Perubahan
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
