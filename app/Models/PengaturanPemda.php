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

    /**
     * Cache statis per-request — CetakRisikoController memanggil
     * current() belasan kali per request (sekali per $tahun default, lagi
     * lewat pengaturan()), padahal ini singleton yg sama sepanjang
     * request. static::booted() meng-invalidate cache ini otomatis kalau
     * baris diupdate di request yg sama (lihat TahunAktifController),
     * supaya tidak ada risiko baca data basi.
     */
    protected static ?self $cached = null;

    protected static function booted(): void
    {
        static::saved(fn () => static::$cached = null);
        static::deleted(fn () => static::$cached = null);
    }

    /** Ambil (atau buat) satu-satunya baris pengaturan — default kolom dari migrasi berlaku otomatis. */
    public static function current(): self
    {
        return static::$cached ??= (static::first() ?? static::create([]));
    }
}
