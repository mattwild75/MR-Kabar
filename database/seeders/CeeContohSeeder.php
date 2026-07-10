<?php

namespace Database\Seeders;

use App\Models\CeeJawaban;
use App\Models\CeeKelemahanDokumen;
use App\Models\CeePertanyaan;
use App\Models\CeeSimpulan;
use App\Models\CeeUnsur;
use App\Models\DataUmum;
use App\Models\Opd;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Contoh isian CEE PALING REALISTIS untuk 4 OPD nyata yang sudah terdata:
 * Dinas Kesehatan, BLUD RSUD Cut Nyak Dhien, Dinas Sosial, Inspektorat.
 * Skenario nilai kuesioner & kelemahan dokumen mengacu pada contoh kasus
 * "Urusan Wajib Kesehatan" di Lampiran 5 Perdep PPKD No.4/2019 (Form 1a/1b/1c),
 * diadaptasi + divariasikan wajar antar OPD. Idempotent per OPD+tahun (hapus
 * data lama OPD+tahun ybs sebelum insert ulang).
 */
class CeeContohSeeder extends Seeder
{
    private const TAHUN = 2026;

    public function run(): void
    {
        $ceeUser = User::where('username', 'CEE_Survey')->first();
        $unsurs = CeeUnsur::with(['pertanyaan' => fn ($q) => $q->where('aktif', true)->orderBy('urutan')])
            ->orderBy('urutan')
            ->get()
            ->keyBy('kode');

        $this->seedOpd('DINAS KESEHATAN', $ceeUser, $unsurs, [
            // Skenario: banyak sub-unsur baik, tapi F (pembinaan SDM) &
            // C (kepemimpinan) ada kelemahan — persis contoh Perdep.
            'nilai' => [
                'A' => [3, 3, 3, 3, 3, 3], 'B' => [3, 3, 3, 3],
                'C' => [2, 3, 2, 3, 3, 3, 2, 3],
                'D' => [3, 3, 3, 3], 'E' => [3, 3, 3],
                'F' => [2, 2, 3, 2, 2, 2, 2],
                'G' => [3, 3, 3, 3, 3], 'H' => [3, 3],
            ],
            'responden' => [
                ['nama' => 'dr. Fitriani, M.Kes', 'jabatan' => 'Kasubag Umum dan Kepegawaian'],
                ['nama' => 'Muhammad Rizki, S.KM', 'jabatan' => 'Analis SDM Aparatur'],
                ['nama' => 'Nurul Hasanah, S.E', 'jabatan' => 'Kasubag Keuangan'],
            ],
            // Sengaja disusun spy ADA sumber data yg sama menghasilkan >1
            // temuan (Uraian Kelemahan + Klasifikasi berbeda) — sesuai
            // contoh asli Form 1b Perdep (1 Sumber Data bisa >1 baris).
            'kelemahan' => [
                ['unsur' => 'C', 'sumber' => 'LHP BPK No. 12/LHP/XVIII.BAC/05/2025 tanggal 20 Mei 2025 tentang Hasil Pemeriksaan atas Kinerja Penyelenggaraan JKN', 'uraian' => 'Pelayanan pasien BPJS belum optimal dan regulasi Dinas Kesehatan mengenai praktik dokter belum berjalan sebagaimana mestinya.'],
                ['unsur' => 'F', 'sumber' => 'LHP BPK No. 12/LHP/XVIII.BAC/05/2025 tanggal 20 Mei 2025 tentang Hasil Pemeriksaan atas Kinerja Penyelenggaraan JKN', 'uraian' => 'Pemerintah Kabupaten Aceh Barat belum memiliki strategi dalam pemenuhan dan pendistribusian SDM kesehatan di Puskesmas; kualifikasi dan kompetensi dokter serta tenaga kesehatan di RSUD belum memenuhi kebutuhan pelayanan di era JKN.'],
                ['unsur' => 'G', 'sumber' => 'SK Inspektur No. 700/45/2025 tanggal 10 Januari 2025 tentang PKPT Inspektorat', 'uraian' => 'Inspektorat Daerah belum melakukan audit kinerja atas penyelenggaraan urusan kesehatan pada tingkat strategis.'],
                ['unsur' => 'A', 'sumber' => 'Media massa (Serambi Aceh Barat, 3 Maret 2025)', 'uraian' => 'Terjadi pemberitaan dugaan pelanggaran kode etik oleh oknum tenaga kesehatan di salah satu Puskesmas, yang belum ditindaklanjuti secara terbuka.'],
                ['unsur' => 'B', 'sumber' => 'Media massa (Serambi Aceh Barat, 3 Maret 2025)', 'uraian' => 'Pemberitaan yang sama turut menyoroti keterbatasan tenaga kesehatan bersertifikat kompetensi di Puskesmas terpencil.'],
            ],
            'penyusun' => ['nama' => 'dr. H. Zulfahmi, M.M', 'jabatan' => 'Sekretaris Dinas Kesehatan'],
            'kepala' => ['nama' => 'dr. Hj. Marlina Yusuf, Sp.PD', 'jabatan' => 'Kepala Dinas Kesehatan'],
        ]);

        $this->seedOpd('BLUD RSUD CUT NYAK DHIEN', $ceeUser, $unsurs, [
            // Skenario RS: kompetensi & SDM jadi sorotan (kekurangan dokter
            // spesialis khas RSUD daerah), tapi struktur & pengawasan cukup baik.
            'nilai' => [
                'A' => [3, 3, 3, 3], 'B' => [2, 2, 3, 2],
                'C' => [3, 3, 3, 3, 3, 3, 3, 3],
                'D' => [3, 3, 3, 3], 'E' => [3, 3, 3],
                'F' => [2, 2, 2, 3, 2, 3, 2],
                'G' => [3, 3, 3, 3, 3], 'H' => [3, 3],
            ],
            'responden' => [
                ['nama' => 'Teuku Iskandar, S.Kep, M.M', 'jabatan' => 'Kasubbag Kepegawaian dan Umum'],
                ['nama' => 'dr. Cut Ratna Sari', 'jabatan' => 'Kepala Bidang Pelayanan Medis'],
                ['nama' => 'Ahmad Fauzi, S.E', 'jabatan' => 'Kasubbag Perencanaan dan Keuangan'],
                ['nama' => 'Yusrizal, A.Md.Kep', 'jabatan' => 'Analis SDM Aparatur'],
            ],
            'kelemahan' => [
                ['unsur' => 'B', 'sumber' => 'LHP BPK No. 08/LHP/XVIII.BAC/04/2025 tentang Pengelolaan Keuangan BLUD', 'uraian' => 'Jumlah dan sebaran dokter spesialis belum memenuhi standar kelas rumah sakit sesuai Permenkes, khususnya spesialis anastesi dan radiologi.'],
                ['unsur' => 'F', 'sumber' => 'LHP BPK No. 08/LHP/XVIII.BAC/04/2025 tentang Pengelolaan Keuangan BLUD', 'uraian' => 'Skema insentif/remunerasi tenaga kesehatan belum sepenuhnya mempertimbangkan beban kerja dan kinerja unit pelayanan.'],
                ['unsur' => 'D', 'sumber' => 'Laporan Analisis Beban Kerja RSUD Cut Nyak Dhien Tahun 2025', 'uraian' => 'Struktur organisasi pelayanan penunjang medis belum sepenuhnya selaras dengan beban kerja aktual unit gawat darurat.'],
            ],
            'penyusun' => ['nama' => 'Teuku Iskandar, S.Kep, M.M', 'jabatan' => 'Kasubbag Kepegawaian dan Umum selaku Koordinator MR'],
            'kepala' => ['nama' => 'dr. Muhammad Yasir, Sp.B', 'jabatan' => 'Direktur BLUD RSUD Cut Nyak Dhien'],
        ]);

        $this->seedOpd('DINAS SOSIAL', $ceeUser, $unsurs, [
            // Skenario: kondisi menengah, merata "cukup" (skor 2-3), belum ada
            // kelemahan dokumen signifikan yang tercatat.
            'nilai' => [
                'A' => [3, 2, 3, 2], 'B' => [2, 3, 2, 2],
                'C' => [2, 3, 2, 3, 3, 2, 2, 3],
                'D' => [3, 3, 2, 3], 'E' => [3, 2, 3],
                'F' => [2, 2, 2, 2, 2, 3, 2],
                'G' => [3, 3, 3, 3, 3], 'H' => [3, 3],
            ],
            'responden' => [
                ['nama' => 'Zainal Abidin, S.Sos, M.Si', 'jabatan' => 'Kasubbag Umum dan Kepegawaian'],
                ['nama' => 'Rahmawati, S.Sos', 'jabatan' => 'Analis Kebijakan'],
            ],
            'kelemahan' => [
                ['unsur' => 'F', 'sumber' => 'Hasil Reviu Inspektorat atas Pengelolaan Kepegawaian Dinas Sosial Tahun 2025', 'uraian' => 'Alokasi anggaran pengembangan kompetensi pegawai (diklat/bimtek) masih terbatas dibandingkan kebutuhan penanganan PMKS yang terus meningkat.'],
                ['unsur' => 'A', 'sumber' => 'Hasil Reviu Inspektorat atas Pengelolaan Kepegawaian Dinas Sosial Tahun 2025', 'uraian' => 'Belum seluruh pegawai menandatangani pakta integritas terbaru pasca reorganisasi unit penanganan PMKS.'],
            ],
            'penyusun' => ['nama' => 'Zainal Abidin, S.Sos, M.Si', 'jabatan' => 'Sekretaris Dinas Sosial'],
            'kepala' => ['nama' => 'Drs. Bakhtiar, M.M', 'jabatan' => 'Kepala Dinas Sosial'],
        ]);

        $this->seedOpd('INSPEKTORAT', $ceeUser, $unsurs, [
            // Skenario: APIP sendiri — unsur G (peran APIP) & kepemimpinan
            // dinilai kuat (self-assessment cenderung tinggi utk unsur inti
            // tugasnya sendiri), lainnya baik & konsisten.
            'nilai' => [
                'A' => [4, 3, 4, 3], 'B' => [3, 3, 3, 4],
                'C' => [3, 4, 3, 3, 4, 3, 3, 3],
                'D' => [3, 3, 3, 3], 'E' => [3, 3, 4],
                'F' => [3, 3, 3, 3, 3, 3, 2],
                'G' => [4, 4, 4, 4, 4], 'H' => [4, 3],
            ],
            'responden' => [
                ['nama' => 'Irwansyah, S.E, Ak, M.M', 'jabatan' => 'Sekretaris Inspektorat'],
                ['nama' => 'Auliya Rahman, S.Sos', 'jabatan' => 'Kasubbag Perencanaan'],
                ['nama' => 'Dewi Kartika, S.E', 'jabatan' => 'Kasubbag Umum dan Kepegawaian'],
            ],
            'kelemahan' => [
                ['unsur' => 'F', 'sumber' => 'Laporan Kebutuhan Diklat Jabatan Fungsional Auditor (JFA) Tahun 2025', 'uraian' => 'Jumlah auditor bersertifikat belum sebanding dengan beban pengawasan seluruh OPD, terutama pengawasan berbasis risiko.'],
                ['unsur' => 'H', 'sumber' => 'Laporan Kebutuhan Diklat Jabatan Fungsional Auditor (JFA) Tahun 2025', 'uraian' => 'Koordinasi lintas-OPD dalam penjadwalan reviu bersama masih bergantung pada permintaan manual, belum ada mekanisme baku.'],
            ],
            'penyusun' => ['nama' => 'Irwansyah, S.E, Ak, M.M', 'jabatan' => 'Sekretaris Inspektorat'],
            'kepala' => ['nama' => 'Drs. Ridwan Effendi, Ak, CA', 'jabatan' => 'Inspektur'],
        ]);
    }

