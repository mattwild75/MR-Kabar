import HighlightText from '@/components/ui/highlight-text';

// Warna badge per jenis respon risiko (RTP) — konsisten dgn kategori di
// MultiCategoryTextarea (lihat RESPON_RISIKO_KATEGORI di irs-reference-data.ts).
// Dipisah dari komponen input krn dipakai murni utk tampilan baca di tabel.
const RESPON_RISIKO_BADGE_CLASS: Record<string, string> = {
  Avoid: 'bg-red-600 text-white',
  Abate: 'bg-blue-600 text-white',
  Mitigate: 'bg-amber-500 text-white',
  'Share/Transfer': 'bg-purple-600 text-white',
  Accept: 'bg-slate-500 text-white',
};

const RESPON_RISIKO_KATEGORI_SET = new Set(Object.keys(RESPON_RISIKO_BADGE_CLASS));

interface Segment {
  kategori: string | null;
  uraian: string;
}

// Pecah "Abate (uraian1); Mitigate (uraian2)" jadi segmen per kategori,
// menghormati kurung bersarang di dalam uraian (sama seperti splitTopLevel
// di MultiCategoryTextarea) supaya uraian yg kebetulan berisi tanda kurung
// tidak salah terpotong.
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
    for (const kategori of RESPON_RISIKO_KATEGORI_SET) {
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
 * Render nilai kolom RTP (Rencana Tindak Pengendalian) dgn badge warna per
 * jenis respon risiko (Avoid/Abate/Mitigate/Share-Transfer/Accept) supaya
 * bisa dibaca cepat di tabel tanpa harus membuka dialog Edit — dipakai di
 * IRS Pemda, IRS PD, IRO PD. Teks yg belum diklasifikasi (data lama/bebas)
 * ditampilkan apa adanya tanpa badge.
 */
export default function RtpCategoryText({ text, query }: { text: string; query: string }) {
  if (!text || text === '-' || text === 'Tidak Ada Data') {
    return <HighlightText text={text} query={query} />;
  }

  const segments = parseSegments(text);

  return (
    <div className="space-y-1">
      {segments.map((seg, i) => (
        <div key={i}>
          {seg.kategori && (
            <span
              className={`mr-1 inline-block rounded px-1.5 py-0.5 text-[0.65rem] font-semibold whitespace-nowrap ${RESPON_RISIKO_BADGE_CLASS[seg.kategori]}`}
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
