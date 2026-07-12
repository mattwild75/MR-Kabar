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
import { IRS_PD_FIELD_INFO } from '@/lib/irs-pd-field-info';
import { SUMBER_SEBAB_RISIKO_KATEGORI, C_UC_OPTIONS, KATEGORI_EXISTING_CONTROL_OPTIONS, PENYEBAB_5M_KATEGORI, RESPON_RISIKO_KATEGORI } from '@/lib/irs-reference-data';
import CategorizedTextarea from '@/components/ui/categorized-textarea';
import MultiCategoryTextarea from '@/components/ui/multi-category-textarea';
import RiskEvidenceUploader from '@/components/ui/risk-evidence-uploader';
import RiskCascadeInfo from '@/components/ui/risk-cascade-info';
import StrukturPengelolaanRisikoInfo from '@/components/ui/struktur-pengelolaan-risiko-info';
import OpdFillStatusPanel from '@/components/ui/opd-fill-status-panel';
import TahunAktifBadge from '@/components/ui/tahun-aktif-badge';
import { canManageRow } from '@/lib/ownership';
import { Plus, Edit, Trash2, Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Fragment, useState } from 'react';
import { toast } from 'sonner';

// "NOMOR URUT RISIKO" tidak ada di FIELDS — dihitung otomatis oleh backend
// per kelompok Sasaran Renstra, bukan diinput manual. Sama pola dengan
// irs/Index.tsx (IRS_Pemda), field pertama diganti ke Sasaran Renstra.
const FIELDS = [
  'SASARAN RENSTRA',
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
  sasaranRenstraKodes: Record<string, string>;
  currentUserId: number | null;
  isAdmin: boolean;
  currentUserOpdNama: string | null;
  tahunAktif: string | number;
}

type FormData = Record<FieldName, string> & {
  'SKALA DAMPAK': string;
  'SKALA KEMUNGKINAN': string;
};

const emptyForm = (): FormData => {
  const obj = {} as FormData;
  FIELDS.forEach((f) => (obj[f] = ''));
  obj['SKALA DAMPAK'] = '';
  obj['SKALA KEMUNGKINAN'] = '';
  return obj;
};

function skalaBadgeClass(skala: number | null, riskLevels: RiskLevelRow[]): string {
  if (skala === null) return 'bg-muted text-muted-foreground';
  const level = riskLevels.find((l) => skala >= l.skala_min && skala <= l.skala_max);
  return level ? `${level.warna_class} hover:${level.warna_class.split(' ')[0]}` : 'bg-muted text-muted-foreground';
}

