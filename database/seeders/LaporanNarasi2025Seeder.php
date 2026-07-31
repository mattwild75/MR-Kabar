<?php

namespace Database\Seeders;

use App\Models\LaporanNarasi;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Narasi Laporan Tahun 2025 — Form 11, 12, 13, dan 14.
 *
 * Yang diisi hanya bagian NARATIF. Seluruh bagian data terstruktur pada
 * keempat laporan itu — daftar Risiko, RTP, rekapitulasi kepatuhan, progres
 * tahapan — tetap diproyeksi langsung dari tabelnya masing-masing saat halaman
 * dibuka, tidak pernah disalin ke sini. Jadi angka pada laporan selalu
 * mengikuti keadaan data yang sebenarnya, bukan foto lama.
 *
 * Cakupannya mengikuti kedudukan tiap laporan:
 * - Form 11 dan 12 milik Perangkat Daerah, dibuatkan hanya untuk Perangkat
 *   Daerah yang MEMANG punya Risiko 2025.
 * - Form 13 dan 14 tingkat Pemerintah Daerah, satu berkas untuk seluruh
 *   kabupaten; Form 13 per triwulan, Form 14 per semester dan tahunan
 *   sebagaimana tugas Komite pada Perdep halaman berlabel 148.
 *
 * Narasi yang ditulis di sini SENGAJA berupa kalimat kerangka, bukan laporan
 * jadi: isinya menerangkan apa yang harus dituliskan pada bagian itu, sehingga
 * penyusun tinggal menggantinya dengan keadaan sesungguhnya. Mengarang capaian
 * yang tidak pernah terjadi justru berbahaya, sebab laporan ini ditandatangani
 * dan disampaikan kepada Bupati.
 *
 * Idempotent: narasi tahun 2025 dihapus lebih dulu sebelum ditulis ulang.
 */
class LaporanNarasi2025Seeder extends Seeder
{
    private const TAHUN = 2025;

