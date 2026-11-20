<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Sesi pre-test atau post-test dari satu pelatihan.
 *
 * Status: draf (belum dibuka) -> lobi (peserta boleh bergabung) -> berjalan
 * (pemandu membuka dan menutup soal satu per satu) -> selesai. Setiap
 * perubahan menaikkan `versi` dan menulis ulang berkas status publik lewat
 * StatusTesService; ponsel peserta hanya membaca berkas itu.
 *
 * Token disimpan terenkripsi supaya bisa ditampilkan lagi di layar tayang,
 * dan dicocokkan persis (huruf besar/kecil dan spasi berpengaruh, keputusan
 * pemilik aplikasi) lewat sidik SHA-256-nya.
 */
class TesSesi extends Model
{
    public const JUMLAH_SOAL = 20;

    protected $table = 'tes_sesi';

    protected $fillable = [
        'pelatihan_id', 'jenis', 'token', 'token_hash', 'kunci_publik', 'status', 'soal_aktif',
        'soal_terbuka', 'soal_dibuka_ms', 'tampilkan_jawaban', 'versi', 'mulai_pada', 'selesai_pada',
    ];

    protected $hidden = ['token', 'token_hash'];

    protected $casts = [
        'token' => 'encrypted',
        'soal_terbuka' => 'boolean',
        'tampilkan_jawaban' => 'boolean',
        'soal_dibuka_ms' => 'integer',
        'mulai_pada' => 'datetime',
        'selesai_pada' => 'datetime',
    ];

    public static function sidikToken(string $token): string
    {
        return hash('sha256', $token);
    }

    /** @return BelongsTo<TesPelatihan, $this> */
    public function pelatihan(): BelongsTo
    {
        return $this->belongsTo(TesPelatihan::class, 'pelatihan_id');
    }

    /** @return HasMany<TesPeserta, $this> */
    public function peserta(): HasMany
    {
        return $this->hasMany(TesPeserta::class, 'sesi_id');
    }

    /** @return HasMany<TesJawaban, $this> */
    public function jawaban(): HasMany
    {
        return $this->hasMany(TesJawaban::class, 'sesi_id');
    }

    /** Peserta masih boleh bergabung: pendaftaran dibuka atau tes sedang berjalan. */
    public function bolehBergabung(): bool
    {
        return in_array($this->status, ['lobi', 'berjalan'], true);
    }

    public function labelJenis(): string
    {
        return $this->jenis === 'pre' ? 'Pre-Test' : 'Post-Test';
    }
}
