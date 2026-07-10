<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class IroPd extends Model
{
    use SoftDeletes;

    protected $table = 'tbl_iro_pd';

    protected $fillable = [
        'user_id',
        'KEGIATAN PD',
        'URAIAN RISIKO',
        'TINGKAT RISIKO',
        'TAHUN DINILAI RISIKO',
        'JENIS RISIKO',
        'ENTITAS PD YANG MENILAI',
        'NOMOR URUT RISIKO',
        'TAHAP',
        'PEMILIK RISIKO',
        'URAIAN PENYEBAB RISIKO',
        'SUMBER SEBAB RISIKO',
        'C / UC',
        'URAIAN DAMPAK RISIKO',
        'PIHAK YANG TERKENA DAMPAK RISIKO',
        'URAIAN PENGENDALIAN YANG SUDAH ADA',
        'CELAH PENGENDALIAN',
        'RENCANA TINDAK PENGENDALIAN',
        'PEMILIK / PENANGGUNGJAWAB',
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
