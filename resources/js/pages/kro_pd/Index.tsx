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
import { KRO_PD_FIELD_INFO } from '@/lib/kro-pd-field-info';
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
import { ChevronRight, Search, Plus, Download, Edit, Trash2, ChevronUp, ChevronDown, X } from 'lucide-react';
import { canManageRow } from '@/lib/ownership';
import { LEVEL_COLORS } from '@/lib/hierarchy-level-colors';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

const SASARAN_RENSTRA_FIELD = 'SASARAN RENSTRA';

// Field selain SASARAN RENSTRA (yang punya dropdown khusus rujukan) —
// sisanya diketik/dipilih via autocomplete biasa, mengikuti pola
// krs_pd/Index.tsx — satu level lebih sedikit (tanpa Tujuan/Sasaran
// Strategis PD, karena sudah cukup dirujuk lewat Sasaran Renstra).
const FIELDS = [
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

// Field Program yang bisa auto-terisi dari 2a (KRS_PD) saat PROGRAM PD cocok.
const PROGRAM_AUTOFILL = {
  ik: 'IK PROGRAM PD',
  baseline: 'BASELINE IK PROGRAM PD',
  target: 'TARGET IK PROGRAM PD',
  satuan: 'SATUAN IK PROGRAM PD',
} as const;

// Field yang bisa berisi beberapa nilai sekaligus, satu nilai per baris
// (Enter = baris baru), supaya baris ke-N di IK/Baseline/Target/Satuan
// saling berpasangan — sama pola dengan krs_pd/Index.tsx.
const MULTI_VALUE_FIELDS = new Set<string>([
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

interface SasaranRenstraItem {
  id: string;
  kode: string;
  deskripsi: string;
  programs: ProgramItem[];
}

// Node top-level NON-PRIORITAS (berbentuk Program, tanpa Sasaran Renstra di
// atasnya). Sejajar dengan Sasaran Renstra agar semua program tampil 1 level.
interface NonPrioritasProgramItem extends ProgramItem {
  is_non_prioritas: true;
  is_prioritas: false;
  // OPD penanggung jawab (agregat dari SubKegiatan) — tampil sbg badge di kartu.
  opd_penanggungjawab: string | null;
}

type TopLevelItem = SasaranRenstraItem | NonPrioritasProgramItem;

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
  sasaranRenstras: TopLevelItem[];
  opdOptions: string[];
  opdList: { id: number; nama: string }[];
  opdFillStatus: Record<number, { jumlah_baris: number; sudah_mulai: boolean }>;
  fieldOptions: Record<string, string[]>;
  program1aMap: Record<string, Program1aEntry>;
  currentUserId: number | null;
  isAdmin: boolean;
}

const keyOf = (level: string, id: string | number) => `${level}:${id}`;

// Normalisasi kunci pencocokan teks Program agar auto-fill dari 2a tidak gagal
// karena beda kapitalisasi/spasi. HARUS selaras dengan matchKey() di
// KroPdController::program2aMap() (lowercase + spasi ganda dirapikan).
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

/**
 * Mengumpulkan node yang TEKS-nya SENDIRI cocok dengan query, dalam urutan
 * render (DFS) — sama pola dengan krs_pd/Index.tsx tapi empat level
 * (Sasaran Renstra, Program, Kegiatan, SubKegiatan).
 */
// Menelusuri Program→Kegiatan→SubKegiatan, dipakai bersama jalur prioritas &
// non-prioritas supaya SELURUH tree view (termasuk program menggantung) ikut
// tersaring pencarian.
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
  sasaranRenstras: TopLevelItem[],
  q: string,
): { matches: string[]; ancestors: Map<string, string[]> } {
  const matches: string[] = [];
  const ancestors = new Map<string, string[]>();

  for (const sr of sasaranRenstras) {
    if (isNonPrioritas(sr)) {
      const programKey = keyOf('program', sr.id);
      // Ancestor = node induk grup non-prioritas, agar lompat-ke-hasil
      // meng-expand grupnya.
      collectProgramMatches(sr, programKey, [keyOf('np-group', 'root')], q, matches, ancestors);
      continue;
    }

    const srKey = keyOf('sasaranrenstra', sr.id);
    if (sr.deskripsi.toLowerCase().includes(q)) {
      matches.push(srKey);
      ancestors.set(srKey, []);
    }
    for (const program of sr.programs) {
      const programKey = keyOf('program', program.id);
      collectProgramMatches(program, programKey, [srKey], q, matches, ancestors);
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

type FormData = Record<(typeof FIELDS)[number] | typeof OPD_FIELD | typeof SASARAN_RENSTRA_FIELD, string>;

const emptyForm = (): FormData => {
  const obj = {} as FormData;
  obj[SASARAN_RENSTRA_FIELD] = '';
  FIELDS.forEach((f) => (obj[f] = ''));
  obj[OPD_FIELD] = '';
  return obj;
};

// Tabel indikator TANPA kolom OPD — seragam dengan 2a (KRS_PD). OPD penanggung
// jawab sudah ditampilkan terpisah sebagai badge di baris SubKegiatan, jadi
// kolom OPD di tabel indikator (yang selalu kosong "-") dihilangkan.
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
  // OPD pelaksana — di 3a (Renja/RKA) satu OPD menaungi seluruh pohonnya,
  // jadi kolom OPD tiap tabel IK diisi OPD kegiatan pelaksana di bawahnya.
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

// OPD pelaksana unik dari seluruh SubKegiatan di bawah sebuah node — digabung
// 1 OPD/baris. Di 3a (Renja/RKA) satu OPD menaungi seluruh turunannya.
interface OpdBearing {
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
    n.programs?.forEach(walk);
    n.kegiatans?.forEach(walk);
    n.subkegiatans?.forEach((sk) => add(sk.opd_penanggungjawab));
  };
  walk(node);
  return opds.join('\n');
}

// ── Edit NODE non-leaf (Program/Kegiatan) ─────────────────────────────────
// Level "_np" = varian NON-PRIORITAS (kolom edit sama, identifikasi via
// Program/Kegiatan saja — lihat backend NODE_MATCH_FIELDS).
type NodeLevel = 'program' | 'kegiatan' | 'program_np' | 'kegiatan_np';

const NODE_LEVEL_FIELDS: Record<NodeLevel, string[]> = {
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
  program: 'Program', kegiatan: 'Kegiatan', program_np: 'Program', kegiatan_np: 'Kegiatan',
};

interface NodeEditTarget {
  level: NodeLevel;
  match: Record<string, string>;
  values: Record<string, string>;
  title: string;
}

type NodeEditFn = (target: NodeEditTarget) => void;

// chain: deskripsi ancestor untuk membangun `match`. Bila undefined (cabang
// non-prioritas), tombol edit node disembunyikan (rantai identifikasi ambigu).
interface NodeChain {
  srDesc?: string;
  programDesc?: string;
}

// Hapus node non-leaf: cukup level + match (identifikasi baris) + judul.
interface NodeDeleteTarget {
  level: NodeLevel;
  match: Record<string, string>;
  title: string;
}
type NodeDeleteFn = (target: NodeDeleteTarget) => void;

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
// SELURUH baris/anak di bawahnya. Penegakan kepemilikan ada di backend.
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

  const isNp = npProgramDesc !== undefined;
  const canEditNode = isNp ? true : chain?.srDesc !== undefined && chain.programDesc !== undefined;
  const nodeTitle = `Kegiatan ${kegiatan.kode}`;
  const nodeLevel: NodeLevel = isNp ? 'kegiatan_np' : 'kegiatan';
  const nodeMatch: Record<string, string> = isNp
    ? { 'PROGRAM PD': npProgramDesc!, 'KEGIATAN PD': kegiatan.deskripsi }
    : canEditNode
      ? {
          'SASARAN RENSTRA': chain!.srDesc!,
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

function ProgramRow({ program, cb, srDesc }: { program: ProgramItem; cb: TreeCallbacks; srDesc?: string }) {
  const key = keyOf('program', program.id);
  const open = cb.expanded.has(key);
  const isCurrent = cb.currentMatchKey === key;
  const isActiveAncestor = cb.activeAncestorKeys.has(key);

  const canEditNode = srDesc !== undefined;
  const nodeTitle = `Program ${program.kode}`;
  const nodeMatch: Record<string, string> = canEditNode
    ? { 'SASARAN RENSTRA': srDesc!, 'PROGRAM PD': program.deskripsi }
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

  // Rantai untuk anak Kegiatan hanya lengkap bila srDesc ada (cabang prioritas).
  const childChain: NodeChain | undefined =
    srDesc !== undefined ? { srDesc, programDesc: program.deskripsi } : undefined;

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

function SasaranRenstraCard({ sr, cb }: { sr: SasaranRenstraItem; cb: TreeCallbacks }) {
  const key = keyOf('sasaranrenstra', sr.id);
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
            <p className={`text-xs font-medium ${LEVEL_COLORS.visi.text}`}>Sasaran Renstra {sr.kode} (rujukan)</p>
            <p className={`font-semibold ${LEVEL_COLORS.visi.text}`}>
              <HighlightText text={sr.deskripsi} query={cb.query} />
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {sr.programs.length} program
          </Badge>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-1 border-t pt-4">
            <div className="divide-y rounded-md border">
              {sr.programs.map((program) => (
                <ProgramRow key={program.id} program={program} cb={cb} srDesc={sr.deskripsi} />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Kartu top-level untuk program NON-PRIORITAS: sejajar dengan Sasaran Renstra,
// bergaya beda (badge, border putus-putus), langsung ke Kegiatan.
// Node induk collapsible (default tertutup) yang menaungi SELURUH program
// non-prioritas, sejajar dengan Sasaran Renstra — collapse menyembunyikan
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
              <span className="text-xs text-amber-700/80 dark:text-amber-400/70">· Tidak menurun dari Sasaran Renstra</span>
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

  // OPD penanggung jawab (agregat dari SubKegiatan) — tampil sbg badge.
  const opds = (program.opd_penanggungjawab ?? '')
    .split('\n')
    .map((o) => o.trim())
    .filter((o) => o !== '');

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
              <p className="text-xs text-amber-700/80 dark:text-amber-400/70">Tidak menurun dari Sasaran Renstra</p>
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

export default function KroPdIndex({ sasaranRenstras, opdOptions, opdList, opdFillStatus, fieldOptions, program1aMap, currentUserId, isAdmin }: PageProps) {
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SubKegiatanItem | null>(null);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  // Mode NON-PRIORITAS: program tanpa Sasaran Renstra. Auto-detect dari
  // terisi/kosongnya Sasaran Renstra, juga bisa di-toggle manual.
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

  // Sasaran Renstra diisi -> prioritas; dikosongkan -> non-prioritas.
  const handleSasaranChange = (val: string) => {
    setData(SASARAN_RENSTRA_FIELD, val);
    setNonPrioritas(val.trim() === '');
  };

  const toggleNonPrioritas = (on: boolean) => {
    setNonPrioritas(on);
    if (on) setData(SASARAN_RENSTRA_FIELD, '');
  };

  // Auto-fill IK/Baseline/Target/Satuan Program dari 2a saat PROGRAM PD cocok.
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
    return collectMatches(sasaranRenstras, activeQuery);
  }, [sasaranRenstras, activeQuery]);

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

    const { matches: found, ancestors: foundAncestors } = collectMatches(sasaranRenstras, q);
    const firstChain = found.length > 0 ? (foundAncestors.get(found[0]) ?? []) : [];
    setExpanded(new Set(firstChain));
  };

  // Sama seperti runSearch tapi dgn kata kunci eksplisit — dipakai tombol
  // pilih cepat di panel status pengisian OPD.
  const searchFor = (term: string) => {
    setSearchInput(term);
    const q = term.trim().toLowerCase();
    setActiveQuery(q);
    setCurrentMatchIndex(0);

    if (!q) {
      setExpanded(new Set());
      return;
    }

    const { matches: found, ancestors: foundAncestors } = collectMatches(sasaranRenstras, q);
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
    values[SASARAN_RENSTRA_FIELD] = sk.raw[SASARAN_RENSTRA_FIELD] ?? '';
    FIELDS.forEach((f) => (values[f] = sk.raw[f] ?? ''));
    values[OPD_FIELD] = sk.raw[OPD_FIELD] ?? '';
    setData(values);
    const sasaran = (sk.raw[SASARAN_RENSTRA_FIELD] ?? '').trim();
    setNonPrioritas(sasaran === '' || sasaran === 'Tidak Ada Data');
    setDialogOpen(true);
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (editing) {
      put(`/kro_pd/${editing.id}`, {
        onSuccess: () => {
          toast.success('Data berhasil diperbarui.');
          setDialogOpen(false);
        },
        onError: () => toast.error('Gagal memperbarui data.'),
      });
    } else {
      post('/kro_pd', {
        onSuccess: () => {
          toast.success('Data berhasil ditambahkan.');
          setDialogOpen(false);
        },
        onError: () => toast.error('Gagal menambahkan data.'),
      });
    }
  };

  const handleDelete = (id: number) => {
    router.delete(`/kro_pd/${id}`, {
      onSuccess: () => toast.success('Data berhasil dihapus.'),
      onError: () => toast.error('Gagal menghapus data.'),
    });
  };

  // Ambil Data — import massal Program/Kegiatan/SubKegiatan dari II_a_KRS_PD
  // (struktur field-nya identik, cuma dasar dokumen beda: Renja/RKA vs
  // Renstra), supaya tidak perlu mengetik ulang data yang sudah ada.
  const handleImportFromKrsPd = () => {
    router.post(
      '/kro_pd/import-from-krs-pd',
      {},
      {
        onSuccess: () => toast.success('Data berhasil diambil dari KRS_PD.'),
        onError: () => toast.error('Gagal mengambil data dari KRS_PD.'),
      },
    );
  };

  // Dialog EDIT NODE non-leaf (Program/Kegiatan).
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
      '/kro_pd_node/update',
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
    router.delete('/kro_pd_node/delete', {
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
      <Head title="III_a_KRO_PD" />
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">III_a_KRO_PD</h1>
            <p className="text-sm text-muted-foreground">
              Risiko Operasional Perangkat Daerah — Renja/RKA: Program, Kegiatan, dan SubKegiatan
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleImportFromKrsPd}>
              <Download className="mr-2 h-4 w-4" />
              Ambil Data dari KRS_PD
            </Button>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Data
            </Button>
          </div>
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
              placeholder="Cari program, kegiatan, subkegiatan, OPD... (Enter untuk cari/lanjut)"
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
          {sasaranRenstras.filter((sr): sr is SasaranRenstraItem => !isNonPrioritas(sr)).map((sr) => (
            <SasaranRenstraCard key={sr.id} sr={sr} cb={cb} />
          ))}
          <NonPrioritasGroup programs={sasaranRenstras.filter(isNonPrioritas)} cb={cb} />
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Data' : 'Tambah Data'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Toggle Prioritas vs Non-Prioritas — auto-detect dari Sasaran
                Renstra, bisa juga di-toggle manual. */}
            <div className="flex items-start gap-2 rounded-md border border-dashed p-3">
              <Checkbox
                id="non-prioritas"
                checked={nonPrioritas}
                onCheckedChange={(v) => toggleNonPrioritas(v === true)}
                className="mt-0.5"
              />
              <div className="space-y-0.5">
                <Label htmlFor="non-prioritas" className="cursor-pointer">
                  Program Non-Prioritas (tanpa parent Sasaran Renstra)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Centang untuk program yang tidak menurun dari Sasaran Renstra (mis. program
                  pendukung / program level Kecamatan). Otomatis tercentang bila Sasaran Renstra
                  dikosongkan.
                </p>
              </div>
            </div>

            {!nonPrioritas && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Label>{SASARAN_RENSTRA_FIELD}</Label>
                  {KRO_PD_FIELD_INFO[SASARAN_RENSTRA_FIELD] && <FieldInfoPopover text={KRO_PD_FIELD_INFO[SASARAN_RENSTRA_FIELD]} />}
                </div>
                <AutocompleteSelect
                  value={data[SASARAN_RENSTRA_FIELD]}
                  onChange={handleSasaranChange}
                  options={fieldOptions[SASARAN_RENSTRA_FIELD] ?? []}
                  placeholder="Pilih Sasaran Renstra yang sudah ada di KRS_PD"
                  dropdownClassName="w-[32rem]"
                />
                {errors[SASARAN_RENSTRA_FIELD] && <p className="text-sm text-destructive">{errors[SASARAN_RENSTRA_FIELD]}</p>}
              </div>
            )}

            {FIELDS.map((field) => {
              const isProgram = field === 'PROGRAM PD';
              return (
                <div key={field} className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor={field}>{field}</Label>
                    {KRO_PD_FIELD_INFO[field] && <FieldInfoPopover text={KRO_PD_FIELD_INFO[field]} />}
                    {isProgram && program1aMap[matchKey(data['PROGRAM PD'] ?? '')] && (
                      <Badge variant="secondary" className="text-[10px]">terisi dari 2a</Badge>
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
                {KRO_PD_FIELD_INFO[OPD_FIELD] && <FieldInfoPopover text={KRO_PD_FIELD_INFO[OPD_FIELD]} />}
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
                    {KRO_PD_FIELD_INFO[field] && <FieldInfoPopover text={KRO_PD_FIELD_INFO[field]} />}
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
