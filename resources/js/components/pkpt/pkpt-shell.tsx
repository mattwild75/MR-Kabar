import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Lock } from 'lucide-react';
import type { ReactNode } from 'react';

export interface PeriodeRingkas {
    id: number;
    tahun_pkpt: number;
    tahun_dasar_risiko: number;
    status: 'rancangan' | 'ditetapkan' | 'arsip';
}

export interface HakPkpt {
    input: boolean;
    hitung: boolean;
    rencana: boolean;
    tetapkan: boolean;
    pengaturan: boolean;
}

export interface KonteksPkpt {
    periode:
        | (PeriodeRingkas & {
              total_belanja_langsung: number | null;
              nomor_keputusan: string | null;
              tanggal_penetapan: string | null;
          })
        | null;
    terkunci: boolean;
    daftarPeriode: PeriodeRingkas[];
    hak: HakPkpt;
}

const LABEL_STATUS: Record<PeriodeRingkas['status'], string> = {
    rancangan: 'Rancangan',
    ditetapkan: 'Ditetapkan',
    arsip: 'Arsip',
};

/**
 * Kerangka setiap halaman PKPT: judul, pemilih periode, dan penanda terkunci.
 *
 * Pemilih periode ada di SETIAP halaman, bukan hanya di Ikhtisar. Alasannya
 * sederhana: seluruh isi layar bergantung pada periode mana yang sedang
 * dilihat, dan halaman yang tidak menyebutkan periodenya membuat orang
 * mengira sedang menyunting periode berjalan padahal sedang membuka arsip.
 */
export default function PkptShell({
    judul,
    keterangan,
    konteks,
    aksi,
    children,
}: {
    judul: string;
    keterangan?: ReactNode;
    konteks: KonteksPkpt;
    aksi?: ReactNode;
    children: ReactNode;
}) {
    const { periode, daftarPeriode, terkunci } = konteks;

    const pindahPeriode = (id: string) => {
        router.get(window.location.pathname, { periode: id }, { preserveScroll: true });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'PKPT Berbasis Risiko', href: '/pkpt' },
                { title: judul, href: window.location.pathname },
            ]}
        >
            <Head title={`${judul} - PKPT Berbasis Risiko`} />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h1 className="text-xl font-semibold tracking-tight">{judul}</h1>
                        {keterangan ? <p className="text-muted-foreground mt-1 max-w-3xl text-sm">{keterangan}</p> : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {daftarPeriode.length > 0 ? (
                            <label className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Periode PKPT</span>
                                <select
                                    aria-label="Periode PKPT yang sedang dibuka"
                                    className="border-input bg-background h-9 rounded-md border px-2 text-sm"
                                    value={periode?.id ?? ''}
                                    onChange={(e) => pindahPeriode(e.target.value)}
                                >
                                    {daftarPeriode.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.tahun_pkpt} (dasar risiko {p.tahun_dasar_risiko}) - {LABEL_STATUS[p.status]}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        ) : null}

                        {terkunci ? (
                            <Badge variant="secondary" className="gap-1">
                                <Lock className="size-3" aria-hidden />
                                Terkunci
                            </Badge>
                        ) : null}

                        {aksi}
                    </div>
                </div>

                {terkunci ? (
                    <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
                        Periode ini sudah ditetapkan. Seluruh perubahan ditolak supaya angka pada lampiran Keputusan Inspektur tetap sama dengan angka
                        di layar. Buka kembali lewat menu Ikhtisar dan Periode bila memang perlu diubah.
                    </p>
                ) : null}

                {children}
            </div>
        </AppLayout>
    );
}

/** Pesan baku ketika belum ada periode sama sekali. */
export function BelumAdaPeriode() {
    return (
        <div className="rounded-md border border-dashed p-8 text-center">
            <p className="text-muted-foreground text-sm">
                Belum ada Periode PKPT. Buat lebih dahulu di menu{' '}
                <a href="/pkpt" className="font-medium underline">
                    Ikhtisar dan Periode
                </a>
                .
            </p>
        </div>
    );
}
