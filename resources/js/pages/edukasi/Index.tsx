import EduVideoPlayer from '@/components/edu-video-player';
import { useEduVideo, useVersiVideo } from '@/lib/edu-video';
import { useKecuranganVideo } from '@/lib/kecurangan-video';
import { useTutorialVideo, useVersiTutorial } from '@/lib/tutorial-video';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, LogIn, PlayCircle, ShieldAlert, Wrench } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Halaman tonton video PUBLIK (/edukasi), tanpa login. Tautannya dibagikan ke
 * seluruh ASN dan pemangku kepentingan Pemerintah Kabupaten Aceh Barat.
 *
 * Halaman ini sengaja berdiri sendiri: tidak memakai AppLayout (yang butuh
 * data login dan menu), tidak memuat data apa pun dari database selain kolom
 * setelan video (dikirim oleh rutenya, lihat SettingApp::KOLOM_VIDEO), dan
 * tidak memuat kuis video (penyimpanannya butuh akun).
 *
 * Urutannya ditetapkan pemilik aplikasi: edukasi manajemen risiko di atas,
 * edukasi dugaan kecurangan di tengah, tutorial pengisian paling bawah.
 * Tautan '/login' dan '/panduan-publik' ditulis langsung (bukan route())
 * karena halaman publik ikut di-SSR, sedangkan Ziggy hanya ada di peramban.
 */

const JUDUL = 'Video Edukasi MR Kabar: Manajemen Risiko Pemerintah Kabupaten Aceh Barat';
const DESKRIPSI =
    'Tiga video untuk seluruh ASN dan pemangku kepentingan Pemerintah Kabupaten Aceh Barat: edukasi manajemen risiko, edukasi lapor dugaan kecurangan, dan tutorial pengisian aplikasi MR Kabar.';

function Bagian({ id, ikon, judul, durasi, children }: { id: string; ikon: ReactNode; judul: string; durasi?: string; children: ReactNode }) {
    return (
        <section id={id} className="bg-card scroll-mt-20 rounded-md border p-4 sm:p-5">
            <div className="mb-2 flex items-start gap-2">
                <span className="mt-0.5 shrink-0">{ikon}</span>
                <h2 className="text-lg font-semibold text-balance">
                    {judul}
                    {durasi && <span className="text-muted-foreground ml-2 text-sm font-normal tabular-nums">{durasi}</span>}
                </h2>
            </div>
            {children}
        </section>
    );
}

