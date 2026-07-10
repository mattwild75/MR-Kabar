import { router } from '@inertiajs/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OpdOption {
  id: number;
  nama: string;
}

interface OpdTahunPickerProps {
  routeName: string;
  opdOptions: OpdOption[];
  opdId: number | null;
  tahun: number;
}

/**
 * Selector OPD + Tahun Penilaian yang dipakai di seluruh halaman CEE
 * (Form Input 1a/1b/1c & Form Cetak) — CEE dinilai PER-OPD sesuai Perdep
 * PPKD No.4/2019 bab 3.2.c. Mengganti pilihan langsung navigasi ulang
 * (GET) supaya data yang ditampilkan selalu sesuai OPD+tahun terpilih.
 */
export function OpdTahunPicker({ routeName, opdOptions, opdId, tahun }: OpdTahunPickerProps) {
  const navigate = (nextOpdId: number | null, nextTahun: number) => {
    router.get(
      routeName,
      { opd_id: nextOpdId ?? undefined, tahun: nextTahun },
      { preserveState: true, preserveScroll: true, replace: true },
    );
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-64 space-y-1">
        <Label>OPD / Urusan yang Dinilai</Label>
        <Select value={opdId ? String(opdId) : undefined} onValueChange={(v) => navigate(Number(v), tahun)}>
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
      <div className="w-32 space-y-1">
        <Label>Tahun Penilaian</Label>
        <Input
          type="number"
          value={tahun}
          onChange={(e) => navigate(opdId, Number(e.target.value) || tahun)}
        />
      </div>
    </div>
  );
}
