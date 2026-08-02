<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class KrsPd extends Model
{
    use SoftDeletes;

    protected $table = 'tbl_krs_pd';

    /**
     * Jejak waktu DINYALAKAN sejak Agustus 2026.
     *
     * Sebelumnya $timestamps = false, sehingga tidak ada satu pun cara
     * mengetahui kapan sebuah baris konteks dibuat atau terakhir diubah —
     * padahal ia dipakai lintas tahun dan lintas OPD. Baris lama tetap kosong
     * waktunya, dan memang dibiarkan begitu: menuliskan waktu yang bukan
     * sebenarnya lebih buruk daripada mengaku tidak tahu.
     */
    public $timestamps = true;

    protected $fillable = [
        'user_id',
        'PERIODE PENILAIAN',
        'SASARAN RPJMD',
        'TUJUAN STRATEGIS PD',
        'IK TUJUAN STRATEGIS PD',
        'BASELINE IK TUJUAN STRATEGIS PD',
        'TARGET IK TUJUAN STRATEGIS PD',
        'SATUAN IK TUJUAN STRATEGIS PD',
        'SASARAN STRATEGIS PD',
        'IK SASARAN STRATEGIS PD',
        'BASELINE IK SASARAN STRATEGIS PD',
        'TARGET IK SASARAN STRATEGIS PD',
        'SATUAN IK SASARAN STRATEGIS PD',
        'PROGRAM PD',
        'IK PROGRAM PD',
        'BASELINE IK PROGRAM PD',
        'TARGET IK PROGRAM PD',
        'SATUAN IK PROGRAM PD',
        'KEGIATAN PD',
        'IK KEGIATAN PD',
        'BASELINE IK KEGIATAN PD',
        'TARGET IK KEGIATAN PD',
        'SATUAN IK KEGIATAN PD',
        'SUBKEGIATAN PD',
        'IK SUBKEGIATAN PD',
        'BASELINE IK SUBKEGIATAN PD',
        'TARGET IK SUBKEGIATAN PD',
        'SATUAN IK SUBKEGIATAN PD',
        'OPD PENANGGUNG JAWAB KEGIATAN',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
