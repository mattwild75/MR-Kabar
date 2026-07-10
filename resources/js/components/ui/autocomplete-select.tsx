import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AutocompleteSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  /** Kelas lebar dropdown, mis. "w-[32rem]" untuk opsi dengan teks panjang. Default mengikuti lebar input (w-full). */
  dropdownClassName?: string;
}

export default function AutocompleteSelect({ value, onChange, options, placeholder = 'Pilih...', dropdownClassName }: AutocompleteSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
    return base.slice(0, 100);
  }, [options, query]);

  const selectOption = (option: string) => {
    onChange(option);
    setQuery('');
    setOpen(false);
  };

  const handleBlur = () => {
    window.setTimeout(() => setOpen(false), 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      selectOption(filtered[highlight]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <Input
        value={open ? query : value}
        placeholder={value || placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setHighlight(0);
        }}
        onFocus={() => {
          setQuery('');
          setOpen(true);
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
      {open && filtered.length > 0 && (
        <div
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            'absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md',
            dropdownClassName,
          )}
        >
          {filtered.map((option, index) => (
            <button
              key={option}
              type="button"
              onClick={() => selectOption(option)}
              className={cn(
                'block w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground',
                (index === highlight || option === value) && 'bg-accent text-accent-foreground',
              )}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
