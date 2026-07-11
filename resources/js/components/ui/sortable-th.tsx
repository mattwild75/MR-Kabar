import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import type { SortDirection } from '@/hooks/use-sortable-rows';

interface SortableThProps {
  field: string;
  label: string;
  activeField: string | null;
  direction: SortDirection;
  onSort: (field: string) => void;
  className?: string;
}

export default function SortableTh({ field, label, activeField, direction, onSort, className }: SortableThProps) {
  const isActive = activeField === field;
  const Icon = isActive ? (direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <th
      className={`border px-3 py-2 text-left font-semibold select-none ${className ?? 'whitespace-nowrap'}`}
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        className="flex w-full items-center gap-1 text-left hover:text-primary"
      >
        <span>{label}</span>
        <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'opacity-100' : 'opacity-40'}`} />
      </button>
    </th>
  );
}
