import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Fragment } from 'react';

interface Anggota {
    no: number;
    nama: string;
    nip: string | null;
    pangkat: string | null;
    golongan: string | null;
    peran: string;
    dk: number;
    lk: number;
}

interface Penugasan {
    urutan: number;
    uraian: string | null;
    obriks: string[];
    sifat: string | null;
    jumlah_laporan: number | null;
    tmt: string | null;
    tim: Anggota[];
}

interface Props {
    rpp: {
        id: number;
        nomor_rpp: string;
        judul: string;
        sub_judul: string;
        tanggal: string;
        jenis: string | null;
        penugasan: Penugasan[];
    };
    inspektur: { nama: string; nip_rapat: string; nip_spasi: string };
}

/** NIP 18 digit ditulis berspasi seperti di berkas asli: 19720504 200112 1 002. */
function nipSpasi(nip: string | null) {
    const d = (nip ?? '').replace(/\D/g, '');
    if (d.length !== 18) return nip ?? '';
    return `${d.slice(0, 8)} ${d.slice(8, 14)} ${d.slice(14, 15)} ${d.slice(15)}`;
}

/**
 * Lembar tabel RPP — tata letak disalin dari berkas RPP*.xls Bagian
 * Perencanaan (A4 mendatar): kepala tiga baris, tabel 8 kolom dengan tiap
 * anggota dua baris (nama/NIP, pangkat/golongan), SIFAT AUDIT merentang satu
 * penugasan, JUMLAH LAPORAN dua sel (jumlah, lalu TMT), keterangan DK/LK di
 * kiri dan tanda tangan Inspektur di kanan. Kolom tarif/biaya berkas asli
 * berada di luar area cetak, jadi tidak ada di sini.
 */
