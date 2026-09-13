import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Bold, FileText, Italic, PencilLine, RotateCcw, Underline } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    rpp: {
        id: number;
        nomor_rpp: string;
        tanggal: string;
        hal: string;
        tujuan: string;
        sebutan: string | null;
        dasar: string;
        dengan_penutup: boolean;
    } | null;
    inspektur: { nama: string; nip_rapat: string; nip_spasi: string } | null;
    /** HTML hasil suntingan (jalur render PDF suntingan) — tanpa kontrol apa pun. */
    suntingan?: string;
}

function bacaXsrf(): string {
    const m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : '';
}

/**
 * Surat pengantar RPP — disalin dari Pengantar RPP*.doc Bagian Perencanaan:
 * kop Inspektorat (gambar dari berkas asli, supaya huruf Cooper Black-nya
 * sama di server mana pun), Nomor/Lampiran/Hal di kiri, tanggal dan tujuan di
 * kanan, tiga paragraf bernomor, tanda tangan Inspektur. Huruf isi Bookman
 * Old Style 12pt seperti aslinya; di server tanpa huruf itu jatuh ke URW
 * Bookman/serif.
 *
 * Pratinjau bisa DISUNTING langsung seperti di Word (klik teks, ketik,
 * Ctrl+B/I/U); hasil suntingan diunduh sebagai PDF atau Word (.docx). Ada
 * juga Unduh Word dari data tanpa menyunting. Suntingan hanya untuk berkas
 * yang diunduh — data RPP tidak berubah.
 */
