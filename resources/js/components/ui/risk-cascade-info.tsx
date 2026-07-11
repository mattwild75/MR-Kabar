import { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { label: 'Risiko Inherent', desc: 'Risiko awal yang teridentifikasi, sebelum mempertimbangkan pengendalian apa pun.' },
  { label: 'Existing Control', desc: 'Kegiatan Pengendalian (PP 60/2008) — kebijakan & prosedur yang sudah berjalan saat ini.' },
  { label: 'Celah Pengendalian', desc: 'Apakah existing control di atas ada yang bolong/kurang? Dinilai lewat Kategori E/KE/TE.' },
  { label: 'Risiko Residual', desc: 'Sisa risiko nyata yang harus ditanggung Pemda saat ini, setelah memperhitungkan efektivitas existing control.' },
  { label: 'Rencana Tindak Pengendalian (RTP)', desc: 'Aksi mitigasi baru untuk menutup celah yang masih ada.' },
];

/**
 * Info collapsible penjelasan alur Risiko Inherent -> Existing Control ->
 * Celah Pengendalian -> Risiko Residual -> RTP, sesuai PP 60/2008 & Perdep
 * PPKD No.4/2019. Kategori E/KE/TE pada existing control menentukan seberapa
 * besar risiko residual dibanding risiko inherent:
 * - Tidak Efektif (TE): risiko residual = risiko inherent (kontrol dianggap
 *   tidak berfungsi sama sekali).
 * - Kurang Efektif (KE): risiko residual turun sedikit, celah masih
 *   signifikan, RTP wajib disusun.
 * - Efektif (E): risiko residual turun signifikan ke level rendah/dapat
 *   diterima.
 */
export default function RiskCascadeInfo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-md border bg-muted/30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium"
      >
        <span className="flex items-center gap-1.5">
          <Info className="h-4 w-4 text-muted-foreground" />
          Alur Risiko Inherent → Existing Control → Celah → Residual → RTP
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && (
        <div className="space-y-2 border-t px-3 py-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {STEPS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className="rounded border bg-background px-2 py-1 font-medium">{s.label}</span>
                {i < STEPS.length - 1 && <span className="text-muted-foreground">→</span>}
              </div>
            ))}
          </div>
          <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
            {STEPS.map((s) => (
              <li key={s.label}>
                <span className="font-medium text-foreground">{s.label}:</span> {s.desc}
              </li>
            ))}
          </ul>
          <div className="mt-2 space-y-1 rounded border bg-background p-2">
            <p className="font-medium">Panduan Kategori Existing Control:</p>
            <p><span className="font-semibold">Tidak Efektif (TE)</span> — risiko residual = risiko inherent (celah sangat besar/total). RTP sangat prioritas.</p>
            <p><span className="font-semibold">Kurang Efektif (KE)</span> — risiko residual turun sedikit, masih di atas toleransi. RTP wajib.</p>
            <p><span className="font-semibold">Efektif (E)</span> — risiko residual turun signifikan ke level rendah. Cukup dipantau berkala.</p>
          </div>
        </div>
      )}
    </div>
  );
}
