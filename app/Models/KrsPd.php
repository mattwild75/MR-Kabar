<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class KrsPd extends Model
{
    use SoftDeletes;

    protected $table = 'tbl_krs_pd';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
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
