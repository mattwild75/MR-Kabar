import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
  Activity as ActivityIcon,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  ClipboardList,
  MinusCircle,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

interface RiskLevelBand {
  label: string;
  skala_min: number;
  skala_max: number;
  warna_class: string;
}

interface Ringkasan {
  total_risiko: number;
  risiko_prioritas: number;
  rtp_tersusun: number;
  rtp_dibutuhkan: number;
  opd_patuh: number;
  total_opd_wajib: number;
}

interface TahapDetailItem {
  nama: string;
  selesai: boolean;
  url: string;
}

interface ProgresTahapanItem {
  opd_id: number;
  opd_nama: string;
  tahap_selesai: number;
  total_tahap: number;
  persen: number;
  lengkap: boolean;
  label_tahap_saat_ini: string;
  tahap: TahapDetailItem[];
}

interface DistribusiItem {
  tingkat?: string;
  kategori?: string;
  jumlah: number;
}

interface DistribusiKategoriRisiko {
  id: number;
  tipe: string;
  opd_nama: string;
  uraian_risiko: string;
  skala_risiko: number | null;
  rtp_terisi: boolean;
  url: string;
}

interface DistribusiKategoriItem {
  kategori: string;
  jumlah: number;
  risiko: DistribusiKategoriRisiko[];
}

interface InherenResidualItem {
  id: number;
  tipe: string;
  opd_nama: string;
  kode_risiko: string | null;
  uraian_risiko: string;
  skala_inheren: number;
  skala_residual: number;
  rtp_terisi: boolean;
  url: string;
}

interface RisikoPrioritasItem {
  id: number;
  tipe: string;
  opd_nama: string;
  kode_risiko: string | null;
  uraian_risiko: string;
  skala_risiko: number;
  rtp_status: string;
  rtp_terisi: boolean;
  url: string;
}

interface TrenItem {
  tahun: number;
  sangat_tinggi: number;
  tinggi: number;
}

interface TrenEfektivitasItem {
  tahun: number;
  rata_rata_gap: number | null;
  persen_gap_signifikan: number | null;
  total_dinilai: number;
}

interface RankingOpdItem {
  opd_id: number;
  opd_nama: string;
  total_risiko: number;
  risiko_tinggi: number;
  skor_rata_rata: number | null;
  sampel_kecil: boolean;
}

interface LogKejadianItem {
  sumber: string;
  kategori: 'warga' | 'internal';
  tanggal: string | null;
  opd_nama: string;
  uraian: string;
  status?: string;
}

interface MatrixCellItem {
  dampak: number;
  kemungkinan: number;
  skala_risiko: number;
  warna_class: string;
}

interface MatriksDetailRisiko {
  id: number;
  tipe: string;
  opd_nama: string;
  uraian_risiko: string;
  rtp_terisi: boolean;
  url: string;
}

interface KepatuhanItem {
  opd_id: number;
  opd_nama: string;
  status: 'lengkap' | 'sebagian' | 'belum' | 'n/a';
  monitoring_terisi: number;
  pencatatan_terisi: number;
}

interface ActivityItem {
  deskripsi: string;
  aksi: string | null;
  causer_nama: string;
  subjek: string;
  waktu: string | null;
  waktu_iso: string | null;
}

interface OpdOption {
  id: number;
  nama: string;
}

interface PageProps {
  isAdmin: boolean;
  opdId: number | null;
  opdOptions: OpdOption[];
  tahun: number;
  tahunOptions: number[];
  ringkasan: Ringkasan;
  matriks: Record<string, number>;
  matriksDetail: Record<string, MatriksDetailRisiko[]>;
  matrixCells: MatrixCellItem[];
  riskLevels: RiskLevelBand[];
  progresTahapan: ProgresTahapanItem[];
  distribusiTingkat: DistribusiItem[];
  distribusiKategori: DistribusiKategoriItem[];
  inherenResidual: InherenResidualItem[];
  risikoPrioritas: RisikoPrioritasItem[];
  trenTahunan: TrenItem[];
  trenEfektivitasPengendalian: TrenEfektivitasItem[];
  rankingOpd: RankingOpdItem[];
  logKejadian: LogKejadianItem[];
  kepatuhanForm8910: KepatuhanItem[];
  activityFeed: ActivityItem[];
}

const DONUT_COLORS = ['#0ea5e9', '#f59e0b', '#8b5cf6'];

