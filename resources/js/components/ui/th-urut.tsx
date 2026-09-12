import type { SortDirection } from '@/hooks/use-sortable-rows';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

interface Props {
    field: string;
    label: string;
    activeField: string | null;
    direction: SortDirection;
    onSort: (field: string) => void;
    className?: string;
}

/** Kepala kolom tabel ERPIKA yang bisa diklik untuk mengurutkan (naik, turun, semula). */
export default function ThUrut({ field, label, activeField, direction, onSort, className = '' }: Props) {
    const aktif = activeField === field;
    const Ikon = aktif ? (direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;

    return (
        <th className={`px-3 py-2 select-none ${className}`}>
            <button type="button" onClick={() => onSort(field)} className={`hover:text-primary inline-flex items-center gap-1 uppercase ${aktif ? 'text-primary' : ''}`}>
                <span>{label}</span>
                <Ikon className={`h-3.5 w-3.5 shrink-0 ${aktif ? 'opacity-100' : 'opacity-40'}`} />
            </button>
        </th>
    );
}
