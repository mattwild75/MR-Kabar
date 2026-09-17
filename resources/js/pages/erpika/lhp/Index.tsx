import EmptyState from '@/components/empty-state';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { FolderSearch, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { rupiah, STATUS_LHP, statusKelas, statusLabel, tanggalSingkat } from './lib';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'ERPIKA', href: '#' },
    { title: 'Laporan Penugasan', href: '#' },
    { title: 'Database LHP', href: '/erpika/laporan-penugasan/database-lhp' },
];

interface Baris {
    id: number;
    nomor_lhp: string;
    tanggal_lhp: string | null;
    nomor_st: string | null;
    nama_obrik: string;
    tahun_anggaran: string | null;
    nama_pj: string | null;
    jml_tp: number | null;
    nilai_tp: number;
    jml_temuan: number;
    status_lhp: string;
}

interface Props {
    lhp: {
        data: Baris[];
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { cari: string; tahun: number | null; status: string | null; urut: string };
    tahunTersedia: number[];
    ringkasan: { total: number; tuntas: number; sebagian: number; belum: number; cacat: number; total_temuan: number; nilai_tp: number };
}

const BASE = '/erpika/laporan-penugasan/database-lhp';

export default function LhpIndex({ lhp, filters, tahunTersedia, ringkasan }: Props) {
    const [cari, setCari] = useState(filters.cari ?? '');

    const terapkan = (ubah: Record<string, string | number | null>) => {
        const next: Record<string, string | number> = {};
        const gabung = { cari, tahun: filters.tahun, status: filters.status, urut: filters.urut, ...ubah };
        Object.entries(gabung).forEach(([k, v]) => {
            if (v !== null && v !== '' && !(k === 'urut' && v === 'terbaru')) next[k] = v as string | number;
        });
        router.get(BASE, next, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Database LHP" />
            <div className="space-y-6 p-4 md:p-6">
                <PageHeader
                    title="Database LHP"
                    icon={<FolderSearch />}
                    description="Laporan Hasil Pemeriksaan APIP berikut Temuan, Penyebab, Rekomendasi, dan Tindak Lanjutnya."
                    actions={
                        <Button asChild size="sm">
                            <Link href={`${BASE}/buat`}>
                                <Plus className="h-4 w-4" />
                                Tambah LHP
                            </Link>
                        </Button>
                    }
                />

                {/* Ringkasan — status memakai warna hijau/kuning/merah yang konsisten. */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    <Kartu label="Total LHP" nilai={ringkasan.total} aktif={!filters.status} onClick={() => terapkan({ status: null })} />
                    <Kartu
                        label="Tuntas"
                        nilai={ringkasan.tuntas}
                        warna="text-emerald-700 dark:text-emerald-300"
                        aktif={filters.status === '03'}
                        onClick={() => terapkan({ status: '03' })}
                    />
                    <Kartu
                        label="TL Sebagian"
                        nilai={ringkasan.sebagian}
                        warna="text-amber-700 dark:text-amber-300"
                        aktif={filters.status === '02'}
                        onClick={() => terapkan({ status: '02' })}
                    />
                    <Kartu
                        label="Belum ada TL"
                        nilai={ringkasan.belum}
                        warna="text-red-700 dark:text-red-300"
                        aktif={filters.status === '01'}
                        onClick={() => terapkan({ status: '01' })}
                    />
                    <Kartu label="Total Temuan" nilai={ringkasan.total_temuan} />
                    <Kartu label="Nilai Temuan" nilai={rupiah(ringkasan.nilai_tp)} kecil />
                </div>

                {/* Penyaring */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative min-w-0 flex-1 sm:max-w-sm">
                        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                            value={cari}
                            onChange={(e) => setCari(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && terapkan({ cari })}
                            placeholder="Cari nomor LHP, obrik, ST, atau penanggung jawab…"
                            className="pl-9"
                        />
                    </div>
                    <Select
                        value={filters.tahun ? String(filters.tahun) : 'semua'}
                        onValueChange={(v) => terapkan({ tahun: v === 'semua' ? null : v })}
                    >
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Tahun LHP" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="semua">Semua tahun</SelectItem>
                            {tahunTersedia.map((t) => (
                                <SelectItem key={t} value={String(t)}>
                                    {t}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={filters.status ?? 'semua'} onValueChange={(v) => terapkan({ status: v === 'semua' ? null : v })}>
                        <SelectTrigger className="w-[170px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="semua">Semua status</SelectItem>
                            {Object.entries(STATUS_LHP).map(([k, v]) => (
                                <SelectItem key={k} value={k}>
                                    {v}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={filters.urut} onValueChange={(v) => terapkan({ urut: v })}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Urutkan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="terbaru">Terbaru</SelectItem>
                            <SelectItem value="terlama">Terlama</SelectItem>
                            <SelectItem value="nilai">Nilai temuan</SelectItem>
                            <SelectItem value="obrik">Nama obrik</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="bg-card overflow-x-auto rounded-md border">
                    {lhp.data.length === 0 ? (
                        <EmptyState
                            title="Tidak ada LHP"
                            description={
                                filters.cari ? `Tidak ada LHP yang cocok dengan "${filters.cari}".` : 'LHP yang ditambahkan akan tampil di sini.'
                            }
                        />
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-muted/60 text-muted-foreground text-left text-xs">
                                <tr>
                                    <th className="px-4 py-2.5 font-medium">Nomor LHP</th>
                                    <th className="px-4 py-2.5 font-medium">Objek Pemeriksaan</th>
                                    <th className="px-4 py-2.5 text-center font-medium whitespace-nowrap">Tgl LHP</th>
                                    <th className="px-4 py-2.5 text-center font-medium">Temuan</th>
                                    <th className="px-4 py-2.5 text-right font-medium whitespace-nowrap">Nilai Temuan</th>
                                    <th className="px-4 py-2.5 font-medium">Status</th>
                                    <th className="px-4 py-2.5 text-right font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {lhp.data.map((b) => (
                                    <tr key={b.id} className="hover:bg-muted/40 transition-colors">
                                        <td className="px-4 py-2.5 align-top">
                                            <Link href={`${BASE}/${b.id}`} className="font-medium hover:underline">
                                                {b.nomor_lhp}
                                            </Link>
                                            {b.nomor_st && <div className="text-muted-foreground text-xs">ST {b.nomor_st}</div>}
                                        </td>
                                        <td className="px-4 py-2.5 align-top">
                                            <div className="line-clamp-2 max-w-[42ch]" title={b.nama_obrik}>
                                                {b.nama_obrik}
                                            </div>
                                            {b.nama_pj && <div className="text-muted-foreground text-xs">PJ: {b.nama_pj}</div>}
                                        </td>
                                        <td className="text-muted-foreground px-4 py-2.5 text-center align-top text-xs whitespace-nowrap">
                                            {tanggalSingkat(b.tanggal_lhp)}
                                        </td>
                                        <td className="px-4 py-2.5 text-center align-top tabular-nums">{b.jml_temuan}</td>
                                        <td className="px-4 py-2.5 text-right align-top tabular-nums">{b.nilai_tp > 0 ? rupiah(b.nilai_tp) : '—'}</td>
                                        <td className="px-4 py-2.5 align-top">
                                            <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${statusKelas(b.status_lhp)}`}>
                                                {statusLabel(b.status_lhp)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-right align-top">
                                            <Button asChild size="sm" variant="outline">
                                                <Link href={`${BASE}/${b.id}`}>Lihat</Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
                    <p className="text-muted-foreground text-xs">
                        {lhp.total > 0 ? `Menampilkan ${lhp.from}–${lhp.to} dari ${lhp.total} LHP` : 'Tidak ada data'}
                    </p>
                    {lhp.last_page > 1 && (
                        <div className="flex flex-wrap items-center justify-center gap-1">
                            {lhp.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    preserveScroll
                                    preserveState
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
            </div>
        </AppLayout>
    );
}

function Kartu({
    label,
    nilai,
    warna,
    kecil,
    aktif,
    onClick,
}: {
    label: string;
    nilai: number | string;
    warna?: string;
    kecil?: boolean;
    aktif?: boolean;
    onClick?: () => void;
}) {
    const isi = (
        <>
            <div className="text-muted-foreground text-xs">{label}</div>
            <div className={`mt-1 font-semibold tabular-nums ${kecil ? 'text-base' : 'text-2xl'} ${warna ?? ''}`}>{nilai}</div>
        </>
    );
    if (!onClick) return <div className="bg-card rounded-md border p-3">{isi}</div>;
    return (
        <button
            type="button"
            onClick={onClick}
            className={`bg-card rounded-md border p-3 text-left transition hover:shadow-sm ${aktif ? 'ring-primary ring-2' : 'hover:border-foreground/20'}`}
        >
            {isi}
        </button>
    );
}
