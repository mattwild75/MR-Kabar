import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { type BreadcrumbItem } from '@/types';
import { Search, Trash2, Eye, FileCheck2 } from 'lucide-react';
import { toast } from 'sonner';

interface Opd {
  id: number;
  nama: string;
}

interface Laporan {
  id: number;
  nama_lengkap: string;
  email: string | null;
  no_hp: string | null;
  opd: Opd | null;
  kejadian: string;
  waktu_kejadian: string;
  waktu_kejadian_raw: string;
  tempat: string | null;
  pemicu: string | null;
  risiko_terdaftar_tipe: string | null;
  risiko_terdaftar_id: number | null;
  risiko_terdaftar_uraian: string | null;
  risiko_terdaftar_tahun: number | null;
  status: string;
  catatan_tindak_lanjut: string | null;
  ditindaklanjuti_oleh: string | null;
  created_at: string;
  sudah_dicatat_form10: boolean;
}

interface RisikoHasil {
  tipe: 'irs_pemda' | 'irs_pd' | 'iro_pd';
  id: number;
  uraian_risiko: string;
  konteks: string | null;
  opd: string | null;
  pemicu: string | null;
}

interface Paginator<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
  laporan: Paginator<Laporan>;
  filters: { status?: string; opd_id?: string; search?: string };
  opdList: Opd[];
  statuses: string[];
  isAdminOrSuperAdmin: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  baru: 'Baru',
  diverifikasi: 'Diverifikasi',
  ditindaklanjuti: 'Ditindaklanjuti',
  selesai: 'Selesai',
};

const TIPE_LABEL: Record<string, string> = {
  irs_pemda: 'Risiko Strategis Pemda',
  irs_pd: 'Risiko Strategis PD',
  iro_pd: 'Risiko Operasional PD',
};

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  baru: 'default',
  diverifikasi: 'secondary',
  ditindaklanjuti: 'secondary',
  selesai: 'outline',
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Utilities', href: '#' },
  { title: 'Rekap Lapor Kejadian Risiko', href: '/lapor-kejadian/rekap' },
];

