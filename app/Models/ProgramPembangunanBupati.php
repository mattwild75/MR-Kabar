<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Tabel 3.7 RPJM Kabupaten Aceh Barat Tahun 2025-2029 — "100 Program
 * Pembangunan Pemerintah Kabupaten Aceh Barat", dikelola lewat Settings >
 * Keterangan Pendukung. Lihat migrasi
 * 2026_07_27_145008_create_program_pembangunan_bupati_table.php.
 *
 * TIDAK punya kolom visi/misi sendiri (lihat migrasi
 * 2026_07_27_151318_drop_visi_misi_from_program_pembangunan_bupati_table)
 * — teks Visi/Misi diambil LIVE dari tbl_krs_pemda (kolom VISI/MISI)
 * berdasarkan misi_urutan, supaya satu-satunya sumber kebenaran Visi/Misi
 * tetap KRS Pemda (I_a), tidak ada duplikat teks yang bisa tidak sinkron.
 * Lihat KeteranganPendukungController::index() utk cara pengambilannya.
 */
class ProgramPembangunanBupati extends Model
{
    protected $table = 'program_pembangunan_bupati';

    protected $fillable = [
        'nomor',
        'program_pembangunan',
        'branding',
        'perangkat_daerah',
        'misi_urutan',
    ];

    public function risikoTerkait(): HasMany
    {
        return $this->hasMany(ProgramBupatiRisiko::class, 'program_pembangunan_bupati_id');
    }
}
