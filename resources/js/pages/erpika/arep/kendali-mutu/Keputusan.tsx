import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { Fragment } from 'react';

type Butir = string | [string, string[]];
type Isi = string | { angka?: Butir[]; huruf?: Butir[]; butir?: Butir[]; tabel?: [string[], string[][]] };

interface Pedoman {
    keputusan: {
        judul: string;
        menimbang: string[];
        mengingat: string[];
        memperhatikan: string[];
        diktum: [string, string][];
    };
    bab: { nomor: string; judul: string; bagian: { judul: string; isi: Isi[] }[] }[];
    formulir: [string, string, string][];
}

interface Props {
    pedoman: Pedoman;
    inspektur?: { nama: string; nip_spasi: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'ERPIKA', href: '#' },
    { title: 'AREP', href: '#' },
    { title: 'Kendali Mutu', href: '/erpika/arep/kendali-mutu' },
    { title: 'Keputusan Inspektur', href: '#' },
];

const huruf = (i: number) => String.fromCharCode(97 + i);

/** Baris dasar hukum: "Menimbang : a. ..." dengan label hanya di baris pertama. */
function Dasar({ label, butir, jenis }: { label: string; butir: string[]; jenis: 'huruf' | 'angka' }) {
    return (
        <table className="mt-2 w-full border-collapse">
            <tbody>
                {butir.map((b, i) => (
                    <tr key={i} className="align-top">
                        <td className="w-[28mm]">{i === 0 ? label : ''}</td>
                        <td className="w-[4mm]">{i === 0 ? ':' : ''}</td>
                        <td className="w-[7mm]">{jenis === 'huruf' ? huruf(i) + '.' : i + 1 + '.'}</td>
                        <td className="pb-1 text-justify">{b}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function Daftar({ isi }: { isi: Exclude<Isi, string> }) {
    if (isi.tabel) {
        const [kepala, baris] = isi.tabel;
        return (
            <table className="my-2 w-full border-collapse text-[10.5pt]">
                <thead>
                    <tr>
                        {kepala.map((h) => (
                            <th key={h} className="border border-black bg-neutral-100 px-2 py-1">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {baris.map((r, i) => (
                        <tr key={i} className="align-top">
                            {r.map((v, j) => (
                                <td key={j} className="border border-black px-2 py-1">
                                    {v}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }
    const jenis = isi.angka ? 'angka' : isi.huruf ? 'huruf' : 'butir';
    const butir = (isi.angka ?? isi.huruf ?? isi.butir ?? []) as Butir[];
    return (
        <div className="my-1 space-y-1">
            {butir.map((b, i) => {
                const [teks, sub] = Array.isArray(b) ? b : [b, []];
                return (
                    <Fragment key={i}>
                        <div className="flex gap-2 pl-[8mm] text-justify">
                            <div className="w-[6mm] shrink-0">{jenis === 'angka' ? i + 1 + '.' : jenis === 'huruf' ? huruf(i) + '.' : '•'}</div>
                            <div>{teks}</div>
                        </div>
                        {sub.map((s, j) => (
                            <div key={j} className="flex gap-2 pl-[16mm] text-justify">
                                <div className="w-[6mm] shrink-0">{huruf(j)}.</div>
                                <div>{s}</div>
                            </div>
                        ))}
                    </Fragment>
                );
            })}
        </div>
    );
}

function Ttd({ tahun, inspektur, lengkap = true }: { tahun: number; inspektur?: Props['inspektur']; lengkap?: boolean }) {
    return (
        <div className="mt-8 ml-auto w-[80mm] text-center leading-snug" style={{ breakInside: 'avoid' }}>
            {lengkap && (
                <>
                    <div>Ditetapkan di Meulaboh</div>
                    <div>pada tanggal .................... {tahun}</div>
                    <div className="h-3" />
                </>
            )}
            <div>INSPEKTUR KABUPATEN ACEH BARAT,</div>
            <div className="h-[22mm]" />
            <div className="font-bold underline">{(inspektur?.nama ?? '............................').toUpperCase()}</div>
            <div>NIP. {inspektur?.nip_spasi ?? '............................'}</div>
        </div>
    );
}

export default function Keputusan({ pedoman, inspektur }: Props) {
    const tahun = new Date().getFullYear();
    const k = pedoman.keputusan;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Keputusan Inspektur — Pedoman Kendali Mutu" />
            <style>{`
                @page { size: A4 portrait; margin: 18mm 20mm 18mm 25mm; }
                .kep { font-family:'Bookman Old Style','URW Bookman',Bookman,'DejaVu Serif',serif; font-size:11.5pt; line-height:1.5; color:#000; }
                .kep h3 { break-after: avoid; }
                @media print {
                    body{background:#fff;}
                    .kep{margin:0!important;padding:0!important;box-shadow:none!important;width:auto!important;}
                    .kep-lampiran{break-before:page;}
                    .min-h-svh{min-height:0!important;}
                }
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
                <div className="kep mx-auto w-[210mm] max-w-full bg-white px-[25mm] py-[18mm]">
                    <img src="/images/erpika/kop-inspektorat.png" alt="Kop Inspektorat" className="mx-auto w-full" />
                    <div className="mt-4 text-center leading-tight">
                        <div className="font-bold">KEPUTUSAN INSPEKTUR KABUPATEN ACEH BARAT</div>
                        <div>NOMOR : ......../......../INS/{tahun}</div>
                        <div className="mt-3 font-bold">TENTANG</div>
                        <div className="font-bold">{k.judul}</div>
                        <div className="mt-3 font-bold">INSPEKTUR KABUPATEN ACEH BARAT,</div>
                    </div>
                    <Dasar label="Menimbang" butir={k.menimbang} jenis="huruf" />
                    <Dasar label="Mengingat" butir={k.mengingat} jenis="angka" />
                    <Dasar label="Memperhatikan" butir={k.memperhatikan} jenis="angka" />
                    <div className="mt-4 text-center font-bold">MEMUTUSKAN :</div>
                    <table className="mt-2 w-full border-collapse">
                        <tbody>
                            <tr className="align-top">
                                <td className="w-[28mm]">Menetapkan</td>
                                <td className="w-[4mm]">:</td>
                                <td className="pb-2 font-bold">KEPUTUSAN INSPEKTUR TENTANG {k.judul}.</td>
                            </tr>
                            {k.diktum.map(([d, isi]) => (
                                <tr key={d} className="align-top">
                                    <td className="font-bold">{d}</td>
                                    <td>:</td>
                                    <td className="pb-2 text-justify">{isi}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Ttd tahun={tahun} inspektur={inspektur} />

                    {/* LAMPIRAN */}
                    <div className="kep-lampiran mt-16 print:mt-0">
                        <table className="ml-auto w-[95mm] text-[10pt] leading-snug">
                            <tbody>
                                <tr>
                                    <td colSpan={3}>LAMPIRAN</td>
                                </tr>
                                <tr>
                                    <td colSpan={3}>KEPUTUSAN INSPEKTUR KABUPATEN ACEH BARAT</td>
                                </tr>
                                <tr>
                                    <td className="w-[18mm]">NOMOR</td>
                                    <td className="w-[3mm]">:</td>
                                    <td>......../......../INS/{tahun}</td>
                                </tr>
                                <tr>
                                    <td>TANGGAL</td>
                                    <td>:</td>
                                    <td>.................... {tahun}</td>
                                </tr>
                                <tr className="align-top">
                                    <td>TENTANG</td>
                                    <td>:</td>
                                    <td>{k.judul}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="mt-6 text-center text-[12.5pt] font-bold">{k.judul}</div>
                        {pedoman.bab.map((b) => (
                            <section key={b.nomor} className="mt-6">
                                <h3 className="text-center leading-tight font-bold">
                                    {b.nomor}
                                    <br />
                                    {b.judul}
                                </h3>
                                {b.bagian.map((bg, i) => (
                                    <div key={i} className="mt-3">
                                        {bg.judul && <h3 className="font-bold">{bg.judul}</h3>}
                                        {bg.isi.map((x, j) =>
                                            typeof x === 'string' ? (
                                                <p key={j} className="mt-1 indent-[10mm] text-justify">
                                                    {x}
                                                </p>
                                            ) : (
                                                <Daftar key={j} isi={x} />
                                            ),
                                        )}
                                    </div>
                                ))}
                            </section>
                        ))}
                        <section className="mt-8">
                            <h3 className="text-center font-bold">DAFTAR FORMULIR KENDALI MUTU</h3>
                            <table className="mt-3 w-full border-collapse text-[10pt]">
                                <thead>
                                    <tr>
                                        {['No', 'Kode', 'Nama Formulir', 'Tahapan'].map((h) => (
                                            <th key={h} className="border border-black bg-neutral-100 px-2 py-1">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {pedoman.formulir.map(([kode, nama, tahap], i) => (
                                        <tr key={kode}>
                                            <td className="border border-black px-2 text-center">{i + 1}.</td>
                                            <td className="border border-black px-2">{kode}</td>
                                            <td className="border border-black px-2">{nama}</td>
                                            <td className="border border-black px-2">{tahap}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p className="mt-2 text-[10pt] italic">
                                Bentuk setiap formulir diterbitkan melalui aplikasi ERPIKA menu AREP &gt; Kendali Mutu (PDF dan Excel), satu
                                lembar per formulir.
                            </p>
                        </section>
                        <Ttd tahun={tahun} inspektur={inspektur} lengkap={false} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
