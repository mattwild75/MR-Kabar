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
