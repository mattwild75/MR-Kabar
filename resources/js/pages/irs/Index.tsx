import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import AutocompleteTextarea from '@/components/ui/autocomplete-textarea';
import AutocompleteSelect from '@/components/ui/autocomplete-select';
import FieldInfoPopover from '@/components/ui/field-info-popover';
import ReferenceDialogTrigger from '@/components/ui/reference-dialog-trigger';
import HighlightText from '@/components/ui/highlight-text';
import RtpCategoryText from '@/components/ui/rtp-category-text';
import SortableTh from '@/components/ui/sortable-th';
import { useSortableRows } from '@/hooks/use-sortable-rows';
import { useRowSearch } from '@/hooks/use-row-search';
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
import { IRS_FIELD_INFO } from '@/lib/irs-field-info';
import { SUMBER_SEBAB_RISIKO_KATEGORI, C_UC_OPTIONS, KATEGORI_EXISTING_CONTROL_OPTIONS, KATEGORI_EFEKTIVITAS_OPTIONS, PENYEBAB_5M_KATEGORI, RESPON_RISIKO_KATEGORI, hitungKemungkinanTerkendali, ekstrakKategoriKontrol } from '@/lib/irs-reference-data';
import SkorTargetAktualSection from '@/components/ui/skor-target-aktual-section';
import ExistingControlToggleSection from '@/components/ui/existing-control-toggle-section';
import CategorizedTextarea from '@/components/ui/categorized-textarea';
import MultiCategoryTextarea from '@/components/ui/multi-category-textarea';
import RiskEvidenceUploader from '@/components/ui/risk-evidence-uploader';
import RiskCascadeInfo from '@/components/ui/risk-cascade-info';
import StrukturPengelolaanRisikoInfo from '@/components/ui/struktur-pengelolaan-risiko-info';
import OpdFillStatusPanel from '@/components/ui/opd-fill-status-panel';
import TahunAktifBadge from '@/components/ui/tahun-aktif-badge';
import { canManageRow } from '@/lib/ownership';
import { Plus, Edit, Trash2, Search, X, ChevronUp, ChevronDown, Grid3x3 } from 'lucide-react';
import RiskMatrixPickerDialog from '@/components/ui/risk-matrix-picker-dialog';
import { Fragment, useEffect, useState } from 'react';
import { toast } from 'sonner';

// "NOMOR URUT RISIKO" tidak ada di FIELDS — dihitung otomatis oleh backend
// per kelompok Sasaran RPJMD, bukan diinput manual.
const FIELDS = [
  'SASARAN RPJMD',
  'URAIAN RISIKO',
  'TAHUN DINILAI RISIKO',
  'JENIS RISIKO',
  'ENTITAS PD YANG MENILAI',
  'PEMILIK RISIKO',
  'URAIAN PENYEBAB RISIKO',
  'SUMBER SEBAB RISIKO',
  'C / UC',
  'URAIAN DAMPAK RISIKO',
  'PIHAK YANG TERKENA DAMPAK RISIKO',
  'URAIAN PENGENDALIAN YANG SUDAH ADA',
  'KATEGORI EXISTING CONTROL',
  'CELAH PENGENDALIAN',
  'RENCANA TINDAK PENGENDALIAN',
  'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN',
  'PENANGGUNG JAWAB PENGENDALIAN',
  'TRIWULAN',
  'TAHUN TARGET PENYELESAIAN',
] as const;

type FieldName = (typeof FIELDS)[number];

interface IrsRow {
  id: number;
  [key: string]: string | number | null;
}

interface KriteriaDampakRow {
  level: number;
  label: string | null;
  kerugian_negara: string | null;
  penurunan_reputasi: string | null;
  penurunan_kinerja: string | null;
  gangguan_pelayanan: string | null;
  tuntutan_hukum: string | null;
}

interface KriteriaKemungkinanRow {
  level: number;
  nama: string;
  probabilitas: string | null;
  frekuensi: string | null;
  toleransi: string | null;
}

interface MatrixCell {
  dampak: number;
  kemungkinan: number;
  skala_risiko: number | null;
  warna_class: string;
}

interface RiskLevelRow {
  label: string;
  skala_min: number;
  skala_max: number;
  warna_class: string;
}

interface RiskReference {
  kriteriaDampak: KriteriaDampakRow[];
  kriteriaKemungkinan: KriteriaKemungkinanRow[];
  matriksRisiko: {
    dampakLabels: string[];
    kemungkinanLabels: string[];
    cells: MatrixCell[];
  };
  riskLevels: RiskLevelRow[];
}

interface PageProps {
  rows: IrsRow[];
  fieldOptions: Record<string, string[]>;
  opdOptions: string[];
  opdList: { id: number; nama: string }[];
  opdFillStatus: Record<number, { jumlah_baris: number; sudah_mulai: boolean }>;
  jenisRisikoOptions: string[];
  entitasPenilaiOptions: string[];
  riskReference: RiskReference;
  triwulanOptions: string[];
  triwulanLabels: Record<string, string>;
  sasaranRpjmdKodes: Record<string, string>;
  currentUserId: number | null;
  isAdmin: boolean;
  currentUserOpdNama: string | null;
  tahunAktif: string | number;
}

