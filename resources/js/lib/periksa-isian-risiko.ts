import {
    KATEGORI_WAJIB_CELAH,
    PENYEBAB_EKSTERNAL_KATEGORI,
    PENYEBAB_INTERNAL_KATEGORI,
    RESPON_RISIKO_KATEGORI,
    ekstrakKategoriKontrol,
} from '@/lib/irs-reference-data';

/**
 * Pemeriksaan isian wajib Form Input Risiko (I_b IRS Pemda, II_b IRS PD,
 * III_b IRO PD) SEBELUM disimpan. Server hanya mewajibkan URAIAN RISIKO
 * (lihat *Controller::validated()), sehingga baris bisa tersimpan setengah
 * jadi; daftar ini menahan tombol Simpan dan menyebut satu per satu apa yang
 * belum diisi/dipilih, dikelompokkan per bagian formulir (1–4).
 *
 * Atribut wajib mengikuti Perdep PPKD 4/2019 (pemilik, penyebab, sumber,
 * C/UC, dampak, penerima dampak) ditambah alur penilaian MR Kabar: Existing
 * Control Ya/Tidak, nilai risiko dari tabel kriteria, titik Inheren, RTP
 * ber-AAMSA, penanggung jawab, waktu, dan nilai risiko Target.
 */

export interface IsianKurang {
    /** id elemen tujuan gulir (field atau bagian formulir). */
    target: string;
    /** nomor bagian formulir 1–4, dipakai sebagai cadangan tujuan gulir. */
    bagian: number;
    pesan: string;
}

export interface OpsiPeriksa {
    /** Kolom rujukan konteks: SASARAN RPJMD / SASARAN RENSTRA / KEGIATAN PD. */
    kolomKonteks: string;
    labelKonteks: string;
    /** true untuk III_b IRO PD (kolom TAHAP). */
    denganTahap?: boolean;
    existingControlStatus: 'ya' | 'tidak' | null;
}

const kosong = (v: string | undefined | null) => {
    const t = (v ?? '').trim();
    return t === '' || t === '-';
};

// Pisah "Kat (uraian); Kat2" per titik-koma di tingkat teratas (titik-koma di
// dalam kurung uraian tidak memecah), sama dengan MultiCategoryTextarea.
function segmenAtas(teks: string): string[] {
    const hasil: string[] = [];
    let kedalaman = 0;
    let kini = '';
    for (const ch of teks) {
        if (ch === '(') kedalaman++;
        if (ch === ')') kedalaman--;
        if (ch === ';' && kedalaman === 0) {
            hasil.push(kini.trim());
            kini = '';
            continue;
        }
        kini += ch;
    }
    if (kini.trim()) hasil.push(kini.trim());
    return hasil;
}

