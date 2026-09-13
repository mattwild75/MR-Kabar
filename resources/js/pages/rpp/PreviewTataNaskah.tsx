import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Bold, FileText, Italic, PencilLine, RotateCcw, Underline } from 'lucide-react';
import { Fragment, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Baris {
    no: number;
    jenis: string | null;
    nomor_rpp: string;
    tanggal_rpp: string | null;
    nomor_sp: string | null;
    nomor_st: string | null;
    nomor_kp: string | null;
    tanggal_st: string | null;
    ketua_tim: string | null;
    uraian: string | null;
    status: string;
    lhp: { nomor: string; tanggal: string | null } | null;
    jumlah_lhp: number;
}

interface Props {
    tahun: number;
    rpp: { id: number; nomor_rpp: string } | null;
    judul: string;
    kolomTim: string;
    jenis: { id: number; name: string; kode_nomor: string | null; sebutan: string | null } | null;
    categories: { id: number; code: string; name: string; kode_nomor: string | null }[];
    tahunTersedia: number[];
    baris: Baris[];
    suntingan?: string;
}

function tgl(iso: string | null) {
    if (!iso) return '';
    return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
}

function bacaXsrf(): string {
    const m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : '';
}

/**
 * Tata naskah penugasan — agenda penomoran RPP, SP, ST, KP, ketua tim, dan
 * LHP (satu RPP, atau satu jenis satu tahun), disalin dari berkas
 * "0__no agenda penugasan": tiga baris per penugasan (nomor / ketua tim /
 * tanggal). Pratinjau bisa DISUNTING langsung seperti di Word (klik teks,
 * ketik); hasil suntingan bisa diunduh sebagai PDF atau Word. Suntingan
 * hanya untuk cetakan — data RPP tidak berubah.
 */
export default function PreviewTataNaskah({ tahun, rpp, judul, kolomTim, jenis, categories, tahunTersedia, baris, suntingan }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'ERPIKA', href: '#' },
        { title: 'RPP Perencanaan', href: '/rpp' },
        { title: 'Tata Naskah', href: '#' },
    ];
    const dasar = rpp ? `/rpp-cetak/${rpp.id}/tata-naskah` : '/rpp-cetak/tata-naskah';
    const q = rpp ? '' : `?tahun=${tahun}${jenis ? `&jenis=${jenis.id}` : ''}`;
    const pergi = (t: string | number, j: string | number | null) =>
        router.get('/rpp-cetak/tata-naskah/preview', { tahun: t, jenis: j ?? '' }, { preserveState: true });
    const [sunting, setSunting] = useState(false);
    const [berubah, setBerubah] = useState(false);
    const [sibuk, setSibuk] = useState<'pdf' | 'word' | null>(null);
    const naskah = useRef<HTMLDivElement>(null);
    const namaBerkas = 'Tata-Naskah-' + (rpp ? rpp.nomor_rpp.replace(/[^A-Za-z0-9]+/g, '-') : `${jenis?.kode_nomor ?? 'semua'}-${tahun}`);

    const kembalikan = () => {
        setSunting(false);
        setBerubah(false);
        router.reload();
    };
    const perintah = (cmd: 'bold' | 'italic' | 'underline') => {
        document.execCommand(cmd);
        setBerubah(true);
    };
    const unduhSuntingan = async (jenisUnduh: 'pdf' | 'word') => {
        if (!naskah.current) return;
        setSibuk(jenisUnduh);
        try {
            const url = jenisUnduh === 'pdf' ? '/rpp-cetak/tata-naskah/pdf-suntingan' : `${dasar}/word`;
            const r = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/octet-stream',
                    'X-XSRF-TOKEN': bacaXsrf(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ html: naskah.current.innerHTML, nama: namaBerkas }),
            });
            if (!r.ok) throw new Error(String(r.status));
            const blob = await r.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${namaBerkas}.${jenisUnduh === 'pdf' ? 'pdf' : 'docx'}`;
            a.click();
            URL.revokeObjectURL(a.href);
        } catch {
            toast.error('Gagal membuat berkas dari suntingan.');
        } finally {
            setSibuk(null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tata Naskah ${rpp?.nomor_rpp ?? jenis?.name ?? ''} ${tahun}`} />
            <style>{`
                @page { size: A4 landscape; margin: 12mm; }
                .naskah { font-family: 'Times New Roman', 'Liberation Serif', serif; color: #000; font-size: 10pt; }
                .naskah table { border-collapse: collapse; width: 100%; table-layout: fixed; }
                .naskah th, .naskah td { border: 1px solid #000; padding: 2px 4px; vertical-align: middle; }
                .naskah th { text-align: center; font-weight: 700; }
                .naskah td.tengah { text-align: center; }
                .naskah td.tanpa-atas { border-top: none; }
                .naskah td.tanpa-bawah { border-bottom: none; }
                .naskah thead { display: table-header-group; }
                .naskah tr { page-break-inside: avoid; }
                .naskah[contenteditable="true"] { outline: 2px dashed #2563eb; outline-offset: 4px; cursor: text; }
                .naskah[contenteditable="true"] td:focus-within, .naskah[contenteditable="true"] th:focus-within { background: #fef9c3; }
                @media print { body { background: #fff; } .naskah { padding: 0 !important; margin: 0 !important; max-width: none !important; outline: none !important; } .min-h-svh { min-height: 0 !important; } }
            `}</style>

            {!suntingan && (
                <div className="space-y-3 p-4 md:p-6 print:hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Link href="/rpp">
                                <Button variant="secondary" size="sm">
                                    Kembali
                                </Button>
                            </Link>
                            {!rpp && (
                                <>
                                    <Select value={String(tahun)} onValueChange={(v) => pergi(v, jenis?.id ?? null)}>
                                        <SelectTrigger className="w-[110px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[...new Set([tahun, ...tahunTersedia])]
                                                .sort((a, b) => b - a)
                                                .map((y) => (
                                                    <SelectItem key={y} value={String(y)}>
                                                        {y}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    <Select value={jenis ? String(jenis.id) : 'semua'} onValueChange={(v) => pergi(tahun, v === 'semua' ? null : v)}>
                                        <SelectTrigger className="w-[220px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="semua">Semua jenis</SelectItem>
                                            {categories.map((c) => (
                                                <SelectItem key={c.id} value={String(c.id)}>
                                                    {c.code}. {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </>
                            )}
                            {rpp && (
                                <span className="text-muted-foreground text-sm">
                                    RPP <span className="font-mono">{rpp.nomor_rpp}</span>
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {!sunting ? (
                                <>
                                    <Button variant="outline" size="sm" onClick={() => setSunting(true)}>
                                        <PencilLine className="mr-1 h-4 w-4" /> Sunting
                                    </Button>
                                    <a href={`${dasar}/word${q}`}>
                                        <Button variant="outline" size="sm">
                                            <FileText className="mr-1 h-4 w-4" /> Unduh Word
                                        </Button>
                                    </a>
                                    <a href={`${dasar}${q}`}>
                                        <Button size="sm">Unduh PDF</Button>
                                    </a>
                                </>
                            ) : (
                                <>
                                    <div className="flex rounded border">
                                        <button
                                            type="button"
                                            className="hover:bg-muted px-2 py-1"
                                            title="Tebal (Ctrl+B)"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => perintah('bold')}
                                        >
                                            <Bold className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            className="hover:bg-muted px-2 py-1"
                                            title="Miring (Ctrl+I)"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => perintah('italic')}
                                        >
                                            <Italic className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            className="hover:bg-muted px-2 py-1"
                                            title="Garis bawah (Ctrl+U)"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => perintah('underline')}
                                        >
                                            <Underline className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={kembalikan} disabled={!berubah}>
                                        <RotateCcw className="mr-1 h-4 w-4" /> Kembalikan
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => unduhSuntingan('word')} disabled={sibuk !== null}>
                                        <FileText className="mr-1 h-4 w-4" /> {sibuk === 'word' ? 'Membuat…' : 'Unduh Word (suntingan)'}
                                    </Button>
                                    <Button size="sm" onClick={() => unduhSuntingan('pdf')} disabled={sibuk !== null}>
                                        {sibuk === 'pdf' ? 'Membuat…' : 'Unduh PDF (suntingan)'}
                                    </Button>
                                    <Button variant="secondary" size="sm" onClick={() => setSunting(false)}>
                                        Selesai
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        {sunting
                            ? 'Mode sunting: klik teks mana pun lalu ketik seperti di Word (Enter menambah baris, Ctrl+B/I/U). Suntingan hanya untuk berkas yang diunduh — data RPP tidak berubah.'
                            : 'Nomor SP dan KP yang belum diisi di RPP ditampilkan menurut pola tata naskah (nomor urut sama dengan ST); tanggal SP/ST/KP satu tanggal. Tekan Sunting untuk mengetik ulang sebelum diunduh.'}
                    </p>
                </div>
            )}

            {suntingan ? (
                <div
                    className="naskah mx-auto w-[273mm] max-w-full bg-white p-[8mm] text-black print:w-auto"
                    dangerouslySetInnerHTML={{ __html: suntingan }}
                />
            ) : (
                <div
                    ref={naskah}
                    className="naskah mx-auto w-[273mm] max-w-full bg-white p-[8mm] text-black print:w-auto"
                    contentEditable={sunting}
                    suppressContentEditableWarning
                    onInput={() => setBerubah(true)}
                >
                    <div className="text-center text-[12pt] font-bold">{judul}</div>
                    <div className="mb-3 text-center text-[12pt] font-bold">{tahun}</div>
                    <table>
                        <colgroup>
                            {[5, 17, 17, 15, 15, 19, 12].map((w, i) => (
                                <col key={i} style={{ width: `${w}%` }} />
                            ))}
                        </colgroup>
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>RPP</th>
                                <th>SP</th>
                                <th>ST</th>
                                <th>KP</th>
                                <th>{kolomTim}</th>
                                <th>
                                    LHP
                                    <br />
                                    Nomor / Tanggal
                                </th>
                            </tr>
                            <tr>
                                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                                    <th key={n} className="text-[8pt] font-normal">
                                        {n}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {baris.map((b, idx) => {
                                const kepala = !jenis && (idx === 0 || baris[idx - 1].jenis !== b.jenis);
                                return (
                                    <Fragment key={`${b.nomor_st ?? b.nomor_rpp}-${idx}`}>
                                        {kepala && (
                                            <tr>
                                                <td colSpan={7} className="font-bold">
                                                    {b.jenis}
                                                </td>
                                            </tr>
                                        )}
                                        <tr>
                                            <td className="tengah tanpa-bawah">{b.no}</td>
                                            <td className="tengah tanpa-bawah">{b.nomor_rpp}</td>
                                            <td className="tengah tanpa-bawah">{b.nomor_sp ?? ''}</td>
                                            <td className="tengah tanpa-bawah">{b.nomor_st ?? ''}</td>
                                            <td className="tengah tanpa-bawah">{b.nomor_kp ?? ''}</td>
                                            <td className="tanpa-bawah"></td>
                                            <td className="tengah tanpa-bawah">{b.lhp?.nomor ?? ''}</td>
                                        </tr>
                                        <tr>
                                            <td className="tanpa-atas tanpa-bawah"></td>
                                            <td className="tanpa-atas tanpa-bawah"></td>
                                            <td className="tanpa-atas tanpa-bawah"></td>
                                            <td className="tanpa-atas tanpa-bawah"></td>
                                            <td className="tanpa-atas tanpa-bawah"></td>
                                            <td className="tanpa-atas tanpa-bawah">{b.ketua_tim ?? ''}</td>
                                            <td className="tanpa-atas tanpa-bawah"></td>
                                        </tr>
                                        <tr>
                                            <td className="tanpa-atas"></td>
                                            <td className="tengah tanpa-atas">{tgl(b.tanggal_rpp)}</td>
                                            <td className="tengah tanpa-atas">{tgl(b.tanggal_st)}</td>
                                            <td className="tengah tanpa-atas">{tgl(b.tanggal_st)}</td>
                                            <td className="tengah tanpa-atas">{tgl(b.tanggal_st)}</td>
                                            <td className="tanpa-atas"></td>
                                            <td className="tengah tanpa-atas">{tgl(b.lhp?.tanggal ?? null)}</td>
                                        </tr>
                                    </Fragment>
                                );
                            })}
                            {baris.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="tengah">
                                        Belum ada penugasan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </AppLayout>
    );
}
