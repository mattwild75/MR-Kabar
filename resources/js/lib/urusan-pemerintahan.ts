/**
 * Daftar urusan pemerintahan untuk mengisi Data Umum.
 *
 * **Kedudukannya usulan, bukan ketetapan.** Kolom Nama Urusan dan Nama
 * Sub-Urusan tetap dapat diketik bebas — daftar ini hanya menghemat pengetikan
 * dan menyeragamkan ejaan antar-SKPK, supaya header Form Cetak tidak berbunyi
 * berbeda-beda untuk urusan yang sama.
 *
 * Dua tingkat keyakinan yang berbeda, dan itu disengaja:
 *
 * - `URUSAN` disalin kata per kata dari **Undang-Undang Nomor 23 Tahun 2014
 *   Pasal 12**, bagian yang berlapis teks sehingga dapat diperiksa ulang.
 *   Tiga puluh dua urusan, lengkap.
 * - `SUB_URUSAN` ditarik dari **Lampiran** UU yang sama, dan Lampiran itu
 *   berupa matriks tanpa garis tabel sehingga kolomnya bercampur saat dibaca
 *   mesin. Yang dimuat di sini hanya yang tertarik bersih; **beberapa urusan
 *   karena itu belum lengkap sub-urusannya**, dan yang ada pun perlu dicocokkan
 *   sebelum dipakai pada dokumen resmi.
 *
 * Untuk penyusunan RKA dan pelaporan lewat SIPD, nomenklatur yang dipakai
 * bukan UU 23/2014 melainkan **Permendagri 90/2019 sebagaimana dimutakhirkan
 * Kepmendagri 050-3708 Tahun 2020**. Bila berkas lampirannya tersedia, daftar
 * ini sebaiknya diganti dengan nomenklatur itu supaya isian Data Umum sama
 * bunyinya dengan dokumen anggaran yang dipegang SKPK.
 */

export interface KelompokUrusan {
    kelompok: string;
    urusan: { nama: string; sub: string[] }[];
}