const EXTRA_SCALE_FIELDS = [
  'SKALA DAMPAK',
  'SKALA KEMUNGKINAN',
  'SKALA DAMPAK INHEREN',
  'SKALA KEMUNGKINAN INHEREN',
  'KATEGORI PROYEKSI RTP',
  'SKALA DAMPAK TARGET',
  'SKALA KEMUNGKINAN TARGET',
] as const;

type FormData = Record<FieldName, string> & Record<(typeof EXTRA_SCALE_FIELDS)[number], string>;

const emptyForm = (): FormData => {
  const obj = {} as FormData;
  FIELDS.forEach((f) => (obj[f] = ''));
  EXTRA_SCALE_FIELDS.forEach((f) => (obj[f] = ''));
  return obj;
};

// Warna badge Skala Risiko sekarang bersumber dari tabel risk_levels (bisa
// diedit Admin/Super Admin lewat Settings > Keterangan Pendukung), bukan
// lagi threshold hardcoded — lihat RiskReferenceDataService::warnaForSkala().
function skalaBadgeClass(skala: number | null, riskLevels: RiskLevelRow[]): string {
  if (skala === null) return 'bg-muted text-muted-foreground';
  const level = riskLevels.find((l) => skala >= l.skala_min && skala <= l.skala_max);
  return level ? `${level.warna_class} hover:${level.warna_class.split(' ')[0]}` : 'bg-muted text-muted-foreground';
}

