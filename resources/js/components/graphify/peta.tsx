/** Peta interaktif Graphify (force-graph di atas canvas): geser, perbesar,
 * klik simpul untuk rinciannya; simpul terpilih dan tetangganya disorot. */
import { type GLink, type GNode, warna } from '@/components/graphify/tipe';
import ForceGraph from 'force-graph';
import { useEffect, useRef } from 'react';

type SimpulPeta = GNode & { x?: number; y?: number };
type TautanPeta = { source: string | SimpulPeta; target: string | SimpulPeta; rel: string };

interface Props {
    nodes: GNode[];
    links: GLink[];
    terpilih: string | null;
    sorot: Set<string>;
    tampilLabel: boolean;
    /** Naikkan angka ini untuk memusatkan kamera ke simpul terpilih. */
    fokus: number;
    onPilih: (id: string | null) => void;
}

const idDari = (x: string | SimpulPeta) => (typeof x === 'string' ? x : x.id);

export function PetaGraf({ nodes, links, terpilih, sorot, tampilLabel, fokus, onPilih }: Props) {
    const wadah = useRef<HTMLDivElement>(null);
    const fg = useRef<ForceGraph<SimpulPeta, TautanPeta> | null>(null);
    const posisi = useRef(new Map<string, SimpulPeta>());
    const kunciData = useRef('');
    const keadaan = useRef({ terpilih, sorot, tampilLabel, hover: null as string | null, onPilih });
    keadaan.current = { ...keadaan.current, terpilih, sorot, tampilLabel, onPilih };

    // Buat instans sekali.
    useEffect(() => {
        const el = wadah.current;
        if (!el) return;
        const gelap = () => document.documentElement.classList.contains('dark');
        const g = new ForceGraph<SimpulPeta, TautanPeta>(el)
            .backgroundColor('rgba(0,0,0,0)')
            .nodeId('id')
            .nodeRelSize(3)
            .nodeVal((n) => 1 + Math.sqrt(n.degree))
            .nodeCanvasObject((n, ctx, skala) => {
                const k = keadaan.current;
                const r = 3 * Math.sqrt(1 + Math.sqrt(n.degree));
                const pilih = n.id === k.terpilih;
                const redup = k.sorot.size > 0 && !k.sorot.has(n.id);
                ctx.globalAlpha = redup ? 0.15 : 1;
                ctx.beginPath();
                ctx.arc(n.x ?? 0, n.y ?? 0, r, 0, 2 * Math.PI);
                ctx.fillStyle = warna(n.type);
                ctx.fill();
                if (pilih || n.id === k.hover) {
                    ctx.lineWidth = 2 / skala;
                    ctx.strokeStyle = gelap() ? '#fff' : '#111';
                    ctx.stroke();
                }
                const labelTampil =
                    pilih ||
                    n.id === k.hover ||
                    (k.tampilLabel && !redup && (skala > 1.8 || n.degree > 30 || (k.sorot.size > 0 && k.sorot.has(n.id))));
                if (labelTampil) {
                    const ukuran = Math.max(10 / skala, 1.5);
                    ctx.font = `${pilih ? 'bold ' : ''}${ukuran}px ui-sans-serif, system-ui, sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillStyle = gelap() ? '#e5e7eb' : '#1f2937';
                    ctx.fillText(n.label.length > 42 ? n.label.slice(0, 40) + '…' : n.label, n.x ?? 0, (n.y ?? 0) + r + 1);
                }
                ctx.globalAlpha = 1;
            })
            .nodePointerAreaPaint((n, color, ctx) => {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(n.x ?? 0, n.y ?? 0, 3 * Math.sqrt(1 + Math.sqrt(n.degree)) + 2, 0, 2 * Math.PI);
                ctx.fill();
            })
            .linkColor((l) => {
                const k = keadaan.current;
                const a = idDari(l.source);
                const b = idDari(l.target);
                if (k.terpilih && (a === k.terpilih || b === k.terpilih)) return gelap() ? 'rgba(250,204,21,0.9)' : 'rgba(202,138,4,0.9)';
                if (k.sorot.size > 0 && !(k.sorot.has(a) && k.sorot.has(b))) return 'rgba(148,163,184,0.05)';
                return gelap() ? 'rgba(148,163,184,0.22)' : 'rgba(100,116,139,0.25)';
            })
            .linkWidth((l) =>
                keadaan.current.terpilih && (idDari(l.source) === keadaan.current.terpilih || idDari(l.target) === keadaan.current.terpilih)
                    ? 1.6
                    : 0.5,
            )
            .linkDirectionalArrowLength((l) =>
                keadaan.current.terpilih && (idDari(l.source) === keadaan.current.terpilih || idDari(l.target) === keadaan.current.terpilih) ? 4 : 0,
            )
            .linkDirectionalArrowRelPos(1)
            .linkLabel((l) => l.rel)
            .nodeLabel((n) => `${n.label} (${n.type})`)
            .onNodeHover((n) => {
                keadaan.current.hover = n?.id ?? null;
                el.style.cursor = n ? 'pointer' : 'default';
            })
            .onNodeClick((n) => keadaan.current.onPilih(n.id))
            .onBackgroundClick(() => keadaan.current.onPilih(null))
            .autoPauseRedraw(false)
            .warmupTicks(40)
            .cooldownTicks(300);
        g.d3Force('charge')?.strength?.(-45);
        fg.current = g;

        const ukur = () => g.width(el.clientWidth).height(el.clientHeight);
        ukur();
        const ro = new ResizeObserver(ukur);
        ro.observe(el);
        let pertama = true;
        g.onEngineStop(() => {
            if (pertama) {
                pertama = false;
                g.zoomToFit(600, 40);
            }
        });
        return () => {
            ro.disconnect();
            g._destructor();
            fg.current = null;
        };
    }, []);

    // Data berubah → pakai ulang objek lama agar posisi tidak meloncat.
    useEffect(() => {
        const g = fg.current;
        if (!g) return;
        // Susunan sama (mis. hanya ganti pilihan) → jangan panaskan ulang simulasi.
        const kunci = nodes.length + ':' + links.length + ':' + nodes.map((n) => n.id).join('|');
        if (kunci === kunciData.current) return;
        kunciData.current = kunci;
        const lama = posisi.current;
        const baru = new Map<string, SimpulPeta>();
        const simpul = nodes.map((n) => {
            const o = lama.get(n.id);
            const s = o ? Object.assign(o, n) : ({ ...n } as SimpulPeta);
            baru.set(n.id, s);
            return s;
        });
        posisi.current = baru;
        g.graphData({ nodes: simpul, links: links.map((l) => ({ source: l.source, target: l.target, rel: l.rel })) });
    }, [nodes, links]);

    // Pusatkan kamera ke simpul terpilih.
    useEffect(() => {
        const g = fg.current;
        if (!g || !terpilih) return;
        // Beri waktu simulasi menempatkan simpul (bila baru ditambahkan), lalu
        // berurutan: pusatkan dulu, baru perbesar — dua transisi serentak saling menimpa.
        const t1 = setTimeout(() => {
            const n = posisi.current.get(terpilih);
            if (n && n.x !== undefined && n.y !== undefined) g.centerAt(n.x, n.y, 500);
        }, 250);
        const t2 = setTimeout(() => {
            g.zoom(Math.max(g.zoom(), 2.2), 500);
        }, 800);
        const t3 = setTimeout(() => {
            const n = posisi.current.get(terpilih);
            if (n && n.x !== undefined && n.y !== undefined) g.centerAt(n.x, n.y, 300);
        }, 1350);
        return () => [t1, t2, t3].forEach(clearTimeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fokus]);

    return <div ref={wadah} className="h-full w-full" />;
}