export default function RppPreviewTabel({ rpp, inspektur }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'ERPIKA', href: '#' },
        { title: 'RPP Perencanaan', href: '/rpp' },
        { title: 'Tabel ' + rpp.nomor_rpp, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tabel RPP ${rpp.nomor_rpp}`} />
            <style>{`
                @page { size: A4 landscape; margin: 10mm 10mm 10mm 12mm; }
                .rpp-sheet { font-family: Arial, 'Liberation Sans', Helvetica, sans-serif; color: #000; }
                .rpp-sheet .bk { font-family: 'Bookman Old Style', 'URW Bookman', Bookman, 'DejaVu Serif', serif; }
                .rpp-tabel { border-collapse: collapse; width: 100%; table-layout: fixed; }
                .rpp-tabel th, .rpp-tabel td { border: 1px solid #000; padding: 1px 3px; vertical-align: middle; }
                .rpp-tabel th { font-family: 'Bookman Old Style', 'URW Bookman', Bookman, 'DejaVu Serif', serif; font-weight: 700; font-size: 7pt; text-align: center; line-height: 1.15; }
                .rpp-tabel td { font-size: 7.5pt; line-height: 1.15; }
                .rpp-tabel td.nip { border-top: none; padding-top: 0; }
                .rpp-tabel td.nama { border-bottom: none; padding-bottom: 0; }
                .rpp-tabel td.hari { text-align: center; white-space: nowrap; }
                .rpp-tabel td.peran { text-align: center; font-family: 'Bookman Old Style', 'URW Bookman', Bookman, 'DejaVu Serif', serif; font-size: 7pt; }
                .rpp-tabel td.pangkat { text-align: center; }
                .rpp-tabel td.sifat { text-align: center; font-weight: 700; }
                .rpp-tabel td.lap { text-align: center; }
                @media print {
                    body { background: #fff; }
                    .rpp-sheet { padding: 0 !important; margin: 0 !important; max-width: none !important; box-shadow: none !important; }
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
                        <Link href={`/rpp-cetak/${rpp.id}/pengantar/preview`}>
                            <Button variant="outline" size="sm">
                                Surat pengantar
                            </Button>
                        </Link>
                        <a href={`/rpp-cetak/${rpp.id}/tabel/excel`}>
                            <Button variant="outline" size="sm">
                                Unduh Excel
                            </Button>
                        </a>
                        <a href={`/rpp-cetak/${rpp.id}/tabel`}>
                            <Button size="sm">Unduh PDF</Button>
                        </a>
                    </div>
                </div>
            </div>

            <div className="rpp-sheet mx-auto w-[277mm] max-w-full bg-white p-[8mm] text-black print:w-auto">
                <div className="bk text-center text-[10.5pt] leading-tight font-bold">{rpp.judul}</div>
                <div className="bk text-center text-[10.5pt] leading-tight font-bold">{rpp.sub_judul}</div>
                <div className="bk mt-3 mb-1 text-[8pt] font-bold">Nomor : {rpp.nomor_rpp}</div>

                <table className="rpp-tabel">
                    <colgroup>
                        <col style={{ width: '5.5mm' }} />
                        <col style={{ width: '62mm' }} />
                        <col style={{ width: '47mm' }} />
                        <col style={{ width: '27mm' }} />
                        <col style={{ width: '30mm' }} />
                        <col style={{ width: '11mm' }} />
                        <col style={{ width: '11mm' }} />
                        <col style={{ width: '11mm' }} />
                        <col style={{ width: '16mm' }} />
                        <col style={{ width: '23mm' }} />
                    </colgroup>
                    <thead>
                        <tr>
                            <th rowSpan={2}>NO.</th>
                            <th rowSpan={2}>OBRIK</th>
                            <th rowSpan={2}>TIM PEMERIKSA</th>
                            <th rowSpan={2}>PANGKAT/GOL. RUANG</th>
                            <th rowSpan={2}>PERAN DALAM TIM</th>
                            <th colSpan={3}>HARI PEMERIKSAAN</th>
                            <th rowSpan={2}>SIFAT AUDIT</th>
                            <th rowSpan={2}>
                                JUMLAH
                                <br />
                                LAPORAN
                            </th>
                        </tr>
                        <tr>
                            <th>DK</th>
                            <th>LK</th>
                            <th>JLH</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rpp.penugasan.map((p) => {
                            const baris = p.tim.length * 2; // dua baris per anggota
                            const barisLaporan = p.tim.length >= 2 ? 3 : 1; // sel "n Laporan" setinggi ±1,5 anggota, sisanya TMT
                            return (
                                <Fragment key={p.urutan}>
                                    {p.tim.map((m, i) => (
                                        <Fragment key={i}>
                                            <tr>
                                                {i === 0 && (
                                                    <>
                                                        <td rowSpan={baris} className="text-center">
                                                            {p.urutan}
                                                        </td>
                                                        <td rowSpan={baris} className="align-middle">
                                                            {p.uraian}
                                                            {p.obriks.length > 0 && (
                                                                <div className="mt-0.5">
                                                                    {p.obriks.map((o, k) => (
                                                                        <div key={k}>
                                                                            {k + 1}.{o}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </td>
                                                    </>
                                                )}
                                                <td className="nama">
                                                    {m.no} {m.nama}
                                                </td>
                                                <td className="pangkat nama">{m.pangkat}</td>
                                                <td rowSpan={2} className="peran">
                                                    {m.peran}
                                                </td>
                                                <td rowSpan={2} className="hari">
                                                    {m.dk} Hari
                                                </td>
                                                <td rowSpan={2} className="hari">
                                                    {m.lk} Hari
                                                </td>
                                                <td rowSpan={2} className="hari">
                                                    {m.dk + m.lk} Hari
                                                </td>
                                                {i === 0 && (
                                                    <>
                                                        <td rowSpan={baris} className="sifat">
                                                            {p.sifat}
                                                        </td>
                                                        <td rowSpan={barisLaporan} className="lap">
                                                            {p.jumlah_laporan != null ? `${p.jumlah_laporan} Laporan` : ''}
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                            <tr>
                                                <td className="nip">
                                                    <span className="invisible">{m.no} </span>
                                                    {nipSpasi(m.nip)}
                                                </td>
                                                <td className="pangkat nip">{m.golongan ? `(${m.golongan})` : ''}</td>
                                                {/* sel TMT dimulai tepat sesudah sel "n Laporan" berakhir */}
                                                {i * 2 + 1 === barisLaporan && barisLaporan < baris && (
                                                    <td rowSpan={baris - barisLaporan} className="lap">
                                                        {p.tmt}
                                                    </td>
                                                )}
                                            </tr>
                                        </Fragment>
                                    ))}
                                </Fragment>
                            );
                        })}
                    </tbody>
                </table>

                <div className="mt-2 flex justify-between text-[8pt]">
                    <div className="bk mt-5">
                        <div className="font-bold underline">KETERANGAN :</div>
                        <div>DK = Dalam Kantor</div>
                        <div>LK = Luar Kantor</div>
                    </div>
                    <div className="mr-[40mm] text-center">
                        <div>Meulaboh, {rpp.tanggal}</div>
                        <div>INSPEKTUR KABUPATEN ACEH BARAT</div>
                        <div className="h-[18mm]" />
                        <div className="font-bold underline">{inspektur.nama.toUpperCase()}.</div>
                        <div>NIP {inspektur.nip_rapat}</div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
