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

    /** Cache per-request agar baris setting tidak diquery berulang kali. */
    protected static ?SettingApp $cached = null;

    protected static bool $cachedResolved = false;

    public static function cached(): ?SettingApp
    {
        if (!static::$cachedResolved) {
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
