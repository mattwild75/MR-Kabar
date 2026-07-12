<?php

namespace Database\Seeders;

use App\Models\CeeJawaban;
use App\Models\CeeKelemahanDokumen;
use App\Models\CeeSimpulan;
use App\Models\CeeUnsur;
use App\Models\DataUmum;
use App\Models\Opd;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Contoh isian CEE TAHUN PENILAIAN 2025 untuk 5 OPD yang sudah punya data
 * 2026 (lihat CeeContohSeeder): Dinas Kesehatan, BLUD RSUD Cut Nyak Dhien,
 * Dinas Sosial, Inspektorat, Sekretariat Daerah — dibuat sepasang dengan
 * [[unifikasi-tahun-penilaian]]/RegisterRisiko2025Seeder supaya Form Cetak
 * CEE (1a/1b/1c) juga bisa diuji ganti Tahun Penilaian 2025 vs 2026.
 *
 * Skenario nilai SENGAJA sedikit lebih rendah/berbeda dari 2026 pada
 * beberapa unsur (mensimulasikan kondisi setahun sebelumnya, sebelum
 * perbaikan) — bukan duplikat data 2026 dgn tahun beda. Idempotent per
 * OPD+tahun (hapus data lama OPD+tahun ybs sebelum insert ulang), sama
 * pola dgn CeeContohSeeder.
 */
class CeeContoh2025Seeder extends Seeder
{
    private const TAHUN = 2025;

