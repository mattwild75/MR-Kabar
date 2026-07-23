import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface Props {
  id: string;
  title: string;
}

export default function SortableMenuItem({ id, title }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab', // tambahkan cursor grab
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-3 rounded border bg-background px-4 py-2 shadow-sm hover:shadow transition-shadow" // sesuaikan classname
    >
      <GripVertical className="text-muted-foreground size-4" />
      <span className="font-medium text-sm">{title}</span>
    </div>
  );
}
