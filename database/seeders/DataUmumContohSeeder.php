<?php

namespace Database\Seeders;

use App\Models\DataUmum;
use App\Models\Opd;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Contoh Data Umum realistis PER-OPD — dipakai memverifikasi Form Cetak
 * Risiko 2a/2b/2c (header identitas + blok tanda tangan). Isiannya SENGAJA
 * berbeda-beda per OPD (Kepala Dinas, NIP, Urusan Pemerintahan, PIC),
 * bukan disamaratakan — meniru variasi nyata pada kertas kerja tiap OPD
 * (lihat contoh "MR Kabar BKPSDM" di Lampiran Perdep PPKD No.4/2019).
 *
 * Hanya menyentuh OPD yang SUDAH punya akun PIC (dibuat PicOpdSeeder) DAN
 * baris DataUmum-nya masih kosong — idempotent, tidak menimpa isian PIC
 * yang sudah pernah diisi manual lewat menu Data Umum.
 */
class DataUmumContohSeeder extends Seeder
{
    /**
     * Kunci: nama OPD (persis sesuai tabel `opd`). Nilai: field yang
     * berbeda per OPD — urusan pemerintahan, kepala dinas, PIC.
     */
    private const CONTOH = [
        'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA' => [
            'nama_urusan' => 'Unsur Penunjang Urusan Pemerintahan',
            'nama_sub_urusan' => 'Kepegawaian',
            'nama_kepala_dinas' => 'Drs. Hasmi Zuandi, M.Sc.',
            'jabatan_kepala_dinas' => 'Kepala BKPSDM',
            'nip_kepala_dinas' => '19740222 199302 1 002',
            'nama_pic' => 'Suci Fitria, S.E.',
            'jabatan_pic' => 'Sub Koordinator Perencanaan dan Pelaporan',
            'nip_pic' => '19900512 201503 2 004',
        ],
        'DINAS KESEHATAN' => [
            'nama_urusan' => 'Urusan Pemerintahan Bidang Kesehatan',
            'nama_sub_urusan' => 'Pelayanan Kesehatan',
            'nama_kepala_dinas' => 'dr. Marzuki, Sp.PD',
            'jabatan_kepala_dinas' => 'Kepala Dinas Kesehatan',
            'nip_kepala_dinas' => '19710815 200003 1 006',
            'nama_pic' => 'Nurul Hasanah, S.KM.',
            'jabatan_pic' => 'Kepala Subbagian Program dan Pelaporan',
            'nip_pic' => '19880920 201101 2 003',
        ],
        'DINAS SOSIAL' => [
            'nama_urusan' => 'Urusan Pemerintahan Bidang Sosial',
            'nama_sub_urusan' => 'Rehabilitasi dan Perlindungan Sosial',
            'nama_kepala_dinas' => 'Drs. Adami, M.M.',
            'jabatan_kepala_dinas' => 'Kepala Dinas Sosial',
            'nip_kepala_dinas' => '19680312 199403 1 004',
            'nama_pic' => 'Rahmawati, S.Sos.',
            'jabatan_pic' => 'Kepala Subbagian Perencanaan',
            'nip_pic' => '19851004 201001 2 002',
        ],
        'INSPEKTORAT' => [
            'nama_urusan' => 'Unsur Pengawasan Urusan Pemerintahan',
            'nama_sub_urusan' => 'Pengawasan Internal',
            'nama_kepala_dinas' => 'Ir. Muhammad Ridha, M.M.',
            'jabatan_kepala_dinas' => 'Inspektur',
            'nip_kepala_dinas' => '19650710 199103 1 002',
            'nama_pic' => 'Dedi Kurniawan, S.E., Ak.',
            'jabatan_pic' => 'Sekretaris Inspektorat',
            'nip_pic' => '19821130 200604 1 001',
        ],
        'SEKRETARIAT DAERAH' => [
            'nama_urusan' => 'Unsur Staf Urusan Pemerintahan',
            'nama_sub_urusan' => 'Tata Kelola Pemerintahan',
            'nama_kepala_dinas' => 'Drs. Zulkifli Adam, M.Si',
            'jabatan_kepala_dinas' => 'Sekretaris Daerah',
            'nip_kepala_dinas' => '19660501 198903 1 003',
            'nama_pic' => 'Fitriani, S.STP., M.Si.',
            'jabatan_pic' => 'Kepala Bagian Organisasi',
            'nip_pic' => '19870225 200604 2 001',
        ],
        'BLUD RSUD CUT NYAK DHIEN' => [
            'nama_urusan' => 'Urusan Pemerintahan Bidang Kesehatan',
            'nama_sub_urusan' => 'Pelayanan Rumah Sakit',
            'nama_kepala_dinas' => 'dr. Novita Sari, M.Kes.',
            'jabatan_kepala_dinas' => 'Direktur RSUD Cut Nyak Dhien',
            'nip_kepala_dinas' => '19750620 200312 2 002',
            'nama_pic' => 'Zulfahmi, S.Kep., Ners.',
            'jabatan_pic' => 'Kepala Seksi Perencanaan dan Rekam Medis',
            'nip_pic' => '19890814 201203 1 003',
        ],
    ];

    public function run(): void
    {
        $dibuat = 0;
        $dilewati = 0;

        foreach (self::CONTOH as $namaOpd => $fields) {
            $opd = Opd::where('nama', $namaOpd)->first();
            if (!$opd) {
                continue;
            }

            $user = User::where('opd_id', $opd->id)->first();
            if (!$user) {
                continue;
            }

            if (DataUmum::where('user_id', $user->id)->exists()) {
                $dilewati++;
                continue;
            }

            DataUmum::create(array_merge($fields, [
                'user_id' => $user->id,
                'nama_dinas_opd' => $namaOpd,
                'tempat_pembuatan' => 'Meulaboh',
                'tanggal_pembuatan' => now(),
            ]));
            $dibuat++;
        }

        $this->command?->info("Data Umum contoh: {$dibuat} dibuat, {$dilewati} dilewati (sudah ada).");
    }
}