    public function run(): void
    {
        LaporanNarasi::where('tahun_penilaian', self::TAHUN)->forceDelete();

        $penyusun = User::whereHas('roles', fn($q) => $q->where('name', 'admin'))->value('id');
        $opdIds = $this->opdBerisiko();

        if ($opdIds === []) {
            $this->command?->warn('Tidak ada Perangkat Daerah dengan Risiko 2025. Laporan tidak dibuat.');

            return;
        }

        $jumlah = ['form11' => 0, 'form12' => 0, 'form13' => 0, 'form14' => 0];

        // ── Form 11: Laporan Pelaksanaan Penilaian Risiko, sekali setahun ──
        foreach ($opdIds as $opdId) {
            LaporanNarasi::create([
                'jenis_laporan' => 'pelaksanaan_penilaian',
                'opd_id' => $opdId,
                'tahun_penilaian' => self::TAHUN,
                'triwulan' => null,
                'submitted_by' => $penyusun,
            ] + $this->narasiUmum() + [
                'kondisi_lingkungan_pengendalian' => 'Uraikan simpulan Control Environment Evaluation (CEE) '
                    . 'Tahun 2025 pada Perangkat Daerah ini: sub unsur mana yang Memadai dan mana yang Kurang '
                    . 'Memadai, beserta dasar penilaiannya dari hasil reviu dokumen dan survei persepsi.',
                'rencana_perbaikan_lingkungan' => 'Uraikan Rencana Tindak Pengendalian atas sub unsur yang '
                    . 'disimpulkan Kurang Memadai, sebagaimana tercantum pada Form 1d.',
                'rancangan_informasi_komunikasi' => 'Uraikan media dan jadwal pengkomunikasian Rencana Tindak '
                    . 'Pengendalian kepada pihak yang menjalankannya, sebagaimana tercantum pada Form 8.',
                'rancangan_pemantauan' => 'Uraikan bentuk dan jadwal pemantauan atas pelaksanaan pengendalian, '
                    . 'termasuk uji coba penerapannya, sebagaimana tercantum pada Form 9.',
            ]);
            $jumlah['form11']++;
        }

        // ── Form 12: Laporan Berkala Pengelolaan Risiko, tiap triwulan ─────
        foreach ($opdIds as $opdId) {
            foreach (['I', 'II', 'III', 'IV'] as $triwulan) {
                LaporanNarasi::create([
                    'jenis_laporan' => 'berkala_pengelolaan',
                    'opd_id' => $opdId,
                    'tahun_penilaian' => self::TAHUN,
                    'triwulan' => $triwulan,
                    'submitted_by' => $penyusun,
                ] + $this->narasiUmum($triwulan) + $this->narasiKegiatan($triwulan) + [
                    'monitoring_risiko_rtp' => "Uraikan hasil pemantauan Triwulan {$triwulan}: pengkomunikasian "
                        . 'Risiko dan RTP, kejadian Risiko yang benar-benar terjadi, pelaksanaan RTP, serta '
                        . 'penilaian ulang Skala Risiko Aktual setelah pengendalian berjalan.',
                ]);
                $jumlah['form12']++;
            }
        }

        // ── Form 13: Laporan Pemantauan Unit Kepatuhan, tingkat Pemda ──────
        foreach (['I', 'II', 'III', 'IV'] as $triwulan) {
            LaporanNarasi::create([
                'jenis_laporan' => 'pemantauan_kepatuhan',
                'opd_id' => null,
                'tahun_penilaian' => self::TAHUN,
                'triwulan' => $triwulan,
                'submitted_by' => $penyusun,
            ] + $this->narasiUmum($triwulan) + $this->narasiKegiatan($triwulan) + [
                'rekomendasi_feedback' => 'Uraikan rekomendasi Unit Kepatuhan kepada Unit Pemilik Risiko atas '
                    . "kendala Triwulan {$triwulan}, termasuk Perangkat Daerah yang belum melengkapi Form 8, 9, "
                    . 'dan 10 sebagaimana tampak pada rekapitulasi di bawah.',
            ]);
            $jumlah['form13']++;
        }

        // ── Form 14: Laporan Pembinaan Komite, semesteran dan tahunan ──────
        foreach (['S1', 'S2', 'TAHUNAN'] as $periode) {
            $label = LaporanNarasi::PERIODE_KOMITE_LABEL[$periode];

            LaporanNarasi::create([
                'jenis_laporan' => 'pembinaan_komite',
                'opd_id' => null,
                'tahun_penilaian' => self::TAHUN,
                'triwulan' => $periode,
                'submitted_by' => $penyusun,
            ] + $this->narasiUmum() + [
                'rencana_kegiatan' => "Uraikan rencana kegiatan pembinaan pada {$label}: sosialisasi, bimbingan, "
                    . 'supervisi, dan pelatihan pengelolaan Risiko, beserta Perangkat Daerah sasarannya.',
                'realisasi_kegiatan' => "Uraikan realisasi kegiatan pembinaan pada {$label} beserta kesenjangannya "
                    . 'terhadap rencana, termasuk jumlah Perangkat Daerah yang benar-benar terbina.',
                'hambatan_pelaksanaan' => 'Uraikan kendala pembinaan — misalnya keterbatasan waktu pendamping, '
                    . 'pergantian pejabat pengelola Risiko, atau Perangkat Daerah yang belum menunjuk penanggung '
                    . 'jawab pengelolaan Risiko.',
                'hasil_pembinaan' => 'Uraikan hasil pembinaan kepada Unit Pemilik Risiko: perubahan yang terjadi '
                    . 'setelah dibina, serta hasil fasilitasi dalam memandu langkah demi langkah proses penilaian '
                    . 'Risiko maupun pemutakhiran Risiko dan RTP.',
                'rekomendasi_feedback' => 'Uraikan rekomendasi strategis maupun teknis Komite kepada Unit Pemilik '
                    . 'Risiko, termasuk usulan kebijakan yang perlu ditetapkan Bupati.',
            ]);
            $jumlah['form14']++;
        }

        $this->command?->info(
            "Narasi laporan 2025 dibuat: Form 11 {$jumlah['form11']} berkas, Form 12 {$jumlah['form12']} berkas, "
            . "Form 13 {$jumlah['form13']} berkas, Form 14 {$jumlah['form14']} berkas."
        );
    }

