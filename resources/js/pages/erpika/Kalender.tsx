import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

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
    tim: { employee_id: number | null; nama: string; peran: string; lk: number }[];
}

interface Orang {
    nama: string;
    tumpang_tindih: number;
    penugasan: { id: number; mulai: string; selesai: string; lk: number; peran: string; nomor_st: string | null; uraian: string | null }[];
}

interface Props {
    penugasan: Penugasan[];
    perOrang: Orang[];
    bulan: number;
    tahun: number;
    jumlahHari: number;
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

function hari(iso: string) {
    return Number(iso.slice(8, 10));
}

/**
 * ERPIKA → Kalender Penugasan. Satu bulan per tampilan: batang per
 * penugasan pada garis hari, lalu per orang (pegawai dengan tumpang tindih
 * hari lapangan ditampilkan paling atas). Hanya membaca RPP yang sudah ada.
 */
export default function Kalender({ penugasan, perOrang, bulan, tahun, jumlahHari, tahunTersedia }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'ERPIKA', href: '#' },
        { title: 'Kalender Penugasan', href: '/erpika/kalender' },
    ];
    const [mode, setMode] = useState<'penugasan' | 'orang'>('penugasan');
    const pindah = (b: number, t: number) => {
        if (b < 1) {
            b = 12;
            t -= 1;
        }
        if (b > 12) {
            b = 1;
            t += 1;
        }
        router.get('/erpika/kalender', { bulan: b, tahun: t }, { preserveState: true });
    };
    const hariIni = new Date();
    const tandaHariIni = hariIni.getFullYear() === tahun && hariIni.getMonth() + 1 === bulan ? hariIni.getDate() : null;
    const hariList = Array.from({ length: jumlahHari }, (_, i) => i + 1);
    const akhirPekan = (d: number) => {
        const w = new Date(tahun, bulan - 1, d).getDay();
        return w === 0 || w === 6;
    };
    const batang = (mulai: string, selesai: string) => {
        const a = mulai < `${tahun}-${String(bulan).padStart(2, '0')}-01` ? 1 : hari(mulai);
        const b = selesai > `${tahun}-${String(bulan).padStart(2, '0')}-${String(jumlahHari).padStart(2, '0')}` ? jumlahHari : hari(selesai);
        return { gridColumn: `${a} / ${b + 1}` };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Kalender Penugasan ${BULAN[bulan - 1]} ${tahun}`} />
            <div className="space-y-4 p-4 md:p-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Kalender Penugasan</h1>
                        <p className="text-muted-foreground text-sm">
                            Siapa bertugas di mana pada tanggal berapa, dari masa tugas RPP. Warna: merah ST terbit, kuning nomor diminta, hijau LHP
                            terbit.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => pindah(bulan - 1, tahun)} aria-label="Bulan sebelumnya">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <select className="rounded border px-2 py-1 text-sm" value={bulan} onChange={(e) => pindah(Number(e.target.value), tahun)}>
                            {BULAN.map((b, i) => (
                                <option key={b} value={i + 1}>
                                    {b}
                                </option>
                            ))}
                        </select>
                        <select className="rounded border px-2 py-1 text-sm" value={tahun} onChange={(e) => pindah(bulan, Number(e.target.value))}>
                            {[...new Set([...tahunTersedia, tahun])]
                                .sort((a, b) => b - a)
                                .map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                        </select>
                        <Button variant="outline" size="icon" onClick={() => pindah(bulan + 1, tahun)} aria-label="Bulan berikutnya">
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
                    {penugasan.length} penugasan berjalan pada {BULAN[bulan - 1]} {tahun}; {perOrang.length} pegawai terlibat
                    {perOrang.filter((o) => o.tumpang_tindih > 0).length > 0 && (
                        <>
                            ,{' '}
                            <span className="text-destructive font-medium">
                                {perOrang.filter((o) => o.tumpang_tindih > 0).length} orang bertumpang tindih
                            </span>
                        </>
                    )}
                    .
                </div>

                <div className="overflow-x-auto rounded-md border">
                    <div className="min-w-[900px]">
                        <div
                            className="grid border-b text-center text-[11px]"
                            style={{ gridTemplateColumns: `220px repeat(${jumlahHari}, minmax(0, 1fr))` }}
                        >
                            <div className="bg-muted/50 px-2 py-1 text-left font-medium">{mode === 'penugasan' ? 'Penugasan' : 'Pegawai'}</div>
                            {hariList.map((d) => (
                                <div
                                    key={d}
                                    className={`py-1 ${akhirPekan(d) ? 'bg-muted/60' : ''} ${tandaHariIni === d ? 'bg-primary/15 font-bold' : ''}`}
                                >
                                    {d}
                                </div>
                            ))}
                        </div>
                        {mode === 'penugasan' &&
                            penugasan.map((p) => (
                                <div
                                    key={p.id}
                                    className="grid items-center border-b text-xs"
                                    style={{ gridTemplateColumns: `220px repeat(${jumlahHari}, minmax(0, 1fr))` }}
                                >
                                    <div className="truncate px-2 py-1" title={`${p.uraian ?? ''}\n${p.obrik}`}>
                                        <Link href={`/rpp/${p.rpp_id}/edit`} className="font-medium underline">
                                            {p.nomor_st ?? p.nomor_rpp}
                                        </Link>
                                        <div className="text-muted-foreground truncate">{p.uraian}</div>
                                    </div>
                                    <div
                                        className="col-start-2 grid"
                                        style={{ gridColumn: `2 / ${jumlahHari + 2}`, gridTemplateColumns: `repeat(${jumlahHari}, minmax(0, 1fr))` }}
                                    >
                                        <div
                                            className={`my-1 h-4 rounded text-[10px] leading-4 text-white ${WARNA[p.status] ?? 'bg-slate-400/70'}`}
                                            style={batang(p.mulai, p.selesai)}
                                            title={`${p.mulai} s.d. ${p.selesai} — ${p.tim.map((m) => `${m.peran}: ${m.nama}`).join(', ')}`}
                                        >
                                            <span className="truncate px-1">
                                                {p.tim.length} orang · {p.jenis}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        {mode === 'orang' &&
                            perOrang.map((o) => (
                                <div
                                    key={o.nama}
                                    className="grid items-start border-b text-xs"
                                    style={{ gridTemplateColumns: `220px repeat(${jumlahHari}, minmax(0, 1fr))` }}
                                >
                                    <div className="px-2 py-1">
                                        <span className="font-medium">{o.nama}</span>
                                        {o.tumpang_tindih > 0 && <span className="text-destructive ml-1">({o.tumpang_tindih} tumpang tindih)</span>}
                                        <div className="text-muted-foreground">{o.penugasan.length} penugasan</div>
                                    </div>
                                    <div
                                        className="grid"
                                        style={{ gridColumn: `2 / ${jumlahHari + 2}`, gridTemplateColumns: `repeat(${jumlahHari}, minmax(0, 1fr))` }}
                                    >
                                        {o.penugasan.map((p) => (
                                            <div
                                                key={p.id}
                                                className={`my-0.5 h-3.5 rounded text-[10px] leading-3.5 text-white ${p.lk > 0 ? 'bg-sky-600/80' : 'bg-slate-400/60'}`}
                                                style={batang(p.mulai, p.selesai)}
                                                title={`${p.nomor_st ?? ''} ${p.uraian ?? ''} (${p.peran}, LK ${p.lk})`}
                                            >
                                                <span className="truncate px-1">{p.peran}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        {penugasan.length === 0 && (
                            <div className="text-muted-foreground p-6 text-center text-sm">Tidak ada penugasan dengan masa tugas pada bulan ini.</div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
