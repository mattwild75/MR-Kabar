<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Pertanyaan kuesioner Form 1a. Redaksi HANYA boleh diubah admin/super-admin
 * — ditegakkan di CeePertanyaanController, bukan di model ini.
 */
class CeePertanyaan extends Model
{
    protected $table = 'cee_pertanyaan';

    protected $fillable = ['cee_unsur_id', 'pertanyaan', 'urutan', 'aktif'];

    protected $casts = [
        'aktif' => 'boolean',
    ];

    public function unsur(): BelongsTo
    {
        return $this->belongsTo(CeeUnsur::class, 'cee_unsur_id');
    }

    public function jawaban(): HasMany
    {
        return $this->hasMany(CeeJawaban::class);
    }
}
