<?php

namespace App\Models\Pkpt;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Formulir 9 dan 10 — hasil perhitungan Total Nilai Risiko dan pemeringkatan.
 *
 * Hasil DISIMPAN, bukan dihitung ulang tiap kali halaman dibuka. Kalau bobot
 * acuan disunting tahun depan, angka pada lampiran Keputusan yang sudah
 * ditandatangani tidak boleh ikut berubah.
 *
 * Tanpa soft delete: baris ini bukan masukan orang melainkan keluaran mesin,
 * dan seluruhnya ditulis ulang setiap kali Hitung Ulang dijalankan.
 */
class PkptPenilaian extends Model
{
    protected $table = 'pkpt_penilaian';

    protected $fillable = [
        'periode_id', 'area_id', 'level_mr', 'jumlah_risiko', 'rld', 'rlk',
        'nilai_komposit', 'skala_inheren', 'bobot_register', 'skala_fpm',
        'bobot_faktor', 'bobot_faktor_terpakai', 'total_nilai_risiko',
        'tingkat_risiko', 'zona', 'frekuensi', 'rencana_tahun', 'keterangan',
        'dihitung_pada',
    ];

    protected function casts(): array
    {
        return [
            'level_mr' => 'integer',
            'jumlah_risiko' => 'integer',
            'rld' => 'float',
            'rlk' => 'float',
            'nilai_komposit' => 'float',
            'skala_inheren' => 'integer',
            'bobot_register' => 'integer',
            'skala_fpm' => 'float',
            'bobot_faktor' => 'integer',
            'bobot_faktor_terpakai' => 'integer',
            'total_nilai_risiko' => 'float',
            'rencana_tahun' => 'array',
            'dihitung_pada' => 'datetime',
        ];
    }

    public function periode(): BelongsTo
    {
        return $this->belongsTo(PkptPeriode::class, 'periode_id');
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(PkptAreaPengawasan::class, 'area_id');
    }
}
