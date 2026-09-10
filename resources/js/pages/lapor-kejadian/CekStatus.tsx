import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { router, useForm, usePage } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Pesan {
    dari: string;
    isi: string;
    pada: string | null;
}

interface Hasil {
    nomor_tiket: string;
    status: string;
    uraian_kejadian: string;
    dilaporkan_pada: string | null;
    catatan_tindak_lanjut: string | null;
    pesan: Pesan[];
}

/**
 * Tab "Cek Status Laporan" — yang membuat laporan anonim tidak putus.
 *
 * Pelapor kembali dengan nomor tiket dan kode aksesnya, membaca perkembangan,
 * lalu MENJAWAB pertanyaan penindaklanjut — tanpa pernah menyebut siapa
 * dirinya. Inilah jawaban atas keberatan yang wajar: kalau pelapornya anonim,
 * bagaimana penelaahan bisa bertanya lebih jauh.
 *
 * Kode aksesnya tidak disimpan di peramban maupun di sesi. Setiap tindakan
 * membawanya kembali — supaya perangkat yang dipakai bergantian (dan halaman
 * ini memang dibuka lewat akun bersama) tidak meninggalkan jalan masuk ke utas
 * pelapor sebelumnya.
 */
export default function CekStatus() {
    const hasil = (usePage().props as unknown as { flash?: { hasilTiket?: Hasil } }).flash?.hasilTiket;

    const { data, setData, post, processing, errors } = useForm({
        nomor_tiket: '',
        kode_akses: '',
    });

    const [balasan, setBalasan] = useState('');
    const [mengirim, setMengirim] = useState(false);

    const cek = (e: React.FormEvent) => {
        e.preventDefault();
        post('/lapor-kecurangan/status', { preserveScroll: true });
    };

    const kirimBalasan = () => {
        if (balasan.trim() === '') return;
        setMengirim(true);
        router.post(
            '/lapor-kecurangan/balas',
            { nomor_tiket: data.nomor_tiket, kode_akses: data.kode_akses, isi: balasan },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Jawaban Anda terkirim.');
                    setBalasan('');
                    // Muat ulang utasnya supaya jawaban yang baru dikirim
                    // langsung terlihat — tanpa ini pelapor tidak punya bukti
                    // apa pun bahwa jawabannya masuk.
                    router.post('/lapor-kecurangan/status', { nomor_tiket: data.nomor_tiket, kode_akses: data.kode_akses }, { preserveScroll: true });
                },
                onError: () => toast.error('Gagal mengirim jawaban.'),
                onFinish: () => setMengirim(false),
            },
        );
    };

    return (
        <div className="mx-auto max-w-2xl space-y-4">
            <div className="flex items-start gap-2">
                <KeyRound className="text-muted-foreground mt-0.5 h-6 w-6 shrink-0" />
                <div>
                    <h2 className="text-xl font-semibold">Cek Status Laporan</h2>
                    <p className="text-muted-foreground text-sm">
                        Untuk laporan dugaan kecurangan. Masukkan nomor tiket dan kode akses yang Anda terima saat mengirim.
                    </p>
                </div>
            </div>

            <Card>
                <CardContent className="space-y-4 pt-6">
                    <form onSubmit={cek} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="nomor_tiket">Nomor Tiket</Label>
                                <Input
                                    id="nomor_tiket"
                                    value={data.nomor_tiket}
                                    onChange={(e) => setData('nomor_tiket', e.target.value)}
                                    placeholder="FRA-2026-0001"
                                    className="font-mono"
                                />
                            </div>
                            <div>
                                <Label htmlFor="kode_akses">Kode Akses</Label>
                                <Input
                                    id="kode_akses"
                                    value={data.kode_akses}
                                    onChange={(e) => setData('kode_akses', e.target.value)}
                                    className="font-mono tracking-widest"
                                />
                            </div>
                        </div>
                        {errors.nomor_tiket && <p className="text-destructive text-sm">{errors.nomor_tiket}</p>}
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Memeriksa…' : 'Lihat Status'}
                        </Button>
                    </form>

                    <p className="text-muted-foreground text-xs">
                        Kode akses tidak dapat dipulihkan bila hilang. Memulihkannya menuntut identitas Anda — dan itu persis yang sedang dijaga.
                    </p>
                </CardContent>
            </Card>

            {hasil && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            <span className="font-mono">{hasil.nomor_tiket}</span>{' '}
                            <span className="bg-muted ml-2 rounded px-2 py-0.5 text-xs font-medium">{hasil.status}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-muted-foreground text-xs">Dilaporkan pada</p>
                            <p className="text-sm">{hasil.dilaporkan_pada ?? '-'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">Yang Anda laporkan</p>
                            <p className="text-sm whitespace-pre-line">{hasil.uraian_kejadian}</p>
                        </div>
                        {hasil.catatan_tindak_lanjut && (
                            <div>
                                <p className="text-muted-foreground text-xs">Catatan penindaklanjut</p>
                                <p className="text-sm whitespace-pre-line">{hasil.catatan_tindak_lanjut}</p>
                            </div>
                        )}

                        <div>
                            <p className="mb-2 text-sm font-medium">Tanya-jawab</p>
                            {hasil.pesan.length === 0 ? (
                                <p className="text-muted-foreground text-sm">Belum ada pertanyaan dari penindaklanjut.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {hasil.pesan.map((p, i) => (
                                        <li key={i} className={`rounded-md border p-3 text-sm ${p.dari === 'pelapor' ? 'bg-muted/50 ml-8' : 'mr-8'}`}>
                                            <p className="text-muted-foreground mb-1 text-xs">
                                                {p.dari === 'pelapor' ? 'Anda' : 'Penindaklanjut'} · {p.pada ?? '-'}
                                            </p>
                                            <p className="whitespace-pre-line">{p.isi}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="balasan">Jawaban Anda</Label>
                            <Textarea id="balasan" rows={3} value={balasan} onChange={(e) => setBalasan(e.target.value)} />
                            <Button onClick={kirimBalasan} disabled={mengirim || balasan.trim() === ''} className="mt-2">
                                {mengirim ? 'Mengirim…' : 'Kirim Jawaban'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
