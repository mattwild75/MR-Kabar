import { router } from '@inertiajs/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, CircleDashed, Circle } from 'lucide-react';

interface OpdOption {
  id: number;
  nama: string;
}

interface OpdStatusEntry {
  jumlah_responden: number;
  jumlah_simpulan: number;
  total_unsur: number;
  lengkap: boolean;
  sudah_mulai: boolean;
}

interface OpdTahunPickerProps {
  routeName: string;
  opdOptions: OpdOption[];
  opdId: number | null;
  tahun: number;
  /** Status pengisian per opd_id utk tahun terpilih — opsional (halaman
   *  lama yg belum mengirim prop ini tetap aman, cuma tanpa badge). */
  opdStatus?: Record<number, OpdStatusEntry>;
}

function statusBadge(status: OpdStatusEntry | undefined) {
  if (!status || !status.sudah_mulai) {
    return (
      <Badge variant="outline" className="gap-1 text-muted-foreground">
        <Circle className="h-3 w-3" />
        Belum isi
      </Badge>
    );
  }
  if (status.lengkap) {
    return (
      <Badge className="gap-1 bg-green-600 hover:bg-green-600">
        <CheckCircle2 className="h-3 w-3" />
        Lengkap ({status.jumlah_simpulan}/{status.total_unsur} unsur)
      </Badge>
    );
  }
  return (
    <Badge className="gap-1 bg-amber-500 hover:bg-amber-500">
      <CircleDashed className="h-3 w-3" />
      Proses ({status.jumlah_simpulan}/{status.total_unsur} unsur)
    </Badge>
  );
}

/**
 * Selector OPD + Tahun Penilaian yang dipakai di seluruh halaman CEE
 * (Form Input 1a/1b/1c & Form Cetak) — CEE dinilai PER-OPD sesuai Perdep
 * PPKD No.4/2019 bab 3.2.c. Mengganti pilihan langsung navigasi ulang
 * (GET) supaya data yang ditampilkan selalu sesuai OPD+tahun terpilih.
 *
 * opdStatus menandai tiap opsi OPD di dropdown dgn badge "Belum isi" /
 * "Proses" / "Lengkap" (X/8 unsur) — supaya Admin/Super Admin/CEE_Survey yg
 * lintas-OPD tidak perlu klik satu-satu tiap OPD utk tahu progres
 * pengisiannya. Juga ditampilkan ringkas di bawah selector saat OPD dipilih.
 */
export function OpdTahunPicker({ routeName, opdOptions, opdId, tahun, opdStatus }: OpdTahunPickerProps) {
  const navigate = (nextOpdId: number | null, nextTahun: number) => {
    router.get(
      routeName,
      { opd_id: nextOpdId ?? undefined, tahun: nextTahun },
      { preserveState: true, preserveScroll: true, replace: true },
    );
  };

  const selectedStatus = opdId ? opdStatus?.[opdId] : undefined;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-64 space-y-1">
          <Label>OPD / Urusan yang Dinilai</Label>
          <Select value={opdId ? String(opdId) : undefined} onValueChange={(v) => navigate(Number(v), tahun)}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih OPD..." />
            </SelectTrigger>
            <SelectContent>
              {opdOptions.map((opd) => {
                const s = opdStatus?.[opd.id];
                return (
                  <SelectItem key={opd.id} value={String(opd.id)}>
                    <span className="flex w-full items-center justify-between gap-2">
                      <span>{opd.nama}</span>
                      {s?.lengkap ? (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />
                      ) : s?.sudah_mulai ? (
                        <CircleDashed className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                      ) : null}
                    </span>
                  </SelectItem>
                );
              })}
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
        {opdId && <div className="pb-1.5">{statusBadge(selectedStatus)}</div>}
      </div>

      {opdStatus && Object.keys(opdStatus).length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            Lihat status pengisian seluruh OPD ({tahun})
          </summary>
          <div className="mt-2 flex flex-wrap gap-2 rounded-md border bg-muted/30 p-2">
            {opdOptions.map((opd) => (
              <button
                key={opd.id}
                type="button"
                onClick={() => navigate(opd.id, tahun)}
                className={`flex items-center gap-1.5 rounded border bg-background px-2 py-1 text-left hover:bg-muted ${opd.id === opdId ? 'ring-1 ring-primary' : ''}`}
              >
                {opdStatus[opd.id]?.lengkap ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />
                ) : opdStatus[opd.id]?.sudah_mulai ? (
                  <CircleDashed className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                ) : (
                  <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                )}
                <span>{opd.nama}</span>
              </button>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
