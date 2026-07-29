import AppLogoIcon from '@/components/app-logo-icon';
import { useAppearance } from '@/hooks/use-appearance';
import { Link, usePage } from '@inertiajs/react';
import { Monitor, Moon, RotateCcw, Sun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

const APPEARANCE_CYCLE: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];

const APPEARANCE_ICON = {
    light: Sun,
    dark: Moon,
    system: Monitor,
} as const;

const APPEARANCE_LABEL = {
    light: 'Mode terang aktif — klik untuk mode gelap',
    dark: 'Mode gelap aktif — klik untuk mode sistem',
    system: 'Mengikuti sistem — klik untuk mode terang',
} as const;

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    const { props } = usePage();
    const { appearance, updateAppearance } = useAppearance();

    // Parallax: posisi mouse relatif ke TENGAH viewport (-1..1 tiap sumbu),
    // dipakai utk menggeser layer dekoratif dgn kedalaman berbeda (orb jauh
    // gerak lebih besar, garis ukiran dekat gerak lebih kecil) + tilt ringan
    // kartu kaca itu sendiri — efek "Animated Glassmorphism Parallax Login
    // Form" sesuai referensi user. Dinonaktifkan otomatis kalau OS minta
    // reduced motion (aksesibilitas), lihat prefersReducedMotion di bawah.
    const containerRef = useRef<HTMLDivElement>(null);
    const [pointer, setPointer] = useState({ x: 0, y: 0 });
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mq.matches);
        const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    useEffect(() => {
        if (prefersReducedMotion) return;

        const handlePointerMove = (e: PointerEvent) => {
            // Mouse (kursor) hanya relevan di perangkat yg py pointer halus
            // (desktop/trackpad) — di tablet/HP sentuhan jari TIDAK dipakai
            // utk parallax (jari cuma dipakai isi form), gerakan itu datang
            // dari gyroscope (lihat handleOrientation di bawah) supaya
            // menggerakkan HP itu sendiri yg menggeser layer, bukan sentuhan.
            if (e.pointerType !== 'mouse') return;
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
            setPointer({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
        };

        window.addEventListener('pointermove', handlePointerMove);
        return () => window.removeEventListener('pointermove', handlePointerMove);
    }, [prefersReducedMotion]);

    // Gyroscope (device orientation) — kounterpart mouse-parallax utk
    // tablet/HP: memiringkan perangkat menggeser layer dekoratif & tilt
    // kartu, sama persis efeknya spt menggerakkan mouse di desktop (dipakai
    // state `pointer` yg SAMA, lihat depth()/rotateX/rotateY di bawah).
    // iOS Safari (13+) WAJIB izin eksplisit via gesture user
    // (DeviceOrientationEvent.requestPermission()) — tanpa gesture, event
    // 'deviceorientation' tidak akan pernah terpicu di iOS, beda dari
    // Android yg langsung aktif tanpa prompt apapun.
    const [needsGyroPermission, setNeedsGyroPermission] = useState(false);
    const [gyroGranted, setGyroGranted] = useState(false);

    // Effect 1: cek DI AWAL apakah perangkat/browser ini butuh gesture
    // eksplisit (iOS 13+) sebelum device orientation bisa dipakai — TIDAK
    // memasang listener di sini, cuma menentukan perlu tampilkan tombol
    // "Aktifkan efek miring" atau tidak.
    useEffect(() => {
        if (prefersReducedMotion) return;
        if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) return;

        const RequestableDeviceOrientationEvent = DeviceOrientationEvent as unknown as {
            requestPermission?: () => Promise<'granted' | 'denied'>;
        };

        if (typeof RequestableDeviceOrientationEvent.requestPermission === 'function') {
            setNeedsGyroPermission(true);
        } else {
            // Android/browser lain: tidak ada API permission, boleh langsung dianggap "granted".
            setGyroGranted(true);
        }
    }, [prefersReducedMotion]);

    // Effect 2: listener SUNGGUH dipasang hanya setelah izin didapat
    // (langsung di Android, atau setelah user tap tombol di iOS) — dipisah
    // dari effect 1 supaya listener tidak pernah terpasang sebelum izin
    // benar2 ada (requestPermission() WAJIB dipanggil dari dalam gesture
    // handler, bukan dari useEffect biasa, makanya requestGyroPermission()
    // di bawah dipanggil langsung dari onClick tombol, bukan dari sini).
    useEffect(() => {
        if (prefersReducedMotion || !gyroGranted) return;

        const handleOrientation = (e: DeviceOrientationEvent) => {
            if (e.beta === null || e.gamma === null) return;
            // gamma: kemiringan kiri-kanan (-90..90), beta: depan-belakang
            // (-180..180) — dibatasi ke rentang wajar genggaman tangan
            // (+-25 derajat) lalu dinormalisasi ke -1..1 spt pointer mouse,
            // supaya skala gerakannya konsisten dgn depth() yg sama dipakai
            // versi desktop.
            const x = Math.max(-1, Math.min(1, e.gamma / 25));
            const y = Math.max(-1, Math.min(1, (e.beta - 45) / 25));
            setPointer({ x, y });
        };

        window.addEventListener('deviceorientation', handleOrientation);
        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, [prefersReducedMotion, gyroGranted]);

    const requestGyroPermission = () => {
        const RequestableDeviceOrientationEvent = DeviceOrientationEvent as unknown as {
            requestPermission?: () => Promise<'granted' | 'denied'>;
        };

        RequestableDeviceOrientationEvent.requestPermission?.()
            .then((result) => {
                setNeedsGyroPermission(false);
                if (result === 'granted') {
                    setGyroGranted(true);
                }
            })
            .catch(() => {
                // Ditolak/gagal — biarkan efek parallax diam (fallback statis),
                // BUKAN error yg mengganggu alur login.
                setNeedsGyroPermission(false);
            });
    };

    const depth = (strength: number) => (prefersReducedMotion ? {} : { transform: `translate3d(${pointer.x * strength}px, ${pointer.y * strength}px, 0)` });

    // Seberapa besar kartu SEDANG dimiringkan sekarang (0 = pas tengah/diam,
    // 1 = miring penuh ke salah satu sudut) — dipakai supaya efek KACA
    // (transparansi+blur) terasa TERKAIT LANGSUNG dgn gerakan tilt 3D,
    // bukan transparansi statis yg selalu sama: makin miring kartunya
    // (makin digoyang mouse/gyro), makin transparan & makin kuat blur-nya,
    // meniru kaca sungguhan yg berubah pantulan/tembus-pandangnya saat
    // dimiringkan. Saat diam (pointer 0,0) kartu HAMPIR solid (mudah
    // dibaca); saat digoyang, transparansi kaca baru benar2 terlihat.
    const tiltMagnitude = Math.min(1, Math.hypot(pointer.x, pointer.y));

    // Tema TERAPLIKASI sesungguhnya (bukan pilihan 'system' mentah) — dibaca
    // dari class .dark di <html> yg SUDAH di-toggle oleh useAppearance()/
    // applyTheme(), supaya kartu kaca tahu warna rgba mana yg harus dipakai
    // (putih vs gelap) walau appearance user = 'system'. Dipantau via
    // MutationObserver krn class itu bisa berubah kapan saja (user ganti
    // tema, atau OS ganti preferensi saat appearance='system').
    const [isDark, setIsDark] = useState(false);
    useEffect(() => {
        const update = () => setIsDark(document.documentElement.classList.contains('dark'));
        update();
        const observer = new MutationObserver(update);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const setting = props?.setting as {
        nama_app: string;
        logo?: string;
        logo_bg?: string | null;
        warna?: string;
        seo?: {
            title?: string;
            description?: string;
            keywords?: string;
        };
    };

    const primaryColor = setting?.warna || '#A8201A';
    const primaryForeground = '#ffffff';

    useEffect(() => {
        document.documentElement.style.setProperty('--primary', primaryColor);
        document.documentElement.style.setProperty('--color-primary', primaryColor);
        document.documentElement.style.setProperty('--primary-foreground', primaryForeground);
        document.documentElement.style.setProperty('--color-primary-foreground', primaryForeground);
    }, [primaryColor, primaryForeground]);

    const cycleAppearance = () => {
        const currentIndex = APPEARANCE_CYCLE.indexOf(appearance);
        const next = APPEARANCE_CYCLE[(currentIndex + 1) % APPEARANCE_CYCLE.length];
        updateAppearance(next);
    };

    const AppearanceIcon = APPEARANCE_ICON[appearance];

    return (
        // bg-aceh-cream / dark:bg-aceh-black stay here as the BASE layer —
        // these ARE correct background tokens (past bug was in TEXT colors).
        // mesh gradient warna identitas ditumpuk di atasnya via layer terpisah di bawah.
        <div
            ref={containerRef}
            className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-aceh-cream p-6 dark:bg-aceh-black md:p-10"
        >
            {/* mesh gradient lembut ala SIPD — beberapa radial-gradient warna
                identitas bertumpuk, bukan lagi orb tunggal, supaya latar tidak polos.
                Layer PALING JAUH secara parallax -> gerak paling kecil. */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.55] transition-transform duration-300 ease-out dark:opacity-[0.65]"
                style={{
                    background: `
                        radial-gradient(ellipse 60% 50% at 15% 20%, ${primaryColor}, transparent 60%),
                        radial-gradient(ellipse 50% 45% at 85% 15%, #2b6777, transparent 60%),
                        radial-gradient(ellipse 55% 50% at 80% 85%, ${primaryColor}, transparent 60%),
                        radial-gradient(ellipse 45% 40% at 10% 90%, #e0a458, transparent 60%)
                    `,
                    ...depth(6),
                }}
                aria-hidden="true"
            />

            {/* motif garis "ukiran" — lebih tegas dari sebelumnya, pola
                lengkung berlapis bergaya batik/tenun Aceh, murni dekoratif.
                Kedalaman menengah -> gerak sedang, arah berlawanan dari orb
                supaya kesan lapisan (bukan semua bergerak seragam). */}
            <svg
                className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.16] transition-transform duration-300 ease-out dark:opacity-[0.20]"
                viewBox="0 0 800 800"
                style={depth(-14)}
                aria-hidden="true"
            >
                <path d="M-50 120 Q 150 20, 350 90 T 850 50" stroke={primaryColor} strokeWidth="1.5" fill="none" />
                <path d="M-50 250 Q 150 150, 350 220 T 750 180" stroke={primaryColor} strokeWidth="2" fill="none" />
                <path d="M-50 380 Q 180 280, 400 360 T 850 320" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M-50 500 Q 200 420, 420 480 T 850 460" stroke={primaryColor} strokeWidth="2" fill="none" />
                <path d="M-50 620 Q 220 560, 440 600 T 850 600" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M-50 730 Q 200 660, 420 710 T 850 690" stroke={primaryColor} strokeWidth="1.5" fill="none" />
                <circle cx="120" cy="140" r="3" fill={primaryColor} />
                <circle cx="680" cy="660" r="3" fill={primaryColor} />
                <circle cx="720" cy="110" r="2" fill="currentColor" />
                <circle cx="90" cy="700" r="2" fill="currentColor" />
            </svg>

            {/* "Aurora" lembut — pita warna melengkung, JENUH warnanya tapi
                TEPINYA lembut lewat transisi conic-gradient sendiri (bukan
                garis diagonal tegas spt versi sebelumnya yg terkesan kasar/
                grafis, sesuai koreksi user). SENGAJA TIDAK diberi kelas
                blur-* sendiri (beda dari orb-orb lain di file ini) — dot
                grid & layer lain yg SUDAH diblur sendiri sebelumnya terbukti
                jadi terlalu lemah kontrasnya setelah diburamkan LAGI oleh
                backdrop-blur kartu (blur di atas blur = nyaris hilang).
                Warnanya tetap jenuh & TAJAM di sini spy ada detail nyata
                utk backdrop-blur kartu kaca proses jadi smear lembut. */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.65] transition-transform duration-300 ease-out dark:opacity-[0.55]"
                style={{
                    background: `conic-gradient(from 200deg at 50% 35%, ${primaryColor}, #2b6777, #e0a458, ${primaryColor})`,
                    ...depth(-10),
                }}
                aria-hidden="true"
            />

            {/* dua orb gradient lembut warna primer, murni dekoratif —
                kedalaman PALING DEKAT -> gerak paling besar, jadi elemen
                paling terasa "melayang" mengikuti mouse. Opacity dinaikkan
                dari versi sebelumnya supaya warna yg tembus lewat kartu kaca
                (backdrop-blur) benar2 terlihat, bukan cuma putih/hitam polos. */}
            <div
                className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-[0.28] blur-3xl transition-transform duration-200 ease-out dark:opacity-[0.32]"
                style={{ background: `radial-gradient(circle, ${primaryColor}, transparent 70%)`, ...depth(28) }}
                aria-hidden="true"
            />
            <div
                className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full opacity-[0.24] blur-3xl transition-transform duration-200 ease-out dark:opacity-[0.28]"
                style={{ background: `radial-gradient(circle, ${primaryColor}, transparent 70%)`, ...depth(-24) }}
                aria-hidden="true"
            />

            {/* orb warna TAMBAHAN persis di belakang posisi kartu (tengah
                viewport) — dua orb sudut di atas ada di pojok, jadi warna yg
                tembus tepat di balik kartu kaca sebelumnya nyaris kosong.
                Ini mengisi kekosongan itu supaya efek kaca terasa di seluruh
                permukaan kartu, bukan cuma tepi. */}
            <div
                className="pointer-events-none absolute top-1/2 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.3] blur-3xl transition-transform duration-200 ease-out dark:opacity-[0.34]"
                style={{
                    background: `radial-gradient(circle, #2b6777, transparent 65%)`,
                    ...depth(16),
                }}
                aria-hidden="true"
            />

            <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
                {/* Tombol izin gyroscope — HANYA muncul di iOS 13+ (satu-
                    satunya platform yg mewajibkan gesture eksplisit sebelum
                    device orientation aktif). Android/desktop tidak pernah
                    melihat tombol ini krn needsGyroPermission tetap false. */}
                {needsGyroPermission && (
                    <button
                        type="button"
                        onClick={requestGyroPermission}
                        className="flex h-9 items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 text-xs text-foreground backdrop-blur transition-all duration-200 hover:scale-105 hover:bg-card hover:shadow-md"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Aktifkan efek miring
                    </button>
                )}
                <button
                    type="button"
                    onClick={cycleAppearance}
                    aria-label={APPEARANCE_LABEL[appearance]}
                    title={APPEARANCE_LABEL[appearance]}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/70 text-foreground backdrop-blur transition-all duration-200 hover:scale-105 hover:bg-card hover:shadow-md"
                >
                    <AppearanceIcon className="h-4 w-4" />
                </button>
            </div>

            {/* 3 lapis terpisah, MASING-MASING elemen berbeda (bukan digabung
                jadi satu div spt versi sebelumnya):
                1. wrapper PALING LUAR: py `perspective` SAJA, tidak py
                   transform sendiri — ini yg memberi kartu di dalamnya
                   kedalaman 3D nyata saat dirotasi (perspective HARUS
                   berada di PARENT dari elemen yg dirotasi, bukan di
                   elemen yg sama, kalau tidak sudut rotasi terlihat nyaris
                   flat/tidak berefek meski angkanya besar).
                2. wrapper tilt: py transform rotateX/rotateY SAJA (sudut
                   dinaikkan ke 10° dari 4° sebelumnya supaya kemiringannya
                   jelas terlihat, bukan cuma "hampir tidak berubah").
                3. kartu kaca sesungguhnya (div berikutnya): py
                   backdrop-blur-2xl SAJA, TANPA transform apapun —
                   memisahkan transform 3D dari backdrop-filter ke elemen
                   berbeda ini yg memperbaiki bug Chromium/Safari yg gagal
                   merender blur kalau keduanya digabung di elemen yg sama. */}
            <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ perspective: '1400px' }}>
                <div
                    style={{
                        transform: prefersReducedMotion ? undefined : `rotateX(${pointer.y * -12}deg) rotateY(${pointer.x * 12}deg)`,
                        transition: 'transform 300ms ease-out',
                        transformStyle: 'preserve-3d',
                    }}
                >
                {/* Kartu kaca (glassmorphism) ala "kaca kamar mandi" — efek
                    kaca DITAUTKAN LANGSUNG ke gerakan tilt 3D (tiltMagnitude,
                    0 saat diam - 1 saat dimiringkan penuh), bukan transparansi
                    tetap: saat diam kartu HAMPIR SOLID (mudah dibaca, teks
                    jelas), begitu mouse/gyro menggoyang & memiringkannya,
                    kartu makin transparan & blur latar makin kuat — meniru
                    kaca sungguhan yg tembus-pandangnya berubah saat
                    dimiringkan, sesuai permintaan eksplisit user. bg lewat
                    inline style (BUKAN token bg-card/N) krn --card di light
                    mode nyaris putih persis sama dgn latar, jadi tidak ada
                    kontras utk diburamkan kalau pakai token itu. Elemen ini
                    SENDIRI tidak py transform apapun (perspective+rotate ada
                    di wrapper luar) — cukup overflow-hidden + backdrop-blur
                    dinamis. */}
                <div
                    className="overflow-hidden rounded-2xl border text-card-foreground shadow-2xl transition-[background-color,backdrop-filter] duration-200 ease-out"
                    style={{
                        borderColor: isDark ? `rgba(255,255,255,${0.12 - tiltMagnitude * 0.06})` : `rgba(255,255,255,${0.4 - tiltMagnitude * 0.18})`,
                        backgroundColor: isDark
                            ? `rgba(20,22,30,${0.14 - tiltMagnitude * 0.09})`
                            : `rgba(255,255,255,${0.14 - tiltMagnitude * 0.09})`,
                        backdropFilter: `blur(${4 + tiltMagnitude * 36}px)`,
                        WebkitBackdropFilter: `blur(${4 + tiltMagnitude * 36}px)`,
                        boxShadow: `0 20px 60px -15px ${primaryColor}33, 0 8px 24px -8px rgb(0 0 0 / 0.15)`,
                    }}
                >
                    {/* strip aksen tipis di atas card, warna identitas */}
                    <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor}99)` }} />
                    <div className="p-8 sm:p-10">
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col items-center gap-5">
                                <Link
                                    href={route('home')}
                                    className="flex flex-col items-center gap-3 font-medium transition-transform duration-200 hover:scale-[1.02] hover:opacity-90"
                                >
                                    <div
                                        className="rounded-2xl p-1 transition-shadow duration-300"
                                        style={{ boxShadow: `0 0 0 1px ${primaryColor}22` }}
                                    >
                                        <AppLogoIcon className="size-36" />
                                    </div>
                                    {/* text-foreground: solid black-on-white / white-on-black,
                                        not the buggy aceh-cream-as-text from before. */}
                                    <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
                                        {setting?.nama_app}
                                    </span>
                                </Link>

                                <div className="space-y-1.5 text-center">
                                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
                                    {description && (
                                        <p className="text-center text-sm leading-5 text-muted-foreground">{description}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">{children}</div>
                        </div>
                    </div>

                    <div className="border-t border-border bg-muted/40 px-8 py-5">
                        <div className="flex items-center justify-center gap-4">
                            <img
                                src="/images/hak-cipta-qr.png"
                                alt="QR verifikasi hak cipta"
                                className="h-14 w-14 shrink-0 rounded border border-border bg-background object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                            <div className="space-y-1 text-left text-[11px] leading-relaxed text-muted-foreground">
                                <p>
                                    Conceptor: Irwandi, S.E., CGCAE &amp; Tim Digitalisasi MR Kabar &middot; System Architect:
                                    Nurhikmat Muhammad, A.Md.
                                </p>
                                <p>Inspektorat Kabupaten Aceh Barat &middot; &copy; {new Date().getFullYear()} All Rights Reserved</p>
                                <p>Hak Cipta Republik Indonesia, Kementerian Hukum</p>
                                <p>No. Permohonan: EC002025134971 &middot; No. Pencatatan: 000975232</p>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
}
