import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { SECTIONS } from './sections';

/**
 * Versi PUBLIK halaman /panduan — dapat diakses siapa saja TANPA login
 * (lihat routes/web.php: route ini SENGAJA di luar middleware 'auth').
 * TIDAK memakai AppLayout (sidebar aplikasi penuh) sama sekali — sidebar
 * itu bergantung pada data user login (menu sesuai role, dsb) yang tidak
 * ada untuk pengunjung tamu, dan kalau ikut ter-render akan
 * membocorkan struktur menu internal aplikasi ke publik.
 *
 * Konten (SECTIONS) di-reuse PERSIS sama dari sections.tsx, satu-satunya
 * sumber kebenaran — mengedit konten Panduan di satu tempat otomatis
 * ter-update di kedua halaman (publik & yang login), tidak ada duplikasi
 * teks yang perlu disinkronkan manual.
 *
 * Halaman ini TIDAK memuat data apa pun dari server (props kosong,
 * SECTIONS murni konstanta di bundle frontend) — aman diakses tanpa
 * autentikasi krn tidak ada informasi internal/sensitif yang terekspos,
 * lihat catatan keamanan lengkap di komentar route.
 */
export default function PanduanPublic() {
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
    <div className="min-h-svh bg-background text-foreground">
      <Head title="Apa itu Manajemen Risiko / MR Kabar" />

      {/* Header minimal — bukan sidebar aplikasi, cukup logo + link kembali ke login */}
      <header className="sticky top-0 z-20 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <span className="font-serif text-lg font-semibold">MR Kabar</span>
          <Link href={route('login')} className="text-sm text-sky-500 underline underline-offset-2 hover:text-sky-600">
            ← Kembali ke halaman Masuk
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 p-4">
        {/* Daftar isi — sticky, tersembunyi di layar sempit */}
        <nav className="sticky top-16 hidden h-fit w-64 shrink-0 space-y-1 rounded-md border bg-card p-3 text-sm lg:block">
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
        <div className="min-w-0 flex-1 space-y-4 pb-16">
          <div>
            <h1 className="text-2xl font-semibold">Apa itu Manajemen Risiko / MR Kabar</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Panduan lengkap konsep manajemen risiko pemerintah daerah dan cara memakai aplikasi MR Kabar dari awal
              sampai akhir — mengikuti kerangka 5W1H (Apa, Mengapa, Siapa, Kapan, Di mana, Bagaimana). Halaman ini
              terbuka untuk umum, tanpa perlu login.
            </p>
          </div>

          {/* Navigasi cepat versi mobile */}
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
    </div>
  );
}
