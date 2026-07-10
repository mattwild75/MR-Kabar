<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class KrsPemda extends Model
{
    // SoftDeletes: hapus = tandai deleted_at (bisa dipulihkan dari "Data
    // Terhapus"). Baris soft-deleted otomatis dikecualikan dari ::all()/::get()
    // — termasuk di sync service — jadi hilang dari tabel gabungan & diagram.
    use SoftDeletes;

    protected $table = 'tbl_krs_pemda';

    public $timestamps = false;

    protected $fillable = [
        'VISI',
        'MISI',
        'TUJUAN RPJMD',
        'IK TUJUAN RPJMD',
        'BASELINE IK TUJUAN RPJMD',
        'TARGET IK TUJUAN RPJMD',
        'SATUAN IK TUJUAN RPJMD',
        'OPD IK TUJUAN RPJMD',
        'SASARAN RPJMD',
        'IK SASARAN RPJMD',
        'BASELINE IK SASARAN RPJMD',
        'TARGET IK SASARAN RPJMD',
        'SATUAN IK SASARAN RPJMD',
        'OPD IK SASARAN RPJMD',
        'PROGRAM PRIORITAS',
        'OUTCOME PROGRAM PRIORITAS',
        'IK PROGRAM',
        'BASELINE IK PROGRAM',
        'TARGET IK PROGRAM',
        'SATUAN IK PROGRAM',
        'OPD IK PROGRAM',
        'OPD PENANGGUNGJAWAB PROGRAM',
    ];
}
