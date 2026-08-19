<?php

namespace Database\Seeders;

use App\Models\Opd;
use App\Models\ProgramPembangunanBupati;
use Illuminate\Database\Seeder;

/**
 * Seed Tabel 3.7 RPJM Kabupaten Aceh Barat Tahun 2025-2029 — "100 Program
 * Pembangunan Pemerintah Kabupaten Aceh Barat" — diketik ulang PERSIS dari
 * dokumen sumber "RPJM Kabupaten Aceh Barat Tahun 2025-2029_V13 (2).pdf",
 * BAB III halaman 46-51 (Tabel 3.7).
 *
 * Visi/Misi TIDAK disimpan literal di sini (kolomnya sudah dihapus, lihat
 * migrasi 2026_07_27_151318_...) — dibaca LIVE dari tbl_krs_pemda (kolom
 * VISI/MISI) berdasarkan misi_urutan, lihat
 * KeteranganPendukungController::index(). Hanya misi_urutan (1-7) yang
 * disimpan sbg kunci pencocokan.
 *
 * Nama Perangkat Daerah DIPETAKAN ke nama PERSIS yang teregister di tabel
 * `opd` (Settings > Keterangan Pendukung > tab OPD) via NAMA_OPD_MAP —
 * dokumen sumber menulis nama OPD dgn kapitalisasi/singkatan/urutan kata
 * yang variatif ("BKPSDM", "Dinas Tenaga Kerja dan Transmigrasi" vs
 * resminya "Dinas Transmigrasi dan Tenaga Kerja", dst), sedangkan tabel
 * `opd` konsisten UPPERCASE. Baris multi-OPD (dipisah ", ") dipetakan
 * per-segmen lalu digabung ulang dgn ", " supaya SETIAP nama di dalamnya
 * valid. 2 nama TIDAK match ke OPD manapun secara sengaja (bagian internal
 * Sekretariat Daerah, bukan OPD terpisah) — "Bagian Hukum Setdakab" dan
 * "Bagian Organisasi Setdakab" dipetakan ke "SEKRETARIAT DAERAH".
 *
 * IDEMPOTEN: updateOrCreate by 'nomor' (1-100, unique) — aman dijalankan
 * ulang tanpa duplikasi.
 */
class ProgramPembangunanBupatiSeeder extends Seeder
{
    /** Nama OPD versi dokumen sumber (key, lowercase-trim) -> nama PERSIS di tabel `opd`. */
    private const NAMA_OPD_MAP = [
        'bkpsdm' => 'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA',
        'badan kepegawaian dan pengembangan sumber daya manusia' => 'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA',
        'badan pengelolaan keuangan daerah' => 'BADAN PENGELOLAAN KEUANGAN DAERAH',
        'badan perencanaan pembangunan daerah' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'badan penanggulangan bencana daerah' => 'BADAN PENANGGULANGAN BENCANA DAERAH',
        'rsud cut nyak dhien' => 'BLUD RSUD CUT NYAK DHIEN',
        'dinas kesehatan' => 'DINAS KESEHATAN',
        'dinas pendidikan dan kebudayaan' => 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
        'dinas pendidikan dayah' => 'DINAS PENDIDIKAN DAYAH',
        'dinas perhubungan' => 'DINAS PERHUBUNGAN',
        'dinas sosial' => 'DINAS SOSIAL',
        'dinas syariat islam' => 'DINAS SYARIAT ISLAM',
        'dinas pemberdayaan masyarakat dan gampong' => 'DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG',
        'dinas perumahan rakyat dan kawasan permukiman' => 'DINAS PERUMAHAN RAKYAT DAN KAWASAN PERMUKIMAN',
        'dinas pekerjaan umum dan penataan ruang' => 'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
        'dinas lingkungan hidup' => 'DINAS LINGKUNGAN HIDUP',
        'dinas kelautan dan perikanan' => 'DINAS KELAUTAN DAN PERIKANAN',
        'dinas pertanian tanaman pangan dan hortikultura' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
        'dinas pertanian, tanaman pangan dan hortikultura' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
        'dinas perkebunan dan peternakan' => 'DINAS PERKEBUNAN DAN PETERNAKAN',
        'dinas pangan' => 'DINAS PANGAN',
        'dinas transmigrasi dan tenaga kerja' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA',
        'dinas tenaga kerja dan transmigrasi' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA',
        'dinas penanaman modal pelayanan terpadu satu pintu' => 'DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU',
        'dinas penanaman modal dan pelayanan terpadu satu pintu' => 'DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU',
        'dinas pariwisata, pemuda dan olahraga' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
        'dinas pemuda dan olahraga' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
        'pemuda dan olahraga' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
        'dinas komunikasi, informatika dan statistik' => 'DINAS KOMUNIKASI INFORMATIKA DAN PERSANDIAN',
        'dinas komunikasi' => 'DINAS KOMUNIKASI INFORMATIKA DAN PERSANDIAN',
        'informatika dan statistik' => 'DINAS KOMUNIKASI INFORMATIKA DAN PERSANDIAN',
        'dinas perdagangan, perindustrian, koperasi dan usaha kecil menengah' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'dinas perdagangan, perindustrian dan usaha kecil menengah' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'dinas perdagangan' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'perindustrian' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'perindustrian dan usaha kecil menengah' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'koperasi dan usaha kecil menengah' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'sekretariat daerah' => 'SEKRETARIAT DAERAH',
        'bagian organisasi setdakab' => 'SEKRETARIAT DAERAH',
        'bagian hukum setdakab' => 'SEKRETARIAT DAERAH',
        'bagian kesra setdakab' => 'SEKRETARIAT DAERAH',
    ];

