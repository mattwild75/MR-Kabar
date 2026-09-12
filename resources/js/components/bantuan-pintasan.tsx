import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEffect, useState } from 'react';

const PINTASAN: [string, string][] = [
    ['Ctrl + K', 'Pencarian global (menu, risiko, OPD, RPP, pegawai)'],
    ['?', 'Daftar pintasan ini'],
    ['Esc', 'Tutup dialog atau pencarian'],
    ['Ctrl + P', 'Cetak halaman yang mendukung cetak (Beban Kerja, pratinjau)'],
    ['Tab / Shift + Tab', 'Berpindah antar kontrol; Enter mengaktifkan'],
];

/** Dialog pintasan papan ketik, dibuka dengan tombol "?" di luar kolom isian. */
export function BantuanPintasan() {
    const [terbuka, setTerbuka] = useState(false);
    useEffect(() => {
        const tangani = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            const mengetik =
                target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable);
            if (e.key === '?' && !mengetik && !e.ctrlKey && !e.metaKey && !e.altKey) {
                e.preventDefault();
                setTerbuka((t) => !t);
            }
        };
        window.addEventListener('keydown', tangani);
        return () => window.removeEventListener('keydown', tangani);
    }, []);
    return (
        <Dialog open={terbuka} onOpenChange={setTerbuka}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Pintasan papan ketik</DialogTitle>
                    <DialogDescription>Berlaku di seluruh halaman setelah masuk.</DialogDescription>
                </DialogHeader>
                <table className="w-full text-sm">
                    <tbody>
                        {PINTASAN.map(([k, v]) => (
                            <tr key={k} className="border-t">
                                <td className="py-1.5 pr-3 whitespace-nowrap">
                                    <kbd className="bg-muted rounded border px-1.5 py-0.5 text-xs">{k}</kbd>
                                </td>
                                <td className="py-1.5">{v}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </DialogContent>
        </Dialog>
    );
}
