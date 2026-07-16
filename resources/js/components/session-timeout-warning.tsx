import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

// Sesi otomatis berakhir 4 jam sejak LOGIN (bukan sejak aktivitas terakhir
// seperti session lifetime bawaan Laravel) — lihat
// ForceLogoutAfterMaxDuration middleware & SessionStatusController.
const POLL_INTERVAL_MS = 30_000;
const AUTO_LOGOUT_GRACE_SECONDS = 60;

export function SessionTimeoutWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [graceSecondsLeft, setGraceSecondsLeft] = useState(AUTO_LOGOUT_GRACE_SECONDS);
  const graceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const doLogout = () => {
    router.post(route('logout'));
  };

  const clearGraceTimer = () => {
    if (graceTimerRef.current) {
      clearInterval(graceTimerRef.current);
      graceTimerRef.current = null;
    }
  };

  const startGraceCountdown = () => {
    setGraceSecondsLeft(AUTO_LOGOUT_GRACE_SECONDS);
    clearGraceTimer();
    graceTimerRef.current = setInterval(() => {
      setGraceSecondsLeft((s) => {
        if (s <= 1) {
          clearGraceTimer();
          doLogout();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(route('session.status'), {
          headers: { Accept: 'application/json' },
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { secondsRemaining: number };

        if (data.secondsRemaining <= 0) {
          setShowWarning(true);
          startGraceCountdown();
        }
      } catch {
        // Jaringan sempat putus — cukup coba lagi di poll berikutnya,
        // jangan paksa logout hanya karena satu request gagal.
      }
    };

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
      clearGraceTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinue = async () => {
    clearGraceTimer();
    setShowWarning(false);
    try {
      await fetch(route('session.extend'), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
        },
      });
    } catch {
      // Kalau gagal, poll berikutnya akan mendeteksi sesi masih habis dan
      // menampilkan dialog ini lagi — tidak perlu penanganan khusus di sini.
    }
  };

  return (
    <AlertDialog open={showWarning} onOpenChange={(open) => !open && doLogout()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sesi Anda telah mencapai 4 jam</AlertDialogTitle>
          <AlertDialogDescription>
            Untuk keamanan, sesi login otomatis berakhir setelah 4 jam. Klik &ldquo;Lanjutkan&rdquo; untuk tetap masuk,
            atau sesi akan otomatis logout dalam {graceSecondsLeft} detik.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={doLogout}>Logout Sekarang</AlertDialogCancel>
          <AlertDialogAction onClick={handleContinue}>Lanjutkan</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
