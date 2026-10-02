import EduVideoPlayer from '@/components/edu-video-player';
import { Button } from '@/components/ui/button';
import babData from '@/data/kecurangan-video-chapters.json';
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

// Daftar bab dibuat bersama videonya (video-edukasi/fraud/v2/build_deliverables.py),
// dari timeline yang sama — menit-detiknya tidak ditulis tangan.
const BAB = babData as { id: string; judul: string; mulai: number; selesai: number; durasi: number; sasaran: string }[];

const jam = (d: number) => `${Math.floor(d / 60)}:${String(Math.floor(d % 60)).padStart(2, '0')}`;

/**
 * Video edukasi Lapor Dugaan Kecurangan "Bunyikan Lonceng" (±13 menit).
 * Isinya edukasi untuk masyarakat umum yang baru memindai kode QR Lapor:
 * apa itu kecurangan dan mengapa terjadi, tujuh wajah korupsi, tanda-tandanya,
 * mengapa orang memilih diam, cara melapor yang benar, perlindungan pelapor,
 * dan apa yang terjadi setelah laporan terkirim — BUKAN tampilan kertas kerja
 * MR Fraud.
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
                            Sekitar tiga belas menit tentang apa itu kecurangan dan mengapa terjadi, tujuh wajah korupsi menurut UU No. 31/1999 jo. UU
                            No. 20/2001, tanda-tandanya, mengapa orang memilih diam, cara melapor yang benar lewat kode QR, bagaimana identitas
                            pelapor dijaga, dan apa yang terjadi setelah laporan terkirim.
                        </p>
                    </div>
                </div>

                <EduVideoPlayer
                    src={`/video/video-edukasi-kecurangan.mp4${v}`}
                    vtt={`/video/kecurangan-subtitle.vtt${v}`}
                    subtitleEnabled={setelan.subtitleEnabled}
                    subtitleSize={setelan.subtitleSize}
                    chapters={BAB}
                    chapterNav
                    downloads={[
                        {
                            label: 'Unduh video 1080p (MP4 lengkap: subtitle bisa dinyalakan/dimatikan, daftar bab)',
                            href: `/video/video-edukasi-kecurangan.mp4${v}`,
                        },
                        {
                            label: 'Unduh video 720p (subtitle menempel, untuk dibagikan & sosialisasi luring)',
                            href: `/video/video-edukasi-kecurangan-720p.mp4${v}`,
                        },
                        { label: 'Unduh transkrip (.txt)', href: `/video/kecurangan-transkrip.txt${v}` },
                    ]}
                />

                <div className="bg-card rounded-md border p-4">
                    <h2 className="mb-2 text-sm font-semibold">Isi video</h2>
                    <ol className="text-muted-foreground grid gap-1 text-sm sm:grid-cols-2 sm:gap-x-8">
                        {BAB.map((b) => (
                            <li key={b.id} className="flex gap-3">
                                <span className="w-11 shrink-0 text-right font-mono text-xs leading-5 tabular-nums">{jam(b.mulai)}</span>
                                <span>{b.judul}</span>
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
