import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock } from 'lucide-react';

export interface SheetResult {
  slug: string;
  label: string;
  sheet_name: string;
  inserted: number;
  updated: number;
  error_count: number;
  errors: { row: number; message: string }[];
  errors_truncated: boolean;
}

export interface ImportResult {
  ok: boolean;
  structure_errors: string[];
  sheets: SheetResult[];
}

export interface RequestUser {
  id: number;
  name: string;
  username: string;
}

export type ImportRequestStatus = 'pending' | 'processing' | 'approved' | 'rejected';

/**
 * Badge status permintaan impor — dipakai baik oleh halaman Excel admin
 * (Settings > Backup > Excel) maupun PIC OPD (Form Input > Ekspor/Impor
 * KRS), keduanya memakai RiskExcelImportRequest yang sama (dibedakan lewat
 * kolom `scope`).
 */
export function statusBadge(status: ImportRequestStatus) {
  if (status === 'pending' || status === 'processing') {
    return (
      <Badge variant="outline" className="gap-1 text-amber-600 dark:text-amber-400">
        <Clock className="h-3 w-3" />
        Menunggu Persetujuan
      </Badge>
    );
  }
  if (status === 'approved') {
    return (
      <Badge className="gap-1 bg-green-600 hover:bg-green-600">
        <Check className="h-3 w-3" />
        Disetujui
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="gap-1">
      <X className="h-3 w-3" />
      Ditolak
    </Badge>
  );
}

/**
 * Render ImportResult (baik preview pra-tulis maupun hasil akhir setelah
 * ditulis) — tabel ringkasan per-sheet (ditambah/diperbarui/error) plus
 * daftar error per-baris yang bisa di-expand. Dipakai bersama oleh halaman
 * Excel admin & PIC OPD supaya bentuk tampilan konsisten & tidak
 * terduplikasi.
 */
export default function ImportResultPanel({
  title,
  result,
  compact,
}: {
  title: string;
  result: ImportResult;
  compact?: boolean;
}) {
  const body = !result.ok ? (
    <ul className="list-disc space-y-1 pl-5 text-sm text-destructive">
      {result.structure_errors.map((msg, i) => (
        <li key={i}>{msg}</li>
      ))}
    </ul>
  ) : (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">Sheet</th>
              <th className="p-2 text-right">Ditambah</th>
              <th className="p-2 text-right">Diperbarui</th>
              <th className="p-2 text-right">Error</th>
            </tr>
          </thead>
          <tbody>
            {result.sheets.map((s) => (
              <tr key={s.slug} className="border-b">
                <td className="p-2">{s.label}</td>
                <td className="p-2 text-right">{s.inserted}</td>
                <td className="p-2 text-right">{s.updated}</td>
                <td className={`p-2 text-right ${s.error_count > 0 ? 'font-semibold text-destructive' : ''}`}>
                  {s.error_count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {result.sheets.some((s) => s.error_count > 0) && (
        <div className="space-y-2">
          {result.sheets
            .filter((s) => s.error_count > 0)
            .map((s) => (
              <details key={s.slug} className="text-sm">
                <summary className="cursor-pointer font-medium text-destructive">
                  {s.label} — {s.error_count} baris error
                  {s.errors_truncated && ` (menampilkan ${s.errors.length} pertama)`}
                </summary>
                <ul className="mt-2 space-y-1 rounded-md border bg-muted/30 p-2 pl-6 text-xs">
                  {s.errors.map((e, i) => (
                    <li key={i} className="list-disc">
                      Baris {e.row}: {e.message}
                    </li>
                  ))}
                </ul>
              </details>
            ))}
        </div>
      )}
    </div>
  );

  if (compact) {
    return (
      <details className="text-sm">
        <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">{title}</summary>
        <div className="mt-2">{body}</div>
      </details>
    );
  }

  return (
    <Card className={!result.ok ? 'border-destructive' : undefined}>
      <CardHeader>
        <CardTitle className={`text-lg font-bold ${!result.ok ? 'text-destructive' : ''}`}>{title}</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">{body}</CardContent>
    </Card>
  );
}
