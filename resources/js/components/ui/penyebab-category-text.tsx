import HighlightText from '@/components/ui/highlight-text';

// Warna badge per kategori 7M+1E (Men/Machine/Method/Material/Money +
// Management/Measurement/Environment) — konsisten dgn kategori di
// MultiCategoryTextarea (lihat PENYEBAB_5M_KATEGORI di irs-reference-data.ts,
// nama konstanta dipertahankan meski isinya sekarang 8 kategori). Dipisah
// dari komponen input krn dipakai murni utk tampilan baca di tabel, sama
// pola dgn RtpCategoryText (badge respon risiko Avoid/Abate/Mitigate/dst).
const PENYEBAB_5M_BADGE_CLASS: Record<string, string> = {
  Machine: 'bg-cyan-600 text-white',
  Men: 'bg-orange-600 text-white',
  Material: 'bg-lime-600 text-white',
  Method: 'bg-indigo-600 text-white',
  Money: 'bg-rose-600 text-white',
  Management: 'bg-teal-600 text-white',
  Measurement: 'bg-fuchsia-600 text-white',
  Environment: 'bg-emerald-600 text-white',
};

const PENYEBAB_5M_KATEGORI_SET = new Set(Object.keys(PENYEBAB_5M_BADGE_CLASS));

interface Segment {
  kategori: string | null;
  uraian: string;
}

// Pecah "Machine (uraian1); Men (uraian2)" jadi segmen per kategori,
// menghormati kurung bersarang di dalam uraian — algoritma identik dgn
// RtpCategoryText::parseSegments(), swap kategori 5M.
function parseSegments(text: string): Segment[] {
  const trimmed = text.trim();
  if (!trimmed) return [{ kategori: null, uraian: text }];

  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of trimmed) {
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

  const segments: Segment[] = [];
  let matchedAny = false;
  for (const part of parts) {
    let matched = false;
    for (const kategori of PENYEBAB_5M_KATEGORI_SET) {
      if (part === kategori) {
        segments.push({ kategori, uraian: '' });
        matched = true;
        matchedAny = true;
        break;
      }
      const prefix = `${kategori} (`;
      if (part.startsWith(prefix) && part.endsWith(')')) {
        segments.push({ kategori, uraian: part.slice(prefix.length, -1) });
        matched = true;
        matchedAny = true;
        break;
      }
    }
    if (!matched) {
      segments.push({ kategori: null, uraian: part });
    }
  }

  return matchedAny ? segments : [{ kategori: null, uraian: text }];
}

/**
 * Render nilai kolom Sebab/Penyebab dgn badge warna per kategori 5M
 * (Machine/Men/Material/Method/Money) supaya bisa dibaca cepat di tabel
 * tanpa harus membuka dialog Edit — dipakai di IRS Pemda/PD, IRO PD
 * (URAIAN PENYEBAB RISIKO), dan Form Cetak 10 (Sebab saat Kejadian). Teks
 * yg belum diklasifikasi (data lama/bebas) ditampilkan apa adanya tanpa
 * badge.
 */
export default function PenyebabCategoryText({ text, query = '' }: { text: string; query?: string }) {
  if (!text || text === '-' || text === 'Tidak Ada Data' || text === 'Tidak Terjadi') {
    return <HighlightText text={text} query={query} />;
  }

  const segments = parseSegments(text);

  return (
    <div className="space-y-1">
      {segments.map((seg, i) => (
        <div key={i}>
          {seg.kategori && (
            <span
              className={`mr-1 inline-block rounded px-1.5 py-0.5 text-[0.65rem] font-semibold whitespace-nowrap ${PENYEBAB_5M_BADGE_CLASS[seg.kategori]}`}
            >
              {seg.kategori}
            </span>
          )}
          {seg.uraian && <HighlightText text={seg.uraian} query={query} />}
        </div>
      ))}
    </div>
  );
}
