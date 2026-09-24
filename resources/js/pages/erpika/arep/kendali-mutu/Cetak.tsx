import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { FileSpreadsheet } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { muatSatuHalaman, type ArepData } from '@/pages/erpika/arep/forms/bagian';
import { FormulirKm, type KmMeta } from '@/pages/erpika/arep/forms/km';
import { type Spek } from '@/pages/erpika/arep/forms/spek';
import { SuntingBar } from '@/pages/erpika/arep/forms/sunting';

interface Props {
    data?: ArepData;
    katalog: KmMeta[];
    forms: number[];
    spek?: Record<number, Spek>;
    mulaiSunting?: boolean;
    suntingan?: string;
}

const breadcrumbs = (nomor: string): BreadcrumbItem[] => [
    { title: 'ERPIKA', href: '#' },
    { title: 'AREP', href: '#' },
    { title: 'Kendali Mutu', href: '/erpika/arep/kendali-mutu' },
    { title: nomor, href: '#' },
];

/**
 * Ukuran kertas dari CSS (PdfPrintService::ukuranDariCss). Satu orientasi:
 * @page biasa. Orientasi campuran (cetak semua): halaman bernama per lembar,
 * dan <body> memakai nama halaman lembar terakhir — kembali ke halaman tak
 * bernama sesudah lembar terakhir membuat Chromium menambah halaman kosong.
 */
const gaya = (landscape: boolean, campur = false, akhirLanskap = false) => `
    @page { size: A4 ${landscape ? 'landscape' : 'portrait'}; margin: 0; }
    ${
        campur
            ? `@page tegak { size: A4 portrait; margin: 0; }
    @page lanskap { size: A4 landscape; margin: 0; }
    .km-lembar.portrait { page: tegak; }
    .km-lembar.landscape { page: lanskap; }
    @media print { body { page: ${akhirLanskap ? 'lanskap' : 'tegak'}; } }`
            : ''
    }
    .km-lembar { font-family:'Bookman Old Style','URW Bookman',Bookman,'DejaVu Serif',serif; color:#000; background:#fff; }
    .km-lembar.portrait { width:210mm; padding:12mm 14mm; }
    .km-lembar.landscape { width:297mm; padding:10mm 12mm; }
    .km-lembar + .km-lembar { margin-top:8mm; }
    [contenteditable="true"] .km-lembar { outline: 2px dashed #2563eb; outline-offset: 4px; }
    @media print {
        body { background:#fff; }
        .km-lembar { margin:0 !important; box-shadow:none !important; page-break-after: always; }
        .km-lembar:last-child { page-break-after:auto; }
        .min-h-svh { min-height:0 !important; }
    }
`;

export default function KendaliMutuCetak({ data, katalog, forms, spek = {}, mulaiSunting, suntingan }: Props) {
    const [sunting, setSunting] = useState(!!mulaiSunting);
    const isi = useRef<HTMLDivElement>(null);
    const akarSuntingan = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        muatSatuHalaman(isi.current, '.km-lembar');
        muatSatuHalaman(akarSuntingan.current, '.km-lembar');
    });
    const dipilih = forms
        .map((no) => katalog.find((k) => k.no === no))
        .filter((m): m is KmMeta => !!m);
    const semuaLandscape = dipilih.length > 0 && dipilih.every((m) => m.orientasi === 'landscape');

    const q = forms.join(',');

    // Jalur render PDF suntingan.
    if (suntingan) {
        const ls = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('ls') === '1';
        const campurS = suntingan.includes('km-lembar landscape') && suntingan.includes('km-lembar portrait');
        const akhirL = suntingan.lastIndexOf('km-lembar landscape') > suntingan.lastIndexOf('km-lembar portrait');
        return (
            <>
                <Head title="Kendali Mutu" />
                <style>{gaya(ls, true, campurS ? akhirL : ls)}</style>
                <div ref={akarSuntingan} className="bg-white" dangerouslySetInnerHTML={{ __html: suntingan }} />
            </>
        );
    }
    if (!data) return null;

    return (
        <AppLayout breadcrumbs={breadcrumbs(data.nomor.st)}>
            <Head title={`Kendali Mutu ${data.nomor.st}`} />
            <style>{gaya(semuaLandscape, true, dipilih[dipilih.length - 1]?.orientasi === 'landscape')}</style>

            <div className="space-y-2 p-4 md:p-6 print:hidden">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link href="/erpika/arep/kendali-mutu">
                        <Button variant="secondary" size="sm">
                            Kembali
                        </Button>
                    </Link>
                    <div className="flex flex-wrap items-center gap-2">
                        {!sunting && (
                            <>
                                <a href={`/erpika/arep/kendali-mutu/${data.penugasan_id}/excel?form=${q}`}>
                                    <Button variant="outline" size="sm">
                                        <FileSpreadsheet className="mr-1 h-4 w-4" /> Unduh Excel
                                    </Button>
                                </a>
                                <a href={`/erpika/arep/kendali-mutu/${data.penugasan_id}/pdf?form=${q}`}>
                                    <Button size="sm">Unduh PDF</Button>
                                </a>
                            </>
                        )}
                        <SuntingBar
                            contentRef={isi}
                            sunting={sunting}
                            setSunting={setSunting}
                            pdfUrl={`/erpika/arep/kendali-mutu/${data.penugasan_id}/pdf-suntingan`}
                            excelUrl={`/erpika/arep/kendali-mutu/${data.penugasan_id}/excel-suntingan`}
                            filename={`Kendali-Mutu-${data.nomor.st.replace(/[^A-Za-z0-9]+/g, '-')}`}
                            body={{ landscape: semuaLandscape }}
                        />
                    </div>
                </div>
                <p className="text-muted-foreground text-sm">
                    {sunting
                        ? 'Mode sunting: klik teks lalu ketik seperti di Word (Ctrl+B/I/U). Suntingan hanya untuk berkas yang diunduh — data RPP tidak berubah.'
                        : `${dipilih.length} formulir · ${data.objek}`}
                </p>
            </div>

            <div
                ref={isi}
                contentEditable={sunting}
                suppressContentEditableWarning
                className="bg-muted/40 pb-8 print:bg-white print:pb-0"
            >
                {dipilih.map((meta) => (
                    <section key={meta.no} className={`km-lembar ${meta.orientasi} mx-auto max-w-full text-[11pt] leading-snug`}>
                        <FormulirKm d={data} meta={meta} spek={spek[meta.no]} />
                    </section>
                ))}
            </div>
        </AppLayout>
    );
}
