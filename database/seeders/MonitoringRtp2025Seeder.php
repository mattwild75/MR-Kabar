<?php

namespace Database\Seeders;

use App\Models\CeeRtp;
use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\IrsPemda;
use App\Models\MonitoringRtp;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Form 8 (Pengkomunikasian) dan Form 9 (Pemantauan) Tahun 2025, termasuk tahap
 * uji coba penerapan pengendalian.
 *
 * Dibuat dari RTP yang MEMANG ADA di keempat sumbernya — IRS Pemda, IRS PD,
 * IRO PD, dan RTP CEE — bukan dari baris karangan. Tidak semua RTP diisi
 * monitoringnya, dan yang diisi pun tidak semuanya lengkap: keadaan itu
 * disengaja supaya widget Kepatuhan Pelaporan di Dasbor menunjukkan sebaran
 * yang wajar (ada Perangkat Daerah yang lengkap, sebagian, dan belum), bukan
 * seratus persen sempurna yang tidak pernah terjadi di lapangan.
 *
 * Pembagiannya ditentukan dari sisa bagi id RTP, bukan pengacakan — supaya
 * hasil seeder ini sama persis setiap kali dijalankan dan dapat dibandingkan
 * antar-percobaan.
 *
 * Idempotent: monitoring tahun 2025 dihapus lebih dulu sebelum ditulis ulang.
 */
class MonitoringRtp2025Seeder extends Seeder
{
    private const TAHUN = 2025;

    /** Media pengkomunikasian RTP yang lazim dipakai Perangkat Daerah. */
    private const MEDIA = [
        'Rapat internal Perangkat Daerah, dituangkan dalam notula dan daftar hadir',
        'Surat Edaran Kepala Perangkat Daerah kepada seluruh bidang',
        'Sosialisasi pada apel pagi dan grup komunikasi internal',
        'Nota Dinas kepada bidang pelaksana, disertai lampiran dokumen RTP',
    ];

    /** Bentuk pemantauan yang lazim dipakai. */
    private const METODE = [
        'Pemantauan berkelanjutan melalui laporan bulanan bidang',
        'Konfirmasi dan reviu dokumen pelaksanaan secara triwulanan',
        'Supervisi lapangan disertai daftar uji (checklist)',
        'Evaluasi terpisah oleh Inspektorat pada semester berjalan',
    ];

    /** Hasil uji coba penerapan pengendalian, langkah ke-4 dari enam langkah Perdep. */
    private const HASIL_UJI_COBA = [
        'Prosedur diuji pada satu bidang selama dua minggu. Alur berjalan, tetapi formulir isian terlalu '
            .'panjang sehingga petugas melewatkan kolom penerima. Formulir disederhanakan sebelum diberlakukan.',
        'Uji coba menunjukkan pengendalian berjalan, namun waktu penyelesaian melampaui target karena '
            .'verifikasi bertingkat. Jenjang verifikasi dipangkas dari tiga menjadi dua sebelum ditetapkan.',
        'Diuji pada tiga kecamatan. Petugas memahami prosedur, tetapi belum ada penanggung jawab harian '
            .'sehingga berkas menumpuk di akhir minggu. Penanggung jawab harian ditetapkan dalam rancangan akhir.',
        'Uji coba berjalan sesuai rancangan tanpa hambatan berarti; rancangan diteruskan ke penetapan '
            .'tanpa perubahan.',
    ];

