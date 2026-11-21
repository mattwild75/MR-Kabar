import { BenderaIsyarat, HURUF } from '@/components/edukasi/bendera-isyarat';
import { KUNCI_TERSEMBUNYI, TombolKunci } from '@/components/edukasi/tombol-kunci';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { formatAngka, formatJam, formatMilidetik, formatTanggalJam, kategoriPaham, rentangMengisi } from '@/lib/tes-edukasi';
import { kalimatUjiT, type Analisis, type BarisNilai, type Butir, type PelatihanHasil, type SoalHasil } from '@/lib/tes-hasil';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, FileDown, FileSpreadsheet, Settings2, XCircle } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';

/**
 * Hasil dan analisis pre-test/post-test satu pelatihan (admin dan
 * super-admin). Seluruh angka dihitung di server (AnalisisTesService) dari
 * kunci bank soal saat ini. Tidak ada batas lulus: yang dibaca adalah nilai,
 * kenaikan, dan penguasaan per bagian.
 */

interface Props {
    pelatihan: PelatihanHasil;
    analisis: Analisis;
    soal: { pre: SoalHasil[]; post: SoalHasil[] };
    bagian: Record<string, string>;
}

type Tab = 'ringkasan' | 'peringkat' | 'peserta' | 'bagian' | 'soal' | 'skpk';

const TAB: { id: Tab; label: string }[] = [
    { id: 'ringkasan', label: 'Ringkasan' },
    { id: 'peringkat', label: 'Peringkat' },
    { id: 'peserta', label: 'Peserta' },
    { id: 'bagian', label: 'Per bagian' },
    { id: 'soal', label: 'Per soal' },
    { id: 'skpk', label: 'Per SKPK' },
];

