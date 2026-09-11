import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Perencanaan', href: '#' },
    { title: 'Cetak RPP', href: '/rpp-cetak' },
];

interface RppCategory {
    id: number;
    code: string;
    name: string;
}

interface Rpp {
    id: number;
    year: number;
    nomor_rpp: string;
    nomor_st: string | null;
    category: RppCategory;
}

interface Props {
    rpps: {
        data: Rpp[];
        current_page: number;
        last_page: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    categories: RppCategory[];
    filters: { year?: string; rpp_category_id?: string };
}

export default function RppCetak({ rpps, categories, filters }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cetak RPP" />
            <div className="space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Cetak RPP</h1>
                    <p className="text-muted-foreground">Unduh dokumen Tabel Rencana Penugasan Pengawasan &amp; Surat Pengantar per RPP.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <Link key={cat.id} href={`/rpp-cetak?rpp_category_id=${cat.id}${filters.year ? `&year=${filters.year}` : ''}`} preserveScroll>
                            <Badge variant={String(filters.rpp_category_id) === String(cat.id) ? 'default' : 'outline'} className="cursor-pointer">
                                {cat.name}
                            </Badge>
                        </Link>
                    ))}
                </div>

                <div className="bg-background space-y-2 divide-y rounded-md border">
                    {rpps.data.length === 0 ? (
                        <div className="text-muted-foreground py-8 text-center">Tidak ada data RPP untuk filter ini.</div>
                    ) : (
                        rpps.data.map((rpp) => (
                            <div key={rpp.id} className="flex flex-col justify-between gap-4 px-4 py-5 md:flex-row md:items-center">
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-base font-medium">{rpp.nomor_rpp}</span>
                                        <Badge variant="secondary" className="text-xs font-normal">
                                            {rpp.category.name}
                                        </Badge>
                                    </div>
                                    {rpp.nomor_st && <div className="text-muted-foreground text-sm">ST: {rpp.nomor_st}</div>}
                                </div>
                                <div className="flex flex-wrap gap-2 md:justify-end">
                                    <Link href={`/rpp-cetak/${rpp.id}/tabel/preview`}>
                                        <Button size="sm" variant="outline">
                                            Preview Tabel
                                        </Button>
                                    </Link>
                                    <Link href={`/rpp-cetak/${rpp.id}/pengantar/preview`}>
                                        <Button size="sm" variant="outline">
                                            Preview Pengantar
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {rpps.last_page > 1 && (
                    <div className="flex flex-wrap items-center justify-center gap-1">
                        {rpps.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                preserveScroll
                                className={`rounded-md border px-3 py-1.5 text-sm transition ${
                                    link.active
                                        ? 'bg-primary text-primary-foreground border-white/40'
                                        : link.url
                                          ? 'hover:bg-muted'
                                          : 'text-muted-foreground cursor-not-allowed opacity-50'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