    public function run(): void
    {
        $ceeUser = User::where('username', 'CEE_Survey')->first();
        $unsurs = CeeUnsur::with(['pertanyaan' => fn ($q) => $q->where('aktif', true)->orderBy('urutan')])
            ->orderBy('urutan')
            ->get()
            ->keyBy('kode');

        $this->seedOpd('DINAS KESEHATAN', $ceeUser, $unsurs, [
            // 2025: kelemahan F (pembinaan SDM) & C (kepemimpinan) lebih
            // menonjol drpd 2026 — blm ada tindak lanjut pemenuhan SDM.
            'nilai' => [
                'A' => [3, 3, 2, 3, 3, 2], 'B' => [2, 3, 3, 2],
                'C' => [2, 2, 2, 3, 2, 3, 2, 2],
                'D' => [3, 2, 3, 3], 'E' => [3, 3, 2],
                'F' => [2, 1, 2, 2, 2, 1, 2],
                'G' => [3, 3, 2, 3, 3], 'H' => [3, 2],
            ],
            'responden' => [
                ['nama' => 'dr. Fitriani, M.Kes', 'jabatan' => 'Kasubag Umum dan Kepegawaian'],
                ['nama' => 'Muhammad Rizki, S.KM', 'jabatan' => 'Analis SDM Aparatur'],
                ['nama' => 'Nurul Hasanah, S.E', 'jabatan' => 'Kasubag Keuangan'],
            ],
            'kelemahan' => [
                ['unsur' => 'F', 'sumber' => 'LHP BPK No. 09/LHP/XVIII.BAC/05/2024 tanggal 22 Mei 2024 tentang Hasil Pemeriksaan atas Kinerja Penyelenggaraan JKN', 'uraian' => 'Pemerintah Kabupaten Aceh Barat belum memiliki strategi pemenuhan dan pendistribusian SDM kesehatan di Puskesmas; kekosongan formasi dokter di sejumlah Puskesmas belum tertangani.'],
                ['unsur' => 'C', 'sumber' => 'LHP BPK No. 09/LHP/XVIII.BAC/05/2024 tanggal 22 Mei 2024 tentang Hasil Pemeriksaan atas Kinerja Penyelenggaraan JKN', 'uraian' => 'Arahan pimpinan terkait mutu layanan BPJS belum dikomunikasikan secara konsisten ke seluruh Puskesmas jaringan.'],
                ['unsur' => 'G', 'sumber' => 'SK Inspektur No. 700/38/2024 tanggal 8 Januari 2024 tentang PKPT Inspektorat', 'uraian' => 'Inspektorat Daerah belum melakukan audit kinerja atas penyelenggaraan urusan kesehatan pada tingkat strategis pada tahun berjalan.'],
            ],
            'penyusun' => ['nama' => 'dr. H. Zulfahmi, M.M', 'jabatan' => 'Sekretaris Dinas Kesehatan'],
            'kepala' => ['nama' => 'dr. Hj. Marlina Yusuf, Sp.PD', 'jabatan' => 'Kepala Dinas Kesehatan'],
        ]);

        $this->seedOpd('BLUD RSUD CUT NYAK DHIEN', $ceeUser, $unsurs, [
            // 2025: kekurangan dokter spesialis masih jadi temuan utama,
            // struktur & pengawasan relatif stabil spt tahun berikutnya.
            'nilai' => [
                'A' => [3, 3, 2, 3], 'B' => [2, 2, 2, 2],
                'C' => [3, 2, 3, 3, 3, 2, 3, 3],
                'D' => [3, 3, 2, 3], 'E' => [3, 3, 2],
                'F' => [2, 1, 2, 2, 2, 2, 2],
                'G' => [3, 3, 3, 2, 3], 'H' => [3, 3],
            ],
            'responden' => [
                ['nama' => 'Teuku Iskandar, S.Kep, M.M', 'jabatan' => 'Kasubbag Kepegawaian dan Umum'],
                ['nama' => 'dr. Cut Ratna Sari', 'jabatan' => 'Kepala Bidang Pelayanan Medis'],
                ['nama' => 'Ahmad Fauzi, S.E', 'jabatan' => 'Kasubbag Perencanaan dan Keuangan'],
            ],
            'kelemahan' => [
                ['unsur' => 'B', 'sumber' => 'LHP BPK No. 05/LHP/XVIII.BAC/04/2024 tentang Pengelolaan Keuangan BLUD', 'uraian' => 'Jumlah dan sebaran dokter spesialis belum memenuhi standar kelas rumah sakit sesuai Permenkes, khususnya spesialis anastesi dan radiologi, blm ada perbaikan sejak tahun sebelumnya.'],
                ['unsur' => 'F', 'sumber' => 'LHP BPK No. 05/LHP/XVIII.BAC/04/2024 tentang Pengelolaan Keuangan BLUD', 'uraian' => 'Skema insentif/remunerasi tenaga kesehatan belum sepenuhnya mempertimbangkan beban kerja dan kinerja unit pelayanan.'],
            ],
            'penyusun' => ['nama' => 'Teuku Iskandar, S.Kep, M.M', 'jabatan' => 'Kasubbag Kepegawaian dan Umum selaku Koordinator MR'],
            'kepala' => ['nama' => 'dr. Muhammad Yasir, Sp.B', 'jabatan' => 'Direktur BLUD RSUD Cut Nyak Dhien'],
        ]);

        $this->seedOpd('DINAS SOSIAL', $ceeUser, $unsurs, [
            // 2025: kondisi sedikit lebih rendah drpd 2026, alokasi diklat
            // masih jadi kelemahan utama (belum ditindaklanjuti).
            'nilai' => [
                'A' => [2, 2, 3, 2], 'B' => [2, 2, 2, 2],
                'C' => [2, 2, 2, 2, 3, 2, 2, 2],
                'D' => [2, 3, 2, 3], 'E' => [2, 2, 3],
                'F' => [2, 1, 2, 2, 1, 2, 2],
                'G' => [3, 2, 3, 3, 2], 'H' => [2, 3],
            ],
            'responden' => [
                ['nama' => 'Zainal Abidin, S.Sos, M.Si', 'jabatan' => 'Kasubbag Umum dan Kepegawaian'],
                ['nama' => 'Rahmawati, S.Sos', 'jabatan' => 'Analis Kebijakan'],
            ],
            'kelemahan' => [
                ['unsur' => 'F', 'sumber' => 'Hasil Reviu Inspektorat atas Pengelolaan Kepegawaian Dinas Sosial Tahun 2024', 'uraian' => 'Alokasi anggaran pengembangan kompetensi pegawai (diklat/bimtek) masih terbatas dibandingkan kebutuhan penanganan PMKS yang terus meningkat.'],
                ['unsur' => 'A', 'sumber' => 'Hasil Reviu Inspektorat atas Pengelolaan Kepegawaian Dinas Sosial Tahun 2024', 'uraian' => 'Belum seluruh pegawai menandatangani pakta integritas, khususnya pegawai baru mutasi ke unit penanganan PMKS.'],
            ],
            'penyusun' => ['nama' => 'Zainal Abidin, S.Sos, M.Si', 'jabatan' => 'Sekretaris Dinas Sosial'],
            'kepala' => ['nama' => 'Drs. Bakhtiar, M.M', 'jabatan' => 'Kepala Dinas Sosial'],
        ]);

        $this->seedOpd('INSPEKTORAT', $ceeUser, $unsurs, [
            // 2025: masih kuat scr umum (khas APIP), tapi kelemahan
            // kapasitas auditor (F) & koordinasi lintas OPD (H) blm membaik.
            'nilai' => [
                'A' => [3, 3, 4, 3], 'B' => [3, 3, 3, 3],
                'C' => [3, 3, 3, 3, 3, 3, 3, 3],
                'D' => [3, 3, 3, 3], 'E' => [3, 3, 3],
                'F' => [2, 2, 3, 2, 3, 2, 2],
                'G' => [4, 3, 4, 3, 4], 'H' => [3, 2],
            ],
            'responden' => [
                ['nama' => 'Irwansyah, S.E, Ak, M.M', 'jabatan' => 'Sekretaris Inspektorat'],
                ['nama' => 'Auliya Rahman, S.Sos', 'jabatan' => 'Kasubbag Perencanaan'],
            ],
            'kelemahan' => [
                ['unsur' => 'F', 'sumber' => 'Laporan Kebutuhan Diklat Jabatan Fungsional Auditor (JFA) Tahun 2024', 'uraian' => 'Jumlah auditor bersertifikat belum sebanding dengan beban pengawasan seluruh OPD, terutama pengawasan berbasis risiko.'],
                ['unsur' => 'H', 'sumber' => 'Laporan Kebutuhan Diklat Jabatan Fungsional Auditor (JFA) Tahun 2024', 'uraian' => 'Koordinasi lintas-OPD dalam penjadwalan reviu bersama masih bergantung pada permintaan manual, belum ada mekanisme baku.'],
            ],
            'penyusun' => ['nama' => 'Irwansyah, S.E, Ak, M.M', 'jabatan' => 'Sekretaris Inspektorat'],
            'kepala' => ['nama' => 'Drs. Ridwan Effendi, Ak, CA', 'jabatan' => 'Inspektur'],
        ]);

        $this->seedOpd('SEKRETARIAT DAERAH', $ceeUser, $unsurs, [
            // 2025: koordinasi kebijakan lintas-OPD (C) & pembinaan SDM (F)
            // jadi sorotan, blm ada forum koordinasi terjadwal spt di 2026.
            'nilai' => [
                'A' => [3, 3, 3, 2], 'B' => [3, 2, 3, 3],
                'C' => [2, 2, 3, 2, 2, 3, 2, 2],
                'D' => [3, 3, 3, 2], 'E' => [3, 2, 3],
                'F' => [2, 2, 2, 1, 2, 2, 2],
                'G' => [3, 3, 3, 3, 2], 'H' => [3, 3],
            ],
            'responden' => [
                ['nama' => 'Muhammad Hidayat, S.STP, M.Si', 'jabatan' => 'Kepala Bagian Organisasi selaku Koordinator MR Sekretariat Daerah'],
                ['nama' => 'Rina Marlina, S.H', 'jabatan' => 'Kepala Bagian Hukum'],
                ['nama' => 'Syarifah Aini, S.E', 'jabatan' => 'Kasubbag Kepegawaian'],
            ],
            'kelemahan' => [
                ['unsur' => 'C', 'sumber' => 'Hasil Evaluasi Rapat Koordinasi Pimpinan (Rakorpim) Semester II Tahun 2024', 'uraian' => 'Belum ada forum koordinasi rutin lintas-OPD yang meninjau konsistensi kebijakan/Perkada terhadap capaian target RPJMD secara berkala.'],
                ['unsur' => 'F', 'sumber' => 'Hasil Reviu Inspektorat atas Pengelolaan Kepegawaian Sekretariat Daerah Tahun 2024', 'uraian' => 'Pengembangan kompetensi legal drafting bagi staf Bagian Hukum dan OPD teknis pengusul produk hukum belum terjadwal rutin.'],
            ],
            'penyusun' => ['nama' => 'Muhammad Hidayat, S.STP, M.Si', 'jabatan' => 'Kepala Bagian Organisasi selaku Koordinator MR Sekretariat Daerah'],
            'kepala' => ['nama' => 'Drs. Zulkifli Adam, M.Si', 'jabatan' => 'Sekretaris Daerah'],
        ]);
    }

