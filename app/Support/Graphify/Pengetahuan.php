<?php

namespace App\Support\Graphify;

/**
 * Lapisan pengetahuan domain Graphify: regulasi yang menjadi dasar fitur dan
 * konsep bisnis MR Kabar, beserta tautannya ke simpul kode/menu/tabel.
 * Tautan memakai pemilih (jenis + pola label) supaya tetap berlaku walau
 * nama berkas berubah sedikit. Tidak memuat data pribadi atau rahasia.
 *
 * Bentuk tautan: [relasi, pemilih]; pemilih = ['id' => ...] atau
 * ['type' => ..., 'label' => regex] (lihat GraphifyService::pilih).
 */
class Pengetahuan
{
    /** @return list<array{id:string, label:string, type:string, desc:string, sumber?:string, tautan?:list<array{0:string, 1:array<string,string>}>}> */
    public static function simpul(): array
    {
        $k = fn (string $pola) => ['type' => 'controller', 'label' => $pola];
        $t = fn (string $pola) => ['type' => 'tabel', 'label' => $pola];
        $m = fn (string $pola) => ['type' => 'menu', 'label' => $pola];
        $md = fn (string $pola) => ['type' => 'modul', 'label' => $pola];
        $l = fn (string $pola) => ['type' => 'layanan', 'label' => $pola];
        $h = fn (string $pola) => ['type' => 'halaman', 'label' => $pola];
        $ko = fn (string $id) => ['id' => 'konsep:'.$id];

        return [
            // ---------------------------------------------------------- regulasi
            ['id' => 'reg:pp-60-2008', 'label' => 'PP 60 Tahun 2008 (SPIP)', 'type' => 'regulasi',
                'desc' => 'Sistem Pengendalian Intern Pemerintah: lima unsur (lingkungan pengendalian, penilaian risiko, kegiatan pengendalian, informasi dan komunikasi, pemantauan). Lingkungan pengendalian terdiri atas delapan sub-unsur yang dievaluasi lewat CEE; penilaian risiko menjadi dasar seluruh modul risiko.',
                'tautan' => [['dasar hukum', $ko('cee')], ['dasar hukum', $ko('manajemen-risiko-pemda')], ['dasar hukum', $ko('lapor-kejadian')]]],
            ['id' => 'reg:perdep-ppkd-4-2019', 'label' => 'Perdep PPKD BPKP No. 4 Tahun 2019', 'type' => 'regulasi',
                'desc' => 'Pedoman Pengelolaan Risiko pada Pemerintah Daerah (Deputi Pengawasan Penyelenggaraan Keuangan Daerah BPKP). Dasar struktur kode risiko, formulir 1–14, lima tahap proses, dan tiga lini pertahanan di MR Kabar.',
                'tautan' => [['dasar hukum', $ko('manajemen-risiko-pemda')], ['dasar hukum', $ko('risiko-strategis-pemda')], ['dasar hukum', $ko('risiko-strategis-pd')], ['dasar hukum', $ko('risiko-operasional-pd')], ['dasar hukum', $ko('tiga-lini')], ['dasar hukum', $ko('matriks-risiko')], ['dasar hukum', $ko('laporan-risiko')]]],
            ['id' => 'reg:perdep-investigasi-1-2019', 'label' => 'Perdep Investigasi BPKP No. 1 Tahun 2019', 'type' => 'regulasi',
                'desc' => 'Padanan Perdep PPKD 4/2019 untuk risiko kecurangan (Fraud Risk Assessment). Matriks 5x5-nya identik dengan matriks risiko umum (risk_matrix_cells), sehingga tidak dibuat matriks kedua.',
                'tautan' => [['dasar hukum', $ko('mr-fraud')]]],
            ['id' => 'reg:permenpan-19-2009', 'label' => 'Permenpan RB No. 19 Tahun 2009', 'type' => 'regulasi',
                'desc' => 'Pedoman Kendali Mutu Audit APIP. Lampirannya memuat 30 Formulir Kendali Mutu (KMA 1–30) yang dipakai di ERPIKA > AREP > Kendali Mutu.',
                'tautan' => [['dasar hukum', $ko('kendali-mutu')]]],
            ['id' => 'reg:perpres-39-2023', 'label' => 'Perpres No. 39 Tahun 2023 (MRPN)', 'type' => 'regulasi',
                'desc' => 'Manajemen Risiko Pembangunan Nasional: risiko lintas entitas. Roadmap enam tahap di docs/ROADMAP_MRPN.md belum dikerjakan, menunggu keputusan Bupati.',
                'tautan' => [['direncanakan', ['type' => 'dokumen', 'label' => '/MRPN/i']]]],
            ['id' => 'reg:perbup-17-2024', 'label' => 'Perbup Aceh Barat No. 17 Tahun 2024 (SOTK Inspektorat)', 'type' => 'regulasi',
                'desc' => 'Susunan organisasi Inspektorat: Inspektur, Sekretaris, Inspektur Pembantu I–IV dan Khusus, dua Kepala Subbagian. Tidak ada jabatan Kepala Bidang atau Kepala Seksi di Inspektorat.',
                'tautan' => [['mengatur', $ko('erpika')], ['mengatur', $ko('struktur-pengelola')]]],
            ['id' => 'reg:pedoman-ppbr', 'label' => 'Pedoman Perencanaan Pengawasan Berbasis Risiko', 'type' => 'regulasi',
                'desc' => 'Keputusan Inspektur tentang penyusunan PKPT berbasis risiko: peta auditan, faktor risiko, kematangan MR, zona frekuensi, penugasan wajib.',
                'tautan' => [['dasar hukum', $ko('pkpt')]]],

            // ---------------------------------------------------------- konsep
            ['id' => 'konsep:manajemen-risiko-pemda', 'label' => 'Manajemen Risiko Pemerintah Daerah', 'type' => 'konsep',
                'desc' => 'Inti MR Kabar: lima tahap — penetapan konteks, identifikasi, analisis, evaluasi dan rencana tindak pengendalian (RTP), serta pemantauan dan pelaporan — untuk tiga lapis risiko (strategis Pemda, strategis PD, operasional PD).',
                'tautan' => [['diwujudkan di', $md('/^Form Input$/')], ['diwujudkan di', $md('/^Form Cetak$/')], ['diwujudkan di', $md('/^Form Monitoring/')], ['diwujudkan di', $md('/^Visualisasi$/')], ['dijelaskan di', $md('/Apa itu Manajemen Risiko/')], ['memakai', $ko('matriks-risiko')], ['memakai', $ko('rtp')]]],
            ['id' => 'konsep:risiko-strategis-pemda', 'label' => 'Risiko Strategis Pemda (KRS/IRS Pemda)', 'type' => 'konsep',
                'desc' => 'Konteks (KRS) dan identifikasi (IRS) risiko strategis tingkat Pemerintah Daerah, diturunkan dari sasaran RPJMD. Diagram hierarki Level I.',
                'tautan' => [['dikelola di', $k('/^(KrsPemda|IrsPemda|Kaeres)Controller$/')], ['disimpan di', $t('/^tbl_(krs|irs|krs_irs)_pemda/')], ['ditampilkan di', $m('/Risiko Strategis Pemda|KRS_IRS_Pemda/')], ['disinkronkan oleh', $l('/^KrsIrsSyncService$/')]]],
            ['id' => 'konsep:risiko-strategis-pd', 'label' => 'Risiko Strategis Perangkat Daerah (KRS/IRS PD)', 'type' => 'konsep',
                'desc' => 'Risiko strategis tiap Perangkat Daerah (OPD), diturunkan dari sasaran Renstra PD. Diagram hierarki Level II.',
                'tautan' => [['dikelola di', $k('/^(KrsPd|IrsPd|KaeresPd)Controller$/')], ['disimpan di', $t('/^tbl_(krs_pd|irs_pd|krs_irs_pd)/')], ['ditampilkan di', $m('/Risiko Strategis PD|KRS_IRS_PD/')], ['disinkronkan oleh', $l('/^KrsIrsPdSyncService$/')]]],
            ['id' => 'konsep:risiko-operasional-pd', 'label' => 'Risiko Operasional PD (KRO/IRO PD)', 'type' => 'konsep',
                'desc' => 'Risiko operasional pada tingkat kegiatan/sub-kegiatan Perangkat Daerah. Diagram hierarki Level III.',
                'tautan' => [['dikelola di', $k('/^(KroPd|IroPd|KaeresRo)Controller$/')], ['disimpan di', $t('/^tbl_(kro|iro)/')], ['ditampilkan di', $m('/Risiko Operasional PD|KRO_IRO_PD/')], ['disinkronkan oleh', $l('/^KroIroPdSyncService$/')]]],
            ['id' => 'konsep:matriks-risiko', 'label' => 'Matriks Risiko 5x5', 'type' => 'konsep',
                'desc' => 'Kriteria kemungkinan dan dampak (skala 1–5) menghasilkan skor dan level risiko; satu matriks dipakai bersama oleh risiko umum dan risiko kecurangan.',
                'tautan' => [['disimpan di', $t('/^risk_(matrix_cells|levels|likelihood_criteria|impact_criteria|jenis)$/')], ['disediakan oleh', $l('/^RiskReferenceDataService$/')]]],
            ['id' => 'konsep:rtp', 'label' => 'Rencana Tindak Pengendalian (RTP)', 'type' => 'konsep',
                'desc' => 'Respons atas risiko prioritas beserta pemantauan realisasinya (Formulir 8–9) dan pencatatan kejadian risiko (Formulir 10). Kemiripan RTP antar-OPD diperiksa otomatis.',
                'tautan' => [['dicetak oleh', $k('/^CetakRtpController$/')], ['dipantau di', $k('/^MonitoringEvaluasiController$/')], ['disimpan di', $t('/^(monitoring_rtp|pencatatan_kejadian_risiko|rtp_kemiripan_diabaikan)$/')], ['diperiksa oleh', $l('/^RtpKemiripanService$/')]]],
            ['id' => 'konsep:tiga-lini', 'label' => 'Tiga Lini Pertahanan', 'type' => 'konsep',
                'desc' => 'Lini 1 pemilik risiko (OPD/UPR), lini 2 fungsi pengelola risiko dan kepatuhan, lini 3 APIP (Inspektorat). Tercermin pada peran pengguna dan struktur pengelola risiko.',
                'tautan' => [['tercermin pada', ['type' => 'peran', 'label' => '/./']], ['tercermin pada', $ko('struktur-pengelola')]]],
            ['id' => 'konsep:struktur-pengelola', 'label' => 'Struktur Pengelolaan Risiko', 'type' => 'konsep',
                'desc' => 'Susunan penyelenggara MR Pemda: Sekretaris Daerah sebagai koordinator penyelenggaraan dan Ketua UPR eselon 1/2, komite, unit kepatuhan, dan UPR tiap OPD.',
                'tautan' => [['dicetak oleh', $k('/^CetakStrukturPengelolaController$/')], ['disimpan di', $t('/^struktur_pengelola_risiko$/')]]],
            ['id' => 'konsep:laporan-risiko', 'label' => 'Laporan Pengelolaan Risiko (Formulir 11–14)', 'type' => 'konsep',
                'desc' => 'Laporan pelaksanaan penilaian risiko, laporan berkala, laporan pemantauan unit kepatuhan, dan laporan pembinaan komite.',
                'tautan' => [['dicetak oleh', $k('/^CetakLaporanController$/')], ['disimpan di', $t('/^laporan_narasi$/')]]],
            ['id' => 'konsep:cee', 'label' => 'CEE (Control Environment Evaluation)', 'type' => 'konsep',
                'desc' => 'Evaluasi lingkungan pengendalian per OPD: 1a kuesioner persepsi (8 sub-unsur), 1b berdasarkan dokumen, 1c simpulan survei, 1d RTP CEE. Responden masuk lewat QR.',
                'tautan' => [['dikelola di', $k('/^(CeeForm|CeePertanyaan|CetakCee)Controller$/')], ['disimpan di', $t('/^cee_/')], ['diakses lewat', $k('/^CeeSurveyQrLoginController$/')]]],
            ['id' => 'konsep:data-umum', 'label' => 'Data Umum dan Penanda Tangan', 'type' => 'konsep',
                'desc' => 'Identitas kertas kerja dan penanda tangan per PIC; sumber kepala dan blok tanda tangan seluruh Form Cetak.',
                'tautan' => [['dikelola di', $k('/^DataUmumController$/')], ['disimpan di', $t('/^(data_umum|opd|pengaturan_pemda)$/')], ['dipakai oleh', ['type' => 'kelas', 'label' => '/^SharesCetakContext$/']]]],
            ['id' => 'konsep:cetak-pdf', 'label' => 'Cetak PDF lewat Browsershot', 'type' => 'konsep',
                'desc' => 'Semua Form Cetak dibuat dengan memotret halaman React memakai Chromium (Browsershot), bukan DomPDF; ukuran kertas diambil dari CSS @page.',
                'tautan' => [['dijalankan oleh', $l('/^PdfPrintService$/')]]],
            ['id' => 'konsep:lapor-kejadian', 'label' => 'Lapor Kejadian Risiko', 'type' => 'konsep',
                'desc' => 'Formulir pelaporan kejadian risiko terbuka untuk semua pengguna (termasuk akun bersama lewat QR); rekap per OPD untuk admin.',
                'tautan' => [['dikelola di', $k('/^LaporanKejadianController$/')], ['disimpan di', $t('/^laporan_kejadian_risiko$/')], ['diakses lewat', $k('/^LaporQrLoginController$/')]]],
            ['id' => 'konsep:mr-fraud', 'label' => 'MR Fraud (Fraud Risk Assessment)', 'type' => 'konsep',
                'desc' => 'Identifikasi, analisis, RTP, register, peta, dan kamus risiko kecurangan, serta rekap lapor kejadian kecurangan dan video edukasi.',
                'tautan' => [['dikelola di', $k('/^(FraudRisiko|LaporanKecurangan)Controller$/')], ['disimpan di', $t('/^(fraud_|laporan_kecurangan|pesan_laporan_kecurangan)/')], ['ditampilkan di', $m('/^MR Fraud$/')], ['memakai', $ko('matriks-risiko')]]],
            ['id' => 'konsep:pkpt', 'label' => 'PKPT Berbasis Risiko (PPBR)', 'type' => 'konsep',
                'desc' => 'Perencanaan pengawasan tahunan Inspektorat dari hasil penilaian risiko: periode, peta auditan, faktor risiko, kematangan MR, evaluasi risiko, penugasan wajib, rencana, dan cetak.',
                'tautan' => [['dikelola di', ['type' => 'controller', 'label' => '/^(CetakPkpt|Pkpt\w+)Controller$/']], ['disimpan di', $t('/^pkpt_/')], ['ditampilkan di', $m('/PKPT Berbasis Risiko/')]]],
            ['id' => 'konsep:program-bupati', 'label' => 'Risiko 100 Program Bupati', 'type' => 'konsep',
                'desc' => 'Penandaan dan pemantauan risiko atas program prioritas Bupati beserta usulan dari OPD.',
                'tautan' => [['dikelola di', $k('/^ProgramBupatiRisikoController$/')], ['disimpan di', $t('/^program_(bupati|pembangunan)/')], ['dipakai oleh', ['type' => 'kelas', 'label' => '/^AppendsProgramBupatiTag$/']]]],
            ['id' => 'konsep:erpika', 'label' => 'ERPIKA (sementara di MR Kabar)', 'type' => 'konsep',
                'desc' => 'Sistem perencanaan dan pelaporan pengawasan Inspektorat: RPP, Pegawai, ANEVA, AREP, Database LHP. Harus mandiri (prefiks /erpika, namespace Erpika, tanpa FK ke tabel MR Kabar) karena kelak dipindah ke domain sendiri; sementara hanya untuk admin dan super-admin.',
                'tautan' => [['dikelola di', ['type' => 'controller', 'label' => '/^(Rpp\w*|Analisis|Aneva|Lhp|Pegawai|SuratTugas|KendaliMutu|DataTerhapus)Controller$/']], ['dijaga oleh', ['type' => 'middleware', 'label' => '/^ErpikaHanyaAdmin$/']], ['ditampilkan di', $m('/^ERPIKA$/')], ['memuat', $ko('rpp')], ['memuat', $ko('kendali-mutu')], ['memuat', $ko('database-lhp')]]],
            ['id' => 'konsep:rpp', 'label' => 'Rencana Penugasan Pengawasan (RPP)', 'type' => 'konsep',
                'desc' => 'Dokumen RPP → penugasan → tim (peran PJ, WPJ, Dalnis, KT, AT) dengan hari dalam/luar kantor; sumber data Surat Tugas dan Kendali Mutu. Penanda tangan hanya Inspektur.',
                'tautan' => [['disimpan di', $t('/^rpp/')], ['dikelola di', $k('/^Rpp(Print|Pengaturan)?Controller$/')]]],
            ['id' => 'konsep:kendali-mutu', 'label' => 'Kendali Mutu Audit (AREP)', 'type' => 'konsep',
                'desc' => 'Surat Tugas (ST/SP/Pernyataan Independensi) dan 30 formulir KMA dari data RPP; KM 6/7 mengikuti berkas Inspektorat (1 HP = 6,5 jam), KMA 26 bentuk Yogyakarta, dengan contoh pengisian per formulir.',
                'tautan' => [['dikelola di', $k('/^(SuratTugas|KendaliMutu)Controller$/')], ['dibentuk oleh', ['type' => 'pendukung', 'label' => '/^(KmFormulir|KmKatalog|KmContoh|PedomanKendaliMutu)$/']], ['memakai data', $ko('rpp')]]],
            ['id' => 'konsep:database-lhp', 'label' => 'Database LHP', 'type' => 'konsep',
                'desc' => 'Laporan hasil pemeriksaan pindahan SimHP: temuan, sebab, rekomendasi, tindak lanjut; dipakai KMA 18–21.',
                'tautan' => [['disimpan di', $t('/^lhp/')], ['dikelola di', $k('/^LhpController$/')]]],
            ['id' => 'konsep:keamanan', 'label' => 'Keamanan Akses', 'type' => 'konsep',
                'desc' => 'Peran dan izin (Spatie), menu berizin (CheckMenuPermission, fail-open untuk menu tanpa izin), dua faktor, batas sesi, dan peran peninjau yang hanya-baca.',
                'tautan' => [['ditegakkan oleh', ['type' => 'middleware', 'label' => '/^(CheckMenuPermission|WajibDuaFaktor|ViewerReadOnly|ForceLogoutAfterMaxDuration|RestrictLaporRisikoRole|RestrictCeeSurveyRole)$/']], ['memakai', $l('/^DuaFaktorService$/')]]],
            ['id' => 'konsep:cadangan', 'label' => 'Cadangan, Versi, dan Deploy', 'type' => 'konsep',
                'desc' => 'Cadangan basis data (terenkripsi) di server dan Google Drive, snapshot versi berpasangan, pemeriksaan kesamaan kode dengan GitHub sebelum deploy, dan kesehatan server.',
                'tautan' => [['dikelola di', $k('/^(Backup|CadanganDrive)Controller$/')], ['dijalankan oleh', $l('/^(CadanganService|CadanganDriveService|VersiSnapshotService|PemeriksaanGitService|KesehatanServerService|PeringatanServerService)$/')]]],
            ['id' => 'konsep:data-terhapus', 'label' => 'Soft Delete dan Data Terhapus', 'type' => 'konsep',
                'desc' => 'Penghapusan data risiko bersifat lunak; pemulihan dan hapus permanen lewat menu Data Terhapus (hapus permanen hanya admin).',
                'tautan' => [['dikelola di', $k('/^TrashController$/')]]],
            ['id' => 'konsep:periode', 'label' => 'Tahun Aktif dan Periode Penilaian', 'type' => 'konsep',
                'desc' => 'Seluruh data risiko disaring per tahun/periode penilaian aktif yang dipilih pengguna.',
                'tautan' => [['dikelola di', $k('/^TahunAktifController$/')], ['dipakai oleh', ['type' => 'kelas', 'label' => '/^MenyaringPeriodePenilaian$/']]]],
            ['id' => 'konsep:excel', 'label' => 'Ekspor/Impor Excel Risiko', 'type' => 'konsep',
                'desc' => 'Pertukaran data KRS/IRS/IRO dengan berkas Excel per PIC, lengkap dengan permintaan impor yang ditinjau.',
                'tautan' => [['dikelola di', $k('/^(RiskExcel|KrsPicExcel)Controller$/')], ['disimpan di', $t('/^risk_excel_import_requests$/')], ['didefinisikan oleh', ['type' => 'pendukung', 'label' => '/^RiskExcelRegistry$/']]]],
            ['id' => 'konsep:graphify', 'label' => 'Graphify (peta pengetahuan ini)', 'type' => 'konsep',
                'desc' => 'Peta pengetahuan seluruh MR Kabar yang dibangun dari kode, basis data, menu, dokumen, dan pengetahuan domain; dibangun ulang harian oleh penjadwal atau lewat tombol di Utilities > Graphify.',
                'tautan' => [['dibangun oleh', $l('/^GraphifyService$/')], ['ditampilkan di', $m('/^Graphify$/')]]],
        ];
    }
}
