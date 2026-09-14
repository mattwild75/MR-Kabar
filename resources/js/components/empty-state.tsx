import { Inbox } from 'lucide-react';
import { type ReactNode } from 'react';

/**
 * Keadaan kosong yang menjelaskan, bukan sekadar "Belum ada data.": ikon
 * tenang, judul, satu kalimat tentang apa yang biasanya ada di sini, dan
 * (bila ada) langkah berikutnya sebagai tombol. Ukuran `sm` untuk kotak
 * kecil di dashboard, `md` untuk halaman daftar.
 */
export default function EmptyState({
    icon,
    title,
    description,
    action,
    size = 'md',
    className = '',
}: {
    icon?: ReactNode;
    title: string;
    description?: ReactNode;
    action?: ReactNode;
    size?: 'sm' | 'md';
    className?: string;
}) {
    const kecil = size === 'sm';
    return (
        <div
            role="status"
            className={`flex flex-col items-center justify-center text-center ${kecil ? 'gap-1.5 px-4 py-6' : 'gap-2 px-6 py-12'} ${className}`}
        >
            <span
                className={`bg-muted text-muted-foreground flex items-center justify-center rounded-full ${kecil ? 'h-9 w-9 [&>svg]:h-4 [&>svg]:w-4' : 'h-12 w-12 [&>svg]:h-5 [&>svg]:w-5'}`}
                aria-hidden="true"
            >
                {icon ?? <Inbox />}
            </span>
            <p className={`text-foreground font-medium ${kecil ? 'text-sm' : 'text-base'}`}>{title}</p>
            {description && <p className={`text-muted-foreground max-w-md ${kecil ? 'text-xs' : 'text-sm'} leading-relaxed`}>{description}</p>}
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}
