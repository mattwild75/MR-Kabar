import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'ERPIKA', href: '#' },
    { title: 'Laporan Penugasan', href: '#' },
];

/** Disiapkan kosong atas arahan 12 September 2026; isinya menyusul. */
export default function LaporanPenugasan() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Penugasan" />
            <div className="space-y-4 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Laporan Penugasan</h1>
                    <p className="text-muted-foreground text-sm">
                        Laporan hasil penugasan (LHA, LHR, LHM, LHE) — tahap pelaporan sebelum analisis dan evaluasi.
                    </p>
                </div>
                <div className="text-muted-foreground rounded-md border border-dashed p-10 text-center text-sm">
                    Menu ini belum berisi. Alur ERPIKA:{' '}
                    <Link href="/rpp" className="underline">
                        RPP Perencanaan
                    </Link>{' '}
                    → AREP → Laporan Penugasan →{' '}
                    <Link href="/erpika/aneva" className="underline">
                        RPP Analisis dan Evaluasi
                    </Link>
                    .
                </div>
            </div>
        </AppLayout>
    );
}