    private const MISI_URUTAN_KE_KEYWORD = [
        1 => 'Misi 1',
        2 => 'Misi 2',
        3 => 'Misi 3',
        4 => 'Misi 4',
        5 => 'Misi 5',
        6 => 'Misi 6',
        7 => 'Misi 7',
    ];

    /** Petakan satu segmen nama OPD (versi dokumen) ke nama PERSIS di tabel `opd`. */
    private function mapOpdName(string $name): string
    {
        $key = mb_strtolower(trim($name));
        if (isset(self::NAMA_OPD_MAP[$key])) {
            return self::NAMA_OPD_MAP[$key];
        }
        $this->command?->warn("  Nama OPD tidak terpetakan (dibiarkan apa adanya): {$name}");

        return $name;
    }

    /** Baris multi-OPD dipisah ", " (mis. "A, B, C") — petakan tiap segmen, gabung ulang. */
    private function mapPerangkatDaerah(string $raw): string
    {
        $parts = array_map('trim', explode(',', $raw));
        // Rejoin: sebagian nama OPD sumber sendiri mengandung koma (mis.
        // "Dinas Perdagangan, Perindustrian, Koperasi dan Usaha Kecil
        // Menengah") — split polos di atas MEMECAH nama itu jadi beberapa
        // token palsu. Solusinya: coba cocokkan gabungan berurutan (2-4
        // token) ke NAMA_OPD_MAP dulu sebelum treat tiap token sbg OPD
        // terpisah.
        $mapped = [];
        $i = 0;
        $n = count($parts);
        while ($i < $n) {
            $matched = false;
            for ($span = min(4, $n - $i); $span >= 1; $span--) {
                $candidate = implode(', ', array_slice($parts, $i, $span));
                $key = mb_strtolower(trim($candidate));
                if (isset(self::NAMA_OPD_MAP[$key])) {
                    $mapped[] = self::NAMA_OPD_MAP[$key];
                    $i += $span;
                    $matched = true;
                    break;
                }
            }
            if (! $matched) {
                $mapped[] = $this->mapOpdName($parts[$i]);
                $i++;
            }
        }

        return implode(', ', array_unique($mapped));
    }

