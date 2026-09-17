import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Link } from '@inertiajs/react';
import { CalendarDays } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Batang {
    id: number;
    rpp_id: number;
    nomor_st: string | null;
    nomor_rpp: string | null;
    jenis: string | null;
    uraian: string | null;
    status: string;
    peran: string | null;
    lk: number;
    mulai: string;
    selesai: string;
    dari: number;
    sampai: number;
}

interface Data {
    tahun: number;
    nama: string;
    penugasan: Batang[];
    hari_lk: number;
    bulan_ini: number | null;
}

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const WARNA: Record<string, string> = {
    lhp_terbit: 'bg-emerald-500/80',
    nomor_diminta: 'bg-amber-400/90',
    st_terbit: 'bg-red-500/80',
    selesai: 'bg-emerald-500/60',
    draft: 'bg-slate-400/70',
};
const tgl = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

/**
 * Popover kalender penugasan seorang pegawai untuk tahun berjalan — dipakai
 * di formulir RPP di samping ikon info, supaya penyusun langsung melihat
 * kapan orang itu sudah terjadwal sebelum memasukkannya ke tim.
 */
export default function KalenderPegawai({ employeeId, nama }: { employeeId: number | null; nama: string }) {
    const [buka, setBuka] = useState(false);
    const [data, setData] = useState<Data | null>(null);
    const [galat, setGalat] = useState<string | null>(null);

    // Pegawai di dropdown berganti → kalender orang lama dibuang (kasus yang
    // sama dengan info-pegawai.tsx).
    useEffect(() => {
        setData(null);
        setGalat(null);
    }, [employeeId]);

    useEffect(() => {
        if (!buka || !employeeId || data) return;
        fetch(`/erpika/pegawai/${employeeId}/kalender`, { headers: { Accept: 'application/json' } })
            .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
            .then(setData)
            .catch(() => setGalat('Tidak bisa memuat kalender pegawai.'));
    }, [buka, employeeId, data]);

    if (!employeeId) return null;

    return (
        <Popover open={buka} onOpenChange={setBuka}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="text-muted-foreground hover:text-primary"
                    title={`Kalender penugasan ${nama} tahun ini`}
                    aria-label="Kalender penugasan"
                >
                    <CalendarDays className="h-4 w-4" />
                </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[560px] max-w-[95vw] p-3 text-xs">
                {galat && <p className="text-destructive">{galat}</p>}
                {!data && !galat && <p className="text-muted-foreground">Memuat…</p>}
                {data && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="font-medium">
                                {data.nama} — {data.tahun}
                            </div>
                            <div className="text-muted-foreground">
                                {data.penugasan.length} penugasan · {data.hari_lk} hari LK
                            </div>
                        </div>
                        <div className="rounded border">
                            <div className="flex border-b">
                                {BULAN.map((b, i) => (
                                    <div
                                        key={b}
                                        className={`flex-1 border-l py-0.5 text-center text-[10px] first:border-l-0 ${data.bulan_ini === i + 1 ? 'bg-primary/15 font-bold' : ''}`}
                                    >
                                        {b}
                                    </div>
                                ))}
                            </div>
                            <div className="relative" style={{ height: `${Math.max(data.penugasan.length, 1) * 15 + 6}px` }}>
                                {BULAN.map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute top-0 bottom-0 border-l border-dashed opacity-40"
                                        style={{ left: `${(i / 12) * 100}%` }}
                                    />
                                ))}
                                {data.penugasan.map((p, idx) => (
                                    <Link
                                        key={p.id}
                                        href={`/rpp/${p.rpp_id}/edit`}
                                        className={`absolute block h-3 rounded text-[9px] leading-3 text-white ${WARNA[p.status] ?? 'bg-slate-400/70'}`}
                                        style={{
                                            left: `${(p.dari / 12) * 100}%`,
                                            width: `${Math.max(((p.sampai - p.dari) / 12) * 100, 1)}%`,
                                            top: `${idx * 15 + 3}px`,
                                        }}
                                        title={`${p.nomor_st ?? p.nomor_rpp ?? ''} — ${p.uraian ?? ''} (${p.peran ?? '-'}, LK ${p.lk}) ${tgl(p.mulai)}–${tgl(p.selesai)}`}
                                    >
                                        <span className="block truncate px-1">{p.peran}</span>
                                    </Link>
                                ))}
                                {data.penugasan.length === 0 && (
                                    <div className="text-muted-foreground absolute inset-0 flex items-center justify-center">
                                        Belum ada penugasan tahun ini.
                                    </div>
                                )}
                            </div>
                        </div>
                        <ul className="max-h-56 space-y-1 overflow-y-auto pr-1">
                            {data.penugasan.map((p) => (
                                <li key={p.id} className="flex gap-2">
                                    <span className="text-muted-foreground w-[84px] shrink-0 tabular-nums">
                                        {tgl(p.mulai)}–{tgl(p.selesai)}
                                    </span>
                                    <span className="min-w-0 leading-snug break-words">
                                        <span className="font-medium">{p.peran}</span> · {p.jenis} · {p.uraian}
                                        {p.nomor_st && <span className="text-muted-foreground"> · {p.nomor_st}</span>}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <div className="text-muted-foreground">
                            Merah ST terbit, kuning nomor diminta, hijau LHP terbit.{' '}
                            <Link href={`/erpika/kalender?bulan=semua&tahun=${data.tahun}`} className="underline">
                                Kalender lengkap
                            </Link>
                        </div>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
