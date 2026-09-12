import PkptShell, { type KonteksPkpt } from '@/components/pkpt/pkpt-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import HighlightText from '@/components/ui/highlight-text';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';
import { Download, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Area {
    id: number;
    kelompok: 'program_prioritas' | 'skpk' | 'unit_lain';
    nama: string;
    tujuan_sasaran: string | null;
    opd_id: number | null;
    opd: { id: number; nama: string } | null;
    opd_pendukung: string | null;
    urusan: string | null;
    pagu_anggaran: number | null;
    irban: string | null;
    tahun_terakhir_diawasi: number | null;
    jenis_penugasan_terakhir: string | null;
    keterangan: string | null;
}

interface Props extends KonteksPkpt {
    area: Area[];
    opd: { id: number; nama: string }[];
}

const LABEL_KELOMPOK: Record<Area['kelompok'], string> = {
    program_prioritas: 'Program Prioritas',
    skpk: 'SKPK',
    unit_lain: 'Unit Kerja Lain',
};

const kosong = (): Partial<Area> => ({ kelompok: 'skpk', nama: '' });

export default function PetaAuditan({ area, opd, ...konteks }: Props) {
    const [cari, setCari] = useState('');
    const [sunting, setSunting] = useState<Partial<Area> | null>(null);
    const bolehUbah = konteks.hak.input && !konteks.terkunci;

    const tersaring = useMemo(() => {
        const k = cari.trim().toLowerCase();
        if (!k) return area;
        return area.filter((a) =>
            [a.nama, a.opd?.nama, a.opd_pendukung, a.urusan, a.tujuan_sasaran].filter(Boolean).some((v) => String(v).toLowerCase().includes(k)),
        );
    }, [area, cari]);

    const perKelompok = useMemo(() => {
        const h: Record<string, number> = {};
        area.forEach((a) => (h[a.kelompok] = (h[a.kelompok] ?? 0) + 1));
        return h;
    }, [area]);

    return (
        <PkptShell
            judul="1. Peta Auditan"
            keterangan="Daftar induk seluruh Area Pengawasan pada periode ini. Isinya bisa ditarik otomatis dari daftar Perangkat Daerah, Program Prioritas RPJMD, dan Program Pembangunan Bupati, lalu disunting seperlunya."
            konteks={konteks}
            aksi={
                bolehUbah ? (
                    <>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                                router.post(
                                    '/pkpt/peta-auditan/tarik',
                                    { periode: konteks.periode?.id },
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => toast.success('Peta Auditan ditarik dari data yang ada.'),
                                    },
                                )
                            }
                        >
                            <Download className="size-4" aria-hidden /> Tarik dari data
                        </Button>
                        <Button size="sm" onClick={() => setSunting(kosong())}>
                            <Plus className="size-4" aria-hidden /> Tambah
                        </Button>
                    </>
                ) : null
            }
        >
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                    <Search className="text-muted-foreground absolute top-1/2 left-2 size-4 -translate-y-1/2" aria-hidden />
                    <Input
                        className="w-72 pl-8"
                        placeholder="Cari Area Pengawasan"
                        aria-label="Cari Area Pengawasan"
                        value={cari}
                        onChange={(e) => setCari(e.target.value)}
                    />
                </div>
                {Object.entries(perKelompok).map(([k, n]) => (
                    <Badge key={k} variant="secondary">
                        {LABEL_KELOMPOK[k as Area['kelompok']]}: {n}
                    </Badge>
                ))}
                <span className="text-muted-foreground text-sm">Total {area.length} Area</span>
            </div>

            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                        <tr>
                            <th className="px-3 py-2 font-medium">Kelompok</th>
                            <th className="px-3 py-2 font-medium">Nama Area Pengawasan</th>
                            <th className="px-3 py-2 font-medium">SKPK Pengampu</th>
                            <th className="px-3 py-2 font-medium">Urusan</th>
                            <th className="px-3 py-2 text-right font-medium">Pagu (Rp)</th>
                            <th className="px-3 py-2 text-center font-medium">Irban</th>
                            <th className="px-3 py-2 text-center font-medium">Terakhir diawasi</th>
                            <th className="px-3 py-2" />
                        </tr>
                    </thead>
                    <tbody>
                        {tersaring.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-muted-foreground px-3 py-8 text-center">
                                    {area.length === 0
                                        ? 'Peta Auditan masih kosong. Tekan "Tarik dari data" untuk mengisinya dari daftar Perangkat Daerah dan Program Prioritas yang sudah ada.'
                                        : 'Tidak ada Area yang cocok dengan pencarian.'}
                                </td>
                            </tr>
                        ) : (
                            tersaring.map((a) => (
                                <tr key={a.id} className="border-t">
                                    <td className="px-3 py-2">
                                        <Badge variant="outline">{LABEL_KELOMPOK[a.kelompok]}</Badge>
                                    </td>
                                    <td className="px-3 py-2">
                                        <HighlightText text={a.nama} query={cari} />
                                    </td>
                                    <td className="text-muted-foreground px-3 py-2">{a.opd?.nama ?? a.opd_pendukung ?? '-'}</td>
                                    <td className="text-muted-foreground px-3 py-2">{a.urusan ?? '-'}</td>
                                    <td className="px-3 py-2 text-right tabular-nums">
                                        {a.pagu_anggaran === null ? (
                                            <span className="text-muted-foreground italic">belum tersedia</span>
                                        ) : (
                                            new Intl.NumberFormat('id-ID').format(a.pagu_anggaran)
                                        )}
                                    </td>
                                    <td className="px-3 py-2 text-center">{a.irban ?? '-'}</td>
                                    <td className="px-3 py-2 text-center tabular-nums">{a.tahun_terakhir_diawasi ?? '-'}</td>
                                    <td className="px-3 py-2 text-right">
                                        {bolehUbah ? (
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" aria-label={`Sunting ${a.nama}`} onClick={() => setSunting(a)}>
                                                    <Pencil className="size-4" aria-hidden />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Hapus ${a.nama}`}
                                                    onClick={() => {
                                                        if (!confirm(`Hapus Area Pengawasan "${a.nama}"?`)) return;
                                                        router.delete(`/pkpt/peta-auditan/${a.id}`, {
                                                            preserveScroll: true,
                                                            onSuccess: () => toast.success('Area dihapus.'),
                                                        });
                                                    }}
                                                >
                                                    <Trash2 className="size-4" aria-hidden />
                                                </Button>
                                            </div>
                                        ) : null}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {sunting ? <DialogArea awal={sunting} opd={opd} periodeId={konteks.periode?.id} tutup={() => setSunting(null)} /> : null}
        </PkptShell>
    );
}

function DialogArea({
    awal,
    opd,
    periodeId,
    tutup,
}: {
    awal: Partial<Area>;
    opd: { id: number; nama: string }[];
    periodeId?: number;
    tutup: () => void;
}) {
    const [form, setForm] = useState<Partial<Area>>(awal);
    const ubah = (k: keyof Area, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

    const simpan = () => {
        const muatan = {
            periode: periodeId,
            kelompok: form.kelompok,
            nama: form.nama,
            tujuan_sasaran: form.tujuan_sasaran || null,
            opd_id: form.opd_id || null,
            opd_pendukung: form.opd_pendukung || null,
            urusan: form.urusan || null,
            pagu_anggaran: form.pagu_anggaran || null,
            irban: form.irban || null,
            tahun_terakhir_diawasi: form.tahun_terakhir_diawasi || null,
            jenis_penugasan_terakhir: form.jenis_penugasan_terakhir || null,
            keterangan: form.keterangan || null,
        };

        const opsi = {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Area Pengawasan disimpan.');
                tutup();
            },
            onError: (e: Record<string, string>) => toast.error(Object.values(e)[0] ?? 'Gagal menyimpan.'),
        };

        if (form.id) router.put(`/pkpt/peta-auditan/${form.id}`, muatan, opsi);
        else router.post('/pkpt/peta-auditan', muatan, opsi);
    };

    return (
        <Dialog open onOpenChange={(o) => !o && tutup()}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{form.id ? 'Sunting Area Pengawasan' : 'Area Pengawasan baru'}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                        <Label htmlFor="kelompok">Kelompok</Label>
                        <select
                            id="kelompok"
                            className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
                            value={form.kelompok ?? 'skpk'}
                            onChange={(e) => ubah('kelompok', e.target.value)}
                        >
                            <option value="skpk">SKPK</option>
                            <option value="program_prioritas">Program Prioritas</option>
                            <option value="unit_lain">Unit Kerja Lain</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="opd">SKPK Pengampu Utama</Label>
                        <select
                            id="opd"
                            className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
                            value={form.opd_id ?? ''}
                            onChange={(e) => ubah('opd_id', e.target.value ? Number(e.target.value) : null)}
                        >
                            <option value="">(tidak ditetapkan)</option>
                            {opd.map((o) => (
                                <option key={o.id} value={o.id}>
                                    {o.nama}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor="nama">Nama Area Pengawasan</Label>
                        <Input id="nama" value={form.nama ?? ''} onChange={(e) => ubah('nama', e.target.value)} />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor="tujuan">Tujuan/Sasaran</Label>
                        <textarea
                            id="tujuan"
                            className="border-input bg-background min-h-16 w-full rounded-md border p-2 text-sm"
                            value={form.tujuan_sasaran ?? ''}
                            onChange={(e) => ubah('tujuan_sasaran', e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="pendukung">SKPK Pendukung</Label>
                        <Input id="pendukung" value={form.opd_pendukung ?? ''} onChange={(e) => ubah('opd_pendukung', e.target.value)} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="urusan">Urusan Pemerintahan</Label>
                        <Input id="urusan" value={form.urusan ?? ''} onChange={(e) => ubah('urusan', e.target.value)} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="pagu">Pagu Anggaran (Rp)</Label>
                        <Input
                            id="pagu"
                            type="number"
                            value={form.pagu_anggaran ?? ''}
                            onChange={(e) => ubah('pagu_anggaran', e.target.value ? Number(e.target.value) : null)}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="irban">Inspektur Pembantu</Label>
                        <select
                            id="irban"
                            className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
                            value={form.irban ?? ''}
                            onChange={(e) => ubah('irban', e.target.value || null)}
                        >
                            <option value="">(belum dibagi)</option>
                            {['I', 'II', 'III', 'IV', 'Khusus'].map((x) => (
                                <option key={x} value={x}>
                                    Inspektur Pembantu {x}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="tahun-awas">Tahun terakhir diawasi</Label>
                        <Input
                            id="tahun-awas"
                            type="number"
                            value={form.tahun_terakhir_diawasi ?? ''}
                            onChange={(e) => ubah('tahun_terakhir_diawasi', e.target.value ? Number(e.target.value) : null)}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="penugasan">Jenis penugasan terakhir</Label>
                        <Input
                            id="penugasan"
                            value={form.jenis_penugasan_terakhir ?? ''}
                            onChange={(e) => ubah('jenis_penugasan_terakhir', e.target.value)}
                        />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor="ket">Keterangan</Label>
                        <Input id="ket" value={form.keterangan ?? ''} onChange={(e) => ubah('keterangan', e.target.value)} />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={tutup}>
                        Batal
                    </Button>
                    <Button onClick={simpan}>Simpan</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
