import EduVideoPlayer from '@/components/edu-video-player';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { useKecuranganVideo } from '@/lib/kecurangan-video';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Utilities', href: '#' },
    { title: 'Lapor', href: '/lapor-kejadian' },
    { title: 'Video Edukasi Dugaan Kecurangan', href: '/lapor-kejadian/video-kecurangan' },
];

const jam = (d: number) => `${Math.floor(d / 60)}:${String(Math.floor(d % 60)).padStart(2, '0')}`;

/**
 * Video edukasi Lapor Dugaan Kecurangan "Bunyikan Lonceng" (±13 menit).
 * Isinya edukasi untuk masyarakat umum yang baru memindai kode QR Lapor:
 * apa itu kecurangan dan mengapa terjadi, tujuh wajah korupsi, tanda-tandanya,
 * mengapa orang memilih diam, cara melapor yang benar, perlindungan pelapor,
 * dan apa yang terjadi setelah laporan terkirim — BUKAN tampilan kertas kerja
 * MR Fraud.
 *
 * Berkas, subtitle, dan mix audionya diatur Admin di /settingsapp (lihat
 * lib/kecurangan-video.ts). Daftar bab dibuat bersama videonya
 * (video-edukasi/fraud/v2/build_deliverables.py), dari timeline yang sama —
 * menit-detiknya tidak ditulis tangan.
 */
export default function VideoKecurangan() {
    const video = useKecuranganVideo();

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
                    src={video.src}
                    stems={video.stems}
                    gains={video.gains}
                    vtt={video.vtt}
                    subtitleEnabled={video.subtitleEnabled}
                    subtitleSize={video.subtitleSize}
                    chapters={video.bawaan ? video.chapters : []}
                    chapterNav={video.bawaan}
                    downloads={video.bawaan ? video.unduhan : undefined}
                />

                {video.bawaan && (
                    <div className="bg-card rounded-md border p-4">
                        <h2 className="mb-2 text-sm font-semibold">Isi video</h2>
                        <ol className="text-muted-foreground grid gap-1 text-sm sm:grid-cols-2 sm:gap-x-8">
                            {video.chapters.map((b) => (
                                <li key={b.id} className="flex gap-3">
                                    <span className="w-11 shrink-0 text-right font-mono text-xs leading-5 tabular-nums">{jam(b.mulai)}</span>
                                    <span>{b.judul}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

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
