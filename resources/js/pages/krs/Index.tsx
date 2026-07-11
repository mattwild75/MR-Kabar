import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import AutocompleteTextarea from '@/components/ui/autocomplete-textarea';
import AutocompleteMultiline from '@/components/ui/autocomplete-multiline';
import FieldInfoPopover from '@/components/ui/field-info-popover';
import { KRS_FIELD_INFO } from '@/lib/krs-field-info';
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
import { createContext, useContext } from 'react';
import { LEVEL_COLORS } from '@/lib/hierarchy-level-colors';

// KRS_Pemda (I_a) lintas-OPD/RPJMD — dibatasi per-ROLE (admin/super-admin
// saja yang boleh kelola), bukan row-level seperti level II/III (lihat
// canManageRow di resources/js/lib/ownership.ts). Dipakai lewat Context
// alih-alih diteruskan sebagai prop berjenjang di 4 level komponen tree
// (VisiCard -> TujuanRow -> SasaranRow -> ProgramRow) karena nilainya sama
// untuk seluruh halaman, bukan per-baris.
const IsAdminContext = createContext(false);
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

const FIELDS = [
  'VISI',
  'MISI',
  'TUJUAN RPJMD',
  'IK TUJUAN RPJMD',
  'BASELINE IK TUJUAN RPJMD',
  'TARGET IK TUJUAN RPJMD',
  'SATUAN IK TUJUAN RPJMD',
  'OPD IK TUJUAN RPJMD',
  'SASARAN RPJMD',
  'IK SASARAN RPJMD',
  'BASELINE IK SASARAN RPJMD',
  'TARGET IK SASARAN RPJMD',
  'SATUAN IK SASARAN RPJMD',
  'OPD IK SASARAN RPJMD',
  'PROGRAM PRIORITAS',
  'OUTCOME PROGRAM PRIORITAS',
  'IK PROGRAM',
  'BASELINE IK PROGRAM',
  'TARGET IK PROGRAM',
  'SATUAN IK PROGRAM',
] as const;

const OPD_FIELD = 'OPD PENANGGUNGJAWAB PROGRAM';

// Field rantai-atas (Visi→Sasaran RPJMD + IK-nya) yang hanya relevan untuk
// program prioritas. Saat mode NON-PRIORITAS aktif, field ini disembunyikan &
// dikosongkan — program non-prioritas langsung mulai dari PROGRAM PRIORITAS.
const PARENT_CHAIN_FIELDS = [
  'VISI', 'MISI',
  'TUJUAN RPJMD', 'IK TUJUAN RPJMD', 'BASELINE IK TUJUAN RPJMD', 'TARGET IK TUJUAN RPJMD', 'SATUAN IK TUJUAN RPJMD', 'OPD IK TUJUAN RPJMD',
  'SASARAN RPJMD', 'IK SASARAN RPJMD', 'BASELINE IK SASARAN RPJMD', 'TARGET IK SASARAN RPJMD', 'SATUAN IK SASARAN RPJMD', 'OPD IK SASARAN RPJMD',
] as const;
const PARENT_CHAIN_SET = new Set<string>(PARENT_CHAIN_FIELDS);

// Field yang bisa berisi beberapa nilai sekaligus, satu nilai per baris
// (Enter = baris baru), supaya baris ke-N di IK/Baseline/Target/Satuan/OPD
// saling berpasangan (dan baris yang sengaja dikosongkan tetap mempertahankan
// posisi pasangannya — mis. IK ke-4 tidak punya Baseline tapi punya Target).
const MULTI_VALUE_FIELDS = new Set<string>([
  'IK TUJUAN RPJMD',
  'BASELINE IK TUJUAN RPJMD',
  'TARGET IK TUJUAN RPJMD',
  'SATUAN IK TUJUAN RPJMD',
  'OPD IK TUJUAN RPJMD',
  'IK SASARAN RPJMD',
  'BASELINE IK SASARAN RPJMD',
  'TARGET IK SASARAN RPJMD',
  'SATUAN IK SASARAN RPJMD',
  'OPD IK SASARAN RPJMD',
  'IK PROGRAM',
  'BASELINE IK PROGRAM',
  'TARGET IK PROGRAM',
  'SATUAN IK PROGRAM',
]);

type RawRow = Record<string, string | null>;

interface ProgramItem {
  id: number;
  kode: string;
  nama: string;
  outcome: string | null;
  ik_program: string | null;
  baseline_ik_program: string | null;
  target_ik_program: string | null;
  satuan_ik_program: string | null;
  opd_penanggungjawab: string | null;
  raw: RawRow;
}

interface SasaranItem {
  id: string;
  kode: string;
  deskripsi: string;
  ik_sasaran: string | null;
  baseline_ik_sasaran: string | null;
  target_ik_sasaran: string | null;
  satuan_ik_sasaran: string | null;
  opd_ik_sasaran: string | null;
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
  opd_ik_tujuan: string | null;
  sasarans: SasaranItem[];
}

interface MisiItem {
  id: number;
  kode: string;
  deskripsi: string;
  tujuans: TujuanItem[];
}

interface VisiItem {
  id: number;
  deskripsi: string;
  misis: MisiItem[];
}

