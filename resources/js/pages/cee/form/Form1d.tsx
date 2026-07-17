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
  /** Penjelasan simpulan 1c unsur ini (hanya terisi kalau simpulannya "Kurang Memadai") — dipakai auto-isi kondisi_kurang_memadai. */
  penjelasan_1c?: string | null;
}

interface UnsurKurangMemadai extends UnsurOption {
  unsur_id: number;
  kurang_memadai: boolean;
}

interface SubmittedBy {
  name: string;
  username: string;
}

interface Entry {
  id: number;
  kondisi_kurang_memadai: string;
  rencana_tindak_pengendalian: string | null;
  penanggung_jawab: string | null;
  triwulan_target: string | null;
  tahun_target_penyelesaian: number | null;
  triwulan_realisasi: string | null;
  tahun_realisasi_penyelesaian: number | null;
  unsur: UnsurOption;
  submitted_by: SubmittedBy | null;
}

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

interface PageProps {
  opdOptions: OpdOption[];
  opdStatus: Record<number, OpdStatusEntry>;
  opdId: number | null;
  tahun: number;
  unsurOptions: UnsurOption[];
  unsurKurangMemadai: UnsurKurangMemadai[];
  triwulanOptions: string[];
  triwulanLabels: Record<string, string>;
  entries: Entry[];
  canEditOrDelete1d: boolean;
}

