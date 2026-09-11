<?php

namespace Database\Seeders;

use App\Models\DataUmum;
use App\Models\FraudRisiko;
use App\Models\Opd;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Register Risiko Fraud Dinas Pendidikan 2026 — kertas kerja sungguhan yang
 * sudah ditandatangani Plt. Kepala Dinas (Meulaboh, Maret 2026).
 *
 * Ditranskripsi dari pindaian "Register Risiko Fraud Disdik.pdf" (lima
 * halaman, tanpa lapisan teks). Tiga risiko pada Kegiatan Seleksi Penerimaan
 * Murid Baru (SPMB) TA. 2026/2027. Skornya diambil dari lembar Analisis
 * Risiko: inheren 4/5, 5/5, 3/5; residu 3/4, 4/5, 2/2 — besaran 17, 24, 7.
 *
 * Ini data OPD pertama di MR Fraud, sekaligus pembanding: hasil cetak Form
 * Cetak FRA untuk OPD ini harus sama dengan pindaian aslinya.
 *
 * Idempoten: dijalankan ulang memperbarui baris yang namanya sama, tidak
 * menggandakan. Data Umum 2026 Disdik dibuat kalau belum ada, HANYA kolom
 * penanda tangannya yang diisi — kolom lain ditinggalkan untuk PIC.
 */
class FraudRegisterDisdik2026Seeder extends Seeder
{
    private const OPD = 'DINAS PENDIDIKAN DAN KEBUDAYAAN';

    private const TAHUN = 2026;

    private const KEGIATAN = 'Kegiatan Seleksi Penerimaan Murid Baru (SPMB) TA. 2026/2027';

    public function run(): void
    {
        $opd = Opd::where('nama', self::OPD)->first();
        $pic = $opd ? User::where('opd_id', $opd->id)->orderBy('id')->first() : null;

        if (! $opd || ! $pic) {
            $this->command?->warn('OPD '.self::OPD.' atau akun PIC-nya tidak ditemukan; seeder dilewati.');

            return;
        }

        foreach (self::RISIKO as $r) {
            FraudRisiko::updateOrCreate(
                ['opd_id' => $opd->id, 'tahun_penilaian' => self::TAHUN, 'nama_risiko' => $r['nama_risiko']],
                $r + ['user_id' => $pic->id, 'kegiatan_dinilai' => self::KEGIATAN],
            );
        }

        // Blok tanda tangan lembar RR dan Peta. Nama OPD di Data Umum mengikuti
        // nama resmi di tabel opd; jabatan mengikuti yang tertera di kertas
        // kerja (Plt.).
        $dataUmum = DataUmum::forOpdAndTahun($opd->id, self::TAHUN);

        $tandaTangan = [
            'nama_kepala_dinas' => 'TEUKU PUTRA AZMISYAH, SE',
            'jabatan_kepala_dinas' => 'Plt. Kepala Dinas Pendidikan Kabupaten Aceh Barat',
            'nip_kepala_dinas' => '19750826 200112 1 001',
            'tempat_pembuatan' => 'Meulaboh',
            'tanggal_pembuatan' => '2026-03-01',
        ];

        if ($dataUmum) {
            $dataUmum->fill(array_filter($tandaTangan, fn ($v, $k) => empty($dataUmum->{$k}), ARRAY_FILTER_USE_BOTH))->save();
        } else {
            DataUmum::create($tandaTangan + [
                'user_id' => $pic->id,
                'pemerintah_kabkota' => 'PEMERINTAH KABUPATEN ACEH BARAT',
                'nama_dinas_opd' => self::OPD,
                'periode_penilaian' => '2025-2029',
                'tahun_penilaian' => (string) self::TAHUN,
            ]);
        }

        $this->command?->info('Register Risiko Fraud Disdik 2026: '.count(self::RISIKO).' risiko untuk '.$opd->nama.'.');
    }