// Nama kategori sebuah segmen: "Method - Int (uraian)" -> "Method".
const namaKategori = (segmen: string) =>
    segmen
        .replace(/\(.*$/s, '')
        .trim()
        .replace(/\s+-\s+(Int|Eks)$/, '');

/** Kategori dari daftar yang dicentang; `tanpaUraian` = yang uraiannya masih kosong. */
function bacaKategori(teks: string, daftar: readonly string[]) {
    const dikenal = segmenAtas(teks).filter((s) => daftar.includes(namaKategori(s)));
    return {
        ada: dikenal.length > 0,
        tanpaUraian: dikenal.filter((s) => !/\(\s*\S/s.test(s)).map(namaKategori),
    };
}

export function periksaIsianRisiko(data: Record<string, string>, opsi: OpsiPeriksa): IsianKurang[] {
    const kurang: IsianKurang[] = [];
    const tambah = (target: string, bagian: number, pesan: string) => kurang.push({ target, bagian, pesan });
    const wajib = (field: string, bagian: number, pesan: string) => {
        if (kosong(data[field])) tambah(field, bagian, pesan);
    };

    // ── 1. Identitas Risiko ──
    wajib(opsi.kolomKonteks, 1, `${opsi.labelKonteks} belum dipilih.`);
    wajib('URAIAN RISIKO', 1, 'Uraian Risiko belum diisi.');
    wajib('TAHUN DINILAI RISIKO', 1, 'Tahun Dinilai Risiko belum diisi.');
    wajib('JENIS RISIKO', 1, 'Jenis Risiko belum dipilih.');
    wajib('ENTITAS PD YANG MENILAI', 1, 'Entitas PD yang Menilai belum dipilih.');
    if (opsi.denganTahap) wajib('TAHAP', 1, 'Tahap belum dipilih.');
    wajib('PEMILIK RISIKO', 1, 'Pemilik Risiko belum diisi.');

    // ── 2. Penyebab dan Dampak ──
    if (kosong(data['URAIAN PENYEBAB RISIKO'])) {
        tambah('URAIAN PENYEBAB RISIKO', 2, 'Penyebab risiko belum dipilih (centang minimal satu kategori 7M+1E atau PESTLE).');
    } else {
        const penyebab = bacaKategori(data['URAIAN PENYEBAB RISIKO'], [...PENYEBAB_INTERNAL_KATEGORI, ...PENYEBAB_EKSTERNAL_KATEGORI]);
        if (!penyebab.ada) {
            tambah('URAIAN PENYEBAB RISIKO', 2, 'Penyebab risiko belum dikategorikan (centang minimal satu kategori 7M+1E atau PESTLE).');
        }
        for (const k of penyebab.tanpaUraian) {
            tambah('URAIAN PENYEBAB RISIKO', 2, `Uraian penyebab untuk kategori ${k} belum diisi.`);
        }
    }
    wajib('C / UC', 2, 'C / UC (dapat dikendalikan atau tidak) belum dipilih.');
    wajib('URAIAN DAMPAK RISIKO', 2, 'Uraian Dampak Risiko belum diisi.');
    wajib('PIHAK YANG TERKENA DAMPAK RISIKO', 2, 'Pihak yang Terkena Dampak Risiko belum diisi.');

    // ── 3. Pengendalian yang Ada dan nilai risiko ──
    const status = opsi.existingControlStatus;
    if (status === null) {
        tambah('bagian-form-3', 3, 'Belum dipilih apakah risiko sudah memiliki Pengendalian yang Sudah Ada (Ya/Tidak).');
    } else if (status === 'ya') {
        wajib('URAIAN PENGENDALIAN YANG SUDAH ADA', 3, 'Uraian Pengendalian yang Sudah Ada belum diisi.');
        const kategori = ekstrakKategoriKontrol(data['KATEGORI EXISTING CONTROL']);
        if (!kategori) {
            tambah('KATEGORI EXISTING CONTROL', 3, 'Kategori Existing Control (TE/KE/CE/E) belum dipilih.');
        } else if ((KATEGORI_WAJIB_CELAH as readonly string[]).includes(kategori)) {
            wajib('CELAH PENGENDALIAN', 3, `Celah Pengendalian wajib diisi karena kategori pengendalian ${kategori}.`);
        }
        if (kosong(data['SKALA KEMUNGKINAN']))
            tambah('bagian-form-3', 3, 'Kemungkinan (Residual/Current) belum dipilih dari tabel Kriteria Kemungkinan.');
        if (kosong(data['SKALA DAMPAK'])) tambah('bagian-form-3', 3, 'Dampak (Residual/Current) belum dipilih dari tabel Kriteria Dampak.');
        if (kosong(data['SKALA KEMUNGKINAN INHEREN']) || kosong(data['SKALA DAMPAK INHEREN'])) {
            tambah('bagian-form-3', 3, 'Nilai risiko Inheren belum ditentukan — tentukan titik Inheren lewat Isi Nilai Risiko.');
        }
    } else {
        if (kosong(data['SKALA KEMUNGKINAN INHEREN'])) tambah('bagian-form-3', 3, 'Kemungkinan belum dipilih dari tabel Kriteria Kemungkinan.');
        if (kosong(data['SKALA DAMPAK INHEREN'])) tambah('bagian-form-3', 3, 'Dampak belum dipilih dari tabel Kriteria Dampak.');
    }

    // ── 4. Rencana Tindak Pengendalian dan Target ──
    const rtp = data['RENCANA TINDAK PENGENDALIAN'] ?? '';
    if (kosong(rtp)) {
        tambah('RENCANA TINDAK PENGENDALIAN', 4, 'Rencana Tindak Pengendalian belum diisi (pilih minimal satu respon AAMSA).');
    } else {
        const respon = bacaKategori(rtp, RESPON_RISIKO_KATEGORI);
        if (!respon.ada) tambah('RENCANA TINDAK PENGENDALIAN', 4, 'Respon risiko AAMSA pada Rencana Tindak Pengendalian belum dipilih.');
        for (const k of respon.tanpaUraian) {
            tambah('RENCANA TINDAK PENGENDALIAN', 4, `Uraian rencana tindak untuk respon ${k} belum diisi.`);
        }
    }
    wajib('UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN', 4, 'Unit/OPD Penanggung Jawab Pengendalian belum dipilih.');
    wajib('PENANGGUNG JAWAB PENGENDALIAN', 4, 'Penanggung Jawab Pengendalian belum diisi.');
    wajib('TRIWULAN', 4, 'Triwulan target penyelesaian belum dipilih.');
    wajib('TAHUN TARGET PENYELESAIAN', 4, 'Tahun Target Penyelesaian belum diisi.');

    const targetLengkap = !kosong(data['SKALA DAMPAK TARGET']) && !kosong(data['SKALA KEMUNGKINAN TARGET']);
    if (!targetLengkap && !ekstrakKategoriKontrol(data['KATEGORI PROYEKSI RTP'])) {
        tambah(
            'bagian-skala-target',
            4,
            'Nilai risiko Target belum ditentukan — pilih Kategori Proyeksi Efektivitas RTP, atau tentukan titik Target lewat Isi Nilai Risiko.',
        );
    }

    return kurang;
}
