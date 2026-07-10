<?php

namespace App\Providers;

use App\Models\MediaFolder;
use App\Models\IrsPemda;
use App\Models\KrsPd;
use App\Models\IrsPd;
use App\Models\KroPd;
use App\Models\IroPd;
use App\Policies\MediaFolderPolicy;
use App\Policies\IrsPemdaPolicy;
use App\Policies\KrsPdPolicy;
use App\Policies\IrsPdPolicy;
use App\Policies\KroPdPolicy;
use App\Policies\IroPdPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        MediaFolder::class => MediaFolderPolicy::class,
        IrsPemda::class => IrsPemdaPolicy::class,
        KrsPd::class => KrsPdPolicy::class,
        IrsPd::class => IrsPdPolicy::class,
        KroPd::class => KroPdPolicy::class,
        IroPd::class => IroPdPolicy::class,
    ];

    public function boot(): void
    {
        // Base AuthServiceProvider (Laravel 12) mendaftarkan $policies lewat
        // callback booting() di register(), bukan di boot() — jadi override
        // boot() ini aman tanpa parent::boot() (yang memang tidak ada).

        // super-admin bypass SEMUA permission (pola standar Spatie). Sebelumnya
        // permission di-assign satu per satu secara manual ke super-admin,
        // sehingga setiap fitur/permission baru (mis. 'troubleshoot-view') tidak
        // otomatis terlihat oleh super-admin sampai di-assign ulang. Dengan
        // Gate::before ini, super-admin selalu lolos cek izin apa pun — termasuk
        // filter menu di ShareMenus yang memakai $user->can(). return null agar
        // role lain tetap dievaluasi normal.
        Gate::before(function ($user, $ability) {
            return $user->hasRole('super-admin') ? true : null;
        });

        Gate::define('manageUsers', fn ($user) => $user->hasAnyRole(['admin', 'super-admin']));
    }
}