function badgeForSkala(skala: number, riskLevels: RiskLevelBand[]): string {
  return riskLevels.find((b) => skala >= b.skala_min && skala <= b.skala_max)?.warna_class ?? 'bg-muted text-muted-foreground';
}

/** Adaptasi item widget "Risiko Inheren vs Sisa Risiko" ke bentuk dialog rincian risiko yg sama dipakai widget Peta Risiko & Distribusi Kategori. */
function toMatriksDetailRisiko(r: InherenResidualItem): MatriksDetailRisiko {
  return {
    id: r.id,
    tipe: r.tipe,
    opd_nama: r.opd_nama,
    uraian_risiko: r.uraian_risiko,
    rtp_terisi: r.rtp_terisi,
    url: r.url,
  };
}

/** Adaptasi item widget "Daftar Risiko Prioritas" ke bentuk dialog rincian risiko yg sama dipakai widget lain. */
function prioritasToMatriksDetailRisiko(r: RisikoPrioritasItem): MatriksDetailRisiko {
  return {
    id: r.id,
    tipe: r.tipe,
    opd_nama: r.opd_nama,
    uraian_risiko: r.uraian_risiko,
    rtp_terisi: r.rtp_terisi,
    url: r.url,
  };
}

/** Tooltip custom widget "Risiko Inheren vs Sisa Risiko" — tampilkan OPD + kode risiko (mis. "BLUD RSUD CUT NYAK DHIEN - RSP.26.02.06.02"), bukan cuma nilai bar. */
function InherenResidualTooltip({ active, payload }: { active?: boolean; payload?: { payload: InherenResidualItem }[] }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }
  const item = payload[0].payload;

  return (
    <div className="rounded-md border bg-popover p-3 text-sm text-popover-foreground shadow-md">
      <p className="mb-1 font-medium">
        {item.opd_nama}
        {item.kode_risiko ? ` - ${item.kode_risiko}` : ''}
      </p>
      <p className="mb-2 text-xs text-muted-foreground">{item.uraian_risiko}</p>
      <p className="text-muted-foreground">Inheren : {item.skala_inheren}</p>
      <p className="text-sky-500">Sisa Risiko : {item.skala_residual}</p>
      <p className="text-red-500">Gap (efektivitas pengendalian) : {item.skala_inheren - item.skala_residual}</p>
    </div>
  );
}

