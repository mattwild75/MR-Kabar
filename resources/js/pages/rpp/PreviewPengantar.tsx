import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface Props {
    rpp: {
        id: number;
        nomor_rpp: string;
        tanggal: string;
        hal: string;
        tujuan: string;
        sebutan: string | null;
        dasar: string;
        dengan_penutup: boolean;
    };
    inspektur: { nama: string; nip_rapat: string; nip_spasi: string };
}

/**
 * Surat pengantar RPP — disalin dari Pengantar RPP*.doc Bagian Perencanaan:
 * kop Inspektorat (gambar dari berkas asli, supaya huruf Cooper Black-nya
 * sama di server mana pun), Nomor/Lampiran/Hal di kiri, tanggal dan tujuan di
 * kanan, tiga paragraf bernomor, tanda tangan Inspektur. Huruf isi Bookman
 * Old Style 12pt seperti aslinya; di server tanpa huruf itu jatuh ke URW
 * Bookman/serif.
 */
export default function RppPreviewPengantar({ rpp, inspektur }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'ERPIKA', href: '#' },
        { title: 'RPP Perencanaan', href: '/rpp' },
        { title: 'Pengantar ' + rpp.nomor_rpp, href: '#' },
    ];

    // "Penyampaian Rencana Penugasan" di baris pertama, sisanya baris kedua
    // bergaris bawah — persis pola berkas asli.
    const halBaris1 = 'Penyampaian Rencana';
    const halSisa = rpp.hal.replace(/^Penyampaian Rencana\s*/i, '');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Pengantar RPP ${rpp.nomor_rpp}`} />
            <style>{`
                @page { size: A4 portrait; margin: 12mm 12.5mm 20mm 24mm; }
                .surat { font-family: 'Bookman Old Style', 'URW Bookman', Bookman, 'DejaVu Serif', serif; font-size: 12pt; color: #000; line-height: 1.5; }
                .surat ol li { padding-left: 4mm; text-align: justify; line-height: 1.75; }
                @media print {
                    body { background: #fff; }
                    .surat { padding: 0 !important; margin: 0 !important; max-width: none !important; box-shadow: none !important; }
                    .min-h-svh { min-height: 0 !important; }
                }
            `}</style>

            <div className="space-y-4 p-4 md:p-6 print:hidden">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link href="/rpp">
                        <Button variant="secondary" size="sm">
                            Kembali
                        </Button>
                    </Link>
                    <div className="flex gap-2">
                        <Link href={`/rpp-cetak/${rpp.id}/tabel/preview`}>
                            <Button variant="outline" size="sm">
                                Tabel RPP
                            </Button>
                        </Link>
                        <a href={`/rpp-cetak/${rpp.id}/pengantar`}>
                            <Button size="sm">Unduh PDF</Button>
                        </a>
                    </div>
                </div>
            </div>

            <div className="surat mx-auto w-[210mm] max-w-full bg-white px-[12mm] py-[10mm] text-black print:w-auto">
                <img src="/images/erpika/kop-inspektorat.png" alt="Kop Inspektorat Kabupaten Aceh Barat" className="-mx-[6mm] mb-3 w-[calc(100%+12mm)] max-w-none" />

                <table className="w-full border-collapse">
                    <tbody className="align-top">
                        <tr>
                            <td className="w-[22mm] py-0.5">Nomor</td>
                            <td className="w-[4mm] py-0.5">:</td>
                            <td className="w-[62mm] py-0.5">{rpp.nomor_rpp}</td>
                            <td className="py-0.5 pl-2">Meulaboh, {rpp.tanggal}</td>
                        </tr>
                        <tr>
                            <td className="py-0.5">Lampiran</td>
                            <td className="py-0.5">:</td>
                            <td className="py-0.5">1 (satu) Berkas</td>
                            <td className="py-0.5 pl-2">Yang Terhormat</td>
                        </tr>
                        <tr>
                            <td className="py-0.5">Hal</td>
                            <td className="py-0.5">:</td>
                            <td className="py-0.5 leading-snug">
                                {halBaris1}
                                <br />
                                <span className="underline">{halSisa}.</span>
                            </td>
                            <td className="py-0.5 pl-2 leading-snug">
                                <span className="font-bold">{rpp.tujuan}</span>
                                <br />
                                &nbsp;&nbsp;di -
                                <br />
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="underline">Tempat</span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <ol className="mt-5 ml-[10mm] list-decimal space-y-3 pl-5">
                    <li>{rpp.dasar}</li>
                    <li>
                        Berkaitan hal tersebut diatas, disampaikan kepada Saudara tentang Rencana Penugasan {rpp.sebutan} (terlampir), dan untuk memenuhi
                        hal tersebut di atas diminta kepada Saudara untuk segera membuat dan menyampaikan Surat Tugas (ST) kepada kami, dengan
                        mempedomani PERMENPAN-RB Nomor 19 Tahun 2009 tentang Pedoman Kendali Mutu Audit Aparat Pengawasan Intern Pemerintah.
                    </li>
                    {rpp.dengan_penutup && <li>Demikian untuk dilaksanakan sebagaimana mestinya, terima kasih.</li>}
                </ol>

                <div className="mt-8 ml-auto w-[72mm] text-center leading-snug">
                    INSPEKTUR
                    <br />
                    KABUPATEN ACEH BARAT,
                    <div className="h-[22mm]" />
                    <div className="font-bold underline">{inspektur.nama.toUpperCase().replace(/\s+/g, ' ')}</div>
                    <div>NIP.{inspektur.nip_spasi}</div>
                </div>
            </div>
        </AppLayout>
    );
}
