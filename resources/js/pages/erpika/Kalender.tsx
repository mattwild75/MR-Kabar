import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIngatan } from '@/hooks/use-ingatan';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Penugasan {
    id: number;
    rpp_id: number;
    nomor_rpp: string | null;
    jenis: string | null;
    kode: string | null;
    uraian: string | null;
    obrik: string;
    nomor_st: string | null;
    status: string;
    mulai: string;
    selesai: string;
    dari: number;
    sampai: number;
    tim: { employee_id: number | null; nama: string; peran: string; lk: number }[];
}

interface Orang {
    nama: string;
    tumpang_tindih: number;
    penugasan: {
        id: number;
        mulai: string;
        selesai: string;
        dari: number;
        sampai: number;
        lk: number;
        peran: string;
        nomor_st: string | null;
        uraian: string | null;
    }[];
}

interface Props {
    penugasan: Penugasan[];
    perOrang: Orang[];
    skala: 'bulan' | 'tahun' | 'semua';
    bulan: number | null;
    tahun: number | null;
    kolom: { label: string; akhir_pekan: boolean; hari_ini: boolean }[];
    judulRentang: string;
    tahunTersedia: number[];
}

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const WARNA: Record<string, string> = {
    lhp_terbit: 'bg-emerald-500/80',
    nomor_diminta: 'bg-amber-400/90',
    st_terbit: 'bg-red-500/80',
    selesai: 'bg-emerald-500/60',
    draft: 'bg-slate-400/70',
};

/**
 * ERPIKA → Perencanaan → Kalender Penugasan. Tiga skala dalam satu tampilan:
 * satu bulan (kolom = hari), "Semua bulan" (kolom = 12 bulan), "Semua tahun"
 * (kolom = tahun). Batang digambar dari posisi pecahan kolom yang dihitung
 * server, jadi proporsional pada skala mana pun. Hanya membaca RPP.
 */
