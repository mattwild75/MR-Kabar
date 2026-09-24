/**
 * Bagian bersama seluruh berkas cetak AREP (Surat Tugas & Kendali Mutu):
 * tipe data ternormalisasi (ArepData, cerminan App\Services\Arep\ArepData),
 * kop surat, dan blok tanda tangan Inspektur.
 */

export interface Orang {
    no?: number;
    nama: string;
    nip: string;
    nip_spasi: string;
    jabatan: string;
    pangkat?: string;
    golongan?: string;
    peran: string;
    role: string;
    hari_kantor?: number;
    hari_lapangan?: number;
}

export interface ArepData {
    penugasan_id: number;
    rpp: { id: number | null; nomor_rpp: string | null; tahun: number | null; tanggal_rpp: string };
    jenis: { nama: string | null; sebutan: string | null; kode: string | null; kata_kerja: string };
    nomor: { st: string; sp: string | null; kp: string | null; rpp: string | null };
    tanggal: { st: string; st_iso: string | null; surat: string };
    objek: string;
    obriks: string[];
    uraian: string | null;
    sifat: string | null;
    lokasi: string;
    jangka: {
        mulai: string;
        selesai: string;
        rentang: string;
        hari_kerja: number;
        hari_kerja_terbilang: string;
        tmt: string | null;
    };
    jumlah_laporan: number;
    laporan_kepada: string;
    pj: Orang;
    wpj: Orang;
    dalnis: Orang;
    kt: Orang;
    anggota: Orang[];
    tim: Orang[];
    inspektur: { nama: string; nip_spasi: string; pangkat: string; jabatan: string };
    dasar_hukum: string[];
    kop: { kabupaten: string; instansi: string; alamat: string; email: string; kota: string };
}

/** Kop Inspektorat — memakai gambar berkas asli bila ada, jika tidak teks. */
export function KopSurat({ kop, gambar = true }: { kop: ArepData['kop']; gambar?: boolean }) {
    if (gambar) {
        return (
            <img
                src="/images/erpika/kop-inspektorat.png"
                alt="Kop Inspektorat Kabupaten Aceh Barat"
                className="mx-auto w-full max-w-none"
            />
        );
    }
    return (
        <div className="border-b-2 border-black pb-1 text-center leading-tight">
            <div className="text-[14pt] font-bold">{kop.kabupaten}</div>
            <div className="text-[20pt] font-bold tracking-wide">{kop.instansi}</div>
            <div className="text-[9pt]">{kop.alamat}</div>
            <div className="text-[9pt]">{kop.email}</div>
            <div className="text-[11pt] font-bold">{kop.kota}</div>
        </div>
    );
}

/** Blok tanda tangan Inspektur, rata kanan. */
export function TtdInspektur({ d, tanggal }: { d: ArepData; tanggal?: string }) {
    return (
        <div className="mt-6 ml-auto w-[78mm] text-center leading-snug">
            <div>Meulaboh, {tanggal ?? d.tanggal.surat}</div>
            <div>Inspektur Kabupaten Aceh Barat,</div>
            <div className="h-[22mm]" />
            <div className="font-bold underline">{d.inspektur.nama}</div>
            {d.inspektur.pangkat && <div>{d.inspektur.pangkat}</div>}
            <div>NIP. {d.inspektur.nip_spasi}</div>
        </div>
    );
}
