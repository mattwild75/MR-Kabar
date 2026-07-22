import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface MatrixCell {
  dampak: number;
  kemungkinan: number;
  skala_risiko: number | null;
  warna_class: string;
}

interface RiskMatrixData {
  dampakLabels: string[];
  kemungkinanLabels: string[];
  cells: MatrixCell[];
}

type TitikKey = 'inheren' | 'residual' | 'target' | 'aktual';

const TITIK_CONFIG: Record<TitikKey, { label: string; singkat: string; warna: string; warnaAktif: string }> = {
  inheren: {
    label: 'Inheren',
    singkat: 'I',
    warna: 'bg-rose-600 text-white border-rose-700',
    warnaAktif: 'ring-2 ring-rose-500 ring-offset-1',
  },
  residual: {
    label: 'Residual/Current',
    singkat: 'R',
    warna: 'bg-blue-600 text-white border-blue-700',
    warnaAktif: 'ring-2 ring-blue-500 ring-offset-1',
  },
  target: {
    label: 'Target',
    singkat: 'T',
    warna: 'bg-emerald-600 text-white border-emerald-700',
    warnaAktif: 'ring-2 ring-emerald-500 ring-offset-1',
  },
  aktual: {
    label: 'Aktual',
    singkat: 'A',
    warna: 'bg-amber-500 text-white border-amber-600',
    warnaAktif: 'ring-2 ring-amber-400 ring-offset-1',
  },
};

/**
 * Dialog matriks 5x5 interaktif — pengganti/pendamping visual utk isi
 * manual Skala Dampak/Kemungkinan Inheren, Residual/Current, dan Target
 * sekaligus dalam SATU matriks yg sama (bukan 3 tab terpisah), supaya
 * posisi ketiganya relatif satu sama lain langsung terlihat (mis. Target
 * harus di sel yg "lebih ringan" dari Inheren).
 *
 * Cara pakai: pilih toggle titik yg sedang diisi (Inheren/Residual/
 * Target), lalu klik sel matriks — sel itu jadi koordinat (Dampak,
 * Kemungkinan) utk titik yg sedang aktif. Titik yg sudah diisi tetap
 * tampil sbg badge kecil di selnya masing-masing meski toggle berpindah.
 * Dua arah dgn field manual: buka dialog ini pre-fill dari nilai field yg
 * sudah ada, dan pilih sel di sini langsung menulis balik ke field itu
 * (lewat onPilih) — TIDAK ada state terpisah yg bisa "ketinggalan sync".
 *
 * existingControlDiisi=false (toggle "Apakah sudah ada Existing Control?"
 * -> Tidak, lihat ExistingControlToggleSection) — Residual/Current TIDAK
 * pernah diisi terpisah di form (auto-copy dari Inheren di backend), jadi
 * toggle titik "Residual" disembunyikan & klik sel saat titik "Inheren"
 * aktif menulis KEDUA field (Inheren + Residual) sekaligus, konsisten dgn
 * apa yg sesungguhnya tersimpan.
 *
 * titikDitampilkan/titikBisaDiubah — dipakai Form 9 Monitoring utk varian
 * "Isi Nilai Risiko Aktual": tampilkan 4 titik (Inheren/Residual/Target/
 * Aktual) tapi HANYA Aktual yg bisa diklik/dipilih (3 titik lain sekadar
 * konteks read-only, sudah ditetapkan lebih dulu di IRS/IRO & tak lagi
 * boleh diubah dari Form 9). Default keduanya = 3 titik lama (Inheren/
 * Residual/Target, semua bisa diubah) supaya perilaku IRS/IRO tak berubah.
 */
