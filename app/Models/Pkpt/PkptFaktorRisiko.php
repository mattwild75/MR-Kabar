<?php

namespace App\Models\Pkpt;

use App\Observers\GlobalActivityLogger;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Formulir 4 sampai dengan 8 — lima faktor pertimbangan manajemen, satu baris
 * per Area Pengawasan.
 *
 * Kelimanya satu baris per Area dengan kolom berbeda. Lima tabel terpisah
 * berarti lima join hanya untuk menghitung satu angka di Formulir 9, dan lima
 * peluang baris hilang.
 *
 * SELURUH skala NULLABLE dan itu disengaja: null berarti datanya belum ada,
 * berbeda dari 1 yang berarti sudah dinilai dan hasilnya terendah. Perbedaan
 * itu yang mencegah Area berdata paling tipis tampak paling aman.
 */
#[ObservedBy([GlobalActivityLogger::class])]
class PkptFaktorRisiko extends Model
{
    use SoftDeletes;

    protected $table = 'pkpt_faktor_risiko';

    protected $fillable = [
        'periode_id', 'area_id',
        'pagu_anggaran', 'persen_belanja_langsung', 'skala_fr1',
        'terkait_rpjmd', 'mendukung_rpjmn', 'sektor_unggulan',
        'indikator_kinerja_skpk', 'indikator_kinerja_pemda', 'nilai_fr2', 'skala_fr2',
        'temuan_internal_kurang', 'temuan_eksternal_kurang', 'potensi_fraud',
        'kasus_hukum', 'nilai_fr3', 'skala_fr3',
        'sorotan_masyarakat', 'isu_nasional', 'layanan_publik', 'hajat_hidup',
        'nilai_fr4', 'skala_fr4', 'sumber_isu',
        'tahun_terakhir_diawasi', 'skala_tahun_terakhir',
        'jumlah_penugasan_sejenis', 'skala_pengalaman', 'skala_fr5',
        'catatan_profesional',
    ];

    protected function casts(): array
    {
        return [
            'pagu_anggaran' => 'integer',
            'persen_belanja_langsung' => 'float',
            'skala_fr1' => 'integer',
            'terkait_rpjmd' => 'boolean',
            'mendukung_rpjmn' => 'boolean',
            'sektor_unggulan' => 'boolean',
            'indikator_kinerja_skpk' => 'integer',
            'indikator_kinerja_pemda' => 'integer',
            'nilai_fr2' => 'integer',
            'skala_fr2' => 'integer',
            'temuan_internal_kurang' => 'boolean',
            'temuan_eksternal_kurang' => 'boolean',
            'potensi_fraud' => 'boolean',
            'kasus_hukum' => 'boolean',
            'nilai_fr3' => 'integer',
            'skala_fr3' => 'integer',
            'sorotan_masyarakat' => 'boolean',
            'isu_nasional' => 'boolean',
            'layanan_publik' => 'boolean',
            'hajat_hidup' => 'boolean',
            'nilai_fr4' => 'integer',
            'skala_fr4' => 'integer',
            'tahun_terakhir_diawasi' => 'integer',
            'skala_tahun_terakhir' => 'integer',
            'jumlah_penugasan_sejenis' => 'integer',
            'skala_pengalaman' => 'integer',
            'skala_fr5' => 'float',
        ];
    }

    /** Skala kelima faktor, null untuk yang datanya belum ada. */
    public function skala(): array
    {
        return [
            'FR1' => $this->skala_fr1,
            'FR2' => $this->skala_fr2,
            'FR3' => $this->skala_fr3,
            'FR4' => $this->skala_fr4,
            'FR5' => $this->skala_fr5,
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
