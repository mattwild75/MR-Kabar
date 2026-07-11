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
 * Contoh isian CEE PALING REALISTIS untuk Sekretariat Daerah — OPD ke-5 yang
 * sudah punya data IRS Pemda/IRS PD/IRO PD (lihat SekretariatDaerahContohSeeder).
 * Melengkapi 4 OPD di CeeContohSeeder.php supaya kelima OPD yang sudah
 * terinput full punya CEE + Risiko.
 *
 * Skenario: sbg unsur koordinatif pemda (bukan OPD teknis-sektoral), Setda
 * dinilai kuat di unsur kepemimpinan (C) & hubungan antar-instansi (H, krn
 * memang tugas fungsinya mengoordinasikan lintas-OPD), tapi ada kelemahan di
 * D (struktur organisasi — Setda sering direorganisasi mengikuti kebijakan
 * penataan perangkat daerah) dan F (pembinaan SDM — staf administrasi Setda
 * kerap dimutasi lintas-bagian tanpa pemetaan kompetensi baku). Sama pola
 * dgn CeeContohSeeder::seedOpd(), idempotent per OPD+tahun.
 */
class CeeContohSekretariatDaerahSeeder extends Seeder
{
    private const TAHUN = 2026;

    public function run(): void
    {
        $ceeUser = User::where('username', 'CEE_Survey')->first();
        $unsurs = CeeUnsur::with(['pertanyaan' => fn ($q) => $q->where('aktif', true)->orderBy('urutan')])
            ->orderBy('urutan')
            ->get()
            ->keyBy('kode');

        $opd = Opd::where('nama', 'SEKRETARIAT DAERAH')->first();
        if (!$opd) {
            $this->command?->warn("OPD 'SEKRETARIAT DAERAH' tidak ditemukan, dilewati.");

            return;
        }

        $skenario = [
            'nilai' => [
                'A' => [3, 3, 3, 3], 'B' => [3, 2, 3, 3],
                'C' => [4, 3, 4, 3, 4, 3, 3, 4],
                'D' => [2, 3, 2, 2], 'E' => [3, 3, 3],
                'F' => [2, 2, 3, 2, 2, 2, 3],
                'G' => [3, 3, 3, 3, 3], 'H' => [4, 4],
            ],
            'responden' => [
                ['nama' => 'Muhammad Hidayat, S.STP, M.Si', 'jabatan' => 'Kepala Bagian Organisasi Sekretariat Daerah'],
                ['nama' => 'Rina Wahyuni, S.H', 'jabatan' => 'Kepala Bagian Hukum Sekretariat Daerah'],
                ['nama' => 'Teuku Ridwan, S.Sos, M.AP', 'jabatan' => 'Kasubbag Kepegawaian Sekretariat Daerah'],
            ],
            // Sama pola dgn CeeContohSeeder: 1 Sumber Data bisa menghasilkan
            // >1 baris kelemahan di unsur berbeda.
            'kelemahan' => [
                ['unsur' => 'D', 'sumber' => 'Hasil Evaluasi Kelembagaan Perangkat Daerah oleh Kementerian PANRB Tahun 2025', 'uraian' => 'Struktur Bagian pada Sekretariat Daerah belum sepenuhnya disesuaikan dengan hasil analisis beban kerja terbaru pasca penataan perangkat daerah.'],
                ['unsur' => 'F', 'sumber' => 'Hasil Evaluasi Kelembagaan Perangkat Daerah oleh Kementerian PANRB Tahun 2025', 'uraian' => 'Rotasi/mutasi staf antar-Bagian pada Sekretariat Daerah belum mempertimbangkan pemetaan kompetensi jabatan secara baku.'],
                ['unsur' => 'B', 'sumber' => 'Laporan Kebutuhan Diklat Aparatur Sekretariat Daerah Tahun 2025', 'uraian' => 'Sebagian staf pelaksana administrasi umum belum mengikuti pelatihan tata naskah dinas elektronik terbaru.'],
            ],
            'penyusun' => ['nama' => 'Muhammad Hidayat, S.STP, M.Si', 'jabatan' => 'Kepala Bagian Organisasi selaku Koordinator MR Sekretariat Daerah'],
            'kepala' => ['nama' => 'Drs. Zulkifli Adam, M.Si', 'jabatan' => 'Sekretaris Daerah'],
        ];

        // Bersihkan data contoh lama utk OPD+tahun ini supaya seeder idempotent.
        // forceDelete (bukan soft delete) — kolom CeeSimpulan punya unique
        // index (opd_id, tahun, unsur) yg tidak scoped ke deleted_at.
        CeeJawaban::withTrashed()->where('opd_id', $opd->id)->where('tahun_penilaian', self::TAHUN)->forceDelete();
        CeeKelemahanDokumen::withTrashed()->where('opd_id', $opd->id)->where('tahun_penilaian', self::TAHUN)->forceDelete();
        CeeSimpulan::withTrashed()->where('opd_id', $opd->id)->where('tahun_penilaian', self::TAHUN)->forceDelete();

        // 1a: tiap responden menjawab SEMUA pertanyaan tiap unsur.
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

        // Data Umum akun CEE_Survey dipakai sbg sumber Kepala OPD di 1c —
        // isi/timpa SAAT SEEDING supaya simpulan 1c OPD ini konsisten.
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

        $this->command?->info('CEE contoh untuk SEKRETARIAT DAERAH berhasil di-seed.');
    }
}
