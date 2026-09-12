import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Fragment } from 'react';

interface Laporan {
    nomor: string;
    tanggal: string | null;
}

interface Baris {
    id: number;
    no: number;
    nomor_rpp: string;
    tanggal_rpp: string | null;
    nomor_st: string | null;
    tanggal_st: string | null;
    uraian: string | null;
    obriks: { nama: string; laporan: Laporan | null }[];
    laporan_lain: Laporan[];
    sifat: string | null;
    tim: { nama: string; role: string; peran: string; singkat: string; dk: number; lk: number }[];
    tmt: string | null;
    capaian_output: string | null;
    status: string;
    keterangan: string | null;
}

interface Props {
    tahun: number | 'semua';
    perTanggal: string;
    seksi: { kode: string; nama: string; baris: Baris[] }[];
    ringkasan: { penugasan: number; terbit: number; laporan: number };
}

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
function tglPanjang(iso: string | null) {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}
function tglPendek(iso: string | null) {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    return `${d.getDate()} ${BULAN[d.getMonth()].slice(0, 3)}`;
}

/**
 * Rekapitulasi laporan hasil pengawasan — tata letak disalin dari REKAP
 * LAPORAN RPP <tahun>.xlsx Bagian Analisis dan Evaluasi (A4 mendatar):
 * judul dua baris, seksi per jenis (A. REVIU, B. KHUSUS, ...), tiap ST satu
 * blok dengan obrik dan laporan per baris, tim dengan DK/LK di kolom tengah.
 */
