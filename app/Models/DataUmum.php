<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Data Umum per-PIC (per-OPD): header identitas kertas kerja penilaian risiko +
 * daftar penanda tangan. PER-TAHUN — satu baris per (user, tahun_penilaian),
 * BUKAN satu baris per user lagi (lihat migration
 * 2026_07_17_050000_make_data_umum_per_tahun & User::dataUmum()). Dipakai
 * Form Cetak.
 */
class DataUmum extends Model
{
    protected $table = 'data_umum';

    protected $fillable = [
        'user_id',
        'pemerintah_kabkota',
        'nama_urusan',
        'nama_sub_urusan',
        'nama_dinas_opd',
        'periode_penilaian',
        'tahun_penilaian',
        'nama_kepala_daerah',
        'jabatan_kepala_daerah',
        'nama_kepala_dinas',
        'jabatan_kepala_dinas',
        'nip_kepala_dinas',
        'nama_pic',
        'jabatan_pic',
        'nip_pic',
        'dokumen_sumber_rsp',
        'dokumen_sumber_rso',
        'dokumen_sumber_roo',
        'tempat_pembuatan',
        'tanggal_pembuatan',
        'penandatangan',
    ];

    protected $casts = [
        'tanggal_pembuatan' => 'date',
        // [{jabatan, nama, nip}, ...]
        'penandatangan' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Baris DataUmum utk kombinasi OPD + Tahun Penilaian tertentu — TANPA
     * fallback lintas-tahun (fallback per-field, mis. nama_kepala_daerah
     * ke PengaturanPemda, tetap jadi tanggung jawab controller pemanggil).
     * $opdId null berarti level Pemda (Form 2a) — pakai baris PERTAMA yg
     * sudah diisi siapa saja utk tahun tsb (identitas Pemda-wide, bukan
     * per-OPD), sama pola dgn CetakRisikoController::dataUmumForOpd()
     * SEBELUM migrasi ini (logic dipindah ke sini supaya 1 sumber
     * kebenaran, tidak lagi diduplikasi di 2 controller berbeda).
     */
    public static function forOpdAndTahun(?int $opdId, int|string $tahun): ?self
    {
        if (!$opdId) {
            return static::whereNotNull('user_id')
                ->where('tahun_penilaian', (string) $tahun)
                ->orderBy('id')
                ->first();
        }

        // whereIn(user_id, ...) dari User langsung — bukan whereHas() yg
        // dikompilasi jadi correlated subquery per baris kandidat — supaya
        // lookup ini (dipanggil di hampir semua Form Cetak) tetap query
        // tunggal ber-index biasa, bukan DEPENDENT SUBQUERY di EXPLAIN.
        $userIds = User::where('opd_id', $opdId)->pluck('id');

        return static::whereIn('user_id', $userIds)
            ->where('tahun_penilaian', (string) $tahun)
            ->first();
    }
}
