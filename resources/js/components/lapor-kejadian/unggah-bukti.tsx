import { Label } from '@/components/ui/label';
import { Paperclip, X } from 'lucide-react';
import { useRef, useState } from 'react';

/**
 * Kotak unggah berkas bukti (seret-lepas atau pilih): JPG/PNG/PDF, 10 MB per
 * berkas, paling banyak 5 — aturan yang sama dengan validasi server. Dipakai
 * formulir Kejadian Risiko dan Dugaan Kecurangan supaya tampilan dan batasnya
 * seragam. Komponen ini tidak mengunggah sendiri; berkasnya ikut terkirim
 * bersama formulir (multipart) saat tombol Lapor ditekan.
 */
export default function UnggahBukti({
    berkas,
    onChange,
    galat,
    label = 'Lampirkan berkas bukti (opsional)',
    keterangan,
}: {
    berkas: File[];
    onChange: (berkas: File[]) => void;
    galat?: string;
    label?: string;
    keterangan?: React.ReactNode;
}) {
    const berkasRef = useRef<HTMLInputElement>(null);
    const [seret, setSeret] = useState(false);
    const tambah = (baru: File[]) => onChange([...berkas, ...baru].slice(0, 5));

    return (
        <div>
            <Label>{label}</Label>
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setSeret(true);
                }}
                onDragLeave={() => setSeret(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setSeret(false);
                    tambah(Array.from(e.dataTransfer.files ?? []));
                }}
                className={`mt-1 rounded-md border-2 border-dashed p-4 text-center text-sm transition ${seret ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'}`}
            >
                <Paperclip className="text-muted-foreground mx-auto mb-2 h-5 w-5" />
                <button type="button" className="text-primary underline" onClick={() => berkasRef.current?.click()}>
                    Pilih berkas
                </button>{' '}
                atau seret ke sini
                <p className="text-muted-foreground mt-1 text-xs">JPG, PNG, atau PDF · maksimal 10 MB per berkas · paling banyak 5 berkas</p>
                <input
                    ref={berkasRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                        tambah(Array.from(e.target.files ?? []));
                        e.target.value = '';
                    }}
                />
            </div>

            {berkas.length > 0 && (
                <ul className="mt-2 space-y-1">
                    {berkas.map((f, i) => (
                        <li key={`${f.name}-${i}`} className="flex items-center justify-between rounded border px-2 py-1 text-sm">
                            <span className="truncate">
                                {f.name} <span className="text-muted-foreground">({Math.round(f.size / 1024)} KB)</span>
                            </span>
                            <button type="button" aria-label="Buang berkas" onClick={() => onChange(berkas.filter((_, j) => j !== i))}>
                                <X className="h-4 w-4" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {galat && <p className="text-destructive mt-1 text-xs">{galat}</p>}
            {keterangan && <div className="text-muted-foreground mt-2 text-xs">{keterangan}</div>}
        </div>
    );
}
