import { PetaGraf } from '@/components/graphify/peta';
import { bangunIndeks, cari, type GNode, type Graf, jalurTerpendek, type Langkah, PRASETEL, tetangga, warna } from '@/components/graphify/tipe';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Copy, Download, FileText, Route as IkonJalur, Network, RefreshCw, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Meta {
    dibangun: string;
    durasi_detik: number;
    simpul: number;
    relasi: number;
    komunitas: number;
    commit?: string | null;
}

interface Props {
    meta: Meta;
    jenis: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Utilities', href: '#' },
    { title: 'Graphify', href: '/graphify' },
];

type Tab = 'peta' | 'jalur' | 'laporan' | 'temuan';

/** Rincian tambahan simpul yang layak ditampilkan (selain label/jenis/uraian). */
const RINCIAN: [string, string][] = [
    ['fqcn', 'Kelas'],
    ['file', 'Berkas'],
    ['baris', 'Jumlah baris'],
    ['bentuk', 'Bentuk'],
    ['uri', 'URI'],
    ['nama_rute', 'Nama rute'],
    ['aksi', 'Aksi'],
    ['route', 'Tautan menu'],
    ['izin', 'Izin menu'],
    ['ikon', 'Ikon'],
    ['tabel', 'Tabel'],
    ['kolom', 'Jumlah kolom'],
    ['daftar_kolom', 'Kolom'],
    ['ukuran_kb', 'Ukuran (KB)'],
    ['migrasi', 'Migrasi pembuat'],
    ['perintah', 'Perintah'],
    ['grup', 'Grup izin'],
    ['sumber', 'Sumber'],
];

function tanggal(iso: string) {
    try {
        return new Date(iso).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
    } catch {
        return iso;
    }
}

function TitikJenis({ type }: { type: string }) {
    return <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: warna(type) }} />;
}

/** Tombol simpul kecil (label berwarna jenis) yang bisa diklik. */
function ChipSimpul({ n, onKlik }: { n: GNode; onKlik: (id: string) => void }) {
    return (
        <button
            type="button"
            onClick={() => onKlik(n.id)}
            className="hover:bg-muted inline-flex max-w-full items-center gap-1.5 rounded px-1 py-0.5 text-left text-sm"
            title={n.desc ?? n.label}
        >
            <TitikJenis type={n.type} />
            <span className="truncate">{n.label}</span>
        </button>
    );
}

