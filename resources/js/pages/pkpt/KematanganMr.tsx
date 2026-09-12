import PkptShell, { type KonteksPkpt } from '@/components/pkpt/pkpt-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';
import { Wand2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Baris {
    opd_id: number;
    nama: string;
    punya_register: boolean;
    jumlah_risiko: number;
    level_mr: number | null;
    sumber_penetapan: string | null;
    skor_spip: number | null;
    strategi_pengawasan: string | null;
    bobot_register: number | null;
    bobot_faktor: number | null;
    keterangan: string | null;
}

interface Acuan {
    level_mr: number;
    sebutan: string;
    karakteristik: string;
    bobot_register: number;
    bobot_faktor: number;
}

interface Props extends KonteksPkpt {
    baris: Baris[];
    acuan: Acuan[];
}

const LABEL_SUMBER: Record<string, string> = {
    maturitas_spip_skpk: 'Skor SPIP satuan kerja',
    maturitas_spip_pemda: 'Skor SPIP Pemerintah Kabupaten',
    penilaian_inspektorat: 'Penilaian Inspektorat',
};

export default function KematanganMr({ baris, acuan, ...konteks }: Props) {
    const [adopsiTerbuka, setAdopsiTerbuka] = useState(false);
    const [sunting, setSunting] = useState<Baris | null>(null);
    const bolehUbah = konteks.hak.input && !konteks.terkunci;
    const belum = baris.filter((b) => b.level_mr === null).length;

    return (
        <PkptShell
            judul="3. Kematangan MR dan Bobot"
            keterangan="Tingkat kematangan manajemen risiko menentukan seluruh komposisi bobot. Selama belum satu pun SKPK ditetapkan levelnya, Total Nilai Risiko tidak dapat dihitung untuk satu Area pun."
            konteks={konteks}
            aksi={
                bolehUbah ? (
                    <Button size="sm" onClick={() => setAdopsiTerbuka(true)}>
                        <Wand2 className="size-4" aria-hidden /> Adopsi skor maturitas SPIP
                    </Button>
                ) : null
            }
        >
            {belum > 0 ? (
                <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
                    {belum} dari {baris.length} Perangkat Daerah belum ditetapkan level kematangannya. Area Pengawasan miliknya tidak akan memperoleh
                    Total Nilai Risiko sampai levelnya diisi.
                </p>
            ) : null}

            <section className="rounded-lg border">
                <h2 className="border-b px-4 py-2 text-sm font-semibold">Acuan komposisi bobot</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-3 py-2 font-medium">Level</th>
                                <th className="px-3 py-2 font-medium">Sebutan</th>
                                <th className="px-3 py-2 font-medium">Karakteristik</th>
                                <th className="px-3 py-2 text-center font-medium">Bobot Register</th>
                                <th className="px-3 py-2 text-center font-medium">Bobot Faktor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {acuan.map((a) => (
                                <tr key={a.level_mr} className="border-t">
                                    <td className="px-3 py-2 text-center tabular-nums">{a.level_mr}</td>
                                    <td className="px-3 py-2 font-medium">{a.sebutan}</td>
                                    <td className="text-muted-foreground px-3 py-2">{a.karakteristik}</td>
                                    <td className="px-3 py-2 text-center tabular-nums">{a.bobot_register}%</td>
                                    <td className="px-3 py-2 text-center tabular-nums">{a.bobot_faktor}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                        <tr>
                            <th className="px-3 py-2 font-medium">Perangkat Daerah</th>
                            <th className="px-3 py-2 text-center font-medium">Register Risiko</th>
                            <th className="px-3 py-2 text-center font-medium">Level MR</th>
                            <th className="px-3 py-2 font-medium">Dasar penetapan</th>
                            <th className="px-3 py-2 text-center font-medium">Bobot Register</th>
                            <th className="px-3 py-2 text-center font-medium">Bobot Faktor</th>
                            <th className="px-3 py-2" />
                        </tr>
                    </thead>
                    <tbody>
                        {baris.map((b) => (
                            <tr key={b.opd_id} className="border-t">
                                <td className="px-3 py-2">{b.nama}</td>
                                <td className="px-3 py-2 text-center">
                                    {b.punya_register ? (
                                        <Badge variant="secondary">{b.jumlah_risiko} risiko</Badge>
                                    ) : (
                                        <span className="text-muted-foreground text-xs italic">belum ada</span>
                                    )}
                                </td>
                                <td className="px-3 py-2 text-center tabular-nums">
                                    {b.level_mr === null ? <span className="text-muted-foreground text-xs italic">belum</span> : b.level_mr}
                                </td>
                                <td className="text-muted-foreground px-3 py-2">
                                    {b.sumber_penetapan ? LABEL_SUMBER[b.sumber_penetapan] : '-'}
                                    {b.skor_spip !== null ? ` (${b.skor_spip})` : ''}
                                </td>
                                <td className="px-3 py-2 text-center tabular-nums">{b.bobot_register !== null ? `${b.bobot_register}%` : '-'}</td>
                                <td className="px-3 py-2 text-center tabular-nums">{b.bobot_faktor !== null ? `${b.bobot_faktor}%` : '-'}</td>
                                <td className="px-3 py-2 text-right">
                                    {bolehUbah ? (
                                        <Button variant="ghost" size="sm" onClick={() => setSunting(b)}>
                                            Sunting
                                        </Button>
                                    ) : null}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {adopsiTerbuka ? <DialogAdopsi periodeId={konteks.periode?.id} tutup={() => setAdopsiTerbuka(false)} /> : null}
            {sunting ? <DialogLevel baris={sunting} periodeId={konteks.periode?.id} tutup={() => setSunting(null)} /> : null}
        </PkptShell>
    );
}

function DialogAdopsi({ periodeId, tutup }: { periodeId?: number; tutup: () => void }) {
    const [skor, setSkor] = useState('');
    const [timpa, setTimpa] = useState(false);

    return (
        <Dialog open onOpenChange={(o) => !o && tutup()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adopsi skor maturitas SPIP</DialogTitle>
                </DialogHeader>

                <p className="text-muted-foreground text-sm">
                    Perdep PPKD 08/2020 mengizinkan APIP memakai skor maturitas SPIP Pemerintah Daerah sebagai langkah awal penerapan, ketika satuan
                    kerja belum punya skor tersendiri. Sumber penetapannya dicatat, jadi terbaca di kertas kerja bahwa levelnya diadopsi.
                </p>

                <div className="space-y-1">
                    <Label htmlFor="skor">Skor maturitas SPIP Pemerintah Kabupaten (0 sampai 5)</Label>
                    <Input id="skor" type="number" step="0.01" value={skor} onChange={(e) => setSkor(e.target.value)} />
                </div>

                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={timpa} onChange={(e) => setTimpa(e.target.checked)} />
                    Timpa juga yang levelnya sudah ditetapkan tangan
                </label>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={tutup}>
                        Batal
                    </Button>
                    <Button
                        onClick={() =>
                            router.post(
                                '/pkpt/kematangan-mr/adopsi-spip',
                                { periode: periodeId, skor_spip: Number(skor), timpa },
                                {
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        toast.success('Skor SPIP diadopsi.');
                                        tutup();
                                    },
                                    onError: (e) => toast.error(Object.values(e)[0] ?? 'Gagal.'),
                                },
                            )
                        }
                    >
                        Terapkan
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function DialogLevel({ baris, periodeId, tutup }: { baris: Baris; periodeId?: number; tutup: () => void }) {
    const [level, setLevel] = useState(baris.level_mr === null ? '' : String(baris.level_mr));
    const [sumber, setSumber] = useState(baris.sumber_penetapan ?? 'penilaian_inspektorat');
    const [skor, setSkor] = useState(baris.skor_spip === null ? '' : String(baris.skor_spip));
    const [keterangan, setKeterangan] = useState(baris.keterangan ?? '');

    return (
        <Dialog open onOpenChange={(o) => !o && tutup()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{baris.nama}</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="space-y-1">
                        <Label htmlFor="level">Level kematangan MR</Label>
                        <select
                            id="level"
                            className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                        >
                            <option value="">(belum ditetapkan)</option>
                            <option value="0">0 - Belum menerapkan MR (bobot 0 : 100)</option>
                            <option value="1">1 - Risk Naive (40 : 60)</option>
                            <option value="2">2 - Risk Aware (40 : 60)</option>
                            <option value="3">3 - Risk Defined (70 : 30)</option>
                            <option value="4">4 - Risk Managed (90 : 10)</option>
                            <option value="5">5 - Risk Enabled (90 : 10)</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="sumber">Dasar penetapan</Label>
                        <select
                            id="sumber"
                            className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
                            value={sumber}
                            onChange={(e) => setSumber(e.target.value)}
                        >
                            <option value="penilaian_inspektorat">Penilaian tersendiri oleh Inspektorat</option>
                            <option value="maturitas_spip_skpk">Adopsi skor maturitas SPIP satuan kerja</option>
                            <option value="maturitas_spip_pemda">Adopsi skor maturitas SPIP Pemerintah Kabupaten</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="skor-satker">Skor maturitas SPIP (bila ada)</Label>
                        <Input id="skor-satker" type="number" step="0.01" value={skor} onChange={(e) => setSkor(e.target.value)} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="ket-level">Keterangan</Label>
                        <textarea
                            id="ket-level"
                            className="border-input bg-background min-h-16 w-full rounded-md border p-2 text-sm"
                            value={keterangan}
                            onChange={(e) => setKeterangan(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={tutup}>
                        Batal
                    </Button>
                    <Button
                        onClick={() =>
                            router.put(
                                `/pkpt/kematangan-mr/${baris.opd_id}`,
                                {
                                    periode: periodeId,
                                    level_mr: level === '' ? null : Number(level),
                                    sumber_penetapan: sumber,
                                    skor_spip: skor === '' ? null : Number(skor),
                                    keterangan: keterangan || null,
                                },
                                {
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        toast.success('Tersimpan.');
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
