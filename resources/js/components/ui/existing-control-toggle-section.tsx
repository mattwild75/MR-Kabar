import { useEffect, useState } from 'react';
import { Grid3x3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AutocompleteTextarea from '@/components/ui/autocomplete-textarea';
import PilihKriteriaRisiko, { type MatriksRisiko } from '@/components/ui/pilih-kriteria-risiko';
import type { KriteriaDampakRow, KriteriaKemungkinanRow } from '@/components/ui/matrix-criteria-popover';
import { findRiskLevel, type RiskLevelBand } from '@/lib/risk-level';
import { cn } from '@/lib/utils';
import CategorizedTextarea from '@/components/ui/categorized-textarea';
import FieldInfoPopover from '@/components/ui/field-info-popover';
import RiskEvidenceUploader from '@/components/ui/risk-evidence-uploader';
import KriteriaCelahPengendalian from '@/components/ui/kriteria-celah-pengendalian';
import { KATEGORI_EXISTING_CONTROL_OPTIONS, KATEGORI_WAJIB_CELAH } from '@/lib/irs-reference-data';

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
 *
 * Skala risiko TIDAK lagi diketik (pilih angka 1–5). Sejak Oktober 2026
 * hanya ada dua cara mengisinya:
 *  1. Pilih langsung dari tabel Kriteria Kemungkinan & Kriteria Dampak
 *     (PilihKriteriaRisiko) — tepat sesudah isian Existing Control. "Tidak"
 *     -> Inheren = Residual/Current; "Ya" -> Residual/Current.
 *  2. Fitur Isi Nilai Risiko (matriks 5×5), yang baru terbuka sesudah
 *     langkah 1 lengkap — utk titik selain yg dipilih dari tabel: Inheren
 *     (bila "Ya") dan Target. Titik dari tabel terkunci di matriks.
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
  kriteriaDampak,
  kriteriaKemungkinan,
  matriks,
  riskLevels,
  onBukaMatriks,
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
  kriteriaDampak: KriteriaDampakRow[];
  kriteriaKemungkinan: KriteriaKemungkinanRow[];
  matriks: MatriksRisiko;
  riskLevels: RiskLevelBand[];
  /** Membuka dialog Isi Nilai Risiko (matriks 5×5) milik halaman. */
  onBukaMatriks: () => void;
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
      // Nilai yg sudah dipilih dari tabel (Residual/Current saat "Ya") tetap
      // dipakai, kini sbg Inheren = Residual/Current.
      if (data['SKALA DAMPAK'] && data['SKALA KEMUNGKINAN']) {
        setData('SKALA DAMPAK INHEREN', data['SKALA DAMPAK']);
        setData('SKALA KEMUNGKINAN INHEREN', data['SKALA KEMUNGKINAN']);
      }
    }
  };

  // Kategori efektivitas disimpan sebagai "TE (uraian)" oleh
  // CategorizedTextarea, jadi kodenya diambil dari kata pertama.
  const kategoriEfektivitas = ((data['KATEGORI EXISTING CONTROL'] ?? '').trim().split(/[\s(]/)[0] ?? '')
    .toUpperCase();
  const wajibSebutCelah = (KATEGORI_WAJIB_CELAH as readonly string[]).includes(kategoriEfektivitas);

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
            {/* TE dan KE sama-sama berarti pengendaliannya belum menutup
                risiko, jadi celahnya dituntun lewat kriteria baku Perdep.
                Untuk CE dan E — atau selama kategorinya belum dipilih —
                isiannya tetap bebas seperti semula. */}
            {wajibSebutCelah ? (
              <KriteriaCelahPengendalian
                value={data['CELAH PENGENDALIAN'] ?? ''}
                onChange={(val) => setData('CELAH PENGENDALIAN', val)}
                kategori={kategoriEfektivitas}
              />
            ) : (
              <AutocompleteTextarea
                id="CELAH PENGENDALIAN"
                value={data['CELAH PENGENDALIAN']}
                onChange={(val) => setData('CELAH PENGENDALIAN', val)}
                options={fieldOptions['CELAH PENGENDALIAN'] ?? []}
                rows={2}
              />
            )}
            {errors['CELAH PENGENDALIAN'] && <p className="text-sm text-destructive">{errors['CELAH PENGENDALIAN']}</p>}
          </div>
        </div>
      )}

      {hasExistingControl !== null && (
        <PenilaianRisiko
          status={hasExistingControl}
          data={data}
          setData={setData}
          errors={errors}
          kriteriaDampak={kriteriaDampak}
          kriteriaKemungkinan={kriteriaKemungkinan}
          matriks={matriks}
          riskLevels={riskLevels}
          onBukaMatriks={onBukaMatriks}
        />
      )}
    </div>
  );
}

/** Skala yg dipilih dari tabel sudah lengkap (dipakai halaman utk membuka tombol Isi Nilai Risiko). */
export function penilaianTabelLengkap(status: 'ya' | 'tidak' | null, data: Record<string, string>): boolean {
  if (status === 'ya') return !!data['SKALA DAMPAK'] && !!data['SKALA KEMUNGKINAN'];
  if (status === 'tidak') return !!data['SKALA DAMPAK INHEREN'] && !!data['SKALA KEMUNGKINAN INHEREN'];
  return false;
}

const GALAT_SKALA = [
  'SKALA DAMPAK INHEREN',
  'SKALA KEMUNGKINAN INHEREN',
  'SKALA DAMPAK',
  'SKALA KEMUNGKINAN',
  'SKALA DAMPAK TARGET',
  'SKALA KEMUNGKINAN TARGET',
];

