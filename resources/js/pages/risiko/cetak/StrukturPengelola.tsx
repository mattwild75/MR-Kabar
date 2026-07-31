import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import UnduhPdfButton from '@/components/ui/unduh-pdf-button';
import FieldInfoPopover from '@/components/ui/field-info-popover';
import BaganStrukturRisiko from '@/components/ui/bagan-struktur-risiko';
import { STRUKTUR_FIELD_INFO } from '@/lib/struktur-pengelola-field-info';
import { Plus, Edit, Trash2, Save, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface Baris {
  id: number;
  peran: string;
  peran_label: string;
  nama: string | null;
  jabatan: string | null;
  opd_id: number | null;
  opd_nama: string | null;
  urutan: number;
  tugas: string | null;
}

interface PageProps {
  tahun: number;
  tahunOptions: number[];
  rows: Baris[];
  peranOptions: Record<string, string>;
  opdOptions: { id: number; nama: string }[];
  canEdit: boolean;
  pemerintahKabkota: string;
}

/**
 * Struktur pengelolaan Risiko — halaman cetak sekaligus tempat menyuntingnya.
 *
 * Perdep PPKD 4/2019 Lampiran 2 memuat contoh Keputusan Kepala Daerah tentang
 * struktur ini. Yang tampil di layar sama persis dengan yang tercetak: tombol
 * penyuntingan berada di luar kertas dan disembunyikan saat dipotret untuk
 * PDF, memakai kelas `print:hidden` yang sama dengan Form Cetak lain.
 */
export default function StrukturPengelola({
  tahun,
  tahunOptions,
  rows,
  peranOptions,
  opdOptions,
  canEdit,
  pemerintahKabkota,
}: PageProps) {
  const kosong: Record<string, string | number> = {
    tahun,
    peran: 'upr_pemda',
    nama: '',
    jabatan: '',
    opd_id: '',
    tugas: '',
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Baris | null>(null);
  const [form, setForm] = useState<Record<string, string | number>>(kosong);
  const [processing, setProcessing] = useState(false);

  const bukaTambah = () => {
    setEditing(null);
    setForm(kosong);
    setDialogOpen(true);
  };

  const bukaEdit = (row: Baris) => {
    setEditing(row);
    setForm({
      tahun,
      peran: row.peran,
      nama: row.nama ?? '',
      jabatan: row.jabatan ?? '',
      opd_id: row.opd_id ?? '',
      urutan: row.urutan,
      tugas: row.tugas ?? '',
    });
    setDialogOpen(true);
  };

  const simpan = () => {
    setProcessing(true);
    // opd_id kosong dikirim sebagai null, bukan string kosong — aturan
    // 'exists' akan menolak string kosong sebagai id yang tidak ada.
    const muatan = { ...form, opd_id: form.opd_id === '' ? '' : form.opd_id };
    const selesai = {
      onSuccess: () => {
        toast.success('Susunan berhasil disimpan.');
        setDialogOpen(false);
      },
      onError: () => toast.error('Gagal menyimpan susunan.'),
      onFinish: () => setProcessing(false),
      preserveScroll: true,
    };

    if (editing) {
      router.put(`/cetak/struktur-pengelolaan-risiko/${editing.id}`, muatan, selesai);
    } else {
      router.post('/cetak/struktur-pengelolaan-risiko', muatan, selesai);
    }
  };

  const hapus = (row: Baris) => {
    router.delete(`/cetak/struktur-pengelolaan-risiko/${row.id}`, {
      onSuccess: () => toast.success('Susunan berhasil dihapus.'),
      onError: () => toast.error('Gagal menghapus.'),
      preserveScroll: true,
    });
  };

  const salin = () => {
    const sumber = tahunOptions.find((t) => t < tahun);
    if (!sumber) {
      toast.error('Tidak ada tahun sebelumnya yang punya susunan.');
      return;
    }
    router.post(
      '/cetak/struktur-pengelolaan-risiko/salin',
      { tahun_sumber: sumber, tahun_tujuan: tahun },
      {
        onSuccess: () => toast.success(`Susunan tahun ${sumber} disalin.`),
        onError: () => toast.error('Gagal menyalin.'),
        preserveScroll: true,
      },
    );
  };

  return (
    <AppLayout>
      <Head title="Struktur Pengelolaan Risiko" />

      <div className="space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div>
            <h1 className="text-2xl font-semibold">Struktur Pengelolaan Risiko</h1>
            <p className="text-muted-foreground text-sm">
              Susunan pengelola Risiko sesuai Perdep PPKD 4/2019 Lampiran 2. Tersimpan sebagai data, sehingga dapat
              dirujuk aplikasi — bukan hanya dicetak.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={String(tahun)}
              onValueChange={(v) => router.get('/cetak/struktur-pengelolaan-risiko', { tahun: v })}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                {tahunOptions.map((t) => (
                  <SelectItem key={t} value={String(t)}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {canEdit && rows.length === 0 && tahunOptions.some((t) => t < tahun) && (
              <Button variant="outline" onClick={salin}>
                <Copy className="mr-2 h-4 w-4" />
                Salin dari Tahun Sebelumnya
              </Button>
            )}
            {canEdit && (
              <Button onClick={bukaTambah}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah
              </Button>
            )}
            {rows.length > 0 && <UnduhPdfButton href={`/cetak/struktur-pengelolaan-risiko/pdf?tahun=${tahun}`} />}
          </div>
        </div>

        {/* Keterangan dasar Perdep — di luar kertas, tidak ikut tercetak.
            Ditaruh di halaman ini, bukan hanya di Panduan, karena di sinilah
            orang memutuskan siapa mengisi peran apa. */}
        <div className="bg-muted/40 rounded-md border p-3 text-sm print:hidden">
          <p className="font-medium">Dasar penyusunan menurut Perdep PPKD 4/2019</p>
          <p className="text-muted-foreground mt-1">
            Lampiran 2 memuat contoh Keputusan Kepala Daerah tentang struktur pengelolaan Risiko, dan Lampiran 3
            menyebut susunannya: <strong>Sekretaris Daerah</strong> sebagai koordinator penyelenggaraan;{' '}
            <strong>Kepala Daerah</strong> sebagai Unit Pemilik Risiko tingkat Pemerintah Daerah, dengan pejabat
            eselon sebagai Unit Pemilik Risiko di tingkatnya; <strong>Komite Pengelolaan Risiko</strong> tingkat
            Pemerintah Daerah; <strong>Asisten Sekretaris Daerah</strong> sebagai Unit Kepatuhan; dan{' '}
            <strong>Inspektur Daerah</strong> sebagai penanggung jawab pengawasan.
          </p>
          <p className="text-muted-foreground mt-1">
            Susunan ini bukan sekadar naskah cetak. Karena tersimpan sebagai data, aplikasi dapat merujuknya —
            blok tanda tangan Laporan 14 Pembinaan Komite mengambil pejabat berperan Komite dari tahun berjalan.
            Nama boleh dikosongkan bila jabatannya lowong; naskah tetap dapat dicetak dengan jabatannya saja.
          </p>
        </div>

        {rows.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            Belum ada susunan pengelola Risiko untuk tahun {tahun}.
            {canEdit ? ' Tambahkan lewat tombol di atas.' : ' Hubungi Admin untuk merekamnya.'}
          </p>
        ) : (
          <div className="mx-auto w-full max-w-4xl bg-white p-8 text-black shadow-sm print:shadow-none dark:bg-white">
            <div className="mb-6 text-center">
              <p className="text-sm font-semibold uppercase">{pemerintahKabkota}</p>
              <h2 className="mt-1 text-lg font-bold uppercase">Struktur Pengelolaan Risiko</h2>
              <p className="text-sm">Tahun {tahun}</p>
            </div>

            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-10 border border-black p-1 text-center">No.</th>
                  <th className="border border-black p-1 text-left">Peran</th>
                  <th className="border border-black p-1 text-left">Pejabat</th>
                  <th className="border border-black p-1 text-left">Tugas</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id}>
                    <td className="border border-black p-1 text-center align-top">{i + 1}</td>
                    <td className="border border-black p-1 align-top font-medium">
                      {r.peran_label}
                      {r.opd_nama && <span className="block font-normal">{r.opd_nama}</span>}
                    </td>
                    <td className="border border-black p-1 align-top">
                      {r.jabatan || '—'}
                      {r.nama && <span className="block">{r.nama}</span>}
                    </td>
                    <td className="border border-black p-1 align-top">
                      <div className="flex items-start justify-between gap-2">
                        <span className="whitespace-pre-line">{r.tugas || '—'}</span>
                        {canEdit && (
                          <span className="flex shrink-0 items-center gap-0.5 print:hidden">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => bukaEdit(r)}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <Trash2 className="text-destructive h-3.5 w-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus baris ini?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {r.peran_label}
                                    {r.nama ? ` — ${r.nama}` : ''} akan dihapus dari susunan tahun {tahun}.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive hover:bg-destructive/90"
                                    onClick={() => hapus(r)}
                                  >
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Bagan dibaca dari baris yang sama dengan tabel di atas, jadi
                menyunting tabel langsung mengubah bagannya — tidak ada dua
                tempat yang bisa berbeda isi. Berada di dalam kertas cetak
                supaya ikut terpotret saat diunduh sebagai PDF. */}
            <BaganStrukturRisiko rows={rows} />
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Susunan' : 'Tambah Susunan'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Label>Peran</Label>
                <FieldInfoPopover text={STRUKTUR_FIELD_INFO.peran} />
              </div>
              <Select value={String(form.peran)} onValueChange={(v) => setForm((f) => ({ ...f, peran: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(peranOptions).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                <Label>Jabatan</Label>
                <FieldInfoPopover text={STRUKTUR_FIELD_INFO.jabatan} />
              </div>
                <Input
                  value={String(form.jabatan ?? '')}
                  onChange={(e) => setForm((f) => ({ ...f, jabatan: e.target.value }))}
                  placeholder="mis. Sekretaris Daerah"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                <Label>Nama</Label>
                <FieldInfoPopover text={STRUKTUR_FIELD_INFO.nama} />
              </div>
                <Input
                  value={String(form.nama ?? '')}
                  onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
                  placeholder="Kosongkan bila jabatannya sedang lowong"
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Label>OPD</Label>
                <FieldInfoPopover text={STRUKTUR_FIELD_INFO.opd} />
              </div>
              <Select
                value={form.opd_id === '' ? 'tidak_ada' : String(form.opd_id)}
                onValueChange={(v) => setForm((f) => ({ ...f, opd_id: v === 'tidak_ada' ? '' : v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tidak_ada">Tingkat Pemerintah Daerah (bukan satu OPD tertentu)</SelectItem>
                  {opdOptions.map((o) => (
                    <SelectItem key={o.id} value={String(o.id)}>
                      {o.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Label>Tugas</Label>
                <FieldInfoPopover text={STRUKTUR_FIELD_INFO.tugas} />
              </div>
              <Textarea
                rows={3}
                value={String(form.tugas ?? '')}
                onChange={(e) => setForm((f) => ({ ...f, tugas: e.target.value }))}
                placeholder="mis. Mengoordinasikan penyelenggaraan pengelolaan Risiko di lingkungan pemerintah daerah."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={simpan} disabled={processing}>
              <Save className="mr-2 h-4 w-4" />
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
