import EduVideoPlayer from '@/components/edu-video-player';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { useEduVideo } from '@/lib/edu-video';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

interface Props {
    /** filemtime berkas video — ditempel ke URL supaya cache peramban tidak menahan versi lama. */
    versi: number | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Utilities', href: '#' },
    { title: 'Lapor', href: '/lapor-kejadian' },
    { title: 'Video Edukasi Dugaan Kecurangan', href: '/lapor-kejadian/video-kecurangan' },
];

const BAB = [
    { judul: 'Apa itu kecurangan', mulai: '0:37' },
    { judul: 'Beda dengan kejadian risiko', mulai: '1:41' },
    { judul: 'Tujuh bentuk kecurangan (UU Tipikor)', mulai: '2:25' },
    { judul: 'Tanda yang patut diwaspadai', mulai: '4:21' },
    { judul: 'Dasar hukum dan pintu lapor', mulai: '5:10' },
    { judul: 'Cara melapor', mulai: '5:46' },
    { judul: 'Amankah saya?', mulai: '7:06' },
    { judul: 'Setelah laporan terkirim', mulai: '8:03' },
];

/**
 * Video edukasi Lapor Dugaan Kecurangan (±9 menit). Isinya edukasi untuk
 * masyarakat umum yang baru memindai kode QR Lapor — apa itu kecurangan,
 * tujuh bentuknya menurut UU Tipikor, tandanya, cara melapor, dan
 * perlindungan pelapor — BUKAN tampilan kertas kerja MR Fraud.
 *
 * Videonya membawa audionya sendiri (tanpa stem terpisah seperti video
 * edukasi utama): halaman ini dibuka dari ponsel lewat QR, dan tiga berkas
 * audio tambahan hanya memberatkan koneksi tanpa ada yang mengatur mix-nya.
 */
export default function VideoKecurangan({ versi }: Props) {
    const v = versi ? `?v=${versi}` : '';
    const setelan = useEduVideo();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Video Edukasi: Lapor Dugaan Kecurangan" />
            <div className="mx-auto max-w-4xl space-y-4 p-4">
                <div className="flex items-start gap-2">
                    <ShieldAlert className="text-destructive mt-0.5 h-6 w-6 shrink-0" />
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Video Edukasi: Lapor Dugaan Kecurangan</h1>
                        <p className="text-muted-foreground text-sm">
                            Sembilan menit untuk memahami apa itu kecurangan, tujuh bentuknya menurut UU No. 31/1999 jo. UU No. 20/2001,
                            tanda-tandanya, cara melapor lewat kode QR, dan bagaimana identitas pelapor dijaga.
                        </p>
                    </div>
                </div>

                <EduVideoPlayer
                    src={`/video/video-edukasi-kecurangan.mp4${v}`}
                    vtt={`/video/kecurangan-subtitle.vtt${v}`}
                    subtitleEnabled={setelan.subtitleEnabled}
                    subtitleSize={setelan.subtitleSize}
                    downloads={[
                        { label: 'Unduh video 720p (bersubtitle, untuk sosialisasi luring)', href: `/video/video-edukasi-kecurangan-720p.mp4${v}` },
                        { label: 'Unduh transkrip (.txt)', href: `/video/kecurangan-transkrip.txt${v}` },
                    ]}
                />

                <div className="bg-card rounded-md border p-4">
                    <h2 className="mb-2 text-sm font-semibold">Isi video</h2>
                    <ol className="text-muted-foreground grid gap-1 text-sm sm:grid-cols-2">
                        {BAB.map((b, i) => (
                            <li key={b.judul} className="flex gap-2">
                                <span className="w-5 shrink-0 text-right tabular-nums">{i + 1}.</span>
                                <span>
                                    {b.judul} <span className="tabular-nums">({b.mulai})</span>
                                </span>
                            </li>
                        ))}
                    </ol>
                </div>

                <Button asChild variant="outline">
                    <Link href="/lapor-kejadian">
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke formulir Lapor
                    </Link>
                </Button>
            </div>
        </AppLayout>
    );
}