    private function seedOpd(string $opdNama, ?User $ceeUser, $unsurs, array $skenario): void
    {
        $opd = Opd::where('nama', $opdNama)->first();
        if (!$opd) {
            $this->command?->warn("OPD '{$opdNama}' tidak ditemukan, dilewati.");

            return;
        }

        // Bersihkan data contoh lama utk OPD+tahun ini supaya seeder idempotent.
        // forceDelete (bukan soft delete) — kolom CeeSimpulan punya unique
        // index (opd_id, tahun, unsur) yg tidak scoped ke deleted_at, jadi
        // soft-deleted row lama akan bentrok saat re-seed kalau tidak
        // dihapus permanen di sini.
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
                    // Variasi kecil antar responden (±1, dibatasi 1-4) supaya
                    // modus tetap masuk akal & tidak seragam sempurna.
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

        // Data Umum akun CEE_Survey dipakai sbg sumber Kepala OPD di 1c —
        // isi/timpa dgn Kepala OPD skenario ini SAAT SEEDING supaya simpulan
        // 1c OPD ini konsisten (krn Data Umum bersifat 1 baris per akun,
        // dipakai bergantian). Untuk pemakaian produksi sesungguhnya, isian
        // manual pengguna via form Data Umum yang berlaku.
        if ($ceeUser) {
            DataUmum::updateOrCreate(
                ['user_id' => $ceeUser->id],
                [
                    'nama_kepala_dinas' => $skenario['kepala']['nama'],
                    'jabatan_kepala_dinas' => $skenario['kepala']['jabatan'],
                ]
            );
        }

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

        $this->command?->info("CEE contoh untuk {$opdNama} berhasil di-seed.");
    }
}
