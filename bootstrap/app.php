<?php

use App\Http\Middleware\CheckMenuPermission;
use App\Http\Middleware\ForceLogoutAfterMaxDuration;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RestrictCeeSurveyRole;
use App\Http\Middleware\RestrictLaporRisikoRole;
use App\Http\Middleware\ShareMenus;
use App\Http\Middleware\ViewerReadOnly;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

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
            // Ditaruh di rantai global (bukan per-route) supaya fitur baru
            // apa pun otomatis ikut terkunci untuk peran `eksekutif` tanpa
            // perlu diingat satu per satu.
            ViewerReadOnly::class,
        ]);

        $middleware->alias([
            'menu.permission' => CheckMenuPermission::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
