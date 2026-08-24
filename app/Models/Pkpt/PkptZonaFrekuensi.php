<?php

namespace App\Models\Pkpt;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * Tabel acuan: zona frekuensi pengawasan — Tabel 10 Lampiran Keputusan
 * Inspektur, menurunkan pembagian zona merah, kuning, dan hijau pada BAB IV
 * huruf B Perdep PPKD 08/2020. TIGA pita.
 *
 * Sumbu ini BERBEDA dari PkptTingkatRisiko yang berisi lima pita. Zona
 * menentukan seberapa sering sebuah Area diawasi; tingkat risiko menamai
 * besaran nilainya. Perdep memakai keduanya sekaligus: contoh Tabel 4.4
 * menempatkan Total Risiko 4,0 pada tingkat "Sangat Tinggi" dan zona merah.
 */
class PkptZonaFrekuensi extends Model
{
    public const CACHE_KEY = 'pkpt.zona_frekuensi';

    protected $table = 'pkpt_zona_frekuensi';

    protected $fillable = [
        'zona', 'batas_bawah', 'batas_atas', 'frekuensi', 'warna', 'urutan',
    ];

    protected function casts(): array
    {
        return ['batas_bawah' => 'float', 'batas_atas' => 'float', 'urutan' => 'integer'];
    }

    protected static function booted(): void
    {
        static::saved(fn () => Cache::forget(self::CACHE_KEY));
        static::deleted(fn () => Cache::forget(self::CACHE_KEY));
    }

    /** @return Collection<int, self> dari zona tertinggi ke terendah */
    public static function terurut(): Collection
    {
        return Cache::rememberForever(
            self::CACHE_KEY,
            fn () => self::orderByDesc('batas_bawah')->get()
        );
    }

    /**
     * Zona yang memuat sebuah Total Nilai Risiko.
     *
     * Batas bawah inklusif dan pita tertinggi yang terlampaui yang menang.
     * Perdep menulis rentangnya bertumpang tindih di ujung ("3-5 merah",
     * "2-3 kuning"), jadi nilai 3,00 harus jatuh ke merah, bukan kuning.
     */
    public static function untukNilai(?float $nilai): ?self
    {
        if ($nilai === null) {
            return null;
        }

        return self::terurut()->first(fn (self $z) => $nilai >= $z->batas_bawah);
    }
}
