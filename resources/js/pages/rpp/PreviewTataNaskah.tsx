import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Fragment } from 'react';

interface Baris {
    no: number;
    jenis: string | null;
    nomor_rpp: string;
    tanggal_rpp: string | null;
    nomor_sp: string | null;
    nomor_st: string | null;
    nomor_kp: string | null;
    tanggal_st: string | null;
    ketua_tim: string | null;
    uraian: string | null;
    status: string;
    lhp: { nomor: string; tanggal: string | null } | null;
    jumlah_lhp: number;
}

interface Props {
    tahun: number;
    jenis: { id: number; name: string; kode_nomor: string | null; sebutan: string | null } | null;
    categories: { id: number; code: string; name: string; kode_nomor: string | null }[];
    tahunTersedia: number[];
    baris: Baris[];
}

function tgl(iso: string | null) {
    if (!iso) return '';
    return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
}

/**
 * Tata naskah penugasan — agenda penomoran RPP, SP, ST, KP, ketua tim, dan
 * LHP satu jenis satu tahun, disalin dari berkas "0__no agenda penugasan"
 * (tiga baris per penugasan: nomor / ketua tim / tanggal). Nomor SP dan KP
 * yang belum tersimpan diturunkan dari nomor ST (nomor urut sama).
 */
export default function PreviewTataNaskah({ tahun, jenis, categories, tahunTersedia, baris }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'ERPIKA', href: '#' },
        { title: 'RPP Perencanaan', href: '/rpp' },
        { title: 'Tata Naskah', href: '#' },
    ];
    const q = `tahun=${tahun}${jenis ? `&jenis=${jenis.id}` : ''}`;
    const pergi = (t: string | number, j: string | number | null) =>
        router.get('/rpp-cetak/tata-naskah/preview', { tahun: t, jenis: j ?? '' }, { preserveState: true });
    const judul = jenis ? `TATA NASKAH ${jenis.name.toUpperCase()}` : 'TATA NASKAH PENUGASAN';
    const kolomTim =
        jenis && ['Khusus', 'Monitoring', 'Tujuan Tertentu', 'Kepatuhan Gampong', 'Operasional SKPK'].includes(jenis.name)
            ? 'OBRIK / KETUA TIM'
            : 'KETUA TIM';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tata Naskah ${jenis?.name ?? ''} ${tahun}`} />
            <style>{`
                @page { size: A4 landscape; margin: 12mm; }
                .naskah { font-family: 'Times New Roman', 'Liberation Serif', serif; color: #000; font-size: 10pt; }
                .naskah table { border-collapse: collapse; width: 100%; table-layout: fixed; }
                .naskah th, .naskah td { border: 1px solid #000; padding: 2px 4px; vertical-align: middle; }
                .naskah th { text-align: center; font-weight: 700; }
                .naskah td.tengah { text-align: center; }
                .naskah td.tanpa-atas { border-top: none; }
                .naskah td.tanpa-bawah { border-bottom: none; }
                .naskah thead { display: table-header-group; }
                .naskah tr { page-break-inside: avoid; }
                @media print { body { background: #fff; } .naskah { padding: 0 !important; margin: 0 !important; max-width: none !important; } .min-h-svh { min-height: 0 !important; } }
            `}</style>

            <div className="space-y-4 p-4 md:p-6 print:hidden">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Link href="/rpp">
                            <Button variant="secondary" size="sm">
                                Kembali
                            </Button>
                        </Link>
                        <Select value={String(tahun)} onValueChange={(v) => pergi(v, jenis?.id ?? null)}>
                            <SelectTrigger className="w-[110px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[...new Set([tahun, ...tahunTersedia])]
                                    .sort((a, b) => b - a)
                                    .map((y) => (
                                        <SelectItem key={y} value={String(y)}>
                                            {y}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                        <Select value={jenis ? String(jenis.id) : 'semua'} onValueChange={(v) => pergi(tahun, v === 'semua' ? null : v)}>
                            <SelectTrigger className="w-[220px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="semua">Semua jenis</SelectItem>
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.code}. {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <a href={`/rpp-cetak/tata-naskah?${q}`}>
                        <Button size="sm">Unduh PDF</Button>
                    </a>
                </div>
                <p className="text-muted-foreground text-sm">
                    Nomor SP dan KP yang belum diisi di RPP ditampilkan menurut pola tata naskah (nomor urut sama dengan ST). Tanggal SP/ST/KP satu
                    tanggal.
                </p>
            </div>

            <div className="naskah mx-auto w-[273mm] max-w-full bg-white p-[8mm] text-black print:w-auto">
                <div className="text-center text-[12pt] font-bold">{judul}</div>
                <div className="mb-3 text-center text-[12pt] font-bold">{tahun}</div>
                <table>
                    <colgroup>
                        {[5, 17, 17, 15, 15, 19, 12].map((w, i) => (
                            <col key={i} style={{ width: `${w}%` }} />
                        ))}
                    </colgroup>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>RPP</th>
                            <th>SP</th>
                            <th>ST</th>
                            <th>KP</th>
                            <th>{kolomTim}</th>
                            <th>
                                LHP
                                <br />
                                Nomor / Tanggal
                            </th>
                        </tr>
                        <tr>
                            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                                <th key={n} className="text-[8pt] font-normal">
                                    {n}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {baris.map((b, idx) => {
                            const kepala = !jenis && (idx === 0 || baris[idx - 1].jenis !== b.jenis);
                            return (
                                <Fragment key={`${b.nomor_st ?? b.nomor_rpp}-${idx}`}>
                                    {kepala && (
                                        <tr>
                                            <td colSpan={7} className="font-bold">
                                                {b.jenis}
                                            </td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td className="tengah tanpa-bawah">{b.no}</td>
                                        <td className="tengah tanpa-bawah">{b.nomor_rpp}</td>
                                        <td className="tengah tanpa-bawah">{b.nomor_sp ?? ''}</td>
                                        <td className="tengah tanpa-bawah">{b.nomor_st ?? ''}</td>
                                        <td className="tengah tanpa-bawah">{b.nomor_kp ?? ''}</td>
                                        <td className="tanpa-bawah"></td>
                                        <td className="tengah tanpa-bawah">{b.lhp?.nomor ?? ''}</td>
                                    </tr>
                                    <tr>
                                        <td className="tanpa-atas tanpa-bawah"></td>
                                        <td className="tanpa-atas tanpa-bawah"></td>
                                        <td className="tanpa-atas tanpa-bawah"></td>
                                        <td className="tanpa-atas tanpa-bawah"></td>
                                        <td className="tanpa-atas tanpa-bawah"></td>
                                        <td className="tanpa-atas tanpa-bawah">{b.ketua_tim ?? ''}</td>
                                        <td className="tanpa-atas tanpa-bawah"></td>
                                    </tr>
                                    <tr>
                                        <td className="tanpa-atas"></td>
                                        <td className="tengah tanpa-atas">{tgl(b.tanggal_rpp)}</td>
                                        <td className="tengah tanpa-atas">{tgl(b.tanggal_st)}</td>
                                        <td className="tengah tanpa-atas">{tgl(b.tanggal_st)}</td>
                                        <td className="tengah tanpa-atas">{tgl(b.tanggal_st)}</td>
                                        <td className="tanpa-atas"></td>
                                        <td className="tengah tanpa-atas">{tgl(b.lhp?.tanggal ?? null)}</td>
                                    </tr>
                                </Fragment>
                            );
                        })}
                        {baris.length === 0 && (
                            <tr>
                                <td colSpan={7} className="tengah">
                                    Belum ada penugasan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
