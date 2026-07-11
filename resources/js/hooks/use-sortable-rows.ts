import { useMemo, useState } from 'react';

export type SortDirection = 'asc' | 'desc';

/**
 * Sort generik untuk tabel data risiko (IRS Pemda/PD, IRO PD) — klik header
 * kolom untuk urutkan naik, klik lagi untuk turun, klik lagi untuk reset ke
 * urutan asli (mengikuti withNomorUrut() dari server, dikelompokkan per
 * Sasaran/Kegiatan). String diurutkan case-insensitive locale-aware, angka
 * diurutkan numerik — nilai kosong/null selalu di akhir apa pun arahnya.
 */
export function useSortableRows<T extends { id: number; [key: string]: unknown }>(rows: T[]) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const toggleSort = (field: string) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDirection('asc');
      return;
    }
    if (sortDirection === 'asc') {
      setSortDirection('desc');
      return;
    }
    // Klik ketiga kali: reset ke urutan asli dari server.
    setSortField(null);
    setSortDirection('asc');
  };

  const sortedRows = useMemo(() => {
    if (!sortField) return rows;

    const dir = sortDirection === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = a[sortField];
      const vb = b[sortField];
      const aEmpty = va === null || va === undefined || va === '';
      const bEmpty = vb === null || vb === undefined || vb === '';
      if (aEmpty && bEmpty) return 0;
      if (aEmpty) return 1;
      if (bEmpty) return -1;

      const na = Number(va);
      const nb = Number(vb);
      if (!Number.isNaN(na) && !Number.isNaN(nb)) {
        return (na - nb) * dir;
      }
      return String(va).localeCompare(String(vb), 'id', { sensitivity: 'base', numeric: true }) * dir;
    });
  }, [rows, sortField, sortDirection]);

  return { sortedRows, sortField, sortDirection, toggleSort };
}
