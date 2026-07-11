<?php

namespace Database\Seeders;

use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\IrsPemda;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Contoh pengisian 'KATEGORI EXISTING CONTROL' (E/KE/TE) utk baris IRS
 * Pemda/IRS PD/IRO PD milik 4 OPD yang sudah punya data nyata: Dinas
 * Kesehatan, BLUD RSUD Cut Nyak Dhien, Dinas Sosial, Inspektorat.
 * Penilaian didasarkan pada karakter existing control yg sudah tertulis
 * di kolom 'URAIAN PENGENDALIAN YANG SUDAH ADA' — kontrol yg berjalan
 * rutin/sistematis dinilai E, yg ada tapi belum konsisten/manual dinilai
 * KE. Idempotent (updateOrCreate-style: hanya update kolom kategori, tidak
 * membuat baris baru).
 */
class KategoriExistingControlContohSeeder extends Seeder
{
    public function run(): void
    {
        $this->updateRows(IrsPemda::class, 'PIC_DinasKesehatan', [
            12 => 'KE (Rapat koordinasi TPPS rutin dilaksanakan, tetapi belum menghasilkan basis data tunggal yang disepakati bersama)',
        ]);
        $this->updateRows(IrsPd::class, 'PIC_DinasKesehatan', [
            4 => 'KE (Pelatihan kader posyandu baru dilakukan setahun sekali, belum menjangkau seluruh kader baru sepanjang tahun)',
        ]);
        $this->updateRows(IroPd::class, 'PIC_DinasKesehatan', [
            4 => 'E (Rekapitulasi data posyandu berjalan rutin bulanan oleh petugas puskesmas)',
        ]);

        $this->updateRows(IrsPemda::class, 'PIC_RSUDCutNyakDhien', [
            8 => 'E (Pemeriksaan status gizi balita menjadi bagian tetap SOP kunjungan poli anak)',
            9 => 'E (Sistem antrean nomor sudah berjalan otomatis & konsisten di loket pendaftaran)',
        ]);
        $this->updateRows(IrsPd::class, 'PIC_RSUDCutNyakDhien', [
            3 => 'KE (Program insentif daerah sudah ada, tetapi belum cukup menarik minat dokter spesialis penempatan baru sesuai kebutuhan)',
        ]);
        $this->updateRows(IroPd::class, 'PIC_RSUDCutNyakDhien', [
            3 => 'E (Sistem pendaftaran online berbasis nomor urut harian berjalan otomatis & real-time)',
        ]);

        $this->updateRows(IrsPemda::class, 'PIC_DinasSosial', [
            10 => 'KE (Rapat koordinasi lintas OPD rutin semesteran, tetapi data PMKS masih sering tidak sinkron antar sumber)',
        ]);
        $this->updateRows(IrsPd::class, 'PIC_DinasSosial', [
            1 => 'KE (Verifikasi data PMKS hanya setahun sekali menjelang RKA, belum mengikuti dinamika perubahan kondisi PMKS sepanjang tahun)',
        ]);
        $this->updateRows(IroPd::class, 'PIC_DinasSosial', [
            1 => 'E (SOP verifikasi berkas penerima bantuan sosial sudah baku & diterapkan konsisten)',
        ]);

        $this->updateRows(IrsPemda::class, 'PIC_Inspektorat', [
            6 => 'E (Reviu Laporan Keuangan oleh Inspektorat berjalan rutin setiap semester sesuai jadwal)',
            11 => 'E (Penyampaian LHP ke Sekretaris Daerah berjalan rutin & terdokumentasi setiap semester)',
        ]);
        $this->updateRows(IrsPd::class, 'PIC_Inspektorat', [
            2 => 'KE (Surat pemantauan tindak lanjut terkirim rutin, tetapi tingkat kepatuhan OPD terperiksa menindaklanjuti masih rendah)',
        ]);
        $this->updateRows(IroPd::class, 'PIC_Inspektorat', [
            2 => 'E (PKPT disusun berbasis risiko/risk-based audit planning setiap awal tahun sesuai kaidah APIP)',
        ]);

        $this->command?->info('Kategori Existing Control (E/KE/TE) contoh berhasil di-seed untuk 4 OPD.');
    }

    /** @param  array<int,string>  $kategoriById  [row_id => 'KATEGORI EXISTING CONTROL' value] */
    private function updateRows(string $modelClass, string $username, array $kategoriById): void
    {
        $user = User::where('username', $username)->first();
        if (!$user) {
            $this->command?->warn("User '{$username}' tidak ditemukan, dilewati.");

            return;
        }

        foreach ($kategoriById as $id => $kategori) {
            $row = $modelClass::where('user_id', $user->id)->find($id);
            if (!$row) {
                $this->command?->warn("{$modelClass} #{$id} milik {$username} tidak ditemukan, dilewati.");

                continue;
            }

            $row->update(['KATEGORI EXISTING CONTROL' => $kategori]);
        }
    }
}
