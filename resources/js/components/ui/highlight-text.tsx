import type { ReactNode } from 'react';

export default function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const idx0 = lower.indexOf(q);
  if (idx0 === -1) return <>{text}</>;

  const parts: ReactNode[] = [];
  let cursor = 0;
  let idx = idx0;
  while (idx !== -1) {
    if (idx > cursor) parts.push(text.slice(cursor, idx));
    parts.push(
      <mark key={idx} className="rounded-sm bg-yellow-300 px-0.5 text-inherit dark:bg-yellow-600">
        {text.slice(idx, idx + query.length)}
      </mark>,
    );
    cursor = idx + query.length;
    idx = lower.indexOf(q, cursor);
  }
  if (cursor < text.length) parts.push(text.slice(cursor));

  return <>{parts}</>;
}
