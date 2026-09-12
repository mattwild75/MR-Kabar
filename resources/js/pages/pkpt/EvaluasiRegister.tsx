import PkptShell, { type KonteksPkpt } from '@/components/pkpt/pkpt-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';
import { CheckCheck, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Risiko {
    tipe: 'irs_pemda' | 'irs_pd' | 'iro_pd';
    id: number;
    kode_risiko: string;
    opd: string;
    sasaran: string;
    uraian_risiko: string;
    pemilik: string | null;
    penyebab: string | null;
    dampak: string | null;
    skala_dampak_register: number | null;
    skala_kemungkinan_register: number | null;
    nilai_risiko_register: number | null;
    evaluasi: {
        skala_dampak_evaluasi: number | null;
        skala_kemungkinan_evaluasi: number | null;
        nilai_risiko_evaluasi: number | null;
        simpulan: 'andal' | 'perlu_perbaikan';
        catatan: string | null;
        penilai: string | null;
    } | null;
}

interface Props extends KonteksPkpt {
    risiko: Risiko[];
}

const LABEL_TIPE: Record<Risiko['tipe'], string> = {
    irs_pemda: 'Strategis Pemda',
    irs_pd: 'Strategis PD',
    iro_pd: 'Operasional PD',
};

export default function EvaluasiRegister({ risiko, ...konteks }: Props) {
    const [cari, setCari] = useState('');
    const [saring, setSaring] = useState<'semua' | 'belum' | 'perbaikan'>('semua');
    const [sunting, setSunting] = useState<Risiko | null>(null);
    const [terimaTerbuka, setTerimaTerbuka] = useState(false);
    const bolehUbah = konteks.hak.input && !konteks.terkunci;

    const sudah = risiko.filter((r) => r.evaluasi).length;

    const tersaring = useMemo(() => {
        const k = cari.trim().toLowerCase();
        return risiko.filter((r) => {
            if (saring === 'belum' && r.evaluasi) return false;
            if (saring === 'perbaikan' && r.evaluasi?.simpulan !== 'perlu_perbaikan') return false;
            if (!k) return true;
            return [r.uraian_risiko, r.opd, r.kode_risiko, r.sasaran].filter(Boolean).some((v) => String(v).toLowerCase().includes(k));
        });
    }, [risiko, cari, saring]);

    return (
        <PkptShell
            judul="2. Evaluasi Register Risiko"
            keterangan="Inspektorat menilai keandalan Register Risiko sebelum nilainya dipakai merencanakan pengawasan. Yang tersimpan di sini hanya penilaian Inspektorat - data risiko milik SKPK tidak disentuh sama sekali."
            konteks={konteks}
            aksi={
                bolehUbah ? (
                    <Button size="sm" variant="outline" onClick={() => setTerimaTerbuka(true)}>
                        <CheckCheck className="size-4" aria-hidden /> Terima sisanya sebagai andal
                    </Button>
                ) : null
            }
        >
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                    <Search className="text-muted-foreground absolute top-1/2 left-2 size-4 -translate-y-1/2" aria-hidden />
                    <Input
                        className="w-72 pl-8"
                        placeholder="Cari risiko, OPD, kode"
                        aria-label="Cari risiko"
                        value={cari}
                        onChange={(e) => setCari(e.target.value)}
                    />
                </div>
                <select
                    aria-label="Saring hasil evaluasi"
                    className="border-input bg-background h-9 rounded-md border px-2 text-sm"
                    value={saring}
                    onChange={(e) => setSaring(e.target.value as typeof saring)}
                >
                    <option value="semua">Semua</option>
                    <option value="belum">Belum dievaluasi</option>
                    <option value="perbaikan">Perlu perbaikan</option>
                </select>
                <Badge variant={sudah === risiko.length ? 'default' : 'secondary'}>
                    {sudah} dari {risiko.length} risiko dievaluasi
                </Badge>
            </div>

            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                        <tr>
                            <th className="px-2 py-2 font-medium">Tingkat</th>
                            <th className="px-2 py-2 font-medium">Perangkat Daerah</th>
                            <th className="px-2 py-2 font-medium">Uraian Risiko</th>
                            <th className="px-2 py-2 text-center font-medium">D</th>
                            <th className="px-2 py-2 text-center font-medium">K</th>
                            <th className="px-2 py-2 text-center font-medium">Nilai</th>
                            <th className="px-2 py-2 text-center font-medium">Simpulan</th>
                            <th className="px-2 py-2 text-center font-medium">D evaluasi</th>
                            <th className="px-2 py-2 text-center font-medium">K evaluasi</th>
                            <th className="px-2 py-2" />
                        </tr>
                    </thead>
                    <tbody>
                        {tersaring.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="text-muted-foreground px-3 py-8 text-center">
                                    Tidak ada risiko yang cocok. Pastikan tahun dasar risiko periode ini memang berisi data.
                                </td>
                            </tr>
                        ) : (
                            tersaring.map((r) => (
                                <tr key={`${r.tipe}-${r.id}`} className="border-t">
                                    <td className="px-2 py-2">
                                        <Badge variant="outline">{LABEL_TIPE[r.tipe]}</Badge>
                                    </td>
                                    <td className="text-muted-foreground px-2 py-2">{r.opd}</td>
                                    <td className="max-w-md px-2 py-2">{r.uraian_risiko}</td>
                                    <td className="px-2 py-2 text-center tabular-nums">{r.skala_dampak_register ?? '-'}</td>
                                    <td className="px-2 py-2 text-center tabular-nums">{r.skala_kemungkinan_register ?? '-'}</td>
                                    <td className="px-2 py-2 text-center tabular-nums">{r.nilai_risiko_register ?? '-'}</td>
                                    <td className="px-2 py-2 text-center">
                                        {!r.evaluasi ? (
                                            <span className="text-muted-foreground text-xs italic">belum</span>
                                        ) : r.evaluasi.simpulan === 'andal' ? (
                                            <Badge variant="secondary">Andal</Badge>
                                        ) : (
                                            <Badge variant="destructive">Perlu perbaikan</Badge>
                                        )}
                                    </td>
                                    <td className="px-2 py-2 text-center tabular-nums">{r.evaluasi?.skala_dampak_evaluasi ?? '-'}</td>
                                    <td className="px-2 py-2 text-center tabular-nums">{r.evaluasi?.skala_kemungkinan_evaluasi ?? '-'}</td>
                                    <td className="px-2 py-2 text-right">
                                        {bolehUbah ? (
                                            <Button variant="ghost" size="sm" onClick={() => setSunting(r)}>
                                                Nilai
                                            </Button>
                                        ) : null}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {sunting ? <DialogNilai risiko={sunting} periodeId={konteks.periode?.id} tutup={() => setSunting(null)} /> : null}
            {terimaTerbuka ? <DialogTerima periodeId={konteks.periode?.id} tutup={() => setTerimaTerbuka(false)} /> : null}
        </PkptShell>
    );
}

function DialogNilai({ risiko, periodeId, tutup }: { risiko: Risiko; periodeId?: number; tutup: () => void }) {
    const [dampak, setDampak] = useState(String(risiko.evaluasi?.skala_dampak_evaluasi ?? risiko.skala_dampak_register ?? ''));
    const [kemungkinan, setKemungkinan] = useState(String(risiko.evaluasi?.skala_kemungkinan_evaluasi ?? risiko.skala_kemungkinan_register ?? ''));
    const [simpulan, setSimpulan] = useState<'andal' | 'perlu_perbaikan'>(risiko.evaluasi?.simpulan ?? 'andal');
    const [catatan, setCatatan] = useState(risiko.evaluasi?.catatan ?? '');

    const nilai = dampak && kemungkinan ? Number(dampak) * Number(kemungkinan) : null;

    return (
        <Dialog open onOpenChange={(o) => !o && tutup()}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Evaluasi Register Risiko</DialogTitle>
                </DialogHeader>

                <div className="bg-muted/30 space-y-1 rounded-md border p-3 text-sm">
                    <p className="font-medium">{risiko.uraian_risiko}</p>
                    <p className="text-muted-foreground">{risiko.opd}</p>
                    {risiko.penyebab ? <p className="text-muted-foreground text-xs">Penyebab: {risiko.penyebab}</p> : null}
                    <p className="text-muted-foreground text-xs">
                        Menurut register: dampak {risiko.skala_dampak_register ?? '-'}, kemungkinan {risiko.skala_kemungkinan_register ?? '-'}, nilai{' '}
                        {risiko.nilai_risiko_register ?? '-'}
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                        <Label htmlFor="d-eval">Skala dampak</Label>
                        <Input id="d-eval" type="number" min={1} max={5} value={dampak} onChange={(e) => setDampak(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="k-eval">Skala kemungkinan</Label>
                        <Input id="k-eval" type="number" min={1} max={5} value={kemungkinan} onChange={(e) => setKemungkinan(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="nilai-eval">Nilai risiko</Label>
                        <Input id="nilai-eval" value={nilai ?? '-'} readOnly className="bg-muted" />
                    </div>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="simpulan">Simpulan</Label>
                    <select
                        id="simpulan"
                        className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
                        value={simpulan}
                        onChange={(e) => setSimpulan(e.target.value as typeof simpulan)}
                    >
                        <option value="andal">Andal</option>
                        <option value="perlu_perbaikan">Perlu perbaikan</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="catatan-eval">
                        Catatan dan rekomendasi
                        {simpulan === 'perlu_perbaikan' ? <span className="text-destructive"> (wajib)</span> : null}
                    </Label>
                    <textarea
                        id="catatan-eval"
                        className="border-input bg-background min-h-20 w-full rounded-md border p-2 text-sm"
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                    />
                    <p className="text-muted-foreground text-xs">
                        Simpulan perlu perbaikan tanpa alasan tidak berguna bagi pemilik risiko yang harus memperbaikinya.
                    </p>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={tutup}>
                        Batal
                    </Button>
                    <Button
                        onClick={() =>
                            router.put(
                                `/pkpt/evaluasi-register/${risiko.tipe}/${risiko.id}`,
                                {
                                    periode: periodeId,
                                    skala_dampak_evaluasi: dampak ? Number(dampak) : null,
                                    skala_kemungkinan_evaluasi: kemungkinan ? Number(kemungkinan) : null,
                                    simpulan,
                                    catatan: catatan || null,
                                },
                                {
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        toast.success('Hasil evaluasi disimpan.');
                                        tutup();
                                    },
                                    onError: (e) => toast.error(Object.values(e)[0] ?? 'Gagal menyimpan.'),
                                },
                            )
                        }
                    >
                        Simpan
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function DialogTerima({ periodeId, tutup }: { periodeId?: number; tutup: () => void }) {
    const [catatan, setCatatan] = useState('');

    return (
        <Dialog open onOpenChange={(o) => !o && tutup()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Terima sisanya sebagai andal</DialogTitle>
                </DialogHeader>

                <p className="text-muted-foreground text-sm">
                    Menandai seluruh risiko yang belum dievaluasi sebagai andal, dengan skala apa adanya dari register. Perdep menyebut penelaahan
                    terbatas memang cukup ketika register disusun dengan pendampingan Inspektorat dan jedanya dekat. Yang sudah dinilai tidak ditimpa.
                </p>

                <div className="space-y-1">
                    <Label htmlFor="catatan-massal">Dasar penerimaan</Label>
                    <textarea
                        id="catatan-massal"
                        className="border-input bg-background min-h-20 w-full rounded-md border p-2 text-sm"
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                    />
                    <p className="text-muted-foreground text-xs">Tercatat pada setiap baris yang diterima.</p>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={tutup}>
                        Batal
                    </Button>
                    <Button
                        onClick={() =>
                            router.post(
                                '/pkpt/evaluasi-register/terima',
                                { periode: periodeId, catatan },
                                {
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        toast.success('Sisa risiko ditandai andal.');
                                        tutup();
                                    },
                                    onError: (e) => toast.error(Object.values(e)[0] ?? 'Gagal.'),
                                },
                            )
                        }
                    >
                        Terima
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
