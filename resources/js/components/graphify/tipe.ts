/** Tipe data dan bantuan bersama halaman Utilities > Graphify. */

export interface GNode {
    id: string;
    label: string;
    type: string;
    degree: number;
    community: number;
    desc?: string;
    file?: string;
    [k: string]: unknown;
}

export interface GLink {
    source: string;
    target: string;
    rel: string;
}

export interface Komunitas {
    id: number;
    nama: string;
    ukuran: number;
    jenis: Record<string, number>;
    teratas: string[];
}

export interface Temuan {
    judul: string;
    penjelasan: string;
    simpul: string[];
}

export interface Graf {
    nodes: GNode[];
    links: GLink[];
    communities: Komunitas[];
    temuan: Temuan[];
    jenis: Record<string, string>;
    meta: { dibangun: string; durasi_detik: number; simpul: number; relasi: number; komunitas: number };
}

/** Warna tetap per jenis simpul (terbaca di tema terang dan gelap). */
export const WARNA: Record<string, string> = {
    modul: '#e11d48',
    menu: '#f97316',
    izin: '#a8a29e',
    peran: '#78716c',
    rute: '#94a3b8',
    controller: '#2563eb',
    middleware: '#64748b',
    model: '#16a34a',
    tabel: '#0d9488',
    layanan: '#7c3aed',
    pendukung: '#a855f7',
    perintah: '#ca8a04',
    kelas: '#6b7280',
    halaman: '#0891b2',
    komponen: '#38bdf8',
    pustaka: '#9ca3af',
    dokumen: '#b45309',
    regulasi: '#dc2626',
    konsep: '#db2777',
};

export const warna = (type: string) => WARNA[type] ?? '#6b7280';

/** Himpunan jenis bawaan tiap prasetel filter. */
export const PRASETEL: Record<string, string[]> = {
    Ringkas: ['modul', 'menu', 'controller', 'model', 'tabel', 'layanan', 'pendukung', 'perintah', 'halaman', 'regulasi', 'konsep'],
    Semua: Object.keys(WARNA),
    'Arsitektur kode': ['controller', 'model', 'layanan', 'pendukung', 'perintah', 'kelas', 'middleware', 'halaman', 'komponen', 'pustaka'],
    'Basis data': ['model', 'tabel', 'controller', 'layanan'],
    'Menu & akses': ['modul', 'menu', 'izin', 'peran', 'rute', 'middleware'],
    Pengetahuan: ['regulasi', 'konsep', 'modul', 'menu', 'controller', 'tabel', 'dokumen'],
};

/** Hubungan keluar/masuk per simpul. */
export interface Indeks {
    byId: Map<string, GNode>;
    keluar: Map<string, GLink[]>;
    masuk: Map<string, GLink[]>;
}

export function bangunIndeks(g: Graf): Indeks {
    const byId = new Map(g.nodes.map((n) => [n.id, n]));
    const keluar = new Map<string, GLink[]>();
    const masuk = new Map<string, GLink[]>();
    for (const l of g.links) {
        (keluar.get(l.source) ?? keluar.set(l.source, []).get(l.source)!).push(l);
        (masuk.get(l.target) ?? masuk.set(l.target, []).get(l.target)!).push(l);
    }
    return { byId, keluar, masuk };
}

/** Tetangga dalam kedalaman tertentu (tanpa arah). */
export function tetangga(ix: Indeks, awal: string, kedalaman: number): Set<string> {
    const lihat = new Set([awal]);
    let lapis = [awal];
    for (let d = 0; d < kedalaman; d++) {
        const berikut: string[] = [];
        for (const id of lapis) {
            const lain = [...(ix.keluar.get(id) ?? []).map((l) => l.target), ...(ix.masuk.get(id) ?? []).map((l) => l.source)];
            for (const t of lain) {
                if (!lihat.has(t)) {
                    lihat.add(t);
                    berikut.push(t);
                }
            }
        }
        lapis = berikut;
    }
    return lihat;
}

export interface Langkah {
    id: string;
    rel?: string;
    maju?: boolean;
}

/** Jalur terpendek tanpa arah (BFS); `hindari` = jenis yang tidak boleh dilewati di tengah jalur. */
export function jalurTerpendek(ix: Indeks, dari: string, ke: string, hindari: string[] = []): Langkah[] | null {
    if (dari === ke) return [{ id: dari }];
    const asal = new Map<string, { dari: string; rel: string; maju: boolean }>();
    const lihat = new Set([dari]);
    let lapis = [dari];
    while (lapis.length) {
        const berikut: string[] = [];
        for (const id of lapis) {
            const langkah: [string, string, boolean][] = [
                ...(ix.keluar.get(id) ?? []).map((l) => [l.target, l.rel, true] as [string, string, boolean]),
                ...(ix.masuk.get(id) ?? []).map((l) => [l.source, l.rel, false] as [string, string, boolean]),
            ];
            for (const [t, rel, maju] of langkah) {
                if (lihat.has(t)) continue;
                const n = ix.byId.get(t);
                if (t !== ke && n && hindari.includes(n.type)) continue;
                lihat.add(t);
                asal.set(t, { dari: id, rel, maju });
                if (t === ke) {
                    const hasil: Langkah[] = [{ id: ke }];
                    let c = ke;
                    while (c !== dari) {
                        const a = asal.get(c)!;
                        hasil[0].rel = a.rel;
                        hasil[0].maju = a.maju;
                        hasil.unshift({ id: a.dari });
                        c = a.dari;
                    }
                    return hasil;
                }
                berikut.push(t);
            }
        }
        lapis = berikut;
    }
    return null;
}

/** Pencarian simpul berdasarkan label, id, berkas, dan uraian. */
export function cari(g: Graf, q: string, batas = 15): GNode[] {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return [];
    const skor = (n: GNode) => {
        const l = n.label.toLowerCase();
        if (l === s) return 0;
        if (l.startsWith(s)) return 1;
        if (l.includes(s)) return 2;
        if (n.id.toLowerCase().includes(s) || (n.file ?? '').toLowerCase().includes(s)) return 3;
        if ((n.desc ?? '').toLowerCase().includes(s)) return 4;
        return 9;
    };
    return g.nodes
        .map((n) => [skor(n), n] as const)
        .filter(([k]) => k < 9)
        .sort((a, b) => a[0] - b[0] || b[1].degree - a[1].degree)
        .slice(0, batas)
        .map(([, n]) => n);
}
