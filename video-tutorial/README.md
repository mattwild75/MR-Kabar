# Video Tutorial Pengisian MR Kabar

Video yang menunjukkan satu perangkat daerah mengisi satu tahun penuh, dari
Data Umum sampai formulir cetak siap ditandatangani. Terpasang di **kaki
halaman `/panduan`**, di bawah seluruh bagian panduan.

Bedanya dengan video edukasi di `video-edukasi/v3/`: yang itu animasi yang
menjelaskan **konsepnya**, yang ini rekaman aplikasi sungguhan yang
menunjukkan **cara mengisinya**.

## Cara kerjanya, dan mengapa begitu

**Narasi disuarakan lebih dulu, gambarnya direkam belakangan.** Ini kebalikan
dari cara yang biasa, dan sengaja. Kalau gambarnya duluan, narasi harus
dipaksa muat ke dalam durasi yang sudah terlanjur ada, dan hasilnya selalu
terasa terburu. Dengan urutan ini, pengendali peramban justru **menahan** tiap
langkah sampai kalimatnya habis — sehingga gambar dan suara sudah sejajar
sejak direkam dan tidak ada satu pun yang perlu digeser saat menyunting.

**Kursornya digambar sendiri.** Perekam layar peramban hanya memotret isi
halaman; penunjuk tetikus milik sistem operasi tidak ikut terekam. Jadi
`lapisan.js` menggambar kursor sebagai elemen HTML dan menggerakkannya ke
koordinat yang sama dengan tetikus sungguhan.

**Zoom dikerjakan saat merekam, bukan saat menyunting.** Kalau gambarnya
dipotong dan diperbesar belakangan, yang diperbesar piksel yang sudah
terlanjur direkam dan hurufnya kabur. Di sini halamannya sendiri yang
diperbesar lewat `transform`, sehingga peramban menggambar ulang teksnya pada
ukuran yang lebih besar dan hasilnya tetap tajam.

**Musiknya dari rekaman instrumen, bukan sintesis.** Nada ditulis sebagai MIDI
lalu dibunyikan FluidSynth memakai soundfont MuseScore General — pustaka berisi
contoh bunyi yang direkam dari piano, gitar, dawai, dan bas sungguhan. Perlu
jujur disebut: ini rekaman instrumen yang **dimainkan ulang**, bukan sesi
rekaman musisi; frasa dan dinamikanya tetap ditulis di `musik.py`.

## Urutan build

```bash
php    akun.php pasang           # pinjam akun perekam dengan sandi acak
python suara.py                  # 276 kalimat -> audio/*.mp3 + waktu.json
node   pengendali.cjs --uji --bagian II   # uji satu bagian tanpa merekam
powershell -File rekam.ps1       # rekam kesepuluh bagian (~1 jam)
powershell -File rekam.ps1 -Mulai V       # atau lanjutkan dari bagian tertentu
python rakit.py                  # sambung gambar, susun narasi, subtitle, bab
python musik.py --dari-waktu     # musik sepanjang video
bash   campur.sh                 # campur audio + mux + berkas 720p
bash   pasang.sh                 # pasang ke public/video + build ulang bundel
php    bersihkan.php hapus       # BUANG seluruh data 2026 hasil rekaman
php    akun.php pulihkan         # kembalikan sandi asli akun perekam
```

Dua langkah terakhir **wajib**. Data yang dibuat saat merekam adalah data
contoh dan tidak boleh tertinggal; sandi akun PIC yang dipinjam harus
dikembalikan persis seperti semula.

## Berkas dan tugasnya

| Berkas | Tugas |
|---|---|
| `naskah.json` | seluruh isi: bagian, langkah, aksi, dan kalimat narasinya |
| `naskah-langkah.md` | rancangan yang disetujui pemilik aplikasi sebelum dibangun |
| `suara.py` | menyuarakan narasi (dua suara berganti) dan mengukur durasinya |
| `lapisan.js` | kursor, riak klik, cincin sorotan, papan judul, gulir, zoom |
| `gerak.cjs` | gerak manusiawi: lintasan Bezier, ketikan berjeda, salah ketik |
| `pengendali.cjs` | menyetir aplikasi mengikuti naskah sambil merekam |
| `intip.cjs`, `intip_form.cjs` | pemetaan struktur halaman saat menyusun naskah |
| `midi.py`, `musik.py` | menulis nada dan membunyikannya lewat instrumen tersampel |
| `rakit.py` | garis waktu mutlak, jalur narasi, subtitle, daftar bab, sambung video |
| `campur.sh` | campur narasi + musik berperedam otomatis, mux, buat 720p |
| `pasang.sh` | pasang ke `public/video` dan `resources/js/data`, bangun ulang bundel |
| `akun.php` | pinjam-kembalikan sandi akun perekam |
| `bersihkan.php` | buang data 2026 hasil rekaman, jaga data 2025 tak tersentuh |

## Yang perlu diketahui sebelum mengubah

- **Jalankan `--uji` dulu, jangan langsung merekam.** Satu selektor yang meleset
  di menit ke-40 berarti empat puluh menit rekaman terbuang.
- **`offsetParent` selalu null untuk elemen ber-`position: fixed`.** Seluruh
  dialog Radix begitu. Memakai `offsetParent` sebagai uji "terlihat" membuat
  dialognya dianggap tidak ada, pencarian tidak dipersempit ke dalamnya, dan
  klik bisa mendarat di menu bernama sama di belakangnya — formulir yang sedang
  diisi tertutup tanpa galat apa pun.
- **Formulir risiko punya penggulir sendiri di dalam dialog.** Menggulung
  jendela tidak menggerakkannya sedikit pun; `__bawaKeTengah` mencari wadah
  bergulir terdekat lebih dulu.
- **Sesudah masuk, aplikasi menutupi layar dengan video pembuka sampai 12
  detik.** Selama itu semua klik mendarat di lapisan tersebut. Aksi `splash`
  menunggunya pergi.
- **Nama menu harus dicocokkan PERSIS.** Mencari "Risiko" dengan cocok-sebagian
  justru mengenai "Apa itu Manajemen Risiko / MR Kabar" dan berpindah halaman.
- **Tandai tombol simpan dengan `"simpan": true`.** Pengendali lalu memeriksa
  pesan galat validasi sesudah mengklik. Tanpa itu, formulir yang gagal
  tersimpan tidak menimbulkan tanda apa pun dan barisnya baru ketahuan tidak
  ada berjam-jam kemudian.
- **`tbl_krs_pd` dan `tbl_kro_pd` tidak mengisi `created_at`.** Karena itu
  `bersihkan.php` memakai nomor baris tertinggi sebelum rekaman sebagai batas,
  bukan waktu pembuatan.
- **PowerShell 5.1 membaca `.ps1` sebagai ANSI**, jadi `rekam.ps1` ditulis
  tanpa huruf non-ASCII; dan `2>&1` pada program native membuat keluaran biasa
  dianggap galat.

## Isi videonya

Sepuluh bagian: sebelum mulai, Data Umum, CEE (1a-1d), Risiko Strategis Pemda,
Risiko Strategis PD, Risiko Operasional PD, monitoring dan evaluasi, form
cetak, laporan, penutup.

Bagian V.2 adalah intinya — satu risiko dikerjakan pelan dari kolom pertama
sampai skala target, setiap kolom dijelaskan alasannya, termasuk mengapa pada
skala target dampaknya tidak turun sementara kemungkinannya turun.
