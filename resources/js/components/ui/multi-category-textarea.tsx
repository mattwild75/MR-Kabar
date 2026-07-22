import { useMemo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface MultiCategoryTextareaProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  categories: string[];
  /** Kategori gabungan otomatis kalau SEMUA categories terisi sekaligus (mis. "Internal dan Eksternal" utk Sumber Sebab Risiko). Opsional — kalau tidak diisi, kategori-kategori yg terpilih digabung dgn " dan ". */
  combinedLabel?: string;
  uraianPlaceholder?: string;
  rows?: number;
  /** Sembunyikan textarea uraian per kategori — dipakai utk field yg cukup pilih kategori saja (mis. Sumber Sebab Risiko Internal/Eksternal), tanpa uraian tertulis. */
  hideUraian?: boolean;
}

/**
 * Kotak kiri-kanan (label kategori kiri, textarea kanan) per kategori,
 * BOLEH lebih dari satu kategori diisi sekaligus (checkbox, bukan radio
 * tunggal spt CategorizedTextarea) — dipakai utk Uraian Penyebab Risiko
 * (5M: Machine/Men/Material/Method/Money, boleh >1 penyebab) dan Sumber
 * Sebab Risiko (Internal/Eksternal, kalau DUA-duanya diisi otomatis jadi
 * "Internal dan Eksternal").
 *
 * Disimpan sbg SATU string gabungan di kolom lama, format:
 * "Kategori1 (uraian1); Kategori2 (uraian2)" — atau kalau seluruh
 * categories (persis 2, spt Internal/Eksternal) sekaligus terisi & ada
 * combinedLabel, formatnya jadi "combinedLabel (Kategori1: uraian1)
 * (Kategori2: uraian2)" — tiap uraian dibungkus kurungnya sendiri dgn nama
 * kategori di depan (BUKAN digabung dgn "; " di dalam satu kurung spt
 * versi lama), supaya titik-koma yg kebetulan ada DI DALAM teks uraian
 * pengguna sendiri tidak bisa membelah/mencampur uraian ke kategori yg
 * salah saat di-parse ulang. parseValue() tetap bisa membaca format lama
 * "combinedLabel (uraian1; uraian2)" utk data yg sudah tersimpan sebelum
 * perubahan ini (mundur-kompatibel, read-only — begitu diedit & disimpan
 * ulang otomatis pindah ke format baru).
 */
