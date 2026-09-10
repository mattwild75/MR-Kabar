# Checklist Go-Live MR Kabar

Daftar hal yang **hanya bisa dikerjakan di server** — tidak ada satu pun yang
bisa diselesaikan dari sisi kode. Urutannya sengaja dari atas ke bawah;
beberapa langkah bergantung pada langkah sebelumnya.

Tiga dokumen pendamping, supaya isinya tidak diulang di sini:

- [PENJADWAL_SERVER.md](PENJADWAL_SERVER.md) — memasang cron/Task Scheduler
- [PANDUAN_LIVE_WORKER.md](PANDUAN_LIVE_WORKER.md) — demo lewat tunnel & queue worker
- [DUA_FAKTOR.md](DUA_FAKTOR.md) — autentikasi dua faktor, termasuk cara
  membuka akun yang ponsel dan kode pemulihannya hilang

---

## A. Sekali saja, saat pertama kali dipasang

### A1. Ambil berkasnya — pasang git-lfs DULU

`public/video` berisi **622 MB** video & audio — edukasi, tutorial pengisian,
dan tutorial lapor kejadian risiko — yang dilacak lewat Git LFS. Kalau `git clone`/`git pull` dijalankan di server yang belum
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
| `APP_NAME` | `"MR KABAR"` | Judul tab peramban berbunyi **"Masuk - Laravel"**. Nilainya mengalir ke `VITE_APP_NAME`, lalu ke `resources/js/app.tsx` — dan karena ditanam saat **build**, mengubahnya menuntut `npm run build` ulang, bukan sekadar `optimize` |
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

**Jangan pernah menyimpan `.env` dengan BOM.** Sebagian penyunting Windows
(Notepad, PowerShell `Out-File` tanpa `-Encoding utf8NoBOM`) menyisipkan tiga
bita tak terlihat di awal berkas. Akibatnya Dotenv membaca kunci baris pertama
sebagai `﻿APP_NAME`, bukan `APP_NAME` — nilainya tidak pernah ditemukan,
dan gejalanya sama persis dengan nilai yang salah padahal isinya benar.
Terjadi sungguhan pada `.env` mesin pengembang, 10 September 2026. Memeriksanya:

```bash
head -c 3 .env | xxd     # kalau muncul "efbb bf", itu BOM — buang baris itu
```

### A4. Basis data & penyimpanan

```bash
php artisan migrate --force
php artisan db:seed --force      # HANYA pada pemasangan baru
php artisan storage:link
```

**`db:seed` mengisi izin, menu, dan satu akun admin — beserta data referensi
Risiko bila tabelnya masih kosong.** Enam tabel referensi (matriks 5×5, level
Risiko berikut Selera Risiko, kriteria dampak, kriteria kemungkinan, 41 Jenis
Risiko, Entitas Penilai) **tidak dibentuk berisi oleh migrasi mana pun** —
migrasinya hanya membuat tabel kosong. Tanpa isinya, matriks analisis kosong
dan seluruh penilaian Risiko mati tanpa pesan galat yang menjelaskan kenapa.

`DatabaseSeeder` memanggil `RiskReferenceDataSeeder` **hanya ketika
`risk_levels` masih kosong**. Penjagaan itu disengaja: seeder-nya memakai
`updateOrCreate`, sehingga menjalankannya di basis data yang matriks atau
Selera Risikonya sudah disesuaikan Admin akan mengembalikan nilai awalnya
diam-diam.

**Jangan pernah menjalankan seeder data contoh di produksi.** Yang berikut ini
membuat data Tahun Penilaian 2025 buatan, bukan pengisian SKPK sungguhan:
`Set2025Seeder` (dan ketujuh yang dipanggilnya), `RegisterRisiko2025Seeder`,
`CeeContoh*Seeder`, `DataUmumContohSeeder`, `LaporanKejadianSeeder`,
`KrsKroPdVariasiSeeder`, `ProgramNonPrioritasSeeder`,
`PencatatanKejadianRisikoDinkesSeeder`, dan
`PenanggungJawabPengendalianContohSeeder`. Tidak satu pun dipanggil
`DatabaseSeeder`; semuanya harus diketik sendiri lewat `--class=`.

Beri hak tulis pada pengguna web server (`www-data` atau setara):

```bash
sudo chown -R www-data:www-data storage bootstrap/cache
```

