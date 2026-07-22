import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import AutocompleteTextarea from '@/components/ui/autocomplete-textarea';
import AutocompleteSelect from '@/components/ui/autocomplete-select';
import CategorizedTextarea from '@/components/ui/categorized-textarea';
import FieldInfoPopover from '@/components/ui/field-info-popover';
import RiskEvidenceUploader from '@/components/ui/risk-evidence-uploader';
import { KATEGORI_EXISTING_CONTROL_OPTIONS } from '@/lib/irs-reference-data';

/**
 * Toggle "Apakah risiko ini sudah memiliki Pengendalian yang Sudah Ada
 * (Existing Control)?" — membungkus Skenario A/B yg sudah ada di backend
 * (RiskReferenceDataService::hitungSemuaSkala()):
 *
 * - Ya: existing control ADA — tampilkan Uraian Pengendalian/Kategori
 *   Existing Control/Celah Pengendalian, DAN skor Inheren+Residual (dua
 *   pasang, krn existing control menekan Inheren jadi Residual/Current).
 * - Tidak: risiko baru tanpa kontrol sama sekali — field
 *   Uraian/Kategori/Celah disembunyikan (dikosongkan otomatis, bukan
 *   sekadar disembunyikan — Skenario B tidak mewajibkan celah/kategori),
 *   dan HANYA satu skor yg diisi (berlabel Inheren, sesuai urutan
 *   Inheren->Residual/Current->Target->Aktual) yg lompat langsung jadi
 *   Residual/Current di backend (auto-copy server-side, field terpisah
 *   SKALA DAMPAK/KEMUNGKINAN residual tidak ditampilkan sama sekali saat
 *   Tidak supaya user tidak bingung mengisi 2 pasang utk 1 kondisi yg sama).
 *
 * evidenceType/rowId diteruskan ke RiskEvidenceUploader (beda per
 * halaman: irs_pemda/irs_pd/iro_pd).
 */