function PenilaianRisiko({
  status,
  data,
  setData,
  errors,
  kriteriaDampak,
  kriteriaKemungkinan,
  matriks,
  riskLevels,
  onBukaMatriks,
}: {
  status: 'ya' | 'tidak';
  data: Record<string, string>;
  setData: (field: string, value: string) => void;
  errors: Record<string, string | undefined>;
  kriteriaDampak: KriteriaDampakRow[];
  kriteriaKemungkinan: KriteriaKemungkinanRow[];
  matriks: MatriksRisiko;
  riskLevels: RiskLevelBand[];
  onBukaMatriks: () => void;
}) {
  const angka = (f: string) => Number(data[f]) || null;
  const skalaDari = (d: number | null, k: number | null) =>
    d && k ? (matriks.cells.find((c) => c.dampak === d && c.kemungkinan === k)?.skala_risiko ?? null) : null;

  const ya = status === 'ya';
  const dampak = angka(ya ? 'SKALA DAMPAK' : 'SKALA DAMPAK INHEREN');
  const kemungkinan = angka(ya ? 'SKALA KEMUNGKINAN' : 'SKALA KEMUNGKINAN INHEREN');
  const lengkap = penilaianTabelLengkap(status, data);

  const pilihTabel = (d: number | null, k: number | null) => {
    const sd = d ? String(d) : '';
    const sk = k ? String(k) : '';
    if (ya) {
      setData('SKALA DAMPAK', sd);
      setData('SKALA KEMUNGKINAN', sk);
    } else {
      // Tanpa Existing Control, Inheren dan Residual/Current sama persis.
      setData('SKALA DAMPAK INHEREN', sd);
      setData('SKALA KEMUNGKINAN INHEREN', sk);
      setData('SKALA DAMPAK', sd);
      setData('SKALA KEMUNGKINAN', sk);
    }
  };

  const dInheren = angka('SKALA DAMPAK INHEREN');
  const kInheren = angka('SKALA KEMUNGKINAN INHEREN');
  const skalaInheren = skalaDari(dInheren, kInheren);
  const skalaCurrent = skalaDari(dampak, kemungkinan);
  const dTarget = angka('SKALA DAMPAK TARGET');
  const kTarget = angka('SKALA KEMUNGKINAN TARGET');
  const skalaTarget = skalaDari(dTarget, kTarget);
  const galat = GALAT_SKALA.map((f) => errors[f]).filter((x, i, arr): x is string => !!x && arr.indexOf(x) === i);

  const Ringkas = ({ nama, skala, d, k, kosong }: { nama: string; skala: number | null; d: number | null; k: number | null; kosong: string }) => {
    const level = findRiskLevel(skala, riskLevels);
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="w-40 shrink-0 text-muted-foreground">{nama}</span>
        {skala !== null ? (
          <>
            <span className={cn('inline-flex min-w-8 justify-center rounded px-1.5 py-0.5 text-xs font-bold', level?.warna_class ?? 'bg-muted')}>
              {skala}
            </span>
            <span className="text-xs text-muted-foreground">
              {level?.label} · K{k} D{d}
            </span>
          </>
        ) : (
          <span className="text-xs text-muted-foreground italic">{kosong}</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3 border-t pt-3">
      <PilihKriteriaRisiko
        judul={ya ? 'Nilai Risiko Residual/Current' : 'Nilai Risiko Inheren = Residual/Current'}
        keterangan={
          ya
            ? 'Nilai risiko SESUDAH pengendalian yang sudah ada di atas berjalan. Skala Inheren (sebelum pengendalian) diisi sesudah ini lewat Isi Nilai Risiko.'
            : 'Risiko ini belum memiliki pengendalian, jadi nilai yang dipilih di sini sekaligus menjadi Inheren dan Residual/Current. Lanjutkan ke Rencana Tindak Pengendalian di bawah untuk merancang pengendaliannya.'
        }
        dampak={dampak}
        kemungkinan={kemungkinan}
        onPilih={pilihTabel}
        kriteriaDampak={kriteriaDampak}
        kriteriaKemungkinan={kriteriaKemungkinan}
        matriks={matriks}
        riskLevels={riskLevels}
      />

      <div className="space-y-2 rounded-md border p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold">Isi Nilai Risiko lainnya</p>
          <Button type="button" variant="outline" size="sm" disabled={!lengkap} onClick={onBukaMatriks}>
            <Grid3x3 className="mr-1.5 h-3.5 w-3.5" />
            {ya ? 'Isi Nilai Risiko — Inheren & Target' : 'Isi Nilai Risiko — Target'}
          </Button>
        </div>
        {!lengkap && (
          <p className="text-xs text-muted-foreground">Terbuka sesudah satu level Kemungkinan dan satu level Dampak dipilih dari tabel di atas.</p>
        )}
        <Ringkas
          nama="Inheren"
          skala={skalaInheren}
          d={dInheren}
          k={kInheren}
          kosong={ya ? 'belum diisi — wajib, lewat Isi Nilai Risiko' : 'dari tabel di atas'}
        />
        <Ringkas nama="Residual/Current" skala={skalaCurrent} d={dampak} k={kemungkinan} kosong="pilih dari tabel di atas" />
        <Ringkas nama="Target" skala={skalaTarget} d={dTarget} k={kTarget} kosong="opsional — dihitung dari RTP bila tidak diisi" />
        {ya && skalaInheren !== null && skalaCurrent !== null && skalaInheren < skalaCurrent && (
          <p className="rounded-md border border-amber-300 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            Inheren ({skalaInheren}) lebih rendah dari Residual/Current ({skalaCurrent}). Risiko sebelum pengendalian harus sama atau lebih
            besar — geser titik Inheren lewat Isi Nilai Risiko.
          </p>
        )}
        {galat.map((g) => (
          <p key={g} className="text-sm text-destructive">
            {g}
          </p>
        ))}
      </div>
    </div>
  );
}
