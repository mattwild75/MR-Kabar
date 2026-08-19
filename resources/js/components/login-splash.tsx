import { useEffect, useRef, useState } from 'react';

interface LoginSplashProps {
    onDone: () => void;
    /** Path video kustom dari SettingApp.login_splash_video (mis. "login-splash/xxx.mp4"), diambil lewat /storage/{path} — null/undefined = pakai video contoh bawaan /media/logo-animation.mp4. */
    videoPath?: string | null;
    /** Dari SettingApp.login_splash_muted — default true (autoplay browser modern memblokir video BERSUARA yang autoplay tanpa interaksi user dulu). Set false kalau admin sengaja ingin video ini berbunyi. */
    muted?: boolean;
}

// Splash setelah login berhasil: memutar video animasi logo, sumbernya
// SEKARANG bisa diganti Admin lewat /settingsapp (lihat SettingApp.
// login_splash_video) — SEBELUMNYA hardcode path /media/logo-animation.mp4
// tanpa cara ganti/nonaktifkan lewat UI. Video contoh bawaan itu tetap
// dipakai sbg fallback kalau admin belum pernah upload video sendiri.
// muted defaultnya true supaya autoplay tidak diblokir kebijakan browser
// (video BERSUARA yg autoplay tanpa gesture user akan ditolak Chrome/
// Safari) — admin BOLEH menyalakan suara lewat toggle di Settings kalau
// video-nya memang didesain bersuara & mereka paham risiko autoplay-block
// itu (lihat catatan di Form.tsx). Ada tombol "Lewati" agar user tidak
// wajib menunggu video selesai, dan fallback aman kalau video gagal
// dimuat (langsung panggil onDone supaya tidak menutupi aplikasi).
export function LoginSplash({ onDone, videoPath, muted = true }: LoginSplashProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const doneRef = useRef(false);
    const [visible, setVisible] = useState(true);
    const src = videoPath ? `/storage/${videoPath}` : '/media/logo-animation.mp4';

    const finish = () => {
        if (doneRef.current) return;
        doneRef.current = true;
        // Fade-out singkat sebelum benar-benar melepas splash.
        setVisible(false);
        window.setTimeout(onDone, 350);
    };

    useEffect(() => {
        // Safety net: kalau karena suatu hal event 'ended'/'error' tidak pernah
        // terpicu, splash tetap ditutup setelah durasi maksimum yang wajar.
        const timeout = window.setTimeout(finish, 12000);
        return () => window.clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            className="bg-background fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300"
            style={{ opacity: visible ? 1 : 0 }}
        >
            <video
                ref={videoRef}
                className="max-h-[80vh] max-w-[90vw] object-contain"
                src={src}
                autoPlay
                muted={muted}
                playsInline
                onEnded={finish}
                onError={finish}
            />

            <button
                type="button"
                onClick={finish}
                className="border-border/60 bg-background/70 text-muted-foreground hover:text-foreground absolute right-8 bottom-8 rounded-full border px-4 py-1.5 text-sm backdrop-blur transition"
            >
                Lewati
            </button>
        </div>
    );
}
