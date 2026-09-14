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
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ChevronDown, ChevronRight, Database, Eraser, HardDrive, Lock, RefreshCw, Search, Sparkles, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

type Jenis = 'media' | 'cadangan' | 'log' | 'sementara';

interface Butir {
    nama: string;
    ukuran: number;
    tanggal: string | null;
    keterangan: string;
    /** Terisi hanya bila butir ini boleh dihapus dari halaman ini. */
    jenis: Jenis | null;
    id: string | null;
}

interface Kelompok {
    kode: string;
    judul: string;
    keterangan: string;
    ukuran: number;
    jumlah: number | null;
    aman: boolean;
    butir: Butir[];
}

interface Props {
    potret: {
        disk: { total: number; terpakai: number; bebas: number; persen: number };
        kelompok: Kelompok[];
        dihitung_pada: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Utilities', href: '#' },
    { title: 'Storage', href: '/penyimpanan' },
];

/*
 * Dua warna saja, menurut PEKERJAANNYA, bukan satu warna per kelompok:
 * biru = hanya dibaca (sistem), amber = dapat dikosongkan dari halaman ini.
 * Tiga belas kelompok dengan tiga belas warna tidak bisa dibedakan siapa
 * pun; yang perlu terlihat sekilas hanyalah "seberapa besar yang bisa
 * saya kosongkan". sky-600 dan amber-600 lolos pemeriksaan buta warna dan
 * kontras pada latar terang maupun gelap. Segmen sewarna yang bersebelahan
 * dipisah celah 2px supaya tetap terbaca sebagai kelompok berbeda.
 */
const WARNA = { baca: 'bg-sky-600', aman: 'bg-amber-600', bebas: 'bg-muted-foreground/15' } as const;

/* Satuan desimal (1 GB = 1.000.000.000 bita), sama dengan satuan yang
   dipakai penyedia VM saat menyebut "disk 50 GB" — dengan satuan biner
   (GiB) disk yang sama terbaca 47 GB dan angkanya seolah tidak cocok. */
export function formatUkuran(b: number): string {
    if (b >= 1e9) return `${(b / 1e9).toFixed(2).replace('.', ',')} GB`;
    if (b >= 1e6) return `${(b / 1e6).toFixed(1).replace('.', ',')} MB`;
    if (b >= 1e3) return `${(b / 1e3).toFixed(0)} KB`;
    return `${Math.round(b)} B`;
}

const persen = (bagian: number, total: number) => (total > 0 ? (bagian / total) * 100 : 0);
const fmtPersen = (p: number) => (p > 0 && p < 0.1 ? '<0,1%' : `${p.toFixed(1).replace('.', ',')}%`);
const kunci = (b: Butir) => `${b.jenis}:${b.id}`;

/**
 * Utilities > Storage. Ringkasan disk, batang pemakaian, lalu daftar kelompok
 * yang bisa dibuka satu per satu. Tombol hapus dan kotak centang hanya muncul
 * pada butir yang server nyatakan aman (jenis + id terisi); pembatasan
 * sesungguhnya ada di PenyimpananService — tampilan ini sekadar cermin.
 */
export default function StorageIndex({ potret }: Props) {
    const { disk, kelompok } = potret;
    const [buka, setBuka] = useState<Record<string, boolean>>({});
    const [cari, setCari] = useState<Record<string, string>>({});
    const [pilih, setPilih] = useState<Record<string, Butir>>({});
    const [konfirmasi, setKonfirmasi] = useState<Butir[] | null>(null);
    const [sibuk, setSibuk] = useState(false);

    const aman = kelompok.filter((k) => k.aman).reduce((s, k) => s + k.ukuran, 0);
    const urut = useMemo(() => [...kelompok].sort((a, b) => b.ukuran - a.ukuran), [kelompok]);
    const terpilih = Object.values(pilih);
    const ukuranTerpilih = terpilih.reduce((s, b) => s + b.ukuran, 0);

    const hapus = (daftar: Butir[]) => {
        setSibuk(true);
        router.delete('/penyimpanan', {
            data: { butir: daftar.map((b) => ({ jenis: b.jenis, id: b.id })) },
            preserveScroll: true,
            onSuccess: () => setPilih({}),
            onFinish: () => {
                setSibuk(false);
                setKonfirmasi(null);
            },
        });
    };

    const togglePilih = (b: Butir) =>
        setPilih((p) => {
            const k = kunci(b);
            const baru = { ...p };
            if (baru[k]) delete baru[k];
            else baru[k] = b;
            return baru;
        });

    const ringkasan = [
        { label: 'Kapasitas disk', nilai: formatUkuran(disk.total), sub: 'yang diberikan untuk server', Ikon: HardDrive },
        { label: 'Terpakai', nilai: formatUkuran(disk.terpakai), sub: `${fmtPersen(disk.persen)} dari kapasitas`, Ikon: Database },
        { label: 'Bebas', nilai: formatUkuran(disk.bebas), sub: `${fmtPersen(100 - disk.persen)} masih kosong`, Ikon: Sparkles },
        { label: 'Dapat dikosongkan', nilai: formatUkuran(aman), sub: 'dari halaman ini, tanpa merusak aplikasi', Ikon: Eraser, aksen: true },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Storage" />
            <div className="space-y-5 p-4 pb-24">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                        <HardDrive className="mt-0.5 h-6 w-6 shrink-0" />
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Storage</h1>
                            <p className="text-muted-foreground max-w-2xl text-sm">
                                Pemakaian disk server secara rinci: MR Kabar, ERPIKA, basis data, cadangan, unggahan, sampai sistem operasi. Kelompok
                                bertanda <Lock className="inline h-3.5 w-3.5 align-text-bottom" /> hanya dibaca; yang boleh dihapus hanya berkas yang
                                hilangnya tidak merusak aplikasi.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.get('/penyimpanan', { segar: 1 }, { preserveScroll: true })}>
                            <RefreshCw className="h-4 w-4" />
                            Hitung ulang
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => router.post('/penyimpanan/bersihkan-cache', {}, { preserveScroll: true })}>
                            <Eraser className="h-4 w-4" />
                            Bersihkan cache
                        </Button>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {ringkasan.map(({ label, nilai, sub, Ikon, aksen }) => (
                        <Card key={label} className={aksen ? 'border-amber-600/40' : undefined}>
                            <CardContent className="flex items-start justify-between gap-3 p-4">
                                <div className="min-w-0">
                                    <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
                                    <p className="mt-1 text-2xl font-semibold tabular-nums">{nilai}</p>
                                    <p className="text-muted-foreground mt-0.5 text-xs">{sub}</p>
                                </div>
                                <Ikon className={`h-5 w-5 shrink-0 ${aksen ? 'text-amber-600' : 'text-muted-foreground'}`} />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardContent className="p-4">
                        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                            <p className="text-sm font-medium">Pemakaian per kelompok</p>
                            <p className="text-muted-foreground text-xs">Arahkan kursor ke batang untuk nama dan ukurannya</p>
                        </div>
                        <div
                            className="bg-muted flex h-6 w-full gap-[2px] overflow-hidden rounded-md"
                            role="img"
                            aria-label="Batang pemakaian disk per kelompok"
                        >
                            {urut.map((k) => {
                                const lebar = persen(k.ukuran, disk.total);
                                if (lebar <= 0) return null;
                                return (
                                    <Tooltip key={k.kode}>
                                        <TooltipTrigger asChild>
                                            <div
                                                className={`${k.aman ? WARNA.aman : WARNA.baca} h-full transition-opacity hover:opacity-80`}
                                                style={{ width: `${Math.max(lebar, 0.3)}%` }}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                            <p className="font-medium">{k.judul}</p>
                                            <p className="tabular-nums">
                                                {formatUkuran(k.ukuran)} · {fmtPersen(lebar)} dari disk ·{' '}
                                                {k.aman ? 'dapat dikosongkan' : 'hanya dibaca'}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            })}
                            <div className={`${WARNA.bebas} h-full flex-1`} title={`Bebas ${formatUkuran(disk.bebas)}`} />
                        </div>
                        <div className="text-muted-foreground mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs">
                            <span className="inline-flex items-center gap-1.5">
                                <span className={`inline-block h-2.5 w-2.5 rounded-sm ${WARNA.baca}`} /> Hanya dibaca{' '}
                                <span className="text-foreground tabular-nums">{formatUkuran(disk.terpakai - aman)}</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className={`inline-block h-2.5 w-2.5 rounded-sm ${WARNA.aman}`} /> Dapat dikosongkan{' '}
                                <span className="text-foreground tabular-nums">{formatUkuran(aman)}</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className={`inline-block h-2.5 w-2.5 rounded-sm border ${WARNA.bebas}`} /> Bebas{' '}
                                <span className="text-foreground tabular-nums">{formatUkuran(disk.bebas)}</span>
                            </span>
                            <span className="ml-auto">
                                1 GB = 1.000 MB (satuan penyedia disk) · dihitung {potret.dihitung_pada} · disegarkan otomatis tiap 10 menit
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-2">
                    {urut.map((k) => {
                        const terbuka = !!buka[k.kode];
                        const q = (cari[k.kode] ?? '').toLowerCase();
                        const daftar = q ? k.butir.filter((b) => `${b.nama} ${b.keterangan}`.toLowerCase().includes(q)) : k.butir;
                        const bisaPilih = daftar.filter((b) => b.jenis && b.id);
                        const semuaTerpilih = bisaPilih.length > 0 && bisaPilih.every((b) => pilih[kunci(b)]);
                        const porsi = persen(k.ukuran, disk.terpakai);
                        return (
                            <Card key={k.kode} className="overflow-hidden">
                                <button
                                    type="button"
                                    className="hover:bg-muted/40 flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
                                    onClick={() => setBuka((b) => ({ ...b, [k.kode]: !terbuka }))}
                                    aria-expanded={terbuka}
                                >
                                    {terbuka ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                                    <span className="min-w-0 flex-1">
                                        <span className="flex flex-wrap items-center gap-2">
                                            <span className="font-medium">{k.judul}</span>
                                            {k.aman ? (
                                                <Badge variant="outline" className="border-amber-600/60 text-amber-700 dark:text-amber-400">
                                                    dapat dikosongkan
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="gap-1">
                                                    <Lock className="h-3 w-3" /> hanya dibaca
                                                </Badge>
                                            )}
                                            {k.jumlah !== null && (
                                                <span className="text-muted-foreground text-xs tabular-nums">{k.jumlah} butir</span>
                                            )}
                                        </span>
                                        <span className="text-muted-foreground mt-0.5 block text-xs">{k.keterangan}</span>
                                    </span>
                                    <span className="hidden w-40 shrink-0 sm:block">
                                        <span className="bg-muted block h-1.5 w-full overflow-hidden rounded-full">
                                            <span
                                                className={`block h-full rounded-full ${k.aman ? WARNA.aman : WARNA.baca}`}
                                                style={{ width: `${Math.min(100, Math.max(porsi, k.ukuran > 0 ? 1 : 0))}%` }}
                                            />
                                        </span>
                                        <span className="text-muted-foreground mt-1 block text-right text-[11px] tabular-nums">
                                            {fmtPersen(porsi)} dari terpakai
                                        </span>
                                    </span>
                                    <span className="w-24 shrink-0 text-right text-sm font-semibold tabular-nums">{formatUkuran(k.ukuran)}</span>
                                </button>

                                {terbuka && (
                                    <CardContent className="border-t pt-3">
                                        {k.butir.length === 0 ? (
                                            <p className="text-muted-foreground text-sm">
                                                {k.kode === 'sistem'
                                                    ? 'Tidak dirinci — semua yang berada di luar folder aplikasi (Ubuntu, paket server, log sistem).'
                                                    : 'Kosong.'}
                                            </p>
                                        ) : (
                                            <>
                                                {(k.butir.length > 8 || bisaPilih.length > 0) && (
                                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                                        {k.butir.length > 8 && (
                                                            <div className="relative">
                                                                <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                                                                <Input
                                                                    value={cari[k.kode] ?? ''}
                                                                    onChange={(e) => setCari((c) => ({ ...c, [k.kode]: e.target.value }))}
                                                                    placeholder="Saring berkas..."
                                                                    className="h-9 w-64 pl-8"
                                                                />
                                                            </div>
                                                        )}
                                                        {bisaPilih.length > 0 && (
                                                            <label className="text-muted-foreground inline-flex items-center gap-2 text-xs">
                                                                <Checkbox
                                                                    checked={semuaTerpilih}
                                                                    onCheckedChange={(c) =>
                                                                        setPilih((p) => {
                                                                            const baru = { ...p };
                                                                            bisaPilih.forEach((b) => {
                                                                                if (c) baru[kunci(b)] = b;
                                                                                else delete baru[kunci(b)];
                                                                            });
                                                                            return baru;
                                                                        })
                                                                    }
                                                                />
                                                                pilih semua yang boleh dihapus ({bisaPilih.length})
                                                            </label>
                                                        )}
                                                        <span className="text-muted-foreground ml-auto text-xs tabular-nums">
                                                            {daftar.length} dari {k.butir.length} butir
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="text-muted-foreground border-b text-left text-xs">
                                                                {bisaPilih.length > 0 && <th className="w-8 py-1" aria-label="Pilih" />}
                                                                <th className="py-1 pr-2 font-medium">Berkas</th>
                                                                <th className="py-1 pr-2 font-medium">Keterangan</th>
                                                                <th className="py-1 pr-2 font-medium">Tanggal</th>
                                                                <th className="py-1 pr-2 text-right font-medium">Ukuran</th>
                                                                <th className="w-32 py-1 pr-2 text-right font-medium">Porsi kelompok</th>
                                                                <th className="w-9 py-1" aria-label="Aksi" />
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {daftar.map((b, i) => {
                                                                const bisa = !!(b.jenis && b.id);
                                                                const dipilih = bisa && !!pilih[kunci(b)];
                                                                return (
                                                                    <tr
                                                                        key={`${b.nama}-${i}`}
                                                                        className={`border-b last:border-0 ${dipilih ? 'bg-amber-600/10' : ''}`}
                                                                    >
                                                                        {bisaPilih.length > 0 && (
                                                                            <td className="py-1">
                                                                                {bisa && (
                                                                                    <Checkbox
                                                                                        checked={dipilih}
                                                                                        onCheckedChange={() => togglePilih(b)}
                                                                                        aria-label={`Pilih ${b.nama}`}
                                                                                    />
                                                                                )}
                                                                            </td>
                                                                        )}
                                                                        <td
                                                                            className="max-w-[420px] truncate py-1 pr-2 font-mono text-xs"
                                                                            title={b.nama}
                                                                        >
                                                                            {b.nama}
                                                                        </td>
                                                                        <td className="text-muted-foreground py-1 pr-2 text-xs">{b.keterangan}</td>
                                                                        <td className="text-muted-foreground py-1 pr-2 text-xs whitespace-nowrap tabular-nums">
                                                                            {b.tanggal ?? ''}
                                                                        </td>
                                                                        <td className="py-1 pr-2 text-right whitespace-nowrap tabular-nums">
                                                                            {formatUkuran(b.ukuran)}
                                                                        </td>
                                                                        <td className="py-1 pr-2">
                                                                            <div className="flex items-center justify-end gap-2">
                                                                                <span className="bg-muted block h-1.5 w-16 overflow-hidden rounded-full">
                                                                                    <span
                                                                                        className={`block h-full ${k.aman ? WARNA.aman : WARNA.baca}`}
                                                                                        style={{
                                                                                            width: `${Math.min(100, persen(b.ukuran, k.ukuran))}%`,
                                                                                        }}
                                                                                    />
                                                                                </span>
                                                                                <span className="text-muted-foreground w-12 text-right text-[11px] tabular-nums">
                                                                                    {fmtPersen(persen(b.ukuran, k.ukuran))}
                                                                                </span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="py-1 text-right">
                                                                            {bisa ? (
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="text-destructive h-7 w-7"
                                                                                    aria-label={`Hapus ${b.nama}`}
                                                                                    onClick={() => setKonfirmasi([b])}
                                                                                >
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                </Button>
                                                                            ) : (
                                                                                <Lock
                                                                                    className="text-muted-foreground/50 ml-auto h-3.5 w-3.5"
                                                                                    aria-label="hanya dibaca"
                                                                                />
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })}
                </div>
            </div>

            {terpilih.length > 0 && (
                <div className="bg-background/95 fixed inset-x-0 bottom-0 z-40 border-t p-3 shadow-lg backdrop-blur">
                    <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
                        <p className="text-sm">
                            <span className="font-medium tabular-nums">{terpilih.length} berkas</span> dipilih ·{' '}
                            <span className="tabular-nums">{formatUkuran(ukuranTerpilih)}</span> akan dikosongkan
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setPilih({})}>
                                Batalkan pilihan
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => setKonfirmasi(terpilih)}>
                                <Trash2 className="h-4 w-4" />
                                Hapus terpilih
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <AlertDialog open={!!konfirmasi} onOpenChange={(o) => !o && !sibuk && setKonfirmasi(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {konfirmasi && konfirmasi.length > 1 ? `Hapus ${konfirmasi.length} berkas ini?` : 'Hapus berkas ini?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-2 text-sm">
                                <ul className="max-h-48 space-y-0.5 overflow-y-auto font-mono text-xs">
                                    {konfirmasi?.slice(0, 50).map((b) => (
                                        <li key={kunci(b)} className="flex justify-between gap-3">
                                            <span className="truncate">{b.nama}</span>
                                            <span className="text-muted-foreground shrink-0 tabular-nums">{formatUkuran(b.ukuran)}</span>
                                        </li>
                                    ))}
                                    {konfirmasi && konfirmasi.length > 50 && (
                                        <li className="text-muted-foreground">… dan {konfirmasi.length - 50} lainnya</li>
                                    )}
                                </ul>
                                <p>
                                    Total{' '}
                                    <span className="font-medium tabular-nums">
                                        {formatUkuran((konfirmasi ?? []).reduce((s, b) => s + b.ukuran, 0))}
                                    </span>{' '}
                                    dihapus permanen dari server dan tidak bisa dikembalikan.
                                </p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={sibuk}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => konfirmasi && hapus(konfirmasi)}
                            disabled={sibuk}
                            className="bg-destructive hover:bg-destructive/90 text-white"
                        >
                            {sibuk ? 'Menghapus...' : 'Hapus'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
