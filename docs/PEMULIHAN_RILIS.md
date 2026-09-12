# Pemulihan Rilis — mengembalikan server ketika pemasangan versi baru bermasalah

Dokumen ini menjawab satu keadaan: **versi baru sudah dipasang di server, dan
ternyata bermasalah.** Bukan soal cadangan rutin (itu di
[CHECKLIST_GO_LIVE.md](CHECKLIST_GO_LIVE.md) A6b), bukan soal penandaan versi
di mesin pengembang (itu di [VERSI_DAN_SNAPSHOT.md](VERSI_DAN_SNAPSHOT.md)).

Ditulis karena sejak go-live, tiap `git pull` di server menyentuh sistem yang
dipakai 49 Perangkat Daerah. Sebelum ini prosedurnya hanya ada untuk laptop.

---

## 0. Satu keputusan sebelum menyentuh apa pun

**Mundur, atau perbaiki maju?** Mundur itu murah kalau migrasinya belum
berubah, dan mahal kalau sudah. Periksa dulu:

```bash
cd /var/www/mrkabar
git log --oneline -5              # versi apa yang sekarang, dan sebelumnya apa
git diff --name-only HEAD~1 HEAD -- database/migrations/
```

- **Tidak ada berkas migrasi** yang berubah → pakai **Cara A**. Cepat, aman,
  data tidak disentuh sama sekali.
- **Ada migrasi baru** → pakai **Cara B** atau **Cara C**. Lebih berat, dan
  keputusannya bukan teknis semata — lihat bagian 4.

---

## 1. Nyalakan mode pemeliharaan lebih dulu

Selalu, apa pun caranya. Tanpa ini, pengguna bisa menyimpan data ke aplikasi
yang setengah dikembalikan.

```bash
cd /var/www/mrkabar
php artisan down --secret="pemulihan-sekarang"
```

`--secret` memberi Anda jalan masuk sendiri untuk memeriksa hasilnya selagi
orang lain melihat halaman pemeliharaan: buka
`https://mrkabar.acehbaratkab.go.id/pemulihan-sekarang` sekali, lalu situsnya
terbuka normal **hanya untuk peramban Anda**.

Menyalakannya kembali di akhir:

```bash
php artisan up
```

> **Jangan memastikan mode pemeliharaan lewat `/up`.** Rute itu adalah
> pemeriksa kesehatan bawaan Laravel, dan **sengaja dikecualikan** dari mode
> pemeliharaan supaya pemantau tetap bisa menjangkaunya. `/up` menjawab `200`
> baik saat situs sedang dipelihara maupun tidak — memakainya sebagai bukti
> akan membuat Anda menyimpulkan `php artisan down` tidak bekerja, lalu
> melanjutkan pemulihan dengan pengguna masih bisa masuk. Pakai halaman biasa:
>
> ```bash
> curl -s -o /dev/null -w '%{http_code}\n' https://mrkabar.acehbaratkab.go.id/login
> ```
>
> `503` berarti pemeliharaan menyala. Diuji di server produksi 10 September
> 2026: `/login` 200 → **503** → 200, sementara `/up` tetap 200 sepanjang uji.

---

## 2. Cara A — mundur kode saja (migrasi tidak berubah)

Yang paling sering dipakai, dan yang paling ringan. Data tidak disentuh.

```bash
cd /var/www/mrkabar
git log --oneline -5                 # catat commit tujuan
git reset --hard <commit-tujuan>
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php artisan optimize
systemctl reload php8.4-fpm
php artisan up
```

`npm run build` **wajib** meski hanya kode PHP yang mundur — sebagian nilai
(mis. `VITE_APP_NAME`) ditanam ke dalam bundel saat build, sehingga bundel
lama dan `.env` sekarang bisa tidak sejalan.

---

## 3. Cara B — mundur kode DAN membatalkan migrasi

Dipakai kalau rilis yang bermasalah menambah migrasi, dan migrasi itu
**hanya menambah** sesuatu yang bisa dibuang tanpa kehilangan data pengguna
(kolom baru yang belum diisi, tabel baru yang belum dipakai).

```bash
php artisan down --secret="pemulihan-sekarang"
php artisan migrate:rollback --step=1 --force
git reset --hard <commit-tujuan>
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php artisan optimize
systemctl reload php8.4-fpm
php artisan up
```

