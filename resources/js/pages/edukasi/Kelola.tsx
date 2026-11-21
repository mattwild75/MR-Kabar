import { BenderaIsyarat, HURUF, type Huruf } from '@/components/edukasi/bendera-isyarat';
import { KUNCI_TERSEMBUNYI, TombolKunci } from '@/components/edukasi/tombol-kunci';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { formatDetik } from '@/lib/tes-edukasi';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    BarChart3,
    ChevronDown,
    ChevronRight,
    Download,
    ExternalLink,
    Eye,
    EyeOff,
    Film,
    MonitorPlay,
    Pencil,
    Plus,
    RotateCcw,
    Share2,
    Trash2,
    Upload,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useRef, useState, type FormEvent } from 'react';

/**
 * Kelola pre-test dan post-test (admin dan super-admin): pelatihan beserta
 * tokennya, buka/tutup pendaftaran, layar tayang, pantau, hasil, bank soal,
 * dan video film pendek.
 */

interface Sesi {
    id: number;
    jenis: 'pre' | 'post';
    label: string;
    status: 'draf' | 'lobi' | 'berjalan' | 'selesai';
    token: string;
    tampilkan_jawaban: boolean;
    jumlah_peserta: number;
}

interface Pelatihan {
    id: number;
    nama: string;
    tanggal: string | null;
    tempat: string | null;
    sesi: Sesi[];
}

interface Soal {
    id: number;
    jenis: 'pre' | 'post';
    nomor: number;
    bagian: number;
    indikator: string;
    pertanyaan: string;
    pilihan_a: string;
    pilihan_b: string;
    pilihan_c: string;
    pilihan_d: string;
    kunci: Huruf;
    pembahasan: string | null;
}

interface Props {
    pelatihan: Pelatihan[];
    soal: { pre: Soal[]; post: Soal[] };
    bagian: Record<string, string>;
    video: { pre: { isyarat: number[]; diperbarui: string | null } | null; post: { isyarat: number[]; diperbarui: string | null } | null };
}

const LABEL_STATUS: Record<Sesi['status'], { teks: string; kelas: string }> = {
    draf: { teks: 'Belum dibuka', kelas: 'bg-zinc-500 text-white' },
    lobi: { teks: 'Pendaftaran dibuka', kelas: 'bg-sky-600 text-white' },
    berjalan: { teks: 'Berjalan', kelas: 'bg-amber-500 text-black' },
    selesai: { teks: 'Selesai', kelas: 'bg-emerald-600 text-white' },
};

export default function Kelola({ pelatihan, soal, bagian, video }: Props) {
    const [dialogPelatihan, setDialogPelatihan] = useState<Pelatihan | 'baru' | null>(null);
    const [suntingSoal, setSuntingSoal] = useState<Soal | null>(null);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Video Edukasi', href: '/edukasi' },
                { title: 'Kelola Pre-Test dan Post-Test', href: '/edukasi/kelola' },
            ]}
        >
            <Head title="Kelola Pre-Test dan Post-Test" />
            <div className="mx-auto max-w-6xl space-y-8 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold">Kelola Pre-Test dan Post-Test</h1>
                        <p className="text-muted-foreground max-w-prose text-sm">
                            Satu pelatihan berisi dua sesi: pre-test dan post-test, masing-masing dengan tokennya sendiri. Buka pendaftaran sesaat
                            sebelum tes, tayangkan layar tayang di proyektor, dan pantau peserta dari perangkat lain.
                        </p>
                    </div>
                    <Button onClick={() => setDialogPelatihan('baru')}>
                        <Plus className="h-4 w-4" /> Pelatihan baru
                    </Button>
                </div>

                <section className="space-y-3">
                    {pelatihan.length === 0 && (
                        <p className="text-muted-foreground rounded-md border p-6 text-center text-sm">Belum ada pelatihan. Buat yang pertama.</p>
                    )}
                    {pelatihan.map((p) => (
                        <KartuPelatihan key={p.id} pelatihan={p} onUbah={() => setDialogPelatihan(p)} />
                    ))}
                </section>

                <BankSoal soal={soal} bagian={bagian} onUbah={setSuntingSoal} />

                <section className="space-y-3">
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                        <Film className="h-5 w-5" /> Video film pendek
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Satu video utuh per tes yang berhenti sendiri pada 20 titik soal. Selama video belum diunggah, layar tayang memakai kartu
                        soal. Video disimpan di penyimpanan tertutup dan hanya bisa diputar admin dan super-admin.
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormVideo jenis="pre" info={video.pre} />
                        <FormVideo jenis="post" info={video.post} />
                    </div>
                </section>
            </div>

            {dialogPelatihan && (
                <DialogPelatihan pelatihan={dialogPelatihan === 'baru' ? null : dialogPelatihan} onTutup={() => setDialogPelatihan(null)} />
            )}
            {suntingSoal && <DialogSoal soal={suntingSoal} bagian={bagian} onTutup={() => setSuntingSoal(null)} />}
        </AppLayout>
    );
}

