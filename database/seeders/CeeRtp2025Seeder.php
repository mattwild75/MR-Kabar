<?php

namespace Database\Seeders;

use App\Models\CeeRtp;
use App\Models\CeeSimpulan;
use Illuminate\Database\Seeder;

/**
 * Form 1d Tahun 2025 — Rencana Tindak Pengendalian atas kelemahan lingkungan
 * pengendalian, disusun dari simpulan CEE yang berbunyi "Kurang Memadai".
 *
 * TIDAK mengarang sub unsur mana yang bermasalah: yang dibuatkan RTP hanya sub
 * unsur yang memang disimpulkan Kurang Memadai pada Form 1c (lihat
 * CeeContoh2025Seeder). Dengan begitu Form 1d selalu konsisten dengan Form 1c —
 * persis alur yang diminta Perdep, dan bukan dua daftar yang berdiri sendiri.
 *
 * Rumusan RTP-nya disusun per sub unsur lingkungan pengendalian, memakai
 * kalimat yang lazim dipakai perbaikan unsur tersebut. Penanggung jawab
 * diletakkan pada jabatan yang lazim membidanginya, bukan nama orang.
 *
 * Idempotent: RTP CEE tahun 2025 dihapus lebih dulu sebelum ditulis ulang.
 */
class CeeRtp2025Seeder extends Seeder
{
    private const TAHUN = 2025;

    /**
     * Rancangan perbaikan per kode sub unsur lingkungan pengendalian.
     * Kuncinya kode unsur A sampai H sebagaimana diseed CeeSeeder.
     *
     * @var array<string, array{rtp: string, pj: string, tw: string}>
     */
    private const RANCANGAN = [
        'A' => [
            'rtp' => 'Menyusun dan menetapkan aturan perilaku pegawai beserta mekanisme penegakannya, '
                . 'mengomunikasikannya kepada seluruh pegawai, serta menandatangani pakta integritas secara berkala.',
            'pj' => 'Sekretaris Perangkat Daerah',
            'tw' => 'II',
        ],
        'B' => [
            'rtp' => 'Menyusun standar kompetensi tiap jabatan dan memetakan kesenjangan kompetensi pegawai, '
                . 'lalu menyusun rencana pengembangan kompetensi berbasis kesenjangan tersebut.',
            'pj' => 'Kepala Subbagian Kepegawaian',
            'tw' => 'III',
        ],
        'C' => [
            'rtp' => 'Menetapkan kebijakan pengelolaan Risiko pada tingkat Perangkat Daerah dan menjadikan '
                . 'informasi Risiko sebagai bahan pertimbangan dalam rapat pimpinan serta penyusunan Renja.',
            'pj' => 'Kepala Perangkat Daerah',
            'tw' => 'II',
        ],
        'D' => [
            'rtp' => 'Menuangkan peran dan tanggung jawab pengelolaan Risiko ke dalam uraian tugas jabatan, '
                . 'serta menetapkan mekanisme pelaporan pelaksanaannya secara berkala.',
            'pj' => 'Sekretaris Perangkat Daerah',
            'tw' => 'III',
        ],
        'E' => [
            'rtp' => 'Menetapkan kriteria pendelegasian wewenang secara tertulis dan mereviu kewenangan yang '
                . 'didelegasikan secara periodik.',
            'pj' => 'Sekretaris Perangkat Daerah',
            'tw' => 'III',
        ],
        'F' => [
            'rtp' => 'Menyusun kebijakan dan prosedur pengelolaan sumber daya manusia yang lengkap sejak '
                . 'rekrutmen sampai pemberhentian, menginternalisasi budaya sadar Risiko, serta menyiapkan '
                . 'mekanisme penghargaan dan sanksi atas pengelolaan Risiko dalam penilaian kinerja.',
            'pj' => 'Kepala Subbagian Kepegawaian',
            'tw' => 'IV',
        ],
        'G' => [
            'rtp' => 'Mengusulkan reviu dan pendampingan Inspektorat atas penyelenggaraan urusan, serta '
                . 'menindaklanjuti seluruh saran dan rekomendasi pengawasan secara tepat waktu.',
            'pj' => 'Sekretaris Perangkat Daerah',
            'tw' => 'III',
        ],
        'H' => [
            'rtp' => 'Membangun mekanisme koordinasi berkala dengan instansi yang memiliki keterkaitan '
                . 'operasional maupun fungsi pengawasan, dituangkan dalam jadwal dan notula yang terdokumentasi.',
            'pj' => 'Kepala Perangkat Daerah',
            'tw' => 'IV',
        ],
    ];

    public function run(): void
    {
        CeeRtp::where('tahun_penilaian', self::TAHUN)->forceDelete();

        $simpulan = CeeSimpulan::with('unsur')
            ->where('tahun_penilaian', self::TAHUN)
            ->where('simpulan', 'Kurang Memadai')
            ->get();

        if ($simpulan->isEmpty()) {
            $this->command?->warn(
                'Belum ada simpulan CEE 2025 yang Kurang Memadai — jalankan CeeContoh2025Seeder lebih dulu. '
                . 'Tidak ada RTP CEE yang dibuat.'
            );

            return;
        }

        $dibuat = 0;
        foreach ($simpulan as $s) {
            $kode = $s->unsur?->kode;
            $rancangan = self::RANCANGAN[$kode] ?? null;
            if ($rancangan === null) {
                continue;
            }

            CeeRtp::create([
                'opd_id' => $s->opd_id,
                'tahun_penilaian' => self::TAHUN,
                'cee_unsur_id' => $s->cee_unsur_id,
                // Kondisi diambil dari penjelasan simpulan yang sudah ditulis
                // penyusun; kalau kosong, dipakai nama sub unsurnya sendiri
                // supaya kolom ini tidak pernah menjadi teks karangan.
                'kondisi_kurang_memadai' => $s->penjelasan
                    ?: 'Sub unsur ' . ($s->unsur?->nama ?? $kode) . ' disimpulkan Kurang Memadai pada Form 1c.',
                'rencana_tindak_pengendalian' => $rancangan['rtp'],
                'penanggung_jawab' => $rancangan['pj'],
                'triwulan_target' => $rancangan['tw'],
                'tahun_target_penyelesaian' => self::TAHUN,
                'submitted_by' => $s->submitted_by,
            ]);
            $dibuat++;
        }

        $this->command?->info(
            "RTP CEE 2025 dibuat: {$dibuat} baris, seluruhnya berasal dari sub unsur yang disimpulkan Kurang Memadai."
        );
    }
}
