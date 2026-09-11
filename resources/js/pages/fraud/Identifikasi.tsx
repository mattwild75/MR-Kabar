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
import { Link, router } from '@inertiajs/react';
import { BookMarked, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { FormRisiko, type KamusButir } from './form-risiko';
import { FraudShell, TeksPanjang, type FraudRow, type FraudSharedProps } from './shell';

interface Props extends FraudSharedProps {
    kamus: KamusButir[];
}

export default function Identifikasi(props: Props) {
    const [sunting, setSunting] = useState<FraudRow | null>(null);
    const [terbuka, setTerbuka] = useState(false);
    const [hapus, setHapus] = useState<FraudRow | null>(null);

    const buka = (r: FraudRow | null) => {
        setSunting(r);
        setTerbuka(true);
    };

    return (
        <FraudShell
            judul="Identifikasi Risiko Kecurangan"
            keterangan="Lembar IR — menetapkan apa, di mana, dan bagaimana kecurangan dapat terjadi pada tiap tahapan proses."
            aktif="/fraud/identifikasi"
            shared={props}
            aksi={
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/fraud/kamus">
                            <BookMarked className="mr-2 h-4 w-4" />
                            Kamus Risiko
                        </Link>
                    </Button>
                    <Button onClick={() => buka(null)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Risiko
                    </Button>
                </div>
            }
        >
            <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                    <thead className="bg-muted">
                        <tr>
                            <th className="border px-3 py-2 text-left">No</th>
                            <th className="border px-3 py-2 text-left">Tahapan Proses</th>
                            <th className="border px-3 py-2 text-left">Nama Risiko</th>
                            <th className="border px-3 py-2 text-left">Skenario Risiko</th>
                            <th className="border px-3 py-2 text-left">Uraian Penyebab</th>
                            <th className="border px-3 py-2 text-left">Uraian Dampak</th>
                            <th className="border px-3 py-2 text-left">Kelompok Risiko</th>
                            {props.isAdmin && <th className="border px-3 py-2 text-left">Perangkat Daerah</th>}
                            <th className="border px-3 py-2 text-left">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.rows.length === 0 ? (
                            <tr>
                                <td colSpan={props.isAdmin ? 9 : 8} className="text-muted-foreground border px-3 py-8 text-center">
                                    Belum ada risiko kecurangan untuk tahun {props.tahun}.
                                </td>
                            </tr>
                        ) : (
                            props.rows.map((r, i) => (
                                <tr key={r.id} className="align-top">
                                    <td className="border px-3 py-2">{i + 1}</td>
                                    <td className="border px-3 py-2 whitespace-nowrap">{r.tahapan_proses ?? '-'}</td>
                                    <td className="border px-3 py-2 font-medium">
                                        <TeksPanjang isi={r.nama_risiko} />
                                    </td>
                                    <td className="border px-3 py-2">
                                        <TeksPanjang isi={r.skenario_risiko} />
                                    </td>
                                    <td className="border px-3 py-2">
                                        <TeksPanjang isi={r.uraian_penyebab} />
                                    </td>
                                    <td className="border px-3 py-2">
                                        <TeksPanjang isi={r.uraian_dampak} />
                                    </td>
                                    <td className="border px-3 py-2">
                                        {r.kelompok_risiko && r.kelompok_risiko.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {r.kelompok_risiko.map((k) => (
                                                    <Badge key={k} variant="secondary" className="text-xs">
                                                        {k}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </td>
                                    {props.isAdmin && <td className="border px-3 py-2">{r.opd?.nama ?? '-'}</td>}
                                    <td className="border px-3 py-2">
                                        <div className="flex gap-1">
                                            <Button size="icon" variant="ghost" onClick={() => buka(r)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => setHapus(r)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <FormRisiko tahap="identifikasi" baris={sunting} terbuka={terbuka} tutup={() => setTerbuka(false)} shared={props} kamus={props.kamus} />

            <AlertDialog open={hapus !== null} onOpenChange={(o) => !o && setHapus(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus risiko ini?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Analisis dan rencana tindak pada baris yang sama ikut terhapus, karena ketiganya satu baris. Baris masih bisa dipulihkan
                            lewat Data Terhapus.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (!hapus) return;
                                router.delete(`/fraud/${hapus.id}`, {
                                    preserveScroll: true,
                                    onSuccess: () => toast.success('Risiko dihapus.'),
                                });
                                setHapus(null);
                            }}
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </FraudShell>
    );
}
