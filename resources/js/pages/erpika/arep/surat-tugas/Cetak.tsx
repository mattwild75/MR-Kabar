import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { type ReactNode } from 'react';
import { KopSurat, TtdInspektur, type ArepData } from '@/pages/erpika/arep/forms/bagian';

interface Props {
    data: ArepData;
    dokumen: 'semua' | 'st' | 'sp' | 'pernyataan';
}

const breadcrumbs = (nomor: string): BreadcrumbItem[] => [
    { title: 'ERPIKA', href: '#' },
    { title: 'AREP', href: '#' },
    { title: 'Surat Tugas', href: '/erpika/arep/surat-tugas' },
    { title: nomor, href: '#' },
];

function Lembar({ children }: { children: ReactNode }) {
    return <section className="lembar mx-auto w-[210mm] max-w-full bg-white px-[20mm] py-[12mm] text-black">{children}</section>;
}

/** Surat Tugas — kop, nomor, tabel tim, uraian, tanda tangan Inspektur. */
function SuratTugas({ d }: { d: ArepData }) {
    return (
        <Lembar>
            <KopSurat kop={d.kop} />
            <div className="mt-3 text-center leading-tight">
                <div className="text-[13pt] font-bold underline">SURAT TUGAS</div>
                <div>Nomor : {d.nomor.st}</div>
            </div>
            <p className="mt-4">Inspektur Kabupaten Aceh Barat dengan ini menugaskan kepada:</p>
            <table className="mt-2 w-full border-collapse text-[11pt]">
                <thead>
                    <tr className="text-center font-bold">
                        <td className="border border-black px-1 py-1">NO</td>
                        <td className="border border-black px-2 py-1">NAMA / NIP</td>
                        <td className="border border-black px-2 py-1">JABATAN</td>
                        <td className="border border-black px-2 py-1">PERAN DALAM TIM</td>
                    </tr>
                </thead>
                <tbody className="align-top">
                    {d.tim.map((m) => (
                        <tr key={m.no}>
                            <td className="border border-black px-1 py-1 text-center">{m.no}.</td>
                            <td className="border border-black px-2 py-1">
                                <div>{m.nama}</div>
                                <div className="text-[9pt]">NIP. {m.nip_spasi}</div>
                            </td>
                            <td className="border border-black px-2 py-1">{m.jabatan}</td>
                            <td className="border border-black px-2 py-1">{m.peran}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-4 space-y-2 text-justify leading-relaxed">
                <p>
                    Untuk melakukan penugasan {d.jenis.kata_kerja} pada {d.objek}.
                </p>
                <p>
                    Kegiatan tersebut akan dilaksanakan selama {d.jangka.hari_kerja} ({d.jangka.hari_kerja_terbilang}) hari
                    kerja, terhitung mulai tanggal {d.jangka.rentang}.
                </p>
                <p>Penugasan ini agar dilaksanakan dengan sebaik-baiknya dan penuh tanggung jawab.</p>
            </div>
            <TtdInspektur d={d} />
        </Lembar>
    );
}

/** Surat Pengantar / Penyampaian (SP). */
function SuratPengantar({ d }: { d: ArepData }) {
    return (
        <Lembar>
            <KopSurat kop={d.kop} />
            <table className="mt-3 w-full border-collapse leading-snug">
                <tbody className="align-top">
                    <tr>
                        <td className="w-[22mm] py-0.5">Nomor</td>
                        <td className="w-[4mm] py-0.5">:</td>
                        <td className="w-[70mm] py-0.5">{d.nomor.sp}</td>
                        <td className="py-0.5 pl-2">Meulaboh, {d.tanggal.surat}</td>
                    </tr>
                    <tr>
                        <td className="py-0.5">Lampiran</td>
                        <td className="py-0.5">:</td>
                        <td className="py-0.5">1 (satu) lembar</td>
                        <td className="py-0.5 pl-2 align-top" rowSpan={2}>
                            Kepada Yth,
                            <br />
                            <span className="font-bold">Pimpinan {d.objek}</span>
                            <br />
                            di -
                            <br />
                            &nbsp;&nbsp;&nbsp;&nbsp;<span className="underline">Tempat</span>
                        </td>
                    </tr>
                    <tr>
                        <td className="py-0.5">Hal</td>
                        <td className="py-0.5">:</td>
                        <td className="py-0.5">
                            <span className="underline">Pelaksanaan {d.jenis.sebutan}</span>
                        </td>
                    </tr>
                </tbody>
            </table>

            <p className="mt-4">Berdasarkan :</p>
            <ol className="ml-[10mm] list-decimal space-y-1 pl-4 text-justify">
                {d.dasar_hukum.map((t, i) => (
                    <li key={i}>{t}</li>
                ))}
            </ol>
            <div className="mt-3 space-y-2 text-justify leading-relaxed">
                <p>
                    Kami akan melaksanakan penugasan {d.jenis.kata_kerja} pada {d.objek}, untuk itu kami menugaskan Tim
                    sebagaimana Surat Tugas terlampir.
                </p>
                <p>
                    Biaya terkait penugasan ini menjadi beban dalam Dokumen Pelaksanaan Anggaran Inspektorat Kabupaten Aceh
                    Barat Tahun Anggaran {d.rpp.tahun ?? ''}.
                </p>
                <p>Kami harap agar Saudara tidak memberikan gratifikasi dalam bentuk apapun kepada Tim.</p>
                <p>Atas perhatian dan kerjasama yang baik, kami ucapkan terima kasih.</p>
            </div>
            <TtdInspektur d={d} />
            <div className="mt-6 text-[10pt] leading-snug">
                Tembusan :
                <ol className="list-decimal pl-5">
                    <li>Bupati Aceh Barat di Meulaboh (sebagai laporan);</li>
                    <li>Kepala BPKD Kabupaten Aceh Barat;</li>
                    <li>Pertinggal.</li>
                </ol>
            </div>
        </Lembar>
    );
}

const PERNYATAAN = [
    'Bekerja secara profesional, penuh semangat dan menjunjung tinggi integritas, konsisten serta bertanggung jawab.',
    'Mengutamakan kepentingan Negara di atas segala kepentingan lainnya.',
    'Tidak menyalahgunakan kewenangan jabatan baik langsung maupun tidak langsung untuk kepentingan pribadi, kelompok maupun golongan tertentu.',
    'Menjaga martabat dan menghindari diri dari perbuatan tercela.',
    'Tidak menerima segala pemberian dalam bentuk apapun baik langsung maupun tidak langsung yang menyebabkan kewajiban kami menjadi bertentangan dengan pelaksanaan tugas.',
    'Menjadi teladan dalam pemberantasan korupsi, kolusi dan nepotisme (KKN).',
    'Menjaga rahasia negara sesuai ketentuan yang berlaku.',
];

/** Pernyataan Independensi dan Integritas + tanda tangan tiap anggota tim. */
function Pernyataan({ d }: { d: ArepData }) {
    const penanda: { label: string; nama: string }[] = [];
    if (d.pj.nama) penanda.push({ label: 'Penanggung Jawab', nama: d.pj.nama });
    if (d.wpj.nama) penanda.push({ label: 'Wakil Penanggung Jawab', nama: d.wpj.nama });
    if (d.dalnis.nama) penanda.push({ label: 'Pengendali Teknis', nama: d.dalnis.nama });
    if (d.kt.nama) penanda.push({ label: 'Ketua Tim', nama: d.kt.nama });
    d.anggota.forEach((a) => a.nama && penanda.push({ label: 'Anggota Tim', nama: a.nama }));

    return (
        <Lembar>
            <KopSurat kop={d.kop} />
            <div className="mt-3 text-center text-[13pt] font-bold underline">PERNYATAAN INDEPENDENSI DAN INTEGRITAS</div>
            <p className="mt-4 text-justify leading-relaxed">
                Berdasarkan Surat Tugas Inspektur Kabupaten Aceh Barat Nomor: {d.nomor.st} Tanggal {d.tanggal.st} tentang{' '}
                {d.jenis.kata_kerja} pada {d.objek}, kami yang bertandatangan di bawah ini menyatakan bahwa kami tidak
                mempunyai hubungan kekerabatan, usaha, dan tidak terdapat benturan kepentingan dalam melaksanakan tugas
                tersebut.
            </p>
            <p className="mt-2">Dalam melaksanakan tugas sebagaimana disebutkan di atas, kami menyatakan:</p>
            <ol className="ml-[8mm] list-decimal space-y-1 pl-4 text-justify">
                {PERNYATAAN.map((t, i) => (
                    <li key={i}>{t}</li>
                ))}
            </ol>
            <p className="mt-2">Demikian pernyataan ini kami buat untuk dapat dipergunakan seperlunya.</p>

            <table className="mt-6 w-full border-collapse">
                <tbody className="align-top">
                    {penanda.map((p, i) => (
                        <tr key={i}>
                            <td className="w-[8mm] py-1">{i + 1}.</td>
                            <td className="w-[52mm] py-1">{p.label}</td>
                            <td className="w-[4mm] py-1">:</td>
                            <td className="py-1 font-medium">{p.nama}</td>
                            <td className="py-1 text-center">(............................)</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Lembar>
    );
}

export default function SuratTugasCetak({ data, dokumen }: Props) {
    const tampil = (k: Props['dokumen']) => dokumen === 'semua' || dokumen === k;

    return (
        <AppLayout breadcrumbs={breadcrumbs(data.nomor.st)}>
            <Head title={`Surat Tugas ${data.nomor.st}`} />
            <style>{`
                @page { size: A4 portrait; margin: 0; }
                .lembar { font-family: 'Bookman Old Style','URW Bookman',Bookman,'DejaVu Serif',serif; font-size: 12pt; line-height: 1.5; }
                .lembar + .lembar { margin-top: 8mm; }
                @media print {
                    body { background:#fff; }
                    .lembar { margin:0 !important; box-shadow:none !important; page-break-after: always; }
                    .lembar:last-child { page-break-after: auto; }
                    .min-h-svh { min-height:0 !important; }
                }
            `}</style>

            <div className="space-y-3 p-4 md:p-6 print:hidden">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link href="/erpika/arep/surat-tugas">
                        <Button variant="secondary" size="sm">
                            Kembali
                        </Button>
                    </Link>
                    <div className="flex flex-wrap gap-2">
                        <a href={`/erpika/arep/surat-tugas/${data.penugasan_id}/word?dok=${dokumen}`}>
                            <Button variant="outline" size="sm">
                                <FileText className="mr-1 h-4 w-4" /> Unduh Word
                            </Button>
                        </a>
                        <a href={`/erpika/arep/surat-tugas/${data.penugasan_id}/pdf?dok=${dokumen}`}>
                            <Button size="sm">Unduh PDF</Button>
                        </a>
                    </div>
                </div>
            </div>

            <div className="bg-muted/40 pb-8 print:bg-white print:pb-0">
                {tampil('st') && <SuratTugas d={data} />}
                {tampil('sp') && <SuratPengantar d={data} />}
                {tampil('pernyataan') && <Pernyataan d={data} />}
            </div>
        </AppLayout>
    );
}
