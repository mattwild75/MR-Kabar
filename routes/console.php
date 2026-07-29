<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
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

// Detak penjadwal.
//
// Seluruh jadwal di berkas ini hanya berjalan kalau ada yang memanggil
// `php artisan schedule:run` tiap menit dari cron (Linux) atau Task
// Scheduler (Windows Server) — pemanggil itu ada DI LUAR aplikasi. Kalau
// belum dipasang, jadwalnya terdaftar rapi tapi tidak pernah dibaca, dan
// tidak ada gejala apa pun yang menandainya: pembersihan log cuma diam,
// dan tugas berkala apa pun yang ditambahkan kemudian ikut diam.
//
// Baris ini meninggalkan jejak waktu tiap menit, dan halaman Backup
// membacanya (lihat BackupController::index) untuk memberi tahu kalau
// penjadwalnya berhenti. Sengaja di cache, bukan tabel sendiri: isinya satu
// angka yang boleh hilang — kalau cache dikosongkan, penanda ini pulih
// sendiri pada tik berikutnya.
Schedule::call(fn () => Cache::forever('penjadwal_detak_terakhir', now()->timestamp))
    ->everyMinute()
    ->name('detak-penjadwal');
