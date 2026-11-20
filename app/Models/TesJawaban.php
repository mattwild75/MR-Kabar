<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Satu jawaban satu peserta untuk satu nomor soal. Benar/salah TIDAK disimpan:
 * dihitung dari kunci bank soal saat dibaca, sehingga kunci yang dikoreksi
 * sesudah tes langsung memperbaiki seluruh nilai.
 *
 * waktu_ms diukur dengan jam server, dari saat soal dibuka sampai jawaban
 * terakhir (kalau peserta mengganti pilihan, yang dihitung pilihan terakhir).
 */
class TesJawaban extends Model
{
    protected $table = 'tes_jawaban';

    protected $fillable = ['sesi_id', 'peserta_id', 'nomor', 'pilihan', 'waktu_ms', 'diubah', 'dijawab_pada'];

    protected $casts = ['dijawab_pada' => 'datetime'];

    /** @return BelongsTo<TesPeserta, $this> */
    public function peserta(): BelongsTo
    {
        return $this->belongsTo(TesPeserta::class, 'peserta_id');
    }
}
