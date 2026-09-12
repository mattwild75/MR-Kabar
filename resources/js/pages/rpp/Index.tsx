import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ThUrut from '@/components/ui/th-urut';
import { useSortableRows } from '@/hooks/use-sortable-rows';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronDown, ChevronRight, FileText, Pencil, Plus, Printer, Search, Table2, Trash2 } from 'lucide-react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Kategori {
    id: number;
    code: string;
    name: string;
    kode_nomor: string | null;
}

interface Anggota {
    nama: string;
    peran: string;
    hari: number;
}

interface Penugasan {
    id: number;
    urutan: number;
    uraian: string | null;
    obriks: string[];
    sifat: string | null;
    jumlah_laporan: number | null;
    tmt: string | null;
    nomor_st: string | null;
    status: string;
    ketua_tim: string | null;
    tim: Anggota[];
}

interface Rpp {
    id: number;
    nomor_rpp: string;
    year: number;
    bulan: number | null;
    sub_judul: string;
    tanggal_rpp: string | null;
    tarif_per_hari: number;
    category: { id: number | null; name: string | null; kode_nomor: string | null };
    pembuat: string | null;
    ringkasan: { hari: number; biaya: number; tim: number; laporan: number; penugasan: number };
    penugasan: Penugasan[];
}

interface Props {
    rpps: Rpp[];
    categories: Kategori[];
    tahunTersedia: number[];
    filters: { tahun: number | 'semua'; jenis: string | null; cari: string };
    inspektur: { nama: string; nip: string | null } | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'ERPIKA', href: '#' },
    { title: 'Perencanaan', href: '#' },
    { title: 'RPP Perencanaan', href: '/rpp' },
];

const statusLabel: Record<string, string> = { draft: 'Draft', st_terbit: 'ST terbit', selesai: 'Selesai', lhp_terbit: 'LHP terbit' };

const rupiah = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

