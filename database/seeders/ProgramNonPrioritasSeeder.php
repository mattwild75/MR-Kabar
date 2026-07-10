<?php

namespace Database\Seeders;

use App\Models\KrsPemda;
use Illuminate\Database\Seeder;

/**
 * Mengisi program NON-PRIORITAS ke 1a (tbl_krs_pemda) dari Tabel 4.1
 * RPJMD (Program Perangkat Daerah). Aturan (sesuai arahan): program di Tabel
 * 4.1 yang MENURUN dari Sasaran = prioritas (sudah terisi di 1a lewat Tabel
 * 3.5); yang TIDAK menurun dari Sasaran = NON-PRIORITAS → ditambahkan di sini
 * dengan SASARAN RPJMD kosong (menggantung, is_prioritas=false).
 *
 * AMAN & IDEMPOTEN:
 * - Tidak menimpa 115 baris prioritas eksisting (hanya menambah).
 * - addNonPrioritas() melewati program yang namanya SUDAH ADA sebagai program
 *   prioritas di 1a (dicek ke daftar existing) — supaya tidak menduplikat.
 * - Melewati program non-prioritas yang sudah pernah di-seed (dedup by
 *   PROGRAM PRIORITAS + OPD) — jadi seeder boleh dijalankan berulang.
 *
 * DIISI BERTAHAP per-OPD (diverifikasi terhadap Tabel 4.1 & data eksisting).
 * Batch saat ini: lihat run().
 */
class ProgramNonPrioritasSeeder extends Seeder
{
    /** Program prioritas eksisting (lower-trim) — acuan "jangan duplikat". */
    private array $prioritasSet = [];

