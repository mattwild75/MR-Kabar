import { router } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2 } from 'lucide-react';

const SEMUA = 'semua';

export interface OpdOption {
    id: number;
    nama: string;
}

interface Props {
    /** Alamat halaman yang dimuat ulang saat pilihannya diganti. */
    routeName: string;
    /** Daftar perangkat daerah; KOSONG berarti pemilihnya tidak digambar. */
    options: OpdOption[];
    /** Yang sedang dipilih; null berarti seluruh perangkat daerah. */
    nilai: number | null;
    /** Parameter lain yang harus ikut dibawa saat berpindah pilihan. */
    tambahan?: Record<string, string | number | undefined>;
}

/**
 * Pemilih Perangkat Daerah, berdampingan dengan pemilih Periode/Tahun.
 *
 * Bawaannya "Semua OPD", berbeda dari pemilih periode dan tahun yang bawaannya
 * satu nilai. Alasannya: yang melihat pemilih ini memang sedang mengawasi
 * lintas perangkat daerah, jadi menyempitkannya sendiri sejak awal akan
 * menyembunyikan data tanpa diminta.
 *
 * Komponennya menggambar DIRINYA SENDIRI menjadi tidak ada kalau daftarnya
 * kosong. Daftar itu hanya dikirim server kepada yang berhak melihat lintas
 * perangkat daerah, sehingga PIC biasa tidak pernah melihat pemilih yang
 * seluruh pilihannya akan ditolak server — penjaga sesungguhnya tetap di sisi
 * server, ini semata supaya tidak ada kendali yang menjanjikan sesuatu yang
 * tidak bisa ditepati.
 */
export default function OpdPicker({ routeName, options, nilai, tambahan }: Props) {
    if (options.length === 0) {
        return null;
    }

    const pindah = (v: string) => {
        router.get(
            routeName,
            { ...tambahan, opd_id: v },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <div className="w-64 space-y-1">
            <Label className="flex items-center gap-1.5 text-xs">
                <Building2 className="h-3.5 w-3.5" />
                Perangkat Daerah
            </Label>
            <Select value={nilai === null ? SEMUA : String(nilai)} onValueChange={pindah}>
                <SelectTrigger className="h-9">
                    <SelectValue placeholder="Pilih Perangkat Daerah..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={SEMUA}>Semua OPD</SelectItem>
                    {options.map((o) => (
                        <SelectItem key={o.id} value={String(o.id)}>
                            {o.nama}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
