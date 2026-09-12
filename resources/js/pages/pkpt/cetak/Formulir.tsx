import type { KonteksPkpt } from '@/components/pkpt/pkpt-shell';
import { Button } from '@/components/ui/button';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { useState } from 'react';

interface Kolom {
    judul: string;
    /** Lebar relatif, dijumlahkan lalu dijadikan persen. */
    lebar: number;
    tengah?: boolean;
}

interface Kop {
    pemerintah: string;
    satuan_kerja: string;
    tahun_pkpt: number;
    tahun_dasar_risiko: number;
    status: string;
    nomor_keputusan: string | null;
    penyusun: string | null;
    penyusun_jabatan: string | null;
    penelaah: string | null;
    penelaah_jabatan: string | null;
    tempat: string;
}

interface Props extends KonteksPkpt {
    formulir: string;
    judul: string;
    kolom: Kolom[];
    baris: (string | number | null)[][];
    kop: Kop;
}

/** Huruf kolom a, b, ... z, aa, ab — sama dengan penomoran di Lampiran Keputusan. */
function hurufKolom(i: number): string {
    let hasil = '';
    let n = i + 1;
    while (n > 0) {
        const sisa = (n - 1) % 26;
        hasil = String.fromCharCode(97 + sisa) + hasil;
        n = Math.floor((n - 1) / 26);
    }
    return hasil;
}

/**
 * Satu komponen untuk keempat belas Formulir.
 *
 * Susunan kolomnya datang dari controller sebagai data, bukan ditulis ulang
 * di empat belas berkas React yang isinya nyaris sama. Yang menetapkan kolom
 * adalah Lampiran Keputusan Inspektur, jadi menaruhnya di satu tempat membuat
 * naskah dan aplikasi bisa dibandingkan baris demi baris.
 *
 * Cetaknya mengikuti preset Browsershot yang sudah berlaku: toolbar dibungkus
 * print:hidden, ukuran kertas F4 bentang dengan margin yang sama persis
 * dengan seksi Lampiran Keputusan, sehingga hasil cetak aplikasi bisa
 * disandingkan dengan naskahnya tanpa perbedaan lebar kolom.
 */
export default function Formulir({ formulir, judul, kolom, baris, kop, periode }: Props) {
    const [mengunduh, setMengunduh] = useState(false);
    const totalLebar = kolom.reduce((a, k) => a + k.lebar, 0) || 1;

    const unduh = () => {
        setMengunduh(true);
        window.location.href = `/pkpt/cetak/${formulir}/pdf?periode=${periode?.id ?? ''}`;
        window.setTimeout(() => setMengunduh(false), 4000);
    };

    return (
        <>
            <Head title={`${formulir.toUpperCase()} ${judul}`} />

            <style>{`
                @media print {
                    @page { size: 216mm 330mm landscape; margin: 22mm 20mm 22mm 25mm; }
                    body { background: #fff; }
                    .pkpt-cetak { font-size: 8pt; }
                    .pkpt-cetak thead { display: table-header-group; }
                    .pkpt-cetak tr { break-inside: avoid; }
                }
            `}</style>

            <div className="bg-background sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 print:hidden">
                <Button variant="ghost" size="sm" onClick={() => router.visit('/pkpt')}>
                    <ArrowLeft className="size-4" aria-hidden /> Kembali
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                        <Printer className="size-4" aria-hidden /> Cetak
                    </Button>
                    <Button size="sm" onClick={unduh} disabled={mengunduh}>
                        <Download className="size-4" aria-hidden /> {mengunduh ? 'Menyiapkan...' : 'Unduh PDF'}
                    </Button>
                </div>
            </div>

            <div className="pkpt-cetak mx-auto max-w-full bg-white p-6 text-black">
                <header className="mb-4 text-center">
                    <p className="text-sm font-bold uppercase">{kop.pemerintah}</p>
                    <p className="text-sm font-bold uppercase">{kop.satuan_kerja}</p>
                    <h1 className="mt-3 text-sm font-bold uppercase">
                        {formulir.toUpperCase()}. {judul}
                    </h1>
                    <p className="mt-1 text-xs">
                        Periode PKPT Tahun {kop.tahun_pkpt} - Dasar Risiko Tahun {kop.tahun_dasar_risiko}
                        {kop.nomor_keputusan ? ` - Keputusan Nomor ${kop.nomor_keputusan}` : ''}
                    </p>
                    {kop.status !== 'ditetapkan' ? <p className="mt-1 text-xs italic">Rancangan - belum ditetapkan</p> : null}
                </header>

                <div className="overflow-x-auto">
                    <table className="w-full table-fixed border-collapse text-[8pt]">
                        <colgroup>
                            {kolom.map((k, i) => (
                                <col key={i} style={{ width: `${(k.lebar / totalLebar) * 100}%` }} />
                            ))}
                        </colgroup>
                        <thead>
                            <tr>
                                {kolom.map((k, i) => (
                                    <th key={i} className="border border-black bg-neutral-200 px-1 py-1 text-center align-middle font-bold">
                                        {k.judul}
                                    </th>
                                ))}
                            </tr>
                            <tr>
                                {kolom.map((_, i) => (
                                    <th key={i} className="border border-black bg-neutral-100 px-1 py-0.5 text-center align-middle font-normal">
                                        {hurufKolom(i)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {baris.length === 0 ? (
                                <tr>
                                    <td colSpan={kolom.length} className="border border-black px-2 py-4 text-center italic">
                                        Belum ada data untuk formulir ini pada periode yang dipilih.
                                    </td>
                                </tr>
                            ) : (
                                baris.map((r, i) => (
                                    <tr key={i}>
                                        {r.map((sel, j) => (
                                            <td
                                                key={j}
                                                className={`border border-black px-1 py-0.5 align-top ${kolom[j]?.tengah ? 'text-center' : ''}`}
                                            >
                                                {sel ?? ''}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <footer className="mt-8 flex justify-between text-[9pt]">
                    <div>
                        <p>Disusun oleh,</p>
                        <p className="mt-12 font-bold underline">{kop.penyusun ?? '..............................'}</p>
                        <p>{kop.penyusun_jabatan ?? ''}</p>
                    </div>
                    <div className="text-right">
                        <p>{kop.tempat}, ..............................</p>
                        <p>Ditelaah oleh,</p>
                        <p className="mt-12 font-bold underline">{kop.penelaah ?? '..............................'}</p>
                        <p>{kop.penelaah_jabatan ?? ''}</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
