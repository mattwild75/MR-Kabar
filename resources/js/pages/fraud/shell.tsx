import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { type ReactNode } from 'react';

/**
 * Bentuk baris Penilaian Risiko Kecurangan, sama untuk keempat halaman
 * pengisian — karena keempatnya memang memandang SATU tabel yang sama dari
 * tahap yang berbeda.
 */
export interface FraudRow {
    id: number;
    opd_id: number;
    tahun_penilaian: number;
    nomor_urut: number | null;

    tahapan_proses: string | null;
    nama_risiko: string;
    skenario_risiko: string | null;
    uraian_penyebab: string | null;
    uraian_dampak: string | null;
    kelompok_risiko: string[] | null;

    probabilitas_inheren: number | null;
    dampak_inheren: number | null;
    pengendalian_ada: string | null;
    pengendalian_uraian: string | null;
    pengendalian_memadai: string | null;
    probabilitas_residual: number | null;
    dampak_residual: number | null;

    pernyataan_penyebab: string | null;
    rencana_mitigasi: string | null;
    jadwal_mitigasi: string | null;
    penanggung_jawab: string | null;

    /** Turunan dari matriks 5x5 — dihitung di server, tidak pernah disimpan. */
    besaran_inheren: number | null;
    level_inheren: string | null;
    warna_inheren: string | null;
    besaran_residual: number | null;
    level_residual: string | null;
    warna_residual: string | null;

    opd?: { id: number; nama: string } | null;
    user?: { id: number; name: string } | null;
}

export interface FraudSharedProps {
    rows: FraudRow[];
    tahun: number;
    tahunAktif: number;
    tahunOptions: number[];
    isAdmin: boolean;
    opdList: { id: number; nama: string }[];
    opdId: string | null;
    opdSendiri: { id: number; nama: string } | null;
    tahapanOptions: string[];
    kelompokOptions: string[];
}

/**
 * Keempat tahap penilaian, berurut sesuai pedoman.
 *
 * Ditampilkan sebagai satu deret di tiap halaman supaya PIC melihat bahwa
 * ini SATU pekerjaan bertahap, bukan empat daftar terpisah yang harus diisi
 * ulang satu per satu.
 */
const TAHAP = [
    { href: '/fraud/identifikasi', label: '1. Identifikasi' },
    { href: '/fraud/analisis', label: '2. Analisis' },
    { href: '/fraud/rtp', label: '3. Rencana Tindak' },
    { href: '/fraud/register', label: 'Register' },
] as const;

export function FraudShell({
    judul,
    keterangan,
    aktif,
    shared,
    aksi,
    children,
}: {
    judul: string;
    keterangan: string;
    aktif: string;
    shared: FraudSharedProps;
    aksi?: ReactNode;
    children: ReactNode;
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'MR Fraud', href: '/fraud/identifikasi' },
        { title: judul, href: aktif },
    ];

    const pindah = (kunci: 'tahun' | 'opd_id', nilai: string) => {
        const params = new URLSearchParams(window.location.search);
        if (nilai === '' || nilai === 'semua') {
            params.delete(kunci);
        } else {
            params.set(kunci, nilai);
        }
        router.get(window.location.pathname, Object.fromEntries(params), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={judul} />

            <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold">{judul}</h1>
                        <p className="text-muted-foreground text-sm">{keterangan}</p>
                    </div>
                    {aksi}
                </div>

                <nav className="flex flex-wrap gap-2">
                    {TAHAP.map((t) => (
                        <Link
                            key={t.href}
                            href={`${t.href}?tahun=${shared.tahun}${shared.opdId ? `&opd_id=${shared.opdId}` : ''}`}
                            className={
                                t.href === aktif
                                    ? 'bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm font-medium'
                                    : 'bg-muted hover:bg-muted/70 rounded-md px-3 py-1.5 text-sm'
                            }
                        >
                            {t.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex flex-wrap items-end gap-4">
                    <div>
                        <label className="text-muted-foreground mb-1 block text-xs">Tahun Penilaian</label>
                        <Select value={String(shared.tahun)} onValueChange={(v) => pindah('tahun', v)}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[...new Set([shared.tahunAktif, ...shared.tahunOptions])]
                                    .sort((a, b) => b - a)
                                    .map((t) => (
                                        <SelectItem key={t} value={String(t)}>
                                            {t}
                                            {t === shared.tahunAktif ? ' (Tahun Aktif)' : ''}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {shared.isAdmin ? (
                        <div>
                            <label className="text-muted-foreground mb-1 block text-xs">Perangkat Daerah</label>
                            <Select value={shared.opdId ?? 'semua'} onValueChange={(v) => pindah('opd_id', v)}>
                                <SelectTrigger className="w-[320px]">
                                    <SelectValue placeholder="Semua OPD" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="semua">Semua OPD</SelectItem>
                                    {shared.opdList.map((o) => (
                                        <SelectItem key={o.id} value={String(o.id)}>
                                            {o.nama}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        shared.opdSendiri && (
                            <Badge variant="secondary" className="mb-1">
                                {shared.opdSendiri.nama}
                            </Badge>
                        )
                    )}

                    <span className="text-muted-foreground mb-2 text-sm">{shared.rows.length} risiko</span>
                </div>

                {children}
            </div>
        </AppLayout>
    );
}

/** Sel besaran + level risiko, memakai warna resmi dari `risk_levels`. */
export function SelLevel({ besaran, level, warna }: { besaran: number | null; level: string | null; warna: string | null }) {
    if (besaran === null) {
        return <span className="text-muted-foreground">-</span>;
    }

    return (
        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${warna ?? ''}`}>
            {besaran} · {level ?? '-'}
        </span>
    );
}

/** Teks panjang yang ditampilkan ringkas tetapi tetap bisa dibaca utuh. */
export function TeksPanjang({ isi }: { isi: string | null }) {
    if (!isi) {
        return <span className="text-muted-foreground">-</span>;
    }

    return <span className="block max-w-[28rem] whitespace-pre-line">{isi}</span>;
}