    public function run(): void
    {
        // [nomor, program, branding, opd_raw, misi_urutan]
        $rows = [
            // ===== MISI I (1-39) =====
            [1, 'Menyediakan Bantuan Dana bagi Keluarga Pasien yang Dirujuk', 'KABS (Kartu Aceh Barat Sehat)', 'Badan Pengelolaan Keuangan Daerah, RSUD Cut Nyak Dhien', 1],
            [2, 'Menyediakan Rumah Singgah', 'RUMOH LON (Rumah Orang Singgah untuk Layanan Pengobatan)', 'Dinas Kesehatan', 1],
            [3, 'Menyediakan Ambulan Gratis bagi Masyarakat', 'AGAM (Ambulan Gratis bagi Masyarakat)', 'Dinas Kesehatan', 1],
            [4, 'Menyediakan Sarana Prasarana dan Alat Kesehatan', 'SATPAM (Sarana dan Prasarana dan Alat Penunjang Kesehatan Memadai)', 'Dinas Kesehatan', 1],
            [5, 'Percepatan Pembangunan RS Regional', 'SIGAP RS Regional (Sinergi Gerak Cepat Pembangunan Rumah Sakit Regional)', 'Dinas Kesehatan', 1],
            [6, 'Promosi Kesehatan Berkualitas', 'PRO SEHAT KUAT', 'Dinas Kesehatan', 1],
            [7, 'Menyediakan Dokter Spesialis', 'DOSIS (Dokter Spesialis)', 'BKPSDM', 1],
            [8, 'Dokter Masuk Rumah', 'DOKMARU (Dokter Masuk Rumah)', 'Dinas Kesehatan', 1],
            [9, 'Pemeriksaan dan Perawatan Kesehatan Gratis bagi Pasien dengan Kondisi Tertentu di Rumah', 'SEHATI (Sehat di Rumah Anda Tanpa Biaya)', 'Dinas Kesehatan', 1],
            [10, 'Pendampingan Ibu Hamil dan 1000 HPK', 'PEDULI 1000 HPK (Pendampingan Ibu Hamil dan Kelahiran)', 'Dinas Kesehatan', 1],
            [11, 'Makanan Bergizi bagi Balita', 'BISKUIT (Bantuan Stimulus untuk Balita Kesulitan Gizi)', 'Dinas Kesehatan', 1],
            [12, 'Meningkatkan Kualitas Pelayanan BLUD RS Cut Nyak Dhien', 'KUACI (Kualitas Pelayanan Cut Nyak Dhien)', 'Dinas Kesehatan', 1],
            [13, 'Peningkatan Kompetensi dan Keterampilan Guru', 'PINTAR (Peningkatan Kompetensi dan Keterampilan Guru)', 'Dinas Pendidikan dan Kebudayaan', 1],
            [14, 'Pendamping Guru', 'TERAS (Teman Edukasi dan Belajar di Sekolah)', 'Dinas Pendidikan dan Kebudayaan', 1],
            [15, 'Penyediaan Sarana dan Prasarana Sekolah', 'SELARAS (Sediakan dan Lengkapi Sarana Prasarana Sekolah)', 'Dinas Pendidikan dan Kebudayaan', 1],
            [16, 'Bus Gratis', 'BUPENA (Bus Gratis Untuk Pendidikan)', 'Dinas Perhubungan', 1],
            [17, 'Menyediakan Bimbingan Belajar Secara Gratis bagi Siswa SMP dan SMA Sederajat', 'BERKAT (Bimbel Edukasi Rakyat Tanpa Biaya)', 'Dinas Pendidikan dan Kebudayaan', 1],
            [18, 'Beasiswa bagi Siswa Keluarga Miskin Berprestasi', 'PRESTASI (Program Beasiswa untuk Siswa Miskin Berprestasi)', 'Dinas Pendidikan dan Kebudayaan, Bagian Kesra Setdakab', 1],
            [19, 'Pemerataan Guru', 'SETARA (Sebaran Tenaga Ajar Merata)', 'Dinas Pendidikan dan Kebudayaan', 1],
            [20, 'Bantuan Alat Perlengkapan Sekolah bagi Keluarga Miskin', 'BALSEM (Bantuan Alat Perlengkapan Sekolah bagi Keluarga Miskin)', 'Dinas Pendidikan dan Kebudayaan', 1],
            [21, 'Tunjangan Guru dan Tenaga Kesehatan yang bertugas di Lokasi Jauh dari Kota Meulaboh', 'BAKTI (Bantuan Kesejahteraan untuk Tenaga Pendidikan dan Medis)', 'Dinas Pendidikan dan Kebudayaan', 1],
            [22, 'Sekolah Unggul dan Merata', 'SAINS (Sekolah Andal dan Inklusif bagi Seluruh Siswa)', 'Dinas Pendidikan dan Kebudayaan', 1],
            [23, 'Menyediakan Premi Asuransi Ketenagakerjaan bagi Pekerja Rentan', 'OPTIMIS (Optimalisasi Perlindungan Sosial Antisipasi Kemiskinan)', 'Dinas Transmigrasi dan Tenaga Kerja', 1],
            [24, 'Santunan Sosial bagi Masyarakat Miskin', 'SALAM (Santunan Sosial bagi Masyarakat Miskin)', 'Dinas Sosial', 1],
            [25, 'Subsidi Energi Terjangkau untuk Rakyat', 'SENTER (Subsidi Energi Terjangkau untuk Rakyat)', 'Dinas Perumahan Rakyat dan Kawasan Permukiman', 1],
            [26, 'BBM Bersubsidi untuk Abang Becak', 'BEBAS (BBM Bersubsidi untuk Abang Becak Sejahtera)', 'Dinas Sosial', 1],
            [27, 'Membentuk Kelompok Usaha Ibu-ibu sesuai Potensi', 'KASIH IBU (Karya Sejahtera Ibu Mandiri dan Berjaya)', 'Dinas Sosial, Dinas Pertanian Tanaman Pangan dan Hortikultura, Dinas Perkebunan dan Peternakan, Dinas Kelautan dan Perikanan, Dinas Pemberdayaan Masyarakat dan Gampong', 1],
            [28, 'Meningkatkan Akses Permodalan bagi Petani, Peternak, Nelayan dan Pelaku Usaha UKM / IKM', 'SEJAHTERA (Sinergi Ekonomi untuk Jaminan Akses Modal terhadap Rakyat)', 'Dinas Pertanian Tanaman Pangan dan Hortikultura, Dinas Perkebunan dan Peternakan, Dinas Kelautan dan Perikanan, Dinas Perdagangan, Perindustrian dan Usaha Kecil Menengah', 1],
            [29, 'Bantuan Sarana Produksi Pertanian, Perikanan, Peternakan', 'BANNIER (Bantuan Sarana dan Prasarana Produksi Pertanian)', 'Dinas Pertanian, Tanaman Pangan dan Hortikultura, Dinas Perkebunan dan Peternakan, Dinas Kelautan dan Perikanan', 1],
            [30, 'Training Tenaga Kerja dan Pelaku Usaha Siap Pakai', 'TUNTAS (Training untuk Tenaga Kerja dan Pelaku Usaha Siap Pakai)', 'Dinas Tenaga Kerja dan Transmigrasi, Dinas Pemuda dan Olahraga, Dinas Perdagangan, Perindustrian, Koperasi dan Usaha Kecil Menengah, Dinas Kelautan dan Perikanan', 1],
            [31, 'Kerja Sama dengan Dunia Usaha di Dalam maupun di Luar Kabupaten Aceh Barat untuk Penyerapan Tenaga Kerja', 'SINERJI (Kolaborasi Penyerapan Tenaga Kerja dengan Dunia Usaha dan Bisnis)', 'Dinas Tenaga Kerja dan Transmigrasi', 1],
            [32, 'Membangun Kemitraan Pemasaran Produk UKM, IKM, Pertanian, Perikanan, dan Peternakan', 'BERKAH (Bersama Kembangkan Akses dan Pemasaran UMKM)', 'Dinas Perdagangan, Perindustrian, Koperasi dan Usaha Kecil Menengah', 1],
            [33, 'Mendorong Investasi di Sektor Perikanan, Pertanian, Peternakan, Pariwisata, dan Pendidikan', 'TABANGUN (Investasi untuk Membangun)', 'Dinas Penanaman Modal Pelayanan Terpadu Satu Pintu', 1],
            [34, 'Proyek Pemerintah Menggunakan Tenaga Lokal Minimal 30%', 'KAWAL (Kebijakan Wajib Libatkan Tenaga Kerja Lokal)', 'Dinas Tenaga Kerja dan Transmigrasi', 1],
            [35, 'Penguatan BUMG sebagai Mitra Pemerintah Daerah dalam Pembangunan', 'BUNGA (Badan Usaha Milik Gampong untuk Pembangunan)', 'Dinas Pemberdayaan Masyarakat dan Gampong', 1],
            [36, 'Ekonomi Kreatif untuk Kesejahteraan', 'CERDAS (Cipta Ekonomi Rakyat dengan Seni dan Kreativitas)', 'Dinas Pariwisata, Pemuda dan Olahraga', 1],
            [37, 'Mengembangkan Koperasi Petani untuk Peningkatan Kesejahteraan Petani', 'KOPI SANGER (Koperasi Petani Sejahtera Membangun Negeri)', 'Dinas Perdagangan, Perindustrian, Koperasi dan Usaha Kecil Menengah', 1],
            [38, 'Subsidi Transportasi bagi Komoditi Tertentu', 'DUIT (Dukungan Subsidi Transportasi untuk Komoditi Tertentu)', 'Dinas Pangan', 1],
            [39, 'Menggelar Pasar Murah dan Menyelenggarakan Operasi Pasar Murah', 'HARMONI (Harga Murah dan Operasi Pasar Terkendali)', 'Dinas Perdagangan, Perindustrian, Koperasi dan Usaha Kecil Menengah', 1],

            // ===== MISI II (40-56) =====
            [40, 'Menciptakan Pemerintahan yang Bersih, Transparan dan Akuntabel Disertai Semangat Melayani', 'PELITA (Pemerintah yang Melayani, Akuntabel dan Transparan)', 'Bagian Organisasi Setdakab', 2],
            [41, 'Penguatan dan Pelaksanaan Satu Data Indonesia', 'SATURASI (Satu Data untuk Gerak Sinergi Membangun Negeri)', 'Dinas Komunikasi, Informatika dan Statistik', 2],
            [42, 'Menyelenggarakan Pendidikan dan Pelatihan Bagi ASN Secara Profesional', 'SIMPUL (Sistim Manajemen Pendidikan ASN Profesional Layanan Unggul)', 'Badan Kepegawaian dan Pengembangan Sumber Daya Manusia', 2],
            [43, 'Menerapkan Sistim Merit Secara Konsisten', 'SISTER (Sistem Merit untuk Pengembangan dan Penempatan Karier)', 'Badan Kepegawaian dan Pengembangan Sumber Daya Manusia', 2],
            [44, 'Menetapkan Indikator Kinerja secara Jelas dan Terukur bagi Pejabat Pemerintah', 'INKUBATOR (Indikator Kinerja Utama bagi Pejabat dan Organisasi)', 'Bagian Organisasi Setdakab', 2],
            [45, 'Meningkatkan Akses Internet di seluruh wilayah Aceh Barat guna Mendukung Sistem Pemerintahan Berbasis Elektronik (SPBE)', 'PESAT (Pemerataan Sistem Akses Internet)', 'Dinas Komunikasi, Informatika dan Statistik', 2],
            [46, 'Meningkatkan Kesejahteraan ASN (Meningkatkan TPP)', 'PRO ASN (Program Kesejahteraan untuk ASN)', 'Badan Pengelolaan Keuangan Daerah', 2],
            [47, 'Pendampingan Hukum bagi Nelayan yang Bermasalah Dalam Aktivitas Menangkap Ikan', 'AKUA (Advokasi Hukum untuk Nelayan)', 'Bagian Hukum Setdakab', 2],
            [48, 'Optimalisasi Pemanfaatan Dana CSR Secara Transparan dan Berkeadilan', 'CSR MANTAP (CSR untuk Masyarakat yang Akuntabel dan Transparan)', 'Badan Perencanaan Pembangunan Daerah', 2],
            [49, 'Penguatan Peran Pendamping Desa dan Petugas PKH untuk Akselerasi Pembangunan di Gampong', 'PERTADES (Penguatan Peran Pendamping Desa dan Petugas PKH untuk Pembangunan di Desa)', 'Dinas Pemberdayaan Masyarakat dan Gampong', 2],
            [50, 'Optimalisasi Pemanfaatan Dana Desa untuk Meningkatkan Kesejahteraan Masyarakat', 'DANSA (Dana Desa untuk Meningkatkan Kesejahteraan)', 'Dinas Pemberdayaan Masyarakat dan Gampong', 2],
            [51, 'Memberi Insentif Kinerja bagi Gampong', 'SIGAP (Sistem Pemberian Insentif Kinerja bagi Gampong)', 'Dinas Pemberdayaan Masyarakat dan Gampong', 2],
            [52, 'Memenuhi Ketentuan Penghasilan Tetap (Siltap) Bagi Seluruh Aparatur Gampong sesuai dengan Regulasi', 'PRO AGAM (Program Kesejahteraan untuk Aparatur Gampong)', 'Badan Pengelolaan Keuangan Daerah', 2],
            [53, 'Mengembangkan Produk Unggulan PKK (seperti Tanaman Obat-obatan untuk Industri)', 'CERMAT PKK (Ciptakan Ekonomi Keluarga bersama Tim PKK)', 'Dinas Pemberdayaan Masyarakat dan Gampong', 2],
            [54, 'Membangun Kerjasama dengan Seluruh Stakeholder dalam Pengelolaan Penerimaan PAD', 'PRAKARSA (Pajak dan Retribusi Meningkat Rakyat Sejahtera)', 'Badan Pengelolaan Keuangan Daerah', 2],
            [55, 'Menerapkan Teknologi Informasi dalam Pengelolaan Penerimaan PAD', 'PRAKARSA (Pajak dan Retribusi Meningkat Rakyat Sejahtera)', 'Badan Pengelolaan Keuangan Daerah', 2],
            [56, 'Optimalisasi Sumber PAD', null, 'Badan Pengelolaan Keuangan Daerah', 2],

            // ===== MISI III (57-66) =====
            [57, 'Pelaksanaan Pelatihan Fungsi Kemesjidan bagi Pengurus Badan Kemakmuran Mesjid (BKM)', 'SUPERMI (Sumber Daya Manusia Pengurus Mesjid yang Melayani)', 'Dinas Syariat Islam', 3],
            [58, 'Menyelenggarakan Majelis Taklim di setiap Mesjid Gampong secara Berkala', 'MUTIARA (Majelis Taklim Islami dan Religius Aktif)', 'Dinas Syariat Islam', 3],
            [59, 'Memberi Insentif bagi Imum Chik dan Guru TPA', 'INTAN (Insentif untuk Imam dan Guru Mengaji)', 'Dinas Syariat Islam', 3],
            [60, 'Meningkatkan Ketersediaan Tenaga Keagamaan seperti Imam, Guru Mengaji, Pemandi Mayat, Da\'i dll', 'SUKMA (Sumber Daya Keagamaan yang Unggul dan Berkualitas)', 'Dinas Syariat Islam', 3],
            [61, 'Menyelenggarakan Muzakarah Ulama Dayah', 'MUBAD (Mubahassah Ulama Dayah)', 'Dinas Pendidikan Dayah', 3],
            [62, 'Alumni Dayah Masuk Gampong', 'ADUN (Alumni Dayah Masuk Gampong)', 'Dinas Pendidikan Dayah', 3],
            [63, 'Satu Gampong Satu Da\'i', 'SANTUN (Satu Gampong Satu Da\'i untuk Kemajuan)', 'Dinas Pendidikan Dayah', 3],
            [64, 'Membentuk Satuan Tugas Pencegahan Penyakit Masyarakat seperti Judi Online, Narkoba, Minuman Keras, dll di tingkat Gampong', 'PARANG (Petugas Pencegah Penyakit Masyarakat di Gampong)', 'Dinas Pemberdayaan Masyarakat dan Gampong', 3],
            [65, 'Mencetak Qari Internasional', 'KONTER (Mencetak Qari Internasional)', 'Dinas Syariat Islam', 3],
            [66, 'Gerakan Maghrib Mengaji', 'GEMA (Gerakan Maghrib Mengaji)', 'Dinas Syariat Islam', 3],

            // ===== MISI IV (67-74) =====
            [67, 'Menyediakan Sarana Prasarana Layanan Dasar yang Mantap', 'SANTAP (Sarana dan Prasarana Layanan Dasar yang Mantap)', 'Dinas Pekerjaan Umum dan Penataan Ruang', 4],
            [68, 'Membangun dan Merehabilitasi Drainase di Seluruh Wilayah Perkotaan Meulaboh', 'SANIKU (Sanitasi untuk Kesehatan Lingkungan)', 'Dinas Pekerjaan Umum dan Penataan Ruang', 4],
            [69, 'Menyediakan WC bagi Rumah Tangga Miskin', null, 'Dinas Pekerjaan Umum dan Penataan Ruang', 4],
            [70, 'Normalisasi dan Rehabilitasi Saluran Lhueng Aneuk Ayeu', 'NONA (Normalisasi dan Rehabilitasi Lhueng Aneuk Ayeu)', 'Dinas Pekerjaan Umum dan Penataan Ruang', 4],
            [71, 'Membangun Kolam Retensi Antisipasi Banjir', 'KORAN (Kolam Retensi Antisipasi Banjir)', 'Dinas Pekerjaan Umum dan Penataan Ruang', 4],
            [72, 'Menyediakan Air Bersih di Seluruh Wilayah', 'TIRTA (Tingkatkan Ketersediaan Air Bersih)', 'Dinas Pekerjaan Umum dan Penataan Ruang', 4],
            [73, 'Menyediakan Lampu Penerangan Jalan di Seluruh Wilayah Perkotaan Meulaboh dan sekitarnya', 'LENTERA (Lampu Penerangan untuk Perkotaan dan Sekitarnya)', 'Dinas Perumahan Rakyat dan Kawasan Permukiman', 4],
            [74, 'Percepatan Penyelesaian Irigasi Lhok Guci', 'LACI (Layanan Lhok Guci untuk Pertanian)', 'Dinas Pekerjaan Umum dan Penataan Ruang', 4],

            // ===== MISI V (75-89) =====
            [75, 'Pemberdayaan Kajreun Blang', 'KAYA NIRA (Kajreun Blang Berdaya Petani Sejahtera)', 'Dinas Pertanian Tanaman Pangan dan Hortikultura', 5],
            [76, 'Memperkuat Penyuluhan Pertanian', 'HEPI (Hebat Penyuluhnya, Makmur Petaninya)', 'Dinas Pertanian Tanaman Pangan dan Hortikultura', 5],
            [77, 'Mengembangkan Hilirisasi Komoditi Pertanian, Perikanan, dan Peternakan', 'HIKMAT (Hilirisasi Komoditi Pertanian, Perikanan, dan Peternakan)', 'Dinas Pertanian Tanaman Pangan dan Hortikultura, Dinas Kelautan dan Perikanan, Dinas Perkebunan dan Peternakan', 5],
            [78, 'Pemberdayaan Keluarga Nelayan (Ibu Rumah Tangga) melalui Pengembangan Industri Rumah Tangga Hilirisasi Produk Perikanan', 'PEKAN (Pemberdayaan Keluarga Nelayan)', 'Dinas Kelautan dan Perikanan', 5],
            [79, 'Fasilitasi untuk Perizinan Nelayan', 'FAIZIN (Fasilitasi Perizinan bagi Nelayan)', 'Dinas Kelautan dan Perikanan', 5],
            [80, 'Membangun Kawasan Sentra Pertanian / Peternakan', 'SINTA (Sistem Integrasi Pertanian dan Peternakan)', 'Dinas Perkebunan dan Peternakan, Dinas Pertanian Tanaman Pangan dan Hortikultura', 5],
            [81, 'Cetak Sawah Baru', 'SAPA (Sawah Bertambah Pangan Berjaya)', 'Dinas Pertanian Tanaman Pangan dan Hortikultura', 5],
            [82, 'Mekanisasi dan Penerapan Teknologi di Sektor Pertanian', 'MESIN (Mekanisasi dan Teknologi Pertanian)', 'Dinas Pertanian Tanaman Pangan dan Hortikultura', 5],
            [83, 'Melakukan Pengawasan Lingkungan secara Profesional', 'SALING SALAM (Pengawasan Lingkungan untuk Menjaga Kelestarian Alam)', 'Dinas Lingkungan Hidup', 5],
            [84, 'Membangun Kemitraan dengan Perusahaan Swasta dalam Pengelolaan TPA Sampah', 'GEBRAK (Gerak Bersama untuk Kebersihan)', 'Dinas Lingkungan Hidup', 5],
            [85, 'Membentuk Unit Layanan Sampah di Seluruh Gampong Melalui BUMG', 'BURSA (BUMG Urusan Sampah)', 'Dinas Pemberdayaan Masyarakat dan Gampong', 5],
            [86, 'Meraih Penghargaan ADIPURA bagi Kota Meulaboh', 'KODIR (Kota Bersih Adipura Hadir)', 'Dinas Lingkungan Hidup', 5],
            [87, 'Membentuk Desa Tangguh Bencana dan Sekolah Siaga Bencana', 'DIANA (Desa Siaga Bencana)', 'Badan Penanggulangan Bencana Daerah', 5],
            [88, 'Membuat Lubang Biopori di Seluruh Area Perkantoran, Permukiman, dan Fasilitas Umum di Kota Meulaboh', 'OBOR (Optimalisasi Biopori bagi Perkantoran dan Permukiman)', 'Dinas Perumahan Rakyat dan Kawasan Permukiman', 5],
            [89, 'Menyediakan Sarana dan Prasarana Penanganan Bencana secara Memadai', 'SAPA BADAI (Sarana Prasarana Bencana Memadai)', 'Badan Penanggulangan Bencana Daerah', 5],

            // ===== MISI VI (90-93) =====
            [90, 'Menyelenggarakan Pameran Budaya Aceh Secara Berkala', 'RANUB (Rumah Nanggroe Untuk Budaya)', 'Dinas Pendidikan dan Kebudayaan', 6],
            [91, 'Membangun Sanggar Seni yang Representatif', 'SEULANGA (Sanggar Seni Lestarikan Adat dan Budaya Aceh)', 'Dinas Pendidikan dan Kebudayaan', 6],
            [92, 'Menjalin Kerjasama dengan Seluruh Stakeholder untuk Kemajuan dan Perkembangan Adat dan Budaya Aceh', 'REBANA (Rintis Kerjasama Kembangkan Adat dan Budaya)', 'Dinas Pariwisata, Pemuda dan Olahraga', 6],
            [93, 'Membangun Museum dan Galeri Seni Budaya Aceh Barat di Kota Meulaboh', 'Museum Kota Meulaboh', 'Dinas Pendidikan dan Kebudayaan', 6],

            // ===== MISI VII (94-100) =====
            [94, 'Fasilitasi Forum Diskusi Pembangunan di Kalangan Pemuda (Kritik Dibayar)', 'MIMBAR (Mikir Membangun Aceh Barat Bersama-sama)', 'Dinas Pariwisata, Pemuda dan Olahraga', 7],
            [95, 'Bekerjasama dengan Perguruan Tinggi untuk Gerakan Sarjana Membangun Gampong', 'RAJA DESA (Gerakan Sarjana Membangun Desa)', 'Dinas Pemberdayaan Masyarakat dan Gampong', 7],
            [96, 'Mencetak Petani-petani Baru (Petani Millenial)', 'ADAB (Aku Muda Aku Bertani)', 'Dinas Pertanian Tanaman Pangan dan Hortikultura', 7],
            [97, 'Membangun Jejaring Pemantauan Minat dan Bakat Olah Raga', 'JUARA (Jejaring Unggul Atlet Berbakat)', 'Dinas Pariwisata, Pemuda dan Olahraga', 7],
            [98, 'Menyediakan Pelatih yang Profesional', 'PESONA (Pelatih Olahraga yang Profesional)', 'Dinas Pariwisata, Pemuda dan Olahraga', 7],
            [99, 'Menyediakan Sarana dan Prasarana Olahraga dan Rekreasi', 'SNEAKER (Sarana dan Prasarana Kuliner, Olahraga dan Rekreasi)', 'Dinas Pariwisata, Pemuda dan Olahraga, Dinas Pekerjaan Umum dan Penataan Ruang, Dinas Perdagangan, Perindustrian, Koperasi dan Usaha Kecil Menengah', 7],
            [100, 'Menyelenggarakan Turnamen Piala Bupati secara Berkala', 'BUPATI CUP', 'Dinas Pariwisata, Pemuda dan Olahraga', 7],
        ];

        foreach ($rows as [$nomor, $program, $branding, $opdRaw, $misiUrutan]) {
            ProgramPembangunanBupati::updateOrCreate(
                ['nomor' => $nomor],
                [
                    'program_pembangunan' => $program,
                    'branding' => $branding,
                    'perangkat_daerah' => $this->mapPerangkatDaerah($opdRaw),
                    'misi_urutan' => $misiUrutan,
                ]
            );
        }

        $this->command?->info('Program Pembangunan Bupati: '.count($rows).' baris ter-seed (Tabel 3.7 RPJM 2025-2029).');
    }
}
