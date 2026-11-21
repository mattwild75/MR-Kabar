import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Sakelar kunci jawaban di halaman admin (Kelola, Pantau, Hasil).
 *
 * Halaman admin sering ikut tampil di layar proyektor, jadi kunci jawaban
 * SELALU tersembunyi setiap kali halaman dibuka; pemandu membukanya sendiri
 * bila perlu, dan hanya di perangkat itu.
 */
export function TombolKunci({ tampil, onUbah }: { tampil: boolean; onUbah: (tampil: boolean) => void }) {
    return (
        <Button type="button" size="sm" variant="outline" onClick={() => onUbah(!tampil)} aria-pressed={tampil}>
            {tampil ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {tampil ? 'Sembunyikan kunci' : 'Tampilkan kunci'}
        </Button>
    );
}

/** Penanda kunci yang sedang disembunyikan. */
export const KUNCI_TERSEMBUNYI = '•';
