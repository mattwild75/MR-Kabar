<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Data Umum per-PIC (per-OPD): header identitas kertas kerja penilaian risiko +
 * daftar penanda tangan. Satu baris per user. Dipakai Form Cetak.
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
}
