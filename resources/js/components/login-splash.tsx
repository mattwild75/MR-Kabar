import { useEffect, useRef, useState } from 'react';

interface LoginSplashProps {
  onDone: () => void;
}

// Splash setelah login berhasil: memutar video animasi logo asli MR KABAR.
// Video di-serve dari /media/logo-animation.mp4 (public/media). Tanpa audio,
// jadi autoplay tidak diblokir kebijakan browser. Ada tombol "Lewati" agar
// user tidak wajib menunggu video selesai, dan fallback aman kalau video
// gagal dimuat (langsung panggil onDone supaya tidak menutupi aplikasi).
export function LoginSplash({ onDone }: LoginSplashProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const doneRef = useRef(false);
  const [visible, setVisible] = useState(true);

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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <video
        ref={videoRef}
        className="max-h-[80vh] max-w-[90vw] object-contain"
        src="/media/logo-animation.mp4"
        autoPlay
        muted
        playsInline
        onEnded={finish}
        onError={finish}
      />

      <button
        type="button"
        onClick={finish}
        className="absolute bottom-8 right-8 rounded-full border border-border/60 bg-background/70 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur transition hover:text-foreground"
      >
        Lewati
      </button>
    </div>
  );
}