export default function ExistingControlToggleSection({
  data,
  setData,
  errors,
  info,
  fieldOptions,
  evidenceType,
  rowId,
  isNewRow,
  onToggleChange,
}: {
  data: Record<string, string>;
  setData: (field: string, value: string) => void;
  errors: Record<string, string | undefined>;
  info: Record<string, string>;
  fieldOptions: Record<string, string[]>;
  evidenceType: string;
  rowId: number | null;
  isNewRow: boolean;
  /** Dipanggil setiap kali status toggle berubah/diketahui — dipakai parent utk mengunci tombol "Isi Nilai Risiko" sampai user memilih Ya/Tidak. */
  onToggleChange?: (status: 'ya' | 'tidak' | null) => void;
}) {
  // Infer dari data existing saat edit — "Ya" kalau salah satu dari
  // ketiga field existing control sudah terisi, "Tidak" kalau baris baru
  // ATAU baris lama yg memang kosong ketiganya. null = belum dipilih user
  // (baris benar2 baru) supaya toggle tidak "memaksa" default sebelum
  // user sadar memilih.
  const inferExistingControl = () => {
    const terisi =
      (data['URAIAN PENGENDALIAN YANG SUDAH ADA'] ?? '').trim() !== '' ||
      (data['KATEGORI EXISTING CONTROL'] ?? '').trim() !== '' ||
      (data['CELAH PENGENDALIAN'] ?? '').trim() !== '';
    return terisi ? 'ya' : (isNewRow ? null : 'tidak');
  };

  const [hasExistingControl, setHasExistingControl] = useState<'ya' | 'tidak' | null>(inferExistingControl);

  // Re-infer setiap kali dialog dibuka utk baris lain (id sebagai proxy
  // "row berganti" — rowId null utk create), sekaligus lapor ke parent.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const status = inferExistingControl();
    setHasExistingControl(status);
    onToggleChange?.(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowId]);

  const pilih = (jawaban: 'ya' | 'tidak') => {
    setHasExistingControl(jawaban);
    onToggleChange?.(jawaban);
    if (jawaban === 'tidak') {
      // Kosongkan otomatis — Skenario B: risiko baru tanpa kontrol sama
      // sekali, field2 existing control tidak relevan lagi.
      setData('URAIAN PENGENDALIAN YANG SUDAH ADA', '');
      setData('KATEGORI EXISTING CONTROL', '');
      setData('CELAH PENGENDALIAN', '');
    }
  };

  const uraianTerisi =
    (data['URAIAN PENGENDALIAN YANG SUDAH ADA'] ?? '').trim() !== '' &&
    (data['URAIAN PENGENDALIAN YANG SUDAH ADA'] ?? '').trim() !== '-' &&
    (data['URAIAN PENGENDALIAN YANG SUDAH ADA'] ?? '').trim() !== 'Tidak Ada Data';

  return (
    <div className="space-y-3 rounded-md border p-3">
      <div className="flex items-center gap-1.5">
        <Label className="text-sm font-medium">
          Apakah risiko ini sudah memiliki Pengendalian yang Sudah Ada (Existing Control)?
        </Label>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => pilih('ya')}
          className={`rounded-md border-2 px-4 py-1.5 text-sm font-medium transition-colors ${
            hasExistingControl === 'ya'
              ? 'border-blue-500 bg-blue-500 text-white dark:border-blue-400 dark:bg-blue-400 dark:text-slate-950'
              : 'border-input bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          Ya
        </button>
        <button
          type="button"
          onClick={() => pilih('tidak')}
          className={`rounded-md border-2 px-4 py-1.5 text-sm font-medium transition-colors ${
            hasExistingControl === 'tidak'
              ? 'border-blue-500 bg-blue-500 text-white dark:border-blue-400 dark:bg-blue-400 dark:text-slate-950'
              : 'border-input bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          Tidak
        </button>
      </div>

      {hasExistingControl === null && (
        <p className="text-xs text-muted-foreground">
          Pilih salah satu dulu untuk menampilkan isian pengendalian &amp; skala risiko yang sesuai.
        </p>
      )}

      {hasExistingControl === 'ya' && (
        <div className="space-y-4 border-t pt-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="URAIAN PENGENDALIAN YANG SUDAH ADA">URAIAN PENGENDALIAN YANG SUDAH ADA</Label>
              {info['URAIAN PENGENDALIAN YANG SUDAH ADA'] && (
                <FieldInfoPopover text={info['URAIAN PENGENDALIAN YANG SUDAH ADA']} />
              )}
            </div>
            <AutocompleteTextarea
              id="URAIAN PENGENDALIAN YANG SUDAH ADA"
              value={data['URAIAN PENGENDALIAN YANG SUDAH ADA']}
              onChange={(val) => setData('URAIAN PENGENDALIAN YANG SUDAH ADA', val)}
              options={fieldOptions['URAIAN PENGENDALIAN YANG SUDAH ADA'] ?? []}
              rows={2}
            />
            {errors['URAIAN PENGENDALIAN YANG SUDAH ADA'] && (
              <p className="text-sm text-destructive">{errors['URAIAN PENGENDALIAN YANG SUDAH ADA']}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Sesuai PP 60/2008, uraian ini merupakan representasi unsur <em>Kegiatan Pengendalian</em> — kebijakan
              &amp; prosedur yang membantu memastikan arahan manajemen risiko dilaksanakan.
            </p>
            {uraianTerisi && (
              <p className="rounded-md border border-amber-300 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                Disarankan unggah bukti dukung (SS/JPG/PNG/PDF) untuk pengendalian yang sudah diuraikan di atas.
              </p>
            )}
            <RiskEvidenceUploader type={evidenceType} rowId={rowId} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="KATEGORI EXISTING CONTROL">KATEGORI EXISTING CONTROL</Label>
              {info['KATEGORI EXISTING CONTROL'] && <FieldInfoPopover text={info['KATEGORI EXISTING CONTROL']} />}
            </div>
            <CategorizedTextarea
              id="KATEGORI EXISTING CONTROL"
              value={data['KATEGORI EXISTING CONTROL']}
              onChange={(val) => setData('KATEGORI EXISTING CONTROL', val)}
              categories={KATEGORI_EXISTING_CONTROL_OPTIONS}
              uraianPlaceholder="Uraian penilaian efektivitas (opsional)..."
            />
            <p className="text-xs text-muted-foreground">
              TE = Tidak Efektif, KE = Kurang Efektif, CE = Cukup Efektif, E = Efektif — menilai seberapa baik
              pengendalian yang sudah ada menekan risiko awal (risiko inheren) menjadi risiko residual/current.
            </p>
            {errors['KATEGORI EXISTING CONTROL'] && (
              <p className="text-sm text-destructive">{errors['KATEGORI EXISTING CONTROL']}</p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="CELAH PENGENDALIAN">CELAH PENGENDALIAN</Label>
              {info['CELAH PENGENDALIAN'] && <FieldInfoPopover text={info['CELAH PENGENDALIAN']} />}
            </div>
            <AutocompleteTextarea
              id="CELAH PENGENDALIAN"
              value={data['CELAH PENGENDALIAN']}
              onChange={(val) => setData('CELAH PENGENDALIAN', val)}
              options={fieldOptions['CELAH PENGENDALIAN'] ?? []}
              rows={2}
            />
            {errors['CELAH PENGENDALIAN'] && <p className="text-sm text-destructive">{errors['CELAH PENGENDALIAN']}</p>}
          </div>
        </div>
      )}

      {hasExistingControl === 'ya' && (
        <ScoringYa data={data} setData={setData} errors={errors} info={info} />
      )}

      {hasExistingControl === 'tidak' && <ScoringTidak data={data} setData={setData} errors={errors} info={info} />}
    </div>
  );
}

function ScoringYa({
  data,
  setData,
  errors,
  info,
}: {
  data: Record<string, string>;
  setData: (field: string, value: string) => void;
  errors: Record<string, string | undefined>;
  info: Record<string, string>;
}) {
  return (
    <div className="space-y-3 border-t pt-3">
      <div className="grid grid-cols-2 gap-3 rounded-md border border-dashed p-3">
        <div className="col-span-2 flex items-center gap-1.5">
          <Label className="text-sm font-medium">Skala Risiko Inheren</Label>
          {info['SKALA DAMPAK INHEREN'] && <FieldInfoPopover text={info['SKALA DAMPAK INHEREN']} />}
        </div>
        <div className="space-y-1">
          <Label htmlFor="SKALA DAMPAK INHEREN" className="text-xs text-muted-foreground">
            Skala Dampak Inheren
          </Label>
          <AutocompleteSelect
            value={data['SKALA DAMPAK INHEREN']}
            onChange={(val) => setData('SKALA DAMPAK INHEREN', val)}
            options={['1', '2', '3', '4', '5']}
            placeholder="Pilih 1-5"
          />
          {errors['SKALA DAMPAK INHEREN'] && <p className="text-sm text-destructive">{errors['SKALA DAMPAK INHEREN']}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="SKALA KEMUNGKINAN INHEREN" className="text-xs text-muted-foreground">
            Skala Kemungkinan Inheren
          </Label>
          <AutocompleteSelect
            value={data['SKALA KEMUNGKINAN INHEREN']}
            onChange={(val) => setData('SKALA KEMUNGKINAN INHEREN', val)}
            options={['1', '2', '3', '4', '5']}
            placeholder="Pilih 1-5"
          />
          {errors['SKALA KEMUNGKINAN INHEREN'] && (
            <p className="text-sm text-destructive">{errors['SKALA KEMUNGKINAN INHEREN']}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="SKALA DAMPAK">SKALA DAMPAK (Residual/Current)</Label>
            {info['SKALA DAMPAK'] && <FieldInfoPopover text={info['SKALA DAMPAK']} />}
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
            <Label htmlFor="SKALA KEMUNGKINAN">SKALA KEMUNGKINAN (Residual/Current)</Label>
            {info['SKALA KEMUNGKINAN'] && <FieldInfoPopover text={info['SKALA KEMUNGKINAN']} />}
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
      <p className="text-xs text-muted-foreground">
        Skala Risiko dan Skala Prioritas Residual/Current dihitung otomatis dari Dampak x Kemungkinan di atas.
      </p>
    </div>
  );
}

function ScoringTidak({
  data,
  setData,
  errors,
  info,
}: {
  data: Record<string, string>;
  setData: (field: string, value: string) => void;
  errors: Record<string, string | undefined>;
  info: Record<string, string>;
}) {
  return (
    <div className="space-y-3 border-t pt-3">
      <p className="text-xs text-muted-foreground">
        Risiko ini belum memiliki pengendalian sama sekali — cukup isi satu skor di bawah (Skala Risiko Inheren).
        Nilai ini akan langsung menjadi Skala Risiko Residual/Current juga (belum ada kontrol yang menekannya).
        Lanjutkan ke Rencana Tindak Pengendalian (RTP) di bawah untuk merancang pengendalian barunya.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="SKALA DAMPAK INHEREN">Skala Dampak Inheren</Label>
            {info['SKALA DAMPAK INHEREN'] && <FieldInfoPopover text={info['SKALA DAMPAK INHEREN']} />}
          </div>
          <AutocompleteSelect
            value={data['SKALA DAMPAK INHEREN']}
            onChange={(val) => setData('SKALA DAMPAK INHEREN', val)}
            options={['1', '2', '3', '4', '5']}
            placeholder="Pilih 1-5"
          />
          {errors['SKALA DAMPAK INHEREN'] && <p className="text-sm text-destructive">{errors['SKALA DAMPAK INHEREN']}</p>}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="SKALA KEMUNGKINAN INHEREN">Skala Kemungkinan Inheren</Label>
            {info['SKALA KEMUNGKINAN INHEREN'] && <FieldInfoPopover text={info['SKALA KEMUNGKINAN INHEREN']} />}
          </div>
          <AutocompleteSelect
            value={data['SKALA KEMUNGKINAN INHEREN']}
            onChange={(val) => setData('SKALA KEMUNGKINAN INHEREN', val)}
            options={['1', '2', '3', '4', '5']}
            placeholder="Pilih 1-5"
          />
          {errors['SKALA KEMUNGKINAN INHEREN'] && (
            <p className="text-sm text-destructive">{errors['SKALA KEMUNGKINAN INHEREN']}</p>
          )}
        </div>
      </div>
    </div>
  );
}
