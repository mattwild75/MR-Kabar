import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import FieldInfoPopover from '@/components/ui/field-info-popover';
import { Plus, Edit, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import ArahanPenilaianTab, { type ArahanRow } from './ArahanPenilaianTab';

// Palet warna terbatas & tetap (bukan class dinamis bebas) — supaya semua
// class Tailwind yang mungkin dipakai SELALU muncul literal di source ini,
// tidak hilang kena purge Tailwind saat build produksi (Tailwind men-scan
// source utk string class, class yg cuma ada di data DB tidak akan
// ter-generate CSS-nya).
const WARNA_OPTIONS = [
  { value: 'bg-red-500 text-white', label: 'Merah (Sangat Tinggi)' },
  { value: 'bg-orange-400 text-white', label: 'Oranye (Tinggi)' },
  { value: 'bg-yellow-300 text-black', label: 'Kuning (Sedang)' },
  { value: 'bg-green-400 text-black', label: 'Hijau (Rendah)' },
  { value: 'bg-sky-400 text-white', label: 'Biru Muda (Sangat Rendah)' },
  { value: 'bg-emerald-500 text-white', label: 'Hijau Zamrud' },
  { value: 'bg-amber-500 text-white', label: 'Kuning Tua' },
  { value: 'bg-rose-500 text-white', label: 'Merah Muda' },
  { value: 'bg-violet-500 text-white', label: 'Ungu' },
  { value: 'bg-slate-400 text-white', label: 'Abu-abu' },
];

function warnaPreviewClass(value: string) {
  return value || 'bg-muted';
}

/**
 * Keterangan Selera Risiko, dipakai bersama tab Matriks dan tab Level Risiko
 * supaya keduanya menerangkan hal yang sama persis.
 */
const SELERA_INFO = `Definisi: Selera Risiko (risk appetite) adalah tingkat Risiko yang masih bersedia diterima Pemerintah Kabupaten Aceh Barat tanpa penanganan khusus.

Fungsi: Perdep PPKD 4/2019 menyatakan penetapan area yang menjadi Risiko Prioritas dipengaruhi selera Risiko atau preferensi manajemen pemerintah daerah, dan sisa Risiko harus dibawa ke tingkat yang berada di dalam selera itu. Di aplikasi ini, batas tersebut menentukan Risiko mana yang dihitung sebagai Risiko Prioritas — pada Dasbor, Program Bupati, maupun seluruh Form Cetak.

Cara mengisi: centang kolom "Melampaui Selera" pada Level Risiko yang sudah berada DI LUAR selera. Sekarang yang dicentang Tinggi dan Sangat Tinggi, sehingga selera Risiko sampai dengan tingkat Sedang. Bila kelak selera diperketat, cukup centang juga Sedang — garis putus-putus pada tab Matriks Analisis Risiko akan bergeser sendiri mengikutinya.

Catatan: garis batas itu tidak lurus melainkan bertangga, karena mengikuti bentuk sel-sel yang melampaui selera pada matriks 5x5. Bila tidak ada satu pun level yang dicentang, aplikasi kembali memakai ambang lama (Skala Risiko 16) supaya penetapan Risiko Prioritas tidak berubah diam-diam.`;

interface KriteriaDampakRow {
  id: number;
  level: number;
  label: string | null;
  kerugian_negara: string | null;
  penurunan_reputasi: string | null;
  penurunan_kinerja: string | null;
  gangguan_pelayanan: string | null;
  tuntutan_hukum: string | null;
}

interface KriteriaKemungkinanRow {
  id: number;
  level: number;
  nama: string;
  probabilitas: string | null;
  frekuensi: string | null;
  toleransi: string | null;
}

interface MatrixCellRow {
  id: number;
  dampak: number;
  kemungkinan: number;
  skala_risiko: number;
  warna_class: string;
}

interface RiskLevelRow {
  id: number;
  label: string;
  skala_min: number;
  skala_max: number;
  warna_class: string;
  urutan: number;
  /** Level ini di luar Selera Risiko, sehingga risikonya jadi Risiko Prioritas. */
  melampaui_selera: boolean;
}

/** Keadaan Selera Risiko yang berlaku, dihitung server dari penanda tiap level. */
interface SeleraRisiko {
  /** Skala terkecil yang sudah melampaui selera; null bila belum ada yang ditandai. */
  ambang: number | null;
  label_melampaui: string[];
  /** Level tertinggi yang masih di dalam selera. */
  batas_diterima: string | null;
}

interface JenisRisikoRow {
  id: number;
  kode: string;
  nama: string;
  urutan: number;
}

interface EntitasRow {
  id: number;
  nama: string;
  urutan: number;
}

interface OpdRow {
  id: number;
  nama: string;
}

interface ProgramPembangunanRow {
  id: number;
  nomor: number;
  program_pembangunan: string;
  branding: string | null;
  perangkat_daerah: string;
  misi_urutan: number;
}

/** Visi (1 baris) & Misi (per misi_urutan 1-7) — dibaca LIVE dari tbl_krs_pemda
 *  (kolom VISI/MISI), BUKAN disimpan di program_pembangunan_bupati, supaya selalu
 *  sinkron dengan KRS Pemda (I_a) tanpa perlu diedit dobel. Nilai bisa null kalau
 *  KRS Pemda belum diisi Visi/Misi sama sekali utk Misi tsb. */
interface VisiMisiPemda {
  visi: string | null;
  misi: Record<number, string | null>;
}

interface PageProps {
  tab: string;
  kriteriaDampak: KriteriaDampakRow[];
  kriteriaKemungkinan: KriteriaKemungkinanRow[];
  matrixCells: MatrixCellRow[];
  riskLevels: RiskLevelRow[];
  jenisRisiko: JenisRisikoRow[];
  entitasPenilai: EntitasRow[];
  opdList: OpdRow[];
  programPembangunan: ProgramPembangunanRow[];
  visiMisiPemda: VisiMisiPemda;
  seleraRisiko: SeleraRisiko;
  arahanPenilaian: ArahanRow[];
  jenisArahanLabel: Record<string, string>;
}

const TABS = [
  { id: 'kriteria_dampak', label: 'Kriteria Dampak' },
  { id: 'kriteria_kemungkinan', label: 'Kriteria Kemungkinan' },
  { id: 'matriks', label: 'Matriks Analisis Risiko' },
  { id: 'level_risiko', label: 'Tabel Level Risiko' },
  { id: 'jenis_risiko', label: 'Jenis Risiko' },
  { id: 'entitas_penilai', label: 'Entitas Penilai Risiko' },
  { id: 'opd', label: 'Seluruh OPD' },
  { id: 'arahan_penilaian', label: 'Arahan & Jadwal Penilaian' },
  { id: 'program_pembangunan', label: '100 Program Pembangunan Bupati' },
] as const;

export default function KeteranganPendukungIndex({ tab, kriteriaDampak, kriteriaKemungkinan, matrixCells, riskLevels, jenisRisiko, entitasPenilai, opdList, programPembangunan, visiMisiPemda, seleraRisiko, arahanPenilaian, jenisArahanLabel }: PageProps) {
  const [activeTab, setActiveTab] = useState<string>(tab || 'kriteria_dampak');

  const switchTab = (id: string) => {
    setActiveTab(id);
    router.get('/keterangan-pendukung', { tab: id }, { preserveState: true, preserveScroll: true, replace: true });
  };

  return (
    <AppLayout>
      <Head title="Keterangan Pendukung" />

      <div className="space-y-4 p-4">
        <div>
          <h1 className="text-2xl font-semibold">Keterangan Pendukung</h1>
          <p className="text-sm text-muted-foreground">
            Kelola data referensi yang dipakai form Identifikasi Risiko (IRS Pemda/PD, IRO PD) — Kriteria Dampak,
            Kriteria Kemungkinan, Matriks Analisis Risiko (termasuk warnanya), Tabel Level Risiko, Jenis Risiko,
            Entitas Penilai Risiko, dan daftar OPD. Perubahan di sini langsung berlaku di seluruh form terkait.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 border-b pb-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => switchTab(t.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === t.id ? 'bg-sky-500/15 text-foreground ring-1 ring-sky-500/30' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'kriteria_dampak' && <KriteriaDampakTab rows={kriteriaDampak} />}
        {activeTab === 'kriteria_kemungkinan' && <KriteriaKemungkinanTab rows={kriteriaKemungkinan} />}
        {activeTab === 'matriks' && <MatriksTab cells={matrixCells} selera={seleraRisiko} />}
        {activeTab === 'level_risiko' && <LevelRisikoTab rows={riskLevels} selera={seleraRisiko} />}
        {activeTab === 'arahan_penilaian' && (
          <ArahanPenilaianTab rows={arahanPenilaian} jenisLabel={jenisArahanLabel} />
        )}
        {activeTab === 'jenis_risiko' && <JenisRisikoTab rows={jenisRisiko} />}
        {activeTab === 'entitas_penilai' && <EntitasPenilaiTab rows={entitasPenilai} />}
        {activeTab === 'opd' && <OpdTab rows={opdList} />}
        {activeTab === 'program_pembangunan' && <ProgramPembangunanTab rows={programPembangunan} visiMisiPemda={visiMisiPemda} />}
      </div>
    </AppLayout>
  );
}

// ── Tab: Kriteria Dampak ────────────────────────────────────────────────
function KriteriaDampakTab({ rows }: { rows: KriteriaDampakRow[] }) {
  const [editing, setEditing] = useState<KriteriaDampakRow | null>(null);
  const [form, setForm] = useState<Partial<KriteriaDampakRow>>({});
  const [processing, setProcessing] = useState(false);

  const openEdit = (row: KriteriaDampakRow) => {
    setEditing(row);
    setForm(row);
  };

  const save = () => {
    if (!editing) return;
    setProcessing(true);
    router.put(`/keterangan-pendukung/kriteria-dampak/${editing.id}`, form, {
      onSuccess: () => {
        toast.success('Kriteria Dampak berhasil diperbarui.');
        setEditing(null);
      },
      onError: () => toast.error('Gagal memperbarui.'),
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="border px-3 py-2 text-left font-semibold">Level</th>
            <th className="border px-3 py-2 text-left font-semibold">Label</th>
            <th className="border px-3 py-2 text-left font-semibold">Kerugian Negara/Daerah</th>
            <th className="border px-3 py-2 text-left font-semibold">Penurunan Reputasi</th>
            <th className="border px-3 py-2 text-left font-semibold">Penurunan Kinerja</th>
            <th className="border px-3 py-2 text-left font-semibold">Gangguan Pelayanan</th>
            <th className="border px-3 py-2 text-left font-semibold">Tuntutan Hukum</th>
            <th className="border px-3 py-2 text-left font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="border px-3 py-2 align-top text-center">{row.level}</td>
              <td className="border px-3 py-2 align-top">{row.label}</td>
              <td className="border px-3 py-2 align-top max-w-xs">{row.kerugian_negara}</td>
              <td className="border px-3 py-2 align-top max-w-xs">{row.penurunan_reputasi}</td>
              <td className="border px-3 py-2 align-top max-w-xs">{row.penurunan_kinerja}</td>
              <td className="border px-3 py-2 align-top max-w-xs">{row.gangguan_pelayanan}</td>
              <td className="border px-3 py-2 align-top max-w-xs">{row.tuntutan_hukum}</td>
              <td className="border px-3 py-2 align-top">
                <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Kriteria Dampak — Level {editing?.level}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Label</Label>
              <Input value={form.label ?? ''} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Jumlah Kerugian Negara / Daerah</Label>
              <Textarea rows={2} value={form.kerugian_negara ?? ''} onChange={(e) => setForm((f) => ({ ...f, kerugian_negara: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Penurunan Reputasi</Label>
              <Textarea rows={2} value={form.penurunan_reputasi ?? ''} onChange={(e) => setForm((f) => ({ ...f, penurunan_reputasi: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Penurunan Kinerja</Label>
              <Textarea rows={2} value={form.penurunan_kinerja ?? ''} onChange={(e) => setForm((f) => ({ ...f, penurunan_kinerja: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Gangguan Terhadap Pelayanan</Label>
              <Textarea rows={2} value={form.gangguan_pelayanan ?? ''} onChange={(e) => setForm((f) => ({ ...f, gangguan_pelayanan: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Jumlah Tuntutan Hukum</Label>
              <Textarea rows={2} value={form.tuntutan_hukum ?? ''} onChange={(e) => setForm((f) => ({ ...f, tuntutan_hukum: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Batal</Button>
            <Button onClick={save} disabled={processing}>
              <Save className="mr-2 h-4 w-4" />
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Tab: Kriteria Kemungkinan ────────────────────────────────────────────
function KriteriaKemungkinanTab({ rows }: { rows: KriteriaKemungkinanRow[] }) {
  const [editing, setEditing] = useState<KriteriaKemungkinanRow | null>(null);
  const [form, setForm] = useState<Partial<KriteriaKemungkinanRow>>({});
  const [processing, setProcessing] = useState(false);

  const openEdit = (row: KriteriaKemungkinanRow) => {
    setEditing(row);
    setForm(row);
  };

  const save = () => {
    if (!editing) return;
    setProcessing(true);
    router.put(`/keterangan-pendukung/kriteria-kemungkinan/${editing.id}`, form, {
      onSuccess: () => {
        toast.success('Kriteria Kemungkinan berhasil diperbarui.');
        setEditing(null);
      },
      onError: () => toast.error('Gagal memperbarui.'),
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="border px-3 py-2 text-left font-semibold">Level</th>
            <th className="border px-3 py-2 text-left font-semibold">Nama</th>
            <th className="border px-3 py-2 text-left font-semibold">Probabilitas</th>
            <th className="border px-3 py-2 text-left font-semibold">Frekuensi</th>
            <th className="border px-3 py-2 text-left font-semibold">Toleransi</th>
            <th className="border px-3 py-2 text-left font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="border px-3 py-2 align-top text-center">{row.level}</td>
              <td className="border px-3 py-2 align-top font-medium">{row.nama}</td>
              <td className="border px-3 py-2 align-top max-w-xs">{row.probabilitas}</td>
              <td className="border px-3 py-2 align-top max-w-xs">{row.frekuensi}</td>
              <td className="border px-3 py-2 align-top max-w-xs">{row.toleransi}</td>
              <td className="border px-3 py-2 align-top">
                <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Kriteria Kemungkinan — Level {editing?.level}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Nama</Label>
              <Input value={form.nama ?? ''} onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Probabilitas</Label>
              <Textarea rows={2} value={form.probabilitas ?? ''} onChange={(e) => setForm((f) => ({ ...f, probabilitas: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Frekuensi</Label>
              <Textarea rows={2} value={form.frekuensi ?? ''} onChange={(e) => setForm((f) => ({ ...f, frekuensi: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Toleransi</Label>
              <Textarea rows={2} value={form.toleransi ?? ''} onChange={(e) => setForm((f) => ({ ...f, toleransi: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Batal</Button>
            <Button onClick={save} disabled={processing}>
              <Save className="mr-2 h-4 w-4" />
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Tab: Matriks Analisis Risiko ─────────────────────────────────────────
function MatriksTab({ cells, selera }: { cells: MatrixCellRow[]; selera: SeleraRisiko }) {
  const [editing, setEditing] = useState<MatrixCellRow | null>(null);
  const [form, setForm] = useState<Partial<MatrixCellRow>>({});
  const [processing, setProcessing] = useState(false);

  const openEdit = (cell: MatrixCellRow) => {
    setEditing(cell);
    setForm(cell);
  };

  /** Sel ini sudah di luar Selera Risiko? */
  const diLuarSelera = (dampak: number, kemungkinan: number) => {
    if (selera.ambang === null) return false;
    const c = cells.find((x) => x.dampak === dampak && x.kemungkinan === kemungkinan);
    return c !== undefined && c.skala_risiko >= selera.ambang;
  };

  /**
   * Garis batas Selera Risiko digambar pada tepi antara sel yang melampaui
   * selera dan tetangganya yang belum. Dihitung per tepi, bukan sebagai satu
   * garis lurus, karena batas selera pada matriks memang bertangga — dan
   * dengan begini ia ikut bergeser sendiri begitu penanda level dipindahkan.
   */
  const gayaBatas = (dampak: number, kemungkinan: number): React.CSSProperties => {
    if (!diLuarSelera(dampak, kemungkinan)) return {};

    const garis = '3px dashed var(--batas-selera)';
    const gaya: React.CSSProperties = {};

    // Tetangga kiri = dampak satu tingkat lebih rendah.
    if (!diLuarSelera(dampak - 1, kemungkinan)) gaya.borderLeft = garis;
    // Baris di bawahnya pada tabel = kemungkinan satu tingkat lebih rendah,
    // karena baris diurutkan 5 di atas sampai 1 di bawah.
    if (!diLuarSelera(dampak, kemungkinan - 1)) gaya.borderBottom = garis;

    return gaya;
  };

  const save = () => {
    if (!editing) return;
    setProcessing(true);
    router.put(`/keterangan-pendukung/matriks/${editing.id}`, form, {
      onSuccess: () => {
        toast.success('Sel matriks berhasil diperbarui.');
        setEditing(null);
      },
      onError: () => toast.error('Gagal memperbarui.'),
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        Klik sel untuk mengubah skala risiko dan warnanya. Baris = Kemungkinan (1-5), Kolom = Dampak (1-5).
      </p>

      {/* Batas Selera Risiko. Warnanya lewat custom property supaya garis
          putus-putus tetap terbaca di latar terang maupun gelap tanpa perlu
          menduplikasi seluruh perhitungan tepinya. */}
      <div
        className="mb-3 rounded-md border bg-muted/40 p-3 text-sm [--batas-selera:#b91c1c] dark:[--batas-selera:#fca5a5]"
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span
            aria-hidden
            className="inline-block h-0 w-10 border-t-[3px] border-dashed"
            style={{ borderColor: 'var(--batas-selera)' }}
          />
          <span className="font-medium">Batas Selera Risiko</span>
          <FieldInfoPopover text={SELERA_INFO} />
          {selera.ambang === null ? (
            <span className="text-muted-foreground">
              belum ditetapkan — tandai level mana yang melampaui selera pada tab Tabel Level Risiko
            </span>
          ) : (
            <span className="text-muted-foreground">
              Skala Risiko {selera.ambang} ke atas berada di luar selera
              {selera.batas_diterima ? `, sehingga selera Risiko sampai dengan tingkat ${selera.batas_diterima}` : ''}
              {selera.label_melampaui.length > 0 && ` (${selera.label_melampaui.join(', ')})`}.
            </span>
          )}
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          Risiko yang jatuh di luar garis ini ditetapkan sebagai Risiko Prioritas. Batasnya diatur pada tab{' '}
          <strong>Tabel Level Risiko</strong>, dan garis di bawah ikut bergeser sendiri.
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border [--batas-selera:#b91c1c] dark:[--batas-selera:#fca5a5]">
        <table className="min-w-full border-collapse text-center text-sm">
          <thead>
            <tr>
              <th className="border px-3 py-2" colSpan={2}>Matriks</th>
              <th className="border px-3 py-2" colSpan={5}>Dampak →</th>
            </tr>
            <tr>
              <th className="border px-3 py-2" colSpan={2}>Kemungkinan ↓</th>
              {[1, 2, 3, 4, 5].map((d) => (
                <th key={d} className="border px-3 py-2">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[5, 4, 3, 2, 1].map((kemungkinan) => (
              <tr key={kemungkinan}>
                <th className="border px-3 py-2" colSpan={2}>{kemungkinan}</th>
                {[1, 2, 3, 4, 5].map((dampak) => {
                  const cell = cells.find((c) => c.dampak === dampak && c.kemungkinan === kemungkinan);
                  if (!cell) return <td key={dampak} className="border px-3 py-2">-</td>;
                  const luar = diLuarSelera(dampak, kemungkinan);
                  return (
                    <td
                      key={dampak}
                      onClick={() => openEdit(cell)}
                      style={gayaBatas(dampak, kemungkinan)}
                      title={
                        luar
                          ? `Skala ${cell.skala_risiko} — di luar Selera Risiko, menjadi Risiko Prioritas`
                          : `Skala ${cell.skala_risiko} — masih di dalam Selera Risiko`
                      }
                      className={`cursor-pointer border px-3 py-2 font-semibold transition-opacity hover:opacity-80 ${cell.warna_class}`}
                    >
                      {cell.skala_risiko}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Edit Sel Matriks — Dampak {editing?.dampak}, Kemungkinan {editing?.kemungkinan}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Skala Risiko (1-25)</Label>
              <Input
                type="number"
                min={1}
                max={25}
                value={form.skala_risiko ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, skala_risiko: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Warna</Label>
              <Select value={form.warna_class ?? ''} onValueChange={(v) => setForm((f) => ({ ...f, warna_class: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih warna" />
                </SelectTrigger>
                <SelectContent>
                  {WARNA_OPTIONS.map((w) => (
                    <SelectItem key={w.value} value={w.value}>
                      <span className="flex items-center gap-2">
                        <span className={`inline-block h-3 w-3 rounded-full ${w.value.split(' ')[0]}`} />
                        {w.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className={`mt-1 rounded px-2 py-1 text-center text-sm ${warnaPreviewClass(form.warna_class ?? '')}`}>
                Pratinjau: {form.skala_risiko ?? '-'}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Batal</Button>
            <Button onClick={save} disabled={processing}>
              <Save className="mr-2 h-4 w-4" />
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Tab: Tabel Level Risiko ───────────────────────────────────────────────
function LevelRisikoTab({ rows, selera }: { rows: RiskLevelRow[]; selera: SeleraRisiko }) {
  const [editing, setEditing] = useState<RiskLevelRow | null>(null);
  const [form, setForm] = useState<Partial<RiskLevelRow>>({});
  const [processing, setProcessing] = useState(false);

  const openEdit = (row: RiskLevelRow) => {
    setEditing(row);
    setForm(row);
  };

  const save = () => {
    if (!editing) return;
    setProcessing(true);
    router.put(`/keterangan-pendukung/level-risiko/${editing.id}`, form, {
      onSuccess: () => {
        toast.success('Level Risiko berhasil diperbarui.');
        setEditing(null);
      },
      onError: () => toast.error('Gagal memperbarui.'),
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <div>
      {/* Selera Risiko ditetapkan di sini, dan dipakai seluruh aplikasi untuk
          menentukan mana yang menjadi Risiko Prioritas — termasuk Dasbor,
          Program Bupati, dan Form Cetak. */}
      <div className="mb-3 rounded-md border bg-muted/40 p-3 text-sm">
        <p className="flex flex-wrap items-center gap-1.5 font-medium">
          <span>Selera Risiko:</span>{' '}
          {selera.batas_diterima
            ? `sampai dengan tingkat ${selera.batas_diterima}`
            : selera.ambang === null
              ? 'belum ditetapkan'
              : 'seluruh tingkat melampaui selera'}
          <FieldInfoPopover text={SELERA_INFO} />
        </p>
        <p className="text-muted-foreground mt-1">
          Centang kolom <strong>Melampaui Selera</strong> pada level yang sudah di luar selera Risiko
          Pemerintah Kabupaten Aceh Barat. Risiko pada level bercentang ditetapkan sebagai{' '}
          <strong>Risiko Prioritas</strong>, dan garis putus-putus pada tab{' '}
          <strong>Matriks Analisis Risiko</strong> ikut bergeser sendiri mengikutinya.
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="border px-3 py-2 text-left font-semibold">Label</th>
            <th className="border px-3 py-2 text-left font-semibold">Skala Min</th>
            <th className="border px-3 py-2 text-left font-semibold">Skala Max</th>
            <th className="border px-3 py-2 text-left font-semibold">Melampaui Selera</th>
            <th className="border px-3 py-2 text-left font-semibold">Warna</th>
            <th className="border px-3 py-2 text-left font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="border px-3 py-2 align-top font-medium">
                <Badge className={row.warna_class}>{row.label}</Badge>
              </td>
              <td className="border px-3 py-2 align-top text-center">{row.skala_min}</td>
              <td className="border px-3 py-2 align-top text-center">{row.skala_max}</td>
              <td className="border px-3 py-2 text-center align-top">
                {row.melampaui_selera ? (
                  <span className="rounded border border-red-500/50 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-950/40 dark:text-red-300">
                    Di luar selera
                  </span>
                ) : (
                  <span className="text-muted-foreground text-xs">Dalam selera</span>
                )}
              </td>
              <td className="border px-3 py-2 align-top">
                <span className={`rounded px-2 py-1 text-xs ${row.warna_class}`}>{row.warna_class}</span>
              </td>
              <td className="border px-3 py-2 align-top">
                <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Level Risiko — {editing?.label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Label</Label>
              <Input value={form.label ?? ''} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Skala Min</Label>
                <Input type="number" min={1} max={25} value={form.skala_min ?? ''} onChange={(e) => setForm((f) => ({ ...f, skala_min: Number(e.target.value) }))} />
              </div>
              <div className="space-y-1">
                <Label>Skala Max</Label>
                <Input type="number" min={1} max={25} value={form.skala_max ?? ''} onChange={(e) => setForm((f) => ({ ...f, skala_max: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Warna</Label>
              <Select value={form.warna_class ?? ''} onValueChange={(v) => setForm((f) => ({ ...f, warna_class: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih warna" />
                </SelectTrigger>
                <SelectContent>
                  {WARNA_OPTIONS.map((w) => (
                    <SelectItem key={w.value} value={w.value}>
                      <span className="flex items-center gap-2">
                        <span className={`inline-block h-3 w-3 rounded-full ${w.value.split(' ')[0]}`} />
                        {w.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className={`mt-1 rounded px-2 py-1 text-center text-sm ${warnaPreviewClass(form.warna_class ?? '')}`}>
                Pratinjau: {form.label ?? '-'}
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-md border p-3">
              <Checkbox
                id="melampaui_selera"
                className="mt-0.5"
                checked={!!form.melampaui_selera}
                onCheckedChange={(v) => setForm((f) => ({ ...f, melampaui_selera: v === true }))}
              />
              <Label htmlFor="melampaui_selera" className="cursor-pointer text-sm leading-snug font-normal">
                Level ini melampaui Selera Risiko
                <span className="text-muted-foreground block">
                  Risiko yang jatuh pada level ini menjadi Risiko Prioritas, dan letak garis batas pada
                  matriks ikut menyesuaikan.
                </span>
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Batal</Button>
            <Button onClick={save} disabled={processing}>
              <Save className="mr-2 h-4 w-4" />
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Tab: Jenis Risiko ─────────────────────────────────────────────────────
function JenisRisikoTab({ rows }: { rows: JenisRisikoRow[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<JenisRisikoRow | null>(null);
  const [form, setForm] = useState<Partial<JenisRisikoRow>>({});
  const [processing, setProcessing] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({ kode: '', nama: '', urutan: rows.length + 1 });
    setDialogOpen(true);
  };

  const openEdit = (row: JenisRisikoRow) => {
    setEditing(row);
    setForm(row);
    setDialogOpen(true);
  };

  const save = () => {
    setProcessing(true);
    const url = editing ? `/keterangan-pendukung/jenis-risiko/${editing.id}` : '/keterangan-pendukung/jenis-risiko';
    const method = editing ? router.put : router.post;
    method(url, form, {
      onSuccess: () => {
        toast.success(editing ? 'Jenis Risiko berhasil diperbarui.' : 'Jenis Risiko berhasil ditambahkan.');
        setDialogOpen(false);
      },
      onError: () => toast.error('Gagal menyimpan.'),
      onFinish: () => setProcessing(false),
    });
  };

  const remove = (id: number) => {
    router.delete(`/keterangan-pendukung/jenis-risiko/${id}`, {
      onSuccess: () => toast.success('Jenis Risiko berhasil dihapus.'),
      onError: () => toast.error('Gagal menghapus.'),
    });
  };

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Jenis Risiko
        </Button>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="border px-3 py-2 text-left font-semibold">Kode</th>
              <th className="border px-3 py-2 text-left font-semibold">Nama</th>
              <th className="border px-3 py-2 text-left font-semibold">Urutan</th>
              <th className="border px-3 py-2 text-left font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="border px-3 py-2 align-top">{row.kode}</td>
                <td className="border px-3 py-2 align-top">{row.nama}</td>
                <td className="border px-3 py-2 align-top text-center">{row.urutan}</td>
                <td className="border px-3 py-2 align-top">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Jenis Risiko ini?</AlertDialogTitle>
                          <AlertDialogDescription>"{row.kode} - {row.nama}" akan dihapus permanen.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(row.id)} className="bg-destructive hover:bg-destructive/90">
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit' : 'Tambah'} Jenis Risiko</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Kode</Label>
              <Input value={form.kode ?? ''} onChange={(e) => setForm((f) => ({ ...f, kode: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Nama</Label>
              <Input value={form.nama ?? ''} onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Urutan</Label>
              <Input type="number" value={form.urutan ?? ''} onChange={(e) => setForm((f) => ({ ...f, urutan: Number(e.target.value) }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={save} disabled={processing}>
              <Save className="mr-2 h-4 w-4" />
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Tab: Entitas Penilai Risiko ────────────────────────────────────────────
function EntitasPenilaiTab({ rows }: { rows: EntitasRow[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EntitasRow | null>(null);
  const [form, setForm] = useState<Partial<EntitasRow>>({});
  const [processing, setProcessing] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({ nama: '', urutan: rows.length + 1 });
    setDialogOpen(true);
  };

  const openEdit = (row: EntitasRow) => {
    setEditing(row);
    setForm(row);
    setDialogOpen(true);
  };

  const save = () => {
    setProcessing(true);
    const url = editing ? `/keterangan-pendukung/entitas-penilai/${editing.id}` : '/keterangan-pendukung/entitas-penilai';
    const method = editing ? router.put : router.post;
    method(url, form, {
      onSuccess: () => {
        toast.success(editing ? 'Entitas berhasil diperbarui.' : 'Entitas berhasil ditambahkan.');
        setDialogOpen(false);
      },
      onError: () => toast.error('Gagal menyimpan.'),
      onFinish: () => setProcessing(false),
    });
  };

  const remove = (id: number) => {
    router.delete(`/keterangan-pendukung/entitas-penilai/${id}`, {
      onSuccess: () => toast.success('Entitas berhasil dihapus.'),
      onError: () => toast.error('Gagal menghapus.'),
    });
  };

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Entitas
        </Button>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="border px-3 py-2 text-left font-semibold">Nama</th>
              <th className="border px-3 py-2 text-left font-semibold">Urutan</th>
              <th className="border px-3 py-2 text-left font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="border px-3 py-2 align-top">{row.nama}</td>
                <td className="border px-3 py-2 align-top text-center">{row.urutan}</td>
                <td className="border px-3 py-2 align-top">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Entitas ini?</AlertDialogTitle>
                          <AlertDialogDescription>"{row.nama}" akan dihapus permanen.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(row.id)} className="bg-destructive hover:bg-destructive/90">
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit' : 'Tambah'} Entitas Penilai Risiko</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Nama</Label>
              <Input value={form.nama ?? ''} onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Urutan</Label>
              <Input type="number" value={form.urutan ?? ''} onChange={(e) => setForm((f) => ({ ...f, urutan: Number(e.target.value) }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={save} disabled={processing}>
              <Save className="mr-2 h-4 w-4" />
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Tab: Seluruh OPD ───────────────────────────────────────────────────────
function OpdTab({ rows }: { rows: OpdRow[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<OpdRow | null>(null);
  const [form, setForm] = useState<Partial<OpdRow>>({});
  const [processing, setProcessing] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({ nama: '' });
    setDialogOpen(true);
  };

  const openEdit = (row: OpdRow) => {
    setEditing(row);
    setForm(row);
    setDialogOpen(true);
  };

  const save = () => {
    setProcessing(true);
    const url = editing ? `/keterangan-pendukung/opd/${editing.id}` : '/keterangan-pendukung/opd';
    const method = editing ? router.put : router.post;
    method(url, form, {
      onSuccess: () => {
        toast.success(editing ? 'OPD berhasil diperbarui.' : 'OPD berhasil ditambahkan.');
        setDialogOpen(false);
      },
      onError: () => toast.error('Gagal menyimpan.'),
      onFinish: () => setProcessing(false),
    });
  };

  const remove = (id: number) => {
    router.delete(`/keterangan-pendukung/opd/${id}`, {
      onSuccess: () => toast.success('OPD berhasil dihapus.'),
      onError: () => toast.error('Gagal menghapus.'),
    });
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Daftar OPD ini dipakai combobox "Unit/OPD Penanggung Jawab Pengendalian" di seluruh form IRS/IRO. Berhati-hatilah
          menghapus OPD yang sudah dipakai di data existing.
          <br />
          Total: <span className="font-semibold text-foreground">{rows.length} OPD</span>
        </p>
        <Button onClick={openCreate} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Tambah OPD
        </Button>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="border px-3 py-2 text-left font-semibold w-12">No</th>
              <th className="border px-3 py-2 text-left font-semibold">Nama OPD</th>
              <th className="border px-3 py-2 text-left font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td className="border px-3 py-2 align-top text-muted-foreground">{index + 1}</td>
                <td className="border px-3 py-2 align-top">{row.nama}</td>
                <td className="border px-3 py-2 align-top">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus OPD ini?</AlertDialogTitle>
                          <AlertDialogDescription>
                            "{row.nama}" akan dihapus permanen. Baris data risiko yang sudah memakai OPD ini TIDAK ikut
                            terhapus, tapi kombonya tidak akan tersedia lagi untuk dipilih.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(row.id)} className="bg-destructive hover:bg-destructive/90">
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit' : 'Tambah'} OPD</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Nama OPD</Label>
              <Input value={form.nama ?? ''} onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={save} disabled={processing}>
              <Save className="mr-2 h-4 w-4" />
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Tab: 100 Program Pembangunan Bupati (Tabel 3.7 RPJM 2025-2029) ──────────
// Visi/Misi TIDAK di-hardcode di sini — selalu diambil dari prop
// `visiMisiPemda` (live dari tbl_krs_pemda kolom VISI/MISI, lihat
// KeteranganPendukungController::visiMisiPerMisi()), supaya teks yg
// ditampilkan/dipilih SELALU sinkron dgn KRS Pemda (I_a), termasuk kalau
// nanti Bupati/Wakil Bupati ganti & Visi-Misi RPJM periode berikutnya
// diedit ulang di sana.
const MISI_URUTAN_LIST = [1, 2, 3, 4, 5, 6, 7] as const;

function ProgramPembangunanTab({ rows, visiMisiPemda }: { rows: ProgramPembangunanRow[]; visiMisiPemda: VisiMisiPemda }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProgramPembangunanRow | null>(null);
  const [form, setForm] = useState<Partial<ProgramPembangunanRow>>({});
  const [processing, setProcessing] = useState(false);

  const openCreate = () => {
    setEditing(null);
    const nomorBerikutnya = rows.length > 0 ? Math.max(...rows.map((r) => r.nomor)) + 1 : 1;
    setForm({ nomor: nomorBerikutnya, program_pembangunan: '', branding: '', perangkat_daerah: '', misi_urutan: 1 });
    setDialogOpen(true);
  };

  const openEdit = (row: ProgramPembangunanRow) => {
    setEditing(row);
    setForm(row);
    setDialogOpen(true);
  };

  const save = () => {
    setProcessing(true);
    const url = editing ? `/keterangan-pendukung/program-pembangunan/${editing.id}` : '/keterangan-pendukung/program-pembangunan';
    const method = editing ? router.put : router.post;
    method(url, form, {
      onSuccess: () => {
        toast.success(editing ? 'Program berhasil diperbarui.' : 'Program berhasil ditambahkan.');
        setDialogOpen(false);
      },
      onError: () => toast.error('Gagal menyimpan — pastikan Nomor belum dipakai baris lain.'),
      onFinish: () => setProcessing(false),
    });
  };

  const remove = (id: number) => {
    router.delete(`/keterangan-pendukung/program-pembangunan/${id}`, {
      onSuccess: () => toast.success('Program berhasil dihapus.'),
      onError: () => toast.error('Gagal menghapus.'),
    });
  };

  // Dikelompokkan per Misi sesuai penyajian Tabel 3.7 sumber (RPJM Kabupaten
  // Aceh Barat 2025-2029) — bukan cuma daftar 1-100 datar, supaya struktur
  // Visi/Misi tetap terbaca jelas di UI, bukan hanya tersimpan di data.
  const grouped = MISI_URUTAN_LIST.map((urutan) => ({
    urutan,
    nama: visiMisiPemda.misi[urutan] ?? null,
    rows: rows.filter((r) => r.misi_urutan === urutan).sort((a, b) => a.nomor - b.nomor),
  })).filter((g) => g.rows.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Tabel 3.7 RPJM Kabupaten Aceh Barat Tahun 2025-2029 — 100 Program Pembangunan Pemerintah Kabupaten Aceh
          Barat, dikelompokkan per Misi. Visi &amp; Misi diambil LIVE dari data KRS Pemda (I_a) — mengedit Visi/Misi
          di sana otomatis ikut memperbarui tampilan di tab ini.
          <br />
          Total: <span className="font-semibold text-foreground">{rows.length} / 100 Program</span>
        </p>
        <Button onClick={openCreate} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Program
        </Button>
      </div>

      <div className="rounded-md border bg-muted/30 p-3 text-sm">
        <span className="font-semibold text-foreground">Visi:</span>{' '}
        {visiMisiPemda.visi ?? <span className="italic text-muted-foreground">Belum diisi di KRS Pemda (I_a)</span>}
      </div>

      {grouped.map((g) => (
        <div key={g.urutan} className="space-y-2">
          <p className="rounded-md bg-sky-500/10 px-3 py-1.5 text-sm font-semibold text-foreground ring-1 ring-sky-500/20">
            {g.nama ?? `Misi ${g.urutan} : (belum diisi di KRS Pemda)`}
          </p>
          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="border px-3 py-2 text-left font-semibold w-12">No</th>
                  <th className="border px-3 py-2 text-left font-semibold">Program Pembangunan</th>
                  <th className="border px-3 py-2 text-left font-semibold">Branding</th>
                  <th className="border px-3 py-2 text-left font-semibold">Perangkat Daerah</th>
                  <th className="border px-3 py-2 text-left font-semibold w-20">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {g.rows.map((row) => (
                  <tr key={row.id}>
                    <td className="border px-3 py-2 align-top text-muted-foreground">{row.nomor}</td>
                    <td className="border px-3 py-2 align-top">{row.program_pembangunan}</td>
                    <td className="border px-3 py-2 align-top italic">{row.branding ?? '-'}</td>
                    <td className="border px-3 py-2 align-top">{row.perangkat_daerah}</td>
                    <td className="border px-3 py-2 align-top">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Program No. {row.nomor} ini?</AlertDialogTitle>
                              <AlertDialogDescription>"{row.program_pembangunan}" akan dihapus permanen.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => remove(row.id)} className="bg-destructive hover:bg-destructive/90">
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit' : 'Tambah'} Program Pembangunan</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Nomor</Label>
                <Input
                  type="number"
                  value={form.nomor ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, nomor: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Misi</Label>
                <Select
                  value={form.misi_urutan ? String(form.misi_urutan) : undefined}
                  onValueChange={(v) => setForm((f) => ({ ...f, misi_urutan: Number(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Misi..." />
                  </SelectTrigger>
                  <SelectContent>
                    {MISI_URUTAN_LIST.map((urutan) => (
                      <SelectItem key={urutan} value={String(urutan)}>
                        Misi {urutan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Program Pembangunan</Label>
              <Textarea
                rows={2}
                value={form.program_pembangunan ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, program_pembangunan: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Branding (opsional)</Label>
              <Textarea
                rows={2}
                value={form.branding ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, branding: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Perangkat Daerah</Label>
              <Textarea
                rows={2}
                value={form.perangkat_daerah ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, perangkat_daerah: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Gunakan nama PERSIS seperti yang teregister di tab "Seluruh OPD" — pisahkan dengan ", " bila lebih
                dari satu OPD terlibat.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={save} disabled={processing}>
              <Save className="mr-2 h-4 w-4" />
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
