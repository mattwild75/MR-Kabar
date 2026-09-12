import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Butir {
    judul: string;
    sub: string;
    url: string;
    ikon?: string;
}

interface Kelompok {
    judul: string;
    butir: Butir[];
}

/**
 * Pencarian global: tombol di topbar atau Ctrl+K / Cmd+K. Menanyakan ke
 * /pencarian setelah jeda ketik 250 ms; hasilnya sudah disekat server
 * sesuai hak pengguna. Enter atau klik membuka halaman tujuan lewat
 * Inertia (tanpa muat ulang penuh).
 */
export function PencarianGlobal() {
    const [terbuka, setTerbuka] = useState(false);
    const [q, setQ] = useState('');
    const [kelompok, setKelompok] = useState<Kelompok[]>([]);
    const [memuat, setMemuat] = useState(false);
    const pengendali = useRef<AbortController | null>(null);

    useEffect(() => {
        const tangani = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setTerbuka((t) => !t);
            }
        };
        window.addEventListener('keydown', tangani);
        return () => window.removeEventListener('keydown', tangani);
    }, []);

    const cari = useCallback((teks: string) => {
        pengendali.current?.abort();
        if (teks.trim().length < 2) {
            setKelompok([]);
            return;
        }
        const ctl = new AbortController();
        pengendali.current = ctl;
        setMemuat(true);
        fetch('/pencarian?q=' + encodeURIComponent(teks), { headers: { Accept: 'application/json' }, credentials: 'same-origin', signal: ctl.signal })
            .then((r) => (r.ok ? r.json() : { kelompok: [] }))
            .then((d: { kelompok: Kelompok[] }) => setKelompok(d.kelompok ?? []))
            .catch(() => undefined)
            .finally(() => {
                if (pengendali.current === ctl) setMemuat(false);
            });
    }, []);

    useEffect(() => {
        const t = setTimeout(() => cari(q), 250);
        return () => clearTimeout(t);
    }, [q, cari]);

    const buka = (url: string) => {
        setTerbuka(false);
        router.visit(url);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setTerbuka(true)}
                className="text-muted-foreground hover:bg-muted hidden items-center gap-2 rounded-md border px-3 py-1.5 text-sm md:inline-flex"
                aria-label="Cari (Ctrl+K)"
            >
                <Search className="h-4 w-4" />
                <span>Cari…</span>
                <kbd className="bg-muted ml-2 rounded border px-1.5 text-[10px]">Ctrl K</kbd>
            </button>
            <button type="button" onClick={() => setTerbuka(true)} className="hover:bg-muted rounded-md p-2 md:hidden" aria-label="Cari">
                <Search className="h-5 w-5" />
            </button>
            <Dialog open={terbuka} onOpenChange={setTerbuka}>
                <DialogHeader className="sr-only">
                    <DialogTitle>Pencarian</DialogTitle>
                    <DialogDescription>Cari menu, risiko, OPD, RPP, pegawai</DialogDescription>
                </DialogHeader>
                <DialogContent className="overflow-hidden p-0 sm:max-w-xl">
                    {/* shouldFilter=false: penyaringan sudah dilakukan server. */}
                    <Command
                        shouldFilter={false}
                        className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2"
                    >
                        <CommandInput
                            placeholder="Ketik minimal 2 huruf: nama menu, uraian risiko, nomor ST, nama pegawai…"
                            value={q}
                            onValueChange={setQ}
                        />
                        <CommandList>
                            <CommandEmpty>
                                {memuat ? 'Mencari…' : q.trim().length < 2 ? 'Ketik untuk mulai mencari.' : 'Tidak ada hasil.'}
                            </CommandEmpty>
                            {kelompok.map((g) => (
                                <CommandGroup key={g.judul} heading={g.judul}>
                                    {g.butir.map((b, i) => (
                                        <CommandItem key={`${g.judul}-${i}`} value={`${g.judul}-${i}-${b.judul}`} onSelect={() => buka(b.url)}>
                                            <div className="min-w-0">
                                                <div className="truncate">{b.judul}</div>
                                                {b.sub && <div className="text-muted-foreground truncate text-xs">{b.sub}</div>}
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            ))}
                        </CommandList>
                    </Command>
                </DialogContent>
            </Dialog>
        </>
    );
}
