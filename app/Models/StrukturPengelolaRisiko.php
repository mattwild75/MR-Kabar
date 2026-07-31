<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Satu jabatan dalam struktur pengelolaan Risiko, berlaku untuk satu tahun.
 * Lihat migrasi 2026_07_31_040000 untuk dasar Perdep-nya.
 */
class StrukturPengelolaRisiko extends Model
{
    use SoftDeletes;

    protected $table = 'struktur_pengelola_risiko';

    /**
     * Peran baku menurut Perdep, berikut urutan penyajiannya dari jenjang
     * tertinggi. Daerah boleh menambah peran lain — kolomnya string bebas,
     * daftar ini hanya menyediakan pilihan siap pakai dan urutan bakunya.
     */
    public const PERAN_LABEL = [
        'upr_pemda' => 'Unit Pemilik Risiko Tingkat Pemerintah Daerah',
        'koordinator_penyelenggaraan' => 'Koordinator Penyelenggaraan Pengelolaan Risiko',
        'komite' => 'Komite Pengelolaan Risiko',
        'unit_kepatuhan' => 'Unit Kepatuhan',
        'penanggung_jawab_pengawasan' => 'Penanggung Jawab Pengawasan',
        'upr_eselon_2' => 'Unit Pemilik Risiko Tingkat Eselon II',
        'upr_eselon_3_4' => 'Unit Pemilik Risiko Tingkat Eselon III dan IV',
    ];

    /**
     * Kedudukan di dalam satu peran. Perdep menyebut Unit Pemilik Risiko dan
     * Komite sebagai TIM — ketua, koordinator teknis yang merangkap anggota,
     * dan anggota. Boleh kosong untuk peran yang dipangku satu orang.
     */
    public const KEDUDUKAN_LABEL = [
        'ketua' => 'Ketua',
        'koordinator' => 'Koordinator merangkap anggota',
        'anggota' => 'Anggota',
    ];

    /** Urutan penyajian kedudukan, dipakai bagan dan naskah cetak. */
    public const KEDUDUKAN_URUTAN = ['ketua', 'koordinator', 'anggota'];

    protected $fillable = [
        'tahun',
        'peran',
        'kedudukan',
        'nama',
        'jabatan',
        'opd_id',
        'urutan',
        'tugas',
    ];

    protected $casts = [
        'tahun' => 'integer',
        'urutan' => 'integer',
    ];

    public function opd(): BelongsTo
    {
        return $this->belongsTo(Opd::class);
    }

    public function peranLabel(): string
    {
        return self::PERAN_LABEL[$this->peran] ?? $this->peran;
    }

    public function kedudukanLabel(): ?string
    {
        return $this->kedudukan ? (self::KEDUDUKAN_LABEL[$this->kedudukan] ?? $this->kedudukan) : null;
    }
}
