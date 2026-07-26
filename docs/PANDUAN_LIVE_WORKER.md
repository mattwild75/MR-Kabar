# Panduan Live & Aktivasi Worker

Dua topik operasional yang sering dipakai bersamaan: menjalankan demo MR Kabar lewat tunnel publik, dan mengaktifkan queue worker saat aplikasi sudah di-deploy ke hosting sungguhan.

---

## 0. Status Saat Ini

| Mode | Saat simpan data | Butuh worker? | Risiko |
|---|---|---|---|
| **`sync`** *(aktif sekarang)* | Rebuild tabel turunan langsung, halaman menunggu sampai selesai | Tidak | Simpan sedikit lebih lambat saat data banyak |
| **`database` + worker** | Tiket kerja masuk antrian, halaman langsung kembali | Ya, permanen 24 jam | Kalau worker mati, tiket menumpuk & diagram berhenti ter-update |

`QUEUE_CONNECTION=sync` dipilih sebagai default aman sampai jenis hosting live ditentukan dan worker permanen disiapkan.

---

## 1. Demo via Tunnel (TryCloudflare)

Dipakai saat perlu membagikan akses sementara ke MR Kabar lewat internet publik, tanpa deploy ke hosting sungguhan.

### Kembalikan ke mrkabar.test (setelah demo selesai)

1. **Kembalikan APP_URL** — buka `.env`, ubah `APP_URL` kembali ke `http://mrkabar.test`. Simpan file.
2. **Bersihkan cache konfigurasi** (Tab 3 — terminal bebas):
   ```
   php artisan optimize:clear
   ```
3. **Matikan tunnel** — di Tab 2 (terminal yang menjalankan cloudflared), tekan `Ctrl+C`.
4. **Matikan server manual** — di Tab 1 (terminal yang menjalankan `php -S`), tekan `Ctrl+C`.
5. **Verifikasi** — buka `http://mrkabar.test/login`, pastikan tampil normal.

### Langkah lengkap untuk demo berikutnya (dari awal)

**Tab 1 — PHP Server**
```
cd "C:\Users\Nurhikmat Muhammad\Herd\mrkabar\public"
php -S 127.0.0.1:8080
```
Biarkan tab ini tetap terbuka, jangan ketik apa-apa lagi di sini.

> **Catatan:** kalau server mati mendadak (bukan `Ctrl+C` rapi) dan port 8080 masih "nyangkut" dianggap terpakai saat dijalankan ulang, langsung ganti ke port lain (8081, 8899, dst) daripada didiagnosa panjang — itu fix tercepat yang sudah terbukti jalan.

**Tab 2 — Tunnel**
```
& "$env:USERPROFILE\cloudflared.exe" tunnel --url http://127.0.0.1:8080
```
Tunggu sampai muncul URL seperti `https://xxxx-xxxx.trycloudflare.com`. Catat URL ini. Biarkan tab tetap terbuka.

**Tab 3 — Konfigurasi**
```
cd "C:\Users\Nurhikmat Muhammad\Herd\mrkabar"
```
Edit `.env` di VS Code, ubah baris:
```
APP_URL=https://xxxx-xxxx.trycloudflare.com
```
(ganti dengan URL asli dari Tab 2), simpan file, lalu:
```
php artisan optimize:clear
```

**Test akhir** — buka `https://xxxx-xxxx.trycloudflare.com/login` (pakai URL dari Tab 2), cek tampilan normal, coba login.

> **Layar blank putih?** Buka DevTools (`F12`) → tab Console → cari tulisan merah "Mixed Content". Kalau ada, pastikan `APP_URL` di `.env` sudah pakai `https`, bukan `http`.

### Catatan penting

- Total 3 tab terminal harus terbuka bersamaan selama demo berlangsung.
- Jangan ketik command lain di Tab 1/Tab 2 — bisa mematikan proses yang sedang jalan.
- Semua command tambahan (artisan, edit env, dll) selalu di Tab 3.
- URL tunnel berubah setiap kali Tab 2 dimatikan & dijalankan ulang.
- Setelah demo selesai, jalankan langkah rollback di atas supaya development lokal normal kembali ke `mrkabar.test`.

---

## 2. Worker: Apa & Kenapa

Saat data disimpan di IRS/IRO/KRS/KRO, sistem merebuild tabel turunan (dipakai diagram hierarki & tabel gabungan). Ada dua cara menjalankan pekerjaan itu (lihat tabel di bagian 0).

