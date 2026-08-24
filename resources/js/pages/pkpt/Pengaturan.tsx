import PkptShell, { type KonteksPkpt } from '@/components/pkpt/pkpt-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface BobotKematangan {
    level_mr: number;
    sebutan: string;
    bobot_register: number;
    bobot_faktor: number;
}

interface Faktor {
    kode: string;
    nama: string;
    bobot_persen: number;
}

interface Props extends KonteksPkpt {
    bobotKematangan: BobotKematangan[];
    konversiInheren: { skala: number; nilai_min: number; nilai_max: number }[];
    faktor: Faktor[];
    zona: { zona: string; batas_bawah: number; batas_atas: number; frekuensi: string; warna: string }[];
    tingkat: { nama: string; batas_bawah: number; batas_atas: number; warna: string }[];
    sektorUnggulan: { id: number; nama: string }[];
}

export default function Pengaturan({
    bobotKematangan,
    konversiInheren,
    faktor,
    zona,
    tingkat,
    sektorUnggulan,
    ...konteks
}: Props) {
    const boleh = konteks.hak.pengaturan;
    const [bobotFaktor, setBobotFaktor] = useState(faktor.map((f) => ({ kode: f.kode, bobot_persen: f.bobot_persen })));
    const [bobotLevel, setBobotLevel] = useState(
        bobotKematangan.map((b) => ({ level_mr: b.level_mr, bobot_register: b.bobot_register })),
    );
    const [sektorBaru, setSektorBaru] = useState('');

    const jumlahBobot = bobotFaktor.reduce((a, f) => a + (Number(f.bobot_persen) || 0), 0);

    return (
        <PkptShell
            judul="Pengaturan PPBR"
            keterangan="Angka yang ditetapkan Keputusan Inspektur. Mengubahnya di sini tidak memengaruhi periode yang sudah ditetapkan - bobot dan hasil hitung periode itu sudah tersimpan pada kertas kerjanya sendiri."
            konteks={konteks}
        >
            <section className="rounded-lg border">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                    <h2 className="text-sm font-semibold">Bobot Faktor Pertimbangan Manajemen (Tabel 8)</h2>
                    <Badge variant={jumlahBobot === 100 ? 'default' : 'destructive'}>Jumlah {jumlahBobot}%</Badge>
                </div>

                <div className="space-y-3 p-4">
                    {faktor.map((f, i) => (
                        <div key={f.kode} className="flex flex-wrap items-center gap-3">
                            <span className="w-14 font-medium">{f.kode}</span>
                            <span className="min-w-0 flex-1 text-sm text-muted-foreground">{f.nama}</span>
                            <Input
                                type="number"
                                aria-label={`Bobot ${f.kode}`}
                                className="w-24 text-right tabular-nums"
                                disabled={!boleh}
                                value={bobotFaktor[i]?.bobot_persen ?? 0}
                                onChange={(e) =>
                                    setBobotFaktor((b) =>
                                        b.map((x, j) => (j === i ? { ...x, bobot_persen: Number(e.target.value) } : x)),
                                    )
                                }
                            />
                            <span className="text-sm">%</span>
                        </div>
                    ))}

                    {jumlahBobot !== 100 ? (
                        <p className="text-sm text-destructive">
                            Jumlah bobot harus tepat 100%. Di luar itu, skala gabungannya keluar dari rentang 1
                            sampai 5 dan peringkatnya tidak lagi sebanding dengan tabel mana pun di Keputusan.
                        </p>
                    ) : null}

                    {boleh ? (
                        <Button
                            size="sm"
                            disabled={jumlahBobot !== 100}
                            onClick={() =>
                                router.post(
                                    '/pkpt/pengaturan/bobot-faktor',
                                    { faktor: bobotFaktor },
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => toast.success('Bobot faktor disimpan.'),
                                        onError: (e) => toast.error(Object.values(e)[0] ?? 'Gagal.'),
                                    },
                                )
                            }
                        >
                            Simpan bobot faktor
                        </Button>
                    ) : null}
                </div>
            </section>

            <section className="rounded-lg border">
                <h2 className="border-b px-4 py-3 text-sm font-semibold">
                    Komposisi bobot per tingkat kematangan MR (Tabel 6)
                </h2>
                <div className="space-y-3 p-4">
                    {bobotKematangan.map((b, i) => (
                        <div key={b.level_mr} className="flex flex-wrap items-center gap-3">
                            <span className="w-16 font-medium">Level {b.level_mr}</span>
                            <span className="min-w-0 flex-1 text-sm text-muted-foreground">{b.sebutan}</span>
                            <Input
                                type="number"
                                aria-label={`Bobot Register Risiko level ${b.level_mr}`}
                                className="w-24 text-right tabular-nums"
                                disabled={!boleh}
                                value={bobotLevel[i]?.bobot_register ?? 0}
                                onChange={(e) =>
                                    setBobotLevel((x) =>
                                        x.map((y, j) => (j === i ? { ...y, bobot_register: Number(e.target.value) } : y)),
                                    )
                                }
                            />
                            <span className="text-sm text-muted-foreground">
                                % Register : {100 - (bobotLevel[i]?.bobot_register ?? 0)}% Faktor
                            </span>
                        </div>
                    ))}

                    {boleh ? (
                        <Button
                            size="sm"
                            onClick={() =>
                                router.post(
                                    '/pkpt/pengaturan/bobot-kematangan',
                                    { bobot: bobotLevel },
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => toast.success('Komposisi bobot disimpan.'),
                                        onError: (e) => toast.error(Object.values(e)[0] ?? 'Gagal.'),
                                    },
                                )
                            }
                        >
                            Simpan komposisi bobot
                        </Button>
                    ) : null}
                </div>
            </section>

            <div className="grid gap-4 md:grid-cols-2">
                <section className="rounded-lg border">
                    <h2 className="border-b px-4 py-3 text-sm font-semibold">Konversi nilai risiko inheren (Tabel 7)</h2>
                    <ul className="space-y-1 p-4 text-sm">
                        {konversiInheren.map((k) => (
                            <li key={k.skala} className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Nilai {k.nilai_min} sampai {k.nilai_max}
                                </span>
                                <span className="font-medium tabular-nums">Skala {k.skala}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="rounded-lg border">
                    <h2 className="border-b px-4 py-3 text-sm font-semibold">Zona frekuensi dan tingkat risiko</h2>
                    <div className="space-y-3 p-4 text-sm">
                        <div>
                            <p className="mb-1 text-xs font-medium text-muted-foreground">Zona frekuensi (3 pita)</p>
                            <ul className="space-y-1">
                                {zona.map((z) => (
                                    <li key={z.zona} className="flex items-center justify-between gap-2">
                                        <span className={`rounded px-2 py-0.5 text-xs ${z.warna}`}>{z.zona}</span>
                                        <span className="text-muted-foreground">{z.frekuensi}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <p className="mb-1 text-xs font-medium text-muted-foreground">Tingkat risiko (5 pita)</p>
                            <ul className="flex flex-wrap gap-1">
                                {tingkat.map((t) => (
                                    <li key={t.nama} className={`rounded px-2 py-0.5 text-xs ${t.warna}`}>
                                        {t.nama}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>
            </div>

            <section className="rounded-lg border">
                <h2 className="border-b px-4 py-3 text-sm font-semibold">
                    Sektor unggulan daerah {konteks.periode ? `- Periode ${konteks.periode.tahun_pkpt}` : ''}
                </h2>
                <div className="space-y-3 p-4">
                    <p className="text-sm text-muted-foreground">
                        Dipakai Faktor Risiko 2 (bobot {faktor.find((f) => f.kode === 'FR2')?.bobot_persen ?? 25}%).
                        Tanpa daftar resmi, kolom sektor unggulan hanya bisa diisi berdasarkan pertimbangan
                        profesional, dan keterukuran FR2 melemah.
                    </p>

                    {sektorUnggulan.length === 0 ? (
                        <p className="text-sm italic text-muted-foreground">Belum ada sektor unggulan ditetapkan.</p>
                    ) : (
                        <ul className="flex flex-wrap gap-2">
                            {sektorUnggulan.map((s) => (
                                <li key={s.id}>
                                    <Badge variant="secondary" className="gap-1">
                                        {s.nama}
                                        {boleh ? (
                                            <button
                                                type="button"
                                                aria-label={`Hapus sektor ${s.nama}`}
                                                onClick={() =>
                                                    router.delete(`/pkpt/pengaturan/sektor-unggulan/${s.id}`, {
                                                        preserveScroll: true,
                                                        onSuccess: () => toast.success('Dihapus.'),
                                                    })
                                                }
                                            >
                                                <Trash2 className="size-3" aria-hidden />
                                            </button>
                                        ) : null}
                                    </Badge>
                                </li>
                            ))}
                        </ul>
                    )}

                    {boleh && konteks.periode ? (
                        <div className="flex gap-2">
                            <div className="flex-1 space-y-1">
                                <Label htmlFor="sektor-baru" className="sr-only">
                                    Nama sektor unggulan
                                </Label>
                                <Input
                                    id="sektor-baru"
                                    placeholder="Nama sektor unggulan"
                                    value={sektorBaru}
                                    onChange={(e) => setSektorBaru(e.target.value)}
                                />
                            </div>
                            <Button
                                onClick={() =>
                                    router.post(
                                        '/pkpt/pengaturan/sektor-unggulan',
                                        { periode: konteks.periode?.id, nama: sektorBaru },
                                        {
                                            preserveScroll: true,
                                            onSuccess: () => {
                                                toast.success('Ditambahkan.');
                                                setSektorBaru('');
                                            },
                                            onError: (e) => toast.error(Object.values(e)[0] ?? 'Gagal.'),
                                        },
                                    )
                                }
                            >
                                <Plus className="size-4" aria-hidden /> Tambah
                            </Button>
                        </div>
                    ) : null}
                </div>
            </section>
        </PkptShell>
    );
}
