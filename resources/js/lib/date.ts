// Format tanggal Indonesia terpusat ("dd MMMM yyyy", mis. "12 Juli 2026") —
// dipakai di SELURUH aplikasi KECUALI Form Cetak (Cetak2a/2b/2c.tsx dan
// pdf-*.blade.php), yang sudah punya formatnya sendiri via
// ->locale('id')->translatedFormat('d F Y') di backend. Sengaja tanpa
// dependency baru (dayjs/date-fns) — cukup Intl.DateTimeFormat bawaan
// browser dengan locale 'id-ID'.

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/** "12 Juli 2026" — dari string/Date apa pun yang valid utk `new Date()`. */
export function formatTanggal(value: string | number | Date | null | undefined): string {
  if (!value) return '-';
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return '-';
  return dateFormatter.format(d);
}

/** "12 Juli 2026 10:30" — dipakai di tempat yang butuh presisi waktu (Audit Log, Log Import Excel, dll). */
export function formatTanggalWaktu(value: string | number | Date | null | undefined): string {
  if (!value) return '-';
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return '-';
  return dateTimeFormatter.format(d).replace(/\./g, ':');
}
