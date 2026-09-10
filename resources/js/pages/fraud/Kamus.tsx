import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Butir {
    id: number;
    sumber: string;
    area: string;
    tahapan_proses: string | null;
    nomor: number | null;
    uraian: string;
}

interface Props {
    butir: Butir[];
    areas: string[];
    areaTerpilih: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'MR Fraud', href: '/fraud/identifikasi' },
    { title: 'Kamus Risiko Kecurangan', href: '/fraud/kamus' },
];

export default function Kamus({ butir, areas, areaTerpilih }: Props) {
    const [cari, setCari] = useState('');

    const tersaring = useMemo(() => {
        const q = cari.trim().toLowerCase();
        if (q === '') return butir;
        return butir.filter((b) => b.uraian.toLowerCase().includes(q) || b.area.toLowerCase().includes(q));
    }, [butir, cari]);

    const pilihArea = (area: string) => {
        router.get('/fraud/kamus', area === areaTerpilih ? {} : { area }, { preserveState: true, preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kamus Risiko Kecurangan" />

            <div className="space-y-4 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Kamus Risiko Kecurangan</h1>
                    <p className="text-muted-foreground text-sm">
                        Daftar risiko kecurangan baku yang boleh dipungut saat mengisi Identifikasi Risiko. Gunanya bukan mempercepat pengetikan:
                        tanpa kamus, tiap Perangkat Daerah merumuskan sendiri risiko yang sebenarnya sama, dan register gabungannya tidak bisa
                        dihitung lintas OPD.
                    </p>
                </div>

                <div className="relative max-w-xl">
                    <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                    <Input className="pl-9" placeholder="Cari risiko atau area…" value={cari} onChange={(e) => setCari(e.target.value)} />
                </div>

                <div className="flex flex-wrap gap-2">
                    {areas.map((a) => (
                        <button
                            key={a}
                            onClick={() => pilihArea(a)}
                            className={
                                a === areaTerpilih
                                    ? 'bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-xs font-medium'
                                    : 'bg-muted hover:bg-muted/70 rounded-md px-3 py-1.5 text-xs'
                            }
                        >
                            {a}
                        </button>
                    ))}
                </div>

                <p className="text-muted-foreground text-sm">
                    {tersaring.length} butir{areaTerpilih ? ` di area ${areaTerpilih}` : ''}
                </p>

                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="border px-3 py-2 text-left">No</th>
                                <th className="border px-3 py-2 text-left">Area</th>
                                <th className="border px-3 py-2 text-left">Uraian Risiko Kecurangan</th>
                                <th className="border px-3 py-2 text-left">Sumber</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tersaring.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-muted-foreground border px-3 py-8 text-center">
                                        Tidak ada butir yang cocok.
                                    </td>
                                </tr>
                            ) : (
                                tersaring.map((b, i) => (
                                    <tr key={b.id} className="align-top">
                                        <td className="border px-3 py-2 tabular-nums">{b.nomor ?? i + 1}</td>
                                        <td className="border px-3 py-2 whitespace-nowrap">{b.area}</td>
                                        <td className="border px-3 py-2">{b.uraian}</td>
                                        <td className="border px-3 py-2">
                                            <Badge variant="secondary" className="text-xs">
                                                {b.sumber}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <p className="text-muted-foreground text-xs">
                    Sumber MCP KPK 2025 berasal dari Monitoring Centre for Prevention — pemantauan aksi pencegahan korupsi oleh KPK berdasarkan
                    Perpres No. 54 Tahun 2018. Ketiga belas areanya adalah area yang memang diperiksa, sehingga daftar ini bukan sekadar contoh.
                </p>
            </div>
        </AppLayout>
    );
}
