import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Download, FileSpreadsheet, Upload, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { type BreadcrumbItem } from '@/types';
import { formatTanggalWaktu } from '@/lib/date';
import ImportResultPanel, {
  statusBadge,
  type ImportResult,
  type RequestUser,
  type ImportRequestStatus,
} from '@/components/ui/import-result-panel';

interface ModuleInfo {
  slug: string;
  label: string;
  sheet_name: string;
}

interface ImportRequestItem {
  id: number;
  original_filename: string;
  status: ImportRequestStatus;
  preview_result: ImportResult;
  final_result: ImportResult | null;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
  user?: RequestUser;
  reviewer?: RequestUser;
}

interface Props {
  modules: ModuleInfo[];
  pendingRequests: ImportRequestItem[];
  myRequests: ImportRequestItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Backup', href: '/backup' },
  { title: 'Ekspor/Impor Excel', href: '/backup/excel' },
];

export default function BackupExcel({ modules, pendingRequests, myRequests }: Props) {
  const { props } = usePage<{ flash: { importResult?: ImportResult | null } }>();
  const importResult = props.flash?.importResult ?? null;

  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const handleImport = () => {
    if (!file) {
      toast.error('Pilih file .xlsx terlebih dahulu.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setImporting(true);
    router.post('/backup/excel/import', formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Permintaan impor berhasil dikirim.');
        setFile(null);
      },
      onError: () => toast.error('Impor gagal — cek pesan error di halaman.'),
      onFinish: () => setImporting(false),
    });
  };

  return (
    <AppLayout title="Ekspor/Impor Excel" breadcrumbs={breadcrumbs}>
      <Head title="Ekspor/Impor Excel" />

      <div className="space-y-4 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
              <FileSpreadsheet className="h-6 w-6" />
              Ekspor/Impor Excel — Seluruh Form Input
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Satu file Excel berisi {modules.length} tab (satu tab per modul Form Input), mencakup seluruh data
              lintas-OPD. Format Excel (nama tab, urutan &amp; nama kolom) tidak boleh diubah — hanya isian
              datanya. Khusus Admin/Super Admin.
            </p>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-4 pt-4">
            <ul className="grid grid-cols-1 gap-1 text-sm text-muted-foreground sm:grid-cols-2">
              {modules.map((m) => (
                <li key={m.slug}>
                  {m.label} <span className="text-xs">({m.sheet_name})</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-2">
              <a href="/backup/excel/template">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Unduh Template Kosong
                </Button>
              </a>
              <a href="/backup/excel/export">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Ekspor Semua Data
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Impor dari Excel</CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload file hasil unduhan Ekspor/Template yang sudah diisi. Baris dengan ID kosong dianggap data
              baru; baris dengan ID terisi akan memperbarui data yang sudah ada. Baris yang ada di database tapi
              tidak muncul di file tidak akan dihapus.
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Khusus akun Admin (bukan Super Admin): impor tidak langsung diproses — file akan menunggu
              persetujuan Super Admin terlebih dahulu.
            </p>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-3 pt-4">
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-muted"
            />
            <Button onClick={handleImport} disabled={importing || !file}>
              <Upload className="mr-2 h-4 w-4" />
              {importing ? 'Mengunggah...' : 'Impor File'}
            </Button>
          </CardContent>
        </Card>

        {importResult && <ImportResultPanel title="Hasil Impor" result={importResult} />}

        {pendingRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Permintaan Menunggu Persetujuan</CardTitle>
              <p className="text-sm text-muted-foreground">
                Daftar impor yang diajukan Admin dan menunggu keputusan Anda sebagai Super Admin.
              </p>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-3 pt-4">
              {pendingRequests.map((r) => (
                <PendingRequestCard key={r.id} request={r} approveUrl={`/backup/excel/import-requests/${r.id}/approve`} rejectUrl={`/backup/excel/import-requests/${r.id}/reject`} />
              ))}
            </CardContent>
          </Card>
        )}

        {myRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Riwayat Permintaan Saya</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-3 pt-4">
              {myRequests.map((r) => (
                <MyRequestCard key={r.id} request={r} />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

function PendingRequestCard({
  request,
  approveUrl,
  rejectUrl,
}: {
  request: ImportRequestItem;
  approveUrl: string;
  rejectUrl: string;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleApprove = () => {
    setProcessing(true);
    router.post(approveUrl, {}, {
      preserveScroll: true,
      onSuccess: () => toast.success('Permintaan disetujui.'),
      onError: () => toast.error('Gagal menyetujui permintaan.'),
      onFinish: () => setProcessing(false),
    });
  };

  const handleReject = () => {
    setProcessing(true);
    router.post(rejectUrl, { rejection_reason: reason }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Permintaan ditolak.');
        setRejecting(false);
        setReason('');
      },
      onError: () => toast.error('Gagal menolak permintaan.'),
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <div className="space-y-3 rounded-md border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-medium">{request.original_filename}</div>
          <div className="text-xs text-muted-foreground">
            Diajukan oleh {request.user?.name ?? '-'} (@{request.user?.username ?? '-'}) &middot;{' '}
            {formatTanggalWaktu(request.created_at)}
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleApprove} disabled={processing}>
            <Check className="mr-1 h-4 w-4" />
            Setujui
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setRejecting((v) => !v)} disabled={processing}>
            <X className="mr-1 h-4 w-4" />
            Tolak
          </Button>
        </div>
      </div>

      {rejecting && (
        <div className="space-y-2">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Alasan penolakan (opsional)..."
            rows={2}
          />
          <Button size="sm" variant="destructive" onClick={handleReject} disabled={processing}>
            Konfirmasi Tolak
          </Button>
        </div>
      )}

      <ImportResultPanel title="Preview (belum ditulis ke database)" result={request.preview_result} compact />
    </div>
  );
}

function MyRequestCard({ request }: { request: ImportRequestItem }) {
  const resultToShow = request.status === 'approved' ? request.final_result : request.preview_result;

  return (
    <div className="space-y-3 rounded-md border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-medium">{request.original_filename}</div>
          <div className="text-xs text-muted-foreground">
            Diajukan {formatTanggalWaktu(request.created_at)}
            {request.reviewed_at && (
              <>
                {' '}
                &middot; ditinjau oleh {request.reviewer?.name ?? '-'} pada{' '}
                {formatTanggalWaktu(request.reviewed_at)}
              </>
            )}
          </div>
          {request.status === 'rejected' && request.rejection_reason && (
            <div className="mt-1 text-xs text-destructive">Alasan: {request.rejection_reason}</div>
          )}
        </div>
        {statusBadge(request.status)}
      </div>

      {resultToShow && (
        <ImportResultPanel
          title={request.status === 'approved' ? 'Hasil Impor' : 'Preview (belum ditulis ke database)'}
          result={resultToShow}
          compact
        />
      )}
    </div>
  );
}
