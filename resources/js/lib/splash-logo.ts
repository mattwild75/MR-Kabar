import geo from '@/data/splash-logo.json';

// Data & URL lapisan splash logo (lihat components/login-splash.tsx dan
// scripts/splash/lapisan.py). Dipisah dari komponennya supaya halaman login
// bisa memuat lapisan lebih dulu tanpa ikut memuat komponen splash utuh.

export type LapisanSplash = { x: number; y: number; w: number; h: number; gelap: boolean };

export const LAPISAN_SPLASH = geo.lapisan as Record<string, LapisanSplash>;

export function temaGelap() {
    return typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
}

/** URL satu lapisan; huruf & tagline punya versi tema gelap (warnanya dibalik). */
export function urlLapisan(nama: string, gelap: boolean) {
    const varian = gelap && LAPISAN_SPLASH[nama].gelap ? '-gelap' : '';
    return `/media/splash/${nama}${varian}.webp?v=${geo.versi}`;
}

/** Siluet seluruh logo, topeng kilau terakhir. */
export const URL_SILUET = `/media/splash/siluet.webp?v=${geo.versi}`;

/** Semua berkas yang dipakai splash untuk tema sekarang. */
export function berkasSplash(gelap = temaGelap()) {
    return [...Object.keys(LAPISAN_SPLASH).map((n) => urlLapisan(n, gelap)), URL_SILUET];
}

/**
 * Muat lebih dulu seluruh lapisan splash. Dipanggil halaman login sementara
 * pengguna mengetik sandi, supaya sesudah masuk animasinya langsung mulai
 * dari cache peramban (±460 KB).
 */
export function muatSplashLebihDulu() {
    for (const url of berkasSplash()) {
        const img = new Image();
        img.decoding = 'async';
        img.src = url;
    }
}