    /**
     * Perangkat Daerah yang benar-benar punya Risiko 2025 pada salah satu
     * tingkat. Dicari lewat pemiliknya (Risiko melekat pada pengguna, dan
     * pengguna melekat pada Perangkat Daerah) — laporan tidak dibuatkan untuk
     * Perangkat Daerah yang belum menilai Risiko sama sekali, sebab isinya
     * akan kosong seluruhnya.
     */
    private function opdBerisiko(): array
    {
        $ids = collect();

        foreach (['tbl_irs_pd', 'tbl_iro_pd'] as $tabel) {
            $ids = $ids->merge(
                DB::table($tabel)
                    ->join('users', 'users.id', '=', $tabel . '.user_id')
                    ->where($tabel . '.TAHUN DINILAI RISIKO', (string) self::TAHUN)
                    ->whereNotNull('users.opd_id')
                    ->distinct()
                    ->pluck('users.opd_id')
            );
        }

        return $ids->unique()->map(fn($id) => (int) $id)->sort()->values()->all();
    }

    /** Empat bagian pendahuluan yang sama bentuknya pada keempat laporan. */
    private function narasiUmum(?string $periode = null): array
    {
        $label = $periode ? "Triwulan {$periode} Tahun " . self::TAHUN : 'Tahun ' . self::TAHUN;

        return [
            'latar_belakang' => 'Uraikan alasan penyusunan laporan ini serta kedudukannya dalam penyelenggaraan '
                . 'Sistem Pengendalian Intern Pemerintah pada Pemerintah Kabupaten Aceh Barat.',
            'dasar_hukum' => "1. Peraturan Pemerintah Nomor 60 Tahun 2008 tentang Sistem Pengendalian Intern "
                . "Pemerintah;\n2. Peraturan Deputi Bidang Pengawasan Penyelenggaraan Keuangan Daerah BPKP Nomor 4 "
                . "Tahun 2019 tentang Pedoman Pengelolaan Risiko pada Pemerintah Daerah;\n3. Surat Edaran Bupati "
                . 'Aceh Barat tentang Arahan dan Kebijakan Penilaian Risiko Tahun ' . self::TAHUN . '.',
            'maksud_tujuan' => 'Uraikan maksud dan tujuan laporan ini sebagai bahan evaluasi dan pengambilan '
                . 'keputusan bagi pimpinan.',
            'ruang_lingkup' => "Ruang lingkup laporan ini meliputi pengelolaan Risiko pada {$label}, mencakup "
                . 'penilaian lingkungan pengendalian, penilaian Risiko, penyusunan dan pelaksanaan Rencana Tindak '
                . 'Pengendalian, serta pemantauannya.',
            'penutup' => "Demikian laporan ini disusun sebagai bahan evaluasi penyelenggaraan pengelolaan Risiko "
                . "Pemerintah Kabupaten Aceh Barat {$label}.",
        ];
    }

    /** Bagian rencana, realisasi, dan hambatan yang dipakai Form 12, 13, dan 14. */
    private function narasiKegiatan(string $triwulan): array
    {
        return [
            'rencana_kegiatan' => "Uraikan kegiatan pengendalian yang direncanakan pada Triwulan {$triwulan}, "
                . 'termasuk pemutakhiran Risiko dan RTP dari periode sebelumnya.',
            'realisasi_kegiatan' => "Uraikan kegiatan pengendalian yang benar-benar dilaksanakan pada Triwulan "
                . "{$triwulan} beserta kesenjangannya terhadap rencana.",
            'hambatan_pelaksanaan' => 'Uraikan kendala yang menyebabkan kesenjangan tersebut — misalnya '
                . 'keterbatasan anggaran, pergantian pelaksana, atau tahapan yang bergantung pada dokumen '
                . 'perencanaan yang belum terbit.',
        ];
    }
}