    public function run(): void
    {
        // Snapshot program prioritas yang SUDAH ADA (punya Sasaran RPJMD terisi).
        $this->prioritasSet = KrsPemda::all()
            ->filter(fn ($r) => $this->isPrioritasRow($r))
            ->map(fn ($r) => $this->norm((string) $r->{'PROGRAM PRIORITAS'}))
            ->filter()
            ->flip()
            ->all();

        // ============ BATCH 1: Pendidikan & Kesehatan (Tabel 4.1 hal. 1–6) ============
        // Program yang TIDAK ada di 3.5 (bukan prioritas) untuk OPD terkait.
        // Indikator (IK/Baseline/Target/Satuan Program) diambil dari Tabel 4.1.
        // Beberapa IK bernilai jamak (>1 indikator per program) → satu nilai
        // per baris (dipisah "\n"), berpasangan dengan Baseline/Target/Satuan.

        // Sekretariat Majelis Pendidikan Daerah
        $this->addNonPrioritas('Program Penyelenggaraan Majelis Pendidikan Aceh', 'Sekretariat Majelis Pendidikan Daerah', [
            'ik' => "Persentase SD yang Menerapkan Muatan Lokal (Bahasa Aceh)\nPersentase SMP yang Menerapkan Muatan Lokal (Bahasa Aceh)",
            'baseline' => "N/A\nN/A",
            'target' => "82\n82",
            'satuan' => "Persen\nPersen",
        ]);

        // Dinas Pendidikan dan Kebudayaan
        $this->addNonPrioritas('Program Pengembangan Kurikulum', 'Dinas Pendidikan dan Kebudayaan', [
            'ik' => 'Persentase Satuan Pendidikan yang Mengembangkan Kurikulum Muatan Lokal',
            'baseline' => 'N/A', 'target' => '70', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Pembinaan Sejarah', 'Dinas Pendidikan dan Kebudayaan', [
            'ik' => 'Tingkat Partisipasi Masyarakat Terhadap Tinjauan Sejarah Lokal',
            'baseline' => 'N/A', 'target' => '75', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Pelestarian dan Pengelolaan Cagar Budaya', 'Dinas Pendidikan dan Kebudayaan', [
            'ik' => 'Persentase Warisan Budaya yang dilestarikan',
            'baseline' => 'N/A', 'target' => '75', 'satuan' => 'Persen',
        ]);

        // Dinas Kesehatan
        $this->addNonPrioritas('Program Peningkatan Kapasitas Sumber Daya Manusia Kesehatan', 'Dinas Kesehatan', [
            'ik' => 'Persentase Peningkatan Kompetensi SDM Bidang Kesehatan',
            'baseline' => '55', 'target' => '85', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Sediaan Farmasi, Alat Kesehatan dan Makanan Minuman', 'Dinas Kesehatan', [
            'ik' => 'Persentase Cakupan Sediaan Farmasi, Alat Kesehatan dan Makanan Minuman',
            'baseline' => '70,00', 'target' => '95', 'satuan' => 'Persen',
        ]);

        // ============ BATCH 2: PU & Penataan Ruang + Perumahan (Tabel 4.1 hal. 7–11) ============

        // Dinas Pekerjaan Umum dan Penataan Ruang
        $this->addNonPrioritas('Program Penataan Bangunan Gedung', 'Dinas Pekerjaan Umum dan Penataan Ruang', [
            'ik' => "Persentase Gedung Pemerintah yang Dapat Berfungsi\nPersentase Bangunan yang Memiliki PBG Per Satuan Bangunan",
            'baseline' => "95,00\n0,0219",
            'target' => "97,00\n0,035",
            'satuan' => "Persen\nRasio",
        ]);
        $this->addNonPrioritas('Program Penataan Bangunan dan Lingkungannya', 'Dinas Pekerjaan Umum dan Penataan Ruang', [
            'ik' => 'Ruang Publik yang Berubah Peruntukannya',
            'baseline' => '0', 'target' => '0', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Penyelenggaraan Penataan Ruang', 'Dinas Pekerjaan Umum dan Penataan Ruang', [
            'ik' => 'Ketaatan Terhadap Regulasi Rencana Tata Ruang',
            'baseline' => 'N/A', 'target' => '87,00', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Pengembangan Jasa Konstruksi', 'Dinas Pekerjaan Umum dan Penataan Ruang', [
            'ik' => 'Persentase Penyedia Jasa yang Mendapatkan Pembinaan Teknis',
            'baseline' => 'N/A', 'target' => '3,50', 'satuan' => 'Persen',
        ]);

        // Dinas Perumahan Rakyat dan Kawasan Permukiman
        $this->addNonPrioritas('Program Pengembangan Perumahan', 'Dinas Perumahan Rakyat dan Kawasan Permukiman', [
            'ik' => 'Persentase Rumah Layak Huni',
            'baseline' => '32,00', 'target' => '32,3', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Kawasan Permukiman', 'Dinas Perumahan Rakyat dan Kawasan Permukiman', [
            'ik' => 'Persentase Rumah Tangga yang Memiliki Akses Terhadap Hunian yang Layak',
            'baseline' => 'N/A', 'target' => '84', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Perumahan dan Kawasan Permukiman Kumuh', 'Dinas Perumahan Rakyat dan Kawasan Permukiman', [
            'ik' => 'Persentase Kawasan Permukiman Bebas Kumuh',
            'baseline' => 'N/A', 'target' => '84', 'satuan' => 'Persen',
        ]);

        // ============ BATCH 3: Satpol PP, BPBD, Sosial, Pertanahan, LH (Tabel 4.1 hal. 11–22) ============

        // Satuan Polisi Pamong Praja dan Wilayatul Hisbah
        $this->addNonPrioritas('Program Peningkatan Ketenteraman dan Ketertiban Umum', 'Satuan Polisi Pamong Praja dan Wilayatul Hisbah', [
            'ik' => "Persentase Perda dan Perkada yang ditegakkan\nPersentase Penyelenggaraan Trantibum\nPersentase Cakupan Perlindungan Masyarakat\nPersentase PPNS yang ditingkatkan Kompetensinya",
            'baseline' => "60,00\n60,00\n60,00\n60,00",
            'target' => "85\n85\n85\n85",
            'satuan' => "Persen\nPersen\nPersen\nPersen",
        ]);

        // Badan Penanggulangan Bencana Daerah — Penanggulangan Bencana &
        // Pencegahan Kebakaran SUDAH prioritas (di 3.5), otomatis di-SKIP.

        // Dinas Sosial
        $this->addNonPrioritas('Program Pemberdayaan Sosial', 'Dinas Sosial', [
            'ik' => 'Persentase Keluarga Miskin yang Memperoleh Pemberdayaan Sosial Melalui Pemberdayaan Ekonomi',
            'baseline' => '250', 'target' => '220', 'satuan' => 'Keluarga',
        ]);
        $this->addNonPrioritas('Program Rehabilitasi Sosial', 'Dinas Sosial', [
            'ik' => "Persentase Penyandang Disabilitas Terlantar yang Terpenuhi Kebutuhan Dasarnya\nPersentase Anak Terlantar yang Terpenuhi Kebutuhan Dasarnya\nPersentase Usia Lanjut Terlantar yang Terpenuhi Kebutuhan Dasarnya\nPersentase Gelandangan dan Pengemis Terlantar yang Terpenuhi Kebutuhan Dasarnya",
            'baseline' => "60,15\n95,00\n95,33\n80,00",
            'target' => "90\n98\n98\n92",
            'satuan' => "Persen\nPersen\nPersen\nPersen",
        ]);
        $this->addNonPrioritas('Program Penanganan Bencana', 'Dinas Sosial', [
            'ik' => "Persentase Korban Bencana Alam, Sosial dan/atau Non Alam yang Terpenuhi Kebutuhan Dasar pada Saat dan Setelah Tanggap Darurat Bencana\nPersentase Korban Bencana yang Mendapatkan Layanan Pemulihan Sosial",
            'baseline' => "100\n100",
            'target' => "100\n100",
            'satuan' => "Persen\nPersen",
        ]);
        $this->addNonPrioritas('Program Pengelolaan Taman Makam Pahlawan', 'Dinas Sosial', [
            'ik' => 'Persentase Taman Makam Pahlawan Nasional yang Terkelola dengan Baik',
            'baseline' => '100', 'target' => '100', 'satuan' => 'Persen',
        ]);

        // Dinas Pertanahan (seluruhnya non-prioritas)
        $this->addNonPrioritas('Program Penatagunaan Tanah', 'Dinas Pertanahan', [
            'ik' => 'Persentase Tanah yang Tersedia untuk Kepentingan Umum',
            'baseline' => 'N/A', 'target' => '80', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Pengurusan Hak-Hak Atas Tanah', 'Dinas Pertanahan', [
            'ik' => 'Jumlah Usulan Sertifikat Tanah Pemerintah',
            'baseline' => '543,00', 'target' => '50', 'satuan' => 'Hak Alas',
        ]);
        $this->addNonPrioritas('Program Survei, Pengukuran dan Pemetaan', 'Dinas Pertanahan', [
            'ik' => 'Jumlah Tanah Pemerintah yang Sudah Terinventarisasi',
            'baseline' => '543,00', 'target' => '100', 'satuan' => 'Hak Alas',
        ]);
        $this->addNonPrioritas('Program Pengelolaan Sistem Informasi Pertanahan', 'Dinas Pertanahan', [
            'ik' => 'Persentase Tanah Pemerintah yang dicatat dalam Sim Tanah',
            'baseline' => '41,67', 'target' => '81', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Penanganan Konflik, Sengketa dan Perkara Pertanahan', 'Dinas Pertanahan', [
            'ik' => 'Persentase Kasus Tanah yang diselesaikan',
            'baseline' => '80,36', 'target' => '85', 'satuan' => 'Persen',
        ]);

        // Dinas Lingkungan Hidup — mayoritas sudah prioritas (di-SKIP otomatis).
        $this->addNonPrioritas('Program Peningkatan Pendidikan, Pelatihan dan Penyuluhan Lingkungan Hidup untuk Masyarakat', 'Dinas Lingkungan Hidup', [
            'ik' => 'Jumlah Keterlibatan Kelompok Masyarakat dalam Pengelolaan Lingkungan Hidup',
            'baseline' => '2', 'target' => '5', 'satuan' => 'Kelompok',
        ]);

        // ============ BATCH 4: Dukcapil, DPMG, Perhubungan, Kominfo, Pangan, DP3AKB (Tabel 4.1 hal. 22–27) ============

        // Dinas Kependudukan dan Pencatatan Sipil (seluruhnya non-prioritas)
        $this->addNonPrioritas('Program Pendaftaran Penduduk', 'Dinas Kependudukan dan Pencatatan Sipil', [
            'ik' => "Persentase Kepemilikan Identitas Kependudukan Digital\nPersentase Kepemilikan Kartu Identitas Anak",
            'baseline' => "2,74\n55,46", 'target' => "60\n85", 'satuan' => "Persen\nPersen",
        ]);
        $this->addNonPrioritas('Program Pencatatan Sipil', 'Dinas Kependudukan dan Pencatatan Sipil', [
            'ik' => "Persentase Akta Kelahiran yang diterbitkan Bagi yang Melaporkan\nPersentase Akta Kematian yang diterbitkan Bagi yang Melaporkan\nPersentase Akta Perkawinan yang diterbitkan Bagi yang Melaporkan\nPersentase Akta Perceraian yang diterbitkan Bagi yang Melaporkan",
            'baseline' => "97,68\n100,00\n56,75\n44,56", 'target' => "100\n100\n85\n75", 'satuan' => "Persen\nPersen\nPersen\nPersen",
        ]);
        $this->addNonPrioritas('Program Pengelolaan Informasi Administrasi Kependudukan', 'Dinas Kependudukan dan Pencatatan Sipil', [
            'ik' => 'Persentase Informasi Kependudukan yang dimanfaatkan',
            'baseline' => '11,53', 'target' => '30,77', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Pengelolaan Profil Kependudukan', 'Dinas Kependudukan dan Pencatatan Sipil', [
            'ik' => 'Pemanfaatan Profil Data Kependudukan untuk Pembangunan',
            'baseline' => 'Ada', 'target' => 'Ada', 'satuan' => 'Nilai',
        ]);

        // Dinas Pemberdayaan Masyarakat dan Gampong
        $this->addNonPrioritas('Program Penataan Desa', 'Dinas Pemberdayaan Masyarakat dan Gampong', [
            'ik' => 'Persentase Fasilitasi Penataan Desa',
            'baseline' => 'N/A', 'target' => '60', 'satuan' => 'Persen',
        ]);

        // Dinas Perhubungan (LLAJ sudah prioritas → SKIP)
        $this->addNonPrioritas('Program Pengelolaan Pelayaran', 'Dinas Perhubungan', [
            'ik' => 'Persentase Capaian PAD',
            'baseline' => 'N/A', 'target' => '100', 'satuan' => 'Persen',
        ]);

        // Dinas Komunikasi, Informatika dan Persandian
        $this->addNonPrioritas('Program Informasi dan Komunikasi Publik', 'Dinas Komunikasi Informatika dan Persandian', [
            'ik' => 'Persentase Tingkat Kepuasan Masyarakat Terhadap Akses dan Kualitas Informasi Publik Pemerintah Daerah (Survei)',
            'baseline' => 'N/A', 'target' => '90', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Penyelenggaraan Persandian untuk Pengamanan Informasi', 'Dinas Komunikasi Informatika dan Persandian', [
            'ik' => 'Tingkat Kesiapan Pengamanan Informasi Pemerintah Daerah',
            'baseline' => 'N/A', 'target' => '90', 'satuan' => 'Persen',
        ]);

        // Dinas Pangan (Diversifikasi & Ketahanan Pangan sudah prioritas → SKIP)
        $this->addNonPrioritas('Program Pengelolaan Sumber Daya Ekonomi untuk Kedaulatan dan Kemandirian Pangan', 'Dinas Pangan', [
            'ik' => 'Persentase Kebijakan Pangan yang Diimplementasikan',
            'baseline' => '100', 'target' => '100', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Penanganan Kerawanan Pangan', 'Dinas Pangan', [
            'ik' => 'Persentase Daerah Rawan Pangan',
            'baseline' => '8,70', 'target' => '6,5', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Pengawasan Keamanan Pangan', 'Dinas Pangan', [
            'ik' => 'Persentase Keamanan Pangan Segar yang Beredar',
            'baseline' => '100', 'target' => '96', 'satuan' => 'Persen',
        ]);

        // Dinas Pemberdayaan Perempuan, Perlindungan Anak dan Keluarga Berencana
        $opdP3 = 'Dinas Pemberdayaan Perempuan Perlindungan Anak dan Keluarga Berencana';
        $this->addNonPrioritas('Program Pengarusutamaan Gender dan Pemberdayaan Perempuan', $opdP3, [
            'ik' => "Indeks Pembangunan Gender (IPG)\nIndeks Ketimpangan Gender (IKG)",
            'baseline' => "85,98\n0,231", 'target' => "86,00\n0,227", 'satuan' => "Persen\nPersen",
        ]);
        $this->addNonPrioritas('Program Perlindungan Perempuan', $opdP3, [
            'ik' => 'Rasio Kekerasan dalam Rumah Tangga (KDRT)',
            'baseline' => '0,333', 'target' => '0,095', 'satuan' => 'Rasio',
        ]);
        $this->addNonPrioritas('Program Peningkatan Kualitas Keluarga', $opdP3, [
            'ik' => 'Persentase Gampong Keluarga Berkualitas Mandiri',
            'baseline' => '49,55', 'target' => '52,80', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Pengelolaan Sistem Data Gender dan Anak', $opdP3, [
            'ik' => 'Tersedianya Profil Gender',
            'baseline' => '-', 'target' => '5', 'satuan' => 'Dokumen',
        ]);
        $this->addNonPrioritas('Program Pemenuhan Hak Anak (PHA)', $opdP3, [
            'ik' => 'Indeks Pemenuhan Hak Anak (IPHA)',
            'baseline' => '50,00', 'target' => '75,00', 'satuan' => 'Indeks',
        ]);
        $this->addNonPrioritas('Program Perlindungan Khusus Anak', $opdP3, [
            'ik' => 'Indeks Perlindungan Anak',
            'baseline' => '69,32', 'target' => '69,37', 'satuan' => 'Indeks',
        ]);
        $this->addNonPrioritas('Program Pengendalian Penduduk', $opdP3, [
            'ik' => "Rasio Kepadatan Penduduk\nAngka Kelahiran Total (Total Fertility Rate/TFR)",
            'baseline' => "75,28\n2,18", 'target' => "81,04\n2,17", 'satuan' => "Persen\nNilai",
        ]);
        $this->addNonPrioritas('Program Pembinaan Keluarga Berencana (KB)', $opdP3, [
            'ik' => 'Proporsi Kebutuhan KB yang Terpenuhi',
            'baseline' => '87,77', 'target' => '89,85', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Pemberdayaan dan Peningkatan Keluarga Sejahtera (KS)', $opdP3, [
            'ik' => "Indeks Pengasuhan Keluarga Remaja\nIndeks Lansia Berdaya",
            'baseline' => "87,24\n57,43", 'target' => "92,48\n63,69", 'satuan' => "Persen\nPersen",
        ]);

        // ============ BATCH 5: Perdagangan/Koperasi/UMKM, PM, Pariwisata, Perkebunan, Kelautan, Transmigrasi (Tabel 4.1 hal. 28–45) ============

        // Dinas Perdagangan, Perindustrian, Koperasi dan Usaha Kecil dan Menengah
        $opdDag = 'Dinas Perdagangan, Perindustrian, Koperasi dan Usaha Kecil Menengah';
        $this->addNonPrioritas('Program Pengawasan dan Pemeriksaan Koperasi', $opdDag, [
            'ik' => 'Cakupan Pengawasan Koperasi', 'baseline' => '64,06', 'target' => '79', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Penilaian Kesehatan KSP/USP Koperasi', $opdDag, [
            'ik' => 'Persentase Koperasi Simpan Pinjam (KSP)/Usaha Simpan Pinjam (USP) Sehat', 'baseline' => '57,81', 'target' => '80', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Pemberdayaan Usaha Menengah, Usaha Kecil, dan Usaha Mikro (UMKM)', $opdDag, [
            'ik' => 'Persentase Peningkatan Pendapatan UMKM', 'baseline' => '34,88', 'target' => '7,00-7,50', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Peningkatan Sarana Distribusi Perdagangan', $opdDag, [
            'ik' => "Jumlah Pasar Induk Komoditi Pertanian\nJumlah Gudang Komoditi Pertanian", 'baseline' => "N/A\nN/A", 'target' => "1\n1", 'satuan' => "Pasar Induk\nGudang",
        ]);
        $this->addNonPrioritas('Program Stabilisasi Harga Barang Kebutuhan Pokok dan Barang Penting', $opdDag, [
            'ik' => 'Persentase Stabilitas Harga Kebutuhan Harga Barang Pokok', 'baseline' => '3,29', 'target' => '2,50-4,50', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Pengembangan Ekspor', $opdDag, [
            'ik' => 'Ekspor Bersih Perdagangan', 'baseline' => '958,8', 'target' => '1887,816', 'satuan' => 'Milyar Rupiah',
        ]);
        $this->addNonPrioritas('Program Standardisasi dan Perlindungan Konsumen', $opdDag, [
            'ik' => 'Persentase Akurasi Kemetrologian', 'baseline' => '100', 'target' => '100', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Penggunaan dan Pemasaran Produk Dalam Negeri', $opdDag, [
            'ik' => "Jumlah UMKM yang Memiliki Kerja Sama Pemasaran\nJumlah UMKM Komoditi Pertanian yang Memiliki Akses E-Commerce", 'baseline' => "0\n0", 'target' => "2\n2", 'satuan' => "Jumlah UMKM\nJumlah UMKM",
        ]);
        $this->addNonPrioritas('Program Pengelolaan Sistem Informasi Industri Nasional', $opdDag, [
            'ik' => 'Persentase IKM yang Dibantu Tepat Sasaran', 'baseline' => '100', 'target' => '100', 'satuan' => 'Persen',
        ]);

        // Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu
        $opdPM = 'Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu';
        $this->addNonPrioritas('Program Pelayanan Penanaman Modal', $opdPM, [
            'ik' => 'Indeks Kepuasan Masyarakat', 'baseline' => '94,46', 'target' => 'A', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Pengendalian Pelaksanaan Penanaman Modal', $opdPM, [
            'ik' => 'Jumlah Realisasi Investasi', 'baseline' => '1613,76', 'target' => '2900', 'satuan' => 'Milyar',
        ]);
        $this->addNonPrioritas('Program Pengelolaan Data dan Sistem Informasi Penanaman Modal', $opdPM, [
            'ik' => 'Persentase Update Data dan Informasi Perizinan dan Nonperizinan', 'baseline' => '95,00', 'target' => '95', 'satuan' => 'Persen',
        ]);

        // Dinas Pariwisata, Pemuda dan Olahraga
        $opdPar = 'Dinas Pariwisata, Pemuda dan Olahraga';
        $this->addNonPrioritas('Program Peningkatan Daya Tarik Destinasi Pariwisata', $opdPar, [
            'ik' => 'Jumlah Kunjungan Wisatawan', 'baseline' => '144.902', 'target' => '770.000', 'satuan' => 'Jumlah Orang',
        ]);
        $this->addNonPrioritas('Program Pemasaran Pariwisata', $opdPar, [
            'ik' => "Kontribusi Pertumbuhan PDRB Sektor Pariwisata\nPersentase PAD Sektor Pariwisata", 'baseline' => "0,74\n4,26", 'target' => "0,8\n4,40", 'satuan' => "Persen\nPersen",
        ]);
        $this->addNonPrioritas('Program Pengembangan Sumber Daya Pariwisata dan Ekonomi Kreatif', $opdPar, [
            'ik' => 'Persentase Usaha Ekonomi Kreatif', 'baseline' => '28,99', 'target' => '33', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Pengembangan Kapasitas Kepramukaan', $opdPar, [
            'ik' => 'Persentase Penggalang Kategori Rakit', 'baseline' => '33,33', 'target' => '38', 'satuan' => 'Persen',
        ]);

        // Dinas Perkebunan dan Peternakan
        $opdBun = 'Dinas Perkebunan dan Peternakan';
        $this->addNonPrioritas('Program Pengendalian Kesehatan Hewan dan Kesehatan Masyarakat Veteriner', $opdBun, [
            'ik' => "Angka Kematian Ternak Ruminansia\nPersentase Kasus Penyakit Ternak yang Ditangani", 'baseline' => "86\n100,00", 'target' => "79\n100", 'satuan' => "Ekor\nPersen",
        ]);
        $this->addNonPrioritas('Program Perizinan Usaha Pertanian', $opdBun, [
            'ik' => 'Persentase Plasma Perkebunan yang Terimplementasi', 'baseline' => 'N/A', 'target' => '4,68', 'satuan' => 'Persen',
        ]);

        // Dinas Kelautan dan Perikanan
        $this->addNonPrioritas('Program Pengawasan Sumber Daya Kelautan dan Perikanan', 'Dinas Kelautan dan Perikanan', [
            'ik' => 'Wilayah Perikanan Tangkap Terawasi', 'baseline' => '4', 'target' => '4', 'satuan' => 'Kecamatan',
        ]);

        // Dinas Transmigrasi dan Tenaga Kerja
        $opdTrans = 'Dinas Transmigrasi dan Tenaga Kerja';
        $this->addNonPrioritas('Program Perencanaan Tenaga Kerja', $opdTrans, [
            'ik' => 'Implementasi Kebijakan Perencanaan Tenaga Kerja', 'baseline' => 'N/A', 'target' => '70', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Perencanaan Kawasan Transmigrasi', $opdTrans, [
            'ik' => 'Persentase Jumlah Perencanaan Kawasan Transmigrasi yang Terimplementasi', 'baseline' => 'N/A', 'target' => '75', 'satuan' => 'Kawasan',
        ]);
        $this->addNonPrioritas('Program Pembangunan Kawasan Transmigrasi', $opdTrans, [
            'ik' => 'Persentase Jumlah Kawasan Transmigrasi yang Aktif', 'baseline' => 'N/A', 'target' => '50', 'satuan' => 'Kawasan',
        ]);
        $this->addNonPrioritas('Program Pengembangan Kawasan Transmigrasi', $opdTrans, [
            'ik' => 'Jumlah Satuan Permukiman Mandiri pada Kawasan Transmigrasi', 'baseline' => '1', 'target' => '1', 'satuan' => 'Satuan Permukiman',
        ]);

        // ============ BATCH 6: Setda/DPRK, Bappeda, BPKD, Inspektorat, Kesbangpol, MPU/Baitul Mal/MAA, Perpustakaan (Tabel 4.1 hal. 46–71) ============

        // Sekretariat Daerah (Pemerintahan & Kesra sudah prioritas → SKIP)
        $this->addNonPrioritas('Program Perekonomian dan Pembangunan', 'Sekretariat Daerah', [
            'ik' => 'Persentase Pengawasan dan Pengendalian Pelaksanaan Pembangunan Kabupaten Aceh Barat',
            'baseline' => '60,00', 'target' => '90', 'satuan' => 'Persen',
        ]);

        // Sekretariat DPRK
        $this->addNonPrioritas('Program Dukungan Pelaksanaan Tugas dan Fungsi DPRD', 'Sekretariat DPRK', [
            'ik' => "Ketetapan Penetapan Perda APBD Tahun Berjalan\nPersentase Penetapan Rancangan Peraturan Daerah Tahun Berjalan",
            'baseline' => "Tepat Waktu\n80,00", 'target' => "Tepat Waktu\n90", 'satuan' => "Tepat Waktu\nPersen",
        ]);

        // Badan Perencanaan Pembangunan Daerah (Koordinasi/Sinkronisasi sudah prioritas → SKIP)
        $opdBap = 'Badan Perencanaan Pembangunan Daerah';
        $this->addNonPrioritas('Program Perencanaan, Pengendalian dan Evaluasi Pembangunan Daerah', $opdBap, [
            'ik' => "Persentase Keselarasan RPJMD dengan RKPD\nPersentase Keselarasan RPJMD dengan Renstra PD",
            'baseline' => "100\n100", 'target' => "93\n65", 'satuan' => "Persen\nPersen",
        ]);
        $this->addNonPrioritas('Program Penelitian dan Pengembangan Daerah', $opdBap, [
            'ik' => 'Persentase Rekomendasi Kebijakan Pembangunan Daerah yang Dijadikan Sebagai Landasan dalam Implementasi Pembangunan',
            'baseline' => '100', 'target' => '100', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Riset dan Inovasi Daerah', $opdBap, [
            'ik' => 'Persentase Produk Inovasi yang Dimanfaatkan',
            'baseline' => 'N/A', 'target' => '100', 'satuan' => 'Persen',
        ]);

        // Badan Pengelolaan Keuangan Daerah (Keuangan & Pendapatan sudah prioritas → SKIP)
        $this->addNonPrioritas('Program Pengelolaan Barang Milik Daerah', 'Badan Pengelolaan Keuangan Daerah', [
            'ik' => 'Persentase Penambahan Nilai Aset Tetap',
            'baseline' => '3,17', 'target' => '3', 'satuan' => 'Persen',
        ]);

        // Inspektorat
        $this->addNonPrioritas('Program Penyelenggaraan Pengawasan', 'Inspektorat', [
            'ik' => 'Persentase Perangkat Daerah yang Menerapkan SPIP',
            'baseline' => 'N/A', 'target' => '80', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Perumusan Kebijakan, Pendampingan dan Asistensi', 'Inspektorat', [
            'ik' => "Persentase Penyelesaian Temuan di Perangkat Daerah\nIndeks Persepsi Korupsi",
            'baseline' => "N/A\n2,86", 'target' => "100\n2,74", 'satuan' => "Persen\nIndeks",
        ]);

        // Badan Kesatuan Bangsa dan Politik
        $opdKes = 'Badan Kesatuan Bangsa dan Politik';
        $this->addNonPrioritas('Program Penguatan Ideologi Pancasila dan Karakter Kebangsaan', $opdKes, [
            'ik' => 'Cakupan Penguatan Ideologi Pancasila dan Karakter Kebangsaan',
            'baseline' => '60', 'target' => '90', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Peningkatan Peran Partai Politik dan Lembaga Pendidikan Melalui Pendidikan Politik dan Pengembangan Etika serta Budaya Politik', $opdKes, [
            'ik' => 'Persentase Pendidikan Politik pada Kader Partai Politik',
            'baseline' => '50', 'target' => '80', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Pemberdayaan dan Pengawasan Organisasi Kemasyarakatan', $opdKes, [
            'ik' => 'Persentase Organisasi Kemasyarakatan yang Aktif',
            'baseline' => '60', 'target' => '90', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Pembinaan dan Pengembangan Ketahanan Ekonomi, Sosial, dan Budaya', $opdKes, [
            'ik' => 'Persentase Kebijakan di Bidang Ketahanan Ekonomi, Sosial, Budaya dan Fasilitasi Pencegahan Penyalahgunaan Narkotika, Fasilitasi Kerukunan Umat Beragama dan Penghayat Kepercayaan di Daerah yang dilaksanakan',
            'baseline' => '50', 'target' => '70', 'satuan' => 'Persen',
        ]);
        $this->addNonPrioritas('Program Peningkatan Kewaspadaan Nasional dan Peningkatan Kualitas dan Fasilitasi Penanganan Konflik Sosial', $opdKes, [
            'ik' => 'Persentase Konflik Sosial yang diselesaikan',
            'baseline' => '100', 'target' => '100', 'satuan' => 'Persen',
        ]);

        // Sekretariat Majelis Permusyawaratan Ulama
        $this->addNonPrioritas('Program Majelis Permusyawaratan Ulama (MPU) Aceh', 'Sekretariat Majelis Pemusyawaratan Ulama', [
            'ik' => 'Persentase Peran Ulama dalam Bidang Kesehatan',
            'baseline' => 'N/A', 'target' => '50', 'satuan' => 'Persen',
        ]);

        // Sekretariat Baitul Mal Kabupaten
        $this->addNonPrioritas('Program Baitul Mal', 'Sekretariat Baitul Mal Kabupaten', [
            'ik' => 'Persentase Peningkatan Ziswaf',
            'baseline' => '2,35', 'target' => '2,95', 'satuan' => 'Persen',
        ]);

        // Sekretariat Majelis Adat Aceh
        $this->addNonPrioritas('Program Majelis Adat Aceh (MAA)', 'Sekretariat Majelis Adat Aceh', [
            'ik' => "Persentase Nilai-Nilai Adat Istiadat\nPersentase Gampong yang Telah Menerapkan Hukum Adat",
            'baseline' => "90\n88,16", 'target' => "95\n99", 'satuan' => "Persen\nPersen",
        ]);

        // Dinas Perpustakaan dan Kearsipan (Permuseuman sudah prioritas → SKIP)
        $opdPerp = 'Dinas Perpustakaan dan Kearsipan';
        $this->addNonPrioritas('Program Pembinaan Perpustakaan', $opdPerp, [
            'ik' => "Persentase Peningkatan Jumlah Pengunjung Perpustakaan Kabupaten Per Tahun\nRasio Ketercukupan Koleksi Perpustakaan dengan Penduduk",
            'baseline' => "N/A\n0,32", 'target' => "25\n0,57", 'satuan' => "Persen\nRasio",
        ]);
        $this->addNonPrioritas('Program Pelestarian Koleksi Nasional dan Naskah Kuno', $opdPerp, [
            'ik' => 'Jumlah Naskah Kuno yang Terdata/Teridentifikasi',
            'baseline' => '5', 'target' => '10', 'satuan' => 'Naskah',
        ]);
        $this->addNonPrioritas('Program Pengelolaan Arsip', $opdPerp, [
            'ik' => "Cakupan Implementasi Srikandi pada OPD dan BLUD Lingkup Pemkab Aceh Barat\nPersentase Arsip Statis yang dimasukkan dalam SIKN Melalui JIKN\nPersentase Arsip Covid-19 yang diakuisisi",
            'baseline' => "N/A\nN/A\n35", 'target' => "95\n100\n80", 'satuan' => "Persen\nPersen\nPersen",
        ]);

        // ============ BATCH 7: 12 Kecamatan (Tabel 4.1 hal. 54–68) ============
        // Pola seragam: tiap kecamatan menjalankan 5 program non-prioritas yang
        // sama dengan indikator identik (target akhir RPJMD). Di-loop untuk 12
        // kecamatan agar ringkas & konsisten (semua non-prioritas — level
        // kecamatan tidak menurun langsung dari Sasaran RPJMD).
        $kecamatanPrograms = [
            [
                'nama' => 'Program Penyelenggaraan Pemerintahan dan Pelayanan Publik',
                'ik' => "Persentase Capaian Pelayanan SPM di Kecamatan\nPersentase Kegiatan Daerah/Instansi Vertikal yang difasilitasi",
                'baseline' => "60\nN/A", 'target' => "100\n100", 'satuan' => "Persen\nPersen",
            ],
            [
                'nama' => 'Program Pemberdayaan Masyarakat Desa dan Kelurahan',
                'ik' => 'Persentase Keluarga yang Melaksanakan Program PKK',
                'baseline' => 'N/A', 'target' => '100', 'satuan' => 'Persen',
            ],
            [
                'nama' => 'Program Koordinasi Ketentraman dan Ketertiban Umum',
                'ik' => 'Kasus Pelanggaran Ketertiban Umum',
                'baseline' => 'N/A', 'target' => '1', 'satuan' => 'Kasus',
            ],
            [
                'nama' => 'Program Penyelenggaraan Urusan Pemerintahan Umum',
                'ik' => 'Kasus Sara (Suku, Agama, Ras, dan Antargolongan)',
                'baseline' => 'N/A', 'target' => '1', 'satuan' => 'Kasus',
            ],
            [
                'nama' => 'Program Pembinaan dan Pengawasan Pemerintahan Desa',
                'ik' => 'Persentase Gampong yang Melaksanakan Musyawarah Gampong Tepat Waktu',
                'baseline' => '100', 'target' => '100', 'satuan' => 'Persen',
            ],
        ];

        $kecamatans = [
            'Kecamatan Johan Pahlawan', 'Kecamatan Kaway XVI', 'Kecamatan Meureubo',
            'Kecamatan Woyla', 'Kecamatan Woyla Timur', 'Kecamatan Woyla Barat',
            'Kecamatan Pante Ceureumen', 'Kecamatan Panton Reu', 'Kecamatan Arongan Lambalek',
            'Kecamatan Sungai Mas', 'Kecamatan Samatiga', 'Kecamatan Bubon',
        ];

        foreach ($kecamatans as $kec) {
            foreach ($kecamatanPrograms as $prog) {
                $this->addNonPrioritas($prog['nama'], $kec, [
                    'ik' => $prog['ik'],
                    'baseline' => $prog['baseline'],
                    'target' => $prog['target'],
                    'satuan' => $prog['satuan'],
                ]);
            }
        }
    }

