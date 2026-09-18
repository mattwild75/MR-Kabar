import PageHeader from '@/components/page-header';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, ClipboardList, Lightbulb, Pencil, Search, Trash2, Users } from 'lucide-react';
import { type ReactNode, useEffect } from 'react';
import { rupiah, statusKelas, statusLabel, tanggal } from './lib';

const BASE = '/erpika/laporan-penugasan/database-lhp';

/** Sorot semua kemunculan `sorot` dalam teks (dari pencarian), tanpa peka huruf. */
function TeksSorot({ teks, sorot }: { teks: string | null | undefined; sorot: string }): ReactNode {
    if (!teks) return null;
    if (!sorot) return teks;
    const esc = sorot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const bagian = teks.split(new RegExp(`(${esc})`, 'gi'));
    const target = sorot.toLowerCase();
    return bagian.map((b, i) =>
        b.toLowerCase() === target ? (
            <mark key={i} data-sorot className="rounded bg-amber-300 px-0.5 text-amber-950 dark:bg-amber-500/80 dark:text-black">
                {b}
            </mark>
        ) : (
            <span key={i}>{b}</span>
        ),
    );
}

interface TindakLanjut {
    id: number;
    no: number;
    kode_group: string | null;
    kode: string | null;
    group_label: string | null;
    kode_label: string | null;
    nilai: number | null;
    tanggal: string | null;
    memo: string | null;
}
interface Rekomendasi {
    id: number;
    no: number;
    kode_group: string | null;
    kode: string | null;
    group_label: string | null;
    kode_label: string | null;
    nilai: number | null;
    memo: string;
    tindak_lanjut: TindakLanjut[];
}
interface Sebab {
    id: number;
    no: number;
    kode_group: string | null;
    kode: string | null;
    group_label: string | null;
    kode_label: string | null;
    memo: string;
    rekomendasi: Rekomendasi[];
}
interface Temuan {
    id: number;
    no: number;
    kode_group: string | null;
    kode: string | null;
    group_label: string | null;
    kode_label: string | null;
    nilai: number | null;
    ba_kesepakatan: string | null;
    kerugian_pada: string | null;
    memo: string;
    status: string | null;
    sebab: Sebab[];
}
interface Anggota {
    id: number;
    no: number;
    nip: string | null;
    nama: string;
    jabatan: string | null;
}
interface Lhp {
    id: number;
    nomor_lhp: string;
    tanggal_lhp: string | null;
    nomor_st: string | null;
    tanggal_st: string | null;
    tahun_pkpt: string | null;
    tahun_anggaran: string | null;
    nama_obrik: string;
    inspektorat: string | null;
    bidang_unit: string | null;
    kode_group_jenis_periksa: string | null;
    kode_jenis_periksa: string | null;
    jenis_group_label: string | null;
    jenis_label: string | null;
    nilai_anggaran: number | null;
    realisasi_anggaran: number | null;
    anggaran_diaudit: number | null;
    jml_tp: number | null;
    nilai_tp: number | null;
    status_lhp: string;
    nip_pj: string | null;
    nama_pj: string | null;
    tim: Anggota[];
    temuan: Temuan[];
}

/** Gabung kode + label jadi teks singkat, mis. "08 — Kelemahan Administrasi". */
function kodeTeks(kode: string | null, label: string | null): string | null {
    if (!kode && !label) return null;
    if (kode && label) return `${kode} — ${label}`;
    return kode || label;
}

/**
 * Penjelasan kode dua baris (group lalu rincian) — tata letak seragam dipakai
 * di Temuan, Penyebab, Rekomendasi, dan Tindak Lanjut.
 */
function KodeInfo({ kg, gl, k, kl }: { kg: string | null; gl: string | null; k: string | null; kl: string | null }) {
    const g = kodeTeks(kg, gl);
    const d = kodeTeks(k, kl);
    if (!g && !d) return null;
    return (
        <div className="text-muted-foreground mt-0.5 text-xs">
            {g && <div>{g}</div>}
            {d && <div>{d}</div>}
        </div>
    );
}

