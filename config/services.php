<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'git_sync' => [
        // Kunci aktivasi fitur "Git Push"/"Git Pull" di menu Backup (lihat
        // BackupController::ensureGitSyncEnabled()) — nilai bebas, hanya
        // perlu ADA isinya. Sengaja kosong secara default: setiap instalasi
        // baru (termasuk hasil clone/fork oleh siapa pun) harus mengisi ini
        // sendiri di .env server masing-masing sebelum fitur git push/pull
        // aktif di lingkungan itu.
        'enable_key' => env('GIT_SYNC_ENABLE_KEY'),
    ],

];
