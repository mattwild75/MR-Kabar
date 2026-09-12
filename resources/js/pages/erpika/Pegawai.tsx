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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Employee {
    id: number;
    nama: string;
    nip: string | null;
    pangkat: string | null;
    golongan: string | null;
    jabatan: string | null;
    unit_kerja: string | null;
    aktif: boolean;
    team_memberships_count: number;
    penugasan: {
        total: number;
        kuning: number;
        hijau: number;
        merah: number;
        terakhir: { rpp: string; st: string | null; obrik: string | null; objek: string[]; status: string } | null;
    };
}

interface Props {
    employees: Employee[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'ERPIKA', href: '#' },
    { title: 'Pegawai', href: '/erpika/pegawai' },
];

/**
 * Daftar pegawai Inspektorat — milik ERPIKA, dipakai seluruh modulnya.
 *
 * Sumber tunggal anggota tim RPP (dan modul internal yang menyusul). 74
 * pegawai hasil pindahan dari ERPIKA belum punya NIP, pangkat, maupun
 * golongan; inilah tempat melengkapinya. Mengubah pegawai di sini ikut
 * memperbarui salinan namanya di semua baris tim yang memakainya.
 *
 * Sengaja di bawah menu ERPIKA, bukan Utilities/Access MR Kabar: pegawai
 * Inspektorat bukan urusan PIC 49 OPD.
 */