> **PERIKSA DULU APA YANG AKAN DIBATALKAN.** Di server ini **tiap migrasi
> menempati batch-nya sendiri** — warisan dari riwayat mesin pengembang yang
> ikut terbawa saat basis data dipindahkan. Karena itu `migrate:rollback`
> tanpa `--step` membatalkan **satu** migrasi, yaitu batch tertinggi. Per 10
> September 2026 batch tertinggi (87) adalah
> `buat_tabel_pkpt_berbasis_risiko` — membatalkannya berarti **MENGHAPUS
> empat belas tabel PKPT berikut isinya.**
>
> Lihat dulu, jangan menebak:
>
> ```bash
> mysql -u mrkabar -p -e "SELECT batch, migration FROM mrkabar.migrations ORDER BY batch DESC LIMIT 3;"
> ```

Kalau migrasinya **mengubah atau menghapus** data yang sudah diisi pengguna,
jangan pakai cara ini. `down()` sebuah migrasi mengembalikan *bentuk* tabel,
bukan isinya. Pakai Cara C.

---

## 4. Cara C — pulihkan basis data dari cadangan

Cara terberat, dan satu-satunya yang benar ketika data sudah rusak atau
migrasinya merusak isi. **Harganya nyata: seluruh perubahan yang dibuat
pengguna sejak cadangan itu diambil akan hilang.**

Cadangan berjalan tiap hari pukul 01:00 WIB (cron root, di dalam VM) dan
01:30 WIB (ke Google Drive yang tertaut di halaman Backup), jadi kerugian
terburuknya adalah pekerjaan satu hari. Timbang itu sebelum melangkah.

**Sejak 12 September 2026 semua cadangan terkunci AES-256** dengan SATU kunci:
`/etc/mrkabar/kunci-cadangan` (root, 600) = `BACKUP_ARCHIVE_PASSWORD` di
`.env`. Salinan kuncinya di luar VM ada di `OneDrive\Desktop\MR Kabar\Cadangan\KUNCI-CADANGAN.txt`
di laptop pengelola. Tanpa kunci itu tidak satu pun cadangan bisa dibuka —
kunci lebih penting daripada cadangannya.

```bash
php artisan down --secret="pemulihan-sekarang"

# 1. Amankan keadaan sekarang dulu — sebelum ditimpa, apa pun alasannya
/usr/local/bin/backup-mrkabar.sh

# 2. Pilih cadangan tujuan
ls -lh /var/backups/mrkabar/db-*.sql.gz.enc

# 3. Buka kuncinya, lalu pulihkan (kredensial MySQL di /etc/mrkabar/mysql-cadangan.cnf)
openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass file:/etc/mrkabar/kunci-cadangan   -in /var/backups/mrkabar/db-<TANGGAL>.sql.gz.enc | gunzip   | mysql --defaults-extra-file=/etc/mrkabar/mysql-cadangan.cnf mrkabar

# 3b. Alternatif tanpa baris perintah: halaman Backup → "Cadangan di Google
#     Drive" → Pulihkan (ketik TIMPA); atau unduh zip dari Drive lalu Import.
#     Zip dari halaman Backup dibuka dengan sandi yang sama (aplikasi
#     melakukannya sendiri bila BACKUP_ARCHIVE_PASSWORD terisi).

# 4. Kembalikan kode ke versi yang sejalan dengan cadangan itu
git reset --hard <commit-tujuan>
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php artisan optimize
systemctl reload php8.4-fpm
php artisan up
```

**Kode dan basis data harus sejalan.** Cadangan basis data tanggal tertentu
cocok dengan kode yang berjalan pada tanggal itu — memulihkan basis data lama
sambil membiarkan kode baru berarti kode memanggil kolom yang belum ada.
Gejalanya galat 500 yang tidak menyebut soal versi sama sekali.

---

## 5. Berkas unggahan, kalau ikut rusak

Basis data dan berkas dicadangkan terpisah. Memulihkan basis data saja
membuat baris `media` menunjuk berkas yang tidak ada.

