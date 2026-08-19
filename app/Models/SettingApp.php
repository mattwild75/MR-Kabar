<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SettingApp extends Model
{
    protected $table = 'settingapp';

    protected $fillable = [
        'nama_app',
        'deskripsi',
        'logo',
        'logo_bg',
        'favicon',
        'login_splash_enabled',
        'login_splash_video',
        'login_splash_muted',
        'edu_video_enabled',
        'edu_video_path',
        'edu_video_subtitle_path',
        'edu_video_gain_narration',
        'edu_video_gain_music',
        'edu_video_gain_sfx',
        'edu_video_subtitle_enabled',
        'edu_video_subtitle_size',
        'tutorial_video_enabled',
        'tutorial_video_path',
        'tutorial_video_subtitle_path',
        'tutorial_video_gain_narration',
        'tutorial_video_gain_music',
        'tutorial_video_subtitle_enabled',
        'tutorial_video_subtitle_size',
        'warna',
        'seo',
        'contact_email',
        'contact_email_secondary',
        'footer_credit',
        'git_sync_enabled',
    ];

    protected $casts = [
        'seo' => 'array',
        'git_sync_enabled' => 'boolean',
        'login_splash_enabled' => 'boolean',
        'login_splash_muted' => 'boolean',
        'edu_video_enabled' => 'boolean',
        'edu_video_gain_narration' => 'integer',
        'edu_video_gain_music' => 'integer',
        'edu_video_gain_sfx' => 'integer',
        'edu_video_subtitle_enabled' => 'boolean',
        'edu_video_subtitle_size' => 'integer',
        'tutorial_video_enabled' => 'boolean',
        'tutorial_video_gain_narration' => 'integer',
        'tutorial_video_gain_music' => 'integer',
        'tutorial_video_subtitle_enabled' => 'boolean',
        'tutorial_video_subtitle_size' => 'integer',
    ];

    /**
     * Ingatan sebaris ini, agar baris setting tidak dikueri berulang kali
     * dalam satu permintaan.
     *
     * Karena properti STATIS, umurnya mengikuti umur proses PHP, bukan umur
     * permintaan. Pada PHP-FPM biasa keduanya kebetulan sama panjang, jadi
     * tidak pernah terasa. Dua tempat yang tidak sama panjang:
     *
     *   - Pengujian. Seluruh rangkaian berjalan dalam SATU proses, jadi
     *     setelan yang disimpan satu uji terbawa ke uji berikutnya. Temuan
     *     R-21 audit: satu uji gagal di rangkaian penuh tetapi lulus kalau
     *     dijalankan sendiri — gejala yang paling mudah disalahartikan
     *     sebagai uji yang "kadang-kadang rewel".
     *   - Octane, seandainya kelak dipakai. Prosesnya hidup terus, jadi
     *     setelan basi akan disajikan sampai prosesnya dimatikan.
     *
     * Pembatalannya karena itu dipasang pada peristiwa model (lihat
     * booted()), bukan diserahkan pada ingatan penulis kode untuk memanggil
     * clearCached() di tiap tempat yang menyimpan. Sebelumnya hanya dua
     * tempat yang memanggilnya; jalur ketiga yang lupa memanggil tidak akan
     * memberi gejala apa pun sampai ada yang mengaudit.
     */
    protected static ?SettingApp $cached = null;

    protected static bool $cachedResolved = false;

    protected static function booted(): void
    {
        static::saved(static fn () => static::clearCached());
        static::deleted(static fn () => static::clearCached());
    }

    public static function cached(): ?SettingApp
    {
        if (! static::$cachedResolved) {
            static::$cached = static::first();
            static::$cachedResolved = true;
        }

        return static::$cached;
    }

    public static function clearCached(): void
    {
        static::$cached = null;
        static::$cachedResolved = false;
    }
}
