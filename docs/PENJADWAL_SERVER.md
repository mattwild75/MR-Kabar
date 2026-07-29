# Memasang Penjadwal Tugas Berkala di Server

Aplikasi ini punya daftar tugas berkala (lihat `routes/console.php`). Isinya
saat ini:

| Tugas | Jadwal | Gunanya |
|---|---|---|
| `activitylog:clean` | harian | Buang catatan log aktivitas yang umurnya lewat 730 hari |
| Detak penjadwal | tiap menit | Menandai bahwa penjadwalnya hidup, dibaca halaman Backup |

**Aplikasi tidak bisa membangunkan dirinya sendiri.** Daftar itu hanya dibaca
saat ada yang menjalankan `php artisan schedule:run`. Yang bertugas
menjalankannya tiap menit adalah cron (Linux) atau Task Scheduler (Windows
Server) — keduanya di luar aplikasi dan harus dipasang sekali oleh
administrator server.

Selama pemanggil itu belum ada, jadwalnya terdaftar rapi tapi tidak pernah
dibaca, dan **tidak ada gejala apa pun**. Karena itu halaman Backup akan
menampilkan peringatan kalau detaknya berhenti lebih dari satu jam.

## Linux (cron)

Masuk sebagai pengguna yang memiliki berkas aplikasi (biasanya `www-data`
atau pengguna deploy), lalu:

```bash
crontab -e
```

Tambahkan satu baris ini, sesuaikan path aplikasi dan path PHP-nya:

```
* * * * * cd /var/www/mrkabar && /usr/bin/php artisan schedule:run >> /dev/null 2>&1
```

Path PHP-nya bisa dipastikan dengan `which php`.

## Windows Server (Task Scheduler)

Jalankan sekali di PowerShell sebagai Administrator, sesuaikan kedua path:

```powershell
$aksi = New-ScheduledTaskAction -Execute "C:\php\php.exe" `
    -Argument "artisan schedule:run" -WorkingDirectory "C:\inetpub\mrkabar"

$pemicu = New-ScheduledTaskTrigger -Once -At (Get-Date) `
    -RepetitionInterval (New-TimeSpan -Minutes 1)

Register-ScheduledTask -TaskName "MR Kabar Penjadwal" -Action $aksi `
    -Trigger $pemicu -RunLevel Highest -User "SYSTEM"
```

## Memastikan ia benar-benar jalan

Cara tercepat: buka menu **Backup** di aplikasi. Kalau peringatan kuning
"Penjadwal tugas berkala tidak berjalan" **tidak muncul**, berarti detaknya
masuk dalam satu jam terakhir dan penjadwalnya hidup.

Kalau ingin memeriksa dari sisi server:

```bash
php artisan schedule:list
```

Perintah itu menampilkan daftar tugas beserta jadwal berikutnya. Perlu
dicatat, `schedule:list` hanya membuktikan tugasnya **terdaftar** — bukan
bahwa cron memanggilnya. Yang membuktikan cron benar-benar memanggil hanya
detak di halaman Backup, atau menjalankan sekali secara manual:

```bash
php artisan schedule:run
```

Sesudah itu peringatan di halaman Backup harus hilang.

## Kalau peringatannya muncul padahal cron sudah dipasang

Tiga sebab yang paling sering:

1. **Pengguna cron berbeda** dari pemilik berkas aplikasi, sehingga
   `artisan` gagal menulis cache. Cek dengan menjalankan perintah cron-nya
   secara manual sebagai pengguna itu.
2. **Cache baru dikosongkan** (`php artisan cache:clear`) — detaknya ikut
   terhapus. Ini pulih sendiri pada menit berikutnya; kalau lewat satu menit
   masih muncul, berarti memang cron-nya tidak jalan.
3. **Path PHP salah** di baris cron. Cron tidak memakai `PATH` yang sama
   dengan shell interaktif, jadi `php` saja sering tidak ditemukan — tulis
   path lengkapnya.
