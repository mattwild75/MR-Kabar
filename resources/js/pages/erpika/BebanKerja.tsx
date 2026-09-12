import { Button } from '@/components/ui/button';
import ThUrut from '@/components/ui/th-urut';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Baris {
    employee_id: number | null;
    nama: string;
    penugasan: number;
    dk: number;
    lk: number;
    biaya: number;
    jenis: Record<string, number>;
    peran: Record<string, number>;
}

interface Props {
    baris: Baris[];
    total: { pegawai: number; pegawai_aktif: number; penugasan: number; dk: number; lk: number; biaya: number };
    tarif: { dalam: number; luar: number };
    tahunTersedia: number[];
    filters: { tahun: number | 'semua' };
}

const rp = (n: number) => 'Rp' + n.toLocaleString('id-ID');

/**
 * ERPIKA → Beban Kerja: rekap hari DK/LK, biaya SPPD (LK x tarif lokasi),
 * jumlah penugasan, sebaran jenis dan peran per pegawai per tahun.
 * Bisa dicetak (Ctrl+P) — gaya cetak menyembunyikan kontrol.
 */
export default function BebanKerja({ baris, total, tarif, tahunTersedia, filters }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'ERPIKA', href: '#' },
        { title: 'Beban Kerja', href: '/erpika/beban-kerja' },
    ];
    const [urut, setUrut] = useState<{ kolom: string; arah: 'asc' | 'desc' }>({ kolom: 'hari', arah: 'desc' });
    const onSort = (kolom: string) => setUrut((u) => ({ kolom, arah: u.kolom === kolom && u.arah === 'desc' ? 'asc' : 'desc' }));
    const data = useMemo(() => {
        const nilai = (b: Baris): number | string => (urut.kolom === 'hari' ? b.dk + b.lk : (b[urut.kolom as keyof Baris] as number | string));
        return [...baris].sort((a, b) => {
            const x = nilai(a);
            const y = nilai(b);
            const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'id');
            return urut.arah === 'asc' ? c : -c;
        });
    }, [baris, urut]);
    const rataHari = total.pegawai ? Math.round((total.dk + total.lk) / total.pegawai) : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Beban Kerja ${filters.tahun}`} />
            <style>{`@media print { .print\\:hidden { display: none !important; } .min-h-svh { min-height: 0 !important; } }`}</style>
            <div className="space-y-4 p-4 md:p-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Beban Kerja Pegawai {filters.tahun === 'semua' ? 'Seluruh Tahun' : filters.tahun}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Hari DK/LK dan biaya SPPD dari tim RPP (LK x tarif: dalam Kec. Johan Pahlawan {rp(tarif.dalam)}, luar {rp(tarif.luar)}).
                            Penugasan batal tidak dihitung.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 print:hidden">
                        <select
                            className="rounded border px-2 py-1 text-sm"
                            value={String(filters.tahun)}
                            onChange={(e) => router.get('/erpika/beban-kerja', { tahun: e.target.value }, { preserveState: true })}
                        >
                            <option value="semua">Semua tahun</option>
                            {tahunTersedia.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                        <Button variant="outline" size="sm" onClick={() => window.print()}>
                            <Printer className="mr-2 h-4 w-4" />
                            Cetak
                        </Button>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {[
                        ['Pegawai bertugas', `${total.pegawai} / ${total.pegawai_aktif} aktif`],
                        ['Penugasan', total.penugasan],
                        ['Hari DK', total.dk],
                        ['Hari LK', total.lk],
                        ['Rata-rata hari/orang', rataHari],
                        ['Biaya SPPD', rp(total.biaya)],
                    ].map(([k, v]) => (
                        <div key={String(k)} className="rounded-md border p-3">
                            <div className="text-muted-foreground text-xs">{k}</div>
                            <div className="text-lg font-semibold">{v}</div>
                        </div>
                    ))}
                </div>

                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-2 py-2 text-left">#</th>
                                <ThUrut
                                    field="nama"
                                    label="Nama"
                                    activeField={urut.kolom}
                                    direction={urut.arah}
                                    onSort={onSort}
                                    className="text-left"
                                />
                                <ThUrut
                                    field="penugasan"
                                    label="Penugasan"
                                    activeField={urut.kolom}
                                    direction={urut.arah}
                                    onSort={onSort}
                                    className="text-left"
                                />
                                <ThUrut field="dk" label="DK" activeField={urut.kolom} direction={urut.arah} onSort={onSort} className="text-left" />
                                <ThUrut field="lk" label="LK" activeField={urut.kolom} direction={urut.arah} onSort={onSort} className="text-left" />
                                <ThUrut
                                    field="hari"
                                    label="Total hari"
                                    activeField={urut.kolom}
                                    direction={urut.arah}
                                    onSort={onSort}
                                    className="text-left"
                                />
                                <ThUrut
                                    field="biaya"
                                    label="Biaya SPPD"
                                    activeField={urut.kolom}
                                    direction={urut.arah}
                                    onSort={onSort}
                                    className="text-left"
                                />
                                <th className="px-2 py-2 text-left">Jenis</th>
                                <th className="px-2 py-2 text-left">Peran</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((b, i) => (
                                <tr key={b.employee_id ?? b.nama} className="border-t">
                                    <td className="px-2 py-1">{i + 1}</td>
                                    <td className="px-2 py-1 font-medium whitespace-nowrap">
                                        {b.employee_id ? (
                                            <Link href={`/erpika/pegawai?cari=${encodeURIComponent(b.nama)}`} className="underline">
                                                {b.nama}
                                            </Link>
                                        ) : (
                                            b.nama
                                        )}
                                    </td>
                                    <td className="px-2 py-1 text-right tabular-nums">{b.penugasan}</td>
                                    <td className="px-2 py-1 text-right tabular-nums">{b.dk}</td>
                                    <td className="px-2 py-1 text-right tabular-nums">{b.lk}</td>
                                    <td className="px-2 py-1 text-right font-medium tabular-nums">{b.dk + b.lk}</td>
                                    <td className="px-2 py-1 text-right tabular-nums">{rp(b.biaya)}</td>
                                    <td className="px-2 py-1 text-xs">
                                        {Object.entries(b.jenis)
                                            .sort((x, y) => y[1] - x[1])
                                            .map(([j, n]) => `${j} ${n}`)
                                            .join(', ')}
                                    </td>
                                    <td className="px-2 py-1 text-xs">
                                        {Object.entries(b.peran)
                                            .sort((x, y) => y[1] - x[1])
                                            .map(([j, n]) => `${j} ${n}`)
                                            .join(', ')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-muted/50 font-medium">
                            <tr>
                                <td className="px-2 py-2" colSpan={2}>
                                    Jumlah
                                </td>
                                <td className="px-2 py-2 text-right tabular-nums">{total.penugasan}</td>
                                <td className="px-2 py-2 text-right tabular-nums">{total.dk}</td>
                                <td className="px-2 py-2 text-right tabular-nums">{total.lk}</td>
                                <td className="px-2 py-2 text-right tabular-nums">{total.dk + total.lk}</td>
                                <td className="px-2 py-2 text-right tabular-nums">{rp(total.biaya)}</td>
                                <td colSpan={2} />
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
