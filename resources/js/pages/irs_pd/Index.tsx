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
import { ENTITAS_PENILAI_OPTIONS, KRITERIA_DAMPAK, KRITERIA_KEMUNGKINAN, MATRIKS_RISIKO, SUMBER_SEBAB_RISIKO_KATEGORI, C_UC_OPTIONS } from '@/lib/irs-reference-data';
import CategorizedTextarea from '@/components/ui/categorized-textarea';
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
  'CELAH PENGENDALIAN',
  'RENCANA TINDAK PENGENDALIAN',
  'PEMILIK / PENANGGUNGJAWAB',
  'TRIWULAN',
  'TAHUN TARGET PENYELESAIAN',
] as const;

type FieldName = (typeof FIELDS)[number];

interface IrsRow {
  id: number;
  [key: string]: string | number | null;
}

interface PageProps {
  rows: IrsRow[];
  fieldOptions: Record<string, string[]>;
  opdOptions: string[];
  jenisRisikoOptions: string[];
  triwulanOptions: string[];
  triwulanLabels: Record<string, string>;
  sasaranRenstraKodes: Record<string, string>;
  currentUserId: number | null;
  isAdmin: boolean;
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

function skalaBadgeClass(skala: number | null): string {
  if (skala === null) return 'bg-muted text-muted-foreground';
  if (skala >= 20) return 'bg-red-500 text-white hover:bg-red-500';
  if (skala >= 16) return 'bg-orange-400 text-white hover:bg-orange-400';
  if (skala >= 11) return 'bg-yellow-300 text-black hover:bg-yellow-300';
  if (skala >= 6) return 'bg-green-400 text-black hover:bg-green-400';
  return 'bg-sky-400 text-white hover:bg-sky-400';
}

export default function IrsPdIndex({ rows, fieldOptions, opdOptions, jenisRisikoOptions, triwulanOptions, triwulanLabels, sasaranRenstraKodes, currentUserId, isAdmin }: PageProps) {
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
    jumpToMatch,
    clearSearch,
    handleKeyDown,
  } = useRowSearch(rows, [...FIELDS, 'SKALA DAMPAK', 'SKALA KEMUNGKINAN', 'SKALA RISIKO', 'SKALA PRIORITAS', 'NOMOR URUT RISIKO']);

  const VISIBLE_COLUMNS = new Set(['SASARAN RENSTRA', 'URAIAN RISIKO', 'JENIS RISIKO', 'PEMILIK RISIKO']);

