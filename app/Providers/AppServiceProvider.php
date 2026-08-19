<?php

namespace App\Providers;

use App\Models\CeeJawaban;
use App\Models\CeeRtp;
use App\Models\CeeSimpulan;
use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\IrsPemda;
use App\Models\KroPd;
use App\Models\KrsPd;
use App\Models\KrsPemda;
use App\Models\LaporanKejadianRisiko;
use App\Models\MediaFolder;
use App\Models\Menu;
use App\Models\MonitoringRtp;
use App\Models\Opd;
use App\Models\PencatatanKejadianRisiko;
use App\Models\SettingApp;
use App\Models\User;
use App\Observers\GlobalActivityLogger;
use App\Observers\OpdSyncObserver;
use App\Observers\UserFolderObserver;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

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
            URL::forceScheme('https');
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

        $this->daftarkanBatasLaju();
    }

    /**
     * Batas laju untuk rute yang dipakai AKUN BERSAMA (LAPOR & CEE_Survey,
     * kredensialnya sengaja disebar lewat QR code).
     *
     * Batas bawaan Laravel mengunci kuota pada ID pengguna kalau sudah login.
     * Untuk akun bersama itu keliru: kuota satu akun dipakai beramai-ramai,
     * sehingga sepuluh pelapor yang mengirim laporan pada menit yang sama
     * saling menghabiskan jatah dan sebagian ditolak 429 — padahal tidak ada
     * yang menyalahgunakan apa pun. Terukur sebelum perbaikan: dari 12 orang
     * yang masuk lewat QR secara bersamaan, hanya 10 yang lolos, dan pada
     * rute CEE tidak ada satu pun yang lolos.
     *
     * Kuncinya dipindah ke ID SESI (satu orang = satu sesi, walau akunnya
     * sama), dengan batas per-IP sebagai pagar kedua supaya perlindungan
     * terhadap penyalahgunaan massal dari satu sumber tidak hilang.
     */
    private function daftarkanBatasLaju(): void
    {
        // Masuk lewat QR hanya membuat sesi. Di sini sesi BELUM ada saat
        // permintaannya tiba, jadi tidak bisa dikunci per sesi — dikunci per
        // IP, dinaikkan supaya satu ruangan sosialisasi yang memindai QR
        // bersama-sama tidak saling menghalangi.
        RateLimiter::for('qr-login', fn (Request $r) => Limit::perMinute(60)->by($r->ip()));

        RateLimiter::for('lapor-submit', fn (Request $r) => [
            Limit::perMinute(10)->by($r->session()->getId()),
            Limit::perMinute(60)->by($r->ip()),
        ]);

        // Pencarian risiko dipanggil sambil pengguna mengetik, jadi jatahnya
        // jauh lebih longgar daripada pengiriman laporan.
        RateLimiter::for('lapor-cari', fn (Request $r) => [
            Limit::perMinute(30)->by($r->session()->getId()),
            Limit::perMinute(200)->by($r->ip()),
        ]);
    }
}