export default function IrsIndex({ rows, fieldOptions, opdOptions, opdList, opdFillStatus, jenisRisikoOptions, entitasPenilaiOptions, riskReference, triwulanOptions, triwulanLabels, sasaranRpjmdKodes, currentUserId, isAdmin, currentUserOpdNama, tahunAktif }: PageProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<IrsRow | null>(null);
  const [refDialog, setRefDialog] = useState<null | 'jenis' | 'entitas' | 'dampak' | 'kemungkinan' | 'matriks'>(null);
  const [matrixPickerOpen, setMatrixPickerOpen] = useState(false);
  const [existingControlStatus, setExistingControlStatus] = useState<'ya' | 'tidak' | null>(null);
  // true saat form dibuka dari tombol "Input ke Register Risiko" di Rekap
  // Lapor Kejadian — Uraian Risiko/Penyebab/OPD sudah terisi otomatis dari
  // laporan warga, TAPI Sumber Sebab (Internal/Eksternal) & C/UC TIDAK ikut
  // ter-prefill (butuh penilaian manual petugas, tidak bisa ditebak dari
  // laporan warga) — banner ini mengingatkan supaya tidak terlewat.
  const [prefillFromLaporan, setPrefillFromLaporan] = useState(false);

  const { data, setData, post, put, processing, reset, errors } = useForm<FormData>(emptyForm());

  const {
    searchInput,
    setSearchInput,
    activeQuery,
    matches,
    matchedFieldsByRow,
    currentMatchIndex,
    currentMatchId,
    registerRowRef,
    runSearch,
    searchFor,
    highlightRow,
    jumpToMatch,
    clearSearch,
    handleKeyDown,
  } = useRowSearch(rows, [...FIELDS, 'SKALA DAMPAK', 'SKALA KEMUNGKINAN', 'SKALA RISIKO', 'SKALA PRIORITAS', 'NOMOR URUT RISIKO']);

  // Dibuka dari widget rincian risiko Dashboard (tombol "Buka Daftar",
  // ?highlight_id={id}) — langsung scroll+sorot baris tujuan tanpa perlu
  // mengetik apapun di kolom pencarian, sama pola dgn hasil pencarian teks.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const highlightId = params.get('highlight_id');
    if (highlightId) {
      highlightRow(Number(highlightId));
      // Bersihkan highlight_id dari URL (sama pola dgn prefill_uraian_risiko
      // di bawah) supaya refresh halaman tidak memicu sorot ulang.
      params.delete('highlight_id');
      const qs = params.toString();
      window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : ''));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { sortedRows, sortField, sortDirection, toggleSort } = useSortableRows(rows);

  // Kolom yang SUDAH tampil di tabel (dan sudah disorot HighlightText di
  // sel-nya sendiri) — field match selain ini perlu ditampilkan terpisah
  // di bawah baris, karena pengguna tidak akan melihat cuplikannya di
  // mana pun kalau tidak begitu (lihat catatan di PIHAK YANG TERKENA
  // DAMPAK RISIKO yang cuma ada di dialog Edit, bukan kolom tabel).
  const VISIBLE_COLUMNS = new Set(['SASARAN RPJMD', 'URAIAN RISIKO', 'JENIS RISIKO', 'ENTITAS PD YANG MENILAI', 'PEMILIK RISIKO', 'RENCANA TINDAK PENGENDALIAN', 'PENANGGUNG JAWAB PENGENDALIAN', 'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN']);

  const openCreate = () => {
    setEditing(null);
    setPrefillFromLaporan(false);
    reset();
    const values = emptyForm();
    if (currentUserOpdNama) {
      values['ENTITAS PD YANG MENILAI'] = currentUserOpdNama;
    }
    values['TAHUN DINILAI RISIKO'] = String(tahunAktif);
    setData(values);
    setDialogOpen(true);
  };

  // Prefill dari tombol "Input ke Register Risiko" di Rekap Lapor Kejadian
  // Risiko (lihat lapor-kejadian/Rekap.tsx) — dibaca sekali saat mount, lalu
  // query string dibersihkan dari URL supaya tidak ter-prefill ulang kalau
  // halaman di-refresh manual.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uraian = params.get('prefill_uraian_risiko');
    if (!uraian) return;

    openCreate();
    setData((prev) => ({
      ...prev,
      'URAIAN RISIKO': uraian,
      'URAIAN PENYEBAB RISIKO': params.get('prefill_penyebab_risiko') ?? '',
      'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN': params.get('prefill_opd') ?? '',
    }));
    setPrefillFromLaporan(true);

    window.history.replaceState({}, '', window.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEdit = (row: IrsRow) => {
    setEditing(row);
    setPrefillFromLaporan(false);
    const values = emptyForm();
    FIELDS.forEach((f) => (values[f] = (row[f] as string) ?? ''));
    EXTRA_SCALE_FIELDS.forEach((f) => (values[f] = row[f] != null ? String(row[f]) : ''));
    setData(values);
    setDialogOpen(true);
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (editing) {
      put(`/irs_pemda/${editing.id}`, {
        onSuccess: () => {
          toast.success('Data berhasil diperbarui.');
          setDialogOpen(false);
        },
        onError: () => toast.error('Gagal memperbarui data.'),
      });
    } else {
      post('/irs_pemda', {
        onSuccess: () => {
          toast.success('Data berhasil ditambahkan.');
          setDialogOpen(false);
        },
        onError: () => toast.error('Gagal menambahkan data.'),
      });
    }
  };

  const handleDelete = (id: number) => {
    router.delete(`/irs_pemda/${id}`, {
      onSuccess: () => toast.success('Data berhasil dihapus.'),
      onError: () => toast.error('Gagal menghapus data.'),
    });
  };

  return (
    <AppLayout>
      <Head title="I_b_IRS_Pemda" />

      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">I_b_IRS_Pemda</h1>
            <p className="text-sm text-muted-foreground">
              Identifikasi Risiko Strategis Pemda — analisis risiko terhadap pencapaian Sasaran RPJMD.
            </p>
            <div className="mt-2">
              <TahunAktifBadge tahunAktif={tahunAktif} editable={isAdmin} />
            </div>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Data
          </Button>
        </div>

        <RiskCascadeInfo />
        <StrukturPengelolaanRisikoInfo />

        {isAdmin && (
          <OpdFillStatusPanel
            opdOptions={opdList}
            opdStatus={opdFillStatus}
            onSelect={searchFor}
            selectedOpdNama={searchInput}
          />
        )}

        <div className="flex items-center gap-2">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Cari di semua kolom data risiko... (Enter untuk cari/lanjut)"
              className="pr-9 pl-9"
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button type="button" onClick={runSearch}>
            Cari
          </Button>
          {activeQuery && matches.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="mr-1 text-sm text-muted-foreground whitespace-nowrap">
                {currentMatchIndex + 1} / {matches.length}
              </span>
              <Button type="button" variant="outline" size="icon" onClick={() => jumpToMatch(currentMatchIndex - 1)}>
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button type="button" variant="outline" size="icon" onClick={() => jumpToMatch(currentMatchIndex + 1)}>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        {activeQuery && (
          <p className="text-sm text-muted-foreground">
            {matches.length > 0 ? `Ditemukan ${matches.length} hasil untuk "${activeQuery}".` : `Tidak ada hasil untuk "${activeQuery}".`}
          </p>
        )}

        {/* Tabel dibungkus card dengan tinggi tetap (mirip jendela diagram
            di halaman Visualisasi Hirarki) — scroll horizontal & vertikal
            terkurung DI DALAM card ini, terpisah dari scroll halaman utama,
            supaya sidebar/layout luar tidak pernah ikut melebar. */}
        <div className="max-h-[70vh] overflow-auto rounded-md border">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-muted">
              <tr>
                <th className="border px-3 py-2 text-center font-semibold whitespace-nowrap">No</th>
                <SortableTh field="SASARAN RPJMD" label="Sasaran RPJMD" activeField={sortField} direction={sortDirection} onSort={toggleSort} />
                <SortableTh field="URAIAN RISIKO" label="Uraian Risiko" activeField={sortField} direction={sortDirection} onSort={toggleSort} />
                <SortableTh field="JENIS RISIKO" label="Jenis Risiko" activeField={sortField} direction={sortDirection} onSort={toggleSort} />
                <SortableTh field="ENTITAS PD YANG MENILAI" label="Entitas PD yang Menilai" activeField={sortField} direction={sortDirection} onSort={toggleSort} className="whitespace-normal max-w-[10rem]" />
                <SortableTh field="PEMILIK RISIKO" label="Pemilik Risiko" activeField={sortField} direction={sortDirection} onSort={toggleSort} />
                <SortableTh field="SKALA RISIKO" label="Skala Risiko" activeField={sortField} direction={sortDirection} onSort={toggleSort} />
                <SortableTh field="SKALA PRIORITAS" label="Prioritas" activeField={sortField} direction={sortDirection} onSort={toggleSort} />
                <SortableTh field="RENCANA TINDAK PENGENDALIAN" label="RTP" activeField={sortField} direction={sortDirection} onSort={toggleSort} />
                <SortableTh field="PENANGGUNG JAWAB PENGENDALIAN" label="Penanggung Jawab Pengendalian" activeField={sortField} direction={sortDirection} onSort={toggleSort} className="whitespace-normal max-w-[10rem]" />
                <SortableTh field="UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN" label="Unit/OPD Penanggung Jawab" activeField={sortField} direction={sortDirection} onSort={toggleSort} className="whitespace-normal max-w-[10rem]" />
                <th className="border px-3 py-2 text-left font-semibold whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.length > 0 ? (
                sortedRows.map((row) => {
                  const skalaRisiko = row['SKALA RISIKO'] != null ? Number(row['SKALA RISIKO']) : null;
                  const isCurrent = currentMatchId === row.id;
                  // Field yang cocok tapi TIDAK ada sebagai kolom tabel di atas —
                  // tanpa ini pengguna tidak akan melihat di mana kata kunci itu
                  // berada kalau kebetulan ada di field seperti "Pihak Terkena
                  // Dampak Risiko" yang cuma muncul di dialog Edit.
                  const hiddenFieldMatches = (matchedFieldsByRow.get(row.id) ?? []).filter((m) => !VISIBLE_COLUMNS.has(m.field));
                  return (
                    <Fragment key={row.id}>
                    <tr
                      ref={(el) => registerRowRef(row.id, el)}
                      className={`border-t hover:bg-muted/10 ${isCurrent ? 'ring-2 ring-inset ring-orange-500' : ''}`}
                    >
                      <td className="border px-3 py-2 align-top text-center">{row['NOMOR URUT RISIKO'] ?? '-'}</td>
                      <td className="border px-3 py-2 align-top whitespace-normal max-w-xs">
                        {sasaranRpjmdKodes[String(row['SASARAN RPJMD'] ?? '')] && (
                          <p className="mb-0.5 text-xs font-medium text-muted-foreground">
                            Kode: {sasaranRpjmdKodes[String(row['SASARAN RPJMD'] ?? '')]}
                          </p>
                        )}
                        <HighlightText text={String(row['SASARAN RPJMD'] ?? '-')} query={activeQuery} />
                      </td>
                      <td className="border px-3 py-2 align-top whitespace-normal max-w-xs">
                        <HighlightText text={String(row['URAIAN RISIKO'] ?? '-')} query={activeQuery} />
                      </td>
                      <td className="border px-3 py-2 align-top">
                        <HighlightText text={String(row['JENIS RISIKO'] ?? '-')} query={activeQuery} />
                      </td>
                      <td className="border px-3 py-2 align-top">
                        <HighlightText text={String(row['ENTITAS PD YANG MENILAI'] ?? '-')} query={activeQuery} />
                      </td>
                      <td className="border px-3 py-2 align-top">
                        <HighlightText text={String(row['PEMILIK RISIKO'] ?? '-')} query={activeQuery} />
                      </td>
                      <td className="border px-3 py-2 align-top text-center">
                        <Badge className={skalaBadgeClass(skalaRisiko, riskReference.riskLevels)}>{skalaRisiko ?? '-'}</Badge>
                      </td>
                      <td className="border px-3 py-2 align-top text-center">{row['SKALA PRIORITAS'] ?? '-'}</td>
                      <td className="border px-3 py-2 align-top whitespace-normal max-w-xs">
                        <RtpCategoryText text={String(row['RENCANA TINDAK PENGENDALIAN'] ?? '-')} query={activeQuery} />
                      </td>
                      <td className="border px-3 py-2 align-top whitespace-normal max-w-xs">
                        <HighlightText text={String(row['PENANGGUNG JAWAB PENGENDALIAN'] ?? '-')} query={activeQuery} />
                      </td>
                      <td className="border px-3 py-2 align-top whitespace-normal max-w-xs">
                        <HighlightText text={String(row['UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN'] ?? '-')} query={activeQuery} />
                      </td>
                      <td className="border px-3 py-2 align-top">
                        {canManageRow(row.user_id as number | null, currentUserId, isAdmin) ? (
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
                                  <AlertDialogTitle>Hapus data risiko ini?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Data risiko "{row['URAIAN RISIKO'] ?? '-'}" akan dihapus permanen.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(row.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Milik PIC lain</span>
                        )}
                      </td>
                    </tr>
                    {hiddenFieldMatches.length > 0 && (
                      <tr className={isCurrent ? 'ring-2 ring-inset ring-orange-500' : ''}>
                        <td colSpan={12} className="border-x border-b bg-orange-50 px-3 py-2 text-xs dark:bg-orange-950/20">
                          {hiddenFieldMatches.map((m) => (
                            <div key={m.field} className="flex flex-wrap items-baseline gap-1">
                              <span className="font-semibold text-muted-foreground">Ditemukan di {m.field}:</span>
                              <span className="whitespace-normal">
                                <HighlightText text={m.snippet} query={activeQuery} />
                              </span>
                            </div>
                          ))}
                        </td>
                      </tr>
                    )}
                    </Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={12} className="p-4 text-center text-sm text-muted-foreground">
                    Tidak ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog Tambah/Edit Data */}
      <Dialog open={dialogOpen} onOpenChange={(open) => open && setDialogOpen(true)}>
        <DialogContent
          className="max-h-[90vh] max-w-2xl overflow-y-auto"
          hideClose
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Data Risiko' : 'Tambah Data Risiko'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3">
            {prefillFromLaporan && (
              <p className="rounded-md border border-amber-300 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                Data ini diambil dari laporan warga — Uraian Risiko, Penyebab (7M+1E), dan OPD sudah terisi otomatis.
                Lengkapi juga <strong>Sumber Sebab Risiko</strong> (Internal/Eksternal) dan <strong>C / UC</strong> di bawah
                sebelum menyimpan — keduanya tidak dapat ditebak dari laporan warga dan butuh penilaian Anda.
              </p>
            )}
            {FIELDS.map((field) => {
              const info = IRS_FIELD_INFO[field];
              const value = data[field];

              // Unit/OPD Penanggung Jawab Pengendalian — institusi yg
              // melaksanakan RTP (bisa berbeda dari Pemilik Risiko, lihat
              // Perdep Bab II.B.4 & Form 6/7). Pakai combobox
              // pilih-dari-daftar-OPD, sama seperti KRS_Pemda.
              if (field === 'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN') {
                return (
                  <div key={field} className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor={field}>{field}</Label>
                      {info && <FieldInfoPopover text={info} />}
                    </div>
                    <AutocompleteSelect value={value} onChange={(val) => setData(field, val)} options={opdOptions} placeholder="Pilih OPD" />
                    {errors[field] && <p className="text-sm text-destructive">{errors[field]}</p>}
                  </div>
                );
              }

              // Penanggung Jawab Pengendalian — JABATAN/pejabat spesifik yg
              // berkompeten & berwenang membangun kontrol tsb (Perdep Form
              // 6/7), levelnya proporsional dgn level risiko: Strategis
              // Pemda -> Kepala Daerah, Strategis OPD -> Kepala OPD,
              // Operasional -> Kabid/Kasubbag. Teks bebas, BUKAN combobox OPD.
              if (field === 'PENANGGUNG JAWAB PENGENDALIAN') {
                return (
                  <div key={field} className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor={field}>{field}</Label>
                      {info && <FieldInfoPopover text={info} />}
                    </div>
                    <AutocompleteTextarea
                      id={field}
                      value={value}
                      onChange={(val) => setData(field, val)}
                      options={fieldOptions[field] ?? []}
                      rows={1}
                    />
                    {errors[field] && <p className="text-sm text-destructive">{errors[field]}</p>}
                  </div>
                );
              }

              // Jenis Risiko: combobox dari 41 kode tetap + tombol lihat daftar lengkap.
              if (field === 'JENIS RISIKO') {
                return (
                  <div key={field} className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor={field}>{field}</Label>
                      {info && <FieldInfoPopover text={info} />}
                      <ReferenceDialogTrigger label="Lihat daftar Jenis Risiko" onClick={() => setRefDialog('jenis')} />
                    </div>
                    <AutocompleteSelect
                      value={value}
                      onChange={(val) => setData(field, val)}
                      options={jenisRisikoOptions}
                      placeholder="Pilih Jenis Risiko"
                      dropdownClassName="w-[32rem] max-w-[90vw]"
                    />
                    {errors[field] && <p className="text-sm text-destructive">{errors[field]}</p>}
                  </div>
                );
              }

              // Entitas PD yang Menilai: combobox dari daftar OPD + tombol lihat daftar lengkap.
              if (field === 'ENTITAS PD YANG MENILAI') {
                return (
                  <div key={field} className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor={field}>{field}</Label>
                      {info && <FieldInfoPopover text={info} />}
                      <ReferenceDialogTrigger label="Lihat daftar Entitas Penilai Risiko" onClick={() => setRefDialog('entitas')} />
                    </div>
                    <AutocompleteSelect
                      value={value}
                      onChange={(val) => setData(field, val)}
                      options={entitasPenilaiOptions}
                      placeholder="Pilih Entitas"
                      dropdownClassName="w-[32rem] max-w-[90vw]"
                    />
                    {errors[field] && <p className="text-sm text-destructive">{errors[field]}</p>}
                  </div>
                );
              }

              // Uraian Penyebab Risiko, Sumber Sebab Risiko, C/UC — layout
              // kiri (label field) / kanan (kontrol pengisian), supaya
              // ketiganya konsisten & hemat ruang vertikal dibanding label
              // di atas kontrol seperti field lain.
              if (field === 'URAIAN PENYEBAB RISIKO') {
                return (
                  <div key={field} className="grid grid-cols-1 gap-2 sm:grid-cols-[12rem_1fr]">
                    <div className="flex items-start gap-1.5 pt-2">
                      <Label htmlFor={field}>{field}</Label>
                      {info && <FieldInfoPopover text={info} />}
                    </div>
                    <div>
                      <MultiCategoryTextarea
                        id={field}
                        value={value}
                        onChange={(val) => setData(field, val)}
                        categories={PENYEBAB_5M_KATEGORI}
                        uraianPlaceholder="Uraian penyebab..."
                      />
                      {errors[field] && <p className="text-sm text-destructive">{errors[field]}</p>}
                    </div>
                  </div>
                );
              }

              if (field === 'SUMBER SEBAB RISIKO') {
                return (
                  <div key={field} className="grid grid-cols-1 gap-2 sm:grid-cols-[12rem_1fr]">
                    <div className="flex items-start gap-1.5 pt-2">
                      <Label htmlFor={field}>{field}</Label>
                      {info && <FieldInfoPopover text={info} />}
                    </div>
                    <div>
                      <MultiCategoryTextarea
                        id={field}
                        value={value}
                        onChange={(val) => setData(field, val)}
                        categories={SUMBER_SEBAB_RISIKO_KATEGORI.filter((c) => c !== 'Internal dan Eksternal')}
                        combinedLabel="Internal dan Eksternal"
                        hideUraian
                      />
                      {errors[field] && <p className="text-sm text-destructive">{errors[field]}</p>}
                    </div>
                  </div>
                );
              }

              if (field === 'C / UC') {
                return (
                  <div key={field} className="grid grid-cols-1 gap-2 sm:grid-cols-[12rem_1fr]">
                    <div className="flex items-center gap-1.5 pt-2">
                      <Label htmlFor={field}>{field}</Label>
                      {info && <FieldInfoPopover text={info} />}
                    </div>
                    <div>
                      <CategorizedTextarea
                        id={field}
                        value={value}
                        onChange={(val) => setData(field, val)}
                        categories={C_UC_OPTIONS}
                        hideUraian
                      />
                      {errors[field] && <p className="text-sm text-destructive">{errors[field]}</p>}
                    </div>
                  </div>
                );
              }

              // Uraian Pengendalian yang Sudah Ada, Kategori Existing
              // Control, Celah Pengendalian, dan Skala Risiko (Inheren +
              // Residual/Current) kini SATU PAKET di bawah toggle "Apakah
              // sudah ada Existing Control?" (ExistingControlToggleSection,
              // dirender di luar loop FIELDS.map ini) — field ini di-skip
              // dari render generic supaya tidak dobel.
              if (field === 'URAIAN PENGENDALIAN YANG SUDAH ADA') {
                return (
                  <ExistingControlToggleSection
                    key="existing-control-toggle"
                    data={data}
                    setData={setData}
                    errors={errors}
                    info={IRS_FIELD_INFO}
                    fieldOptions={fieldOptions}
                    evidenceType="irs_pemda"
                    rowId={editing?.id ?? null}
                    isNewRow={!editing}
                    onToggleChange={setExistingControlStatus}
                  />
                );
              }

              if (field === 'KATEGORI EXISTING CONTROL' || field === 'CELAH PENGENDALIAN') {
                return null;
              }

              // Rencana Tindak Pengendalian — diklasifikasikan ke 5 jenis
              // respon risiko (Avoid/Abate/Mitigate/Share-Transfer/Accept),
              // boleh pilih lebih dari 1 sekaligus (mis. kombinasi Abate +
              // Mitigate) karena satu RTP bisa menyasar frekuensi & dampak
              // sekaligus — lihat FieldInfoPopover utk penjelasan lengkap.
              if (field === 'RENCANA TINDAK PENGENDALIAN') {
                return (
                  <div key={field} className="space-y-2">
                    <div className="flex flex-col items-end gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={existingControlStatus === null}
                        onClick={() => setMatrixPickerOpen(true)}
                      >
                        <Grid3x3 className="mr-1.5 h-3.5 w-3.5" />
                        Isi Nilai Risiko
                      </Button>
                      {existingControlStatus === null && (
                        <p className="text-xs text-muted-foreground">
                          Pilih dulu "Apakah sudah ada Existing Control?" di atas.
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[12rem_1fr]">
                      <div className="flex items-start gap-1.5 pt-2">
                        <Label htmlFor={field}>{field}</Label>
                        {info && <FieldInfoPopover text={info} />}
                      </div>
                      <div>
                        <MultiCategoryTextarea
                          id={field}
                          value={value}
                          onChange={(val) => setData(field, val)}
                          categories={RESPON_RISIKO_KATEGORI}
                          uraianPlaceholder="Uraian rencana tindak pengendalian..."
                        />
                        {errors[field] && <p className="text-sm text-destructive">{errors[field]}</p>}
                      </div>
                    </div>
                  </div>
                );
              }

              // TRIWULAN + TAHUN TARGET PENYELESAIAN digabung jadi satu baris
              // (dropdown Triwulan + input angka Tahun) — pengganti "TARGET
              // WAKTU PENYELESAIAN" yang dulu teks bebas tidak konsisten.
              if (field === 'TRIWULAN') {
                return (
                  <div key={field} className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="TRIWULAN">TRIWULAN</Label>
                        {info && <FieldInfoPopover text={info} />}
                      </div>
                      <AutocompleteSelect
                        value={value ? (triwulanLabels[value] ?? value) : ''}
                        onChange={(val) => {
                          const kode = Object.keys(triwulanLabels).find((k) => triwulanLabels[k] === val);
                          setData('TRIWULAN', kode ?? val);
                        }}
                        options={triwulanOptions.map((k) => triwulanLabels[k] ?? k)}
                        placeholder="Pilih Triwulan"
                      />
                      {errors['TRIWULAN'] && <p className="text-sm text-destructive">{errors['TRIWULAN']}</p>}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="TAHUN TARGET PENYELESAIAN">TAHUN TARGET PENYELESAIAN</Label>
                      </div>
                      <Input
                        id="TAHUN TARGET PENYELESAIAN"
                        type="number"
                        value={data['TAHUN TARGET PENYELESAIAN']}
                        onChange={(e) => setData('TAHUN TARGET PENYELESAIAN', e.target.value)}
                        placeholder="mis. 2026"
                      />
                      {errors['TAHUN TARGET PENYELESAIAN'] && (
                        <p className="text-sm text-destructive">{errors['TAHUN TARGET PENYELESAIAN']}</p>
                      )}
                    </div>
                  </div>
                );
              }

              if (field === 'TAHUN TARGET PENYELESAIAN') {
                return null;
              }

              if (field === 'TAHUN DINILAI RISIKO') {
                // Default-nya ikut Tahun Aktif Pemda (lihat TahunAktifBadge
                // & openCreate()), tapi PIC BEBAS mengganti ke tahun lain
                // saat input — supaya OPD bisa melengkapi data tahun
                // sebelumnya (mis. 2025) tanpa perlu Admin mengubah Tahun
                // Aktif global lebih dulu.
                return (
                  <div key={field} className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor={field}>{field}</Label>
                      {info && <FieldInfoPopover text={info} />}
                    </div>
                    <Input
                      id={field}
                      type="number"
                      value={value}
                      onChange={(e) => setData(field, e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Default mengikuti Tahun Aktif, boleh diganti bila mengisi data tahun lain (mis. tahun sebelumnya).
                    </p>
                    {errors[field] && <p className="text-sm text-destructive">{errors[field]}</p>}
                  </div>
                );
              }

              // Sasaran RPJMD adalah rujukan ke I_a_KRS_Pemda — value yang
              // tersimpan tetap teks bersih (tanpa kode) supaya pencocokan
              // data antar tabel konsisten, tapi kodenya (mis. "1.1.1")
              // ditampilkan read-only di sini untuk konteks, diambil dari
              // tbl_krs_irs_pemda via sasaranRpjmdKodes.
              const kode = field === 'SASARAN RPJMD' ? sasaranRpjmdKodes[value] : undefined;

              return (
                <div key={field} className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor={field}>{field}</Label>
                    {info && <FieldInfoPopover text={info} />}
                    {kode && <span className="text-xs font-medium text-muted-foreground">Kode: {kode}</span>}
                  </div>
                  <AutocompleteTextarea
                    id={field}
                    value={value}
                    onChange={(val) => setData(field, val)}
                    options={fieldOptions[field] ?? []}
                    rows={2}
                  />
                  {errors[field] && <p className="text-sm text-destructive">{errors[field]}</p>}
                </div>
              );
            })}

            <SkorTargetAktualSection data={data} setData={setData} errors={errors} info={IRS_FIELD_INFO} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={processing}>
                {editing ? 'Simpan Perubahan' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Referensi: Jenis Risiko */}
      <Dialog open={refDialog === 'jenis'} onOpenChange={(o) => !o && setRefDialog(null)}>
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Jenis Risiko</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="border px-3 py-2 text-center font-semibold">Kode</th>
                  <th className="border px-3 py-2 text-left font-semibold">Deskripsi</th>
                  <th className="border px-3 py-2 text-center font-semibold">Kode</th>
                  <th className="border px-3 py-2 text-left font-semibold">Deskripsi</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const parsed = jenisRisikoOptions.map((opt) => {
                    const [kode, ...rest] = opt.split(' - ');
                    return { kode, deskripsi: rest.join(' - ') };
                  });
                  const half = Math.ceil(parsed.length / 2);
                  const left = parsed.slice(0, half);
                  const right = parsed.slice(half);

                  return left.map((item, i) => {
                    const pair = right[i];
                    return (
                      <tr key={item.kode}>
                        <td className="border px-3 py-1.5 text-center">{item.kode}</td>
                        <td className="border px-3 py-1.5">{item.deskripsi}</td>
                        <td className="border px-3 py-1.5 text-center">{pair?.kode ?? ''}</td>
                        <td className="border px-3 py-1.5">{pair?.deskripsi ?? ''}</td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Referensi: Entitas Penilai Risiko */}
      <Dialog open={refDialog === 'entitas'} onOpenChange={(o) => !o && setRefDialog(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Entitas Penilai Risiko</DialogTitle>
          </DialogHeader>
          <div className="text-sm">
            {entitasPenilaiOptions.map((opt, i) => (
              <div key={opt} className="flex gap-3 border-b py-1.5">
                <span className="w-6 shrink-0 text-muted-foreground">{i + 1}</span>
                <span>{opt}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Referensi: Kriteria Dampak */}
      <Dialog open={refDialog === 'dampak'} onOpenChange={(o) => !o && setRefDialog(null)}>
        <DialogContent className="max-h-[85vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kriteria Dampak</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="border px-3 py-2 text-left font-semibold">Area Dampak</th>
                  {riskReference.kriteriaDampak.map((row) => (
                    <th key={row.level} className="border px-3 py-2 text-left font-semibold">
                      {row.level} - {row.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {([
                  ['Jumlah Kerugian Negara / Daerah', 'kerugian_negara'],
                  ['Penurunan Reputasi', 'penurunan_reputasi'],
                  ['Penurunan Kinerja', 'penurunan_kinerja'],
                  ['Gangguan Terhadap Pelayanan', 'gangguan_pelayanan'],
                  ['Jumlah Tuntutan Hukum', 'tuntutan_hukum'],
                ] as const).map(([area, field]) => (
                  <tr key={area}>
                    <td className="border px-3 py-2 align-top font-medium">{area}</td>
                    {riskReference.kriteriaDampak.map((row) => (
                      <td key={row.level} className="border px-3 py-2 align-top">
                        {row[field]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Referensi: Kriteria Kemungkinan */}
      <Dialog open={refDialog === 'kemungkinan'} onOpenChange={(o) => !o && setRefDialog(null)}>
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kriteria Kemungkinan</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="border px-3 py-2 text-left font-semibold">No</th>
                  <th className="border px-3 py-2 text-left font-semibold">Level Kemungkinan</th>
                  <th className="border px-3 py-2 text-left font-semibold">Probabilitas</th>
                  <th className="border px-3 py-2 text-left font-semibold">Frekuensi dalam 1 Tahun</th>
                  <th className="border px-3 py-2 text-left font-semibold">Kejadian Toleransi Rendah</th>
                </tr>
              </thead>
              <tbody>
                {riskReference.kriteriaKemungkinan.map((row) => (
                  <tr key={row.level}>
                    <td className="border px-3 py-2 align-top">{row.level}</td>
                    <td className="border px-3 py-2 align-top font-medium">{row.nama}</td>
                    <td className="border px-3 py-2 align-top">{row.probabilitas}</td>
                    <td className="border px-3 py-2 align-top">{row.frekuensi}</td>
                    <td className="border px-3 py-2 align-top">{row.toleransi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Referensi: Matriks Analisis Risiko */}
      <Dialog open={refDialog === 'matriks'} onOpenChange={(o) => !o && setRefDialog(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Matriks Analisis Risiko (5x5)</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-center text-sm">
              <thead>
                <tr>
                  <th className="border px-3 py-2" rowSpan={2} colSpan={2}>
                    Matriks
                  </th>
                  <th className="border px-3 py-2" colSpan={5}>
                    Dampak
                  </th>
                </tr>
                <tr>
                  {riskReference.matriksRisiko.dampakLabels.map((label, i) => (
                    <th key={label} className="border px-3 py-2 font-normal">
                      {i + 1}
                      <br />
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[5, 4, 3, 2, 1].map((kemungkinan, rowPos) => (
                  <tr key={kemungkinan}>
                    {rowPos === 0 && (
                      <th className="border px-3 py-2 font-semibold" rowSpan={5}>
                        Kemungkinan
                      </th>
                    )}
                    <th className="border px-3 py-2 font-normal whitespace-nowrap">
                      {kemungkinan}
                      <br />
                      {riskReference.matriksRisiko.kemungkinanLabels[kemungkinan - 1]}
                    </th>
                    {[1, 2, 3, 4, 5].map((dampak) => {
                      const cell = riskReference.matriksRisiko.cells.find((c) => c.dampak === dampak && c.kemungkinan === kemungkinan);
                      return (
                        <td key={dampak} className={`border px-3 py-2 font-semibold ${cell?.warna_class ?? 'bg-muted'}`}>
                          {cell?.skala_risiko ?? '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      <RiskMatrixPickerDialog
        open={matrixPickerOpen}
        onOpenChange={setMatrixPickerOpen}
        matriks={riskReference.matriksRisiko}
        existingControlDiisi={existingControlStatus === 'ya'}
        nilai={{
          inheren: { dampak: Number(data['SKALA DAMPAK INHEREN']) || null, kemungkinan: Number(data['SKALA KEMUNGKINAN INHEREN']) || null },
          residual: { dampak: Number(data['SKALA DAMPAK']) || null, kemungkinan: Number(data['SKALA KEMUNGKINAN']) || null },
          target: { dampak: Number(data['SKALA DAMPAK TARGET']) || null, kemungkinan: Number(data['SKALA KEMUNGKINAN TARGET']) || null },
        }}
        onPilih={(titik, dampak, kemungkinan) => {
          if (titik === 'inheren' && existingControlStatus === 'tidak') {
            // Tanpa Existing Control — Residual/Current otomatis = Inheren
            // (Skenario B backend), jadi klik sel tulis KEDUA field.
            setData('SKALA DAMPAK INHEREN', String(dampak));
            setData('SKALA KEMUNGKINAN INHEREN', String(kemungkinan));
            setData('SKALA DAMPAK', String(dampak));
            setData('SKALA KEMUNGKINAN', String(kemungkinan));
            return;
          }

          const fieldMap = {
            inheren: ['SKALA DAMPAK INHEREN', 'SKALA KEMUNGKINAN INHEREN'],
            residual: ['SKALA DAMPAK', 'SKALA KEMUNGKINAN'],
            target: ['SKALA DAMPAK TARGET', 'SKALA KEMUNGKINAN TARGET'],
            aktual: null,
          } as const;
          const fields = fieldMap[titik];
          if (!fields) return;
          const [fieldDampak, fieldKemungkinan] = fields;
          setData(fieldDampak, String(dampak));
          setData(fieldKemungkinan, String(kemungkinan));
        }}
      />
    </AppLayout>
  );
}
