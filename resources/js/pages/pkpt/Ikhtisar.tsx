import PkptShell, { type KonteksPkpt } from '@/components/pkpt/pkpt-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';
import { AlertTriangle, Calculator, CheckCircle2, Lock, LockOpen, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Kesiapan {
    total_area: number;
    total_opd: number;
    register: { terisi: number; dari: number; persen: number };
    kematangan: { terisi: number; dari: number; persen: number; memblokir: boolean };
    faktor: { kode: string; nama: string; bobot: number; terisi: number; dari: number; persen: number }[];
    sektor_unggulan: number;
    belanja_langsung: number | null;
    bobot_terpakai: number;
    boleh_hitung: { boleh: boolean; halangan: string[] };
}

interface Ringkasan {
    dinilai: number;
    belum_dinilai: number;
    per_zona: Record<string, number>;
    dihitung_pada: string | null;
}

interface Props extends KonteksPkpt {
    kesiapan: Kesiapan | null;
    ringkasan: Ringkasan | null;
    tahunRisikoTersedia: number[];
}

const rupiah = (n: number | null) => (n === null ? 'belum diisi' : new Intl.NumberFormat('id-ID').format(n));

export default function Ikhtisar({ kesiapan, ringkasan, tahunRisikoTersedia, ...konteks }: Props) {
    const [buatTerbuka, setBuatTerbuka] = useState(false);
    const [tetapkanTerbuka, setTetapkanTerbuka] = useState(false);
    const [bukaTerbuka, setBukaTerbuka] = useState(false);

    const periode = konteks.periode;
    const hak = konteks.hak;

    const hitungUlang = () => {
        router.post(
            '/pkpt/hitung',
            { periode: periode?.id },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Perhitungan selesai.'),
                onError: (e) => toast.error(e.hitung ?? 'Perhitungan gagal.'),
            },
        );
    };

    return (
        <PkptShell
            judul="Ikhtisar dan Periode"
            keterangan="Pintu masuk Perencanaan Pengawasan Berbasis Risiko. Satu periode PKPT bertumpu pada satu tahun penilaian risiko di MR Kabar, dan keduanya memang tahun yang berbeda."
            konteks={konteks}
            aksi={
                hak.input && !konteks.terkunci ? (
                    <Button size="sm" onClick={() => setBuatTerbuka(true)}>
                        <Plus className="size-4" aria-hidden /> Periode baru
                    </Button>
                ) : null
            }
        >
            {!periode ? (
                <div className="rounded-md border border-dashed p-8 text-center">
                    <p className="text-muted-foreground text-sm">Belum ada Periode PKPT. Buat satu untuk mulai menyusun perencanaan pengawasan.</p>
                    {hak.input ? (
                        <Button className="mt-4" onClick={() => setBuatTerbuka(true)}>
                            <Plus className="size-4" aria-hidden /> Buat Periode PKPT
                        </Button>
                    ) : null}
                </div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Kartu judul="Periode">
                            <dl className="space-y-1 text-sm">
                                <Baris k="Tahun PKPT" v={String(periode.tahun_pkpt)} />
                                <Baris k="Tahun dasar risiko" v={String(periode.tahun_dasar_risiko)} />
                                <Baris k="Status" v={periode.status} />
                                <Baris k="Belanja langsung APBK" v={`Rp ${rupiah(periode.total_belanja_langsung)}`} />
                                {periode.nomor_keputusan ? <Baris k="Nomor Keputusan" v={periode.nomor_keputusan} /> : null}
                            </dl>
                        </Kartu>

                        <Kartu judul="Hasil hitung terakhir">
                            {ringkasan?.dihitung_pada ? (
                                <dl className="space-y-1 text-sm">
                                    <Baris k="Area dinilai" v={String(ringkasan.dinilai)} />
                                    <Baris k="Belum dapat dinilai" v={String(ringkasan.belum_dinilai)} />
                                    {Object.entries(ringkasan.per_zona).map(([zona, n]) => (
                                        <Baris key={zona} k={`Zona ${zona}`} v={String(n)} />
                                    ))}
                                </dl>
                            ) : (
                                <p className="text-muted-foreground text-sm">Belum pernah dihitung.</p>
                            )}
                        </Kartu>

                        <Kartu judul="Tindakan">
                            <div className="flex flex-col gap-2">
                                <Button onClick={hitungUlang} disabled={!hak.hitung || !kesiapan?.boleh_hitung.boleh} className="justify-start">
                                    <Calculator className="size-4" aria-hidden /> Hitung Ulang
                                </Button>

                                {!kesiapan?.boleh_hitung.boleh ? (
                                    <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-xs">
                                        {kesiapan?.boleh_hitung.halangan.map((h) => <li key={h}>{h}</li>)}
                                    </ul>
                                ) : null}

                                {hak.tetapkan && !konteks.terkunci ? (
                                    <Button variant="outline" className="justify-start" onClick={() => setTetapkanTerbuka(true)}>
                                        <Lock className="size-4" aria-hidden /> Tetapkan dan kunci periode
                                    </Button>
                                ) : null}

                                {konteks.terkunci ? (
                                    <Button variant="outline" className="justify-start" onClick={() => setBukaTerbuka(true)}>
                                        <LockOpen className="size-4" aria-hidden /> Buka kembali (Super Admin)
                                    </Button>
                                ) : null}
                            </div>
                        </Kartu>
                    </div>

                    {kesiapan ? <PanelKesiapan kesiapan={kesiapan} /> : null}
                </>
            )}

            <DialogPeriodeBaru terbuka={buatTerbuka} tutup={() => setBuatTerbuka(false)} tahunTersedia={tahunRisikoTersedia} />
            {periode ? (
                <>
                    <DialogTetapkan terbuka={tetapkanTerbuka} tutup={() => setTetapkanTerbuka(false)} periodeId={periode.id} />
                    <DialogBuka terbuka={bukaTerbuka} tutup={() => setBukaTerbuka(false)} periodeId={periode.id} />
                </>
            ) : null}
        </PkptShell>
    );
}

