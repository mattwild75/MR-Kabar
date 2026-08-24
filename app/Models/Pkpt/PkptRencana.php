<?php

namespace App\Models\Pkpt;

use App\Observers\GlobalActivityLogger;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Formulir 13 dan 14 — usulan Kebijakan Pengawasan dan Program Kerja
 * Pengawasan Tahunan.
 *
 * Satu tabel: Jakwas adalah PKPT tanpa kolom jadwal dan sumber daya, bukan
 * daftar yang berbeda. Memisahkannya berarti dua daftar yang harus
 * disinkronkan tangan, dan yang satu pasti akan tertinggal.
 */
#[ObservedBy([GlobalActivityLogger::class])]
class PkptRencana extends Model
{
    use SoftDeletes;

    protected $table = 'pkpt_rencana';

    protected $fillable = [
        'periode_id', 'area_id', 'nama_area', 'jenis_pengawasan',
        'tujuan_sasaran', 'ruang_lingkup', 'rmp', 'rpl',
        'hp_pj', 'hp_wpj', 'hp_kt', 'hp_at', 'hp_jumlah',
        'anggaran', 'jumlah_laporan', 'sarana_prasarana', 'tingkat_risiko',
        'total_nilai_risiko', 'sumber', 'urutan', 'keterangan',
    ];

    protected function casts(): array
    {
        return [
            'hp_pj' => 'integer',
            'hp_wpj' => 'integer',
            'hp_kt' => 'integer',
            'hp_at' => 'integer',
            'hp_jumlah' => 'integer',
            'anggaran' => 'integer',
            'total_nilai_risiko' => 'float',
            'urutan' => 'integer',
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
