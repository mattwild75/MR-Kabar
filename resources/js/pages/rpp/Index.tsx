import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Perencanaan', href: '#' },
    { title: 'Input RPP', href: '/rpp' },
];

interface RppCategory {
    id: number;
    code: string;
    name: string;
}

interface TeamMember {
    id: number;
    role: string;
    nama: string;
}

interface Rpp {
    id: number;
    year: number;
    nomor_rpp: string;
    nomor_st: string | null;
    uraian: string | null;
    status: string;
    category: RppCategory;
    team_members: TeamMember[];
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

const statusLabel: Record<string, string> = {
    draft: 'Draft',
    st_terbit: 'ST Terbit',
    selesai: 'Selesai',
    lhp_terbit: 'LHP Terbit',
};

const statusVariant: Record<string, 'secondary' | 'default' | 'outline'> = {
    draft: 'outline',
    st_terbit: 'secondary',
    selesai: 'secondary',
    lhp_terbit: 'default',
};

export default function RppIndex({ rpps, categories, filters }: Props) {
    const { delete: destroy, processing } = useForm();

    const handleDelete = (id: number) => {
        destroy(`/rpp/${id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Input RPP" />
            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Input RPP</h1>
                        <p className="text-muted-foreground">Rencana Program Pengawasan &amp; realisasi penugasan.</p>
                    </div>
                    <Link href="/rpp/create">
                        <Button className="w-full md:w-auto" size="sm">
                            + Tambah RPP
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <Link key={cat.id} href={`/rpp?rpp_category_id=${cat.id}${filters.year ? `&year=${filters.year}` : ''}`} preserveScroll>
                            <Badge variant={String(filters.rpp_category_id) === String(cat.id) ? 'default' : 'outline'} className="cursor-pointer">
                                {cat.name}
                            </Badge>
                        </Link>
                    ))}
                </div>

                <div className="bg-background space-y-2 divide-y rounded-md border">
                    {rpps.data.length === 0 ? (
                        <div className="text-muted-foreground py-8 text-center">Belum ada data RPP.</div>
                    ) : (
                        rpps.data.map((rpp) => (
                            <div
                                key={rpp.id}
                                className="hover:bg-muted/50 flex flex-col justify-between gap-4 px-4 py-5 transition md:flex-row md:items-center"
                            >
                                <div className="flex-1 space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-base font-medium">{rpp.nomor_rpp}</span>
                                        <Badge variant="secondary" className="text-xs font-normal">
                                            {rpp.category.name}
                                        </Badge>
                                        <Badge variant={statusVariant[rpp.status]} className="text-xs font-normal">
                                            {statusLabel[rpp.status]}
                                        </Badge>
                                    </div>
                                    {rpp.nomor_st && <div className="text-muted-foreground text-sm">ST: {rpp.nomor_st}</div>}
                                    {rpp.uraian && <div className="text-muted-foreground text-sm">{rpp.uraian}</div>}
                                    {rpp.team_members.length > 0 && (
                                        <div className="text-muted-foreground text-xs">{rpp.team_members.map((m) => m.nama).join(', ')}</div>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2 md:justify-end">
                                    <Link href={`/rpp/${rpp.id}/edit`}>
                                        <Button size="sm" variant="outline">
                                            Edit
                                        </Button>
                                    </Link>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button size="sm" variant="destructive">
                                                Hapus
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Hapus RPP?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    RPP <strong>{rpp.nomor_rpp}</strong> akan dipindahkan ke Data Terhapus.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(rpp.id)} disabled={processing}>
                                                    Ya, Hapus
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
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
