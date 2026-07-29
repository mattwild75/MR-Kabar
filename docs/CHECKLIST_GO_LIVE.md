# Checklist Go-Live MR Kabar

Daftar hal yang **hanya bisa dikerjakan di server** — tidak ada satu pun yang
bisa diselesaikan dari sisi kode. Urutannya sengaja dari atas ke bawah;
beberapa langkah bergantung pada langkah sebelumnya.

Dua dokumen pendamping, supaya isinya tidak diulang di sini:

- [PENJADWAL_SERVER.md](PENJADWAL_SERVER.md) — memasang cron/Task Scheduler
- [PANDUAN_LIVE_WORKER.md](PANDUAN_LIVE_WORKER.md) — demo lewat tunnel & queue worker

---

## A. Sekali saja, saat pertama kali dipasang

### A1. Ambil berkasnya — pasang git-lfs DULU

`public/video` berisi **211 MB** video & audio edukasi yang dilacak lewat Git
LFS (10 berkas). Kalau `git clone`/`git pull` dijalankan di server yang belum
punya git-lfs, yang turun bukan videonya melainkan berkas teks penunjuk
beberapa baris — dan video edukasi di halaman Panduan serta di kartu login
tidak akan jalan, tanpa pesan galat yang menjelaskan kenapa.

```bash
sudo apt-get install git-lfs && git lfs install
git clone <repo> /var/www/mrkabar
cd /var/www/mrkabar && git lfs pull
```

Pastikan benar:

```bash
git lfs ls-files | wc -l     # harus 10
du -sh public/video          # harus ratusan MB, bukan beberapa KB
```

### A2. Dependensi

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
```

`npm ci` (tanpa `--omit=dev`) memang disengaja: proses `npm run build`
membutuhkan devDependencies. Paket `puppeteer` sendiri ada di
`dependencies`, dan dialah yang menyediakan Chromium untuk cetak PDF.

### A3. Isi `.env`

| Kunci | Nilai | Kalau salah |
|---|---|---|
| `APP_ENV` | `production` | — |
| `APP_DEBUG` | `false` | Jejak galat & isi konfigurasi terlihat oleh siapa pun yang memicu error |
| `APP_URL` | domain sungguhan, lengkap dengan `https://` | Cetak PDF gagal — Browsershot memakai alamat ini untuk memanggil halaman cetaknya sendiri |
| `APP_KEY` | isi dengan `php artisan key:generate` bila kosong | Sesi & cookie terenkripsi tidak bisa dibaca |
| `DB_*` | kredensial basis data produksi | — |
| `LAPOR_ACCOUNT_PASSWORD` | **sama persis** dengan sandi akun `LAPOR` di basis data | QR lapor memantulkan orang ke halaman masuk, tanpa pesan galat |
| `CEE_SURVEY_ACCOUNT_PASSWORD` | **sama persis** dengan sandi akun `CEE_Survey` | QR kuesioner CEE ikut mati dengan cara yang sama |

Dua baris terakhir itu penyebab kegagalan yang paling membingungkan, karena
gejalanya menyerupai "salah sandi" padahal penggunanya tidak pernah mengetik
apa pun.

### A4. Basis data & penyimpanan

```bash
php artisan migrate --force
php artisan db:seed --force      # HANYA pada pemasangan baru
php artisan storage:link
```

Beri hak tulis pada pengguna web server (`www-data` atau setara):

```bash
sudo chown -R www-data:www-data storage bootstrap/cache
```

### A5. Penjadwal tugas berkala

Wajib, dan **tidak otomatis** meski server menyala 24 jam. Perintahnya ada di
[PENJADWAL_SERVER.md](PENJADWAL_SERVER.md).

Halaman **Backup** menampilkan pita kuning selama penjadwalnya belum hidup —
itu cara tercepat memastikannya.

### A6. Chromium untuk cetak PDF

Cetak PDF menjalankan Chromium lewat puppeteer. Di server Linux yang bersih,
Chromium sering butuh pustaka sistem yang belum terpasang.

```bash
npx puppeteer browsers install chrome
```

Kalau cetak PDF masih gagal, jalankan sekali cetak dari aplikasi lalu baca
`storage/logs/laravel.log` — pesan galat Chromium menyebutkan nama pustaka
yang kurang, dan itu yang dipasang. Kalau `node` tidak ketemu oleh PHP (PATH
milik PHP-FPM berbeda dari PATH shell), isi `BROWSERSHOT_NODE_BINARY` di
`.env` dengan path lengkap `node`.

---

## B. Setiap kali memasang versi baru

```bash
cd /var/www/mrkabar
git pull                                  # LFS ikut, asalkan A1 sudah beres
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php artisan migrate --force
php artisan optimize                      # cache config + route + view
sudo systemctl reload php8.4-fpm          # sesuaikan versi PHP-nya
```

`php artisan optimize` aman dijalankan: seluruh nilai dari `.env` yang
dipakai aplikasi ini sudah dibaca lewat `config/mrkabar.php`, bukan `env()`
langsung. (Sebelum perbaikan itu, perintah ini akan mematikan kedua QR login
dan pengaturan Node — diam-diam.)

Kalau nanti queue worker diaktifkan, worker perlu di-restart tiap deploy —
lihat [PANDUAN_LIVE_WORKER.md](PANDUAN_LIVE_WORKER.md).

---

## C. Lima pemeriksaan sesudah deploy

Lakukan berurutan; masing-masing membuktikan satu hal yang berbeda.

| # | Yang dibuka | Yang harus terjadi | Kalau gagal, artinya |
|---|---|---|---|
| 1 | `/up` | Balasan 200 | Aplikasi tidak boot — cek `storage/logs/laravel.log` |
| 2 | Menu **Backup** | **Tidak ada** pita kuning | Penjadwal belum dipanggil cron (A5) |
| 3 | `/login/cee-survey` dan `/login/lapor-kejadian` | Langsung masuk ke formulir | Sandi di `.env` tidak cocok dengan yang di basis data (A3) |
| 4 | Form Cetak mana saja → **Unduh PDF** | Berkas PDF turun | Node/Chromium belum siap (A6) |
| 5 | Menu **Panduan** | Video edukasi bisa diputar | Berkas LFS belum ditarik (A1) |

---

## D. Yang khas di aplikasi ini

**Tiga akun bersama.** `CEE_Survey`, `LAPOR`, dan `mrkabarvip` memang dipakai
banyak orang sekaligus. Sandi dua yang pertama harus sinkron antara `.env`
dan basis data. Ketiganya tidak bisa mengubah profil/sandinya sendiri dari
dalam aplikasi — itu disengaja, karena satu orang yang mengubahnya akan
mengunci semua yang lain. Pengelolaannya lewat menu Users oleh Admin.

**Cetak PDF dibatasi satu pada satu waktu.** Permintaan yang datang saat ada
pencetakan lain ditolak cepat dengan halaman penjelasan, bukan diantrekan.
Ini disengaja: tiap pencetakan menjalankan satu Chromium, dan membiarkannya
berbarengan membuat semuanya gagal — bukan sebagian.

**Antrean masih `sync`.** Semua pekerjaan berjalan di dalam permintaan web.
Tidak ada worker yang perlu dijaga hidup untuk saat ini.

**Jangan menambah `env()` di luar folder `config/`.** Setelah `php artisan
optimize` dijalankan di server, `env()` di luar sana mengembalikan `null`
dan yang rusak karenanya tidak bersuara. Tambahkan kuncinya di
`config/mrkabar.php` lalu baca lewat `config()`.
