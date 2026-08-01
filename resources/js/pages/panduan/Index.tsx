import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { SECTIONS } from './sections';
import EduVideoPlayer from '@/components/edu-video-player';
import EduVideoQuiz from '@/components/edu-video-quiz';
import { useEduVideo } from '@/lib/edu-video';

/**
 * Halaman panduan/dokumentasi statis "Apa itu Manajemen Risiko / MR Kabar".
 * Kontennya diambil dari ./sections.tsx (dipisah dari komponen ini) supaya
 * MUDAH DIPERBARUI seiring aplikasi berkembang — tambah/ubah section cukup
 * edit array SECTIONS, tidak perlu sentuh layout/navigasi di file ini.
 *
 * Scroll-spy sederhana: highlight item daftar isi sesuai section yang
 * sedang terlihat di viewport, pakai IntersectionObserver bawaan browser
 * (tanpa library tambahan).
 */
export default function PanduanIndex() {
  const [activeId, setActiveId] = useState<string>(SECTIONS[0]?.id ?? '');
  const video = useEduVideo();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const topMost = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b));
          setActiveId(topMost.target.id);
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    );

    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <AppLayout>
      <Head title="Apa itu Manajemen Risiko / MR Kabar" />

      <div className="flex gap-6 p-4">
        {/* Daftar isi — sticky, tersembunyi di layar sempit */}
        <nav className="sticky top-4 hidden h-fit w-64 shrink-0 space-y-1 rounded-md border bg-card p-3 text-sm lg:block">
          <p className="mb-2 px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Daftar Isi</p>
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`block rounded border-l-2 px-2 py-1.5 transition-colors ${
                activeId === s.id
                  ? 'border-sky-500 bg-sky-500/10 font-medium text-foreground'
                  : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {s.navLabel ?? s.title}
            </a>
          ))}
        </nav>

        {/* Konten */}
        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <h1 className="text-2xl font-semibold">Apa itu Manajemen Risiko / MR Kabar</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Panduan lengkap konsep manajemen risiko pemerintah daerah dan cara memakai aplikasi MR Kabar dari awal
              sampai akhir — mengikuti kerangka 5W1H (Apa, Mengapa, Siapa, Kapan, Di mana, Bagaimana). Halaman ini
              bersifat dinamis dan akan terus diperbarui seiring pengembangan aplikasi.
            </p>
          </div>

          {/* Navigasi cepat versi mobile (di atas layar lg, nav sticky sudah cukup) */}
          <nav className="flex flex-wrap gap-2 lg:hidden">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground hover:bg-muted"
              >
                {s.navLabel ?? s.title}
              </a>
            ))}
          </nav>

          {/* Video edukasi versi LENGKAP ditaruh di sini, bukan cuma di halaman
              login: 30 menit terlalu panjang untuk ditonton orang yang sedang
              berdiri di pintu masuk. Di sini penonton bisa melompat per bab,
              menyaring bagian sesuai perannya, dan menguji pemahamannya. */}
          {video.enabled && (
          <section id="video-edukasi" className="scroll-mt-20 rounded-md border bg-card p-5">
            <h2 className="mb-1 text-lg font-semibold">Video Edukasi (versi lengkap)</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              {video.bawaan
                ? 'Seluruh isi panduan ini dalam bentuk video 30 menit — lima tahap Perdep PPKD No.4/2019, cara menulis pernyataan risiko, membaca matriks 5×5, sampai satu contoh risiko yang ditelusuri dari awal hingga muncul di Dashboard. Klik judul bab untuk melompat langsung ke bagiannya.'
                : 'Video edukasi yang dipasang oleh admin aplikasi.'}
            </p>
            <EduVideoPlayer
              src={video.src}
              vtt={video.vtt}
              subtitleEnabled={video.subtitleEnabled}
              subtitleSize={video.subtitleSize}
              stems={video.stems}
              gains={video.gains}
              chapterNav={video.bawaan}
              showChapters={video.bawaan}
              downloads={
                video.bawaan
                  ? [
                      { label: 'Unduh video 720p (bersubtitle, untuk sosialisasi luring)', href: '/video/video-edukasi-mr-kabar-720p.mp4' },
                      { label: 'Unduh transkrip (.txt)', href: '/video/edu-transkrip.txt' },
                    ]
                  : undefined
              }
            />
            {video.bawaan && (
              <div className="mt-6 border-t pt-5">
                <EduVideoQuiz />
              </div>
            )}
          </section>
          )}

          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-20 rounded-md border bg-card p-5">
              <h2 className="mb-3 text-lg font-semibold">{s.title}</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none space-y-3 text-sm leading-relaxed">
                {s.content}
              </div>
            </section>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
