<?php

namespace Database\Seeders;

use App\Models\DataUmum;
use App\Models\StrukturPengelolaRisiko;
use Illuminate\Database\Seeder;

/**
 * Draf struktur pengelolaan Risiko Tahun 2025, sesuai contoh Keputusan Kepala
 * Daerah pada Perdep PPKD 4/2019 Lampiran 2 (halaman berlabel 108 sampai 114).
 *
 * Unit Pemilik Risiko dan Komite Pengelolaan Risiko direkam sebagai TIM, bukan
 * jabatan tunggal — tiap tingkatan punya ketua, koordinator teknis yang
 * merangkap anggota, dan anggota. Susunan ini yang membuat bagan struktur
 * menampilkan tim lengkap, bukan satu kotak untuk seluruh tingkatan.
 *
 * Dua hal yang datang dari Perdep dan mudah terlewat:
 *
 *   1. Komite Pengelolaan Risiko DIKETUAI Kepala Daerah sendiri, bukan pejabat
 *      lain, dengan Kepala Bappeda sebagai koordinator merangkap anggota.
 *   2. Kepala Bappeda memegang peran koordinator di DUA tempat sekaligus —
 *      pada Unit Pemilik Risiko Tingkat Pemerintah Daerah dan pada Komite.
 *
 * NAMA PEJABAT TIDAK DIKARANG. Yang diisi hanya nama yang sudah direkam
 * Pengguna sendiri pada Data Umum tahun 2025 — Bupati, Sekretaris Daerah, dan
 * Inspektur. Sisanya dibiarkan kosong namanya untuk diisi Admin.
 *
 * Idempotent: susunan tahun 2025 dihapus lebih dulu sebelum ditulis ulang.
 */
class StrukturPengelola2025Seeder extends Seeder
{
    private const TAHUN = 2025;

