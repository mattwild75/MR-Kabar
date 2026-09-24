import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { FileSpreadsheet } from 'lucide-react';
import { type ArepData } from '@/pages/erpika/arep/forms/bagian';
import { FormulirKm, type KmMeta } from '@/pages/erpika/arep/forms/km';

interface Props {
    data: ArepData;
    katalog: KmMeta[];
    forms: number[];
}

const breadcrumbs = (nomor: string): BreadcrumbItem[] => [
    { title: 'ERPIKA', href: '#' },
    { title: 'AREP', href: '#' },
    { title: 'Kendali Mutu', href: '/erpika/arep/kendali-mutu' },
    { title: nomor, href: '#' },
];

export default function KendaliMutuCetak({ data, katalog, forms }: Props) {
    const dipilih = forms
        .map((no) => katalog.find((k) => k.no === no))
        .filter((m): m is KmMeta => !!m);
    const semuaLandscape = dipilih.length > 0 && dipilih.every((m) => m.orientasi === 'landscape');
    const q = forms.join(',');

    return (
        <AppLayout breadcrumbs={breadcrumbs(data.nomor.st)}>
            <Head title={`Kendali Mutu ${data.nomor.st}`} />
            <style>{`
                @page { size: A4 ${semuaLandscape ? 'landscape' : 'portrait'}; margin: 0; }
                .km-lembar { font-family:'Bookman Old Style','URW Bookman',Bookman,'DejaVu Serif',serif; color:#000; background:#fff; }
                .km-lembar.portrait { width:210mm; padding:12mm 14mm; }
                .km-lembar.landscape { width:297mm; padding:10mm 12mm; }
                .km-lembar + .km-lembar { margin-top:8mm; }
                @media print {
                    body { background:#fff; }
                    .km-lembar { margin:0 !important; box-shadow:none !important; page-break-after: always; }
                    .km-lembar:last-child { page-break-after:auto; }
                    .min-h-svh { min-height:0 !important; }
                }
            `}</style>

            <div className="space-y-2 p-4 md:p-6 print:hidden">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link href="/erpika/arep/kendali-mutu">
                        <Button variant="secondary" size="sm">
                            Kembali
                        </Button>
                    </Link>
                    <div className="flex flex-wrap gap-2">
                        <a href={`/erpika/arep/kendali-mutu/${data.penugasan_id}/excel?form=${q}`}>
                            <Button variant="outline" size="sm">
                                <FileSpreadsheet className="mr-1 h-4 w-4" /> Unduh Excel
                            </Button>
                        </a>
                        <a href={`/erpika/arep/kendali-mutu/${data.penugasan_id}/pdf?form=${q}`}>
                            <Button size="sm">Unduh PDF</Button>
                        </a>
                    </div>
                </div>
                <p className="text-muted-foreground text-sm">
                    {dipilih.length} formulir · {data.objek}
                </p>
            </div>

            <div className="bg-muted/40 pb-8 print:bg-white print:pb-0">
                {dipilih.map((meta) => (
                    <section key={meta.no} className={`km-lembar ${meta.orientasi} mx-auto max-w-full text-[11pt] leading-snug`}>
                        <FormulirKm d={data} meta={meta} />
                    </section>
                ))}
            </div>
        </AppLayout>
    );
}
