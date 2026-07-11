import { CheckCircle2, Circle } from 'lucide-react';

interface OpdOption {
  id: number;
  nama: string;
}

interface OpdFillStatusEntry {
  jumlah_baris: number;
  sudah_mulai: boolean;
}

interface OpdFillStatusPanelProps {
  opdOptions: OpdOption[];
  opdStatus: Record<number, OpdFillStatusEntry>;
  tahun?: number;
  /** Dipanggil dengan nama OPD saat diklik — dipakai pemanggil utk
   *  memfilter/menyorot baris tabel yang sesuai (lihat useRowSearch). */
  onSelect?: (opdNama: string) => void;
  /** Nama OPD yang sedang aktif dipilih — dipakai menandai tombol terpilih. */
  selectedOpdNama?: string;
}

/**
 * Panel collapsible "Lihat status pengisian seluruh OPD" — dipakai di
 * halaman yang datanya difilter per user_id (IRS Pemda, KRS PD, IRS PD,
 * KRO PD, IRO PD), khusus terlihat oleh Admin/Super Admin (yang melihat
 * data semua OPD). Meniru pola badge status pada OpdTahunPicker (CEE),
 * tapi tanpa navigasi opd_id/tahun karena halaman-halaman ini tidak punya
 * selector OPD+Tahun — hanya ringkasan progres. Tiap OPD bisa diklik utk
 * langsung menyorot baris tabel miliknya (via onSelect), reuse mekanisme
 * pencarian yang sudah ada supaya scroll-ke-match & highlight konsisten.
 */
export default function OpdFillStatusPanel({ opdOptions, opdStatus, tahun, onSelect, selectedOpdNama }: OpdFillStatusPanelProps) {
  if (!opdOptions.length) {
    return null;
  }

  return (
    <details className="text-xs" open={!!selectedOpdNama || undefined}>
      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
        Lihat status pengisian seluruh OPD{tahun ? ` (${tahun})` : ''}
      </summary>
      <div className="mt-2 flex flex-wrap gap-2 rounded-md border bg-muted/30 p-2">
        {opdOptions.map((opd) => {
          const status = opdStatus[opd.id];
          const sudahMulai = status?.sudah_mulai ?? false;
          const isSelected = selectedOpdNama === opd.nama;
          return (
            <button
              key={opd.id}
              type="button"
              disabled={!onSelect}
              onClick={() => onSelect?.(opd.nama)}
              className={`flex items-center gap-1.5 rounded border bg-background px-2 py-1 text-left ${onSelect ? 'hover:bg-muted' : ''} ${isSelected ? 'ring-1 ring-primary' : ''}`}
            >
              {sudahMulai ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />
              ) : (
                <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              )}
              <span>{opd.nama}</span>
              {sudahMulai && <span className="text-muted-foreground">({status!.jumlah_baris})</span>}
            </button>
          );
        })}
      </div>
    </details>
  );
}
