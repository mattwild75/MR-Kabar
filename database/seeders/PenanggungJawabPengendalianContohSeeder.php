<?php

namespace Database\Seeders;

use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\IrsPemda;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Revisi contoh pengisian 'PEMILIK RISIKO', 'UNIT/OPD PENANGGUNG JAWAB
 * PENGENDALIAN' (institusi), dan 'PENANGGUNG JAWAB PENGENDALIAN' (jabatan)
 * utk baris IRS Pemda/IRS PD/IRO PD milik 4 OPD yang sudah punya data
 * nyata: Dinas Kesehatan, BLUD RSUD Cut Nyak Dhien, Dinas Sosial,
 * Inspektorat.
 *
 * Kaidah konsistensi Risiko Strategis Pemda (Perdep Bab II & Lampiran 2,
 * verified dari PDF asli — lihat [[struktur-pengelolaan-risiko-sekda]]
 * memory), berdasar prinsip "level Pemilik Risiko/PJP ditentukan oleh
 * kewenangan yg dibutuhkan instrumen pengendaliannya, bukan sekadar siapa
 * yg paling terkait substansi/teknis":
 * - PEMILIK RISIKO = SELALU Bupati (Ketua UPR Tingkat Pemda). Kepala OPD
 *   berposisi sbg Anggota UPR Pemda, BUKAN Pemilik Risiko formal — meski
 *   mereka sumber/domain teknis risikonya.
 * - PENANGGUNG JAWAB PENGENDALIAN = Bupati SECARA DEFAULT (instrumen
 *   kontrolnya Perkada/Keputusan/SE Kepala Daerah, hanya bisa diterbitkan
 *   Kepala Daerah) — KECUALI ada pendelegasian eksplisit dari Bupati ke
 *   OPD/koordinator teknis tertentu (mis. lewat Perkada struktur
 *   pengelolaan risiko/SK penugasan khusus), maka PJP boleh diisi OPD yg
 *   didelegasikan tsb, dgn UNIT/OPD ikut menunjuk OPD tsb (bukan
 *   "Pemerintah Kabupaten Aceh Barat").
 * - Kalau ternyata kontrol suatu risiko cukup ditangani lintas-OPD TANPA
 *   perlu payung hukum Bupati, itu sinyal klasifikasi levelnya salah —
 *   seharusnya turun jadi 'Risiko Strategis OPD', bukan 'Risiko Strategis
 *   Pemda' (bukan berarti PJP-nya boleh Kepala OPD sementara TINGKAT
 *   RISIKO tetap Strategis Pemda).
 *
 * Pendelegasian PJP ke OPD teknis (bukan Bupati) HANYA sah jika PEMILIK
 * RISIKO tetap Bupati (skenario "Bupati→Dinas", bukan "Dinas A→Dinas B")
 * DAN RTP-nya murni pelaksanaan teknis dlm kewenangan OPD tsb (bukan
 * kebijakan/keputusan yg mengikat lintas-OPD, yg tetap wajib lewat
 * Perkada/SE Bupati). Diterapkan di #6 (reviu fisik sampling — teknis
 * audit Inspektorat), #8 & #9 (integrasi sistem & pendaftaran online RSUD
 * — teknis operasional RSUD), #11 (forum koordinasi — fasilitatif Sekda).
 * #10 & #12 TETAP Bupati krn RTP-nya eksplisit "mengusulkan
 * kebijakan"/"menetapkan basis data rujukan bersama seluruh OPD" — itu
 * keputusan yg mengikat lintas-OPD, bukan sekadar pelaksanaan teknis.
 * Idempotent — hanya update kolom, tidak membuat baris baru.
 */
