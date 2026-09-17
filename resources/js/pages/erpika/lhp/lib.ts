import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

/** Status LHP dari SimHP: rollup keadaan tindak lanjut seluruh rekomendasi. */
export const STATUS_LHP: Record<string, string> = {
    '00': 'Entry Tidak Lengkap',
    '01': 'Belum Ada Tindak Lanjut',
    '02': 'Tindak Lanjut Sebagian',
    '03': 'Tuntas',
};

/** Kelas warna badge per status — hijau tuntas, kuning sebagian, merah belum. */
export function statusKelas(status: string | null): string {
    switch (status) {
        case '03':
            return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200';
        case '02':
            return 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200';
        case '01':
            return 'bg-red-100 text-red-900 dark:bg-red-950/50 dark:text-red-200';
        default:
            return 'bg-muted text-muted-foreground';
    }
}

export function statusLabel(status: string | null): string {
    return status ? (STATUS_LHP[status] ?? status) : '—';
}

/** Rupiah tanpa desimal; 0 dan null ditampilkan seragam. */
export function rupiah(n: number | null | undefined): string {
    if (n === null || n === undefined) return '—';
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.round(n));
}

export function tanggal(iso: string | null | undefined): string {
    if (!iso) return '—';
    return dayjs(iso).format('D MMMM YYYY');
}

export function tanggalSingkat(iso: string | null | undefined): string {
    if (!iso) return '—';
    return dayjs(iso).format('DD/MM/YYYY');
}
