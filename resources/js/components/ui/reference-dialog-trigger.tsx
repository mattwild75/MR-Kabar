import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReferenceDialogTrigger({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onClick} title={label} aria-label={label}>
      <BookOpen className="h-3.5 w-3.5" />
    </Button>
  );
}
