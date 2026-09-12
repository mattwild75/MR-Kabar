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

// Cadangan basis data ke Google Drive, tiap hari 01:30 WIB — setengah jam
// sesudah cron root (01:00) menulis cadangan di dalam VM. Dua salinan di dua
// tempat yang tidak saling bergantung: cron root tidak butuh internet, Drive
// tidak butuh VM-nya masih ada. Perintahnya diam bila Drive belum ditautkan
// (lihat CadangkanKeDrive), jadi aman terdaftar sejak awal.
// withoutOverlapping: unggahan ke Drive bisa berlangsung lebih dari semenit.
Schedule::command('cadangan:drive')
    ->dailyAt('01:30')
    ->name('cadangan-drive')
    ->withoutOverlapping(30);

// Pemeriksaan keutuhan data — temuan audit R-08, R-09, dan R-17.
//
// Ketiga perintah ini sudah ada sebelum baris-baris di bawah ditulis, tetapi
// TIDAK PERNAH dipanggil dari mana pun: tidak dari penjadwal, tidak dari
// halaman mana pun, tidak dari dokumentasi. Perintah pemeriksa yang hanya
// jalan kalau ada yang ingat menjalankannya tidak mengurangi risiko "rusak
// diam-diam" — ia justru bentuk lain dari risiko itu. Persis nasib
// `activitylog:clean` di atas sebelum dijadwalkan.
//
// Mingguan, bukan harian: ketiganya memindai seluruh tabel risiko, dan
// ketiganya memeriksa hal yang berubah lewat penyuntingan manusia atau impor
// Excel — bukan hal yang bisa rusak dalam hitungan jam. Hari Senin pagi supaya
// hasilnya sudah ada ketika pekan kerja dimulai.
//
// Hasilnya disimpan ke cache dan dibaca halaman Backup, mengikuti jalur yang
// sama dengan detak penjadwal di atas. Sengaja tidak dikirim lewat surel:
// server ini belum punya pengiriman surel yang teruji, dan pemberitahuan yang
// dikira terkirim padahal tidak lebih berbahaya daripada tidak ada sama sekali.
/**
 * Menyimpan hasil satu pemeriksaan keutuhan supaya halaman Backup bisa
 * menampilkannya.
 *
 * Closure, bukan fungsi bernama: berkas ini dimuat lebih dari sekali dalam satu
 * proses saat rangkaian tes berjalan, dan fungsi bernama membuat prosesnya mati
 * dengan "Cannot redeclare function".
 *
 * Disimpan di cache, bukan tabel sendiri, karena isinya boleh hilang: kalau
 * cache dikosongkan, halaman Backup cukup melaporkan "belum pernah diperiksa"
 * dan tik mingguan berikutnya mengisinya kembali.
 */
$catatHasilPemeriksaan = function (string $perintah, string $judul, bool $sehat): void {
    $semua = Cache::get('pemeriksaan_keutuhan', []);

    $semua[$perintah] = [
        'judul' => $judul,
        'sehat' => $sehat,
        'waktu' => now()->timestamp,
    ];

    Cache::forever('pemeriksaan_keutuhan', $semua);
};

collect([
    'rujukan:periksa' => 'Rujukan OPD',
    'hierarki:periksa' => 'Hierarki',
    'volume:periksa' => 'Volume halaman',
])->each(function (string $judul, string $perintah) use ($catatHasilPemeriksaan) {
    Schedule::command($perintah)
        ->weeklyOn(1, '05:30')
        ->name('periksa-'.str($perintah)->before(':'))
        ->onSuccess(fn () => $catatHasilPemeriksaan($perintah, $judul, true))
        ->onFailure(fn () => $catatHasilPemeriksaan($perintah, $judul, false));
});

// Kesehatan server: tiap jam periksa cepat (peringatan hanya bila ada
// bahaya, dijeda 12 jam per butir), Senin 06:00 laporan lengkap ke Super
// Admin apa pun hasilnya, dan tiap tanggal 1 pukul 02:30 uji pemulihan
// cadangan terbaru ke basis data uji terpisah (setelah cadangan 01:00 dan
// unggahan Drive 01:30 selesai).
Schedule::command('kesehatan:laporan')->hourlyAt(17)->name('kesehatan-jam')->withoutOverlapping(10);
Schedule::command('kesehatan:laporan --mingguan')->weeklyOn(1, '06:00')->name('kesehatan-mingguan');
Schedule::command('cadangan:uji-pulih')->monthlyOn(1, '02:30')->name('uji-pulih')->withoutOverlapping(60);

// Arsip log audit ke berkas bulanan (ikut tercadangkan bersama storage/app),
// tiap hari sebelum pembersihan tabel activitylog:clean.
Schedule::command('audit:arsip')->dailyAt('00:40')->name('audit-arsip')->withoutOverlapping(30);

// Pengingat ERPIKA ke lonceng Super Admin: laporan terlambat (>14 hari
// setelah masa tugas) dan ST belum terbit menjelang masa tugas.
Schedule::command('erpika:ingatkan')->dailyAt('07:00')->name('erpika-ingatkan');
