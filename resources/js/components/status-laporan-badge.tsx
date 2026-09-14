import { CheckCircle2, CircleDot, Search, Wrench } from 'lucide-react';

/**
 * Lencana status laporan (Kejadian Risiko dan Dugaan Kecurangan) — SATU
 * bahasa visual untuk empat status yang sama di Rekap, MR Fraud, dan Cek
 * Status: warna yang sama berarti tahap yang sama, dan tiap status membawa
 * ikonnya sendiri supaya tetap terbaca tanpa mengandalkan warna.
 *
 *   baru            biru    — masuk, belum ditelaah
 *   diverifikasi    amber   — sedang ditelaah/diverifikasi
 *   ditindaklanjuti ungu    — sedang ditangani
 *   selesai         hijau   — tuntas
 */
const STATUS = {
    baru: { label: 'Baru', kelas: 'bg-sky-500/12 text-sky-700 ring-sky-500/30 dark:text-sky-300', Ikon: CircleDot },
    diverifikasi: { label: 'Diverifikasi', kelas: 'bg-amber-500/12 text-amber-700 ring-amber-500/30 dark:text-amber-300', Ikon: Search },
    ditindaklanjuti: { label: 'Ditindaklanjuti', kelas: 'bg-violet-500/12 text-violet-700 ring-violet-500/30 dark:text-violet-300', Ikon: Wrench },
    selesai: { label: 'Selesai', kelas: 'bg-emerald-500/12 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300', Ikon: CheckCircle2 },
} as const;

export const STATUS_LAPORAN_LABEL: Record<string, string> = Object.fromEntries(Object.entries(STATUS).map(([k, v]) => [k, v.label]));

export default function StatusLaporanBadge({ status, className = '' }: { status: string; className?: string }) {
    const s = STATUS[status as keyof typeof STATUS];
    if (!s) {
        return (
            <span className={`bg-muted text-muted-foreground inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{status}</span>
        );
    }
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${s.kelas} ${className}`}>
            <s.Ikon className="h-3 w-3" aria-hidden="true" />
            {s.label}
        </span>
    );
}