    public function run(): void
    {
        MonitoringRtp::where('tahun_penilaian', self::TAHUN)->forceDelete();

        $daftar = $this->kumpulkanRtp();

        if ($daftar === []) {
            $this->command?->warn('Tidak ada RTP tahun 2025 yang dapat dipantau. Tidak ada monitoring yang dibuat.');

            return;
        }

        $penyusun = User::whereHas('roles', fn ($q) => $q->where('name', 'admin'))->value('id');
        $ringkas = ['lengkap' => 0, 'form8_saja' => 0, 'belum' => 0, 'uji_coba' => 0];

        foreach ($daftar as $rtp) {
            // Sisa bagi menentukan kelengkapan: kira-kira separuh lengkap,
            // seperempat baru Form 8, seperempat belum dipantau sama sekali.
            $bagian = $rtp['id'] % 4;

            if ($bagian === 3) {
                $ringkas['belum']++;

                continue;
            }

            $triwulan = ['I', 'II', 'III', 'IV'][$rtp['id'] % 4];
            $isian = [
                'rtp_sumber_tipe' => $rtp['tipe'],
                'rtp_sumber_id' => $rtp['id'],
                'opd_id' => $rtp['opd_id'],
                'tahun_penilaian' => self::TAHUN,
                'media_komunikasi' => self::MEDIA[$rtp['id'] % count(self::MEDIA)],
                'penyedia_informasi' => 'Sekretaris Perangkat Daerah',
                'penerima_informasi' => 'Seluruh Kepala Bidang dan pelaksana terkait',
                'triwulan_rencana_komunikasi' => $triwulan,
                'tahun_rencana_komunikasi' => self::TAHUN,
                'realisasi_waktu_komunikasi' => $this->bulanTriwulan($triwulan).' '.self::TAHUN,
                'keterangan_komunikasi' => 'Telah dikomunikasikan dan didokumentasikan.',
                'submitted_by' => $penyusun,
            ];

            if ($bagian !== 0) {
                // Baru Form 8 yang terisi — Form 9 sengaja dikosongkan.
                MonitoringRtp::create($isian);
                $ringkas['form8_saja']++;

                continue;
            }

            $triwulanPantau = ['II', 'III', 'IV', 'IV'][$rtp['id'] % 4];
            $isian += [
                'metode_pemantauan' => self::METODE[$rtp['id'] % count(self::METODE)],
                'penanggung_jawab_pemantauan' => 'Kepala Perangkat Daerah',
                'triwulan_rencana_pemantauan' => $triwulanPantau,
                'tahun_rencana_pemantauan' => self::TAHUN,
                'realisasi_waktu_pemantauan' => $this->bulanTriwulan($triwulanPantau).' '.self::TAHUN,
                'keterangan_pemantauan' => 'Pemantauan terlaksana, hasilnya didokumentasikan dan '
                    .'disampaikan kepada Unit Kepatuhan.',
            ];

            // Uji coba hanya untuk sebagian RTP — langkah ini memang tidak
            // selalu ditempuh, terutama untuk pengendalian yang sekadar
            // melanjutkan prosedur yang sudah berjalan.
            if ($rtp['id'] % 8 === 0) {
                $isian += [
                    'uji_coba_triwulan' => $triwulan,
                    'uji_coba_tahun' => self::TAHUN,
                    'uji_coba_hasil' => self::HASIL_UJI_COBA[$rtp['id'] % count(self::HASIL_UJI_COBA)],
                ];
                $ringkas['uji_coba']++;
            }

            MonitoringRtp::create($isian);
            $ringkas['lengkap']++;
        }

        $this->command?->info(
            'Monitoring RTP 2025 dibuat dari '.count($daftar)." RTP: {$ringkas['lengkap']} lengkap Form 8 dan 9 "
            ."(termasuk {$ringkas['uji_coba']} beruji coba), {$ringkas['form8_saja']} baru Form 8, "
            ."{$ringkas['belum']} sengaja dibiarkan belum dipantau."
        );
    }

    /**
     * Kumpulkan RTP tahun 2025 dari keempat sumbernya, hanya yang benar-benar
     * punya rumusan RTP dan diketahui Perangkat Daerah pemiliknya — monitoring
     * tanpa pemilik tidak dapat disimpan.
     *
     * @return array<int, array{tipe: string, id: int, opd_id: int}>
     */
    private function kumpulkanRtp(): array
    {
        $daftar = [];

        $sumberRisiko = [
            'irs_pemda' => IrsPemda::class,
            'irs_pd' => IrsPd::class,
            'iro_pd' => IroPd::class,
        ];

        foreach ($sumberRisiko as $tipe => $model) {
            $baris = $model::with('user')
                ->where('TAHUN DINILAI RISIKO', (string) self::TAHUN)
                ->whereNotNull('RENCANA TINDAK PENGENDALIAN')
                ->where('RENCANA TINDAK PENGENDALIAN', '!=', '')
                ->get();

            foreach ($baris as $r) {
                $opdId = $r->user?->opd_id;
                if ($opdId) {
                    $daftar[] = ['tipe' => $tipe, 'id' => $r->id, 'opd_id' => (int) $opdId];
                }
            }
        }

        foreach (CeeRtp::where('tahun_penilaian', self::TAHUN)->get() as $r) {
            if ($r->opd_id) {
                $daftar[] = ['tipe' => 'cee_rtp', 'id' => $r->id, 'opd_id' => (int) $r->opd_id];
            }
        }

        return $daftar;
    }

    /** Bulan terakhir tiap triwulan, dipakai sebagai realisasi waktu. */
    private function bulanTriwulan(string $triwulan): string
    {
        return ['I' => 'Maret', 'II' => 'Juni', 'III' => 'September', 'IV' => 'Desember'][$triwulan] ?? 'Desember';
    }
}
