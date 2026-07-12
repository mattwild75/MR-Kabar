import { Head, useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { SharedData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { OpdTahunPicker } from '@/components/cee/opd-tahun-picker';
import FieldInfoPopover from '@/components/ui/field-info-popover';
import { CEE_FORM1C_FIELD_INFO } from '@/lib/cee-form1c-field-info';
import { formatTanggalWaktu } from '@/lib/date';
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
import { Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Unsur {
  id: number;
  kode: string;
  nama: string;
}

interface Kelemahan1b {
  id: number;
  sumber_data: string;
  uraian_kelemahan: string;
}

interface Ringkasan {
  unsur_id: number;
  kode: string;
  nama: string;
  simpulan_1a: 'Memadai' | 'Kurang Memadai' | null;
  kelemahan_1b: Kelemahan1b[];
}

interface SubmittedBy {
  name: string;
  username: string;
}

interface SimpulanTersimpan {
  id: number;
  cee_unsur_id: number;
  penjelasan: string | null;
  penyusun_nama: string;
  penyusun_jabatan: string;
  kepala_opd_nama: string | null;
  kepala_opd_jabatan: string | null;
  submitted_by: SubmittedBy | null;
  updated_at: string | null;
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
  unsurs: Unsur[];
  ringkasan: Ringkasan[] | null;
  simpulanTersimpan: Record<number, SimpulanTersimpan>;
}

type SimpulanRow = { cee_unsur_id: number; penjelasan: string };

type Form1cData = {
  opd_id: number | null;
  tahun: number;
  penyusun_nama: string;
  penyusun_jabatan: string;
  simpulan: SimpulanRow[];
  [key: string]: number | string | null | SimpulanRow[];
};

const badgeFor = (s: 'Memadai' | 'Kurang Memadai' | null) =>
  s === 'Memadai' ? (
    <Badge className="border-transparent bg-emerald-600 text-white hover:bg-emerald-600">Memadai</Badge>
  ) : s === 'Kurang Memadai' ? (
    <Badge className="border-transparent bg-amber-500 text-white hover:bg-amber-500">Kurang Memadai</Badge>
  ) : (
    <Badge variant="outline">Belum ada data</Badge>
  );

export default function Form1c({ opdOptions, opdStatus, opdId, tahun, unsurs, ringkasan, simpulanTersimpan }: PageProps) {
  const { auth } = usePage<SharedData>().props;
  const isCeeSurvey = auth.user?.roles?.some((r) => r.name === 'cee-survey') ?? false;
  const sudahAdaSimpulan = Object.keys(simpulanTersimpan ?? {}).length > 0;
  const readOnly = isCeeSurvey && sudahAdaSimpulan;
  const canDelete = !isCeeSurvey;

  const initialSimpulan: SimpulanRow[] = unsurs.map((u) => ({
    cee_unsur_id: u.id,
    penjelasan: simpulanTersimpan?.[u.id]?.penjelasan ?? '',
  }));

  const existingPenyusun = Object.values(simpulanTersimpan ?? {})[0];

  const { data, setData, post, processing, errors } = useForm<Form1cData>({
    opd_id: opdId,
    tahun,
    penyusun_nama: existingPenyusun?.penyusun_nama ?? '',
    penyusun_jabatan: existingPenyusun?.penyusun_jabatan ?? '',
    simpulan: initialSimpulan,
  });

  const updatePenjelasan = (unsurId: number, val: string) => {
    setData(
      'simpulan',
      data.simpulan.map((s) => (s.cee_unsur_id === unsurId ? { ...s, penjelasan: val } : s)),
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opdId) {
      toast.error('Pilih OPD terlebih dahulu.');
      return;
    }
    if (readOnly) {
      toast.error('Akun survei CEE tidak dapat mengedit simpulan yang sudah tersimpan.');
      return;
    }
    post('/cee/1c', {
      preserveScroll: true,
      onSuccess: () => toast.success('Simpulan CEE berhasil disimpan.'),
      onError: () => toast.error('Gagal menyimpan simpulan.'),
    });
  };

  const deleteSimpulan = (simpulanId: number, unsurLabel: string) => {
    router.delete(`/cee/1c/${simpulanId}`, {
      preserveScroll: true,
      onSuccess: () => toast.success(`Simpulan ${unsurLabel} berhasil dihapus.`),
      onError: () => toast.error('Gagal menghapus simpulan.'),
    });
  };

  return (
    <AppLayout>
      <Head title="1c Simpulan Survei Persepsi" />
      <div className="space-y-4 p-4">
        <div>
          <h1 className="text-2xl font-semibold">1c — Simpulan Survei Persepsi atas Lingkungan Pengendalian Intern</h1>
          <p className="text-sm text-muted-foreground">
            Simpulan akhir per unsur, gabungan hasil kuesioner (1a) & reviu dokumen (1b). Disusun Sekretaris
            Dinas/Badan, disahkan Kepala OPD. Sesuai Lampiran 5 Form 1c Perdep PPKD No.4/2019.
          </p>
        </div>

        <OpdTahunPicker routeName="/cee/1c" opdOptions={opdOptions} opdStatus={opdStatus} opdId={opdId} tahun={tahun} />

        {!opdId || !ringkasan ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Pilih OPD terlebih dahulu.
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {readOnly && (
              <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                Simpulan OPD & tahun ini sudah tersimpan. Akun survei CEE tidak dapat mengeditnya — hubungi PIC OPD,
                Admin, atau Super Admin.
              </p>
            )}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Penyusun Simpulan</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="penyusun_nama">Nama (Sekretaris Dinas/Badan)</Label>
                    <FieldInfoPopover text={CEE_FORM1C_FIELD_INFO.PENYUSUN_NAMA} />
                  </div>
                  <Input id="penyusun_nama" value={data.penyusun_nama} onChange={(e) => setData('penyusun_nama', e.target.value)} disabled={readOnly} />
                  {errors.penyusun_nama && <p className="text-sm text-destructive">{errors.penyusun_nama}</p>}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="penyusun_jabatan">Jabatan</Label>
                    <FieldInfoPopover text={CEE_FORM1C_FIELD_INFO.PENYUSUN_JABATAN} />
                  </div>
                  <Input
                    id="penyusun_jabatan"
                    value={data.penyusun_jabatan}
                    onChange={(e) => setData('penyusun_jabatan', e.target.value)}
                    placeholder="mis. Sekretaris Dinas Kesehatan"
                    disabled={readOnly}
                  />
                  {errors.penyusun_jabatan && <p className="text-sm text-destructive">{errors.penyusun_jabatan}</p>}
                </div>
                <p className="sm:col-span-2 text-xs text-muted-foreground">
                  Penandatangan (Kepala OPD/UPR) diambil otomatis dari menu <b>Data Umum</b> milik akun ini saat
                  disimpan.
                </p>
              </CardContent>
            </Card>

            {ringkasan.map((r) => {
              const row = data.simpulan.find((s) => s.cee_unsur_id === r.unsur_id);
              const hasilDokumen = r.kelemahan_1b.length === 0 ? 'Memadai' : 'Kurang Memadai';
              const tersimpan = simpulanTersimpan?.[r.unsur_id];
              return (
                <Card key={r.unsur_id}>
                  <CardHeader className="flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle className="text-base">
                        {r.kode}. {r.nama}
                      </CardTitle>
                      {tersimpan?.submitted_by && (
                        <p className="text-xs text-muted-foreground">
                          Disimpan lewat akun: {tersimpan.submitted_by.name || tersimpan.submitted_by.username}
                          {tersimpan.updated_at && ` — ${formatTanggalWaktu(tersimpan.updated_at)}`}
                        </p>
                      )}
                    </div>
                    {canDelete && tersimpan && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus simpulan {r.kode}. {r.nama}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Simpulan unsur ini akan dihapus (bisa dipulihkan lewat menu Data Terhapus).
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteSimpulan(tersimpan.id, `${r.kode}. ${r.nama}`)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-md border p-3">
                        <p className="mb-1 text-xs font-medium text-muted-foreground">Hasil Reviu Dokumen (1b)</p>
                        {badgeFor(hasilDokumen)}
                        {r.kelemahan_1b.length > 0 && (
                          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                            {r.kelemahan_1b.map((k) => (
                              <li key={k.id}>{k.uraian_kelemahan}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="rounded-md border p-3">
                        <p className="mb-1 text-xs font-medium text-muted-foreground">Hasil Survei Persepsi (1a)</p>
                        {badgeFor(r.simpulan_1a)}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Label>Penjelasan Simpulan</Label>
                        <FieldInfoPopover text={CEE_FORM1C_FIELD_INFO.PENJELASAN_SIMPULAN} />
                      </div>
                      <Textarea
                        rows={2}
                        value={row?.penjelasan ?? ''}
                        onChange={(e) => updatePenjelasan(r.unsur_id, e.target.value)}
                        placeholder="Jika hasil reviu dokumen & survei persepsi bertentangan, lakukan pendalaman/professional judgement untuk menyimpulkannya."
                        disabled={readOnly}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {!readOnly && (
              <div className="flex justify-end">
                <Button type="submit" disabled={processing}>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Simpulan
                </Button>
              </div>
            )}
          </form>
        )}
      </div>
    </AppLayout>
  );
}
