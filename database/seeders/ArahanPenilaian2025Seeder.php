<?php

namespace Database\Seeders;

use App\Models\ArahanPenilaianRisiko;
use Illuminate\Database\Seeder;

/**
 * Draf Arahan dan Kebijakan Penilaian Risiko Tahun 2025, berikut jadwal
 * tahapannya — sumber data widget jadwal pada Dasbor.
 *
 * Bentuk dan isinya mengikuti contoh Surat Edaran pada Perdep PPKD 4/2019
 * Lampiran 3 (5 tahunan, mengikuti periode RPJMD) dan Lampiran 4 (1 tahunan,
 * mengikuti siklus anggaran). Tenggat tahapan Risiko Operasional sengaja
 * memakai rentang yang sama dengan contoh Perdep — "3 sampai 14 Oktober
 * setelah RKA OPD disusun" — supaya jadwal ini dapat ditelusuri ke sumbernya.
 *
 * DRAF, bukan penetapan. Nomor dan tanggal Surat Edaran dikosongkan karena
 * belum ada SE sungguhan; keduanya diisi Admin setelah Bupati menetapkan.
 * Statusnya sengaja 'berlaku' agar jadwalnya langsung terlihat di Dasbor dan
 * dapat dinilai kelayakannya — ubah ke 'draf' bila belum dikehendaki tampil.
 *
 * Idempotent: arahan tahun 2025 dihapus lebih dulu sebelum ditulis ulang,
 * sehingga menjalankan ulang seeder tidak menggandakan tahapan.
 */
class ArahanPenilaian2025Seeder extends Seeder
{
    private const TAHUN = 2025;

