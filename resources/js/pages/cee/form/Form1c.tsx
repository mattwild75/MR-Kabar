import { Head, useForm, usePage, router } from '@inertiajs/react';
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
  simpulan: 'Memadai' | 'Kurang Memadai' | null;
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

interface NamaJabatan {
  nama: string;
  jabatan: string;
}

interface PageProps {
  opdOptions: OpdOption[];
  opdStatus: Record<number, OpdStatusEntry>;
  opdId: number | null;
  tahun: number;
  unsurs: Unsur[];
  ringkasan: Ringkasan[] | null;
  simpulanTersimpan: Record<number, SimpulanTersimpan>;
  /** Kandidat default Sekretaris dari DataUmum.penandatangan[] OPD ybs — hanya terisi kalau OPD ini BELUM py simpulan 1c sama sekali (sinkronisasi 2 arah dgn Data Umum). */
  defaultPenyusun: NamaJabatan | null;
  /** Kandidat default Kepala OPD dari DataUmum.nama_kepala_dinas/jabatan_kepala_dinas — sama syarat dgn defaultPenyusun. */
  defaultKepalaOpd: NamaJabatan | null;
}

const badgeFor = (s: 'Memadai' | 'Kurang Memadai' | null) =>
  s === 'Memadai' ? (
    <Badge className="border-transparent bg-emerald-600 text-white hover:bg-emerald-600">Memadai</Badge>
  ) : s === 'Kurang Memadai' ? (
    <Badge className="border-transparent bg-amber-500 text-white hover:bg-amber-500">Kurang Memadai</Badge>
  ) : (
    <Badge variant="outline">Belum ada data</Badge>
  );

/**
 * Satu kartu unsur — sama pola dgn EntryRow Form1b.tsx: default MODE VIEW
 * (read-only, tampilkan badge simpulan + teks penjelasan apa adanya) kalau
 * sudah tersimpan, tombol "Edit" membuka mode edit (dropdown+textarea).
 * Unsur yg BELUM py simpulan tersimpan sama sekali langsung tampil dlm mode
 * edit (tidak ada apa pun utk "dilihat"). Mencegah perubahan tidak sengaja
 * dibanding versi awal yg semua field selalu terbuka utk diedit.
 */
