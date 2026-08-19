<?php

namespace Database\Seeders;

use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\LaporanKejadianRisiko;
use App\Models\Opd;
use App\Models\PencatatanKejadianRisiko;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seed contoh realistis khusus Dinas Kesehatan untuk demo/uji dua laman:
 * /lapor-kejadian/rekap (Rekap Laporan Warga) & /monitoring-evaluasi/10
 * (Form 10 — Pencatatan Kejadian Risiko & Pelaksanaan RTP, Lampiran 5
 * Perdep PPKD No.4/2019). Total 3 "kejadian", SEMUA berasal dari alur
 * laporan warga (bukan Form 10 diisi berdiri sendiri tanpa asal laporan) —
 * supaya konsisten dengan alur nyata aplikasi:
 * warga lapor (status 'baru') -> PIC verifikasi & tautkan ke risiko
 * terdaftar (status 'diverifikasi'/'ditindaklanjuti') -> PIC klik "Catat
 * ke Form 10" (status 'selesai' + laporan_kejadian_id tertaut balik).
 *
 * 1-2. DUA laporan status 'baru' — MASIH menunggu tindak lanjut PIC, jadi
 *      HANYA ada di `laporan_kejadian_risiko` (belum ada baris Form 10).
 * 3.   SATU laporan status 'selesai' — SUDAH diverifikasi, ditautkan ke
 *      iro_pd#16 (Pelaksanaan pembangunan/penyediaan tidak sesuai
 *      spesifikasi), dan sudah "Dicatat ke Form 10" — baris
 *      `pencatatan_kejadian_risiko` menaut balik `laporan_kejadian_id` ke
 *      laporan ini, sehingga TETAP terlihat di /lapor-kejadian/rekap
 *      (dengan badge status "Selesai") maupun di Form 10.
 *
 * Form10 (lihat MonitoringEvaluasiController::risikoGabungan()) memproyeksi
 * LIVE seluruh baris IRS_PD/IRO_PD/IRS_Pemda milik OPD sebagai kandidat
 * "risiko" — baris itu SUDAH ADA di seeder data risiko Dinkes sebelumnya
 * (bukan tanggung jawab seeder ini).
 */
class PencatatanKejadianRisikoDinkesSeeder extends Seeder
{
    public function run(): void
    {
        $opd = Opd::where('nama', 'DINAS KESEHATAN')->first();
        if (! $opd) {
            return;
        }

        $picDinkes = User::where('opd_id', $opd->id)->first();

        $this->seedLaporanBaru($opd->id);
        $this->seedLaporanSelesaiDenganForm10($opd, $picDinkes);
    }

    /**
     * Dua laporan warga status 'baru' (belum ditindaklanjuti) tertaut ke
     * risiko Dinkes yang SENGAJA belum punya baris pencatatan Form 10 —
     * representasi "laporan masuk, menunggu PIC memproses". Dicocokkan by
     * `kejadian` (bukan ada PK alami lain di tabel ini) supaya idempotent
     * tanpa duplikat saat seeder diulang.
     */
    private function seedLaporanBaru(int $opdId): void
    {
        $irsWabah = IrsPd::whereHas('user', fn ($q) => $q->where('opd_id', $opdId))
            ->where('URAIAN RISIKO', 'Wabah/Penyakit Menular')
            ->first();
        $iroIntegrasi = IroPd::whereHas('user', fn ($q) => $q->where('opd_id', $opdId))
            ->where('URAIAN RISIKO', 'Keterlambatan Integrasi Data Antar Fasilitas Kesehatan')
            ->first();

        if ($irsWabah) {
            LaporanKejadianRisiko::firstOrCreate(
                ['kejadian' => 'Ditemukan klaster kasus diare akut di Desa Peunaga Rayeuk, diduga akibat sumber air bersih yang tercemar pasca banjir minggu lalu — 14 warga (termasuk 5 anak balita) sudah memeriksakan diri ke Puskesmas setempat dalam 3 hari terakhir.'],
                [
                    'nama_lengkap' => 'Marlina, S.Kep',
                    'email' => 'marlina.puskesmas@gmail.com',
                    'no_hp' => '085260112233',
                    'opd_id' => $opdId,
                    'waktu_kejadian' => now()->subDays(3),
                    'tempat' => 'Desa Peunaga Rayeuk, Kecamatan Meureubo',
                    'pemicu' => 'Pencemaran sumber air bersih warga pasca banjir, belum ada tindakan sanitasi darurat dari petugas terkait.',
                    'risiko_terdaftar_tipe' => 'irs_pd',
                    'risiko_terdaftar_id' => $irsWabah->id,
                    'status' => 'baru',
                ],
            );
        }

        if ($iroIntegrasi) {
            LaporanKejadianRisiko::firstOrCreate(
                ['kejadian' => 'Data rujukan pasien dari Puskesmas Ujong Baroh ke RSUD Cut Nyak Dhien tidak sinkron — riwayat pemeriksaan awal pasien tidak muncul di sistem RS, petugas IGD terpaksa mengulang anamnesis dari nol sehingga penanganan pasien gawat tertunda sekitar 40 menit.'],
                [
                    'nama_lengkap' => 'dr. Rian Hidayat',
                    'email' => 'rian.igd.rsud@gmail.com',
                    'no_hp' => '081377445566',
                    'opd_id' => $opdId,
                    'waktu_kejadian' => now()->subDays(1),
                    'tempat' => 'IGD RSUD Cut Nyak Dhien',
                    'pemicu' => 'Sistem integrasi data antar-fasilitas belum stabil, kerap gagal sinkron saat jam sibuk.',
                    'risiko_terdaftar_tipe' => 'iro_pd',
                    'risiko_terdaftar_id' => $iroIntegrasi->id,
                    'status' => 'baru',
                ],
            );
        }
    }

