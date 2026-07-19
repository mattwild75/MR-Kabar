import { router } from '@inertiajs/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OpdOption {
  id: number;
  nama: string;
}

const TRIWULAN_OPTIONS = ['I', 'II', 'III', 'IV'];

interface OpdTahunTriwulanPickerProps {
  routeName: string;
  /** Kalau opdOptions tidak dikirim (undefined), selector OPD disembunyikan — dipakai Laporan Pemantauan Unit Kepatuhan yg SELALU level Pemda. */
  opdOptions?: OpdOption[];
  opdId?: number | null;
  tahun: number;
  triwulan: string;
}

/**
 * Varian OpdTahunPicker (resources/js/components/cee/opd-tahun-picker.tsx)
 * + selector Triwulan I/II/III/IV — dibuat TERPISAH (bukan menambah prop ke
 * OpdTahunPicker) supaya halaman lain yg sudah memakainya (Form 6/7/8/9/10,
 * CEE 1a/1b/1c) tidak terpengaruh, karena form2 itu memang tidak berkonsep
 * triwulan. Dipakai khusus Form Cetak Laporan 12 & 13 (Bab IV Perdep PPKD
 * No.4/2019, laporan berkala WAJIB per-triwulan).
 */
export function OpdTahunTriwulanPicker({ routeName, opdOptions, opdId, tahun, triwulan }: OpdTahunTriwulanPickerProps) {
  const navigate = (nextOpdId: number | null | undefined, nextTahun: number, nextTriwulan: string) => {
    router.get(
      routeName,
      { opd_id: nextOpdId ?? undefined, tahun: nextTahun, triwulan: nextTriwulan },
      { preserveState: true, preserveScroll: true, replace: true },
    );
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      {opdOptions && (
        <div className="min-w-64 space-y-1">
          <Label>OPD</Label>
          <Select value={opdId ? String(opdId) : undefined} onValueChange={(v) => navigate(Number(v), tahun, triwulan)}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih OPD..." />
            </SelectTrigger>
            <SelectContent>
              {opdOptions.map((opd) => (
                <SelectItem key={opd.id} value={String(opd.id)}>
                  {opd.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="w-32 space-y-1">
        <Label>Tahun Penilaian</Label>
        <Input type="number" value={tahun} onChange={(e) => navigate(opdId, Number(e.target.value) || tahun, triwulan)} />
      </div>
      <div className="w-32 space-y-1">
        <Label>Triwulan</Label>
        <Select value={triwulan} onValueChange={(v) => navigate(opdId, tahun, v)}>
          <SelectTrigger>
            <SelectValue placeholder="Triwulan" />
          </SelectTrigger>
          <SelectContent>
            {TRIWULAN_OPTIONS.map((t) => (
              <SelectItem key={t} value={t}>
                Triwulan {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