export default function LaporKejadianRekap({ laporan, filters, opdList, statuses, isAdminOrSuperAdmin }: Props) {
  const [search, setSearch] = useState(filters.search ?? '');
  const [detail, setDetail] = useState<Laporan | null>(null);
  const [tindakLanjut, setTindakLanjut] = useState<{ status: string; catatan: string }>({ status: '', catatan: '' });
  const [opdEdit, setOpdEdit] = useState<string>('');
  const [savingOpd, setSavingOpd] = useState(false);
  const [cariRisikoQuery, setCariRisikoQuery] = useState('');
  const [cariRisikoHasil, setCariRisikoHasil] = useState<RisikoHasil[]>([]);
  const [cariRisikoSearching, setCariRisikoSearching] = useState(false);
  const [savingRisikoTerdaftar, setSavingRisikoTerdaftar] = useState(false);

  const applyFilter = (params: Record<string, string | undefined>) => {
    router.get('/lapor-kejadian/rekap', { ...filters, ...params }, { preserveState: true, preserveScroll: true });
  };

  const bukaDetail = (l: Laporan) => {
    setDetail(l);
    setTindakLanjut({ status: l.status, catatan: l.catatan_tindak_lanjut ?? '' });
    setOpdEdit(l.opd ? String(l.opd.id) : '');
    setCariRisikoQuery('');
    setCariRisikoHasil([]);
  };

  const cariRisikoTerdaftar = async (q: string) => {
    setCariRisikoQuery(q);
    if (q.trim().length < 2) {
      setCariRisikoHasil([]);
      return;
    }
    setCariRisikoSearching(true);
    try {
      const res = await fetch(`/lapor-kejadian/cari-risiko?q=${encodeURIComponent(q)}`);
      setCariRisikoHasil(await res.json());
    } finally {
      setCariRisikoSearching(false);
    }
  };

  const tautkanRisikoTerdaftar = (r: RisikoHasil) => {
    if (!detail) return;
    setSavingRisikoTerdaftar(true);
    router.put(`/lapor-kejadian/rekap/${detail.id}/risiko-terdaftar`, {
      risiko_terdaftar_tipe: r.tipe,
      risiko_terdaftar_id: r.id,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Laporan berhasil ditautkan ke risiko terdaftar.');
        setDetail((prev) => (prev ? { ...prev, risiko_terdaftar_tipe: r.tipe, risiko_terdaftar_id: r.id, risiko_terdaftar_uraian: r.uraian_risiko } : prev));
        setCariRisikoQuery('');
        setCariRisikoHasil([]);
      },
      onError: () => toast.error('Gagal menautkan risiko.'),
      onFinish: () => setSavingRisikoTerdaftar(false),
    });
  };

  const bukaFormCatat10 = (l: Laporan) => {
    const params = new URLSearchParams({
      opd_id: l.opd?.id ? String(l.opd.id) : '',
      // WAJIB tahun risiko terdaftar (BUKAN tahun aktif Pengaturan Pemda)
      // — kalau kosong Form10 fallback ke tahun aktif & kartu risikonya
      // tidak akan pernah cocok (risikonya terdaftar di tahun lain).
      tahun: l.risiko_terdaftar_tahun ? String(l.risiko_terdaftar_tahun) : '',
      prefill_risiko_tipe: l.risiko_terdaftar_tipe ?? '',
      prefill_risiko_id: l.risiko_terdaftar_id ? String(l.risiko_terdaftar_id) : '',
      prefill_tanggal_terjadi: l.waktu_kejadian_raw,
      prefill_sebab: l.pemicu ?? '',
      prefill_dampak: l.kejadian,
      prefill_laporan_kejadian_id: String(l.id),
    });
    window.open(`/monitoring-evaluasi/10?${params.toString()}`, '_blank');
  };

  const simpanOpd = () => {
    if (!detail) return;
    setSavingOpd(true);
    router.put(`/lapor-kejadian/rekap/${detail.id}/opd`, {
      opd_id: opdEdit || null,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('OPD terkait laporan diperbarui, PIC OPD telah dinotifikasi.');
        setDetail(null);
      },
      onError: () => toast.error('Gagal memperbarui OPD.'),
      onFinish: () => setSavingOpd(false),
    });
  };

  const RISIKO_ROUTE: Record<'irs_pemda' | 'irs_pd' | 'iro_pd', string> = {
    irs_pemda: '/irs_pemda',
    irs_pd: '/irs_pd',
    iro_pd: '/iro_pd',
  };

  const bukaFormRisiko = (l: Laporan, tipe: 'irs_pemda' | 'irs_pd' | 'iro_pd') => {
    const params = new URLSearchParams({
      prefill_uraian_risiko: l.kejadian,
      prefill_penyebab_risiko: l.pemicu ?? '',
      prefill_opd: l.opd?.nama ?? '',
    });
    window.open(`${RISIKO_ROUTE[tipe]}?${params.toString()}`, '_blank');
  };

  const simpanTindakLanjut = () => {
    if (!detail) return;
    router.put(`/lapor-kejadian/rekap/${detail.id}/status`, {
      status: tindakLanjut.status,
      catatan_tindak_lanjut: tindakLanjut.catatan,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Status laporan diperbarui.');
        setDetail(null);
      },
      onError: () => toast.error('Gagal memperbarui status.'),
    });
  };

  const hapus = (id: number) => {
    router.delete(`/lapor-kejadian/rekap/${id}`, {
      preserveScroll: true,
      onSuccess: () => toast.success('Laporan dihapus.'),
      onError: () => toast.error('Gagal menghapus laporan.'),
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Rekap Lapor Kejadian Risiko" />

      <div className="space-y-4 p-4">
        <div>
          <h1 className="text-xl font-semibold">Rekap Lapor Kejadian Risiko</h1>
          <p className="text-sm text-muted-foreground">
            {isAdminOrSuperAdmin
              ? 'Seluruh laporan kejadian risiko dari semua OPD.'
              : 'Laporan kejadian risiko yang ditujukan ke OPD Anda.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Cari nama/kejadian/tempat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilter({ search })}
            />
          </div>
          <Select value={filters.status ?? 'all'} onValueChange={(v) => applyFilter({ status: v === 'all' ? undefined : v })}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s] ?? s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isAdminOrSuperAdmin && (
            <Select value={filters.opd_id ?? 'all'} onValueChange={(v) => applyFilter({ opd_id: v === 'all' ? undefined : v })}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Semua OPD" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua OPD</SelectItem>
                {opdList.map((o) => (
                  <SelectItem key={o.id} value={String(o.id)}>
                    {o.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-3">
          {laporan.data.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">Belum ada laporan kejadian risiko.</p>
          )}
          {laporan.data.map((l) => (
            <Card key={l.id}>
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{l.nama_lengkap}</p>
                    <Badge variant={STATUS_VARIANT[l.status] ?? 'default'}>{STATUS_LABELS[l.status] ?? l.status}</Badge>
                    {l.opd && <Badge variant="outline">{l.opd.nama}</Badge>}
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{l.kejadian}</p>
                  <p className="text-xs text-muted-foreground">
                    {l.waktu_kejadian} {l.tempat ? `· ${l.tempat}` : ''} · Dilaporkan {l.created_at}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button type="button" variant="outline" size="sm" onClick={() => bukaDetail(l)}>
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    Detail
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus laporan ini?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Laporan kejadian dari "{l.nama_lengkap}" akan dihapus. Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => hapus(l.id)}>
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {laporan.last_page > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-1">
            {laporan.links.map((link, i) => (
              <button
                key={i}
                type="button"
                disabled={!link.url}
                onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                className={`rounded-md border px-3 py-1.5 text-sm transition ${
                  link.active
                    ? 'border-white/40 bg-primary text-primary-foreground'
                    : link.url
                      ? 'hover:bg-muted'
                      : 'cursor-not-allowed text-muted-foreground opacity-50'
                }`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Laporan Kejadian Risiko</DialogTitle>
            <DialogDescription>Tinjau kejadian dan perbarui status tindak lanjut.</DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">Pelapor:</span> {detail.nama_lengkap}</p>
                {detail.email && <p><span className="text-muted-foreground">Email:</span> {detail.email}</p>}
                {detail.no_hp && <p><span className="text-muted-foreground">No. HP:</span> {detail.no_hp}</p>}
                {!isAdminOrSuperAdmin && detail.opd && <p><span className="text-muted-foreground">OPD:</span> {detail.opd.nama}</p>}
                <p><span className="text-muted-foreground">Waktu Kejadian:</span> {detail.waktu_kejadian}</p>
                {detail.tempat && <p><span className="text-muted-foreground">Tempat:</span> {detail.tempat}</p>}
              </div>

              {isAdminOrSuperAdmin && (
                <div className="space-y-1.5">
                  <Label>OPD Terkait</Label>
                  <p className="text-xs text-muted-foreground">
                    Field ini opsional saat pelapor mengisi form — lengkapi/koreksi di sini. PIC OPD yang dipilih
                    akan otomatis dinotifikasi.
                  </p>
                  <div className="flex gap-2">
                    <Select value={opdEdit || 'none'} onValueChange={(v) => setOpdEdit(v === 'none' ? '' : v)}>
                      <SelectTrigger className="flex-1">
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
                    <Button
                      type="button"
                      size="sm"
                      disabled={savingOpd || opdEdit === (detail.opd ? String(detail.opd.id) : '')}
                      onClick={simpanOpd}
                    >
                      Simpan
                    </Button>
                  </div>
                </div>
              )}
              <div>
                <Label className="text-xs text-muted-foreground">Kejadian</Label>
                <p className="text-sm">{detail.kejadian}</p>
              </div>
              {detail.pemicu && (
                <div>
                  <Label className="text-xs text-muted-foreground">Pemicu</Label>
                  <p className="text-sm">{detail.pemicu}</p>
                </div>
              )}
              {detail.risiko_terdaftar_tipe && (
                <div className="rounded-md border border-dashed p-2">
                  <Label className="text-xs text-muted-foreground">
                    Terkait Risiko Terdaftar ({TIPE_LABEL[detail.risiko_terdaftar_tipe] ?? detail.risiko_terdaftar_tipe})
                  </Label>
                  <p className="text-sm">
                    {detail.risiko_terdaftar_uraian ?? (
                      <span className="text-muted-foreground italic">
                        Data risiko tidak ditemukan (mungkin sudah dihapus).
                      </span>
                    )}
                  </p>
                </div>
              )}

              <div className="space-y-2 border-t pt-3">
                <Label>Input ke Register Risiko</Label>
                <p className="text-xs text-muted-foreground">
                  Buka form terkait di tab baru dengan Uraian Risiko/OPD/Pemicu sudah terisi otomatis dari laporan
                  ini — lengkapi sisa penilaian risiko lalu simpan seperti biasa.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => bukaFormRisiko(detail, 'irs_pemda')}>
                    IRS Pemda
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => bukaFormRisiko(detail, 'irs_pd')}>
                    IRS PD
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => bukaFormRisiko(detail, 'iro_pd')}>
                    IRO PD
                  </Button>
                </div>
              </div>

              {isAdminOrSuperAdmin && !detail.risiko_terdaftar_tipe && (
                <div className="space-y-2 border-t pt-3">
                  <Label>Tautkan ke Risiko Terdaftar</Label>
                  <p className="text-xs text-muted-foreground">
                    Kalau risikonya baru saja didaftarkan lewat tombol "Input ke Register Risiko" di atas, cari &amp;
                    tautkan di sini — laporan ini akan bisa dicatat ke Form 10 setelah tertaut.
                  </p>
                  <div className="relative">
                    <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-8"
                      placeholder="Ketik uraian risiko, nama OPD, pemilik risiko, atau penanggung jawab..."
                      value={cariRisikoQuery}
                      onChange={(e) => cariRisikoTerdaftar(e.target.value)}
                      disabled={savingRisikoTerdaftar}
                    />
                    {cariRisikoSearching && <p className="mt-1 text-xs text-muted-foreground">Mencari...</p>}
                    {cariRisikoHasil.length > 0 && (
                      <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border bg-popover shadow-md">
                        {cariRisikoHasil.map((r) => (
                          <button
                            key={`${r.tipe}-${r.id}`}
                            type="button"
                            onClick={() => tautkanRisikoTerdaftar(r)}
                            className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                          >
                            <p className="font-medium">{r.uraian_risiko}</p>
                            <p className="text-xs text-muted-foreground">
                              {TIPE_LABEL[r.tipe]} {r.opd ? `· ${r.opd}` : ''}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {detail.risiko_terdaftar_tipe && (
                <div className="space-y-2 border-t pt-3">
                  <Label>Catat ke Form 10 (Pencatatan Kejadian Risiko)</Label>
                  <p className="text-xs text-muted-foreground">
                    Buka Form 10 di tab baru dengan risiko, tanggal, sebab, dan dampak sudah terisi otomatis dari
                    laporan ini — petugas tetap meninjau &amp; melengkapi sebelum menyimpan.
                  </p>
                  <Button type="button" size="sm" onClick={() => bukaFormCatat10(detail)}>
                    <FileCheck2 className="mr-1.5 h-3.5 w-3.5" />
                    {detail.sudah_dicatat_form10 ? 'Lihat di Form 10' : 'Catat ke Form 10'}
                  </Button>
                </div>
              )}

              <div className="space-y-2 border-t pt-3">
                <Label>Status Tindak Lanjut</Label>
                <Select value={tindakLanjut.status} onValueChange={(v) => setTindakLanjut((p) => ({ ...p, status: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s] ?? s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Label>Catatan Tindak Lanjut</Label>
                <Textarea
                  rows={3}
                  value={tindakLanjut.catatan}
                  onChange={(e) => setTindakLanjut((p) => ({ ...p, catatan: e.target.value }))}
                  placeholder="Catatan tindak lanjut (opsional)..."
                />
                {detail.ditindaklanjuti_oleh && (
                  <p className="text-xs text-muted-foreground">Terakhir ditindaklanjuti oleh {detail.ditindaklanjuti_oleh}</p>
                )}
                <Button type="button" className="w-full" onClick={simpanTindakLanjut}>
                  Simpan Tindak Lanjut
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
