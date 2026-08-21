<?php

use App\Http\Middleware\CheckMenuPermission;
use App\Http\Middleware\ForceLogoutAfterMaxDuration;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RestrictCeeSurveyRole;
use App\Http\Middleware\RestrictLaporRisikoRole;
use App\Http\Middleware\ShareMenus;
use App\Http\Middleware\ViewerReadOnly;
use App\Http\Middleware\WajibDuaFaktor;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            ForceLogoutAfterMaxDuration::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            ShareMenus::class,
            RestrictCeeSurveyRole::class,
            RestrictLaporRisikoRole::class,
            // Sesudah penjaga peran, sebelum ViewerReadOnly. Urutannya
            // penting: yang ditahan di sini belum boleh menyentuh apa pun,
            // jadi ia harus lebih dulu daripada penjaga yang mengatur BOLEH
            // MENGUBAH APA.
            WajibDuaFaktor::class,
            // Ditaruh di rantai global (bukan per-route) supaya fitur baru
            // apa pun otomatis ikut terkunci untuk peran `eksekutif` tanpa
            // perlu diingat satu per satu.
            ViewerReadOnly::class,
        ]);

        $middleware->alias([
            'menu.permission' => CheckMenuPermission::class,
        ]);

        /*
         * Proksi yang boleh dipercaya keterangannya — temuan audit R-12.
         *
         * KENAPA HANYA LOCALHOST, BUKAN RENTANG CLOUDFLARE. Aplikasi ini
         * dibuka ke luar lewat `cloudflared`, yang berjalan DI MESIN INI dan
         * menyerahkan permintaannya ke Herd dari 127.0.0.1. Alamat milik
         * Cloudflare tidak pernah menyentuh server ini sama sekali. Jadi
         * mempercayai rentang Cloudflare bukan cuma keliru — ia juga lebih
         * longgar tanpa guna, karena yang benar-benar berbicara ke Herd cuma
         * proses di komputer yang sama.
         *
         * APA YANG DIPERBAIKI. Tanpa ini, Laravel mengabaikan keterangan
         * X-Forwarded-* dan menganggap SETIAP pengunjung datang dari
         * 127.0.0.1. Terbukti di basis data: 51 sesi, satu alamat, termasuk
         * yang masuk lewat tunnel. Tiga akibatnya nyata:
         *
         *   1. Pembatas percobaan masuk dan pembatas 2FA dihitung per alamat
         *      IP. Kalau semua pengunjung beralamat sama, satu orang yang
         *      salah sandi berkali-kali mengunci pintu bagi semua orang.
         *   2. Jejak audit mencatat 127.0.0.1 untuk semua orang. Pada
         *      aplikasi yang tugasnya justru mengaudit, itu bukan hal kecil.
         *   3. Alamat aset dibuat menurut nama host yang diterima Herd, bukan
         *      alamat yang dipakai pengunjung — sehingga halaman lokal dan
         *      halaman tunnel tidak bisa benar sekaligus.
         *
         * RISIKONYA. Siapa pun yang dipercaya di sini dapat memalsukan
         * alamat pengunjung dan nama host, dan nama host yang dipalsukan bisa
         * menyelinap ke tautan yang dikirim aplikasi (mis. pemulihan sandi).
         * Karena daftarnya cuma localhost, pemalsuan itu menuntut kemampuan
         * menjalankan proses di mesin ini — dan siapa pun yang sudah sampai
         * di situ tidak memerlukan celah ini untuk apa pun.
         */
        $middleware->trustProxies(
            at: ['127.0.0.1', '::1'],
            headers: Request::HEADER_X_FORWARDED_FOR
                | Request::HEADER_X_FORWARDED_HOST
                | Request::HEADER_X_FORWARDED_PORT
                | Request::HEADER_X_FORWARDED_PROTO,
        );
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
