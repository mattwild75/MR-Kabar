import { LoginSplash } from '@/components/login-splash';
import { Button } from '@/components/ui/button';
import { Maximize, Play, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

interface Props {
    /** URL video unggahan (tersimpan atau baru dipilih); null = splash animasi logo bawaan. */
    videoSrc: string | null;
    muted: boolean;
    volume: number;
}

/**
 * Pratinjau splash sesudah login di /settingsapp.
 *
 * Yang diputar adalah komponen splash yang SAMA dengan yang dilihat pengguna,
 * dengan setelan dari formulir (belum disimpan pun sudah berlaku). Dua cara:
 * di dalam bingkai 16:9 — komponennya digambar dalam bingkai berkontainer
 * (container-type: size), sehingga semua ukurannya mengikuti bingkai — atau
 * layar penuh, persis seperti sesudah login. Bunyi dan volume yang diubah
 * selama pratinjau berjalan langsung terdengar.
 */
export default function PratinjauSplash({ videoSrc, muted, volume }: Props) {
    const [main, setMain] = useState<'bingkai' | 'layar' | null>(null);
    const [putaran, setPutaran] = useState(0);
    const putar = (cara: 'bingkai' | 'layar') => {
        setPutaran((n) => n + 1);
        setMain(cara);
    };

    return (
        <div className="space-y-2">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border" style={{ containerType: 'size' }}>
                {main === 'bingkai' ? (
                    <LoginSplash key={putaran} tertanam videoSrc={videoSrc} muted={muted} volume={volume} onDone={() => setMain(null)} />
                ) : (
                    <button
                        type="button"
                        onClick={() => putar('bingkai')}
                        className="group absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#f3f7fc] focus-visible:outline-none"
                        aria-label="Putar pratinjau splash"
                    >
                        {/* Latar poster selalu terang: tulisan MR KABAR pada logo aslinya hitam,
                            tidak terbaca di atas latar gelap. Splash-nya sendiri tetap mengikuti tema. */}
                        {videoSrc ? (
                            <video src={videoSrc} muted preload="metadata" className="max-h-[62%] max-w-[80%] rounded object-contain" />
                        ) : (
                            <img src="/img/MRKabar-lengkap.png" alt="" className="h-[58%] w-auto object-contain opacity-95" />
                        )}
                        <span className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition group-hover:bg-sky-700 group-focus-visible:ring-2 group-focus-visible:ring-sky-400 group-focus-visible:ring-offset-2">
                            <Play className="h-4 w-4 fill-current" />
                            Putar pratinjau
                        </span>
                    </button>
                )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => putar('bingkai')}>
                    <RotateCcw className="h-4 w-4" />
                    {main === 'bingkai' ? 'Putar ulang' : 'Putar di bingkai'}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => putar('layar')}>
                    <Maximize className="h-4 w-4" />
                    Layar penuh, persis sesudah login
                </Button>
                <span className="text-muted-foreground text-xs">{muted ? 'Tanpa suara (dibisukan)' : `Bersuara, volume ${volume}%`}</span>
            </div>
            {main === 'layar' &&
                createPortal(
                    <LoginSplash key={putaran} videoSrc={videoSrc} muted={muted} volume={volume} onDone={() => setMain(null)} />,
                    document.body,
                )}
        </div>
    );
}
