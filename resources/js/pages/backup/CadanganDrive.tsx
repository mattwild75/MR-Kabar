import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { formatTanggalWaktu } from '@/lib/date';
import { router, useForm } from '@inertiajs/react';
import { CloudUpload, Link2, Link2Off, LockKeyhole, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export interface BerkasDrive {
    id: string;
    nama: string;
    ukuran: number;
    dibuat: string;
}

export interface DriveProps {
    kredensialLengkap: boolean;
    tertaut: boolean;
    clientId: string | null;
    akunEmail: string | null;
    folderNama: string;
    tautanPada: string | null;
    unggahOtomatis: boolean;
    simpanTerakhir: number;
    terakhirUnggah: string | null;
    terakhirHasil: string | null;
    redirectUri: string;
    arsipTerkunci: boolean;
    berkas: BerkasDrive[] | null;
    galat: string | null;
}

type FormKredensial = {
    client_id: string;
    client_secret: string;
    folder_nama: string;
    unggah_otomatis: boolean;
    simpan_terakhir: number;
    [key: string]: string | number | boolean;
};

/**
 * Kartu "Cadangan ke Google Drive" di halaman Backup.
 *
 * Tiga keadaan berurutan: belum ada kredensial → sudah ada kredensial tapi
 * belum disetujui Google → tertaut. Tiap keadaan hanya memperlihatkan tombol
 * yang berarti pada keadaan itu. Berkas yang dikirim adalah zip yang sama
 * dengan daftar "Database Backups" — terkunci AES-256 bila sandi arsip
 * terpasang — jadi isi Drive tidak terbaca tanpa sandi itu.
 */
export default function CadanganDrive({ drive }: { drive: DriveProps }) {
    const [mengunggah, setMengunggah] = useState(false);
    const [memutus, setMemutus] = useState(false);
    const [konfirmasi, setKonfirmasi] = useState('');
    const [memulihkan, setMemulihkan] = useState<string | null>(null);

    const form = useForm<FormKredensial>({
        client_id: drive.clientId ?? '',
        client_secret: '',
        folder_nama: drive.folderNama,
        unggah_otomatis: drive.unggahOtomatis,
        simpan_terakhir: drive.simpanTerakhir,
    });

    const simpan = () => {
        form.post('/backup/drive/kredensial', {
            preserveScroll: true,
            onSuccess: () => {
                form.setData('client_secret', '');
                toast.success('Pengaturan Google Drive disimpan.');
            },
            onError: () => toast.error('Periksa isian yang ditandai.'),
        });
    };

    const unggah = () => {
        setMengunggah(true);
        router.post(
            '/backup/drive/unggah',
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Cadangan terkirim ke Google Drive.'),
                onError: () => toast.error('Cadangan ke Drive gagal — lihat pesan di halaman.'),
                onFinish: () => setMengunggah(false),
            },
        );
    };

    const putus = () => {
        setMemutus(true);
        router.post('/backup/drive/putus', {}, { preserveScroll: true, onFinish: () => setMemutus(false) });
    };

    const pulihkan = (id: string) => {
        setMemulihkan(id);
        router.post(
            `/backup/drive/${id}/pulihkan`,
            { konfirmasi },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Database dipulihkan dari Google Drive.'),
                onError: () => toast.error('Pemulihan gagal — lihat pesan di halaman.'),
                onFinish: () => {
                    setMemulihkan(null);
                    setKonfirmasi('');
                },
            },
        );
    };

    const hapus = (id: string) => {
        router.delete(`/backup/drive/${id}`, { preserveScroll: true, onSuccess: () => toast.success('Berkas dihapus dari Drive.') });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <CloudUpload className="h-5 w-5" />
                    Cadangan ke Google Drive
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                    Salinan basis data di luar server ini, ke akun Google milik instansi. Setelah tertaut, cadangan dikirim otomatis tiap hari pukul
                    01:30 WIB dan bisa dipulihkan dari daftar di bawah.{' '}
                    {drive.arsipTerkunci ? (
                        <span className="inline-flex items-center gap-1 rounded border border-emerald-500/50 bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                            <LockKeyhole className="h-3 w-3" /> arsip terkunci AES-256
                        </span>
                    ) : (
                        <span className="rounded border border-amber-500/50 bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                            arsip BELUM terkunci — isi BACKUP_ARCHIVE_PASSWORD di .env
                        </span>
                    )}
                </p>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-5 pt-4">
                {/* Keadaan tautan */}
                {drive.tertaut ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-emerald-500/40 bg-emerald-50/60 p-3 text-sm dark:bg-emerald-950/30">
                        <div>
                            <div className="flex items-center gap-2 font-medium">
                                <Link2 className="h-4 w-4" /> Tertaut ke {drive.akunEmail ?? 'akun Google'}
                            </div>
                            <div className="text-muted-foreground text-xs">
                                Folder “{drive.folderNama}” · sejak {drive.tautanPada ? formatTanggalWaktu(drive.tautanPada) : '-'}
                                {drive.terakhirUnggah && <> · unggahan terakhir {formatTanggalWaktu(drive.terakhirUnggah)}</>}
                            </div>
                            {drive.terakhirHasil && (
                                <div
                                    className={`mt-1 text-xs ${drive.terakhirHasil.startsWith('Gagal') ? 'text-destructive' : 'text-muted-foreground'}`}
                                >
                                    {drive.terakhirHasil}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={unggah} disabled={mengunggah}>
                                <CloudUpload className="mr-2 h-4 w-4" />
                                {mengunggah ? 'Mengirim…' : 'Cadangkan ke Drive sekarang'}
                            </Button>
                            <Button variant="outline" onClick={putus} disabled={memutus}>
                                <Link2Off className="mr-2 h-4 w-4" />
                                Putus tautan
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="rounded border border-dashed p-3 text-sm">
                        <p className="font-medium">Belum tertaut.</p>
                        <ol className="text-muted-foreground mt-1 list-decimal space-y-1 pl-5 text-xs">
                            <li>
                                Buka <span className="font-mono">console.cloud.google.com</span> dengan akun Google instansi → APIs &amp; Services →
                                Credentials → Create Credentials → OAuth client ID (jenis <em>Web application</em>).
                            </li>
                            <li>
                                Tambahkan <em>Authorized redirect URI</em> persis:{' '}
                                <code className="bg-muted rounded px-1 py-0.5">{drive.redirectUri}</code>
                            </li>
                            <li>
                                Aktifkan <em>Google Drive API</em> di Library, lalu di OAuth consent screen tambahkan alamat Google instansi sebagai
                                test user (atau publikasikan aplikasinya).
                            </li>
                            <li>Tempel Client ID dan Client Secret di bawah, simpan, lalu klik “Tautkan akun Google”.</li>
                        </ol>
                        {drive.kredensialLengkap && (
                            <a href="/backup/drive/tautkan" className="mt-3 inline-block">
                                <Button>
                                    <Link2 className="mr-2 h-4 w-4" />
                                    Tautkan akun Google
                                </Button>
                            </a>
                        )}
                    </div>
                )}

                {/* Kredensial & pengaturan */}
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                        <Label htmlFor="drive_client_id">Client ID</Label>
                        <Input id="drive_client_id" value={form.data.client_id} onChange={(e) => form.setData('client_id', e.target.value)} />
                        {form.errors.client_id && <p className="text-destructive text-xs">{form.errors.client_id}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="drive_client_secret">
                            Client Secret {drive.kredensialLengkap && <span className="text-muted-foreground">(kosongkan bila tidak diganti)</span>}
                        </Label>
                        <Input
                            id="drive_client_secret"
                            type="password"
                            autoComplete="off"
                            value={form.data.client_secret}
                            onChange={(e) => form.setData('client_secret', e.target.value)}
                        />
                        {form.errors.client_secret && <p className="text-destructive text-xs">{form.errors.client_secret}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="drive_folder">Nama folder di Drive</Label>
                        <Input id="drive_folder" value={form.data.folder_nama} onChange={(e) => form.setData('folder_nama', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="drive_simpan">Simpan berapa cadangan terakhir</Label>
                        <Input
                            id="drive_simpan"
                            type="number"
                            min={1}
                            max={365}
                            value={form.data.simpan_terakhir}
                            onChange={(e) => form.setData('simpan_terakhir', Number(e.target.value))}
                        />
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={form.data.unggah_otomatis} onCheckedChange={(v) => form.setData('unggah_otomatis', v === true)} />
                        Kirim otomatis tiap hari 01:30 WIB
                    </label>
                    <Button variant="outline" onClick={simpan} disabled={form.processing}>
                        Simpan pengaturan
                    </Button>
                </div>

                {/* Daftar berkas di Drive */}
                {drive.tertaut && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Cadangan di Google Drive</h4>
                        {drive.galat && <p className="text-destructive text-sm">Tidak bisa membaca Drive: {drive.galat}</p>}
                        {drive.berkas && drive.berkas.length === 0 && (
                            <p className="text-muted-foreground text-sm">Belum ada berkas di folder ini.</p>
                        )}
                        {drive.berkas && drive.berkas.length > 0 && (
                            <ul className="space-y-2">
                                {drive.berkas.map((b) => (
                                    <li key={b.id} className="bg-muted/50 flex flex-wrap items-center justify-between gap-2 rounded border p-3">
                                        <div>
                                            <div className="font-medium">{b.nama}</div>
                                            <div className="text-muted-foreground text-xs">
                                                {formatUkuran(b.ukuran)} • {formatTanggalWaktu(b.dibuat)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <AlertDialog onOpenChange={(o) => !o && setKonfirmasi('')}>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm" disabled={memulihkan !== null}>
                                                        <RotateCcw className="mr-1 h-3.5 w-3.5" />
                                                        {memulihkan === b.id ? 'Memulihkan…' : 'Pulihkan'}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Timpa database dengan {b.nama}?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Seluruh tabel saat ini akan diganti isi cadangan ini. Keadaan sekarang dicadangkan dulu ke
                                                            daftar “Database Backups”. Ketik <strong>TIMPA</strong> untuk melanjutkan.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <Input value={konfirmasi} onChange={(e) => setKonfirmasi(e.target.value)} placeholder="TIMPA" />
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            className="bg-destructive hover:bg-destructive/90"
                                                            disabled={konfirmasi !== 'TIMPA'}
                                                            onClick={() => pulihkan(b.id)}
                                                        >
                                                            Timpa Database
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="sm" title="Hapus dari Drive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Hapus {b.nama} dari Google Drive?</AlertDialogTitle>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            className="bg-destructive hover:bg-destructive/90"
                                                            onClick={() => hapus(b.id)}
                                                        >
                                                            Hapus
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function formatUkuran(bytes: number) {
    if (bytes === 0) return '0 Byte';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}
