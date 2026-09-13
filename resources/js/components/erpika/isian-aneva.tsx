import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router } from '@inertiajs/react';
import { ClipboardEdit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Laporan {
    nomor: string;
    tanggal: string | null;
    jenis?: string | null;
}

export interface PenugasanAneva {
    id: number;
    nomor_st: string | null;
    uraian: string | null;
    obriks: { id: number; nama: string; laporan: Laporan | null }[];
    laporan_lain: Laporan[];
    status: string;
    capaian_output: string | null;
    keterangan: string | null;
}

const STATUS: [string, string][] = [
    ['draft', 'Draft'],
    ['st_terbit', 'ST terbit (merah)'],
    ['nomor_diminta', 'Nomor laporan diminta (kuning)'],
    ['lhp_terbit', 'LHP terbit (hijau)'],
    ['selesai', 'Selesai'],
    ['batal', 'Batal'],
];
const JENIS = ['LHA', 'LHR', 'LHM', 'LHE', 'LHP', 'LHAKJ', 'LHPDTT', 'Lainnya'];

/**
 * Isian Bagian Analisis dan Evaluasi untuk satu penugasan (ST): nomor,
 * tanggal, dan jenis laporan per obrik; laporan tanpa obrik; status tiga
 * warna; capaian; keterangan. Satu-satunya tempat laporan diisi.
 */
export function IsianAneva({ p }: { p: PenugasanAneva }) {
    const [terbuka, setTerbuka] = useState(false);
    const [obriks, setObriks] = useState<{ id: number; nama: string; nomor: string; tanggal: string; jenis: string }[]>([]);
    const [lain, setLain] = useState<{ nomor: string; tanggal: string; jenis: string }[]>([]);
    const [status, setStatus] = useState(p.status);
    const [capaian, setCapaian] = useState(p.capaian_output ?? '');
    const [keterangan, setKeterangan] = useState(p.keterangan ?? '');
    const [menyimpan, setMenyimpan] = useState(false);

    const buka = () => {
        setObriks(
            p.obriks.map((o) => ({
                id: o.id,
                nama: o.nama,
                nomor: o.laporan?.nomor ?? '',
                tanggal: o.laporan?.tanggal ?? '',
                jenis: o.laporan?.jenis ?? '',
            })),
        );
        setLain(p.laporan_lain.map((l) => ({ nomor: l.nomor, tanggal: l.tanggal ?? '', jenis: l.jenis ?? '' })));
        setStatus(p.status);
        setCapaian(p.capaian_output ?? '');
        setKeterangan(p.keterangan ?? '');
        setTerbuka(true);
    };

    const adaLaporan = obriks.some((o) => o.nomor.trim()) || lain.some((l) => l.nomor.trim());

    const simpan = () => {
        setMenyimpan(true);
        router.put(
            `/erpika/aneva/${p.id}`,
            {
                obriks: obriks.map((o) => ({ id: o.id, nomor: o.nomor, tanggal: o.tanggal || null, jenis: o.jenis || null })),
                lain: lain.filter((l) => l.nomor.trim()).map((l) => ({ nomor: l.nomor, tanggal: l.tanggal || null, jenis: l.jenis || null })),
                status,
                capaian_output: capaian || null,
                keterangan: keterangan || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => setTerbuka(false),
                onError: (e) => toast.error(Object.values(e)[0] ?? 'Periksa isian.'),
                onFinish: () => setMenyimpan(false),
            },
        );
    };

    return (
        <>
            <Button size="sm" variant="ghost" title="Isi laporan (Aneva)" onClick={buka}>
                <ClipboardEdit className="h-4 w-4" />
            </Button>
            <Dialog open={terbuka} onOpenChange={setTerbuka}>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Isian Aneva — {p.nomor_st ?? 'ST belum ada'}</DialogTitle>
                        <DialogDescription>{p.uraian}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <div className="mb-1 text-sm font-medium">Laporan per obrik</div>
                            {obriks.length === 0 && (
                                <p className="text-muted-foreground text-xs">Penugasan ini tidak punya obrik; isi pada "Laporan lain".</p>
                            )}
                            <div className="space-y-2">
                                {obriks.map((o, i) => (
                                    <div key={o.id} className="grid gap-2 rounded border p-2 md:grid-cols-[1fr_1.2fr_150px_110px]">
                                        <div className="text-sm">{o.nama}</div>
                                        <Input
                                            className="font-mono text-xs"
                                            placeholder="Nomor laporan"
                                            value={o.nomor}
                                            onChange={(e) => setObriks(obriks.map((x, y) => (y === i ? { ...x, nomor: e.target.value } : x)))}
                                        />
                                        <DatePicker
                                            value={o.tanggal}
                                            onChange={(v) => setObriks(obriks.map((x, y) => (y === i ? { ...x, tanggal: v } : x)))}
                                        />
                                        <Select
                                            value={o.jenis || 'kosong'}
                                            onValueChange={(v) =>
                                                setObriks(obriks.map((x, y) => (y === i ? { ...x, jenis: v === 'kosong' ? '' : v } : x)))
                                            }
                                        >
                                            <SelectTrigger className="h-9 text-xs">
                                                <SelectValue placeholder="Jenis" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="kosong">Jenis</SelectItem>
                                                {JENIS.map((j) => (
                                                    <SelectItem key={j} value={j}>
                                                        {j}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="mb-1 flex items-center justify-between">
                                <div className="text-sm font-medium">Laporan lain (tanpa obrik)</div>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setLain([...lain, { nomor: '', tanggal: '', jenis: '' }])}
                                >
                                    <Plus className="mr-1 h-3.5 w-3.5" /> Laporan
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {lain.map((l, i) => (
                                    <div key={i} className="grid gap-2 rounded border p-2 md:grid-cols-[1.4fr_150px_110px_40px]">
                                        <Input
                                            className="font-mono text-xs"
                                            placeholder="Nomor laporan"
                                            value={l.nomor}
                                            onChange={(e) => setLain(lain.map((x, y) => (y === i ? { ...x, nomor: e.target.value } : x)))}
                                        />
                                        <DatePicker
                                            value={l.tanggal}
                                            onChange={(v) => setLain(lain.map((x, y) => (y === i ? { ...x, tanggal: v } : x)))}
                                        />
                                        <Select
                                            value={l.jenis || 'kosong'}
                                            onValueChange={(v) =>
                                                setLain(lain.map((x, y) => (y === i ? { ...x, jenis: v === 'kosong' ? '' : v } : x)))
                                            }
                                        >
                                            <SelectTrigger className="h-9 text-xs">
                                                <SelectValue placeholder="Jenis" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="kosong">Jenis</SelectItem>
                                                {JENIS.map((j) => (
                                                    <SelectItem key={j} value={j}>
                                                        {j}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button type="button" size="icon" variant="ghost" onClick={() => setLain(lain.filter((_, y) => y !== i))}>
                                            <Trash2 className="text-destructive h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                            <div className="space-y-1">
                                <Label>Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS.map(([k, v]) => (
                                            <SelectItem key={k} value={k}>
                                                {v}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {adaLaporan && status !== 'lhp_terbit' && status !== 'selesai' && (
                                    <button type="button" className="text-xs underline" onClick={() => setStatus('lhp_terbit')}>
                                        Ada laporan — tandai LHP terbit
                                    </button>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label>Capaian output</Label>
                                <Input value={capaian} onChange={(e) => setCapaian(e.target.value)} placeholder="mis. 100%" />
                            </div>
                            <div className="space-y-1">
                                <Label>Keterangan</Label>
                                <Input value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setTerbuka(false)}>
                            Batal
                        </Button>
                        <Button onClick={simpan} disabled={menyimpan}>
                            {menyimpan ? 'Menyimpan…' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