/** Baris 1 OPD di widget "Progres Tahapan per UPR" — klik buka daftar 7 tahap, klik salah satu tahap yg belum selesai buka dialog rincian. */
function ProgresTahapanRow({ item, onPilihTahap }: { item: ProgresTahapanItem; onPilihTahap: (tahap: TahapDetailItem) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="w-full space-y-1 rounded-md p-1 -m-1 text-left">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{item.opd_nama}</span>
            <span className="text-xs text-muted-foreground">
              {item.tahap_selesai}/{item.total_tahap} — {item.lengkap ? 'Selesai' : item.label_tahap_saat_ini}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${item.lengkap ? 'bg-green-500' : 'bg-amber-500'}`}
              style={{ width: `${item.persen}%` }}
            />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Rincian tahapan — {item.opd_nama}</p>
        <div className="space-y-1">
          {item.tahap.map((t) => (
            <button
              key={t.nama}
              type="button"
              disabled={t.selesai}
              onClick={() => {
                onPilihTahap(t);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
                t.selesai ? 'text-muted-foreground' : 'hover:bg-muted cursor-pointer'
              }`}
            >
              {t.selesai ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0 text-amber-500" />
              )}
              <span className="flex-1">{t.nama}</span>
              {!t.selesai && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Sel matriks Peta Risiko — klik buka daftar risiko di sel itu, klik salah satu risiko buka dialog rincian. */
function MatrixCell({
  dampak,
  kemungkinan,
  jumlah,
  cell,
  daftarRisiko,
  onPilihRisiko,
}: {
  dampak: number;
  kemungkinan: number;
  jumlah: number;
  cell: MatrixCellItem | undefined;
  daftarRisiko: MatriksDetailRisiko[];
  onPilihRisiko: (risiko: MatriksDetailRisiko) => void;
}) {
  const [open, setOpen] = useState(false);
  const content = (
    <div
      title={`Dampak ${dampak} x Kemungkinan ${kemungkinan} = ${jumlah} risiko (skala ${cell?.skala_risiko ?? '-'})`}
      className={`flex h-14 items-center justify-center rounded-md text-sm font-semibold transition-transform hover:scale-105 ${cell?.warna_class ?? 'bg-muted text-muted-foreground'}`}
    >
      {jumlah > 0 ? jumlah : ''}
    </div>
  );

  if (jumlah === 0) {
    return content;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="w-full">
          {content}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Dampak {dampak} x Kemungkinan {kemungkinan} — skala {cell?.skala_risiko ?? '-'} ({jumlah} risiko)
        </p>
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {daftarRisiko.map((r) => (
            <button
              key={`${r.tipe}-${r.id}`}
              type="button"
              onClick={() => {
                onPilihRisiko(r);
                setOpen(false);
              }}
              className="flex w-full flex-col gap-0.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
            >
              <span className="line-clamp-2 flex-1">{r.uraian_risiko}</span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {r.opd_nama} · {r.tipe}
                {r.rtp_terisi ? (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                ) : (
                  <XCircle className="h-3 w-3 text-amber-500" />
                )}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2 border-t pt-2 text-[11px] leading-snug text-muted-foreground">
          Tanda RTP di sini berlaku untuk risiko manapun (semua skala) — beda dari tahap "RTP Risiko Prioritas" di widget Progres Tahapan yang
          hanya menghitung risiko skala Tinggi/Sangat Tinggi.
        </p>
      </PopoverContent>
    </Popover>
  );
}

export default function Dashboard({
  isAdmin,
  opdId,
  opdOptions,
  tahun,
  tahunOptions,
  ringkasan,
  matriks,
  matriksDetail,
  matrixCells,
  riskLevels,
  progresTahapan,
  distribusiTingkat,
  distribusiKategori,
  inherenResidual,
  risikoPrioritas,
  trenTahunan,
  trenEfektivitasPengendalian,
  rankingOpd,
  logKejadian,
  kepatuhanForm8910,
  activityFeed,
}: PageProps) {
  const kepatuhanTrend = ringkasan.total_opd_wajib > 0 ? Math.round((ringkasan.opd_patuh / ringkasan.total_opd_wajib) * 100) : 0;
  const rtpTrend = ringkasan.rtp_dibutuhkan > 0 ? Math.round((ringkasan.rtp_tersusun / ringkasan.rtp_dibutuhkan) * 100) : 0;
  const matrixCellByPos = new Map(matrixCells.map((c) => [`${c.dampak}-${c.kemungkinan}`, c]));
  const [tahapDetail, setTahapDetail] = useState<{ opdNama: string; tahap: TahapDetailItem } | null>(null);
  const [risikoDetail, setRisikoDetail] = useState<MatriksDetailRisiko | null>(null);
  const [kategoriOpen, setKategoriOpen] = useState<DistribusiKategoriItem | null>(null);
  const [filterLogKejadian, setFilterLogKejadian] = useState<'semua' | 'warga' | 'internal'>('semua');
  const [filterOpdLogKejadian, setFilterOpdLogKejadian] = useState<string>('semua');
  const [filterBulanLogKejadian, setFilterBulanLogKejadian] = useState<string>('semua');
  const [sortLogKejadian, setSortLogKejadian] = useState<'terbaru' | 'terlama'>('terbaru');
  const [filterUserAktivitas, setFilterUserAktivitas] = useState<string>('semua');
  const [filterAksiAktivitas, setFilterAksiAktivitas] = useState<string>('semua');
  const [filterSubjekAktivitas, setFilterSubjekAktivitas] = useState<string>('semua');
  const [sortAktivitas, setSortAktivitas] = useState<'terbaru' | 'terlama'>('terbaru');

  // ── Memoisasi widget Log Kejadian & Aktivitas Terbaru ──
  // Opsi dropdown + hasil filter/sort dihitung ulang tiap render sebelumnya
  // (di dalam IIFE JSX); di-memo di sini agar hanya dihitung ulang saat data
  // sumber atau state filter/sort terkait berubah.
  const logKejadianOpdOptions = useMemo(
    () => Array.from(new Set(logKejadian.map((l) => l.opd_nama))).sort((a, b) => a.localeCompare(b)),
    [logKejadian],
  );
  const logKejadianBulanOptions = useMemo(
    () =>
      Array.from(new Set(logKejadian.filter((l) => l.tanggal).map((l) => l.tanggal!.slice(0, 7)))).sort((a, b) =>
        b.localeCompare(a),
      ),
    [logKejadian],
  );
  const logKejadianFiltered = useMemo(() => {
    let filtered = logKejadian;
    if (filterLogKejadian !== 'semua') filtered = filtered.filter((l) => l.kategori === filterLogKejadian);
    if (filterOpdLogKejadian !== 'semua') filtered = filtered.filter((l) => l.opd_nama === filterOpdLogKejadian);
    if (filterBulanLogKejadian !== 'semua') filtered = filtered.filter((l) => l.tanggal?.slice(0, 7) === filterBulanLogKejadian);
    return [...filtered].sort((a, b) => {
      const cmp = (a.tanggal ?? '').localeCompare(b.tanggal ?? '');
      return sortLogKejadian === 'terbaru' ? -cmp : cmp;
    });
  }, [logKejadian, filterLogKejadian, filterOpdLogKejadian, filterBulanLogKejadian, sortLogKejadian]);

  const aktivitasUserOptions = useMemo(
    () => Array.from(new Set(activityFeed.map((a) => a.causer_nama))).sort((a, b) => a.localeCompare(b)),
    [activityFeed],
  );
  const aktivitasAksiOptions = useMemo(
    () => Array.from(new Set(activityFeed.map((a) => a.aksi).filter((v): v is string => !!v))).sort((a, b) => a.localeCompare(b)),
    [activityFeed],
  );
  const aktivitasSubjekOptions = useMemo(
    () => Array.from(new Set(activityFeed.map((a) => a.subjek))).sort((a, b) => a.localeCompare(b)),
    [activityFeed],
  );
  const aktivitasFiltered = useMemo(() => {
    let filtered = activityFeed;
    if (filterUserAktivitas !== 'semua') filtered = filtered.filter((a) => a.causer_nama === filterUserAktivitas);
    if (filterAksiAktivitas !== 'semua') filtered = filtered.filter((a) => a.aksi === filterAksiAktivitas);
    if (filterSubjekAktivitas !== 'semua') filtered = filtered.filter((a) => a.subjek === filterSubjekAktivitas);
    return [...filtered].sort((a, b) => {
      const cmp = (a.waktu_iso ?? '').localeCompare(b.waktu_iso ?? '');
      return sortAktivitas === 'terbaru' ? -cmp : cmp;
    });
  }, [activityFeed, filterUserAktivitas, filterAksiAktivitas, filterSubjekAktivitas, sortAktivitas]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Dashboard MR Kabar</h1>
            <p className="text-sm text-muted-foreground">Manajemen Risiko Pemerintah Kabupaten Aceh Barat</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isAdmin && (
              <Select
                value={opdId ? String(opdId) : 'semua'}
                onValueChange={(v) => router.get('/dashboard', { tahun, opd_id: v === 'semua' ? undefined : v }, { preserveState: true })}
              >
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="OPD" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua OPD</SelectItem>
                  {opdOptions.map((o) => (
                    <SelectItem key={o.id} value={String(o.id)}>
                      {o.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select
              value={String(tahun)}
              onValueChange={(v) => router.get('/dashboard', { tahun: v, opd_id: opdId ?? undefined }, { preserveState: true })}
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
          </div>
        </div>

        {/* Seksi 1: Ringkasan */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 px-4 py-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Risiko Teridentifikasi</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 py-2 text-3xl font-bold">{ringkasan.total_risiko}</CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 px-4 py-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Risiko Prioritas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 py-2 text-3xl font-bold text-orange-600">{ringkasan.risiko_prioritas}</CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 px-4 py-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">RTP Selesai Disusun</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 py-2">
              <div className="text-3xl font-bold">
                {ringkasan.rtp_tersusun}/{ringkasan.rtp_dibutuhkan}
              </div>
              <p className="text-xs text-muted-foreground">{rtpTrend}% risiko prioritas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 px-4 py-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Kepatuhan Pelaporan</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 py-2">
              <div className="text-3xl font-bold">
                {ringkasan.opd_patuh}/{ringkasan.total_opd_wajib}
              </div>
              <p className="text-xs text-muted-foreground">
                {kepatuhanTrend}% OPD lengkap · {ringkasan.opd_patuh} dari {kepatuhanForm8910.length} OPD terdaftar sudah lengkap RTP & Monev
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Seksi 2: Analisis & Peta Risiko */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Peta Risiko (Matriks Dampak x Probabilitas)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex flex-col justify-between py-1 text-xs text-muted-foreground">
                  {[5, 4, 3, 2, 1].map((k) => (
                    <span key={k} className="flex h-14 items-center">
                      {k}
                    </span>
                  ))}
                </div>
                <div className="grid flex-1 grid-cols-5 gap-1">
                  {[5, 4, 3, 2, 1].map((kemungkinan) =>
                    [1, 2, 3, 4, 5].map((dampak) => (
                      <MatrixCell
                        key={`${kemungkinan}-${dampak}`}
                        dampak={dampak}
                        kemungkinan={kemungkinan}
                        jumlah={matriks[`${kemungkinan}-${dampak}`] ?? 0}
                        cell={matrixCellByPos.get(`${dampak}-${kemungkinan}`)}
                        daftarRisiko={matriksDetail[`${kemungkinan}-${dampak}`] ?? []}
                        onPilihRisiko={setRisikoDetail}
                      />
                    )),
                  )}
                </div>
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">Dampak (sumbu horizontal) x Kemungkinan (sumbu vertikal)</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {riskLevels.map((b) => (
                  <Badge key={b.label} className={b.warna_class}>
                    {b.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Progres Tahapan per UPR</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[420px] space-y-3 overflow-y-auto">
              {progresTahapan.length === 0 && <p className="text-sm text-muted-foreground">Belum ada data OPD.</p>}
              {progresTahapan.map((p) => (
                <ProgresTahapanRow key={p.opd_id} item={p} onPilihTahap={(tahap) => setTahapDetail({ opdNama: p.opd_nama, tahap })} />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Seksi 3: Distribusi Risiko */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribusi per Tingkatan</CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 20, bottom: 0, left: 20 }}>
                  <Pie data={distribusiTingkat} dataKey="jumlah" nameKey="tingkat" cx="50%" cy="50%" innerRadius={45} outerRadius={75} label>
                    {distribusiTingkat.map((_, i) => (
                      <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribusi per Kategori Risiko</CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              {distribusiKategori.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada data.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribusiKategori} layout="vertical" margin={{ left: 24 }}>
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="kategori" width={140} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar
                      dataKey="jumlah"
                      fill="#0ea5e9"
                      radius={[0, 4, 4, 0]}
                      cursor="pointer"
                      onClick={(data) => setKategoriOpen(((data?.payload ?? data) as unknown) as DistribusiKategoriItem)}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risiko Inheren vs Sisa Risiko</CardTitle>
          </CardHeader>
          <CardContent>
            {inherenResidual.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada risiko dengan Skala Inheren terisi.</p>
            ) : (
              <>
                <div className="max-h-[400px] overflow-x-hidden overflow-y-auto">
                  <ResponsiveContainer width="100%" height={Math.max(260, inherenResidual.length * 32)}>
                    <BarChart
                      data={inherenResidual.map((r) => ({ ...r, gap: r.skala_inheren - r.skala_residual }))}
                      layout="vertical"
                      margin={{ top: 5, right: 10, bottom: 5, left: 8 }}
                    >
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis type="category" dataKey="uraian_risiko" width={0} tick={false} />
                      <Tooltip content={<InherenResidualTooltip />} />
                      <Legend />
                      <Bar
                        dataKey="skala_residual"
                        name="Sisa Risiko"
                        stackId="gapStack"
                        fill="#0ea5e9"
                        cursor="pointer"
                        onClick={(data) => setRisikoDetail(toMatriksDetailRisiko(((data?.payload ?? data) as unknown) as InherenResidualItem))}
                      />
                      <Bar
                        dataKey="gap"
                        name="Gap (efektivitas pengendalian)"
                        stackId="gapStack"
                        fill="#dc2626"
                        radius={[0, 4, 4, 0]}
                        cursor="pointer"
                        onClick={(data) => setRisikoDetail(toMatriksDetailRisiko(((data?.payload ?? data) as unknown) as InherenResidualItem))}
                        label={{ position: 'right', fontSize: 11, fill: '#dc2626' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Menampilkan seluruh {inherenResidual.length} risiko yang sudah memiliki Skala Inheren
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Seksi 4: Prioritas & Tren */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="h-full">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Daftar Risiko Prioritas</CardTitle>
              <Badge variant="secondary">{risikoPrioritas.length}</Badge>
            </CardHeader>
            <CardContent>
              {risikoPrioritas.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada risiko prioritas.</p>
              ) : (
                <>
                  <div className="max-h-[420px] space-y-2 overflow-y-auto">
                    {risikoPrioritas.map((r) => (
                      <button
                        key={`${r.tipe}-${r.id}`}
                        type="button"
                        onClick={() => setRisikoDetail(prioritasToMatriksDetailRisiko(r))}
                        className="flex w-full items-start justify-between gap-3 rounded-md border px-3 py-2 text-left hover:bg-muted"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{r.uraian_risiko}</p>
                          <p className="text-xs text-muted-foreground">
                            {r.opd_nama} · {r.tipe}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <Badge className={badgeForSkala(r.skala_risiko, riskLevels)}>Skala {r.skala_risiko}</Badge>
                          <Badge variant={r.rtp_status === 'RTP Tersusun' ? 'default' : 'destructive'}>{r.rtp_status}</Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Menampilkan seluruh {risikoPrioritas.length} risiko prioritas (skala Tinggi/Sangat Tinggi)
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Tren Level Risiko (5 Tahun Terakhir)</CardTitle>
            </CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trenTahunan}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="tahun" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="sangat_tinggi"
                    name="Sangat Tinggi"
                    stroke="#dc2626"
                    fill="#dc2626"
                    fillOpacity={0.25}
                    label={{ position: 'top', fontSize: 11, fill: '#dc2626' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="tinggi"
                    name="Tinggi"
                    stroke="#f97316"
                    fill="#f97316"
                    fillOpacity={0.25}
                    label={{ position: 'top', fontSize: 11, fill: '#f97316' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tren Efektivitas Pengendalian (5 Tahun Terakhir)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {trenEfektivitasPengendalian.every((t) => t.total_dinilai === 0) ? (
              <p className="text-sm text-muted-foreground">Belum ada risiko dengan Skala Inheren terisi.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart data={trenEfektivitasPengendalian}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="tahun" />
                    <YAxis yAxisId="gap" allowDecimals={false} domain={[0, 25]} label={{ value: 'Skala', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                    <YAxis
                      yAxisId="persen"
                      orientation="right"
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                      label={{ value: '%', angle: 90, position: 'insideRight', style: { fontSize: 11 } }}
                    />
                    <Tooltip
                      formatter={(value, name) => [name === 'Cakupan Signifikan' ? `${Number(value).toFixed(2)}%` : value, name]}
                    />
                    <Legend />
                    <Line
                      yAxisId="gap"
                      type="monotone"
                      dataKey="rata_rata_gap"
                      name="Rata-rata Gap"
                      stroke="#22c55e"
                      connectNulls
                      label={{ position: 'bottom', fontSize: 11, fill: '#22c55e' }}
                    />
                    <Line
                      yAxisId="persen"
                      type="monotone"
                      dataKey="persen_gap_signifikan"
                      name="Cakupan Signifikan"
                      stroke="#0ea5e9"
                      connectNulls
                      label={{ position: 'top', fontSize: 11, fill: '#0ea5e9', formatter: (v: number) => `${v.toFixed(2)}%` }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-center text-xs text-muted-foreground">
                  Rata-rata Gap = besaran penurunan skala risiko (Inheren − Sisa Risiko) · Cakupan Signifikan = % risiko dengan gap ≥{' '}
                  {5}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Seksi 5: Kinerja Unit Pemilik Risiko */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {isAdmin && (
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base">Ranking Eksposur Risiko per OPD</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {rankingOpd.length === 0 && <p className="text-sm text-muted-foreground">Belum ada data.</p>}
                {rankingOpd.map((r, i) => {
                  const skor = r.skor_rata_rata;
                  const barColor = skor === null ? 'bg-muted-foreground/30' : skor >= 16 ? 'bg-red-500' : skor >= 8 ? 'bg-amber-500' : 'bg-green-500';
                  const persenExact = skor === null ? 0 : Math.min(100, (skor / 25) * 100);
                  const widthPct = Math.round(persenExact);
                  return (
                    <div key={r.opd_id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 font-medium">
                          #{i + 1} {r.opd_nama}
                          {r.sampel_kecil && (
                            <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
                              Sampel kecil ({r.total_risiko} risiko)
                            </Badge>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {r.risiko_tinggi} tinggi dari {r.total_risiko} · skor {skor ?? '-'}
                        </span>
                      </div>
                      <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${widthPct}%` }} />
                        <span className="absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-medium text-foreground">
                          {persenExact.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          <Card className={isAdmin ? 'h-full' : 'h-full lg:col-span-2'}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Log Kejadian Risiko Terealisasi</CardTitle>
              <div className="flex gap-1">
                {(
                  [
                    ['semua', 'Semua'],
                    ['warga', 'Laporan Warga'],
                    ['internal', 'Pencatatan Internal'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilterLogKejadian(value)}
                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                      filterLogKejadian === value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                const opdOptions = logKejadianOpdOptions;
                const bulanOptions = logKejadianBulanOptions;
                const formatBulan = (ym: string) => {
                  const [y, m] = ym.split('-');
                  const nama = [
                    'Januari',
                    'Februari',
                    'Maret',
                    'April',
                    'Mei',
                    'Juni',
                    'Juli',
                    'Agustus',
                    'September',
                    'Oktober',
                    'November',
                    'Desember',
                  ][Number(m) - 1];
                  return `${nama} ${y}`;
                };

                const filtered = logKejadianFiltered;

                return (
                  <>
                    <div className="mb-3 flex flex-wrap gap-2">
                      <select
                        aria-label="Filter Log Kejadian berdasarkan OPD"
                        value={filterOpdLogKejadian}
                        onChange={(e) => setFilterOpdLogKejadian(e.target.value)}
                        className="rounded-md border bg-background px-2 py-1 text-xs"
                      >
                        <option value="semua">Semua OPD</option>
                        {opdOptions.map((opd) => (
                          <option key={opd} value={opd}>
                            {opd}
                          </option>
                        ))}
                      </select>
                      <select
                        aria-label="Filter Log Kejadian berdasarkan Bulan"
                        value={filterBulanLogKejadian}
                        onChange={(e) => setFilterBulanLogKejadian(e.target.value)}
                        className="rounded-md border bg-background px-2 py-1 text-xs"
                      >
                        <option value="semua">Semua Bulan</option>
                        {bulanOptions.map((ym) => (
                          <option key={ym} value={ym}>
                            {formatBulan(ym)}
                          </option>
                        ))}
                      </select>
                      <select
                        aria-label="Urutkan Log Kejadian"
                        value={sortLogKejadian}
                        onChange={(e) => setSortLogKejadian(e.target.value as 'terbaru' | 'terlama')}
                        className="rounded-md border bg-background px-2 py-1 text-xs"
                      >
                        <option value="terbaru">Terbaru dulu</option>
                        <option value="terlama">Terlama dulu</option>
                      </select>
                    </div>

                    {filtered.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Tidak ada kejadian yang cocok dengan filter.</p>
                    ) : (
                      <>
                        <div className="max-h-[420px] space-y-2 overflow-y-auto">
                          {filtered.map((l, i) => (
                            <div key={`${l.sumber}|${l.opd_nama}|${l.tanggal ?? ''}|${l.uraian}|${i}`} className="flex items-start gap-3 rounded-md border px-3 py-2">
                              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm">{l.uraian}</p>
                                <p className="text-xs text-muted-foreground">
                                  {l.opd_nama} · {l.tanggal ?? '-'} · <Badge variant="outline">{l.sumber}</Badge>
                                  {l.status && ` · ${l.status}`}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="mt-2 text-center text-xs text-muted-foreground">Menampilkan {filtered.length} kejadian</p>
                      </>
                    )}
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </div>

        {/* Seksi 6: Kepatuhan & Aktivitas Sistem */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Kepatuhan Pelaporan (Form 8/9/10)</CardTitle>
            </CardHeader>
            <CardContent className="grid max-h-[420px] grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
              {kepatuhanForm8910.map((k) => {
                const cfg =
                  k.status === 'lengkap'
                    ? { icon: CheckCircle2, cls: 'border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400', label: 'Sudah Lapor' }
                    : k.status === 'sebagian'
                      ? { icon: Clock, cls: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400', label: 'Sebagian' }
                      : k.status === 'n/a'
                        ? { icon: MinusCircle, cls: 'border-muted-foreground/30 bg-muted/40 text-muted-foreground', label: 'Belum Ada Risiko Teridentifikasi' }
                        : { icon: XCircle, cls: 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400', label: 'Belum Lapor' };
                const Icon = cfg.icon;
                return (
                  <div key={k.opd_id} className={`flex items-center gap-2 rounded-md border px-3 py-2 ${cfg.cls}`}>
                    <Icon className="h-4 w-4 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{k.opd_nama}</p>
                      <p className="text-xs opacity-80">{cfg.label}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Aktivitas Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const userOptions = aktivitasUserOptions;
                const aksiOptions = aktivitasAksiOptions;
                const subjekOptions = aktivitasSubjekOptions;
                const filtered = aktivitasFiltered;

                return (
                  <>
                    <div className="mb-3 flex flex-wrap gap-2">
                      <select
                        aria-label="Filter Aktivitas berdasarkan User"
                        value={filterUserAktivitas}
                        onChange={(e) => setFilterUserAktivitas(e.target.value)}
                        className="rounded-md border bg-background px-2 py-1 text-xs"
                      >
                        <option value="semua">Semua User</option>
                        {userOptions.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                      <select
                        aria-label="Filter Aktivitas berdasarkan Aksi"
                        value={filterAksiAktivitas}
                        onChange={(e) => setFilterAksiAktivitas(e.target.value)}
                        className="rounded-md border bg-background px-2 py-1 text-xs"
                      >
                        <option value="semua">Semua Aksi</option>
                        {aksiOptions.map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                      <select
                        aria-label="Filter Aktivitas berdasarkan jenis Data"
                        value={filterSubjekAktivitas}
                        onChange={(e) => setFilterSubjekAktivitas(e.target.value)}
                        className="rounded-md border bg-background px-2 py-1 text-xs"
                      >
                        <option value="semua">Semua Data</option>
                        {subjekOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <select
                        aria-label="Urutkan Aktivitas"
                        value={sortAktivitas}
                        onChange={(e) => setSortAktivitas(e.target.value as 'terbaru' | 'terlama')}
                        className="rounded-md border bg-background px-2 py-1 text-xs"
                      >
                        <option value="terbaru">Terbaru dulu</option>
                        <option value="terlama">Terlama dulu</option>
                      </select>
                    </div>

                    {filtered.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Tidak ada aktivitas yang cocok dengan filter.</p>
                    ) : (
                      <>
                        <div className="max-h-[420px] space-y-2 overflow-y-auto">
                          {filtered.map((a, i) => (
                            <div key={`${a.waktu_iso ?? ''}|${a.causer_nama}|${a.deskripsi}|${i}`} className="flex items-start gap-3 rounded-md border px-3 py-2">
                              <ActivityIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm">
                                  <span className="font-medium">{a.causer_nama}</span> {a.deskripsi}{' '}
                                  <span className="text-muted-foreground">({a.subjek})</span>
                                </p>
                                <p className="text-xs text-muted-foreground">{a.waktu}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="mt-2 text-center text-xs text-muted-foreground">Menampilkan {filtered.length} aktivitas</p>
                      </>
                    )}
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={tahapDetail !== null} onOpenChange={(o) => !o && setTahapDetail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tahapDetail?.tahap.nama}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tahap ini belum lengkap untuk <span className="font-medium text-foreground">{tahapDetail?.opdNama}</span>. Buka form terkait untuk
            melengkapinya.
          </p>
          <DialogFooter>
            {tahapDetail && (
              <a href={tahapDetail.tahap.url} target="_blank" rel="noreferrer">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Buka Form <ChevronRight className="h-4 w-4" />
                </button>
              </a>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={kategoriOpen !== null} onOpenChange={(o) => !o && setKategoriOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{kategoriOpen?.kategori}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">{kategoriOpen?.jumlah} risiko dalam kategori ini</p>
          <div className="max-h-96 space-y-1 overflow-y-auto">
            {kategoriOpen?.risiko.map((r) => (
              <button
                key={`${r.tipe}-${r.id}`}
                type="button"
                onClick={() => {
                  setRisikoDetail({
                    id: r.id,
                    tipe: r.tipe,
                    opd_nama: r.opd_nama,
                    uraian_risiko: r.uraian_risiko,
                    rtp_terisi: r.rtp_terisi,
                    url: r.url,
                  });
                  setKategoriOpen(null);
                }}
                className="flex w-full flex-col gap-0.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
              >
                <span className="line-clamp-2 flex-1">{r.uraian_risiko}</span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {r.opd_nama} · {r.tipe}
                  {r.skala_risiko !== null && ` · skala ${r.skala_risiko}`}
                  {r.rtp_terisi ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-amber-500" />
                  )}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={risikoDetail !== null} onOpenChange={(o) => !o && setRisikoDetail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rincian Risiko</DialogTitle>
          </DialogHeader>
          {risikoDetail && (
            <div className="space-y-3 text-sm">
              <p>{risikoDetail.uraian_risiko}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">{risikoDetail.tipe}</Badge>
                <Badge variant="outline">{risikoDetail.opd_nama}</Badge>
                <span className="flex items-center gap-1">
                  {risikoDetail.rtp_terisi ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> RTP sudah tersusun
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5 text-amber-500" /> RTP belum tersusun
                    </>
                  )}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            {risikoDetail && (
              <a href={risikoDetail.url} target="_blank" rel="noreferrer">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Buka Daftar <ChevronRight className="h-4 w-4" />
                </button>
              </a>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
