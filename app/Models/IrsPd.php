<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class IrsPd extends Model
{
    use SoftDeletes;

    protected $table = 'tbl_irs_pd';

    protected $fillable = [
        'user_id',
        'SASARAN RENSTRA',
        'URAIAN RISIKO',
        'TINGKAT RISIKO',
        'TAHUN DINILAI RISIKO',
        'JENIS RISIKO',
        'ENTITAS PD YANG MENILAI',
        'NOMOR URUT RISIKO',
        'PEMILIK RISIKO',
        'URAIAN PENYEBAB RISIKO',
        'SUMBER SEBAB RISIKO',
        'C / UC',
        'URAIAN DAMPAK RISIKO',
        'PIHAK YANG TERKENA DAMPAK RISIKO',
        'URAIAN PENGENDALIAN YANG SUDAH ADA',
        'KATEGORI EXISTING CONTROL',
        'CELAH PENGENDALIAN',
        'RENCANA TINDAK PENGENDALIAN',
        'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN',
        'PENANGGUNG JAWAB PENGENDALIAN',
        'TRIWULAN',
        'TAHUN TARGET PENYELESAIAN',
        'SKALA DAMPAK',
        'SKALA KEMUNGKINAN',
        'SKALA RISIKO',
        'SKALA PRIORITAS',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