export default function AnevaCetak({ tahun, perTanggal, seksi, ringkasan }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'ERPIKA', href: '#' },
        { title: 'ANEVA', href: '#' },
        { title: 'RPP Aneva', href: '/erpika/aneva' },
        { title: `Rekap ${tahun}`, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Rekap Laporan RPP ${tahun}`} />
            <style>{`
                @page { size: A4 landscape; margin: 10mm; }
                .rekap { font-family: Arial, 'Liberation Sans', sans-serif; color: #000; font-size: 7.5pt; }
                .rekap table { border-collapse: collapse; width: 100%; table-layout: fixed; }
                .rekap th, .rekap td { border: 1px solid #000; padding: 1px 3px; vertical-align: top; line-height: 1.2; }
                .rekap th { text-align: center; font-weight: 700; background: #fff; }
                .rekap thead { display: table-header-group; }
                .rekap tr { page-break-inside: avoid; }
                .rekap td.seksi { font-weight: 700; background: #f2f2f2; }
                .rekap .kanan { text-align: right; }
                .rekap .tengah { text-align: center; }
                @media print {
                    body { background: #fff; }
                    .rekap { padding: 0 !important; margin: 0 !important; max-width: none !important; }
                    .min-h-svh { min-height: 0 !important; }
                }
            `}</style>

            <div className="space-y-4 p-4 md:p-6 print:hidden">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link href={`/erpika/aneva?tahun=${tahun}`}>
                        <Button variant="secondary" size="sm">
                            Kembali
                        </Button>
                    </Link>
                    <a href={`/erpika/aneva/cetak?tahun=${tahun}`}>
                        <Button size="sm">Unduh PDF</Button>
                    </a>
                </div>
            </div>

            <div className="rekap mx-auto w-[277mm] max-w-full bg-white p-[8mm] text-black print:w-auto">
                <div className="text-center text-[10pt] font-bold">
                    REKAPITULASI LAPORAN HASIL AUDIT/REVIU/MONITORING/EVALUASI TERBIT BERDASARKAN RPP{' '}
                    {tahun === 'semua' ? 'SELURUH TAHUN' : `TAHUN ANGGARAN ${tahun}`}
                </div>
                <div className="mb-2 text-center text-[9pt] font-bold">PER TANGGAL {perTanggal.toUpperCase()}</div>

                <table>
                    <colgroup>
                        <col style={{ width: '7mm' }} />
                        <col style={{ width: '30mm' }} />
                        <col style={{ width: '27mm' }} />
                        <col style={{ width: '58mm' }} />
                        <col style={{ width: '16mm' }} />
                        <col style={{ width: '9mm' }} />
                        <col style={{ width: '38mm' }} />
                        <col style={{ width: '8mm' }} />
                        <col style={{ width: '8mm' }} />
                        <col style={{ width: '30mm' }} />
                        <col style={{ width: '36mm' }} />
                        <col style={{ width: '10mm' }} />
                        <col style={{ width: '14mm' }} />
                    </colgroup>
                    <thead>
                        <tr>
                            <th rowSpan={2}>No</th>
                            <th rowSpan={2}>RPP</th>
                            <th rowSpan={2}>ST</th>
                            <th rowSpan={2}>OBRIK</th>
                            <th rowSpan={2}>SIFAT AUDIT</th>
                            <th colSpan={2} rowSpan={2}>
                                TIM
                            </th>
                            <th colSpan={2}>MASA TUGAS</th>
                            <th rowSpan={2}>T.M.T</th>
                            <th rowSpan={2}>
                                LAPORAN
                                <br />
                                NOMOR/TANGGAL
                            </th>
                            <th rowSpan={2}>
                                CAPAIAN
                                <br />
                                OUTPUT
                            </th>
                            <th rowSpan={2}>KET.</th>
                        </tr>
                        <tr>
                            <th>DK</th>
                            <th>LK</th>
                        </tr>
                    </thead>
                    <tbody>
                        {seksi.map((sk) => (
                            <Fragment key={sk.kode}>
                                <tr>
                                    <td colSpan={13} className="seksi">
                                        {sk.kode}. {sk.nama.toUpperCase()}
                                    </td>
                                </tr>
                                {sk.baris.map((b) => {
                                    // baris = maks(obrik+laporan lain, tim), minimal 3 (RPP/ST punya 2 baris: nomor & tanggal)
                                    const daftarLaporan: { teks: string; laporan: Laporan | null }[] = [
                                        ...b.obriks.map((o) => ({ teks: o.nama, laporan: o.laporan })),
                                        ...b.laporan_lain.map((l) => ({ teks: '', laporan: l })),
                                    ];
                                    const n = Math.max(daftarLaporan.length + 1, b.tim.length, 3);
                                    return (
                                        <Fragment key={b.id}>
                                            {Array.from({ length: n }).map((_, i) => {
                                                const obrik = i === 0 ? null : (daftarLaporan[i - 1] ?? null);
                                                const anggota = b.tim[i] ?? null;
                                                return (
                                                    <tr key={i} style={i === n - 1 ? undefined : { borderBottom: 'none' }}>
                                                        <td
                                                            className="tengah"
                                                            style={{
                                                                borderTop: i ? 'none' : undefined,
                                                                borderBottom: i < n - 1 ? 'none' : undefined,
                                                            }}
                                                        >
                                                            {i === 0 ? b.no : ''}
                                                        </td>
                                                        <td
                                                            style={{
                                                                borderTop: i ? 'none' : undefined,
                                                                borderBottom: i < n - 1 ? 'none' : undefined,
                                                            }}
                                                        >
                                                            {i === 0 && b.nomor_rpp}
                                                            {i === 2 && tglPanjang(b.tanggal_rpp)}
                                                        </td>
                                                        <td
                                                            style={{
                                                                borderTop: i ? 'none' : undefined,
                                                                borderBottom: i < n - 1 ? 'none' : undefined,
                                                            }}
                                                        >
                                                            {i === 0 && b.nomor_st}
                                                            {i === 2 && tglPanjang(b.tanggal_st)}
                                                        </td>
                                                        <td
                                                            style={{
                                                                borderTop: i ? 'none' : undefined,
                                                                borderBottom: i < n - 1 ? 'none' : undefined,
                                                            }}
                                                        >
                                                            {i === 0 ? b.uraian : obrik ? (obrik.teks ? `${i}. ${obrik.teks}` : '') : ''}
                                                        </td>
                                                        <td
                                                            className="tengah"
                                                            style={{
                                                                borderTop: i ? 'none' : undefined,
                                                                borderBottom: i < n - 1 ? 'none' : undefined,
                                                            }}
                                                        >
                                                            {i === 0 && b.sifat}
                                                        </td>
                                                        <td
                                                            className="tengah"
                                                            style={{
                                                                borderTop: i ? 'none' : undefined,
                                                                borderBottom: i < n - 1 ? 'none' : undefined,
                                                            }}
                                                        >
                                                            {anggota ? anggota.singkat : ''}
                                                        </td>
                                                        <td
                                                            style={{
                                                                borderTop: i ? 'none' : undefined,
                                                                borderBottom: i < n - 1 ? 'none' : undefined,
                                                            }}
                                                        >
                                                            {anggota ? anggota.nama : ''}
                                                        </td>
                                                        <td
                                                            className="tengah"
                                                            style={{
                                                                borderTop: i ? 'none' : undefined,
                                                                borderBottom: i < n - 1 ? 'none' : undefined,
                                                            }}
                                                        >
                                                            {anggota ? anggota.dk : ''}
                                                        </td>
                                                        <td
                                                            className="tengah"
                                                            style={{
                                                                borderTop: i ? 'none' : undefined,
                                                                borderBottom: i < n - 1 ? 'none' : undefined,
                                                            }}
                                                        >
                                                            {anggota ? anggota.lk : ''}
                                                        </td>
                                                        <td
                                                            style={{
                                                                borderTop: i ? 'none' : undefined,
                                                                borderBottom: i < n - 1 ? 'none' : undefined,
                                                            }}
                                                        >
                                                            {i === 0 && b.tmt}
                                                        </td>
                                                        <td
                                                            style={{
                                                                borderTop: i ? 'none' : undefined,
                                                                borderBottom: i < n - 1 ? 'none' : undefined,
                                                            }}
                                                        >
                                                            {obrik?.laporan && (
                                                                <>
                                                                    {obrik.laporan.nomor}
                                                                    {obrik.laporan.tanggal && ` / ${tglPendek(obrik.laporan.tanggal)}`}
                                                                </>
                                                            )}
                                                        </td>
                                                        <td
                                                            className="tengah"
                                                            style={{
                                                                borderTop: i ? 'none' : undefined,
                                                                borderBottom: i < n - 1 ? 'none' : undefined,
                                                            }}
                                                        >
                                                            {i === 0 && b.capaian_output}
                                                        </td>
                                                        <td
                                                            style={{
                                                                borderTop: i ? 'none' : undefined,
                                                                borderBottom: i < n - 1 ? 'none' : undefined,
                                                            }}
                                                        >
                                                            {i === 0 && (b.status === 'batal' ? 'Batal' : b.keterangan)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </Fragment>
                                    );
                                })}
                            </Fragment>
                        ))}
                        <tr>
                            <td colSpan={13} className="seksi">
                                JUMLAH: {ringkasan.penugasan} penugasan, {ringkasan.terbit} LHP terbit, {ringkasan.laporan} laporan
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
