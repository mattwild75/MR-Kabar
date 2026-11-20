import { Button } from '@/components/ui/button';
import { formatAngka, formatMilidetik, formatTanggalJam, rentangMengisi } from '@/lib/tes-edukasi';
import { kalimatUjiT, type Analisis, type BarisNilai, type PelatihanHasil, type SoalHasil } from '@/lib/tes-hasil';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileDown } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Halaman cetak hasil pre-test/post-test dan daftar hadir. Sumber PDF yang
 * dipotret Browsershot (preset baku aplikasi), sekaligus bisa dicetak
 * langsung dari peramban.
 */

interface Props {
    pelatihan: PelatihanHasil;
    analisis: Analisis;
    soal: { pre: SoalHasil[]; post: SoalHasil[] };
    bagian: Record<string, string>;
    jenisCetak: 'laporan' | 'hadir';
    dicetakPada: string;
}

function tanggalPanjang(t: string | null): string {
    return t ? new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';
}

function Bagian({ judul, children }: { judul: string; children: ReactNode }) {
    return (
        <section className="mt-6 break-inside-avoid-page">
            <h2 className="mb-2 text-[13px] font-bold uppercase">{judul}</h2>
            {children}
        </section>
    );
}

const sel = 'border border-black px-1.5 py-1';

export default function CetakHasil({ pelatihan, analisis: a, jenisCetak, dicetakPada }: Props) {
    const judul = jenisCetak === 'hadir' ? 'DAFTAR HADIR PESERTA PRE-TEST DAN POST-TEST' : 'LAPORAN HASIL PRE-TEST DAN POST-TEST';

    return (
        <div className="min-h-svh bg-white text-black">
            <Head title={judul} />
            <div className="flex items-center gap-2 border-b bg-slate-100 p-3 print:hidden">
                <Button asChild size="sm" variant="outline">
                    <Link href={`/edukasi/hasil/${pelatihan.id}`}>
                        <ArrowLeft className="h-4 w-4" /> Kembali
                    </Link>
                </Button>
                <Button asChild size="sm">
                    <a href={`/edukasi/hasil/${pelatihan.id}/pdf?jenis=${jenisCetak}`}>
                        <FileDown className="h-4 w-4" /> Unduh PDF
                    </a>
                </Button>
            </div>

            <div className="mx-auto max-w-[190mm] p-6 font-serif text-[11px] leading-snug print:max-w-none print:p-0">
                <header className="text-center">
                    <p className="text-[14px] font-bold">{judul}</p>
                    <p className="text-[13px] font-bold">{pelatihan.nama}</p>
                    <p>
                        {tanggalPanjang(pelatihan.tanggal)}
                        {pelatihan.tempat ? ` · ${pelatihan.tempat}` : ''}
                    </p>
                    <p className="mt-1">Inspektorat Kabupaten Aceh Barat · aplikasi MR Kabar</p>
                </header>

                {jenisCetak === 'hadir' ? <DaftarHadir a={a} /> : <Laporan a={a} />}

                <p className="mt-8 text-[9px] text-slate-600">Dicetak dari MR Kabar pada {dicetakPada}.</p>
            </div>

            <style>{`
                @media print {
                    @page { size: A4 portrait; margin: 14mm 12mm; }
                    body { background: white; }
                }
            `}</style>
        </div>
    );
}

