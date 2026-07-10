import { useMemo, useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface AutocompleteTextareaProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  rows?: number;
  className?: string;
}

export default function AutocompleteTextarea({ id, value, onChange, options, rows = 2, className }: AutocompleteTextareaProps) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    const base = q ? options.filter((o) => o.toLowerCase().includes(q) && o.toLowerCase() !== q) : options;
    return base.slice(0, 20);
  }, [options, value]);

  const selectOption = (option: string) => {
    onChange(option);
    setOpen(false);
  };

  const handleBlur = () => {
    // Delay so a click on a dropdown item registers before closing.
    window.setTimeout(() => setOpen(false), 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!open || filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      selectOption(filtered[highlight]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Textarea
        id={id}
        value={value}
        rows={rows}
        className={className}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setHighlight(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
      {open && filtered.length > 0 && (
        <div
          onMouseDown={(e) => e.preventDefault()}
          className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md"
        >
          {filtered.map((option, index) => (
            <button
              key={option}
              type="button"
              onClick={() => selectOption(option)}
              className={cn(
                'block w-full whitespace-pre-line px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground',
                index === highlight && 'bg-accent text-accent-foreground',
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
