import PkptShell, { type KonteksPkpt } from '@/components/pkpt/pkpt-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { toast } from 'sonner';

interface Penilaian {
    id: number;
    nama_area: string;
    total_nilai_risiko: number | null;
    tingkat_risiko: string | null;
    zona: string | null;
    frekuensi: string | null;
    rencana_tahun: number[] | null;
    keterangan: string | null;
    peringkat: number | null;
}

interface Props extends KonteksPkpt {
    penilaian: Penilaian[];
    zona: { zona: string; batas_bawah: number; batas_atas: number; frekuensi: string; warna: string }[];
    tingkat: { nama: string; batas_bawah: number; batas_atas: number; warna: string }[];
    tahunRencana: number[];
}

const num = (n: number | null) => (n === null ? '-' : n.toFixed(2).replace('.', ','));

export default function Peringkat({ penilaian, zona, tingkat, tahunRencana, ...konteks }: Props) {
    const bolehUbah = konteks.hak.rencana && !konteks.terkunci;
    const warnaZona = Object.fromEntries(zona.map((z) => [z.zona, z.warna]));

    const centang = (p: Penilaian, tahun: number, aktif: boolean) => {
        const kini = new Set(p.rencana_tahun ?? []);
        if (aktif) kini.add(tahun);
        else kini.delete(tahun);

        router.put(
            `/pkpt/peringkat/${p.id}/tahun`,
            { periode: konteks.periode?.id, rencana_tahun: [...kini].sort() },
            { preserveScroll: true, onError: () => toast.error('Gagal menyimpan rencana tahun.') },
        );
    };

    return (
        <PkptShell
            judul="7. Peringkat dan Frekuensi"
            keterangan="Area Pengawasan diurutkan menurut Total Nilai Risiko, lalu ditetapkan frekuensi pengawasannya sampai lima tahun ke depan. Zona menentukan seberapa sering diawasi; tingkat risiko menamai besarannya - keduanya sumbu yang berbeda."
            konteks={konteks}
            aksi={
                <Button size="sm" variant="outline" onClick={() => router.visit(`/pkpt/cetak/f10?periode=${konteks.periode?.id}`)}>
                    <Printer className="size-4" aria-hidden /> Cetak F10
                </Button>
            }
        >
            <div className="grid gap-3 sm:grid-cols-2">
                <section className="rounded-lg border p-3">
                    <h2 className="mb-2 text-sm font-semibold">Zona frekuensi (3 pita)</h2>
                    <ul className="space-y-1 text-sm">
                        {zona.map((z) => (
                            <li key={z.zona} className="flex items-center gap-2">
                                <span className={`inline-block rounded px-2 py-0.5 text-xs ${z.warna}`}>{z.zona}</span>
                                <span className="text-muted-foreground">
                                    {num(z.batas_bawah)} sampai {num(z.batas_atas)} - {z.frekuensi}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="rounded-lg border p-3">
                    <h2 className="mb-2 text-sm font-semibold">Tingkat risiko (5 pita)</h2>
                    <ul className="space-y-1 text-sm">
                        {tingkat.map((t) => (
                            <li key={t.nama} className="flex items-center gap-2">
                                <span className={`inline-block rounded px-2 py-0.5 text-xs ${t.warna}`}>{t.nama}</span>
                                <span className="text-muted-foreground">
                                    {num(t.batas_bawah)} sampai {num(t.batas_atas)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            {penilaian.length === 0 ? (
                <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                    Belum ada hasil perhitungan. Jalankan Hitung Ulang dari menu Ikhtisar atau Total Nilai Risiko.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-2 py-2 text-center font-medium">#</th>
                                <th className="px-2 py-2 font-medium">Area Pengawasan</th>
                                <th className="px-2 py-2 text-center font-medium">Total</th>
                                <th className="px-2 py-2 text-center font-medium">Tingkat Risiko</th>
                                <th className="px-2 py-2 text-center font-medium">Zona</th>
                                <th className="px-2 py-2 font-medium">Frekuensi</th>
                                {tahunRencana.map((t) => (
                                    <th key={t} className="px-2 py-2 text-center font-medium tabular-nums">
                                        {t}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {penilaian.map((p) => (
                                <tr key={p.id} className="border-t">
                                    <td className="px-2 py-2 text-center tabular-nums text-muted-foreground">
                                        {p.peringkat ?? '-'}
                                    </td>
                                    <td className="px-2 py-2">{p.nama_area}</td>
                                    <td className="px-2 py-2 text-center font-semibold tabular-nums">
                                        {num(p.total_nilai_risiko)}
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        {p.tingkat_risiko ? <Badge variant="outline">{p.tingkat_risiko}</Badge> : '-'}
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        {p.zona ? (
                                            <span className={`inline-block rounded px-2 py-0.5 text-xs ${warnaZona[p.zona] ?? ''}`}>
                                                {p.zona}
                                            </span>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td className="px-2 py-2 text-muted-foreground">{p.frekuensi ?? '-'}</td>
                                    {tahunRencana.map((t) => (
                                        <td key={t} className="px-2 py-2 text-center">
                                            <input
                                                type="checkbox"
                                                aria-label={`Rencana pengawasan ${p.nama_area} tahun ${t}`}
                                                checked={(p.rencana_tahun ?? []).includes(t)}
                                                disabled={!bolehUbah || p.total_nilai_risiko === null}
                                                onChange={(e) => centang(p, t, e.target.checked)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </PkptShell>
    );
}