    private const RISIKO = [
        [
            'tahapan_proses' => 'Pendaftaran & Verifikasi Berkas',
            'nama_risiko' => 'Pemalsuan Dokumen Persyaratan Zonasi / Afirmasi',
            'skenario_risiko' => 'Orang tua/wali calon murid memalsukan Kartu Keluarga (KK) atau Surat Keterangan Tidak Mampu (SKTM) agar anak dapat lolos jalur zonasi atau afirmasi di sekolah unggulan/favorit.',
            'uraian_penyebab' => "1. Lemahnya integritas pemohon/masyarakat.\n2. Verifikasi dokumen administrasi oleh panitia sekolah kurang ketat dan belum terintegrasi secara real-time dengan data Dukcapil/Dinsos.",
            'uraian_dampak' => "1. Hak calon siswa yang berhak (sesuai zonasi asli) terampas.\n2. Menurunnya kredibilitas dan transparansi Dinas Pendidikan.",
            'kelompok_risiko' => ['Perbuatan Curang'],
            'probabilitas_inheren' => 4,
            'dampak_inheren' => 5,
            'pengendalian_ada' => 'Ada',
            'pengendalian_uraian' => 'Petunjuk Teknis',
            'pengendalian_memadai' => 'Belum Memadai',
            'probabilitas_residual' => 3,
            'dampak_residual' => 4,
            'pernyataan_penyebab' => "1. Lemahnya integritas pemohon/masyarakat.\n2. Verifikasi dokumen administrasi oleh panitia sekolah kurang ketat dan belum terintegrasi secara real-time dengan data Dukcapil/Dinsos.",
            'rencana_mitigasi' => "1. Melakukan kerja sama/integrasi data verifikasi berkas dengan Dinas Kependudukan dan Pencatatan Sipil (Dukcapil) Aceh Barat.\n2. Membentuk Tim Verifikasi Independen tingkat kabupaten.",
            'jadwal_mitigasi' => 'April s.d. Mei 2026',
            'penanggung_jawab' => 'Kepala Bidang Dikdas/ Tim Teknis SPMB',
        ],
        [
            'tahapan_proses' => 'Seleksi & Penentuan Kelulusan',
            'nama_risiko' => 'Gratifikasi / Suap dalam Penentuan Kelulusan (Siswa Titipan)',
            'skenario_risiko' => 'Pihak sekolah atau oknum pejabat memberikan toleransi/meloloskan calon siswa di luar ketentuan resmi (jalur belakang/titipan) dengan imbalan uang, barang, atau fasilitas.',
            'uraian_penyebab' => "1. Tingginya minat masuk sekolah favorit tidak sebanding dengan daya tampung.\n2. Lemahnya pengawasan internal dan adanya intervensi pihak eksternal/internal.",
            'uraian_dampak' => "1. Kerusakan sistem meritokrasi pendidikan.\n2. Potensi temuan hukum oleh APIP/Aparat Penegak Hukum (APH) dan hilangnya kepercayaan publik.",
            'kelompok_risiko' => ['Perbuatan Curang', 'Benturan Kepentingan dalam Pengadaan'],
            'probabilitas_inheren' => 5,
            'dampak_inheren' => 5,
            'pengendalian_ada' => 'Ada',
            'pengendalian_uraian' => 'Surat Edaran Bupati',
            'pengendalian_memadai' => 'Belum Memadai',
            'probabilitas_residual' => 4,
            'dampak_residual' => 5,
            'pernyataan_penyebab' => "1. Tingginya minat masuk sekolah favorit tidak sebanding dengan daya tampung.\n2. Lemahnya pengawasan internal dan adanya intervensi pihak eksternal/internal.",
            'rencana_mitigasi' => "1. Mempublikasikan seluruh hasil seleksi secara real-time melalui web resmi Dinas Pendidikan.\n2. Membuka Posko Pengaduan Masyarakat/Helpdesk SPMB yang terintegrasi dengan Unit Pengendalian Gratifikasi (UPG).",
            'jadwal_mitigasi' => 'Mei s.d. Juli 2026',
            'penanggung_jawab' => 'Kepala Dinas Pendidikan & Inspektorat (Koordinasi)',
        ],
        [
            'tahapan_proses' => 'Pengumuman & Penetapan Hasil',
            'nama_risiko' => 'Manipulasi Sistem / Hasil Seleksi Online (SPMB Online)',
            'skenario_risiko' => 'Oknum operator atau panitia mengubah database atau skor kelulusan secara manual di luar sistem resmi untuk memasukkan peserta titipan setelah pengumuman.',
            'uraian_penyebab' => "1. Lemahnya pengamanan akses (password/hak akses) sistem aplikasi SPMB.\n2. Kurangnya audit trail/jejak digital pada sistem pengolahan data.",
            'uraian_dampak' => "1. Tuntutan hukum dan protes dari orang tua siswa yang dirugikan.\n2. Hilangnya akuntabilitas tata kelola pemerintahan yang baik (good governance).",
            'kelompok_risiko' => ['Perbuatan Curang'],
            'probabilitas_inheren' => 3,
            'dampak_inheren' => 5,
            'pengendalian_ada' => 'Ada',
            'pengendalian_uraian' => 'Petunjuk Teknis',
            'pengendalian_memadai' => 'Belum Memadai',
            'probabilitas_residual' => 2,
            'dampak_residual' => 2,
            'pernyataan_penyebab' => "1. Lemahnya pengamanan akses (password/hak akses) sistem aplikasi SPMB.\n2. Kurangnya audit trail/jejak digital pada sistem pengolahan data.",
            'rencana_mitigasi' => "1. Melakukan audit sistem keamanan informasi bekerja sama dengan Dinas Komunikasi, Informatika, dan Persandian (Diskominfo).\n2. Enkripsi data hasil seleksi sebelum diumumkan ke publik.",
            'jadwal_mitigasi' => 'April s.d. Juni 2026',
            'penanggung_jawab' => 'Kepala Bidang Dikdas/ Diskominfo',
        ],
    ];
}
