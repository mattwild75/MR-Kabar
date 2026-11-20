<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Satu angkatan bimtek: pasangan sesi pre-test dan post-test. Peserta pre dan
 * post dipasangkan lewat NIP (lihat AnalisisTesService) untuk menghitung
 * kenaikan dan N-gain.
 */
class TesPelatihan extends Model
{
    protected $table = 'tes_pelatihan';

    protected $fillable = ['nama', 'tanggal', 'tempat', 'dibuat_oleh'];

    protected $casts = ['tanggal' => 'date'];

    /** @return HasMany<TesSesi, $this> */
    public function sesi(): HasMany
    {
        return $this->hasMany(TesSesi::class, 'pelatihan_id');
    }

    public function sesiJenis(string $jenis): ?TesSesi
    {
        return $this->sesi->firstWhere('jenis', $jenis);
    }
}
