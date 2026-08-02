import { useEffect, useState, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
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
import { FileUp, FileText, Image as ImageIcon, Trash2, Download } from 'lucide-react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import {
  ambilTertunda,
  buangTertunda,
  dengarkanTertunda,
  tambahTertunda,
} from '@/lib/bukti-tertunda';

interface EvidenceFile {
  id: number;
  name: string;
  size: string;
  mime_type: string;
  url: string;
  created_at: string;
}

interface RiskEvidenceUploaderProps {
  /** Slug jenis row — 'irs_pemda' | 'irs_pd' | 'iro_pd'. */
  type: string;
  /** ID baris risiko yang sudah tersimpan — null jika baris belum disimpan (mode Tambah). */
  rowId: number | null;
}

/**
 * Upload/lihat/unduh/hapus bukti dukung (SS/JPG/PNG/PDF) utk field "Uraian
 * Pengendalian yang Sudah Ada". File tersimpan lewat media milik user yg
 * sama dgn Utilities > File Manager (RiskEvidenceController). Hard delete
 * — bukti bukan data risiko inti, tidak perlu bisa dipulihkan dari Trash.
 *
 * Punya DUA keadaan. Kalau barisnya sudah tersimpan, berkas langsung dikirim
 * ke server. Kalau belum — yaitu saat menambah risiko baru — berkasnya
 * ditahan di peramban dan terunggah sendiri begitu barisnya tersimpan.
 * Sebelumnya keadaan kedua ini cuma berisi kalimat "simpan dulu", sehingga
 * melampirkan bukti selalu menuntut dua kali kerja: simpan, buka lagi, baru
 * unggah. Banyak yang berhenti di langkah pertama.
 */
export default function RiskEvidenceUploader({ type, rowId }: RiskEvidenceUploaderProps) {
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  // Berkas yang menunggu barisnya tersimpan. Dibaca dari penyimpan modul
  // supaya halaman di luar bisa mengunggahnya begitu nomor barisnya diketahui.
  const tertunda = useSyncExternalStore(
    dengarkanTertunda,
    () => ambilTertunda(type),
    () => ambilTertunda(type),
  );

  const loadFiles = () => {
    if (!rowId) return;
    setLoading(true);
    fetch(`/risk-evidence/${type}/${rowId}`, { headers: { Accept: 'application/json' } })
      .then((res) => res.json())
      .then((json) => setFiles(json.files ?? []))
      .catch(() => toast.error('Gagal memuat daftar bukti dukung.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowId, type]);

  const handleUpload = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    // Barisnya belum ada: berkasnya ditahan dulu, bukan ditolak.
    if (!rowId) {
      tambahTertunda(type, Array.from(fileList));
      return;
    }

    const formData = new FormData();
    Array.from(fileList).forEach((f) => formData.append('files[]', f));

    setUploading(true);
    router.post(`/risk-evidence/${type}/${rowId}`, formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Bukti dukung berhasil diunggah.');
        loadFiles();
      },
      onError: () => toast.error('Gagal mengunggah bukti dukung (max 10MB, format JPG/PNG/PDF).'),
      onFinish: () => setUploading(false),
    });
  };

  const handleDelete = (mediaId: number) => {
    if (!rowId) return;
    router.delete(`/risk-evidence/${type}/${rowId}/${mediaId}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Bukti dukung berhasil dihapus.');
        loadFiles();
      },
      onError: () => toast.error('Gagal menghapus bukti dukung.'),
    });
  };

  const pilihBerkas = (
    <label>
      <input
        type="file"
        accept="image/jpeg,image/png,image/jpg,application/pdf"
        multiple
        className="hidden"
        disabled={uploading}
        onChange={(e) => {
          handleUpload(e.target.files);
          e.target.value = '';
        }}
      />
      <Button type="button" size="sm" variant="outline" disabled={uploading} asChild>
        <span className="cursor-pointer">
          <FileUp className="mr-1.5 h-3.5 w-3.5" />
          {uploading ? 'Mengunggah...' : 'Unggah'}
        </span>
      </Button>
    </label>
  );

  // Baris belum tersimpan: berkasnya ditahan dan diperlihatkan apa adanya,
  // lengkap dengan keterangan kapan ia akan terunggah.
  if (!rowId) {
    return (
      <div className="space-y-2 rounded-md border p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground">
            Bukti Dukung (SS/JPG/PNG/PDF, opsional)
          </p>
          {pilihBerkas}
        </div>
        {tertunda.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Boleh dipilih sekarang — berkasnya terunggah sendiri begitu data risiko ini disimpan.
          </p>
        ) : (
          <>
            <ul className="space-y-1">
              {tertunda.map((f, i) => (
                <li key={`${f.name}-${i}`} className="flex items-center gap-2 text-xs">
                  {f.type === 'application/pdf' ? (
                    <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  ) : (
                    <ImageIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <span className="min-w-0 flex-1 truncate">{f.name}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {(f.size / 1024).toFixed(0)} KB
                  </span>
                  <button
                    type="button"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => buangTertunda(type, i)}
                    title="Buang dari daftar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-xs text-amber-600">
              {tertunda.length} berkas menunggu — akan terunggah otomatis saat data risiko disimpan.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-md border p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">Bukti Dukung (SS/JPG/PNG/PDF, opsional)</p>
        <label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg,application/pdf"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              handleUpload(e.target.files);
              e.target.value = '';
            }}
          />
          <Button type="button" size="sm" variant="outline" disabled={uploading} asChild>
            <span className="cursor-pointer">
              <FileUp className="mr-1.5 h-3.5 w-3.5" />
              {uploading ? 'Mengunggah...' : 'Unggah'}
            </span>
          </Button>
        </label>
      </div>

      {loading ? (
        <p className="text-xs text-muted-foreground">Memuat...</p>
      ) : files.length === 0 ? (
        <p className="text-xs text-muted-foreground">Belum ada bukti dukung diunggah.</p>
      ) : (
        <ul className="space-y-1">
          {files.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-2 rounded border px-2 py-1 text-xs">
              <div className="flex min-w-0 items-center gap-1.5">
                {f.mime_type.startsWith('image/') ? (
                  <ImageIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                ) : (
                  <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                )}
                <span className="truncate">{f.name}</span>
                <span className="shrink-0 text-muted-foreground">({f.size})</span>
              </div>
              <div className="flex shrink-0 gap-1">
                <a href={f.url} target="_blank" rel="noopener noreferrer" download>
                  <Button type="button" size="icon" variant="ghost" className="h-6 w-6">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </a>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus bukti dukung ini?</AlertDialogTitle>
                      <AlertDialogDescription>
                        File "{f.name}" akan dihapus PERMANEN (tidak bisa dipulihkan).
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(f.id)} className="bg-destructive hover:bg-destructive/90">
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
  );
}
