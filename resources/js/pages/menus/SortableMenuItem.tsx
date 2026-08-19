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
            className="bg-background flex items-center gap-3 rounded border px-4 py-2 shadow-sm transition-shadow hover:shadow" // sesuaikan classname
        >
            <GripVertical className="text-muted-foreground size-4" />
            <span className="text-sm font-medium">{title}</span>
        </div>
    );
}
