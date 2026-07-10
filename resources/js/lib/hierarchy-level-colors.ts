/**
 * Warna per LEVEL hierarki (identity encoding) — dipakai di tree view 1a/2a/3a
 * agar setiap tingkatan langsung terbedakan warnanya. Palet kategorikal urutan
 * TETAP (indigo→violet→blue→cyan→teal→lime→emerald), lolos cek CVD (worst
 * adjacent ΔE 28 pada palet dasarnya) dan tetap terbaca di light & dark karena
 * warna hanya dipakai sebagai AKSEN (border kiri + teks judul) — bukan mewarnai
 * latar teks. Identitas level juga selalu punya label teks eksplisit ("Visi",
 * "Tujuan 1.1", dst.), jadi warna adalah secondary encoding.
 *
 * PENTING: kelas Tailwind harus berupa STRING STATIK (bukan hasil interpolasi)
 * supaya tidak ter-purge saat build — makanya tiap level di-hardcode penuh.
 */
export type HierarchyLevel =
  | 'visi'
  | 'misi'
  | 'tujuan'
  | 'sasaran'
  | 'program'
  | 'kegiatan'
  | 'subkegiatan';

export interface LevelColor {
  /** border kiri tebal untuk kartu/baris level ini */
  border: string;
  /** warna teks judul/label level */
  text: string;
  /** latar sangat tipis (opsional, dipakai di kartu besar spt Visi/Misi) */
  bg: string;
  /** warna ikon chevron */
  chevron: string;
  /** warna dasar (hex) untuk penanda di tabel visualisasi (light) */
  hex: string;
}

export const LEVEL_COLORS: Record<HierarchyLevel, LevelColor> = {
  visi: {
    border: 'border-l-indigo-500 dark:border-l-indigo-400',
    text: 'text-indigo-700 dark:text-indigo-300',
    bg: 'bg-indigo-50/70 dark:bg-indigo-950/30',
    chevron: 'text-indigo-500',
    hex: '#6366f1',
  },
  misi: {
    border: 'border-l-violet-500 dark:border-l-violet-400',
    text: 'text-violet-700 dark:text-violet-300',
    bg: 'bg-violet-50/60 dark:bg-violet-950/25',
    chevron: 'text-violet-500',
    hex: '#8b5cf6',
  },
  tujuan: {
    border: 'border-l-blue-500 dark:border-l-blue-400',
    text: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-50/60 dark:bg-blue-950/25',
    chevron: 'text-blue-500',
    hex: '#3b82f6',
  },
  sasaran: {
    border: 'border-l-cyan-500 dark:border-l-cyan-400',
    text: 'text-cyan-700 dark:text-cyan-300',
    bg: 'bg-cyan-50/60 dark:bg-cyan-950/25',
    chevron: 'text-cyan-500',
    hex: '#06b6d4',
  },
  program: {
    border: 'border-l-teal-500 dark:border-l-teal-400',
    text: 'text-teal-700 dark:text-teal-300',
    bg: 'bg-teal-50/60 dark:bg-teal-950/25',
    chevron: 'text-teal-500',
    hex: '#14b8a6',
  },
  kegiatan: {
    border: 'border-l-lime-600 dark:border-l-lime-400',
    text: 'text-lime-700 dark:text-lime-300',
    bg: 'bg-lime-50/60 dark:bg-lime-950/25',
    chevron: 'text-lime-600',
    hex: '#65a30d',
  },
  subkegiatan: {
    border: 'border-l-emerald-600 dark:border-l-emerald-400',
    text: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50/60 dark:bg-emerald-950/25',
    chevron: 'text-emerald-600',
    hex: '#059669',
  },
};