**Dua tabel warisan akan terbentuk kosong.** `tbl_krs_pemda` dan
`tbl_krs_irs_pemda` terbawa dari berkas Excel bermakro yang lama dan sampai
Juli 2026 tidak pernah dibuat oleh migrasi mana pun — di server lama keduanya
ada hanya karena diimpor manual. Migrasi
`2026_07_30_000000_create_missing_legacy_pemda_tables` kini membentuknya, jadi
`migrate` tidak lagi berhenti dan halaman **Risiko 100 Program Bupati** tidak
lagi galat 500 pada pemasangan baru. Tetapi isinya kosong: VISI, MISI, dan
sasaran RPJMD harus diisi lewat menu **I_a_KRS_Pemda** atau **Ekspor/Impor
Excel** sebelum halaman itu menampilkan sesuatu yang berarti.

### A5. PKPT Berbasis Risiko — dua seeder yang WAJIB dijalankan sendiri

Modul PKPT sengaja memakai seeder terpisah supaya tidak mengubah berkas MR
Kabar. Akibatnya ada satu langkah yang tidak terjadi dengan sendirinya:

```bash
php artisan db:seed --class=PkptPermissionSeeder --force
php artisan db:seed --class=PkptMenuSeeder --force
```

**Pada pemasangan yang SUDAH BERJALAN, ini satu-satunya cara.** `db:seed`
tanpa `--class` memang tidak dijalankan di sana (lihat A4), dan `migrate`
hanya membuat empat belas tabel PKPT dalam keadaan kosong.

Kalau dilewatkan, gejalanya menyesatkan: migrasinya sukses, tidak ada pesan
galat apa pun, tetapi menu **Miscellaneous → PKPT Berbasis Risiko** tidak
pernah muncul dan seluruh alamat `/pkpt/*` menjawab 403 — termasuk untuk Super
Admin, karena menunya tidak ada dan izinnya belum pernah dibuat.

Aman diulang: keduanya memakai `firstOrCreate`/`updateOrCreate`. Menjalankannya
kembali tidak menggandakan menu dan tidak mengembalikan bobot yang sudah
disesuaikan, karena bobot yang dipakai perhitungan tersimpan pada kertas
kerjanya sendiri.

**Cara memastikan berhasil:** masuk sebagai Super Admin, buka
`Miscellaneous → PKPT Berbasis Risiko → Ikhtisar dan Periode`. Kalau halaman
terbuka dan menawarkan tombol "Periode baru", langkah ini beres.

Peran `apip` ikut dibuat oleh seeder pertama. Akun yang memakainya dibuat
sendiri lewat menu Users — beri peran `apip`, dan biarkan kolom OPD kosong.

### A6. Penjadwal tugas berkala

Wajib, dan **tidak otomatis** meski server menyala 24 jam. Perintahnya ada di
[PENJADWAL_SERVER.md](PENJADWAL_SERVER.md).

Halaman **Backup** menampilkan pita kuning selama penjadwalnya belum hidup —
itu cara tercepat memastikannya.

**Tanpa membuka peramban**, detaknya bisa diperiksa langsung; angkanya harus
di bawah 60 detik:

```bash
php artisan tinker --execute="
\$t = \Illuminate\Support\Facades\Cache::get('penjadwal_detak_terakhir');
echo \$t ? (time()-\$t).' detik lalu' : 'TIDAK ADA DETAK - cron mati';
"
```

### A6b. Pencadangan harian — dan jebakan yang membuatnya diam-diam tak jalan

Ini **bukan** bagian dari penjadwal aplikasi. Ia tugas cron tersendiri milik
`root`, dan surat Diskominsa menegaskannya sebagai tanggung jawab Inspektorat:
snapshot VM milik mereka hanya untuk bencana skala sistem.

Skripnya `/usr/local/bin/backup-mrkabar.sh` (dump basis data + `storage/app`,
menyimpan 14 hari terakhir). Pasang lewat crontab **root**:

```cron
0 1 * * * /usr/local/bin/backup-mrkabar.sh >> /var/log/backup-mrkabar.log 2>&1
```

**PERIKSA, jangan dianggap beres setelah `crontab -e` ditutup.** Pemasangan 4
September 2026 gagal persis di sini: perintahnya diberikan, penyuntingnya
dibuka, tetapi barisnya tidak pernah tersimpan. Yang diverifikasi saat itu
hanyalah crontab `www-data` (penjadwal aplikasi), sehingga **enam hari berlalu
tanpa satu pun cadangan** dan tidak ada gejala apa pun yang memberi tahu.
Dua-duanya harus diperiksa, dan keduanya milik pengguna yang berbeda:

```bash
crontab -l              # root   -> harus memuat baris cadangan di atas
crontab -u www-data -l  # aplikasi -> harus memuat schedule:run tiap menit
ls -lh /var/backups/mrkabar/   # harus ada berkas BARU tiap hari
```

