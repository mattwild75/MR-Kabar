import { useEffect, useMemo, useRef, useState } from 'react';

interface Row {
  id: number;
  [key: string]: unknown;
}

// Cuplikan teks di sekitar kata kunci (mis. "...Pemda dan Masyarakat...")
// supaya pengguna tahu persis di mana kata kunci itu berada di dalam field,
// bukan cuma nama field-nya saja — berguna untuk field panjang.
function buildSnippet(text: string, query: string, radius = 40): string {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query);
  if (idx === -1) return text;
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + query.length + radius);
  let snippet = text.slice(start, end);
  if (start > 0) snippet = '…' + snippet;
  if (end < text.length) snippet = snippet + '…';
  return snippet;
}

// Field mana pada baris ini yang cocok dengan kata kunci — dipakai untuk
// menampilkan "Ditemukan di FIELD: ...cuplikan..." pada baris yang match,
// karena tidak semua field yang dicari ditampilkan sebagai kolom tabel.
export interface FieldMatch {
  field: string;
  snippet: string;
}

export function useRowSearch<T extends Row>(rows: T[], searchFields: string[]) {
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const rowRefs = useRef<Map<number, HTMLElement>>(new Map());

  const registerRowRef = (id: number, el: HTMLElement | null) => {
    if (el) rowRefs.current.set(id, el);
    else rowRefs.current.delete(id);
  };

  const matchedFieldsByRow = useMemo(() => {
    const map = new Map<number, FieldMatch[]>();
    if (!activeQuery) return map;
    const q = activeQuery;
    rows.forEach((row) => {
      const fieldMatches: FieldMatch[] = [];
      searchFields.forEach((f) => {
        const text = String(row[f] ?? '');
        if (text.toLowerCase().includes(q)) {
          fieldMatches.push({ field: f, snippet: buildSnippet(text, q) });
        }
      });
      if (fieldMatches.length > 0) map.set(row.id, fieldMatches);
    });
    return map;
  }, [rows, searchFields, activeQuery]);

  const matches = useMemo(() => Array.from(matchedFieldsByRow.keys()), [matchedFieldsByRow]);

  const currentMatchId = matches.length > 0 ? (matches[currentMatchIndex] ?? null) : null;

  const runSearch = () => {
    setActiveQuery(searchInput.trim().toLowerCase());
    setCurrentMatchIndex(0);
  };

  // Jalankan pencarian dgn kata kunci tertentu langsung (tanpa bergantung
  // pada state searchInput yang mungkin belum ter-update di render yang
  // sama) — dipakai tombol pilih cepat spt panel status pengisian OPD.
  const searchFor = (term: string) => {
    setSearchInput(term);
    setActiveQuery(term.trim().toLowerCase());
    setCurrentMatchIndex(0);
  };

  const jumpToMatch = (index: number) => {
    if (matches.length === 0) return;
    const wrapped = ((index % matches.length) + matches.length) % matches.length;
    setCurrentMatchIndex(wrapped);
  };

  const clearSearch = () => {
    setSearchInput('');
    setActiveQuery('');
    setCurrentMatchIndex(0);
  };

  const handleKeyDown = (e: { key: string; shiftKey: boolean; preventDefault: () => void }) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeQuery === searchInput.trim().toLowerCase() && matches.length > 0) {
        jumpToMatch(currentMatchIndex + (e.shiftKey ? -1 : 1));
      } else {
        runSearch();
      }
    } else if (e.key === 'Escape') {
      clearSearch();
    }
  };

  useEffect(() => {
    if (currentMatchId === null) return;
    const el = rowRefs.current.get(currentMatchId);
    if (el) {
      const raf = requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      return () => cancelAnimationFrame(raf);
    }
  }, [currentMatchId]);

  return {
    searchInput,
    setSearchInput,
    activeQuery,
    matches,
    matchedFieldsByRow,
    currentMatchIndex,
    currentMatchId,
    registerRowRef,
    runSearch,
    searchFor,
    jumpToMatch,
    clearSearch,
    handleKeyDown,
  };
}
