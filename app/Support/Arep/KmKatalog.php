<?php

namespace App\Support\Arep;

/**
 * Katalog resmi 30 Formulir Kendali Mutu (KMA 1–30) menurut Pedoman Kendali
 * Mutu Audit Inspektorat (Keputusan Inspektur Aceh No. 700/2352/IA/2021,
 * mengadopsi Permenpan RB 19/2009). Satu sumber kebenaran untuk daftar
 * formulir di menu Kendali Mutu, dipakai controller (PHP) dan dikirim ke
 * React lewat props.
 *
 * `autofill` menandai formulir yang datanya bisa ditarik dari satu penugasan
 * RPP (RppPenugasan). Sisanya bersumber dari Renstra/PKPT/penilaian pegawai,
 * sehingga dicetak sebagai formulir kosong siap isi.
 */
class KmKatalog
{
    /**
     * @return array<int, array{no:int, kode:string, nama:string, tahapan:string, autofill:bool, orientasi:string}>
     */
    public static function semua(): array
    {
        return [
            ['no' => 1, 'kode' => 'KM 1', 'nama' => 'Tujuan, Sasaran dan Strategi Audit', 'tahapan' => 'Rencana Strategis', 'autofill' => false, 'orientasi' => 'landscape'],
            ['no' => 2, 'kode' => 'KM 2', 'nama' => 'Peta Audit', 'tahapan' => 'Perencanaan Audit', 'autofill' => false, 'orientasi' => 'landscape'],
            ['no' => 3, 'kode' => 'KM 3', 'nama' => 'Rencana Audit Jangka Menengah 5 Tahunan', 'tahapan' => 'Perencanaan Audit', 'autofill' => false, 'orientasi' => 'landscape'],
            ['no' => 4, 'kode' => 'KM 4', 'nama' => 'Usulan Program Kerja Pemeriksaan Tahunan', 'tahapan' => 'Program Kerja Audit', 'autofill' => true, 'orientasi' => 'landscape'],
            ['no' => 5, 'kode' => 'KM 5', 'nama' => 'Program Kerja Pemeriksaan Tahunan', 'tahapan' => 'Program Kerja Audit', 'autofill' => true, 'orientasi' => 'landscape'],
            ['no' => 6, 'kode' => 'KM 6', 'nama' => 'Kartu Penugasan', 'tahapan' => 'Supervisi Audit', 'autofill' => true, 'orientasi' => 'portrait'],
            ['no' => 7, 'kode' => 'KM 7', 'nama' => 'Anggaran Waktu Penugasan', 'tahapan' => 'Supervisi Audit', 'autofill' => true, 'orientasi' => 'portrait'],
            ['no' => 8, 'kode' => 'KM 8', 'nama' => 'Laporan Mingguan Kegiatan Perencanaan Audit', 'tahapan' => 'Supervisi Audit', 'autofill' => true, 'orientasi' => 'landscape'],
            ['no' => 9, 'kode' => 'KM 9', 'nama' => 'Program Kerja Audit', 'tahapan' => 'Pelaksanaan Audit', 'autofill' => true, 'orientasi' => 'landscape'],
            ['no' => 10, 'kode' => 'KM 10', 'nama' => 'Check List Penyelesaian Penugasan Perencanaan Audit', 'tahapan' => 'Pelaksanaan Audit', 'autofill' => true, 'orientasi' => 'portrait'],
            ['no' => 11, 'kode' => 'KM 11', 'nama' => 'Notulensi Kesepakatan', 'tahapan' => 'Pelaksanaan Audit', 'autofill' => true, 'orientasi' => 'portrait'],
            ['no' => 12, 'kode' => 'KM 12', 'nama' => 'Lembar Reviu Supervisi', 'tahapan' => 'Pelaksanaan Audit', 'autofill' => true, 'orientasi' => 'portrait'],
            ['no' => 13, 'kode' => 'KM 13', 'nama' => 'Laporan Mingguan Pengujian dan Evaluasi', 'tahapan' => 'Pelaksanaan Audit', 'autofill' => true, 'orientasi' => 'landscape'],
            ['no' => 14, 'kode' => 'KM 14', 'nama' => 'Check List Penyelesaian Pengujian dan Evaluasi', 'tahapan' => 'Pelaksanaan Audit', 'autofill' => true, 'orientasi' => 'portrait'],
            ['no' => 15, 'kode' => 'KM 15', 'nama' => 'Pengendalian Penyusunan Laporan', 'tahapan' => 'Pelaporan Audit', 'autofill' => true, 'orientasi' => 'portrait'],
            ['no' => 16, 'kode' => 'KM 16', 'nama' => 'Reviu Konsep Laporan', 'tahapan' => 'Pelaporan Audit', 'autofill' => true, 'orientasi' => 'landscape'],
            ['no' => 17, 'kode' => 'KM 17', 'nama' => 'Check List Penyelesaian Laporan', 'tahapan' => 'Pelaporan Audit', 'autofill' => true, 'orientasi' => 'portrait'],
            ['no' => 18, 'kode' => 'KM 18', 'nama' => 'Konsep Temuan dan Rencana Tindak Lanjut', 'tahapan' => 'Pemantauan Tindak Lanjut', 'autofill' => true, 'orientasi' => 'landscape'],
            ['no' => 19, 'kode' => 'KM 19', 'nama' => 'Laporan Tindak Lanjut Temuan Audit', 'tahapan' => 'Pemantauan Tindak Lanjut', 'autofill' => true, 'orientasi' => 'portrait'],
            ['no' => 20, 'kode' => 'KM 20', 'nama' => 'Laporan Pemantauan Tindak Lanjut Temuan Audit', 'tahapan' => 'Pemantauan Tindak Lanjut', 'autofill' => true, 'orientasi' => 'portrait'],
            ['no' => 21, 'kode' => 'KM 21', 'nama' => 'Berita Acara Pemutakhiran Data', 'tahapan' => 'Pemantauan Tindak Lanjut', 'autofill' => true, 'orientasi' => 'portrait'],
            ['no' => 22, 'kode' => 'KM 22', 'nama' => 'Rencana Audit Dilihat dari Objek Audit', 'tahapan' => 'Tata Usaha', 'autofill' => true, 'orientasi' => 'portrait'],
            ['no' => 23, 'kode' => 'KM 23', 'nama' => 'Perencanaan Petugas Audit (Auditor/P2UPD)', 'tahapan' => 'Tata Usaha', 'autofill' => true, 'orientasi' => 'landscape'],
            ['no' => 24, 'kode' => 'KM 24', 'nama' => 'Anggaran Biaya Audit', 'tahapan' => 'Tata Usaha', 'autofill' => true, 'orientasi' => 'portrait'],
            ['no' => 25, 'kode' => 'KM 25', 'nama' => 'Rekapitulasi Biaya Audit', 'tahapan' => 'Tata Usaha', 'autofill' => false, 'orientasi' => 'portrait'],
            ['no' => 26, 'kode' => 'KM 26', 'nama' => 'Bon Peminjaman Berkas', 'tahapan' => 'Tata Usaha', 'autofill' => true, 'orientasi' => 'portrait'],
            ['no' => 27, 'kode' => 'KM 27', 'nama' => 'Surat Tugas', 'tahapan' => 'Tata Usaha', 'autofill' => true, 'orientasi' => 'portrait'],
            ['no' => 28, 'kode' => 'KM 28', 'nama' => 'Surat Penyampaian Temuan', 'tahapan' => 'Tata Usaha', 'autofill' => true, 'orientasi' => 'portrait'],
            ['no' => 29, 'kode' => 'KM 29', 'nama' => 'Penilaian Kinerja Auditor/P2UPD atas Penugasan Audit', 'tahapan' => 'Sumber Daya Manusia', 'autofill' => true, 'orientasi' => 'portrait'],
            ['no' => 30, 'kode' => 'KM 30', 'nama' => 'Kartu Penilaian Kinerja Auditor/P2UPD', 'tahapan' => 'Sumber Daya Manusia', 'autofill' => false, 'orientasi' => 'portrait'],
        ];
    }

    /** @return array{no:int, kode:string, nama:string, tahapan:string, autofill:bool, orientasi:string}|null */
    public static function cari(int $no): ?array
    {
        foreach (self::semua() as $f) {
            if ($f['no'] === $no) {
                return $f;
            }
        }

        return null;
    }
}