export default function Pegawai({ employees }: Props) {
    const [cari, setCari] = useState('');
    const [sunting, setSunting] = useState<Employee | null>(null);
    const [tambah, setTambah] = useState(false);
    const [hapus, setHapus] = useState<Employee | null>(null);

    const [tampilNonaktif, setTampilNonaktif] = useState(false);

    const tersaring = useMemo(() => {
        const q = cari.trim().toLowerCase();
        return employees
            .filter((e) => tampilNonaktif || e.aktif)
            .filter(
                (e) => q === '' || e.nama.toLowerCase().includes(q) || (e.nip ?? '').includes(q) || (e.unit_kerja ?? '').toLowerCase().includes(q),
            );
    }, [employees, cari, tampilNonaktif]);

    const aktif = employees.filter((e) => e.aktif);
    const tanpaNip = aktif.filter((e) => !e.nip).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pegawai" />

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Pegawai Inspektorat</h1>
                    <p className="text-muted-foreground text-sm">Sumber tunggal anggota tim RPP dan modul ERPIKA lainnya.</p>
                </div>

                <Card>
                    <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
                        <div>
                            <CardTitle className="text-base">Daftar Pegawai</CardTitle>
                            <p className="text-muted-foreground text-xs">
                                {aktif.length} pegawai aktif (roster Analisis dan Evaluasi 2026) · {tanpaNip} belum punya NIP ·{' '}
                                <button type="button" className="underline" onClick={() => setTampilNonaktif(!tampilNonaktif)}>
                                    {tampilNonaktif ? 'sembunyikan' : 'tampilkan'} {employees.length - aktif.length} pegawai lama
                                </button>
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                                <Input
                                    className="w-64 pl-9"
                                    placeholder="Cari nama atau NIP…"
                                    value={cari}
                                    onChange={(e) => setCari(e.target.value)}
                                />
                            </div>
                            <Button onClick={() => setTambah(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="border px-3 py-2 text-left">Nama</th>
                                        <th className="border px-3 py-2 text-left">NIP</th>
                                        <th className="border px-3 py-2 text-left">Pangkat</th>
                                        <th className="border px-3 py-2 text-left">Gol.</th>
                                        <th className="border px-3 py-2 text-left">Unit kerja</th>
                                        <th className="border px-3 py-2 text-left">Jabatan</th>
                                        <th className="border px-3 py-2 text-left">Penugasan</th>
                                        <th className="border px-3 py-2 text-left">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tersaring.map((e) => (
                                        <tr key={e.id}>
                                            <td className="border px-3 py-2">{e.nama}</td>
                                            <td className="border px-3 py-2 font-mono text-xs">
                                                {e.nip ?? <span className="text-muted-foreground">-</span>}
                                            </td>
                                            <td className="border px-3 py-2">{e.pangkat ?? '-'}</td>
                                            <td className="border px-3 py-2">{e.golongan ?? '-'}</td>
                                            <td className="border px-3 py-2">
                                                {e.unit_kerja ?? '-'}
                                                {!e.aktif && <span className="text-muted-foreground ml-1 text-xs">(tidak aktif)</span>}
                                            </td>
                                            <td className="border px-3 py-2">
                                                {e.jabatan === 'Inspektur' ? (
                                                    <span className="font-medium">Inspektur (penanda tangan RPP)</span>
                                                ) : (
                                                    (e.jabatan ?? '-')
                                                )}
                                            </td>
                                            <td className="border px-3 py-2 align-top">
                                                <div
                                                    className="font-medium tabular-nums"
                                                    title="total / minta nomor laporan (kuning) / selesai terbit laporan (hijau)"
                                                >
                                                    {e.penugasan.total} /{' '}
                                                    <span className="text-amber-700 dark:text-amber-300">{e.penugasan.kuning}</span> /{' '}
                                                    <span className="text-emerald-700 dark:text-emerald-300">{e.penugasan.hijau}</span>
                                                </div>
                                                {e.penugasan.terakhir ? (
                                                    <div className="text-muted-foreground mt-1 max-w-[360px] space-y-0.5 text-xs">
                                                        <div>
                                                            <span className="font-medium">RPP:</span>{' '}
                                                            <span className="font-mono">{e.penugasan.terakhir.rpp}</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">ST:</span>{' '}
                                                            <span className="font-mono">{e.penugasan.terakhir.st ?? '-'}</span>
                                                        </div>
                                                        <div className="line-clamp-2">
                                                            <span className="font-medium">Obrik:</span> {e.penugasan.terakhir.obrik ?? '-'}
                                                        </div>
                                                        {e.penugasan.terakhir.objek.length > 0 && (
                                                            <div className="line-clamp-2">
                                                                <span className="font-medium">Objek:</span> {e.penugasan.terakhir.objek.join('; ')}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-muted-foreground text-xs">belum pernah ditugaskan</div>
                                                )}
                                            </td>
                                            <td className="border px-3 py-2">
                                                <div className="flex gap-1">
                                                    <Button size="icon" variant="ghost" onClick={() => setSunting(e)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        disabled={e.team_memberships_count > 0}
                                                        title={e.team_memberships_count > 0 ? 'Masih dipakai di tim RPP' : 'Hapus'}
                                                        onClick={() => setHapus(e)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <FormPegawai
                terbuka={tambah || sunting !== null}
                pegawai={sunting}
                tutup={() => {
                    setTambah(false);
                    setSunting(null);
                }}
            />

            <AlertDialog open={hapus !== null} onOpenChange={(o) => !o && setHapus(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus {hapus?.nama}?</AlertDialogTitle>
                        <AlertDialogDescription>Pegawai ini tidak tercantum di tim RPP mana pun, jadi aman dihapus.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (!hapus) return;
                                router.delete(`/erpika/pegawai/${hapus.id}`, {
                                    preserveScroll: true,
                                    onSuccess: () => toast.success('Pegawai dihapus.'),
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

function FormPegawai({ terbuka, pegawai, tutup }: { terbuka: boolean; pegawai: Employee | null; tutup: () => void }) {
    const [nilai, setNilai] = useState({ nama: '', nip: '', pangkat: '', golongan: '', jabatan: '', unit_kerja: '', aktif: true });
    const [menyimpan, setMenyimpan] = useState(false);
    const [kunciSebelumnya, setKunciSebelumnya] = useState<string>('');

    // Isi ulang saat dialog dibuka untuk pegawai lain — tanpa useEffect,
    // supaya tidak ada render dengan isian pegawai sebelumnya.
    const kunci = `${terbuka}-${pegawai?.id ?? 'baru'}`;
    if (kunci !== kunciSebelumnya) {
        setKunciSebelumnya(kunci);
        setNilai({
            nama: pegawai?.nama ?? '',
            nip: pegawai?.nip ?? '',
            pangkat: pegawai?.pangkat ?? '',
            golongan: pegawai?.golongan ?? '',
            jabatan: pegawai?.jabatan ?? '',
            unit_kerja: pegawai?.unit_kerja ?? '',
            aktif: pegawai?.aktif ?? true,
        });
    }

    const simpan = () => {
        setMenyimpan(true);
        const muatan = {
            nama: nilai.nama,
            nip: nilai.nip || null,
            pangkat: nilai.pangkat || null,
            golongan: nilai.golongan || null,
            jabatan: nilai.jabatan || null,
            unit_kerja: nilai.unit_kerja || null,
            aktif: nilai.aktif,
        };
        const opsi = {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(pegawai ? 'Pegawai diperbarui.' : 'Pegawai ditambahkan.');
                tutup();
            },
            onError: (e: Record<string, string>) => toast.error(Object.values(e)[0] ?? 'Gagal menyimpan.'),
            onFinish: () => setMenyimpan(false),
        };
        if (pegawai) {
            router.put(`/erpika/pegawai/${pegawai.id}`, muatan, opsi);
        } else {
            router.post('/erpika/pegawai', muatan, opsi);
        }
    };

    return (
        <Dialog open={terbuka} onOpenChange={(o) => !o && tutup()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{pegawai ? 'Ubah Pegawai' : 'Tambah Pegawai'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                    <div>
                        <Label>Nama lengkap beserta gelar</Label>
                        <Input
                            value={nilai.nama}
                            onChange={(e) => setNilai({ ...nilai, nama: e.target.value })}
                            placeholder="mis. Rufran, S.Ag., M.Si"
                        />
                    </div>
                    <div>
                        <Label>NIP</Label>
                        <Input value={nilai.nip} onChange={(e) => setNilai({ ...nilai, nip: e.target.value })} className="font-mono" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>Pangkat</Label>
                            <Input
                                value={nilai.pangkat}
                                onChange={(e) => setNilai({ ...nilai, pangkat: e.target.value })}
                                placeholder="mis. Penata Tk. I"
                            />
                        </div>
                        <div>
                            <Label>Golongan</Label>
                            <Input
                                value={nilai.golongan}
                                onChange={(e) => setNilai({ ...nilai, golongan: e.target.value })}
                                placeholder="mis. III/d"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <Label>Jabatan</Label>
                            <Input
                                list="jabatan-pegawai"
                                value={nilai.jabatan}
                                onChange={(e) => setNilai({ ...nilai, jabatan: e.target.value })}
                                placeholder="mis. Inspektur, Auditor Muda"
                            />
                            <datalist id="jabatan-pegawai">
                                {['Inspektur', 'Sekretaris', 'Inspektur Pembantu', 'Kasubbag', 'Auditor', 'P2UPD', 'Staf'].map((j) => (
                                    <option key={j} value={j} />
                                ))}
                            </datalist>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Pegawai berjabatan “Inspektur” menjadi penanda tangan seluruh RPP — hanya boleh satu.
                            </p>
                        </div>
                        <div>
                            <Label>Unit kerja</Label>
                            <Input
                                list="unit-pegawai"
                                value={nilai.unit_kerja}
                                onChange={(e) => setNilai({ ...nilai, unit_kerja: e.target.value })}
                                placeholder="mis. Inspektur Pembantu II"
                            />
                            <datalist id="unit-pegawai">
                                {[
                                    'Sekretariat',
                                    'Inspektur Pembantu I',
                                    'Inspektur Pembantu II',
                                    'Inspektur Pembantu III',
                                    'Inspektur Pembantu IV',
                                    'Inspektur Pembantu Khusus',
                                ].map((u) => (
                                    <option key={u} value={u} />
                                ))}
                            </datalist>
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={nilai.aktif} onChange={(e) => setNilai({ ...nilai, aktif: e.target.checked })} />
                            Masih aktif (ditawarkan saat menyusun tim)
                        </label>
                    </div>
                    {pegawai && pegawai.team_memberships_count > 0 && (
                        <p className="text-muted-foreground text-xs">
                            Mengubah nama di sini ikut memperbarui {pegawai.team_memberships_count} baris tim RPP yang memakainya.
                        </p>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={tutup}>
                        Batal
                    </Button>
                    <Button onClick={simpan} disabled={menyimpan || nilai.nama.trim() === ''}>
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
