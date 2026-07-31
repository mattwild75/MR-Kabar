<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Satu pasangan RTP yang sudah ditinjau dan dinyatakan memang berbeda,
 * sehingga lencana kemiripannya tidak perlu muncul lagi.
 */
class RtpKemiripanDiabaikan extends Model
{
    protected $table = 'rtp_kemiripan_diabaikan';

    protected $fillable = [
        'tipe_a',
        'id_a',
        'tipe_b',
        'id_b',
        'diabaikan_oleh',
        'alasan',
    ];

    public function diabaikanOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diabaikan_oleh');
    }

    /**
     * Kunci pasangan yang urutannya sudah dibakukan.
     *
     * Kemiripan itu dua arah — "A mirip B" dan "B mirip A" adalah pasangan
     * yang sama. Tanpa pembakuan urutan, pengabaian yang disimpan dari sisi A
     * tidak akan dikenali saat dilihat dari sisi B, sehingga lencananya tetap
     * muncul sebelah dan terkesan tidak bisa dihilangkan.
     *
     * @return array{0: string, 1: int, 2: string, 3: int}
     */
    public static function bakukan(string $tipeA, int $idA, string $tipeB, int $idB): array
    {
        return strcmp($tipeA . ':' . $idA, $tipeB . ':' . $idB) <= 0
            ? [$tipeA, $idA, $tipeB, $idB]
            : [$tipeB, $idB, $tipeA, $idA];
    }

    /** Penanda pasangan untuk dicocokkan cepat di memori. */
    public static function kunci(string $tipeA, int $idA, string $tipeB, int $idB): string
    {
        [$t1, $i1, $t2, $i2] = self::bakukan($tipeA, $idA, $tipeB, $idB);

        return "{$t1}:{$i1}|{$t2}:{$i2}";
    }
}
