<?php

namespace Database\Seeders;

use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\KroPd;
use App\Models\KrsPd;
use App\Models\Opd;
use App\Models\User;
use App\Services\KrsIrsPdSyncService;
use App\Services\KroIroPdSyncService;
use Illuminate\Database\Seeder;

/**
 * Tambahan data realistis KRS_PD (Konteks Risiko Strategis PD, dasar
 * Renstra) & KRO_PD (Konteks Risiko Operasional PD) untuk 5 OPD yang SUDAH
 * punya 1 baris data (Dinas Sosial, Inspektorat, BLUD RSUD Cut Nyak Dhien,
 * Dinas Kesehatan, Sekretariat Daerah) — supaya Form Cetak 2b/2c menampilkan
 * VARIASI Sasaran Strategis PD / Kegiatan (bukan cuma satu-satunya pilihan
 * yang otomatis "terpilih" krn tidak ada pembanding).
 *
 * Pola realistis: setiap OPD dapat 2 Sasaran Strategis PD TAMBAHAN (di luar
 * yang sudah ada), masing2 dgn Program+Kegiatan+SubKegiatan sendiri. HANYA
 * SEBAGIAN yang diberi baris IRS_PD/IRO_PD pendamping (match by text via
 * KrsIrsPdSyncService::matchKey() / KroIroPdSyncService::matchKey(), lihat
 * app/Services/*.php) — sisanya SENGAJA dibiarkan tanpa risiko terdaftar,
 * supaya "bold = dipilih sbg Penetapan Konteks Risiko" di Form 2b/2c benar2
 * membedakan yang terpilih vs tidak (sebelumnya SELALU bold krn cuma ada
 * satu baris data per OPD, jadi tidak ada perbandingan).
 *
 * Idempotent: dicek via SASARAN STRATEGIS PD (KRS_PD) / KEGIATAN PD (KRO_PD)
 * yang sudah ada sebelum insert, supaya aman dijalankan berkali-kali.
 */
class KrsKroPdVariasiSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->dataset() as $opdNama => $data) {
            $opd = Opd::where('nama', $opdNama)->first();
            if (!$opd) {
                $this->command?->warn("OPD '{$opdNama}' tidak ditemukan, dilewati.");
                continue;
            }

            $user = User::where('opd_id', $opd->id)->first();
            $userId = $user?->id;

            foreach ($data['krs'] as $krs) {
                $this->seedKrs($opdNama, $userId, $krs);
            }

