<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** 8 unsur Lingkungan Pengendalian (A-H) sesuai PP 60/2008 & Perdep PPKD No.4/2019. */
class CeeUnsur extends Model
{
    protected $table = 'cee_unsur';

    protected $fillable = ['kode', 'nama', 'urutan'];

    public function pertanyaan(): HasMany
    {
        return $this->hasMany(CeePertanyaan::class)->orderBy('urutan');
    }
}
