import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, FileDown, FileText, PencilLine, Search, X } from 'lucide-react';
import { useState } from 'react';

interface Penugasan {
    id: number;
    nomor_st: string;
    tanggal_st: string | null;
    jenis: string | null;
    nomor_rpp: string | null;
    tahun: number | null;
    objek: string | null;
    ketua_tim: string | null;
    jumlah_tim: number;
    status: string;
}
interface Props {
    penugasan: Penugasan[];
    filter: { tahun: number | string | null; jenis: number | null; cari: string };
    tahunTersedia: number[];
    jenisTersedia: { id: number; name: string }[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'ERPIKA', href: '#' },
    { title: 'AREP', href: '#' },
    { title: 'Surat Tugas', href: '/erpika/arep/surat-tugas' },
];

const SEMUA = '__semua__';

export default function SuratTugasIndex({ penugasan, filter, tahunTersedia, jenisTersedia }: Props) {
    const [cari, setCari] = useState(filter.cari ?? '');

    const terapkan = (patch: Record<string, string | number | null>) => {
        const q: Record<string, string | number> = {};
        const tahun = patch.tahun !== undefined ? patch.tahun : filter.tahun;
        const jenis = patch.jenis !== undefined ? patch.jenis : filter.jenis;
        const kata = patch.cari !== undefined ? patch.cari : cari;
        if (tahun) q.tahun = tahun as number;
        if (jenis) q.jenis = jenis as number;
        if (kata) q.cari = kata as string;
        router.get('/erpika/arep/surat-tugas', q, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Surat Tugas" />
            <div className="space-y-4 p-4 md:p-6">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Surat Tugas</h1>
                    <p className="text-muted-foreground text-sm">
                        Menerbitkan paket penugasan dari RPP Perencanaan: Surat Tugas (ST), Surat Pengantar (SP), dan
                        Pernyataan Independensi dan Integritas. Cetak PDF atau Word.
                    </p>
                </div>

                <div className="flex flex-wrap items-end gap-2">
                    <form
                        className="flex items-end gap-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            terapkan({ cari });
                        }}
                    >
                        <div className="flex flex-col gap-1">
                            <label className="text-muted-foreground text-xs">Cari</label>
                            <div className="flex gap-1">
                                <Input
                                    value={cari}
                                    onChange={(e) => setCari(e.target.value)}
                                    placeholder="Nomor ST, objek, nama…"
                                    className="h-9 w-56"
                                />
                                <Button type="submit" size="sm" className="h-9">
                                    <Search className="mr-1 h-4 w-4" /> Cari
                                </Button>
                                {(cari || filter.cari) && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        className="h-9"
                                        onClick={() => {
                                            setCari('');
                                            terapkan({ cari: '' });
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </form>
                    <div className="flex flex-col gap-1">
                        <label className="text-muted-foreground text-xs">Tahun</label>
                        <Select
                            value={filter.tahun ? String(filter.tahun) : SEMUA}
                            onValueChange={(v) => terapkan({ tahun: v === SEMUA ? null : Number(v) })}
                        >
                            <SelectTrigger className="h-9 w-28">
                                <SelectValue placeholder="Semua" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={SEMUA}>Semua</SelectItem>
                                {tahunTersedia.map((t) => (
                                    <SelectItem key={t} value={String(t)}>
                                        {t}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-muted-foreground text-xs">Jenis</label>
                        <Select
                            value={filter.jenis ? String(filter.jenis) : SEMUA}
                            onValueChange={(v) => terapkan({ jenis: v === SEMUA ? null : Number(v) })}
                        >
                            <SelectTrigger className="h-9 w-44">
                                <SelectValue placeholder="Semua" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={SEMUA}>Semua</SelectItem>
                                {jenisTersedia.map((j) => (
                                    <SelectItem key={j.id} value={String(j.id)}>
                                        {j.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="w-10 px-3 py-2">No</th>
                                <th className="px-3 py-2">Nomor ST</th>
                                <th className="px-3 py-2">Tanggal</th>
                                <th className="px-3 py-2">Jenis</th>
                                <th className="px-3 py-2">Objek Penugasan</th>
                                <th className="px-3 py-2">Ketua Tim</th>
                                <th className="w-64 px-3 py-2 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {penugasan.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-muted-foreground px-3 py-10 text-center">
                                        Tidak ada penugasan ber-Surat Tugas untuk saringan ini.
                                    </td>
                                </tr>
                            )}
                            {penugasan.map((p, i) => (
                                <tr key={p.id} className="border-t align-top">
                                    <td className="px-3 py-2">{i + 1}</td>
                                    <td className="px-3 py-2 font-medium whitespace-nowrap">{p.nomor_st}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{p.tanggal_st ?? '—'}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{p.jenis ?? '—'}</td>
                                    <td className="px-3 py-2">{p.objek ?? '—'}</td>
                                    <td className="px-3 py-2">
                                        {p.ketua_tim ?? '—'}
                                        <span className="text-muted-foreground"> · {p.jumlah_tim} org</span>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex justify-end gap-1">
                                            <Link href={`/erpika/arep/surat-tugas/${p.id}/preview`}>
                                                <Button size="sm" variant="outline" className="h-8">
                                                    <Eye className="mr-1 h-4 w-4" /> Lihat
                                                </Button>
                                            </Link>
                                            <Link href={`/erpika/arep/surat-tugas/${p.id}/preview?edit=1`}>
                                                <Button size="sm" variant="outline" className="h-8">
                                                    <PencilLine className="mr-1 h-4 w-4" /> Edit
                                                </Button>
                                            </Link>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="sm" className="h-8">
                                                        <FileDown className="mr-1 h-4 w-4" /> Cetak
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56">
                                                    <DropdownMenuLabel>Paket lengkap</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <a href={`/erpika/arep/surat-tugas/${p.id}/pdf?dok=semua`}>
                                                            <FileText className="mr-2 h-4 w-4" /> PDF (ST + SP + Pernyataan)
                                                        </a>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <a href={`/erpika/arep/surat-tugas/${p.id}/word?dok=semua`}>
                                                            <FileText className="mr-2 h-4 w-4" /> Word (ST + SP + Pernyataan)
                                                        </a>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuLabel>Per dokumen</DropdownMenuLabel>
                                                    {(
                                                        [
                                                            ['st', 'Surat Tugas'],
                                                            ['sp', 'Surat Pengantar'],
                                                            ['pernyataan', 'Pernyataan Independensi'],
                                                        ] as const
                                                    ).map(([dok, label]) => (
                                                        <DropdownMenuItem key={dok} asChild>
                                                            <a href={`/erpika/arep/surat-tugas/${p.id}/pdf?dok=${dok}`}>
                                                                <FileText className="mr-2 h-4 w-4" /> {label} (PDF)
                                                            </a>
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
