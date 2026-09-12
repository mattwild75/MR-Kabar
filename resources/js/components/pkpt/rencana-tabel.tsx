import PkptShell, { type KonteksPkpt } from '@/components/pkpt/pkpt-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';
import { AlertTriangle, Download, Plus, Printer, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export interface Rencana {
    id: number;
    area_id: number | null;
    nama_area: string;
    jenis_pengawasan: string | null;
    tujuan_sasaran: string | null;
    ruang_lingkup: string | null;
    rmp: string | null;
    rpl: string | null;
    hp_pj: number | null;
    hp_wpj: number | null;
    hp_kt: number | null;
    hp_at: number | null;
    hp_jumlah: number | null;
    anggaran: number | null;
    jumlah_laporan: string | null;
    sarana_prasarana: string | null;
    tingkat_risiko: string | null;
    total_nilai_risiko: number | null;
    sumber: 'risiko' | 'wajib' | 'permintaan';
    keterangan: string | null;
}

export interface BelumMasuk {
    berisiko: { nama_area: string; total_nilai_risiko: number; tingkat_risiko: string; zona: string }[];
    wajib: { nama_area: string; alasan: string }[];
}

export interface PropsRencana extends KonteksPkpt {
    rencana: Rencana[];
    jenisPengawasan: string[];
    belumMasuk: BelumMasuk;
}

const rupiah = (n: number | null) => (n === null ? '-' : new Intl.NumberFormat('id-ID').format(n));

/**
 * Tabel bersama Formulir 13 (Jakwas) dan Formulir 14 (PKPT).
 *
 * Jakwas adalah PKPT tanpa kolom jadwal dan sumber daya, bukan daftar yang
 * berbeda — jadi keduanya membaca baris yang sama dan hanya berbeda kolom
 * yang ditampilkan. Memisahkannya jadi dua daftar berarti dua yang harus
 * disinkronkan tangan, dan yang satu pasti akan tertinggal.
 */
export default function RencanaTabel({
    judul,
    keterangan,
    formulir,
    lengkap,
    props,
}: {
    judul: string;
    keterangan: string;
    formulir: 'f13' | 'f14';
    /** true untuk PKPT (seluruh kolom), false untuk Jakwas (kolom ringkas). */
    lengkap: boolean;
    props: PropsRencana;
}) {
    const { rencana, jenisPengawasan, belumMasuk, ...konteks } = props;
    const [sunting, setSunting] = useState<Partial<Rencana> | null>(null);
    const [tarikTerbuka, setTarikTerbuka] = useState(false);
    const bolehUbah = konteks.hak.rencana && !konteks.terkunci;

    const totalHp = rencana.reduce((a, r) => a + (r.hp_jumlah ?? 0), 0);
    const totalAnggaran = rencana.reduce((a, r) => a + (r.anggaran ?? 0), 0);

    return (
        <PkptShell
            judul={judul}
            keterangan={keterangan}
            konteks={konteks}
            aksi={
                <>
                    <Button size="sm" variant="outline" onClick={() => router.visit(`/pkpt/cetak/${formulir}?periode=${konteks.periode?.id}`)}>
                        <Printer className="size-4" aria-hidden /> Cetak {formulir.toUpperCase()}
                    </Button>
                    {bolehUbah ? (
                        <>
                            <Button size="sm" variant="outline" onClick={() => setTarikTerbuka(true)}>
                                <Download className="size-4" aria-hidden /> Tarik dari peringkat
                            </Button>
                            <Button size="sm" onClick={() => setSunting({ nama_area: '', sumber: 'risiko' })}>
                                <Plus className="size-4" aria-hidden /> Tambah
                            </Button>
                        </>
                    ) : null}
                </>
            }
        >
            {belumMasuk.wajib.length > 0 ? (
                <p className="flex items-start gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-100">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>
                        {belumMasuk.wajib.length} penugasan wajib belum masuk rencana: {belumMasuk.wajib.map((w) => w.nama_area).join(', ')}.
                        Melewatkannya bukan sekadar kurang lengkap, melainkan menyalahi Diktum KELIMA Keputusan Inspektur.
                    </span>
                </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="secondary">{rencana.length} baris rencana</Badge>
                {lengkap ? (
                    <>
                        <Badge variant="outline">Total {totalHp} HP</Badge>
                        <Badge variant="outline">Anggaran Rp {rupiah(totalAnggaran)}</Badge>
                    </>
                ) : null}
                {belumMasuk.berisiko.length > 0 ? (
                    <span className="text-muted-foreground">{belumMasuk.berisiko.length} Area berisiko belum masuk rencana</span>
                ) : null}
            </div>

            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                        <tr>
                            <th className="px-2 py-2 text-center font-medium">#</th>
                            <th className="px-2 py-2 font-medium">Area Pengawasan</th>
                            <th className="px-2 py-2 text-center font-medium">Total Risiko</th>
                            <th className="px-2 py-2 font-medium">Jenis Pengawasan</th>
                            {lengkap ? (
                                <>
                                    <th className="px-2 py-2 font-medium">Ruang Lingkup</th>
                                    <th className="px-2 py-2 text-center font-medium">RMP</th>
                                    <th className="px-2 py-2 text-center font-medium">RPL</th>
                                </>
                            ) : null}
                            <th className="px-2 py-2 text-center font-medium">HP</th>
                            {lengkap ? (
                                <>
                                    <th className="px-2 py-2 text-right font-medium">Anggaran</th>
                                    <th className="px-2 py-2 text-center font-medium">Laporan</th>
                                </>
                            ) : null}
                            <th className="px-2 py-2 text-center font-medium">Sumber</th>
                            <th className="px-2 py-2" />
                        </tr>
                    </thead>
                    <tbody>
                        {rencana.length === 0 ? (
                            <tr>
                                <td colSpan={lengkap ? 12 : 7} className="text-muted-foreground px-3 py-8 text-center">
                                    Belum ada baris rencana. Tekan "Tarik dari peringkat" untuk menyalin penugasan wajib dan Area berperingkat teratas
                                    sekaligus.
                                </td>
                            </tr>
                        ) : (
                            rencana.map((r, i) => (
                                <tr key={r.id} className="border-t">
                                    <td className="text-muted-foreground px-2 py-2 text-center tabular-nums">{i + 1}</td>
                                    <td className="px-2 py-2">{r.nama_area}</td>
                                    <td className="px-2 py-2 text-center tabular-nums">
                                        {r.total_nilai_risiko?.toFixed(2).replace('.', ',') ?? '-'}
                                    </td>
                                    <td className="px-2 py-2">{r.jenis_pengawasan ?? '-'}</td>
                                    {lengkap ? (
                                        <>
                                            <td className="text-muted-foreground px-2 py-2">{r.ruang_lingkup ?? '-'}</td>
                                            <td className="px-2 py-2 text-center">{r.rmp ?? '-'}</td>
                                            <td className="px-2 py-2 text-center">{r.rpl ?? '-'}</td>
                                        </>
                                    ) : null}
                                    <td className="px-2 py-2 text-center tabular-nums">{r.hp_jumlah ?? '-'}</td>
                                    {lengkap ? (
                                        <>
                                            <td className="px-2 py-2 text-right tabular-nums">{rupiah(r.anggaran)}</td>
                                            <td className="px-2 py-2 text-center">{r.jumlah_laporan ?? '-'}</td>
                                        </>
                                    ) : null}
                                    <td className="px-2 py-2 text-center">
                                        <Badge variant={r.sumber === 'wajib' ? 'destructive' : 'outline'}>{r.sumber}</Badge>
                                    </td>
                                    <td className="px-2 py-2 text-right">
                                        {bolehUbah ? (
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => setSunting(r)}>
                                                    Sunting
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Hapus ${r.nama_area}`}
                                                    onClick={() => {
                                                        if (!confirm(`Hapus "${r.nama_area}" dari rencana?`)) return;
                                                        router.delete(`/pkpt/rencana/${r.id}`, {
                                                            preserveScroll: true,
                                                            onSuccess: () => toast.success('Dihapus.'),
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

            {sunting ? (
                <DialogRencana awal={sunting} jenisPengawasan={jenisPengawasan} periodeId={konteks.periode?.id} tutup={() => setSunting(null)} />
            ) : null}

            {tarikTerbuka ? <DialogTarik belumMasuk={belumMasuk} periodeId={konteks.periode?.id} tutup={() => setTarikTerbuka(false)} /> : null}
        </PkptShell>
    );
}

function DialogTarik({ belumMasuk, periodeId, tutup }: { belumMasuk: BelumMasuk; periodeId?: number; tutup: () => void }) {
    const [batas, setBatas] = useState('20');

    return (
        <Dialog open onOpenChange={(o) => !o && tutup()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tarik dari peringkat</DialogTitle>
                </DialogHeader>

                <p className="text-muted-foreground text-sm">
                    Seluruh {belumMasuk.wajib.length} penugasan wajib disalin apa pun nilai risikonya, ditambah Area berperingkat teratas sebanyak
                    batas di bawah. Yang sudah ada tidak digandakan.
                </p>

                <div className="space-y-1">
                    <Label htmlFor="batas">Jumlah Area berisiko yang disalin</Label>
                    <Input id="batas" type="number" min={1} value={batas} onChange={(e) => setBatas(e.target.value)} />
                    <p className="text-muted-foreground text-xs">Tersedia {belumMasuk.berisiko.length} Area berperingkat yang belum masuk rencana.</p>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={tutup}>
                        Batal
                    </Button>
                    <Button
                        onClick={() =>
                            router.post(
                                '/pkpt/rencana/tarik-peringkat',
                                { periode: periodeId, batas: Number(batas) },
                                {
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        toast.success('Rencana ditarik.');
                                        tutup();
                                    },
                                    onError: (e) => toast.error(Object.values(e)[0] ?? 'Gagal.'),
                                },
                            )
                        }
                    >
                        Tarik
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function DialogRencana({
    awal,
    jenisPengawasan,
    periodeId,
    tutup,
}: {
    awal: Partial<Rencana>;
    jenisPengawasan: string[];
    periodeId?: number;
    tutup: () => void;
}) {
    const [form, setForm] = useState<Partial<Rencana>>(awal);
    const ubah = (k: keyof Rencana, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

    const angka = (v: unknown) => (v === '' || v === null || v === undefined ? null : Number(v));

    const simpan = () => {
        const muatan = {
            periode: periodeId,
            area_id: form.area_id || null,
            nama_area: form.nama_area,
            jenis_pengawasan: form.jenis_pengawasan || null,
            tujuan_sasaran: form.tujuan_sasaran || null,
            ruang_lingkup: form.ruang_lingkup || null,
            rmp: form.rmp || null,
            rpl: form.rpl || null,
            hp_pj: angka(form.hp_pj),
            hp_wpj: angka(form.hp_wpj),
            hp_kt: angka(form.hp_kt),
            hp_at: angka(form.hp_at),
            anggaran: angka(form.anggaran),
            jumlah_laporan: form.jumlah_laporan || null,
            sarana_prasarana: form.sarana_prasarana || null,
            tingkat_risiko: form.tingkat_risiko || null,
            total_nilai_risiko: angka(form.total_nilai_risiko),
            sumber: form.sumber ?? 'risiko',
            keterangan: form.keterangan || null,
        };
        const opsi = {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Tersimpan.');
                tutup();
            },
            onError: (e: Record<string, string>) => toast.error(Object.values(e)[0] ?? 'Gagal menyimpan.'),
        };

        if (form.id) router.put(`/pkpt/rencana/${form.id}`, muatan, opsi);
        else router.post('/pkpt/rencana', muatan, opsi);
    };

    const medanAngka = (kunci: keyof Rencana, label: string) => (
        <div className="space-y-1">
            <Label htmlFor={String(kunci)}>{label}</Label>
            <Input id={String(kunci)} type="number" value={(form[kunci] as number | null) ?? ''} onChange={(e) => ubah(kunci, e.target.value)} />
        </div>
    );

    return (
        <Dialog open onOpenChange={(o) => !o && tutup()}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{form.id ? 'Sunting rencana' : 'Baris rencana baru'}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor="nama-rencana">Nama Area Pengawasan</Label>
                        <Input id="nama-rencana" value={form.nama_area ?? ''} onChange={(e) => ubah('nama_area', e.target.value)} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="jenis-was">Jenis pengawasan</Label>
                        <select
                            id="jenis-was"
                            className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
                            value={form.jenis_pengawasan ?? ''}
                            onChange={(e) => ubah('jenis_pengawasan', e.target.value)}
                        >
                            <option value="">(belum ditetapkan)</option>
                            {jenisPengawasan.map((j) => (
                                <option key={j} value={j}>
                                    {j}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="sumber-rencana">Sumber</Label>
                        <select
                            id="sumber-rencana"
                            className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
                            value={form.sumber ?? 'risiko'}
                            onChange={(e) => ubah('sumber', e.target.value)}
                        >
                            <option value="risiko">Berbasis risiko</option>
                            <option value="wajib">Wajib (amanat peraturan)</option>
                            <option value="permintaan">Permintaan pimpinan</option>
                        </select>
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor="tujuan-was">Tujuan/sasaran</Label>
                        <textarea
                            id="tujuan-was"
                            className="border-input bg-background min-h-16 w-full rounded-md border p-2 text-sm"
                            value={form.tujuan_sasaran ?? ''}
                            onChange={(e) => ubah('tujuan_sasaran', e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="lingkup">Ruang lingkup</Label>
                        <Input id="lingkup" value={form.ruang_lingkup ?? ''} onChange={(e) => ubah('ruang_lingkup', e.target.value)} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="laporan">Jumlah laporan</Label>
                        <Input id="laporan" value={form.jumlah_laporan ?? ''} onChange={(e) => ubah('jumlah_laporan', e.target.value)} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="rmp">Rencana mulai penugasan</Label>
                        <Input id="rmp" placeholder="Mg-II Februari" value={form.rmp ?? ''} onChange={(e) => ubah('rmp', e.target.value)} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="rpl">Rencana penerbitan laporan</Label>
                        <Input id="rpl" placeholder="Mg-IV Maret" value={form.rpl ?? ''} onChange={(e) => ubah('rpl', e.target.value)} />
                    </div>

                    {medanAngka('hp_pj', 'HP Penanggung Jawab')}
                    {medanAngka('hp_wpj', 'HP Wakil Penanggung Jawab')}
                    {medanAngka('hp_kt', 'HP Ketua Tim')}
                    {medanAngka('hp_at', 'HP Anggota Tim')}
                    {medanAngka('anggaran', 'Anggaran (Rp)')}

                    <div className="space-y-1">
                        <Label htmlFor="sarana">Sarana dan prasarana</Label>
                        <Input id="sarana" value={form.sarana_prasarana ?? ''} onChange={(e) => ubah('sarana_prasarana', e.target.value)} />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor="ket-rencana">Keterangan</Label>
                        <Input id="ket-rencana" value={form.keterangan ?? ''} onChange={(e) => ubah('keterangan', e.target.value)} />
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