class PenanggungJawabPengendalianContohSeeder extends Seeder
{
    public function run(): void
    {
        // Dinas Kesehatan — IRS Pemda #12 ber-TINGKAT RISIKO Strategis Pemda,
        // Pemilik Risiko & PJP = Bupati (instrumen kontrolnya basis data
        // rujukan bersama seluruh OPD anggota TPPS, butuh SE/Keputusan
        // Kepala Daerah agar mengikat lintas-OPD; tidak ada pendelegasian
        // eksplisit ke OPD tertentu di contoh ini).
        $this->updateRows(IrsPemda::class, 'PIC_DinasKesehatan', [
            12 => [
                'pemilik_risiko' => 'Bupati',
                'unit_opd' => 'Pemerintah Kabupaten Aceh Barat',
                'jabatan' => 'Bupati',
            ],
        ]);
        $this->updateRows(IrsPd::class, 'PIC_DinasKesehatan', [
            4 => [
                'unit_opd' => 'Dinas Kesehatan',
                'jabatan' => 'Kepala Bidang Kesehatan Masyarakat',
            ],
        ]);
        $this->updateRows(IroPd::class, 'PIC_DinasKesehatan', [
            4 => [
                'unit_opd' => 'Dinas Kesehatan',
                'jabatan' => 'Kepala Seksi Gizi Masyarakat',
            ],
        ]);

        // BLUD RSUD Cut Nyak Dhien — IRS Pemda #8 & #9 ber-TINGKAT RISIKO
        // Strategis Pemda, Pemilik Risiko = Bupati di keduanya. PJP
        // didelegasikan ke Direktur RSUD krn RTP-nya murni pelaksanaan
        // teknis operasional (integrasi sistem rekam medis, sistem
        // pendaftaran online) yg sepenuhnya dlm kewenangan RSUD, tidak
        // butuh Perkada/SE Bupati.
        $this->updateRows(IrsPemda::class, 'PIC_RSUDCutNyakDhien', [
            8 => [
                'pemilik_risiko' => 'Bupati',
                'unit_opd' => 'BLUD RSUD Cut Nyak Dhien',
                'jabatan' => 'Direktur RSUD',
            ],
            9 => [
                'pemilik_risiko' => 'Bupati',
                'unit_opd' => 'BLUD RSUD Cut Nyak Dhien',
                'jabatan' => 'Direktur RSUD',
            ],
        ]);
        $this->updateRows(IrsPd::class, 'PIC_RSUDCutNyakDhien', [
            3 => [
                'unit_opd' => 'BLUD RSUD Cut Nyak Dhien',
                'jabatan' => 'Kepala Bagian Kepegawaian RSUD',
            ],
        ]);
        $this->updateRows(IroPd::class, 'PIC_RSUDCutNyakDhien', [
            3 => [
                'unit_opd' => 'BLUD RSUD Cut Nyak Dhien',
                'jabatan' => 'Kepala Instalasi Rawat Jalan',
            ],
        ]);

        // Dinas Sosial — IRS Pemda #10 didemonstrasikan sbg contoh risiko
        // strategis Pemda (Perdep Bab II): Pemilik Risiko = Bupati (UPR
        // Tingkat Pemerintah Daerah, karena target kemiskinan adalah target
        // RPJMD lintas-OPD, bukan cuma target renstra Dinas Sosial).
        // Penanggung Jawab Pengendalian JUGA Bupati (instrumen kontrolnya
        // kebijakan Satu Data Kesejahteraan Sosial Daerah, hanya bisa
        // ditetapkan lewat Perkada/SE Kepala Daerah) — Bappeda hanya
        // pelaksana teknis/koordinator penyusun draf, bukan PJP formal.
        $this->updateRows(IrsPemda::class, 'PIC_DinasSosial', [
            10 => [
                'pemilik_risiko' => 'Bupati',
                'unit_opd' => 'Pemerintah Kabupaten Aceh Barat',
                'jabatan' => 'Bupati',
            ],
        ]);
        $this->updateRows(IrsPd::class, 'PIC_DinasSosial', [
            1 => [
                'unit_opd' => 'Dinas Sosial',
                'jabatan' => 'Kepala Bidang Perlindungan dan Jaminan Sosial',
            ],
        ]);
        $this->updateRows(IroPd::class, 'PIC_DinasSosial', [
            1 => [
                'unit_opd' => 'Dinas Sosial',
                'jabatan' => 'Kepala Seksi Rehabilitasi Sosial',
            ],
        ]);

        // Inspektorat — IRS Pemda #6 & #11 ber-TINGKAT RISIKO Strategis
        // Pemda, Pemilik Risiko = Bupati di keduanya.
        // #6: PJP didelegasikan ke Inspektur Pembantu Wilayah — RTP-nya
        // (reviu fisik sampling terintegrasi jadwal PKPT) murni teknis
        // audit, sepenuhnya kewenangan Inspektorat, tidak butuh Perkada.
        // #11: PJP didelegasikan ke Sekda selaku Koordinator Penyelenggaraan
        // Pengelolaan Risiko Pemda — forum koordinasi triwulanan lintas-OPD
        // (Inspektorat-BKPSDM) adalah pelaksanaan teknis dari penugasan
        // koordinasi yg memang melekat tetap pada Sekda (Perdep Bab II),
        // bukan pengambilalihan kewenangan Bupati; akuntabilitas akhir tetap
        // di Bupati selaku Pemilik Risiko & Penanggung Jawab umum.
        $this->updateRows(IrsPemda::class, 'PIC_Inspektorat', [
            6 => [
                'pemilik_risiko' => 'Bupati',
                'unit_opd' => 'Inspektorat',
                'jabatan' => 'Inspektur Pembantu Wilayah',
            ],
            11 => [
                'pemilik_risiko' => 'Bupati',
                'unit_opd' => 'Sekretariat Daerah',
                'jabatan' => 'Sekretaris Daerah selaku Koordinator Penyelenggaraan Pengelolaan Risiko Pemda',
            ],
        ]);
        $this->updateRows(IrsPd::class, 'PIC_Inspektorat', [
            2 => [
                'unit_opd' => 'Inspektorat',
                'jabatan' => 'Inspektur Pembantu Wilayah',
            ],
        ]);
        $this->updateRows(IroPd::class, 'PIC_Inspektorat', [
            2 => [
                'unit_opd' => 'Inspektorat',
                'jabatan' => 'Sekretaris Inspektorat',
            ],
        ]);

        $this->command?->info('Unit/OPD & Penanggung Jawab Pengendalian contoh berhasil direvisi untuk 4 OPD.');
    }

    /** @param  array<int,array{unit_opd:string,jabatan:string,pemilik_risiko?:string}>  $valuesById */
    private function updateRows(string $modelClass, string $username, array $valuesById): void
    {
        $user = User::where('username', $username)->first();
        if (!$user) {
            $this->command?->warn("User '{$username}' tidak ditemukan, dilewati.");

            return;
        }

        foreach ($valuesById as $id => $values) {
            $row = $modelClass::where('user_id', $user->id)->find($id);
            if (!$row) {
                $this->command?->warn("{$modelClass} #{$id} milik {$username} tidak ditemukan, dilewati.");

                continue;
            }

            $update = [
                'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN' => $values['unit_opd'],
                'PENANGGUNG JAWAB PENGENDALIAN' => $values['jabatan'],
            ];
            if (isset($values['pemilik_risiko'])) {
                $update['PEMILIK RISIKO'] = $values['pemilik_risiko'];
            }

            $row->update($update);
        }
    }
}
