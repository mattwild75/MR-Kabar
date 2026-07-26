import AppLogoIcon from '@/components/app-logo-icon';
import { useAppearance } from '@/hooks/use-appearance';
import { Link, usePage } from '@inertiajs/react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect } from 'react';

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
        <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-aceh-cream p-6 dark:bg-aceh-black md:p-10">
            {/* mesh gradient lembut ala SIPD — beberapa radial-gradient warna
                identitas bertumpuk, bukan lagi orb tunggal, supaya latar tidak polos */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.38] dark:opacity-[0.45]"
                style={{
                    background: `
                        radial-gradient(ellipse 60% 50% at 15% 20%, ${primaryColor}, transparent 60%),
                        radial-gradient(ellipse 50% 45% at 85% 15%, #2b6777, transparent 60%),
                        radial-gradient(ellipse 55% 50% at 80% 85%, ${primaryColor}, transparent 60%),
                        radial-gradient(ellipse 45% 40% at 10% 90%, #e0a458, transparent 60%)
                    `,
                }}
                aria-hidden="true"
            />

            {/* motif garis "ukiran" — lebih tegas dari sebelumnya, pola
                lengkung berlapis bergaya batik/tenun Aceh, murni dekoratif */}
            <svg
                className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.16] dark:opacity-[0.20]"
                viewBox="0 0 800 800"
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

            {/* dua orb gradient lembut warna primer, murni dekoratif */}
            <div
                className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-[0.12] blur-3xl"
                style={{ background: `radial-gradient(circle, ${primaryColor}, transparent 70%)` }}
                aria-hidden="true"
            />
            <div
                className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full opacity-[0.10] blur-3xl"
                style={{ background: `radial-gradient(circle, ${primaryColor}, transparent 70%)` }}
                aria-hidden="true"
            />

            <button
                type="button"
                onClick={cycleAppearance}
                aria-label={APPEARANCE_LABEL[appearance]}
                title={APPEARANCE_LABEL[appearance]}
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/70 text-foreground backdrop-blur transition-all duration-200 hover:scale-105 hover:bg-card hover:shadow-md"
            >
                <AppearanceIcon className="h-4 w-4" />
            </button>

            <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div
                    className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl transition-shadow duration-300"
                    style={{ boxShadow: `0 20px 60px -15px ${primaryColor}33, 0 8px 24px -8px rgb(0 0 0 / 0.15)` }}
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
    );
}
