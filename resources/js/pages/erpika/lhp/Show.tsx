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
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, ClipboardList, Lightbulb, Pencil, Search, Trash2 } from 'lucide-react';
import { rupiah, statusKelas, statusLabel, tanggal } from './lib';

const BASE = '/erpika/laporan-penugasan/database-lhp';

interface TindakLanjut {
    id: number;
    no: number;
    nilai: number | null;
    tanggal: string | null;
    memo: string | null;
}
interface Rekomendasi {
    id: number;
    no: number;
    nilai: number | null;
    memo: string;
    tindak_lanjut: TindakLanjut[];
}
interface Sebab {
    id: number;
    no: number;
    memo: string;
    rekomendasi: Rekomendasi[];
}
interface Temuan {
    id: number;
    no: number;
    kode: string | null;
    nilai: number | null;
    memo: string;
    status: string | null;
    sebab: Sebab[];
}
interface Lhp {
    id: number;
    nomor_lhp: string;
    tanggal_lhp: string | null;
    nomor_st: string | null;
    tanggal_st: string | null;
    tahun_anggaran: string | null;
    nama_obrik: string;
    nilai_anggaran: number | null;
    realisasi_anggaran: number | null;
    anggaran_diaudit: number | null;
    jml_tp: number | null;
    nilai_tp: number | null;
    status_lhp: string;
    nip_pj: string | null;
    nama_pj: string | null;
    temuan: Temuan[];
}

export default function LhpShow({ lhp }: { lhp: Lhp }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'ERPIKA', href: '#' },
        { title: 'Laporan Penugasan', href: '#' },
        { title: 'Database LHP', href: BASE },
        { title: lhp.nomor_lhp, href: `${BASE}/${lhp.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`LHP ${lhp.nomor_lhp}`} />
            <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
                <PageHeader
                    title={lhp.nomor_lhp}
                    icon={<Search />}
                    description={lhp.nama_obrik}
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
                        <Info k="Tanggal ST" v={tanggal(lhp.tanggal_st)} />
                        <Info k="Tahun Anggaran" v={lhp.tahun_anggaran ?? '—'} />
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

                {/* Rantai temuan */}
                {lhp.temuan.length === 0 ? (
                    <div className="text-muted-foreground rounded-md border border-dashed p-6 text-center text-sm">
                        Belum ada temuan pada LHP ini.
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h2 className="text-sm font-semibold tracking-tight">Temuan, Penyebab, Rekomendasi &amp; Tindak Lanjut</h2>
                        {lhp.temuan.map((t) => (
                            <TemuanKartu key={t.id} t={t} />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function TemuanKartu({ t }: { t: Temuan }) {
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
                        {t.kode && <span className="text-muted-foreground font-mono">{t.kode}</span>}
                        {t.nilai !== null && t.nilai > 0 && <span className="ml-auto font-medium tabular-nums">{rupiah(t.nilai)}</span>}
                    </div>
                    <p className="mt-1 text-sm whitespace-pre-line">{t.memo}</p>
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
                            <p className="text-sm whitespace-pre-line">{s.memo}</p>
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
                                <p className="mt-1 text-sm whitespace-pre-line">{r.memo}</p>
                                {r.tindak_lanjut.length > 0 && (
                                    <div className="mt-2 space-y-1.5 border-t border-amber-200/60 pt-2 dark:border-amber-900/40">
                                        {r.tindak_lanjut.map((tl) => (
                                            <div key={tl.id} className="flex items-start gap-2 text-sm">
                                                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                                <div className="min-w-0">
                                                    <span className="text-muted-foreground mr-2 text-xs">
                                                        Tindak lanjut{tl.tanggal ? ` · ${tanggal(tl.tanggal)}` : ''}
                                                        {tl.nilai !== null && tl.nilai > 0 ? ` · ${rupiah(tl.nilai)}` : ''}
                                                    </span>
                                                    {tl.memo && <span className="whitespace-pre-line">{tl.memo}</span>}
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
