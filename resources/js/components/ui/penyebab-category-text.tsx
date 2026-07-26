import HighlightText from '@/components/ui/highlight-text';

// Warna badge per kategori 7M+1E Internal (Men/Machine/Method/Material/
// Money/Management/Measurement/Environment) + PESTLE Eksternal (Political/
// Economic/Social/Technological/Legal/Environmental) — konsisten dgn
// kategori di MultiCategoryTextarea (lihat PENYEBAB_5M_KATEGORI di
// irs-reference-data.ts, nama konstanta dipertahankan meski isinya sekarang
// 14 kategori). Dipisah dari komponen input krn dipakai murni utk tampilan
// baca di tabel, sama pola dgn RtpCategoryText (badge respon risiko
// Avoid/Abate/Mitigate/dst).
const PENYEBAB_5M_BADGE_CLASS: Record<string, string> = {
  Machine: 'bg-cyan-600 text-white',
  Men: 'bg-orange-600 text-white',
  Material: 'bg-lime-600 text-white',
  Method: 'bg-indigo-600 text-white',
  Money: 'bg-rose-600 text-white',
  Management: 'bg-teal-600 text-white',
  Measurement: 'bg-fuchsia-600 text-white',
  Environment: 'bg-emerald-600 text-white',
  // PESTLE (Eksternal) — palet terpisah dari 7M+1E Internal di atas.
  Political: 'bg-red-600 text-white',
  Economic: 'bg-yellow-600 text-white',
  Social: 'bg-blue-600 text-white',
  Technological: 'bg-violet-600 text-white',
  Legal: 'bg-purple-600 text-white',
  Environmental: 'bg-green-600 text-white',
};

const PENYEBAB_5M_KATEGORI_SET = new Set(Object.keys(PENYEBAB_5M_BADGE_CLASS));

// Alias ejaan lama data historis (mis. "Man" ditulis alih-alih "Men" oleh
// banyak OPD) — lihat PENYEBAB_KATEGORI_ALIASES di irs-reference-data.ts,
// disalin literal di sini krn file ini murni presentasional & sengaja tidak
// mengimpor apa pun dari irs-reference-data.ts (dipakai jg oleh Form Cetak
// non-halaman-form yg tidak selalu memuat modul itu).
const PENYEBAB_KATEGORI_ALIASES: Record<string, string> = { Man: 'Men' };

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
      // Kategori tersimpan bisa polos ("Method") — data lama — atau dgn
      // suffix asal "Method - Int"/"Legal - Eks" — data baru (lihat
      // penyebabKategoriSuffix di irs-reference-data.ts). Badge warna tetap
      // dikunci ke nama kategori dasar (tanpa suffix).
      const labelPolos = kategori;
      const labelInt = `${kategori} - Int`;
      const labelEks = `${kategori} - Eks`;
      const alias = Object.entries(PENYEBAB_KATEGORI_ALIASES).find(([, canonical]) => canonical === kategori)?.[0];
      const candidates = alias ? [labelInt, labelEks, labelPolos, alias] : [labelInt, labelEks, labelPolos];
      const label = candidates.find((l) => part === l || part.startsWith(`${l} (`));
      if (!label) continue;
      if (part === label) {
        segments.push({ kategori, uraian: '' });
      } else {
        segments.push({ kategori, uraian: part.slice(label.length + 2, -1) });
      }
      matched = true;
      matchedAny = true;
      break;
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
