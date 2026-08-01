<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Satu kali pengisian kuis uji pemahaman video edukasi.
 *
 * Pengisian berulang oleh orang yang sama sengaja TIDAK dicegah. Yang dicari
 * dari rekapnya bukan nilai perorangan, melainkan pertanyaan mana yang sering
 * gagal — dan orang yang mengulang setelah menonton lagi justru menunjukkan
 * bagian itu memang perlu diputar dua kali.
 */
class KuisVideoHasil extends Model
{
    protected $table = 'kuis_video_hasil';

    protected $fillable = [
        'user_id',
        'nama_pengisi',
        'opd_nama',
        'jawaban',
        'benar',
        'total',
    ];

    protected $casts = [
        'jawaban' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
