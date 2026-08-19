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
import AppLayout from '@/layouts/app-layout';
import { formatTanggalWaktu } from '@/lib/date';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { DatabaseBackup, Download, FileSpreadsheet, Github, GitPullRequestArrow, History, Tags, TriangleAlert, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Backup {
    name: string;
    size: number;
    last_modified: number;
    download_url: string;
    /** Terisi bila isi berkas ini sama persis dengan snapshot sebuah versi. */
    versi: string | null;
}

interface Versi {
    tag: string;
    commit: string | null;
    dibuat: string | null;
    ukuran: number | null;
    migrasi_terakhir: string | null;
    jumlah_migrasi: number | null;
    cacah_tabel: Record<string, number> | null;
    catatan: string | null;
    ada_snapshot: boolean;
    unduh_url: string;
}

interface Props {
    backups: Backup[];
    canPushGit: boolean;
    gitSyncEnabled: boolean;
    gitTags: string[];
    penjadwal: {
        terakhir: string | null;
        menitLalu: number | null;
        sehat: boolean;
    };
    versi: Versi[];
    commitSekarang: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Backup', href: '/backup' }];

export default function BackupIndex({ backups, canPushGit, gitSyncEnabled, gitTags, penjadwal, versi, commitSekarang }: Props) {
    const [gitMessage, setGitMessage] = useState('');
    const [pushing, setPushing] = useState(false);
    const [pulling, setPulling] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [togglingGitSync, setTogglingGitSync] = useState(false);
    const [selectedTag, setSelectedTag] = useState('');
    const [tagConfirmText, setTagConfirmText] = useState('');
    const [checkingOutTag, setCheckingOutTag] = useState(false);
    const [pulihkanSaatCheckout, setPulihkanSaatCheckout] = useState(true);
    const [tagBaru, setTagBaru] = useState('');
    const [catatanVersi, setCatatanVersi] = useState('');
    const [pushSaatTandai, setPushSaatTandai] = useState(false);
    const [menandaiVersi, setMenandaiVersi] = useState(false);
    const [versiDipulihkan, setVersiDipulihkan] = useState('');
    const [konfirmasiPulih, setKonfirmasiPulih] = useState('');
    const [memulihkanVersi, setMemulihkanVersi] = useState(false);

    const snapshotTagTerpilih = versi.find((v) => v.tag === selectedTag);

    const handleToggleGitSync = (checked: boolean) => {
        setTogglingGitSync(true);
        router.post(
            '/backup/git-sync-toggle',
            { enabled: checked },
            {
                onSuccess: () => toast.success(checked ? 'Fitur Git Push/Pull diaktifkan.' : 'Fitur Git Push/Pull dinonaktifkan.'),
                onError: () => toast.error('Gagal mengubah pengaturan Git Sync.'),
                onFinish: () => setTogglingGitSync(false),
                preserveScroll: true,
            },
        );
    };

    const handleBackup = () => {
        router.post(
            '/backup/run',
            {},
            {
                onSuccess: () => toast.success('Backup created successfully'),
                onError: () => toast.error('Failed to create backup'),
                preserveScroll: true,
            },
        );
    };

    const handleGitPush = () => {
        setPushing(true);
        router.post(
            '/backup/git-push',
            { message: gitMessage },
            {
                onSuccess: () => {
                    toast.success('Kode berhasil di-push ke GitHub.');
                    setGitMessage('');
                },
                onError: () => toast.error('Git push gagal — cek pesan error di halaman.'),
                onFinish: () => setPushing(false),
                preserveScroll: true,
            },
        );
    };

    const handleGitPull = () => {
        setPulling(true);
        router.post(
            '/backup/git-pull',
            {},
            {
                onSuccess: () => toast.success('Kode berhasil ditarik dari GitHub.'),
                onError: () => toast.error('Git pull gagal — cek pesan error di halaman.'),
                onFinish: () => setPulling(false),
                preserveScroll: true,
            },
        );
    };

    const handleTandaiVersi = () => {
        if (!tagBaru) return;
        setMenandaiVersi(true);
        router.post(
            '/backup/versi',
            { tag: tagBaru, catatan: catatanVersi, push: pushSaatTandai },
            {
                onSuccess: () => {
                    toast.success(`Versi ${tagBaru} ditandai berikut snapshot database-nya.`);
                    setTagBaru('');
                    setCatatanVersi('');
                },
                onError: () => toast.error('Gagal menandai versi — cek pesan error di halaman.'),
                onFinish: () => setMenandaiVersi(false),
                preserveScroll: true,
            },
        );
    };

    const handlePulihkanVersi = (tag: string) => {
        setMemulihkanVersi(true);
        router.post(
            `/backup/versi/${tag}/pulihkan`,
            { konfirmasi: konfirmasiPulih },
            {
                onSuccess: () => {
                    toast.success(`Database dipulihkan ke snapshot versi ${tag}.`);
                    setKonfirmasiPulih('');
                    setVersiDipulihkan('');
                },
                onError: () => toast.error('Pemulihan gagal — cek pesan error di halaman.'),
                onFinish: () => setMemulihkanVersi(false),
                preserveScroll: true,
            },
        );
    };

    const handleCheckoutTag = () => {
        if (!selectedTag) return;
        setCheckingOutTag(true);
        router.post(
            '/backup/git-checkout-tag',
            {
                tag: selectedTag,
                // Hanya diminta bila versinya memang punya snapshot — kalau tidak,
                // permintaannya cuma akan berbuah peringatan yang membingungkan.
                pulihkan_database: pulihkanSaatCheckout && !!snapshotTagTerpilih?.ada_snapshot,
            },
            {
                onSuccess: () => {
                    toast.success(`Kode berhasil dikembalikan ke versi ${selectedTag}.`);
                    setTagConfirmText('');
                },
                onError: () => toast.error('Checkout ke tag gagal — cek pesan error di halaman.'),
                onFinish: () => setCheckingOutTag(false),
                preserveScroll: true,
            },
        );
    };

    const handleDelete = (filename: string) => {
        router.delete(`/backup/delete/${filename}`, {
            onSuccess: () => toast.success('Backup deleted successfully'),
            onError: () => toast.error('Failed to delete backup'),
            preserveScroll: true,
        });
    };

    const handleImport = () => {
        if (!importFile) return;
        setImporting(true);
        router.post(
            '/backup/import',
            { backup_file: importFile },
            {
                forceFormData: true,
                onSuccess: () => {
                    toast.success('Database berhasil diimpor.');
                    setImportFile(null);
                    setConfirmText('');
                },
                onError: () => toast.error('Impor database gagal — cek pesan error di halaman.'),
                onFinish: () => setImporting(false),
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout title="Backup" breadcrumbs={breadcrumbs}>
            <Head title="Backup" />

            <div className="space-y-4 p-4 md:p-6">
                {/* Penjadwal tugas berkala hanya jalan kalau cron/Task Scheduler di
            server memanggilnya tiap menit. Kalau pemanggil itu belum
            dipasang, tidak ada gejala apa pun — pembersihan log cuma diam,
            begitu pula tugas berkala apa pun yang ditambahkan kemudian.
            Peringatan ini yang membuat diamnya kelihatan. */}
                {!penjadwal.sehat && (
                    <div className="rounded-md border border-amber-500/50 bg-amber-50 p-4 text-sm dark:bg-amber-950/30">
                        <p className="font-medium text-amber-900 dark:text-amber-200">Penjadwal tugas berkala tidak berjalan</p>
                        <p className="mt-1 text-amber-800 dark:text-amber-300">
                            {penjadwal.terakhir
                                ? `Terakhir terdeteksi ${penjadwal.terakhir} (sekitar ${penjadwal.menitLalu} menit lalu).`
                                : 'Belum pernah terdeteksi berjalan sama sekali.'}{' '}
                            Pembersihan log lama dan tugas berkala lain tidak akan jalan sampai server memanggil{' '}
                            <code className="rounded bg-amber-100 px-1 py-0.5 dark:bg-amber-900/50">php artisan schedule:run</code> setiap menit.
                            Lihat <span className="font-medium">docs/PENJADWAL_SERVER.md</span> untuk perintah pemasangannya.
                        </p>
                    </div>
                )}

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold">Database Backups</CardTitle>
                            <p className="text-muted-foreground text-sm">Manage system backup files</p>
                        </div>
                        <div className="flex gap-2">
                            <a href="/backup/excel">
                                <Button variant="outline">
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                    Ekspor/Impor Excel
                                </Button>
                            </a>
                            <Button onClick={handleBackup}>Create Backup</Button>
                        </div>
                    </CardHeader>

                    <Separator />

                    <CardContent className="space-y-4 pt-4">
                        {backups.length === 0 ? (
                            <p className="text-muted-foreground text-center">No backups available.</p>
                        ) : (
                            <ul className="space-y-2">
                                {backups.map((backup, index) => (
                                    <li key={index} className="bg-muted/50 flex items-center justify-between rounded border p-3">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 font-medium">
                                                {backup.name}
                                                {backup.versi && (
                                                    <span className="rounded border border-emerald-500/50 bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                                                        Versi {backup.versi}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-muted-foreground text-xs">
                                                {formatSize(backup.size)} • {formatTanggalWaktu(backup.last_modified * 1000)}
                                                {backup.versi && ' • isinya sama dengan snapshot versi ini'}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a href={backup.download_url} target="_blank" rel="noopener noreferrer">
                                                <Button variant="outline" size="sm">
                                                    Download
                                                </Button>
                                            </a>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm">
                                                        Delete
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete this backup?</AlertDialogTitle>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            className="bg-destructive hover:bg-destructive/90"
                                                            onClick={() => handleDelete(backup.name)}
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                {/* Versi = tag git + snapshot database yang sepadan dengannya. Dijadikan
            satu kartu supaya jelas keduanya tidak pernah terpisah: tag tanpa
            snapshot tidak bisa dirollback dengan aman, dan snapshot tanpa tag
            tidak diketahui milik kode yang mana. */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-bold">
                            <Tags className="h-5 w-5" />
                            Versi Aplikasi &amp; Snapshot Database
                        </CardTitle>
                        <p className="text-muted-foreground text-sm">
                            Menandai versi akan menyimpan kode (tag git) <strong>berikut salinan database</strong> pada saat itu juga, sehingga
                            rollback ke versi lama tidak meninggalkan kode lama berjalan di atas data baru. Snapshot database{' '}
                            <strong>hanya tersimpan di komputer ini</strong> dan tidak pernah ikut ter-push ke GitHub — hasil clone selalu berdatabase
                            kosong untuk diisi sendiri.
                        </p>
                    </CardHeader>
                    <Separator />
                    <CardContent className="space-y-5 pt-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1">
                                <Label htmlFor="tag_baru">Nomor versi baru</Label>
                                <Input
                                    id="tag_baru"
                                    value={tagBaru}
                                    onChange={(e) => setTagBaru(e.target.value)}
                                    placeholder="mis. v1.0.4"
                                    autoComplete="off"
                                />
                                <p className="text-muted-foreground text-xs">
                                    Bentuknya v&lt;angka&gt;.&lt;angka&gt;.&lt;angka&gt;. Versi yang sudah ada tidak bisa dipakai ulang.
                                </p>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="catatan_versi">Catatan versi (opsional)</Label>
                                <Input
                                    id="catatan_versi"
                                    value={catatanVersi}
                                    onChange={(e) => setCatatanVersi(e.target.value)}
                                    placeholder="mis. Selera Risiko dan jadwal penilaian"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {canPushGit && gitSyncEnabled && (
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="push_saat_tandai"
                                        checked={pushSaatTandai}
                                        onCheckedChange={(checked) => setPushSaatTandai(checked === true)}
                                    />
                                    <Label htmlFor="push_saat_tandai" className="cursor-pointer text-sm font-normal">
                                        Sekalian push kode dan tag ke GitHub
                                    </Label>
                                </div>
                            )}
                            <Button onClick={handleTandaiVersi} disabled={!tagBaru || menandaiVersi}>
                                <Tags className="mr-2 h-4 w-4" />
                                {menandaiVersi ? 'Menandai versi...' : 'Tandai Versi Sekarang'}
                            </Button>
                        </div>

                        <Separator />

                        {versi.length === 0 ? (
                            <p className="text-muted-foreground text-center text-sm">Belum ada versi yang ditandai.</p>
                        ) : (
                            <ul className="space-y-2">
                                {versi.map((v) => (
                                    <li key={v.tag} className="bg-muted/50 rounded border p-3">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-semibold">{v.tag}</span>
                                                    {v.ada_snapshot ? (
                                                        <span className="rounded border border-emerald-500/50 bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                                                            Ada snapshot database
                                                        </span>
                                                    ) : (
                                                        <span className="rounded border border-amber-500/50 bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                                                            Tanpa snapshot
                                                        </span>
                                                    )}
                                                    {v.commit && commitSekarang && v.commit === commitSekarang && (
                                                        <span className="rounded border border-sky-500/50 bg-sky-50 px-1.5 py-0.5 text-xs font-medium text-sky-800 dark:bg-sky-950/40 dark:text-sky-300">
                                                            Versi yang sedang berjalan
                                                        </span>
                                                    )}
                                                </div>
                                                {v.catatan && <p className="mt-1 text-sm">{v.catatan}</p>}
                                                <div className="text-muted-foreground mt-1 text-xs">
                                                    {v.ada_snapshot ? (
                                                        <>
                                                            {v.dibuat} • {v.ukuran ? formatSize(v.ukuran) : '—'} • {v.jumlah_migrasi} migrasi
                                                            {v.cacah_tabel && (
                                                                <>
                                                                    {' '}
                                                                    • {Object.values(v.cacah_tabel).reduce((a, b) => a + b, 0)} baris pada tabel inti
                                                                </>
                                                            )}
                                                        </>
                                                    ) : (
                                                        'Tag ini dibuat sebelum snapshot versi ada, jadi rollback ke sini hanya memundurkan kode.'
                                                    )}
                                                </div>
                                            </div>

                                            {v.ada_snapshot && (
                                                <div className="flex shrink-0 items-center gap-2">
                                                    <a href={v.unduh_url}>
                                                        <Button variant="outline" size="sm">
                                                            <Download className="mr-2 h-4 w-4" />
                                                            Unduh
                                                        </Button>
                                                    </a>

                                                    <AlertDialog
                                                        onOpenChange={(open) => {
                                                            setVersiDipulihkan(open ? v.tag : '');
                                                            setKonfirmasiPulih('');
                                                        }}
                                                    >
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" size="sm" disabled={memulihkanVersi}>
                                                                <DatabaseBackup className="mr-2 h-4 w-4" />
                                                                Pulihkan Database
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="flex items-center gap-2">
                                                                    <TriangleAlert className="text-destructive h-5 w-5" />
                                                                    Pulihkan database ke snapshot {v.tag}?
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription asChild>
                                                                    <div className="space-y-2">
                                                                        <p>
                                                                            Seluruh isi database sekarang akan <strong>diganti total</strong> dengan
                                                                            data pada saat versi {v.tag} ditandai
                                                                            {v.dibuat ? ` (${v.dibuat})` : ''}. Data yang diisi setelah itu akan
                                                                            hilang. Kode aplikasi <strong>tidak</strong> ikut mundur — pakai Checkout
                                                                            Tag di bawah bila memang ingin keduanya mundur bersama.
                                                                        </p>
                                                                        <p>
                                                                            Kondisi sekarang di-backup dulu sebagai jaring pengaman. Ketik{' '}
                                                                            <strong>{v.tag}</strong> untuk melanjutkan.
                                                                        </p>
                                                                        <Input
                                                                            value={konfirmasiPulih}
                                                                            onChange={(e) => setKonfirmasiPulih(e.target.value)}
                                                                            placeholder={v.tag}
                                                                            autoComplete="off"
                                                                        />
                                                                    </div>
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    className="bg-destructive hover:bg-destructive/90"
                                                                    disabled={konfirmasiPulih !== v.tag || versiDipulihkan !== v.tag}
                                                                    onClick={() => handlePulihkanVersi(v.tag)}
                                                                >
                                                                    Pulihkan ke {v.tag}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                {canPushGit && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl font-bold">
                                <Github className="h-5 w-5" />
                                Sinkronisasi Git (Push/Pull)
                            </CardTitle>
                            <p className="text-muted-foreground text-sm">
                                Nonaktif secara default di setiap instalasi baru aplikasi ini. Aktifkan HANYA jika Anda sudah memastikan remote git di
                                server ini sudah mengarah ke repository Anda sendiri — bukan repository developer asal aplikasi ini.
                            </p>
                        </CardHeader>
                        <Separator />
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="git_sync_toggle"
                                    checked={gitSyncEnabled}
                                    disabled={togglingGitSync}
                                    onCheckedChange={(checked) => handleToggleGitSync(checked === true)}
                                />
                                <Label htmlFor="git_sync_toggle" className="cursor-pointer">
                                    Aktifkan fitur Git Push/Pull di server ini
                                </Label>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {canPushGit && gitSyncEnabled && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl font-bold">
                                <Github className="h-5 w-5" />
                                Backup Database & Push Kode ke GitHub
                            </CardTitle>
                            <p className="text-muted-foreground text-sm">
                                Satu tombol, dua langkah: (1) backup database baru (tersimpan lokal saja, sama seperti "Create Backup" di atas —{' '}
                                <strong>tidak pernah</strong> ikut terkirim ke GitHub), lalu (2) push snapshot kode terbaru ke repository GitHub.
                                Bukan deploy ke server produksi.
                            </p>
                        </CardHeader>
                        <Separator />
                        <CardContent className="space-y-3 pt-4">
                            <div className="space-y-1">
                                <Label htmlFor="git_message">Pesan commit (opsional)</Label>
                                <Input
                                    id="git_message"
                                    value={gitMessage}
                                    onChange={(e) => setGitMessage(e.target.value)}
                                    placeholder="mis. Update fitur CEE — 10 Juli 2026"
                                />
                            </div>
                            <Button onClick={handleGitPush} disabled={pushing}>
                                <Github className="mr-2 h-4 w-4" />
                                {pushing ? 'Membackup & push...' : 'Backup & Push ke GitHub'}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {canPushGit && gitSyncEnabled && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl font-bold">
                                <GitPullRequestArrow className="h-5 w-5" />
                                Tarik Kode Terbaru dari GitHub
                            </CardTitle>
                            <p className="text-muted-foreground text-sm">
                                Kebalikan dari push di atas: menarik commit terbaru dari branch remote ke kode di server ini (
                                <code>git pull --tags origin HEAD</code>). Database di-backup otomatis lebih dulu — kode yang masuk bisa membawa
                                migrasi yang mengubah skema — tetapi isinya sendiri tidak diubah. Bukan deploy ke server produksi manapun.
                            </p>
                        </CardHeader>
                        <Separator />
                        <CardContent className="pt-4">
                            <Button onClick={handleGitPull} disabled={pulling} variant="outline">
                                <GitPullRequestArrow className="mr-2 h-4 w-4" />
                                {pulling ? 'Menarik kode...' : 'Pull dari GitHub'}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {canPushGit && gitSyncEnabled && gitTags.length > 0 && (
                    <Card className="border-destructive/50">
                        <CardHeader>
                            <CardTitle className="text-destructive flex items-center gap-2 text-xl font-bold">
                                <History className="h-5 w-5" />
                                Checkout Kode ke Versi Tag (Rollback)
                            </CardTitle>
                            <p className="text-muted-foreground text-sm">
                                Kembalikan kode di server ini ke versi yang ditandai tag tertentu (mis. <code>v1.0.0</code>) — jalur rollback resmi
                                kalau versi terbaru bermasalah. <strong>Berbeda dari Pull di atas</strong> (yang selalu maju ke commit terbaru): ini
                                bisa mundur ke versi lama. Database di-backup otomatis dulu sebelum checkout, lalu{' '}
                                <strong>seluruh perubahan kode lokal yang belum tersimpan akan hilang</strong> dan kode server disamakan persis dengan
                                tag yang dipilih.
                            </p>
                        </CardHeader>
                        <Separator />
                        <CardContent className="space-y-3 pt-4">
                            <div className="space-y-1">
                                <Label htmlFor="git_tag_select">Pilih versi tag</Label>
                                <select
                                    id="git_tag_select"
                                    value={selectedTag}
                                    onChange={(e) => {
                                        setSelectedTag(e.target.value);
                                        setTagConfirmText('');
                                    }}
                                    className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                                >
                                    <option value="">— Pilih tag —</option>
                                    {gitTags.map((tag) => (
                                        <option key={tag} value={tag}>
                                            {tag}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <AlertDialog onOpenChange={(open) => !open && setTagConfirmText('')}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" disabled={!selectedTag || checkingOutTag}>
                                        <History className="mr-2 h-4 w-4" />
                                        {checkingOutTag ? 'Checkout...' : `Checkout ke ${selectedTag || '...'}`}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2">
                                            <TriangleAlert className="text-destructive h-5 w-5" />
                                            Kembalikan kode ke versi {selectedTag}?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription asChild>
                                            <div className="space-y-2">
                                                <p>
                                                    Database akan di-backup otomatis dulu sebagai jaring pengaman. Setelah itu, kode server ini akan
                                                    disamakan persis dengan tag <strong>{selectedTag}</strong> — perubahan kode lokal yang belum
                                                    di-commit akan hilang. Ini bukan aksi ringan; pastikan Anda memang ingin rollback.
                                                </p>

                                                {snapshotTagTerpilih?.ada_snapshot ? (
                                                    <div className="flex items-start gap-2 rounded border p-2">
                                                        <Checkbox
                                                            id="pulihkan_saat_checkout"
                                                            className="mt-0.5"
                                                            checked={pulihkanSaatCheckout}
                                                            onCheckedChange={(checked) => setPulihkanSaatCheckout(checked === true)}
                                                        />
                                                        <Label
                                                            htmlFor="pulihkan_saat_checkout"
                                                            className="cursor-pointer text-sm leading-snug font-normal"
                                                        >
                                                            Pulihkan juga database ke snapshot versi ini
                                                            {snapshotTagTerpilih.dibuat ? ` (${snapshotTagTerpilih.dibuat})` : ''}.
                                                            <span className="text-muted-foreground block">
                                                                Dianjurkan. Tanpa ini kode versi lama akan berjalan di atas data versi baru, dan
                                                                aplikasi bisa gagal terbuka karena skemanya tidak cocok.
                                                            </span>
                                                        </Label>
                                                    </div>
                                                ) : (
                                                    <p className="text-amber-700 dark:text-amber-400">
                                                        Versi ini <strong>tidak punya snapshot database</strong> karena tag-nya dibuat sebelum fitur
                                                        snapshot ada. Hanya kode yang akan mundur; skema database tetap seperti sekarang dan mungkin
                                                        tidak cocok.
                                                    </p>
                                                )}

                                                <p>
                                                    Ketik <strong>{selectedTag}</strong> untuk melanjutkan.
                                                </p>
                                                <Input
                                                    value={tagConfirmText}
                                                    onChange={(e) => setTagConfirmText(e.target.value)}
                                                    placeholder={selectedTag}
                                                    autoComplete="off"
                                                />
                                            </div>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-destructive hover:bg-destructive/90"
                                            disabled={tagConfirmText !== selectedTag}
                                            onClick={handleCheckoutTag}
                                        >
                                            Checkout ke {selectedTag}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                )}

                {canPushGit && (
                    <Card className="border-destructive/50">
                        <CardHeader>
                            <CardTitle className="text-destructive flex items-center gap-2 text-xl font-bold">
                                <Upload className="h-5 w-5" />
                                Impor (Restore) Database
                            </CardTitle>
                            <p className="text-muted-foreground text-sm">
                                Unggah file backup <code>.zip</code> (hasil "Create Backup" / "Backup & Push" — berisi satu file <code>.sql</code>).{' '}
                                <strong>Seluruh isi database saat ini akan ditimpa total</strong> dengan isi file ini. Kondisi database sebelum impor
                                otomatis di-backup dulu (muncul di daftar backup di atas) sebagai jaring pengaman.
                            </p>
                        </CardHeader>
                        <Separator />
                        <CardContent className="space-y-3 pt-4">
                            <div className="space-y-1">
                                <Label htmlFor="backup_file">File backup (.zip)</Label>
                                <Input id="backup_file" type="file" accept=".zip" onChange={(e) => setImportFile(e.target.files?.[0] ?? null)} />
                            </div>

                            <AlertDialog onOpenChange={(open) => !open && setConfirmText('')}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" disabled={!importFile || importing}>
                                        <Upload className="mr-2 h-4 w-4" />
                                        {importing ? 'Mengimpor...' : 'Impor & Timpa Database'}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2">
                                            <TriangleAlert className="text-destructive h-5 w-5" />
                                            Timpa seluruh database sekarang?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription asChild>
                                            <div className="space-y-2">
                                                <p>
                                                    Semua data saat ini (termasuk data yang baru diisi PIC OPD hari ini) akan{' '}
                                                    <strong>diganti total</strong> dengan isi file <strong>{importFile?.name}</strong>. Aksi ini tidak
                                                    dapat dibatalkan setelah berjalan — meski ada backup pengaman otomatis sebelumnya.
                                                </p>
                                                <p>
                                                    Ketik <strong>TIMPA</strong> untuk melanjutkan.
                                                </p>
                                                <Input
                                                    value={confirmText}
                                                    onChange={(e) => setConfirmText(e.target.value)}
                                                    placeholder="TIMPA"
                                                    autoComplete="off"
                                                />
                                            </div>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-destructive hover:bg-destructive/90"
                                            disabled={confirmText !== 'TIMPA'}
                                            onClick={handleImport}
                                        >
                                            Timpa Database
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

function formatSize(bytes: number) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}
