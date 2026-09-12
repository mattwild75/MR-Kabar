import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { FileDown, Loader2 } from 'lucide-react';
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
export default function PanduanPublic({ dicetakPada, sumberUrl }: { dicetakPada?: string; sumberUrl?: string }) {
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
        <div className="bg-background text-foreground min-h-svh">
            <Head title="Apa itu Manajemen Risiko / MR Kabar">
                {/* Meta SEO dasar — halaman ini SATU-SATUNYA titik masuk publik
            (tanpa login) yang layak diindeks mesin pencari, lihat catatan
            keamanan di dokblok atas: tidak memuat data internal apa pun,
            murni konten edukasi statis (SECTIONS), jadi aman terekspos
            luas. Sebelumnya cuma ada <title>, tanpa description/OG — Google
            & preview share (WhatsApp dll) menampilkan cuplikan asal-asalan
            tanpa ini. */}
                <meta
                    name="description"
                    content="Panduan publik MR Kabar — aplikasi digitalisasi manajemen risiko Pemerintah Kabupaten Aceh Barat sesuai Peraturan Deputi PPKD BPKP No.4/2019. Pelajari konsep, proses 5 tahap, dan struktur pengelolaan risiko sektor publik."
                />
                <meta name="robots" content="index, follow" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Apa itu Manajemen Risiko / MR Kabar" />
                <meta
                    property="og:description"
                    content="Panduan publik MR Kabar — aplikasi digitalisasi manajemen risiko Pemerintah Kabupaten Aceh Barat sesuai Peraturan Deputi PPKD BPKP No.4/2019."
                />
                <meta property="og:site_name" content="MR Kabar" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content="Apa itu Manajemen Risiko / MR Kabar" />
                <meta
                    name="twitter:description"
                    content="Panduan publik MR Kabar — aplikasi digitalisasi manajemen risiko Pemerintah Kabupaten Aceh Barat sesuai Peraturan Deputi PPKD BPKP No.4/2019."
                />
            </Head>

            {/* Header minimal — bukan sidebar aplikasi, cukup logo + link kembali ke login */}
            <header className="bg-card/95 sticky top-0 z-20 border-b backdrop-blur print:hidden">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
                    <span className="font-serif text-lg font-semibold">MR Kabar</span>
                    <div className="flex items-center gap-4">
                        <TombolUnduhPdf />
                        {/* Hardcode '/login' (bukan route('login')) — halaman ini di-SSR
              (lihat resources/js/ssr.jsx) supaya title/meta SEO ikut
              ter-render di HTML awal utk crawler yg tidak eksekusi JS,
              tapi Ziggy's route() cuma tersedia di window (browser),
              bukan di proses Node SSR (window undefined -> "route is not
              defined" -> Inertia diam-diam fallback ke client render,
              artinya meta SEO TIDAK PERNAH benar2 ter-render). Path
              /login stabil (bukan route dinamis yg bisa berubah param),
              aman di-hardcode. */}
                        <Link href="/login" className="text-sm whitespace-nowrap text-sky-500 underline underline-offset-2 hover:text-sky-600">
                            ← Kembali ke halaman Masuk
                        </Link>
                    </div>
                </div>
            </header>

            <div className="mx-auto flex max-w-6xl gap-6 p-4">
                {/* Daftar isi — sticky, tersembunyi di layar sempit */}
                <nav className="bg-card sticky top-16 hidden h-fit w-64 shrink-0 space-y-1 rounded-md border p-3 text-sm lg:block print:hidden">
                    <p className="text-muted-foreground mb-2 px-2 text-xs font-semibold tracking-wide uppercase">Daftar Isi</p>
                    {SECTIONS.map((s) => (
                        <a
                            key={s.id}
                            href={`#${s.id}`}
                            className={`block rounded border-l-2 px-2 py-1.5 transition-colors ${
                                activeId === s.id
                                    ? 'text-foreground border-sky-500 bg-sky-500/10 font-medium'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground border-transparent'
                            }`}
                        >
                            {s.navLabel ?? s.title}
                        </a>
                    ))}
                </nav>

                {/* Konten */}
                <div className="panduan-isi min-w-0 flex-1 space-y-4 pb-16">
                    <div>
                        <h1 className="text-2xl font-semibold">Apa itu Manajemen Risiko / MR Kabar</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Panduan lengkap konsep manajemen risiko pemerintah daerah dan cara memakai aplikasi MR Kabar dari awal sampai akhir —
                            mengikuti kerangka 5W1H (Apa, Mengapa, Siapa, Kapan, Di mana, Bagaimana). Halaman ini terbuka untuk umum, tanpa perlu
                            login.
                        </p>

                        {/* Hanya muncul di berkas cetak. Sebuah PDF berpindah tangan
                            lepas dari halaman asalnya, jadi ia harus menyebut sendiri
                            dari mana dan kapan ia diambil — tanpa itu, tidak ada cara
                            membedakan cetakan hari ini dari cetakan tahun lalu. */}
                        <div className="mt-4 hidden border-y py-3 text-xs print:block">
                            <p>
                                Sumber: <span className="font-medium">{sumberUrl ?? '/panduan-publik'}</span>
                            </p>
                            {dicetakPada && <p className="mt-0.5">Dicetak pada {dicetakPada}</p>}
                            <p className="mt-0.5">
                                Isi berkas ini mengikuti halaman panduan pada saat diunduh. Bila ragu apakah masih mutakhir, unduh ulang dari alamat
                                di atas.
                            </p>
                        </div>
                    </div>

                    {/* Daftar isi versi cetak. Yang di samping layar tidak ikut
                        tercetak karena ia melekat pada gulungan halaman, dan pada
                        kertas tidak ada yang digulir. Penomorannya sepadan dengan
                        nomor yang muncul di depan tiap judul bagian, dihitung
                        counter CSS di blok <style> paling bawah. */}
                    <div className="panduan-daftar-isi hidden print:block">
                        <h2 className="mb-2 text-base font-semibold">Daftar Isi</h2>
                        {/* Nomor bawaan pada navLabel DIBUANG, lalu diganti nomor
                            urut daftar ini sendiri. Sebabnya penomoran di data tidak
                            utuh: "Navigasi & Sidebar" tidak bernomor, sehingga dua
                            puluh bagian hanya bernomor sampai sembilan belas. Kalau
                            dibiarkan, nomor di Daftar Isi tidak akan sepadan dengan
                            nomor yang dicetak di depan tiap judul bagian, dan pada
                            kertas ketidaksepadanan itu tidak bisa diperiksa dengan
                            mengeklik. */}
                        <ol className="list-inside list-decimal space-y-0.5 text-sm">
                            {SECTIONS.map((s) => (
                                <li key={s.id}>{(s.navLabel ?? s.title).replace(/^\d+\.\s*/, '')}</li>
                            ))}
                        </ol>
                    </div>

                    {/* Navigasi cepat versi mobile */}
                    <nav className="flex flex-wrap gap-2 lg:hidden print:hidden">
                        {SECTIONS.map((s) => (
                            <a
                                key={s.id}
                                href={`#${s.id}`}
                                className="bg-muted/50 text-muted-foreground hover:bg-muted rounded-full border px-3 py-1 text-xs"
                            >
                                {s.navLabel ?? s.title}
                            </a>
                        ))}
                    </nav>

                    {SECTIONS.map((s) => (
                        <section key={s.id} id={s.id} className="panduan-bagian bg-card scroll-mt-20 rounded-md border p-5">
                            <h2 className="mb-3 text-lg font-semibold">{s.title}</h2>
                            <div className="prose prose-sm dark:prose-invert max-w-none space-y-3 text-sm leading-relaxed">{s.content}</div>
                        </section>
                    ))}
                </div>
            </div>

            <style>{`
        @media print {
          /*
           * UKURAN DAN TEPI KERTAS SENGAJA TIDAK DITENTUKAN DI SINI.
           *
           * Halaman ini dicetak lewat PdfPrintService::downloadDokumen(), dan
           * di sanalah format A4 serta tepinya ditetapkan — kaki halaman
           * bernomor menuntut demikian, sebab Chromium tidak mendukung kotak
           * tepi @page. Kalau @page ditulis juga di sini, ia akan ditimpa
           * diam-diam dan hanya menyesatkan siapa pun yang membacanya kelak.
           */
          html, body { background: #fff !important; }

          /* Penomoran bagian, sepadan dengan Daftar Isi versi cetak di atas. */
          .panduan-isi { counter-reset: bagian; }
          .panduan-bagian { counter-increment: bagian; }
          .panduan-bagian > h2::before { content: counter(bagian) ". "; }

          /* Judul tidak boleh tertinggal sendirian di kaki halaman. */
          .panduan-bagian > h2 { break-after: avoid; }

          /* Bagian boleh terpotong antar halaman - sebagian memang berhalaman
             lebih dari satu - tetapi gambar dan tabelnya jangan. */
          figure, table, img { break-inside: avoid; }

          /*
           * YANG TERLALU LEBAR TIDAK BOLEH DIPOTONG DIAM-DIAM.
           *
           * Tujuh diagram di visuals.tsx dibungkus overflow-x-auto: di layar,
           * yang melebihi lebar dapat digeser ke samping. Di kertas tidak ada
           * yang bisa digeser - yang lewat tepi hilang tanpa tanda apa pun.
           * Terbukti pada diagram alur Lapor Kejadian Risiko: kotak keempat
           * dari empat terpotong separuh, dan pembaca cetak tidak punya cara
           * mengetahui bahwa ada yang hilang.
           */
          .panduan-bagian .overflow-x-auto { overflow-x: visible !important; }

          /* Deretan mendatar dibiarkan membungkus ke baris berikutnya, bukan
             dikecilkan - mengecilkannya membuat tulisan di dalam kotak tidak
             terbaca. */
          .panduan-bagian .overflow-x-auto.flex { flex-wrap: wrap; }

          /* Tabel berlebar-minimum dipaksa muat selebar kertas. */
          .panduan-bagian table { min-width: 0 !important; }

          .panduan-daftar-isi { break-after: page; }
        }
      `}</style>
        </div>
    );
}

