import { router } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarRange } from 'lucide-react';

const SEMUA = 'semua';

interface Props {
    /** Alamat halaman yang dimuat ulang saat pilihannya diganti. */
    routeName: string;
    /**
     * `periode` untuk KRS Pemda dan KRS PD — keduanya menurunkan RPJMD dan
     * Renstra yang berlaku lima tahunan. `tahun` untuk KRO PD dan seluruh
     * formulir risiko, yang menempel pada kegiatan beranggaran tahunan.
     */
    jenis: 'periode' | 'tahun';
    /** Pilihan yang tersedia; untuk periode berupa untai "2025-2029". */
    options: (string | number)[];
    /** Nilai yang sedang dipilih; null berarti seluruhnya ditampilkan. */
    nilai: string | number | null;
    /** Parameter lain yang harus ikut dibawa saat berpindah pilihan. */
    tambahan?: Record<string, string | number | undefined>;
}

/**
 * Pemilih Periode / Tahun Penilaian, dipasang di halaman konteks dan risiko.
 *
 * Dibuat menyerupai pemilih di halaman CEE supaya terasa satu keluarga, tetapi
 * dengan satu perbedaan yang disengaja: di sini ada pilihan "Semua". CEE
 * dinilai per-OPD per-tahun sehingga selalu ada satu tahun yang sedang
 * dikerjakan; konteks dan risiko sering perlu dilihat lintas periode, misalnya
 * saat membandingkan penilaian tahun berjalan dengan tahun sebelumnya.
 *
 * Bahasanya sengaja berbeda antara keduanya — "Periode Penilaian" dan "Tahun
 * Penilaian" — karena yang disekat memang berbeda, dan menyebut keduanya
 * "tahun" akan menyesatkan.
 */
export default function PeriodeTahunPicker({ routeName, jenis, options, nilai, tambahan }: Props) {
    const label = jenis === 'periode' ? 'Periode Penilaian' : 'Tahun Penilaian';
    const labelSemua = jenis === 'periode' ? 'Semua Periode' : 'Semua Tahun';

    const pindah = (v: string) => {
        router.get(
            routeName,
            { ...tambahan, [jenis]: v },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <div className="w-52 space-y-1">
            <Label className="flex items-center gap-1.5 text-xs">
                <CalendarRange className="h-3.5 w-3.5" />
                {label}
            </Label>
            <Select value={nilai === null ? SEMUA : String(nilai)} onValueChange={pindah}>
                <SelectTrigger className="h-9">
                    <SelectValue placeholder={`Pilih ${label}...`} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={SEMUA}>{labelSemua}</SelectItem>
                    {options.map((o) => (
                        <SelectItem key={String(o)} value={String(o)}>
                            {String(o)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
