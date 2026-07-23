import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Github, FileSpreadsheet, Upload, GitPullRequestArrow, TriangleAlert, History } from 'lucide-react';
import { toast } from 'sonner';
import { type BreadcrumbItem } from '@/types';
import { formatTanggalWaktu } from '@/lib/date';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

interface Backup {
  name: string;
  size: number;
  last_modified: number;
  download_url: string;
}

interface Props {
  backups: Backup[];
  canPushGit: boolean;
  gitSyncEnabled: boolean;
  gitTags: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Backup', href: '/backup' },
];

export default function BackupIndex({ backups, canPushGit, gitSyncEnabled, gitTags }: Props) {
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

  const handleToggleGitSync = (checked: boolean) => {
    setTogglingGitSync(true);
    router.post(
      '/backup/git-sync-toggle',
      { enabled: checked },
      {
        onSuccess: () =>
          toast.success(checked ? 'Fitur Git Push/Pull diaktifkan.' : 'Fitur Git Push/Pull dinonaktifkan.'),
        onError: () => toast.error('Gagal mengubah pengaturan Git Sync.'),
        onFinish: () => setTogglingGitSync(false),
        preserveScroll: true,
      },
    );
  };

  const handleBackup = () => {
    router.post('/backup/run', {}, {
      onSuccess: () => toast.success('Backup created successfully'),
      onError: () => toast.error('Failed to create backup'),
      preserveScroll: true,
    });
  };

  const handleGitPush = () => {
    setPushing(true);
    router.post('/backup/git-push', { message: gitMessage }, {
      onSuccess: () => {
        toast.success('Kode berhasil di-push ke GitHub.');
        setGitMessage('');
      },
      onError: () => toast.error('Git push gagal — cek pesan error di halaman.'),
      onFinish: () => setPushing(false),
      preserveScroll: true,
    });
  };

  const handleGitPull = () => {
    setPulling(true);
    router.post('/backup/git-pull', {}, {
      onSuccess: () => toast.success('Kode berhasil ditarik dari GitHub.'),
      onError: () => toast.error('Git pull gagal — cek pesan error di halaman.'),
      onFinish: () => setPulling(false),
      preserveScroll: true,
    });
  };

  const handleCheckoutTag = () => {
    if (!selectedTag) return;
    setCheckingOutTag(true);
    router.post(
      '/backup/git-checkout-tag',
      { tag: selectedTag },
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

      <div className="p-4 md:p-6 space-y-4">
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

          <CardContent className="pt-4 space-y-4">
            {backups.length === 0 ? (
              <p className="text-muted-foreground text-center">No backups available.</p>
            ) : (
              <ul className="space-y-2">
                {backups.map((backup, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between border rounded p-3 bg-muted/50"
                  >
                    <div>
                      <div className="font-medium">{backup.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatSize(backup.size)} •{' '}
                        {formatTanggalWaktu(backup.last_modified * 1000)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={backup.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">Download</Button>
                      </a>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">Delete</Button>
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

        {canPushGit && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <Github className="h-5 w-5" />
                Sinkronisasi Git (Push/Pull)
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Nonaktif secara default di setiap instalasi baru aplikasi ini. Aktifkan HANYA jika Anda
                sudah memastikan remote git di server ini sudah mengarah ke repository Anda sendiri —
                bukan repository developer asal aplikasi ini.
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
                Satu tombol, dua langkah: (1) backup database baru (tersimpan lokal saja, sama seperti
                "Create Backup" di atas — <strong>tidak pernah</strong> ikut terkirim ke GitHub), lalu
                (2) push snapshot kode terbaru ke repository GitHub. Bukan deploy ke server produksi.
              </p>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 space-y-3">
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
                Kebalikan dari push di atas: menarik commit terbaru dari branch remote ke kode di server ini
                (<code>git pull origin HEAD</code>). Tidak menyentuh database sama sekali, dan bukan deploy ke
                server produksi manapun.
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
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-destructive">
                <History className="h-5 w-5" />
                Checkout Kode ke Versi Tag (Rollback)
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Kembalikan kode di server ini ke versi yang ditandai tag tertentu (mis. <code>v1.0.0</code>) —
                jalur rollback resmi kalau versi terbaru bermasalah. <strong>Berbeda dari Pull di atas</strong>{' '}
                (yang selalu maju ke commit terbaru): ini bisa mundur ke versi lama. Database di-backup otomatis
                dulu sebelum checkout, lalu <strong>seluruh perubahan kode lokal yang belum tersimpan akan
                hilang</strong> dan kode server disamakan persis dengan tag yang dipilih.
              </p>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 space-y-3">
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
                      <TriangleAlert className="h-5 w-5 text-destructive" />
                      Kembalikan kode ke versi {selectedTag}?
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div className="space-y-2">
                        <p>
                          Database akan di-backup otomatis dulu sebagai jaring pengaman. Setelah itu, kode server
                          ini akan disamakan persis dengan tag <strong>{selectedTag}</strong> — perubahan kode
                          lokal yang belum di-commit akan hilang. Ini bukan aksi ringan; pastikan Anda memang
                          ingin rollback.
                        </p>
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
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-destructive">
                <Upload className="h-5 w-5" />
                Impor (Restore) Database
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Unggah file backup <code>.zip</code> (hasil "Create Backup" / "Backup & Push" — berisi satu file{' '}
                <code>.sql</code>). <strong>Seluruh isi database saat ini akan ditimpa total</strong> dengan isi
                file ini. Kondisi database sebelum impor otomatis di-backup dulu (muncul di daftar backup di
                atas) sebagai jaring pengaman.
              </p>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 space-y-3">
              <div className="space-y-1">
                <Label htmlFor="backup_file">File backup (.zip)</Label>
                <Input
                  id="backup_file"
                  type="file"
                  accept=".zip"
                  onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                />
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
                      <TriangleAlert className="h-5 w-5 text-destructive" />
                      Timpa seluruh database sekarang?
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div className="space-y-2">
                        <p>
                          Semua data saat ini (termasuk data yang baru diisi PIC OPD hari ini) akan{' '}
                          <strong>diganti total</strong> dengan isi file <strong>{importFile?.name}</strong>. Aksi
                          ini tidak dapat dibatalkan setelah berjalan — meski ada backup pengaman otomatis
                          sebelumnya.
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
