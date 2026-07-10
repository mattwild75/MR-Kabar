import { Info } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function FieldInfoPopover({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
        aria-label="Info"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-80 max-w-[80vw] rounded-md border bg-popover p-3 text-sm whitespace-pre-line text-popover-foreground shadow-md">
          {text}
        </div>
      )}
    </div>
  );
}
