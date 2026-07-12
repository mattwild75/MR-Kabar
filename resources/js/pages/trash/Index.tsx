import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { formatTanggalWaktu } from '@/lib/date';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface TrashTab {
  slug: string;
  label: string;
  count: number;
}

interface TrashRow {
  id: number;
  batch: string | null;
  title: string;
  subtitles: string[];
  deleted_at: string | null;
}

interface PageProps {
  tabs: TrashTab[];
  activeType: string;
  rows: TrashRow[];
  isAdmin: boolean;
}

export default function TrashIndex({ tabs, activeType, rows, isAdmin }: PageProps) {
  const switchTab = (slug: string) => {
    router.get('/trash', { type: slug }, { preserveState: true, replace: true, preserveScroll: true });
  };

  const restore = (id: number) => {
    router.put(
      `/trash/${activeType}/${id}/restore`,
      {},
      {
        preserveScroll: true,
        onSuccess: () => toast.success('Data berhasil dipulihkan.'),
        onError: () => toast.error('Gagal memulihkan data.'),
      },
    );
  };

  const restoreBatch = (batch: string) => {
    router.put(
      `/trash/${activeType}/batch/${batch}/restore`,
      {},
      {
        preserveScroll: true,
        onSuccess: () => toast.success('Kelompok data berhasil dipulihkan.'),
        onError: () => toast.error('Gagal memulihkan kelompok data.'),
      },
    );
  };

  // Kelompokkan baris terhapus per batch (hasil satu operasi hapus-node).
  // Baris tanpa batch (hapus tunggal) tiap-tiap jadi grup sendiri.
  const groups: { batch: string | null; rows: TrashRow[] }[] = [];
  const byBatch = new Map<string, TrashRow[]>();
  for (const row of rows) {
    if (row.batch) {
      if (!byBatch.has(row.batch)) {
        const g: TrashRow[] = [];
        byBatch.set(row.batch, g);
        groups.push({ batch: row.batch, rows: g });
      }
      byBatch.get(row.batch)!.push(row);
    } else {
      groups.push({ batch: null, rows: [row] });
    }
  }

  const forceDelete = (id: number) => {
    router.delete(`/trash/${activeType}/${id}`, {
      preserveScroll: true,
      onSuccess: () => toast.success('Data dihapus permanen.'),
      onError: () => toast.error('Gagal menghapus permanen.'),
    });
  };

  return (
    <AppLayout>
      <Head title="Data Terhapus" />
      <div className="space-y-4 p-4">
        <div>
          <h1 className="text-2xl font-semibold">Data Terhapus</h1>
          <p className="text-sm text-muted-foreground">
            Data yang dihapus tidak langsung hilang — bisa dipulihkan di sini. Hapus permanen
            {isAdmin ? '' : ' hanya dapat dilakukan Admin'}.
          </p>
        </div>

        {/* Tab per jenis data + badge jumlah terhapus */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const isActive = tab.slug === activeType;
            return (
              <button
                key={tab.slug}
                type="button"
                onClick={() => switchTab(tab.slug)}
                className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? 'border-white bg-white font-medium text-black shadow-sm'
                    : 'hover:bg-muted/50'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <Badge
                    variant={isActive ? 'default' : 'secondary'}
                    className={`ml-1 ${isActive ? 'bg-black text-white' : ''}`}
                  >
                    {tab.count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        <Card>
          <CardContent className="p-0">
            {rows.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Tidak ada data terhapus pada kategori ini.
              </div>
            ) : (
              <div className="divide-y">
                {groups.map((group) => {
                  const rowNode = (row: TrashRow) => (
                    <div key={row.id} className="flex items-start gap-3 p-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium break-words">{row.title || '—'}</p>
                        {row.subtitles.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {row.subtitles.map((s, i) => (
                              <Badge key={i} variant="outline" className="font-normal">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {row.deleted_at && (
                          <p className="mt-1 text-xs text-muted-foreground">Dihapus: {formatTanggalWaktu(row.deleted_at)}</p>
                        )}
                      </div>

                      <div className="flex shrink-0 gap-1">
                        <Button variant="outline" size="sm" onClick={() => restore(row.id)}>
                          <RotateCcw className="mr-1.5 h-4 w-4" />
                          Pulihkan
                        </Button>

                        {isAdmin && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive"
                                title="Hapus permanen"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus permanen data ini?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Data "{row.title || '—'}" akan dihapus <b>selamanya</b> dan tidak dapat
                                  dipulihkan lagi. Tindakan ini tidak bisa dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => forceDelete(row.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Hapus Permanen
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  );

                  // Grup batch berisi >1 baris (hasil satu hapus-node) → tampilkan
                  // header dengan tombol "Pulihkan Semua". Selain itu, render biasa.
                  if (group.batch && group.rows.length > 1) {
                    return (
                      <div key={group.batch} className="bg-muted/20">
                        <div className="flex items-center justify-between gap-3 border-l-4 border-l-amber-500 px-4 py-2">
                          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                            Dihapus sekelompok · {group.rows.length} item
                          </p>
                          <Button size="sm" onClick={() => restoreBatch(group.batch!)}>
                            <RotateCcw className="mr-1.5 h-4 w-4" />
                            Pulihkan Semua ({group.rows.length})
                          </Button>
                        </div>
                        <div className="divide-y border-l-4 border-l-amber-500/40">
                          {group.rows.map(rowNode)}
                        </div>
                      </div>
                    );
                  }
                  return group.rows.map(rowNode);
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