    private function seedOpd(string $opdNama, ?User $ceeUser, $unsurs, array $skenario): void
    {
        $opd = Opd::where('nama', $opdNama)->first();
        if (!$opd) {
            $this->command?->warn("OPD '{$opdNama}' tidak ditemukan, dilewati.");

            return;
        }

        // Bersihkan data contoh lama utk OPD+tahun ini supaya seeder
        // idempotent — lihat CeeContohSeeder utk alasan forceDelete
        // (bukan soft delete) krn constraint unique (opd_id, tahun, unsur)
        // pada CeeSimpulan tidak scoped ke deleted_at.
        CeeJawaban::withTrashed()->where('opd_id', $opd->id)->where('tahun_penilaian', self::TAHUN)->forceDelete();
        CeeKelemahanDokumen::withTrashed()->where('opd_id', $opd->id)->where('tahun_penilaian', self::TAHUN)->forceDelete();
        CeeSimpulan::withTrashed()->where('opd_id', $opd->id)->where('tahun_penilaian', self::TAHUN)->forceDelete();

        // 1a: tiap responden menjawab SEMUA pertanyaan tiap unsur, nilai per
        // unsur diambil berurutan sesuai urutan pertanyaan.
        foreach ($unsurs as $kode => $unsur) {
            $nilaiUnsur = $skenario['nilai'][$kode] ?? [];
            foreach ($unsur->pertanyaan as $idx => $pertanyaan) {
                $nilaiDasar = $nilaiUnsur[$idx] ?? 3;
                foreach ($skenario['responden'] as $i => $resp) {
                    $variasi = [0, $i % 2 === 0 ? 1 : -1, 0][$i % 3] ?? 0;
                    $nilai = max(1, min(4, $nilaiDasar + $variasi));

                    CeeJawaban::create([
                        'opd_id' => $opd->id,
                        'cee_pertanyaan_id' => $pertanyaan->id,
                        'tahun_penilaian' => self::TAHUN,
                        'responden_nama' => $resp['nama'],
                        'responden_jabatan' => $resp['jabatan'],
                        'submitted_by' => $ceeUser?->id,
                        'nilai' => $nilai,
                    ]);
                }
            }
        }

        // 1b: kelemahan berdasar dokumen.
        foreach ($skenario['kelemahan'] as $k) {
            $unsur = $unsurs[$k['unsur']] ?? null;
            if (!$unsur) {
                continue;
            }
            CeeKelemahanDokumen::create([
                'opd_id' => $opd->id,
                'tahun_penilaian' => self::TAHUN,
                'cee_unsur_id' => $unsur->id,
                'sumber_data' => $k['sumber'],
                'uraian_kelemahan' => $k['uraian'],
                'pengisi_nama' => $skenario['penyusun']['nama'],
                'pengisi_jabatan' => $skenario['penyusun']['jabatan'],
                'submitted_by' => $ceeUser?->id,
            ]);
        }

        // Catatan: DataUmum akun CEE_Survey (nama/jabatan Kepala OPD) TIDAK
        // ditimpa lagi di sini spt CeeContohSeeder — krn akun itu dipakai
        // bergantian lintas OPD dan bergantung pada seeder MANA yg jalan
        // terakhir. Nama/jabatan Kepala OPD untuk 1c sepenuhnya diambil dari
        // kolom kepala_opd_nama/kepala_opd_jabatan pada CeeSimpulan di bawah
        // (bukan dari relasi DataUmum), jadi aman idempotent per OPD+tahun.

        // 1c: simpulan per unsur — modus 1a + ada/tidaknya kelemahan 1b.
        foreach ($unsurs as $kode => $unsur) {
            $nilaiUnsur = $skenario['nilai'][$kode] ?? [];
            $rataRata = count($nilaiUnsur) > 0 ? array_sum($nilaiUnsur) / count($nilaiUnsur) : 3;
            $adaKelemahan = collect($skenario['kelemahan'])->contains('unsur', $kode);
            $simpulanAkhir = ($rataRata >= 2.5 && !$adaKelemahan) ? 'Memadai' : 'Kurang Memadai';

            $penjelasan = $adaKelemahan
                ? collect($skenario['kelemahan'])->firstWhere('unsur', $kode)['uraian']
                : ($simpulanAkhir === 'Memadai' ? 'Kondisi sub unsur ini telah memadai berdasarkan hasil survei persepsi dan tidak ditemukan kelemahan berdasarkan reviu dokumen.' : null);

            CeeSimpulan::create([
                'opd_id' => $opd->id,
                'tahun_penilaian' => self::TAHUN,
                'cee_unsur_id' => $unsur->id,
                'penjelasan' => $penjelasan,
                'penyusun_nama' => $skenario['penyusun']['nama'],
                'penyusun_jabatan' => $skenario['penyusun']['jabatan'],
                'submitted_by' => $ceeUser?->id,
                'kepala_opd_nama' => $skenario['kepala']['nama'],
                'kepala_opd_jabatan' => $skenario['kepala']['jabatan'],
            ]);
        }

        $this->command?->info("CEE contoh tahun 2025 untuk {$opdNama} berhasil di-seed.");
    }
}
