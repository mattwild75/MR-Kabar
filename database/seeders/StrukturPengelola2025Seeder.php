<?php

namespace Database\Seeders;

use App\Models\DataUmum;
use App\Models\StrukturPengelolaRisiko;
use Illuminate\Database\Seeder;

/**
 * Draf struktur pengelolaan Risiko Tahun 2025.
 *
 * Susunan peran dan tugasnya mengikuti Perdep PPKD 4/2019 — Lampiran 2 (contoh
 * Keputusan Kepala Daerah tentang struktur pengelolaan Risiko) dan Lampiran 3
 * yang menyebut susunannya: Sekretaris Daerah sebagai koordinator
 * penyelenggaraan, Kepala Daerah sebagai Unit Pemilik Risiko tingkat Pemerintah
 * Daerah, pejabat eselon sebagai UPR di tingkatnya, Komite Pengelolaan Risiko,
 * Asisten Sekretaris Daerah sebagai Unit Kepatuhan, dan Inspektur Daerah
 * sebagai penanggung jawab pengawasan.
 *
 * NAMA PEJABAT TIDAK DIKARANG. Yang diisi hanya nama yang sudah direkam
 * Pengguna sendiri pada Data Umum tahun 2025 — Bupati, Sekretaris Daerah, dan
 * Inspektur. Peran yang belum diketahui pejabatnya dibiarkan kosong namanya,
 * dan Admin mengisinya sendiri lewat halaman Struktur Pengelolaan Risiko.
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

        $baris = [
            [
                'peran' => 'upr_pemda',
                'jabatan' => 'Bupati Aceh Barat',
                'nama' => $bupati,
                'tugas' => "Selaku Ketua Unit Pemilik Risiko tingkat Pemerintah Daerah:\n"
                    . "a. menetapkan kebijakan pengelolaan Risiko;\n"
                    . "b. memiliki Risiko strategis Pemerintah Daerah dan memutuskan penanganannya;\n"
                    . "c. menerima laporan pengelolaan Risiko dari Unit Kepatuhan dan Komite Pengelolaan Risiko.",
            ],
            [
                'peran' => 'koordinator_penyelenggaraan',
                'jabatan' => 'Sekretaris Daerah Kabupaten Aceh Barat',
                'nama' => $sekda,
                'tugas' => "a. mengoordinasikan penyelenggaraan pengelolaan Risiko di lingkungan Pemerintah "
                    . "Kabupaten Aceh Barat;\n"
                    . "b. memastikan setiap tahapan pengelolaan Risiko dilaksanakan sesuai arahan Bupati;\n"
                    . "c. menerima tembusan laporan pengelolaan Risiko.",
            ],
            [
                'peran' => 'komite',
                'jabatan' => 'Komite Pengelolaan Risiko Kabupaten Aceh Barat',
                'nama' => null,
                'tugas' => "a. merumuskan kebijakan dan arahan, serta menetapkan hal-hal terkait keputusan "
                    . "strategis yang menyimpang dari prosedur normal;\n"
                    . "b. melakukan pembinaan terhadap pengelolaan Risiko yang meliputi sosialisasi, bimbingan, "
                    . "supervisi, dan pelatihan;\n"
                    . "c. membuat laporan semesteran dan tahunan kegiatan pembinaan yang disampaikan kepada "
                    . "Bupati melalui Sekretaris Daerah;\n"
                    . "d. menjadi fasilitator yang memandu pelaksanaan langkah demi langkah proses penilaian Risiko.",
            ],
            [
                'peran' => 'unit_kepatuhan',
                'jabatan' => 'Asisten Sekretaris Daerah Kabupaten Aceh Barat',
                'nama' => null,
                'tugas' => "a. memantau pelaksanaan pengelolaan Risiko pada Unit Pemilik Risiko, sejak penilaian "
                    . "kelemahan lingkungan pengendalian, proses penilaian Risiko, sampai pelaksanaan kegiatan "
                    . "pengendalian;\n"
                    . "b. menelaah kewajaran analisis Risiko dan kelayakan Rencana Tindak Pengendalian;\n"
                    . "c. menyusun laporan triwulanan dan tahunan pemantauan pengelolaan Risiko kepada Bupati "
                    . "dengan tembusan Sekretaris Daerah.",
            ],
            [
                'peran' => 'penanggung_jawab_pengawasan',
                'jabatan' => 'Inspektur Kabupaten Aceh Barat',
                'nama' => $inspektur,
                'tugas' => "a. melaksanakan pengawasan atas penyelenggaraan pengelolaan Risiko;\n"
                    . "b. memberikan layanan fasilitasi penerapan pengelolaan Risiko dan penyelenggaraan SPIP;\n"
                    . "c. melaksanakan pengawasan berbasis Risiko.",
            ],
            [
                'peran' => 'upr_eselon_2',
                'jabatan' => 'Kepala Perangkat Daerah',
                'nama' => null,
                'tugas' => "Selaku Ketua Unit Pemilik Risiko tingkat Eselon II pada Perangkat Daerah "
                    . "masing-masing:\n"
                    . "a. memiliki Risiko strategis Perangkat Daerah dan memutuskan penanganannya;\n"
                    . "b. menyusun dan melaksanakan Rencana Tindak Pengendalian;\n"
                    . "c. menyampaikan laporan berkala pengelolaan Risiko kepada Unit Kepatuhan.",
            ],
            [
                'peran' => 'upr_eselon_3_4',
                'jabatan' => 'Pejabat Eselon III dan IV pada Perangkat Daerah',
                'nama' => null,
                'tugas' => "Selaku Unit Pemilik Risiko tingkat Eselon III dan IV:\n"
                    . "a. memiliki Risiko operasional pada bidang tugasnya;\n"
                    . "b. melaksanakan kegiatan pengendalian yang dibutuhkan;\n"
                    . "c. mencatat kejadian Risiko dan realisasi Rencana Tindak Pengendalian.",
            ],
        ];

        foreach ($baris as $i => $b) {
            StrukturPengelolaRisiko::create($b + ['tahun' => self::TAHUN, 'urutan' => $i + 1]);
        }

        $terisi = collect($baris)->filter(fn($b) => $b['nama'] !== null)->count();
        $this->command?->info(
            'Struktur Pengelolaan Risiko 2025 dibuat: ' . count($baris) . ' peran, ' . $terisi
            . ' di antaranya sudah bernama dari Data Umum. Sisanya diisi Admin lewat halaman Struktur.'
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