/** Kotak cari simpul dengan daftar hasil. */
function PilihSimpul({
    graf,
    nilai,
    onPilih,
    placeholder,
}: {
    graf: Graf;
    nilai: GNode | null;
    onPilih: (n: GNode | null) => void;
    placeholder: string;
}) {
    const [q, setQ] = useState('');
    const hasil = useMemo(() => cari(graf, q, 12), [graf, q]);
    if (nilai) {
        return (
            <div className="flex items-center gap-2 rounded-md border px-2 py-1.5">
                <TitikJenis type={nilai.type} />
                <span className="flex-1 truncate text-sm">{nilai.label}</span>
                <span className="text-muted-foreground text-xs">{graf.jenis[nilai.type] ?? nilai.type}</span>
                <button type="button" onClick={() => onPilih(null)} aria-label="Hapus pilihan">
                    <X className="h-4 w-4" />
                </button>
            </div>
        );
    }
    return (
        <div className="relative">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} />
            {hasil.length > 0 && (
                <div className="bg-popover absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-md border p-1 shadow-md">
                    {hasil.map((n) => (
                        <button
                            key={n.id}
                            type="button"
                            className="hover:bg-muted flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm"
                            onClick={() => {
                                onPilih(n);
                                setQ('');
                            }}
                        >
                            <TitikJenis type={n.type} />
                            <span className="flex-1 truncate">{n.label}</span>
                            <span className="text-muted-foreground shrink-0 text-xs">{graf.jenis[n.type] ?? n.type}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function GraphifyIndex({ meta, jenis }: Props) {
    const [graf, setGraf] = useState<Graf | null>(null);
    const [galat, setGalat] = useState(false);
    const [tab, setTab] = useState<Tab>('peta');
    const [aktif, setAktif] = useState<Set<string>>(new Set(PRASETEL.Ringkas));
    const [komunitas, setKomunitas] = useState<number>(-2);
    const [terpilih, setTerpilih] = useState<string | null>(null);
    const [kedalaman, setKedalaman] = useState(0);
    const [tampilLabel, setTampilLabel] = useState(true);
    const [fokus, setFokus] = useState(0);
    const [q, setQ] = useState('');
    const [membangun, setMembangun] = useState(false);
    const [jalurDari, setJalurDari] = useState<GNode | null>(null);
    const [jalurKe, setJalurKe] = useState<GNode | null>(null);
    const [hindariUmum, setHindariUmum] = useState(true);

    const muat = useCallback(() => {
        setGalat(false);
        fetch('/graphify/data', { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
            .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
            .then((g: Graf) => setGraf(g))
            .catch(() => setGalat(true));
    }, []);
    useEffect(muat, [muat, meta.dibangun]);

    const ix = useMemo(() => (graf ? bangunIndeks(graf) : null), [graf]);
    const hitungJenis = useMemo(() => {
        const h: Record<string, number> = {};
        for (const n of graf?.nodes ?? []) h[n.type] = (h[n.type] ?? 0) + 1;
        return h;
    }, [graf]);

    // Simpul yang tampil di peta.
    const { tampilNodes, tampilLinks, sorot } = useMemo(() => {
        if (!graf || !ix) return { tampilNodes: [], tampilLinks: [], sorot: new Set<string>() };
        let ids: Set<string>;
        if (terpilih && kedalaman > 0) {
            ids = tetangga(ix, terpilih, kedalaman);
            for (const id of [...ids]) {
                const n = ix.byId.get(id);
                if (id !== terpilih && n && !aktif.has(n.type)) ids.delete(id);
            }
        } else {
            ids = new Set(graf.nodes.filter((n) => aktif.has(n.type) && (komunitas === -2 || n.community === komunitas)).map((n) => n.id));
            if (terpilih) ids.add(terpilih);
        }
        const nodes = graf.nodes.filter((n) => ids.has(n.id));
        const links = graf.links.filter((l) => ids.has(l.source) && ids.has(l.target));
        const sorot = terpilih && kedalaman === 0 ? tetangga(ix, terpilih, 1) : new Set<string>();
        return { tampilNodes: nodes, tampilLinks: links, sorot };
    }, [graf, ix, aktif, komunitas, terpilih, kedalaman]);

    const pilih = useCallback(
        (id: string | null, pindahKePeta = false) => {
            setTerpilih(id);
            if (id && ix) {
                const n = ix.byId.get(id);
                if (n && !aktif.has(n.type)) setAktif((a) => new Set([...a, n.type]));
                if (n && komunitas !== -2 && n.community !== komunitas) setKomunitas(-2);
                setFokus((f) => f + 1);
            }
            if (pindahKePeta) setTab('peta');
        },
        [ix, aktif, komunitas],
    );

    const n = terpilih && ix ? ix.byId.get(terpilih) : undefined;
    const hasilCari = useMemo(() => (graf ? cari(graf, q, 15) : []), [graf, q]);

    const jalur: Langkah[] | null | undefined = useMemo(() => {
        if (!ix || !jalurDari || !jalurKe) return undefined;
        return jalurTerpendek(ix, jalurDari.id, jalurKe.id, hindariUmum ? ['izin', 'peran', 'pustaka', 'middleware', 'komponen'] : []);
    }, [ix, jalurDari, jalurKe, hindariUmum]);

    const utama = useMemo(
        () =>
            (graf?.nodes ?? [])
                .filter((x) => !['izin', 'peran', 'pustaka', 'middleware', 'komponen', 'rute', 'dokumen'].includes(x.type))
                .sort((a, b) => b.degree - a.degree)
                .slice(0, 30),
        [graf],
    );

    const bangunUlang = () => {
        setMembangun(true);
        router.post('/graphify/bangun', {}, { preserveScroll: true, onFinish: () => setMembangun(false) });
    };

    /** Ringkasan teks simpul + seluruh relasinya, siap ditempel ke catatan/dokumen. */
    const salinRingkasan = (x: GNode) => {
        const baris = [`# ${x.label} (${jenis[x.type] ?? x.type})`];
        if (x.desc) baris.push('', x.desc);
        for (const [k, label] of RINCIAN) if (x[k] !== undefined && x[k] !== null && x[k] !== '') baris.push(`- ${label}: ${String(x[k])}`);
        for (const k of kelompokRelasi(x.id)) baris.push('', `## ${k.judul}`, ...k.butir.map((b) => `- ${b.label} (${jenis[b.type] ?? b.type})`));
        if (!navigator.clipboard) {
            toast.error('Papan klip tidak tersedia di peramban ini.');
            return;
        }
        navigator.clipboard
            .writeText(baris.join(String.fromCharCode(10)))
            .then(() => toast.success('Ringkasan disalin.'))
            .catch(() => toast.error('Gagal menyalin ke papan klip.'));
    };

    const kelompokRelasi = (id: string) => {
        const hasil: { judul: string; butir: GNode[] }[] = [];
        const tambah = (judul: string, butir: GNode[]) => butir.length && hasil.push({ judul, butir });
        const perRel = (daftar: { rel: string; lain: string }[], arah: 'keluar' | 'masuk') => {
            const peta = new Map<string, GNode[]>();
            for (const d of daftar) {
                const t = ix?.byId.get(d.lain);
                if (!t) continue;
                const k = (arah === 'keluar' ? '→ ' : '← ') + d.rel;
                (peta.get(k) ?? peta.set(k, []).get(k)!).push(t);
            }
            for (const [k, v] of [...peta.entries()].sort((a, b) => b[1].length - a[1].length)) tambah(k, v);
        };
        perRel(
            (ix?.keluar.get(id) ?? []).map((l) => ({ rel: l.rel, lain: l.target })),
            'keluar',
        );
        perRel(
            (ix?.masuk.get(id) ?? []).map((l) => ({ rel: l.rel, lain: l.source })),
            'masuk',
        );
        return hasil;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Graphify" />
            <div className="flex flex-col gap-3 p-4 md:p-6">
                {/* Kepala */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="flex items-center gap-2 text-xl font-semibold">
                            <Network className="h-5 w-5" /> Graphify — Peta Pengetahuan MR Kabar
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {meta.simpul.toLocaleString('id-ID')} simpul · {meta.relasi.toLocaleString('id-ID')} relasi · {meta.komunitas} komunitas ·
                            dibangun {tanggal(meta.dibangun)}
                            {meta.commit ? ` dari commit ${meta.commit}` : ''} ({meta.durasi_detik} detik). Dibangun ulang otomatis tiap hari pukul
                            02.15.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <a href="/graphify/unduh/laporan">
                            <Button variant="outline" size="sm">
                                <FileText className="mr-1 h-4 w-4" /> Unduh Laporan
                            </Button>
                        </a>
                        <a href="/graphify/unduh/json">
                            <Button variant="outline" size="sm">
                                <Download className="mr-1 h-4 w-4" /> Unduh graph.json
                            </Button>
                        </a>
                        <Button size="sm" onClick={bangunUlang} disabled={membangun}>
                            <RefreshCw className={`mr-1 h-4 w-4 ${membangun ? 'animate-spin' : ''}`} /> {membangun ? 'Membangun…' : 'Bangun Ulang'}
                        </Button>
                    </div>
                </div>

                {/* Tab */}
                <div className="flex gap-1 border-b">
                    {(
                        [
                            ['peta', 'Peta'],
                            ['jalur', 'Jalur'],
                            ['laporan', 'Laporan'],
                            ['temuan', `Temuan (${graf?.temuan.reduce((s, t) => s + t.simpul.length, 0) ?? 0})`],
                        ] as [Tab, string][]
                    ).map(([k, t]) => (
                        <button
                            key={k}
                            type="button"
                            onClick={() => setTab(k)}
                            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${tab === k ? 'border-primary text-foreground' : 'text-muted-foreground hover:text-foreground border-transparent'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {galat && (
                    <p className="text-destructive text-sm">
                        Data peta gagal dimuat.{' '}
                        <button type="button" className="underline" onClick={muat}>
                            Coba lagi
                        </button>
                    </p>
                )}
                {!graf && !galat && <p className="text-muted-foreground text-sm">Memuat peta pengetahuan…</p>}

                {graf && ix && tab === 'peta' && (
                    <div className="grid gap-3 lg:grid-cols-[260px_minmax(0,1fr)_360px]">
                        {/* Panel filter */}
                        <aside className="space-y-3 text-sm">
                            <div className="relative">
                                <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari simpul…" className="pl-8" />
                                {hasilCari.length > 0 && (
                                    <div className="bg-popover absolute z-20 mt-1 max-h-80 w-full overflow-auto rounded-md border p-1 shadow-md">
                                        {hasilCari.map((h) => (
                                            <button
                                                key={h.id}
                                                type="button"
                                                className="hover:bg-muted flex w-full items-center gap-2 rounded px-2 py-1 text-left"
                                                onClick={() => {
                                                    pilih(h.id);
                                                    setQ('');
                                                }}
                                            >
                                                <TitikJenis type={h.type} />
                                                <span className="flex-1 truncate">{h.label}</span>
                                                <span className="text-muted-foreground text-xs">{h.degree}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="mb-1 font-medium">Prasetel</div>
                                <div className="flex flex-wrap gap-1">
                                    {Object.entries(PRASETEL).map(([nama, daftar]) => (
                                        <Button
                                            key={nama}
                                            variant="outline"
                                            size="sm"
                                            className="h-7 px-2 text-xs"
                                            onClick={() => setAktif(new Set(daftar))}
                                        >
                                            {nama}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="mb-1 font-medium">Jenis simpul</div>
                                <div className="space-y-1">
                                    {Object.entries(jenis).map(([k, nama]) =>
                                        hitungJenis[k] ? (
                                            <label key={k} className="flex cursor-pointer items-center gap-2">
                                                <Checkbox
                                                    checked={aktif.has(k)}
                                                    onCheckedChange={(v) =>
                                                        setAktif((a) => {
                                                            const b = new Set(a);
                                                            if (v) b.add(k);
                                                            else b.delete(k);
                                                            return b;
                                                        })
                                                    }
                                                />
                                                <TitikJenis type={k} />
                                                <span className="flex-1">{nama}</span>
                                                <span className="text-muted-foreground text-xs tabular-nums">{hitungJenis[k]}</span>
                                            </label>
                                        ) : null,
                                    )}
                                </div>
                            </div>
                            <div>
                                <div className="mb-1 font-medium">Komunitas</div>
                                <select
                                    className="bg-background w-full rounded-md border px-2 py-1.5"
                                    value={komunitas}
                                    onChange={(e) => setKomunitas(Number(e.target.value))}
                                >
                                    <option value={-2}>Semua komunitas</option>
                                    {graf.communities.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.nama} ({c.ukuran})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2">
                                    <Checkbox checked={tampilLabel} onCheckedChange={(v) => setTampilLabel(!!v)} /> Tampilkan label
                                </label>
                                <div>
                                    <div className="mb-1 font-medium">Mode fokus (tetangga simpul terpilih)</div>
                                    <div className="flex gap-1">
                                        {[0, 1, 2, 3].map((d) => (
                                            <Button
                                                key={d}
                                                size="sm"
                                                variant={kedalaman === d ? 'default' : 'outline'}
                                                className="h-7 px-2 text-xs"
                                                onClick={() => setKedalaman(d)}
                                                disabled={d > 0 && !terpilih}
                                            >
                                                {d === 0 ? 'Mati' : `${d} lompatan`}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className="text-muted-foreground text-xs">
                                Tampil {tampilNodes.length.toLocaleString('id-ID')} simpul, {tampilLinks.length.toLocaleString('id-ID')} relasi. Gulir
                                untuk memperbesar, seret untuk menggeser, klik simpul untuk rincian.
                            </p>
                        </aside>

                        {/* Peta */}
                        <Card className="h-[74vh] overflow-hidden p-0">
                            <PetaGraf
                                nodes={tampilNodes}
                                links={tampilLinks}
                                terpilih={terpilih}
                                sorot={sorot}
                                tampilLabel={tampilLabel}
                                fokus={fokus}
                                onPilih={(id) => pilih(id)}
                            />
                        </Card>

                        {/* Rincian */}
                        <aside className="h-[74vh] overflow-auto rounded-xl border p-3 text-sm">
                            {!n ? (
                                <div className="text-muted-foreground space-y-2">
                                    <p>Klik simpul di peta atau cari di kiri untuk melihat rinciannya: uraian, berkas, dan seluruh hubungannya.</p>
                                    <p>Warna menandai jenis simpul. Ukuran simpul menandai banyaknya relasi.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex items-start justify-between gap-2">
                                            <h2 className="text-base font-semibold break-words">{n.label}</h2>
                                            <button type="button" onClick={() => pilih(null)} aria-label="Tutup rincian">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="mt-1 flex flex-wrap gap-1">
                                            <Badge variant="outline" className="gap-1">
                                                <TitikJenis type={n.type} /> {jenis[n.type] ?? n.type}
                                            </Badge>
                                            <Badge variant="secondary">{n.degree} relasi</Badge>
                                            {n.community >= 0 && (
                                                <Badge variant="secondary" className="cursor-pointer" onClick={() => setKomunitas(n.community)}>
                                                    Komunitas: {graf.communities.find((c) => c.id === n.community)?.nama}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    {n.desc && <p className="leading-relaxed">{n.desc}</p>}
                                    <dl className="grid grid-cols-[110px_minmax(0,1fr)] gap-x-2 gap-y-1 text-xs">
                                        {RINCIAN.map(([k, label]) =>
                                            n[k] !== undefined && n[k] !== null && n[k] !== '' ? (
                                                <div key={k} className="contents">
                                                    <dt className="text-muted-foreground">{label}</dt>
                                                    <dd className="font-mono break-words">{String(n[k])}</dd>
                                                </div>
                                            ) : null,
                                        )}
                                    </dl>
                                    {Array.isArray(n.bagian) && (n.bagian as string[]).length > 0 && (
                                        <div>
                                            <div className="mb-1 font-medium">Bagian dokumen</div>
                                            <ul className="list-disc space-y-0.5 pl-5 text-xs">
                                                {(n.bagian as string[]).map((b, i) => (
                                                    <li key={i}>{b}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-1">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 px-2 text-xs"
                                            onClick={() => {
                                                setJalurDari(n);
                                                setTab('jalur');
                                            }}
                                        >
                                            <IkonJalur className="mr-1 h-3.5 w-3.5" /> Jalur dari sini
                                        </Button>
                                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => salinRingkasan(n)}>
                                            <Copy className="mr-1 h-3.5 w-3.5" /> Salin ringkasan
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 px-2 text-xs"
                                            onClick={() => setKedalaman(kedalaman ? 0 : 1)}
                                        >
                                            {kedalaman ? 'Tampilkan semua' : 'Fokus tetangga'}
                                        </Button>
                                    </div>
                                    {kelompokRelasi(n.id).map((k) => (
                                        <div key={k.judul}>
                                            <div className="text-muted-foreground mb-0.5 text-xs font-medium">
                                                {k.judul} ({k.butir.length})
                                            </div>
                                            <div className="flex flex-col">
                                                {k.butir.slice(0, 60).map((b) => (
                                                    <ChipSimpul key={b.id} n={b} onKlik={(id) => pilih(id)} />
                                                ))}
                                                {k.butir.length > 60 && (
                                                    <span className="text-muted-foreground text-xs">… dan {k.butir.length - 60} lainnya</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </aside>
                    </div>
                )}

                {graf && ix && tab === 'jalur' && (
                    <Card>
                        <CardContent className="space-y-4 p-4">
                            <p className="text-muted-foreground text-sm">
                                Cari hubungan terpendek antara dua hal di MR Kabar — misalnya dari sebuah menu ke tabel yang diisinya, atau dari
                                regulasi ke halaman yang menerapkannya.
                            </p>
                            <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
                                <PilihSimpul graf={graf} nilai={jalurDari} onPilih={setJalurDari} placeholder="Dari… (mis. Kendali Mutu)" />
                                <ArrowRight className="text-muted-foreground mx-auto hidden h-5 w-5 md:block" />
                                <PilihSimpul graf={graf} nilai={jalurKe} onPilih={setJalurKe} placeholder="Ke… (mis. rpp_team_members)" />
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox checked={hindariUmum} onCheckedChange={(v) => setHindariUmum(!!v)} /> Hindari simpul umum (izin, peran,
                                komponen, pustaka, middleware)
                            </label>
                            {jalur === null && <p className="text-sm">Tidak ada jalur di antara keduanya.</p>}
                            {jalur && (
                                <ol className="space-y-1">
                                    {jalur.map((s, i) => {
                                        const x = ix.byId.get(s.id)!;
                                        return (
                                            <li key={s.id}>
                                                {i > 0 && (
                                                    <div className="text-muted-foreground flex items-center gap-1 pl-6 text-xs">
                                                        {s.maju ? <ArrowRight className="h-3 w-3" /> : <ArrowLeft className="h-3 w-3" />} {s.rel}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-muted-foreground w-5 text-right text-xs tabular-nums">{i + 1}.</span>
                                                    <ChipSimpul n={x} onKlik={(id) => pilih(id, true)} />
                                                    <span className="text-muted-foreground text-xs">{jenis[x.type] ?? x.type}</span>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ol>
                            )}
                            {jalur && jalur.length > 0 && (
                                <p className="text-muted-foreground text-xs">
                                    {jalur.length - 1} lompatan. Tanda → berarti relasi searah jalur, ← berarti relasi berlawanan arah. Klik simpul
                                    untuk membukanya di peta.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {graf && ix && tab === 'laporan' && (
                    <div className="grid gap-3 lg:grid-cols-2">
                        <Card>
                            <CardContent className="p-4">
                                <h2 className="mb-2 font-semibold">Isi peta per jenis</h2>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                    {Object.entries(jenis).map(([k, nama]) =>
                                        hitungJenis[k] ? (
                                            <div key={k} className="flex items-center gap-2">
                                                <TitikJenis type={k} />
                                                <span className="flex-1">{nama}</span>
                                                <span className="tabular-nums">{hitungJenis[k].toLocaleString('id-ID')}</span>
                                            </div>
                                        ) : null,
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <h2 className="mb-2 font-semibold">Simpul utama (paling banyak terhubung)</h2>
                                <ol className="list-decimal space-y-0.5 pl-6 text-sm">
                                    {utama.map((x) => (
                                        <li key={x.id}>
                                            <ChipSimpul n={x} onKlik={(id) => pilih(id, true)} />{' '}
                                            <span className="text-muted-foreground text-xs">{x.degree}</span>
                                        </li>
                                    ))}
                                </ol>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <h2 className="mb-2 font-semibold">Pengetahuan domain</h2>
                                <div className="space-y-3 text-sm">
                                    {graf.nodes
                                        .filter((x) => x.type === 'regulasi' || x.type === 'konsep')
                                        .map((x) => (
                                            <div key={x.id}>
                                                <ChipSimpul n={x} onKlik={(id) => pilih(id, true)} />
                                                {x.desc && <p className="text-muted-foreground pl-5">{x.desc}</p>}
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <h2 className="mb-2 font-semibold">Komunitas (kelompok yang saling terkait)</h2>
                                <div className="space-y-2 text-sm">
                                    {graf.communities.map((c) => (
                                        <div key={c.id}>
                                            <button
                                                type="button"
                                                className="font-medium hover:underline"
                                                onClick={() => {
                                                    setKomunitas(c.id);
                                                    setAktif(new Set(PRASETEL.Semua));
                                                    setTerpilih(null);
                                                    setTab('peta');
                                                }}
                                            >
                                                {c.nama}
                                            </button>{' '}
                                            <span className="text-muted-foreground text-xs">{c.ukuran} simpul</span>
                                            <div className="text-muted-foreground text-xs">
                                                {c.teratas
                                                    .slice(0, 6)
                                                    .map((id) => ix.byId.get(id)?.label)
                                                    .filter(Boolean)
                                                    .join(' · ')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {graf && ix && tab === 'temuan' && (
                    <div className="space-y-3">
                        <p className="text-muted-foreground text-sm">
                            Hasil pemeriksaan otomatis atas peta — bahan perapian, bukan kesalahan pasti. Periksa tiap butir sebelum mengubah atau
                            menghapus apa pun.
                        </p>
                        {graf.temuan.map((t) => (
                            <Card key={t.judul}>
                                <CardContent className="p-4">
                                    <h2 className="font-semibold">
                                        {t.judul} ({t.simpul.length})
                                    </h2>
                                    <p className="text-muted-foreground mb-2 text-sm">{t.penjelasan}</p>
                                    <div className="grid gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {t.simpul.map((id) => {
                                            const x = ix.byId.get(id);
                                            return x ? <ChipSimpul key={id} n={x} onKlik={(i) => pilih(i, true)} /> : null;
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
