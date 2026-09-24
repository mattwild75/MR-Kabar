/** Kendali mode sunting bersama Surat Tugas & Kendali Mutu: klik teks lalu
 * ketik seperti di Word (Ctrl+B/I/U); hasil suntingan diunduh PDF/Word.
 * Suntingan hanya untuk berkas yang diunduh — data RPP tidak berubah. */
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { Bold, FileText, Italic, PencilLine, RotateCcw, Underline } from 'lucide-react';
import { type RefObject, useState } from 'react';
import { toast } from 'sonner';

function bacaXsrf(): string {
    const m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : '';
}

interface Props {
    contentRef: RefObject<HTMLElement | null>;
    sunting: boolean;
    setSunting: (v: boolean) => void;
    pdfUrl: string;
    wordUrl?: string;
    filename: string;
    /** Field tambahan ikut dikirim (mis. dok / landscape). */
    body?: Record<string, string | number | boolean>;
}

export function SuntingBar({ contentRef, sunting, setSunting, pdfUrl, wordUrl, filename, body = {} }: Props) {
    const [sibuk, setSibuk] = useState<'pdf' | 'word' | null>(null);
    const perintah = (cmd: 'bold' | 'italic' | 'underline') => document.execCommand(cmd);

    const unduh = async (jenis: 'pdf' | 'word') => {
        if (!contentRef.current) return;
        setSibuk(jenis);
        try {
            const url = jenis === 'pdf' ? pdfUrl : wordUrl!;
            const r = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/octet-stream',
                    'X-XSRF-TOKEN': bacaXsrf(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ html: contentRef.current.innerHTML, ...body }),
            });
            if (!r.ok) throw new Error(String(r.status));
            const blob = await r.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${filename}-suntingan.${jenis === 'pdf' ? 'pdf' : 'docx'}`;
            a.click();
            URL.revokeObjectURL(a.href);
        } catch {
            toast.error('Gagal membuat berkas dari suntingan.');
        } finally {
            setSibuk(null);
        }
    };

    if (!sunting) {
        return (
            <Button variant="outline" size="sm" onClick={() => setSunting(true)}>
                <PencilLine className="mr-1 h-4 w-4" /> Sunting
            </Button>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded border">
                {(
                    [
                        ['bold', Bold, 'Tebal (Ctrl+B)'],
                        ['italic', Italic, 'Miring (Ctrl+I)'],
                        ['underline', Underline, 'Garis bawah (Ctrl+U)'],
                    ] as const
                ).map(([cmd, Icon, title]) => (
                    <button
                        key={cmd}
                        type="button"
                        className="hover:bg-muted px-2 py-1"
                        title={title}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => perintah(cmd)}
                    >
                        <Icon className="h-4 w-4" />
                    </button>
                ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => router.reload()}>
                <RotateCcw className="mr-1 h-4 w-4" /> Kembalikan
            </Button>
            {wordUrl && (
                <Button variant="outline" size="sm" onClick={() => unduh('word')} disabled={sibuk !== null}>
                    <FileText className="mr-1 h-4 w-4" /> {sibuk === 'word' ? 'Membuat…' : 'Unduh Word'}
                </Button>
            )}
            <Button size="sm" onClick={() => unduh('pdf')} disabled={sibuk !== null}>
                {sibuk === 'pdf' ? 'Membuat…' : 'Unduh PDF'}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setSunting(false)}>
                Selesai
            </Button>
        </div>
    );
}
