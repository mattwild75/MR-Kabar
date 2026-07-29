import { FileDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

interface Props {
    href: string;
    label?: string;
    disabled?: boolean;
}

/**
 * Tombol Unduh PDF untuk seluruh halaman Form Cetak.
 *
 * Berkasnya diambil lewat fetch, bukan dengan menavigasi ke tautannya
 * langsung seperti sebelumnya. Dua alasan, keduanya dari perilaku terukur:
 *
 * 1. Pembuatan PDF memakan 5-8 detik (Chromium menyalin halaman ini apa
 *    adanya). Selama itu tautan biasa tidak memberi tanda apa pun, sehingga
 *    tombolnya wajar ditekan berulang.
 * 2. Kalau server sedang mencetak permintaan lain, balasannya 503 — dan
 *    dengan tautan biasa peramban BERPINDAH halaman untuk menampilkannya,
 *    sehingga pilihan OPD & tahun yang sudah diatur ikut hilang.
 *
 * Dengan fetch, keadaan "sedang menyiapkan" terlihat, tombolnya mengunci
 * diri, dan penolakan muncul sebagai pesan di halaman yang sama.
 */
export default function UnduhPdfButton({ href, label = 'Unduh PDF', disabled }: Props) {
    const [sedang, setSedang] = useState(false);

    const unduh = async () => {
        setSedang(true);
        try {
            const res = await fetch(href, { credentials: 'same-origin' });

            if (!res.ok) {
                toast.error(
                    res.status === 503
                        ? 'Sedang ada pencetakan PDF lain yang berjalan. Tunggu sebentar lalu coba lagi.'
                        : `Gagal menyiapkan PDF (${res.status}). Coba muat ulang halaman ini.`,
                );
                return;
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const tautan = document.createElement('a');
            tautan.href = url;
            tautan.download = namaBerkas(res.headers.get('Content-Disposition')) ?? 'cetak.pdf';
            document.body.appendChild(tautan);
            tautan.click();
            tautan.remove();
            // Dilepas belakangan: sebagian peramban membatalkan unduhannya
            // kalau alamat blob-nya dicabut pada saat yang sama.
            setTimeout(() => URL.revokeObjectURL(url), 10_000);
        } catch {
            toast.error('Gagal menghubungi server. Periksa koneksi lalu coba lagi.');
        } finally {
            setSedang(false);
        }
    };

    return (
        <Button onClick={unduh} disabled={disabled || sedang}>
            {sedang ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
                <FileDown className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            {sedang ? 'Menyiapkan PDF...' : label}
        </Button>
    );
}

/** Ambil nama berkas dari header Content-Disposition kiriman server. */
function namaBerkas(disposition: string | null): string | null {
    if (!disposition) return null;
    const cocok = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
    return cocok ? decodeURIComponent(cocok[1]) : null;
}