  const openCreate = () => {
    setEditing(null);
    reset();
    setData(emptyForm());
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
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Data
          </Button>
        </div>

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

        <div className="overflow-x-auto rounded-md border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="border px-3 py-2 text-center font-semibold whitespace-nowrap">No</th>
                <th className="border px-3 py-2 text-left font-semibold whitespace-nowrap">Sasaran Renstra</th>
                <th className="border px-3 py-2 text-left font-semibold whitespace-nowrap">Uraian Risiko</th>
                <th className="border px-3 py-2 text-left font-semibold whitespace-nowrap">Jenis Risiko</th>
                <th className="border px-3 py-2 text-left font-semibold whitespace-nowrap">Pemilik Risiko</th>
                <th className="border px-3 py-2 text-left font-semibold whitespace-nowrap">Dampak</th>
                <th className="border px-3 py-2 text-left font-semibold whitespace-nowrap">Kemungkinan</th>
                <th className="border px-3 py-2 text-left font-semibold whitespace-nowrap">Skala Risiko</th>
                <th className="border px-3 py-2 text-left font-semibold whitespace-nowrap">Prioritas</th>
                <th className="border px-3 py-2 text-left font-semibold whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((row) => {
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
                      <td className="border px-3 py-2 align-top whitespace-pre-line max-w-xs">
                        {sasaranRenstraKodes[String(row['SASARAN RENSTRA'] ?? '')] && (
                          <p className="mb-0.5 text-xs font-medium text-muted-foreground">
                            Kode: {sasaranRenstraKodes[String(row['SASARAN RENSTRA'] ?? '')]}
                          </p>
                        )}
                        <HighlightText text={String(row['SASARAN RENSTRA'] ?? '-')} query={activeQuery} />
                      </td>
                      <td className="border px-3 py-2 align-top whitespace-pre-line max-w-xs">
                        <HighlightText text={String(row['URAIAN RISIKO'] ?? '-')} query={activeQuery} />
                      </td>
                      <td className="border px-3 py-2 align-top">
                        <HighlightText text={String(row['JENIS RISIKO'] ?? '-')} query={activeQuery} />
                      </td>
                      <td className="border px-3 py-2 align-top">
                        <HighlightText text={String(row['PEMILIK RISIKO'] ?? '-')} query={activeQuery} />
                      </td>
                      <td className="border px-3 py-2 align-top text-center">{row['SKALA DAMPAK'] ?? '-'}</td>
                      <td className="border px-3 py-2 align-top text-center">{row['SKALA KEMUNGKINAN'] ?? '-'}</td>
                      <td className="border px-3 py-2 align-top text-center">
                        <Badge className={skalaBadgeClass(skalaRisiko)}>{skalaRisiko ?? '-'}</Badge>
                      </td>
                      <td className="border px-3 py-2 align-top text-center">{row['SKALA PRIORITAS'] ?? '-'}</td>
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
                        <td colSpan={10} className="border-x border-b bg-orange-50 px-3 py-2 text-xs dark:bg-orange-950/20">
                          {hiddenFieldMatches.map((m) => (
                            <div key={m.field} className="flex flex-wrap items-baseline gap-1">
                              <span className="font-semibold text-muted-foreground">Ditemukan di {m.field}:</span>
                              <span className="whitespace-pre-line">
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
                  <td colSpan={10} className="p-4 text-center text-sm text-muted-foreground">
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

              if (field === 'PEMILIK / PENANGGUNGJAWAB') {
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
                      options={ENTITAS_PENILAI_OPTIONS}
                      placeholder="Pilih Entitas"
                      dropdownClassName="w-[32rem] max-w-[90vw]"
                    />
                    {errors[field] && <p className="text-sm text-destructive">{errors[field]}</p>}
                  </div>
                );
              }

              if (field === 'SUMBER SEBAB RISIKO') {
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
                      categories={SUMBER_SEBAB_RISIKO_KATEGORI}
                      uraianPlaceholder="Uraian sumber sebab risiko..."
                    />
                    {errors[field] && <p className="text-sm text-destructive">{errors[field]}</p>}
                  </div>
                );
              }

              if (field === 'C / UC') {
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
                      categories={C_UC_OPTIONS}
                      uraianPlaceholder="Uraian alasan C/UC..."
                    />
                    {errors[field] && <p className="text-sm text-destructive">{errors[field]}</p>}
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
            {ENTITAS_PENILAI_OPTIONS.map((opt, i) => (
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
                  <th className="border px-3 py-2 text-left font-semibold">1 - Tidak Signifikan</th>
                  <th className="border px-3 py-2 text-left font-semibold">2 - Minor</th>
                  <th className="border px-3 py-2 text-left font-semibold">3 - Moderat</th>
                  <th className="border px-3 py-2 text-left font-semibold">4 - Signifikan</th>
                  <th className="border px-3 py-2 text-left font-semibold">5 - Sangat Signifikan</th>
                </tr>
              </thead>
              <tbody>
                {KRITERIA_DAMPAK.map((row) => (
                  <tr key={row.area}>
                    <td className="border px-3 py-2 align-top font-medium">{row.area}</td>
                    {row.levels.map((level, i) => (
                      <td key={i} className="border px-3 py-2 align-top">
                        {level}
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
                {KRITERIA_KEMUNGKINAN.map((row) => (
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
                  {MATRIKS_RISIKO.dampakLabels.map((label, i) => (
                    <th key={label} className="border px-3 py-2 font-normal">
                      {i + 1}
                      <br />
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[4, 3, 2, 1, 0].map((kIdx, rowPos) => (
                  <tr key={kIdx}>
                    {rowPos === 0 && (
                      <th className="border px-3 py-2 font-semibold" rowSpan={5}>
                        Kemungkinan
                      </th>
                    )}
                    <th className="border px-3 py-2 font-normal whitespace-nowrap">
                      {kIdx + 1}
                      <br />
                      {MATRIKS_RISIKO.kemungkinanLabels[kIdx]}
                    </th>
                    {[0, 1, 2, 3, 4].map((dIdx) => {
                      const skala = MATRIKS_RISIKO.matrix[dIdx][kIdx];
                      return (
                        <td key={dIdx} className={`border px-3 py-2 font-semibold ${MATRIKS_RISIKO.warnaForSkala(skala)}`}>
                          {skala}
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