Dua hal yang mudah terlewat pada skripnya sendiri: `mysqldump` memerlukan
`--no-tablespaces` (tanpa itu ia menolak dengan galat `PROCESS privilege`
karena pengguna basis datanya hanya berhak atas satu basis data), dan
`set -euo pipefail` diperlukan supaya kegagalan `mysqldump` benar-benar
menghentikan skrip — tanpa `pipefail`, yang diperiksa hanyalah status `gzip`,
sehingga dump yang gagal tetap menghasilkan berkas dan terlihat berhasil.

**Cadangan yang tidak pernah keluar dari VM tidak menolong saat VM-nya yang
hilang.** Salin isi `/var/backups/mrkabar` ke luar secara berkala.

### A7. Chromium untuk cetak PDF

Cetak PDF menjalankan Chromium lewat puppeteer. Bagian ini punya **empat**
jebakan yang masing-masing membuat SELURUH Form Cetak menjawab 500, dan tak
satu pun memberi petunjuk dari layar aplikasi. Keempatnya ditemukan saat
pemasangan sungguhan 4–10 September 2026.

**1. Pasang DUA komponen, bukan satu.** Puppeteer versi sekarang mencetak
memakai `chrome-headless-shell`, yang terpisah dari `chrome`. Memasang
`chrome` saja menghasilkan galat `Could not find chrome-headless-shell`.

```bash
export PUPPETEER_CACHE_DIR=/var/www/mrkabar/.cache/puppeteer
npx puppeteer browsers install chrome
npx puppeteer browsers install chrome-headless-shell
chown -R www-data:www-data /var/www/mrkabar/.cache
```

**2. Letakkan cache-nya di tempat yang bisa dibaca `www-data`.** Kalau
dipasang sebagai `root` tanpa `PUPPETEER_CACHE_DIR`, berkasnya mendarat di
`/root/.cache/puppeteer` — dan PHP-FPM yang berjalan sebagai `www-data` tidak
akan pernah menemukannya. Karena itu jalurnya dikunci lewat pool PHP-FPM
(`/etc/php/8.4/fpm/pool.d/www.conf`):

```ini
env[PUPPETEER_CACHE_DIR] = /var/www/mrkabar/.cache/puppeteer
env[HOME] = /var/www/mrkabar/.chrome-home
```

**3. `HOME` milik `www-data` tidak bisa ditulis.** Bawaannya `/var/www`, dan
Chromium gagal berangkat dengan `Fontconfig error: No writable cache
directories`. Karena itu baris `env[HOME]` di atas menunjuk folder tersendiri
yang harus dibuat dan diberi kepemilikan:

```bash
mkdir -p /var/www/mrkabar/.chrome-home
chown www-data:www-data /var/www/mrkabar/.chrome-home
systemctl restart php8.4-fpm      # env[] baru hanya terbaca setelah restart
```

**4. Sandbox Chromium.** Sudah ditangani di kode (`PdfPrintService::render()`
memanggil `noSandbox()`), jadi tidak ada yang perlu dikerjakan di server —
disebut di sini supaya tidak dikira kelalaian. Sebabnya bukan setelan kernel:
`kernel.unprivileged_userns_clone` sudah bernilai 1, tetapi paket
`chrome-headless-shell` tidak membawa biner pendamping `chrome-sandbox`
ber-SUID, sehingga Chromium tidak punya sandbox untuk dipakai sama sekali dan
mati dengan `FATAL: No usable sandbox!`. Alasan lengkapnya ada di komentar
kodenya.

**Membuktikannya tanpa membuka aplikasi** — halaman ini publik dan memakai
jalur Browsershot yang sama dengan seluruh Form Cetak:

```bash
curl -s -o /tmp/uji.pdf -w '%{http_code}\n' https://<domain>/panduan-publik/pdf
file /tmp/uji.pdf     # harus "PDF document", bukan "HTML document"
```

Kalau masih gagal, baca `storage/logs/laravel.log` dan cari baris
`Error Output:` — pesan Chromium yang sebenarnya ada di situ, beberapa baris
sesudahnya, bukan di pesan pengecualian Laravel. Kalau `node` tidak ketemu
oleh PHP (PATH milik PHP-FPM berbeda dari PATH shell), isi
`BROWSERSHOT_NODE_BINARY` di `.env` dengan path lengkap `node`.

### A8. Nginx dan HTTPS

