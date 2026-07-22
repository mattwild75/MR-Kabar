<?php

namespace Database\Seeders;

use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\IrsPemda;
use App\Models\User;
use App\Services\KrsIrsPdSyncService;
use App\Services\KroIroPdSyncService;
use Illuminate\Database\Seeder;

/**
 * Register risiko TAHUN PENILAIAN 2025 (I_b_IRS_Pemda, II_b_IRS_PD,
 * III_b_IRO_PD) untuk 5 OPD yang sudah punya data 2026 (Dinas Sosial,
 * Inspektorat, BLUD RSUD Cut Nyak Dhien, Dinas Kesehatan, Sekretariat
 * Daerah) — dibuat utk menguji fitur pilih Tahun Penilaian di Form Cetak
 * (lihat [[unifikasi-tahun-penilaian]]).
 *
 * Sasaran RPJMD/Renstra & Kegiatan PD dirujuk dari KRS_Pemda/KRS_PD/KRO_PD
 * yang SUDAH ADA (bukan bikin konteks baru) — realistis krn RPJMD/Renstra
 * satu periode dinilai ulang tiap tahun. Uraian risiko/RTP SENGAJA dibuat
 * beda dari baris 2026 milik OPD yang sama, supaya saat Form Cetak
 * dipilih ke tahun 2025 hasilnya benar-benar berbeda dari 2026 (bukan
 * duplikat), sesuai constraint TINGKAT_RISIKO_VALUE per controller
 * (IrsPemdaController/IrsPdController/IroPdController) yang dipaksa di
 * sini scr eksplisit karena insert langsung ke model, bukan lewat
 * controller. Idempotent — dicek via URAIAN RISIKO sebelum insert.
 */
class RegisterRisiko2025Seeder extends Seeder
{
    private const TAHUN = '2025';

    public function run(): void
    {
        foreach ($this->dataset() as $opdNama => $data) {
            $user = User::where('username', $data['username'])->first();
            if (!$user) {
                $this->command?->warn("User '{$data['username']}' tidak ditemukan, dilewati ({$opdNama}).");
                continue;
            }

            $this->seedIrsPemda($user->id, $opdNama, $data['irs_pemda']);
            $this->seedIrsPd($user->id, $opdNama, $data['irs_pd']);
            $this->seedIroPd($user->id, $opdNama, $data['iro_pd']);
        }

        (new KrsIrsPdSyncService())->sync();
        (new KroIroPdSyncService())->sync();

        $this->command?->info('Register risiko tahun 2025 (IRS Pemda, IRS PD, IRO PD, 5 OPD) berhasil di-seed.');
    }

    private function seedIrsPemda(int $userId, string $opdNama, array $row): void
    {
        $exists = IrsPemda::where('URAIAN RISIKO', $row['URAIAN RISIKO'])
            ->where('TAHUN DINILAI RISIKO', self::TAHUN)
            ->exists();
        if ($exists) {
            return;
        }

        IrsPemda::create(array_merge([
            'user_id' => $userId,
            'TINGKAT RISIKO' => 'Risiko Strategis Pemda',
            'TAHUN DINILAI RISIKO' => self::TAHUN,
            'ENTITAS PD YANG MENILAI' => $opdNama,
            'NOMOR URUT RISIKO' => 1,
        ], $row));
    }

    private function seedIrsPd(int $userId, string $opdNama, array $row): void
    {
        $exists = IrsPd::where('URAIAN RISIKO', $row['URAIAN RISIKO'])
            ->where('TAHUN DINILAI RISIKO', self::TAHUN)
            ->exists();
        if ($exists) {
            return;
        }

        IrsPd::create(array_merge([
            'user_id' => $userId,
            'TINGKAT RISIKO' => 'Risiko Strategis OPD',
            'TAHUN DINILAI RISIKO' => self::TAHUN,
            'ENTITAS PD YANG MENILAI' => $opdNama,
            'NOMOR URUT RISIKO' => 1,
        ], $row));
    }

    private function seedIroPd(int $userId, string $opdNama, array $row): void
    {
        $exists = IroPd::where('URAIAN RISIKO', $row['URAIAN RISIKO'])
            ->where('TAHUN DINILAI RISIKO', self::TAHUN)
            ->exists();
        if ($exists) {
            return;
        }

        IroPd::create(array_merge([
            'user_id' => $userId,
            'TINGKAT RISIKO' => 'Risiko Operasional OPD',
            'TAHUN DINILAI RISIKO' => self::TAHUN,
            'ENTITAS PD YANG MENILAI' => $opdNama,
            'NOMOR URUT RISIKO' => 1,
            'C / UC' => 'UC',
        ], $row));
    }

