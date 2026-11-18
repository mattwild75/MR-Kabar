/**
 * Daftar usulan untuk kolom "Urusan / Unsur Pemerintahan" dan "Bidang Urusan /
 * Bidang Unsur" pada Data Umum.
 *
 * **Kedudukannya usulan, bukan ketetapan.** Kedua kolom tetap dapat diketik
 * bebas; daftar ini menyeragamkan ejaan antar-SKPK supaya kepala Form Cetak
 * tidak berbunyi berbeda-beda untuk urusan yang sama.
 *
 * Susunannya mengikuti klasifikasi Permendagri 90/2019 (dipakai SIPD dan
 * dokumen anggaran SKPK): Urusan Pemerintahan (kode 1–3) atau Unsur (kode
 * 4–8), lalu Bidang di bawahnya. Untuk SKPK kekhususan Aceh (UU 11/2006)
 * ditambahkan "Urusan Keistimewaan dan Kekhususan Aceh".
 *
 * Isian bawaan per SKPK disusun di server (app/Support/NomenklaturUrusanOpd.php)
 * dengan nama-nama yang sama persis dengan daftar ini.
 */

export interface KelompokUrusan {
    kelompok: string;
    bidang: string[];
}

export const URUSAN_PEMERINTAHAN: KelompokUrusan[] = [
    {
        kelompok: 'Urusan Pemerintahan Wajib yang Berkaitan dengan Pelayanan Dasar',
        bidang: [
            'Pendidikan',
            'Kesehatan',
            'Pekerjaan Umum dan Penataan Ruang',
            'Perumahan dan Kawasan Permukiman',
            'Ketenteraman dan Ketertiban Umum serta Pelindungan Masyarakat',
            'Sosial',
        ],
    },
    {
        kelompok: 'Urusan Pemerintahan Wajib yang Tidak Berkaitan dengan Pelayanan Dasar',
        bidang: [
            'Tenaga Kerja',
            'Pemberdayaan Perempuan dan Pelindungan Anak',
            'Pangan',
            'Pertanahan',
            'Lingkungan Hidup',
            'Administrasi Kependudukan dan Pencatatan Sipil',
            'Pemberdayaan Masyarakat dan Desa',
            'Pengendalian Penduduk dan Keluarga Berencana',
            'Perhubungan',
            'Komunikasi dan Informatika',
            'Koperasi, Usaha Kecil, dan Menengah',
            'Penanaman Modal',
            'Kepemudaan dan Olahraga',
            'Statistik',
            'Persandian',
            'Kebudayaan',
            'Perpustakaan',
            'Kearsipan',
        ],
    },
    {
        kelompok: 'Urusan Pemerintahan Pilihan',
        bidang: [
            'Kelautan dan Perikanan',
            'Pariwisata',
            'Pertanian',
            'Kehutanan',
            'Energi dan Sumber Daya Mineral',
            'Perdagangan',
            'Perindustrian',
            'Transmigrasi',
        ],
    },
    { kelompok: 'Unsur Pendukung Urusan Pemerintahan', bidang: ['Sekretariat Daerah', 'Sekretariat DPRK'] },
    {
        kelompok: 'Unsur Penunjang Urusan Pemerintahan',
        bidang: ['Perencanaan', 'Keuangan', 'Kepegawaian', 'Pendidikan dan Pelatihan', 'Penelitian dan Pengembangan'],
    },
    { kelompok: 'Unsur Pengawasan Urusan Pemerintahan', bidang: ['Inspektorat Daerah'] },
    { kelompok: 'Unsur Kewilayahan', bidang: ['Kecamatan'] },
    { kelompok: 'Unsur Pemerintahan Umum', bidang: ['Kesatuan Bangsa dan Politik'] },
    {
        kelompok: 'Urusan Keistimewaan dan Kekhususan Aceh',
        bidang: [
            'Syariat Islam',
            'Pendidikan Dayah',
            'Baitul Mal',
            'Majelis Adat Aceh',
            'Majelis Permusyawaratan Ulama',
            'Majelis Pendidikan Daerah',
            'Wilayatul Hisbah',
        ],
    },
];

/** Usulan untuk kolom "Urusan / Unsur Pemerintahan". */
export const DAFTAR_URUSAN: string[] = URUSAN_PEMERINTAHAN.map((k) => k.kelompok);

/**
 * Usulan untuk kolom "Bidang Urusan / Bidang Unsur", seluruh kelompok, tanpa
 * kembar. Sengaja tidak disaring menurut urusan yang sedang diisi: kolomnya
 * bebas diketik, dan penyaringan justru menyembunyikan usulan begitu ejaannya
 * sedikit berbeda.
 */
export const DAFTAR_SUB_URUSAN: string[] = [...new Set(URUSAN_PEMERINTAHAN.flatMap((k) => k.bidang))].sort((a, b) => a.localeCompare(b, 'id'));
