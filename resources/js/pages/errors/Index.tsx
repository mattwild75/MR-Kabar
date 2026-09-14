import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Home, RefreshCw } from 'lucide-react';

const PESAN: Record<number, { judul: string; isi: string }> = {
    403: {
        judul: 'Anda tidak punya akses ke halaman ini',
        isi: 'Halaman ini dibatasi untuk peran tertentu. Bila Anda merasa seharusnya bisa membukanya, hubungi admin aplikasi.',
    },
    404: {
        judul: 'Halaman tidak ditemukan',
        isi: 'Alamat yang Anda buka tidak ada atau sudah dipindahkan. Periksa kembali tautannya, atau kembali ke dashboard.',
    },
    429: { judul: 'Terlalu banyak permintaan', isi: 'Tunggu sebentar, lalu coba lagi.' },
    500: {
        judul: 'Terjadi gangguan di server',
        isi: 'Kesalahan ini sudah tercatat. Coba muat ulang; bila berulang, laporkan lewat tombol Troubleshoot di bawah halaman.',
    },
    503: { judul: 'Aplikasi sedang dalam pemeliharaan', isi: 'Kami sedang memperbarui MR Kabar. Silakan kembali beberapa menit lagi.' },
};

/**
 * Halaman galat bersama untuk 403/404/429/500/503 — dirender Inertia dari
 * bootstrap/app.php supaya pengguna tidak melihat halaman Laravel polos
 * "404 | NOT FOUND" berlatar hitam.
 */
export default function ErrorPage({ status, namaApp }: { status: number; namaApp?: string }) {
    const p = PESAN[status] ?? { judul: 'Terjadi kesalahan', isi: 'Silakan coba lagi.' };
    const muatUlang = status >= 500;
    return (
        <div className="bg-background text-foreground flex min-h-svh items-center justify-center p-6">
            <Head title={`${status} — ${p.judul}`} />
            <div className="w-full max-w-md text-center">
                <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">{namaApp ?? 'MR Kabar'}</p>
                <p className="text-primary mt-4 text-6xl font-bold tracking-tight tabular-nums">{status}</p>
                <h1 className="mt-3 text-xl font-semibold text-balance">{p.judul}</h1>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{p.isi}</p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {muatUlang ? (
                        <Button onClick={() => window.location.reload()}>
                            <RefreshCw className="h-4 w-4" /> Muat ulang
                        </Button>
                    ) : (
                        <Button variant="outline" onClick={() => window.history.back()}>
                            <ArrowLeft className="h-4 w-4" /> Kembali
                        </Button>
                    )}
                    <Button asChild variant={muatUlang ? 'outline' : 'default'}>
                        <Link href="/dashboard">
                            <Home className="h-4 w-4" /> Ke Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
