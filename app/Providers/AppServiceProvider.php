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
use App\Models\CeeJawaban;
use App\Models\CeeSimpulan;
use App\Models\CeeRtp;
use App\Models\MonitoringRtp;
use App\Models\PencatatanKejadianRisiko;
use App\Models\LaporanKejadianRisiko;
use Spatie\Permission\Models\Role;
use App\Observers\GlobalActivityLogger;
use App\Observers\OpdSyncObserver;
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
        // Paksa seluruh URL yang digenerate Laravel (route(), asset(), dll)
        // memakai https di luar lingkungan local — tanpa ini, aplikasi di
        // balik reverse proxy/SSL termination bisa menghasilkan link http
        // campuran (mixed content) meski diakses lewat https.
        if (config('app.env') !== 'local' || str_contains(config('app.url'), 'https://')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

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
        // Widget "Aktivitas Terbaru" Dashboard butuh CEE & Form 6-10 ikut
        // tercatat — sebelumnya cuma model lama (KRS/IRS/IRO/User/dst) yang
        // di-observe, sehingga perubahan RTP/CEE/kejadian risiko tidak
        // pernah muncul di activity_log.
        CeeJawaban::observe(GlobalActivityLogger::class);
        CeeSimpulan::observe(GlobalActivityLogger::class);
        CeeRtp::observe(GlobalActivityLogger::class);
        MonitoringRtp::observe(GlobalActivityLogger::class);
        PencatatanKejadianRisiko::observe(GlobalActivityLogger::class);
        LaporanKejadianRisiko::observe(GlobalActivityLogger::class);
        User::observe(UserFolderObserver::class);
        KrsPemda::observe(OpdSyncObserver::class);
        KrsPd::observe(OpdSyncObserver::class);
        KroPd::observe(OpdSyncObserver::class);
    }
}