            foreach ($data['kro'] as $kro) {
                $this->seedKro($opdNama, $userId, $kro);
            }
        }

        // Regenerasi tabel gabungan (dipakai halaman tabel & diagram
        // /krs_irs_pd dan /kro_iro_pd) supaya data baru langsung tampak di
        // sana juga, bukan cuma di Form Cetak.
        (new KrsIrsPdSyncService())->sync();
        (new KroIroPdSyncService())->sync();
    }

    private function seedKrs(string $opdNama, ?int $userId, array $krs): void
    {
        $sasaran = $krs['sasaran'];

        // Cek KrsPd & risiko pendampingnya SECARA TERPISAH (bukan satu
        // if-return bersama) — seeder sebelumnya sempat gagal separuh jalan
        // krn bug lain (key array salah), yg berakibat baris KrsPd
        // TERLANJUR ter-insert TAPI IrsPd pendampingnya belum sempat
        // dieksekusi. Kalau seedIrs() cuma dipanggil di dalam blok "baru
        // insert KrsPd", re-run seeder akan SELAMANYA melewatkan IrsPd yg
        // ketinggalan itu krn KrsPd-nya sudah "exists" duluan. Sekarang
        // seedIrs() SELALU dicoba (idempotent check ada di dalam
        // seedIrs()-nya sendiri), terlepas dari status KrsPd induknya.
        $krsExists = KrsPd::where('SASARAN STRATEGIS PD', $sasaran)
            ->where('OPD PENANGGUNG JAWAB KEGIATAN', $opdNama)
            ->exists();

        if (!$krsExists) {
            KrsPd::create([
                'user_id' => $userId,
                'SASARAN RPJMD' => $krs['sasaran_rpjmd'],
                'TUJUAN STRATEGIS PD' => $krs['tujuan'],
                'IK TUJUAN STRATEGIS PD' => $krs['ik_tujuan'],
                'BASELINE IK TUJUAN STRATEGIS PD' => $krs['baseline_tujuan'],
                'TARGET IK TUJUAN STRATEGIS PD' => $krs['target_tujuan'],
                'SATUAN IK TUJUAN STRATEGIS PD' => $krs['satuan_tujuan'],
                'SASARAN STRATEGIS PD' => $sasaran,
                'IK SASARAN STRATEGIS PD' => $krs['ik_sasaran'],
                'BASELINE IK SASARAN STRATEGIS PD' => $krs['baseline_sasaran'],
                'TARGET IK SASARAN STRATEGIS PD' => $krs['target_sasaran'],
                'SATUAN IK SASARAN STRATEGIS PD' => $krs['satuan_sasaran'],
                'PROGRAM PD' => $krs['program'],
                'IK PROGRAM PD' => $krs['ik_program'],
                'BASELINE IK PROGRAM PD' => $krs['baseline_program'],
                'TARGET IK PROGRAM PD' => $krs['target_program'],
                'SATUAN IK PROGRAM PD' => $krs['satuan_program'],
                'KEGIATAN PD' => $krs['kegiatan'],
                'IK KEGIATAN PD' => $krs['ik_kegiatan'],
                'BASELINE IK KEGIATAN PD' => $krs['baseline_kegiatan'],
                'TARGET IK KEGIATAN PD' => $krs['target_kegiatan'],
                'SATUAN IK KEGIATAN PD' => $krs['satuan_kegiatan'],
                'SUBKEGIATAN PD' => $krs['subkegiatan'],
                'IK SUBKEGIATAN PD' => $krs['ik_subkegiatan'],
                'BASELINE IK SUBKEGIATAN PD' => $krs['baseline_subkegiatan'],
                'TARGET IK SUBKEGIATAN PD' => $krs['target_subkegiatan'],
                'SATUAN IK SUBKEGIATAN PD' => $krs['satuan_subkegiatan'],
                'OPD PENANGGUNG JAWAB KEGIATAN' => $opdNama,
            ]);
        }

        if (!empty($krs['risiko'])) {
            $this->seedIrs($opdNama, $userId, $sasaran, $krs['risiko']);
        }
    }

    private function seedKro(string $opdNama, ?int $userId, array $kro): void
    {
        $kegiatan = $kro['kegiatan'];

        // Sama spt seedKrs() — cek existence & panggil seedIro() terpisah,
        // supaya risiko pendamping tetap ter-backfill meski baris KRO_PD
        // induknya sudah lebih dulu ada.
        $kroExists = KroPd::where('KEGIATAN PD', $kegiatan)
            ->where('OPD PENANGGUNG JAWAB KEGIATAN', $opdNama)
            ->exists();

        if (!$kroExists) {
            KroPd::create([
                'user_id' => $userId,
                'SASARAN RENSTRA' => $kro['sasaran_renstra'],
                'PROGRAM PD' => $kro['program'],
                'IK PROGRAM PD' => $kro['ik_program'],
                'BASELINE IK PROGRAM PD' => $kro['baseline_program'],
                'TARGET IK PROGRAM PD' => $kro['target_program'],
                'SATUAN IK PROGRAM PD' => $kro['satuan_program'],
                'KEGIATAN PD' => $kegiatan,
                'IK KEGIATAN PD' => $kro['ik_kegiatan'],
                'BASELINE IK KEGIATAN PD' => $kro['baseline_kegiatan'],
                'TARGET IK KEGIATAN PD' => $kro['target_kegiatan'],
                'SATUAN IK KEGIATAN PD' => $kro['satuan_kegiatan'],
                'SUBKEGIATAN PD' => $kro['subkegiatan'],
                'IK SUBKEGIATAN PD' => $kro['ik_subkegiatan'],
                'BASELINE IK SUBKEGIATAN PD' => $kro['baseline_subkegiatan'],
                'TARGET IK SUBKEGIATAN PD' => $kro['target_subkegiatan'],
                'SATUAN IK SUBKEGIATAN PD' => $kro['satuan_subkegiatan'],
                'OPD PENANGGUNG JAWAB KEGIATAN' => $opdNama,
            ]);
        }

        if (!empty($kro['risiko'])) {
            $this->seedIro($opdNama, $userId, $kegiatan, $kro['risiko']);
        }
    }

    private function seedIrs(string $opdNama, ?int $userId, string $sasaran, array $risiko): void
    {
        $exists = IrsPd::where('SASARAN RENSTRA', $sasaran)
            ->where('URAIAN RISIKO', $risiko['URAIAN RISIKO'])
            ->exists();

        if ($exists) {
            return;
        }

        IrsPd::create(array_merge([
            'user_id' => $userId,
            'SASARAN RENSTRA' => $sasaran,
            'TAHUN DINILAI RISIKO' => '2026',
            'ENTITAS PD YANG MENILAI' => $opdNama,
            'NOMOR URUT RISIKO' => 1,
            'C / UC' => 'UC',
        ], $risiko));
    }

    private function seedIro(string $opdNama, ?int $userId, string $kegiatan, array $risiko): void
    {
        $exists = IroPd::where('KEGIATAN PD', $kegiatan)
            ->where('URAIAN RISIKO', $risiko['URAIAN RISIKO'])
            ->exists();

        if ($exists) {
            return;
        }

        IroPd::create(array_merge([
            'user_id' => $userId,
            'KEGIATAN PD' => $kegiatan,
            'TAHUN DINILAI RISIKO' => '2026',
            'ENTITAS PD YANG MENILAI' => $opdNama,
            'NOMOR URUT RISIKO' => 1,
            'TAHAP' => 'Pelaksanaan',
            'C / UC' => 'UC',
        ], $risiko));
    }

    private function dataset(): array
    {
        return [
            'DINAS SOSIAL' => [
                'krs' => [
                    [
                        'sasaran_rpjmd' => 'Meningkatkan Kesejahteraan Sosial dan Perlindungan bagi Penyandang Masalah Kesejahteraan Sosial (PMKS)',
                        'tujuan' => 'Meningkatnya Kualitas Rehabilitasi dan Perlindungan Sosial',
                        'ik_tujuan' => 'Indeks Kualitas Layanan Rehabilitasi Sosial',
                        'baseline_tujuan' => '62 Indeks',
                        'target_tujuan' => '78 Indeks',
                        'satuan_tujuan' => 'Indeks',
                        'sasaran' => 'Meningkatnya Akses Perlindungan Sosial bagi Fakir Miskin dan Kelompok Rentan',
                        'ik_sasaran' => 'Persentase Fakir Miskin yang Mendapatkan Bantuan Sosial Tepat Sasaran',
                        'baseline_sasaran' => '58%',
                        'target_sasaran' => '82%',
                        'satuan_sasaran' => 'Persen',
                        'program' => 'Program Penanganan Fakir Miskin',
                        'ik_program' => 'Persentase Fakir Miskin yang Terverifikasi dalam Data Terpadu Kesejahteraan Sosial (DTKS)',
                        'baseline_program' => '70%',
                        'target_program' => '95%',
                        'satuan_program' => 'Persen',
                        'kegiatan' => 'Pengelolaan Data Fakir Miskin Cakupan Daerah Kabupaten/Kota',
                        'ik_kegiatan' => 'Jumlah Data Fakir Miskin yang Termutakhirkan',
                        'baseline_kegiatan' => '12.500 KK',
                        'target_kegiatan' => '18.000 KK',
                        'satuan_kegiatan' => 'KK',
                        'subkegiatan' => 'Verifikasi dan Validasi Data Fakir Miskin Cakupan Daerah Kabupaten/Kota',
                        'ik_subkegiatan' => 'Jumlah Desa/Kelurahan yang Melaksanakan Verifikasi dan Validasi DTKS',
                        'baseline_subkegiatan' => '105 Desa/Kelurahan',
                        'target_subkegiatan' => '322 Desa/Kelurahan',
                        'satuan_subkegiatan' => 'Desa/Kelurahan',
                        'risiko' => [
                            'URAIAN RISIKO' => 'Data Terpadu Kesejahteraan Sosial (DTKS) tidak akurat sehingga bantuan sosial tidak tepat sasaran',
                            'TINGKAT RISIKO' => 'Risiko Strategis OPD',
                            'JENIS RISIKO' => 'Risiko Operasional',
                            'PEMILIK RISIKO' => 'Kepala Bidang Perlindungan dan Jaminan Sosial',
                            'URAIAN PENYEBAB RISIKO' => 'Method (Pemutakhiran DTKS di tingkat desa/kelurahan tidak berjalan rutin setiap tahun akibat keterbatasan SDM pendamping sosial)',
                            'SUMBER SEBAB RISIKO' => 'Internal (Kapasitas SDM Pendamping Sosial Desa/Kelurahan)',
                            'URAIAN DAMPAK RISIKO' => 'Bantuan sosial tersalur kepada keluarga yang sudah tidak memenuhi kriteria miskin, sementara keluarga miskin baru belum terdaftar',
                            'PIHAK YANG TERKENA DAMPAK RISIKO' => 'Masyarakat Fakir Miskin dan Kelompok Rentan',
                            'URAIAN PENGENDALIAN YANG SUDAH ADA' => 'Verifikasi dan validasi DTKS dilakukan secara berkala melalui pendamping sosial desa',
                            'KATEGORI EXISTING CONTROL' => 'KE (Kontrol sudah bersifat preventif, tetapi cakupannya belum menutup celah yang teridentifikasi di bawah)',
                            'CELAH PENGENDALIAN' => 'Belum ada sistem verifikasi digital real-time yang terintegrasi dengan data kependudukan',
                            'RENCANA TINDAK PENGENDALIAN' => 'Mitigate (Membangun sistem verifikasi DTKS berbasis aplikasi terintegrasi dengan Disdukcapil)',
                            'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => 'DINAS SOSIAL',
                            'PENANGGUNG JAWAB PENGENDALIAN' => 'Kepala Bidang Perlindungan dan Jaminan Sosial',
                            'TRIWULAN' => 'Triwulan II',
                            'TAHUN TARGET PENYELESAIAN' => '2026',
                            'SKALA DAMPAK' => '4',
                            'SKALA KEMUNGKINAN' => '3',
                            'SKALA RISIKO' => '12',
                            'SKALA PRIORITAS' => 6,
                        ],
                    ],
                    [
                        'sasaran_rpjmd' => 'Meningkatkan Kesejahteraan Sosial dan Perlindungan bagi Penyandang Masalah Kesejahteraan Sosial (PMKS)',
                        'tujuan' => 'Meningkatnya Kualitas Rehabilitasi dan Perlindungan Sosial',
                        'ik_tujuan' => 'Indeks Kualitas Layanan Rehabilitasi Sosial',
                        'baseline_tujuan' => '62 Indeks',
                        'target_tujuan' => '78 Indeks',
                        'satuan_tujuan' => 'Indeks',
                        'sasaran' => 'Meningkatnya Perlindungan Anak dan Penanganan Korban Kekerasan Berbasis Gender',
                        'ik_sasaran' => 'Persentase Kasus Kekerasan Anak dan Perempuan yang Tertangani',
                        'baseline_sasaran' => '65%',
                        'target_sasaran' => '90%',
                        'satuan_sasaran' => 'Persen',
                        'program' => 'Program Perlindungan Khusus Anak',
                        'ik_program' => 'Persentase Anak Korban Kekerasan yang Mendapatkan Layanan Rehabilitasi Sosial',
                        'baseline_program' => '55%',
                        'target_program' => '88%',
                        'satuan_program' => 'Persen',
                        'kegiatan' => 'Pencegahan Penanganan Anak Memerlukan Perlindungan Khusus',
                        'ik_kegiatan' => 'Jumlah Anak Korban Kekerasan yang Mendapatkan Pendampingan Psikososial',
                        'baseline_kegiatan' => '85 Anak',
                        'target_kegiatan' => '150 Anak',
                        'satuan_kegiatan' => 'Anak',
                        'subkegiatan' => 'Penyediaan Layanan bagi Anak yang Memerlukan Perlindungan Khusus yang Memerlukan Pengasuhan Pengganti',
                        'ik_subkegiatan' => 'Jumlah Anak yang Mendapatkan Layanan Pengasuhan Pengganti',
                        'baseline_subkegiatan' => '18 Anak',
                        'target_subkegiatan' => '35 Anak',
                        'satuan_subkegiatan' => 'Anak',
                        // Sengaja TIDAK diberi risiko (null) — jadi Sasaran ini
                        // muncul sbg pilihan konteks yg TIDAK terpilih sbg
                        // Penetapan Konteks Risiko (tidak bold), kontras dgn
                        // Sasaran pertama di atas yg ter-bold.
                        'risiko' => null,
                    ],
                ],
                'kro' => [
                    [
                        'sasaran_renstra' => 'Meningkatnya Akses Perlindungan Sosial bagi Fakir Miskin dan Kelompok Rentan',
                        'program' => 'Program Penanganan Fakir Miskin',
                        'ik_program' => 'Persentase Fakir Miskin yang Terverifikasi dalam Data Terpadu Kesejahteraan Sosial (DTKS)',
                        'baseline_program' => '70%',
                        'target_program' => '95% Tahun 2026',
                        'satuan_program' => 'Persen',
                        'kegiatan' => 'Pengelolaan Data Fakir Miskin Cakupan Daerah Kabupaten/Kota',
                        'ik_kegiatan' => 'Jumlah Data Fakir Miskin yang Termutakhirkan',
                        'baseline_kegiatan' => '12.500 KK',
                        'target_kegiatan' => '18.000 KK Tahun 2026',
                        'satuan_kegiatan' => 'KK',
                        'subkegiatan' => 'Verifikasi dan Validasi Data Fakir Miskin Cakupan Daerah Kabupaten/Kota',
                        'ik_subkegiatan' => 'Jumlah Desa/Kelurahan yang Melaksanakan Verifikasi dan Validasi DTKS',
                        'baseline_subkegiatan' => '105 Desa/Kelurahan',
                        'target_subkegiatan' => '322 Desa/Kelurahan',
                        'satuan_subkegiatan' => 'Desa/Kelurahan',
                        'risiko' => [
                            'URAIAN RISIKO' => 'Keterlambatan pemutakhiran data DTKS menyebabkan penyaluran bantuan sosial tertunda',
                            'TINGKAT RISIKO' => 'Risiko Operasional OPD',
                            'JENIS RISIKO' => 'Risiko Operasional',
                            'PEMILIK RISIKO' => 'Kepala Seksi Data dan Informasi Kesejahteraan Sosial',
                            'URAIAN PENYEBAB RISIKO' => 'Machine (Aplikasi pemutakhiran DTKS sering mengalami gangguan koneksi ke server pusat)',
                            'SUMBER SEBAB RISIKO' => 'Eksternal (Ketersediaan Jaringan Internet dan Server Pusat Kemensos)',
                            'URAIAN DAMPAK RISIKO' => 'Penyaluran bantuan sosial tertunda hingga 2-3 bulan dari jadwal seharusnya',
                            'PIHAK YANG TERKENA DAMPAK RISIKO' => 'Keluarga Penerima Manfaat Bantuan Sosial',
                            'URAIAN PENGENDALIAN YANG SUDAH ADA' => 'Koordinasi berkala dengan Kementerian Sosial terkait jadwal pemeliharaan sistem',
                            'KATEGORI EXISTING CONTROL' => 'KE (Kontrol sudah bersifat detektif, tetapi belum cukup responsif menutup celah yang teridentifikasi di bawah)',
                            'CELAH PENGENDALIAN' => 'Belum ada mekanisme offline/manual sebagai cadangan saat sistem gangguan',
                            'RENCANA TINDAK PENGENDALIAN' => 'Mitigate (Menyusun SOP pengumpulan data manual sebagai cadangan saat sistem online bermasalah)',
                            'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => 'DINAS SOSIAL',
                            'PENANGGUNG JAWAB PENGENDALIAN' => 'Kepala Seksi Data dan Informasi Kesejahteraan Sosial',
                            'TRIWULAN' => 'Triwulan III',
                            'TAHUN TARGET PENYELESAIAN' => '2026',
                            'SKALA DAMPAK' => '3',
                            'SKALA KEMUNGKINAN' => '3',
                            'SKALA RISIKO' => '9',
                            'SKALA PRIORITAS' => 11,
                        ],
                    ],
                    [
                        'sasaran_renstra' => 'Meningkatnya Perlindungan Anak dan Penanganan Korban Kekerasan Berbasis Gender',
                        'program' => 'Program Perlindungan Khusus Anak',
                        'ik_program' => 'Persentase Anak Korban Kekerasan yang Mendapatkan Layanan Rehabilitasi Sosial',
                        'baseline_program' => '55%',
                        'target_program' => '88% Tahun 2026',
                        'satuan_program' => 'Persen',
                        'kegiatan' => 'Penyediaan Layanan bagi Anak yang Memerlukan Perlindungan Khusus yang Memerlukan Pengasuhan Pengganti',
                        'ik_kegiatan' => 'Jumlah Anak yang Mendapatkan Layanan Pengasuhan Pengganti',
                        'baseline_kegiatan' => '18 Anak',
                        'target_kegiatan' => '35 Anak Tahun 2026',
                        'satuan_kegiatan' => 'Anak',
                        'subkegiatan' => 'Penyediaan Layanan Respon Kasus bagi Anak yang Memerlukan Perlindungan Khusus',
                        'ik_subkegiatan' => 'Jumlah Kasus Anak yang Direspon dalam Waktu Kurang dari 1x24 Jam',
                        'baseline_subkegiatan' => '42 Kasus',
                        'target_subkegiatan' => '85 Kasus',
                        'satuan_subkegiatan' => 'Kasus',
                        // Sengaja tanpa risiko juga — variasi kedua yg tidak terpilih.
                        'risiko' => null,
                    ],
                ],
            ],

            'INSPEKTORAT' => [
                'krs' => [
                    [
                        'sasaran_rpjmd' => 'Terwujudnya Tata Kelola Pemerintahan yang Bersih, Akuntabel dan Transparan',
                        'tujuan' => 'Meningkatnya Efektivitas Pengawasan Internal Pemerintah Daerah',
                        'ik_tujuan' => 'Tingkat Maturitas Sistem Pengendalian Intern Pemerintah (SPIP)',
                        'baseline_tujuan' => 'Level 2',
                        'target_tujuan' => 'Level 4',
                        'satuan_tujuan' => 'Level',
                        'sasaran' => 'Meningkatnya Kualitas dan Kuantitas Pengawasan atas Penyelenggaraan Pemerintahan Daerah',
                        'ik_sasaran' => 'Persentase Rekomendasi Hasil Pengawasan yang Ditindaklanjuti OPD',
                        'baseline_sasaran' => '68%',
                        'target_sasaran' => '92%',
                        'satuan_sasaran' => 'Persen',
                        'program' => 'Program Penyelenggaraan Pengawasan',
                        'ik_program' => 'Persentase OPD yang Diaudit Sesuai Program Kerja Pengawasan Tahunan (PKPT)',
                        'baseline_program' => '75%',
                        'target_program' => '100%',
                        'satuan_program' => 'Persen',
                        'kegiatan' => 'Pengawasan Internal',
                        'ik_kegiatan' => 'Jumlah Laporan Hasil Pemeriksaan (LHP) yang Diselesaikan Tepat Waktu',
                        'baseline_kegiatan' => '35 LHP',
                        'target_kegiatan' => '55 LHP',
                        'satuan_kegiatan' => 'LHP',
                        'subkegiatan' => 'Pengawasan Internal Secara Berkala',
                        'ik_subkegiatan' => 'Jumlah OPD yang Diperiksa Secara Reguler per Tahun',
                        'baseline_subkegiatan' => '32 OPD',
                        'target_subkegiatan' => '49 OPD',
                        'satuan_subkegiatan' => 'OPD',
                        'risiko' => [
                            'URAIAN RISIKO' => 'Keterbatasan jumlah Auditor dan P2UPD menyebabkan cakupan pemeriksaan tidak memenuhi target PKPT',
                            'TINGKAT RISIKO' => 'Risiko Strategis OPD',
                            'JENIS RISIKO' => 'Risiko Kepatuhan',
                            'PEMILIK RISIKO' => 'Inspektur Pembantu Wilayah I',
                            'URAIAN PENYEBAB RISIKO' => 'Men (Jumlah Auditor bersertifikat tidak sebanding dengan jumlah OPD yang wajib diperiksa setiap tahun)',
                            'SUMBER SEBAB RISIKO' => 'Internal (Formasi dan Distribusi SDM Fungsional Auditor)',
                            'URAIAN DAMPAK RISIKO' => 'Sejumlah OPD tidak sempat diperiksa sesuai PKPT sehingga potensi penyimpangan tidak terdeteksi dini',
                            'PIHAK YANG TERKENA DAMPAK RISIKO' => 'Seluruh OPD Pemerintah Kabupaten Aceh Barat',
                            'URAIAN PENGENDALIAN YANG SUDAH ADA' => 'Penyusunan skala prioritas OPD berdasarkan tingkat risiko (risk-based audit planning)',
                            'KATEGORI EXISTING CONTROL' => 'KE (Kontrol sudah bersifat preventif, tetapi cakupannya belum menutup celah yang teridentifikasi di bawah)',
                            'CELAH PENGENDALIAN' => 'Belum ada usulan formasi CPNS/PPPK jabatan fungsional auditor dalam 3 tahun terakhir',
                            'RENCANA TINDAK PENGENDALIAN' => 'Mitigate (Mengusulkan penambahan formasi jabatan fungsional Auditor dan P2UPD kepada BKPSDM)',
                            'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => 'INSPEKTORAT',
                            'PENANGGUNG JAWAB PENGENDALIAN' => 'Sekretaris Inspektorat',
                            'TRIWULAN' => 'Triwulan I',
                            'TAHUN TARGET PENYELESAIAN' => '2027',
                            'SKALA DAMPAK' => '4',
                            'SKALA KEMUNGKINAN' => '4',
                            'SKALA RISIKO' => '16',
                            'SKALA PRIORITAS' => 3,
                        ],
                    ],
                    [
                        'sasaran_rpjmd' => 'Terwujudnya Tata Kelola Pemerintahan yang Bersih, Akuntabel dan Transparan',
                        'tujuan' => 'Meningkatnya Efektivitas Pengawasan Internal Pemerintah Daerah',
                        'ik_tujuan' => 'Tingkat Maturitas Sistem Pengendalian Intern Pemerintah (SPIP)',
                        'baseline_tujuan' => 'Level 2',
                        'target_tujuan' => 'Level 4',
                        'satuan_tujuan' => 'Level',
                        'sasaran' => 'Meningkatnya Akuntabilitas Kinerja dan Keuangan Perangkat Daerah',
                        'ik_sasaran' => 'Persentase OPD dengan Nilai Evaluasi SAKIP Kategori B ke Atas',
                        'baseline_sasaran' => '60%',
                        'target_sasaran' => '85%',
                        'satuan_sasaran' => 'Persen',
                        'program' => 'Program Perumusan Kebijakan, Pendampingan dan Asistensi',
                        'ik_program' => 'Persentase OPD yang Mendapatkan Pendampingan Reviu Laporan Keuangan',
                        'baseline_program' => '80%',
                        'target_program' => '100%',
                        'satuan_program' => 'Persen',
                        'kegiatan' => 'Pendampingan dan Asistensi',
                        'ik_kegiatan' => 'Jumlah OPD yang Didampingi dalam Penyusunan Laporan Kinerja',
                        'baseline_kegiatan' => '38 OPD',
                        'target_kegiatan' => '49 OPD',
                        'satuan_kegiatan' => 'OPD',
                        'subkegiatan' => 'Pendampingan dan Asistensi Reviu Laporan Keuangan',
                        'ik_subkegiatan' => 'Jumlah Laporan Keuangan OPD yang Direviu Tepat Waktu',
                        'baseline_subkegiatan' => '40 Laporan',
                        'target_subkegiatan' => '49 Laporan',
                        'satuan_subkegiatan' => 'Laporan',
                        'risiko' => null,
                    ],
                ],
                'kro' => [
                    [
                        'sasaran_renstra' => 'Meningkatnya Kualitas dan Kuantitas Pengawasan atas Penyelenggaraan Pemerintahan Daerah',
                        'program' => 'Program Penyelenggaraan Pengawasan',
                        'ik_program' => 'Persentase OPD yang Diaudit Sesuai Program Kerja Pengawasan Tahunan (PKPT)',
                        'baseline_program' => '75%',
                        'target_program' => '100% Tahun 2026',
                        'satuan_program' => 'Persen',
                        'kegiatan' => 'Pengawasan Internal',
                        'ik_kegiatan' => 'Jumlah Laporan Hasil Pemeriksaan (LHP) yang Diselesaikan Tepat Waktu',
                        'baseline_kegiatan' => '35 LHP',
                        'target_kegiatan' => '55 LHP Tahun 2026',
                        'satuan_kegiatan' => 'LHP',
                        'subkegiatan' => 'Pengawasan Internal Secara Berkala',
                        'ik_subkegiatan' => 'Jumlah OPD yang Diperiksa Secara Reguler per Tahun',
                        'baseline_subkegiatan' => '32 OPD',
                        'target_subkegiatan' => '49 OPD',
                        'satuan_subkegiatan' => 'OPD',
                        'risiko' => [
                            'URAIAN RISIKO' => 'Tindak lanjut rekomendasi hasil pemeriksaan oleh OPD terperiksa berjalan lambat',
                            'TINGKAT RISIKO' => 'Risiko Operasional OPD',
                            'JENIS RISIKO' => 'Risiko Kepatuhan',
                            'PEMILIK RISIKO' => 'Inspektur Pembantu Wilayah II',
                            'URAIAN PENYEBAB RISIKO' => 'Method (Belum ada sistem pemantauan tindak lanjut LHP yang terintegrasi dan dapat diakses OPD secara mandiri)',
                            'SUMBER SEBAB RISIKO' => 'Internal (Mekanisme Pemantauan Tindak Lanjut Hasil Pemeriksaan)',
                            'URAIAN DAMPAK RISIKO' => 'Akumulasi temuan berulang yang berpotensi menjadi temuan BPK RI pada pemeriksaan berikutnya',
                            'PIHAK YANG TERKENA DAMPAK RISIKO' => 'OPD Terperiksa dan Pemerintah Kabupaten Aceh Barat',
                            'URAIAN PENGENDALIAN YANG SUDAH ADA' => 'Surat teguran berkala kepada OPD yang belum menindaklanjuti rekomendasi',
                            'KATEGORI EXISTING CONTROL' => 'KE (Kontrol sudah bersifat detektif, tetapi belum cukup responsif menutup celah yang teridentifikasi di bawah)',
                            'CELAH PENGENDALIAN' => 'Belum ada aplikasi pemantauan tindak lanjut LHP berbasis web',
                            'RENCANA TINDAK PENGENDALIAN' => 'Mitigate (Membangun aplikasi e-Tindak Lanjut LHP terintegrasi untuk seluruh OPD)',
                            'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => 'INSPEKTORAT',
                            'PENANGGUNG JAWAB PENGENDALIAN' => 'Inspektur Pembantu Wilayah II',
                            'TRIWULAN' => 'Triwulan IV',
                            'TAHUN TARGET PENYELESAIAN' => '2026',
                            'SKALA DAMPAK' => '3',
                            'SKALA KEMUNGKINAN' => '4',
                            'SKALA RISIKO' => '12',
                            'SKALA PRIORITAS' => 8,
                        ],
                    ],
                    [
                        'sasaran_renstra' => 'Meningkatnya Akuntabilitas Kinerja dan Keuangan Perangkat Daerah',
                        'program' => 'Program Perumusan Kebijakan, Pendampingan dan Asistensi',
                        'ik_program' => 'Persentase OPD yang Mendapatkan Pendampingan Reviu Laporan Keuangan',
                        'baseline_program' => '80%',
                        'target_program' => '100% Tahun 2026',
                        'satuan_program' => 'Persen',
                        'kegiatan' => 'Pendampingan dan Asistensi',
                        'ik_kegiatan' => 'Jumlah OPD yang Didampingi dalam Penyusunan Laporan Kinerja',
                        'baseline_kegiatan' => '38 OPD',
                        'target_kegiatan' => '49 OPD Tahun 2026',
                        'satuan_kegiatan' => 'OPD',
                        'subkegiatan' => 'Pendampingan dan Asistensi Reviu Laporan Keuangan',
                        'ik_subkegiatan' => 'Jumlah Laporan Keuangan OPD yang Direviu Tepat Waktu',
                        'baseline_subkegiatan' => '40 Laporan',
                        'target_subkegiatan' => '49 Laporan',
                        'satuan_subkegiatan' => 'Laporan',
                        'risiko' => null,
                    ],
                ],
            ],

            'BLUD RSUD CUT NYAK DHIEN' => [
                'krs' => [
                    [
                        'sasaran_rpjmd' => 'Meningkatnya Kesejahteraan Sosial dan Perlindungan bagi Penyandang Masalah Kesejahteraan Sosial (PMKS)',
                        'tujuan' => 'Meningkatnya Mutu dan Aksesibilitas Pelayanan Kesehatan Rujukan',
                        'ik_tujuan' => 'Indeks Kepuasan Masyarakat Layanan Rumah Sakit',
                        'baseline_tujuan' => '76 Indeks',
                        'target_tujuan' => '88 Indeks',
                        'satuan_tujuan' => 'Indeks',
                        'sasaran' => 'Meningkatnya Kualitas Pelayanan Gawat Darurat dan Rawat Inap',
                        'ik_sasaran' => 'Response Time Pelayanan Gawat Darurat',
                        'baseline_sasaran' => '12 Menit',
                        'target_sasaran' => '5 Menit',
                        'satuan_sasaran' => 'Menit',
                        'program' => 'Program Pemenuhan Upaya Kesehatan Perorangan dan Upaya Kesehatan Masyarakat',
                        'ik_program' => 'Bed Occupancy Rate (BOR) Rumah Sakit',
                        'baseline_program' => '62%',
                        'target_program' => '75%',
                        'satuan_program' => 'Persen',
                        'kegiatan' => 'Pengelolaan Pelayanan Kesehatan Rujukan pada Fasyankes Rujukan Tingkat Daerah Kabupaten/Kota',
                        'ik_kegiatan' => 'Jumlah Pasien Rujukan yang Tertangani Sesuai Standar Pelayanan Minimal',
                        'baseline_kegiatan' => '6.200 Pasien',
                        'target_kegiatan' => '8.500 Pasien',
                        'satuan_kegiatan' => 'Pasien',
                        'subkegiatan' => 'Pengelolaan Pelayanan Kesehatan bagi Penduduk Terdampak Krisis Kesehatan Akibat Bencana dan/atau Berpotensi Bencana',
                        'ik_subkegiatan' => 'Jumlah Tenaga Kesehatan Siaga Bencana yang Terlatih',
                        'baseline_subkegiatan' => '25 Orang',
                        'target_subkegiatan' => '45 Orang',
                        'satuan_subkegiatan' => 'Orang',
                        'risiko' => [
                            'URAIAN RISIKO' => 'Keterlambatan penanganan pasien gawat darurat akibat kepadatan pasien melebihi kapasitas ruang IGD',
                            'TINGKAT RISIKO' => 'Risiko Operasional OPD',
                            'JENIS RISIKO' => 'Risiko Operasional',
                            'PEMILIK RISIKO' => 'Kepala Instalasi Gawat Darurat',
                            'URAIAN PENYEBAB RISIKO' => 'Machine (Kapasitas ruang dan bed IGD tidak sebanding dengan jumlah kunjungan pasien yang terus meningkat)',
                            'SUMBER SEBAB RISIKO' => 'Internal (Kapasitas Sarana dan Prasarana IGD)',
                            'URAIAN DAMPAK RISIKO' => 'Response time penanganan pasien gawat darurat melebihi standar, berpotensi memperburuk kondisi pasien',
                            'PIHAK YANG TERKENA DAMPAK RISIKO' => 'Pasien Gawat Darurat dan Keluarga',
                            'URAIAN PENGENDALIAN YANG SUDAH ADA' => 'Penerapan sistem triase untuk memprioritaskan pasien berdasarkan tingkat kegawatan',
                            'KATEGORI EXISTING CONTROL' => 'KE (Kontrol sudah bersifat preventif, tetapi cakupannya belum menutup celah yang teridentifikasi di bawah)',
                            'CELAH PENGENDALIAN' => 'Belum ada perluasan fisik ruang IGD sesuai proyeksi kebutuhan 5 tahun ke depan',
                            'RENCANA TINDAK PENGENDALIAN' => 'Mitigate (Mengusulkan perluasan dan renovasi ruang IGD dalam rencana kerja anggaran)',
                            'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => 'BLUD RSUD CUT NYAK DHIEN',
                            'PENANGGUNG JAWAB PENGENDALIAN' => 'Kepala Instalasi Gawat Darurat',
                            'TRIWULAN' => 'Triwulan II',
                            'TAHUN TARGET PENYELESAIAN' => '2027',
                            'SKALA DAMPAK' => '4',
                            'SKALA KEMUNGKINAN' => '3',
                            'SKALA RISIKO' => '12',
                            'SKALA PRIORITAS' => 5,
                        ],
                    ],
                    [
                        'sasaran_rpjmd' => 'Meningkatnya Kesejahteraan Sosial dan Perlindungan bagi Penyandang Masalah Kesejahteraan Sosial (PMKS)',
                        'tujuan' => 'Meningkatnya Mutu dan Aksesibilitas Pelayanan Kesehatan Rujukan',
                        'ik_tujuan' => 'Indeks Kepuasan Masyarakat Layanan Rumah Sakit',
                        'baseline_tujuan' => '76 Indeks',
                        'target_tujuan' => '88 Indeks',
                        'satuan_tujuan' => 'Indeks',
                        'sasaran' => 'Meningkatnya Kemandirian Keuangan BLUD',
                        'ik_sasaran' => 'Rasio Pendapatan BLUD terhadap Total Biaya Operasional',
                        'baseline_sasaran' => '55%',
                        'target_sasaran' => '75%',
                        'satuan_sasaran' => 'Persen',
                        'program' => 'Program Peningkatan Kapasitas Sumber Daya Manusia Kesehatan',
                        'ik_program' => 'Persentase Tenaga Kesehatan yang Memenuhi Standar Kompetensi',
                        'baseline_program' => '70%',
                        'target_program' => '92%',
                        'satuan_program' => 'Persen',
                        'kegiatan' => 'Peningkatan Kapasitas Sumber Daya Manusia Kesehatan',
                        'ik_kegiatan' => 'Jumlah Tenaga Kesehatan yang Mengikuti Pelatihan dan Sertifikasi',
                        'baseline_kegiatan' => '48 Orang',
                        'target_kegiatan' => '90 Orang',
                        'satuan_kegiatan' => 'Orang',
                        'subkegiatan' => 'Pelatihan Peningkatan Kapasitas Sumber Daya Manusia Kesehatan Tingkat Daerah Kabupaten/Kota',
                        'ik_subkegiatan' => 'Jumlah Pelatihan Teknis yang Diselenggarakan per Tahun',
                        'baseline_subkegiatan' => '6 Pelatihan',
                        'target_subkegiatan' => '14 Pelatihan',
                        'satuan_subkegiatan' => 'Pelatihan',
                        'risiko' => null,
                    ],
                ],
                'kro' => [
                    [
                        'sasaran_renstra' => 'Meningkatnya Kualitas Pelayanan Gawat Darurat dan Rawat Inap',
                        'program' => 'Program Pemenuhan Upaya Kesehatan Perorangan dan Upaya Kesehatan Masyarakat',
                        'ik_program' => 'Bed Occupancy Rate (BOR) Rumah Sakit',
                        'baseline_program' => '62%',
                        'target_program' => '75% Tahun 2026',
                        'satuan_program' => 'Persen',
                        'kegiatan' => 'Pengelolaan Pelayanan Kesehatan Rujukan pada Fasyankes Rujukan Tingkat Daerah Kabupaten/Kota',
                        'ik_kegiatan' => 'Jumlah Pasien Rujukan yang Tertangani Sesuai Standar Pelayanan Minimal',
                        'baseline_kegiatan' => '6.200 Pasien',
                        'target_kegiatan' => '8.500 Pasien Tahun 2026',
                        'satuan_kegiatan' => 'Pasien',
                        'subkegiatan' => 'Pengelolaan Pelayanan Kesehatan bagi Penduduk Terdampak Krisis Kesehatan Akibat Bencana dan/atau Berpotensi Bencana',
                        'ik_subkegiatan' => 'Jumlah Tenaga Kesehatan Siaga Bencana yang Terlatih',
                        'baseline_subkegiatan' => '25 Orang',
                        'target_subkegiatan' => '45 Orang',
                        'satuan_subkegiatan' => 'Orang',
                        'risiko' => [
                            'URAIAN RISIKO' => 'Stok obat dan alat kesehatan esensial di farmasi rumah sakit sering mengalami kekosongan',
                            'TINGKAT RISIKO' => 'Risiko Operasional OPD',
                            'JENIS RISIKO' => 'Risiko Operasional',
                            'PEMILIK RISIKO' => 'Kepala Instalasi Farmasi',
                            'URAIAN PENYEBAB RISIKO' => 'Method (Perencanaan kebutuhan obat belum berbasis data konsumsi historis yang akurat)',
                            'SUMBER SEBAB RISIKO' => 'Internal (Sistem Perencanaan dan Pengadaan Farmasi)',
                            'URAIAN DAMPAK RISIKO' => 'Pasien terpaksa membeli obat secara mandiri di luar rumah sakit atau tertunda mendapatkan terapi',
                            'PIHAK YANG TERKENA DAMPAK RISIKO' => 'Pasien Rawat Inap dan Rawat Jalan',
                            'URAIAN PENGENDALIAN YANG SUDAH ADA' => 'Monitoring stok obat mingguan oleh instalasi farmasi',
                            'KATEGORI EXISTING CONTROL' => 'KE (Kontrol sudah bersifat detektif, tetapi belum cukup responsif menutup celah yang teridentifikasi di bawah)',
                            'CELAH PENGENDALIAN' => 'Belum ada sistem informasi farmasi yang terintegrasi dengan data rekam medis untuk prediksi kebutuhan',
                            'RENCANA TINDAK PENGENDALIAN' => 'Mitigate (Implementasi sistem informasi manajemen farmasi rumah sakit / e-farmasi)',
                            'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => 'BLUD RSUD CUT NYAK DHIEN',
                            'PENANGGUNG JAWAB PENGENDALIAN' => 'Kepala Instalasi Farmasi',
                            'TRIWULAN' => 'Triwulan III',
                            'TAHUN TARGET PENYELESAIAN' => '2026',
                            'SKALA DAMPAK' => '3',
                            'SKALA KEMUNGKINAN' => '3',
                            'SKALA RISIKO' => '9',
                            'SKALA PRIORITAS' => 13,
                        ],
                    ],
                    [
                        'sasaran_renstra' => 'Meningkatnya Kemandirian Keuangan BLUD',
                        'program' => 'Program Peningkatan Kapasitas Sumber Daya Manusia Kesehatan',
                        'ik_program' => 'Persentase Tenaga Kesehatan yang Memenuhi Standar Kompetensi',
                        'baseline_program' => '70%',
                        'target_program' => '92% Tahun 2026',
                        'satuan_program' => 'Persen',
                        'kegiatan' => 'Peningkatan Kapasitas Sumber Daya Manusia Kesehatan',
                        'ik_kegiatan' => 'Jumlah Tenaga Kesehatan yang Mengikuti Pelatihan dan Sertifikasi',
                        'baseline_kegiatan' => '48 Orang',
                        'target_kegiatan' => '90 Orang Tahun 2026',
                        'satuan_kegiatan' => 'Orang',
                        'subkegiatan' => 'Pelatihan Peningkatan Kapasitas Sumber Daya Manusia Kesehatan Tingkat Daerah Kabupaten/Kota',
                        'ik_subkegiatan' => 'Jumlah Pelatihan Teknis yang Diselenggarakan per Tahun',
                        'baseline_subkegiatan' => '6 Pelatihan',
                        'target_subkegiatan' => '14 Pelatihan',
                        'satuan_subkegiatan' => 'Pelatihan',
                        'risiko' => null,
                    ],
                ],
            ],

            'DINAS KESEHATAN' => [
                'krs' => [
                    [
                        'sasaran_rpjmd' => 'Meningkatkan Kesehatan Masyarakat',
                        'tujuan' => 'Meningkatnya Derajat Kesehatan Masyarakat Melalui Penguatan Upaya Promotif dan Preventif',
                        'ik_tujuan' => 'Angka Harapan Hidup',
                        'baseline_tujuan' => '70,2 Tahun',
                        'target_tujuan' => '71,5 Tahun',
                        'satuan_tujuan' => 'Tahun',
                        'sasaran' => 'Meningkatnya Cakupan Imunisasi Dasar Lengkap pada Bayi',
                        'ik_sasaran' => 'Persentase Bayi yang Mendapatkan Imunisasi Dasar Lengkap',
                        'baseline_sasaran' => '82%',
                        'target_sasaran' => '96%',
                        'satuan_sasaran' => 'Persen',
                        'program' => 'Program Pemenuhan Upaya Kesehatan Perorangan dan Upaya Kesehatan Masyarakat',
                        'ik_program' => 'Persentase Puskesmas yang Melaksanakan Imunisasi Rutin Sesuai Jadwal',
                        'baseline_program' => '88%',
                        'target_program' => '100%',
                        'satuan_program' => 'Persen',
                        'kegiatan' => 'Pengelolaan Pelayanan Kesehatan Ibu Hamil, Bersalin, Bayi dan Balita',
                        'ik_kegiatan' => 'Jumlah Bayi yang Mendapatkan Imunisasi Lengkap di Puskesmas',
                        'baseline_kegiatan' => '4.100 Bayi',
                        'target_kegiatan' => '5.800 Bayi',
                        'satuan_kegiatan' => 'Bayi',
                        'subkegiatan' => 'Pelaksanaan Imunisasi Rutin, Imunisasi Tambahan dan Imunisasi Khusus',
                        'ik_subkegiatan' => 'Jumlah Puskesmas yang Melaksanakan Imunisasi Sesuai Standar',
                        'baseline_subkegiatan' => '10 Puskesmas',
                        'target_subkegiatan' => '15 Puskesmas',
                        'satuan_subkegiatan' => 'Puskesmas',
                        'risiko' => [
                            'URAIAN RISIKO' => 'Cakupan imunisasi dasar lengkap tidak merata antar wilayah, terutama di desa terpencil',
                            'TINGKAT RISIKO' => 'Risiko Strategis OPD',
                            'JENIS RISIKO' => 'Risiko Operasional',
                            'PEMILIK RISIKO' => 'Kepala Bidang Kesehatan Masyarakat',
                            'URAIAN PENYEBAB RISIKO' => 'Men (Distribusi tenaga kesehatan/bidan desa tidak merata, sejumlah desa terpencil belum memiliki tenaga kesehatan tetap)',
                            'SUMBER SEBAB RISIKO' => 'Internal (Distribusi dan Penempatan Tenaga Kesehatan)',
                            'URAIAN DAMPAK RISIKO' => 'Bayi di desa terpencil berisiko tidak mendapatkan imunisasi lengkap, meningkatkan risiko wabah Penyakit yang Dapat Dicegah dengan Imunisasi (PD3I)',
                            'PIHAK YANG TERKENA DAMPAK RISIKO' => 'Bayi dan Balita di Wilayah Terpencil',
                            'URAIAN PENGENDALIAN YANG SUDAH ADA' => 'Pelaksanaan imunisasi keliling (mobile) ke desa-desa terpencil setiap bulan',
                            'KATEGORI EXISTING CONTROL' => 'KE (Kontrol sudah bersifat preventif, tetapi cakupannya belum menutup celah yang teridentifikasi di bawah)',
                            'CELAH PENGENDALIAN' => 'Frekuensi kunjungan imunisasi keliling belum sesuai jadwal ideal akibat keterbatasan armada',
                            'RENCANA TINDAK PENGENDALIAN' => 'Mitigate (Menambah armada kendaraan puskesmas keliling dan optimalisasi jadwal kunjungan)',
                            'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => 'DINAS KESEHATAN',
                            'PENANGGUNG JAWAB PENGENDALIAN' => 'Kepala Bidang Kesehatan Masyarakat',
                            'TRIWULAN' => 'Triwulan I',
                            'TAHUN TARGET PENYELESAIAN' => '2026',
                            'SKALA DAMPAK' => '4',
                            'SKALA KEMUNGKINAN' => '3',
                            'SKALA RISIKO' => '12',
                            'SKALA PRIORITAS' => 7,
                        ],
                    ],
                    [
                        'sasaran_rpjmd' => 'Meningkatkan Kesehatan Masyarakat',
                        'tujuan' => 'Meningkatnya Derajat Kesehatan Masyarakat Melalui Penguatan Upaya Promotif dan Preventif',
                        'ik_tujuan' => 'Angka Harapan Hidup',
                        'baseline_tujuan' => '70,2 Tahun',
                        'target_tujuan' => '71,5 Tahun',
                        'satuan_tujuan' => 'Tahun',
                        'sasaran' => 'Meningkatnya Pengendalian Penyakit Tidak Menular',
                        'ik_sasaran' => 'Persentase Penduduk Usia 15-59 Tahun yang Mendapatkan Skrining Kesehatan Sesuai Standar',
                        'baseline_sasaran' => '48%',
                        'target_sasaran' => '80%',
                        'satuan_sasaran' => 'Persen',
                        'program' => 'Program Pemenuhan Upaya Kesehatan Perorangan dan Upaya Kesehatan Masyarakat',
                        'ik_program' => 'Persentase Penderita Hipertensi yang Mendapatkan Pelayanan Kesehatan Sesuai Standar',
                        'baseline_program' => '52%',
                        'target_program' => '85%',
                        'satuan_program' => 'Persen',
                        'kegiatan' => 'Pengelolaan Pelayanan Kesehatan bagi Penduduk pada Kondisi Kejadian Luar Biasa (KLB)',
                        'ik_kegiatan' => 'Jumlah Posbindu Penyakit Tidak Menular yang Aktif',
                        'baseline_kegiatan' => '95 Posbindu',
                        'target_kegiatan' => '180 Posbindu',
                        'satuan_kegiatan' => 'Posbindu',
                        'subkegiatan' => 'Pengelolaan Pelayanan Kesehatan Kerja dan Olahraga',
                        'ik_subkegiatan' => 'Jumlah Skrining Kesehatan yang Dilaksanakan di Posbindu',
                        'baseline_subkegiatan' => '3.200 Skrining',
                        'target_subkegiatan' => '7.500 Skrining',
                        'satuan_subkegiatan' => 'Skrining',
                        'risiko' => null,
                    ],
                ],
                'kro' => [
                    [
                        'sasaran_renstra' => 'Meningkatnya Cakupan Imunisasi Dasar Lengkap pada Bayi',
                        'program' => 'Program Pemenuhan Upaya Kesehatan Perorangan dan Upaya Kesehatan Masyarakat',
                        'ik_program' => 'Persentase Puskesmas yang Melaksanakan Imunisasi Rutin Sesuai Jadwal',
                        'baseline_program' => '88%',
                        'target_program' => '100% Tahun 2026',
                        'satuan_program' => 'Persen',
                        'kegiatan' => 'Pengelolaan Pelayanan Kesehatan Ibu Hamil, Bersalin, Bayi dan Balita',
                        'ik_kegiatan' => 'Jumlah Bayi yang Mendapatkan Imunisasi Lengkap di Puskesmas',
                        'baseline_kegiatan' => '4.100 Bayi',
                        'target_kegiatan' => '5.800 Bayi Tahun 2026',
                        'satuan_kegiatan' => 'Bayi',
                        'subkegiatan' => 'Pelaksanaan Imunisasi Rutin, Imunisasi Tambahan dan Imunisasi Khusus',
                        'ik_subkegiatan' => 'Jumlah Puskesmas yang Melaksanakan Imunisasi Sesuai Standar',
                        'baseline_subkegiatan' => '10 Puskesmas',
                        'target_subkegiatan' => '15 Puskesmas',
                        'satuan_subkegiatan' => 'Puskesmas',
                        'risiko' => [
                            'URAIAN RISIKO' => 'Rantai dingin (cold chain) vaksin di beberapa puskesmas terpencil tidak konsisten terjaga sesuai standar suhu',
                            'TINGKAT RISIKO' => 'Risiko Operasional OPD',
                            'JENIS RISIKO' => 'Risiko Operasional',
                            'PEMILIK RISIKO' => 'Koordinator Program Imunisasi',
                            'URAIAN PENYEBAB RISIKO' => 'Machine (Ketersediaan lemari es vaksin dan genset cadangan di puskesmas terpencil terbatas, rawan padam listrik)',
                            'SUMBER SEBAB RISIKO' => 'Internal (Sarana Prasarana Penyimpanan Vaksin)',
                            'URAIAN DAMPAK RISIKO' => 'Potensi kerusakan vaksin akibat suhu penyimpanan tidak sesuai standar, menurunkan efektivitas imunisasi',
                            'PIHAK YANG TERKENA DAMPAK RISIKO' => 'Bayi dan Balita Penerima Imunisasi',
                            'URAIAN PENGENDALIAN YANG SUDAH ADA' => 'Pemantauan suhu vaksin secara manual oleh petugas puskesmas setiap hari',
                            'KATEGORI EXISTING CONTROL' => 'KE (Kontrol sudah bersifat detektif, tetapi belum cukup responsif menutup celah yang teridentifikasi di bawah)',
                            'CELAH PENGENDALIAN' => 'Belum semua puskesmas terpencil memiliki genset cadangan otomatis',
                            'RENCANA TINDAK PENGENDALIAN' => 'Mitigate (Pengadaan genset cadangan otomatis untuk puskesmas rawan padam listrik)',
                            'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => 'DINAS KESEHATAN',
                            'PENANGGUNG JAWAB PENGENDALIAN' => 'Koordinator Program Imunisasi',
                            'TRIWULAN' => 'Triwulan II',
                            'TAHUN TARGET PENYELESAIAN' => '2026',
                            'SKALA DAMPAK' => '3',
                            'SKALA KEMUNGKINAN' => '2',
                            'SKALA RISIKO' => '6',
                            'SKALA PRIORITAS' => 10,
                        ],
                    ],
                    [
                        'sasaran_renstra' => 'Meningkatnya Pengendalian Penyakit Tidak Menular',
                        'program' => 'Program Pemenuhan Upaya Kesehatan Perorangan dan Upaya Kesehatan Masyarakat',
                        'ik_program' => 'Persentase Penderita Hipertensi yang Mendapatkan Pelayanan Kesehatan Sesuai Standar',
                        'baseline_program' => '52%',
                        'target_program' => '85% Tahun 2026',
                        'satuan_program' => 'Persen',
                        'kegiatan' => 'Pengelolaan Pelayanan Kesehatan bagi Penduduk pada Kondisi Kejadian Luar Biasa (KLB)',
                        'ik_kegiatan' => 'Jumlah Posbindu Penyakit Tidak Menular yang Aktif',
                        'baseline_kegiatan' => '95 Posbindu',
                        'target_kegiatan' => '180 Posbindu Tahun 2026',
                        'satuan_kegiatan' => 'Posbindu',
                        'subkegiatan' => 'Pengelolaan Pelayanan Kesehatan Kerja dan Olahraga',
                        'ik_subkegiatan' => 'Jumlah Skrining Kesehatan yang Dilaksanakan di Posbindu',
                        'baseline_subkegiatan' => '3.200 Skrining',
                        'target_subkegiatan' => '7.500 Skrining',
                        'satuan_subkegiatan' => 'Skrining',
                        'risiko' => null,
                    ],
                ],
            ],

            'SEKRETARIAT DAERAH' => [
                'krs' => [
                    [
                        'sasaran_rpjmd' => 'Terwujudnya Tata Kelola Pemerintahan yang Bersih, Akuntabel dan Transparan',
                        'tujuan' => 'Meningkatnya Kualitas Pelayanan Administrasi Pemerintahan',
                        'ik_tujuan' => 'Indeks Reformasi Birokrasi',
                        'baseline_tujuan' => 'B Indeks',
                        'target_tujuan' => 'A Indeks',
                        'satuan_tujuan' => 'Indeks',
                        'sasaran' => 'Meningkatnya Kualitas Perumusan Kebijakan dan Koordinasi Pemerintahan',
                        'ik_sasaran' => 'Persentase Kebijakan Daerah yang Diselesaikan Tepat Waktu',
                        'baseline_sasaran' => '72%',
                        'target_sasaran' => '95%',
                        'satuan_sasaran' => 'Persen',
                        'program' => 'Program Pemerintahan dan Kesejahteraan Rakyat',
                        'ik_program' => 'Persentase Rancangan Produk Hukum Daerah yang Diselesaikan Sesuai Jadwal',
                        'baseline_program' => '65%',
                        'target_program' => '90%',
                        'satuan_program' => 'Persen',
                        'kegiatan' => 'Fasilitasi, Koordinasi, Monitoring dan Evaluasi Bidang Pemerintahan',
                        'ik_kegiatan' => 'Jumlah Rancangan Produk Hukum yang Difasilitasi Bagian Hukum Setdakab',
                        'baseline_kegiatan' => '45 Produk Hukum',
                        'target_kegiatan' => '70 Produk Hukum',
                        'satuan_kegiatan' => 'Produk Hukum',
                        'subkegiatan' => 'Fasilitasi Penyusunan Produk Hukum Daerah',
                        'ik_subkegiatan' => 'Jumlah Rancangan Peraturan Daerah yang Difasilitasi hingga Tahap Pengundangan',
                        'baseline_subkegiatan' => '8 Ranperda',
                        'target_subkegiatan' => '15 Ranperda',
                        'satuan_subkegiatan' => 'Ranperda',
                        'risiko' => [
                            'URAIAN RISIKO' => 'Penyelesaian rancangan produk hukum daerah sering melewati jadwal akibat proses harmonisasi lintas OPD berlarut-larut',
                            'TINGKAT RISIKO' => 'Risiko Strategis OPD',
                            'JENIS RISIKO' => 'Risiko Kepatuhan',
                            'PEMILIK RISIKO' => 'Kepala Bagian Hukum Setdakab',
                            'URAIAN PENYEBAB RISIKO' => 'Method (Mekanisme koordinasi dan harmonisasi rancangan produk hukum antar OPD belum memiliki batas waktu yang mengikat)',
                            'SUMBER SEBAB RISIKO' => 'Internal (Tata Kelola Proses Legislasi dan Harmonisasi Regulasi)',
                            'URAIAN DAMPAK RISIKO' => 'Implementasi kebijakan daerah tertunda, berpotensi menghambat program prioritas OPD terkait',
                            'PIHAK YANG TERKENA DAMPAK RISIKO' => 'OPD Pengusul dan Masyarakat Terdampak Kebijakan',
                            'URAIAN PENGENDALIAN YANG SUDAH ADA' => 'Rapat koordinasi harmonisasi rancangan produk hukum secara berkala',
                            'KATEGORI EXISTING CONTROL' => 'KE (Kontrol sudah bersifat preventif, tetapi cakupannya belum menutup celah yang teridentifikasi di bawah)',
                            'CELAH PENGENDALIAN' => 'Belum ada SOP baku dengan tenggat waktu mengikat untuk setiap tahapan harmonisasi',
                            'RENCANA TINDAK PENGENDALIAN' => 'Mitigate (Menyusun SOP percepatan harmonisasi produk hukum dengan tenggat waktu per tahapan)',
                            'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => 'SEKRETARIAT DAERAH',
                            'PENANGGUNG JAWAB PENGENDALIAN' => 'Kepala Bagian Hukum Setdakab',
                            'TRIWULAN' => 'Triwulan II',
                            'TAHUN TARGET PENYELESAIAN' => '2026',
                            'SKALA DAMPAK' => '3',
                            'SKALA KEMUNGKINAN' => '3',
                            'SKALA RISIKO' => '9',
                            'SKALA PRIORITAS' => 9,
                        ],
                    ],
                    [
                        'sasaran_rpjmd' => 'Terwujudnya Tata Kelola Pemerintahan yang Bersih, Akuntabel dan Transparan',
                        'tujuan' => 'Meningkatnya Kualitas Pelayanan Administrasi Pemerintahan',
                        'ik_tujuan' => 'Indeks Reformasi Birokrasi',
                        'baseline_tujuan' => 'B Indeks',
                        'target_tujuan' => 'A Indeks',
                        'satuan_tujuan' => 'Indeks',
                        'sasaran' => 'Meningkatnya Kualitas Pengadaan Barang dan Jasa Pemerintah',
                        'ik_sasaran' => 'Persentase Paket Pengadaan yang Diselesaikan Tepat Waktu',
                        'baseline_sasaran' => '78%',
                        'target_sasaran' => '96%',
                        'satuan_sasaran' => 'Persen',
                        'program' => 'Program Pengelolaan Pengadaan Barang dan Jasa',
                        'ik_program' => 'Persentase Paket Pengadaan yang Diproses Melalui e-Katalog/e-Purchasing',
                        'baseline_program' => '55%',
                        'target_program' => '85%',
                        'satuan_program' => 'Persen',
                        'kegiatan' => 'Pengelolaan Pengadaan Barang dan Jasa',
                        'ik_kegiatan' => 'Jumlah Paket Pengadaan yang Difasilitasi Bagian Pengadaan Barang dan Jasa',
                        'baseline_kegiatan' => '210 Paket',
                        'target_kegiatan' => '320 Paket',
                        'satuan_kegiatan' => 'Paket',
                        'subkegiatan' => 'Pengelolaan Layanan Pengadaan Secara Elektronik',
                        'ik_subkegiatan' => 'Jumlah Paket Pengadaan yang Diproses Tanpa Sanggahan',
                        'baseline_subkegiatan' => '180 Paket',
                        'target_subkegiatan' => '300 Paket',
                        'satuan_subkegiatan' => 'Paket',
                        'risiko' => null,
                    ],
                ],
                'kro' => [
                    [
                        'sasaran_renstra' => 'Meningkatnya Kualitas Perumusan Kebijakan dan Koordinasi Pemerintahan',
                        'program' => 'Program Pemerintahan dan Kesejahteraan Rakyat',
                        'ik_program' => 'Persentase Rancangan Produk Hukum Daerah yang Diselesaikan Sesuai Jadwal',
                        'baseline_program' => '65%',
                        'target_program' => '90% Tahun 2026',
                        'satuan_program' => 'Persen',
                        'kegiatan' => 'Fasilitasi, Koordinasi, Monitoring dan Evaluasi Bidang Pemerintahan',
                        'ik_kegiatan' => 'Jumlah Rancangan Produk Hukum yang Difasilitasi Bagian Hukum Setdakab',
                        'baseline_kegiatan' => '45 Produk Hukum',
                        'target_kegiatan' => '70 Produk Hukum Tahun 2026',
                        'satuan_kegiatan' => 'Produk Hukum',
                        'subkegiatan' => 'Fasilitasi Penyusunan Produk Hukum Daerah',
                        'ik_subkegiatan' => 'Jumlah Rancangan Peraturan Daerah yang Difasilitasi hingga Tahap Pengundangan',
                        'baseline_subkegiatan' => '8 Ranperda',
                        'target_subkegiatan' => '15 Ranperda',
                        'satuan_subkegiatan' => 'Ranperda',
                        'risiko' => [
                            'URAIAN RISIKO' => 'Duplikasi dan inkonsistensi antar rancangan produk hukum akibat basis data regulasi daerah belum terintegrasi',
                            'TINGKAT RISIKO' => 'Risiko Operasional OPD',
                            'JENIS RISIKO' => 'Risiko Kepatuhan',
                            'PEMILIK RISIKO' => 'Kepala Sub Bagian Dokumentasi Hukum',
                            'URAIAN PENYEBAB RISIKO' => 'Machine (Sistem dokumentasi produk hukum daerah masih manual/tersebar, belum ada basis data terpusat)',
                            'SUMBER SEBAB RISIKO' => 'Internal (Sistem Informasi Dokumentasi Hukum Daerah)',
                            'URAIAN DAMPAK RISIKO' => 'Potensi tumpang tindih regulasi yang membingungkan OPD dan masyarakat dalam implementasi',
                            'PIHAK YANG TERKENA DAMPAK RISIKO' => 'OPD dan Masyarakat Pengguna Layanan',
                            'URAIAN PENGENDALIAN YANG SUDAH ADA' => 'Pengarsipan produk hukum secara manual oleh Bagian Hukum',
                            'KATEGORI EXISTING CONTROL' => 'KE (Kontrol sudah bersifat detektif, tetapi belum cukup responsif menutup celah yang teridentifikasi di bawah)',
                            'CELAH PENGENDALIAN' => 'Belum ada Jaringan Dokumentasi dan Informasi Hukum (JDIH) daerah berbasis digital',
                            'RENCANA TINDAK PENGENDALIAN' => 'Mitigate (Membangun dan mengoperasikan aplikasi JDIH Kabupaten Aceh Barat)',
                            'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => 'SEKRETARIAT DAERAH',
                            'PENANGGUNG JAWAB PENGENDALIAN' => 'Kepala Sub Bagian Dokumentasi Hukum',
                            'TRIWULAN' => 'Triwulan III',
                            'TAHUN TARGET PENYELESAIAN' => '2026',
                            'SKALA DAMPAK' => '2',
                            'SKALA KEMUNGKINAN' => '3',
                            'SKALA RISIKO' => '6',
                            'SKALA PRIORITAS' => 12,
                        ],
                    ],
                    [
                        'sasaran_renstra' => 'Meningkatnya Kualitas Pengadaan Barang dan Jasa Pemerintah',
                        'program' => 'Program Pengelolaan Pengadaan Barang dan Jasa',
                        'ik_program' => 'Persentase Paket Pengadaan yang Diproses Melalui e-Katalog/e-Purchasing',
                        'baseline_program' => '55%',
                        'target_program' => '85% Tahun 2026',
                        'satuan_program' => 'Persen',
                        'kegiatan' => 'Pengelolaan Pengadaan Barang dan Jasa',
                        'ik_kegiatan' => 'Jumlah Paket Pengadaan yang Difasilitasi Bagian Pengadaan Barang dan Jasa',
                        'baseline_kegiatan' => '210 Paket',
                        'target_kegiatan' => '320 Paket Tahun 2026',
                        'satuan_kegiatan' => 'Paket',
                        'subkegiatan' => 'Pengelolaan Layanan Pengadaan Secara Elektronik',
                        'ik_subkegiatan' => 'Jumlah Paket Pengadaan yang Diproses Tanpa Sanggahan',
                        'baseline_subkegiatan' => '180 Paket',
                        'target_subkegiatan' => '300 Paket',
                        'satuan_subkegiatan' => 'Paket',
                        'risiko' => null,
                    ],
                ],
            ],
        ];
    }
}
