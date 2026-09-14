import { type ReactNode } from 'react';

/**
 * Kepala halaman yang seragam: judul, keterangan satu kalimat, dan tempat
 * tombol aksi di kanan (menyusun ke bawah di layar sempit). Dipakai supaya
 * setiap halaman membuka dengan irama yang sama — sebelumnya ukuran judul
 * dan jarak berbeda-beda antar halaman (text-xl di satu tempat, text-2xl
 * bold di tempat lain).
 */
export default function PageHeader({
    title,
    description,
    icon,
    actions,
    children,
}: {
    title: ReactNode;
    description?: ReactNode;
    /** Ikon kecil di kiri judul (lucide), opsional. */
    icon?: ReactNode;
    /** Tombol atau kontrol di sisi kanan. */
    actions?: ReactNode;
    /** Baris tambahan di bawah judul (mis. toolbar penyaring). */
    children?: ReactNode;
}) {
    return (
        <header className="space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex min-w-0 items-start gap-2.5">
                    {icon && <span className="text-muted-foreground mt-1 shrink-0 [&>svg]:h-5 [&>svg]:w-5">{icon}</span>}
                    <div className="min-w-0">
                        <h1 className="text-foreground text-xl font-semibold tracking-tight text-balance md:text-2xl">{title}</h1>
                        {description && <p className="text-muted-foreground mt-1 max-w-3xl text-sm leading-relaxed">{description}</p>}
                    </div>
                </div>
                {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
            </div>
            {children}
        </header>
    );
}
