import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronDown, ChevronRight, FileText, Pencil, Printer, Search } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';

interface Laporan {
    nomor: string;
    tanggal: string | null;
    jenis: string | null;
}

interface Baris {
    id: number;
    no: number;
    rpp_id: number;
    jenis: { code: string | null; name: string | null };
    nomor_rpp: string;
    tanggal_rpp: string | null;
    nomor_st: string | null;
    tanggal_st: string | null;
    uraian: string | null;
    obriks: { nama: string; laporan: Laporan | null }[];
    laporan_lain: Laporan[];
    jumlah_laporan_terbit: number;
    sifat: string | null;
    tim: { nama: string; role: string; peran: string; singkat: string; dk: number; lk: number }[];
    tmt: string | null;
    capaian_output: string | null;
    status: string;
    keterangan: string | null;
}

interface Props {
    baris: Baris[];
    ringkasan: {
        penugasan: number;
        terbit: number;
        belum: number;
        batal: number;
        laporan: number;
        orang_hari: number;
        per_jenis: { jenis: string; penugasan: number; terbit: number; batal: number; laporan: number }[];
    };
    nomorTerakhir: { jenis: string; jumlah: number; nomor: string; tanggal: string | null }[];
    categories: { id: number; code: string; name: string; kode_nomor: string | null }[];
    tahunTersedia: number[];
    filters: { tahun: number; jenis: string | null; status: string | null; cari: string };
    terakhirSinkron: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'ERPIKA', href: '#' },
    { title: 'ANEVA', href: '#' },
    { title: 'RPP Aneva', href: '/erpika/aneva' },
];

