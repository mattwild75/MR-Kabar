import PkptShell, { type KonteksPkpt } from '@/components/pkpt/pkpt-shell';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';
import { ListPlus, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Baris {
    id: number;
    jenis: 'wajib' | 'tidak_dimuat';
    area_id: number | null;
    nama_area: string;
    alasan: string;
    dasar_hukum: string | null;
    keterangan: string | null;
}

interface Props extends KonteksPkpt {
    baris: Baris[];
    area: { id: number; nama: string }[];
    usulanBaku: { nama_area: string; dasar_hukum: string }[];
}

export default function PenugasanWajib({ baris, area, usulanBaku, ...konteks }: Props) {
    const [tab, setTab] = useState<'wajib' | 'tidak_dimuat'>('wajib');
    const [sunting, setSunting] = useState<Partial<Baris> | null>(null);
    const bolehUbah = konteks.hak.input && !konteks.terkunci;

    const tampil = baris.filter((b) => b.jenis === tab);
    const sudahAda = new Set(baris.map((b) => b.nama_area.toLowerCase()));
    const usulanTersisa = usulanBaku.filter((u) => !sudahAda.has(u.nama_area.toLowerCase()));

    const tambahBaku = (u: { nama_area: string; dasar_hukum: string }) => {
        router.post(
            '/pkpt/penugasan-wajib',
            {
                periode: konteks.periode?.id,
                jenis: 'wajib',
                nama_area: u.nama_area,
                alasan: 'Amanat peraturan perundang-undangan',
                dasar_hukum: u.dasar_hukum,
            },
            { preserveScroll: true, onSuccess: () => toast.success('Ditambahkan.') },
        );
    };

    return (
        <PkptShell
            judul="5. Penugasan Wajib"
            keterangan="Penugasan amanat peraturan, permintaan pimpinan, dan pengaduan masyarakat wajib dimuat dalam PKPT berapa pun nilai risikonya. Daftar ini yang menjaga aturan itu tidak terlupakan ketika peringkat risiko sudah tersusun rapi dan tampak seperti jawaban akhir."
            konteks={konteks}
            aksi={
                bolehUbah ? (
                    <Button size="sm" onClick={() => setSunting({ jenis: tab, nama_area: '', alasan: '' })}>
                        <Plus className="size-4" aria-hidden /> Tambah
                    </Button>
                ) : null
            }
        >
            <div className="flex gap-1 border-b">
                {(
                    [
                        ['wajib', 'Wajib dimuat'],
                        ['tidak_dimuat', 'Tidak dimuat'],
                    ] as const
                ).map(([k, label]) => (
                    <button
                        key={k}
                        type="button"
                        onClick={() => setTab(k)}
                        className={`-mb-px border-b-2 px-3 py-2 text-sm ${
                            tab === k
                                ? 'border-primary text-foreground font-medium'
                                : 'text-muted-foreground hover:text-foreground border-transparent'
                        }`}
                    >
                        {label} ({baris.filter((b) => b.jenis === k).length})
                    </button>
                ))}
            </div>

            {tab === 'wajib' && bolehUbah && usulanTersisa.length > 0 ? (
                <section className="rounded-lg border border-dashed p-3">
                    <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                        <ListPlus className="size-4" aria-hidden /> Penugasan amanat peraturan yang lazim
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {usulanTersisa.map((u) => (
                            <Button key={u.nama_area} variant="outline" size="sm" onClick={() => tambahBaku(u)}>
                                <Plus className="size-3" aria-hidden /> {u.nama_area}
                            </Button>
                        ))}
                    </div>
                </section>
            ) : null}

            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                        <tr>
                            <th className="px-3 py-2 font-medium">Nama Area Pengawasan</th>
                            <th className="px-3 py-2 font-medium">Alasan</th>
                            <th className="px-3 py-2 font-medium">{tab === 'wajib' ? 'Dasar hukum atau nomor surat' : 'Keterangan'}</th>
                            <th className="px-3 py-2" />
                        </tr>
                    </thead>
                    <tbody>
                        {tampil.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-muted-foreground px-3 py-8 text-center">
                                    {tab === 'wajib'
                                        ? 'Belum ada penugasan wajib. Reviu LKPD, reviu RKA, dan monitoring tindak lanjut umumnya masuk di sini.'
                                        : 'Belum ada Area yang dikecualikan. Isi bila ada Area yang tahun ini diawasi BPK, BPKP, atau Inspektorat Aceh.'}
                                </td>
                            </tr>
                        ) : (
                            tampil.map((b) => (
                                <tr key={b.id} className="border-t">
                                    <td className="px-3 py-2">{b.nama_area}</td>
                                    <td className="text-muted-foreground px-3 py-2">{b.alasan}</td>
                                    <td className="text-muted-foreground px-3 py-2">{(tab === 'wajib' ? b.dasar_hukum : b.keterangan) ?? '-'}</td>
                                    <td className="px-3 py-2 text-right">
                                        {bolehUbah ? (
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => setSunting(b)}>
                                                    Sunting
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Hapus ${b.nama_area}`}
                                                    onClick={() => {
                                                        if (!confirm(`Hapus "${b.nama_area}"?`)) return;
                                                        router.delete(`/pkpt/penugasan-wajib/${b.id}`, {
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

            {sunting ? <DialogBaris awal={sunting} area={area} periodeId={konteks.periode?.id} tutup={() => setSunting(null)} /> : null}
        </PkptShell>
    );
}

function DialogBaris({
    awal,
    area,
    periodeId,
    tutup,
}: {
    awal: Partial<Baris>;
    area: { id: number; nama: string }[];
    periodeId?: number;
    tutup: () => void;
}) {
    const [form, setForm] = useState<Partial<Baris>>(awal);
    const ubah = (k: keyof Baris, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

    const simpan = () => {
        const muatan = {
            periode: periodeId,
            jenis: form.jenis ?? 'wajib',
            area_id: form.area_id || null,
            nama_area: form.nama_area,
            alasan: form.alasan,
            dasar_hukum: form.dasar_hukum || null,
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

        if (form.id) router.put(`/pkpt/penugasan-wajib/${form.id}`, muatan, opsi);
        else router.post('/pkpt/penugasan-wajib', muatan, opsi);
    };

    return (
        <Dialog open onOpenChange={(o) => !o && tutup()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{form.id ? 'Sunting baris' : 'Baris baru'}</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="space-y-1">
                        <Label htmlFor="jenis">Jenis</Label>
                        <select
                            id="jenis"
                            className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
                            value={form.jenis ?? 'wajib'}
                            onChange={(e) => ubah('jenis', e.target.value)}
                        >
                            <option value="wajib">Wajib dimuat dalam PKPT</option>
                            <option value="tidak_dimuat">Tidak dimuat dalam PKPT</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="area-tautan">Tautkan ke Area Pengawasan (opsional)</Label>
                        <select
                            id="area-tautan"
                            className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
                            value={form.area_id ?? ''}
                            onChange={(e) => {
                                const id = e.target.value ? Number(e.target.value) : null;
                                ubah('area_id', id);
                                const a = area.find((x) => x.id === id);
                                if (a && !form.nama_area) ubah('nama_area', a.nama);
                            }}
                        >
                            <option value="">(tidak ditautkan)</option>
                            {area.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.nama}
                                </option>
                            ))}
                        </select>
                        <p className="text-muted-foreground text-xs">
                            Penugasan amanat peraturan seperti reviu LKPD tidak selalu punya baris di Peta Auditan, jadi tautan ini boleh dikosongkan.
                        </p>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="nama-area">Nama Area Pengawasan</Label>
                        <Input id="nama-area" value={form.nama_area ?? ''} onChange={(e) => ubah('nama_area', e.target.value)} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="alasan">Alasan</Label>
                        <Input
                            id="alasan"
                            value={form.alasan ?? ''}
                            placeholder="Amanat peraturan perundang-undangan / Permintaan Bupati / Pengaduan masyarakat"
                            onChange={(e) => ubah('alasan', e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="dasar">{form.jenis === 'tidak_dimuat' ? 'Keterangan' : 'Dasar hukum atau nomor surat'}</Label>
                        <textarea
                            id="dasar"
                            className="border-input bg-background min-h-16 w-full rounded-md border p-2 text-sm"
                            value={(form.jenis === 'tidak_dimuat' ? form.keterangan : form.dasar_hukum) ?? ''}
                            onChange={(e) => ubah(form.jenis === 'tidak_dimuat' ? 'keterangan' : 'dasar_hukum', e.target.value)}
                        />
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
