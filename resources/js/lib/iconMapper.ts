import type { LucideIcon } from 'lucide-react';
import { LayoutGrid } from 'lucide-react';

// icon-list.ts (import * dari lucide-react, 3500+ komponen) di-load LAZY
// via import() dinamis, bukan static import spt sebelumnya — supaya tidak
// ikut ter-bundle ke app-layout (chunk yg dimuat SEMUA halaman lewat
// AppSidebar). preloadIconMap() dipanggil di scope modul app-sidebar.tsx
// sehingga proses fetch chunk-nya dimulai bersamaan dgn AppSidebar
// pertama kali diimpor (bukan menunggu klik), jadi begitu render pertama
// selesai peta ikon nyaris selalu sudah siap — hanya render PALING
// pertama pengguna baru (chunk belum ke-cache browser) yg mungkin
// menampilkan fallback LayoutGrid sekilas sebelum peta selesai dimuat.
let iconMapCache: Record<string, LucideIcon> | null = null;
let loadPromise: Promise<Record<string, LucideIcon>> | null = null;

function loadIconMap(): Promise<Record<string, LucideIcon>> {
  if (iconMapCache) return Promise.resolve(iconMapCache);
  if (!loadPromise) {
    loadPromise = import('@/lib/icon-list').then(({ icons }) => {
      iconMapCache = icons.reduce((acc, curr) => {
        acc[curr.name] = curr.icon;
        return acc;
      }, {} as Record<string, LucideIcon>);
      return iconMapCache;
    });
  }
  return loadPromise;
}

const readyListeners = new Set<() => void>();

/** Mulai fetch chunk icon-list lebih awal + beri tahu listener saat siap. */
export function preloadIconMap(): void {
  loadIconMap().then(() => {
    readyListeners.forEach((fn) => fn());
  });
}

/** Daftarkan callback yg dipanggil sekali saat peta ikon selesai dimuat (utk trigger re-render). */
export function onIconMapReady(fn: () => void): () => void {
  if (iconMapCache) {
    fn();
    return () => {};
  }
  readyListeners.add(fn);
  return () => readyListeners.delete(fn);
}

/** Lookup sinkron — LayoutGrid jika peta belum selesai dimuat atau nama tak ditemukan. */
export function iconMapper(name?: string): LucideIcon {
  if (!name) return LayoutGrid;
  if (!iconMapCache) {
    void loadIconMap();
    return LayoutGrid;
  }

  const formatted = name.charAt(0).toUpperCase() + name.slice(1); // e.g. user → User
  return iconMapCache[formatted] || LayoutGrid;
}
