<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Video film pendek pre-test atau post-test beserta 20 titik berhentinya.
 *
 * Berkasnya di penyimpanan privat (storage/app/private/tes-video) dan hanya
 * diputar untuk admin dan super-admin di layar tayang: video post-test
 * membuka jawaban, jadi tidak boleh bisa diunduh peserta lebih dulu, dan
 * tidak ikut ke GitHub yang publik.
 */
class TesVideo extends Model
{
    protected $table = 'tes_video';

    protected $fillable = ['jenis', 'berkas', 'isyarat'];

    protected $casts = ['isyarat' => 'array'];
}