    private function dataset(): array
    {
        return [
            'DINAS SOSIAL' => [
                'username' => 'PIC_DinasSosial',
                'irs_pemda' => [
                    'SASARAN RPJMD' => 'Memperluas Perlindungan Sosial bagi Masyarakat',
                    'URAIAN RISIKO' => 'Penyaluran bantuan sosial Pemda kepada Kelompok Rentan (lansia terlantar, disabilitas berat) belum menjangkau seluruh kecamatan secara merata',
                    'JENIS RISIKO' => '39 - Pemberian Bantuan',
                    'PEMILIK RISIKO' => 'Bupati',
                    'URAIAN PENYEBAB RISIKO' => 'Method (Belum ada pemetaan sebaran Kelompok Rentan per kecamatan yang dijadikan basis alokasi kuota bantuan lintas OPD/Kecamatan)',
                    'SUMBER SEBAB RISIKO' => 'Internal',
                    'C / UC' => 'C',
                    'URAIAN DAMPAK RISIKO' => 'Kecamatan dengan populasi Kelompok Rentan tinggi menerima kuota bantuan yang tidak proporsional, menimbulkan kesenjangan perlindungan sosial antar wilayah',
                    'PIHAK YANG TERKENA DAMPAK RISIKO' => 'Kelompok Rentan (lansia terlantar, penyandang disabilitas berat) di kecamatan dengan kuota tidak proporsional',
                    'URAIAN PENGENDALIAN YANG SUDAH ADA' => 'Alokasi kuota bantuan sosial per kecamatan mengacu proporsi jumlah penduduk secara umum',
                    'KATEGORI EXISTING CONTROL' => 'KE (Alokasi berbasis populasi umum, belum mempertimbangkan sebaran riil Kelompok Rentan)',
                    'CELAH PENGENDALIAN' => 'Belum ada basis data sebaran Kelompok Rentan per kecamatan yang dipakai bersama sbg dasar alokasi kuota',
                    'RENCANA TINDAK PENGENDALIAN' => 'Mitigate (Menyusun pemetaan sebaran Kelompok Rentan per kecamatan berbasis DTKS dan menjadikannya dasar alokasi kuota bantuan tahun berjalan)',
                    'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => 'DINAS SOSIAL',
                    'PENANGGUNG JAWAB PENGENDALIAN' => 'Kepala Dinas Sosial',
                    'TRIWULAN' => 'I',
                    'TAHUN TARGET PENYELESAIAN' => 2025,
                    'SKALA DAMPAK' => 3,
                    'SKALA KEMUNGKINAN' => 3,
                    'SKALA RISIKO' => 14,
                    'SKALA PRIORITAS' => 12,
                ],
                'irs_pd' => [
                    'SASARAN RENSTRA' => 'Meningkatnya Akses Perlindungan Sosial bagi Fakir Miskin dan Kelompok Rentan',
                    'URAIAN RISIKO' => 'Penyaluran bantuan sosial ganda (double-counting) kepada penerima yang sama akibat data DTKS lama masih dipakai bersamaan dengan data hasil pemutakhiran',
                    'JENIS RISIKO' => '39 - Pemberian Bantuan',
                    'PEMILIK RISIKO' => 'Kepala Bidang Perlindungan dan Jaminan Sosial',
                    'URAIAN PENYEBAB RISIKO' => 'Machine (Sistem penyaluran bantuan belum otomatis menandai/menonaktifkan data penerima versi lama begitu data hasil pemutakhiran disahkan)',
                    'SUMBER SEBAB RISIKO' => 'Internal',
                    'C / UC' => 'C',
                    'URAIAN DAMPAK RISIKO' => 'Anggaran bantuan sosial terserap tidak efisien akibat penyaluran ganda, mengurangi kuota bagi penerima baru yang berhak',
                    'PIHAK YANG TERKENA DAMPAK RISIKO' => 'Keluarga miskin baru yang belum sempat terdaftar, Dinas Sosial (akuntabilitas anggaran)',
                    'URAIAN PENGENDALIAN YANG SUDAH ADA' => 'Rekonsiliasi manual data penyaluran dilakukan operator DTKS setiap akhir triwulan',
                    'KATEGORI EXISTING CONTROL' => 'KE (Rekonsiliasi masih manual dan periodik triwulanan, berisiko tidak menangkap perubahan data secara real-time)',
                    'CELAH PENGENDALIAN' => 'Belum ada validasi otomatis NIK penerima terhadap status keaktifan pada data DTKS versi terbaru saat proses penyaluran',
                    'RENCANA TINDAK PENGENDALIAN' => 'Mitigate (Membangun validasi otomatis NIK penerima terhadap status DTKS terbaru pada aplikasi penyaluran sebelum bantuan dicairkan)',
                    'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => 'DINAS SOSIAL',
                    'PENANGGUNG JAWAB PENGENDALIAN' => 'Kepala Bidang Perlindungan dan Jaminan Sosial',
                    'TRIWULAN' => 'II',
                    'TAHUN TARGET PENYELESAIAN' => 2025,
                    'SKALA DAMPAK' => 3,
                    'SKALA KEMUNGKINAN' => 2,
                    'SKALA RISIKO' => 11,
                    'SKALA PRIORITAS' => 15,
                ],
                'iro_pd' => [
                    'KEGIATAN PD' => 'Pengelolaan Data Fakir Miskin Cakupan Daerah Kabupaten/Kota',
                    'URAIAN RISIKO' => 'Petugas pendata di tingkat desa terlambat mengunggah hasil survei lapangan ke aplikasi DTKS pusat akibat kendala jaringan internet di wilayah terpencil',
                    'JENIS RISIKO' => '39 - Pemberian Bantuan',
                    'TAHAP' => 'Pelaksanaan',
                    'PEMILIK RISIKO' => 'Kepala Bidang Perlindungan dan Jaminan Sosial',
                    'URAIAN PENYEBAB RISIKO' => 'Machine (Infrastruktur jaringan internet belum memadai di sejumlah desa/kecamatan pesisir dan pedalaman)',
                    'SUMBER SEBAB RISIKO' => 'Eksternal',
                    'C / UC' => 'UC',
                    'URAIAN DAMPAK RISIKO' => 'Batas waktu pemutakhiran data triwulanan terlewati, sebagian desa tidak terwakili dalam pembaruan DTKS periode berjalan',
                    'PIHAK YANG TERKENA DAMPAK RISIKO' => 'Warga desa terpencil calon penerima bantuan, petugas pendata desa',
                    'URAIAN PENGENDALIAN YANG SUDAH ADA' => 'Petugas pendata diarahkan mencari titik sinyal terdekat (kantor kecamatan/balai desa) untuk mengunggah data',
                    'KATEGORI EXISTING CONTROL' => 'KE (Solusi manual bergantung pada inisiatif petugas, tidak konsisten di semua desa terdampak)',
                    'CELAH PENGENDALIAN' => 'Belum tersedia mode input luring (offline) pada aplikasi pendataan yang bisa disinkronkan begitu jaringan tersedia',
                    'RENCANA TINDAK PENGENDALIAN' => 'Mitigate (Mengusulkan pengadaan fitur input luring (offline-first) pada aplikasi pendataan DTKS yang otomatis sinkron saat jaringan tersedia)',
                    'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => 'DINAS SOSIAL',
                    'PENANGGUNG JAWAB PENGENDALIAN' => 'Kepala Bidang Perlindungan dan Jaminan Sosial',
                    'TRIWULAN' => 'III',
                    'TAHUN TARGET PENYELESAIAN' => 2025,
                    'SKALA DAMPAK' => 2,
                    'SKALA KEMUNGKINAN' => 4,
                    'SKALA RISIKO' => 12,
                    'SKALA PRIORITAS' => 14,
                ],
            ],

            'INSPEKTORAT' => [
                'username' => 'PIC_Inspektorat',
                'irs_pemda' => [
                    'SASARAN RPJMD' => 'Meningkatkan Kualitas ASN',
                    'URAIAN RISIKO' => 'Tindak lanjut rekomendasi hasil pengawasan APIP oleh OPD se-Pemda belum terpantau secara terintegrasi, sehingga sebagian rekomendasi kedaluwarsa tanpa penyelesaian',
                    'JENIS RISIKO' => '38 - Pemeriksaan/Pengawasan',
                    'PEMILIK RISIKO' => 'Bupati',
                    'URAIAN PENYEBAB RISIKO' => 'Method (Pemantauan tindak lanjut rekomendasi hasil pemeriksaan masih dilakukan manual per-surat, belum ada dashboard status tindak lanjut lintas-OPD)',
                    'SUMBER SEBAB RISIKO' => 'Internal',
                    'C / UC' => 'C',
                    'URAIAN DAMPAK RISIKO' => 'Kelemahan tata kelola yang sudah diidentifikasi berulang tidak kunjung diperbaiki, berpotensi menjadi temuan berulang pada pemeriksaan eksternal (BPK)',
                    'PIHAK YANG TERKENA DAMPAK RISIKO' => 'Seluruh OPD objek pemeriksaan, Pemda (risiko opini BPK)',
                    'URAIAN PENGENDALIAN YANG SUDAH ADA' => 'Surat teguran dikirim ke OPD yang belum menindaklanjuti rekomendasi setelah batas waktu terlewati',
                    'KATEGORI EXISTING CONTROL' => 'KE (Bersifat reaktif setelah batas waktu terlewati, belum ada pemantauan progres berkala sebelum jatuh tempo)',
                    'CELAH PENGENDALIAN' => 'Belum ada dashboard status tindak lanjut rekomendasi yang dapat diakses bersama oleh Inspektorat dan OPD terkait',
                    'RENCANA TINDAK PENGENDALIAN' => 'Mitigate (Membangun dashboard pemantauan status tindak lanjut rekomendasi hasil pengawasan yang terintegrasi lintas-OPD, diperbarui berkala)',
                    'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => 'INSPEKTORAT',
                    'PENANGGUNG JAWAB PENGENDALIAN' => 'Inspektur',
                    'TRIWULAN' => 'I',
                    'TAHUN TARGET PENYELESAIAN' => 2025,
                    'SKALA DAMPAK' => 4,
                    'SKALA KEMUNGKINAN' => 3,
                    'SKALA RISIKO' => 17,
                    'SKALA PRIORITAS' => 9,
                ],
                'irs_pd' => [
                    'SASARAN RENSTRA' => 'Meningkatnya Kapabilitas Aparat Pengawasan Intern Pemerintah (APIP)',
                    'URAIAN RISIKO' => 'Jumlah Auditor dan P2UPD bersertifikat di Inspektorat belum mencukupi rasio ideal terhadap jumlah OPD yang wajib diperiksa setiap tahun',
                    'JENIS RISIKO' => '38 - Pemeriksaan/Pengawasan',
                    'PEMILIK RISIKO' => 'Sekretaris Inspektorat',
                    'URAIAN PENYEBAB RISIKO' => 'Men (Jumlah pegawai fungsional Auditor/P2UPD yang lulus sertifikasi belum sebanding dengan beban kerja pemeriksaan tahunan)',
                    'SUMBER SEBAB RISIKO' => 'Internal',
                    'C / UC' => 'C',
                    'URAIAN DAMPAK RISIKO' => 'Cakupan pemeriksaan tahunan tidak menjangkau seluruh OPD sesuai PKPT, sebagian OPD berisiko dua tahun berturut-turut tidak diperiksa',
                    'PIHAK YANG TERKENA DAMPAK RISIKO' => 'OPD yang tidak terjangkau PKPT, Inspektorat (akuntabilitas cakupan pengawasan)',
                    'URAIAN PENGENDALIAN YANG SUDAH ADA' => 'Prioritisasi objek pemeriksaan berdasarkan tingkat risiko OPD (risk-based audit planning)',
                    'KATEGORI EXISTING CONTROL' => 'E (Prioritisasi berbasis risiko sudah diterapkan dan cukup efektif mengoptimalkan sumber daya terbatas)',
                    'CELAH PENGENDALIAN' => 'Belum ada usulan formasi CPNS/kaderisasi Auditor-P2UPD yang mengacu proyeksi kebutuhan 3-5 tahun ke depan',
                    'RENCANA TINDAK PENGENDALIAN' => 'Mitigate (Mengusulkan penambahan formasi jabatan fungsional Auditor/P2UPD serta mendorong pegawai eksisting mengikuti diklat sertifikasi)',
                    'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => 'INSPEKTORAT',
                    'PENANGGUNG JAWAB PENGENDALIAN' => 'Sekretaris Inspektorat',
                    'TRIWULAN' => 'II',
                    'TAHUN TARGET PENYELESAIAN' => 2025,
                    'SKALA DAMPAK' => 3,
                    'SKALA KEMUNGKINAN' => 4,
                    'SKALA RISIKO' => 16,
                    'SKALA PRIORITAS' => 10,
                ],
                'iro_pd' => [
                    'KEGIATAN PD' => 'Pelaksanaan Pengawasan Internal secara Berkala',
                    'URAIAN RISIKO' => 'Jadwal pemeriksaan reguler pada Pedoman Kerja Pengawasan Tahunan (PKPT) bergeser akibat penugasan mendadak (reviu/audit khusus) di tengah tahun berjalan',
                    'JENIS RISIKO' => '38 - Pemeriksaan/Pengawasan',
                    'TAHAP' => 'Perencanaan',
                    'PEMILIK RISIKO' => 'Sekretaris Inspektorat',
                    'URAIAN PENYEBAB RISIKO' => 'Method (PKPT disusun kaku tanpa slot cadangan waktu untuk mengakomodasi penugasan khusus mendadak dari Kepala Daerah/instansi eksternal)',
                    'SUMBER SEBAB RISIKO' => 'Internal',
                    'C / UC' => 'C',
                    'URAIAN DAMPAK RISIKO' => 'Sejumlah OPD yang terjadwal diperiksa pada triwulan berjalan tertunda ke triwulan berikutnya, menumpuk beban kerja akhir tahun',
                    'PIHAK YANG TERKENA DAMPAK RISIKO' => 'OPD yang jadwal pemeriksaannya tertunda, Tim Auditor Inspektorat',
                    'URAIAN PENGENDALIAN YANG SUDAH ADA' => 'Penjadwalan ulang dilakukan manual oleh Sekretaris begitu ada penugasan mendadak',
                    'KATEGORI EXISTING CONTROL' => 'KE (Penjadwalan ulang bersifat reaktif, belum ada buffer waktu yang direncanakan sejak awal)',
                    'CELAH PENGENDALIAN' => 'PKPT belum mengalokasikan slot waktu cadangan (buffer) khusus untuk mengantisipasi penugasan mendadak',
                    'RENCANA TINDAK PENGENDALIAN' => 'Mitigate (Mengalokasikan buffer waktu +-10% pada penyusunan PKPT tahun berikutnya untuk mengakomodasi penugasan khusus mendadak)',
                    'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => 'INSPEKTORAT',
                    'PENANGGUNG JAWAB PENGENDALIAN' => 'Sekretaris Inspektorat',
                    'TRIWULAN' => 'I',
                    'TAHUN TARGET PENYELESAIAN' => 2025,
                    'SKALA DAMPAK' => 2,
                    'SKALA KEMUNGKINAN' => 4,
                    'SKALA RISIKO' => 12,
                    'SKALA PRIORITAS' => 14,
                ],
            ],

            'BLUD RSUD CUT NYAK DHIEN' => [
                'username' => 'PIC_RSUDCutNyakDhien',
                'irs_pemda' => [
                    'SASARAN RPJMD' => 'Meningkatkan Kesehatan Masyarakat',
                    'URAIAN RISIKO' => 'Rujukan pasien dari Puskesmas ke RSUD sering tidak disertai catatan rekam medis awal yang lengkap, memperlambat penanganan gawat darurat',
                    'JENIS RISIKO' => '4 - Kesehatan, Pangan, dan Obat dan Makanan',
                    'PEMILIK RISIKO' => 'Bupati',
                    'URAIAN PENYEBAB RISIKO' => 'Machine (Sistem rekam medis Puskesmas dan RSUD belum terintegrasi dalam satu platform data rujukan)',
                    'SUMBER SEBAB RISIKO' => 'Internal',
                    'C / UC' => 'C',
                    'URAIAN DAMPAK RISIKO' => 'Tenaga medis RSUD harus mengulang anamnesis dan pemeriksaan awal, memperlambat respons penanganan kasus gawat darurat rujukan',
                    'PIHAK YANG TERKENA DAMPAK RISIKO' => 'Pasien rujukan gawat darurat, tenaga medis IGD RSUD',
                    'URAIAN PENGENDALIAN YANG SUDAH ADA' => 'Surat rujukan manual (kertas) disertakan pasien saat dirujuk dari Puskesmas',
                    'KATEGORI EXISTING CONTROL' => 'KE (Surat rujukan manual rentan tidak lengkap/hilang dan tidak real-time)',
                    'CELAH PENGENDALIAN' => 'Belum ada sistem rujukan digital terintegrasi yang menampilkan riwayat rekam medis pasien secara real-time ke RSUD tujuan',
                    'RENCANA TINDAK PENGENDALIAN' => 'Mitigate (Mengembangkan sistem rujukan digital terintegrasi antara Puskesmas dan RSUD yang menampilkan ringkasan rekam medis awal pasien)',
                    'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => 'BLUD RSUD CUT NYAK DHIEN',
                    'PENANGGUNG JAWAB PENGENDALIAN' => 'Direktur RSUD Cut Nyak Dhien',
                    'TRIWULAN' => 'II',
                    'TAHUN TARGET PENYELESAIAN' => 2025,
                    'SKALA DAMPAK' => 4,
                    'SKALA KEMUNGKINAN' => 3,
                    'SKALA RISIKO' => 17,
                    'SKALA PRIORITAS' => 9,
                ],
                'irs_pd' => [
                    'SASARAN RENSTRA' => 'Meningkatnya Kualitas Pelayanan Gawat Darurat dan Rawat Inap',
                    'URAIAN RISIKO' => 'Ketersediaan tempat tidur rawat inap kelas III tidak dapat dipantau secara real-time oleh petugas admisi, menyebabkan pasien menunggu lama untuk mendapat kepastian ruang rawat',
                    'JENIS RISIKO' => '4 - Kesehatan, Pangan, dan Obat dan Makanan',
                    'PEMILIK RISIKO' => 'Kepala Bidang Pelayanan Medis',
                    'URAIAN PENYEBAB RISIKO' => 'Machine (Sistem informasi ketersediaan tempat tidur (bed management system) belum tersedia atau belum terhubung real-time dengan ruang perawatan)',
                    'SUMBER SEBAB RISIKO' => 'Internal',
                    'C / UC' => 'C',
                    'URAIAN DAMPAK RISIKO' => 'Pasien dan keluarga menunggu lama tanpa kepastian, berpotensi menurunkan kepuasan pasien dan indeks mutu pelayanan RSUD',
                    'PIHAK YANG TERKENA DAMPAK RISIKO' => 'Pasien rawat inap kelas III dan keluarga, petugas admisi',
                    'URAIAN PENGENDALIAN YANG SUDAH ADA' => 'Laporan ketersediaan tempat tidur direkap manual oleh perawat ruangan setiap pergantian shift',
                    'KATEGORI EXISTING CONTROL' => 'KE (Rekap manual per-shift belum mencerminkan kondisi real-time antar jam)',
                    'CELAH PENGENDALIAN' => 'Belum ada sistem informasi bed management real-time yang dapat diakses petugas admisi dari pos pendaftaran',
                    'RENCANA TINDAK PENGENDALIAN' => 'Mitigate (Membangun sistem informasi bed management real-time yang terhubung antara ruang rawat inap dan pos admisi)',
                    'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => 'BLUD RSUD CUT NYAK DHIEN',
                    'PENANGGUNG JAWAB PENGENDALIAN' => 'Kepala Bidang Pelayanan Medis',
                    'TRIWULAN' => 'III',
                    'TAHUN TARGET PENYELESAIAN' => 2025,
                    'SKALA DAMPAK' => 3,
                    'SKALA KEMUNGKINAN' => 4,
                    'SKALA RISIKO' => 16,
                    'SKALA PRIORITAS' => 10,
                ],
                'iro_pd' => [
                    'KEGIATAN PD' => 'Penyediaan Layanan Kesehatan untuk UKM dan UKP Rujukan Tingkat Daerah Kabupaten/Kota',
                    'URAIAN RISIKO' => 'Stok obat dan bahan medis habis pakai (BMHP) kategori vital sempat kosong di apotek rawat jalan akibat keterlambatan proses pengadaan ulang (re-order)',
                    'JENIS RISIKO' => '4 - Kesehatan, Pangan, dan Obat dan Makanan',
                    'TAHAP' => 'Pelaksanaan',
                    'PEMILIK RISIKO' => 'Kepala Bidang Pelayanan Medis',
                    'URAIAN PENYEBAB RISIKO' => 'Method (Titik pemesanan ulang/reorder point stok obat vital belum ditetapkan secara sistematis berbasis data konsumsi historis)',
                    'SUMBER SEBAB RISIKO' => 'Internal',
                    'C / UC' => 'C',
                    'URAIAN DAMPAK RISIKO' => 'Pasien rawat jalan terpaksa menebus obat di luar RSUD dengan biaya sendiri, menurunkan mutu layanan farmasi RSUD',
                    'PIHAK YANG TERKENA DAMPAK RISIKO' => 'Pasien rawat jalan pengguna obat kategori vital, Instalasi Farmasi RSUD',
                    'URAIAN PENGENDALIAN YANG SUDAH ADA' => 'Pengecekan stok obat dilakukan mingguan oleh petugas farmasi secara manual',
                    'KATEGORI EXISTING CONTROL' => 'KE (Pengecekan mingguan belum cukup responsif untuk obat dengan pergerakan stok cepat)',
                    'CELAH PENGENDALIAN' => 'Belum ada penetapan reorder point berbasis data konsumsi historis untuk kategori obat vital',
                    'RENCANA TINDAK PENGENDALIAN' => 'Mitigate (Menetapkan reorder point berbasis data konsumsi historis 6 bulan terakhir untuk seluruh obat kategori vital, terintegrasi dengan sistem pengadaan)',
                    'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => 'BLUD RSUD CUT NYAK DHIEN',
                    'PENANGGUNG JAWAB PENGENDALIAN' => 'Kepala Instalasi Farmasi',
                    'TRIWULAN' => 'I',
                    'TAHUN TARGET PENYELESAIAN' => 2025,
                    'SKALA DAMPAK' => 3,
                    'SKALA KEMUNGKINAN' => 3,
                    'SKALA RISIKO' => 14,
                    'SKALA PRIORITAS' => 12,
                ],
            ],

            'DINAS KESEHATAN' => [
                'username' => 'PIC_DinasKesehatan',
                'irs_pemda' => [
                    'SASARAN RPJMD' => 'Meningkatkan Kesehatan Masyarakat',
                    'URAIAN RISIKO' => 'Koordinasi lintas OPD dalam intervensi serentak pencegahan stunting (air bersih, sanitasi, ketahanan pangan) berjalan sektoral tanpa target lokasi prioritas yang sama',
                    'JENIS RISIKO' => '4 - Kesehatan, Pangan, dan Obat dan Makanan',
                    'PEMILIK RISIKO' => 'Bupati',
                    'URAIAN PENYEBAB RISIKO' => 'Method (Belum ada forum konvergensi lintas OPD yang menetapkan daftar desa lokus stunting prioritas secara bersama tiap tahun)',
                    'SUMBER SEBAB RISIKO' => 'Internal',
                    'C / UC' => 'C',
                    'URAIAN DAMPAK RISIKO' => 'Intervensi pencegahan stunting tidak terkonsentrasi di desa prioritas yang sama, menurunkan efektivitas penurunan prevalensi stunting',
                    'PIHAK YANG TERKENA DAMPAK RISIKO' => 'Balita dan ibu hamil di desa lokus stunting, seluruh OPD anggota Tim Percepatan Penurunan Stunting',
                    'URAIAN PENGENDALIAN YANG SUDAH ADA' => 'Rapat koordinasi Tim Percepatan Penurunan Stunting dilaksanakan setiap semester',
                    'KATEGORI EXISTING CONTROL' => 'KE (Rapat semesteran belum menghasilkan daftar lokus prioritas yang mengikat seluruh OPD anggota)',
                    'CELAH PENGENDALIAN' => 'Belum ada Surat Keputusan Bupati yang menetapkan daftar desa lokus stunting prioritas mengikat seluruh OPD terkait',
                    'RENCANA TINDAK PENGENDALIAN' => 'Mitigate (Mengusulkan penerbitan SK Bupati penetapan desa lokus stunting prioritas tahun berjalan sebagai acuan mengikat seluruh OPD)',
                    'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => 'DINAS KESEHATAN',
                    'PENANGGUNG JAWAB PENGENDALIAN' => 'Kepala Dinas Kesehatan',
                    'TRIWULAN' => 'I',
                    'TAHUN TARGET PENYELESAIAN' => 2025,
                    'SKALA DAMPAK' => 4,
                    'SKALA KEMUNGKINAN' => 3,
                    'SKALA RISIKO' => 17,
                    'SKALA PRIORITAS' => 9,
                ],
                'irs_pd' => [
                    'SASARAN RENSTRA' => 'Meningkatnya Cakupan Imunisasi Dasar Lengkap pada Bayi',
                    'URAIAN RISIKO' => 'Rantai dingin (cold chain) vaksin di sejumlah Puskesmas pesisir berisiko terputus akibat pemadaman listrik bergilir yang belum tercakup genset cadangan',
                    'JENIS RISIKO' => '4 - Kesehatan, Pangan, dan Obat dan Makanan',
                    'PEMILIK RISIKO' => 'Kepala Bidang Kesehatan Masyarakat',
                    'URAIAN PENYEBAB RISIKO' => 'Machine (Pasokan listrik di sejumlah Puskesmas pesisir tidak stabil dan sering padam tanpa jadwal pasti)',
                    'SUMBER SEBAB RISIKO' => 'Eksternal',
                    'C / UC' => 'UC',
                    'URAIAN DAMPAK RISIKO' => 'Vaksin yang tersimpan berisiko rusak/tidak poten akibat suhu penyimpanan terganggu, berpotensi menurunkan efektivitas imunisasi',
                    'PIHAK YANG TERKENA DAMPAK RISIKO' => 'Bayi sasaran imunisasi dasar lengkap, petugas pengelola vaksin Puskesmas',
                    'URAIAN PENGENDALIAN YANG SUDAH ADA' => 'Pemantauan suhu lemari vaksin dilakukan manual oleh petugas dua kali sehari',
                    'KATEGORI EXISTING CONTROL' => 'KE (Pemantauan manual dua kali sehari tidak menangkap fluktuasi suhu di luar jam pengecekan)',
                    'CELAH PENGENDALIAN' => 'Belum seluruh Puskesmas pesisir memiliki genset cadangan otomatis (auto-switch) untuk lemari penyimpanan vaksin',
                    'RENCANA TINDAK PENGENDALIAN' => 'Mitigate (Mengusulkan pengadaan genset cadangan otomatis untuk seluruh Puskesmas pesisir yang rawan pemadaman listrik)',
                    'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => 'DINAS KESEHATAN',
                    'PENANGGUNG JAWAB PENGENDALIAN' => 'Kepala Bidang Kesehatan Masyarakat',
                    'TRIWULAN' => 'II',
                    'TAHUN TARGET PENYELESAIAN' => 2025,
                    'SKALA DAMPAK' => 4,
                    'SKALA KEMUNGKINAN' => 2,
                    'SKALA RISIKO' => 13,
                    'SKALA PRIORITAS' => 13,
                ],
                'iro_pd' => [
                    'KEGIATAN PD' => 'Pengelolaan Pelayanan Kesehatan Ibu Hamil, Bersalin, Bayi dan Balita',
                    'URAIAN RISIKO' => 'Kunjungan ANC (Antenatal Care) K4 ibu hamil di sejumlah desa terpencil tidak lengkap akibat jarak tempuh jauh ke Puskesmas dan minimnya kunjungan bidan desa',
                    'JENIS RISIKO' => '4 - Kesehatan, Pangan, dan Obat dan Makanan',
                    'TAHAP' => 'Pelaksanaan',
                    'PEMILIK RISIKO' => 'Kepala Bidang Kesehatan Masyarakat',
                    'URAIAN PENYEBAB RISIKO' => 'Method (Kondisi geografis desa terpencil dengan akses jalan sulit menyulitkan ibu hamil menjangkau Puskesmas secara rutin)',
                    'SUMBER SEBAB RISIKO' => 'Eksternal',
                    'C / UC' => 'UC',
                    'URAIAN DAMPAK RISIKO' => 'Deteksi dini komplikasi kehamilan menjadi kurang optimal, meningkatkan risiko kesehatan ibu dan bayi pada desa terpencil',
                    'PIHAK YANG TERKENA DAMPAK RISIKO' => 'Ibu hamil di desa terpencil, bidan desa',
                    'URAIAN PENGENDALIAN YANG SUDAH ADA' => 'Jadwal kunjungan bidan desa ke rumah ibu hamil disusun bulanan oleh Puskesmas',
                    'KATEGORI EXISTING CONTROL' => 'KE (Jadwal bulanan belum menjamin realisasi kunjungan tepat waktu di desa yang aksesnya paling sulit)',
                    'CELAH PENGENDALIAN' => 'Belum ada skema transportasi khusus (mis. ambulans desa/ojek kesehatan) bagi bidan desa menjangkau lokasi tersulit',
                    'RENCANA TINDAK PENGENDALIAN' => 'Mitigate (Mengusulkan skema dukungan transportasi khusus bagi bidan desa untuk menjangkau desa terpencil dengan aksesibilitas tersulit)',
                    'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => 'DINAS KESEHATAN',
                    'PENANGGUNG JAWAB PENGENDALIAN' => 'Kepala Bidang Kesehatan Masyarakat',
                    'TRIWULAN' => 'IV',
                    'TAHUN TARGET PENYELESAIAN' => 2025,
                    'SKALA DAMPAK' => 3,
                    'SKALA KEMUNGKINAN' => 3,
                    'SKALA RISIKO' => 14,
                    'SKALA PRIORITAS' => 12,
                ],
            ],

            'SEKRETARIAT DAERAH' => [
                'username' => 'PIC_SEKRETARIAT_DAERAH',
                'irs_pemda' => [
                    'SASARAN RPJMD' => 'Meningkatnya Kualitas Perencanaan Pembangunan',
                    'URAIAN RISIKO' => 'Usulan program prioritas hasil Musrenbang tingkat kecamatan sering tidak terakomodasi dalam RKPD akibat keterbatasan pagu indikatif yang tidak dikomunikasikan sejak awal proses',
                    'JENIS RISIKO' => '33 - Penyusunan Kebijakan dan Koordinasi Administratif',
                    'PEMILIK RISIKO' => 'Bupati',
                    'URAIAN PENYEBAB RISIKO' => 'Method (Pagu indikatif per kecamatan/OPD belum diinformasikan di awal pelaksanaan Musrenbang kecamatan, sehingga usulan yang masuk melebihi kapasitas anggaran)',
                    'SUMBER SEBAB RISIKO' => 'Internal',
                    'C / UC' => 'C',
                    'URAIAN DAMPAK RISIKO' => 'Masyarakat kecewa krn usulan prioritas hasil musyawarah desa/kecamatan tidak terealisasi, menurunkan kepercayaan pada proses perencanaan partisipatif',
                    'PIHAK YANG TERKENA DAMPAK RISIKO' => 'Masyarakat peserta Musrenbang, Camat, dan Kepala Desa/Gampong',
                    'URAIAN PENGENDALIAN YANG SUDAH ADA' => 'Rekapitulasi usulan Musrenbang kecamatan disampaikan ke Bappeda untuk dinilai kelayakannya',
                    'KATEGORI EXISTING CONTROL' => 'KE (Penilaian kelayakan dilakukan setelah usulan terkumpul, bukan dibatasi sejak awal dengan pagu indikatif)',
                    'CELAH PENGENDALIAN' => 'Belum ada kebijakan baku yang mewajibkan penyampaian pagu indikatif kecamatan sebelum pelaksanaan Musrenbang',
                    'RENCANA TINDAK PENGENDALIAN' => 'Mitigate (Menetapkan SE Bupati yang mewajibkan penyampaian pagu indikatif per kecamatan sebelum pelaksanaan Musrenbang tahun berjalan)',
                    'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => 'SEKRETARIAT DAERAH',
                    'PENANGGUNG JAWAB PENGENDALIAN' => 'Sekretaris Daerah selaku Koordinator Penyelenggaraan Pengelolaan Risiko Pemda',
                    'TRIWULAN' => 'I',
                    'TAHUN TARGET PENYELESAIAN' => 2025,
                    'SKALA DAMPAK' => 3,
                    'SKALA KEMUNGKINAN' => 4,
                    'SKALA RISIKO' => 16,
                    'SKALA PRIORITAS' => 10,
                ],
                'irs_pd' => [
                    'SASARAN RENSTRA' => 'Meningkatnya Kualitas Perumusan Kebijakan dan Koordinasi Pemerintahan',
                    'URAIAN RISIKO' => 'Notulen dan tindak lanjut hasil rapat koordinasi pimpinan (Rakorpim) tidak terdokumentasi secara terpusat, sehingga keputusan sulit ditelusuri kembali oleh OPD terkait',
                    'JENIS RISIKO' => '33 - Penyusunan Kebijakan dan Koordinasi Administratif',
                    'PEMILIK RISIKO' => 'Asisten Pemerintahan dan Kesejahteraan Rakyat',
                    'URAIAN PENYEBAB RISIKO' => 'Method (Dokumentasi hasil Rakorpim masih tersebar di masing-masing bagian, belum ada repositori terpusat yang dapat diakses seluruh OPD peserta)',
                    'SUMBER SEBAB RISIKO' => 'Internal',
                    'C / UC' => 'C',
                    'URAIAN DAMPAK RISIKO' => 'OPD kesulitan menelusuri keputusan rapat sebelumnya, berpotensi menimbulkan perbedaan pemahaman/pelaksanaan tindak lanjut antar OPD',
                    'PIHAK YANG TERKENA DAMPAK RISIKO' => 'Seluruh OPD peserta Rakorpim',
                    'URAIAN PENGENDALIAN YANG SUDAH ADA' => 'Notulen rapat didistribusikan via surat elektronik ke masing-masing OPD peserta',
                    'KATEGORI EXISTING CONTROL' => 'KE (Distribusi via surel tersebar di banyak folder pribadi, tidak ada satu sumber acuan terpusat)',
                    'CELAH PENGENDALIAN' => 'Belum ada repositori digital terpusat berisi seluruh notulen dan status tindak lanjut Rakorpim yang dapat diakses OPD',
                    'RENCANA TINDAK PENGENDALIAN' => 'Mitigate (Membangun repositori digital terpusat untuk notulen dan status tindak lanjut Rakorpim, dapat diakses seluruh OPD peserta)',
                    'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => 'SEKRETARIAT DAERAH',
                    'PENANGGUNG JAWAB PENGENDALIAN' => 'Kepala Bagian Pemerintahan',
                    'TRIWULAN' => 'II',
                    'TAHUN TARGET PENYELESAIAN' => 2025,
                    'SKALA DAMPAK' => 2,
                    'SKALA KEMUNGKINAN' => 4,
                    'SKALA RISIKO' => 12,
                    'SKALA PRIORITAS' => 14,
                ],
                'iro_pd' => [
                    'KEGIATAN PD' => 'Fasilitasi, Koordinasi, Monitoring dan Evaluasi Bidang Pemerintahan',
                    'URAIAN RISIKO' => 'Laporan monitoring capaian program prioritas dari Kecamatan sering terlambat disampaikan ke Sekretariat Daerah, memperlambat penyusunan bahan evaluasi triwulanan Bupati',
                    'JENIS RISIKO' => '33 - Penyusunan Kebijakan dan Koordinasi Administratif',
                    'TAHAP' => 'Monitoring',
                    'PEMILIK RISIKO' => 'Kepala Bagian Pemerintahan',
                    'URAIAN PENYEBAB RISIKO' => 'Method (Belum ada tenggat waktu baku dan format laporan standar yang wajib diikuti seluruh Kecamatan)',
                    'SUMBER SEBAB RISIKO' => 'Internal',
                    'C / UC' => 'C',
                    'URAIAN DAMPAK RISIKO' => 'Bahan evaluasi triwulanan Bupati tidak lengkap tepat waktu, berpotensi memperlambat pengambilan keputusan koreksi program prioritas',
                    'PIHAK YANG TERKENA DAMPAK RISIKO' => 'Bupati, Camat se-Kabupaten, Bagian Pemerintahan Sekretariat Daerah',
                    'URAIAN PENGENDALIAN YANG SUDAH ADA' => 'Permintaan laporan disampaikan via surat ke seluruh Kecamatan menjelang akhir triwulan',
                    'KATEGORI EXISTING CONTROL' => 'KE (Permintaan menjelang akhir triwulan tidak memberi cukup waktu bagi Kecamatan yang terkendala)',
                    'CELAH PENGENDALIAN' => 'Belum ada SOP baku format dan tenggat waktu pelaporan monitoring yang mengikat seluruh Kecamatan sejak awal triwulan',
                    'RENCANA TINDAK PENGENDALIAN' => 'Mitigate (Menetapkan SOP format dan tenggat waktu pelaporan monitoring capaian program yang mengikat seluruh Kecamatan sejak awal triwulan)',
                    'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => 'SEKRETARIAT DAERAH',
                    'PENANGGUNG JAWAB PENGENDALIAN' => 'Kepala Bagian Pemerintahan',
                    'TRIWULAN' => 'I',
                    'TAHUN TARGET PENYELESAIAN' => 2025,
                    'SKALA DAMPAK' => 2,
                    'SKALA KEMUNGKINAN' => 3,
                    'SKALA RISIKO' => 10,
                    'SKALA PRIORITAS' => 16,
                ],
            ],
        ];
    }
}