export default function RiskMatrixPickerDialog({
  open,
  onOpenChange,
  matriks,
  nilai,
  onPilih,
  existingControlDiisi = true,
  titikDitampilkan,
  titikBisaDiubah,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matriks: RiskMatrixData;
  nilai: Partial<Record<TitikKey, { dampak: number | null; kemungkinan: number | null }>>;
  onPilih: (titik: TitikKey, dampak: number, kemungkinan: number) => void;
  existingControlDiisi?: boolean;
  titikDitampilkan?: TitikKey[];
  titikBisaDiubah?: TitikKey[];
}) {
  const titikDefault: TitikKey[] = existingControlDiisi ? ['inheren', 'residual', 'target'] : ['inheren', 'target'];
  const titikTampil = titikDitampilkan ?? titikDefault;
  const titikEditable = titikBisaDiubah ?? titikTampil;

  const [titikAktif, setTitikAktif] = useState<TitikKey>(titikEditable[0]);

  // Kalau toggle Existing Control berpindah ke "Tidak" sementara titik
  // aktif kebetulan "residual" (mis. sempat pilih Ya sebelumnya), alihkan
  // ke titik editable pertama — residual tidak lagi jadi pilihan valid.
  useEffect(() => {
    if (!titikEditable.includes(titikAktif)) {
      setTitikAktif(titikEditable[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingControlDiisi, titikEditable.join(',')]);

  const cellAt = (dampak: number, kemungkinan: number) =>
    matriks.cells.find((c) => c.dampak === dampak && c.kemungkinan === kemungkinan);

  const titikDiSel = (dampak: number, kemungkinan: number): TitikKey[] =>
    titikTampil.filter((t) => nilai[t]?.dampak === dampak && nilai[t]?.kemungkinan === kemungkinan);

  const hanyaReadOnly = titikEditable.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Isi Nilai Risiko — Matriks Analisis Risiko (5x5)</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {hanyaReadOnly
              ? 'Ketiga titik di bawah bersifat tampilan saja (sudah ditetapkan di Form Input Risiko).'
              : 'Pilih titik yang sedang diisi, lalu klik sel matriks sesuai kombinasi Dampak × Kemungkinan yang sesuai.'}
            {existingControlDiisi
              ? ' Titik-titik tampil sekaligus di matriks yang sama supaya posisinya relatif satu sama lain langsung terlihat.'
              : ' Risiko ini belum punya Existing Control — Residual/Current otomatis sama dengan Inheren, jadi cukup isi Inheren dan Target.'}
          </p>

          <div className="flex flex-wrap gap-2">
            {titikTampil.map((t) => {
              const cfg = TITIK_CONFIG[t];
              const editable = titikEditable.includes(t);
              const nilaiT = nilai[t] ?? { dampak: null, kemungkinan: null };
              const terisi = nilaiT.dampak !== null && nilaiT.kemungkinan !== null;
              return (
                <button
                  key={t}
                  type="button"
                  disabled={!editable}
                  onClick={() => editable && setTitikAktif(t)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md border-2 px-3 py-1.5 text-sm font-medium transition-colors',
                    !editable && 'cursor-default opacity-70',
                    titikAktif === t
                      ? `${cfg.warna} border-transparent`
                      : 'border-input bg-transparent text-foreground hover:bg-accent',
                    !editable && titikAktif !== t && 'hover:bg-transparent',
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold',
                      titikAktif === t ? 'bg-white/20' : cfg.warna,
                    )}
                  >
                    {cfg.singkat}
                  </span>
                  {cfg.label}
                  {!editable && <span className="text-xs opacity-70">(read-only)</span>}
                  {terisi && (
                    <span className="text-xs opacity-80">
                      (D{nilaiT.dampak} K{nilaiT.kemungkinan})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

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
                  {matriks.dampakLabels.map((label, i) => (
                    <th key={label} className="w-[15%] border px-1 py-2 font-normal">
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
                    <th className="border px-2 py-2 font-normal">
                      {kemungkinan}
                      <br />
                      {matriks.kemungkinanLabels[kemungkinan - 1]}
                    </th>
                    {[1, 2, 3, 4, 5].map((dampak) => {
                      const cell = cellAt(dampak, kemungkinan);
                      const titikDisini = titikDiSel(dampak, kemungkinan);
                      return (
                        <td
                          key={dampak}
                          role={hanyaReadOnly ? undefined : 'button'}
                          tabIndex={hanyaReadOnly ? undefined : 0}
                          onClick={() => !hanyaReadOnly && onPilih(titikAktif, dampak, kemungkinan)}
                          onKeyDown={(e) => {
                            if (!hanyaReadOnly && (e.key === 'Enter' || e.key === ' ')) {
                              e.preventDefault();
                              onPilih(titikAktif, dampak, kemungkinan);
                            }
                          }}
                          className={cn(
                            'relative w-[15%] border px-1 py-2 font-semibold transition-[filter]',
                            !hanyaReadOnly && 'cursor-pointer hover:brightness-90',
                            cell?.warna_class ?? 'bg-muted',
                          )}
                        >
                          {cell?.skala_risiko ?? '-'}
                          {titikDisini.length > 0 && (
                            <div className="mt-1 flex flex-wrap justify-center gap-1">
                              {titikDisini.map((t) => (
                                <span
                                  key={t}
                                  className={cn(
                                    'inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold shadow',
                                    TITIK_CONFIG[t].warna,
                                    titikAktif === t && TITIK_CONFIG[t].warnaAktif,
                                  )}
                                  title={TITIK_CONFIG[t].label}
                                >
                                  {TITIK_CONFIG[t].singkat}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {titikTampil.map((t) => (
              <span key={t} className="flex items-center gap-1">
                <span className={cn('inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold', TITIK_CONFIG[t].warna)}>
                  {TITIK_CONFIG[t].singkat}
                </span>
                {TITIK_CONFIG[t].label}
              </span>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Selesai
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
