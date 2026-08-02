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
memundurkan kode.

**v1.0.3 juga kehilangan snapshot-nya.** Snapshot itu sempat direkam, lalu
terhapus oleh pembersihan berkas pengujian yang keliru menghapus seluruh folder
`versi/`, bukan hanya berkas buatannya sendiri. Kekeliruan itu sudah diperbaiki
(lihat `tests/Feature/VersiSnapshotTest.php`), tetapi berkasnya tidak dapat
dipulihkan.

Untungnya rollback ke v1.0.3 tetap aman dijalankan: ketujuh migrasi antara
v1.0.3 dan v1.0.4 seluruhnya **menambah** tabel dan kolom, tidak mengubah atau
menghapus apa pun yang sudah ada. Kode v1.0.3 mengabaikan tabel dan kolom yang
tidak dikenalnya. Aplikasi tetap akan memperingatkan bahwa jumlah migrasinya
tidak sepadan — peringatan itu benar, dan pada pasangan ini tidak berbahaya.

Snapshot yang benar-benar berpasangan dimulai dari **v1.0.4**.

## Riwayat versi

| Versi | Isi |
|---|---|
| v1.0.0 – v1.0.2 | sebelum fitur snapshot ada, tanpa snapshot database |
| v1.0.3 | alur usulan-persetujuan Program Bupati, perbaikan pendaratan QR, pemindahan `env()` ke `config()`, migrasi dua tabel warisan, berkas pengujian otomatis, dan pemasangan versi dengan snapshot database |
| v1.0.4 | seluruh prasyarat A pada `docs/REVISI_APLIKASI.md`: Selera Risiko sebagai data (A12), celah pengendalian berkriteria Perdep (A2), pertentangan dua sumber simpulan CEE (A9), penanda duplikasi RTP (A3), uji coba pengendalian (A4), Arahan Penilaian Risiko (A11), widget jadwal Dasbor (A1), struktur pengelola Risiko (A5), dan laporan pembinaan Komite (A6) |
| v1.0.5 | satu set penuh data Tahun Penilaian 2025 dari CEE sampai pelaporan, keterangan bantuan untuk fitur baru, dan Panduan yang menyusul |
| v1.0.6 | keputusan B2 tentang nama peran, bagan struktur pengelolaan Risiko mengikuti Gambar 2.6 Perdep, dan struktur pengelola direkam sebagai tim berketua-koordinator-anggota |
| v1.0.7 | video edukasi v4 (30 menit), jadwal penilaian sebagai garis waktu berskala tanggal, konektor bagan struktur yang tidak lagi terputus, dan data referensi Risiko yang ikut di-seed pada pemasangan baru |
| v1.0.8 | kuis uji pemahaman menyimpan jawabannya berikut rekap per soal untuk Admin, Formulir 15 Perbup disamakan dengan Form Cetak 1c, revisi batang tubuh Perbup 55 menjadi 63 Pasal, uji kesesuaian aplikasi terhadap Perdep, dan daftar usulan urusan pada Data Umum |
| v1.0.9 | selingan dibuang dari video sehingga durasinya 28 menit 45 detik, empat isian Perbup untuk Bagian Hukum dicetak merah, versi aplikasi tampil di kaki halaman masuk, dan seluruh rujukan menit ikut disesuaikan |
| v1.0.10 | video tutorial pengisian 45 menit 35 detik di kaki halaman Panduan: rekaman aplikasi sungguhan dari Data Umum sampai laporan, narasi dua suara, musik dari instrumen tersampel, dan dua model terhapus-lunak yang sebelumnya tidak pernah bisa dipulihkan |
