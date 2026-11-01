import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { IsianKurang } from '@/lib/periksa-isian-risiko';

/**
 * Peringatan isian wajib yang belum lengkap di Form Input Risiko. Muncul
 * setelah Simpan ditekan (tombol Simpan ditahan selama daftar belum kosong)
 * dan ikut berkurang seketika saat isian dilengkapi. Setiap butir dapat
 * diklik untuk menggulir ke kolomnya.
 */
export default function DaftarIsianWajib({ kurang, judulBagian }: { kurang: IsianKurang[]; judulBagian: string[] }) {
    if (kurang.length === 0) {
        return (
            <p role="status" className="flex items-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 p-2.5 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Semua isian wajib sudah lengkap. Silakan tekan Simpan.
            </p>
        );
    }

    const gulir = (b: IsianKurang) => {
        const el = document.getElementById(b.target) ?? document.getElementById(`bagian-form-${b.bagian}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (el instanceof HTMLElement && typeof el.focus === 'function') el.focus({ preventScroll: true });
    };

    const perBagian = [1, 2, 3, 4].map((n) => ({ n, butir: kurang.filter((b) => b.bagian === n) })).filter((g) => g.butir.length > 0);

    return (
        <div role="alert" className="space-y-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
            <p className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Data belum dapat disimpan: {kurang.length} isian wajib belum diisi atau dipilih.
            </p>
            {perBagian.map((g) => (
                <div key={g.n}>
                    <p className="text-xs font-semibold tracking-wide uppercase opacity-80">
                        {g.n}. {judulBagian[g.n - 1]}
                    </p>
                    <ul className="mt-0.5 list-disc space-y-0.5 pl-5">
                        {g.butir.map((b, i) => (
                            <li key={`${b.target}-${i}`}>
                                <button type="button" onClick={() => gulir(b)} className="inline text-left underline-offset-2 hover:underline">
                                    {b.pesan}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