    /**
     * Menambahkan satu program non-prioritas ke 1a bila:
     * - namanya BUKAN program prioritas eksisting, dan
     * - belum pernah di-seed (dedup by program+opd).
     *
     * $ik = ['ik','baseline','target','satuan'] dari Tabel 4.1 (opsional; bila
     * kosong, indikator dibiarkan kosong).
     */
    private function addNonPrioritas(string $program, string $opd, array $ik = []): void
    {
        $key = $this->norm($program);

        // Jangan tambahkan bila ini justru program prioritas (ada di 3.5).
        if (isset($this->prioritasSet[$key])) {
            $this->command?->warn("  SKIP (prioritas): {$program}");
            return;
        }

        // Idempoten: lewati bila baris non-prioritas ini sudah ada.
        $exists = KrsPemda::where('PROGRAM PRIORITAS', $program)
            ->where('OPD PENANGGUNGJAWAB PROGRAM', $opd)
            ->whereIn('SASARAN RPJMD', ['', 'Tidak Ada Data'])
            ->exists();
        if ($exists) {
            return;
        }

        // SASARAN RPJMD sengaja kosong → dideteksi non-prioritas oleh
        // KrsPemdaController::isPrioritas().
        KrsPemda::create([
            'SASARAN RPJMD' => '',
            'PROGRAM PRIORITAS' => $program,
            'IK PROGRAM' => $ik['ik'] ?? '',
            'BASELINE IK PROGRAM' => $ik['baseline'] ?? '',
            'TARGET IK PROGRAM' => $ik['target'] ?? '',
            'SATUAN IK PROGRAM' => $ik['satuan'] ?? '',
            'OPD PENANGGUNGJAWAB PROGRAM' => $opd,
        ]);
        $this->command?->info("  + {$program}  [{$opd}]");
    }

    private function isPrioritasRow($r): bool
    {
        $s = trim((string) $r->{'SASARAN RPJMD'});
        return $s !== '' && $s !== 'Tidak Ada Data';
    }

    private function norm(string $v): string
    {
        return mb_strtolower(trim($v));
    }
}
