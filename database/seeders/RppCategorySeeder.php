<?php

namespace Database\Seeders;

use App\Models\RppCategory;
use Illuminate\Database\Seeder;

class RppCategorySeeder extends Seeder
{
    public function run(): void
    {
        // kode_nomor = potongan pada nomor dokumen (700/01/RPP-<kode>/INS/2025),
        // sebutan & tujuan_surat = kalimat pada surat pengantar, disalin dari
        // berkas Pengantar RPP*.doc Bagian Perencanaan 2025.
        $categories = [
            ['code' => 'A', 'name' => 'Reviu', 'kode_nomor' => 'Rev', 'sebutan' => 'Reviu', 'tujuan_surat' => 'Ketua Tim Reviu'],
            ['code' => 'B', 'name' => 'Khusus', 'kode_nomor' => 'AKh', 'sebutan' => 'Audit Khusus', 'tujuan_surat' => 'Ketua Tim Audit Khusus'],
            ['code' => 'C', 'name' => 'Operasional SKPK', 'kode_nomor' => 'AO', 'sebutan' => 'Audit Operasional', 'tujuan_surat' => 'Ketua Tim Audit Operasional'],
            ['code' => 'D', 'name' => 'Operasional Gampong', 'kode_nomor' => 'AOG', 'sebutan' => 'Audit Operasional Gampong', 'tujuan_surat' => 'Ketua Tim Audit Operasional Gampong'],
            ['code' => 'E', 'name' => 'Kasus Gampong', 'kode_nomor' => 'AKsG', 'sebutan' => 'Audit Kasus Gampong', 'tujuan_surat' => 'Ketua Tim Audit Kasus'],
            ['code' => 'F', 'name' => 'Kasus SKPK', 'kode_nomor' => 'AKsS', 'sebutan' => 'Audit Kasus SKPK', 'tujuan_surat' => 'Ketua Tim Audit Kasus'],
            ['code' => 'G', 'name' => 'Monitoring', 'kode_nomor' => 'Mon', 'sebutan' => 'Monitoring', 'tujuan_surat' => 'Ketua Tim Monitoring'],
            ['code' => 'H', 'name' => 'Evaluasi', 'kode_nomor' => 'EV', 'sebutan' => 'Evaluasi', 'tujuan_surat' => 'Ketua Tim Evaluasi'],
            ['code' => 'I', 'name' => 'Kinerja', 'kode_nomor' => 'AKJ', 'sebutan' => 'Audit Kinerja', 'tujuan_surat' => 'Ketua Tim Audit Kinerja'],
            ['code' => 'J', 'name' => 'Kepatuhan Gampong', 'kode_nomor' => 'AKG', 'sebutan' => 'Audit Kepatuhan Gampong', 'tujuan_surat' => 'Ketua Tim Audit Kepatuhan'],
            ['code' => 'K', 'name' => 'Tujuan Tertentu', 'kode_nomor' => 'ADT', 'sebutan' => 'Audit dengan Tujuan Tertentu', 'tujuan_surat' => 'Ketua Tim Audit Dengan Tujuan Tertentu'],
            ['code' => 'L', 'name' => 'Opname Kas', 'kode_nomor' => 'OK', 'sebutan' => 'Opname Kas', 'tujuan_surat' => 'Ketua Tim Opname Kas'],
        ];

        foreach ($categories as $i => $category) {
            RppCategory::updateOrCreate(
                ['code' => $category['code']],
                [...collect($category)->except('code')->all(), 'order' => $i + 1]
            );
        }
    }
}
