<?php

namespace App\Models\Pkpt;

use App\Models\User;
use App\Observers\GlobalActivityLogger;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Satu siklus perencanaan PKPT.
 *
 * Dua sumbu waktu, dan itu disengaja: PKPT tahun X+1 disusun dari data risiko
 * tahun X. PengaturanPemda.tahun_penilaian milik MR Kabar hanya punya satu
 * sumbu, jadi tidak bisa dipakai ulang di sini.
 *
 * Status mengunci periode. Kertas kerja PKPT melekat pada Keputusan yang
 * ditandatangani; begitu 'ditetapkan', seluruh tulis ditolak supaya angka pada
 * lampiran Keputusan dan angka di layar tidak pernah berbeda diam-diam.
 */
#[ObservedBy([GlobalActivityLogger::class])]
class PkptPeriode extends Model
{
    use SoftDeletes;

    protected $table = 'pkpt_periode';

    /**
     * Nilai bawaan status ditulis di sini, BUKAN hanya di skema basis data.
     *
     * Bawaan tingkat kolom baru terbaca sesudah baris dibaca ulang, sedangkan
     * create() mengembalikan model yang statusnya masih null. Akibatnya
     * terkunci() mengembalikan true dan periode yang baru saja dibuat langsung
     * tampak terkunci di layar. Terlihat saat menjalankan alurnya pada data
     * sungguhan, tidak terlihat oleh uji mana pun.
     */
    protected $attributes = [
        'status' => 'rancangan',
    ];

    protected $fillable = [
        'tahun_pkpt',
        'tahun_dasar_risiko',
        'status',
        'total_belanja_langsung',
        'nomor_keputusan',
        'tanggal_penetapan',
        'ditetapkan_oleh',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'tahun_pkpt' => 'integer',
            'tahun_dasar_risiko' => 'integer',
            'total_belanja_langsung' => 'integer',
            'tanggal_penetapan' => 'date',
        ];
    }

    public function terkunci(): bool
    {
        return $this->status !== 'rancangan';
    }

    public function penetap(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ditetapkan_oleh');
    }

    public function area(): HasMany
    {
        return $this->hasMany(PkptAreaPengawasan::class, 'periode_id');
    }

    public function sektorUnggulan(): HasMany
    {
        return $this->hasMany(PkptSektorUnggulan::class, 'periode_id');
    }

    public function kematangan(): HasMany
    {
        return $this->hasMany(PkptKematanganMr::class, 'periode_id');
    }

    public function penilaian(): HasMany
    {
        return $this->hasMany(PkptPenilaian::class, 'periode_id');
    }

    public function rencana(): HasMany
    {
        return $this->hasMany(PkptRencana::class, 'periode_id');
    }

    public function penugasanWajib(): HasMany
    {
        return $this->hasMany(PkptPenugasanWajib::class, 'periode_id');
    }
}