/** Dropdown Triwulan + Input Tahun, dipakai utk Target & Realisasi Penyelesaian — sama pola dgn TRIWULAN di irs_pd/Index.tsx. */
function TriwulanTahunFields({
  label,
  triwulan,
  tahun,
  onTriwulanChange,
  onTahunChange,
  triwulanOptions,
  triwulanLabels,
}: {
  label: string;
  triwulan: string;
  tahun: string;
  onTriwulanChange: (v: string) => void;
  onTahunChange: (v: string) => void;
  triwulanOptions: string[];
  triwulanLabels: Record<string, string>;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label>{label} — Triwulan</Label>
        <Select value={triwulan || undefined} onValueChange={onTriwulanChange}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih Triwulan" />
          </SelectTrigger>
          <SelectContent>
            {triwulanOptions.map((k) => (
              <SelectItem key={k} value={k}>
                {triwulanLabels[k] ?? k}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>{label} — Tahun</Label>
        <Input type="number" value={tahun} onChange={(e) => onTahunChange(e.target.value)} placeholder="mis. 2026" />
      </div>
    </div>
  );
}

function EntryRow({
  entry,
  unsurOptions,
  triwulanOptions,
  triwulanLabels,
  onDelete,
  canEdit,
}: {
  entry: Entry;
  unsurOptions: UnsurOption[];
  triwulanOptions: string[];
  triwulanLabels: Record<string, string>;
  onDelete: (id: number) => void;
  canEdit: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [unsurId, setUnsurId] = useState(entry.unsur.id);
  const [kondisi, setKondisi] = useState(entry.kondisi_kurang_memadai);
  const [rtp, setRtp] = useState(entry.rencana_tindak_pengendalian ?? '');
  const [penanggungJawab, setPenanggungJawab] = useState(entry.penanggung_jawab ?? '');
  const [triwulanTarget, setTriwulanTarget] = useState(entry.triwulan_target ?? '');
  const [tahunTarget, setTahunTarget] = useState(entry.tahun_target_penyelesaian ? String(entry.tahun_target_penyelesaian) : '');
  const [triwulanRealisasi, setTriwulanRealisasi] = useState(entry.triwulan_realisasi ?? '');
  const [tahunRealisasi, setTahunRealisasi] = useState(
    entry.tahun_realisasi_penyelesaian ? String(entry.tahun_realisasi_penyelesaian) : '',
  );
  const [saving, setSaving] = useState(false);

  // unsurOptions sekarang HANYA berisi unsur "Kurang Memadai" saat ini —
  // tapi entri LAMA bisa saja terikat ke unsur yg simpulan 1c-nya belakangan
  // berubah jadi "Memadai" (atau dihapus). Supaya opsi itu tidak hilang dari
  // dropdown edit entri ybs (dan malah terlihat kosong/salah pilih), sisipkan
  // unsur milik entry ini kalau belum ada di daftar terfilter.
  const editUnsurOptions = unsurOptions.some((u) => u.id === entry.unsur.id)
    ? unsurOptions
    : [...unsurOptions, entry.unsur];

  const save = () => {
    setSaving(true);
    router.put(
      `/cee/1d/${entry.id}`,
      {
        cee_unsur_id: unsurId,
        kondisi_kurang_memadai: kondisi,
        rencana_tindak_pengendalian: rtp,
        penanggung_jawab: penanggungJawab,
        triwulan_target: triwulanTarget || null,
        tahun_target_penyelesaian: tahunTarget || null,
        triwulan_realisasi: triwulanRealisasi || null,
        tahun_realisasi_penyelesaian: tahunRealisasi || null,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('RTP berhasil diperbarui.');
          setEditing(false);
        },
        onError: () => toast.error('Gagal memperbarui RTP.'),
        onFinish: () => setSaving(false),
      },
    );
  };

  const formatTriwulanTahun = (triwulan: string | null, tahun: number | null) => {
    if (!triwulan && !tahun) return '-';
    return [triwulan ? `Triwulan ${triwulan}` : null, tahun].filter(Boolean).join(' ');
  };

  if (editing) {
    return (
      <div className="space-y-3 p-4">
        <Select value={String(unsurId)} onValueChange={(v) => setUnsurId(Number(v))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {editUnsurOptions.map((u) => (
              <SelectItem key={u.id} value={String(u.id)}>
                {u.kode}. {u.nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Textarea rows={2} value={kondisi} onChange={(e) => setKondisi(e.target.value)} placeholder="Kondisi Lingkungan Pengendalian yang Kurang Memadai" />
        <Textarea rows={2} value={rtp} onChange={(e) => setRtp(e.target.value)} placeholder="Rencana Tindak Pengendalian Lingkungan Pengendalian" />
        <Input value={penanggungJawab} onChange={(e) => setPenanggungJawab(e.target.value)} placeholder="Penanggung Jawab" />
        <TriwulanTahunFields
          label="Target Waktu Penyelesaian"
          triwulan={triwulanTarget}
          tahun={tahunTarget}
          onTriwulanChange={setTriwulanTarget}
          onTahunChange={setTahunTarget}
          triwulanOptions={triwulanOptions}
          triwulanLabels={triwulanLabels}
        />
        <TriwulanTahunFields
          label="Realisasi Penyelesaian"
          triwulan={triwulanRealisasi}
          tahun={tahunRealisasi}
          onTriwulanChange={setTriwulanRealisasi}
          onTahunChange={setTahunRealisasi}
          triwulanOptions={triwulanOptions}
          triwulanLabels={triwulanLabels}
        />
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
        <p className="text-sm font-medium">{entry.kondisi_kurang_memadai}</p>
        {entry.rencana_tindak_pengendalian && (
          <p className="text-sm text-muted-foreground">RTP: {entry.rencana_tindak_pengendalian}</p>
        )}
        <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
          {entry.penanggung_jawab && <span>Penanggung Jawab: {entry.penanggung_jawab}</span>}
          <span>Target: {formatTriwulanTahun(entry.triwulan_target, entry.tahun_target_penyelesaian)}</span>
          <span>Realisasi: {formatTriwulanTahun(entry.triwulan_realisasi, entry.tahun_realisasi_penyelesaian)}</span>
        </div>
        {entry.submitted_by && (
          <p className="text-xs text-muted-foreground">Diisi oleh {entry.submitted_by.name || entry.submitted_by.username}</p>
        )}
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
                <AlertDialogTitle>Hapus RTP ini?</AlertDialogTitle>
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

type Form1dData = {
  opd_id: number | null;
  tahun: number;
  cee_unsur_id: number | null;
  kondisi_kurang_memadai: string;
  rencana_tindak_pengendalian: string;
  penanggung_jawab: string;
  triwulan_target: string;
  tahun_target_penyelesaian: string;
  triwulan_realisasi: string;
  tahun_realisasi_penyelesaian: string;
  [key: string]: number | string | null;
};

export default function Form1d({
  opdOptions,
  opdStatus,
  opdId,
  tahun,
  unsurOptions,
  unsurKurangMemadai,
  triwulanOptions,
  triwulanLabels,
  entries,
  canEditOrDelete1d,
}: PageProps) {
  const { auth } = usePage<SharedData>().props;
  const canEdit = canEditOrDelete1d && !(auth.user?.roles?.some((r) => r.name === 'cee-survey') ?? false);

  const { data, setData, post, processing, errors, reset } = useForm<Form1dData>({
    opd_id: opdId,
    tahun,
    cee_unsur_id: null,
    kondisi_kurang_memadai: '',
    rencana_tindak_pengendalian: '',
    penanggung_jawab: '',
    triwulan_target: '',
    tahun_target_penyelesaian: '',
    triwulan_realisasi: '',
    tahun_realisasi_penyelesaian: '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opdId) {
      toast.error('Pilih OPD terlebih dahulu.');
      return;
    }
    post('/cee/1d', {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('RTP CEE berhasil ditambahkan.');
        reset(
          'cee_unsur_id',
          'kondisi_kurang_memadai',
          'rencana_tindak_pengendalian',
          'penanggung_jawab',
          'triwulan_target',
          'tahun_target_penyelesaian',
          'triwulan_realisasi',
          'tahun_realisasi_penyelesaian',
        );
      },
      onError: () => toast.error('Gagal menyimpan.'),
    });
  };

  const remove = (id: number) => {
    router.delete(`/cee/1d/${id}`, {
      preserveScroll: true,
      onSuccess: () => toast.success('RTP berhasil dihapus.'),
    });
  };

  return (
    <AppLayout>
      <Head title="1d RTP CEE" />
      <div className="space-y-4 p-4">
        <div>
          <h1 className="text-2xl font-semibold">1d — RTP CEE</h1>
          <p className="text-sm text-muted-foreground">
            Penilaian atas Kegiatan Pengendalian yang Ada dan Masih Dibutuhkan / RTP atas Kelemahan Lingkungan
            Pengendalian (RTP atas CEE) — sesuai Lampiran 5 Form 6 Perdep PPKD No.4/2019. Isi RTP untuk unsur
            Lingkungan Pengendalian yang simpulannya &quot;Kurang Memadai&quot; (lihat 1c).
          </p>
        </div>

        <OpdTahunPicker routeName="/cee/1d" opdOptions={opdOptions} opdStatus={opdStatus} opdId={opdId} tahun={tahun} />

        {!opdId ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Pilih OPD terlebih dahulu.
            </CardContent>
          </Card>
        ) : (
          <>
            {unsurKurangMemadai.some((u) => u.kurang_memadai) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Unsur dengan Simpulan &quot;Kurang Memadai&quot; (1c)</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {unsurKurangMemadai
                    .filter((u) => u.kurang_memadai)
                    .map((u) => (
                      <Badge key={u.unsur_id} variant="destructive">
                        {u.kode}. {u.nama}
                      </Badge>
                    ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tambah RTP</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={submit} className="space-y-4">
                  <div className="space-y-1">
                    <Label>Unsur Lingkungan Pengendalian</Label>
                    <Select
                      value={data.cee_unsur_id ? String(data.cee_unsur_id) : undefined}
                      onValueChange={(v) => {
                        const unsurId = Number(v);
                        setData('cee_unsur_id', unsurId);
                        // Auto-isi dari penjelasan simpulan 1c unsur ybs —
                        // uraian kelemahan sudah diputuskan Sekretaris di
                        // 1c, tidak perlu ditulis ulang manual di sini.
                        const unsur = unsurOptions.find((u) => u.id === unsurId);
                        setData('kondisi_kurang_memadai', unsur?.penjelasan_1c ?? '');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih unsur..." />
                      </SelectTrigger>
                      <SelectContent>
                        {unsurOptions.length === 0 && (
                          <p className="p-2 text-sm text-muted-foreground">
                            Belum ada unsur dengan simpulan &quot;Kurang Memadai&quot; di Form 1c.
                          </p>
                        )}
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
                    <Label htmlFor="kondisi_kurang_memadai">Kondisi Lingkungan Pengendalian yang Kurang Memadai</Label>
                    <Textarea
                      id="kondisi_kurang_memadai"
                      rows={2}
                      value={data.kondisi_kurang_memadai}
                      onChange={(e) => setData('kondisi_kurang_memadai', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Terisi otomatis dari Penjelasan Simpulan 1c — boleh disunting bila perlu.</p>
                    {errors.kondisi_kurang_memadai && <p className="text-sm text-destructive">{errors.kondisi_kurang_memadai}</p>}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="rencana_tindak_pengendalian">Rencana Tindak Pengendalian Lingkungan Pengendalian</Label>
                    <Textarea
                      id="rencana_tindak_pengendalian"
                      rows={2}
                      value={data.rencana_tindak_pengendalian}
                      onChange={(e) => setData('rencana_tindak_pengendalian', e.target.value)}
                    />
                    {errors.rencana_tindak_pengendalian && (
                      <p className="text-sm text-destructive">{errors.rencana_tindak_pengendalian}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="penanggung_jawab">Penanggung Jawab</Label>
                    <Input
                      id="penanggung_jawab"
                      value={data.penanggung_jawab}
                      onChange={(e) => setData('penanggung_jawab', e.target.value)}
                      placeholder="mis. Inspektorat, BKPSDM, Sekda"
                    />
                    {errors.penanggung_jawab && <p className="text-sm text-destructive">{errors.penanggung_jawab}</p>}
                  </div>

                  <TriwulanTahunFields
                    label="Target Waktu Penyelesaian"
                    triwulan={data.triwulan_target}
                    tahun={data.tahun_target_penyelesaian}
                    onTriwulanChange={(v) => setData('triwulan_target', v)}
                    onTahunChange={(v) => setData('tahun_target_penyelesaian', v)}
                    triwulanOptions={triwulanOptions}
                    triwulanLabels={triwulanLabels}
                  />
                  <TriwulanTahunFields
                    label="Realisasi Penyelesaian"
                    triwulan={data.triwulan_realisasi}
                    tahun={data.tahun_realisasi_penyelesaian}
                    onTriwulanChange={(v) => setData('triwulan_realisasi', v)}
                    onTahunChange={(v) => setData('tahun_realisasi_penyelesaian', v)}
                    triwulanOptions={triwulanOptions}
                    triwulanLabels={triwulanLabels}
                  />

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
                <CardTitle className="text-base">Daftar RTP Tahun {tahun}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {entries.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">Belum ada RTP.</p>
                ) : (
                  <div className="divide-y">
                    {entries.map((entry) => (
                      <EntryRow
                        key={entry.id}
                        entry={entry}
                        unsurOptions={unsurOptions}
                        triwulanOptions={triwulanOptions}
                        triwulanLabels={triwulanLabels}
                        onDelete={remove}
                        canEdit={canEdit}
                      />
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
