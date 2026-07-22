import { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import AutocompleteSelect from '@/components/ui/autocomplete-select';
import CategorizedTextarea from '@/components/ui/categorized-textarea';
import FieldInfoPopover from '@/components/ui/field-info-popover';
import {
  KATEGORI_EFEKTIVITAS_OPTIONS,
  hitungKemungkinanTerkendali,
  ekstrakKategoriKontrol,
} from '@/lib/irs-reference-data';

/**
 * Section form Skor TARGET (proyeksi setelah RTP jalan) & AKTUAL (hasil
 * monitoring) — dipakai identik di irs/Index.tsx, irs_pd/Index.tsx,
 * iro_pd/Index.tsx (dulu tiap halaman punya blok skala sendiri; blok baru
 * ini cukup panjang & berlogika, jadi dijadikan komponen bersama supaya
 * tidak triple-maintenance).
 *
 * Auto-hitung Skala Kemungkinan Target/Aktual dari K_INHEREN x faktor
 * reduksi kategori efektivitas, HANYA saat field kemungkinan itu masih
 * kosong (belum di-override manual petugas). Skala Risiko-nya sengaja
 * TIDAK dihitung di frontend (butuh matriks dari DB) — cukup ditandai
 * "dihitung otomatis saat disimpan". Backend (hitungSemuaSkala) tetap
 * sumber kebenaran final.
 */

export default function SkorTargetAktualSection({
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
  const kemungkinanInheren = Number(data['SKALA KEMUNGKINAN INHEREN']) || null;

  const kategoriProyeksi = ekstrakKategoriKontrol(data['KATEGORI PROYEKSI RTP']);
  const kategoriAktual = ekstrakKategoriKontrol(data['KATEGORI EXISTING CONTROL AKTUAL']);

  // Auto-isi Skala Kemungkinan Target begitu kategori proyeksi dipilih &
  // inheren tersedia — hanya jika field masih kosong (jangan timpa
  // override manual petugas).
  useEffect(() => {
    if (!kategoriProyeksi || !kemungkinanInheren) return;
    if (data['SKALA KEMUNGKINAN TARGET']) return;
    const k = hitungKemungkinanTerkendali(kemungkinanInheren, kategoriProyeksi);
    if (k) {
      setData('SKALA KEMUNGKINAN TARGET', String(k));
      if (!data['SKALA DAMPAK TARGET']) {
        setData('SKALA DAMPAK TARGET', String(Number(data['SKALA DAMPAK']) || ''));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kategoriProyeksi, kemungkinanInheren]);

  useEffect(() => {
    if (!kategoriAktual || !kemungkinanInheren) return;
    if (data['SKALA KEMUNGKINAN AKTUAL']) return;
    const k = hitungKemungkinanTerkendali(kemungkinanInheren, kategoriAktual);
    if (k) {
      setData('SKALA KEMUNGKINAN AKTUAL', String(k));
      if (!data['SKALA DAMPAK AKTUAL']) {
        setData('SKALA DAMPAK AKTUAL', String(Number(data['SKALA DAMPAK']) || ''));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kategoriAktual, kemungkinanInheren]);

  const previewTarget = hitungKemungkinanTerkendali(kemungkinanInheren, kategoriProyeksi);
  const previewAktual = hitungKemungkinanTerkendali(kemungkinanInheren, kategoriAktual);
  const inherenBelumDiisi = !kemungkinanInheren;

  return (
    <>
      {/* ── SKOR TARGET (proyeksi RTP) ── */}
      <div className="space-y-3 rounded-md border border-dashed border-sky-400/60 p-3 dark:border-sky-700/60">
        <div className="flex items-center gap-1.5">
          <Label className="text-sm font-medium text-sky-700 dark:text-sky-400">
            Skala Target — Proyeksi setelah RTP dijalankan (opsional)
          </Label>
          {info['KATEGORI PROYEKSI RTP'] && <FieldInfoPopover text={info['KATEGORI PROYEKSI RTP']} />}
        </div>

        {inherenBelumDiisi && (
          <p className="rounded-md border border-amber-300 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            Isi Skala Kemungkinan Inheren di atas dulu — Skala Kemungkinan Target/Aktual dihitung otomatis dari
            nilai inheren dikali faktor reduksi kategori efektivitas.
          </p>
        )}

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Kategori Proyeksi Efektivitas RTP</Label>
          <CategorizedTextarea
            value={data['KATEGORI PROYEKSI RTP']}
            onChange={(val) => setData('KATEGORI PROYEKSI RTP', val)}
            categories={KATEGORI_EFEKTIVITAS_OPTIONS}
            uraianPlaceholder="Uraian proyeksi efektivitas RTP (opsional)..."
          />
          {previewTarget && (
            <p className="text-xs text-sky-700 dark:text-sky-400">
              Perkiraan Skala Kemungkinan Target: <strong>{previewTarget}</strong> (dari K inheren {kemungkinanInheren} × faktor kategori)
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="SKALA DAMPAK TARGET" className="text-xs text-muted-foreground">
              Skala Dampak Target
            </Label>
            <AutocompleteSelect
              value={data['SKALA DAMPAK TARGET']}
              onChange={(val) => setData('SKALA DAMPAK TARGET', val)}
              options={['1', '2', '3', '4', '5']}
              placeholder="Pilih 1-5"
            />
            {errors['SKALA DAMPAK TARGET'] && <p className="text-sm text-destructive">{errors['SKALA DAMPAK TARGET']}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="SKALA KEMUNGKINAN TARGET" className="text-xs text-muted-foreground">
              Skala Kemungkinan Target
            </Label>
            <AutocompleteSelect
              value={data['SKALA KEMUNGKINAN TARGET']}
              onChange={(val) => setData('SKALA KEMUNGKINAN TARGET', val)}
              options={['1', '2', '3', '4', '5']}
              placeholder="Auto/pilih 1-5"
            />
            {errors['SKALA KEMUNGKINAN TARGET'] && <p className="text-sm text-destructive">{errors['SKALA KEMUNGKINAN TARGET']}</p>}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Skala Kemungkinan Target terisi otomatis dari kategori proyeksi (boleh diubah manual, mis. RTP mitigatif).
          Skala Risiko Target dihitung otomatis saat disimpan.
        </p>
      </div>

      {/* ── SKOR AKTUAL (hasil monitoring) ── */}
      <details className="rounded-md border border-dashed border-emerald-400/60 p-3 dark:border-emerald-700/60">
        <summary className="cursor-pointer text-sm font-medium text-emerald-700 dark:text-emerald-400">
          Skala Aktual — Hasil monitoring setelah RTP berjalan (opsional, isi belakangan)
        </summary>
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-1.5">
            {info['KATEGORI EXISTING CONTROL AKTUAL'] && <FieldInfoPopover text={info['KATEGORI EXISTING CONTROL AKTUAL']} />}
            <span className="text-xs text-muted-foreground">
              Diisi saat pemantauan RTP — efektivitas riil bisa berbeda dari target.
            </span>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Kategori Efektivitas Aktual (hasil monitoring)</Label>
            <CategorizedTextarea
              value={data['KATEGORI EXISTING CONTROL AKTUAL']}
              onChange={(val) => setData('KATEGORI EXISTING CONTROL AKTUAL', val)}
              categories={KATEGORI_EFEKTIVITAS_OPTIONS}
              uraianPlaceholder="Uraian hasil pemantauan efektivitas (opsional)..."
            />
            {previewAktual && (
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Perkiraan Skala Kemungkinan Aktual: <strong>{previewAktual}</strong> (dari K inheren {kemungkinanInheren} × faktor kategori)
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="SKALA DAMPAK AKTUAL" className="text-xs text-muted-foreground">
                Skala Dampak Aktual
              </Label>
              <AutocompleteSelect
                value={data['SKALA DAMPAK AKTUAL']}
                onChange={(val) => setData('SKALA DAMPAK AKTUAL', val)}
                options={['1', '2', '3', '4', '5']}
                placeholder="Pilih 1-5"
              />
              {errors['SKALA DAMPAK AKTUAL'] && <p className="text-sm text-destructive">{errors['SKALA DAMPAK AKTUAL']}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="SKALA KEMUNGKINAN AKTUAL" className="text-xs text-muted-foreground">
                Skala Kemungkinan Aktual
              </Label>
              <AutocompleteSelect
                value={data['SKALA KEMUNGKINAN AKTUAL']}
                onChange={(val) => setData('SKALA KEMUNGKINAN AKTUAL', val)}
                options={['1', '2', '3', '4', '5']}
                placeholder="Auto/pilih 1-5"
              />
              {errors['SKALA KEMUNGKINAN AKTUAL'] && <p className="text-sm text-destructive">{errors['SKALA KEMUNGKINAN AKTUAL']}</p>}
            </div>
          </div>
        </div>
      </details>
    </>
  );
}
