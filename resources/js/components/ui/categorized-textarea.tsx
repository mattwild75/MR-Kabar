import { useMemo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface CategorizedTextareaProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  categories: string[];
  rows?: number;
  className?: string;
  uraianPlaceholder?: string;
}

/**
 * Field gabungan kategori tetap + uraian bebas, disimpan sebagai satu string
 * "Kategori (uraian)" (mis. "Eksternal (Kebijakan Pusat Berubah)"). Kategori
 * dipilih lewat tombol, uraian ditulis bebas di textarea di bawahnya.
 */
export default function CategorizedTextarea({
  id,
  value,
  onChange,
  categories,
  rows = 2,
  className,
  uraianPlaceholder = 'Tulis uraian...',
}: CategorizedTextareaProps) {
  const { category, uraian } = useMemo(() => parseValue(value, categories), [value, categories]);

  const setCategory = (newCategory: string) => {
    onChange(buildValue(newCategory, uraian));
  };

  const setUraian = (newUraian: string) => {
    onChange(buildValue(category, newUraian));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              'rounded-md border-2 px-3 py-1.5 text-sm font-medium transition-colors',
              category === c
                ? 'border-blue-500 bg-blue-500 text-white dark:border-blue-400 dark:bg-blue-400 dark:text-slate-950'
                : 'border-input bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <Textarea
        id={id}
        value={uraian}
        rows={rows}
        className={className}
        placeholder={uraianPlaceholder}
        onChange={(e) => setUraian(e.target.value)}
      />
    </div>
  );
}

function parseValue(value: string, categories: string[]): { category: string; uraian: string } {
  const trimmed = (value ?? '').trim();

  for (const c of categories) {
    if (trimmed === c) {
      return { category: c, uraian: '' };
    }
    const prefix = `${c} (`;
    if (trimmed.startsWith(prefix) && trimmed.endsWith(')')) {
      return { category: c, uraian: trimmed.slice(prefix.length, -1) };
    }
  }

  return { category: '', uraian: trimmed };
}

function buildValue(category: string, uraian: string): string {
  const trimmedUraian = uraian.trim();

  if (!category) {
    return trimmedUraian;
  }

  return trimmedUraian ? `${category} (${trimmedUraian})` : category;
}