    public function run(): void
    {
        StrukturPengelolaRisiko::where('tahun', self::TAHUN)->forceDelete();

        $bupati = $this->namaKepalaDaerah();
        $sekda = $this->namaBerjabatan('SEKRETARIS DAERAH');
        $inspektur = $this->namaBerjabatan('INSPEKTUR');

        $tugasUpr = "a. melaksanakan penilaian Risiko pada tingkatannya dan menetapkan penanganannya;\n"
            . "b. menyusun dan melaksanakan Rencana Tindak Pengendalian;\n"
            . "c. melaporkan kejadian Risiko yang terjadi dalam pelaksanaan kegiatan sehari-hari;\n"
            . "d. menyampaikan hasil penilaian Risiko kepada Unit Kepatuhan.";

        // Urutan mengikuti Lampiran Keputusan Bupati: penanggung jawab,
        // koordinator penyelenggaraan, ketiga jenjang Unit Pemilik Risiko,
        // Komite, Unit Kepatuhan, lalu penanggung jawab pengawasan.
        $baris = [
            // ── Unit Pemilik Risiko Tingkat Pemerintah Daerah ──
            [
                'peran' => 'upr_pemda',
                'kedudukan' => 'ketua',
                'jabatan' => 'Bupati Aceh Barat',
                'nama' => $bupati,
                'tugas' => "Selaku penanggung jawab pengelolaan Risiko sekaligus Ketua Unit Pemilik "
                    . "Risiko tingkat Pemerintah Daerah:\n"
                    . "a. menetapkan arah kebijakan pengelolaan Risiko Pemerintah Daerah;\n"
                    . "b. memiliki Risiko strategis Pemerintah Daerah dan memutuskan penanganannya;\n"
                    . "c. menerima laporan pengelolaan Risiko dari Unit Kepatuhan dan Komite.",
            ],
            [
                'peran' => 'upr_pemda',
                'kedudukan' => 'koordinator',
                'jabatan' => 'Kepala Badan Perencanaan Pembangunan Daerah',
                'nama' => null,
                'tugas' => 'Mengoordinasikan teknis penilaian Risiko strategis Pemerintah Daerah '
                    . 'dan menyiapkan bahan pembahasannya.',
            ],
            [
                'peran' => 'upr_pemda',
                'kedudukan' => 'anggota',
                'jabatan' => 'Seluruh Kepala Perangkat Daerah, Sekretaris Daerah, Sekretaris DPRK, '
                    . 'Inspektur, dan Direktur BLUD RSUD Cut Nyak Dhien',
                'nama' => null,
                'tugas' => 'Mengikuti penilaian Risiko strategis Pemerintah Daerah secara Control '
                    . 'Self Assessment atau Focus Group Discussion, serta melaksanakan Rencana '
                    . 'Tindak Pengendalian yang menjadi bagiannya.',
            ],

            // ── Koordinator penyelenggaraan ──
            [
                'peran' => 'koordinator_penyelenggaraan',
                'kedudukan' => null,
                'jabatan' => 'Sekretaris Daerah Kabupaten Aceh Barat',
                'nama' => $sekda,
                'tugas' => "a. mengoordinasikan penyelenggaraan pengelolaan Risiko di lingkungan "
                    . "Pemerintah Kabupaten Aceh Barat;\n"
                    . "b. memastikan setiap tahapan pengelolaan Risiko dilaksanakan sesuai arahan "
                    . "Bupati;\n"
                    . "c. menerima tembusan laporan pengelolaan Risiko.",
            ],

            // ── Komite Pengelolaan Risiko ──
            [
                'peran' => 'komite',
                'kedudukan' => 'ketua',
                'jabatan' => 'Bupati Aceh Barat',
                'nama' => $bupati,
                'tugas' => "a. menetapkan petunjuk pelaksanaan pengelolaan Risiko Pemerintah Daerah;\n"
                    . "b. menetapkan kebijakan penerapan berupa Kategori Risiko, Kriteria Risiko, "
                    . "Matriks Analisis Risiko, Level Risiko, dan Selera Risiko;\n"
                    . "c. menetapkan Daftar Risiko, Peta Risiko, dan Rencana Tindak Pengendalian "
                    . "tingkat Pemerintah Daerah;\n"
                    . "d. menetapkan kebijakan pembinaan pengelolaan Risiko.",
            ],
            [
                'peran' => 'komite',
                'kedudukan' => 'koordinator',
                'jabatan' => 'Kepala Badan Perencanaan Pembangunan Daerah',
                'nama' => null,
                'tugas' => "a. menyusun konsep petunjuk pelaksanaan dan kebijakan penerapan "
                    . "pengelolaan Risiko;\n"
                    . "b. mengoordinasikan kegiatan pembinaan berupa sosialisasi, bimbingan, "
                    . "supervisi, dan pelatihan;\n"
                    . "c. menyiapkan laporan semesteran dan tahunan kegiatan pembinaan.",
            ],
            [
                'peran' => 'komite',
                'kedudukan' => 'anggota',
                'jabatan' => 'Kepala Perangkat Daerah yang ditunjuk',
                'nama' => null,
                'tugas' => 'Melaksanakan pembinaan pengelolaan Risiko kepada Unit Pemilik Risiko '
                    . 'dan menjadi fasilitator yang memandu proses penilaian Risiko.',
            ],

            // ── Unit Kepatuhan ──
            [
                'peran' => 'unit_kepatuhan',
                'kedudukan' => null,
                'jabatan' => 'Asisten Sekretaris Daerah Kabupaten Aceh Barat',
                'nama' => null,
                'tugas' => "a. memantau pelaksanaan pengelolaan Risiko pada Unit Pemilik Risiko, "
                    . "sejak penilaian kelemahan lingkungan pengendalian, proses penilaian Risiko, "
                    . "sampai pelaksanaan kegiatan pengendalian;\n"
                    . "b. menelaah kewajaran analisis Risiko dan kelayakan Rencana Tindak "
                    . "Pengendalian;\n"
                    . "c. menyusun laporan triwulanan dan tahunan pemantauan pengelolaan Risiko "
                    . "kepada Bupati dengan tembusan Sekretaris Daerah.",
            ],

            // ── Penanggung jawab pengawasan ──
            [
                'peran' => 'penanggung_jawab_pengawasan',
                'kedudukan' => null,
                'jabatan' => 'Inspektur Kabupaten Aceh Barat',
                'nama' => $inspektur,
                'tugas' => "a. melaksanakan pengawasan atas penyelenggaraan pengelolaan Risiko;\n"
                    . "b. memberikan layanan fasilitasi penerapan pengelolaan Risiko dan "
                    . "penyelenggaraan Sistem Pengendalian Intern Pemerintah;\n"
                    . "c. melaksanakan pengawasan berbasis Risiko.",
            ],

            // ── Unit Pemilik Risiko Tingkat Eselon II ──
            [
                'peran' => 'upr_eselon_2',
                'kedudukan' => 'ketua',
                'jabatan' => 'Kepala Perangkat Daerah masing-masing',
                'nama' => null,
                'tugas' => $tugasUpr,
            ],
            [
                'peran' => 'upr_eselon_2',
                'kedudukan' => 'koordinator',
                'jabatan' => 'Sekretaris Perangkat Daerah atau pejabat yang menangani perencanaan',
                'nama' => null,
                'tugas' => 'Mengoordinasikan teknis penilaian Risiko strategis Perangkat Daerah '
                    . 'dan menghimpun kertas kerjanya.',
            ],
            [
                'peran' => 'upr_eselon_2',
                'kedudukan' => 'anggota',
                'jabatan' => 'Seluruh Kepala Bagian, Kepala Bidang, atau Inspektur Pembantu pada '
                    . 'Perangkat Daerah yang bersangkutan',
                'nama' => null,
                'tugas' => 'Mengikuti penilaian Risiko strategis Perangkat Daerah dan melaksanakan '
                    . 'kegiatan pengendalian pada bidang tugasnya.',
            ],

            // ── Unit Pemilik Risiko Tingkat Eselon III dan IV ──
            [
                'peran' => 'upr_eselon_3_4',
                'kedudukan' => 'ketua',
                'jabatan' => 'Kepala Bagian atau Kepala Bidang',
                'nama' => null,
                'tugas' => $tugasUpr,
            ],
            [
                'peran' => 'upr_eselon_3_4',
                'kedudukan' => 'koordinator',
                'jabatan' => 'Kepala Subbagian, Kepala Subbidang, atau Kepala Seksi yang menangani '
                    . 'perencanaan kegiatan',
                'nama' => null,
                'tugas' => 'Mengoordinasikan teknis penilaian Risiko operasional dan menghimpun '
                    . 'kertas kerjanya.',
            ],
            [
                'peran' => 'upr_eselon_3_4',
                'kedudukan' => 'anggota',
                'jabatan' => 'Seluruh Kepala Subbagian, Kepala Subbidang, dan Kepala Seksi pada '
                    . 'Bagian atau Bidang yang bersangkutan',
                'nama' => null,
                'tugas' => 'Melaksanakan kegiatan pengendalian yang dibutuhkan serta mencatat '
                    . 'kejadian Risiko dan realisasi Rencana Tindak Pengendalian.',
            ],
        ];

        foreach ($baris as $i => $b) {
            StrukturPengelolaRisiko::create($b + ['tahun' => self::TAHUN, 'urutan' => $i + 1]);
        }

        $bernama = collect($baris)->filter(fn($b) => $b['nama'] !== null)->count();
        $this->command?->info(
            'Struktur Pengelolaan Risiko 2025 dibuat: ' . count($baris) . ' baris pada 7 peran, '
            . $bernama . ' di antaranya sudah bernama dari Data Umum. Sisanya diisi Admin.'
        );
    }

    /** Nama Bupati sebagaimana sudah direkam Pengguna pada Data Umum 2025. */
    private function namaKepalaDaerah(): ?string
    {
        return DataUmum::where('tahun_penilaian', self::TAHUN)
            ->whereNotNull('nama_kepala_daerah')
            ->where('nama_kepala_daerah', '!=', '')
            ->value('nama_kepala_daerah');
    }

    /**
     * Cari nama pejabat dari Data Umum berdasarkan potongan jabatannya.
     * Dicocokkan longgar karena penulisan jabatan di Data Umum bervariasi —
     * ada yang berawalan "Plt." atau "Plh.", ada yang huruf besar semua.
     */
    private function namaBerjabatan(string $potongan): ?string
    {
        return DataUmum::where('tahun_penilaian', self::TAHUN)
            ->where('jabatan_kepala_dinas', 'like', '%' . $potongan . '%')
            ->whereNotNull('nama_kepala_dinas')
            ->where('nama_kepala_dinas', '!=', '')
            ->value('nama_kepala_dinas');
    }
}
