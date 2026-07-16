import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Edit, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

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

interface PageProps {
  tab: string;
  kriteriaDampak: KriteriaDampakRow[];
  kriteriaKemungkinan: KriteriaKemungkinanRow[];
  matrixCells: MatrixCellRow[];
  riskLevels: RiskLevelRow[];
  jenisRisiko: JenisRisikoRow[];
  entitasPenilai: EntitasRow[];
  opdList: OpdRow[];
}

const TABS = [
  { id: 'kriteria_dampak', label: 'Kriteria Dampak' },
  { id: 'kriteria_kemungkinan', label: 'Kriteria Kemungkinan' },
  { id: 'matriks', label: 'Matriks Analisis Risiko' },
  { id: 'level_risiko', label: 'Tabel Level Risiko' },
  { id: 'jenis_risiko', label: 'Jenis Risiko' },
  { id: 'entitas_penilai', label: 'Entitas Penilai Risiko' },
  { id: 'opd', label: 'Seluruh OPD' },
] as const;

export default function KeteranganPendukungIndex({ tab, kriteriaDampak, kriteriaKemungkinan, matrixCells, riskLevels, jenisRisiko, entitasPenilai, opdList }: PageProps) {
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
        {activeTab === 'matriks' && <MatriksTab cells={matrixCells} />}
        {activeTab === 'level_risiko' && <LevelRisikoTab rows={riskLevels} />}
        {activeTab === 'jenis_risiko' && <JenisRisikoTab rows={jenisRisiko} />}
        {activeTab === 'entitas_penilai' && <EntitasPenilaiTab rows={entitasPenilai} />}
        {activeTab === 'opd' && <OpdTab rows={opdList} />}
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
function MatriksTab({ cells }: { cells: MatrixCellRow[] }) {
  const [editing, setEditing] = useState<MatrixCellRow | null>(null);
  const [form, setForm] = useState<Partial<MatrixCellRow>>({});
  const [processing, setProcessing] = useState(false);

  const openEdit = (cell: MatrixCellRow) => {
    setEditing(cell);
    setForm(cell);
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
      <div className="overflow-x-auto rounded-md border">
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
                  return (
                    <td
                      key={dampak}
                      onClick={() => openEdit(cell)}
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
function LevelRisikoTab({ rows }: { rows: RiskLevelRow[] }) {
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
    <div className="overflow-x-auto rounded-md border">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="border px-3 py-2 text-left font-semibold">Label</th>
            <th className="border px-3 py-2 text-left font-semibold">Skala Min</th>
            <th className="border px-3 py-2 text-left font-semibold">Skala Max</th>
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
