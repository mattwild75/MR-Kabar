/** Tombol "Contoh" di samping kanan tiap lembar pratinjau Kendali Mutu:
 * membuka jendela berisi contoh pengisian formulir (penugasan rekaan),
 * petunjuk pengisian menurut lampiran Pedoman, dan rujukan daerah lain.
 * Data dari App\Support\Arep\KmContoh (endpoint /contoh/{no}). */
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type ArepData } from '@/pages/erpika/arep/forms/bagian';
import { FormulirKm, type KmMeta } from '@/pages/erpika/arep/forms/km';
import { type Spek } from '@/pages/erpika/arep/forms/spek';
import { BookOpenCheck, ExternalLink } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface Contoh {
    d: ArepData;
    spek: Spek | null;
    petunjuk: string[];
    catatan: string;
    sumber: [string, string][];
}

const MM = 96 / 25.4;

/** Lembar contoh diperkecil agar muat lebar kolom kiri jendela. */
function LembarContoh({ meta, c }: { meta: KmMeta; c: Contoh }) {
    const wadah = useRef<HTMLDivElement>(null);
    const [skala, setSkala] = useState(1);
    const lebar = (meta.orientasi === 'landscape' ? 297 : 210) * MM;
    useLayoutEffect(() => {
        const el = wadah.current;
        if (!el) return;
        const ukur = () => setSkala(Math.min(1, (el.clientWidth - 2) / lebar));
        ukur();
        const ro = new ResizeObserver(ukur);
        ro.observe(el);
        return () => ro.disconnect();
    }, [lebar]);

    return (
        <div ref={wadah} className="min-w-0">
            <div className="relative mx-auto shadow-sm ring-1 ring-black/10" style={{ zoom: skala, width: lebar }}>
                <section className={`km-lembar ${meta.orientasi} text-[11pt] leading-snug`}>
                    <FormulirKm d={c.d} meta={meta} spek={c.spek ?? undefined} />
                </section>
                <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none">
                    <span className="-rotate-[28deg] text-[110px] font-black tracking-[0.3em] text-red-600/10">CONTOH</span>
                </div>
            </div>
        </div>
    );
}

export function TombolContoh({ meta }: { meta: KmMeta }) {
    const [buka, setBuka] = useState(false);
    const [c, setC] = useState<Contoh | null>(null);
    const [galat, setGalat] = useState(false);

    useEffect(() => {
        if (!buka || c) return;
        let batal = false;
        setGalat(false);
        fetch(`/erpika/arep/kendali-mutu/contoh/${meta.no}`, { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
            .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
            .then((j: Contoh) => !batal && setC(j))
            .catch(() => !batal && setGalat(true));
        return () => {
            batal = true;
        };
    }, [buka, c, meta.no]);

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                className="bg-background shadow-sm"
                onClick={() => setBuka(true)}
                title={`Contoh pengisian ${meta.kode}`}
            >
                <BookOpenCheck className="mr-1 h-4 w-4" /> Contoh
            </Button>
            <Dialog open={buka} onOpenChange={setBuka}>
                <DialogContent className="flex h-[92vh] w-[96vw] max-w-[1500px] flex-col gap-3 sm:max-w-[1500px]">
                    <DialogHeader>
                        <DialogTitle>
                            Contoh Pengisian {meta.kode.replace('KM ', 'KMA ')} — {meta.nama}
                        </DialogTitle>
                        <DialogDescription>
                            Penugasan rekaan: Audit Operasional pada Dinas Kesehatan, 2–13 Maret 2026. Nama orang, nomor, dan angka hanya ilustrasi.
                        </DialogDescription>
                    </DialogHeader>
                    {galat && <p className="text-destructive text-sm">Contoh gagal dimuat. Tutup lalu coba lagi.</p>}
                    {!c && !galat && <p className="text-muted-foreground text-sm">Memuat contoh…</p>}
                    {c && (
                        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
                            <div className="bg-muted/40 min-h-0 overflow-auto rounded-md p-3">
                                <LembarContoh meta={meta} c={c} />
                            </div>
                            <aside className="min-h-0 space-y-4 overflow-auto pr-1 text-sm">
                                <section>
                                    <h3 className="mb-1 font-semibold">Petunjuk pengisian</h3>
                                    <ol className="list-decimal space-y-1 pl-5">
                                        {c.petunjuk.map((p, i) => (
                                            <li key={i}>{p}</li>
                                        ))}
                                    </ol>
                                </section>
                                <section>
                                    <h3 className="mb-1 font-semibold">Dasar bentuk</h3>
                                    <p className="text-muted-foreground">{c.catatan}</p>
                                </section>
                                <section>
                                    <h3 className="mb-1 font-semibold">Rujukan formulir daerah/instansi lain</h3>
                                    <ul className="space-y-1.5">
                                        {c.sumber.map(([nama, url]) => (
                                            <li key={url}>
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-start gap-1 text-blue-700 hover:underline dark:text-blue-300"
                                                >
                                                    <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                                    <span>{nama}</span>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            </aside>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
