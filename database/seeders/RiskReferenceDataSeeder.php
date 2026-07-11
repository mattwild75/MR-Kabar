<?php

namespace Database\Seeders;

use App\Models\RiskEntitasPenilai;
use App\Models\RiskImpactCriteria;
use App\Models\RiskJenis;
use App\Models\RiskLevel;
use App\Models\RiskLikelihoodCriteria;
use App\Models\RiskMatrixCell;
use Illuminate\Database\Seeder;

/**
 * Mengisi 6 tabel referensi risiko dengan nilai AWAL — persis sama dengan
 * yang sebelumnya hardcoded di resources/js/lib/irs-reference-data.ts dan
 * IrsPemdaController/IrsPdController/IroPdController. Idempotent
 * (updateOrCreate) — aman dijalankan ulang kalau ada penambahan baris baru
 * di kode ini di masa depan tanpa menghapus perubahan admin yang sudah ada.
 */
class RiskReferenceDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedImpactCriteria();
        $this->seedLikelihoodCriteria();
        $this->seedMatrixCells();
        $this->seedRiskLevels();
        $this->seedJenisRisiko();
        $this->seedEntitasPenilai();

        $this->command?->info('Data referensi risiko (6 tabel) berhasil di-seed.');
    }

    private function seedImpactCriteria(): void
    {
        $rows = [
            1 => [
                'label' => 'Tidak Signifikan',
                'kerugian_negara' => '< Rp 10.000.000',
                'penurunan_reputasi' => 'Keluhan Stakeholder Secara Lisan / Tulisan ke Organisasi, ≥ 3 Kali Dalam Satu Periode',
                'penurunan_kinerja' => 'Pencapaian Target Kinerja ≥ 100%',
                'gangguan_pelayanan' => 'Pelayanan Tertunda ≤ 1 Hari',
                'tuntutan_hukum' => '≤ 5 Kali Dalam Satu Periode',
            ],
            2 => [
                'label' => 'Minor',
                'kerugian_negara' => '> Rp10.000.000 s.d. Rp50.000.000',
                'penurunan_reputasi' => 'Keluhan Stakeholder Secara Lisan / Tulisan ke Organisasi, > 3 Kali Dalam Satu Periode',
                'penurunan_kinerja' => 'Pencapaian Target Kinerja diatas 80% s.d 100%',
                'gangguan_pelayanan' => 'Pelayanan Tertunda diatas 1 Hari s.d 5 hari',
                'tuntutan_hukum' => 'Diatas 5 Kali s.d 15 Kali Dalam Satu Periode',
            ],
            3 => [
                'label' => 'Moderat',
                'kerugian_negara' => '> Rp50.000.000 s.d. Rp100.000.000',
                'penurunan_reputasi' => 'Pemberitaan Negatif di Media Massa Lokal',
                'penurunan_kinerja' => 'Pencapaian Target Kinerja diatas 50% s.d 80%',
                'gangguan_pelayanan' => 'Pelayanan Tertunda diatas 5 Hari s.d 15 Hari',
                'tuntutan_hukum' => 'Diatas 15 Kali s.d 30 Kali Dalam Satu Periode',
            ],
            4 => [
                'label' => 'Signifikan',
                'kerugian_negara' => '> Rp100.000.000 s.d. Rp500.000.000',
                'penurunan_reputasi' => 'Pemberitaan Negatif di Media Massa Nasional',
                'penurunan_kinerja' => 'Pencapaian Target Kinerja diatas 25% s.d 50%',
                'gangguan_pelayanan' => 'Pelayanan Tertunda diatas 15 Hari s.d 30 Hari',
                'tuntutan_hukum' => 'Diatas 30 Kali s.d 50 Kali Dalam Satu Periode',
            ],
            5 => [
                'label' => 'Sangat Signifikan',
                'kerugian_negara' => '> Rp 500.000.000',
                'penurunan_reputasi' => 'Pemberitaan Negatif di Media Massa Internasional',
                'penurunan_kinerja' => 'Pencapaian Target Kinerja < 25%',
                'gangguan_pelayanan' => 'Pelayanan Tertunda Lebih Dari 30 Hari',
                'tuntutan_hukum' => 'Diatas 50 Kali Dalam Satu Periode',
            ],
        ];

        foreach ($rows as $level => $data) {
            RiskImpactCriteria::updateOrCreate(['level' => $level], $data);
        }
    }

    private function seedLikelihoodCriteria(): void
    {
        $rows = [
            1 => ['nama' => 'Hampir Tidak Terjadi', 'probabilitas' => 'Terjadi Kurang dari 5% dari Kejadian Transaksi', 'frekuensi' => 'Terjadi Sangat Jarang, Kurang Dari 2 Kali', 'toleransi' => '1 Kejadian dalam 5 Tahun Terakhir'],
            2 => ['nama' => 'Jarang Terjadi', 'probabilitas' => 'Terjadi Antara 5% s.d 10% dari Kejadian Transaksi', 'frekuensi' => 'Terjadi Jarang, Kurang 2 Kali s.d 10 Kali', 'toleransi' => '1 Kejadian dalam 4 Tahun Terakhir'],
            3 => ['nama' => 'Terjadi', 'probabilitas' => 'Terjadi Antara 10% s.d 20% dari Kejadian Transaksi', 'frekuensi' => 'Terjadi Cukup Sering, Kurang 10 Kali s.d 18 Kali', 'toleransi' => '1 Kejadian dalam 3 Tahun Terakhir'],
            4 => ['nama' => 'Sering Terjadi', 'probabilitas' => 'Terjadi Antara 20% s.d 50% dari Kejadian Transaksi', 'frekuensi' => 'Terjadi Sering, Kurang 18 Kali s.d 26 Kali', 'toleransi' => '1 Kejadian dalam 2 Tahun Terakhir'],
            5 => ['nama' => 'Hampir Pasti Terjadi', 'probabilitas' => 'Terjadi Lebih Dari 50% Kejadian Transaksi', 'frekuensi' => 'Terjadi Sangat Sering, Lebih Dari 26 Kali', 'toleransi' => '1 Kejadian dalam 1 Tahun Terakhir'],
        ];

        foreach ($rows as $level => $data) {
            RiskLikelihoodCriteria::updateOrCreate(['level' => $level], $data);
        }
    }

    private function seedMatrixCells(): void
    {
        // [dampak-1][kemungkinan-1] => skala risiko, identik dgn
        // SKALA_RISIKO_MATRIX lama di 3 controller.
        $skalaMatrix = [
            1 => [1 => 1, 2 => 2, 3 => 4, 4 => 6, 5 => 9],
            2 => [1 => 3, 2 => 7, 3 => 10, 4 => 12, 5 => 15],
            3 => [1 => 5, 2 => 11, 3 => 14, 4 => 16, 5 => 18],
            4 => [1 => 8, 2 => 13, 3 => 17, 4 => 19, 5 => 23],
            5 => [1 => 20, 2 => 21, 3 => 22, 4 => 24, 5 => 25],
        ];

        foreach ($skalaMatrix as $dampak => $row) {
            foreach ($row as $kemungkinan => $skala) {
                RiskMatrixCell::updateOrCreate(
                    ['dampak' => $dampak, 'kemungkinan' => $kemungkinan],
                    ['skala_risiko' => $skala, 'warna_class' => $this->warnaForSkala($skala)]
                );
            }
        }
    }

    private function warnaForSkala(int $skala): string
    {
        if ($skala >= 20) return 'bg-red-500 text-white';
        if ($skala >= 16) return 'bg-orange-400 text-white';
        if ($skala >= 11) return 'bg-yellow-300 text-black';
        if ($skala >= 6) return 'bg-green-400 text-black';

        return 'bg-sky-400 text-white';
    }

    private function seedRiskLevels(): void
    {
        $rows = [
            ['label' => 'Sangat Tinggi', 'skala_min' => 20, 'skala_max' => 25, 'warna_class' => 'bg-red-500 text-white', 'urutan' => 1],
            ['label' => 'Tinggi', 'skala_min' => 16, 'skala_max' => 19, 'warna_class' => 'bg-orange-400 text-white', 'urutan' => 2],
            ['label' => 'Sedang', 'skala_min' => 11, 'skala_max' => 15, 'warna_class' => 'bg-yellow-300 text-black', 'urutan' => 3],
            ['label' => 'Rendah', 'skala_min' => 6, 'skala_max' => 10, 'warna_class' => 'bg-green-400 text-black', 'urutan' => 4],
            ['label' => 'Sangat Rendah', 'skala_min' => 1, 'skala_max' => 5, 'warna_class' => 'bg-sky-400 text-white', 'urutan' => 5],
        ];

        foreach ($rows as $data) {
            RiskLevel::updateOrCreate(['label' => $data['label']], $data);
        }
    }

    private function seedJenisRisiko(): void
    {
        $names = [
            1 => 'Pendidikan', 2 => 'Kesehatan', 3 => 'PU dan Tata Ruang',
            4 => 'Perumahan dan Kawasan Permukiman',
            5 => 'Ketentraman, Ketertiban Umum, dan Perlindungan Masyarakat',
            6 => 'Sosial', 7 => 'Tenaga Kerja',
            8 => 'Pemberdayaan Perempuan dan Pelindungan Anak', 9 => 'Pangan',
            10 => 'Pertanahan', 11 => 'Lingkungan Hidup',
            12 => 'Administrasi kependudukan dan pencatatan sipil',
            13 => 'Pemberdayaan masyarakat dan desa',
            14 => 'Pengendalian penduduk dan keluarga berencana',
            15 => 'Perhubungan', 16 => 'Komunikasi dan informatika',
            17 => 'Koperasi, Usaha Kecil dan Menengah', 18 => 'Penanaman Modal',
            19 => 'Kepemudaan dan olah raga', 20 => 'Statistik', 21 => 'Persandian',
            22 => 'Kebudayaan', 23 => 'Perpustakaan', 24 => 'Kearsipan',
            25 => 'Kelautan dan perikanan', 26 => 'Pariwisata', 27 => 'Pertanian',
            28 => 'Kehutanan/Perkebunan', 29 => 'Energi dan sumber daya mineral',
            30 => 'Perdagangan', 31 => 'Perindustrian', 32 => 'Transmigrasi',
            33 => 'Penyusunan Kebijakan dan Koordinasi Administratif',
            34 => 'Administrasi Kesekretariatan DPRD',
            35 => 'Pembinaan dan Pengawasan',
            36 => 'Perencanaan pembangunan, litbang',
            37 => 'Keuangan dan Pendapatan',
            38 => 'Kepegawaian dan Pengembangan SDM', 39 => 'Bencana', 40 => 'Politik',
            41 => 'Lainnya',
        ];

        foreach ($names as $kode => $nama) {
            RiskJenis::updateOrCreate(
                ['kode' => (string) $kode],
                ['nama' => $nama, 'urutan' => $kode]
            );
        }
    }

    private function seedEntitasPenilai(): void
    {
        $names = [
            'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA',
            'BADAN KESATUAN BANGSA DAN POLITIK',
            'BADAN PENANGGULANGAN BENCANA DAERAH',
            'BADAN PENGELOLAAN KEUANGAN DAERAH',
            'BADAN PERENCANAAN PEMBANGUNAN DAERAH',
            'BLUD RSUD CUT NYAK DHIEN',
            'DINAS KELAUTAN DAN PERIKANAN',
            'DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL',
            'DINAS KESEHATAN',
            'DINAS KOMUNIKASI INFORMATIKA DAN PERSANDIAN',
            'DINAS LINGKUNGAN HIDUP',
            'DINAS PANGAN',
            'DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
            'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
            'DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG',
            'DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA',
            'DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU',
            'DINAS PENDIDIKAN DAN KEBUDAYAAN',
            'DINAS PENDIDIKAN DAYAH',
            'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
            'DINAS PERHUBUNGAN',
            'DINAS PERKEBUNAN DAN PETERNAKAN',
            'DINAS PERPUSTAKAAN DAN KEARSIPAN',
            'DINAS PERTANAHAN',
            'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
            'DINAS PERUMAHAN RAKYAT DAN KAWASAN PERMUKIMAN',
            'DINAS SOSIAL',
            'DINAS SYARIAT ISLAM',
            'DINAS TRANSMIGRASI DAN TENAGA KERJA',
            'INSPEKTORAT',
            'KECAMATAN ARONGAN LAMBALEK',
            'KECAMATAN BUBON',
            'KECAMATAN JOHAN PAHLAWAN',
            'KECAMATAN KAWAY XVI',
            'KECAMATAN MEUREUBO',
            'KECAMATAN PANTE CEUREUMEN',
            'KECAMATAN PANTON REU',
            'KECAMATAN SAMATIGA',
            'KECAMATAN SUNGAI MAS',
            'KECAMATAN WOYLA',
            'KECAMATAN WOYLA BARAT',
            'KECAMATAN WOYLA TIMUR',
            'SATUAN POLISI PAMONG PRAJA DAN WILAYATUL HISBAH',
            'SEKRETARIAT BAITUL MAL KABUPATEN',
            'SEKRETARIAT DAERAH',
            'SEKRETARIAT DPRK',
            'SEKRETARIAT MAJELIS ADAT ACEH',
            'SEKRETARIAT MAJELIS PEMUSYAWARATAN ULAMA',
            'SEKRETARIAT MAJELIS PENDIDIKAN DAERAH',
        ];

        foreach ($names as $i => $nama) {
            RiskEntitasPenilai::updateOrCreate(
                ['nama' => $nama],
                ['urutan' => $i + 1]
            );
        }
    }
}