export default function Kalender({ penugasan, perOrang, skala, bulan, tahun, kolom, judulRentang, tahunTersedia }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'ERPIKA', href: '#' },
        { title: 'Perencanaan', href: '/rpp' },
        { title: 'Kalender Penugasan', href: '/erpika/kalender' },
    ];
    const [mode, setMode] = useIngatan<'penugasan' | 'orang'>('kalender-mode', 'penugasan');
    const n = kolom.length;
    const pergi = (b: string | number, t: string | number) => router.get('/erpika/kalender', { bulan: b, tahun: t }, { preserveState: true });
    const geser = (arah: -1 | 1) => {
        if (skala === 'semua') return;
        if (skala === 'tahun') return pergi('semua', (tahun ?? 0) + arah);
        let b = (bulan ?? 1) + arah;
        let t = tahun ?? 0;
        if (b < 1) {
            b = 12;
            t -= 1;
        }
        if (b > 12) {
            b = 1;
            t += 1;
        }
        pergi(b, t);
    };
    const daftarTahun = [...new Set([...tahunTersedia, ...(tahun ? [tahun] : [])])].sort((a, b) => b - a);
    const gaya = (dari: number, sampai: number) => ({ left: `${(dari / n) * 100}%`, width: `${Math.max(((sampai - dari) / n) * 100, 0.6)}%` });
    const lebarLabel = skala === 'bulan' ? 'text-[11px]' : 'text-xs';
    const bermasalah = perOrang.filter((o) => o.tumpang_tindih > 0).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Kalender Penugasan ${judulRentang}`} />
            <div className="space-y-4 p-4 md:p-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Kalender Penugasan</h1>
                        <p className="text-muted-foreground text-sm">
                            Siapa bertugas di mana pada tanggal berapa, dari masa tugas RPP. Warna: merah ST terbit, kuning nomor diminta, hijau LHP
                            terbit. Pilih "Semua bulan" untuk satu tahun penuh, "Semua tahun" untuk seluruh periode.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => geser(-1)} disabled={skala === 'semua'} aria-label="Sebelumnya">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Select
                            value={skala === 'bulan' ? String(bulan) : 'semua'}
                            onValueChange={(v) => pergi(v, tahun ?? tahunTersedia[0] ?? new Date().getFullYear())}
                            disabled={skala === 'semua'}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="semua">Semua bulan</SelectItem>
                                {BULAN.map((b, i) => (
                                    <SelectItem key={b} value={String(i + 1)}>
                                        {b}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={skala === 'semua' ? 'semua' : String(tahun)}
                            onValueChange={(v) => pergi(v === 'semua' ? 'semua' : skala === 'bulan' ? String(bulan) : 'semua', v)}
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="semua">Semua tahun</SelectItem>
                                {daftarTahun.map((y) => (
                                    <SelectItem key={y} value={String(y)}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon" onClick={() => geser(1)} disabled={skala === 'semua'} aria-label="Berikutnya">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <div className="ml-2 flex rounded border text-sm">
                            <button
                                className={`px-3 py-1 ${mode === 'penugasan' ? 'bg-muted font-medium' : ''}`}
                                onClick={() => setMode('penugasan')}
                            >
                                Per penugasan
                            </button>
                            <button className={`px-3 py-1 ${mode === 'orang' ? 'bg-muted font-medium' : ''}`} onClick={() => setMode('orang')}>
                                Per orang
                            </button>
                        </div>
                    </div>
                </div>

                <div className="text-muted-foreground text-sm">
                    <span className="text-foreground font-medium">{judulRentang}</span>: {penugasan.length} penugasan, {perOrang.length} pegawai
                    terlibat
                    {bermasalah > 0 && (
                        <>
                            , <span className="text-destructive font-medium">{bermasalah} orang berjadwal mustahil</span>
                        </>
                    )}
                    .
                </div>

                <div className="overflow-x-auto rounded-md border">
                    <div className="min-w-[900px]">
                        <div className="flex border-b">
                            <div className="bg-muted/50 w-[220px] shrink-0 px-2 py-1 text-xs font-medium">
                                {mode === 'penugasan' ? 'Penugasan' : 'Pegawai'}
                            </div>
                            <div className="relative flex flex-1">
                                {kolom.map((k, i) => (
                                    <div
                                        key={i}
                                        className={`flex-1 truncate border-l py-1 text-center ${lebarLabel} ${k.akhir_pekan ? 'bg-muted/60' : ''} ${k.hari_ini ? 'bg-primary/15 font-bold' : ''}`}
                                        title={k.label}
                                    >
                                        {k.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {mode === 'penugasan' &&
                            penugasan.map((p) => (
                                <div key={p.id} className="flex items-center border-b text-xs">
                                    <div className="w-[220px] shrink-0 truncate px-2 py-1" title={`${p.uraian ?? ''}\n${p.obrik}`}>
                                        <Link href={`/rpp/${p.rpp_id}/edit`} className="font-medium underline">
                                            {p.nomor_st ?? p.nomor_rpp}
                                        </Link>
                                        <div className="text-muted-foreground truncate">{p.uraian}</div>
                                    </div>
                                    <div className="relative h-7 flex-1">
                                        <div
                                            className={`absolute top-1.5 h-4 rounded text-[10px] leading-4 text-white ${WARNA[p.status] ?? 'bg-slate-400/70'}`}
                                            style={gaya(p.dari, p.sampai)}
                                            title={`${p.mulai} s.d. ${p.selesai} — ${p.tim.map((m) => `${m.peran}: ${m.nama}`).join(', ')}`}
                                        >
                                            <span className="block truncate px-1">
                                                {p.tim.length} orang · {p.jenis}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                        {mode === 'orang' &&
                            perOrang.map((o) => (
                                <div key={o.nama} className="flex items-start border-b text-xs">
                                    <div className="w-[220px] shrink-0 px-2 py-1">
                                        <span className="font-medium">{o.nama}</span>
                                        {o.tumpang_tindih > 0 && <span className="text-destructive ml-1">({o.tumpang_tindih} mustahil)</span>}
                                        <div className="text-muted-foreground">{o.penugasan.length} penugasan</div>
                                    </div>
                                    <div className="relative flex-1" style={{ height: `${Math.max(o.penugasan.length, 1) * 16 + 8}px` }}>
                                        {o.penugasan.map((p, idx) => (
                                            <div
                                                key={p.id}
                                                className={`absolute h-3.5 rounded text-[10px] leading-3.5 text-white ${p.lk > 0 ? 'bg-sky-600/80' : 'bg-slate-400/60'}`}
                                                style={{ ...gaya(p.dari, p.sampai), top: `${idx * 16 + 4}px` }}
                                                title={`${p.nomor_st ?? ''} ${p.uraian ?? ''} (${p.peran}, LK ${p.lk}) ${p.mulai} s.d. ${p.selesai}`}
                                            >
                                                <span className="block truncate px-1">{p.peran}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                        {penugasan.length === 0 && (
                            <div className="text-muted-foreground p-6 text-center text-sm">
                                Tidak ada penugasan dengan masa tugas pada rentang ini.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
