import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import React from 'react';

interface Category {
    id: number;
    code: string;
    name: string;
}

interface TeamMember {
    id: number;
    role: 'koordinator' | 'ppj' | 'ketua_tim' | 'anggota_tim';
    nama: string;
    nip: string | null;
    pangkat: string | null;
    golongan: string | null;
    hari_kantor: number | null;
    hari_lapangan: number | null;
}

interface Obrik {
    id: number;
    nama: string;
}

interface Laporan {
    id: number;
}

interface Rpp {
    id: number;
    year: number;
    nomor_rpp: string;
    tanggal_rpp: string | null;
    uraian: string | null;
    category: Category;
    team_members: TeamMember[];
    obriks: Obrik[];
    laporans: Laporan[];
}

interface Setting {
    inspektur: { nama: string; nip: string | null } | null;
}

interface Props {
    rpp: Rpp;
    setting: Setting;
    tarifPerHari: number;
    totalBiaya: number;
    bulanNama: string | null;
}

const roleLabel: Record<string, string> = {
    koordinator: 'Koordinator',
    ppj: 'PPJ',
    ketua_tim: 'Ketua Tim',
    anggota_tim: 'Anggota Tim',
};

function rupiah(n: number) {
    return 'Rp ' + n.toLocaleString('id-ID');
}