function tanggalPendek(iso: string | null) {
    if (!iso) return '-';
    return new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * RPP Perencanaan — satu baris per DOKUMEN RPP (nomor, bulan, tanggal),
 * dibuka untuk melihat penugasan di dalamnya. Tombol cetak Tabel dan
 * Pengantar ada di tiap baris: pratinjau di layar, PDF lewat Browsershot.
 */
export default function RppIndex({ rpps, categories, tahunTersedia, filters, inspektur }: Props) {
    const [cari, setCari] = useState(filters.cari ?? '');
    const [terbuka, setTerbuka] = useState<Set<number>>(new Set());
    const [hapus, setHapus] = useState<Rpp | null>(null);

    // Pencarian dikirim ke server sesudah jeda ketik, supaya hasilnya
    // konsisten dengan filter tahun/jenis (bukan saring sisi klien saja).
    useEffect(() => {
        if (cari === (filters.cari ?? '')) return;
        const t = setTimeout(() => terapkan({ cari }), 400);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cari]);

    const terapkan = (ubah: Partial<{ tahun: number | string; jenis: string | null; cari: string }>) => {
        const q = { tahun: filters.tahun, jenis: filters.jenis ?? '', cari: filters.cari ?? '', ...ubah };
        router.get('/rpp', Object.fromEntries(Object.entries(q).filter(([, v]) => v !== '' && v !== null)), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const total = useMemo(
        () =>
            rpps.reduce(
                (a, r) => ({
                    penugasan: a.penugasan + r.ringkasan.penugasan,
                    hari: a.hari + r.ringkasan.hari,
                    biaya: a.biaya + r.ringkasan.biaya,
                    laporan: a.laporan + r.ringkasan.laporan,
                }),
                { penugasan: 0, hari: 0, biaya: 0, laporan: 0 },
            ),
        [rpps],
    );

    const toggle = (id: number) => {
        const s = new Set(terbuka);
        if (s.has(id)) s.delete(id);
        else s.add(id);
        setTerbuka(s);
    };

    // kunci datar untuk pengurutan klik-kepala-kolom
    const barisUrut = useMemo(
        () =>
            rpps.map((r) => ({
                ...r,
                s_nomor: r.nomor_rpp,
                s_periode: r.tanggal_rpp ?? `${r.year}-${String(r.bulan ?? 0).padStart(2, '0')}`,
                s_penugasan: r.ringkasan.penugasan,
                s_ketua: (Array.from(new Set(r.penugasan.map((p) => p.ketua_tim).filter(Boolean))) as string[]).join(', '),
                s_hari: r.ringkasan.hari,
                s_biaya: r.ringkasan.biaya,
            })),
        [rpps],
    );
    const { sortedRows, sortField, sortDirection, toggleSort } = useSortableRows(barisUrut);

    const semuaTerbuka = rpps.length > 0 && rpps.every((r) => terbuka.has(r.id));

    const tahunPilihan = filters.tahun === 'semua' || tahunTersedia.includes(filters.tahun) ? tahunTersedia : [filters.tahun, ...tahunTersedia];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="RPP Perencanaan" />
            <div className="space-y-4 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">RPP Perencanaan</h1>
                        <p className="text-muted-foreground text-sm">
                            Rencana Penugasan Pengawasan Inspektorat — satu baris satu dokumen RPP, buka untuk melihat penugasan dan timnya.
                            {inspektur && (
                                <>
                                    {' '}
                                    Penanda tangan: <span className="font-medium">{inspektur.nama}</span> (Inspektur).
                                </>
                            )}
                        </p>
                    </div>
                    <Link href="/rpp/create">
                        <Button className="w-full md:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah RPP
                        </Button>
                    </Link>
                </div>

                {/* Filter */}
                <div className="bg-card flex flex-wrap items-center gap-2 rounded-md border p-3">
                    <Select value={String(filters.tahun)} onValueChange={(v) => terapkan({ tahun: v })}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Tahun" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="semua">Semua tahun</SelectItem>
                            {tahunPilihan.map((t) => (
                                <SelectItem key={t} value={String(t)}>
                                    {t}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={filters.jenis ?? 'semua'} onValueChange={(v) => terapkan({ jenis: v === 'semua' ? null : v })}>
                        <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="Jenis penugasan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="semua">Semua jenis penugasan</SelectItem>
                            {categories.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.name}
                                    {c.kode_nomor ? ` (${c.kode_nomor})` : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="relative min-w-[220px] flex-1">
                        <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                        <Input
                            className="pl-9"
                            placeholder="Cari nomor, obrik, atau nama anggota tim…"
                            value={cari}
                            onChange={(e) => setCari(e.target.value)}
                        />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setTerbuka(semuaTerbuka ? new Set() : new Set(rpps.map((r) => r.id)))}>
                        {semuaTerbuka ? 'Tutup semua' : 'Buka semua'}
                    </Button>
                </div>

                {/* Ringkasan */}
                <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
                    <Ringkas label="Dokumen RPP" nilai={rpps.length} />
                    <Ringkas label="Penugasan" nilai={total.penugasan} />
                    <Ringkas label="Orang-hari" nilai={total.hari} />
                    <Ringkas label="Laporan direncanakan" nilai={total.laporan} />
                    <Ringkas label="Perkiraan biaya" nilai={rupiah(total.biaya)} />
                </div>

                {/* Tabel */}
                <div className="bg-card overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/60 text-muted-foreground text-left text-xs uppercase">
                            <tr>
                                <th className="w-8 px-2 py-2"></th>
                                <ThUrut field="s_nomor" label="Nomor RPP" activeField={sortField} direction={sortDirection} onSort={toggleSort} />
                                <ThUrut field="s_periode" label="Periode" activeField={sortField} direction={sortDirection} onSort={toggleSort} />
                                <ThUrut field="s_penugasan" label="Penugasan" activeField={sortField} direction={sortDirection} onSort={toggleSort} />
                                <ThUrut field="s_ketua" label="Ketua tim" activeField={sortField} direction={sortDirection} onSort={toggleSort} />
                                <ThUrut
                                    field="s_hari"
                                    label="Hari"
                                    activeField={sortField}
                                    direction={sortDirection}
                                    onSort={toggleSort}
                                    className="text-right"
                                />
                                <ThUrut
                                    field="s_biaya"
                                    label="Biaya"
                                    activeField={sortField}
                                    direction={sortDirection}
                                    onSort={toggleSort}
                                    className="text-right"
                                />
                                <th className="px-3 py-2 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {rpps.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="text-muted-foreground py-10 text-center">
                                        Tidak ada RPP {filters.tahun === 'semua' ? 'di tahun mana pun' : `tahun ${filters.tahun}`}
                                        {filters.jenis ? ' untuk jenis ini' : ''}
                                        {filters.cari ? ` yang cocok dengan “${filters.cari}”` : ''}.
                                    </td>
                                </tr>
                            )}
                            {sortedRows.map((r) => {
                                const buka = terbuka.has(r.id);
                                const ketua = Array.from(new Set(r.penugasan.map((p) => p.ketua_tim).filter(Boolean))) as string[];
                                return (
                                    <Fragment key={r.id}>
                                        <tr className="hover:bg-muted/40 cursor-pointer align-top" onClick={() => toggle(r.id)}>
                                            <td className="px-2 py-3">
                                                {buka ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="font-mono font-medium whitespace-nowrap">{r.nomor_rpp}</div>
                                                {filters.tahun === 'semua' && <span className="text-muted-foreground mr-1 text-xs">{r.year}</span>}
                                                <Badge variant="secondary" className="mt-1 text-xs font-normal">
                                                    {r.category.name ?? '-'}
                                                </Badge>
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap">
                                                <div>{r.sub_judul}</div>
                                                <div className="text-muted-foreground text-xs">{tanggalPendek(r.tanggal_rpp)}</div>
                                            </td>
                                            <td className="max-w-[420px] px-3 py-3">
                                                <div className="font-medium">
                                                    {r.ringkasan.penugasan} penugasan · {r.ringkasan.laporan} laporan
                                                </div>
                                                <div className="text-muted-foreground line-clamp-2 text-xs">
                                                    {r.penugasan
                                                        .map((p) => p.uraian)
                                                        .filter(Boolean)
                                                        .join(' · ')}
                                                </div>
                                            </td>
                                            <td className="max-w-[220px] px-3 py-3 text-xs">
                                                {ketua.length ? ketua.join(', ') : <span className="text-muted-foreground">-</span>}
                                            </td>
                                            <td className="px-3 py-3 text-right tabular-nums">{r.ringkasan.hari}</td>
                                            <td className="px-3 py-3 text-right whitespace-nowrap tabular-nums">{rupiah(r.ringkasan.biaya)}</td>
                                            <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex flex-wrap justify-end gap-1">
                                                    <Link href={`/rpp-cetak/${r.id}/tabel/preview`}>
                                                        <Button size="sm" variant="outline" title="Cetak tabel RPP (pratinjau)">
                                                            <Table2 className="mr-1 h-3.5 w-3.5" />
                                                            Tabel
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/rpp-cetak/${r.id}/pengantar/preview`}>
                                                        <Button size="sm" variant="outline" title="Cetak surat pengantar (pratinjau)">
                                                            <FileText className="mr-1 h-3.5 w-3.5" />
                                                            Pengantar
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/rpp/${r.id}/edit`}>
                                                        <Button size="sm" variant="ghost" title="Ubah">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button size="sm" variant="ghost" title="Hapus" onClick={() => setHapus(r)}>
                                                        <Trash2 className="text-destructive h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                        {buka && (
                                            <tr className="bg-muted/20">
                                                <td></td>
                                                <td colSpan={7} className="px-3 pt-1 pb-4">
                                                    <div className="space-y-2">
                                                        {r.penugasan.map((p) => (
                                                            <div key={p.id} className="bg-background rounded border p-3">
                                                                <div className="flex flex-wrap items-start justify-between gap-2">
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="font-medium">
                                                                            {p.urutan}. {p.uraian}
                                                                        </div>
                                                                        {p.obriks.length > 0 && (
                                                                            <ol className="text-muted-foreground mt-1 list-decimal pl-5 text-xs">
                                                                                {p.obriks.map((o, i) => (
                                                                                    <li key={i}>{o}</li>
                                                                                ))}
                                                                            </ol>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-1 text-xs">
                                                                        {p.sifat && <Badge variant="outline">{p.sifat}</Badge>}
                                                                        {p.jumlah_laporan != null && (
                                                                            <Badge variant="outline">{p.jumlah_laporan} laporan</Badge>
                                                                        )}
                                                                        {p.tmt && <Badge variant="outline">{p.tmt}</Badge>}
                                                                        <Badge variant={p.status === 'lhp_terbit' ? 'default' : 'secondary'}>
                                                                            {statusLabel[p.status] ?? p.status}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-2 grid gap-x-4 gap-y-0.5 text-xs sm:grid-cols-2 lg:grid-cols-3">
                                                                    {p.tim.map((m, i) => (
                                                                        <div key={i} className="flex justify-between gap-2">
                                                                            <span className="truncate">
                                                                                {m.nama} <span className="text-muted-foreground">— {m.peran}</span>
                                                                            </span>
                                                                            <span className="text-muted-foreground tabular-nums">{m.hari} hr</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div className="text-muted-foreground text-xs">
                                                            Tarif {rupiah(r.tarif_per_hari)}/hari · {r.ringkasan.tim} orang · dibuat oleh{' '}
                                                            {r.pembuat ?? '-'} ·{' '}
                                                            <a href={`/rpp-cetak/${r.id}/tabel`} className="underline">
                                                                <Printer className="mr-0.5 inline h-3 w-3" />
                                                                PDF tabel
                                                            </a>{' '}
                                                            ·{' '}
                                                            <a href={`/rpp-cetak/${r.id}/pengantar`} className="underline">
                                                                <Printer className="mr-0.5 inline h-3 w-3" />
                                                                PDF pengantar
                                                            </a>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <AlertDialog open={hapus !== null} onOpenChange={(o) => !o && setHapus(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus RPP {hapus?.nomor_rpp}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Dokumen berikut {hapus?.ringkasan.penugasan} penugasannya dipindahkan ke Data Terhapus dan bisa dipulihkan dari sana.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => {
                                if (!hapus) return;
                                router.delete(`/rpp/${hapus.id}`, { preserveScroll: true, onSuccess: () => toast.success('RPP dihapus.') });
                                setHapus(null);
                            }}
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

function Ringkas({ label, nilai }: { label: string; nilai: number | string }) {
    return (
        <div className="bg-card rounded-md border px-3 py-2">
            <div className="text-muted-foreground text-xs">{label}</div>
            <div className="text-base font-semibold tabular-nums">{nilai}</div>
        </div>
    );
}