const STATUS: Record<string, { label: string; kelas: string }> = {
    draft: { label: 'Rencana', kelas: 'bg-muted text-muted-foreground' },
    st_terbit: { label: 'ST terbit', kelas: 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200' },
    selesai: { label: 'Selesai', kelas: 'bg-sky-100 text-sky-900 dark:bg-sky-950/40 dark:text-sky-200' },
    lhp_terbit: { label: 'LHP terbit', kelas: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200' },
    batal: { label: 'Batal', kelas: 'bg-red-100 text-red-900 dark:bg-red-950/40 dark:text-red-200' },
};

function tgl(iso: string | null) {
    if (!iso) return '';
    return new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * RPP Analisis dan Evaluasi — realisasi setiap penugasan (ST): RPP-nya, obrik,
 * tim, TMT, dan laporan hasil yang terbit. Satu baris satu ST, seperti rekap
 * Bagian Analisis dan Evaluasi; angka ringkasan di atas menjawab pertanyaan
 * "sudah berapa yang terbit" tanpa harus menggulir tabel.
 */
export default function Aneva({ baris, ringkasan, nomorTerakhir, categories, tahunTersedia, filters, terakhirSinkron }: Props) {
    const [cari, setCari] = useState(filters.cari ?? '');
    const [terbuka, setTerbuka] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (cari === (filters.cari ?? '')) return;
        const t = setTimeout(() => terapkan({ cari }), 400);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cari]);

    const terapkan = (ubah: Partial<{ tahun: string | number; jenis: string | null; status: string | null; cari: string }>) => {
        const q = { tahun: filters.tahun, jenis: filters.jenis ?? '', status: filters.status ?? '', cari: filters.cari ?? '', ...ubah };
        router.get('/erpika/aneva', Object.fromEntries(Object.entries(q).filter(([, v]) => v !== '' && v !== null)), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const toggle = (id: number) => {
        const s = new Set(terbuka);
        if (s.has(id)) s.delete(id);
        else s.add(id);
        setTerbuka(s);
    };
    const semuaTerbuka = baris.length > 0 && baris.every((b) => terbuka.has(b.id));
    const persen = ringkasan.penugasan ? Math.round((ringkasan.terbit / ringkasan.penugasan) * 100) : 0;
    const tahunPilihan = tahunTersedia.includes(filters.tahun) ? tahunTersedia : [filters.tahun, ...tahunTersedia];
    const cetakQuery = `tahun=${filters.tahun}${filters.jenis ? `&jenis=${filters.jenis}` : ''}`;

    let jenisSebelumnya: string | null = null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="RPP Analisis dan Evaluasi" />
            <div className="space-y-4 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">RPP Analisis dan Evaluasi</h1>
                        <p className="text-muted-foreground text-sm">
                            Realisasi tiap penugasan (ST) dari RPP: obrik, tim, masa tugas, dan laporan hasil yang terbit. Data yang sama dengan RPP
                            Perencanaan — mengubah di sana terlihat di sini.
                            {terakhirSinkron && (
                                <> Disamakan dengan rekap Bagian Analisis dan Evaluasi terakhir {tgl(terakhirSinkron.slice(0, 10))}.</>
                            )}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/erpika/aneva/cetak/preview?${cetakQuery}`}>
                            <Button variant="outline">
                                <FileText className="mr-2 h-4 w-4" />
                                Pratinjau rekap
                            </Button>
                        </Link>
                        <a href={`/erpika/aneva/cetak?${cetakQuery}`}>
                            <Button>
                                <Printer className="mr-2 h-4 w-4" />
                                PDF rekap
                            </Button>
                        </a>
                    </div>
                </div>

                {/* Ringkasan tahun */}
                <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                    <Kpi label="Penugasan (ST)" nilai={ringkasan.penugasan} />
                    <Kpi
                        label="LHP terbit"
                        nilai={`${ringkasan.terbit} (${persen}%)`}
                        warna="text-emerald-700 dark:text-emerald-300"
                        onClick={() => terapkan({ status: 'terbit' })}
                        aktif={filters.status === 'terbit'}
                    />
                    <Kpi
                        label="Belum terbit"
                        nilai={ringkasan.belum}
                        warna="text-amber-700 dark:text-amber-300"
                        onClick={() => terapkan({ status: 'belum' })}
                        aktif={filters.status === 'belum'}
                    />
                    <Kpi
                        label="Batal"
                        nilai={ringkasan.batal}
                        warna="text-red-700 dark:text-red-300"
                        onClick={() => terapkan({ status: 'batal' })}
                        aktif={filters.status === 'batal'}
                    />
                    <Kpi label="Laporan terbit" nilai={ringkasan.laporan} />
                    <Kpi label="Orang-hari" nilai={ringkasan.orang_hari} />
                </div>

                <div className="grid gap-3 lg:grid-cols-3">
                    {/* Per jenis */}
                    <div className="bg-card rounded-md border p-3 lg:col-span-2">
                        <div className="mb-2 text-sm font-semibold">Capaian per jenis penugasan {filters.tahun}</div>
                        <div className="space-y-1.5">
                            {ringkasan.per_jenis.map((j) => {
                                const p = j.penugasan ? Math.round((j.terbit / j.penugasan) * 100) : 0;
                                return (
                                    <div key={j.jenis} className="grid grid-cols-[150px_1fr_auto] items-center gap-2 text-xs">
                                        <span className="truncate">{j.jenis}</span>
                                        <div className="bg-muted h-2 overflow-hidden rounded">
                                            <div className="h-full bg-emerald-500" style={{ width: `${p}%` }} />
                                        </div>
                                        <span className="text-muted-foreground tabular-nums">
                                            {j.terbit}/{j.penugasan} ST · {j.laporan} lap{j.batal ? ` · ${j.batal} batal` : ''}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {/* Nomor terakhir */}
                    <div className="bg-card rounded-md border p-3">
                        <div className="mb-2 text-sm font-semibold">Nomor laporan terakhir {filters.tahun}</div>
                        {nomorTerakhir.length === 0 ? (
                            <p className="text-muted-foreground text-xs">Belum ada laporan.</p>
                        ) : (
                            <table className="w-full text-xs">
                                <tbody>
                                    {nomorTerakhir.map((n) => (
                                        <tr key={n.jenis}>
                                            <td className="py-0.5 font-medium">{n.jenis}</td>
                                            <td className="py-0.5 font-mono">{n.nomor}</td>
                                            <td className="text-muted-foreground py-0.5 text-right whitespace-nowrap">
                                                {tgl(n.tanggal)} · {n.jumlah}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Filter */}
                <div className="bg-card flex flex-wrap items-center gap-2 rounded-md border p-3">
                    <Select value={String(filters.tahun)} onValueChange={(v) => terapkan({ tahun: v, status: null })}>
                        <SelectTrigger className="w-[110px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {tahunPilihan.map((t) => (
                                <SelectItem key={t} value={String(t)}>
                                    {t}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={filters.jenis ?? 'semua'} onValueChange={(v) => terapkan({ jenis: v === 'semua' ? null : v })}>
                        <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="Jenis" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="semua">Semua jenis</SelectItem>
                            {categories.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={filters.status ?? 'semua'} onValueChange={(v) => terapkan({ status: v === 'semua' ? null : v })}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="semua">Semua status</SelectItem>
                            <SelectItem value="terbit">LHP terbit</SelectItem>
                            <SelectItem value="belum">Belum terbit</SelectItem>
                            <SelectItem value="batal">Batal</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="relative min-w-[220px] flex-1">
                        <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                        <Input
                            className="pl-9"
                            placeholder="Cari nomor RPP/ST/laporan, obrik, atau nama…"
                            value={cari}
                            onChange={(e) => setCari(e.target.value)}
                        />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setTerbuka(semuaTerbuka ? new Set() : new Set(baris.map((b) => b.id)))}>
                        {semuaTerbuka ? 'Tutup semua' : 'Buka semua'}
                    </Button>
                </div>

                {/* Tabel */}
                <div className="bg-card overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/60 text-muted-foreground text-left text-xs uppercase">
                            <tr>
                                <th className="w-8 px-2 py-2"></th>
                                <th className="px-3 py-2">No</th>
                                <th className="px-3 py-2">RPP / ST</th>
                                <th className="px-3 py-2">Obrik</th>
                                <th className="px-3 py-2">Tim</th>
                                <th className="px-3 py-2">TMT</th>
                                <th className="px-3 py-2">Laporan</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {baris.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="text-muted-foreground py-10 text-center">
                                        Tidak ada penugasan yang cocok.
                                    </td>
                                </tr>
                            )}
                            {baris.map((b) => {
                                const buka = terbuka.has(b.id);
                                const st = STATUS[b.status] ?? STATUS.draft;
                                const kepalaJenis = b.jenis.name !== jenisSebelumnya;
                                jenisSebelumnya = b.jenis.name;
                                const ketua = b.tim.find((m) => m.role === 'kt')?.nama;
                                return (
                                    <Fragment key={b.id}>
                                        {kepalaJenis && !filters.jenis && (
                                            <tr className="bg-muted/40">
                                                <td colSpan={9} className="px-3 py-1.5 text-xs font-semibold tracking-wide uppercase">
                                                    {b.jenis.code}. {b.jenis.name}
                                                </td>
                                            </tr>
                                        )}
                                        <tr className="hover:bg-muted/40 cursor-pointer align-top" onClick={() => toggle(b.id)}>
                                            <td className="px-2 py-2">
                                                {buka ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                            </td>
                                            <td className="px-3 py-2 tabular-nums">{b.no}</td>
                                            <td className="px-3 py-2 whitespace-nowrap">
                                                <div className="font-mono text-xs">{b.nomor_rpp}</div>
                                                <div className="text-muted-foreground text-xs">{tgl(b.tanggal_rpp)}</div>
                                                <div className="mt-1 font-mono text-xs">
                                                    {b.nomor_st ?? <span className="text-muted-foreground">ST belum ada</span>}
                                                </div>
                                                <div className="text-muted-foreground text-xs">{tgl(b.tanggal_st)}</div>
                                            </td>
                                            <td className="max-w-[380px] px-3 py-2">
                                                <div className="line-clamp-2">{b.uraian}</div>
                                                {b.obriks.length > 0 && (
                                                    <div className="text-muted-foreground text-xs">
                                                        {b.obriks.length} obrik{b.sifat ? ` · ${b.sifat}` : ''}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="max-w-[200px] px-3 py-2 text-xs">
                                                {ketua && <div>{ketua}</div>}
                                                <div className="text-muted-foreground">{b.tim.length} orang</div>
                                            </td>
                                            <td className="px-3 py-2 text-xs whitespace-nowrap">{b.tmt ?? '-'}</td>
                                            <td className="px-3 py-2 text-xs">
                                                {b.jumlah_laporan_terbit > 0 ? (
                                                    <span className="font-medium text-emerald-700 dark:text-emerald-300">
                                                        {b.jumlah_laporan_terbit} laporan
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                                {b.capaian_output && <div className="text-muted-foreground">capaian {b.capaian_output}</div>}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${st.kelas}`}>{st.label}</span>
                                                {b.keterangan && <div className="text-muted-foreground mt-1 text-xs">{b.keterangan}</div>}
                                            </td>
                                            <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}>
                                                <Link href={`/rpp/${b.rpp_id}/edit`}>
                                                    <Button size="sm" variant="ghost" title="Ubah di RPP Perencanaan">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                        {buka && (
                                            <tr className="bg-muted/20">
                                                <td></td>
                                                <td colSpan={8} className="px-3 pt-1 pb-4">
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <div>
                                                            <div className="mb-1 text-xs font-semibold">Obrik &amp; laporan</div>
                                                            {b.obriks.length === 0 && b.laporan_lain.length === 0 && (
                                                                <p className="text-muted-foreground text-xs">-</p>
                                                            )}
                                                            <ol className="list-decimal space-y-0.5 pl-5 text-xs">
                                                                {b.obriks.map((o, i) => (
                                                                    <li key={i}>
                                                                        {o.nama}
                                                                        {o.laporan && (
                                                                            <span className="ml-1 font-mono text-emerald-700 dark:text-emerald-300">
                                                                                {o.laporan.nomor}
                                                                                {o.laporan.tanggal && ` (${tgl(o.laporan.tanggal)})`}
                                                                            </span>
                                                                        )}
                                                                    </li>
                                                                ))}
                                                            </ol>
                                                            {b.laporan_lain.map((l, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="mt-0.5 font-mono text-xs text-emerald-700 dark:text-emerald-300"
                                                                >
                                                                    {l.nomor}
                                                                    {l.tanggal && ` (${tgl(l.tanggal)})`}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div>
                                                            <div className="mb-1 text-xs font-semibold">Tim (DK/LK hari)</div>
                                                            <div className="space-y-0.5 text-xs">
                                                                {b.tim.map((m, i) => (
                                                                    <div key={i} className="flex justify-between gap-2">
                                                                        <span>
                                                                            {m.nama}{' '}
                                                                            <span className="text-muted-foreground">— {m.singkat || m.peran}</span>
                                                                        </span>
                                                                        <span className="text-muted-foreground tabular-nums">
                                                                            {m.dk}/{m.lk}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
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
                <p className="text-muted-foreground text-xs">
                    <Badge variant="outline" className="mr-1">
                        Alur
                    </Badge>
                    Perencanaan (RPP) → pelaksanaan/AREP (audit, reviu, evaluasi, pemantauan) → pelaporan (LHA/LHR/LHM/LHE) → analisis dan evaluasi.
                </p>
            </div>
        </AppLayout>
    );
}

function Kpi({
    label,
    nilai,
    warna,
    onClick,
    aktif,
}: {
    label: string;
    nilai: number | string;
    warna?: string;
    onClick?: () => void;
    aktif?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={!onClick}
            className={`bg-card rounded-md border px-3 py-2 text-left ${onClick ? 'hover:bg-muted/50 cursor-pointer' : 'cursor-default'} ${aktif ? 'ring-primary ring-2' : ''}`}
        >
            <div className="text-muted-foreground text-xs">{label}</div>
            <div className={`text-lg font-semibold tabular-nums ${warna ?? ''}`}>{nilai}</div>
        </button>
    );
}
