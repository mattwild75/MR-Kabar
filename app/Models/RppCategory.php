<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Jenis penugasan RPP. `kode_nomor` adalah potongan pada nomor dokumen
 * (700/01/RPP-<kode>/INS/2025); `sebutan` dan `tujuan_surat` dipakai surat
 * pengantar ("Penyampaian Rencana Penugasan <sebutan>", "Ketua Tim <...>").
 */
class RppCategory extends Model
{
    protected $fillable = ['code', 'name', 'kode_nomor', 'sebutan', 'tujuan_surat', 'order'];

    public function rpps(): HasMany
    {
        return $this->hasMany(Rpp::class);
    }
}