    public function run(): void
    {
        ArahanPenilaianRisiko::where('tahun_mulai', self::TAHUN)
            ->orWhere(fn ($q) => $q->where('tahun_mulai', '<=', self::TAHUN)->where('tahun_selesai', '>=', self::TAHUN))
            ->get()
            ->each(fn ($a) => $a->forceDelete());

        $dasar = 'Peraturan Pemerintah Nomor 60 Tahun 2008 tentang Sistem Pengendalian Intern Pemerintah; '
            .'Peraturan Deputi Bidang Pengawasan Penyelenggaraan Keuangan Daerah BPKP Nomor 4 Tahun 2019 '
            .'tentang Pedoman Pengelolaan Risiko pada Pemerintah Daerah.';

        // ── Arahan 5 tahunan, mengikuti periode RPJMD ────────────────────
        $limaTahunan = ArahanPenilaianRisiko::create([
            'jenis' => '5_tahunan',
            'tahun_mulai' => 2025,
            'tahun_selesai' => 2029,
            'nomor_se' => null,
            'tanggal_se' => null,
            'dasar_hukum' => $dasar,
            'status' => 'berlaku',
            'catatan' => 'Draf arahan lima tahunan mengikuti periode RPJMD. Penilaian Risiko dilakukan pada tiga '
                .'tingkat: Strategis Pemerintah Daerah, Strategis Perangkat Daerah, dan Operasional Perangkat '
                .'Daerah. Nomor dan tanggal Surat Edaran diisi setelah ditetapkan Bupati.',
        ]);

        $this->tahapan($limaTahunan, [
            [
                'tahapan' => 'Penetapan urusan dan Perangkat Daerah yang dinilai selama periode RPJMD',
                'dokumen_pemicu' => 'RPJMD Kabupaten Aceh Barat',
                'tanggal_mulai' => '2025-01-06',
                'tanggal_selesai' => '2025-02-28',
                'pelaksana' => 'Sekretaris Daerah selaku Koordinator Penyelenggaraan, dibantu Bappeda',
                'keluaran' => 'Daftar urusan prioritas dan Perangkat Daerah pelaksananya',
            ],
            [
                'tahapan' => 'Penilaian Risiko Strategis Pemerintah Daerah atas tujuan RPJMD',
                'dokumen_pemicu' => 'RPJMD Kabupaten Aceh Barat',
                'tanggal_mulai' => '2025-03-03',
                'tanggal_selesai' => '2025-04-30',
                'pelaksana' => 'Pejabat Eselon II selaku koordinator dan pendukung, secara CSA/FGD',
                'keluaran' => 'Form 2a, 3a, 4, dan 5 tingkat Pemerintah Daerah',
            ],
            [
                'tahapan' => 'Penilaian Risiko Strategis Perangkat Daerah atas tujuan Renstra',
                'dokumen_pemicu' => 'Renstra Perangkat Daerah',
                'tanggal_mulai' => '2025-05-05',
                'tanggal_selesai' => '2025-06-30',
                'pelaksana' => 'Seluruh Perangkat Daerah, difasilitasi Inspektorat',
                'keluaran' => 'Form 2b, 3b, 4, dan 5 tingkat Perangkat Daerah',
            ],
        ]);

        // ── Arahan 1 tahunan, mengikuti siklus anggaran ──────────────────
        $satuTahunan = ArahanPenilaianRisiko::create([
            'jenis' => '1_tahunan',
            'tahun_mulai' => self::TAHUN,
            'tahun_selesai' => self::TAHUN,
            'nomor_se' => null,
            'tanggal_se' => null,
            'dasar_hukum' => $dasar,
            'status' => 'berlaku',
            'catatan' => 'Draf arahan tahunan. Hasil penilaian Risiko disampaikan kepada Bupati dengan tembusan '
                .'Sekretaris Daerah selaku Koordinator Penyelenggaraan. Penilaian Risiko Operasional agar '
                .'mempertimbangkan Risiko yang telah teridentifikasi pada tahun sebelumnya beserta Risiko baru. '
                .'Inspektorat bertindak sebagai fasilitator.',
        ]);

        $this->tahapan($satuTahunan, [
            [
                'tahapan' => 'Penilaian Lingkungan Pengendalian (CEE) Form 1a sampai 1d',
                'dokumen_pemicu' => 'Arahan Tahunan Bupati',
                'tanggal_mulai' => '2025-02-03',
                'tanggal_selesai' => '2025-03-31',
                'pelaksana' => 'Seluruh Perangkat Daerah, difasilitasi Inspektorat',
                'keluaran' => 'Simpulan CEE dan RTP perbaikan lingkungan pengendalian',
            ],
            [
                'tahapan' => 'Penilaian tingkat kematangan penyelenggaraan SPIP',
                'dokumen_pemicu' => 'Arahan Tahunan Bupati',
                'tanggal_mulai' => '2025-02-03',
                'tanggal_selesai' => '2025-03-31',
                'pelaksana' => 'Inspektorat Kabupaten Aceh Barat',
                'keluaran' => 'Laporan Penilaian Maturitas SPIP',
            ],
            [
                'tahapan' => 'Pemutakhiran Risiko Strategis Pemerintah Daerah',
                'dokumen_pemicu' => 'RKPD Kabupaten Aceh Barat',
                'tanggal_mulai' => '2025-04-01',
                'tanggal_selesai' => '2025-05-30',
                'pelaksana' => 'Sekretaris Daerah dan Pejabat Eselon II',
                'keluaran' => 'Register Risiko Strategis Pemerintah Daerah yang dimutakhirkan',
            ],
            [
                'tahapan' => 'Pemutakhiran Risiko Strategis Perangkat Daerah',
                'dokumen_pemicu' => 'Renja Perangkat Daerah',
                'tanggal_mulai' => '2025-06-02',
                'tanggal_selesai' => '2025-07-31',
                'pelaksana' => 'Seluruh Perangkat Daerah',
                'keluaran' => 'Register Risiko Strategis Perangkat Daerah yang dimutakhirkan',
            ],
            [
                // Rentang tanggal mengikuti contoh Perdep Lampiran 4.
                'tahapan' => 'Penilaian Risiko Operasional Perangkat Daerah',
                'dokumen_pemicu' => 'RKA Perangkat Daerah',
                'tanggal_mulai' => '2025-10-03',
                'tanggal_selesai' => '2025-10-14',
                'pelaksana' => 'Seluruh Perangkat Daerah, difasilitasi Inspektorat',
                'keluaran' => 'Register Risiko Operasional Perangkat Daerah',
            ],
            [
                'tahapan' => 'Penyusunan Rencana Tindak Pengendalian atas Risiko Prioritas',
                'dokumen_pemicu' => 'Register Risiko Operasional',
                'tanggal_mulai' => '2025-10-15',
                'tanggal_selesai' => '2025-11-14',
                'pelaksana' => 'Seluruh Perangkat Daerah',
                'keluaran' => 'Dokumen RTP Form 6 dan Form 7',
            ],
            [
                'tahapan' => 'Pengkomunikasian dan pemantauan pelaksanaan RTP',
                'dokumen_pemicu' => 'Dokumen RTP',
                'tanggal_mulai' => '2025-01-02',
                'tanggal_selesai' => '2025-12-31',
                'pelaksana' => 'Unit Pemilik Risiko, dipantau Unit Kepatuhan',
                'keluaran' => 'Form 8, Form 9, dan Form 10 tiap triwulan',
            ],
            [
                'tahapan' => 'Penyusunan laporan pengelolaan Risiko',
                'dokumen_pemicu' => 'Hasil pemantauan triwulanan',
                'tanggal_mulai' => '2025-12-01',
                'tanggal_selesai' => '2025-12-31',
                'pelaksana' => 'Unit Pemilik Risiko, Unit Kepatuhan, dan Komite Pengelolaan Risiko',
                'keluaran' => 'Laporan Form 11, 12, 13, dan 14',
            ],
        ]);

        $this->command?->info('Arahan Penilaian Risiko 2025 dibuat: 1 arahan lima tahunan (3 tahapan) dan 1 arahan tahunan (8 tahapan).');
    }

    /** @param  array<int, array<string, mixed>>  $baris */
    private function tahapan(ArahanPenilaianRisiko $arahan, array $baris): void
    {
        foreach ($baris as $i => $t) {
            $arahan->tahapan()->create($t + ['urutan' => $i + 1]);
        }
    }
}