function KartuPelatihan({ pelatihan, onUbah }: { pelatihan: Pelatihan; onUbah: () => void }) {
    const hapus = () => {
        if (window.confirm(`Hapus pelatihan "${pelatihan.nama}"? Hanya pelatihan yang belum punya peserta yang bisa dihapus.`)) {
            router.delete(`/edukasi/kelola/pelatihan/${pelatihan.id}`, { preserveScroll: true });
        }
    };

    return (
        <div className="bg-card space-y-3 rounded-lg border p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                    <p className="font-semibold">{pelatihan.nama}</p>
                    <p className="text-muted-foreground text-sm">
                        {[
                            pelatihan.tanggal &&
                                new Date(pelatihan.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                            pelatihan.tempat,
                        ]
                            .filter(Boolean)
                            .join(' · ') || 'Tanggal dan tempat belum diisi'}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm">
                        <Link href={`/edukasi/hasil/${pelatihan.id}`}>
                            <BarChart3 className="h-4 w-4" /> Hasil & analisis
                        </Link>
                    </Button>
                    <Button size="sm" variant="outline" onClick={onUbah}>
                        <Pencil className="h-4 w-4" /> Ubah
                    </Button>
                    <Button size="sm" variant="ghost" onClick={hapus} title="Hapus pelatihan">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="divide-y rounded-md border">
                {pelatihan.sesi.map((s) => (
                    <BarisSesi key={s.id} sesi={s} />
                ))}
            </div>
        </div>
    );
}

/**
 * Tautan berbagi satu sesi: membawa tokennya, jadi siapa pun yang menerima
 * tautan atau memindai QR ini langsung masuk ke formulir biodata. Tautan
 * lama mati begitu token diganti di "Ubah".
 */
function DialogBagikan({ sesi, onTutup }: { sesi: Sesi; onTutup: () => void }) {
    const tautan = `${window.location.origin}/edukasi/tes?token=${encodeURIComponent(sesi.token)}`;
    const [tersalin, setTersalin] = useState(false);
    const kanvas = useRef<HTMLDivElement>(null);
    const logo = (usePage().props as { setting?: { logo?: string } }).setting?.logo;

    const salin = async () => {
        await navigator.clipboard.writeText(tautan);
        setTersalin(true);
        window.setTimeout(() => setTersalin(false), 2000);
    };

    const unduh = () => {
        const c = kanvas.current?.querySelector('canvas');
        if (!c) {
            return;
        }
        const a = document.createElement('a');
        a.href = c.toDataURL('image/png');
        a.download = `QR-${sesi.label}.png`;
        a.click();
    };

    return (
        <Dialog open onOpenChange={(o) => !o && onTutup()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Bagikan {sesi.label}</DialogTitle>
                    <DialogDescription>
                        Siapa pun yang menerima tautan atau memindai QR ini langsung masuk ke formulir biodata, tanpa mengetik token. Bagikan hanya
                        kepada peserta. Peserta tetap baru bisa masuk saat pendaftaran dibuka.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center rounded-md bg-white p-4" ref={kanvas}>
                    <QRCodeCanvas
                        value={tautan}
                        size={1024}
                        level="H"
                        marginSize={2}
                        style={{ width: 240, height: 240 }}
                        imageSettings={logo ? { src: `/storage/${logo}`, height: 220, width: 220, excavate: true } : undefined}
                    />
                </div>
                <div className="space-y-1.5">
                    <Label>Tautan</Label>
                    <div className="flex gap-2">
                        <Input readOnly value={tautan} onFocus={(e) => e.target.select()} className="font-mono text-xs" />
                        <Button type="button" variant="outline" onClick={salin}>
                            {tersalin ? 'Tersalin' : 'Salin'}
                        </Button>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={unduh}>
                        <Download className="h-4 w-4" /> Unduh QR (PNG)
                    </Button>
                    <Button type="button" onClick={onTutup}>
                        Selesai
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function BarisSesi({ sesi }: { sesi: Sesi }) {
    const [lihat, setLihat] = useState(false);
    const [bagikan, setBagikan] = useState(false);
    const atur = (aksi: 'buka' | 'tutup' | 'ulang' | 'jawaban') => {
        if (
            aksi === 'ulang' &&
            !window.confirm(`Kosongkan ${sesi.label}? Seluruh peserta dan jawabannya dihapus permanen. Pakai ini untuk gladi atau uji coba.`)
        ) {
            return;
        }
        router.post(`/edukasi/kelola/sesi/${sesi.id}/atur`, { aksi }, { preserveScroll: true });
    };
    const status = LABEL_STATUS[sesi.status];

    return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-3">
            <div className="w-24 font-medium">{sesi.label}</div>
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${status.kelas}`}>{status.teks}</span>
            <span className="text-muted-foreground text-sm tabular-nums">{sesi.jumlah_peserta} peserta</span>
            <span className="flex items-center gap-1 font-mono text-sm">
                Token: {lihat ? sesi.token : '••••••'}
                <button
                    type="button"
                    onClick={() => setLihat(!lihat)}
                    className="text-muted-foreground hover:text-foreground"
                    title="Tampilkan token"
                >
                    {lihat ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
            </span>
            <label
                className="flex items-center gap-1.5 text-sm"
                title="Sesudah soal ditutup, layar tayang memperlihatkan jawaban benar, sebaran jawaban, dan pembahasan"
            >
                <input type="checkbox" checked={sesi.tampilkan_jawaban} onChange={() => atur('jawaban')} className="h-4 w-4" />
                Bahas jawaban di layar
            </label>
            <div className="ml-auto flex flex-wrap gap-2">
                {sesi.status === 'draf' && (
                    <Button size="sm" onClick={() => atur('buka')}>
                        Buka pendaftaran
                    </Button>
                )}
                {sesi.status === 'lobi' && (
                    <Button size="sm" variant="outline" onClick={() => atur('tutup')}>
                        Tutup pendaftaran
                    </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setBagikan(true)}>
                    <Share2 className="h-4 w-4" /> Bagikan
                </Button>
                <Button asChild size="sm" variant="outline">
                    <a href={`/edukasi/tayang/${sesi.id}`} target="_blank" rel="noopener">
                        <MonitorPlay className="h-4 w-4" /> Layar tayang
                    </a>
                </Button>
                <Button asChild size="sm" variant="outline">
                    <Link href={`/edukasi/pantau/${sesi.id}`}>
                        <ExternalLink className="h-4 w-4" /> Pantau
                    </Link>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => atur('ulang')} title="Kosongkan peserta dan jawaban (gladi/uji coba)">
                    <RotateCcw className="h-4 w-4" />
                </Button>
            </div>
            {bagikan && <DialogBagikan sesi={sesi} onTutup={() => setBagikan(false)} />}
        </div>
    );
}

function DialogPelatihan({ pelatihan, onTutup }: { pelatihan: Pelatihan | null; onTutup: () => void }) {
    const baru = pelatihan === null;
    const { data, setData, post, put, processing, errors } = useForm({
        nama: pelatihan?.nama ?? '',
        tanggal: pelatihan?.tanggal ?? '',
        tempat: pelatihan?.tempat ?? '',
        token_pre: '',
        token_post: '',
    });

    const kirim = (e: FormEvent) => {
        e.preventDefault();
        const opsi = { preserveScroll: true, onSuccess: onTutup };
        if (baru) {
            post('/edukasi/kelola/pelatihan', opsi);
        } else {
            put(`/edukasi/kelola/pelatihan/${pelatihan.id}`, opsi);
        }
    };

    return (
        <Dialog open onOpenChange={(o) => !o && onTutup()}>
            <DialogContent className="sm:max-w-lg">
                <form onSubmit={kirim} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>{baru ? 'Pelatihan baru' : 'Ubah pelatihan'}</DialogTitle>
                        <DialogDescription>
                            Token diketik persis seperti yang akan Anda umumkan; huruf besar/kecil dan spasi berpengaruh. Token tidak disimpan di kode
                            aplikasi.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-1.5">
                        <Label htmlFor="nama">Nama pelatihan</Label>
                        <Input
                            id="nama"
                            value={data.nama}
                            onChange={(e) => setData('nama', e.target.value)}
                            placeholder="Bimtek Manajemen Risiko 2026 Angkatan I"
                            required
                        />
                        <InputError message={errors.nama} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="tanggal">Tanggal</Label>
                            <Input id="tanggal" type="date" value={data.tanggal} onChange={(e) => setData('tanggal', e.target.value)} />
                            <InputError message={errors.tanggal} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="tempat">Tempat</Label>
                            <Input id="tempat" value={data.tempat} onChange={(e) => setData('tempat', e.target.value)} />
                            <InputError message={errors.tempat} />
                        </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="token_pre">Token pre-test</Label>
                            <Input
                                id="token_pre"
                                value={data.token_pre}
                                onChange={(e) => setData('token_pre', e.target.value)}
                                placeholder={baru ? '' : 'kosongkan bila tidak diganti'}
                                autoComplete="off"
                                required={baru}
                                className="font-mono"
                            />
                            <InputError message={errors.token_pre} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="token_post">Token post-test</Label>
                            <Input
                                id="token_post"
                                value={data.token_post}
                                onChange={(e) => setData('token_post', e.target.value)}
                                placeholder={baru ? '' : 'kosongkan bila tidak diganti'}
                                autoComplete="off"
                                required={baru}
                                className="font-mono"
                            />
                            <InputError message={errors.token_post} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onTutup}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Simpan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function BankSoal({ soal, bagian, onUbah }: { soal: Props['soal']; bagian: Record<string, string>; onUbah: (s: Soal) => void }) {
    const [jenis, setJenis] = useState<'pre' | 'post'>('pre');
    const [buka, setBuka] = useState<number | null>(null);
    // Kunci tersembunyi setiap kali halaman dibuka: halaman ini bisa ikut tampil di proyektor.
    const [tampilKunci, setTampilKunci] = useState(false);
    const { setData, post, processing, errors, reset } = useForm<{ berkas: File | null }>({ berkas: null });
    const daftar = soal[jenis];

    const impor = (e: FormEvent) => {
        e.preventDefault();
        post('/edukasi/kelola/soal/impor', { forceFormData: true, preserveScroll: true, onSuccess: () => reset() });
    };

    return (
        <section className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">Bank soal</h2>
                    <p className="text-muted-foreground text-sm">
                        20 soal per tes. Nomor yang sama di pre-test dan post-test mengukur indikator yang sama, dengan kalimat berbeda. Kunci tidak
                        pernah dikirim ke ponsel peserta.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <form onSubmit={impor} className="flex items-center gap-2">
                        <Input
                            type="file"
                            accept="application/json,.json"
                            onChange={(e) => setData('berkas', e.target.files?.[0] ?? null)}
                            className="max-w-56"
                        />
                        <Button type="submit" size="sm" variant="outline" disabled={processing}>
                            <Upload className="h-4 w-4" /> Impor JSON
                        </Button>
                    </form>
                    <Button asChild size="sm" variant="outline">
                        <a href="/edukasi/kelola/soal/ekspor">
                            <Download className="h-4 w-4" /> Ekspor JSON
                        </a>
                    </Button>
                    <TombolKunci tampil={tampilKunci} onUbah={setTampilKunci} />
                </div>
            </div>
            <InputError message={errors.berkas} />

            <div className="flex gap-1">
                {(['pre', 'post'] as const).map((j) => (
                    <Button key={j} size="sm" variant={jenis === j ? 'default' : 'outline'} onClick={() => setJenis(j)}>
                        {j === 'pre' ? 'Pre-Test' : 'Post-Test'} ({soal[j].length}/20)
                    </Button>
                ))}
            </div>

            {daftar.length < 20 && (
                <p className="rounded-md border border-amber-500/60 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                    Bank soal {jenis === 'pre' ? 'pre-test' : 'post-test'} baru berisi {daftar.length} dari 20 soal. Impor berkas JSON bank soal.
                </p>
            )}

            <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                        <tr>
                            <th className="w-8 px-2 py-2" />
                            <th className="px-3 py-2">No</th>
                            <th className="px-3 py-2">Bagian</th>
                            <th className="px-3 py-2">Indikator</th>
                            <th className="px-3 py-2 text-center">Kunci</th>
                            <th className="px-3 py-2" />
                        </tr>
                    </thead>
                    <tbody>
                        {daftar.map((s) => (
                            <FragmenSoal
                                key={s.id}
                                soal={s}
                                bagian={bagian}
                                terbuka={buka === s.id}
                                onBuka={() => setBuka(buka === s.id ? null : s.id)}
                                onUbah={() => onUbah(s)}
                                tampilKunci={tampilKunci}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function FragmenSoal({
    soal,
    bagian,
    terbuka,
    onBuka,
    onUbah,
    tampilKunci,
}: {
    soal: Soal;
    bagian: Record<string, string>;
    terbuka: boolean;
    onBuka: () => void;
    onUbah: () => void;
    tampilKunci: boolean;
}) {
    const pilihan: Record<Huruf, string> = { A: soal.pilihan_a, B: soal.pilihan_b, C: soal.pilihan_c, D: soal.pilihan_d };

    return (
        <>
            <tr className="hover:bg-muted/30 cursor-pointer border-t" onClick={onBuka}>
                <td className="px-2 py-2">{terbuka ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</td>
                <td className="px-3 py-2 tabular-nums">{soal.nomor}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                    {soal.bagian}. {bagian[soal.bagian]}
                </td>
                <td className="px-3 py-2">{soal.indikator}</td>
                <td className="px-3 py-2 text-center font-semibold">{tampilKunci ? soal.kunci : KUNCI_TERSEMBUNYI}</td>
                <td className="px-3 py-2 text-right">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                            e.stopPropagation();
                            onUbah();
                        }}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                </td>
            </tr>
            {terbuka && (
                <tr className="bg-muted/20">
                    <td />
                    <td colSpan={5} className="space-y-2 px-3 py-3">
                        <p className="font-medium">{soal.pertanyaan}</p>
                        <ul className="space-y-1">
                            {HURUF.map((h) => (
                                <li
                                    key={h}
                                    className={`flex items-start gap-2 ${tampilKunci && soal.kunci === h ? 'font-semibold text-emerald-700 dark:text-emerald-400' : ''}`}
                                >
                                    <BenderaIsyarat huruf={h} className="mt-0.5 h-4 w-6 shrink-0" />
                                    <span>
                                        {h}. {pilihan[h]}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        {tampilKunci ? (
                            soal.pembahasan && <p className="text-muted-foreground text-sm">Pembahasan: {soal.pembahasan}</p>
                        ) : (
                            <p className="text-muted-foreground text-xs italic">
                                Kunci dan pembahasan disembunyikan. Tekan "Tampilkan kunci" untuk melihatnya.
                            </p>
                        )}
                    </td>
                </tr>
            )}
        </>
    );
}

function DialogSoal({ soal, bagian, onTutup }: { soal: Soal; bagian: Record<string, string>; onTutup: () => void }) {
    const { data, setData, put, processing, errors } = useForm({
        bagian: soal.bagian,
        indikator: soal.indikator,
        pertanyaan: soal.pertanyaan,
        pilihan_a: soal.pilihan_a,
        pilihan_b: soal.pilihan_b,
        pilihan_c: soal.pilihan_c,
        pilihan_d: soal.pilihan_d,
        kunci: soal.kunci,
        pembahasan: soal.pembahasan ?? '',
    });

    const kirim = (e: FormEvent) => {
        e.preventDefault();
        put(`/edukasi/kelola/soal/${soal.id}`, { preserveScroll: true, onSuccess: onTutup });
    };

    return (
        <Dialog open onOpenChange={(o) => !o && onTutup()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <form onSubmit={kirim} className="space-y-3">
                    <DialogHeader>
                        <DialogTitle>
                            Soal {soal.jenis === 'pre' ? 'Pre-Test' : 'Post-Test'} nomor {soal.nomor}
                        </DialogTitle>
                        <DialogDescription>Bila videonya sudah dibuat, perubahan kalimat soal juga perlu dibuatkan ulang di video.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 sm:grid-cols-[12rem_1fr]">
                        <div className="space-y-1.5">
                            <Label>Bagian</Label>
                            <select
                                value={data.bagian}
                                onChange={(e) => setData('bagian', Number(e.target.value))}
                                className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
                            >
                                {Object.entries(bagian).map(([k, v]) => (
                                    <option key={k} value={k}>
                                        {k}. {v}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Indikator</Label>
                            <Input value={data.indikator} onChange={(e) => setData('indikator', e.target.value)} />
                            <InputError message={errors.indikator} />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Pertanyaan</Label>
                        <Textarea value={data.pertanyaan} onChange={(e) => setData('pertanyaan', e.target.value)} rows={3} />
                        <InputError message={errors.pertanyaan} />
                    </div>
                    {HURUF.map((h) => {
                        const kunci = `pilihan_${h.toLowerCase()}` as 'pilihan_a' | 'pilihan_b' | 'pilihan_c' | 'pilihan_d';

                        return (
                            <div key={h} className="flex items-start gap-2">
                                <label className="mt-2 flex items-center gap-1.5 text-sm font-semibold" title="Tandai sebagai kunci">
                                    <input type="radio" name="kunci" checked={data.kunci === h} onChange={() => setData('kunci', h)} />
                                    {h}
                                </label>
                                <div className="flex-1">
                                    <Input value={data[kunci]} onChange={(e) => setData(kunci, e.target.value)} />
                                    <InputError message={errors[kunci]} />
                                </div>
                            </div>
                        );
                    })}
                    <p className="text-muted-foreground text-xs">Pilihan yang bulatannya terisi adalah kunci jawaban.</p>
                    <div className="space-y-1.5">
                        <Label>Pembahasan (tampil di layar tayang sesudah soal ditutup)</Label>
                        <Textarea value={data.pembahasan} onChange={(e) => setData('pembahasan', e.target.value)} rows={3} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onTutup}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Simpan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function FormVideo({ jenis, info }: { jenis: 'pre' | 'post'; info: { isyarat: number[]; diperbarui: string | null } | null }) {
    const { data, setData, post, processing, errors, progress } = useForm<{ berkas: File | null; isyarat: string }>({
        berkas: null,
        isyarat: (info?.isyarat ?? []).map((d) => formatDetik(d * 1000)).join(', '),
    });

    const kirim = (e: FormEvent) => {
        e.preventDefault();
        post(`/edukasi/kelola/video/${jenis}`, { forceFormData: true, preserveScroll: true });
    };

    const hapus = () => {
        if (window.confirm('Hapus video ini? Layar tayang kembali memakai kartu soal.')) {
            router.delete(`/edukasi/kelola/video/${jenis}`, { preserveScroll: true });
        }
    };

    return (
        <form onSubmit={kirim} className="bg-card space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
                <p className="font-semibold">{jenis === 'pre' ? 'Pre-Test' : 'Post-Test'}</p>
                <span className={`rounded px-2 py-0.5 text-xs ${info ? 'bg-emerald-600 text-white' : 'bg-zinc-500 text-white'}`}>
                    {info ? 'Video terpasang' : 'Belum ada video'}
                </span>
            </div>
            <div className="space-y-1.5">
                <Label>Berkas MP4</Label>
                <Input type="file" accept="video/mp4" onChange={(e) => setData('berkas', e.target.files?.[0] ?? null)} />
                {progress && <p className="text-muted-foreground text-xs">Mengunggah {progress.percentage}%</p>}
                <InputError message={errors.berkas} />
            </div>
            <div className="space-y-1.5">
                <Label>20 titik berhenti (mm:ss, dipisah koma)</Label>
                <Textarea
                    value={data.isyarat}
                    onChange={(e) => setData('isyarat', e.target.value)}
                    rows={3}
                    placeholder="0:42, 1:31, 2:20, ..."
                    className="font-mono text-sm"
                />
                <InputError message={errors.isyarat} />
            </div>
            <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={processing}>
                    Simpan
                </Button>
                {info && (
                    <Button type="button" size="sm" variant="ghost" onClick={hapus}>
                        <Trash2 className="h-4 w-4" /> Hapus video
                    </Button>
                )}
            </div>
        </form>
    );
}
