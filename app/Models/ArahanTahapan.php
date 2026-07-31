<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Satu tahapan penilaian risiko beserta tenggatnya, milik satu Arahan.
 */
class ArahanTahapan extends Model
{
    protected $table = 'arahan_tahapan';

    protected $fillable = [
        'arahan_penilaian_risiko_id',
        'urutan',
        'tahapan',
        'dokumen_pemicu',
        'tanggal_mulai',
        'tanggal_selesai',
        'pelaksana',
        'keluaran',
    ];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
        'urutan' => 'integer',
    ];

    public function arahan(): BelongsTo
    {
        return $this->belongsTo(ArahanPenilaianRisiko::class, 'arahan_penilaian_risiko_id');
    }

    /**
     * Keadaan tahapan ini pada satu saat: belum waktunya, sedang berjalan,
     * terlambat, atau tanpa tenggat.
     *
     * "Terlambat" di sini murni soal WAKTU — tanggal selesainya sudah lewat.
     * Apakah pekerjaannya sendiri sudah rampung dinilai di tempat lain, dari
     * data risiko yang benar-benar terisi; keduanya sengaja tidak dicampur
     * supaya tahapan tanpa keluaran terukur tetap punya keadaan yang jujur.
     */
    public function keadaan(?CarbonInterface $saat = null): string
    {
        $saat = ($saat ?? now())->startOfDay();

        if (!$this->tanggal_mulai && !$this->tanggal_selesai) {
            return 'tanpa_tenggat';
        }

        if ($this->tanggal_selesai && $saat->greaterThan($this->tanggal_selesai->startOfDay())) {
            return 'terlambat';
        }

        if ($this->tanggal_mulai && $saat->lessThan($this->tanggal_mulai->startOfDay())) {
            return 'belum_mulai';
        }

        return 'berjalan';
    }
}
