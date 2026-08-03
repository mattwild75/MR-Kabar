import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil } from 'lucide-react';
import { useState } from 'react';

interface TtdEditorProps {
  dataUmumId: number;
  tempatPembuatan: string;
  tanggalPembuatan: string;
  jabatan: string;
  jabatanField: 'jabatan_kepala_daerah' | 'jabatan_kepala_dinas';
  nama: string;
  namaField: 'nama_kepala_daerah' | 'nama_kepala_dinas';
  /** NIP hanya ada utk Kepala Dinas (2b/2c) — Kepala Daerah/Bupati (2a) tidak punya kolom NIP. */
  nip?: string;
}

// Edit manual isian tempat/tanggal/jabatan/nama (+NIP utk Kepala Dinas)
// langsung dari halaman Form Cetak, disimpan PERMANEN ke Data Umum terkait
// (bukan cuma override sekali pakai) — dipakai bersama oleh Cetak2a/2b/2c
// print:hidden krn hanya relevan di layar, tidak ikut tercetak ke PDF (PDF
// dirender terpisah lewat Blade dari data DB yg sudah tersimpan).
// Bentuk form EKSPLISIT mencakup KEDUA kemungkinan nama field, SEMUA
// required string (default '' bila tidak dipakai baris ini) — bukan
// optional (?:), krn useForm<T>() Inertia mewajibkan T extends
// Record<string, FormDataConvertible> dan optional property (`string |
// undefined`) tidak memenuhi constraint itu (dicoba, malah memunculkan
// error TS2344 baru). Sebelumnya useForm() menerima object literal dgn
// computed property key ([jabatanField]: jabatan), yg membuat TypeScript
// meng-infer bentuk SEMPIT (cuma field yg statis terlihat), sehingga akses
// data[jabatanField] perlu `as string` paksa yg membungkam pengecekan
// compiler (ditemukan lewat audit dead-code/bug 2026-07-26: bukan bug
// runtime, tapi lubang di jaring pengaman kalau field ini direfactor/typo
// di masa depan).
type TtdFormData = {
  tempat_pembuatan: string;
  tanggal_pembuatan: string;
  jabatan_kepala_daerah: string;
  jabatan_kepala_dinas: string;
  nama_kepala_daerah: string;
  nama_kepala_dinas: string;
  nip_kepala_dinas: string;
};

export function TtdEditor({ dataUmumId, tempatPembuatan, tanggalPembuatan, jabatan, jabatanField, nama, namaField, nip }: TtdEditorProps) {
  const [editing, setEditing] = useState(false);

  const { data, setData, patch, processing } = useForm<TtdFormData>({
    tempat_pembuatan: tempatPembuatan,
    tanggal_pembuatan: tanggalPembuatan,
    jabatan_kepala_daerah: '',
    jabatan_kepala_dinas: '',
    nama_kepala_daerah: '',
    nama_kepala_dinas: '',
    nip_kepala_dinas: '',
    [jabatanField]: jabatan,
    [namaField]: nama,
    ...(nip !== undefined ? { nip_kepala_dinas: nip } : {}),
  });

  // Kertas cetak pembungkus (lihat Cetak2a/2b/2c) sengaja dipaksa bg-white
  // text-black krn area itu representasi visual PDF — tapi TtdEditor murni
  // kontrol layar (print:hidden, tidak pernah ikut tercetak), jadi HARUS
  // dibungkus di sini dgn warna tema aplikasi sendiri (bg-background
  // text-foreground) supaya tidak mewarisi text-black dari parent. Tanpa
  // ini, Input bawaan (bg-background — gelap di dark mode) dipaksa
  // berteks hitam oleh parent sehingga sama sekali tidak terbaca.
  if (!editing) {
    return (
      <div className="print:hidden bg-background text-foreground">
        <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
          <Pencil className="mr-2 size-3.5" />
          Edit Penanda Tangan
        </Button>
      </div>
    );
  }

  return (
    <div className="print:hidden mt-2 space-y-3 rounded-md border bg-background p-4 text-foreground">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>Tempat</Label>
          <Input value={data.tempat_pembuatan} onChange={(e) => setData('tempat_pembuatan', e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Tanggal</Label>
          <Input type="date" value={data.tanggal_pembuatan} onChange={(e) => setData('tanggal_pembuatan', e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Jabatan</Label>
          <Input value={data[jabatanField]} onChange={(e) => setData(jabatanField, e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Nama</Label>
          <Input value={data[namaField]} onChange={(e) => setData(namaField, e.target.value)} />
        </div>
        {nip !== undefined && (
          <div className="space-y-1">
            <Label>NIP</Label>
            <Input value={data.nip_kepala_dinas} onChange={(e) => setData('nip_kepala_dinas', e.target.value)} />
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          disabled={processing}
          onClick={() =>
            patch(`/cetak/risiko/ttd/${dataUmumId}`, {
              preserveScroll: true,
              onSuccess: () => setEditing(false),
            })
          }
        >
          Simpan
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)}>
          Batal
        </Button>
      </div>
    </div>
  );
}