/**
 * Tombol unduh khusus halaman publik ini.
 *
 * SENGAJA bukan UnduhPdfButton yang dipakai seluruh Form Cetak. Tombol itu
 * melaporkan kegagalan lewat toast, sedangkan <Toaster /> hanya terpasang di
 * AppLayout — dan halaman ini justru tidak memakai AppLayout. Memakainya di
 * sini berarti penolakan "sedang ada pencetakan lain" hilang tanpa jejak,
 * persis pada keadaan yang paling perlu dijelaskan kepada pengunjung.
 *
 * Diambil lewat fetch, bukan tautan biasa, karena pencetakannya memakan
 * puluhan detik: tanpa tanda apa pun, tombolnya wajar ditekan berulang.
 */
function TombolUnduhPdf() {
    const [sedang, setSedang] = useState(false);
    const [galat, setGalat] = useState<string | null>(null);

    const unduh = async () => {
        setSedang(true);
        setGalat(null);
        try {
            const res = await fetch('/panduan-publik/pdf');

            if (!res.ok) {
                setGalat(
                    res.status === 503
                        ? 'Sedang ada pencetakan lain yang berjalan. Tunggu sebentar lalu coba lagi.'
                        : res.status === 429
                          ? 'Terlalu banyak permintaan. Tunggu satu menit lalu coba lagi.'
                          : `Gagal menyiapkan PDF (${res.status}). Coba muat ulang halaman ini.`,
                );
                return;
            }

            const blob = await res.blob();
            const alamat = URL.createObjectURL(blob);
            const tautan = document.createElement('a');
            tautan.href = alamat;
            tautan.download = 'Panduan MR Kabar - Manajemen Risiko Pemerintah Daerah.pdf';
            document.body.appendChild(tautan);
            tautan.click();
            tautan.remove();
            // Dilepas belakangan: sebagian peramban membatalkan unduhannya
            // kalau alamat blob-nya dicabut pada saat yang sama.
            setTimeout(() => URL.revokeObjectURL(alamat), 10_000);
        } catch {
            setGalat('Gagal menghubungi server. Periksa koneksi lalu coba lagi.');
        } finally {
            setSedang(false);
        }
    };

    return (
        <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-3">
                <Button onClick={unduh} disabled={sedang} variant="outline" size="sm">
                    {sedang ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                        <FileDown className="mr-2 h-4 w-4" aria-hidden="true" />
                    )}
                    {sedang ? 'Menyiapkan PDF...' : 'Unduh PDF'}
                </Button>
            </div>
            {sedang && <p className="text-muted-foreground text-xs">Panduannya panjang, penyiapannya bisa sampai satu menit.</p>}
            {galat && <p className="max-w-xs text-right text-xs text-red-600 dark:text-red-400">{galat}</p>}
        </div>
    );
}