```bash
BUKA="openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass file:/etc/mrkabar/kunci-cadangan"
$BUKA -in /var/backups/mrkabar/berkas-<TANGGAL>.tar.gz.enc | tar tzf - | head   # lihat isinya dulu
$BUKA -in /var/backups/mrkabar/berkas-<TANGGAL>.tar.gz.enc | tar xzf - -C /var/www/mrkabar
chown -R www-data:www-data /var/www/mrkabar/storage
```

---

## 6. Buktikan pemulihannya berhasil

Jangan menyatakan selesai karena perintahnya tidak menampilkan galat.

```bash
# 1. Aplikasi hidup
curl -s -o /dev/null -w '%{http_code}\n' https://mrkabar.acehbaratkab.go.id/up

# 2. Versi kode memang yang dituju
cd /var/www/mrkabar && git log --oneline -1

# 3. Basis data terisi, bukan kosong
php artisan tinker --execute="
echo 'pengguna: '.\App\Models\User::count().PHP_EOL;
echo 'OPD: '.\Illuminate\Support\Facades\DB::table('opd')->count().PHP_EOL;
echo 'IRS PD: '.\Illuminate\Support\Facades\DB::table('tbl_irs_pd')->count().PHP_EOL;
"

# 4. Migrasi sejalan dengan kode
php artisan migrate:status | tail -3
```

> **Cadangan yang diambil sebelum 11 September 2026 berisi cap waktu UTC.**
> Sejak tanggal itu aplikasi berjalan pada Asia/Jakarta, dan sebuah migrasi
> menggeser seluruh kolom datetime +7 jam. Memulihkan cadangan LAMA ke kode
> BARU karena itu membuat setiap cap waktu tertinggal tujuh jam — tidak ada
> galat, hanya riwayat yang meleset. Kalau itu terjadi, jalankan ulang
> migrasinya saja:
>
> ```bash
> php artisan migrate:refresh --path=database/migrations/2026_09_11_000000_pindahkan_zona_waktu_ke_asia_jakarta.php --force
> ```
>
> Periksa dulu satu baris rujukan sebelum dan sesudah, jangan menebak.

Angka rujukan per 10 September 2026: **56 pengguna, 49 OPD, 95 baris IRS PD**.
Kalau jauh berbeda tanpa alasan yang Anda ketahui, berhenti dan periksa lagi
sebelum `php artisan up`.

Terakhir, buka halamannya sendiri di peramban dan masuk. Balasan `200` dari
`/up` hanya membuktikan aplikasinya boot — bukan bahwa orang bisa memakainya.

---

## 7. Sesudah tenang

Catat apa yang terjadi: versi mana yang bermasalah, gejalanya apa, cara mana
yang dipakai, dan berapa data yang hilang kalau ada. Tanpa catatan itu,
rilis berikutnya mengulangi sebabnya.

Dan jangan biarkan versi bermasalah tetap berada di `main` GitHub — kalau
sebabnya ada di kode, perbaikannya harus di-push juga, atau pemasangan
berikutnya akan menariknya kembali.

## Rotasi kunci cadangan (setahun sekali)

Kartu Kesehatan Server memberi tanda "perhatian" bila kunci lebih tua dari 400
hari. Urutannya, di VM sebagai root:

```bash
# 1. Kunci baru
openssl rand -base64 32 > /etc/mrkabar/kunci-cadangan.baru && chmod 600 /etc/mrkabar/kunci-cadangan.baru
# 2. Ganti BACKUP_ARCHIVE_PASSWORD di /var/www/mrkabar/.env dengan isi kunci baru, lalu:
cd /var/www/mrkabar && php artisan optimize
# 3. Berlakukan untuk cron
mv /etc/mrkabar/kunci-cadangan /etc/mrkabar/kunci-cadangan.lama && mv /etc/mrkabar/kunci-cadangan.baru /etc/mrkabar/kunci-cadangan
# 4. Buat cadangan baru dengan kunci baru dan uji
/usr/local/bin/backup-mrkabar.sh && php artisan cadangan:uji-pulih
```

Cadangan lama tetap terbuka dengan kunci lama — simpan `kunci-cadangan.lama`
dan salinannya di luar VM (KUNCI-CADANGAN.txt, beri tanggal) sampai seluruh
cadangan lama (14 hari cron, Drive) sudah tergantikan. Ganti juga kunci di
`.env` lokal supaya zip lokal dan produksi memakai kunci yang sama.
