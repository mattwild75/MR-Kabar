import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { FileText } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'ERPIKA', href: '#' },
    { title: 'AREP', href: '#' },
    { title: 'Kendali Mutu', href: '/erpika/arep/kendali-mutu' },
    { title: 'Keputusan Inspektur', href: '#' },
];

const MENGINGAT = [
    'Undang-Undang Nomor 15 Tahun 2004 tentang Pemeriksaan Pengelolaan dan Tanggung Jawab Keuangan Negara;',
    'Undang-Undang Nomor 23 Tahun 2014 tentang Pemerintahan Daerah sebagaimana telah beberapa kali diubah;',
    'Peraturan Pemerintah Nomor 60 Tahun 2008 tentang Sistem Pengendalian Intern Pemerintah;',
    'Peraturan Pemerintah Nomor 12 Tahun 2017 tentang Pembinaan dan Pengawasan Penyelenggaraan Pemerintahan Daerah;',
    'Peraturan Menteri Negara Pendayagunaan Aparatur Negara dan Reformasi Birokrasi Nomor 19 Tahun 2009 tentang Pedoman Kendali Mutu Audit Aparat Pengawasan Intern Pemerintah;',
    'Peraturan Bupati Aceh Barat Nomor 17 Tahun 2024 tentang Kedudukan, Susunan Organisasi, Tugas, Fungsi dan Tata Kerja Inspektorat Kabupaten Aceh Barat.',
];

const DIKTUM: [string, string][] = [
    ['KESATU', 'Pedoman Kendali Mutu Audit Inspektorat Kabupaten Aceh Barat sebagaimana terlampir dalam Lampiran yang merupakan bagian yang tidak terpisahkan dari Keputusan ini;'],
    ['KEDUA', 'Pedoman sebagaimana dimaksud pada diktum KESATU wajib dipergunakan sebagai acuan bagi seluruh Auditor, P2UPD, dan Auditor Kepegawaian di lingkungan Inspektorat Kabupaten Aceh Barat guna memastikan bahwa audit dilaksanakan sesuai dengan Kode Etik APIP dan Standar Audit APIP;'],
    ['KETIGA', 'Keputusan ini mulai berlaku sejak tanggal ditetapkan, dengan ketentuan apabila di kemudian hari terdapat kekeliruan akan diadakan perbaikan seperlunya.'],
];

interface Props {
    inspektur?: { nama: string; nip_spasi: string };
}

export default function Keputusan({ inspektur }: Props) {
    const tahun = new Date().getFullYear();
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Keputusan Inspektur — Pedoman Kendali Mutu" />
            <style>{`
                @page { size: A4 portrait; margin: 0; }
                .kep { font-family:'Bookman Old Style','URW Bookman',Bookman,'DejaVu Serif',serif; font-size:12pt; line-height:1.5; color:#000; }
                @media print { body{background:#fff;} .kep{margin:0!important;box-shadow:none!important;} .min-h-svh{min-height:0!important;} }
            `}</style>

            <div className="flex flex-wrap items-center justify-between gap-2 p-4 md:p-6 print:hidden">
                <Link href="/erpika/arep/kendali-mutu">
                    <Button variant="secondary" size="sm">
                        Kembali
                    </Button>
                </Link>
                <div className="flex gap-2">
                    <a href="/erpika/arep/kendali-mutu/keputusan/word">
                        <Button variant="outline" size="sm">
                            <FileText className="mr-1 h-4 w-4" /> Unduh Word
                        </Button>
                    </a>
                    <a href="/erpika/arep/kendali-mutu/keputusan/pdf">
                        <Button size="sm">Unduh PDF</Button>
                    </a>
                </div>
            </div>

            <div className="bg-muted/40 pb-8 print:bg-white print:pb-0">
                <div className="kep mx-auto w-[210mm] max-w-full bg-white px-[24mm] py-[16mm]">
                    <img src="/images/erpika/kop-inspektorat.png" alt="Kop Inspektorat" className="mx-auto w-full" />
                    <div className="mt-4 text-center leading-tight">
                        <div className="text-[13pt] font-bold">KEPUTUSAN INSPEKTUR KABUPATEN ACEH BARAT</div>
                        <div>NOMOR : ......../......../INS/{tahun}</div>
                        <div className="mt-3 font-bold">TENTANG</div>
                        <div className="font-bold">PEDOMAN KENDALI MUTU AUDIT INSPEKTORAT KABUPATEN ACEH BARAT</div>
                        <div className="mt-3 font-bold">INSPEKTUR KABUPATEN ACEH BARAT,</div>
                    </div>

                    <div className="mt-4 space-y-1 text-justify">
                        <div className="flex gap-2">
                            <div className="w-[24mm] shrink-0">Menimbang</div>
                            <div className="w-[4mm] shrink-0">:</div>
                            <div className="flex-1 space-y-1">
                                <div className="flex gap-2">
                                    <div className="w-[5mm] shrink-0">a.</div>
                                    <div>
                                        bahwa pengawasan intern terhadap penyelenggaraan Pemerintahan Kabupaten Aceh Barat
                                        merupakan salah satu unsur manajemen pemerintahan daerah yang penting dalam rangka
                                        mewujudkan kepemerintahan yang baik;
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-[5mm] shrink-0">b.</div>
                                    <div>
                                        bahwa untuk mewujudkan pengawasan yang berkualitas sesuai dengan mandat dan standar
                                        audit, diperlukan sistem pengendalian mutu audit;
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-[5mm] shrink-0">c.</div>
                                    <div>
                                        bahwa untuk maksud tersebut perlu menetapkan Pedoman Kendali Mutu Audit Inspektorat
                                        Kabupaten Aceh Barat dengan Keputusan Inspektur.
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-[24mm] shrink-0">Mengingat</div>
                            <div className="w-[4mm] shrink-0">:</div>
                            <ol className="flex-1 list-decimal space-y-1 pl-4">
                                {MENGINGAT.map((t, i) => (
                                    <li key={i}>{t}</li>
                                ))}
                            </ol>
                        </div>
                    </div>

                    <div className="mt-4 text-center font-bold">MEMUTUSKAN :</div>
                    <div className="mt-3 space-y-2 text-justify">
                        <div className="flex gap-2">
                            <div className="w-[26mm] shrink-0">Menetapkan</div>
                            <div className="w-[4mm] shrink-0">:</div>
                            <div className="flex-1" />
                        </div>
                        {DIKTUM.map(([k, v]) => (
                            <div className="flex gap-2" key={k}>
                                <div className="w-[26mm] shrink-0 font-semibold">{k}</div>
                                <div className="w-[4mm] shrink-0">:</div>
                                <div className="flex-1">{v}</div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 ml-auto w-[80mm] text-center leading-snug">
                        <div>Ditetapkan di Meulaboh</div>
                        <div>pada tanggal ...................... {tahun}</div>
                        <div>INSPEKTUR KABUPATEN ACEH BARAT,</div>
                        <div className="h-[22mm]" />
                        <div className="font-bold underline">{inspektur?.nama ?? '............................'}</div>
                        <div>NIP. {inspektur?.nip_spasi ?? '............................'}</div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
