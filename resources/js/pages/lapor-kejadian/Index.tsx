import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { KeyRound, ShieldAlert, Siren } from 'lucide-react';
import { useState } from 'react';
import CekStatus from './CekStatus';
import FormKejadianRisiko from './Form';
import FormKecurangan from './FormKecurangan';

interface OpdOption {
    id: number;
    nama: string;
}

interface Props {
    opdList: OpdOption[];
    tahapanOptions: string[];
    kelompokOptions: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Utilities', href: '#' },
    { title: 'Lapor', href: '/lapor-kejadian' },
];

type Tab = 'kejadian' | 'kecurangan' | 'status';

const TABS: { kunci: Tab; judul: string; ringkas: string; Ikon: typeof Siren }[] = [
    {
        kunci: 'kejadian',
        judul: 'Kejadian Risiko',
        ringkas: 'Risiko yang sedang atau telah terjadi',
        Ikon: Siren,
    },
    {
        kunci: 'kecurangan',
        judul: 'Dugaan Kecurangan',
        ringkas: 'Penyuapan, gratifikasi, mark up, benturan kepentingan',
        Ikon: ShieldAlert,
    },
    {
        kunci: 'status',
        judul: 'Cek Status Laporan',
        ringkas: 'Lihat perkembangan & jawab pertanyaan, pakai nomor tiket',
        Ikon: KeyRound,
    },
];

/**
 * Halaman Lapor — satu pintu, dua jenis laporan, dan satu jalan kembali.
 *
 * SATU QR UNTUK KEDUANYA, dan itu keputusan yang disengaja. Kode QR yang sudah
 * tercetak dan tersebar menunjuk /login/lapor-kejadian, dan tetap menunjuk ke
 * sini. Menerbitkan QR kedua berarti setiap lembar yang sudah dibagikan jadi
 * separuh benar, dan orang harus tahu lebih dulu jenis laporannya sebelum bisa
 * memindai — padahal yang menyaksikan sesuatu belum tentu tahu apakah yang
 * dilihatnya "risiko" atau "kecurangan". Di sini ia memilih setelah membaca
 * keduanya.
 *
 * Tab ketiga, "Cek Status Laporan", ada di sini dan bukan di halaman terpisah
 * karena pintunya memang sama: pelapor kembali lewat QR yang sama, lalu masuk
 * dengan nomor tiketnya. Itulah yang membuat laporan anonim tidak putus —
 * penindaklanjut tetap bisa bertanya, dan pelapor tetap bisa menjawab, tanpa
 * pernah menyebut siapa dirinya.
 *
 * Tab dipilih di peramban, bukan lewat kunjungan baru ke server: pelapor yang
 * salah pilih tab tidak kehilangan apa yang sudah diketiknya di tab satunya.
 */
export default function LaporIndex({ opdList, tahapanOptions, kelompokOptions }: Props) {
    const [tab, setTab] = useState<Tab>('kejadian');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lapor" />

            <div className="mx-auto max-w-2xl space-y-5 p-4">
                <div>
                    <h1 className="text-xl font-semibold">Lapor</h1>
                    <p className="text-muted-foreground text-sm">Pilih jenis laporan yang sesuai dengan yang Anda ketahui.</p>
                </div>

                <div className="grid gap-2 sm:grid-cols-3" role="tablist">
                    {TABS.map(({ kunci, judul, ringkas, Ikon }) => {
                        const aktif = tab === kunci;
                        return (
                            <button
                                key={kunci}
                                type="button"
                                role="tab"
                                aria-selected={aktif}
                                onClick={() => setTab(kunci)}
                                className={`flex items-start gap-3 rounded-md border p-3 text-left transition ${
                                    aktif ? 'border-primary bg-primary/5 ring-primary/40 ring-2' : 'hover:bg-muted/50'
                                }`}
                            >
                                <Ikon className={`mt-0.5 h-5 w-5 shrink-0 ${aktif ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span>
                                    <span className="block text-sm font-medium">{judul}</span>
                                    <span className="text-muted-foreground block text-xs">{ringkas}</span>
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Ketiganya tetap terpasang, hanya yang tidak aktif disembunyikan —
                    supaya isian pada tab yang tidak sedang dilihat tidak hilang
                    ketika pelapor berpindah dan kembali. */}
                <div hidden={tab !== 'kejadian'}>
                    <FormKejadianRisiko opdList={opdList} />
                </div>
                <div hidden={tab !== 'kecurangan'}>
                    <FormKecurangan opdList={opdList} tahapanOptions={tahapanOptions} kelompokOptions={kelompokOptions} />
                </div>
                <div hidden={tab !== 'status'}>
                    <CekStatus />
                </div>
            </div>
        </AppLayout>
    );
}
