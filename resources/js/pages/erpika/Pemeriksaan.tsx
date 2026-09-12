import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { CircleCheck, TriangleAlert } from 'lucide-react';

interface Rujukan {
    id: number;
    rpp_id: number;
    nomor_rpp: string | null;
    tahun: number | null;
    nomor_st: string | null;
    uraian: string | null;
    status: string;
    jumlah_laporan?: number;
    mulai?: string;
    selesai?: string;
}

interface Props {
    hasil: {
        temuan: {
            st_ganda: { nomor_st: string; tahun: number; penugasan: Rujukan[] }[];
            tanpa_uraian: Rujukan[];
            st_tanpa_tanggal: Rujukan[];
            masa_tanpa_st: Rujukan[];
            status_tidak_selaras: Rujukan[];
            tumpang_tindih: { employee_id: number; nama: string; a: Rujukan; b: Rujukan }[];
            pegawai_tanpa_nip: { id: number; nama: string; jabatan: string | null }[];
            belum_sinkron_aneva: Rujukan[];
        };
        jumlah: number;
        tahun: number | 'semua';
    };
    tahunTersedia: number[];
    filters: { tahun: number | 'semua' };
}

const JUDUL: Record<string, { judul: string; arti: string }> = {
    st_ganda: {
        judul: 'Nomor ST dipakai lebih dari satu penugasan',
        arti: 'Dua penugasan pada tahun yang sama memakai nomor ST persis sama. Biasanya salah ketik atau baris ganda dari impor.',
    },
    tanpa_uraian: { judul: 'Penugasan tanpa uraian', arti: 'Uraian kosong atau hanya "-". Isi judul penugasannya di RPP Perencanaan.' },
    st_tanpa_tanggal: { judul: 'ST bernomor tetapi tanpa tanggal', arti: 'Nomor ST ada, tanggalnya belum. Rekap aneva menampilkan tanggal kosong.' },
    masa_tanpa_st: { judul: 'Masa tugas ada, ST belum', arti: 'Sudah dijadwalkan tetapi belum ada nomor ST, padahal statusnya bukan draft.' },
    status_tidak_selaras: {
        judul: 'Status tidak selaras dengan laporan',
        arti: 'Laporan sudah tercatat tetapi status belum "LHP terbit", atau sebaliknya.',
    },
    tumpang_tindih: {
        judul: 'Satu orang di dua penugasan yang beririsan',
        arti: 'Masa tugas dua penugasan bertumpuk untuk orang yang sama, keduanya dengan hari lapangan.',
    },
    pegawai_tanpa_nip: { judul: 'Pegawai dalam tim tanpa NIP', arti: 'NIP kosong membuat kolom NIP pada cetakan RPP kosong.' },
    belum_sinkron_aneva: {
        judul: 'Belum pernah disinkron dari aneva',
        arti: 'Pada tahun yang penugasan lainnya sudah disinkron, baris ini tidak ditemukan di rekap aneva — periksa apakah memang ada.',
    },
};

function Tautan({ r }: { r: Rujukan }) {
    return (
        <Link href={`/rpp/${r.rpp_id}/edit`} className="underline">
            {r.nomor_rpp ?? `RPP #${r.rpp_id}`}
        </Link>
    );
}

/**
 * ERPIKA → Pemeriksaan Data. Hanya menandai; tiap temuan menaut ke RPP-nya
 * supaya diperbaiki lewat formulir yang ada. Dihitung ulang otomatis begitu
 * data RPP berubah (cache bersidik jari tabel).
 */
