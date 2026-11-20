/** Bentuk data analisis pre-test/post-test dari AnalisisTesService::lengkap(). */
import type { Huruf } from '@/components/edukasi/bendera-isyarat';

export interface BarisNilai {
    id: number;
    nama: string;
    nip: string | null;
    bukan_asn: boolean;
    jabatan: string;
    opd_id: number | null;
    instansi: string;
    benar: number;
    dijawab: number;
    jumlah_soal: number;
    nilai: number;
    total_waktu_ms: number;
    waktu_benar_ms: number;
    per_bagian: Record<string, number>;
    pilihan: Record<string, Huruf>;
    waktu: Record<string, number>;
    soal_pertama: number | null;
    bergabung_pada: string | null;
    biodata_pada: string | null;
    dijawab_pada: Record<string, string | null>;
    jawaban_pertama: string | null;
    jawaban_terakhir: string | null;
    jumlah_keluar: number;
    pindah_perangkat: number;
    peringkat: number;
}

export interface Deskripsi {
    n: number;
    rata: number | null;
    median: number | null;
    sd: number | null;
    min: number | null;
    max: number | null;
}

export interface Butir {
    nomor: number;
    bagian: number;
    indikator: string;
    kunci: Huruf;
    benar: number;
    kesukaran: number | null;
    kategori_kesukaran: string | null;
    daya_beda: number | null;
    kategori_daya_beda: string | null;
    sebaran: Record<Huruf | 'kosong', number>;
    pengecoh_tidak_dipilih: Huruf[];
    rata_waktu_detik: number | null;
}

export interface Pasangan {
    nama: string;
    nip: string | null;
    jabatan: string;
    instansi: string;
    id_pre: number;
    id_post: number;
    pre: number;
    post: number;
    kenaikan: number;
    ngain: number | null;
    kategori: 'tinggi' | 'sedang' | 'rendah' | null;
    waktu_benar_post_ms: number;
    peringkat: number;
}

export interface UjiT {
    n: number;
    df: number;
    rata_selisih: number;
    sd_selisih: number;
    t: number | null;
    p: number | null;
    p_kurang_dari?: boolean;
    d: number | null;
    signifikan: boolean | null;
}

export interface Analisis {
    pre: { deskripsi: Deskripsi; peserta: BarisNilai[]; butir: Butir[] };
    post: { deskripsi: Deskripsi; peserta: BarisNilai[]; butir: Butir[] };
    pasangan: Pasangan[];
    peningkatan: {
        n: number;
        rata_kenaikan: number | null;
        rata_ngain: number | null;
        kategori_ngain: { tinggi: number; sedang: number; rendah: number };
        uji_t: UjiT | null;
    };
    bagian: { bagian: number; nama: string; pre: number | null; post: number | null; kategori_pre: string | null; kategori_post: string | null }[];
    skpk: { instansi: string; n_pre: number; n_post: number; rata_pre: number | null; rata_post: number | null; rata_kenaikan: number | null }[];
}

export interface SoalHasil {
    nomor: number;
    bagian: number;
    indikator: string;
    pertanyaan: string;
    pilihan: Record<Huruf, string>;
    kunci: Huruf;
}

export interface PelatihanHasil {
    id: number;
    nama: string;
    tanggal: string | null;
    tempat: string | null;
    sesi: { id: number; jenis: 'pre' | 'post'; status: string; mulai_pada: string | null; selesai_pada: string | null }[];
}

export function besarEfek(d: number | null): string {
    if (d === null) {
        return '-';
    }
    const a = Math.abs(d);

    return a >= 0.8 ? 'besar' : a >= 0.5 ? 'sedang' : a >= 0.2 ? 'kecil' : 'sangat kecil';
}

/** Kalimat simpulan uji-t yang bisa langsung dikutip. */
export function kalimatUjiT(a: Analisis): string {
    const t = a.peningkatan.uji_t;
    const pre = a.pre.deskripsi.rata;
    const post = a.post.deskripsi.rata;
    if (!t || t.t === null || pre === null || post === null) {
        return 'Uji-t berpasangan membutuhkan sedikitnya dua peserta yang mengikuti pre-test dan post-test, dengan nilai yang tidak seragam.';
    }
    const p = t.p_kurang_dari ? 'p < 0,0001' : `p = ${t.p?.toLocaleString('id-ID')}`;
    const arah = t.rata_selisih >= 0 ? 'naik' : 'turun';

    return `Rata-rata nilai peserta yang mengikuti kedua tes (n = ${t.n}) ${arah} ${Math.abs(t.rata_selisih).toLocaleString('id-ID')} poin. Uji-t berpasangan: t(${t.df}) = ${t.t.toLocaleString('id-ID')}, ${p}; ${
        t.signifikan ? 'perbedaannya signifikan pada taraf 5%' : 'perbedaannya belum signifikan pada taraf 5%'
    }, dengan ukuran efek dz = ${t.d?.toLocaleString('id-ID')} (${besarEfek(t.d)}).`;
}
