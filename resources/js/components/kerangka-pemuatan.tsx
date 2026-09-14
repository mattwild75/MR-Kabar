import { Skeleton } from '@/components/ui/skeleton';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/**
 * Kerangka pemuatan saat berpindah HALAMAN (bukan saat menyimpan formulir):
 * muncul hanya bila permintaan berjalan lebih dari 350 ms — halaman ringan
 * berganti tanpa kedipan, halaman berat (dashboard, tabel gabungan) memberi
 * isyarat "sedang datang" alih-alih layar diam. Menumpang di atas isi lama
 * dengan latar tembus supaya konteks halaman sebelumnya masih samar terlihat.
 */
export default function KerangkaPemuatan() {
    const [tampil, setTampil] = useState(false);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | null = null;
        const mulai = router.on('start', (e) => {
            // Hanya kunjungan GET ke halaman lain; pengiriman formulir dan
            // reload sebagian (only: [...]) tidak perlu kerangka.
            const v = e.detail.visit;
            if (v.method !== 'get' || (v.only && v.only.length > 0)) return;
            if (v.url.pathname === window.location.pathname) return;
            timer = setTimeout(() => setTampil(true), 350);
        });
        const selesai = router.on('finish', () => {
            if (timer) clearTimeout(timer);
            timer = null;
            setTampil(false);
        });
        return () => {
            mulai();
            selesai();
            if (timer) clearTimeout(timer);
        };
    }, []);

    if (!tampil) return null;

    return (
        <div className="bg-background/80 absolute inset-0 z-30 p-4 backdrop-blur-[1px] md:p-6" aria-busy="true" aria-live="polite" role="status">
            <span className="sr-only">Memuat halaman…</span>
            <div className="max-w-[1800px] space-y-5 xl:mx-auto">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-72 max-w-full" />
                    <Skeleton className="h-4 w-96 max-w-full" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[0, 1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-28" />
                    ))}
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                    <Skeleton className="h-72" />
                    <Skeleton className="h-72" />
                </div>
            </div>
        </div>
    );
}