export default function EdukasiPublik() {
    const edu = useEduVideo();
    const kecurangan = useKecuranganVideo();
    const tutorial = useTutorialVideo();
    const vEdu = useVersiVideo();
    const vTutorial = useVersiTutorial();

    const daftar = [
        edu.enabled && { id: 'video-edukasi', label: 'Edukasi Manajemen Risiko' },
        kecurangan.enabled && { id: 'video-kecurangan', label: 'Lapor Dugaan Kecurangan' },
        tutorial.enabled && { id: 'video-tutorial', label: 'Tutorial Pengisian' },
    ].filter(Boolean) as { id: string; label: string }[];

    return (
        <div className="bg-background text-foreground min-h-svh">
            <Head title="Video Edukasi MR Kabar">
                <meta name="description" content={DESKRIPSI} />
                <meta name="robots" content="index, follow" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={JUDUL} />
                <meta property="og:description" content={DESKRIPSI} />
                <meta property="og:site_name" content="MR Kabar" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={JUDUL} />
                <meta name="twitter:description" content={DESKRIPSI} />
            </Head>

            <header className="bg-card/95 sticky top-0 z-20 border-b backdrop-blur">
                <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
                    <span className="font-serif text-lg font-semibold">MR Kabar</span>
                    <nav className="flex items-center gap-4 text-sm">
                        <Link
                            href="/panduan-publik"
                            className="hidden items-center gap-1 text-sky-500 underline-offset-2 hover:underline sm:inline-flex"
                        >
                            <BookOpen className="h-4 w-4" />
                            Panduan
                        </Link>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1 whitespace-nowrap text-sky-500 underline-offset-2 hover:underline"
                        >
                            <LogIn className="h-4 w-4" />
                            Masuk ke MR Kabar
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-4xl space-y-4 px-4 pt-6 pb-16">
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">Video Edukasi Manajemen Risiko</h1>
                    <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
                        Untuk seluruh ASN dan pemangku kepentingan Pemerintah Kabupaten Aceh Barat. Tonton dari atas: apa itu manajemen risiko,
                        bagaimana melaporkan dugaan kecurangan, lalu cara mengisi aplikasi MR Kabar. Subtitle dapat dinyalakan, dan judul bab dapat
                        diklik untuk melompat ke bagiannya.
                    </p>
                    {daftar.length > 1 && (
                        <nav className="flex flex-wrap gap-2 pt-1" aria-label="Pilih video">
                            {daftar.map((d) => (
                                <a
                                    key={d.id}
                                    href={`#${d.id}`}
                                    className="hover:bg-muted inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium"
                                >
                                    <PlayCircle className="h-3.5 w-3.5" />
                                    {d.label}
                                </a>
                            ))}
                        </nav>
                    )}
                </div>

                {edu.enabled && (
                    <Bagian
                        id="video-edukasi"
                        ikon={<PlayCircle className="h-5 w-5 text-sky-500" />}
                        judul="1. Berlayar dengan Peta Risiko"
                        durasi={edu.bawaan ? '15 menit' : undefined}
                    >
                        <p className="text-muted-foreground mb-4 text-sm">
                            {edu.bawaan
                                ? 'Apa itu risiko, siapa nakhodanya, lima tahap pengelolaan risiko menurut Perdep PPKD BPKP No. 4/2019, cara menulis pernyataan risiko, membaca matriks 5×5, sampai satu contoh risiko yang ditelusuri dari awal hingga muncul di Dashboard.'
                                : 'Video edukasi manajemen risiko.'}
                        </p>
                        <EduVideoPlayer
                            src={edu.src}
                            vtt={edu.vtt}
                            subtitleEnabled={edu.subtitleEnabled}
                            subtitleSize={edu.subtitleSize}
                            stems={edu.stems}
                            gains={edu.gains}
                            chapterNav={edu.bawaan}
                            showChapters={edu.bawaan}
                            downloads={
                                edu.bawaan
                                    ? [
                                          {
                                              label: 'Unduh video 720p (subtitle menempel, untuk dibagikan)',
                                              href: '/video/video-edukasi-mr-kabar-720p.mp4' + vEdu,
                                          },
                                          { label: 'Unduh transkrip (.txt)', href: '/video/edu-transkrip.txt' + vEdu },
                                      ]
                                    : undefined
                            }
                        />
                    </Bagian>
                )}

                {kecurangan.enabled && (
                    <Bagian
                        id="video-kecurangan"
                        ikon={<ShieldAlert className="text-destructive h-5 w-5" />}
                        judul="2. Bunyikan Lonceng: Lapor Dugaan Kecurangan"
                        durasi={kecurangan.bawaan ? '13 menit' : undefined}
                    >
                        <p className="text-muted-foreground mb-4 text-sm">
                            {kecurangan.bawaan
                                ? 'Apa itu kecurangan dan mengapa terjadi, tujuh wajah korupsi menurut UU No. 31/1999 jo. UU No. 20/2001, tanda-tandanya, mengapa orang memilih diam, cara melapor yang benar lewat kode QR, bagaimana identitas pelapor dijaga, dan apa yang terjadi setelah laporan terkirim.'
                                : 'Video edukasi lapor dugaan kecurangan.'}
                        </p>
                        <EduVideoPlayer
                            src={kecurangan.src}
                            stems={kecurangan.stems}
                            gains={kecurangan.gains}
                            vtt={kecurangan.vtt}
                            subtitleEnabled={kecurangan.subtitleEnabled}
                            subtitleSize={kecurangan.subtitleSize}
                            chapters={kecurangan.bawaan ? kecurangan.chapters : []}
                            chapterNav={kecurangan.bawaan}
                            showChapters={kecurangan.bawaan}
                            downloads={kecurangan.bawaan ? kecurangan.unduhan.filter((u) => !u.label.includes('1080p')) : undefined}
                        />
                    </Bagian>
                )}

                {tutorial.enabled && (
                    <Bagian
                        id="video-tutorial"
                        ikon={<Wrench className="h-5 w-5 text-amber-500" />}
                        judul="3. Tutorial Pengisian MR Kabar"
                        durasi={tutorial.bawaan ? '40 menit' : undefined}
                    >
                        <p className="text-muted-foreground mb-3 text-sm">
                            Satu perangkat daerah menempuh satu tahun penilaian penuh: Data Umum, CEE, tiga tingkatan risiko, Formulir 8 sampai 10,
                            kejadian risiko dari sisi pelapor dan PIC, sampai formulir cetak, laporan, dan cara pimpinan membaca Dashboard.
                        </p>
                        <p className="mb-4 rounded-md border border-amber-500/60 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                            <strong>Seluruh isian dalam video ini adalah data contoh.</strong> Untuk pengisian yang sesungguhnya, setiap pernyataan
                            risiko, penyebab, dan angka skala dikembalikan kepada penilai risiko di perangkat daerah masing-masing.
                        </p>
                        <EduVideoPlayer
                            src={tutorial.src}
                            stems={tutorial.stems}
                            gains={tutorial.gains}
                            vtt={tutorial.vtt}
                            subtitleEnabled={tutorial.subtitleEnabled}
                            subtitleSize={tutorial.subtitleSize}
                            chapters={tutorial.chapters}
                            chapterNav={tutorial.bawaan}
                            showChapters={tutorial.bawaan}
                            downloads={
                                tutorial.bawaan
                                    ? [
                                          {
                                              label: 'Unduh video 720p (subtitle menempel, untuk dibagikan)',
                                              href: '/video/tutorial-mr-kabar-720p.mp4' + vTutorial,
                                          },
                                          { label: 'Unduh transkrip (.txt)', href: '/video/tutorial-transkrip.txt' + vTutorial },
                                      ]
                                    : undefined
                            }
                        />
                    </Bagian>
                )}

                <footer className="text-muted-foreground border-t pt-4 text-xs leading-relaxed">
                    MR Kabar, aplikasi manajemen risiko Pemerintah Kabupaten Aceh Barat. Sudah punya akun?{' '}
                    <Link href="/login" className="text-sky-500 underline underline-offset-2">
                        Masuk di sini
                    </Link>
                    . Ingin membaca panduan tertulisnya?{' '}
                    <Link href="/panduan-publik" className="text-sky-500 underline underline-offset-2">
                        Buka Panduan
                    </Link>
                    .
                </footer>
            </main>
        </div>
    );
}