function formatTanggal(d: string | null) {
    if (!d) return '............';
    return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function RppPreviewTabel({ rpp, setting, tarifPerHari, totalBiaya, bulanNama }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Perencanaan', href: '#' },
        { title: 'Cetak RPP', href: '/rpp-cetak' },
        { title: 'Preview Tabel', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Preview Tabel RPP ${rpp.nomor_rpp}`} />
            <style>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
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
                    <a href={`/rpp-cetak/${rpp.id}/tabel`}>
                        <Button size="sm">Unduh PDF</Button>
                    </a>
                </div>
            </div>

            <div className="rpp-print-sheet mx-auto max-w-[1400px] bg-white p-8 text-black print:m-0 print:max-w-none print:p-0 print:shadow-none">
                <h1 className="text-center text-base font-bold">RENCANA PENUGASAN PENGAWASAN</h1>
                <h2 className="text-center text-sm">
                    BULAN {(bulanNama ?? '-').toUpperCase()} {rpp.year}
                </h2>
                <p className="mb-4 text-center text-sm">Nomor : {rpp.nomor_rpp}</p>

                <table className="w-full border-collapse text-xs">
                    <thead>
                        <tr className="bg-gray-100">
                            <th rowSpan={2} className="border border-gray-700 p-1">
                                NO.
                            </th>
                            <th rowSpan={2} className="border border-gray-700 p-1">
                                OBRIK
                            </th>
                            <th colSpan={2} rowSpan={2} className="border border-gray-700 p-1">
                                TIM {rpp.category.name.toUpperCase()}
                            </th>
                            <th rowSpan={2} className="border border-gray-700 p-1">
                                PANGKAT/GOL. RUANG
                            </th>
                            <th rowSpan={2} className="border border-gray-700 p-1">
                                PERAN DALAM TIM
                            </th>
                            <th colSpan={6} className="border border-gray-700 p-1">
                                HARI PEMERIKSAAN
                            </th>
                            <th rowSpan={2} className="border border-gray-700 p-1">
                                SIFAT PENUGASAN
                            </th>
                            <th rowSpan={2} className="border border-gray-700 p-1">
                                JUMLAH LAPORAN
                            </th>
                            <th rowSpan={2} className="border border-gray-700 p-1">
                                TARIF/HARI
                            </th>
                            <th rowSpan={2} className="border border-gray-700 p-1">
                                JUMLAH BIAYA
                            </th>
                        </tr>
                        <tr className="bg-gray-100">
                            <th colSpan={2} className="border border-gray-700 p-1">
                                DK
                            </th>
                            <th colSpan={2} className="border border-gray-700 p-1">
                                LK
                            </th>
                            <th colSpan={2} className="border border-gray-700 p-1">
                                JLH
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rpp.team_members.length === 0 ? (
                            <tr>
                                <td className="border border-gray-700 p-1 text-center">1</td>
                                <td className="border border-gray-700 p-1 text-left">
                                    {rpp.uraian}
                                    {rpp.obriks.map((o, i) => (
                                        <div key={o.id} className="text-[10px] text-gray-600">
                                            {i + 1}. {o.nama}
                                        </div>
                                    ))}
                                </td>
                                <td colSpan={9} className="border border-gray-700 p-1 text-center">
                                    Belum ada tim ditambahkan.
                                </td>
                                <td className="border border-gray-700 p-1 text-center">{rpp.category.name}</td>
                                <td className="border border-gray-700 p-1 text-center">{rpp.laporans.length} Laporan</td>
                                <td className="border border-gray-700 p-1 text-center">{rupiah(tarifPerHari)}</td>
                                <td className="border border-gray-700 p-1 text-center">Rp 0</td>
                            </tr>
                        ) : (
                            rpp.team_members.map((member, i) => (
                                <React.Fragment key={member.id}>
                                    <tr>
                                        {i === 0 && (
                                            <>
                                                <td rowSpan={rpp.team_members.length * 2} className="border border-gray-700 p-1 text-center">
                                                    1
                                                </td>
                                                <td rowSpan={rpp.team_members.length * 2} className="border border-gray-700 p-1 text-left align-top">
                                                    {rpp.uraian}
                                                    {rpp.obriks.map((o, oi) => (
                                                        <div key={o.id} className="text-[10px] text-gray-600">
                                                            {oi + 1}. {o.nama}
                                                        </div>
                                                    ))}
                                                </td>
                                            </>
                                        )}
                                        <td colSpan={2} className="border border-gray-700 p-1 text-center">
                                            {i + 1}
                                        </td>
                                        <td className="border border-gray-700 p-1 text-left">{member.nama}</td>
                                        <td className="border border-gray-700 p-1 text-center">
                                            {[member.pangkat, member.golongan ? `(${member.golongan})` : ''].filter(Boolean).join(' ') || '-'}
                                        </td>
                                        <td className="border border-gray-700 p-1 text-center">{roleLabel[member.role]}</td>
                                        <td colSpan={2} className="border border-gray-700 p-1 text-center">
                                            {member.hari_kantor ?? 0} Hari
                                        </td>
                                        <td colSpan={2} className="border border-gray-700 p-1 text-center">
                                            {member.hari_lapangan ?? 0} Hari
                                        </td>
                                        <td colSpan={2} className="border border-gray-700 p-1 text-center">
                                            {(member.hari_kantor ?? 0) + (member.hari_lapangan ?? 0)} Hari
                                        </td>
                                        {i === 0 && (
                                            <>
                                                <td rowSpan={rpp.team_members.length * 2} className="border border-gray-700 p-1 text-center">
                                                    {rpp.category.name}
                                                </td>
                                                <td rowSpan={rpp.team_members.length * 2} className="border border-gray-700 p-1 text-center">
                                                    {rpp.laporans.length} Laporan
                                                </td>
                                            </>
                                        )}
                                        <td className="border border-gray-700 p-1 text-center">{rupiah(tarifPerHari)}</td>
                                        <td className="border border-gray-700 p-1 text-center">
                                            {rupiah(((member.hari_kantor ?? 0) + (member.hari_lapangan ?? 0)) * tarifPerHari)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className="border border-gray-700 p-1 text-[10px] text-gray-600">
                                            NIP. {member.nip ?? '-'}
                                        </td>
                                        <td colSpan={10} className="border border-gray-700 p-1"></td>
                                    </tr>
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={15} className="border border-gray-700 p-1 text-left font-bold">
                                JUMLAH
                            </td>
                            <td className="border border-gray-700 p-1 text-center font-bold">{rupiah(totalBiaya)}</td>
                        </tr>
                    </tfoot>
                </table>

                <div className="mt-3 text-[10px]">
                    <div>KETERANGAN :</div>
                    <div>DK = Dalam Kantor</div>
                    <div>LK = Luar Kantor</div>
                </div>

                <table className="mt-8 w-full">
                    <tbody>
                        <tr>
                            <td className="w-1/2"></td>
                            <td className="w-1/2 text-center text-sm">
                                Meulaboh, {formatTanggal(rpp.tanggal_rpp)}
                                <br />
                                INSPEKTUR KABUPATEN ACEH BARAT,
                                <br />
                                <br />
                                <br />
                                <br />
                                <strong>{(setting.inspektur?.nama ?? '............').toUpperCase()}</strong>
                                <br />
                                NIP. {setting.inspektur?.nip ?? '............'}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
