# Autentikasi Dua Faktor

Lapisan kedua saat masuk untuk akun berakses tertinggi: selain kata sandi,
diminta enam angka yang berubah tiap 30 detik dari aplikasi pengotentikasi di
ponsel (Google Authenticator, Authy, atau yang sejenis).

## Siapa yang wajib

Peran `super-admin` dan `admin`. Daftarnya ada di
[`config/mrkabar.php`](../config/mrkabar.php) pada `dua_faktor.peran_wajib`.

Sengaja **tidak** dapat diatur lewat `.env`: kalau daftarnya bisa ditentukan
dari berkas lingkungan, satu salah ketik di server sungguhan akan mematikan
lapisan kedua tanpa suara.

Peran lain — PIC perangkat daerah, akun bersama LAPOR dan CEE_Survey — tidak
terkena. Mereka boleh memasangnya sendiri kalau mau, dan boleh mencabutnya
sendiri; yang wajib tidak boleh mencabut sendiri.

## Kenapa TOTP, bukan SMS

Tidak ada yang dikirim ke ponsel. Tak ada pulsa, tak ada jaringan, tak ada
nomor yang bisa dibajak lewat penggantian kartu. Ponsel dalam mode pesawat
pun tetap menghasilkan kode yang benar, karena satu-satunya bahan yang
dibutuhkan adalah kunci rahasia dan jam.

## Cara memasang

Halaman **Pengaturan Profil** (`/settings/profile`), bagian *Autentikasi Dua
Faktor*. Akun berperan wajib yang belum memasangnya akan dipantulkan ke sana
setiap kali mencoba membuka menu lain.

1. Tekan **Aktifkan** — kode QR muncul. Kuncinya **belum** tersimpan di
   server pada tahap ini.
2. Pindai QR-nya dengan aplikasi pengotentikasi. Kalau kamera bermasalah,
   kunci teksnya tercetak di sebelah QR dan bisa diketik manual.
3. Ketik enam angka yang muncul, tekan **Sahkan dan aktifkan**.
4. **Sepuluh kode pemulihan ditampilkan. Cetak atau catat sekarang.**

Langkah 4 bukan formalitas — baca bagian berikutnya.

## Kode pemulihan

Sepuluh kode sekali pakai, ditampilkan **satu kali** tepat sesudah pemasangan.
Sesudah itu ia tersimpan terenkripsi dan tidak ada jalan menampilkannya lagi
selain membuat yang baru, yang menghanguskan seluruh kode lama.

Simpan **terpisah dari ponsel**. Lembar kode yang terselip di sarung ponsel
yang sama tidak menolong apa pun saat ponselnya tertinggal di angkutan umum.

Tiap kode hangus begitu dipakai. Sisanya terlihat di halaman Pengaturan
Profil; kalau tinggal dua, buat yang baru.

## Kalau ponsel DAN kode pemulihannya hilang

Jalan keluar terakhir, dijalankan dari baris perintah **di mesin server**:

```bash
php artisan duafaktor:matikan <username>
php artisan duafaktor:matikan memet --paksa   # tanpa bertanya konfirmasi
```

Sesudah itu akunnya bisa masuk dengan sandi saja. **Segera pasang kembali**
begitu pemiliknya punya ponsel pengganti.

### Kenapa perintah ini tidak melemahkan apa pun

Super Admin di aplikasi ini cuma satu, dan tidak ada siapa pun di atasnya yang
bisa membukakan. Tanpa perintah ini, ponsel yang hilang berarti akun yang
hilang selamanya — beserta seluruh data kabupaten di belakangnya.

Dan ia hanya bisa dijalankan dari mesin server. Siapa pun yang sampai ke sana
sudah bisa membaca basis datanya langsung, mengganti sandi lewat tinker, atau
menyalin seluruh isinya. Lapisan kedua tidak pernah dimaksudkan menahan orang
yang sudah memegang mesinnya.

Setiap pemakaiannya dicatat ke `storage/logs/laravel.log` dengan tingkat
`WARNING`, lengkap dengan username dan perannya.

## Yang perlu diketahui pengelola server

- **Kunci dan kode pemulihan dienkripsi** dengan `APP_KEY`. Snapshot database
  disalin ke OneDrive tiap hari, jadi ia berpindah ke tempat yang tidak
  sepenuhnya kita kuasai; kalau dumpnya bocor, yang terbaca cuma teks acak.
- **Karena itu `APP_KEY` tidak boleh berganti.** Mengganti `APP_KEY` membuat
  seluruh kunci 2FA yang tersimpan tidak dapat dibaca lagi, dan tiap akun yang
  memakainya harus dibuka lewat `duafaktor:matikan` lalu dipasang ulang.
- **Jam server harus benar.** Toleransinya 90 detik (satu periode sebelum dan
  sesudah). Jam yang meleset lebih dari itu membuat semua kode ditolak, dan
  gejalanya persis seperti "2FA-nya rusak".
- Percobaan dibatasi **5 kali per akun per alamat IP**, ditahan 5 menit.

## Berkas terkait

| Berkas | Isinya |
|---|---|
| [`app/Services/DuaFaktorService.php`](../app/Services/DuaFaktorService.php) | pembuatan kunci, pemeriksaan kode, kode pemulihan |
| [`app/Http/Middleware/WajibDuaFaktor.php`](../app/Http/Middleware/WajibDuaFaktor.php) | penjaga global: menahan sampai tahap kedua terlampaui |
| [`app/Http/Controllers/Auth/DuaFaktorTantanganController.php`](../app/Http/Controllers/Auth/DuaFaktorTantanganController.php) | layar tantangan saat masuk |
| [`app/Http/Controllers/Settings/DuaFaktorController.php`](../app/Http/Controllers/Settings/DuaFaktorController.php) | pemasangan dan pencabutan dari Pengaturan Profil |
| [`app/Console/Commands/MatikanDuaFaktor.php`](../app/Console/Commands/MatikanDuaFaktor.php) | jalan keluar lewat baris perintah |
| [`tests/Feature/DuaFaktorTest.php`](../tests/Feature/DuaFaktorTest.php) | 15 uji penjaga |