Bagian ini tadinya tidak ada di checklist sama sekali, padahal surat
Diskominsa menegaskan pemasangan sertifikat SSL sebagai tanggung jawab
Inspektorat — bukan layanan yang mereka sediakan.

Berkas `server` Nginx: docroot `public/`, dan **soket PHP-FPM harus cocok
dengan versi PHP yang benar-benar terpasang** (`php8.4-fpm.sock`, bukan 8.3 —
lihat A2). Baris-baris berikut mudah terlewat dan semuanya punya akibat nyata:

```nginx
client_max_body_size 100M;   # unggahan bukti dukung & video
fastcgi_read_timeout 300;    # cetak PDF bisa 30-60 detik; jangan diputus

fastcgi_buffer_size 32k;     # header balasan; bawaan 4k TIDAK cukup
fastcgi_buffers 16 16k;
fastcgi_busy_buffers_size 32k;
```

> **Jebakan penyangga header.** Bawaan nginx cuma 4k, dan **seluruh header
> balasan harus muat di satu penyangga itu**. Kalau lewat, nginx memutus dengan
> **502 Bad Gateway** dan menulis `upstream sent too big header` di
> `/var/log/nginx/error.log` — sementara PHP-FPM tetap hidup dan **log Laravel
> bersih tanpa satu pun galat**. Gejalanya karena itu menyesatkan: halaman lain
> normal, dan tidak ada apa pun di sisi aplikasi yang bisa disalahkan. Terjadi
> di produksi 10 September 2026 pada `/iro_pd?highlight_id=72`.
>
> Kalau 502 muncul, periksa log nginx dulu — bukan log Laravel:
>
> ```bash
> tail -20 /var/log/nginx/error.log | grep -i "too big header"
> ```

> **Jebakan kedua: batas unggah PHP, bukan nginx.** `client_max_body_size 100M`
> di nginx TIDAK ada gunanya kalau PHP masih memakai bawaannya
> (`upload_max_filesize = 2M`, `post_max_size = 8M`). Yang terjadi: berkas di
> atas 2 MB ditolak PHP sebelum Laravel sempat melihatnya, dan kalau seluruh
> kiriman melewati `post_max_size`, **badan permintaan datang KOSONG** — validasi
> lalu mengeluh "kolom wajib diisi" pada kolom yang jelas-jelas sudah diisi
> pengguna. Gejalanya menyesatkan sepenuhnya.
>
> Terbukti di produksi 11 September 2026: aplikasi menjanjikan 10 MB per berkas
> (Bukti Dukung Risiko dan bukti Lapor Kecurangan), sementara PHP diam-diam
> memotongnya di 2 MB sejak pemasangan.
>
> Setel di `/etc/php/8.4/fpm/php.ini`, lalu **restart** (bukan reload):
>
> ```ini
> upload_max_filesize = 10M   ; sama dengan yang divalidasi aplikasi (max:10240)
> post_max_size = 60M         ; lima berkas sekaligus plus isian formulirnya
> max_file_uploads = 30
> ```
>
> ```bash
> systemctl restart php8.4-fpm
> php -c /etc/php/8.4/fpm/php.ini -i | grep -E "^upload_max_filesize|^post_max_size"
> ```
>
> Baris kedua itu penting: `php -i` biasa membaca ini CLI, **bukan** ini yang
> dipakai FPM — memeriksanya lewat situ akan menyesatkan.

Uji dulu, baru terapkan — `nginx -t` harus menjawab `test is successful`
sebelum `systemctl reload nginx`.

**HTTPS baru bisa dipasang setelah DNS benar-benar menjawab.** Ini titik
berhenti wajib; certbot pasti gagal kalau dilewati:

```bash
nslookup <domain>          # harus menjawab IP publik server
certbot --nginx -d <domain> --agree-tos --redirect
certbot renew --dry-run    # harus "all simulated renewals succeeded"
systemctl is-active certbot.timer
```

`--redirect` yang membuat HTTP dialihkan ke HTTPS. Perpanjangan berjalan
sendiri lewat `certbot.timer`; yang perlu dipastikan hanyalah timer itu aktif.

**Proksi tepercaya tidak perlu diubah.** Aplikasi hanya mempercayai
`127.0.0.1`/`::1` (`bootstrap/app.php`), dan itu memang tepat selama Nginx
berjalan di mesin yang sama serta meneruskan ke PHP-FPM lokal.

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