export default function MultiCategoryTextarea({
  id,
  value,
  onChange,
  categories,
  combinedLabel,
  uraianPlaceholder = 'Tulis uraian...',
  rows = 2,
  hideUraian = false,
}: MultiCategoryTextareaProps) {
  const parsed = useMemo(() => parseValue(value, categories, combinedLabel), [value, categories, combinedLabel]);

  const setUraian = (category: string, uraian: string) => {
    const next = { ...parsed, [category]: uraian };
    onChange(buildValue(next, categories, combinedLabel));
  };

  const toggleCategory = (category: string, checked: boolean) => {
    const next = { ...parsed };
    if (checked) {
      if (next[category] === undefined) next[category] = '';
    } else {
      delete next[category];
    }
    onChange(buildValue(next, categories, combinedLabel));
  };

  return (
    <div className="space-y-2 rounded-md border border-border/60 p-2">
      {categories.map((c, i) => {
        const isChecked = parsed[c] !== undefined;
        return (
          <div
            key={c}
            className={`grid grid-cols-1 gap-2 rounded-md p-2 sm:grid-cols-[12rem_1fr] ${
              isChecked ? 'bg-muted/40' : ''
            } ${i > 0 ? 'border-t border-border/60 pt-3' : ''}`}
          >
            <div className="flex items-start gap-2 sm:pt-2">
              <Checkbox
                id={id ? `${id}-${c}` : undefined}
                checked={isChecked}
                onCheckedChange={(checked) => toggleCategory(c, checked === true)}
              />
              <Label htmlFor={id ? `${id}-${c}` : undefined} className="cursor-pointer text-sm font-medium">
                {c}
              </Label>
            </div>
            {!hideUraian && (
              <Textarea
                value={parsed[c] ?? ''}
                rows={rows}
                disabled={!isChecked}
                placeholder={uraianPlaceholder}
                onChange={(e) => setUraian(c, e.target.value)}
                className="flex-1"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

type ParsedMap = Record<string, string>;

function parseValue(value: string, categories: string[], combinedLabel?: string): ParsedMap {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return {};

  if (combinedLabel) {
    // Format BARU (aman): "CombinedLabel (Kategori1: uraian1) (Kategori2: uraian2)"
    // — tiap uraian sudah dibungkus kurungnya sendiri dgn nama kategori di
    // depan, jadi titik-koma di teks pengguna tidak lagi jadi masalah sama
    // sekali (parsing tidak bergantung pada memecah per-';' untuk memisah
    // antar-kategori).
    const newFormatPrefix = `${combinedLabel} `;
    if (trimmed.startsWith(newFormatPrefix) && categories.some((c) => trimmed.includes(`(${c}: `))) {
      const result: ParsedMap = {};
      let matchedAny = false;
      for (const c of categories) {
        const marker = `(${c}: `;
        const idx = trimmed.indexOf(marker);
        if (idx === -1) continue;
        const closeIdx = findMatchingParen(trimmed, idx);
        if (closeIdx === -1) continue;
        result[c] = trimmed.slice(idx + marker.length, closeIdx);
        matchedAny = true;
      }
      if (matchedAny) return result;
    }

    // Format lama (mundur-kompatibel, read-only): "CombinedLabel (uraian1; uraian2)"
    // — pecah balik ke tiap kategori berurutan sesuai `categories` (asumsi
    // urutan tetap). PAKAI splitTopLevel (bukan split(';') naif) supaya
    // titik-koma yg kebetulan ada di dalam kurung tambahan tidak salah
    // dianggap pemisah — meski begitu, format lama ini TETAP rawan kalau
    // uraian mengandung ';' tanpa kurung tambahan (itulah sebabnya format
    // baru di atas dibuat; data lama akan pindah ke format baru begitu
    // diedit ulang oleh pengguna).
    const prefix = `${combinedLabel} (`;
    if (trimmed.startsWith(prefix) && trimmed.endsWith(')')) {
      const inner = trimmed.slice(prefix.length, -1);
      const parts = splitTopLevel(inner);
      const result: ParsedMap = {};
      categories.forEach((c, i) => {
        result[c] = parts[i] ?? '';
      });
      return result;
    }
    if (trimmed === combinedLabel) {
      const result: ParsedMap = {};
      categories.forEach((c) => (result[c] = ''));
      return result;
    }
  }

  // Format per-kategori gabungan dgn "; ": "Kategori1 (uraian1); Kategori2 (uraian2)"
  const segments = splitTopLevel(trimmed);
  const result: ParsedMap = {};
  let matchedAny = false;
  for (const seg of segments) {
    for (const c of categories) {
      if (seg === c) {
        result[c] = '';
        matchedAny = true;
        break;
      }
      const prefix = `${c} (`;
      if (seg.startsWith(prefix) && seg.endsWith(')')) {
        result[c] = seg.slice(prefix.length, -1);
        matchedAny = true;
        break;
      }
    }
  }

  if (matchedAny) return result;

  // Tidak cocok pola manapun (data lama/bebas) — taruh sbg uraian di
  // kategori pertama supaya tidak hilang, biar user bisa lihat & rapikan.
  return { [categories[0]]: trimmed };
}

// Cari index ')' yg menutup '(' pada posisi `openParenIdx` (yg berada TEPAT
// setelah marker "(Kategori: "), dgn menghitung kedalaman supaya kurung yg
// kebetulan ada di dalam teks uraian pengguna sendiri tidak salah dianggap
// penutup. Return -1 kalau tidak ketemu penutup yg seimbang.
function findMatchingParen(s: string, openParenIdx: number): number {
  let depth = 0;
  for (let i = openParenIdx; i < s.length; i++) {
    if (s[i] === '(') depth++;
    if (s[i] === ')') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function splitTopLevel(s: string): string[] {
  // Split by "; " tapi HINDARI memecah titik-koma yg ada di dalam kurung
  // (mis. uraian yg kebetulan mengandung ";").
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ';' && depth === 0) {
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function buildValue(parsed: ParsedMap, categories: string[], combinedLabel?: string): string {
  const selected = categories.filter((c) => parsed[c] !== undefined);

  if (selected.length === 0) return '';

  // Semua kategori terisi & ada combinedLabel (mis. Internal + Eksternal
  // keduanya diisi) → format gabungan BARU "CombinedLabel (Kategori1:
  // uraian1) (Kategori2: uraian2)" — tiap uraian dibungkus kurungnya
  // sendiri dgn nama kategori, aman dari titik-koma di teks pengguna
  // (lihat komentar di parseValue).
  if (combinedLabel && selected.length === categories.length) {
    const anyUraian = categories.some((c) => (parsed[c] ?? '').trim() !== '');
    if (!anyUraian) return combinedLabel;
    // TIDAK di-trim() di sini — nilai APA ADANYA yg diketik user (termasuk
    // spasi di akhir yg sedang diketik) harus tersimpan mentah, supaya
    // saat string ini di-parseValue() ulang (re-render terkontrol lewat
    // parent onChange), textarea tidak "menelan balik" spasi yg baru saja
    // ditekan — trim() di sini dulu jadi bug: tiap kali user tekan spasi,
    // buildValue membuangnya sebelum sempat tampil, terasa seperti tombol
    // spasi tidak berfungsi sama sekali.
    return `${combinedLabel} ${categories.map((c) => `(${c}: ${parsed[c] ?? ''})`).join(' ')}`;
  }

  // Sebagian kategori terisi → gabung tiap "Kategori (uraian)" dgn "; ".
  return selected
    .map((c) => {
      const u = parsed[c] ?? '';
      return u !== '' ? `${c} (${u})` : c;
    })
    .join('; ');
}
