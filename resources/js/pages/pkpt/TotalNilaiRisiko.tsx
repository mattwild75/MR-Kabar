import PkptShell, { type KonteksPkpt } from '@/components/pkpt/pkpt-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { Calculator, Printer } from 'lucide-react';
import { toast } from 'sonner';

interface Penilaian {
    id: number;
    area_id: number;
    nama_area: string;
    level_mr: number | null;
    jumlah_risiko: number;
    rld: number | null;
    rlk: number | null;
    nilai_komposit: number | null;
    skala_inheren: number | null;
    bobot_register: number | null;
    skala_fpm: number | null;
    bobot_faktor: number | null;
    bobot_faktor_terpakai: number;
    total_nilai_risiko: number | null;
    tingkat_risiko: string | null;
    keterangan: string | null;
    peringkat: number | null;
}

interface Props extends KonteksPkpt {
    penilaian: Penilaian[];
    faktor: { kode: string; bobot_persen: number }[];
    kesiapan: { boleh_hitung: { boleh: boolean; halangan: string[] } };
}

const num = (n: number | null, d = 2) => (n === null ? '-' : n.toFixed(d).replace('.', ','));

export default function TotalNilaiRisiko({ penilaian, kesiapan, ...konteks }: Props) {
    const belum = penilaian.filter((p) => p.total_nilai_risiko === null).length;

    return (
        <PkptShell
            judul="6. Total Nilai Risiko"
            keterangan="Hasil perhitungan per Area Pengawasan, lengkap dengan komponen penyusunnya. Angka di sini disimpan, bukan dihitung ulang setiap halaman dibuka, supaya lampiran Keputusan yang sudah ditandatangani tidak berubah diam-diam."
            konteks={konteks}
            aksi={
                <>
                    <Button size="sm" variant="outline" onClick={() => router.visit(`/pkpt/cetak/f9?periode=${konteks.periode?.id}`)}>
                        <Printer className="size-4" aria-hidden /> Cetak F9
                    </Button>
                    {konteks.hak.hitung && !konteks.terkunci ? (
                        <Button
                            size="sm"
                            disabled={!kesiapan.boleh_hitung.boleh}
                            onClick={() =>
                                router.post(
                                    '/pkpt/hitung',
                                    { periode: konteks.periode?.id },
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => toast.success('Perhitungan selesai.'),
                                        onError: (e) => toast.error(e.hitung ?? 'Perhitungan gagal.'),
                                    },
                                )
                            }
                        >
                            <Calculator className="size-4" aria-hidden /> Hitung Ulang
                        </Button>
                    ) : null}
                </>
            }
        >
            {penilaian.length === 0 ? (
                <div className="text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm">
                    Belum pernah dihitung untuk periode ini.
                    {kesiapan.boleh_hitung.boleh ? (
                        ' Tekan Hitung Ulang.'
                    ) : (
                        <ul className="mx-auto mt-3 max-w-xl list-disc space-y-1 pl-5 text-left">
                            {kesiapan.boleh_hitung.halangan.map((h) => (
                                <li key={h}>{h}</li>
                            ))}
                        </ul>
                    )}
                </div>
            ) : (
                <>
                    {belum > 0 ? (
                        <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
                            {belum} Area belum dapat dinilai. Alasannya tertulis pada kolom Keterangan masing-masing baris.
                        </p>
                    ) : null}

                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-left">
                                <tr>
                                    <th className="px-2 py-2 font-medium">Area Pengawasan</th>
                                    <th className="px-2 py-2 text-center font-medium">Level MR</th>
                                    <th className="px-2 py-2 text-center font-medium">Risiko</th>
                                    <th className="px-2 py-2 text-center font-medium">RLD</th>
                                    <th className="px-2 py-2 text-center font-medium">RLK</th>
                                    <th className="px-2 py-2 text-center font-medium">Komposit</th>
                                    <th className="px-2 py-2 text-center font-medium">Skala Inheren</th>
                                    <th className="px-2 py-2 text-center font-medium">Bobot RR</th>
                                    <th className="px-2 py-2 text-center font-medium">Skala FPM</th>
                                    <th className="px-2 py-2 text-center font-medium">Bobot FPM</th>
                                    <th className="px-2 py-2 text-center font-medium">Total</th>
                                    <th className="px-2 py-2 text-center font-medium">Tingkat</th>
                                    <th className="px-2 py-2 font-medium">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {penilaian.map((p) => (
                                    <tr key={p.id} className="border-t">
                                        <td className="px-2 py-2">{p.nama_area}</td>
                                        <td className="px-2 py-2 text-center tabular-nums">{p.level_mr ?? '-'}</td>
                                        <td className="px-2 py-2 text-center tabular-nums">{p.jumlah_risiko}</td>
                                        <td className="px-2 py-2 text-center tabular-nums">{num(p.rld)}</td>
                                        <td className="px-2 py-2 text-center tabular-nums">{num(p.rlk)}</td>
                                        <td className="px-2 py-2 text-center tabular-nums">{num(p.nilai_komposit)}</td>
                                        <td className="px-2 py-2 text-center tabular-nums">{p.skala_inheren ?? '-'}</td>
                                        <td className="px-2 py-2 text-center tabular-nums">
                                            {p.bobot_register !== null ? `${p.bobot_register}%` : '-'}
                                        </td>
                                        <td className="px-2 py-2 text-center tabular-nums">
                                            {num(p.skala_fpm)}
                                            {p.bobot_faktor_terpakai > 0 && p.bobot_faktor_terpakai < 100 ? (
                                                <span className="ml-1 text-xs text-amber-700 dark:text-amber-300">({p.bobot_faktor_terpakai}%)</span>
                                            ) : null}
                                        </td>
                                        <td className="px-2 py-2 text-center tabular-nums">{p.bobot_faktor !== null ? `${p.bobot_faktor}%` : '-'}</td>
                                        <td className="px-2 py-2 text-center font-semibold tabular-nums">{num(p.total_nilai_risiko)}</td>
                                        <td className="px-2 py-2 text-center">
                                            {p.tingkat_risiko ? <Badge variant="outline">{p.tingkat_risiko}</Badge> : '-'}
                                        </td>
                                        <td className="text-muted-foreground px-2 py-2 text-xs">{p.keterangan ?? ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </PkptShell>
    );
}
