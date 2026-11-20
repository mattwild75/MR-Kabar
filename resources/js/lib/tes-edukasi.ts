/**
 * Tipe data dan pembantu bersama pre-test/post-test langsung (/edukasi/tes,
 * layar tayang, pantau, kelola, hasil).
 */
import type { Huruf } from '@/components/edukasi/bendera-isyarat';

export interface StatusSesi {
    v: number;
    status: 'draf' | 'lobi' | 'berjalan' | 'selesai';
    soal: number | null;
    terbuka: boolean;
    total: number;
}

export interface SoalTes {
    nomor: number;
    bagian: number;
    nama_bagian?: string;
    indikator: string;
    pertanyaan: string;
    pilihan: Record<Huruf, string>;
    kunci: Huruf;
    pembahasan?: string | null;
}

export interface PesertaLangsung {
    id: number;
    nama: string | null;
    nip: string | null;
    bukan_asn: boolean;
    jabatan: string | null;
    instansi: string | null;
    status:
        | 'dikeluarkan'
        | 'mengisi_biodata'
        | 'selesai'
        | 'terputus'
        | 'keluar_halaman'
        | 'lobi'
        | 'sudah_menjawab'
        | 'mengerjakan'
        | 'tidak_menjawab';
    label: string;
    sudah_menjawab: boolean;
    pilihan: Huruf | null;
    benar: number;
    dijawab: number;
    nilai: number | null;
    detik_lalu: number | null;
    jumlah_keluar: number;
    pindah_perangkat: number;
    bergabung_pada: string | null;
    biodata_pada: string | null;
    jawaban_terakhir: string | null;
}

export interface BarisPeringkat {
    id: number;
    peringkat: number;
    nama: string;
    instansi: string;
    nilai: number;
    benar: number;
    total_detik: number;
    waktu_benar_ms: number;
}

export interface StatistikLangsung {
    status: StatusSesi;
    sesi: { tampilkan_jawaban: boolean; soal_dibuka_ms: number | null };
    jam_server_ms: number;
    ringkas: {
        bergabung: number;
        mengisi_biodata: number;
        aktif: number;
        terputus: number;
        keluar_halaman: number;
        dikeluarkan: number;
        sudah_menjawab: number;
    };
    peserta: PesertaLangsung[];
    soal_aktif: { nomor: number; menjawab: number; sebaran: Record<Huruf, number>; kunci: Huruf | null; persen_benar: number | null } | null;
    peringkat: BarisPeringkat[];
}

export const NAMA_BAGIAN: Record<number, string> = {
    1: 'Mengenal Laut',
    2: 'Awak Kapal',
    3: 'Lima Pelampung',
    4: 'Membaca Peta',
    5: 'Membunyikan Lonceng',
};

/** Token CSRF dari kuki XSRF-TOKEN (pola yang sama dengan session-timeout-warning). */
export function bacaXsrf(): string {
    const m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);

    return m ? decodeURIComponent(m[1]) : '';
}

export async function kirimJson<T = unknown>(
    url: string,
    data: Record<string, unknown> = {},
    keepalive = false,
): Promise<{ ok: boolean; status: number; data: T }> {
    const r = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        keepalive,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': bacaXsrf(),
        },
        body: JSON.stringify(data),
    });
    let isi: unknown = null;
    try {
        isi = await r.json();
    } catch {
        isi = null;
    }

    return { ok: r.ok, status: r.status, data: isi as T };
}

export async function ambilJson<T = unknown>(url: string): Promise<T> {
    const r = await fetch(url, {
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    });
    if (!r.ok) {
        throw new Error(String(r.status));
    }

    return (await r.json()) as T;
}

export function kategoriPaham(persen: number | null | undefined): { label: string; kelas: string } | null {
    if (persen === null || persen === undefined) {
        return null;
    }
    if (persen >= 75) {
        return { label: 'Sudah paham', kelas: 'bg-emerald-600 text-white' };
    }
    if (persen >= 50) {
        return { label: 'Cukup', kelas: 'bg-amber-500 text-black' };
    }

    return { label: 'Perlu diperkuat', kelas: 'bg-rose-600 text-white' };
}

export function formatAngka(n: number | null | undefined, digit = 1): string {
    if (n === null || n === undefined || Number.isNaN(n)) {
        return '-';
    }

    return n.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: digit });
}

export function formatDetik(ms: number): string {
    const detik = Math.max(0, Math.floor(ms / 1000));

    return `${Math.floor(detik / 60)}:${String(detik % 60).padStart(2, '0')}`;
}

/** "21 Nov 2026, 17.44.10" (WIB, mengikuti zona waktu perangkat). */
export function formatTanggalJam(iso: string | null | undefined): string {
    if (!iso) {
        return '-';
    }
    const d = new Date(iso);

    return `${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
}

/** "17.44.10". */
export function formatJam(iso: string | null | undefined): string {
    return iso ? new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-';
}

/** Rentang mengisi: "21 Nov 2026, 17.44.10 - 17.52.31" (tanggal ditulis sekali bila sama). */
export function rentangMengisi(mulai: string | null | undefined, selesai: string | null | undefined): string {
    if (!mulai) {
        return '-';
    }
    if (!selesai || selesai === mulai) {
        return formatTanggalJam(mulai);
    }
    const a = new Date(mulai);
    const b = new Date(selesai);

    return a.toDateString() === b.toDateString()
        ? `${formatTanggalJam(mulai)} - ${formatJam(selesai)}`
        : `${formatTanggalJam(mulai)} - ${formatTanggalJam(selesai)}`;
}

/** Milidetik menjadi detik bertiga desimal: 41237 -> "41,237 dtk". Penentu peringkat bila nilai sama. */
export function formatMilidetik(ms: number | null | undefined): string {
    if (ms === null || ms === undefined) {
        return '-';
    }

    return `${(ms / 1000).toLocaleString('id-ID', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} dtk`;
}
