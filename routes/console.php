<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Pangkas activity_log sesuai retention config/activitylog.php
// (delete_records_older_than_days=730) — sebelumnya konfigurasi retensi ini
// sudah ada (plus index created_at khusus utk mendukung query cleanup-nya)
// tapi TIDAK PERNAH benar-benar dijadwalkan jalan, jadi tabel activity_log
// bertumbuh tanpa batas praktis meski retensinya "diatur" 2 tahun.
Schedule::command('activitylog:clean')->daily();
