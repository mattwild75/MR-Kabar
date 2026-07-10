<?php

namespace App\Providers;

use App\Models\Menu;
use App\Models\MediaFolder;
use App\Models\Opd;
use App\Models\KrsPemda;
use App\Models\IrsPemda;
use App\Models\KrsPd;
use App\Models\IrsPd;
use App\Models\KroPd;
use App\Models\IroPd;
use App\Models\User;
use App\Models\SettingApp;
use Spatie\Permission\Models\Role;
use App\Observers\GlobalActivityLogger;
use App\Observers\UserFolderObserver;
use Illuminate\Support\ServiceProvider;
use Spatie\Permission\Models\Permission;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        User::observe(GlobalActivityLogger::class);
        Role::observe(GlobalActivityLogger::class);
        Permission::observe(GlobalActivityLogger::class);
        Menu::observe(GlobalActivityLogger::class);
        SettingApp::observe(GlobalActivityLogger::class);
        KrsPemda::observe(GlobalActivityLogger::class);
        IrsPemda::observe(GlobalActivityLogger::class);
        KrsPd::observe(GlobalActivityLogger::class);
        IrsPd::observe(GlobalActivityLogger::class);
        KroPd::observe(GlobalActivityLogger::class);
        IroPd::observe(GlobalActivityLogger::class);
        Opd::observe(GlobalActivityLogger::class);
        MediaFolder::observe(GlobalActivityLogger::class);
        User::observe(UserFolderObserver::class);
    }
}