function Kartu({ judul, children }: { judul: string; children: React.ReactNode }) {
    return (
        <section className="rounded-lg border p-4">
            <h2 className="mb-3 text-sm font-semibold">{judul}</h2>
            {children}
        </section>
    );
}

function Baris({ k, v }: { k: string; v: string }) {
    return (
        <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="text-right font-medium tabular-nums">{v}</dd>
        </div>
    );
}

/**
 * Panel Kesiapan Data — menjawab satu pertanyaan: berapa persen bobot yang
 * benar-benar terpakai?
 *
 * Ditampilkan menonjol, bukan disembunyikan di catatan kaki. PKPT yang
 * ditandatangani tanpa ada yang tahu 45% bobot faktornya kosong adalah
 * kegagalan yang paling mungkin terjadi pada siklus pertama.
 */
function PanelKesiapan({ kesiapan }: { kesiapan: Kesiapan }) {
    return (
        <section className="rounded-lg border">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                <h2 className="text-sm font-semibold">Kesiapan Data</h2>
                <Badge variant={kesiapan.bobot_terpakai >= 100 ? 'default' : 'secondary'}>
                    Bobot faktor terpakai rata-rata {kesiapan.bobot_terpakai}%
                </Badge>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                        <tr>
                            <th className="px-4 py-2 font-medium">Masukan</th>
                            <th className="px-4 py-2 font-medium">Bobot</th>
                            <th className="px-4 py-2 font-medium">Terisi</th>
                            <th className="px-4 py-2 font-medium">Kelengkapan</th>
                        </tr>
                    </thead>
                    <tbody>
                        <BarisKesiapan
                            nama="Register Risiko pada MR Kabar"
                            terisi={`${kesiapan.register.terisi} dari ${kesiapan.register.dari} SKPK`}
                            persen={kesiapan.register.persen}
                        />
                        <BarisKesiapan
                            nama="Tingkat kematangan MR"
                            terisi={`${kesiapan.kematangan.terisi} dari ${kesiapan.kematangan.dari} SKPK`}
                            persen={kesiapan.kematangan.persen}
                            memblokir={kesiapan.kematangan.memblokir}
                        />
                        {kesiapan.faktor.map((f) => (
                            <BarisKesiapan
                                key={f.kode}
                                nama={`${f.kode} ${f.nama}`}
                                bobot={`${f.bobot}%`}
                                terisi={`${f.terisi} dari ${f.dari} Area`}
                                persen={f.persen}
                            />
                        ))}
                        <BarisKesiapan
                            nama="Sektor unggulan daerah"
                            terisi={kesiapan.sektor_unggulan > 0 ? `${kesiapan.sektor_unggulan} sektor` : 'belum ditetapkan'}
                            persen={kesiapan.sektor_unggulan > 0 ? 100 : 0}
                        />
                        <BarisKesiapan
                            nama="Total belanja langsung APBK"
                            terisi={kesiapan.belanja_langsung ? 'terisi' : 'belum diisi'}
                            persen={kesiapan.belanja_langsung ? 100 : 0}
                        />
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function BarisKesiapan({
    nama,
    bobot,
    terisi,
    persen,
    memblokir,
}: {
    nama: string;
    bobot?: string;
    terisi: string;
    persen: number;
    memblokir?: boolean;
}) {
    return (
        <tr className="border-t">
            <td className="px-4 py-2">
                <span className="flex items-center gap-2">
                    {nama}
                    {memblokir ? (
                        <span className="inline-flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-900 dark:bg-red-950 dark:text-red-100">
                            <AlertTriangle className="size-3" aria-hidden /> memblokir perhitungan
                        </span>
                    ) : null}
                </span>
            </td>
            <td className="text-muted-foreground px-4 py-2 tabular-nums">{bobot ?? '-'}</td>
            <td className="px-4 py-2 tabular-nums">{terisi}</td>
            <td className="px-4 py-2">
                <span className="flex items-center gap-2">
                    <span className="bg-muted h-2 w-24 overflow-hidden rounded" aria-hidden>
                        <span
                            className={persen >= 100 ? 'block h-full bg-green-600' : 'block h-full bg-amber-500'}
                            style={{ width: `${Math.min(100, persen)}%` }}
                        />
                    </span>
                    <span className="tabular-nums">{persen}%</span>
                    {persen >= 100 ? <CheckCircle2 className="size-4 text-green-600" aria-hidden /> : null}
                </span>
            </td>
        </tr>
    );
}

function DialogPeriodeBaru({ terbuka, tutup, tahunTersedia }: { terbuka: boolean; tutup: () => void; tahunTersedia: number[] }) {
    const tahunIni = new Date().getFullYear();
    const [tahunPkpt, setTahunPkpt] = useState(String(tahunIni + 1));
    const [tahunDasar, setTahunDasar] = useState(String(tahunTersedia[0] ?? tahunIni));
    const [belanja, setBelanja] = useState('');

    const simpan = () => {
        router.post(
            '/pkpt/periode',
            {
                tahun_pkpt: Number(tahunPkpt),
                tahun_dasar_risiko: Number(tahunDasar),
                total_belanja_langsung: belanja ? Number(belanja) : null,
            },
            {
                onSuccess: () => {
                    toast.success('Periode PKPT dibuat.');
                    tutup();
                },
                onError: (e) => toast.error(Object.values(e)[0] ?? 'Gagal membuat periode.'),
            },
        );
    };

    return (
        <Dialog open={terbuka} onOpenChange={(o) => !o && tutup()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Periode PKPT baru</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="tahun-pkpt">Tahun PKPT</Label>
                        <Input id="tahun-pkpt" type="number" value={tahunPkpt} onChange={(e) => setTahunPkpt(e.target.value)} />
                        <p className="text-muted-foreground text-xs">Tahun pelaksanaan pengawasan yang direncanakan.</p>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="tahun-dasar">Tahun dasar risiko</Label>
                        <select
                            id="tahun-dasar"
                            className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
                            value={tahunDasar}
                            onChange={(e) => setTahunDasar(e.target.value)}
                        >
                            {tahunTersedia.length === 0 ? <option value="">(belum ada data risiko)</option> : null}
                            {tahunTersedia.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                        <p className="text-muted-foreground text-xs">
                            Tahun penilaian risiko di MR Kabar yang dipakai sebagai dasar. Hanya tahun yang benar-benar ada isinya yang ditawarkan.
                        </p>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="belanja">Total belanja langsung APBK (Rp)</Label>
                        <Input id="belanja" type="number" value={belanja} onChange={(e) => setBelanja(e.target.value)} />
                        <p className="text-muted-foreground text-xs">Pembagi persentase anggaran pada Faktor Risiko 1. Boleh diisi belakangan.</p>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={tutup}>
                        Batal
                    </Button>
                    <Button onClick={simpan}>Buat</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function DialogTetapkan({ terbuka, tutup, periodeId }: { terbuka: boolean; tutup: () => void; periodeId: number }) {
    const [nomor, setNomor] = useState('');
    const [tanggal, setTanggal] = useState('');

    return (
        <Dialog open={terbuka} onOpenChange={(o) => !o && tutup()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tetapkan dan kunci periode</DialogTitle>
                </DialogHeader>

                <p className="text-muted-foreground text-sm">
                    Sesudah ditetapkan, seluruh kertas kerja periode ini tidak dapat diubah. Itu yang menjaga angka pada lampiran Keputusan Inspektur
                    tetap sama dengan angka di layar.
                </p>

                <div className="space-y-3">
                    <div className="space-y-1">
                        <Label htmlFor="nomor-kep">Nomor Keputusan Inspektur</Label>
                        <Input id="nomor-kep" value={nomor} onChange={(e) => setNomor(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="tgl-kep">Tanggal penetapan</Label>
                        <Input id="tgl-kep" type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={tutup}>
                        Batal
                    </Button>
                    <Button
                        onClick={() =>
                            router.post(
                                `/pkpt/periode/${periodeId}/tetapkan`,
                                { nomor_keputusan: nomor, tanggal_penetapan: tanggal },
                                {
                                    onSuccess: () => {
                                        toast.success('Periode ditetapkan.');
                                        tutup();
                                    },
                                    onError: (e) => toast.error(Object.values(e)[0] ?? 'Gagal menetapkan.'),
                                },
                            )
                        }
                    >
                        Tetapkan
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function DialogBuka({ terbuka, tutup, periodeId }: { terbuka: boolean; tutup: () => void; periodeId: number }) {
    const [alasan, setAlasan] = useState('');

    return (
        <Dialog open={terbuka} onOpenChange={(o) => !o && tutup()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Buka kembali periode yang sudah ditetapkan</DialogTitle>
                </DialogHeader>

                <p className="text-muted-foreground text-sm">
                    Membuka kembali berarti dokumen yang sudah ditandatangani akan berubah. Alasannya dicatat pada periode dan di Audit Log bersama
                    nama Anda. Hanya Super Admin yang dapat melakukannya.
                </p>

                <div className="space-y-1">
                    <Label htmlFor="alasan-buka">Alasan</Label>
                    <textarea
                        id="alasan-buka"
                        className="border-input bg-background min-h-24 w-full rounded-md border p-2 text-sm"
                        value={alasan}
                        onChange={(e) => setAlasan(e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={tutup}>
                        Batal
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() =>
                            router.post(
                                `/pkpt/periode/${periodeId}/buka`,
                                { alasan },
                                {
                                    onSuccess: () => {
                                        toast.success('Periode dibuka kembali.');
                                        tutup();
                                    },
                                    onError: (e) => toast.error(Object.values(e)[0] ?? 'Gagal membuka periode.'),
                                },
                            )
                        }
                    >
                        Buka kembali
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
