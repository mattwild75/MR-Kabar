import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface Props {
    /** Nilai tersimpan: nama perangkat daerah dipisah baris baru. */
    value: string;
    onChange: (value: string) => void;
    /** Daftar resmi dari Keterangan Pendukung. */
    options: string[];
    id?: string;
}

/** Bentuk pembanding supaya beda kapitalisasi tidak dianggap nama lain. */
const baku = (s: string) => s.trim().replace(/\s+/g, ' ').toUpperCase();

/**
 * Pemilih perangkat daerah penanggung jawab — kotak centang, bukan kolom teks.
 *
 * Sebelumnya kolom ini diketik bebas, dan akibatnya terasa di tiga tempat
 * sekaligus: ejaannya berbeda-beda antar pengisi ("Dinas Sosial" berdampingan
 * dengan "DINAS TRANSMIGRASI DAN TENAGA KERJA"), satu program yang diampu
 * banyak perangkat daerah menuntut pengetikan berulang, dan penyaring maupun
 * pengelompokan yang mencocokkan teks jadi meleset diam-diam.
 *
 * Pilihannya diambil dari daftar resmi di Keterangan Pendukung, sehingga tidak
 * ada lagi ejaan yang bisa menyimpang. Nilai tersimpan tetap berupa nama
 * dipisah baris baru — bentuk yang sudah dipakai seluruh aplikasi — bukan
 * daftar id, supaya kolomnya tetap terbaca apa adanya pada Form Cetak, ekspor
 * Excel, dan pencarian.
 *
 * Nama yang sudah tersimpan tetapi tidak ada di daftar resmi TIDAK dibuang
 * diam-diam; ia ditampilkan tersendiri sebagai pilihan tercentang supaya
 * pengisinya sadar dan bisa memutuskan.
 */
export default function OpdChecklist({ value, onChange, options, id }: Props) {
    const [cari, setCari] = useState('');

    const terpilih = useMemo(
        () => (value ?? '')
            .split('\n')
            .map((s) => s.trim())
            .filter((s) => s !== ''),
        [value],
    );
    const terpilihBaku = useMemo(() => new Set(terpilih.map(baku)), [terpilih]);

    // Nama tersimpan yang tidak dikenali daftar resmi — ditampilkan terpisah,
    // bukan dihilangkan.
    const asing = useMemo(
        () => terpilih.filter((t) => !options.some((o) => baku(o) === baku(t))),
        [terpilih, options],
    );

    const tampil = useMemo(() => {
        const q = baku(cari);
        return q === '' ? options : options.filter((o) => baku(o).includes(q));
    }, [options, cari]);

    /** Menulis ulang nilai mengikuti URUTAN daftar resmi, supaya stabil. */
    const tulis = (pilih: Set<string>) => {
        const urut = options.filter((o) => pilih.has(baku(o)));
        onChange([...asing, ...urut].join('\n'));
    };

    const alihkan = (nama: string) => {
        const baru = new Set(terpilihBaku);
        if (baru.has(baku(nama))) {
            baru.delete(baku(nama));
        } else {
            baru.add(baku(nama));
        }
        tulis(baru);
    };

    const jumlahTampilTerpilih = tampil.filter((o) => terpilihBaku.has(baku(o))).length;
    const semuaTampilTerpilih = tampil.length > 0 && jumlahTampilTerpilih === tampil.length;

    return (
        <div className="space-y-2 rounded-md border p-3" id={id}>
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-48 flex-1">
                    <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={cari}
                        onChange={(e) => setCari(e.target.value)}
                        placeholder="Cari perangkat daerah..."
                        className="h-8 pl-8 text-sm"
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        const baru = new Set(terpilihBaku);
                        // Hanya yang SEDANG TAMPIL yang terpengaruh — kalau
                        // pencariannya aktif, pilihan di luar hasil pencarian
                        // tidak boleh ikut berubah tanpa terlihat.
                        tampil.forEach((o) => (semuaTampilTerpilih ? baru.delete(baku(o)) : baru.add(baku(o))));
                        tulis(baru);
                    }}
                >
                    {semuaTampilTerpilih ? 'Kosongkan' : 'Pilih semua'}
                    {cari !== '' && ` (${tampil.length} hasil)`}
                </Button>
                <Badge variant={terpilih.length > 0 ? 'default' : 'outline'}>{terpilih.length} terpilih</Badge>
            </div>

            {asing.length > 0 && (
                <div className="rounded-md border border-amber-400/50 bg-amber-50/50 p-2 dark:bg-amber-950/20">
                    <p className="mb-1 text-xs text-amber-700 dark:text-amber-400">
                        Tidak ada di daftar resmi Keterangan Pendukung — tetap disimpan sampai Anda mengubahnya:
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {asing.map((a) => (
                            <Badge key={a} variant="outline" className="gap-1">
                                {a}
                                <button
                                    type="button"
                                    onClick={() => onChange(
                                        [...asing.filter((x) => x !== a),
                                            ...options.filter((o) => terpilihBaku.has(baku(o)))].join('\n'),
                                    )}
                                    className="text-muted-foreground hover:text-destructive"
                                    title="Buang"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
                {tampil.length === 0 && (
                    <p className="py-2 text-center text-xs text-muted-foreground">Tidak ada yang cocok.</p>
                )}
                {tampil.map((o) => (
                    <label
                        key={o}
                        className="flex cursor-pointer items-start gap-2 rounded px-1.5 py-1 text-sm hover:bg-muted"
                    >
                        <Checkbox
                            checked={terpilihBaku.has(baku(o))}
                            onCheckedChange={() => alihkan(o)}
                            className="mt-0.5"
                        />
                        <span className="flex-1 leading-snug">{o}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}
