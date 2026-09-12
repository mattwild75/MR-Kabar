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
    tim: { nama: string; singkat: string; dk: number; lk: number }[];
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
function tgl(iso: string | null) {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Rekapitulasi laporan hasil pengawasan — disalin sel demi sel dari REKAP
 * LAPORAN RPP <tahun>.xlsx Bagian Analisis dan Evaluasi (A4 mendatar, 17
 * kolom): No | RPP | ST | OBRIK | SIFAT | TIM (peran : nama) | DK LK | T.M.T |
 * LAPORAN nomor/tanggal | STATUS tiga sel berwarna (hijau/kuning/merah) |
 * CAPAIAN | KET. Tanggal RPP/ST di baris ketiga blok, objek dan laporannya
 * satu baris satu objek, seperti berkas aslinya. Unduh Excel memakai tata
 * letak yang sama (AnevaExcelService).
 */
export default function AnevaCetak({ tahun, perTanggal, seksi, ringkasan }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'ERPIKA', href: '#' },
        { title: 'RPP Analisis dan Evaluasi', href: '/erpika/aneva' },
        { title: `Rekap ${tahun}`, href: '#' },
    ];
    const q = `tahun=${tahun}`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Rekap Laporan RPP ${tahun}`} />
            <style>{`
                @page { size: A4 landscape; margin: 10mm; }
                .rekap { font-family: 'Bookman Old Style', 'URW Bookman', Bookman, 'DejaVu Serif', serif; color: #000; font-size: 7pt; }
                .rekap table { border-collapse: collapse; width: 100%; table-layout: fixed; }
                .rekap th, .rekap td { border: 1px solid #000; padding: 1px 3px; vertical-align: middle; line-height: 1.2; overflow-wrap: anywhere; }
                .rekap th { text-align: center; font-weight: 700; }
                .rekap thead { display: table-header-group; }
                .rekap td.seksi { font-weight: 700; text-align: left; }
                .rekap td.tengah { text-align: center; }
                .rekap td.atas { vertical-align: top; }
                .rekap td.arial { font-family: Arial, 'Liberation Sans', sans-serif; text-align: center; }
                .rekap td.hijau { background: #00b050; }
                .rekap td.kuning { background: #ffff00; }
                .rekap td.merah { background: #ff0000; }
                .rekap td.tanpa-atas { border-top: none; }
                .rekap td.tanpa-bawah { border-bottom: none; }
                .rekap tr.blok-awal td { border-top: 1px solid #000; }
                .rekap tr { page-break-inside: avoid; }
                @media print {
                    body { background: #fff; }
                    .rekap { padding: 0 !important; margin: 0 !important; max-width: none !important; }
                    .min-h-svh { min-height: 0 !important; }
                }
            `}</style>

            <div className="space-y-4 p-4 md:p-6 print:hidden">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link href={`/erpika/aneva?${q}`}>
                        <Button variant="secondary" size="sm">
                            Kembali
                        </Button>
                    </Link>
                    <div className="flex gap-2">
                        <a href={`/erpika/aneva/cetak/excel?${q}`}>
                            <Button variant="outline" size="sm">
                                Unduh Excel
                            </Button>
                        </a>
                        <a href={`/erpika/aneva/cetak?${q}`}>
                            <Button size="sm">Unduh PDF</Button>
                        </a>
                    </div>
                </div>
            </div>

            <div className="rekap mx-auto w-[277mm] max-w-full bg-white p-[8mm] text-black print:w-auto">
                <div className="text-center text-[10pt] font-bold">
                    REKAPITULASI LAPORAN HASIL AUDIT/REVIU/MONITORING/EVALUASI TERBIT BERDASARKAN RPP{' '}
                    {tahun === 'semua' ? 'SELURUH TAHUN' : `TAHUN ANGGARAN ${tahun}`}
                </div>
                <div className="mb-2 text-center text-[10pt] font-bold">PER TANGGAL {perTanggal}</div>

                <table>
                    <colgroup>
                        {/* lebar mengikuti kolom berkas asli (satuan karakter Excel) */}
                        {[4.5, 16.8, 14.5, 44.5, 12.5, 7, 1.5, 29.5, 5.6, 5.6, 13.2, 30, 3.6, 3.6, 3.6, 7.9, 12.2].map((w, i) => (
                            <col key={i} style={{ width: `${(w / 240) * 100}%` }} />
                        ))}
                    </colgroup>
                    <thead>
                        <tr>
                            <th rowSpan={2}>No</th>
                            <th rowSpan={2}>RPP</th>
                            <th rowSpan={2}>ST</th>
                            <th rowSpan={2}>OBRIK</th>
                            <th rowSpan={2}>SIFAT AUDIT</th>
                            <th colSpan={3} rowSpan={2}>
                                TIM
                            </th>
                            <th colSpan={2}>MASA TUGAS</th>
                            <th rowSpan={2}>T.M.T</th>
                            <th rowSpan={2}>
                                LAPORAN
                                <br />
                                NOMOR/TANGGAL
                            </th>
                            <th colSpan={3} rowSpan={2}>
                                STATUS
                            </th>
                            <th colSpan={2} rowSpan={2}>
                                CAPAIAN OUTPUT
                            </th>
                        </tr>
                        <tr>
                            <th>DK</th>
                            <th>LK</th>
                        </tr>
                        <tr>
                            {[1, 2, 3, 4, 5].map((n) => (
                                <th key={n} className="text-[6pt] font-normal">
                                    {n}
                                </th>
                            ))}
                            <th colSpan={3} className="text-[6pt] font-normal">
                                6
                            </th>
                            <th colSpan={2} className="text-[6pt] font-normal">
                                7
                            </th>
                            <th className="text-[6pt] font-normal">8</th>
                            <th className="text-[6pt] font-normal">9</th>
                            <th colSpan={3} className="text-[6pt] font-normal">
                                10
                            </th>
                            <th colSpan={2} className="text-[6pt] font-normal">
                                11
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {seksi.map((sk) => (
                            <Fragment key={sk.kode}>
                                <tr>
                                    <td colSpan={17} className="seksi">
                                        {sk.kode}.{sk.nama.toUpperCase()}
                                    </td>
                                </tr>
                                {sk.baris.map((b) => {
                                    const objek: { teks: string; laporan: Laporan | null }[] = [
                                        ...b.obriks.map((o) => ({ teks: o.nama, laporan: o.laporan })),
                                        ...b.laporan_lain.map((l) => ({ teks: '', laporan: l })),
                                    ];
                                    const n = Math.max(objek.length + 1, b.tim.length, 3);
                                    const warna =
                                        b.status === 'lhp_terbit'
                                            ? 'hijau'
                                            : b.status === 'nomor_diminta'
                                              ? 'kuning'
                                              : b.status === 'batal'
                                                ? ''
                                                : 'merah';
                                    const sel = (i: number, extra = '') => `${i > 0 ? 'tanpa-atas ' : ''}${i < n - 1 ? 'tanpa-bawah ' : ''}${extra}`;
                                    return (
                                        <Fragment key={b.id}>
                                            {Array.from({ length: n }).map((_, i) => {
                                                const ob = i === 0 ? null : (objek[i - 1] ?? null);
                                                const m = b.tim[i] ?? null;
                                                return (
                                                    <tr key={i} className={i === 0 ? 'blok-awal' : undefined}>
                                                        <td className={sel(i, 'tengah')}>{i === 0 ? b.no : ''}</td>
                                                        <td className={sel(i, 'atas')}>
                                                            {i === 0 ? b.nomor_rpp : i === 2 ? tgl(b.tanggal_rpp) : ''}
                                                        </td>
                                                        <td className={sel(i, 'atas')}>{i === 0 ? b.nomor_st : i === 2 ? tgl(b.tanggal_st) : ''}</td>
                                                        <td className={sel(i)}>{i === 0 ? b.uraian : ob && ob.teks ? `${i}. ${ob.teks}` : ''}</td>
                                                        <td className={sel(i, 'tengah')}>{i === 0 ? b.sifat : ''}</td>
                                                        <td className={sel(i)}>{m?.singkat ?? ''}</td>
                                                        <td className={sel(i)}>{m ? ':' : ''}</td>
                                                        <td className={sel(i)}>{m?.nama ?? ''}</td>
                                                        <td className={`${sel(i)}arial`}>{m ? m.dk : ''}</td>
                                                        <td className={`${sel(i)}arial`}>{m ? m.lk : ''}</td>
                                                        <td className={sel(i, 'tengah')}>{i === 0 ? b.tmt : ''}</td>
                                                        <td className={sel(i)}>
                                                            {ob?.laporan && (
                                                                <>
                                                                    {ob.laporan.nomor}
                                                                    {ob.laporan.tanggal && (
                                                                        <>
                                                                            <br />
                                                                            {tgl(ob.laporan.tanggal)}
                                                                        </>
                                                                    )}
                                                                </>
                                                            )}
                                                        </td>
                                                        <td className={sel(i, warna === 'hijau' ? 'hijau' : '')}></td>
                                                        <td className={sel(i, warna === 'kuning' ? 'kuning' : '')}></td>
                                                        <td className={sel(i, warna === 'merah' ? 'merah' : '')}></td>
                                                        <td className={sel(i, 'tengah')}>{i === 0 ? b.capaian_output : ''}</td>
                                                        <td className={sel(i, 'tengah')}>
                                                            {i === 0 ? (b.status === 'batal' ? 'Batal' : b.keterangan) : ''}
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
                            <td colSpan={17} className="seksi">
                                JUMLAH: {ringkasan.penugasan} penugasan, {ringkasan.terbit} LHP terbit, {ringkasan.laporan} laporan
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