export default function LhpShow({ lhp }: { lhp: Lhp }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'ERPIKA', href: '#' },
        { title: 'ANEVA', href: '#' },
        { title: 'Database LHP', href: BASE },
        { title: lhp.nomor_lhp, href: `${BASE}/${lhp.id}` },
    ];

    // Kata yang disorot datang dari pencarian daftar (?sorot=...).
    const url = usePage().url;
    const sorot = new URLSearchParams(url.split('?')[1] ?? '').get('sorot') ?? '';

    // Gulir ke kecocokan pertama setelah halaman tergambar.
    useEffect(() => {
        if (!sorot) return;
        const t = setTimeout(() => document.querySelector('mark[data-sorot]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
        return () => clearTimeout(t);
    }, [sorot, lhp.id]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`LHP ${lhp.nomor_lhp}`} />
            <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
                <PageHeader
                    title={lhp.nomor_lhp}
                    icon={<Search />}
                    description={<TeksSorot teks={lhp.nama_obrik} sorot={sorot} />}
                    actions={
                        <>
                            <Button asChild size="sm" variant="outline">
                                <Link href={BASE}>
                                    <ArrowLeft className="h-4 w-4" />
                                    Daftar
                                </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline">
                                <Link href={`${BASE}/${lhp.id}/sunting`}>
                                    <Pencil className="h-4 w-4" />
                                    Sunting
                                </Link>
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive">
                                        <Trash2 className="h-4 w-4" />
                                        Hapus
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Hapus LHP ini?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            LHP <strong>{lhp.nomor_lhp}</strong> beserta seluruh temuan, penyebab, rekomendasi, dan tindak lanjutnya
                                            akan dipindahkan ke data terhapus.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => router.delete(`${BASE}/${lhp.id}`)}>Ya, Hapus</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    }
                />

                {/* Identitas LHP */}
                <div className="bg-card rounded-md border p-4">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${statusKelas(lhp.status_lhp)}`}>
                            {statusLabel(lhp.status_lhp)}
                        </span>
                        <span className="text-muted-foreground text-xs">
                            {lhp.temuan.length} temuan · nilai {rupiah(lhp.nilai_tp)}
                        </span>
                    </div>
                    <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                        <Info k="Nomor LHP" v={lhp.nomor_lhp} />
                        <Info k="Tanggal LHP" v={tanggal(lhp.tanggal_lhp)} />
                        <Info k="Surat Tugas" v={lhp.nomor_st ?? '—'} />
                        <Info k="Tahun PKPT" v={lhp.tahun_pkpt ?? '—'} />
                        <Info k="Tanggal ST" v={tanggal(lhp.tanggal_st)} />
                        <Info k="Tahun Anggaran" v={lhp.tahun_anggaran ?? '—'} />
                        <Info k="Inspektorat" v={lhp.inspektorat ?? '—'} />
                        <Info k="Bidang/Unit Pengawasan" v={lhp.bidang_unit ?? '—'} />
                        <Info k="Lingkup Audit" v={kodeTeks(lhp.kode_group_jenis_periksa, lhp.jenis_group_label) ?? '—'} />
                        <Info k="Jenis Audit" v={kodeTeks(lhp.kode_jenis_periksa, lhp.jenis_label) ?? '—'} />
                        <Info k="Penanggung Jawab" v={lhp.nama_pj ? `${lhp.nama_pj}${lhp.nip_pj ? ` (${lhp.nip_pj})` : ''}` : '—'} />
                        <Info k="Objek Pemeriksaan" v={lhp.nama_obrik} span />
                        {(lhp.nilai_anggaran || lhp.realisasi_anggaran || lhp.anggaran_diaudit) && (
                            <>
                                <Info k="Nilai Anggaran" v={rupiah(lhp.nilai_anggaran)} />
                                <Info k="Anggaran Diaudit" v={rupiah(lhp.anggaran_diaudit)} />
                            </>
                        )}
                    </dl>
                </div>

                {/* Tim pemeriksa */}
                {lhp.tim.length > 0 && (
                    <div className="bg-card rounded-md border p-4">
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                            <Users className="text-muted-foreground h-4 w-4" />
                            Tim Pemeriksa
                        </div>
                        <ol className="divide-y">
                            {lhp.tim.map((m) => (
                                <li key={m.id} className="flex items-baseline justify-between gap-3 py-1.5 text-sm">
                                    <div className="min-w-0">
                                        <span className="font-medium">{m.nama}</span>
                                        {m.nip && <span className="text-muted-foreground ml-2 font-mono text-xs">NIP {m.nip}</span>}
                                    </div>
                                    {m.jabatan && <span className="text-muted-foreground shrink-0 text-xs">{m.jabatan}</span>}
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {/* Rantai temuan */}
                {lhp.temuan.length === 0 ? (
                    <div className="text-muted-foreground rounded-md border border-dashed p-6 text-center text-sm">
                        Belum ada temuan pada LHP ini.
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h2 className="text-sm font-semibold tracking-tight">Temuan, Penyebab, Rekomendasi &amp; Tindak Lanjut</h2>
                        {lhp.temuan.map((t) => (
                            <TemuanKartu key={t.id} t={t} sorot={sorot} />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function TemuanKartu({ t, sorot }: { t: Temuan; sorot: string }) {
    return (
        <div className="bg-card overflow-hidden rounded-md border">
            <div className="bg-muted/50 flex items-start gap-3 border-b px-4 py-3">
                <span className="bg-foreground text-background mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums">
                    {t.no}
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                        <ClipboardList className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                        <span className="text-muted-foreground font-medium tracking-wide uppercase">Temuan</span>
                        {t.nilai !== null && t.nilai > 0 && <span className="ml-auto font-medium tabular-nums">{rupiah(t.nilai)}</span>}
                    </div>
                    <KodeInfo kg={t.kode_group} gl={t.group_label} k={t.kode} kl={t.kode_label} />
                    <p className="mt-1 text-sm whitespace-pre-line">
                        <TeksSorot teks={t.memo} sorot={sorot} />
                    </p>
                    {(t.ba_kesepakatan || t.kerugian_pada) && (
                        <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-4 text-xs">
                            {t.ba_kesepakatan && <span>BA Kesepakatan Obrik: {t.ba_kesepakatan === 'ada' ? 'Ada' : 'Tidak Ada'}</span>}
                            {t.kerugian_pada && <span>Kerugian pada: {t.kerugian_pada === 'negara' ? 'Negara' : 'Daerah'}</span>}
                        </div>
                    )}
                </div>
            </div>
            <div className="space-y-3 p-4">
                {t.sebab.length === 0 && <p className="text-muted-foreground text-xs">Tidak ada penyebab yang dicatat.</p>}
                {t.sebab.map((s) => (
                    <div key={s.id} className="border-muted-foreground/20 space-y-2 border-l-2 pl-3">
                        <div>
                            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                Penyebab {t.sebab.length > 1 ? s.no : ''}
                            </span>
                            <KodeInfo kg={s.kode_group} gl={s.group_label} k={s.kode} kl={s.kode_label} />
                            <p className="mt-1 text-sm whitespace-pre-line">
                                <TeksSorot teks={s.memo} sorot={sorot} />
                            </p>
                        </div>
                        {s.rekomendasi.map((r) => (
                            <div
                                key={r.id}
                                className="rounded-md border border-amber-200/60 bg-amber-50/60 p-3 dark:border-amber-900/40 dark:bg-amber-950/20"
                            >
                                <div className="flex items-center gap-2 text-xs">
                                    <Lightbulb className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                                    <span className="font-medium tracking-wide text-amber-800 uppercase dark:text-amber-300">
                                        Rekomendasi {r.no > 0 ? r.no : ''}
                                    </span>
                                    {r.nilai !== null && r.nilai > 0 && <span className="ml-auto font-medium tabular-nums">{rupiah(r.nilai)}</span>}
                                </div>
                                <KodeInfo kg={r.kode_group} gl={r.group_label} k={r.kode} kl={r.kode_label} />
                                <p className="mt-1 text-sm whitespace-pre-line">
                                    <TeksSorot teks={r.memo} sorot={sorot} />
                                </p>
                                {r.tindak_lanjut.length > 0 && (
                                    <div className="mt-2 space-y-1.5 border-t border-amber-200/60 pt-2 dark:border-amber-900/40">
                                        {r.tindak_lanjut.map((tl) => (
                                            <div key={tl.id} className="flex items-start gap-2 text-sm">
                                                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                                <div className="min-w-0">
                                                    <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                                        Tindak Lanjut{tl.tanggal ? ` · ${tanggal(tl.tanggal)}` : ''}
                                                        {tl.nilai !== null && tl.nilai > 0 ? ` · ${rupiah(tl.nilai)}` : ''}
                                                    </span>
                                                    <KodeInfo kg={tl.kode_group} gl={tl.group_label} k={tl.kode} kl={tl.kode_label} />
                                                    {tl.memo && (
                                                        <p className="mt-1 whitespace-pre-line">
                                                            <TeksSorot teks={tl.memo} sorot={sorot} />
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

function Info({ k, v, span }: { k: string; v: string; span?: boolean }) {
    return (
        <div className={span ? 'sm:col-span-2' : ''}>
            <dt className="text-muted-foreground text-xs">{k}</dt>
            <dd className="font-medium">{v}</dd>
        </div>
    );
}
