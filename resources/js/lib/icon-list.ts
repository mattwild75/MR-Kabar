import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Seluruh icon Lucide (ribuan, termasuk yg dulu hilang di daftar manual
// spt ClipboardCheck) diambil OTOMATIS dari named export package
// lucide-react — bukan daftar manual yg harus di-maintain satu-satu dan
// gampang ketinggalan zaman tiap Lucide merilis icon baru. Filter buang
// util non-komponen ('createLucideIcon', 'icons') dan alias duplikat
// bersuffix "Icon" (mis. "XIcon" adalah alias dari "X" — cukup pakai satu
// nama pendek per icon).
const EXCLUDED_EXPORTS = new Set(['createLucideIcon', 'icons', 'default']);

export const icons: { name: string; icon: LucideIcon }[] = Object.keys(LucideIcons)
  .filter((name) => !EXCLUDED_EXPORTS.has(name) && !name.endsWith('Icon'))
  .sort((a, b) => a.localeCompare(b))
  .map((name) => ({
    name,
    icon: (LucideIcons as unknown as Record<string, LucideIcon>)[name],
  }));
