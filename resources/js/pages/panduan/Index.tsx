import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { SECTIONS } from './sections';

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
