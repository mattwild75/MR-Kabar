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

Seluruhnya sudah dibungkus dua berkas di folder **MR Kabar** pada Desktop:

| Berkas | Gunanya |
|---|---|
| `TUNNEL_ON.bat` | Menyalakan tunnel, membuktikan alamatnya hidup, lalu membukanya di Chrome |
| `TUNNEL_OFF.bat` | Mematikan tunnel |

Klik dua kali `TUNNEL_ON.bat`, tunggu 8-15 detik. Alamatnya muncul di layar dan
peramban terbuka sendiri. Selesai demo, klik dua kali `TUNNEL_OFF.bat`. Itu saja.

### Tidak ada langkah manual, dan itu memang berubah

Versi lama panduan ini menyuruh menjalankan `php -S` di port 8080, mengedit
`APP_URL` di `.env`, lalu `optimize:clear` — tiga tab terminal yang harus
terbuka bersamaan, berikut serangkaian langkah pemulihan sesudahnya.

**Jangan diikuti lagi.** Sejak temuan audit R-12 ditutup 22 Agustus 2026,
seluruh urusan itu dicabut dari skrip tunnel, dan mengikutinya sekarang justru
merusak: mengubah `APP_URL`/`ASSET_URL` membuat `https://mrkabar.test` tampil
KOSONG tanpa pesan galat. Ikut hilang bersamanya risiko cadangan `.env`
tertimpa, yang melekat pada cara lama.

Yang membuatnya tidak perlu lagi adalah proksi tepercaya di
`bootstrap/app.php`. Laravel kini membaca `X-Forwarded-Host` yang dititipkan
`cloudflared`, jadi ia tahu sendiri alamat mana yang dipakai TIAP pengunjung.
Akibatnya alamat lokal dan alamat tunnel benar **sekaligus** — sebelumnya
mustahil. Berkas `.env` tidak disentuh sama sekali.

### Yang dikerjakan TUNNEL_ON.bat

1. Menolak jalan kalau `cloudflared` masih hidup — kalau dipaksa, ia membaca
   alamat lama dari log yang gagal dihapus dan menyatakan siap atas alamat
   yang sudah mati.
2. Menyalakan `cloudflared` menunjuk `https://mrkabar.test`, yaitu Herd —
   bukan server PHP manual. Karena itu `--http-host-header` dan
   `--no-tls-verify` wajib ada.
3. Menunggu alamat `*.trycloudflare.com` terbit di log.
4. **Membuktikan alamat itu menjawab 200** sebelum menyatakan siap. Membaca
   alamat dari log hanya membuktikan `cloudflared` menuliskannya, bukan bahwa
   tunnelnya terbentuk.
5. Mengulang sampai tiga kali kalau gagal. Kegagalan tunnel cepat Cloudflare
   kerap sementara.
6. Membuka alamatnya di Chrome.

### Catatan

- Alamat tunnel berubah setiap kali dinyalakan ulang.
- `https://mrkabar.test` tetap jalan seperti biasa selama tunnel hidup.
- Selama tunnel hidup aplikasi terbuka ke internet: siapa pun yang tahu
  alamatnya dapat membuka halaman login.
- Yang tersaji lewat tunnel adalah direktori kerja apa adanya, **termasuk
  cabang git yang sedang aktif**. Periksa `git branch --show-current` sebelum
  berdemo, supaya tidak menayangkan pekerjaan yang belum siap dilihat orang.
- Gagal tiga kali berturut-turut berarti masalah jaringan, bukan berkasnya.
  Tunggu beberapa menit lalu ulangi.

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