export const URUSAN_PEMERINTAHAN: KelompokUrusan[] = [
    {
        kelompok: 'Urusan Wajib Berkaitan Pelayanan Dasar',
        urusan: [
            {
                nama: 'Pendidikan',
                sub: [
                    'Manajemen Pendidikan',
                    'Kurikulum',
                    'Akreditasi',
                    'Pendidik dan Tenaga Kependidikan',
                    'Perizinan Pendidikan',
                    'Bahasa dan Sastra',
                ],
            },
            {
                nama: 'Kesehatan',
                sub: [
                    'Upaya Kesehatan',
                    'Sumber Daya Manusia (SDM) Kesehatan',
                    'Sediaan Farmasi, Alat Kesehatan, dan Makanan Minuman',
                    'Pemberdayaan Masyarakat Bidang Kesehatan',
                ],
            },
            {
                nama: 'Pekerjaan Umum dan Penataan Ruang',
                sub: [
                    'Sumber Daya Air (SDA)',
                    'Air Minum',
                    'Persampahan',
                    'Air Limbah',
                    'Drainase',
                    'Permukiman',
                    'Bangunan Gedung',
                    'Penataan Bangunan dan Lingkungannya',
                    'Jalan',
                    'Jasa Konstruksi',
                    'Penataan Ruang',
                ],
            },
            {
                nama: 'Perumahan Rakyat dan Kawasan Permukiman',
                sub: ['Perumahan', 'Kawasan Permukiman', 'Prasarana, Sarana, dan Utilitas Umum (PSU)'],
            },
            {
                nama: 'Ketenteraman, Ketertiban Umum, dan Pelindungan Masyarakat',
                sub: ['Ketenteraman dan Ketertiban Umum', 'Bencana', 'Kebakaran'],
            },
            {
                nama: 'Sosial',
                sub: [
                    'Pemberdayaan Sosial',
                    'Penanganan Warga Negara Migran Korban Tindak Kekerasan',
                    'Rehabilitasi Sosial',
                    'Perlindungan dan Jaminan Sosial',
                    'Penanganan Bencana',
                    'Taman Makam Pahlawan',
                ],
            },
        ],
    },
    {
        kelompok: 'Urusan Wajib Tidak Berkaitan Pelayanan Dasar',
        urusan: [
            {
                nama: 'Tenaga Kerja',
                sub: [
                    'Pelatihan Kerja dan Produktivitas Tenaga Kerja',
                    'Penempatan Tenaga Kerja',
                    'Hubungan Industrial',
                    'Pengawasan Ketenagakerjaan',
                ],
            },
            {
                nama: 'Pemberdayaan Perempuan dan Pelindungan Anak',
                sub: [
                    'Kualitas Hidup Perempuan',
                    'Perlindungan Perempuan',
                    'Kualitas Keluarga',
                    'Sistem Data Gender dan Anak',
                    'Pemenuhan Hak Anak (PHA)',
                    'Perlindungan Khusus Anak',
                ],
            },
            { nama: 'Pangan', sub: ['Penanganan Kerawanan Pangan', 'Keamanan Pangan'] },
            { nama: 'Pertanahan', sub: ['Pengadaan Tanah', 'Ganti Kerugian dan Santunan Tanah', 'Tanah Ulayat'] },
            {
                nama: 'Lingkungan Hidup',
                sub: ['Kajian Lingkungan Hidup Strategis (KLHS)', 'Keanekaragaman Hayati (Kehati)', 'Pendidikan, Pelatihan, dan Penyuluhan'],
            },
            { nama: 'Administrasi Kependudukan dan Pencatatan Sipil', sub: ['Pendaftaran Penduduk', 'Pencatatan Sipil'] },
            { nama: 'Pemberdayaan Masyarakat dan Desa', sub: ['Penataan Desa', 'Lembaga Kemasyarakatan, Lembaga Adat'] },
            { nama: 'Pengendalian Penduduk dan Keluarga Berencana', sub: ['Pengendalian Penduduk', 'Keluarga Berencana (KB)', 'Keluarga Sejahtera'] },
            { nama: 'Perhubungan', sub: ['Lalu Lintas dan Angkutan Jalan (LLAJ)', 'Pelayaran', 'Penerbangan', 'Perkeretaapian'] },
            { nama: 'Komunikasi dan Informatika', sub: ['Informasi dan Komunikasi Publik', 'Aplikasi Informatika'] },
            {
                nama: 'Koperasi, Usaha Kecil, dan Menengah',
                sub: [
                    'Badan Hukum Koperasi',
                    'Izin Usaha Simpan Pinjam',
                    'Penilaian Kesehatan KSP/USP Koperasi',
                    'Pendidikan dan Latihan Perkoperasian',
                ],
            },
            {
                nama: 'Penanaman Modal',
                sub: [
                    'Pengembangan Iklim Penanaman Modal',
                    'Kerja Sama Penanaman Modal',
                    'Promosi Penanaman Modal',
                    'Pelayanan Penanaman Modal',
                    'Pengendalian Pelaksanaan Penanaman Modal',
                    'Data dan Sistem Informasi Penanaman Modal',
                ],
            },
            { nama: 'Kepemudaan dan Olah Raga', sub: ['Kepemudaan', 'Keolahragaan', 'Kepramukaan'] },
            { nama: 'Statistik', sub: ['Statistik Dasar', 'Statistik Sektoral'] },
            { nama: 'Persandian', sub: ['Persandian'] },
            { nama: 'Kebudayaan', sub: ['Kebudayaan', 'Perfilman', 'Kesenian Tradisional', 'Sejarah', 'Cagar Budaya', 'Permuseuman'] },
            { nama: 'Perpustakaan', sub: ['Pelestarian Koleksi', 'Sertifikasi Pustakawan dan Akreditasi Pendidikan'] },
            { nama: 'Kearsipan', sub: ['Pelindungan dan Penyelamatan Arsip', 'Akreditasi dan Sertifikasi', 'Formasi Arsiparis'] },
        ],
    },
    {
        kelompok: 'Urusan Pilihan',
        urusan: [
            { nama: 'Kelautan dan Perikanan', sub: ['Kelautan, Pesisir, dan Pulau-Pulau Kecil', 'Perikanan Tangkap'] },
            { nama: 'Pariwisata', sub: ['Destinasi Pariwisata'] },
            {
                nama: 'Pertanian',
                sub: [
                    'Sarana Pertanian',
                    'Prasarana Pertanian',
                    'Kesehatan Hewan dan Kesehatan Masyarakat Veteriner',
                    'Perizinan Usaha Pertanian',
                    'Karantina Pertanian',
                ],
            },
            { nama: 'Kehutanan', sub: ['Perencanaan Hutan', 'Konservasi Sumber Daya Alam Hayati dan Ekosistemnya'] },
            { nama: 'Energi dan Sumber Daya Mineral', sub: ['Geologi', 'Mineral dan Batubara', 'Minyak dan Gas Bumi', 'Ketenagalistrikan'] },
            {
                nama: 'Perdagangan',
                sub: ['Perizinan dan Pendaftaran Perusahaan', 'Stabilisasi Harga Barang Kebutuhan', 'Standardisasi dan Perlindungan Konsumen'],
            },
            { nama: 'Perindustrian', sub: ['Perencanaan Pembangunan Industri', 'Perizinan', 'Sistem Informasi Industri'] },
            { nama: 'Transmigrasi', sub: ['Perencanaan Kawasan Transmigrasi', 'Pembangunan Kawasan Transmigrasi'] },
        ],
    },
];

/** Nama urusan saja, untuk daftar usulan pada kolom Nama Urusan. */
export const DAFTAR_URUSAN: string[] = URUSAN_PEMERINTAHAN.flatMap((k) => k.urusan.map((u) => u.nama));

/**
 * Sub-urusan seluruh urusan, tanpa kembar. Sengaja tidak disaring menurut
 * urusan yang sedang dipilih: kolom urusannya bebas diketik, sehingga
 * penyaringan justru menyembunyikan usulan begitu ejaan urusannya sedikit
 * berbeda dari daftar.
 */
export const DAFTAR_SUB_URUSAN: string[] = [...new Set(URUSAN_PEMERINTAHAN.flatMap((k) => k.urusan.flatMap((u) => u.sub)))].sort((a, b) =>
    a.localeCompare(b, 'id'),
);
