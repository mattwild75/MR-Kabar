import { Info } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface KriteriaDampakRow {
  level: number;
  label: string | null;
  kerugian_negara: string | null;
  penurunan_reputasi: string | null;
  penurunan_kinerja: string | null;
  gangguan_pelayanan: string | null;
  tuntutan_hukum: string | null;
}

interface KriteriaKemungkinanRow {
  level: number;
  nama: string;
  probabilitas: string | null;
  frekuensi: string | null;
  toleransi: string | null;
}

/**
 * Popover kecil berisi tabel Kriteria Dampak ATAU Kriteria Kemungkinan —
 * dipasang di header kolom "Dampak"/baris "Kemungkinan" pada
 * RiskMatrixPickerDialog, supaya pengisi tidak perlu menutup dialog matriks
 * dulu untuk mengecek definisi tiap level 1-5. Datanya SAMA PERSIS (bukan
 * hardcode ulang) dgn yg ditampilkan halaman /keterangan-pendukung dan
 * dialog referensi "Kriteria Dampak"/"Kriteria Kemungkinan" di IRS/IRO —
 * sumbernya satu-satunya RiskReferenceDataService::referenceDialogPayload(),
 * jadi otomatis ikut berubah begitu Admin mengedit data di Settings >
 * Keterangan Pendukung, tanpa perlu update teks manapun di frontend.
 */
export function DampakCriteriaPopover({ rows }: { rows: KriteriaDampakRow[] }) {
  return (
    <MatrixCriteriaPopover label="Kriteria Dampak">
      <table className="w-full min-w-[640px] border-collapse text-left text-xs">
        <thead className="bg-muted/50">
          <tr>
            <th className="border px-2 py-1.5 font-semibold">Area Dampak</th>
            {rows.map((row) => (
              <th key={row.level} className="border px-2 py-1.5 font-semibold whitespace-nowrap">
                {row.level} - {row.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(
            [
              ['Jumlah Kerugian Negara / Daerah', 'kerugian_negara'],
              ['Penurunan Reputasi', 'penurunan_reputasi'],
              ['Penurunan Kinerja', 'penurunan_kinerja'],
              ['Gangguan Terhadap Pelayanan', 'gangguan_pelayanan'],
              ['Jumlah Tuntutan Hukum', 'tuntutan_hukum'],
            ] as const
          ).map(([area, field]) => (
            <tr key={area}>
              <td className="border px-2 py-1.5 align-top font-medium">{area}</td>
              {rows.map((row) => (
                <td key={row.level} className="border px-2 py-1.5 align-top">
                  {row[field]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </MatrixCriteriaPopover>
  );
}

export function KemungkinanCriteriaPopover({ rows }: { rows: KriteriaKemungkinanRow[] }) {
  return (
    <MatrixCriteriaPopover label="Kriteria Kemungkinan">
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
          {rows.map((row) => (
            <tr key={row.level}>
              <td className="border px-2 py-1.5 align-top">{row.level}</td>
              <td className="border px-2 py-1.5 align-top font-medium whitespace-nowrap">{row.nama}</td>
              <td className="border px-2 py-1.5 align-top">{row.probabilitas}</td>
              <td className="border px-2 py-1.5 align-top">{row.frekuensi}</td>
              <td className="border px-2 py-1.5 align-top">{row.toleransi}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
