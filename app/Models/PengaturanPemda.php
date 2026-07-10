<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Nilai default Pemda-wide utk Data Umum (Nama Pemda, Periode Penilaian,
 * Tahun Penilaian, Kepala Daerah, Sumber Dokumen RSP/RSO/ROO). Singleton —
 * satu baris saja. Dipakai sbg fallback saat field milik PIC/OPD kosong.
 * Hanya Admin/Super Admin yang boleh mengubahnya.
 */
class PengaturanPemda extends Model
{
    protected $table = 'pengaturan_pemda';

    protected $fillable = [
        'pemerintah_kabkota',
        'periode_penilaian',
        'tahun_penilaian',
        'nama_kepala_daerah',
        'jabatan_kepala_daerah',
        'dokumen_sumber_rsp',
        'dokumen_sumber_rso',
        'dokumen_sumber_roo',
    ];

    /** Ambil (atau buat) satu-satunya baris pengaturan — default kolom dari migrasi berlaku otomatis. */
    public static function current(): self
    {
        return static::first() ?? static::create([]);
    }
}
