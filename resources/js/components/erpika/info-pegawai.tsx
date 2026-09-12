import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Info } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface RingkasanPenugasan {
    total: number;
    kuning: number;
    hijau: number;
    merah: number;
    per_jenis: {
        jenis: string;
        total: number;
        hijau: number;
        kuning: number;
        merah: number;
        daftar: { tahun: number; rpp: string; st: string | null; uraian: string | null; objek: string[]; status: string }[];
    }[];
    per_tahun: Record<string, number>;
    terakhir: {
        rpp: string;
        st: string | null;
        tanggal: string | null;
        tmt: string | null;
        obrik: string | null;
        objek: string[];
        status: string;
    } | null;
}

export interface InfoPegawaiData {
    id: number;
    nama: string;
    nip: string | null;
    pangkat: string | null;
    golongan: string | null;
    jabatan: string | null;
    unit_kerja: string | null;
    aktif: boolean;
    penugasan: RingkasanPenugasan;
}

/** Tabel pembagian penugasan per jenis dengan warna hijau/kuning/merah. */
export function TabelPerJenis({ p }: { p: RingkasanPenugasan }) {
    if (p.per_jenis.length === 0) return <p className="text-muted-foreground text-xs">Belum pernah ditugaskan.</p>;
    return (
        <table className="w-full text-xs">
            <thead className="text-muted-foreground">
                <tr>
                    <th className="py-0.5 text-left font-medium">Jenis</th>
                    <th className="py-0.5 text-right font-medium">Total</th>
                    <th className="py-0.5 text-right font-medium text-emerald-700 dark:text-emerald-300">Hijau</th>
                    <th className="py-0.5 text-right font-medium text-amber-700 dark:text-amber-300">Kuning</th>
                    <th className="py-0.5 text-right font-medium text-red-700 dark:text-red-300">Merah</th>
                </tr>
            </thead>
            <tbody>
                {p.per_jenis.map((j) => (
                    <tr key={j.jenis} className="border-t">
                        <td className="py-0.5">
                            <div className="flex items-center gap-1">
                                <span>{j.jenis}</span>
                                {/* popover ketiga: obrik/uraian dan daftar objek tiap penugasan jenis ini */}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button type="button" size="icon" variant="ghost" className="h-5 w-5" title={`Penugasan ${j.jenis}`}>
                                            <Info className="h-3 w-3" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align="start" className="max-h-[70vh] w-[420px] overflow-y-auto">
                                        <div className="mb-1 text-sm font-semibold">
                                            {j.jenis} — {j.total} penugasan
                                        </div>
                                        <ol className="space-y-1.5 text-xs">
                                            {j.daftar.map((d, i) => (
                                                <li key={i} className="border-t pt-1">
                                                    <div className="text-muted-foreground font-mono">
                                                        {d.tahun} · {d.rpp}
                                                        {d.st ? ` · ${d.st}` : ''}
                                                        <span
                                                            className={`ml-1 rounded px-1 ${
                                                                d.status === 'lhp_terbit'
                                                                    ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
                                                                    : d.status === 'nomor_diminta'
                                                                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
                                                                      : d.status === 'batal'
                                                                        ? 'bg-muted'
                                                                        : 'bg-red-100 text-red-900 dark:bg-red-950/40 dark:text-red-200'
                                                            }`}
                                                        >
                                                            {d.status === 'lhp_terbit'
                                                                ? 'hijau'
                                                                : d.status === 'nomor_diminta'
                                                                  ? 'kuning'
                                                                  : d.status === 'batal'
                                                                    ? 'batal'
                                                                    : 'merah'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Obrik:</span> {d.uraian ?? '-'}
                                                    </div>
                                                    {d.objek.length > 0 && (
                                                        <div className="text-muted-foreground">
                                                            <span className="font-medium">Objek:</span> {d.objek.join('; ')}
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ol>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </td>
                        <td className="py-0.5 text-right tabular-nums">{j.total}</td>
                        <td className="py-0.5 text-right tabular-nums">{j.hijau}</td>
                        <td className="py-0.5 text-right tabular-nums">{j.kuning}</td>
                        <td className="py-0.5 text-right tabular-nums">{j.merah}</td>
                    </tr>
                ))}
                <tr className="border-t font-semibold">
                    <td className="py-0.5">Seluruh RPP</td>
                    <td className="py-0.5 text-right tabular-nums">{p.total}</td>
                    <td className="py-0.5 text-right tabular-nums">{p.hijau}</td>
                    <td className="py-0.5 text-right tabular-nums">{p.kuning}</td>
                    <td className="py-0.5 text-right tabular-nums">{p.merah}</td>
                </tr>
            </tbody>
        </table>
    );
}

/**
 * Tombol info pegawai: memuat ringkasan dari /erpika/pegawai/{id}/ringkasan
 * saat dibuka (bukan dikirim bersama formulir untuk 100+ pegawai), lalu
 * menampilkan data pegawai, pembagian penugasan per jenis, dan penugasan
 * terakhir — isi yang sama dengan halaman ERPIKA > Pegawai.
 */
export default function InfoPegawai({ employeeId, nama }: { employeeId: number | null; nama: string }) {
    const [buka, setBuka] = useState(false);
    const [data, setData] = useState<InfoPegawaiData | null>(null);
    const [galat, setGalat] = useState<string | null>(null);

    useEffect(() => {
        if (!buka || !employeeId || data) return;
        fetch(`/erpika/pegawai/${employeeId}/ringkasan`, { headers: { Accept: 'application/json' } })
            .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
            .then(setData)
            .catch(() => setGalat('Tidak bisa memuat info pegawai.'));
    }, [buka, employeeId, data]);

    if (!employeeId) return null;

    return (
        <Popover open={buka} onOpenChange={setBuka}>
            <PopoverTrigger asChild>
                <Button type="button" size="icon" variant="ghost" className="h-8 w-8 shrink-0" title={`Info ${nama}`}>
                    <Info className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[380px] text-sm">
                {galat && <p className="text-destructive text-xs">{galat}</p>}
                {!data && !galat && <p className="text-muted-foreground text-xs">Memuat…</p>}
                {data && (
                    <div className="space-y-2">
                        <div>
                            <div className="font-semibold">{data.nama}</div>
                            <div className="text-muted-foreground text-xs">
                                NIP {data.nip ?? '-'} · {data.pangkat ?? '-'}
                                {data.golongan ? ` (${data.golongan})` : ''}
                                <br />
                                {data.jabatan ? `${data.jabatan} · ` : ''}
                                {data.unit_kerja ?? 'unit kerja belum diisi'}
                                {!data.aktif && ' · tidak aktif'}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 font-medium tabular-nums">
                            <span>
                                {data.penugasan.total} / <span className="text-amber-700 dark:text-amber-300">{data.penugasan.kuning}</span> /{' '}
                                <span className="text-emerald-700 dark:text-emerald-300">{data.penugasan.hijau}</span> /{' '}
                                <span className="text-red-700 dark:text-red-300">{data.penugasan.merah}</span>
                            </span>
                            {/* popover kedua: pembagian per jenis penugasan */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button type="button" size="icon" variant="ghost" className="h-6 w-6" title="Pembagian per jenis penugasan">
                                        <Info className="h-3.5 w-3.5" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-[360px]">
                                    <div className="mb-1 text-sm font-semibold">Jenis penugasan — {data.nama}</div>
                                    <TabelPerJenis p={data.penugasan} />
                                    {Object.keys(data.penugasan.per_tahun).length > 0 && (
                                        <p className="text-muted-foreground mt-2 text-xs">
                                            Per tahun:{' '}
                                            {Object.entries(data.penugasan.per_tahun)
                                                .map(([t, n]) => `${t}: ${n}`)
                                                .join(' · ')}
                                        </p>
                                    )}
                                </PopoverContent>
                            </Popover>
                        </div>
                        <p className="text-muted-foreground -mt-1 text-xs">penugasan: total / minta nomor laporan / selesai / masih bertugas</p>
                        {data.penugasan.terakhir && (
                            <div className="text-muted-foreground border-t pt-2 text-xs">
                                <div className="text-foreground font-medium">Penugasan terakhir</div>
                                <div>
                                    RPP <span className="font-mono">{data.penugasan.terakhir.rpp}</span> · ST{' '}
                                    <span className="font-mono">{data.penugasan.terakhir.st ?? '-'}</span>
                                </div>
                                <div className="line-clamp-2">{data.penugasan.terakhir.obrik}</div>
                            </div>
                        )}
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