// Node top-level NON-PRIORITAS (berbentuk Program, tanpa Visi/Misi/Tujuan/
// Sasaran di atasnya). Sejajar dengan Visi agar semua program tampil 1 level.
interface NonPrioritasProgramItem extends ProgramItem {
  is_non_prioritas: true;
  is_prioritas: false;
}

type TopLevelItem = VisiItem | NonPrioritasProgramItem;

function isNonPrioritas(item: TopLevelItem): item is NonPrioritasProgramItem {
  return (item as NonPrioritasProgramItem).is_non_prioritas === true;
}

interface PageProps {
  visis: TopLevelItem[];
  opdOptions: string[];
  fieldOptions: Record<string, string[]>;
  isAdmin: boolean;
}

const keyOf = (level: string, id: string | number) => `${level}:${id}`;

function programMatches(program: ProgramItem, q: string): boolean {
  return (
    program.nama.toLowerCase().includes(q) ||
    (program.outcome ?? '').toLowerCase().includes(q) ||
    (program.ik_program ?? '').toLowerCase().includes(q) ||
    (program.opd_penanggungjawab ?? '').toLowerCase().includes(q)
  );
}

function tujuanMatches(tujuan: TujuanItem, q: string): boolean {
  return (
    tujuan.deskripsi.toLowerCase().includes(q) ||
    (tujuan.ik_tujuan ?? '').toLowerCase().includes(q) ||
    (tujuan.opd_ik_tujuan ?? '').toLowerCase().includes(q)
  );
}

function sasaranMatches(sasaran: SasaranItem, q: string): boolean {
  return (
    sasaran.deskripsi.toLowerCase().includes(q) ||
    (sasaran.ik_sasaran ?? '').toLowerCase().includes(q) ||
    (sasaran.opd_ik_sasaran ?? '').toLowerCase().includes(q)
  );
}

/**
 * Mengumpulkan node (visi/misi/tujuan/sasaran/program) yang TEKS-nya SENDIRI
 * cocok dengan query, dalam urutan render (DFS) — ini yang jadi target
 * next/previous, seperti Ctrl+F melompat ke teks yang match, bukan ke
 * container-nya. Juga mengembalikan peta ancestor per key supaya node yang
 * tersembunyi bisa di-expand otomatis saat dilompati.
 */
