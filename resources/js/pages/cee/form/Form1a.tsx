import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { OpdTahunPicker } from '@/components/cee/opd-tahun-picker';
import FieldInfoPopover from '@/components/ui/field-info-popover';
import { CEE_FORM1A_FIELD_INFO } from '@/lib/cee-form1a-field-info';
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
import { Save, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Pertanyaan {
  id: number;
  pertanyaan: string;
  urutan: number;
}

interface Unsur {
  id: number;
  kode: string;
  nama: string;
  urutan: number;
  pertanyaan: Pertanyaan[];
}

interface RekapResponden {
  nama: string;
  jabatan: string;
  nilai: number;
}

interface RekapPertanyaan {
  responden: RekapResponden[];
  modus: number | null;
  simpulan: 'Memadai' | 'Kurang Memadai' | null;
}

interface OpdOption {
  id: number;
  nama: string;
}

interface RespondenListItem {
  nama: string;
  jabatan: string;
  jumlah_jawaban: number;
  diisi_oleh: string | null;
  terakhir_diisi: string | null;
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
  unsurs: Unsur[];
  rekap: { per_pertanyaan: Record<number, RekapPertanyaan> } | null;
  respondenList: RespondenListItem[];
  canEditOrDelete1a: boolean;
}

const SKALA = [
  { value: 1, label: '1 — Tidak Setuju / Belum ada / belum dibangun' },
  { value: 2, label: '2 — Kurang Setuju / belum konsisten' },
  { value: 3, label: '3 — Setuju / sudah baik, masih bisa ditingkatkan' },
  { value: 4, label: '4 — Sangat Setuju / sudah baik & dapat ditularkan' },
];

type Form1aData = {
  opd_id: number | null;
  tahun: number;
  responden_nama: string;
  responden_jabatan: string;
  jawaban: Record<number, number>;
  [key: string]: number | string | null | Record<number, number>;
};

export default function Form1a({ opdOptions, opdStatus, opdId, tahun, unsurs, rekap, respondenList, canEditOrDelete1a }: PageProps) {
  const { data, setData, post, processing, errors, reset } = useForm<Form1aData>({
    opd_id: opdId,
    tahun,
    responden_nama: '',
    responden_jabatan: '',
    jawaban: {},
  });
  const [loadingResponden, setLoadingResponden] = useState<string | null>(null);
  const [deletingResponden, setDeletingResponden] = useState<string | null>(null);

  const totalPertanyaan = unsurs.reduce((n, u) => n + u.pertanyaan.length, 0);
  const totalTerjawab = Object.keys(data.jawaban).length;

  const setJawaban = (pertanyaanId: number, nilai: number) => {
    setData('jawaban', { ...data.jawaban, [pertanyaanId]: nilai });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opdId) {
      toast.error('Pilih OPD terlebih dahulu.');
      return;
    }
    if (totalTerjawab < totalPertanyaan) {
      toast.error(`Masih ada ${totalPertanyaan - totalTerjawab} pertanyaan belum dijawab.`);
      return;
    }
    post('/cee/1a', {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Kuesioner CEE berhasil disimpan.');
        reset('responden_nama', 'responden_jabatan', 'jawaban');
      },
      onError: () => toast.error('Gagal menyimpan kuesioner.'),
    });
  };

  const editResponden = async (namaResponden: string) => {
    if (!opdId) return;
    setLoadingResponden(namaResponden);
    try {
      const params = new URLSearchParams({ opd_id: String(opdId), tahun: String(tahun), responden_nama: namaResponden });
      const res = await fetch(`/cee/1a/responden?${params.toString()}`, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('Gagal memuat jawaban responden.');
      const json = await res.json();
      setData({
        opd_id: opdId,
        tahun,
        responden_nama: json.responden_nama,
        responden_jabatan: json.responden_jabatan,
        jawaban: Object.fromEntries(Object.entries(json.jawaban).map(([k, v]) => [Number(k), Number(v)])),
      });
      toast.success(`Jawaban ${json.responden_nama} dimuat — silakan edit lalu Simpan.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      toast.error('Gagal memuat jawaban responden.');
    } finally {
      setLoadingResponden(null);
    }
  };

  const deleteResponden = (namaResponden: string) => {
    if (!opdId) return;
    setDeletingResponden(namaResponden);
    router.delete('/cee/1a', {
      data: { opd_id: opdId, tahun, responden_nama: namaResponden },
      preserveScroll: true,
      onSuccess: () => toast.success('Jawaban responden berhasil dihapus.'),
      onError: () => toast.error('Gagal menghapus jawaban responden.'),
      onFinish: () => setDeletingResponden(null),
    });
  };

  const simpulanBadge = (s: RekapPertanyaan['simpulan']) =>
    s === 'Memadai' ? (
      <Badge className="border-transparent bg-emerald-600 text-white hover:bg-emerald-600">Memadai</Badge>
    ) : s === 'Kurang Memadai' ? (
      <Badge className="border-transparent bg-amber-500 text-white hover:bg-amber-500">Kurang Memadai</Badge>
    ) : (
      <Badge variant="outline">Belum ada jawaban</Badge>
    );

  return (
    <AppLayout>
      <Head title="1a Kuesioner CEE" />
      <div className="space-y-4 p-4">
        <div>
          <h1 className="text-2xl font-semibold">1a — Kuesioner Penilaian Lingkungan Pengendalian (CEE)</h1>
          <p className="text-sm text-muted-foreground">
            Rekapitulasi Hasil Kuesioner Penilaian Lingkungan Pengendalian Intern — Control Environment
            Evaluation (CEE). Sesuai Lampiran 5 Form 1a Perdep PPKD No.4/2019.
          </p>
        </div>

        <OpdTahunPicker routeName="/cee/1a" opdOptions={opdOptions} opdStatus={opdStatus} opdId={opdId} tahun={tahun} />

        {!opdId ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Pilih OPD terlebih dahulu untuk mengisi atau melihat rekapitulasi kuesioner CEE.
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Identitas Responden</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="responden_nama">Nama Lengkap</Label>
                    <FieldInfoPopover text={CEE_FORM1A_FIELD_INFO.RESPONDEN_NAMA} />
                  </div>
                  <Input
                    id="responden_nama"
                    value={data.responden_nama}
                    onChange={(e) => setData('responden_nama', e.target.value)}
                  />
                  {errors.responden_nama && <p className="text-sm text-destructive">{errors.responden_nama}</p>}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="responden_jabatan">Jabatan (minimal Eselon IV)</Label>
                    <FieldInfoPopover text={CEE_FORM1A_FIELD_INFO.RESPONDEN_JABATAN} />
                  </div>
                  <Input
                    id="responden_jabatan"
                    value={data.responden_jabatan}
                    onChange={(e) => setData('responden_jabatan', e.target.value)}
                    placeholder="mis. Kasubag Umum dan Kepegawaian"
                  />
                  {errors.responden_jabatan && <p className="text-sm text-destructive">{errors.responden_jabatan}</p>}
                </div>
              </CardContent>
            </Card>

            {respondenList.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Responden yang Sudah Mengisi ({respondenList.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {respondenList.map((r, i) => (
                    <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2 text-sm">
                      <div>
                        <p className="font-medium">{r.nama}</p>
                        <p className="text-xs text-muted-foreground">{r.jabatan}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right text-xs text-muted-foreground">
                          {r.diisi_oleh && <p>Diisi lewat akun: {r.diisi_oleh}</p>}
                          {r.terakhir_diisi && <p>Terakhir: {r.terakhir_diisi}</p>}
                        </div>
                        {canEditOrDelete1a && (
                          <div className="flex shrink-0 gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={loadingResponden === r.nama}
                              onClick={() => editResponden(r.nama)}
                            >
                              <Pencil className="mr-1.5 h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  disabled={deletingResponden === r.nama}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus jawaban {r.nama}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Seluruh jawaban kuesioner responden ini utk OPD & tahun ini akan dihapus
                                    (bisa dipulihkan lewat menu Data Terhapus).
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteResponden(r.nama)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span>Terjawab {totalTerjawab} dari {totalPertanyaan} pertanyaan.</span>
              <FieldInfoPopover text={CEE_FORM1A_FIELD_INFO.JAWABAN} />
            </div>

            {unsurs.map((unsur) => (
              <Card key={unsur.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {unsur.kode}. {unsur.nama}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {unsur.pertanyaan.map((p, idx) => {
                    const r = rekap?.per_pertanyaan?.[p.id];
                    return (
                      <div key={p.id} className="space-y-2 rounded-md border p-3">
                        <p className="text-sm font-medium">
                          {idx + 1}. {p.pertanyaan}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {SKALA.map((s) => (
                            <button
                              key={s.value}
                              type="button"
                              title={s.label}
                              onClick={() => setJawaban(p.id, s.value)}
                              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                                data.jawaban[p.id] === s.value
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'hover:bg-muted'
                              }`}
                            >
                              {s.value}
                            </button>
                          ))}
                        </div>
                        {r && r.responden.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 border-t pt-2 text-xs text-muted-foreground">
                            <span>{r.responden.length} responden telah menjawab · Modus: {r.modus}</span>
                            {simpulanBadge(r.simpulan)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-end">
              <Button type="submit" disabled={processing}>
                <Save className="mr-2 h-4 w-4" />
                Simpan Jawaban Saya
              </Button>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
