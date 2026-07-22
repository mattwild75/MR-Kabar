import { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import AutocompleteSelect from '@/components/ui/autocomplete-select';
import CategorizedTextarea from '@/components/ui/categorized-textarea';
import FieldInfoPopover from '@/components/ui/field-info-popover';
import {
  KATEGORI_EFEKTIVITAS_OPTIONS,
  hitungKemungkinanTerkendali,
  hitungDampakTerkendali,
  ekstrakKategoriKontrol,
  arahReduksiRtp,
} from '@/lib/irs-reference-data';

/**
 * Section form Skor TARGET (proyeksi setelah RTP jalan) — dipakai identik
 * di irs/Index.tsx, irs_pd/Index.tsx, iro_pd/Index.tsx (dulu tiap halaman
 * punya blok skala sendiri; blok baru ini cukup panjang & berlogika, jadi
 * dijadikan komponen bersama supaya tidak triple-maintenance).
 *
 * Skor AKTUAL (hasil monitoring) TIDAK lagi di sini — dipindah ke Form 9
 * Monitoring (monitoring-evaluasi/Form89.tsx + tabel monitoring_rtp),
 * karena levelnya PER RTP (satu risiko bisa py >1 RTP, masing2 dipantau &
 * dinilai efektivitasnya sendiri-sendiri), bukan per-risiko seperti Target.
 *
 * Arah reduksi (K, D, atau keduanya) ditentukan dari kategori RESPON
 * RISIKO pada RENCANA TINDAK PENGENDALIAN — prinsip COSO ERM: kontrol
 * preventif (Avoid/Abate) menekan Kemungkinan, kontrol mitigatif/
 * pengalihan (Mitigate/Share-Transfer) menekan Dampak (lihat
 * arahReduksiRtp()). Auto-hitung HANYA saat field yg relevan masih kosong
 * (belum di-override manual petugas). Skala Risiko-nya sengaja TIDAK
 * dihitung di frontend (butuh matriks dari DB) — cukup ditandai "dihitung
 * otomatis saat disimpan". Backend (hitungSemuaSkala) tetap sumber
 * kebenaran final.
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
  const dampakInheren = Number(data['SKALA DAMPAK INHEREN']) || null;

  const kategoriProyeksi = ekstrakKategoriKontrol(data['KATEGORI PROYEKSI RTP']);
  const arah = arahReduksiRtp(data['RENCANA TINDAK PENGENDALIAN']);

  // Auto-isi Skala Target begitu kategori proyeksi dipilih & inheren
  // tersedia — hanya jika field yg relevan masih kosong (jangan timpa
  // override manual petugas). Sumbu yg TIDAK ditekan RTP tidak diisi
  // otomatis di sini (biar user isi manual, default backend sudah
  // menangani fallback-nya saat disimpan).
  useEffect(() => {
    if (!kategoriProyeksi) return;

    if (arah.kemungkinan && kemungkinanInheren && !data['SKALA KEMUNGKINAN TARGET']) {
      const k = hitungKemungkinanTerkendali(kemungkinanInheren, kategoriProyeksi);
      if (k) setData('SKALA KEMUNGKINAN TARGET', String(k));
    }
    if (arah.dampak && dampakInheren && !data['SKALA DAMPAK TARGET']) {
      const d = hitungDampakTerkendali(dampakInheren, kategoriProyeksi);
      if (d) setData('SKALA DAMPAK TARGET', String(d));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kategoriProyeksi, kemungkinanInheren, dampakInheren, arah.kemungkinan, arah.dampak]);

  const previewTarget = arah.kemungkinan ? hitungKemungkinanTerkendali(kemungkinanInheren, kategoriProyeksi) : null;
  const previewDampakTarget = arah.dampak ? hitungDampakTerkendali(dampakInheren, kategoriProyeksi) : null;
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
            Isi Skala Kemungkinan Inheren di atas dulu — Skala Kemungkinan Target dihitung otomatis dari nilai
            inheren dikali faktor reduksi kategori efektivitas.
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
          {(previewTarget || previewDampakTarget) && (
            <p className="text-xs text-sky-700 dark:text-sky-400">
              {previewTarget && (
                <>
                  Perkiraan Skala Kemungkinan Target: <strong>{previewTarget}</strong> (dari K inheren {kemungkinanInheren} × faktor kategori)
                </>
              )}
              {previewTarget && previewDampakTarget && <br />}
              {previewDampakTarget && (
                <>
                  Perkiraan Skala Dampak Target: <strong>{previewDampakTarget}</strong> (dari D inheren {dampakInheren} × faktor kategori — RTP menyasar Dampak/Mitigate)
                </>
              )}
            </p>
          )}
          {kategoriProyeksi && !arah.kemungkinan && !arah.dampak && (
            <p className="text-xs text-muted-foreground">
              Rencana Tindak Pengendalian belum menyebut respon Avoid/Abate/Mitigate/Share-Transfer — Skala
              Kemungkinan/Dampak Target perlu diisi manual.
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
          Skala Kemungkinan/Dampak Target terisi otomatis sesuai respon risiko RTP (Avoid/Abate menekan Kemungkinan,
          Mitigate/Share-Transfer menekan Dampak) — bisa diubah manual. Skala Risiko Target dihitung otomatis saat
          disimpan.
        </p>
      </div>
    </>
  );
}
