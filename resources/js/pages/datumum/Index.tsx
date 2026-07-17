import { Head, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { SharedData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import TahunAktifBadge from '@/components/ui/tahun-aktif-badge';
import { OpdTahunPicker } from '@/components/cee/opd-tahun-picker';

// type alias (bukan interface) agar dapat implied index signature — syarat
// FormDataConvertible pada useForm Inertia.
type Signatory = {
  jabatan: string;
  nama: string;
  nip: string;
};

// Data dari backend: semua field identitas string + daftar penandatangan.
interface DataUmumData {
  penandatangan: Signatory[];
  [key: string]: string | Signatory[];
}

interface OpdOption {
  id: number;
  nama: string;
}

interface PageProps {
  data: DataUmumData;
  isAdmin: boolean;
  /** Daftar OPD utk picker — hanya terisi kalau isAdmin (PIC biasa tidak perlu memilih, selalu OPD-nya sendiri). */
  opdOptions: OpdOption[];
  /** OPD yg sedang dipilih Admin (dari query ?opd_id=) — null utk PIC biasa (tidak relevan) ATAU Admin yg belum memilih. */
  opdId: number | null;
  tahunAktif: string | number;
  /** Tahun Penilaian yg sedang diedit/dilihat di halaman ini (dari query ?tahun=) — BEDA dari tahunAktif (default global Pemda, lihat TahunAktifBadge). */
  tahun: number;
  /** true kalau Admin/Super Admin BELUM memilih OPD sama sekali — beda dari targetUserBelumAda (OPD sudah dipilih tapi tidak py akun PIC). */
  belumPilihOpd: boolean;
  /** true kalau OPD yg dipilih Admin belum py akun PIC terdaftar — Data Umum tidak bisa diisi/diubah utk OPD ini (butuh user_id). */
  targetUserBelumAda: boolean;
  /** true kalau baris DataUmum utk `tahun` di atas belum pernah diisi (form kosong krn memang belum ada data, BUKAN krn field2nya sengaja dikosongkan). */
  belumAdaData: boolean;
}

// Field yg nilainya Pemda-wide (sama utk semua OPD) — hanya Admin/Super
// Admin yg mengubahnya mengubah default global (lihat DataUmumController).
const PEMDA_WIDE_FIELDS = new Set([
  'pemerintah_kabkota',
  'periode_penilaian',
  'tahun_penilaian',
  'nama_kepala_daerah',
  'jabatan_kepala_daerah',
  'dokumen_sumber_rsp',
  'dokumen_sumber_rso',
  'dokumen_sumber_roo',
]);

// Field identitas dikelompokkan agar rapi; tiap entri: [key, label, tipe].
const SECTIONS: { title: string; fields: [string, string, 'text' | 'date'][] }[] = [
  {
    title: 'Identitas',
    fields: [
      ['pemerintah_kabkota', 'Pemerintah Provinsi / Kabupaten / Kota', 'text'],
      ['nama_urusan', 'Nama Urusan', 'text'],
      ['nama_sub_urusan', 'Nama Sub-Urusan', 'text'],
      ['nama_dinas_opd', 'Nama Dinas SKPK / OPD', 'text'],
      ['periode_penilaian', 'Periode Penilaian', 'text'],
    ],
  },
  {
    title: 'Kepala Daerah',
    fields: [
      ['nama_kepala_daerah', 'Nama Kepala Daerah', 'text'],
      ['jabatan_kepala_daerah', 'Nama Jabatan Kepala Daerah', 'text'],
    ],
  },
  {
    title: 'Kepala Dinas SKPK / OPD',
    fields: [
      ['nama_kepala_dinas', 'Nama Kepala Dinas SKPK / OPD', 'text'],
      ['jabatan_kepala_dinas', 'Nama Jabatan Kepala Dinas SKPK / OPD', 'text'],
      ['nip_kepala_dinas', 'NIP Kepala Dinas SKPK / OPD', 'text'],
    ],
  },
  {
    title: 'PIC Penilai Risiko',
    fields: [
      ['nama_pic', 'PIC Penilai Risiko', 'text'],
      ['jabatan_pic', 'Nama Jabatan PIC Penilai Risiko', 'text'],
      ['nip_pic', 'NIP PIC Penilai Risiko', 'text'],
    ],
  },
  {
    title: 'Dokumen Sumber Data',
    fields: [
      ['dokumen_sumber_rsp', 'Dokumen Sumber Data RSP', 'text'],
      ['dokumen_sumber_rso', 'Dokumen Sumber Data RSO', 'text'],
      ['dokumen_sumber_roo', 'Dokumen Sumber Data ROO', 'text'],
    ],
  },
  {
    title: 'Pembuatan Kertas Kerja',
    fields: [
      ['tempat_pembuatan', 'Tempat Pembuatan Kertas Kerja Penilaian Risiko', 'text'],
      ['tanggal_pembuatan', 'Tanggal Pembuatan Kertas Kerja Penilaian Risiko', 'date'],
    ],
  },
];

// Record (punya index signature) agar memenuhi FormDataType Inertia — interface
// biasa tanpa index signature ditolak useForm.
type DataUmumForm = Record<string, string | Signatory[]>;

// Dibungkus komponen luar ber-`key={tahun}` (lihat export default di bawah)
// — useForm() cuma menginisialisasi state dari `data` SEKALI saat mount,
// jadi ganti tahun via navigateTahun() (yg preserveState:true, sengaja
// dipertahankan utk UX scroll/dsb) TIDAK otomatis me-reset form ke data
// tahun baru tanpa remount paksa lewat key ini.
function DataUmumForm({ data, isAdmin, opdOptions, opdId, tahunAktif, tahun, belumPilihOpd, targetUserBelumAda, belumAdaData }: PageProps) {
  const { auth } = usePage<SharedData>().props;
  const isCeeSurvey = auth.user?.roles?.some((r) => r.name === 'cee-survey') ?? false;

  const { data: form, setData, post, processing, errors } = useForm<DataUmumForm>({
    ...data,
    penandatangan: data.penandatangan?.length ? data.penandatangan : [],
  });

  // Tahun yg sedang diedit — DIPISAH dari tahunAktif (default global Pemda,
  // diatur lewat TahunAktifBadge). Ganti tahun di sini memuat ulang halaman
  // dgn baris DataUmum utk tahun tsb (bisa kosong kalau belum pernah diisi
  // — lihat banner belumAdaData di bawah), BUKAN menampilkan data tahun lain.
  // opd_id (kalau Admin) TETAP disertakan supaya ganti tahun tidak
  // mengosongkan OPD yg sedang dipilih.
  const navigateTahun = (nextTahun: number) => {
    router.get(
      '/data-umum',
      { tahun: nextTahun, opd_id: isAdmin ? opdId ?? undefined : undefined },
      { preserveState: true, preserveScroll: true, replace: true },
    );
  };

  const signatories = (form.penandatangan ?? []) as Signatory[];

  const addSignatory = () => {
    setData('penandatangan', [...signatories, { jabatan: '', nama: '', nip: '' }]);
  };

  const removeSignatory = (index: number) => {
    setData(
      'penandatangan',
      signatories.filter((_, i) => i !== index),
    );
  };

  const updateSignatory = (index: number, key: keyof Signatory, value: string) => {
    setData(
      'penandatangan',
      signatories.map((s, i) => (i === index ? { ...s, [key]: value } : s)),
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCeeSurvey) return;
    // ?tahun= & ?opd_id= (Admin saja) WAJIB ikut di URL submit — backend
    // (DataUmumController::store()) membaca keduanya HANYA dari query
    // string, bukan dari body form (bukan bagian FIELDS/rules yg bisa
    // dioprek user). Tanpa ini, simpan akan jatuh ke tahun aktif Pemda /
    // salah OPD, bukan yg sedang dipilih di halaman ini.
    const query = new URLSearchParams({ tahun: String(tahun) });
    if (isAdmin && opdId) query.set('opd_id', String(opdId));
    post(`/data-umum?${query.toString()}`, {
      preserveScroll: true,
      onSuccess: () => toast.success('Data Umum berhasil disimpan.'),
      onError: () => toast.error('Gagal menyimpan Data Umum.'),
    });
  };

  // Admin/Super Admin: form hanya aktif kalau SUDAH memilih OPD (via
  // OpdTahunPicker di bawah) DAN OPD tsb sudah py akun PIC terdaftar
  // (DataUmum.user_id wajib ada) — PIC biasa selalu aktif (opd-nya sendiri).
  const formAktif = !isAdmin || (!belumPilihOpd && !targetUserBelumAda);

  return (
    <AppLayout>
      <Head title="Data Umum" />
      <form onSubmit={submit} className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Data Umum</h1>
            <p className="text-sm text-muted-foreground">
              Identitas kertas kerja penilaian risiko & penanda tangan — dipakai pada Form Cetak.
              {isAdmin && ' Admin/Super Admin dapat memilih OPD mana pun untuk mengubah/melengkapi datanya.'}
            </p>
            <div className="mt-2">
              <TahunAktifBadge tahunAktif={tahunAktif} editable={isAdmin} />
            </div>
          </div>
          {!isAdmin && (
            <div className="flex items-end gap-3">
              <div className="w-32 space-y-1">
                <Label htmlFor="tahun-penilaian-picker">Tahun Penilaian</Label>
                <Input
                  id="tahun-penilaian-picker"
                  type="number"
                  value={tahun}
                  onChange={(e) => navigateTahun(Number(e.target.value) || tahun)}
                />
              </div>
              {!isCeeSurvey && (
                <Button type="submit" disabled={processing}>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan
                </Button>
              )}
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-end justify-between gap-3">
            <OpdTahunPicker routeName="/data-umum" opdOptions={opdOptions} opdId={opdId} tahun={tahun} />
            {formAktif && !isCeeSurvey && (
              <Button type="submit" disabled={processing}>
                <Save className="mr-2 h-4 w-4" />
                Simpan
              </Button>
            )}
          </div>
        )}

        {isAdmin && belumPilihOpd && (
          <p className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
            Pilih OPD / Urusan yang Dinilai terlebih dahulu untuk melihat atau mengubah Data Umum-nya.
          </p>
        )}

        {isAdmin && !belumPilihOpd && targetUserBelumAda && (
          <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            OPD ini belum memiliki akun PIC terdaftar — Data Umum tidak dapat diisi/diubah sampai ada akun PIC yang
            terhubung ke OPD ini.
          </p>
        )}

        {formAktif && belumAdaData && (
          <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            Belum ada Data Umum utk Tahun Penilaian {tahun}. Isi & simpan form di bawah utk melengkapi identitas/PIC/TTD tahun ini — data tahun lain TIDAK ikut ditampilkan di sini.
          </p>
        )}

        {isCeeSurvey && (
          <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            Akun survei CEE hanya dapat melihat Data Umum. Untuk mengubahnya, hubungi PIC OPD, Admin, atau Super Admin.
          </p>
        )}

        {!isCeeSurvey && (
          <p className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
            {isAdmin
              ? 'Field bertanda * bersifat Pemda-wide — mengubah & menyimpannya akan memperbarui nilai default utk semua OPD.'
              : 'Field bertanda * terisi otomatis dari pengaturan Pemda (dikelola Admin/Super Admin). Anda tetap bisa menimpanya khusus utk OPD ini bila perlu.'}
          </p>
        )}

        {formAktif && (
          <>
            {SECTIONS.map((section) => (
              <Card key={section.title}>
                <CardHeader>
                  <CardTitle className="text-base">{section.title}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {section.fields.map(([key, label, type]) => (
                    <div key={key} className="space-y-1">
                      <Label htmlFor={key}>
                        {label}
                        {PEMDA_WIDE_FIELDS.has(key) && <span className="text-blue-600"> *</span>}
                      </Label>
                      {type === 'date' ? (
                        <DatePicker
                          id={key}
                          value={(form[key] as string) ?? ''}
                          onChange={(val) => setData(key, val)}
                          disabled={isCeeSurvey}
                        />
                      ) : (
                        <Input
                          id={key}
                          type={type}
                          value={(form[key] as string) ?? ''}
                          onChange={(e) => setData(key, e.target.value)}
                          disabled={isCeeSurvey}
                        />
                      )}
                      {errors[key] && <p className="text-sm text-destructive">{errors[key]}</p>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}

            {/* Penanda tangan dinamis — tambah/hapus baris (Jabatan, Nama, NIP). */}
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Penanda Tangan</CardTitle>
                {!isCeeSurvey && (
                  <Button type="button" variant="outline" size="sm" onClick={addSignatory}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    Tambah Penanda Tangan
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {signatories.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Belum ada penanda tangan. Klik "Tambah Penanda Tangan" untuk menambah.
                  </p>
                )}
                {signatories.map((s, i) => (
                  <div key={i} className="grid grid-cols-1 gap-2 rounded-md border p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
                    <div className="space-y-1">
                      <Label className="text-xs">Jabatan</Label>
                      <Input value={s.jabatan} onChange={(e) => updateSignatory(i, 'jabatan', e.target.value)} placeholder="mis. Sekretaris" disabled={isCeeSurvey} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Nama</Label>
                      <Input value={s.nama} onChange={(e) => updateSignatory(i, 'nama', e.target.value)} placeholder="Nama lengkap & gelar" disabled={isCeeSurvey} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">NIP</Label>
                      <Input value={s.nip} onChange={(e) => updateSignatory(i, 'nip', e.target.value)} placeholder="NIP" disabled={isCeeSurvey} />
                    </div>
                    {!isCeeSurvey && (
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          title="Hapus penanda tangan"
                          onClick={() => removeSignatory(i)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {!isCeeSurvey && (
              <div className="flex justify-end">
                <Button type="submit" disabled={processing}>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan
                </Button>
              </div>
            )}
          </>
        )}
      </form>
    </AppLayout>
  );
}

export default function DataUmumIndex(props: PageProps) {
  return <DataUmumForm key={`${props.tahun}-${props.opdId ?? 'self'}`} {...props} />;
}