function collectMatches(visis: TopLevelItem[], q: string): { matches: string[]; ancestors: Map<string, string[]> } {
  const matches: string[] = [];
  const ancestors = new Map<string, string[]>();

  for (const visi of visis) {
    // Node NON-PRIORITAS (top-level, berbentuk program) — cocokkan langsung
    // sebagai program tanpa rantai di atasnya, agar SELURUH tree view ikut
    // tersaring pencarian.
    if (isNonPrioritas(visi)) {
      if (programMatches(visi, q)) {
        const programKey = keyOf('program', visi.id);
        matches.push(programKey);
        // Ancestor = node induk grup non-prioritas, supaya lompat-ke-hasil
        // otomatis meng-expand grup yang menaunginya.
        ancestors.set(programKey, [keyOf('np-group', 'root')]);
      }
      continue;
    }

    const visiKey = keyOf('visi', visi.id);
    if (visi.deskripsi.toLowerCase().includes(q)) {
      matches.push(visiKey);
      ancestors.set(visiKey, []);
    }
    for (const misi of visi.misis) {
      const misiKey = keyOf('misi', misi.id);
      if (misi.deskripsi.toLowerCase().includes(q)) {
        matches.push(misiKey);
        ancestors.set(misiKey, [visiKey]);
      }
      for (const tujuan of misi.tujuans) {
        const tujuanKey = keyOf('tujuan', tujuan.id);
        if (tujuanMatches(tujuan, q)) {
          matches.push(tujuanKey);
          ancestors.set(tujuanKey, [visiKey, misiKey]);
        }
        for (const sasaran of tujuan.sasarans) {
          const sasaranKey = keyOf('sasaran', sasaran.id);
          if (sasaranMatches(sasaran, q)) {
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

// ── Edit NODE non-leaf (Visi/Misi/Tujuan/Sasaran) ─────────────────────────
// Kolom yang bisa diedit per level (hanya level itu — parent & anak tak
// disentuh) dan kolom identifikasi (nilai LAMA) untuk mencari baris node.
type NodeLevel = 'visi' | 'misi' | 'tujuan' | 'sasaran';

const NODE_LEVEL_FIELDS: Record<NodeLevel, string[]> = {
  visi: ['VISI'],
  misi: ['MISI'],
  tujuan: [
    'TUJUAN RPJMD', 'IK TUJUAN RPJMD', 'BASELINE IK TUJUAN RPJMD',
    'TARGET IK TUJUAN RPJMD', 'SATUAN IK TUJUAN RPJMD', 'OPD IK TUJUAN RPJMD',
  ],
  sasaran: [
    'SASARAN RPJMD', 'IK SASARAN RPJMD', 'BASELINE IK SASARAN RPJMD',
    'TARGET IK SASARAN RPJMD', 'SATUAN IK SASARAN RPJMD', 'OPD IK SASARAN RPJMD',
  ],
};

const NODE_LEVEL_LABEL: Record<NodeLevel, string> = {
  visi: 'Visi', misi: 'Misi', tujuan: 'Tujuan', sasaran: 'Sasaran',
};

interface NodeEditTarget {
  level: NodeLevel;
  match: Record<string, string>;  // nilai LAMA kolom identifikasi (ternormalisasi)
  values: Record<string, string>; // nilai awal field level (untuk prefill form)
  title: string;                  // mis. "Tujuan 1.2"
}

type NodeEditFn = (target: NodeEditTarget) => void;

// Hapus node non-leaf: cukup level + match (identifikasi baris) + judul.
interface NodeDeleteTarget {
  level: NodeLevel;
  match: Record<string, string>;
  title: string;
}
type NodeDeleteFn = (target: NodeDeleteTarget) => void;

type FormData = Record<(typeof FIELDS)[number] | typeof OPD_FIELD, string>;

const emptyForm = (): FormData => {
  const obj = {} as FormData;
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
  opd,
  query,
}: {
  label: string;
  kode: string;
  ik: string | null;
  baseline: string | null;
  target: string | null;
  satuan: string | null;
  opd: string | null;
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

function ProgramRow({
  program,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  query,
  currentMatchKey,
  registerRef,
}: {
  program: ProgramItem;
  expanded: Set<string>;
  onToggle: (key: string, open: boolean) => void;
  onEdit: (program: ProgramItem) => void;
  onDelete: (id: number) => void;
  query: string;
  currentMatchKey: string | null;
  registerRef: (key: string, el: HTMLElement | null) => void;
}) {
  const isAdmin = useContext(IsAdminContext);
  const key = keyOf('program', program.id);
  const open = expanded.has(key);
  const isCurrent = currentMatchKey === key;

  return (
    <Collapsible open={open} onOpenChange={(o) => onToggle(key, o)}>
      <div
        ref={(el) => registerRef(key, el)}
        className={`flex w-full items-center gap-2 rounded-md border-l-4 ${LEVEL_COLORS.program.border} px-3 py-2 hover:bg-muted/50 ${isCurrent ? 'ring-2 ring-orange-500' : ''}`}
      >
        <CollapsibleTrigger className="flex flex-1 items-center gap-2 text-left text-sm">
          <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${LEVEL_COLORS.program.chevron} ${open ? 'rotate-90' : ''}`} />
          <span className={`flex-1 font-medium ${LEVEL_COLORS.program.text}`}>
            Program {program.kode} : <HighlightText text={program.nama} query={query} />
          </span>
          {program.opd_penanggungjawab && (
            <div className="flex shrink-0 flex-col items-end gap-1">
              {program.opd_penanggungjawab
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
        {isAdmin ? (
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(program)}>
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
                  <AlertDialogTitle>Hapus program ini?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Data program "{program.nama}" akan dihapus permanen. Nomor kode program lain di bawah Sasaran ini
                    akan otomatis bergeser setelah dihapus.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(program.id)} className="bg-destructive hover:bg-destructive/90">
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : (
          <span className="shrink-0 text-xs text-muted-foreground">Hanya Admin</span>
        )}
      </div>
      <CollapsibleContent className="px-3 pb-3 pl-9">
        {program.outcome && <p className="mb-2 text-sm text-muted-foreground">Outcome: {program.outcome}</p>}
        <IkInfo
          label="IK Program"
          kode={program.kode}
          ik={program.ik_program}
          baseline={program.baseline_ik_program}
          target={program.target_ik_program}
          satuan={program.satuan_ik_program}
          // OPD program (penanggung jawab) ditampilkan juga di kolom OPD tabel
          // IK — RPJMD 1a tidak punya OPD per-indikator, jadi dipakai OPD
          // program agar kolom tidak kosong ("-") & konsisten dgn badge header.
          opd={program.opd_penanggungjawab}
          query={query}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}

// Tombol edit satu NODE non-leaf (dipakai di header Visi/Misi/Tujuan/Sasaran).
// Berhenti-propagasi supaya klik tombol tidak ikut membuka/menutup collapsible.
function NodeEditButton({ onClick }: { onClick: () => void }) {
  const isAdmin = useContext(IsAdminContext);
  if (!isAdmin) return null;
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

// Tombol HAPUS satu NODE non-leaf + popup konfirmasi (AlertDialog). Menghapus
// node berarti menghapus SELURUH baris/anak di bawahnya, jadi wajib
// dikonfirmasi. Sama seperti edit: hanya tampil untuk admin/super-admin di 1a.
function NodeDeleteButton({
  level,
  match,
  title,
  onDeleteNode,
}: {
  level: NodeLevel;
  match: Record<string, string>;
  title: string;
  onDeleteNode: NodeDeleteFn;
}) {
  const isAdmin = useContext(IsAdminContext);
  if (!isAdmin) return null;
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
          <AlertDialogTitle>Hapus {NODE_LEVEL_LABEL[level]} "{title}"?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini menghapus <b>{NODE_LEVEL_LABEL[level]}</b> ini beserta{' '}
            <b>SELURUH baris/anak di bawahnya</b> (mis. seluruh sasaran & program di dalamnya)
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

function SasaranRow({
  sasaran,
  visiDesc,
  misiDesc,
  tujuanDesc,
  expanded,
  onToggle,
  onEdit,
  onEditNode,
  onDeleteNode,
  onDelete,
  query,
  currentMatchKey,
  activeAncestorKeys,
  registerRef,
}: {
  sasaran: SasaranItem;
  visiDesc: string;
  misiDesc: string;
  tujuanDesc: string;
  expanded: Set<string>;
  onToggle: (key: string, open: boolean) => void;
  onEdit: (program: ProgramItem) => void;
  onEditNode: NodeEditFn;
  onDeleteNode: NodeDeleteFn;
  onDelete: (id: number) => void;
  query: string;
  currentMatchKey: string | null;
  activeAncestorKeys: Set<string>;
  registerRef: (key: string, el: HTMLElement | null) => void;
}) {
  const key = keyOf('sasaran', sasaran.id);
  const open = expanded.has(key);
  const isCurrent = currentMatchKey === key;
  const isActiveAncestor = activeAncestorKeys.has(key);

  const nodeTitle = `Sasaran ${sasaran.kode}`;
  const nodeMatch = { VISI: visiDesc, MISI: misiDesc, 'TUJUAN RPJMD': tujuanDesc, 'SASARAN RPJMD': sasaran.deskripsi };
  const editThisNode = () =>
    onEditNode({
      level: 'sasaran',
      title: nodeTitle,
      match: nodeMatch,
      values: {
        'SASARAN RPJMD': sasaran.deskripsi,
        'IK SASARAN RPJMD': sasaran.ik_sasaran ?? '',
        'BASELINE IK SASARAN RPJMD': sasaran.baseline_ik_sasaran ?? '',
        'TARGET IK SASARAN RPJMD': sasaran.target_ik_sasaran ?? '',
        'SATUAN IK SASARAN RPJMD': sasaran.satuan_ik_sasaran ?? '',
        'OPD IK SASARAN RPJMD': sasaran.opd_ik_sasaran ?? '',
      },
    });

  return (
    <Collapsible open={open} onOpenChange={(o) => onToggle(key, o)}>
      <div
        ref={(el) => registerRef(key, el)}
        className={`flex w-full items-center gap-2 rounded-md border-l-4 ${LEVEL_COLORS.sasaran.border} px-3 py-2 hover:bg-muted/50 ${isCurrent ? 'ring-2 ring-orange-500' : isActiveAncestor ? 'ring-1 ring-orange-300 bg-orange-50 dark:bg-orange-950/30' : ''}`}
      >
        <CollapsibleTrigger className="flex flex-1 items-center gap-2 text-left">
          <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${LEVEL_COLORS.sasaran.chevron} ${open ? 'rotate-90' : ''}`} />
          <span className={`flex-1 font-medium ${LEVEL_COLORS.sasaran.text}`}>
            Sasaran {sasaran.kode} : <HighlightText text={sasaran.deskripsi} query={query} />
          </span>
          <Badge variant="secondary" className="shrink-0">
            {sasaran.programs.length} program
          </Badge>
        </CollapsibleTrigger>
        <NodeEditButton onClick={editThisNode} />
        <NodeDeleteButton level="sasaran" match={nodeMatch} title={nodeTitle} onDeleteNode={onDeleteNode} />
      </div>
      <CollapsibleContent className="space-y-1 px-3 pb-3 pl-9">
        <IkInfo
          label="IK Sasaran"
          kode={sasaran.kode}
          ik={sasaran.ik_sasaran}
          baseline={sasaran.baseline_ik_sasaran}
          target={sasaran.target_ik_sasaran}
          satuan={sasaran.satuan_ik_sasaran}
          opd={sasaran.opd_ik_sasaran}
          query={query}
        />
        <div className="mt-2 divide-y rounded-md border">
          {sasaran.programs.map((program) => (
            <ProgramRow
              key={program.id}
              program={program}
              expanded={expanded}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              query={query}
              currentMatchKey={currentMatchKey}
              registerRef={registerRef}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function TujuanRow({
  tujuan,
  visiDesc,
  misiDesc,
  expanded,
  onToggle,
  onEdit,
  onEditNode,
  onDeleteNode,
  onDelete,
  query,
  currentMatchKey,
  activeAncestorKeys,
  registerRef,
}: {
  tujuan: TujuanItem;
  visiDesc: string;
  misiDesc: string;
  expanded: Set<string>;
  onToggle: (key: string, open: boolean) => void;
  onEdit: (program: ProgramItem) => void;
  onEditNode: NodeEditFn;
  onDeleteNode: NodeDeleteFn;
  onDelete: (id: number) => void;
  query: string;
  currentMatchKey: string | null;
  activeAncestorKeys: Set<string>;
  registerRef: (key: string, el: HTMLElement | null) => void;
}) {
  const key = keyOf('tujuan', tujuan.id);
  const open = expanded.has(key);
  const isCurrent = currentMatchKey === key;
  const isActiveAncestor = activeAncestorKeys.has(key);

  const nodeTitle = `Tujuan ${tujuan.kode}`;
  const nodeMatch = { VISI: visiDesc, MISI: misiDesc, 'TUJUAN RPJMD': tujuan.deskripsi };
  const editThisNode = () =>
    onEditNode({
      level: 'tujuan',
      title: nodeTitle,
      match: nodeMatch,
      values: {
        'TUJUAN RPJMD': tujuan.deskripsi,
        'IK TUJUAN RPJMD': tujuan.ik_tujuan ?? '',
        'BASELINE IK TUJUAN RPJMD': tujuan.baseline_ik_tujuan ?? '',
        'TARGET IK TUJUAN RPJMD': tujuan.target_ik_tujuan ?? '',
        'SATUAN IK TUJUAN RPJMD': tujuan.satuan_ik_tujuan ?? '',
        'OPD IK TUJUAN RPJMD': tujuan.opd_ik_tujuan ?? '',
      },
    });

  return (
    <Collapsible open={open} onOpenChange={(o) => onToggle(key, o)}>
      <div
        ref={(el) => registerRef(key, el)}
        className={`flex w-full items-center gap-2 rounded-md border-l-4 ${LEVEL_COLORS.tujuan.border} px-3 py-2 hover:bg-muted/50 ${isCurrent ? 'ring-2 ring-orange-500' : isActiveAncestor ? 'ring-1 ring-orange-300 bg-orange-50 dark:bg-orange-950/30' : ''}`}
      >
        <CollapsibleTrigger className="flex flex-1 items-center gap-2 text-left">
          <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${LEVEL_COLORS.tujuan.chevron} ${open ? 'rotate-90' : ''}`} />
          <span className={`flex-1 font-medium ${LEVEL_COLORS.tujuan.text}`}>
            Tujuan {tujuan.kode} : <HighlightText text={tujuan.deskripsi} query={query} />
          </span>
          <Badge variant="secondary" className="shrink-0">
            {tujuan.sasarans.length} sasaran
          </Badge>
        </CollapsibleTrigger>
        <NodeEditButton onClick={editThisNode} />
        <NodeDeleteButton level="tujuan" match={nodeMatch} title={nodeTitle} onDeleteNode={onDeleteNode} />
      </div>
      <CollapsibleContent className="space-y-1 px-3 pb-3 pl-9">
        <IkInfo
          label="IK Tujuan"
          kode={tujuan.kode}
          ik={tujuan.ik_tujuan}
          baseline={tujuan.baseline_ik_tujuan}
          target={tujuan.target_ik_tujuan}
          satuan={tujuan.satuan_ik_tujuan}
          opd={tujuan.opd_ik_tujuan}
          query={query}
        />
        <div className="mt-2 divide-y rounded-md border">
          {tujuan.sasarans.map((sasaran) => (
            <SasaranRow
              key={sasaran.id}
              sasaran={sasaran}
              visiDesc={visiDesc}
              misiDesc={misiDesc}
              tujuanDesc={tujuan.deskripsi}
              expanded={expanded}
              onToggle={onToggle}
              onEdit={onEdit}
              onEditNode={onEditNode}
              onDeleteNode={onDeleteNode}
              onDelete={onDelete}
              query={query}
              currentMatchKey={currentMatchKey}
              activeAncestorKeys={activeAncestorKeys}
              registerRef={registerRef}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function MisiCard({
  misi,
  visiDesc,
  expanded,
  onToggle,
  onEdit,
  onEditNode,
  onDeleteNode,
  onDelete,
  query,
  currentMatchKey,
  activeAncestorKeys,
  registerRef,
}: {
  misi: MisiItem;
  visiDesc: string;
  expanded: Set<string>;
  onToggle: (key: string, open: boolean) => void;
  onEdit: (program: ProgramItem) => void;
  onEditNode: NodeEditFn;
  onDeleteNode: NodeDeleteFn;
  onDelete: (id: number) => void;
  query: string;
  currentMatchKey: string | null;
  activeAncestorKeys: Set<string>;
  registerRef: (key: string, el: HTMLElement | null) => void;
}) {
  const key = keyOf('misi', misi.id);
  const open = expanded.has(key);
  const isCurrent = currentMatchKey === key;
  const isActiveAncestor = activeAncestorKeys.has(key);

  const nodeTitle = `Misi ${misi.kode}`;
  const nodeMatch = { VISI: visiDesc, MISI: misi.deskripsi };
  const editThisNode = () =>
    onEditNode({
      level: 'misi',
      title: nodeTitle,
      match: nodeMatch,
      values: { MISI: misi.deskripsi },
    });

  return (
    <Collapsible open={open} onOpenChange={(o) => onToggle(key, o)}>
      <div
        ref={(el) => registerRef(key, el)}
        className={`flex w-full items-center gap-3 rounded-md border-l-4 ${LEVEL_COLORS.misi.border} p-3 hover:bg-muted/30 ${isCurrent ? 'ring-2 ring-orange-500' : isActiveAncestor ? 'ring-1 ring-orange-300 bg-orange-50 dark:bg-orange-950/30' : ''}`}
      >
        <CollapsibleTrigger className="flex flex-1 items-center gap-3 text-left">
          <ChevronRight className={`h-5 w-5 shrink-0 transition-transform ${LEVEL_COLORS.misi.chevron} ${open ? 'rotate-90' : ''}`} />
          <div className="flex-1">
            <p className={`text-xs font-medium ${LEVEL_COLORS.misi.text}`}>Misi {misi.kode}</p>
            <p className={`font-semibold ${LEVEL_COLORS.misi.text}`}>
              <HighlightText text={misi.deskripsi} query={query} />
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {misi.tujuans.length} tujuan
          </Badge>
        </CollapsibleTrigger>
        <NodeEditButton onClick={editThisNode} />
        <NodeDeleteButton level="misi" match={nodeMatch} title={nodeTitle} onDeleteNode={onDeleteNode} />
      </div>
      <CollapsibleContent className="px-3 pb-3">
        <div className="divide-y rounded-md border">
          {misi.tujuans.map((tujuan) => (
            <TujuanRow
              key={tujuan.id}
              tujuan={tujuan}
              visiDesc={visiDesc}
              misiDesc={misi.deskripsi}
              expanded={expanded}
              onToggle={onToggle}
              onEdit={onEdit}
              onEditNode={onEditNode}
              onDeleteNode={onDeleteNode}
              onDelete={onDelete}
              query={query}
              currentMatchKey={currentMatchKey}
              activeAncestorKeys={activeAncestorKeys}
              registerRef={registerRef}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function VisiCard({
  visi,
  expanded,
  onToggle,
  onEdit,
  onEditNode,
  onDeleteNode,
  onDelete,
  query,
  currentMatchKey,
  activeAncestorKeys,
  registerRef,
}: {
  visi: VisiItem;
  expanded: Set<string>;
  onToggle: (key: string, open: boolean) => void;
  onEdit: (program: ProgramItem) => void;
  onEditNode: NodeEditFn;
  onDeleteNode: NodeDeleteFn;
  onDelete: (id: number) => void;
  query: string;
  currentMatchKey: string | null;
  activeAncestorKeys: Set<string>;
  registerRef: (key: string, el: HTMLElement | null) => void;
}) {
  const key = keyOf('visi', visi.id);
  const open = expanded.has(key);
  const isCurrent = currentMatchKey === key;
  const isActiveAncestor = activeAncestorKeys.has(key);

  const nodeMatch = { VISI: visi.deskripsi };
  const editThisNode = () =>
    onEditNode({
      level: 'visi',
      title: 'Visi',
      match: nodeMatch,
      values: { VISI: visi.deskripsi },
    });

  return (
    <Card
      ref={(el) => registerRef(key, el)}
      // Kartu VISI = node INTI. Aksen indigo/biru tegas (border kiri tebal +
      // latar gradien halus) supaya lebih menonjol daripada kartu non-prioritas
      // (amber) — inti RPJMD harus paling menarik perhatian.
      className={`overflow-hidden border-l-4 border-l-indigo-500 bg-gradient-to-r from-indigo-50/80 to-transparent shadow-sm dark:border-l-indigo-400 dark:from-indigo-950/40 ${
        isCurrent ? 'ring-2 ring-orange-500' : isActiveAncestor ? 'ring-1 ring-orange-300' : 'border-indigo-200/70 dark:border-indigo-500/30'
      }`}
    >
      <Collapsible open={open} onOpenChange={(o) => onToggle(key, o)}>
        <div className="flex w-full items-center gap-3 p-4 hover:bg-indigo-100/30 dark:hover:bg-indigo-900/20">
          <CollapsibleTrigger className="flex flex-1 items-center gap-3 text-left">
            <ChevronRight className={`h-5 w-5 shrink-0 text-indigo-500 transition-transform ${open ? 'rotate-90' : ''}`} />
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <Badge className="border-transparent bg-indigo-600 text-[10px] uppercase tracking-wide text-white hover:bg-indigo-600">
                  Visi
                </Badge>
                <span className="text-xs font-medium text-indigo-600/80 dark:text-indigo-300/80">· Inti RPJMD</span>
              </div>
              <p className="text-lg font-bold text-indigo-950 dark:text-indigo-100">
                <HighlightText text={visi.deskripsi} query={query} />
              </p>
            </div>
            <Badge variant="secondary" className="shrink-0">
              {visi.misis.length} misi
            </Badge>
          </CollapsibleTrigger>
          <NodeEditButton onClick={editThisNode} />
          <NodeDeleteButton level="visi" match={nodeMatch} title="Visi" onDeleteNode={onDeleteNode} />
        </div>
        <CollapsibleContent>
          <CardContent className="space-y-1 border-t pt-4">
            <div className="divide-y rounded-md border">
              {visi.misis.map((misi) => (
                <MisiCard
                  key={misi.id}
                  misi={misi}
                  visiDesc={visi.deskripsi}
                  expanded={expanded}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onEditNode={onEditNode}
                  onDeleteNode={onDeleteNode}
                  onDelete={onDelete}
                  query={query}
                  currentMatchKey={currentMatchKey}
                  activeAncestorKeys={activeAncestorKeys}
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

// Kartu top-level untuk program NON-PRIORITAS: sejajar dengan Visi, bergaya
// beda (badge, border putus-putus). Isinya me-reuse ProgramRow supaya
// edit/hapus/IK/OPD tetap konsisten dengan program prioritas.
function NonPrioritasCard({
  program,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  query,
  currentMatchKey,
  registerRef,
}: {
  program: NonPrioritasProgramItem;
  expanded: Set<string>;
  onToggle: (key: string, open: boolean) => void;
  onEdit: (program: ProgramItem) => void;
  onDelete: (id: number) => void;
  query: string;
  currentMatchKey: string | null;
  registerRef: (key: string, el: HTMLElement | null) => void;
}) {
  const key = keyOf('program', program.id);
  const open = expanded.has(key);
  const isCurrent = currentMatchKey === key;
  const isAdmin = useContext(IsAdminContext);
  const opds = (program.opd_penanggungjawab ?? '')
    .split('\n')
    .map((o) => o.trim())
    .filter((o) => o !== '');

  return (
    // Warna & aksen AMBER yang tegas + border kiri tebal supaya program
    // non-prioritas langsung terbedakan dari kartu Visi (biru gelap).
    // Expand/collapse: SELURUH header kartu jadi satu trigger (chevron + judul),
    // konsisten dgn kartu Visi — isi (IK Program) muncul di bawahnya.
    <Card
      ref={(el) => registerRef(key, el)}
      className={`border-l-2 border-l-amber-400/70 bg-transparent dark:border-l-amber-500/50 ${isCurrent ? 'ring-2 ring-orange-500' : 'border-amber-300/40 dark:border-amber-500/20'}`}
    >
      <Collapsible open={open} onOpenChange={(o) => onToggle(key, o)}>
        <div className="flex w-full items-start gap-2 p-4">
          <CollapsibleTrigger className="flex flex-1 items-center gap-3 text-left hover:opacity-80">
            <ChevronRight className={`h-5 w-5 shrink-0 text-amber-600 transition-transform ${open ? 'rotate-90' : ''}`} />
            {/* Badge/keterangan non-prioritas cukup di TAB INDUK (grup) —
                di kartu anak cukup nama program biar ringkas. */}
            <p className="flex-1 font-semibold">
              Program {program.kode} : <HighlightText text={program.nama} query={query} />
            </p>
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

          {isAdmin && (
            <div className="flex shrink-0 gap-1">
              <Button variant="ghost" size="icon" onClick={() => onEdit(program)}>
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
                    <AlertDialogTitle>Hapus program ini?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Data program "{program.nama}" akan dihapus permanen.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(program.id)} className="bg-destructive hover:bg-destructive/90">
                      Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        <CollapsibleContent>
          <CardContent className="border-t border-amber-400/30 pt-4">
            {program.outcome && <p className="mb-2 text-sm text-muted-foreground">Outcome: {program.outcome}</p>}
            <IkInfo
              label="IK Program"
              kode={program.kode}
              ik={program.ik_program}
              baseline={program.baseline_ik_program}
              target={program.target_ik_program}
              satuan={program.satuan_ik_program}
              opd={program.opd_penanggungjawab}
              query={query}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Node induk yang menaungi SELURUH program non-prioritas dalam satu kartu
// collapsible (default tertutup), sejajar dengan kartu Visi. Meng-collapse
// induk ini menyembunyikan semua program non-prioritas sekaligus.
function NonPrioritasGroup({
  programs,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  query,
  currentMatchKey,
  registerRef,
}: {
  programs: NonPrioritasProgramItem[];
  expanded: Set<string>;
  onToggle: (key: string, open: boolean) => void;
  onEdit: (program: ProgramItem) => void;
  onDelete: (id: number) => void;
  query: string;
  currentMatchKey: string | null;
  registerRef: (key: string, el: HTMLElement | null) => void;
}) {
  if (programs.length === 0) return null;

  // Key tetap (bukan per-program) supaya state buka/tutup induk terjaga.
  const groupKey = keyOf('np-group', 'root');
  const open = expanded.has(groupKey);

  return (
    <Card
      ref={(el) => registerRef(groupKey, el)}
      className="border-l-4 border-l-amber-500 border-amber-400/60 bg-amber-50/40 dark:border-amber-500/40 dark:border-l-amber-500 dark:bg-amber-950/10"
    >
      <Collapsible open={open} onOpenChange={(o) => onToggle(groupKey, o)}>
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
              <NonPrioritasCard
                key={`np-${program.id}`}
                program={program}
                expanded={expanded}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
                query={query}
                currentMatchKey={currentMatchKey}
                registerRef={registerRef}
              />
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default function KrsIndex({ visis, opdOptions, fieldOptions, isAdmin }: PageProps) {
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProgramItem | null>(null);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  // Mode NON-PRIORITAS: program tanpa Sasaran RPJMD. Auto-detect dari
  // terisi/kosongnya Sasaran RPJMD, juga bisa di-toggle manual.
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

  // Dialog EDIT NODE non-leaf (terpisah dari dialog program/leaf di atas).
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
    // Kirim level + nilai LAMA (match) + nilai BARU (values). Backend meng-update
    // SELURUH baris yang membentuk node ini sekaligus, jadi node tidak pecah.
    router.put(
      '/krs_pemda_node/update',
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

  // Hapus satu NODE non-leaf beserta SELURUH baris/anak di bawahnya. Konfirmasi
  // sudah dilakukan lewat AlertDialog di NodeDeleteButton, jadi di sini langsung
  // kirim request. router.delete membawa payload lewat opsi `data`.
  const handleDeleteNode = (target: NodeDeleteTarget) => {
    router.delete('/krs_pemda_node/delete', {
      data: { level: target.level, match: target.match },
      onSuccess: () => toast.success('Node berhasil dihapus.'),
      onError: () => toast.error('Gagal menghapus node.'),
    });
  };

  // Sasaran RPJMD diisi -> prioritas; dikosongkan -> non-prioritas.
  const handleSasaranChange = (val: string) => {
    setData('SASARAN RPJMD', val);
    setNonPrioritas(val.trim() === '');
  };

  const toggleNonPrioritas = (on: boolean) => {
    setNonPrioritas(on);
    if (on) {
      setData((prev) => {
        const next = { ...prev } as FormData;
        PARENT_CHAIN_FIELDS.forEach((f) => (next[f] = ''));
        return next;
      });
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
    return collectMatches(visis, activeQuery);
  }, [visis, activeQuery]);

  const currentMatchKey = matches.length > 0 ? matches[currentMatchIndex] ?? null : null;

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
    const { matches: found, ancestors: foundAncestors } = collectMatches(visis, q);
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

  const openEdit = (program: ProgramItem) => {
    setEditing(program);
    const values = emptyForm();
    FIELDS.forEach((f) => (values[f] = program.raw[f] ?? ''));
    values[OPD_FIELD] = program.raw[OPD_FIELD] ?? '';
    setData(values);
    const sasaran = (program.raw['SASARAN RPJMD'] ?? '').trim();
    setNonPrioritas(sasaran === '' || sasaran === '-' || sasaran === 'Tidak Ada Data');
    setDialogOpen(true);
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (editing) {
      put(`/krs_pemda/${editing.id}`, {
        onSuccess: () => {
          toast.success('Data berhasil diperbarui.');
          setDialogOpen(false);
        },
        onError: () => toast.error('Gagal memperbarui data.'),
      });
    } else {
      post('/krs_pemda', {
        onSuccess: () => {
          toast.success('Data berhasil ditambahkan.');
          setDialogOpen(false);
        },
        onError: () => toast.error('Gagal menambahkan data.'),
      });
    }
  };

  const handleDelete = (id: number) => {
    router.delete(`/krs_pemda/${id}`, {
      onSuccess: () => toast.success('Data berhasil dihapus.'),
      onError: () => toast.error('Gagal menghapus data.'),
    });
  };

  return (
    <IsAdminContext.Provider value={isAdmin}>
    <AppLayout>
      <Head title="I_a_KRS_Pemda" />
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">I_a_KRS_Pemda</h1>
            <p className="text-sm text-muted-foreground">
              Rencana Pembangunan Jangka Menengah Daerah — Misi, Tujuan, Sasaran, dan Program Prioritas
            </p>
          </div>
          {isAdmin && (
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Data
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Cari tujuan, sasaran, program, OPD... (Enter untuk cari/lanjut)"
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
          {/* Kartu Visi (program prioritas) dulu. */}
          {visis.filter((v): v is VisiItem => !isNonPrioritas(v)).map((visi) => (
            <VisiCard
              key={visi.id}
              visi={visi}
              expanded={expanded}
              onToggle={handleToggle}
              onEdit={openEdit}
              onEditNode={openNodeEdit}
              onDeleteNode={handleDeleteNode}
              onDelete={handleDelete}
              query={activeQuery}
              currentMatchKey={currentMatchKey}
              activeAncestorKeys={activeAncestorKeys}
              registerRef={registerRef}
            />
          ))}

          {/* Semua program NON-PRIORITAS dibungkus SATU node induk yang bisa
              collapse (default tertutup) — mirip Visi menaungi Misi — supaya
              daftar ringkas. Ini murni pengelompokan tampilan tree view;
              visualisasi diagram tetap menampilkannya sejajar/menggantung. */}
          <NonPrioritasGroup
            programs={visis.filter(isNonPrioritas)}
            expanded={expanded}
            onToggle={handleToggle}
            onEdit={openEdit}
            onDelete={handleDelete}
            query={activeQuery}
            currentMatchKey={currentMatchKey}
            registerRef={registerRef}
          />
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Data' : 'Tambah Data'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Toggle Prioritas vs Non-Prioritas — auto-detect dari Sasaran
                RPJMD, bisa juga di-toggle manual. Saat ON, field rantai-atas
                (Visi→Sasaran RPJMD) disembunyikan. */}
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
                  pendukung / program level Kecamatan dari Tabel 4.1). Otomatis tercentang bila
                  Sasaran RPJMD dikosongkan.
                </p>
              </div>
            </div>

            {FIELDS.filter((field) => !(nonPrioritas && PARENT_CHAIN_SET.has(field))).map((field) => {
              // Field 'PROGRAM PRIORITAS' menampung KEDUA jenis program (kolom
              // DB sama). Labelnya diganti dinamis agar tidak menyesatkan:
              // "Program Prioritas" saat prioritas, "Program Non Prioritas"
              // saat mode non-prioritas dicentang.
              const label =
                field === 'PROGRAM PRIORITAS'
                  ? nonPrioritas
                    ? 'PROGRAM NON PRIORITAS'
                    : 'PROGRAM PRIORITAS'
                  : field;
              return (
                <div key={field} className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor={field}>{label}</Label>
                    {KRS_FIELD_INFO[field] && <FieldInfoPopover text={KRS_FIELD_INFO[field]} />}
                  </div>
                  <AutocompleteTextarea
                    id={field}
                    value={data[field]}
                    onChange={(val) => (field === 'SASARAN RPJMD' ? handleSasaranChange(val) : setData(field, val))}
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
                {KRS_FIELD_INFO[OPD_FIELD] && <FieldInfoPopover text={KRS_FIELD_INFO[OPD_FIELD]} />}
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

      {/* Dialog EDIT NODE non-leaf (Visi/Misi/Tujuan/Sasaran). Hanya field
          milik level itu; perubahan diterapkan ke SEMUA baris node sekaligus. */}
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
                    {KRS_FIELD_INFO[field] && <FieldInfoPopover text={KRS_FIELD_INFO[field]} />}
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
    </IsAdminContext.Provider>
  );
}