export default function RppPreviewPengantar({ rpp, inspektur, suntingan }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'ERPIKA', href: '#' },
        { title: 'RPP Perencanaan', href: '/rpp' },
        { title: 'Pengantar ' + (rpp?.nomor_rpp ?? ''), href: '#' },
    ];
    const [sunting, setSunting] = useState(false);
    const [berubah, setBerubah] = useState(false);
    const [sibuk, setSibuk] = useState<'pdf' | 'word' | null>(null);
    const surat = useRef<HTMLDivElement>(null);

    // "Penyampaian Rencana Penugasan" di baris pertama, sisanya baris kedua
    // bergaris bawah — persis pola berkas asli.
    const halBaris1 = 'Penyampaian Rencana';
    const halSisa = (rpp?.hal ?? '').replace(/^Penyampaian Rencana\s*/i, '');
    const namaBerkas = 'RPP-Pengantar-' + (rpp?.nomor_rpp ?? '').replace(/[^A-Za-z0-9]+/g, '-');

    const perintah = (cmd: 'bold' | 'italic' | 'underline') => {
        document.execCommand(cmd);
        setBerubah(true);
    };
    const kembalikan = () => {
        setSunting(false);
        setBerubah(false);
        router.reload();
    };
    const unduhSuntingan = async (jenis: 'pdf' | 'word') => {
        if (!surat.current || !rpp) return;
        setSibuk(jenis);
        try {
            const url = jenis === 'pdf' ? `/rpp-cetak/${rpp.id}/pengantar/pdf-suntingan` : `/rpp-cetak/${rpp.id}/pengantar/word`;
            const r = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/octet-stream',
                    'X-XSRF-TOKEN': bacaXsrf(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ html: surat.current.innerHTML }),
            });
            if (!r.ok) throw new Error(String(r.status));
            const blob = await r.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${namaBerkas}-suntingan.${jenis === 'pdf' ? 'pdf' : 'docx'}`;
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
            <Head title={`Pengantar RPP ${rpp?.nomor_rpp ?? ''}`} />
            <style>{`
                @page { size: A4 portrait; margin: 12mm 12.5mm 20mm 24mm; }
                .surat { font-family: 'Bookman Old Style', 'URW Bookman', Bookman, 'DejaVu Serif', serif; font-size: 12pt; color: #000; line-height: 1.5; }
                .surat ol li { padding-left: 4mm; text-align: justify; line-height: 1.75; }
                .surat[contenteditable="true"] { outline: 2px dashed #2563eb; outline-offset: 4px; cursor: text; }
                @media print {
                    body { background: #fff; }
                    .surat { padding: 0 !important; margin: 0 !important; max-width: none !important; box-shadow: none !important; outline: none !important; }
                    .min-h-svh { min-height: 0 !important; }
                }
            `}</style>

            {!suntingan && rpp && (
                <div className="space-y-3 p-4 md:p-6 print:hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                            <Link href="/rpp">
                                <Button variant="secondary" size="sm">
                                    Kembali
                                </Button>
                            </Link>
                            <Link href={`/rpp-cetak/${rpp.id}/tabel/preview`}>
                                <Button variant="outline" size="sm">
                                    Tabel RPP
                                </Button>
                            </Link>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {!sunting ? (
                                <>
                                    <Button variant="outline" size="sm" onClick={() => setSunting(true)}>
                                        <PencilLine className="mr-1 h-4 w-4" /> Sunting
                                    </Button>
                                    <a href={`/rpp-cetak/${rpp.id}/pengantar/word`}>
                                        <Button variant="outline" size="sm">
                                            <FileText className="mr-1 h-4 w-4" /> Unduh Word
                                        </Button>
                                    </a>
                                    <a href={`/rpp-cetak/${rpp.id}/pengantar`}>
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
                            ? 'Mode sunting: klik teks surat lalu ketik seperti di Word (Enter menambah baris, Ctrl+B/I/U). Suntingan hanya untuk berkas yang diunduh — data RPP tidak berubah.'
                            : 'Tekan Sunting untuk mengetik ulang isi surat sebelum diunduh, atau Unduh Word untuk melanjutkan pengeditan di MS Word.'}
                    </p>
                </div>
            )}

            {suntingan ? (
                <div
                    className="surat mx-auto w-[210mm] max-w-full bg-white px-[12mm] py-[10mm] text-black print:w-auto"
                    dangerouslySetInnerHTML={{ __html: suntingan }}
                />
            ) : (
                rpp &&
                inspektur && (
                    <div
                        ref={surat}
                        className="surat mx-auto w-[210mm] max-w-full bg-white px-[12mm] py-[10mm] text-black print:w-auto"
                        contentEditable={sunting}
                        suppressContentEditableWarning
                        onInput={() => setBerubah(true)}
                    >
                        <img
                            src="/images/erpika/kop-inspektorat.png"
                            alt="Kop Inspektorat Kabupaten Aceh Barat"
                            className="-mx-[6mm] mb-3 w-[calc(100%+12mm)] max-w-none"
                        />

                        <table className="w-full border-collapse">
                            <tbody className="align-top">
                                <tr>
                                    <td className="w-[22mm] py-0.5">Nomor</td>
                                    <td className="w-[4mm] py-0.5">:</td>
                                    <td className="w-[62mm] py-0.5">{rpp.nomor_rpp}</td>
                                    <td className="py-0.5 pl-2">Meulaboh, {rpp.tanggal}</td>
                                </tr>
                                <tr>
                                    <td className="py-0.5">Lampiran</td>
                                    <td className="py-0.5">:</td>
                                    <td className="py-0.5">1 (satu) Berkas</td>
                                    <td className="py-0.5 pl-2">Yang Terhormat</td>
                                </tr>
                                <tr>
                                    <td className="py-0.5">Hal</td>
                                    <td className="py-0.5">:</td>
                                    <td className="py-0.5 leading-snug">
                                        {halBaris1}
                                        <br />
                                        <span className="underline">{halSisa}.</span>
                                    </td>
                                    <td className="py-0.5 pl-2 leading-snug">
                                        <span className="font-bold">{rpp.tujuan}</span>
                                        <br />
                                        &nbsp;&nbsp;di -
                                        <br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="underline">Tempat</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <ol className="mt-5 ml-[10mm] list-decimal space-y-3 pl-5">
                            <li>{rpp.dasar}</li>
                            <li>
                                Berkaitan hal tersebut diatas, disampaikan kepada Saudara tentang Rencana Penugasan {rpp.sebutan} (terlampir), dan
                                untuk memenuhi hal tersebut di atas diminta kepada Saudara untuk segera membuat dan menyampaikan Surat Tugas (ST)
                                kepada kami, dengan mempedomani PERMENPAN-RB Nomor 19 Tahun 2009 tentang Pedoman Kendali Mutu Audit Aparat Pengawasan
                                Intern Pemerintah.
                            </li>
                            {rpp.dengan_penutup && <li>Demikian untuk dilaksanakan sebagaimana mestinya, terima kasih.</li>}
                        </ol>

                        <div className="mt-8 ml-auto w-[72mm] text-center leading-snug">
                            INSPEKTUR
                            <br />
                            KABUPATEN ACEH BARAT,
                            <div className="h-[22mm]" />
                            <div className="font-bold underline">{inspektur.nama.toUpperCase().replace(/\s+/g, ' ')}</div>
                            <div>NIP.{inspektur.nip_spasi}</div>
                        </div>
                    </div>
                )
            )}
        </AppLayout>
    );
}
