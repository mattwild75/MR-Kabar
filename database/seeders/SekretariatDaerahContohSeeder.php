<?php

namespace Database\Seeders;

use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\IrsPemda;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Contoh data realistis IRS Pemda, IRS PD, dan IRO PD untuk OPD ke-5:
 * Sekretariat Daerah (PIC_SEKRETARIAT_DAERAH). Dipilih khusus krn Sekda
 * punya 2 peran berbeda sesuai Perdep Bab II & Lampiran 2 (Struktur
 * Pengelolaan Risiko), yang sering tertukar:
 * - "Koordinator Penyelenggaraan Pengelolaan Risiko Pemda" — peran TETAP
 *   yang selalu melekat pada Sekda di semua konteks risiko (Pemda maupun
 *   OPD lain), bukan sebagai Pemilik Risiko atas risiko strategis Pemda
 *   itu sendiri (itu tetap Kepala Daerah selaku Ketua UPR Tingkat Pemda,
 *   dgn Sekda sbg salah satu Anggota).
 * - "Pemilik Risiko" (Ketua UPR Tingkat Eselon 1/2) — khusus untuk risiko
 *   OPD Sekretariat Daerah SENDIRI (bukan risiko strategis Pemda
 *   lintas-OPD): Sekda menjadi Ketua UPR di tingkat Setda.
 * Perdep TIDAK menyebut Sekda sbg "Penanggung Jawab Pengendalian" scr
 * eksplisit — istilah itu diisi jabatan teknis yg kompeten sesuai
 * kebutuhan tiap RTP (Bab III, contoh Perdep: Kepala Bidang).
 *
 * PENTING — constraint per-tabel: tbl_irs_pemda (I_b_IRS_Pemda, controller
 * IrsPemdaController::TINGKAT_RISIKO_VALUE) SELALU 'Risiko Strategis
 * Pemda', tbl_irs_pd (II_b) SELALU 'Risiko Strategis OPD', tbl_iro_pd
 * (III_b) SELALU 'Risiko Operasional OPD' — satu tabel, satu tingkat
 * risiko tetap, di-hardcode di controller masing2 saat store()/update()
 * shg mustahil dicampur lewat form UI biasa. Draft awal seeder ini sempat
 * salah menulis baris IrsPemda dgn TINGKAT RISIKO='Risiko Strategis OPD'
 * (melanggar constraint tsb, hanya mungkin lewat seeder langsung ke
 * model, bukan lewat controller) — sudah dikoreksi: baris IRS Pemda di
 * bawah sekarang risiko STRATEGIS PEMDA yg genuine (lintas-OPD, instrumen
 * kontrolnya Perkada/SE Bupati), BEDA substansi dari IrsPd #5
 * ("Meningkatnya Kualitas Koordinasi Penyusunan Kebijakan dan Produk
 * Hukum Daerah") yg sudah representasikan level OPD Setda sendiri.
 *
 * Baris IRS Pemda: Pemilik Risiko = Bupati (Ketua UPR Tingkat Pemda,
 * SELALU Bupati utk baris berlabel Risiko Strategis Pemda — lihat
 * [[struktur-pengelolaan-risiko-sekda]] memory), Penanggung Jawab
 * Pengendalian didelegasikan ke Sekda selaku Koordinator Penyelenggaraan
 * (krn RTP-nya murni koordinasi fasilitatif rapat lintas-OPD, bukan
 * kebijakan/Perkada definitif — analog kasus IRS Pemda #11 Inspektorat).
 * Idempotent — insert hanya jika PIC belum punya baris.
 */
class SekretariatDaerahContohSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('username', 'PIC_SEKRETARIAT_DAERAH')->first();
        if (!$user) {
            $this->command?->warn("User 'PIC_SEKRETARIAT_DAERAH' tidak ditemukan, dilewati.");

            return;
        }

        if (IrsPemda::where('user_id', $user->id)->exists()) {
            $this->command?->info('IRS Pemda Sekretariat Daerah sudah ada, dilewati.');
        } else {
            IrsPemda::create([
                'user_id' => $user->id,
                'SASARAN RPJMD' => 'Menngkatnya Kualitas Perencanaan Pembangunan',
                'URAIAN RISIKO' => 'Kebijakan/regulasi daerah (Perkada/SE) yang mendukung pelaksanaan program prioritas lintas-OPD tidak tersinkronisasi satu sama lain, berpotensi menimbulkan tumpang tindih/konflik norma antar OPD dalam pelaksanaan RPJMD',
                'TINGKAT RISIKO' => 'Risiko Strategis Pemda',
                'TAHUN DINILAI RISIKO' => '2026',
                'JENIS RISIKO' => '33 - Penyusunan Kebijakan dan Koordinasi Administratif',
                'ENTITAS PD YANG MENILAI' => 'SEKRETARIAT DAERAH',
                'PEMILIK RISIKO' => 'Bupati',
                'URAIAN PENYEBAB RISIKO' => 'Belum ada forum koordinasi rutin lintas-OPD yang secara berkala meninjau konsistensi seluruh Perkada/SE yang berlaku terhadap capaian target RPJMD',
                'SUMBER SEBAB RISIKO' => 'Internal (Setiap OPD mengusulkan regulasi sektoralnya masing-masing tanpa mekanisme review silang lintas-OPD yang terjadwal)',
                'C / UC' => 'C (Sepenuhnya dalam kendali internal Pemda, dapat diperbaiki dengan membangun forum koordinasi rutin lintas-OPD)',
                'URAIAN DAMPAK RISIKO' => 'Program prioritas RPJMD berjalan tidak sinkron antar OPD, berisiko pemborosan anggaran akibat duplikasi kebijakan dan memperlambat capaian target strategis pemda',
                'PIHAK YANG TERKENA DAMPAK RISIKO' => 'Seluruh OPD pelaksana program prioritas RPJMD, masyarakat penerima manfaat program',
                'URAIAN PENGENDALIAN YANG SUDAH ADA' => 'Rapat koordinasi ad-hoc antar OPD terkait dilakukan jika ada laporan tumpang tindih kebijakan',
                'KATEGORI EXISTING CONTROL' => 'KE (Koordinasi baru dilakukan reaktif setelah ada laporan masalah, belum ada mekanisme review berkala yang proaktif)',
                'CELAH PENGENDALIAN' => 'Belum ada forum koordinasi lintas-OPD terjadwal yang mengevaluasi konsistensi seluruh kebijakan/Perkada terhadap RPJMD secara berkala',
                'RENCANA TINDAK PENGENDALIAN' => 'Membangun forum koordinasi triwulanan lintas-OPD untuk meninjau konsistensi Perkada/SE yang berlaku terhadap capaian target RPJMD, difasilitasi Sekretariat Daerah',
                'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => 'Sekretariat Daerah',
                'PENANGGUNG JAWAB PENGENDALIAN' => 'Sekretaris Daerah selaku Koordinator Penyelenggaraan Pengelolaan Risiko Pemda',
                'TRIWULAN' => 'II',
                'TAHUN TARGET PENYELESAIAN' => 2026,
                'SKALA DAMPAK' => 3,
                'SKALA KEMUNGKINAN' => 3,
                'SKALA RISIKO' => 14,
                'SKALA PRIORITAS' => 12,
            ]);
        }

        if (IrsPd::where('user_id', $user->id)->exists()) {
            $this->command?->info('IRS PD Sekretariat Daerah sudah ada, dilewati.');
        } else {
            IrsPd::create([
                'user_id' => $user->id,
                'SASARAN RENSTRA' => 'Meningkatnya Kualitas Koordinasi Penyusunan Kebijakan dan Produk Hukum Daerah',
                'URAIAN RISIKO' => 'Rancangan produk hukum daerah yang diusulkan OPD teknis mengandung kesalahan substansi/redaksional sehingga bolak-balik direvisi',
                'TINGKAT RISIKO' => 'Risiko Strategis OPD',
                'TAHUN DINILAI RISIKO' => '2026',
                'JENIS RISIKO' => '33 - Penyusunan Kebijakan dan Koordinasi Administratif',
                'ENTITAS PD YANG MENILAI' => 'SEKRETARIAT DAERAH',
                'PEMILIK RISIKO' => 'Kepala Bagian Hukum Sekretariat Daerah',
                'URAIAN PENYEBAB RISIKO' => 'OPD teknis pengusul belum menggunakan template baku rancangan produk hukum dan minim pemahaman kaidah legal drafting',
                'SUMBER SEBAB RISIKO' => 'Internal (Belum ada pelatihan legal drafting rutin bagi staf OPD teknis pengusul rancangan produk hukum)',
                'C / UC' => 'C (Kualitas rancangan awal dapat ditingkatkan melalui pembinaan internal Bagian Hukum kepada OPD teknis)',
                'URAIAN DAMPAK RISIKO' => 'Proses harmonisasi memakan waktu lebih lama akibat revisi berulang, memperlambat penetapan produk hukum',
                'PIHAK YANG TERKENA DAMPAK RISIKO' => 'OPD teknis pengusul, Bagian Hukum Sekretariat Daerah',
                'URAIAN PENGENDALIAN YANG SUDAH ADA' => 'Template rancangan Perkada/SE sudah tersedia dan dibagikan ke OPD saat konsultasi awal',
                'KATEGORI EXISTING CONTROL' => 'KE (Template sudah tersedia, tetapi penggunaannya belum konsisten karena tidak ada kewajiban formal mengikuti template)',
                'CELAH PENGENDALIAN' => 'Belum ada pelatihan legal drafting terjadwal bagi staf OPD teknis yang rutin mengusulkan produk hukum',
                'RENCANA TINDAK PENGENDALIAN' => 'Menyelenggarakan pelatihan legal drafting bagi staf OPD teknis pengusul produk hukum minimal sekali setahun, serta mewajibkan penggunaan template baku',
                'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => 'Sekretariat Daerah',
                'PENANGGUNG JAWAB PENGENDALIAN' => 'Kepala Bagian Hukum Sekretariat Daerah',
                'TRIWULAN' => 'III',
                'TAHUN TARGET PENYELESAIAN' => 2026,
                'SKALA DAMPAK' => 3,
                'SKALA KEMUNGKINAN' => 2,
                'SKALA RISIKO' => 11,
                'SKALA PRIORITAS' => 15,
            ]);
        }

        if (IroPd::where('user_id', $user->id)->exists()) {
            $this->command?->info('IRO PD Sekretariat Daerah sudah ada, dilewati.');
        } else {
            IroPd::create([
                'user_id' => $user->id,
                'KEGIATAN PD' => 'Fasilitasi Penyusunan Produk Hukum Daerah',
                'URAIAN RISIKO' => 'Keterlambatan penomoran dan pengundangan produk hukum daerah yang sudah selesai diharmonisasi',
                'TINGKAT RISIKO' => 'Risiko Operasional OPD',
                'TAHUN DINILAI RISIKO' => '2026',
                'JENIS RISIKO' => '33 - Penyusunan Kebijakan dan Koordinasi Administratif',
                'ENTITAS PD YANG MENILAI' => 'SEKRETARIAT DAERAH',
                'TAHAP' => 'Pelaporan',
                'PEMILIK RISIKO' => 'Kepala Bagian Hukum Sekretariat Daerah',
                'URAIAN PENYEBAB RISIKO' => 'Antrean penomoran produk hukum menumpuk di akhir tahun anggaran bersamaan dengan banyak usulan lain',
                'SUMBER SEBAB RISIKO' => 'Internal (Belum ada penjadwalan giliran penomoran berbasis prioritas urgensi program)',
                'C / UC' => 'C (Penjadwalan penomoran sepenuhnya dapat diatur ulang secara internal oleh Bagian Hukum)',
                'URAIAN DAMPAK RISIKO' => 'OPD teknis tidak dapat segera melaksanakan program yang membutuhkan produk hukum sudah diundangkan',
                'PIHAK YANG TERKENA DAMPAK RISIKO' => 'OPD teknis pemohon, masyarakat penerima manfaat program terkait',
                'URAIAN PENGENDALIAN YANG SUDAH ADA' => 'Buku register penomoran produk hukum dikelola manual oleh staf Bagian Hukum',
                'KATEGORI EXISTING CONTROL' => 'KE (Register berjalan, tetapi berbasis urutan masuk tanpa mempertimbangkan urgensi program)',
                'CELAH PENGENDALIAN' => 'Belum ada kriteria prioritas penomoran berdasarkan urgensi/tenggat pelaksanaan program OPD pemohon',
                'RENCANA TINDAK PENGENDALIAN' => 'Menetapkan kriteria prioritas penomoran berbasis urgensi program dan menerapkan SLA maksimal 3 hari kerja sejak harmonisasi selesai',
                'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => 'Sekretariat Daerah',
                'PENANGGUNG JAWAB PENGENDALIAN' => 'Kepala Sub Bagian Dokumentasi dan Produk Hukum',
                'TRIWULAN' => 'IV',
                'TAHUN TARGET PENYELESAIAN' => 2026,
                'SKALA DAMPAK' => 2,
                'SKALA KEMUNGKINAN' => 3,
                'SKALA RISIKO' => 10,
                'SKALA PRIORITAS' => 16,
            ]);
        }

        $this->command?->info('Data contoh Sekretariat Daerah (IRS Pemda, IRS PD, IRO PD) berhasil di-seed.');
    }
}
