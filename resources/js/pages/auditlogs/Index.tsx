import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import { ChevronRight, Search, X, Plus, Pencil, Trash2 } from 'lucide-react';

interface Activity {
  id: number;
  description: string;
  event: string | null;
  created_at: string;
  causer: { id: number; name: string } | null;
  properties: {
    old?: Record<string, unknown>;
    attributes?: Record<string, unknown>;
  } & Record<string, unknown>;
  subject_type: string | null;
  subject_id: number | null;
}

interface Paginator<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  links: { url: string | null; label: string; active: boolean }[];
}

interface FilterOptions {
  subjectTypes: { value: string; label: string }[];
  events: string[];
  users: { id: number; name: string }[];
}

interface Filters {
  subject_type?: string;
  causer_id?: string;
  event?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

interface Props {
  logs: Paginator<Activity>;
  filters: Filters;
  filterOptions: FilterOptions;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Audit Log', href: '/audit-logs' }];

const ACTION_META: Record<string, { label: string; className: string; icon: typeof Plus }> = {
  created: { label: 'Dibuat', className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', icon: Plus },
  updated: { label: 'Diperbarui', className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30', icon: Pencil },
  deleted: { label: 'Dihapus', className: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30', icon: Trash2 },
};

function parseDescription(description: string): { action: string; model: string } {
  const [action, ...rest] = description.split(' ');
  return { action, model: rest.join(' ') || '—' };
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function ChangedFields({ properties }: { properties: Activity['properties'] }) {
  const attributes = properties.attributes ?? (properties.old ? undefined : properties);
  const old = properties.old;

  if (!attributes || Object.keys(attributes).length === 0) return null;

  const fields = Object.keys(attributes).filter((k) => !['updated_at', 'created_at'].includes(k));
  if (fields.length === 0) return null;

  return (
    <div className="mt-3 overflow-hidden rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Field</th>
            {old && <th className="px-3 py-2 text-left font-medium text-muted-foreground">Sebelum</th>}
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">{old ? 'Sesudah' : 'Nilai'}</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field} className="border-t align-top">
              <td className="px-3 py-2 font-medium whitespace-nowrap">{field}</td>
              {old && (
                <td className="px-3 py-2 whitespace-pre-line text-muted-foreground line-through decoration-destructive/50">
                  {formatValue(old[field])}
                </td>
              )}
              <td className="px-3 py-2 whitespace-pre-line">{formatValue((attributes as Record<string, unknown>)[field])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LogRow({ log }: { log: Activity }) {
  const [open, setOpen] = useState(false);
  const { action, model } = parseDescription(log.description);
  const meta = ACTION_META[action] ?? { label: action, className: 'bg-muted text-muted-foreground', icon: Pencil };
  const Icon = meta.icon;
  const fieldCount = Object.keys(log.properties.attributes ?? (log.properties.old ? {} : log.properties)).filter(
    (k) => !['updated_at', 'created_at'].includes(k),
  ).length;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left hover:bg-muted/50">
        <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
        <Badge variant="outline" className={`shrink-0 gap-1 ${meta.className}`}>
          <Icon className="h-3 w-3" />
          {meta.label}
        </Badge>
        <span className="shrink-0 font-medium">{model}</span>
        {log.subject_id && <span className="shrink-0 text-xs text-muted-foreground">#{log.subject_id}</span>}

        <span className="ml-auto flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[10px]">{log.causer ? initials(log.causer.name) : 'SYS'}</AvatarFallback>
          </Avatar>
          {log.causer?.name ?? 'Sistem'}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
          {new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
        </span>
        {fieldCount > 0 && (
          <Badge variant="secondary" className="shrink-0">
            {fieldCount} field
          </Badge>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3 pl-10">
        <ChangedFields properties={log.properties} />
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function AuditLogIndex({ logs, filters, filterOptions }: Props) {
  const [searchInput, setSearchInput] = useState(filters.search ?? '');

  const applyFilter = (next: Partial<Filters>) => {
    router.get(
      '/audit-logs',
      { ...filters, ...next },
      { preserveState: true, preserveScroll: true, replace: true },
    );
  };

  const clearFilters = () => {
    setSearchInput('');
    router.get('/audit-logs', {}, { preserveScroll: true });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Audit Log" />
      <div className="flex-1 space-y-4 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold">Audit Log</h1>
          <p className="text-sm text-muted-foreground">
            Riwayat aktivitas seluruh pengguna dalam sistem — {logs.total} entri tercatat
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-wrap items-center gap-2 pt-6">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilter({ search: searchInput })}
                placeholder="Cari deskripsi atau isi perubahan..."
                className="pl-9"
              />
            </div>

            <Select value={filters.subject_type ?? 'all'} onValueChange={(v) => applyFilter({ subject_type: v === 'all' ? undefined : v })}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Jenis data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua jenis</SelectItem>
                {filterOptions.subjectTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.event ?? 'all'} onValueChange={(v) => applyFilter({ event: v === 'all' ? undefined : v })}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Aksi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua aksi</SelectItem>
                {filterOptions.events.map((e) => (
                  <SelectItem key={e} value={e}>
                    {ACTION_META[e]?.label ?? e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.causer_id ?? 'all'}
              onValueChange={(v) => applyFilter({ causer_id: v === 'all' ? undefined : v })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pengguna" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua pengguna</SelectItem>
                {filterOptions.users.map((u) => (
                  <SelectItem key={u.id} value={String(u.id)}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={filters.date_from ?? ''}
              onChange={(e) => applyFilter({ date_from: e.target.value || undefined })}
              className="w-[150px]"
            />
            <span className="text-sm text-muted-foreground">s/d</span>
            <Input
              type="date"
              value={filters.date_to ?? ''}
              onChange={(e) => applyFilter({ date_to: e.target.value || undefined })}
              className="w-[150px]"
            />

            {hasActiveFilters && (
              <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-4 w-4" />
                Reset
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-2">
            {logs.data.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">Tidak ada log yang cocok dengan filter ini.</p>
            ) : (
              <div className="divide-y">
                {logs.data.map((log) => (
                  <LogRow key={log.id} log={log} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {logs.links.length > 3 && (
          <div className="flex flex-wrap justify-center gap-2">
            {logs.links.map((link, i) => (
              <Button
                key={i}
                disabled={!link.url}
                variant={link.active ? 'default' : 'outline'}
                size="sm"
                onClick={() => link.url && router.visit(link.url, { preserveScroll: true, preserveState: true })}
              >
                <span dangerouslySetInnerHTML={{ __html: link.label }} />
              </Button>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