**Menandai versi dilakukan lewat halaman Backup, bukan `git tag` di terminal.**
Tiap versi terdiri atas dua hal yang tidak boleh terpisah: tag git dan salinan
basis data pada saat tag itu dibuat. Tag tanpa snapshot tidak bisa dimundurkan
dengan aman — kode lama akan memanggil kolom yang belum dikenalnya, dan
aplikasi gagal terbuka tanpa petunjuk. Caranya di
[VERSI_DAN_SNAPSHOT.md](VERSI_DAN_SNAPSHOT.md).

---

## C. Tujuh pemeriksaan sesudah deploy

Lakukan berurutan; masing-masing membuktikan satu hal yang berbeda.

| # | Yang dibuka | Yang harus terjadi | Kalau gagal, artinya |
|---|---|---|---|
| 1 | `/up` | Balasan 200 | Aplikasi tidak boot — cek `storage/logs/laravel.log` |
| 2 | Menu **Backup** | **Tidak ada** pita kuning | Penjadwal belum dipanggil cron (A6) |
| 3 | `/login/cee-survey` dan `/login/lapor-kejadian` | Langsung masuk ke formulir | Sandi di `.env` tidak cocok dengan yang di basis data (A3) |
| 4 | Form Cetak mana saja → **Unduh PDF** | Berkas PDF turun | Node/Chromium belum siap (A7) |
| 5 | Menu **Panduan** | Video edukasi bisa diputar | Berkas LFS belum ditarik (A1) |
| 6 | Form Input mana saja → kotak **Skala Dampak** | Kriteria 1–5 muncul, bukan daftar kosong | Data referensi Risiko belum terisi (A4) |
| 7 | **Miscellaneous → PKPT Berbasis Risiko → Ikhtisar dan Periode** | Halaman terbuka, ada tombol **Periode baru** | Kedua seeder PKPT belum dijalankan (A5) — menunya tidak muncul dan `/pkpt/*` menjawab 403, termasuk untuk Super Admin |

**Lima dari tujuh bisa dibuktikan dari terminal**, tanpa menunggu seseorang
membuka peramban dan masuk — berguna ketika domain belum aktif, atau ketika
yang memasang bukan yang punya akun:

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://<domain>/up            # 1
php artisan tinker --execute="echo (time()-\Cache::get('penjadwal_detak_terakhir')).' detik'"   # 2
curl -s -o /dev/null -w '%{redirect_url}\n' https://<domain>/login/cee-survey        # 3
curl -s -o /tmp/u.pdf -w '%{http_code}\n' https://<domain>/panduan-publik/pdf        # 4
curl -sI https://<domain>/video/video-edukasi-mr-kabar-720p.mp4 | head -1            # 5
```

Nomor 3 harus mengalihkan ke `/cee/1a` (dan `/lapor-kejadian` untuk yang satu
lagi) — kalau ia balik ke `/login`, sandi di `.env` tidak cocok dengan yang di
basis data. Nomor 5 harus menyebut ukuran ratusan MB; kalau hanya beberapa KB,
berkas LFS belum tertarik.

Satu hal yang **bukan** kegagalan: widget **Jadwal Penilaian Risiko** pada
Dasbor tampil kosong sampai Arahan dan Kebijakan Penilaian Risiko tahun
berjalan direkam di Keterangan Pendukung. Isinya berasal dari Surat Edaran
Bupati, dan aplikasi sengaja tidak mengarang tenggat yang tidak pernah
diperintahkan siapa pun.

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

---

## E. Menjalankan pengujian

Pengujian **tidak** dijalankan di server produksi. Bagian ini untuk mesin
pengembang atau mesin integrasi.

Pengujian memakai MySQL, bukan SQLite dalam memori. Alasannya: sebagian
migrasi memakai pernyataan mentah `ALTER TABLE ... CHANGE`, `... AFTER`, dan
indeks berprefiks panjang yang tidak dikenal SQLite, sehingga rangkaian
migrasi berhenti sebelum satu pun pengujian berjalan. Menguji di mesin basis
data yang sama dengan produksi juga membuat hasilnya berarti.

Basis datanya **terpisah** dari basis data kerja dan dikosongkan ulang setiap
kali pengujian dijalankan. Buat sekali saja:

```sql
CREATE DATABASE mrkabar_testing
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Lalu:

```bash
php artisan test
```

Nama basis datanya sudah tertulis di `phpunit.xml`, tidak perlu diubah.
Basis data kerja (`mrkabar`) tidak pernah disentuh pengujian.

Kalau langkah `CREATE DATABASE` di atas terlewat, `php artisan test` gagal
dengan pesan `SQLSTATE[HY000] [1049] Unknown database 'mrkabar_testing'`.
Pesan itu berarti basis datanya belum dibuat, bukan tanda ada yang rusak pada
aplikasi.