export default function Hasil({ pelatihan, analisis, soal, bagian }: Props) {
    const [tab, setTab] = useState<Tab>('ringkasan');
    // Kunci tersembunyi setiap kali halaman dibuka: halaman ini bisa ikut tampil di proyektor.
    const [tampilKunci, setTampilKunci] = useState(false);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Video Edukasi', href: '/edukasi' },
                { title: 'Kelola Tes', href: '/edukasi/kelola' },
                { title: 'Hasil & Analisis', href: `/edukasi/hasil/${pelatihan.id}` },
            ]}
        >
            <Head title={`Hasil ${pelatihan.nama}`} />
            <div className="mx-auto max-w-7xl space-y-5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold">Hasil Pre-Test dan Post-Test</h1>
                        <p className="text-muted-foreground text-sm">
                            {pelatihan.nama}
                            {pelatihan.tanggal &&
                                ` · ${new Date(pelatihan.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                            {pelatihan.tempat && ` · ${pelatihan.tempat}`}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild size="sm" variant="outline">
                            <a href={`/edukasi/hasil/${pelatihan.id}/excel`}>
                                <FileSpreadsheet className="h-4 w-4" /> Excel
                            </a>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                            <a href={`/edukasi/hasil/${pelatihan.id}/pdf?jenis=laporan`}>
                                <FileDown className="h-4 w-4" /> PDF laporan
                            </a>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                            <a href={`/edukasi/hasil/${pelatihan.id}/pdf?jenis=hadir`}>
                                <FileDown className="h-4 w-4" /> PDF daftar hadir
                            </a>
                        </Button>
                        <TombolKunci tampil={tampilKunci} onUbah={setTampilKunci} />
                        <Button asChild size="sm" variant="ghost">
                            <Link href="/edukasi/kelola">
                                <Settings2 className="h-4 w-4" /> Kelola
                            </Link>
                        </Button>
                    </div>
                </div>

                <nav className="flex flex-wrap gap-1 border-b" aria-label="Bagian hasil">
                    {TAB.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setTab(t.id)}
                            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${tab === t.id ? 'border-sky-600 text-sky-700 dark:text-sky-300' : 'text-muted-foreground hover:text-foreground border-transparent'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </nav>

                {tab === 'ringkasan' && <Ringkasan a={analisis} />}
                {tab === 'peringkat' && <Peringkat a={analisis} />}
                {tab === 'peserta' && <DaftarPeserta a={analisis} soal={soal} bagian={bagian} tampilKunci={tampilKunci} />}
                {tab === 'bagian' && <PerBagian a={analisis} />}
                {tab === 'soal' && <PerSoal a={analisis} soal={soal} bagian={bagian} tampilKunci={tampilKunci} />}
                {tab === 'skpk' && <PerSkpk a={analisis} />}
            </div>
        </AppLayout>
    );
}

function Kartu({ label, nilai, catatan }: { label: string; nilai: ReactNode; catatan?: ReactNode }) {
    return (
        <div className="bg-card rounded-md border p-4">
            <p className="text-muted-foreground text-xs">{label}</p>
            <p className="text-2xl font-semibold tabular-nums">{nilai}</p>
            {catatan && <p className="text-muted-foreground mt-1 text-xs">{catatan}</p>}
        </div>
    );
}

function Ringkasan({ a }: { a: Analisis }) {
    const k = a.peningkatan.kategori_ngain;
    const baris: { label: string; kunci: keyof Analisis['pre']['deskripsi'] }[] = [
        { label: 'Jumlah peserta', kunci: 'n' },
        { label: 'Rata-rata', kunci: 'rata' },
        { label: 'Median', kunci: 'median' },
        { label: 'Simpangan baku', kunci: 'sd' },
        { label: 'Terendah', kunci: 'min' },
        { label: 'Tertinggi', kunci: 'max' },
    ];

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Kartu label="Rata-rata pre-test" nilai={formatAngka(a.pre.deskripsi.rata, 2)} catatan={`${a.pre.deskripsi.n} peserta`} />
                <Kartu label="Rata-rata post-test" nilai={formatAngka(a.post.deskripsi.rata, 2)} catatan={`${a.post.deskripsi.n} peserta`} />
                <Kartu
                    label="Rata-rata kenaikan"
                    nilai={formatAngka(a.peningkatan.rata_kenaikan, 2)}
                    catatan={`${a.peningkatan.n} peserta ikut keduanya`}
                />
                <Kartu
                    label="Rata-rata N-gain"
                    nilai={formatAngka(a.peningkatan.rata_ngain, 2)}
                    catatan={`tinggi ${k.tinggi} · sedang ${k.sedang} · rendah ${k.rendah}`}
                />
            </div>

            <div className="bg-card rounded-md border p-4 text-sm leading-relaxed">
                <p className="mb-1 font-semibold">Simpulan uji-t berpasangan</p>
                <p>{kalimatUjiT(a)}</p>
                {a.peningkatan.uji_t?.t != null && (
                    <p className="text-muted-foreground mt-2 text-xs">
                        Rata-rata selisih {formatAngka(a.peningkatan.uji_t.rata_selisih, 2)}, simpangan baku selisih{' '}
                        {formatAngka(a.peningkatan.uji_t.sd_selisih, 2)}. Ukuran efek dz: kecil 0,2; sedang 0,5; besar 0,8 (Cohen). N-gain (Hake):
                        tinggi ≥ 0,7; sedang 0,3–0,7; rendah &lt; 0,3.
                    </p>
                )}
            </div>

            <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                        <tr>
                            <th className="px-3 py-2">Ukuran</th>
                            <th className="px-3 py-2 text-right">Pre-Test</th>
                            <th className="px-3 py-2 text-right">Post-Test</th>
                        </tr>
                    </thead>
                    <tbody>
                        {baris.map((b) => (
                            <tr key={b.kunci} className="border-t">
                                <td className="px-3 py-2">{b.label}</td>
                                <td className="px-3 py-2 text-right tabular-nums">{formatAngka(a.pre.deskripsi[b.kunci], 2)}</td>
                                <td className="px-3 py-2 text-right tabular-nums">{formatAngka(a.post.deskripsi[b.kunci], 2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Sebaran a={a} />
        </div>
    );
}

/** Sebaran nilai per rentang 10 poin, pre dibanding post. */
function Sebaran({ a }: { a: Analisis }) {
    const rentang = Array.from({ length: 10 }, (_, i) => i * 10);
    const hitung = (daftar: BarisNilai[]) =>
        rentang.map((r) => daftar.filter((x) => (r === 90 ? x.nilai >= 90 : x.nilai >= r && x.nilai < r + 10)).length);
    const pre = hitung(a.pre.peserta);
    const post = hitung(a.post.peserta);
    const maks = Math.max(1, ...pre, ...post);

    return (
        <div className="bg-card rounded-md border p-4">
            <p className="mb-3 text-sm font-semibold">Sebaran nilai</p>
            <div className="flex h-40 items-end gap-2">
                {rentang.map((r, i) => (
                    <div key={r} className="flex flex-1 flex-col items-center gap-1">
                        <div className="flex h-32 w-full items-end justify-center gap-0.5">
                            <div className="w-1/2 rounded-t bg-slate-400" style={{ height: `${(pre[i] / maks) * 100}%` }} title={`Pre ${pre[i]}`} />
                            <div className="w-1/2 rounded-t bg-sky-600" style={{ height: `${(post[i] / maks) * 100}%` }} title={`Post ${post[i]}`} />
                        </div>
                        <span className="text-muted-foreground text-[10px] tabular-nums">{r === 90 ? '90–100' : `${r}–${r + 9}`}</span>
                    </div>
                ))}
            </div>
            <p className="text-muted-foreground mt-2 flex gap-4 text-xs">
                <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-sm bg-slate-400" /> Pre-test
                </span>
                <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-sm bg-sky-600" /> Post-test
                </span>
            </p>
        </div>
    );
}

function Peringkat({ a }: { a: Analisis }) {
    const [jenis, setJenis] = useState<'post' | 'pre' | 'naik'>('post');

    return (
        <div className="space-y-3">
            <div className="flex gap-1">
                {(
                    [
                        ['post', 'Post-Test'],
                        ['pre', 'Pre-Test'],
                        ['naik', 'Peningkatan (N-gain)'],
                    ] as const
                ).map(([k, l]) => (
                    <Button key={k} size="sm" variant={jenis === k ? 'default' : 'outline'} onClick={() => setJenis(k)}>
                        {l}
                    </Button>
                ))}
            </div>
            <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                        {jenis === 'naik' ? (
                            <tr>
                                <th className="px-3 py-2">#</th>
                                <th className="px-3 py-2">Nama</th>
                                <th className="px-3 py-2">SKPK / Instansi</th>
                                <th className="px-3 py-2 text-right">Pre</th>
                                <th className="px-3 py-2 text-right">Post</th>
                                <th className="px-3 py-2 text-right">Kenaikan</th>
                                <th className="px-3 py-2 text-right">N-gain</th>
                                <th className="px-3 py-2">Kategori</th>
                            </tr>
                        ) : (
                            <tr>
                                <th className="px-3 py-2">#</th>
                                <th className="px-3 py-2">Nama</th>
                                <th className="px-3 py-2">Jabatan</th>
                                <th className="px-3 py-2">SKPK / Instansi</th>
                                <th className="px-3 py-2 text-right">Nilai</th>
                                <th className="px-3 py-2 text-right">Benar</th>
                                <th
                                    className="px-3 py-2 text-right"
                                    title="Penentu peringkat bila nilai sama: jumlah milidetik pada jawaban yang benar"
                                >
                                    Waktu jawaban benar
                                </th>
                                <th className="px-3 py-2 text-right">Waktu total</th>
                                <th className="px-3 py-2">Tanggal dan jam mengisi</th>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {jenis === 'naik'
                            ? a.pasangan.map((p) => (
                                  <tr key={`${p.id_pre}-${p.id_post}`} className="border-t">
                                      <td className="px-3 py-2 tabular-nums">{p.peringkat}</td>
                                      <td className="px-3 py-2 font-medium">{p.nama}</td>
                                      <td className="px-3 py-2">{p.instansi}</td>
                                      <td className="px-3 py-2 text-right tabular-nums">{formatAngka(p.pre, 2)}</td>
                                      <td className="px-3 py-2 text-right tabular-nums">{formatAngka(p.post, 2)}</td>
                                      <td className={`px-3 py-2 text-right tabular-nums ${p.kenaikan < 0 ? 'text-rose-600' : ''}`}>
                                          {formatAngka(p.kenaikan, 2)}
                                      </td>
                                      <td className="px-3 py-2 text-right tabular-nums">{formatAngka(p.ngain, 2)}</td>
                                      <td className="px-3 py-2 capitalize">{p.kategori ?? '-'}</td>
                                  </tr>
                              ))
                            : a[jenis].peserta.map((r) => (
                                  <tr key={r.id} className="border-t">
                                      <td className="px-3 py-2 tabular-nums">{r.peringkat}</td>
                                      <td className="px-3 py-2 font-medium">{r.nama}</td>
                                      <td className="px-3 py-2">{r.jabatan}</td>
                                      <td className="px-3 py-2">{r.instansi}</td>
                                      <td className="px-3 py-2 text-right font-semibold tabular-nums">{formatAngka(r.nilai, 2)}</td>
                                      <td className="px-3 py-2 text-right tabular-nums">
                                          {r.benar}/{r.jumlah_soal}
                                      </td>
                                      <td className="px-3 py-2 text-right tabular-nums">{formatMilidetik(r.waktu_benar_ms)}</td>
                                      <td className="px-3 py-2 text-right tabular-nums">{formatAngka(r.total_waktu_ms / 1000, 1)} dtk</td>
                                      <td className="px-3 py-2 whitespace-nowrap tabular-nums">
                                          {rentangMengisi(r.jawaban_pertama ?? r.biodata_pada, r.jawaban_terakhir)}
                                      </td>
                                  </tr>
                              ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

interface BarisGabung {
    kunci: string;
    nama: string;
    nip: string | null;
    jabatan: string;
    instansi: string;
    pre: BarisNilai | null;
    post: BarisNilai | null;
    kenaikan: number | null;
    ngain: number | null;
}

function DaftarPeserta({ a, soal, bagian, tampilKunci }: { a: Analisis; soal: Props['soal']; bagian: Record<string, string>; tampilKunci: boolean }) {
    const [cari, setCari] = useState('');
    const [pilih, setPilih] = useState<BarisGabung | null>(null);

    const gabung = useMemo(() => {
        const pre = new Map(a.pre.peserta.map((r) => [r.id, r]));
        const post = new Map(a.post.peserta.map((r) => [r.id, r]));
        const terpakaiPre = new Set<number>();
        const terpakaiPost = new Set<number>();
        const hasil: BarisGabung[] = a.pasangan.map((p) => {
            terpakaiPre.add(p.id_pre);
            terpakaiPost.add(p.id_post);

            return {
                kunci: `p${p.id_pre}-${p.id_post}`,
                nama: p.nama,
                nip: p.nip,
                jabatan: p.jabatan,
                instansi: p.instansi,
                pre: pre.get(p.id_pre) ?? null,
                post: post.get(p.id_post) ?? null,
                kenaikan: p.kenaikan,
                ngain: p.ngain,
            };
        });
        a.pre.peserta
            .filter((r) => !terpakaiPre.has(r.id))
            .forEach((r) =>
                hasil.push({
                    kunci: `a${r.id}`,
                    nama: r.nama,
                    nip: r.nip,
                    jabatan: r.jabatan,
                    instansi: r.instansi,
                    pre: r,
                    post: null,
                    kenaikan: null,
                    ngain: null,
                }),
            );
        a.post.peserta
            .filter((r) => !terpakaiPost.has(r.id))
            .forEach((r) =>
                hasil.push({
                    kunci: `b${r.id}`,
                    nama: r.nama,
                    nip: r.nip,
                    jabatan: r.jabatan,
                    instansi: r.instansi,
                    pre: null,
                    post: r,
                    kenaikan: null,
                    ngain: null,
                }),
            );

        return hasil.sort((x, y) => x.nama.localeCompare(y.nama, 'id'));
    }, [a]);

    const q = cari.trim().toLowerCase();
    const daftar = gabung.filter((g) => q === '' || `${g.nama} ${g.nip ?? ''} ${g.jabatan} ${g.instansi}`.toLowerCase().includes(q));

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nama, NIP, jabatan, SKPK" className="max-w-xs" />
                <span className="text-muted-foreground text-sm">{daftar.length} peserta · klik baris untuk rinciannya</span>
            </div>
            <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                        <tr>
                            <th className="px-3 py-2">Nama</th>
                            <th className="px-3 py-2">NIP</th>
                            <th className="px-3 py-2">Jabatan</th>
                            <th className="px-3 py-2">SKPK / Instansi</th>
                            <th className="px-3 py-2 text-right">Pre</th>
                            <th className="px-3 py-2 text-right">Post</th>
                            <th className="px-3 py-2 text-right">Kenaikan</th>
                            <th className="px-3 py-2 text-right">N-gain</th>
                            <th className="px-3 py-2">Mengisi pre-test</th>
                            <th className="px-3 py-2">Mengisi post-test</th>
                            <th className="px-3 py-2 text-right">Keluar halaman</th>
                        </tr>
                    </thead>
                    <tbody>
                        {daftar.map((g) => (
                            <tr key={g.kunci} className="hover:bg-muted/30 cursor-pointer border-t" onClick={() => setPilih(g)}>
                                <td className="px-3 py-2 font-medium">{g.nama}</td>
                                <td className="px-3 py-2 tabular-nums">{g.nip ?? 'Bukan ASN'}</td>
                                <td className="px-3 py-2">{g.jabatan}</td>
                                <td className="px-3 py-2">{g.instansi}</td>
                                <td className="px-3 py-2 text-right tabular-nums">{g.pre ? formatAngka(g.pre.nilai, 2) : '-'}</td>
                                <td className="px-3 py-2 text-right tabular-nums">{g.post ? formatAngka(g.post.nilai, 2) : '-'}</td>
                                <td className="px-3 py-2 text-right tabular-nums">{formatAngka(g.kenaikan, 2)}</td>
                                <td className="px-3 py-2 text-right tabular-nums">{formatAngka(g.ngain, 2)}</td>
                                <td className="px-3 py-2 text-xs whitespace-nowrap tabular-nums">
                                    {g.pre ? rentangMengisi(g.pre.jawaban_pertama ?? g.pre.biodata_pada, g.pre.jawaban_terakhir) : '-'}
                                </td>
                                <td className="px-3 py-2 text-xs whitespace-nowrap tabular-nums">
                                    {g.post ? rentangMengisi(g.post.jawaban_pertama ?? g.post.biodata_pada, g.post.jawaban_terakhir) : '-'}
                                </td>
                                <td className="px-3 py-2 text-right tabular-nums">{(g.pre?.jumlah_keluar ?? 0) + (g.post?.jumlah_keluar ?? 0)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {pilih && <RincianPeserta g={pilih} soal={soal} bagian={bagian} tampilKunci={tampilKunci} onTutup={() => setPilih(null)} />}
        </div>
    );
}

function RincianPeserta({
    g,
    soal,
    bagian,
    tampilKunci,
    onTutup,
}: {
    g: BarisGabung;
    soal: Props['soal'];
    bagian: Record<string, string>;
    tampilKunci: boolean;
    onTutup: () => void;
}) {
    const persenBagian = (r: BarisNilai | null, jenis: 'pre' | 'post', b: number) => {
        if (!r) {
            return null;
        }
        const jumlah = soal[jenis].filter((s) => s.bagian === b).length;

        return jumlah ? Math.round(((r.per_bagian[String(b)] ?? 0) / jumlah) * 100) : null;
    };

    return (
        <Dialog open onOpenChange={(o) => !o && onTutup()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{g.nama}</DialogTitle>
                </DialogHeader>
                <p className="text-muted-foreground -mt-2 text-sm">
                    {g.nip ? `NIP ${g.nip}` : 'Bukan ASN'} · {g.jabatan} · {g.instansi}
                </p>

                <div className="grid gap-3 sm:grid-cols-4">
                    <Kartu
                        label="Pre-test"
                        nilai={g.pre ? formatAngka(g.pre.nilai, 2) : '-'}
                        catatan={g.pre ? `peringkat ${g.pre.peringkat}` : 'tidak ikut'}
                    />
                    <Kartu
                        label="Post-test"
                        nilai={g.post ? formatAngka(g.post.nilai, 2) : '-'}
                        catatan={g.post ? `peringkat ${g.post.peringkat}` : 'tidak ikut'}
                    />
                    <Kartu label="Kenaikan" nilai={formatAngka(g.kenaikan, 2)} />
                    <Kartu label="N-gain" nilai={formatAngka(g.ngain, 2)} />
                </div>

                <div className="space-y-2">
                    <p className="text-sm font-semibold">Penguasaan per bagian</p>
                    {Object.entries(bagian).map(([b, nama]) => {
                        const pre = persenBagian(g.pre, 'pre', Number(b));
                        const post = persenBagian(g.post, 'post', Number(b));
                        const kat = kategoriPaham(post ?? pre);

                        return (
                            <div key={b} className="grid grid-cols-[12rem_1fr_6rem] items-center gap-3 text-sm">
                                <span>
                                    {b}. {nama}
                                </span>
                                <div className="space-y-1">
                                    <div className="bg-muted h-2 overflow-hidden rounded-full">
                                        <div className="h-full bg-slate-400" style={{ width: `${pre ?? 0}%` }} />
                                    </div>
                                    <div className="bg-muted h-2 overflow-hidden rounded-full">
                                        <div className="h-full bg-sky-600" style={{ width: `${post ?? 0}%` }} />
                                    </div>
                                </div>
                                {kat ? <span className={`rounded px-1.5 py-0.5 text-center text-[11px] ${kat.kelas}`}>{kat.label}</span> : <span />}
                            </div>
                        );
                    })}
                    <p className="text-muted-foreground text-xs">Batang abu-abu: pre-test · batang biru: post-test.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {(['pre', 'post'] as const).map((jenis) => {
                        const r = g[jenis];

                        return (
                            <div key={jenis} className="space-y-1">
                                <p className="text-sm font-semibold">{jenis === 'pre' ? 'Jawaban pre-test' : 'Jawaban post-test'}</p>
                                {r && (
                                    <dl className="text-muted-foreground grid grid-cols-[8rem_1fr] gap-x-2 text-xs tabular-nums">
                                        <dt>Bergabung</dt>
                                        <dd>{formatTanggalJam(r.bergabung_pada)}</dd>
                                        <dt>Biodata diisi</dt>
                                        <dd>{formatTanggalJam(r.biodata_pada)}</dd>
                                        <dt>Jawaban pertama</dt>
                                        <dd>{formatTanggalJam(r.jawaban_pertama)}</dd>
                                        <dt>Jawaban terakhir</dt>
                                        <dd>{formatTanggalJam(r.jawaban_terakhir)}</dd>
                                    </dl>
                                )}
                                {!r ? (
                                    <p className="text-muted-foreground text-sm">Tidak ikut.</p>
                                ) : (
                                    <table className="w-full text-xs">
                                        <tbody>
                                            {soal[jenis].map((s) => {
                                                const jwb = r.pilihan[String(s.nomor)];
                                                const benar = jwb === s.kunci;

                                                return (
                                                    <tr key={s.nomor} className="border-t">
                                                        <td className="w-6 py-1 tabular-nums">{s.nomor}</td>
                                                        <td className="py-1">{s.indikator}</td>
                                                        <td className="w-14 py-1 text-center">
                                                            {jwb ? (
                                                                tampilKunci ? (
                                                                    <span
                                                                        className={`inline-flex items-center gap-1 ${benar ? 'text-emerald-600' : 'text-rose-600'}`}
                                                                    >
                                                                        {benar ? (
                                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                                        ) : (
                                                                            <XCircle className="h-3.5 w-3.5" />
                                                                        )}
                                                                        {jwb}
                                                                    </span>
                                                                ) : (
                                                                    <span className="font-medium">{jwb}</span>
                                                                )
                                                            ) : (
                                                                <span className="text-muted-foreground">kosong</span>
                                                            )}
                                                        </td>
                                                        <td className="text-muted-foreground w-14 py-1 text-right tabular-nums">
                                                            {r.waktu[String(s.nomor)] !== undefined
                                                                ? `${formatAngka(r.waktu[String(s.nomor)] / 1000, 1)} dtk`
                                                                : ''}
                                                        </td>
                                                        <td
                                                            className="text-muted-foreground w-16 py-1 text-right tabular-nums"
                                                            title="Jam jawaban dikirim"
                                                        >
                                                            {r.dijawab_pada?.[String(s.nomor)] ? formatJam(r.dijawab_pada[String(s.nomor)]) : ''}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function PerBagian({ a }: { a: Analisis }) {
    return (
        <div className="space-y-3">
            <p className="text-muted-foreground text-sm">
                Persentase rata-rata jawaban benar per bagian. Sudah paham ≥ 75%, cukup 50–74%, perlu diperkuat &lt; 50%.
            </p>
            <div className="space-y-3">
                {a.bagian.map((b) => {
                    const katPre = kategoriPaham(b.pre);
                    const katPost = kategoriPaham(b.post);

                    return (
                        <div key={b.bagian} className="bg-card space-y-2 rounded-md border p-4">
                            <p className="font-semibold">
                                {b.bagian}. {b.nama}
                            </p>
                            {(
                                [
                                    ['Pre-test', b.pre, katPre, 'bg-slate-400'],
                                    ['Post-test', b.post, katPost, 'bg-sky-600'],
                                ] as const
                            ).map(([label, nilai, kat, warna]) => (
                                <div key={label} className="grid grid-cols-[5rem_1fr_3.5rem_7rem] items-center gap-3 text-sm">
                                    <span className="text-muted-foreground">{label}</span>
                                    <div className="bg-muted h-3 overflow-hidden rounded-full">
                                        <div className={`h-full ${warna}`} style={{ width: `${nilai ?? 0}%` }} />
                                    </div>
                                    <span className="text-right tabular-nums">{nilai === null ? '-' : `${formatAngka(nilai)}%`}</span>
                                    {kat ? (
                                        <span className={`rounded px-1.5 py-0.5 text-center text-[11px] ${kat.kelas}`}>{kat.label}</span>
                                    ) : (
                                        <span />
                                    )}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function PerSoal({ a, soal, bagian, tampilKunci }: { a: Analisis; soal: Props['soal']; bagian: Record<string, string>; tampilKunci: boolean }) {
    const [jenis, setJenis] = useState<'pre' | 'post'>('post');
    const [buka, setBuka] = useState<number | null>(null);
    const butir: Butir[] = a[jenis].butir;

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                {(['pre', 'post'] as const).map((j) => (
                    <Button key={j} size="sm" variant={jenis === j ? 'default' : 'outline'} onClick={() => setJenis(j)}>
                        {j === 'pre' ? 'Pre-Test' : 'Post-Test'}
                    </Button>
                ))}
                <span className="text-muted-foreground text-xs">
                    Tingkat kesukaran = proporsi benar (&gt; 0,7 mudah; 0,3–0,7 sedang; &lt; 0,3 sukar). Daya beda = kelompok atas 27% dikurangi
                    kelompok bawah 27%.
                </span>
            </div>
            <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                        <tr>
                            <th className="px-3 py-2">No</th>
                            <th className="px-3 py-2">Indikator</th>
                            <th className="px-3 py-2 text-center">Kunci</th>
                            <th className="px-3 py-2">Sebaran jawaban</th>
                            <th className="px-3 py-2 text-right">Kesukaran</th>
                            <th className="px-3 py-2 text-right">Daya beda</th>
                            <th className="px-3 py-2 text-right">Rata waktu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {butir.map((b) => {
                            const s = soal[jenis].find((x) => x.nomor === b.nomor);
                            const jumlah = HURUF.reduce((n, h) => n + b.sebaran[h], 0) + b.sebaran.kosong;

                            return (
                                <FragmenButir
                                    key={b.nomor}
                                    b={b}
                                    s={s}
                                    jumlah={jumlah}
                                    namaBagian={bagian[String(b.bagian)]}
                                    terbuka={buka === b.nomor}
                                    onBuka={() => setBuka(buka === b.nomor ? null : b.nomor)}
                                    tampilKunci={tampilKunci}
                                />
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function FragmenButir({
    b,
    s,
    jumlah,
    namaBagian,
    terbuka,
    onBuka,
    tampilKunci,
}: {
    b: Butir;
    s: SoalHasil | undefined;
    jumlah: number;
    namaBagian: string;
    terbuka: boolean;
    onBuka: () => void;
    tampilKunci: boolean;
}) {
    return (
        <>
            <tr className="hover:bg-muted/30 cursor-pointer border-t" onClick={onBuka}>
                <td className="px-3 py-2 tabular-nums">{b.nomor}</td>
                <td className="px-3 py-2">
                    {b.indikator}
                    <span className="text-muted-foreground block text-xs">{namaBagian}</span>
                </td>
                <td className="px-3 py-2 text-center font-semibold">{tampilKunci ? b.kunci : KUNCI_TERSEMBUNYI}</td>
                <td className="px-3 py-2">
                    <div className="flex h-4 w-48 overflow-hidden rounded">
                        {HURUF.map((h) => (
                            <div
                                key={h}
                                className={tampilKunci && h === b.kunci ? 'bg-emerald-500' : 'bg-slate-400/70'}
                                style={{ width: `${jumlah ? (b.sebaran[h] / jumlah) * 100 : 0}%` }}
                                title={`${h}: ${b.sebaran[h]}`}
                            />
                        ))}
                    </div>
                    <span className="text-muted-foreground text-xs tabular-nums">
                        A {b.sebaran.A} · B {b.sebaran.B} · C {b.sebaran.C} · D {b.sebaran.D}
                        {b.sebaran.kosong > 0 && ` · kosong ${b.sebaran.kosong}`}
                        {b.pengecoh_tidak_dipilih.length > 0 && ` · pengecoh ${b.pengecoh_tidak_dipilih.join(', ')} tidak pernah dipilih`}
                    </span>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                    {formatAngka(b.kesukaran, 2)}
                    <span className="text-muted-foreground block text-xs">{b.kategori_kesukaran ?? ''}</span>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                    {formatAngka(b.daya_beda, 2)}
                    <span className="text-muted-foreground block text-xs">{b.kategori_daya_beda ?? ''}</span>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                    {b.rata_waktu_detik === null ? '-' : `${formatAngka(b.rata_waktu_detik, 1)} dtk`}
                </td>
            </tr>
            {terbuka && s && (
                <tr className="bg-muted/20">
                    <td />
                    <td colSpan={6} className="space-y-1 px-3 py-3">
                        <p className="font-medium">{s.pertanyaan}</p>
                        {HURUF.map((h) => (
                            <p
                                key={h}
                                className={`flex items-start gap-2 ${tampilKunci && s.kunci === h ? 'font-semibold text-emerald-700 dark:text-emerald-400' : ''}`}
                            >
                                <BenderaIsyarat huruf={h} className="mt-0.5 h-4 w-6 shrink-0" />
                                {h}. {s.pilihan[h]}
                            </p>
                        ))}
                    </td>
                </tr>
            )}
        </>
    );
}

function PerSkpk({ a }: { a: Analisis }) {
    return (
        <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                    <tr>
                        <th className="px-3 py-2">SKPK / Instansi</th>
                        <th className="px-3 py-2 text-right">Peserta pre</th>
                        <th className="px-3 py-2 text-right">Peserta post</th>
                        <th className="px-3 py-2 text-right">Rata-rata pre</th>
                        <th className="px-3 py-2 text-right">Rata-rata post</th>
                        <th className="px-3 py-2 text-right">Rata-rata kenaikan</th>
                    </tr>
                </thead>
                <tbody>
                    {a.skpk.map((s) => (
                        <tr key={s.instansi} className="border-t">
                            <td className="px-3 py-2">{s.instansi}</td>
                            <td className="px-3 py-2 text-right tabular-nums">{s.n_pre}</td>
                            <td className="px-3 py-2 text-right tabular-nums">{s.n_post}</td>
                            <td className="px-3 py-2 text-right tabular-nums">{formatAngka(s.rata_pre, 2)}</td>
                            <td className="px-3 py-2 text-right tabular-nums">{formatAngka(s.rata_post, 2)}</td>
                            <td className="px-3 py-2 text-right tabular-nums">{formatAngka(s.rata_kenaikan, 2)}</td>
                        </tr>
                    ))}
                    {a.skpk.length === 0 && (
                        <tr>
                            <td colSpan={6} className="text-muted-foreground px-3 py-8 text-center">
                                Belum ada peserta.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
