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
        // bg-aceh-cream / dark:bg-aceh-black stay here — these ARE background
        // tokens and are correct. Only TEXT colors below were the bug.
        <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-aceh-cream p-6 dark:bg-aceh-black md:p-10">
            <svg
                className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04] dark:opacity-[0.06]"
                viewBox="0 0 800 800"
                aria-hidden="true"
            >
                <path d="M-50 250 Q 150 150, 350 220 T 750 180" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M-50 380 Q 180 280, 400 360 T 850 320" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M-50 500 Q 200 420, 420 480 T 850 460" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M-50 620 Q 220 560, 440 600 T 850 600" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>

            <button
                type="button"
                onClick={cycleAppearance}
                aria-label={APPEARANCE_LABEL[appearance]}
                title={APPEARANCE_LABEL[appearance]}
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/70 text-foreground backdrop-blur transition hover:bg-card"
            >
                <AppearanceIcon className="h-4 w-4" />
            </button>

            <div className="relative z-10 w-full max-w-md">
                <div className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xl">
                    <div className="p-8 sm:p-10">
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col items-center gap-5">
                                <Link
                                    href={route('home')}
                                    className="flex flex-col items-center gap-3 font-medium transition-opacity hover:opacity-90"
                                >
                                    <AppLogoIcon className="size-40" />
                                    {/* text-foreground: solid black-on-white / white-on-black,
                                        not the buggy aceh-cream-as-text from before. */}
                                    <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
                                        {setting?.nama_app}
                                    </span>
                                </Link>

                                <div className="space-y-1.5 text-center">
                                    <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
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
