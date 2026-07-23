import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';

interface Props {
    title: string;
    tahunOptions: string[];
    embedRouteName: string;
}

/** Halaman diagram hierarki ber-iframe + filter Tahun Dinilai Risiko — dipakai identik oleh krs_irs_pemda_visualisasi, krs_irs_pd_visualisasi, dan kro_iro_pd_visualisasi (hanya beda title & nama route embed). */
export default function YearFilterVisualization({ title, tahunOptions, embedRouteName }: Props) {
    const [tahun, setTahun] = useState<string>('semua');

    const src = useMemo(() => {
        const base = route(embedRouteName);
        return tahun === 'semua' ? base : `${base}?tahun=${encodeURIComponent(tahun)}`;
    }, [tahun, embedRouteName]);

    return (
        <AppLayout>
            <Head title={title} />
            <div className="flex items-center gap-2 border-b bg-background px-4 py-2">
                <span className="text-sm font-medium">Tahun Dinilai Risiko:</span>
                <Select value={tahun} onValueChange={setTahun}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="semua">Semua Tahun</SelectItem>
                        {tahunOptions.map((t) => (
                            <SelectItem key={t} value={t}>
                                {t}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <iframe
                key={src}
                src={src}
                title={title}
                style={{
                    width: '100%',
                    height: 'calc(100vh - 4rem - 41px)',
                    border: 'none',
                    display: 'block',
                }}
            />
        </AppLayout>
    );
}
