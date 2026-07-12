import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Kontrol "Tahun Aktif" — satu-satunya cara mengubah PengaturanPemda.tahun_penilaian,
 * dipasang di halaman Data Umum, IRS_Pemda, IRS_PD, dan IRO_PD. Nilai ini
 * Pemda-wide (berlaku utk SEMUA OPD sekaligus) sbg NILAI DEFAULT/SARAN —
 * bukan gate/pemaksa. Mengubahnya memengaruhi: Tahun Penilaian di Data Umum
 * (read-only, selalu ikut nilai ini), default awal field "TAHUN DINILAI
 * RISIKO" saat PIC klik Tambah Data (tapi PIC tetap BEBAS ganti ke tahun
 * lain, mis. melengkapi data 2025 sementara Tahun Aktif sudah 2026 — lihat
 * IrsPdController::validated()), dan default tahun Form Cetak. Karena
 * berlaku Pemda-wide, HANYA Admin/Super Admin yang boleh mengedit
 * (`editable` prop, dari `isAdmin` di controller) — PIC OPD biasa hanya
 * melihat versi read-only (tanpa ikon pensil/tidak bisa diklik). Backend
 * (TahunAktifController) turut menolak non-admin, bukan cuma UI hiding.
 */
export default function TahunAktifBadge({ tahunAktif, editable = false }: { tahunAktif: string | number; editable?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(tahunAktif));
  const [processing, setProcessing] = useState(false);

  const save = () => {
    if (!/^\d{4}$/.test(value)) {
      toast.error('Tahun harus 4 digit angka.');
      return;
    }
    setProcessing(true);
    router.post(
      '/tahun-aktif',
      { tahun_penilaian: value },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`Tahun aktif diperbarui menjadi ${value}.`);
          setEditing(false);
        },
        onError: () => toast.error('Gagal memperbarui tahun aktif.'),
        onFinish: () => setProcessing(false),
      },
    );
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/\D/g, '').slice(0, 4))}
          className="h-8 w-20"
          autoFocus
        />
        <Button size="icon" variant="ghost" className="h-8 w-8" disabled={processing} onClick={save}>
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          disabled={processing}
          onClick={() => {
            setValue(String(tahunAktif));
            setEditing(false);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (!editable) {
    return (
      <Badge
        variant="outline"
        className="flex items-center gap-1.5 py-1 pr-2.5 pl-2.5 text-sm"
        title="Tahun Penilaian aktif Pemda — berlaku untuk seluruh OPD. Hanya Admin/Super Admin yang dapat mengubahnya."
      >
        <CalendarClock className="h-3.5 w-3.5" />
        Tahun Aktif: {tahunAktif}
      </Badge>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="group inline-flex items-center"
      title="Ubah Tahun Penilaian aktif Pemda — berlaku untuk seluruh OPD"
    >
      <Badge variant="outline" className="flex items-center gap-1.5 py-1 pr-1.5 pl-2.5 text-sm">
        <CalendarClock className="h-3.5 w-3.5" />
        Tahun Aktif: {tahunAktif}
        <Pencil className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
      </Badge>
    </button>
  );
}