export default function IrsPdIndex({ rows, fieldOptions, opdOptions, opdList, opdFillStatus, jenisRisikoOptions, entitasPenilaiOptions, riskReference, triwulanOptions, triwulanLabels, sasaranRenstraKodes, currentUserId, isAdmin, currentUserOpdNama, tahunAktif }: PageProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<IrsRow | null>(null);
  const [refDialog, setRefDialog] = useState<null | 'jenis' | 'entitas' | 'dampak' | 'kemungkinan' | 'matriks'>(null);

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
    jumpToMatch,
    clearSearch,
    handleKeyDown,
  } = useRowSearch(rows, [...FIELDS, 'SKALA DAMPAK', 'SKALA KEMUNGKINAN', 'SKALA RISIKO', 'SKALA PRIORITAS', 'NOMOR URUT RISIKO']);

  const { sortedRows, sortField, sortDirection, toggleSort } = useSortableRows(rows);

  const VISIBLE_COLUMNS = new Set(['SASARAN RENSTRA', 'URAIAN RISIKO', 'JENIS RISIKO', 'ENTITAS PD YANG MENILAI', 'PEMILIK RISIKO', 'RENCANA TINDAK PENGENDALIAN', 'PENANGGUNG JAWAB PENGENDALIAN', 'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN']);

  const openCreate = () => {
    setEditing(null);
    reset();
    const values = emptyForm();
    if (currentUserOpdNama) {
      values['ENTITAS PD YANG MENILAI'] = currentUserOpdNama;
    }
    values['TAHUN DINILAI RISIKO'] = String(tahunAktif);
    setData(values);
    setDialogOpen(true);
  };

  const openEdit = (row: IrsRow) => {
    setEditing(row);
    const values = emptyForm();
    FIELDS.forEach((f) => (values[f] = (row[f] as string) ?? ''));
    values['SKALA DAMPAK'] = row['SKALA DAMPAK'] != null ? String(row['SKALA DAMPAK']) : '';
    values['SKALA KEMUNGKINAN'] = row['SKALA KEMUNGKINAN'] != null ? String(row['SKALA KEMUNGKINAN']) : '';
    setData(values);
    setDialogOpen(true);
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (editing) {
      put(`/irs_pd/${editing.id}`, {
        onSuccess: () => {
          toast.success('Data berhasil diperbarui.');
          setDialogOpen(false);
        },
        onError: () => toast.error('Gagal memperbarui data.'),
      });
    } else {
      post('/irs_pd', {
        onSuccess: () => {
          toast.success('Data berhasil ditambahkan.');
          setDialogOpen(false);
        },
        onError: () => toast.error('Gagal menambahkan data.'),
      });
    }
  };

  const handleDelete = (id: number) => {
    router.delete(`/irs_pd/${id}`, {
      onSuccess: () => toast.success('Data berhasil dihapus.'),
      onError: () => toast.error('Gagal menghapus data.'),
    });
  };

  return (
    <AppLayout>
      <Head title="II_b_IRS_PD" />

      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">II_b_IRS_PD</h1>
            <p className="text-sm text-muted-foreground">
              Identifikasi Risiko Strategis Perangkat Daerah — analisis risiko terhadap pencapaian Sasaran Renstra.
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

        <div className="max-h-[70vh] overflow-auto rounded-md border">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-muted">
              <tr>
                <th className="border px-3 py-2 text-center font-semibold whitespace-nowrap">No</th>
                <SortableTh field="SASARAN RENSTRA" label="Sasaran Renstra" activeField={sortField} direction={sortDirection} onSort={toggleSort} />
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
                  const hiddenFieldMatches = (matchedFieldsByRow.get(row.id) ?? []).filter((m) => !VISIBLE_COLUMNS.has(m.field));
                  return (
                    <Fragment key={row.id}>
                    <tr
                      ref={(el) => registerRowRef(row.id, el)}
                      className={`border-t hover:bg-muted/10 ${isCurrent ? 'ring-2 ring-inset ring-orange-500' : ''}`}
                    >
                      <td className="border px-3 py-2 align-top text-center">{row['NOMOR URUT RISIKO'] ?? '-'}</td>
                      <td className="border px-3 py-2 align-top whitespace-normal max-w-xs">
                        {sasaranRenstraKodes[String(row['SASARAN RENSTRA'] ?? '')] && (
                          <p className="mb-0.5 text-xs font-medium text-muted-foreground">
                            Kode: {sasaranRenstraKodes[String(row['SASARAN RENSTRA'] ?? '')]}
                          </p>
                        )}
                        <HighlightText text={String(row['SASARAN RENSTRA'] ?? '-')} query={activeQuery} />
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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Data Risiko' : 'Tambah Data Risiko'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3">
            {FIELDS.map((field) => {
              const info = IRS_PD_FIELD_INFO[field];
              const value = data[field];

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
                        uraianPlaceholder="Uraian sumber sebab risiko..."
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
                        uraianPlaceholder="Uraian alasan C/UC..."
                      />
                      {errors[field] && <p className="text-sm text-destructive">{errors[field]}</p>}
                    </div>
                  </div>
                );
              }

              if (field === 'URAIAN PENGENDALIAN YANG SUDAH ADA') {
                const uraianTerisi = value.trim() !== '' && value.trim() !== '-' && value.trim() !== 'Tidak Ada Data';
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
                      rows={2}
                    />
                    {errors[field] && <p className="text-sm text-destructive">{errors[field]}</p>}
                    <p className="text-xs text-muted-foreground">
                      Sesuai PP 60/2008, uraian ini merupakan representasi unsur <em>Kegiatan Pengendalian</em> —
                      kebijakan & prosedur yang membantu memastikan arahan manajemen risiko dilaksanakan.
                    </p>
                    {uraianTerisi && (
                      <p className="rounded-md border border-amber-300 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                        Disarankan unggah bukti dukung (SS/JPG/PNG/PDF) untuk pengendalian yang sudah diuraikan di atas.
                      </p>
                    )}
                    <RiskEvidenceUploader type="irs_pd" rowId={editing?.id ?? null} />
                  </div>
                );
              }

              if (field === 'KATEGORI EXISTING CONTROL') {
                return (
                  <div key={field} className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor={field}>{field}</Label>
                      {info && <FieldInfoPopover text={info} />}
                    </div>
                    <CategorizedTextarea
                      id={field}
                      value={value}
                      onChange={(val) => setData(field, val)}
                      categories={KATEGORI_EXISTING_CONTROL_OPTIONS}
                      uraianPlaceholder="Uraian penilaian efektivitas (opsional)..."
                    />
                    <p className="text-xs text-muted-foreground">
                      E = Efektif, KE = Kurang Efektif, TE = Tidak Efektif — menilai seberapa baik pengendalian
                      yang sudah ada menekan risiko awal (risiko inherent) menjadi risiko residual.
                    </p>
                    {errors[field] && <p className="text-sm text-destructive">{errors[field]}</p>}
                  </div>
                );
              }

              if (field === 'RENCANA TINDAK PENGENDALIAN') {
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
                        categories={RESPON_RISIKO_KATEGORI}
                        uraianPlaceholder="Uraian rencana tindak pengendalian..."
                      />
                      {errors[field] && <p className="text-sm text-destructive">{errors[field]}</p>}
                    </div>
                  </div>
                );
              }

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
                // Aktif global lebih dulu. Beda dgn field Pemda-wide lain
                // (mis. di Data Umum) yg memang harus satu nilai utk semua.
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

              // Sasaran Renstra adalah rujukan ke II_a_KRS_PD — value tetap
              // teks bersih (tanpa kode), kodenya (mis. "1.1.1.1") cuma
              // ditampilkan read-only untuk konteks, dari tbl_krs_irs_pd.
              const kode = field === 'SASARAN RENSTRA' ? sasaranRenstraKodes[value] : undefined;

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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="SKALA DAMPAK">SKALA DAMPAK</Label>
                  {IRS_PD_FIELD_INFO['SKALA DAMPAK'] && <FieldInfoPopover text={IRS_PD_FIELD_INFO['SKALA DAMPAK']} />}
                  <ReferenceDialogTrigger label="Lihat Kriteria Dampak" onClick={() => setRefDialog('dampak')} />
                </div>
                <AutocompleteSelect
                  value={data['SKALA DAMPAK']}
                  onChange={(val) => setData('SKALA DAMPAK', val)}
                  options={['1', '2', '3', '4', '5']}
                  placeholder="Pilih 1-5"
                />
                {errors['SKALA DAMPAK'] && <p className="text-sm text-destructive">{errors['SKALA DAMPAK']}</p>}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="SKALA KEMUNGKINAN">SKALA KEMUNGKINAN</Label>
                  {IRS_PD_FIELD_INFO['SKALA KEMUNGKINAN'] && <FieldInfoPopover text={IRS_PD_FIELD_INFO['SKALA KEMUNGKINAN']} />}
                  <ReferenceDialogTrigger label="Lihat Kriteria Kemungkinan" onClick={() => setRefDialog('kemungkinan')} />
                </div>
                <AutocompleteSelect
                  value={data['SKALA KEMUNGKINAN']}
                  onChange={(val) => setData('SKALA KEMUNGKINAN', val)}
                  options={['1', '2', '3', '4', '5']}
                  placeholder="Pilih 1-5"
                />
                {errors['SKALA KEMUNGKINAN'] && <p className="text-sm text-destructive">{errors['SKALA KEMUNGKINAN']}</p>}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span>Skala Risiko dan Skala Prioritas dihitung otomatis dari Dampak x Kemungkinan.</span>
              <ReferenceDialogTrigger label="Lihat Matriks Analisis Risiko" onClick={() => setRefDialog('matriks')} />
            </div>

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
    </AppLayout>
  );
}
