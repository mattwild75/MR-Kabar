# Versi Aplikasi dan Snapshot Database

Setiap versi MR Kabar terdiri atas **dua hal yang tidak boleh terpisah**: tag git
yang menandai kodenya, dan satu salinan database pada saat tag itu dibuat.

Alasannya sederhana. Memundurkan kode sendirian tidak pernah aman —
`git reset --hard v1.0.3` mengembalikan berkas PHP dan TSX, tetapi database di
server tetap berisi skema hasil migrasi versi yang lebih baru. Kode lama lalu
memanggil kolom yang belum dikenalnya, atau kolom yang sudah dihapus. Aplikasi
gagal terbuka, dan penyebabnya tidak kelihatan dari pesan errornya.

## Di mana snapshot disimpan

```
storage/app/private/versi/
    manifest.json      catatan tiap versi
    v1.0.3.zip         dump database milik v1.0.3
    v1.0.4.zip         dump database milik v1.0.4
```

Folder `storage/app/private` seluruhnya diabaikan git (lihat `.gitignore` di
dalamnya), sehingga:

- snapshot **selalu tinggal di komputer/server tempat ia dibuat**;
- push ke GitHub tidak pernah membawa data Pemerintah Kabupaten Aceh Barat;
- siapa pun yang meng-clone repository ini mendapat aplikasi berdatabase kosong
  untuk diisi sendiri — dan memang begitu yang dikehendaki.

Folder ini **tidak pernah dipangkas otomatis**. Berbeda dengan folder backup
harian, yang selalu disisakan satu berkas terbaru saja oleh
`BackupController::keepOnlyLatestBackup()`. Snapshot versi justru berguna ketika
sudah lama, jadi tidak boleh ikut aturan itu — karena itulah ia disimpan di
folder tersendiri, bukan di folder backup harian.

## Membuat versi baru

Halaman **Backup → Versi Aplikasi & Snapshot Database**, khusus Super Admin.

Isi nomor versi (`v1.0.4`), catatan singkat, lalu tekan **Tandai Versi
Sekarang**. Satu tombol itu mengerjakan empat langkah berurutan:

1. `git add -A` dan `git commit` — perubahan yang belum tersimpan ikut masuk ke
   versi ini. "Nothing to commit" bukan kegagalan, artinya memang sudah bersih.
2. `git tag -a` — tag beranotasi, bukan tag ringan, supaya pembuat, waktu, dan
   catatannya tersimpan di dalam objek tag itu sendiri.
3. Dump database lewat `backup:run --only-db`, disalin ke `versi/<tag>.zip`, lalu
   dicatat di manifes berikut sidik jari SHA-256, keadaan migrasi, dan cacah
   baris tabel inti.
4. Bila dicentang, `git push --follow-tags` — kode dan tag naik ke GitHub;
   snapshot databasenya tidak.

**Kalau langkah 3 gagal, tag pada langkah 2 dihapus lagi.** Lebih baik tidak ada
versi sama sekali daripada ada versi yang mengaku punya cadangan padahal tidak.

Nomor versi yang sudah ada ditolak. Memindahkan tag yang sudah dipublikasikan
akan membuat salinan orang lain berisi kode berbeda dengan nama versi yang sama.

## Mundur ke versi lama

Ada dua jalan, dan keduanya meminta nama versi diketik ulang lebih dulu.

**Kode dan data sekaligus** — Backup → *Checkout Kode ke Versi Tag*. Pilih
versinya, centang "Pulihkan juga database ke snapshot versi ini", lalu jalankan.
Kode dan database mundur bersama di dalam satu kunci operasi, sehingga tidak ada
jeda ketika kode sudah versi lama tapi datanya masih versi baru.

Kalau centang itu dilepas, aplikasi membandingkan jumlah migrasi database
sekarang dengan yang tercatat pada versi tujuan, dan memperingatkan bila tidak
sepadan.

**Data saja** — Backup → *Versi Aplikasi*, tombol **Pulihkan Database** pada
baris versi yang dituju. Kode tidak ikut mundur.

**Manual** — tombol **Unduh** pada baris versi menghasilkan berkas `.zip` yang
formatnya sama dengan hasil "Create Backup", sehingga bisa dipulihkan kapan saja
lewat *Impor (Restore) Database*, atau disimpan di tempat lain.

Sebelum memulihkan, sidik jari berkas diperiksa terhadap catatan di manifes.
Berkas yang sudah berubah ditolak — memulihkan zip rusak akan menimpa database
yang masih baik dengan dump separuh jadi, dan itu tidak bisa dibatalkan.

## Jaring pengaman

Setiap aksi yang bisa merusak selalu didahului backup atas keadaan sekarang, dan
dibatalkan seluruhnya bila backup itu gagal:

| Aksi | Backup dulu | Yang berubah |
|---|---|---|
| Backup & Push ke GitHub | ya | kode di GitHub |
| Pull dari GitHub | ya | kode lokal |
| Checkout ke tag | ya | kode lokal, dan database bila dicentang |
| Pulihkan dari snapshot versi | ya | database |
| Impor berkas .zip | ya | database |
| Tandai Versi | — (justru menghasilkan snapshot) | commit, tag, snapshot |

Semuanya berbagi satu kunci `backup-operation-lock`, sehingga dua Super Admin
yang menekan tombol berbeda hampir bersamaan tidak bisa saling menimpa.

## Batas yang perlu diketahui

Tag **v1.0.0, v1.0.1, dan v1.0.2 tidak punya snapshot** dan tidak bisa
dibuatkan secara surut — datanya pada saat itu sudah tidak ada. Ketiganya tetap
muncul di daftar, ditandai "Tanpa snapshot", dan rollback ke sana hanya
memundurkan kode. Pemasangan berpasangan dimulai dari **v1.0.3**.

## Riwayat versi

| Versi | Isi |
|---|---|
| v1.0.0 – v1.0.2 | sebelum fitur snapshot ada, tanpa snapshot database |
| v1.0.3 | alur usulan-persetujuan Program Bupati, perbaikan pendaratan QR, pemindahan `env()` ke `config()`, migrasi dua tabel warisan, berkas pengujian otomatis, dan pemasangan versi dengan snapshot database |
