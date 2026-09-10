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

Cadangan berjalan tiap hari pukul 01:00, jadi kerugian terburuknya adalah
pekerjaan satu hari. Timbang itu sebelum melangkah.

```bash
php artisan down --secret="pemulihan-sekarang"

# 1. Amankan keadaan sekarang dulu — sebelum ditimpa, apa pun alasannya
/usr/local/bin/backup-mrkabar.sh

# 2. Pilih cadangan tujuan
ls -lh /var/backups/mrkabar/db-*.sql.gz

# 3. Pulihkan
zcat /var/backups/mrkabar/db-<TANGGAL>.sql.gz | mysql -u mrkabar -p mrkabar

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
tar tzf /var/backups/mrkabar/berkas-<TANGGAL>.tar.gz | head     # lihat isinya dulu
tar xzf /var/backups/mrkabar/berkas-<TANGGAL>.tar.gz -C /var/www/mrkabar
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
