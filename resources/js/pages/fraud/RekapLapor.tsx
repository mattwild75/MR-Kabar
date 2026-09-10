import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ChevronDown, ChevronRight, Trash2, UserX } from 'lucide-react';
import { Fragment, useState } from 'react';
import { toast } from 'sonner';

interface Pesan {
    dari: string;
    isi: string;
    pada: string | null;
}

interface Laporan {
    id: number;
    nomor_tiket: string | null;
    mode_pelapor: string;
    anonim: boolean;
    pelapor: string;
    email: string | null;
    no_hp: string | null;
    opd_nama: string | null;
    tahapan_proses: string | null;
    dugaan_kelompok: string[];
    uraian_kejadian: string;
    tempat: string | null;
    waktu_kejadian: string | null;
    pihak_terlibat: string | null;
    kronologi: string | null;
    perkiraan_kerugian: string | null;
    bukti_keterangan: string | null;
    status: string;
    catatan_tindak_lanjut: string | null;
    penindaklanjut: string | null;
    risiko_terdaftar: string | null;
    dilaporkan_pada: string | null;
    pesan: Pesan[];
}

interface Props {
    laporan: Laporan[];
    statuses: string[];
    statusTerpilih: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'MR Fraud', href: '/fraud/identifikasi' },
    { title: 'Rekap Lapor Kejadian Fraud', href: '/fraud/rekap-lapor' },
];

const WARNA_STATUS: Record<string, string> = {
    baru: 'bg-red-500/15 text-red-700 dark:text-red-400',
    diverifikasi: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
    ditindaklanjuti: 'bg-sky-500/15 text-sky-700 dark:text-sky-400',
    selesai: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
};

