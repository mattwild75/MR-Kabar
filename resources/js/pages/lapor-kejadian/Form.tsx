import { useEffect, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import { Search, Siren, X } from 'lucide-react';
import { toast } from 'sonner';
import FieldInfoPopover from '@/components/ui/field-info-popover';
import { LAPOR_KEJADIAN_FIELD_INFO } from '@/lib/lapor-kejadian-field-info';
import MultiCategoryTextarea from '@/components/ui/multi-category-textarea';
import { PENYEBAB_5M_KATEGORI } from '@/lib/irs-reference-data';

interface Opd {
  id: number;
  nama: string;
}

interface RisikoHasil {
  tipe: 'irs_pemda' | 'irs_pd' | 'iro_pd';
  id: number;
  uraian_risiko: string;
  konteks: string | null;
  opd: string | null;
  pemicu: string | null;
}

interface Props {
  opdList: Opd[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Utilities', href: '#' },
  { title: 'Lapor Kejadian Risiko', href: '/lapor-kejadian' },
];

const TIPE_LABEL: Record<RisikoHasil['tipe'], string> = {
  irs_pemda: 'Risiko Strategis Pemda',
  irs_pd: 'Risiko Strategis PD',
  iro_pd: 'Risiko Operasional PD',
};

export default function LaporKejadianForm({ opdList }: Props) {
  const [mode, setMode] = useState<'terdaftar' | 'baru'>('baru');
  const [query, setQuery] = useState('');
  const [hasil, setHasil] = useState<RisikoHasil[]>([]);
  const [searching, setSearching] = useState(false);
  const [risikoTerpilih, setRisikoTerpilih] = useState<RisikoHasil | null>(null);
  const [tanggalKejadian, setTanggalKejadian] = useState('');
  const [jamKejadian, setJamKejadian] = useState('');

  const { data, setData, post, processing, errors, reset } = useForm({
    nama_lengkap: '',
    email: '',
    no_hp: '',
    opd_id: '' as string | number,
    kejadian: '',
    waktu_kejadian: '',
    tempat: '',
    pemicu: '',
    risiko_terdaftar_tipe: '' as string,
    risiko_terdaftar_id: '' as string | number,
  });

  useEffect(() => {
    if (!tanggalKejadian) {
      setData('waktu_kejadian', '');
      return;
    }
    setData('waktu_kejadian', `${tanggalKejadian} ${jamKejadian || '00:00'}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tanggalKejadian, jamKejadian]);

  const cariRisiko = async (q: string) => {
    setQuery(q);
    if (q.trim().length < 2) {
      setHasil([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/lapor-kejadian/cari-risiko?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      setHasil(json);
    } finally {
      setSearching(false);
    }
  };

  const pilihRisiko = (r: RisikoHasil) => {
    setRisikoTerpilih(r);
    setData((prev) => ({
      ...prev,
      risiko_terdaftar_tipe: r.tipe,
      risiko_terdaftar_id: r.id,
      pemicu: r.pemicu ?? prev.pemicu,
    }));
    setHasil([]);
    setQuery(r.uraian_risiko);
  };

  const batalPilihRisiko = () => {
    setRisikoTerpilih(null);
    setQuery('');
    setData((prev) => ({ ...prev, risiko_terdaftar_tipe: '', risiko_terdaftar_id: '' }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/lapor-kejadian', {
      onSuccess: () => {
        toast.success('Laporan kejadian risiko berhasil dikirim. Terima kasih.');
        reset();
        setRisikoTerpilih(null);
        setQuery('');
        setMode('baru');
        setTanggalKejadian('');
        setJamKejadian('');
      },
      onError: () => toast.error('Gagal mengirim laporan. Periksa kembali isian Anda.'),
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Lapor Kejadian Risiko" />

      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <div className="flex items-center gap-2">
          <Siren className="h-6 w-6 text-destructive" />
          <div>
            <h1 className="text-xl font-semibold">Lapor Kejadian Risiko</h1>
            <p className="text-sm text-muted-foreground">
              Laporkan kejadian risiko yang sedang atau telah terjadi — bisa dikaitkan ke risiko yang sudah
              terdaftar, atau melaporkan kejadian baru.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mode Pelaporan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={mode === 'terdaftar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('terdaftar')}
              >
                Cek Risiko yang Sudah Terjadi
              </Button>
              <Button
                type="button"
                variant={mode === 'baru' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setMode('baru');
                  batalPilihRisiko();
                }}
              >
                Lapor Kejadian Baru
              </Button>
            </div>

            {mode === 'terdaftar' && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label>Cari Risiko Terdaftar (IRS Pemda / IRS PD / IRO PD)</Label>
                  <FieldInfoPopover text={LAPOR_KEJADIAN_FIELD_INFO.cari_risiko_terdaftar} />
                </div>
                {!risikoTerpilih ? (
                  <div className="relative">
                    <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-8"
                      placeholder="Ketik uraian risiko, nama OPD, pemilik risiko, atau penanggung jawab..."
                      value={query}
                      onChange={(e) => cariRisiko(e.target.value)}
                    />
                    {searching && <p className="mt-1 text-xs text-muted-foreground">Mencari...</p>}
                    {hasil.length > 0 && (
                      <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border bg-popover shadow-md">
                        {hasil.map((r) => (
                          <button
                            key={`${r.tipe}-${r.id}`}
                            type="button"
                            onClick={() => pilihRisiko(r)}
                            className="block w-full border-b px-3 py-2 text-left text-sm last:border-b-0 hover:bg-accent"
                          >
                            <p className="font-medium">{r.uraian_risiko}</p>
                            <p className="text-xs text-muted-foreground">
                              {TIPE_LABEL[r.tipe]} {r.konteks ? `· ${r.konteks}` : ''} {r.opd ? `· ${r.opd}` : ''}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2 rounded-md border border-primary bg-primary/5 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{risikoTerpilih.uraian_risiko}</p>
                      <p className="text-xs text-muted-foreground">
                        {TIPE_LABEL[risikoTerpilih.tipe]} {risikoTerpilih.opd ? `· ${risikoTerpilih.opd}` : ''}
                      </p>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={batalPilihRisiko}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <form onSubmit={submit}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data Pelapor & Kejadian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label>Nama Lengkap</Label>
                    <FieldInfoPopover text={LAPOR_KEJADIAN_FIELD_INFO.nama_lengkap} />
                  </div>
                  <Input value={data.nama_lengkap} onChange={(e) => setData('nama_lengkap', e.target.value)} required />
                  {errors.nama_lengkap && <p className="text-sm text-destructive">{errors.nama_lengkap}</p>}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label>Email (opsional)</Label>
                    <FieldInfoPopover text={LAPOR_KEJADIAN_FIELD_INFO.email} />
                  </div>
                  <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label>Nomor HP (opsional)</Label>
                    <FieldInfoPopover text={LAPOR_KEJADIAN_FIELD_INFO.no_hp} />
                  </div>
                  <Input value={data.no_hp} onChange={(e) => setData('no_hp', e.target.value)} />
                  {errors.no_hp && <p className="text-sm text-destructive">{errors.no_hp}</p>}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label>OPD Terkait (opsional)</Label>
                    <FieldInfoPopover text={LAPOR_KEJADIAN_FIELD_INFO.opd_id} />
                  </div>
                  <Select
                    value={data.opd_id ? String(data.opd_id) : 'none'}
                    onValueChange={(v) => setData('opd_id', v === 'none' ? '' : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih OPD..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tidak ada OPD</SelectItem>
                      {opdList.map((o) => (
                        <SelectItem key={o.id} value={String(o.id)}>
                          {o.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.opd_id && <p className="text-sm text-destructive">{errors.opd_id}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Label>Kejadian</Label>
                  <FieldInfoPopover text={LAPOR_KEJADIAN_FIELD_INFO.kejadian} />
                </div>
                <Textarea
                  rows={4}
                  value={data.kejadian}
                  onChange={(e) => setData('kejadian', e.target.value)}
                  placeholder="Jelaskan kejadian risiko yang sedang/telah terjadi..."
                  required
                />
                {errors.kejadian && <p className="text-sm text-destructive">{errors.kejadian}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label>Waktu Kejadian</Label>
                    <FieldInfoPopover text={LAPOR_KEJADIAN_FIELD_INFO.waktu_kejadian} />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <DatePicker value={tanggalKejadian} onChange={setTanggalKejadian} placeholder="Pilih tanggal" />
                    </div>
                    <div className="w-36">
                      <TimePicker value={jamKejadian} onChange={setJamKejadian} placeholder="Pilih jam" />
                    </div>
                  </div>
                  {errors.waktu_kejadian && <p className="text-sm text-destructive">{errors.waktu_kejadian}</p>}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label>Tempat (opsional)</Label>
                    <FieldInfoPopover text={LAPOR_KEJADIAN_FIELD_INFO.tempat} />
                  </div>
                  <Input value={data.tempat} onChange={(e) => setData('tempat', e.target.value)} />
                  {errors.tempat && <p className="text-sm text-destructive">{errors.tempat}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Label>Pemicu (opsional)</Label>
                  <FieldInfoPopover text={LAPOR_KEJADIAN_FIELD_INFO.pemicu} />
                </div>
                <MultiCategoryTextarea
                  value={data.pemicu}
                  onChange={(val) => setData('pemicu', val)}
                  categories={PENYEBAB_5M_KATEGORI}
                  uraianPlaceholder="Apa yang memicu kejadian ini?"
                  rows={2}
                />
                {errors.pemicu && <p className="text-sm text-destructive">{errors.pemicu}</p>}
              </div>

              <Button type="submit" disabled={processing} className="w-full">
                {processing ? 'Mengirim...' : 'Lapor'}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
}
