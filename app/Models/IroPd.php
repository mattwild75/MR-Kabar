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
        'SKALA DAMPAK INHEREN',
        'SKALA KEMUNGKINAN INHEREN',
        'SKALA RISIKO INHEREN',
        'KATEGORI PROYEKSI RTP',
        'SKALA DAMPAK TARGET',
        'SKALA KEMUNGKINAN TARGET',
        'SKALA RISIKO TARGET',
        'KATEGORI EXISTING CONTROL AKTUAL',
        'SKALA DAMPAK AKTUAL',
        'SKALA KEMUNGKINAN AKTUAL',
        'SKALA RISIKO AKTUAL',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