    /**
     * Satu laporan warga yang SUDAH melalui alur lengkap: dilaporkan ->
     * diverifikasi & ditautkan ke risiko terdaftar (iro_pd "Pelaksanaan
     * pembangunan/penyediaan tidak sesuai spesifikasi", RTP "Abate" sudah
     * ada di data risiko) -> dicatat ke Form 10 (status 'selesai').
     * PencatatanKejadianRisiko.laporan_kejadian_id menaut balik ke laporan
     * ini — itulah yang membuatnya tetap tampil di /lapor-kejadian/rekap
     * (bukan berdiri sendiri terpisah dari alur laporan warga).
     */
    private function seedLaporanSelesaiDenganForm10(Opd $opd, ?User $picDinkes): void
    {
        $risiko = IroPd::whereHas('user', fn ($q) => $q->where('opd_id', $opd->id))
            ->where('URAIAN RISIKO', 'Pelaksanaan pembangunan/penyediaan tidak sesuai spesifikasi')
            ->first();
        if (! $risiko) {
            return;
        }

        $laporan = LaporanKejadianRisiko::updateOrCreate(
            ['kejadian' => 'Warga Desa Suak Nie melaporkan pembangunan Puskesmas Pembantu tidak kunjung selesai meski sudah lewat target awal — atap dan dinding terlihat retak-retak sejak masa pengerjaan, warga khawatir bangunan tidak aman dipakai untuk pelayanan kesehatan.'],
            [
                'nama_lengkap' => 'Zulfikar (Kepala Desa Suak Nie)',
                'email' => 'zulfikar.suaknie@gmail.com',
                'no_hp' => '082361778899',
                'opd_id' => $opd->id,
                'waktu_kejadian' => '2025-08-10 09:00:00',
                'tempat' => 'Puskesmas Pembantu Desa Suak Nie',
                'pemicu' => 'Kontraktor pelaksana diduga tidak mengikuti spesifikasi teknis pada RAB, pengawasan lapangan lemah karena tim teknis dinas merangkap 3 lokasi proyek sekaligus.',
                'risiko_terdaftar_tipe' => 'iro_pd',
                'risiko_terdaftar_id' => $risiko->id,
                'status' => 'selesai',
                'catatan_tindak_lanjut' => 'Sudah diverifikasi tim teknis Dinas Kesehatan bersama konsultan pengawas independen; hasil pemeriksaan lapangan dicatat sebagai kejadian risiko di Form 10, RTP "Abate" (penguatan tim pengawas, audit teknis berkala) mulai direalisasikan.',
                'ditindaklanjuti_oleh' => $picDinkes?->id,
                'ditindaklanjuti_at' => '2025-08-20 14:00:00',
            ],
        );

        PencatatanKejadianRisiko::updateOrCreate(
            [
                'risiko_tipe' => 'iro_pd',
                'risiko_id' => $risiko->id,
                'tahun_penilaian' => (int) ($risiko->{'TAHUN DINILAI RISIKO'} ?: 2025),
            ],
            [
                'opd_id' => $opd->id,
                'laporan_kejadian_id' => $laporan->id,
                'tanggal_terjadi' => '2025-08-14',
                'sebab_saat_kejadian' => 'Kontraktor pelaksana pembangunan Puskesmas Pembantu Desa Suak Nie tidak mengikuti spesifikasi teknis pada RAB (ketebalan dinding & kualitas material atap tidak sesuai dokumen kontrak), luput dari pengawasan harian karena tim teknis dinas merangkap tugas pengawasan di 3 lokasi proyek sekaligus.',
                'dampak_saat_kejadian' => 'Serah terima bangunan tertunda 6 minggu untuk perbaikan ulang atap & dinding; anggaran tambahan Rp 85.000.000 dari sisa pagu kegiatan untuk pekerjaan perbaikan; pelayanan kesehatan dasar di Desa Suak Nie masih menumpang di balai desa selama masa perbaikan.',
                'keterangan_kejadian' => 'Ditemukan saat pemeriksaan progres fisik 80% oleh tim teknis Dinas Kesehatan bersama konsultan pengawas independen yang baru dilibatkan setelah RTP disusun. Berawal dari laporan Kepala Desa Suak Nie.',
                'triwulan_rencana_rtp' => 'III',
                'tahun_rencana_rtp' => (int) ($risiko->{'TAHUN DINILAI RISIKO'} ?: 2025),
                'realisasi_pelaksanaan_rtp' => 'Konsultan pengawas independen resmi dilibatkan mulai Triwulan III 2025 (kontrak addendum); tim pengawas internal diperkuat dari 1 menjadi 2 orang per lokasi proyek; audit teknis berkala (mingguan) mulai diterapkan sejak temuan ini.',
                'keterangan_rtp' => 'RTP "Abate" (Penguatan tim pengawas, audit teknis berkala, melibatkan konsultan independen) sudah mulai dijalankan sejak temuan; efektivitasnya akan dievaluasi ulang pada penilaian risiko tahun berikutnya.',
                'submitted_by' => $picDinkes?->id,
            ],
        );
    }
}
