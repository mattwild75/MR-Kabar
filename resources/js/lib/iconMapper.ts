import type { LucideIcon } from 'lucide-react';
import { LayoutGrid } from 'lucide-react';

/*
 * Peta nama ikon → komponen, untuk ikon menu yang dipilih Admin.
 *
 * KENAPA TIDAK LAGI MEMUAT SELURUH DAFTAR. Versi sebelumnya memuat
 * `icon-list.ts` — satu bongkahan 759 KB berisi 3.500+ komponen — dan
 * memuatnya di SETIAP halaman, karena AppSidebar ada di setiap halaman.
 * Padahal menu hanya memakai 55 ikon. Sisanya, 98%-nya, diunduh untuk tidak
 * pernah dipakai.
 *
 * Sekarang tiap ikon diambil dari berkasnya sendiri lewat `import.meta.glob`,
 * jadi yang benar-benar diunduh hanyalah yang benar-benar dipakai menu.
 * Daftar lengkapnya tetap ada dan tetap dipakai oleh pemilih ikon di menu
 * Settings — di sana daftar penuh memang gunanya, dan ia baru dimuat saat
 * dialognya dibuka.
 *
 * Nama berkas Lucide memakai kebab-case (`shield-alert.js`) sedangkan nama
 * yang tersimpan di basis data PascalCase (`ShieldAlert`), jadi namanya
 * diterjemahkan lebih dulu.
 */

const berkasIkon = import.meta.glob<{ default: LucideIcon }>('/node_modules/lucide-react/dist/esm/icons/*.js');

/** ShieldAlert → shield-alert · Building2 → building-2 · Home → home */
function keKebab(nama: string): string {
    return nama
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/([A-Za-z])(\d)/g, '$1-$2')
        .toLowerCase();
}

const petaIkon: Record<string, LucideIcon> = {};
const sedangDimuat = new Set<string>();
const readyListeners = new Set<() => void>();

function beritahu(): void {
    readyListeners.forEach((fn) => fn());
}

function muatSatu(nama: string): void {
    if (petaIkon[nama] || sedangDimuat.has(nama)) return;

    const jalur = `/node_modules/lucide-react/dist/esm/icons/${keKebab(nama)}.js`;
    const pemuat = berkasIkon[jalur];
    if (!pemuat) return; // nama tidak dikenali — biarkan jatuh ke LayoutGrid

    sedangDimuat.add(nama);
    void pemuat().then((m) => {
        if (m?.default) {
            petaIkon[nama] = m.default;
            beritahu();
        }
    });
}

/**
 * Muat ikon yang memang dipakai menu, sedini mungkin.
 *
 * Dipanggil dari scope modul app-sidebar.tsx dengan daftar nama dari menu,
 * sehingga unduhannya dimulai bersamaan dengan impor AppSidebar — bukan
 * menunggu render. Tanpa daftar, tidak ada yang diunduh sama sekali.
 */
export function preloadIconMap(namaIkon: readonly (string | null | undefined)[] = []): void {
    namaIkon.forEach((n) => {
        if (n) muatSatu(rapikan(n));
    });
}

/** Daftarkan callback yang dipanggil saat ada ikon baru selesai dimuat. */
export function onIconMapReady(fn: () => void): () => void {
    readyListeners.add(fn);
    return () => readyListeners.delete(fn);
}

function rapikan(nama: string): string {
    return nama.charAt(0).toUpperCase() + nama.slice(1);
}

/**
 * Lookup sinkron — LayoutGrid selama ikonnya belum selesai dimuat.
 *
 * Pemanggilan pertama untuk sebuah nama sekaligus MEMICU pemuatannya, jadi
 * ikon yang muncul belakangan (mis. menu baru ditambahkan tanpa memuat ulang
 * halaman) tetap tampil begitu berkasnya tiba.
 */
export function iconMapper(name?: string): LucideIcon {
    if (!name) return LayoutGrid;

    const nama = rapikan(name);
    const ada = petaIkon[nama];
    if (ada) return ada;

    muatSatu(nama);

    return LayoutGrid;
}
