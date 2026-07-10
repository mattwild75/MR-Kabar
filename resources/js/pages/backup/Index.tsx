import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Github } from 'lucide-react';
import { toast } from 'sonner';
import { type BreadcrumbItem } from '@/types';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
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
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Backup', href: '/backup' },
];

export default function BackupIndex({ backups, canPushGit }: Props) {
  const [gitMessage, setGitMessage] = useState('');
  const [pushing, setPushing] = useState(false);

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

  const handleDelete = (filename: string) => {
    router.delete(`/backup/delete/${filename}`, {
      onSuccess: () => toast.success('Backup deleted successfully'),
      onError: () => toast.error('Failed to delete backup'),
      preserveScroll: true,
    });
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
            <Button onClick={handleBackup}>Create Backup</Button>
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
                        {new Date(backup.last_modified * 1000).toLocaleString()}
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
                Push Kode ke GitHub
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Menyimpan snapshot kode aplikasi terbaru ke repository GitHub — bukan backup database
                (gunakan tombol "Create Backup" di atas untuk itu), dan bukan deploy ke server produksi.
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
                {pushing ? 'Mendorong ke GitHub...' : 'Push ke GitHub'}
              </Button>
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
