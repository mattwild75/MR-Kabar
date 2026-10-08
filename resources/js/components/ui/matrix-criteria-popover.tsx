import { cn } from '@/lib/utils';
import { GripHorizontal, Info, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface KriteriaDampakRow {
  level: number;
  label: string | null;
  kerugian_negara: string | null;
  penurunan_reputasi: string | null;
  penurunan_kinerja: string | null;
  gangguan_pelayanan: string | null;
  tuntutan_hukum: string | null;
}

export interface KriteriaKemungkinanRow {
  level: number;
  nama: string;
  probabilitas: string | null;
  frekuensi: string | null;
  toleransi: string | null;
}

/*
 * Tabel Kriteria Dampak & Kriteria Kemungkinan — datanya SAMA PERSIS (bukan
 * hardcode ulang) dgn yg ditampilkan halaman /keterangan-pendukung; sumbernya
 * satu-satunya RiskReferenceDataService::referenceDialogPayload(), jadi
 * otomatis ikut berubah begitu Admin mengedit data di Settings > Keterangan
 * Pendukung.
 *
 * Dipakai di dua tempat: (1) PilihKriteriaRisiko — PIC memilih level langsung
 * dari tabel ini (prop pilihan/onPilih), dan (2) panel info melayang di dialog
 * Isi Nilai Risiko (tanpa onPilih, sekadar dibaca).
 */

const AREA_DAMPAK = [
  ['Jumlah Kerugian Negara / Daerah', 'kerugian_negara'],
  ['Penurunan Reputasi', 'penurunan_reputasi'],
  ['Penurunan Kinerja', 'penurunan_kinerja'],
  ['Gangguan Terhadap Pelayanan', 'gangguan_pelayanan'],
  ['Jumlah Tuntutan Hukum', 'tuntutan_hukum'],
] as const;

export function TabelKriteriaDampak({
  rows,
  pilihan,
  onPilih,
}: {
  rows: KriteriaDampakRow[];
  pilihan?: number | null;
  onPilih?: (level: number) => void;
}) {
  const bisaPilih = !!onPilih;
  const kolom = (level: number) =>
    cn(
      'border px-2 py-1.5 align-top',
      bisaPilih && 'cursor-pointer hover:bg-sky-50 dark:hover:bg-sky-950/40',
      pilihan === level && 'bg-sky-100 dark:bg-sky-900/50',
    );
  return (
    <table className="w-full min-w-[640px] border-collapse text-left text-xs">
      <thead className="bg-muted/50">
        <tr>
          <th className="border px-2 py-1.5 font-semibold">Area Dampak</th>
          {rows.map((row) => (
            <th key={row.level} className={cn(kolom(row.level), 'font-semibold whitespace-nowrap')}>
              {bisaPilih ? (
                <button
                  type="button"
                  onClick={() => onPilih(row.level)}
                  aria-pressed={pilihan === row.level}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 font-semibold focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none',
                    pilihan === row.level ? 'bg-sky-600 text-white' : 'hover:bg-sky-100 dark:hover:bg-sky-900',
                  )}
                >
                  {row.level} - {row.label}
                </button>
              ) : (
                <>
                  {row.level} - {row.label}
                </>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {AREA_DAMPAK.map(([area, field]) => (
          <tr key={area}>
            <td className="border px-2 py-1.5 align-top font-medium">{area}</td>
            {rows.map((row) => (
              <td key={row.level} className={kolom(row.level)} onClick={() => onPilih?.(row.level)}>
                {row[field]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function TabelKriteriaKemungkinan({
  rows,
  pilihan,
  onPilih,
}: {
  rows: KriteriaKemungkinanRow[];
  pilihan?: number | null;
  onPilih?: (level: number) => void;
}) {
  const bisaPilih = !!onPilih;
  return (
    <table className="w-full min-w-[520px] border-collapse text-left text-xs">
      <thead className="bg-muted/50">
        <tr>
          <th className="border px-2 py-1.5 font-semibold">No</th>
          <th className="border px-2 py-1.5 font-semibold whitespace-nowrap">Level Kemungkinan</th>
          <th className="border px-2 py-1.5 font-semibold">Probabilitas</th>
          <th className="border px-2 py-1.5 font-semibold">Frekuensi dalam 1 Tahun</th>
          <th className="border px-2 py-1.5 font-semibold">Kejadian Toleransi Rendah</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const terpilih = pilihan === row.level;
          return (
            <tr
              key={row.level}
              onClick={() => onPilih?.(row.level)}
              className={cn(
                bisaPilih && 'cursor-pointer hover:bg-sky-50 dark:hover:bg-sky-950/40',
                terpilih && 'bg-sky-100 dark:bg-sky-900/50',
              )}
            >
              <td className="border px-2 py-1.5 align-top">{row.level}</td>
              <td className="border px-2 py-1.5 align-top font-medium whitespace-nowrap">
                {bisaPilih ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPilih(row.level);
                    }}
                    aria-pressed={terpilih}
                    className={cn(
                      'rounded px-1.5 py-0.5 font-semibold focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none',
                      terpilih ? 'bg-sky-600 text-white' : 'hover:bg-sky-100 dark:hover:bg-sky-900',
                    )}
                  >
                    {row.nama}
                  </button>
                ) : (
                  row.nama
                )}
              </td>
              <td className="border px-2 py-1.5 align-top">{row.probabilitas}</td>
              <td className="border px-2 py-1.5 align-top">{row.frekuensi}</td>
              <td className="border px-2 py-1.5 align-top">{row.toleransi}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/**
 * Panel info yang MELAYANG: bisa digeser lewat judulnya dan ditutup dgn (x),
 * supaya tabel kriteria tetap terbaca di samping matriks selama skala diisi —
 * pengganti popover kecil yg dulu menempel di header matriks dan susah dibaca.
 *
 * Posisinya `fixed` thd layar. Pemanggilnya (dialog Isi Nilai Risiko) sengaja
 * tidak memakai transform utk memusatkan diri, sebab transform pada leluhur
 * mengubah `fixed` menjadi relatif thd leluhur itu dan panel ikut terpotong.
 */
export function PanelMelayang({
  judul,
  onTutup,
  urutan = 0,
  children,
}: {
  judul: string;
  onTutup: () => void;
  /** Panel kedua yg dibuka bersamaan diletakkan sedikit bergeser. */
  urutan?: number;
  children: React.ReactNode;
}) {
  const lebar = typeof window === 'undefined' ? 720 : Math.min(window.innerWidth * 0.92, 760);
  const [pos, setPos] = useState(() => ({
    x: typeof window === 'undefined' ? 16 : Math.max(8, window.innerWidth - lebar - 16 - urutan * 32),
    y: 16 + urutan * 48,
  }));
  const geser = useRef<{ dx: number; dy: number } | null>(null);

  return (
    <div
      role="dialog"
      aria-label={judul}
      className="fixed z-[70] flex max-h-[70vh] flex-col overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-2xl"
      style={{ left: pos.x, top: pos.y, width: lebar }}
    >
      <div
        className="flex cursor-move touch-none items-center gap-2 border-b bg-muted/60 px-3 py-2 select-none"
        onPointerDown={(e) => {
          geser.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!geser.current) return;
          const x = Math.min(Math.max(e.clientX - geser.current.dx, 8 - lebar + 120), window.innerWidth - 120);
          const y = Math.min(Math.max(e.clientY - geser.current.dy, 0), window.innerHeight - 44);
          setPos({ x, y });
        }}
        onPointerUp={(e) => {
          geser.current = null;
          e.currentTarget.releasePointerCapture(e.pointerId);
        }}
      >
        <GripHorizontal className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1 text-sm font-semibold">{judul}</span>
        <span className="hidden text-xs text-muted-foreground sm:inline">geser lewat judul ini</span>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onTutup}
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label={`Tutup ${judul}`}
          title="Tutup"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="overflow-auto p-2">{children}</div>
    </div>
  );
}

/** Tombol info kecil pembuka panel kriteria. */
export function TombolInfoKriteria({ label, aktif, onClick }: { label: string; aktif: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full hover:text-foreground',
        aktif ? 'text-sky-600' : 'text-muted-foreground',
      )}
      aria-label={label}
      aria-pressed={aktif}
      title={label}
    >
      <Info className="h-3.5 w-3.5" />
    </button>
  );
}

export function DampakCriteriaPopover({ rows }: { rows: KriteriaDampakRow[] }) {
  return (
    <MatrixCriteriaPopover label="Kriteria Dampak">
      <TabelKriteriaDampak rows={rows} />
    </MatrixCriteriaPopover>
  );
}

export function KemungkinanCriteriaPopover({ rows }: { rows: KriteriaKemungkinanRow[] }) {
  return (
    <MatrixCriteriaPopover label="Kriteria Kemungkinan">
      <TabelKriteriaKemungkinan rows={rows} />
    </MatrixCriteriaPopover>
  );
}

function MatrixCriteriaPopover({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <span ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
        aria-label={label}
        title={label}
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-full left-1/2 z-50 mt-1 max-h-80 w-max max-w-[min(90vw,40rem)] -translate-x-1/2 overflow-auto rounded-md border bg-popover p-2 text-popover-foreground shadow-md"
        >
          <p className="mb-1.5 px-1 text-xs font-semibold text-foreground">{label}</p>
          {children}
        </div>
      )}
    </span>
  );
}
