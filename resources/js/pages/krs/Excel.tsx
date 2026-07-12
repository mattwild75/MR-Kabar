import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
  writable: boolean;
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
  { title: 'Form Input', href: '#' },
  { title: 'Ekspor/Impor KRS (Excel)', href: '/krs-excel' },
];

export default function KrsExcel({ modules, pendingRequests, myRequests }: Props) {
  const { props } = usePage<{ flash: { importResult?: ImportResult | null } }>();
  const importResult = props.flash?.importResult ?? null;

  // KRS Pemda selalu ikut (dicentang & dikunci) begitu KRS PD atau KRO PD
  // dipilih — dibutuhkan sbg referensi cross-ref lengkap saat validasi
  // impor. KRS PD JUGA wajib ikut kalau KRO PD dipilih — SASARAN RENSTRA
  // di KRO PD dirujuk ke SASARAN STRATEGIS PD milik KRS PD (bukan ke KRS
  // Pemda), jadi KRO PD sendirian tanpa KRS PD kehilangan referensi
  // hierarkinya sendiri. Defaultnya semua tercentang.
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(modules.map((m) => [m.slug, true])),
  );

  const anyWritableSelected = modules.some((m) => m.writable && selected[m.slug]);
  const kroPdSelected = !!selected['kro_pd'];

  const toggleModule = (slug: string, checked: boolean) => {
    setSelected((prev) => {
      const next = { ...prev, [slug]: checked };
      // KRO PD merujuk ke KRS PD (bukan boleh dilepas begitu KRO PD dipilih).
      if (next['kro_pd']) {
        next['krs_pd'] = true;
      }
      // krs_pemda ikut otomatis kalau krs_pd/kro_pd dicentang.
      const writableChecked = modules.some((m) => m.writable && next[m.slug]);
      if (writableChecked) {
        next['krs_pemda'] = true;
      }
      return next;
    });
  };

  const selectedSlugs = modules.filter((m) => selected[m.slug]).map((m) => m.slug);
  const queryString = selectedSlugs.map((s) => `modules[]=${encodeURIComponent(s)}`).join('&');

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
    router.post('/krs-excel/import', formData, {
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
    <AppLayout title="Ekspor/Impor KRS (Excel)" breadcrumbs={breadcrumbs}>
      <Head title="Ekspor/Impor KRS (Excel)" />

      <div className="space-y-4 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
              <FileSpreadsheet className="h-6 w-6" />
              Ekspor/Impor KRS Pemda + KRS PD + KRO PD
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Satu file Excel bisa mencakup ketiga tingkat hierarki sekaligus (KRS Pemda → KRS PD → KRO PD), supaya
              sekali input langsung menyambungkan ketiganya. KRS Pemda bersifat referensi bacaan saja (data
              seluruh Pemda) — hanya KRS PD dan KRO PD yang benar-benar bisa diimpor dan hanya berisi data milik
              Anda sendiri.
            </p>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              {modules.map((m) => {
                const isKrsPemda = m.slug === 'krs_pemda';
                const isKrsPd = m.slug === 'krs_pd';
                const lockedByChild = (isKrsPemda && anyWritableSelected) || (isKrsPd && kroPdSelected);
                return (
                  <div key={m.slug} className="flex items-center gap-2">
                    <Checkbox
                      id={`mod-${m.slug}`}
                      checked={!!selected[m.slug]}
                      disabled={lockedByChild}
                      onCheckedChange={(checked) => toggleModule(m.slug, checked === true)}
                    />
                    <Label htmlFor={`mod-${m.slug}`} className="cursor-pointer text-sm">
                      {m.label} <span className="text-xs text-muted-foreground">({m.sheet_name})</span>
                      {!m.writable && (
                        <span className="ml-1.5 text-xs text-muted-foreground">— referensi saja, tidak bisa diimpor</span>
                      )}
                      {lockedByChild && (
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          — wajib ikut {isKrsPd ? 'krn KRO PD merujuk ke sini' : 'sbg referensi'}
                        </span>
                      )}
                    </Label>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              <a href={`/krs-excel/template?${queryString}`}>
                <Button variant="outline" disabled={selectedSlugs.length === 0}>
                  <Download className="mr-2 h-4 w-4" />
                  Unduh Template Kosong
                </Button>
              </a>
              <a href={`/krs-excel/export?${queryString}`}>
                <Button variant="outline" disabled={selectedSlugs.length === 0}>
                  <Download className="mr-2 h-4 w-4" />
                  Ekspor Data
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
              baru; baris dengan ID terisi akan memperbarui data Anda yang sudah ada. Baris di KRS Pemda tidak
              pernah diimpor (referensi saja) — hanya KRS PD dan KRO PD yang akan tertulis.
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Impor tidak langsung diproses — file akan menunggu persetujuan Admin/Super Admin terlebih dahulu.
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
                Daftar impor yang diajukan PIC OPD dan menunggu keputusan Anda sebagai Admin/Super Admin.
              </p>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-3 pt-4">
              {pendingRequests.map((r) => (
                <PendingRequestCard
                  key={r.id}
                  request={r}
                  approveUrl={`/krs-excel/import-requests/${r.id}/approve`}
                  rejectUrl={`/krs-excel/import-requests/${r.id}/reject`}
                />
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