function UnsurCard({
  r,
  tersimpan,
  opdId,
  tahun,
  penyusunNama,
  penyusunJabatan,
  kepalaOpdNama,
  kepalaOpdJabatan,
  canEdit,
  canDelete,
}: {
  r: Ringkasan;
  tersimpan: SimpulanTersimpan | undefined;
  opdId: number;
  tahun: number;
  penyusunNama: string;
  penyusunJabatan: string;
  kepalaOpdNama: string;
  kepalaOpdJabatan: string;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const [editing, setEditing] = useState(!tersimpan);
  const [simpulan, setSimpulan] = useState<'Memadai' | 'Kurang Memadai' | ''>(tersimpan?.simpulan ?? '');
  const [penjelasan, setPenjelasan] = useState(tersimpan?.penjelasan ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasilDokumen = r.kelemahan_1b.length === 0 ? 'Memadai' : 'Kurang Memadai';

  const save = () => {
    if (!simpulan) {
      setError('Simpulan wajib dipilih.');
      return;
    }
    if (!penyusunNama || !penyusunJabatan) {
      toast.error('Isi Nama & Jabatan Penyusun Simpulan terlebih dahulu (di atas).');
      return;
    }
    setError(null);
    setSaving(true);

    const payload = { simpulan, penjelasan: simpulan === 'Memadai' ? null : penjelasan || null };
    const onDone = {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(`Simpulan ${r.kode}. ${r.nama} berhasil disimpan.`);
        setEditing(false);
      },
      onError: (errs: Record<string, string>) => {
        setError(errs.simpulan ?? errs.penjelasan ?? 'Gagal menyimpan simpulan.');
      },
      onFinish: () => setSaving(false),
    };

    // SELALU lewat store1c() (batch, updateOrCreate per unsur) — bukan
    // update1c() (PUT ke 1 baris, sengaja HANYA menerima simpulan/
    // penjelasan) — supaya penyusun_nama/kepala_opd_* yg diedit di card
    // Penandatangan ikut tersimpan+tersinkron ke DataUmum meski PIC
    // menekan Simpan pada unsur yg SUDAH tersimpan sebelumnya (bug lama:
    // via update1c() perubahan Penyusun/Kepala OPD didiamkan begitu saja
    // tanpa ada tanda apa pun ke user).
    router.post(
      '/cee/1c',
      {
        opd_id: opdId,
        tahun,
        penyusun_nama: penyusunNama,
        penyusun_jabatan: penyusunJabatan,
        kepala_opd_nama: kepalaOpdNama || undefined,
        kepala_opd_jabatan: kepalaOpdJabatan || undefined,
        simpulan: [{ cee_unsur_id: r.unsur_id, ...payload }],
      },
      onDone,
    );
  };

  const cancelEdit = () => {
    setSimpulan(tersimpan?.simpulan ?? '');
    setPenjelasan(tersimpan?.penjelasan ?? '');
    setError(null);
    setEditing(false);
  };

  const deleteSimpulan = () => {
    if (!tersimpan) return;
    router.delete(`/cee/1c/${tersimpan.id}`, {
      preserveScroll: true,
      onSuccess: () => toast.success(`Simpulan ${r.kode}. ${r.nama} berhasil dihapus.`),
      onError: () => toast.error('Gagal menghapus simpulan.'),
    });
  };

  return (
    <Card>
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
        {tersimpan && !editing && (
          <div className="flex shrink-0 gap-1">
            {canEdit && (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                Edit
              </Button>
            )}
            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Hapus simpulan {r.kode}. {r.nama}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Simpulan unsur ini akan dihapus (bisa dipulihkan lewat menu Data Terhapus).
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteSimpulan} className="bg-destructive hover:bg-destructive/90">
                      Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-3">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Hasil Survei Persepsi (1a)</p>
            {badgeFor(r.simpulan_1a)}
          </div>
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
        </div>

        {editing ? (
          <>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Label>
                  Simpulan <span className="text-destructive">*</span>
                </Label>
                <FieldInfoPopover text={CEE_FORM1C_FIELD_INFO.SIMPULAN_UNSUR} />
              </div>
              <Select value={simpulan || undefined} onValueChange={(v) => setSimpulan(v as 'Memadai' | 'Kurang Memadai')}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih simpulan..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Memadai">Memadai</SelectItem>
                  <SelectItem value="Kurang Memadai">Kurang Memadai</SelectItem>
                </SelectContent>
              </Select>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Label>Penjelasan Simpulan</Label>
                <FieldInfoPopover text={CEE_FORM1C_FIELD_INFO.PENJELASAN_SIMPULAN} />
              </div>
              <Textarea
                rows={2}
                value={simpulan === 'Memadai' ? '' : penjelasan}
                onChange={(e) => setPenjelasan(e.target.value)}
                placeholder={
                  simpulan === 'Memadai'
                    ? 'Tidak diperlukan — simpulan sudah Memadai.'
                    : 'Jika hasil reviu dokumen & survei persepsi bertentangan, lakukan pendalaman/professional judgement untuk menyimpulkannya.'
                }
                disabled={simpulan === 'Memadai'}
              />
            </div>

            <div className="flex justify-end gap-2">
              {tersimpan && (
                <Button type="button" variant="outline" size="sm" onClick={cancelEdit}>
                  Batal
                </Button>
              )}
              <Button type="button" size="sm" onClick={save} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                Simpan
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium text-muted-foreground">Simpulan:</p>
              {badgeFor(tersimpan?.simpulan ?? null)}
            </div>
            {tersimpan?.penjelasan && <p className="text-sm text-muted-foreground">{tersimpan.penjelasan}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Form1c({
  opdOptions,
  opdStatus,
  opdId,
  tahun,
  ringkasan,
  simpulanTersimpan,
  defaultPenyusun,
  defaultKepalaOpd,
}: PageProps) {
  const { auth } = usePage<SharedData>().props;
  const isCeeSurvey = auth.user?.roles?.some((r) => r.name === 'cee-survey') ?? false;
  const sudahAdaSimpulan = Object.keys(simpulanTersimpan ?? {}).length > 0;
  const readOnly = isCeeSurvey && sudahAdaSimpulan;
  const canEdit = !readOnly;
  const canDelete = !isCeeSurvey;

  const existingPenyusun = Object.values(simpulanTersimpan ?? {})[0];

  // Prioritas nilai awal: simpulan 1c yg SUDAH tersimpan (existingPenyusun)
  // > kandidat dari DataUmum.penandatangan[] (defaultPenyusun/defaultKepalaOpd,
  // hanya dikirim backend kalau OPD ini blm py simpulan 1c sama sekali) >
  // string kosong. Ini bagian sinkronisasi 2 arah: kalau Data Umum sudah
  // py entri "Sekretaris ..." & Kepala Dinas, Form 1c OTOMATIS terisi tanpa
  // PIC perlu ketik ulang.
  const { data, setData, errors } = useForm({
    penyusun_nama: existingPenyusun?.penyusun_nama ?? defaultPenyusun?.nama ?? '',
    penyusun_jabatan: existingPenyusun?.penyusun_jabatan ?? defaultPenyusun?.jabatan ?? '',
    kepala_opd_nama: existingPenyusun?.kepala_opd_nama ?? defaultKepalaOpd?.nama ?? '',
    kepala_opd_jabatan: existingPenyusun?.kepala_opd_jabatan ?? defaultKepalaOpd?.jabatan ?? '',
  });

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
          <div className="space-y-4">
            {readOnly && (
              <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                Simpulan OPD & tahun ini sudah tersimpan. Akun survei CEE tidak dapat mengeditnya — hubungi PIC OPD,
                Admin, atau Super Admin.
              </p>
            )}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Penandatangan</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Sisi KIRI = Sekretaris/setingkat (penyusun simpulan) — sinkron 2 arah dgn DataUmum.penandatangan[] (jabatan mengandung "sekretaris"). */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Penyusun (Sekretaris/setingkat)</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="penyusun_nama">Nama</Label>
                      <FieldInfoPopover text={CEE_FORM1C_FIELD_INFO.PENYUSUN_NAMA} />
                    </div>
                    <Input
                      id="penyusun_nama"
                      value={data.penyusun_nama}
                      onChange={(e) => setData('penyusun_nama', e.target.value)}
                      disabled={readOnly}
                    />
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
                </div>

                {/* Sisi KANAN = Kepala OPD (penandatangan/UPR) — sinkron 2 arah dgn DataUmum.nama_kepala_dinas/jabatan_kepala_dinas & penandatangan[]. */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Kepala OPD</p>
                  <div className="space-y-1">
                    <Label htmlFor="kepala_opd_nama">Nama</Label>
                    <Input
                      id="kepala_opd_nama"
                      value={data.kepala_opd_nama}
                      onChange={(e) => setData('kepala_opd_nama', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="kepala_opd_jabatan">Jabatan</Label>
                    <Input
                      id="kepala_opd_jabatan"
                      value={data.kepala_opd_jabatan}
                      onChange={(e) => setData('kepala_opd_jabatan', e.target.value)}
                      placeholder="mis. Kepala Dinas Kesehatan"
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground sm:col-span-2">
                  Isi Penyusun & Kepala OPD sebelum menyimpan simpulan unsur mana pun di bawah — keduanya otomatis
                  tersinkron dua arah dengan menu <b>Data Umum</b> (bagian Penanda Tangan) milik OPD ini.
                </p>
              </CardContent>
            </Card>

            {ringkasan.map((r) => (
              <UnsurCard
                key={r.unsur_id}
                r={r}
                tersimpan={simpulanTersimpan?.[r.unsur_id]}
                opdId={opdId}
                tahun={tahun}
                penyusunNama={data.penyusun_nama}
                penyusunJabatan={data.penyusun_jabatan}
                kepalaOpdNama={data.kepala_opd_nama}
                kepalaOpdJabatan={data.kepala_opd_jabatan}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
