import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatTanggalWaktu } from '@/lib/date';
import { History } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Perubahan {
    kolom: string;
    lama: string | null;
    baru: string;
}
interface Entri {
    id: number;
    waktu: string;
    oleh: string;
    aksi: string;
    perubahan: Perubahan[];
}

/**
 * Tombol + dialog "Riwayat" untuk satu baris: siapa mengubah apa, kapan —
 * dibaca dari activity_log lewat /riwayat/{jenis}/{id}. Hanya membaca.
 */
export function RiwayatBaris({ jenis, id, judul }: { jenis: 'irs_pemda' | 'irs_pd' | 'iro_pd' | 'rpp'; id: number; judul?: string }) {
    const [terbuka, setTerbuka] = useState(false);
    const [riwayat, setRiwayat] = useState<Entri[] | null>(null);

    useEffect(() => {
        if (!terbuka) return;
        setRiwayat(null);
        fetch(`/riwayat/${jenis}/${id}`, { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
            .then((r) => (r.ok ? r.json() : { riwayat: [] }))
            .then((d: { riwayat: Entri[] }) => setRiwayat(d.riwayat ?? []))
            .catch(() => setRiwayat([]));
    }, [terbuka, jenis, id]);

    return (
        <>
            <Button variant="ghost" size="icon" onClick={() => setTerbuka(true)} title="Riwayat perubahan" aria-label="Riwayat perubahan">
                <History className="h-4 w-4" />
            </Button>
            <Dialog open={terbuka} onOpenChange={setTerbuka}>
                <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Riwayat perubahan</DialogTitle>
                        <DialogDescription>{judul ?? `Baris #${id}`} — dari log audit, terbaru di atas.</DialogDescription>
                    </DialogHeader>
                    {riwayat === null && <p className="text-muted-foreground text-sm">Memuat…</p>}
                    {riwayat && riwayat.length === 0 && <p className="text-muted-foreground text-sm">Belum ada catatan perubahan untuk baris ini.</p>}
                    <ol className="space-y-3">
                        {riwayat?.map((e) => (
                            <li key={e.id} className="rounded border p-3 text-sm">
                                <div className="flex flex-wrap justify-between gap-2">
                                    <span className="font-medium">{e.oleh}</span>
                                    <span className="text-muted-foreground">{formatTanggalWaktu(e.waktu)}</span>
                                </div>
                                <div className="text-muted-foreground text-xs">{e.aksi}</div>
                                {e.perubahan.length > 0 && (
                                    <table className="mt-2 w-full text-xs">
                                        <tbody>
                                            {e.perubahan.map((p) => (
                                                <tr key={p.kolom} className="border-t align-top">
                                                    <td className="w-40 py-1 pr-2 font-medium">{p.kolom}</td>
                                                    <td className="text-muted-foreground py-1 pr-2 line-through">{p.lama ?? '—'}</td>
                                                    <td className="py-1">{p.baru}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </li>
                        ))}
                    </ol>
                </DialogContent>
            </Dialog>
        </>
    );
}
