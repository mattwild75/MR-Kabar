/** Penampil bentuk Formulir KMA dari spesifikasi App\Support\Arep\KmFormulir
 * (satu sumber dengan Excel). */
import { Fragment } from 'react';

export type SelSpek = string | { t: string; c?: number; r?: number; a?: 'l' | 'c' | 'r'; b?: boolean; h?: boolean };

export type BlokSpek =
    | { jenis: 'judul'; baris: string[]; kecil?: boolean; kiri?: boolean }
    | { jenis: 'info'; isi: (string | null)[][] }
    | { jenis: 'tabel'; kepala: SelSpek[][]; nomor?: boolean; baris?: SelSpek[][]; kosong?: number; kaki?: SelSpek[][]; lebar?: number[]; tanpaGaris?: boolean }
    | { jenis: 'teks'; isi: string[]; rata?: 'kiri' | 'tengah' | 'kanan' | 'rata' }
    | { jenis: 'ttd'; kolom: (string | null)[][]; tanggal?: string };

export interface Spek {
    blok: BlokSpek[];
}

const TITIK = '..............................';

/** Teks bergaris-baru → <br/>. */
function Multi({ t }: { t: string }) {
    const baris = t.split('\n');
    return (
        <>
            {baris.map((b, i) => (
                <Fragment key={i}>
                    {b}
                    {i < baris.length - 1 && <br />}
                </Fragment>
            ))}
        </>
    );
}

function sel(s: SelSpek) {
    return typeof s === 'string' ? { t: s } : s;
}

/** Jumlah kolom dari baris kepala pertama (termasuk colspan). */
function jumlahKolom(kepala: SelSpek[][]): number {
    return (kepala[0] ?? []).reduce<number>((n, s) => n + (sel(s).c ?? 1), 0);
}

function Tabel({ b }: { b: Extract<BlokSpek, { jenis: 'tabel' }> }) {
    const n = jumlahKolom(b.kepala);
    const garis = b.tanpaGaris ? '' : 'border border-black';
    const td = (s: SelSpek, key: number, kepala = false) => {
        const x = sel(s);
        const rata = x.a === 'c' || (kepala && !x.a) ? 'text-center' : x.a === 'r' ? 'text-right' : 'text-left';
        return (
            <td
                key={key}
                colSpan={x.c ?? 1}
                rowSpan={x.r ?? 1}
                className={`${garis} px-1 py-0.5 align-top ${rata} ${x.b || (kepala && !b.tanpaGaris) ? 'font-bold' : ''} ${kepala && !b.tanpaGaris ? 'align-middle bg-neutral-100' : ''}`}
            >
                <Multi t={x.t} />
            </td>
        );
    };
    return (
        <table className="mt-2 w-full border-collapse text-[9pt]" style={{ tableLayout: b.lebar ? 'fixed' : 'auto' }}>
            {b.lebar && (
                <colgroup>
                    {b.lebar.map((w, i) => (
                        <col key={i} style={{ width: `${w}%` }} />
                    ))}
                </colgroup>
            )}
            <thead>
                {b.kepala.map((r, i) => (
                    <tr key={i}>{r.map((s, j) => td(s, j, true))}</tr>
                ))}
                {b.nomor && (
                    <tr className="text-[8pt]">
                        {Array.from({ length: n }).map((_, i) => (
                            <td key={i} className={`${garis} text-center font-bold`}>
                                {i + 1}
                            </td>
                        ))}
                    </tr>
                )}
            </thead>
            <tbody>
                {(b.baris ?? []).map((r, i) => (
                    <tr key={i}>{r.map((s, j) => td(s, j))}</tr>
                ))}
                {Array.from({ length: b.kosong ?? 0 }).map((_, i) => (
                    <tr key={'k' + i}>
                        {Array.from({ length: n }).map((_, j) => (
                            <td key={j} className={`${garis} h-[20px]`}>
                                {j === 0 && !b.baris?.length ? i + 1 : ''}
                            </td>
                        ))}
                    </tr>
                ))}
                {(b.kaki ?? []).map((r, i) => (
                    <tr key={'f' + i}>{r.map((s, j) => td(s, j))}</tr>
                ))}
            </tbody>
        </table>
    );
}

function Info({ isi }: { isi: (string | null)[][] }) {
    const dua = isi.some((r) => r.length > 2);
    return (
        <table className="mt-2 w-full border-collapse">
            <tbody>
                {isi.map((r, i) => (
                    <tr key={i} className="align-top">
                        <td className={dua ? 'w-[20%]' : 'w-[30%]'}>{r[0]}</td>
                        <td className="w-[2%]">{r[0] ? ':' : ''}</td>
                        <td className={dua ? 'w-[38%] pr-2' : ''}>{r[0] ? <Multi t={r[1] ?? TITIK} /> : ''}</td>
                        {dua && (
                            <>
                                <td className="w-[18%]">{r[2]}</td>
                                <td className="w-[2%]">{r[2] ? ':' : ''}</td>
                                <td>{r[2] ? <Multi t={r[3] ?? TITIK} /> : ''}</td>
                            </>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export function FormulirSpek({ spek, kode }: { spek: Spek; kode: string }) {
    return (
        <div className="text-[10pt] leading-snug">
            <div className="flex items-start justify-between text-[9pt]">
                <div className="font-semibold">INSPEKTORAT KABUPATEN ACEH BARAT</div>
                <div className="text-right">Formulir {kode.replace('KM ', 'KMA ')}</div>
            </div>
            {spek.blok.map((b, i) => {
                switch (b.jenis) {
                    case 'judul':
                        return (
                            <div key={i} className={`mt-2 leading-tight ${b.kiri ? 'text-left' : 'text-center'}`}>
                                {b.baris.map((t, j) => (
                                    <div key={j} className={j === 0 ? (b.kecil ? 'font-bold' : 'text-[12pt] font-bold') : ''}>
                                        {t}
                                    </div>
                                ))}
                            </div>
                        );
                    case 'info':
                        return <Info key={i} isi={b.isi} />;
                    case 'tabel':
                        return <Tabel key={i} b={b} />;
                    case 'teks':
                        return (
                            <div
                                key={i}
                                className={`mt-2 space-y-1 ${b.rata === 'rata' ? 'text-justify' : b.rata === 'tengah' ? 'text-center' : b.rata === 'kanan' ? 'text-right' : ''}`}
                            >
                                {b.isi.map((t, j) => (
                                    <div key={j} className="whitespace-pre-wrap">
                                        {t}
                                    </div>
                                ))}
                            </div>
                        );
                    case 'ttd':
                        return (
                            <div key={i} className="mt-4">
                                {b.tanggal && <div className="text-right">{b.tanggal}</div>}
                                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${b.kolom.length}, minmax(0, 1fr))` }}>
                                    {b.kolom.map((k, j) => (
                                        <div key={j} className="text-center leading-snug">
                                            {k[0] && <div>{k[0]}</div>}
                                            <div>{k[1] || ' '}</div>
                                            <div className="h-[14mm]" />
                                            {k[1] ? (
                                                <>
                                                    <div className="font-bold underline">{k[2] ?? '(..............................)'}</div>
                                                    {k[2] && <div>{k[3] ? `NIP. ${k[3]}` : 'NIP. ..............'}</div>}
                                                </>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                }
            })}
        </div>
    );
}
