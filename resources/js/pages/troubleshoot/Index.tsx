import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { type BreadcrumbItem } from '@/types';
import { Search, X, Trash2, Eye } from 'lucide-react';

interface Report {
  id: number;
  subject: string;
  category: string;
  description: string;
  status: string;
  created_at: string;
  user: { id: number; name: string } | null;
}

interface Paginator<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
  reports: Paginator<Report>;
  filters: { status?: string; category?: string; search?: string };
  options: { categories: string[]; statuses: string[] };
}

const CATEGORY_LABELS: Record<string, string> = {
  bug: 'Bug', error: 'Error', saran: 'Saran', lainnya: 'Lainnya',
};

const STATUS_LABELS: Record<string, string> = {
  baru: 'Baru', diproses: 'Diproses', selesai: 'Selesai',
};

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  baru: 'default', diproses: 'secondary', selesai: 'outline',
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Utilities', href: '#' },
  { title: 'Troubleshoot', href: '/troubleshoot' },
];

export default function TroubleshootIndex({ reports, filters, options }: Props) {
  const [search, setSearch] = useState(filters.search ?? '');
  const [detail, setDetail] = useState<Report | null>(null);

  // 'all' dipakai sebagai nilai internal Select (Radix melarang value="")
  // lalu diterjemahkan jadi filter kosong saat dikirim ke server.
  const applyFilter = (patch: Record<string, string>) => {
    const next = {
      status: filters.status ?? '',
      category: filters.category ?? '',
      search,
      ...patch,
    };
    router.get('/troubleshoot', next, { preserveState: true, replace: true });
  };

  const clearFilters = () => {
    setSearch('');
    router.get('/troubleshoot', {}, { preserveState: true, replace: true });
  };

  const changeStatus = (report: Report, status: string) => {
    router.put(route('troubleshoot.update-status', report.id), { status }, { preserveScroll: true });
  };

  const remove = (report: Report) => {
    router.delete(route('troubleshoot.destroy', report.id), { preserveScroll: true });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Troubleshoot" />
      <div className="flex-1 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight">Rekapan Troubleshoot</CardTitle>
            <p className="text-sm text-muted-foreground">
              Laporan kendala, bug, dan saran dari pengguna. Total: {reports.total}.
            </p>
          </CardHeader>
          <CardContent>
            {/* Filter */}
            <div className="mb-4 flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[200px]">
                <form
                  onSubmit={(e) => { e.preventDefault(); applyFilter({ search }); }}
                  className="flex gap-2"
                >
                  <Input
                    placeholder="Cari subjek / deskripsi..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Button type="submit" variant="secondary"><Search className="h-4 w-4" /></Button>
                </form>
              </div>

              <Select
                value={filters.status || 'all'}
                onValueChange={(v) => applyFilter({ status: v === 'all' ? '' : v })}
              >
                <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  {options.statuses.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s] ?? s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.category || 'all'}
                onValueChange={(v) => applyFilter({ category: v === 'all' ? '' : v })}
              >
                <SelectTrigger className="w-40"><SelectValue placeholder="Kategori" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {options.categories.map((c) => (
                    <SelectItem key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(filters.status || filters.category || filters.search) && (
                <Button variant="ghost" onClick={clearFilters}>
                  <X className="mr-1 h-4 w-4" /> Reset
                </Button>
              )}
            </div>

            {/* Tabel */}
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="p-3 font-medium">Subjek</th>
                    <th className="p-3 font-medium">Kategori</th>
                    <th className="p-3 font-medium">Pelapor</th>
                    <th className="p-3 font-medium">Waktu</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.data.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-muted-foreground">
                        Belum ada laporan.
                      </td>
                    </tr>
                  )}
                  {reports.data.map((r) => (
                    <tr key={r.id} className="border-t hover:bg-muted/30">
                      <td className="max-w-xs p-3">
                        <span className="line-clamp-1 font-medium">{r.subject}</span>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{CATEGORY_LABELS[r.category] ?? r.category}</Badge>
                      </td>
                      <td className="p-3">{r.user?.name ?? '—'}</td>
                      <td className="p-3 whitespace-nowrap text-muted-foreground">{r.created_at}</td>
                      <td className="p-3">
                        <Select value={r.status} onValueChange={(v) => changeStatus(r, v)}>
                          <SelectTrigger className="h-8 w-32">
                            <SelectValue>
                              <Badge variant={STATUS_VARIANT[r.status] ?? 'default'}>
                                {STATUS_LABELS[r.status] ?? r.status}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {options.statuses.map((s) => (
                              <SelectItem key={s} value={s}>{STATUS_LABELS[s] ?? s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setDetail(r)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus laporan?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Laporan &ldquo;{r.subject}&rdquo; akan dihapus permanen.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => remove(r)}>Hapus</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {reports.last_page > 1 && (
              <div className="mt-4 flex flex-wrap gap-1">
                {reports.links.map((link, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant={link.active ? 'default' : 'outline'}
                    disabled={!link.url}
                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{detail?.subject}</DialogTitle>
            <DialogDescription>
              {detail && (CATEGORY_LABELS[detail.category] ?? detail.category)} · {detail?.user?.name ?? '—'} · {detail?.created_at}
            </DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {detail?.description}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
