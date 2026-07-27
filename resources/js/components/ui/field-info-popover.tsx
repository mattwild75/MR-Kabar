import { Info } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const LEBAR_POPOVER = 320; // px, harus sinkron dgn w-80 di className popover

export default function FieldInfoPopover({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  // Posisi absolut thd VIEWPORT (dipakai lewat portal position:fixed)
  // dihitung ulang tiap kali dibuka & tiap kali halaman discroll — supaya
  // popover TETAP MENEMPEL dekat tombol info saat user scroll (bergeser
  // naik/turun bersama tombolnya, bukan diam di koordinat dokumen), sesuai
  // permintaan eksplisit user. TIDAK LAGI py batas tinggi/scroll internal
  // sendiri (lihat className di JSX bawah, tanpa max-h/overflow-y) — teks
  // SELALU tampil utuh apa adanya, jadi tidak ada lagi scroll-di-dalam-
  // scroll yg dulu jadi biang bug "tidak bisa discroll/tertutup sendiri".
  // 1. Popover perlu FLIP horizontal (kiri/kanan) tergantung sisa ruang
  //    viewport — kalau tombol info dekat tepi KANAN kolom sempit (mis.
  //    field "Skala Kemungkinan" di grid 2 kolom), popover lebar 320px yg
  //    selalu rata-kiri (left-0) meluber ke luar layar & tampak terpotong.
  // 2. `fixed` lewat portal ke document.body dgn koordinat dari
  //    getBoundingClientRect() SELALU akurat thd viewport terlepas
  //    struktur DOM di sekitarnya (Dialog/Card overflow-hidden dkk).
  const [pos, setPos] = useState<{ top: number; left: number; arahVertikal: 'down' | 'up' } | null>(null);

  const hitungPosisi = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const ruangBawah = window.innerHeight - rect.bottom;
    const ruangAtas = rect.top;
    const arahVertikal: 'down' | 'up' = ruangBawah < 200 && ruangAtas > ruangBawah ? 'up' : 'down';

    let left = rect.left;
    const margin = 8;
    if (left + LEBAR_POPOVER > window.innerWidth - margin) {
      left = window.innerWidth - margin - LEBAR_POPOVER;
    }
    if (left < margin) left = margin;

    const top = arahVertikal === 'down' ? rect.bottom + 4 : rect.top - 4;
    setPos({ top, left, arahVertikal });
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Hitung posisi SEBELUM browser mengecat frame (hindari kedipan flip).
  useLayoutEffect(() => {
    if (!open) return;
    hitungPosisi();
  }, [open, hitungPosisi]);

  // Reposisi terus-menerus selama popover terbuka — scroll di window MAUPUN
  // di dalam container manapun (mis. DialogContent yg overflow-y-auto)
  // ditangkap lewat `capture: true` (scroll event tidak bubble secara
  // normal), plus resize window/rotasi layar. TANPA ini popover memakai
  // koordinat "beku" dari saat pertama dibuka (position:fixed thd
  // viewport, bukan thd tombolnya) — begitu form discroll, popover diam di
  // tempat sementara tombol info sudah berpindah, jadi terlihat "lepas"
  // dari fieldnya. Sebelumnya guard "abaikan scroll dari dalam popover"
  // diperlukan di sini krn popover py overflow-y-auto sendiri (scroll
  // internal terpisah bikin reposisi berulang saat digulir) — GUARD ITU
  // SUDAH TIDAK PERLU LAGI krn popover sekarang tidak py scroll/batas
  // tinggi internal apapun (lihat className di JSX bawah), jadi tidak ada
  // lagi event scroll "palsu" dari dalam popover yg perlu difilter.
  useEffect(() => {
    if (!open) return;
    window.addEventListener('scroll', hitungPosisi, true);
    window.addEventListener('resize', hitungPosisi);
    return () => {
      window.removeEventListener('scroll', hitungPosisi, true);
      window.removeEventListener('resize', hitungPosisi);
    };
  }, [open, hitungPosisi]);

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
        aria-label="Info"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: 'fixed',
              top: pos.arahVertikal === 'down' ? pos.top : undefined,
              bottom: pos.arahVertikal === 'up' ? window.innerHeight - pos.top : undefined,
              left: pos.left,
              width: LEBAR_POPOVER,
            }}
            className="z-50 max-w-[calc(100vw-16px)] overflow-x-hidden rounded-md border bg-popover p-3 text-sm break-words whitespace-pre-line text-popover-foreground shadow-md"
          >
            {text}
          </div>,
          document.body,
        )}
    </div>
  );
}