**Worker** adalah proses terpisah (`php artisan queue:work`) yang terus-menerus mengecek tabel `jobs` dan mengerjakan tiket begitu ada — seperti dapur terpisah yang memasak pesanan sambil pelanggan sudah dipersilakan duduk, dibanding menunggu di depan kasir sampai makanan jadi.

> **Hosting 24 jam ≠ worker otomatis 24 jam.** Server yang menyala terus tidak membuat worker ikut berjalan — worker adalah proses tambahan yang harus disiapkan & dijaga tersendiri, terpisah dari proses deploy aplikasi web-nya.

---

## 3. Kapan Worker Diperlukan

Tidak wajib sekarang. Pertimbangkan mengaktifkan worker begitu salah satu dari ini mulai terasa:

| Sinyal | Penjelasan |
|---|---|
| Simpan mulai terasa lambat | Tabel turunan (`tbl_krs_irs_pemda` dkk) membesar seiring bertambahnya tahun & data OPD |
| Banyak PIC menyimpan bersamaan | Menjelang deadline pelaporan — mode sync bisa membuat sebagian antre hingga 10 detik |
| Sudah pindah ke hosting live | Momen wajar untuk sekalian setup worker permanen sejak awal |

---

## 4. Aktivasi Worker

Pilih opsi sesuai jenis hosting yang dipakai saat live nanti.

### Opsi A — VPS / Cloud (Supervisor)

Cocok untuk DigitalOcean, AWS EC2, atau server milik Pemda sendiri (kontrol penuh server). Supervisor menjaga worker tetap hidup, otomatis restart kalau crash atau server reboot.

1. **Set mode antrian** (`.env`):
   ```
   QUEUE_CONNECTION=database
   ```
2. **Install Supervisor** (server Linux):
   ```
   sudo apt-get install supervisor
   ```
3. **Buat file konfigurasi** `/etc/supervisor/conf.d/mrkabar-worker.conf`:
   ```ini
   [program:mrkabar-worker]
   process_name=%(program_name)s_%(process_num)02d
   command=php /path/ke/mrkabar/artisan queue:work --sleep=3 --tries=3 --max-time=3600
   autostart=true
   autorestart=true
   stopasgroup=true
   killasgroup=true
   user=www-data
   numprocs=1
   redirect_stderr=true
   stdout_logfile=/path/ke/mrkabar/storage/logs/worker.log
   stopwaitsecs=3600
   ```
4. **Nyalakan**:
   ```
   sudo supervisorctl reread
   sudo supervisorctl update
   sudo supervisorctl start mrkabar-worker:*
   ```

### Opsi B — Shared Hosting (Cron Job)

Dipakai kalau hosting tidak mengizinkan proses berjalan permanen (cPanel dsb). Worker "dicek" tiap 1 menit lewat cron, bukan hidup terus.

1. **Set mode antrian** (`.env`):
   ```
   QUEUE_CONNECTION=database
   ```
2. **Tambah cron job** di cPanel → Cron Jobs → Add New Cron Job, jadwal tiap 1 menit:
   ```
   * * * * * cd /path/ke/mrkabar && php artisan queue:work --stop-when-empty >> /dev/null 2>&1
   ```
   `--stop-when-empty` membuat worker berhenti sendiri begitu tiket habis (bukan hidup terus) — cocok untuk pola cron yang mengecek berkala.

### Opsi C — Platform Managed (Forge / Vapor)

Kalau nanti pakai Laravel Forge, Vapor, atau platform managed serupa, biasanya sudah tersedia fitur bawaan "Queue Worker" yang tinggal diaktifkan lewat panel — tidak perlu setup Supervisor/cron manual.

---

## 5. Cara Memantau Worker

| Yang dicek | Kondisi sehat | Kondisi bermasalah |
|---|---|---|
| tabel `jobs` | Baris berkurang dalam hitungan detik | Baris terus bertambah tanpa berkurang → worker mati |
| tabel `failed_jobs` | Kosong / jarang terisi | Ada baris menumpuk → tinjau kenapa job gagal (maks 3 percobaan) |

---

## 6. Kembali ke Mode Sync

Kalau worker perlu dimatikan sementara (maintenance, migrasi server, dsb), aman untuk kembali ke mode langsung tanpa mengubah kode apa pun.

```
QUEUE_CONNECTION=sync
```
```
php artisan config:clear
```

> Tiket yang sudah telanjur ada di tabel `jobs` tidak akan diproses selama mode `sync` aktif — biarkan saja (tidak berbahaya), atau kosongkan tabel itu jika ingin rapi.

---

*MR Kabar · Panduan internal · diperbarui manual, bukan bagian dari kode aplikasi.*
