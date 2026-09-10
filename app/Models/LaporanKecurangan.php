<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Satu laporan dugaan kecurangan dari publik — pintu masuk MR Fraud.
 *
 * Dasar: Perdep BPKP Bidang Investigasi No. 1 Tahun 2019 dan Perbup Aceh Barat
 * No. 6 Tahun 2025 tentang Pengendalian Kecurangan.
 */
class LaporanKecurangan extends Model
{
    use SoftDeletes;

    protected $table = 'laporan_kecurangan';

    protected $guarded = ['id'];

    protected $casts = [
        'anonim' => 'boolean',
        'dugaan_kelompok' => 'array',
        'waktu_kejadian' => 'datetime',
        'ditindaklanjuti_at' => 'datetime',
    ];

    /**
     * Alur tindak lanjut, sama persis dengan Lapor Kejadian Risiko.
     *
     * Sengaja sama: yang membedakan kedua laporan adalah ISInya, bukan cara
     * menanganinya. Dua alur status berbeda untuk hal yang sama hanya akan
     * membuat penindaklanjut harus mengingat mana yang sedang dibuka.
     */
    public const STATUS = ['baru', 'diverifikasi', 'ditindaklanjuti', 'selesai'];

    public function opd(): BelongsTo
    {
        return $this->belongsTo(Opd::class);
    }

    public function fraudRisiko(): BelongsTo
    {
        return $this->belongsTo(FraudRisiko::class);
    }

    public function penindaklanjut(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ditindaklanjuti_oleh');
    }

    /**
     * Nama pelapor untuk ditampilkan.
     *
     * Laporan anonim TIDAK menyimpan identitas sama sekali (lihat migrasinya),
     * jadi ini bukan penyembunyian di tampilan — memang tidak ada yang bisa
     * ditampilkan.
     */
    public function getPelaporAttribute(): string
    {
        return $this->anonim ? 'Anonim' : ($this->nama_pelapor ?: 'Tidak disebutkan');
    }
}
