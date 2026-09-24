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
import { Eye, FileDown, FileSpreadsheet, FileText, ScrollText, Search, X } from 'lucide-react';
import { useState } from 'react';
import { type KmMeta } from '@/pages/erpika/arep/forms/km';

interface Penugasan {
    id: number;
    nomor_st: string;
    tanggal_st: string | null;
    jenis: string | null;
    objek: string | null;
    ketua_tim: string | null;
    jumlah_tim: number;
}
interface Props {
    penugasan: Penugasan[];
    filter: { tahun: number | string | null; jenis: number | null; cari: string };
    tahunTersedia: number[];
    jenisTersedia: { id: number; name: string }[];
    katalog: KmMeta[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'ERPIKA', href: '#' },
    { title: 'AREP', href: '#' },
    { title: 'Kendali Mutu', href: '/erpika/arep/kendali-mutu' },
];

const SEMUA = '__semua__';

export default function KendaliMutuIndex({ penugasan, filter, tahunTersedia, jenisTersedia, katalog }: Props) {
    const [cari, setCari] = useState(filter.cari ?? '');
    const tahapan = [...new Set(katalog.map((k) => k.tahapan))];

    const terapkan = (patch: Record<string, string | number | null>) => {
        const q: Record<string, string | number> = {};
        const tahun = patch.tahun !== undefined ? patch.tahun : filter.tahun;
        const jenis = patch.jenis !== undefined ? patch.jenis : filter.jenis;
        const kata = patch.cari !== undefined ? patch.cari : cari;
        if (tahun) q.tahun = tahun as number;
        if (jenis) q.jenis = jenis as number;
        if (kata) q.cari = kata as string;
        router.get('/erpika/arep/kendali-mutu', q, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kendali Mutu" />
            <div className="space-y-4 p-4 md:p-6">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Kendali Mutu</h1>
                    <p className="text-muted-foreground text-sm">
                        30 Formulir Kendali Mutu (KMA 1–30) menurut Pedoman Kendali Mutu Audit Inspektorat. Data ditarik dari
                        RPP Perencanaan; cetak per formulir (PDF/Excel), satu halaman tiap formulir.
                    </p>
                </div>

                {/* Keputusan Inspektur */}
                <div className="bg-card flex flex-wrap items-center justify-between gap-3 rounded-md border p-4">
                    <div className="flex items-start gap-3">
                        <ScrollText className="text-muted-foreground mt-0.5 h-5 w-5" />
                        <div>
                            <div className="font-medium">Keputusan Inspektur tentang Pedoman Kendali Mutu Audit</div>
                            <div className="text-muted-foreground text-sm">
                                Draft penetapan pedoman (kerangka baku, siap disunting di Word).
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <a href="/erpika/arep/kendali-mutu/keputusan/preview" target="_blank" rel="noreferrer">
                            <Button variant="outline" size="sm">
                                <Eye className="mr-1 h-4 w-4" /> Lihat
                            </Button>
                        </a>
                        <a href="/erpika/arep/kendali-mutu/keputusan/word">
                            <Button variant="outline" size="sm">
                                <FileText className="mr-1 h-4 w-4" /> Word
                            </Button>
                        </a>
                        <a href="/erpika/arep/kendali-mutu/keputusan/pdf">
                            <Button size="sm">PDF</Button>
                        </a>
                    </div>
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
                                <Input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Nomor ST, objek, nama…" className="h-9 w-56" />
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
                        <Select value={filter.tahun ? String(filter.tahun) : SEMUA} onValueChange={(v) => terapkan({ tahun: v === SEMUA ? null : Number(v) })}>
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
                        <Select value={filter.jenis ? String(filter.jenis) : SEMUA} onValueChange={(v) => terapkan({ jenis: v === SEMUA ? null : Number(v) })}>
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
                                <th className="w-72 px-3 py-2 text-right">Formulir</th>
                            </tr>
                        </thead>
                        <tbody>
                            {penugasan.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-muted-foreground px-3 py-10 text-center">
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
                                        <div className="flex justify-end gap-1">
                                            <Link href={`/erpika/arep/kendali-mutu/${p.id}/preview`}>
                                                <Button size="sm" variant="outline" className="h-8">
                                                    <Eye className="mr-1 h-4 w-4" /> Semua
                                                </Button>
                                            </Link>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="sm" className="h-8">
                                                        <FileDown className="mr-1 h-4 w-4" /> Pilih KM
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="max-h-96 w-72 overflow-y-auto">
                                                    <DropdownMenuItem asChild>
                                                        <a href={`/erpika/arep/kendali-mutu/${p.id}/pdf`}>
                                                            <FileText className="mr-2 h-4 w-4" /> Semua formulir (PDF)
                                                        </a>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <a href={`/erpika/arep/kendali-mutu/${p.id}/excel`}>
                                                            <FileSpreadsheet className="mr-2 h-4 w-4" /> Semua formulir (Excel)
                                                        </a>
                                                    </DropdownMenuItem>
                                                    {tahapan.map((th) => (
                                                        <div key={th}>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuLabel className="text-[11px]">{th}</DropdownMenuLabel>
                                                            {katalog
                                                                .filter((k) => k.tahapan === th)
                                                                .map((k) => (
                                                                    <DropdownMenuItem key={k.no} asChild>
                                                                        <Link
                                                                            href={`/erpika/arep/kendali-mutu/${p.id}/preview?form=${k.no}`}
                                                                        >
                                                                            <span className="text-muted-foreground mr-2 w-10 shrink-0 tabular-nums">
                                                                                {k.kode}
                                                                            </span>
                                                                            <span className="truncate">{k.nama}</span>
                                                                            {k.autofill && (
                                                                                <span className="ml-auto text-[10px] text-emerald-600">auto</span>
                                                                            )}
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                ))}
                                                        </div>
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