export default function RekapLapor({ laporan, statuses, statusTerpilih }: Props) {
    const [buka, setBuka] = useState<number | null>(null);
    const [suntingStatus, setSuntingStatus] = useState<Laporan | null>(null);
    const [hapus, setHapus] = useState<Laporan | null>(null);
    const [tanya, setTanya] = useState<Record<number, string>>({});

    const [statusBaru, setStatusBaru] = useState('');
    const [catatan, setCatatan] = useState('');

    const bukaSunting = (l: Laporan) => {
        setSuntingStatus(l);
        setStatusBaru(l.status);
        setCatatan(l.catatan_tindak_lanjut ?? '');
    };

    const simpanStatus = () => {
        if (!suntingStatus) return;
        router.put(
            `/fraud/rekap-lapor/${suntingStatus.id}/status`,
            { status: statusBaru, catatan_tindak_lanjut: catatan || null },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Status laporan diperbarui.');
                    setSuntingStatus(null);
                },
                onError: () => toast.error('Gagal memperbarui status.'),
            },
        );
    };

    const kirimTanya = (l: Laporan) => {
        const isi = (tanya[l.id] ?? '').trim();
        if (isi === '') return;
        router.post(
            `/fraud/rekap-lapor/${l.id}/tanya`,
            { isi },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Pertanyaan terkirim ke utas laporan.');
                    setTanya((t) => ({ ...t, [l.id]: '' }));
                },
                onError: () => toast.error('Gagal mengirim pertanyaan.'),
            },
        );
    };

    const saring = (s: string) => router.get('/fraud/rekap-lapor', s === 'semua' ? {} : { status: s }, { preserveState: true, preserveScroll: true });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rekap Lapor Kejadian Fraud" />

            <div className="space-y-4 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Rekap Lapor Kejadian Fraud</h1>
                    <p className="text-muted-foreground text-sm">
                        Laporan dugaan kecurangan yang masuk lewat tab "Dugaan Kecurangan" pada halaman Lapor. Sebagian pelapor memilih anonim —
                        identitasnya memang tidak pernah disimpan, bukan disembunyikan.
                    </p>
                </div>

                <div className="flex flex-wrap items-end gap-4">
                    <div>
                        <Label className="text-muted-foreground mb-1 block text-xs">Status</Label>
                        <Select value={statusTerpilih === '' ? 'semua' : statusTerpilih} onValueChange={saring}>
                            <SelectTrigger className="w-[220px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="semua">Semua status</SelectItem>
                                {statuses.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <span className="text-muted-foreground mb-2 text-sm">{laporan.length} laporan</span>
                </div>

                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="border px-2 py-2" />
                                <th className="border px-3 py-2 text-left">Tiket</th>
                                <th className="border px-3 py-2 text-left">Masuk</th>
                                <th className="border px-3 py-2 text-left">Pelapor</th>
                                <th className="border px-3 py-2 text-left">Uraian Kejadian</th>
                                <th className="border px-3 py-2 text-left">Perangkat Daerah</th>
                                <th className="border px-3 py-2 text-left">Dugaan Delik</th>
                                <th className="border px-3 py-2 text-left">Status</th>
                                <th className="border px-3 py-2 text-left">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {laporan.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="text-muted-foreground border px-3 py-8 text-center">
                                        Belum ada laporan dugaan kecurangan.
                                    </td>
                                </tr>
                            ) : (
                                laporan.map((l) => (
                                    // Fragment BERNAMA, bukan <>: pembungkus di
                                    // dalam map wajib membawa key, dan sintaks
                                    // pendeknya tidak menerima key.
                                    <Fragment key={l.id}>
                                        <tr className="align-top">
                                            <td className="border px-2 py-2">
                                                <button onClick={() => setBuka(buka === l.id ? null : l.id)} aria-label="Rincian">
                                                    {buka === l.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                </button>
                                            </td>
                                            <td className="border px-3 py-2 font-mono text-xs whitespace-nowrap">{l.nomor_tiket ?? '-'}</td>
                                            <td className="border px-3 py-2 whitespace-nowrap">{l.dilaporkan_pada ?? '-'}</td>
                                            <td className="border px-3 py-2 whitespace-nowrap">
                                                {l.anonim ? (
                                                    <span className="text-muted-foreground inline-flex items-center gap-1">
                                                        <UserX className="h-4 w-4" /> Anonim
                                                    </span>
                                                ) : (
                                                    l.pelapor
                                                )}
                                            </td>
                                            <td className="border px-3 py-2">
                                                <span className="block max-w-[26rem] whitespace-pre-line">{l.uraian_kejadian}</span>
                                            </td>
                                            <td className="border px-3 py-2">{l.opd_nama ?? '-'}</td>
                                            <td className="border px-3 py-2">
                                                {l.dugaan_kelompok.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {l.dugaan_kelompok.map((k) => (
                                                            <Badge key={k} variant="secondary" className="text-xs">
                                                                {k}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </td>
                                            <td className="border px-3 py-2">
                                                <span className={`rounded px-2 py-0.5 text-xs font-medium ${WARNA_STATUS[l.status] ?? ''}`}>
                                                    {l.status}
                                                </span>
                                            </td>
                                            <td className="border px-3 py-2">
                                                <div className="flex gap-1">
                                                    <Button size="sm" variant="outline" onClick={() => bukaSunting(l)}>
                                                        Tindak lanjut
                                                    </Button>
                                                    <Button size="icon" variant="ghost" onClick={() => setHapus(l)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                        {buka === l.id && (
                                            <tr>
                                                <td colSpan={9} className="bg-muted/40 border px-6 py-4">
                                                    <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                                                        <Rinci judul="Di mana" isi={l.tempat} />
                                                        <Rinci judul="Kapan" isi={l.waktu_kejadian} />
                                                        <Rinci judul="Pihak diduga terlibat" isi={l.pihak_terlibat} />
                                                        <Rinci judul="Tahapan proses" isi={l.tahapan_proses} />
                                                        <Rinci judul="Kronologi" isi={l.kronologi} lebar />
                                                        <Rinci judul="Perkiraan kerugian" isi={l.perkiraan_kerugian} />
                                                        <Rinci judul="Bukti yang dimiliki pelapor" isi={l.bukti_keterangan} lebar />
                                                        {!l.anonim && (
                                                            <Rinci
                                                                judul="Kontak pelapor"
                                                                isi={[l.email, l.no_hp].filter(Boolean).join(' · ') || null}
                                                            />
                                                        )}
                                                        <Rinci judul="Risiko terdaftar terkait" isi={l.risiko_terdaftar} />
                                                        <Rinci judul="Catatan tindak lanjut" isi={l.catatan_tindak_lanjut} lebar />
                                                        <Rinci judul="Ditindaklanjuti oleh" isi={l.penindaklanjut} />
                                                    </dl>

                                                    {/* Utas inilah yang membuat laporan anonim
                                                        tetap bisa ditelaah: pertanyaan ditulis di
                                                        sini, dan pelapor menjawabnya lewat nomor
                                                        tiketnya — tanpa pernah menyebut siapa
                                                        dirinya. */}
                                                    <div className="mt-4 border-t pt-4">
                                                        <p className="mb-2 text-sm font-medium">Tanya-jawab dengan pelapor</p>
                                                        {l.pesan.length === 0 ? (
                                                            <p className="text-muted-foreground text-sm">Belum ada pertanyaan maupun jawaban.</p>
                                                        ) : (
                                                            <ul className="mb-3 space-y-2">
                                                                {l.pesan.map((m, i) => (
                                                                    <li
                                                                        key={i}
                                                                        className={`rounded-md border p-2 text-sm ${
                                                                            m.dari === 'pelapor' ? 'bg-background mr-8' : 'bg-muted/60 ml-8'
                                                                        }`}
                                                                    >
                                                                        <p className="text-muted-foreground mb-1 text-xs">
                                                                            {m.dari === 'pelapor' ? 'Pelapor' : 'Penindaklanjut'} · {m.pada ?? '-'}
                                                                        </p>
                                                                        <p className="whitespace-pre-line">{m.isi}</p>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}

                                                        {l.nomor_tiket ? (
                                                            <div className="flex gap-2">
                                                                <Textarea
                                                                    rows={2}
                                                                    placeholder="Tulis pertanyaan untuk pelapor…"
                                                                    value={tanya[l.id] ?? ''}
                                                                    onChange={(e) => setTanya((t) => ({ ...t, [l.id]: e.target.value }))}
                                                                />
                                                                <Button onClick={() => kirimTanya(l)} disabled={(tanya[l.id] ?? '').trim() === ''}>
                                                                    Kirim
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <p className="text-muted-foreground text-xs">
                                                                Laporan ini masuk sebelum nomor tiket diberlakukan, jadi pelapornya tidak punya jalan
                                                                kembali untuk menjawab.
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={suntingStatus !== null} onOpenChange={(o) => !o && setSuntingStatus(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tindak Lanjut Laporan</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Status</Label>
                            <Select value={statusBaru} onValueChange={setStatusBaru}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map((s) => (
                                        <SelectItem key={s} value={s}>
                                            {s}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Catatan Tindak Lanjut</Label>
                            <Textarea rows={4} value={catatan} onChange={(e) => setCatatan(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSuntingStatus(null)}>
                            Batal
                        </Button>
                        <Button onClick={simpanStatus}>Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={hapus !== null} onOpenChange={(o) => !o && setHapus(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus laporan ini?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Laporan dugaan kecurangan adalah bahan pengawasan. Hapus hanya bila laporannya jelas keliru atau ganda — bukan karena
                            sudah selesai ditindaklanjuti; untuk itu gunakan status "selesai".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (!hapus) return;
                                router.delete(`/fraud/rekap-lapor/${hapus.id}`, {
                                    preserveScroll: true,
                                    onSuccess: () => toast.success('Laporan dihapus.'),
                                });
                                setHapus(null);
                            }}
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

function Rinci({ judul, isi, lebar = false }: { judul: string; isi: string | null; lebar?: boolean }) {
    return (
        <div className={lebar ? 'sm:col-span-2' : ''}>
            <dt className="text-muted-foreground text-xs">{judul}</dt>
            <dd className="whitespace-pre-line">{isi || <span className="text-muted-foreground">-</span>}</dd>
        </div>
    );
}
