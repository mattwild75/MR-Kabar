import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { SharedData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OpdTahunPicker } from '@/components/cee/opd-tahun-picker';
import FieldInfoPopover from '@/components/ui/field-info-popover';
import { CEE_FORM1B_FIELD_INFO } from '@/lib/cee-form1b-field-info';
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
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface UnsurOption {
  id: number;
  kode: string;
  nama: string;
}

interface SubmittedBy {
  name: string;
  username: string;
}

interface Entry {
  id: number;
  sumber_data: string;
  uraian_kelemahan: string;
  pengisi_nama: string;
  pengisi_jabatan: string;
  unsur: UnsurOption;
  submitted_by: SubmittedBy | null;
}

interface OpdOption {
  id: number;
  nama: string;
}

interface PageProps {
  opdOptions: OpdOption[];
  opdId: number | null;
  tahun: number;
  unsurOptions: UnsurOption[];
  entries: Entry[];
}

function EntryRow({
  entry,
  unsurOptions,
  onDelete,
  canEdit,
}: {
  entry: Entry;
  unsurOptions: UnsurOption[];
  onDelete: (id: number) => void;
  canEdit: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [unsurId, setUnsurId] = useState(entry.unsur.id);
  const [sumberData, setSumberData] = useState(entry.sumber_data);
  const [uraian, setUraian] = useState(entry.uraian_kelemahan);
  const [saving, setSaving] = useState(false);

  const save = () => {
    setSaving(true);
    router.put(
      `/cee/1b/${entry.id}`,
      { cee_unsur_id: unsurId, sumber_data: sumberData, uraian_kelemahan: uraian },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Entri berhasil diperbarui.');
          setEditing(false);
        },
        onError: () => toast.error('Gagal memperbarui entri.'),
        onFinish: () => setSaving(false),
      },
    );
  };

  if (editing) {
    return (
      <div className="space-y-2 p-4">
        <Select value={String(unsurId)} onValueChange={(v) => setUnsurId(Number(v))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {unsurOptions.map((u) => (
              <SelectItem key={u.id} value={String(u.id)}>
                {u.kode}. {u.nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input value={sumberData} onChange={(e) => setSumberData(e.target.value)} placeholder="Sumber Data" />
        <Textarea rows={2} value={uraian} onChange={(e) => setUraian(e.target.value)} placeholder="Uraian Kelemahan" />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>
            Batal
          </Button>
          <Button type="button" size="sm" onClick={save} disabled={saving}>
            Simpan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 p-4">
      <div className="min-w-0 flex-1 space-y-1">
        <Badge variant="outline">{entry.unsur.kode}. {entry.unsur.nama}</Badge>
        <p className="text-sm font-medium">{entry.sumber_data}</p>
        <p className="text-sm text-muted-foreground">{entry.uraian_kelemahan}</p>
        <p className="text-xs text-muted-foreground">
          Diisi oleh {entry.pengisi_nama} — {entry.pengisi_jabatan}
          {entry.submitted_by && ` (akun: ${entry.submitted_by.name || entry.submitted_by.username})`}
        </p>
      </div>
      {canEdit && (
        <div className="flex shrink-0 gap-1">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus entri ini?</AlertDialogTitle>
                <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(entry.id)} className="bg-destructive hover:bg-destructive/90">
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}

type Form1bData = {
  opd_id: number | null;
  tahun: number;
  cee_unsur_id: number | null;
  sumber_data: string;
  uraian_kelemahan: string;
  pengisi_nama: string;
  pengisi_jabatan: string;
  [key: string]: number | string | null;
};

export default function Form1b({ opdOptions, opdId, tahun, unsurOptions, entries }: PageProps) {
  const { auth } = usePage<SharedData>().props;
  const canEdit = !(auth.user?.roles?.some((r) => r.name === 'cee-survey') ?? false);

  const { data, setData, post, processing, errors, reset } = useForm<Form1bData>({
    opd_id: opdId,
    tahun,
    cee_unsur_id: null,
    sumber_data: '',
    uraian_kelemahan: '',
    pengisi_nama: '',
    pengisi_jabatan: '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opdId) {
      toast.error('Pilih OPD terlebih dahulu.');
      return;
    }
    post('/cee/1b', {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Kelemahan berhasil ditambahkan.');
        reset('cee_unsur_id', 'sumber_data', 'uraian_kelemahan');
      },
      onError: () => toast.error('Gagal menyimpan.'),
    });
  };

  const remove = (id: number) => {
    router.delete(`/cee/1b/${id}`, {
      preserveScroll: true,
      onSuccess: () => toast.success('Entri berhasil dihapus.'),
    });
  };

  return (
    <AppLayout>
      <Head title="1b CEE Berdasarkan Dokumen" />
      <div className="space-y-4 p-4">
        <div>
          <h1 className="text-2xl font-semibold">1b — CEE Berdasarkan Dokumen</h1>
          <p className="text-sm text-muted-foreground">
            Kondisi Kerentanan Lingkungan Pengendalian Intern — diisi berdasarkan reviu dokumen (LHP BPK, SK
            Inspektur, media massa, dll). Sesuai Lampiran 5 Form 1b Perdep PPKD No.4/2019.
          </p>
        </div>

        <OpdTahunPicker routeName="/cee/1b" opdOptions={opdOptions} opdId={opdId} tahun={tahun} />

        {!opdId ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Pilih OPD terlebih dahulu.
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tambah Kelemahan</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={submit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="pengisi_nama">Nama Pengisi</Label>
                        <FieldInfoPopover text={CEE_FORM1B_FIELD_INFO.PENGISI_NAMA} />
                      </div>
                      <Input id="pengisi_nama" value={data.pengisi_nama} onChange={(e) => setData('pengisi_nama', e.target.value)} />
                      {errors.pengisi_nama && <p className="text-sm text-destructive">{errors.pengisi_nama}</p>}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="pengisi_jabatan">Jabatan Pengisi</Label>
                        <FieldInfoPopover text={CEE_FORM1B_FIELD_INFO.PENGISI_JABATAN} />
                      </div>
                      <Input
                        id="pengisi_jabatan"
                        value={data.pengisi_jabatan}
                        onChange={(e) => setData('pengisi_jabatan', e.target.value)}
                        placeholder="mis. Kasubag Perencanaan"
                      />
                      {errors.pengisi_jabatan && <p className="text-sm text-destructive">{errors.pengisi_jabatan}</p>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Label>Sub Unsur Lingkungan Pengendalian</Label>
                      <FieldInfoPopover text={CEE_FORM1B_FIELD_INFO.SUB_UNSUR} />
                    </div>
                    <Select
                      value={data.cee_unsur_id ? String(data.cee_unsur_id) : undefined}
                      onValueChange={(v) => setData('cee_unsur_id', Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih sub unsur..." />
                      </SelectTrigger>
                      <SelectContent>
                        {unsurOptions.map((u) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            {u.kode}. {u.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.cee_unsur_id && <p className="text-sm text-destructive">{errors.cee_unsur_id}</p>}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="sumber_data">Sumber Data</Label>
                      <FieldInfoPopover text={CEE_FORM1B_FIELD_INFO.SUMBER_DATA} />
                    </div>
                    <Input
                      id="sumber_data"
                      value={data.sumber_data}
                      onChange={(e) => setData('sumber_data', e.target.value)}
                      placeholder="mis. LHP BPK No. ... tanggal ..., SK Inspektur No. ..., Media massa ..."
                    />
                    {errors.sumber_data && <p className="text-sm text-destructive">{errors.sumber_data}</p>}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="uraian_kelemahan">Uraian Kelemahan</Label>
                      <FieldInfoPopover text={CEE_FORM1B_FIELD_INFO.URAIAN_KELEMAHAN} />
                    </div>
                    <Textarea
                      id="uraian_kelemahan"
                      rows={3}
                      value={data.uraian_kelemahan}
                      onChange={(e) => setData('uraian_kelemahan', e.target.value)}
                    />
                    {errors.uraian_kelemahan && <p className="text-sm text-destructive">{errors.uraian_kelemahan}</p>}
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={processing}>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Daftar Kelemahan Tahun {tahun}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {entries.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">Belum ada entri.</p>
                ) : (
                  <div className="divide-y">
                    {entries.map((entry) => (
                      <EntryRow key={entry.id} entry={entry} unsurOptions={unsurOptions} onDelete={remove} canEdit={canEdit} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}
