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
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Satu penghitung mundur, sejak login.
 *
 * Waktunya dipegang SERVER, bukan halaman ini. Halaman hanya menanyakan
 * sisanya lalu menghitung mundur sendiri di antara dua pertanyaan, supaya
 * angkanya bergerak halus tanpa membebani server tiap detik. Karena yang
 * menentukan selisih terhadap `login_at` di server, hitungannya tetap
 * berjalan meski jendela ditutup, komputer tertidur, atau jaringan putus —
 * begitu halaman kembali aktif, sisanya langsung disesuaikan.
 *
 * Peringatan muncul SEBELUM waktunya habis, bukan sesudah. Versi sebelumnya
 * menampilkannya saat sisa waktu sudah nol — artinya sesi sebenarnya sudah
 * berakhir dan pengguna tidak pernah punya kesempatan memutuskan; ia hanya
 * diberi tahu.
 *
 * Kalau jendelanya tertutup atau jaringannya putus pada saat peringatan
 * seharusnya muncul, peringatan itu memang tidak tampil — tetapi waktunya
 * tetap habis pada detik yang sama. Itu disengaja: batas sesi tidak boleh
 * bergantung pada ada tidaknya orang yang sedang melihat layar.
 */

/** Selang bertanya ke server saat waktu masih panjang. */
const POLL_JAUH_MS = 60_000;
/** Selang bertanya saat sudah dekat batas, supaya selisihnya tidak menumpuk. */
const POLL_DEKAT_MS = 15_000;
/** Mulai bertanya lebih sering ketika sisa waktu di bawah ini. */
const AMBANG_DEKAT_DETIK = 300;

export function SessionTimeoutWarning() {
  const [sisaDetik, setSisaDetik] = useState<number | null>(null);
  const [ambangPeringatan, setAmbangPeringatan] = useState(60);
  const sisaRef = useRef<number | null>(null);
  const keluarRef = useRef(false);

  const keluar = useCallback(() => {
    if (keluarRef.current) return;
    keluarRef.current = true;
    router.post(route('logout'));
  }, []);

  /** Tanya sisa waktu ke server, lalu samakan hitungan lokal dengannya. */
  const sinkron = useCallback(async () => {
    try {
      const res = await fetch(route('session.status'), { headers: { Accept: 'application/json' } });
      if (!res.ok) return;
      const data = (await res.json()) as { secondsRemaining: number; warningSeconds: number };
      setAmbangPeringatan(data.warningSeconds);
      setSisaDetik(data.secondsRemaining);
      sisaRef.current = data.secondsRemaining;
    } catch {
      // Jaringan sempat putus. Hitungan lokal tetap berjalan mundur sehingga
      // waktunya tidak molor; cukup dicoba lagi pada giliran berikutnya. Yang
      // TIDAK boleh dilakukan di sini adalah memaksa keluar hanya karena satu
      // permintaan gagal.
    }
  }, []);

  // Bertanya ke server, dengan selang yang merapat saat mendekati batas.
  useEffect(() => {
    let hidup = true;
    let timer: ReturnType<typeof setTimeout>;

    const putaran = async () => {
      if (!hidup) return;
      await sinkron();
      const sisa = sisaRef.current;
      const jeda = sisa !== null && sisa <= AMBANG_DEKAT_DETIK ? POLL_DEKAT_MS : POLL_JAUH_MS;
      timer = setTimeout(putaran, jeda);
    };
    putaran();

    // Kembali dari tab lain atau dari komputer yang tertidur: segera samakan,
    // karena hitungan lokal bisa tertinggal jauh.
    const saatTampak = () => {
      if (document.visibilityState === 'visible') sinkron();
    };
    document.addEventListener('visibilitychange', saatTampak);
    window.addEventListener('online', sinkron);

    return () => {
      hidup = false;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', saatTampak);
      window.removeEventListener('online', sinkron);
    };
  }, [sinkron]);

  // Hitung mundur lokal, satu detik sekali.
  useEffect(() => {
    const tik = setInterval(() => {
      setSisaDetik((s) => {
        if (s === null) return s;
        const baru = Math.max(0, s - 1);
        sisaRef.current = baru;
        if (baru === 0) keluar();
        return baru;
      });
    }, 1000);

    return () => clearInterval(tik);
  }, [keluar]);

  const lanjutkan = async () => {
    try {
      // Token diambil dari kuki XSRF-TOKEN, bukan dari meta bernama
      // `csrf-token`.
      //
      // Aplikasi ini tidak pernah memasang meta itu di layout-nya, sehingga
      // versi sebelumnya selalu mengirim token kosong dan server menolaknya
      // dengan 419 — "Lanjutkan" tidak pernah benar-benar bekerja sejak
      // fiturnya dibuat. Kegagalannya tidak terlihat karena dialognya
      // terlanjur ditutup sebelum jawabannya diperiksa, jadi dari layar
      // seolah berhasil; sesinya tetap berakhir beberapa saat kemudian.
      const token = decodeURIComponent(
        document.cookie.split('; ').find((c) => c.startsWith('XSRF-TOKEN='))?.split('=')[1] ?? '',
      );
      const res = await fetch(route('session.extend'), {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'X-XSRF-TOKEN': token,
        },
      });
      if (res.ok) {
        const data = (await res.json()) as { secondsRemaining: number };
        setSisaDetik(data.secondsRemaining);
        sisaRef.current = data.secondsRemaining;

        return;
      }
    } catch {
      // Gagal memperpanjang — jangan diam-diam dianggap berhasil.
    }
    // Baik gagal maupun ditolak server: tanyakan keadaan sebenarnya, supaya
    // dialognya tidak tertutup sementara sesinya sebetulnya tetap akan habis.
    sinkron();
  };

  const tampil = sisaDetik !== null && sisaDetik <= ambangPeringatan && sisaDetik > 0;
  const menit = Math.floor((sisaDetik ?? 0) / 60);
  const detik = (sisaDetik ?? 0) % 60;

  return (
    <AlertDialog open={tampil}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sesi akan berakhir</AlertDialogTitle>
          <AlertDialogDescription>
            Demi keamanan, sesi berakhir otomatis pada waktu yang tetap sejak Anda masuk — hitungannya berjalan
            terus, dipakai bekerja maupun ditinggalkan. Pilih <strong>Lanjutkan</strong> untuk tetap masuk tanpa
            mengetik sandi, atau <strong>Keluar</strong> sekarang.
            <span className="mt-2 block font-mono text-lg font-semibold text-foreground">
              {String(menit).padStart(2, '0')}:{String(detik).padStart(2, '0')}
            </span>
            <span className="mt-1 block text-xs">
              Bila didiamkan, Anda keluar sendiri saat hitungan habis. Simpan dulu isian yang belum tersimpan.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={keluar}>Keluar</AlertDialogCancel>
          <AlertDialogAction onClick={lanjutkan}>Lanjutkan</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
