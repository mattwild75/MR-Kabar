import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface Category {
    id: number;
    name: string;
}

interface Rpp {
    id: number;
    year: number;
    nomor_rpp: string;
    tanggal_rpp: string | null;
    uraian: string | null;
    surat_dasar_uraian: string | null;
    category: Category;
}

interface Setting {
    inspektur: { nama: string; nip: string | null } | null;
}

interface Props {
    rpp: Rpp;
    setting: Setting;
}

function formatTanggal(d: string | null) {
    if (!d) return '............';
    return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function RppPreviewPengantar({ rpp, setting }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Perencanaan', href: '#' },
        { title: 'Cetak RPP', href: '/rpp-cetak' },
        { title: 'Preview Pengantar', href: '#' },
    ];

    const dasarUraian = rpp.surat_dasar_uraian || `Program Kerja Pengawasan Tahunan ${rpp.year} Tentang ${rpp.uraian ?? ''}.`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Preview Pengantar RPP ${rpp.nomor_rpp}`} />
            <style>{`
        @media print {
          @page { size: A4 portrait; margin: 20mm; }
          body { background: white; }
        }
      `}</style>

            <div className="space-y-4 p-4 md:p-6 print:hidden">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link href="/rpp-cetak">
                        <Button variant="secondary" size="sm">
                            Kembali
                        </Button>
                    </Link>
                    <a href={`/rpp-cetak/${rpp.id}/pengantar`}>
                        <Button size="sm">Unduh PDF</Button>
                    </a>
                </div>
            </div>

            <div className="rpp-print-sheet mx-auto max-w-[800px] bg-white p-10 text-sm leading-relaxed text-black print:m-0 print:max-w-none print:p-0 print:shadow-none">
                <table className="mb-5 w-full">
                    <tbody>
                        <tr>
                            <td className="w-1/2 align-top">
                                Nomor : {rpp.nomor_rpp}
                                <br />
                                Lampiran : 1 (satu) Berkas
                                <br />
                                Hal : Penyampaian Rencana Penugasan
                                <br />
                                &nbsp;&nbsp;&nbsp;&nbsp;{rpp.category.name} Tahun {rpp.year}.
                            </td>
                            <td className="w-1/2 align-top">
                                Meulaboh, {formatTanggal(rpp.tanggal_rpp)}
                                <br />
                                <br />
                                Yang Terhormat
                                <br />
                                Ketua Tim {rpp.category.name}
                                <br />
                                di -<br />
                                &nbsp;&nbsp;&nbsp;&nbsp;Tempat
                            </td>
                        </tr>
                    </tbody>
                </table>

                <ol className="list-decimal space-y-3 pl-5 text-justify">
                    <li>Berdasarkan {dasarUraian}</li>
                    <li>
                        Berkaitan hal tersebut diatas, disampaikan kepada Saudara tentang Rencana Penugasan {rpp.category.name} (terlampir), dan untuk
                        memenuhi hal tersebut di atas diminta kepada Saudara untuk segera membuat dan menyampaikan Surat Tugas (ST) kepada kami,
                        dengan mempedomani PERMENPAN-RB Nomor 19 Tahun 2009 tentang Pedoman Kendali Mutu Audit Aparat Pengawasan Intern Pemerintah.
                    </li>
                    <li>Demikian untuk dilaksanakan sebagaimana mestinya, terima kasih.</li>
                </ol>

                <div className="mt-10 text-center">
                    INSPEKTUR
                    <br />
                    KABUPATEN ACEH BARAT,
                    <br />
                    <br />
                    <br />
                    <br />
                    <strong>{(setting.inspektur?.nama ?? '............').toUpperCase()}</strong>
                    <br />
                    NIP. {setting.inspektur?.nip ?? '............'}
                </div>
            </div>
        </AppLayout>
    );
}