function Laporan({ a }: { a: Analisis }) {
    const desk: [string, keyof Analisis['pre']['deskripsi']][] = [
        ['Jumlah peserta', 'n'],
        ['Rata-rata', 'rata'],
        ['Median', 'median'],
        ['Simpangan baku', 'sd'],
        ['Terendah', 'min'],
        ['Tertinggi', 'max'],
    ];
    const k = a.peningkatan.kategori_ngain;

    return (
        <>
            <Bagian judul="A. Ringkasan">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-100">
                            <th className={`${sel} text-left`}>Ukuran</th>
                            <th className={sel}>Pre-Test</th>
                            <th className={sel}>Post-Test</th>
                        </tr>
                    </thead>
                    <tbody>
                        {desk.map(([label, kunci]) => (
                            <tr key={kunci}>
                                <td className={sel}>{label}</td>
                                <td className={`${sel} text-center`}>{formatAngka(a.pre.deskripsi[kunci], 2)}</td>
                                <td className={`${sel} text-center`}>{formatAngka(a.post.deskripsi[kunci], 2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p className="mt-2">
                    Peserta yang mengikuti kedua tes: {a.peningkatan.n}. Rata-rata kenaikan nilai {formatAngka(a.peningkatan.rata_kenaikan, 2)};
                    rata-rata N-gain {formatAngka(a.peningkatan.rata_ngain, 2)} (tinggi {k.tinggi}, sedang {k.sedang}, rendah {k.rendah}).
                </p>
                <p className="mt-1">{kalimatUjiT(a)}</p>
            </Bagian>

            <Bagian judul="B. Penguasaan per bagian (% jawaban benar)">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-100">
                            <th className={`${sel} text-left`}>Bagian</th>
                            <th className={sel}>Pre-Test</th>
                            <th className={sel}>Post-Test</th>
                            <th className={sel}>Kategori post-test</th>
                        </tr>
                    </thead>
                    <tbody>
                        {a.bagian.map((b) => (
                            <tr key={b.bagian}>
                                <td className={sel}>
                                    {b.bagian}. {b.nama}
                                </td>
                                <td className={`${sel} text-center`}>{b.pre === null ? '-' : `${formatAngka(b.pre)}%`}</td>
                                <td className={`${sel} text-center`}>{b.post === null ? '-' : `${formatAngka(b.post)}%`}</td>
                                <td className={`${sel} text-center`}>{b.kategori_post ?? '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Bagian>

            {(['post', 'pre'] as const).map((jenis, i) => (
                <Bagian key={jenis} judul={`${i === 0 ? 'C' : 'D'}. Peringkat ${jenis === 'post' ? 'post-test' : 'pre-test'}`}>
                    <TabelPeringkat baris={a[jenis].peserta} />
                </Bagian>
            ))}

            <Bagian judul="E. Peningkatan per peserta">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-100">
                            <th className={sel}>No</th>
                            <th className={`${sel} text-left`}>Nama</th>
                            <th className={`${sel} text-left`}>SKPK / Instansi</th>
                            <th className={sel}>Pre</th>
                            <th className={sel}>Post</th>
                            <th className={sel}>Kenaikan</th>
                            <th className={sel}>N-gain</th>
                            <th className={sel}>Kategori</th>
                        </tr>
                    </thead>
                    <tbody>
                        {a.pasangan.map((p) => (
                            <tr key={`${p.id_pre}-${p.id_post}`}>
                                <td className={`${sel} text-center`}>{p.peringkat}</td>
                                <td className={sel}>{p.nama}</td>
                                <td className={sel}>{p.instansi}</td>
                                <td className={`${sel} text-center`}>{formatAngka(p.pre, 2)}</td>
                                <td className={`${sel} text-center`}>{formatAngka(p.post, 2)}</td>
                                <td className={`${sel} text-center`}>{formatAngka(p.kenaikan, 2)}</td>
                                <td className={`${sel} text-center`}>{formatAngka(p.ngain, 2)}</td>
                                <td className={`${sel} text-center capitalize`}>{p.kategori ?? '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Bagian>

            {(['pre', 'post'] as const).map((jenis, i) => (
                <Bagian key={`b-${jenis}`} judul={`${i === 0 ? 'F' : 'G'}. Analisis butir ${jenis === 'pre' ? 'pre-test' : 'post-test'}`}>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-100">
                                <th className={sel}>No</th>
                                <th className={`${sel} text-left`}>Indikator</th>
                                <th className={sel}>Kunci</th>
                                <th className={sel}>A</th>
                                <th className={sel}>B</th>
                                <th className={sel}>C</th>
                                <th className={sel}>D</th>
                                <th className={sel}>Kesukaran</th>
                                <th className={sel}>Daya beda</th>
                            </tr>
                        </thead>
                        <tbody>
                            {a[jenis].butir.map((b) => (
                                <tr key={b.nomor}>
                                    <td className={`${sel} text-center`}>{b.nomor}</td>
                                    <td className={sel}>{b.indikator}</td>
                                    <td className={`${sel} text-center`}>{b.kunci}</td>
                                    {(['A', 'B', 'C', 'D'] as const).map((h) => (
                                        <td key={h} className={`${sel} text-center ${h === b.kunci ? 'font-bold' : ''}`}>
                                            {b.sebaran[h]}
                                        </td>
                                    ))}
                                    <td className={`${sel} text-center`}>
                                        {formatAngka(b.kesukaran, 2)} {b.kategori_kesukaran ? `(${b.kategori_kesukaran})` : ''}
                                    </td>
                                    <td className={`${sel} text-center`}>
                                        {formatAngka(b.daya_beda, 2)} {b.kategori_daya_beda ? `(${b.kategori_daya_beda})` : ''}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Bagian>
            ))}
        </>
    );
}

function TabelPeringkat({ baris }: { baris: BarisNilai[] }) {
    return (
        <table className="w-full border-collapse">
            <thead>
                <tr className="bg-slate-100">
                    <th className={sel}>No</th>
                    <th className={`${sel} text-left`}>Nama</th>
                    <th className={sel}>NIP</th>
                    <th className={`${sel} text-left`}>Jabatan</th>
                    <th className={`${sel} text-left`}>SKPK / Instansi</th>
                    <th className={sel}>Benar</th>
                    <th className={sel}>Nilai</th>
                    <th className={sel}>Waktu jawaban benar</th>
                    <th className={sel}>Tanggal dan jam mengisi</th>
                </tr>
            </thead>
            <tbody>
                {baris.map((r) => (
                    <tr key={r.id}>
                        <td className={`${sel} text-center`}>{r.peringkat}</td>
                        <td className={sel}>{r.nama}</td>
                        <td className={`${sel} text-center whitespace-nowrap`}>{r.nip ?? 'Bukan ASN'}</td>
                        <td className={sel}>{r.jabatan}</td>
                        <td className={sel}>{r.instansi}</td>
                        <td className={`${sel} text-center`}>
                            {r.benar}/{r.jumlah_soal}
                        </td>
                        <td className={`${sel} text-center font-bold`}>{formatAngka(r.nilai, 2)}</td>
                        <td className={`${sel} text-center`}>{formatMilidetik(r.waktu_benar_ms)}</td>
                        <td className={`${sel} text-center`}>{rentangMengisi(r.jawaban_pertama ?? r.biodata_pada, r.jawaban_terakhir)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function DaftarHadir({ a }: { a: Analisis }) {
    const pre = new Map(a.pre.peserta.map((r) => [r.id, r]));
    const post = new Map(a.post.peserta.map((r) => [r.id, r]));
    const terpakaiPre = new Set<number>();
    const terpakaiPost = new Set<number>();
    const baris: { nama: string; nip: string | null; jabatan: string; instansi: string; pre: BarisNilai | null; post: BarisNilai | null }[] =
        a.pasangan.map((p) => {
            terpakaiPre.add(p.id_pre);
            terpakaiPost.add(p.id_post);

            return {
                nama: p.nama,
                nip: p.nip,
                jabatan: p.jabatan,
                instansi: p.instansi,
                pre: pre.get(p.id_pre) ?? null,
                post: post.get(p.id_post) ?? null,
            };
        });
    a.pre.peserta
        .filter((r) => !terpakaiPre.has(r.id))
        .forEach((r) => baris.push({ nama: r.nama, nip: r.nip, jabatan: r.jabatan, instansi: r.instansi, pre: r, post: null }));
    a.post.peserta
        .filter((r) => !terpakaiPost.has(r.id))
        .forEach((r) => baris.push({ nama: r.nama, nip: r.nip, jabatan: r.jabatan, instansi: r.instansi, pre: null, post: r }));
    baris.sort((x, y) => x.instansi.localeCompare(y.instansi, 'id') || x.nama.localeCompare(y.nama, 'id'));

    return (
        <table className="mt-5 w-full border-collapse">
            <thead>
                <tr className="bg-slate-100">
                    <th className={sel}>No</th>
                    <th className={`${sel} text-left`}>Nama</th>
                    <th className={sel}>NIP</th>
                    <th className={`${sel} text-left`}>Jabatan</th>
                    <th className={`${sel} text-left`}>SKPK / Instansi</th>
                    <th className={sel}>Hadir pre-test</th>
                    <th className={sel}>Hadir post-test</th>
                    <th className={`${sel} w-[28mm]`}>Tanda tangan</th>
                </tr>
            </thead>
            <tbody>
                {baris.map((b, i) => (
                    <tr key={i} className="h-[9mm]">
                        <td className={`${sel} text-center`}>{i + 1}</td>
                        <td className={sel}>{b.nama}</td>
                        <td className={`${sel} text-center whitespace-nowrap`}>{b.nip ?? 'Bukan ASN'}</td>
                        <td className={sel}>{b.jabatan}</td>
                        <td className={sel}>{b.instansi}</td>
                        <td className={`${sel} text-center`}>{b.pre ? formatTanggalJam(b.pre.bergabung_pada) : '-'}</td>
                        <td className={`${sel} text-center`}>{b.post ? formatTanggalJam(b.post.bergabung_pada) : '-'}</td>
                        <td className={sel} />
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