export default function Pemeriksaan({ hasil, tahunTersedia, filters }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'ERPIKA', href: '#' },
        { title: 'Pemeriksaan Data', href: '/erpika/pemeriksaan' },
    ];
    const t = hasil.temuan;
    const kelompok: { kode: keyof typeof t; jumlah: number }[] = (Object.keys(JUDUL) as (keyof typeof t)[]).map((k) => ({
        kode: k,
        jumlah: t[k].length,
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pemeriksaan Data ERPIKA" />
            <div className="space-y-4 p-4 md:p-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Pemeriksaan Data ERPIKA</h1>
                        <p className="text-muted-foreground text-sm">
                            Temuan keutuhan data RPP Perencanaan dan Aneva. Halaman ini hanya menandai — tidak mengubah apa pun.
                        </p>
                    </div>
                    <label className="text-sm">
                        Tahun{' '}
                        <select
                            className="ml-1 rounded border px-2 py-1"
                            value={String(filters.tahun)}
                            onChange={(e) => router.get('/erpika/pemeriksaan', { tahun: e.target.value }, { preserveState: true })}
                        >
                            <option value="semua">Semua tahun</option>
                            {tahunTersedia.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div
                    className={`flex items-center gap-2 rounded-md border p-3 text-sm ${hasil.jumlah === 0 ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-amber-500/50 bg-amber-500/5'}`}
                >
                    {hasil.jumlah === 0 ? <CircleCheck className="h-4 w-4 text-emerald-600" /> : <TriangleAlert className="h-4 w-4 text-amber-600" />}
                    {hasil.jumlah === 0
                        ? 'Tidak ada temuan untuk tahun ini.'
                        : `${hasil.jumlah} temuan dalam ${kelompok.filter((k) => k.jumlah > 0).length} kelompok.`}
                </div>

                <div className="flex flex-wrap gap-2">
                    {kelompok.map((k) => (
                        <a key={k.kode} href={`#${k.kode}`}>
                            <Button variant={k.jumlah > 0 ? 'secondary' : 'ghost'} size="sm">
                                {JUDUL[k.kode].judul}
                                <span className={`ml-2 rounded-full px-2 text-xs ${k.jumlah > 0 ? 'bg-amber-500 text-white' : 'bg-muted'}`}>
                                    {k.jumlah}
                                </span>
                            </Button>
                        </a>
                    ))}
                </div>

                {kelompok
                    .filter((k) => k.jumlah > 0)
                    .map((k) => (
                        <Card key={k.kode} id={k.kode}>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    {JUDUL[k.kode].judul} <span className="text-muted-foreground font-normal">({k.jumlah})</span>
                                </CardTitle>
                                <p className="text-muted-foreground text-sm">{JUDUL[k.kode].arti}</p>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <tbody>
                                            {k.kode === 'st_ganda' &&
                                                t.st_ganda.map((g) => (
                                                    <tr key={`${g.tahun}-${g.nomor_st}`} className="border-t">
                                                        <td className="py-1 pr-3 font-medium whitespace-nowrap">{g.nomor_st}</td>
                                                        <td className="py-1">
                                                            {g.penugasan.map((p) => (
                                                                <div key={p.id}>
                                                                    <Tautan r={p} /> — {p.uraian ?? '-'}
                                                                </div>
                                                            ))}
                                                        </td>
                                                    </tr>
                                                ))}
                                            {k.kode === 'tumpang_tindih' &&
                                                t.tumpang_tindih.map((x, i) => (
                                                    <tr key={i} className="border-t">
                                                        <td className="py-1 pr-3 font-medium whitespace-nowrap">{x.nama}</td>
                                                        <td className="py-1">
                                                            <div>
                                                                <Tautan r={x.a} /> {x.a.nomor_st} ({x.a.mulai} s.d. {x.a.selesai}) — {x.a.uraian}
                                                            </div>
                                                            <div>
                                                                <Tautan r={x.b} /> {x.b.nomor_st} ({x.b.mulai} s.d. {x.b.selesai}) — {x.b.uraian}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            {k.kode === 'pegawai_tanpa_nip' &&
                                                t.pegawai_tanpa_nip.map((e) => (
                                                    <tr key={e.id} className="border-t">
                                                        <td className="py-1 pr-3 font-medium">{e.nama}</td>
                                                        <td className="py-1">
                                                            {e.jabatan ?? '-'} —{' '}
                                                            <Link href="/erpika/pegawai" className="underline">
                                                                lengkapi di Pegawai
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            {[
                                                'tanpa_uraian',
                                                'st_tanpa_tanggal',
                                                'masa_tanpa_st',
                                                'status_tidak_selaras',
                                                'belum_sinkron_aneva',
                                            ].includes(k.kode) &&
                                                (t[k.kode] as Rujukan[]).map((r) => (
                                                    <tr key={r.id} className="border-t">
                                                        <td className="py-1 pr-3 whitespace-nowrap">
                                                            <Tautan r={r} />
                                                        </td>
                                                        <td className="py-1 pr-3 whitespace-nowrap">{r.nomor_st ?? '-'}</td>
                                                        <td className="py-1 pr-3">{r.uraian ?? '-'}</td>
                                                        <td className="text-muted-foreground py-1 whitespace-nowrap">
                                                            {r.status}
                                                            {r.jumlah_laporan !== undefined && `, ${r.jumlah_laporan} laporan`}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
            </div>
        </AppLayout>
    );
}
