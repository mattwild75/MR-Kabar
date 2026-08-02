# Video Tutorial MR Kabar

Dua video rekaman aplikasi sungguhan, keduanya di **kaki halaman `/panduan`**
di bawah video edukasi:

| Video | Isi | Naskah |
|---|---|---|
| **Tutorial Pengisian** (52 menit, 11 bab) | satu perangkat daerah mengisi satu tahun penuh, dari Data Umum sampai laporan; bab X memperlihatkan cara pimpinan membaca datanya lewat akun peninjau | `naskah.json` |
| **Tutorial Lapor Kejadian Risiko** (13 menit, 6 bab) | dari sisi pelapor yang masuk lewat kode QR tanpa punya akun, dan sisi PIC yang menelaahnya sampai masuk Formulir 10 — dua kasus: risiko yang sudah terdaftar dan yang belum | `naskah-lapor.json` |

Bedanya dengan video edukasi di `video-edukasi/v3/`: yang itu animasi yang
menjelaskan **konsepnya**, kedua video ini rekaman aplikasi sungguhan yang
menunjukkan **cara memakainya**.

Perkakas di folder ini melayani keduanya. Naskahnya ditunjuk lewat `--naskah`,
dan tiap bagian menyebut sendiri akun mana yang dipakai merekamnya — video
Lapor berganti empat kali antara akun bersama pelapor dan akun PIC.

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

**Audionya dikirim sebagai jalur terpisah, bukan menyatu di dalam video.**
Berkas yang diputar di aplikasi trek audionya SENYAP; suaranya datang dari
`tutorial-narration.mp3` dan `tutorial-music.mp3` yang dibunyikan berdampingan
oleh pemutar. Itulah yang membuat slider volume di `/settingsapp` berpengaruh
langsung tanpa perlu me-render ulang videonya. Berkas 720p untuk diunduh justru
audionya menyatu, karena ditonton luring tanpa pemutar itu. Pola yang sama
dipakai video edukasi.

**Musiknya dari rekaman instrumen, bukan sintesis.** Nada ditulis sebagai MIDI
lalu dibunyikan FluidSynth memakai soundfont MuseScore General — pustaka berisi
contoh bunyi yang direkam dari piano, gitar, dawai, dan bas sungguhan. Perlu
jujur disebut: ini rekaman instrumen yang **dimainkan ulang**, bukan sesi
rekaman musisi; frasa dan dinamikanya tetap ditulis di `musik.py`.

## Urutan build

```bash
php    akun.php pasang PIC_INSPEKTORAT    # pinjam akun, sandinya dibuat acak
php    akun.php pasang mrkabarvip         # akun peninjau, untuk bab pembacaan data
python suara.py                           # narasi -> audio/*.mp3 + waktu.json
python suara.py --naskah naskah-lapor.json
node   pengendali.cjs --uji --bagian II   # uji satu bagian tanpa merekam
powershell -File rekam.ps1                # rekam seluruh bagian (~1 jam)
powershell -File rekam.ps1 -Mulai V       # atau lanjutkan dari bagian tertentu
python rakit.py                           # sambung gambar, narasi, subtitle, bab
python rakit.py --naskah naskah-lapor.json
python musik.py 3110                      # musik sepanjang video
python musik.py 775 lapor
bash   campur.sh tutorial                 # campur audio + mux + berkas 720p
bash   campur.sh lapor
bash   pasang.sh semua                    # pasang keduanya + build ulang bundel
php    bersihkan.php hapus                # BUANG seluruh data contoh
php    akun.php pulihkan                  # kembalikan sandi asli semua akun
```

Merekam video Lapor per bagian dari PowerShell (daftar bagiannya disebut di
luar skrip, karena PowerShell menggabungkan argumen larik jadi satu untai):

```powershell
foreach ($b in @('I','II','III','IV','V','VI')) {
  node pengendali.cjs --naskah naskah-lapor.json --bagian $b
}
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
| `pasang.sh` | pasang video, tiga jalur audio, subtitle, dan daftar bab; bangun ulang bundel |
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
  tanpa huruf non-ASCII; `2>&1` pada program native membuat keluaran biasa
  dianggap galat; dan argumen larik seperti `-Bagian I,II,III` digabung jadi
  satu untai berspasi.
- **Radix menyembunyikan input kotak centang aslinya di luar layar** dengan
  `transform: translateX(-100%)`, tetapi input itu MASIH BERUKURAN. Uji
  "terlihat" apa pun akan meloloskannya, dan klik ke koordinatnya mendarat
  entah di mana. Yang dicari harus `[role=checkbox]` lebih dulu.
- **Daftar pilihan yang panjang bergulir sendiri saat kursor melintasinya.**
  Pemilih perangkat daerah punya 50 butir; butir yang koordinatnya sudah
  dihitung sudah bergeser saat kursornya tiba. Untuk daftar seperti itu dipakai
  pencarian papan ketik (`lewatKetik`), bukan kursor.
- **Nama menu berulang di grup berbeda.** "Risiko" ada di Form Input dan di
  Form Cetak. Penelusuran menu karena itu dikurung ke dalam `<li>` grup yang
  sedang dibuka; grupnya ditandai LEBIH DULU, baru anaknya diperiksa.
- **Akun bersama LAPOR tidak bisa lewat formulir masuk biasa.** Jalur masuknya
  alamat kode QR, ditulis sebagai `masukLewat` pada bagiannya.
- **Zoom pada dialog harus menyasar dialognya**, bukan `#app` — dialog Radix
  digambar lewat portal di luar `#app`, jadi memperbesar `#app` tidak
  menyentuhnya sama sekali.

## Pengaturannya di aplikasi

Admin mengaturnya di `/settingsapp`, pada bagian **Video Tutorial Pengisian**
tepat di bawah bagian Video Edukasi. Isinya sejajar: sakelar tampil/sembunyi,
ganti berkas video sendiri, ganti berkas subtitle, sakelar dan ukuran subtitle,
serta volume mix — dengan pratinjau yang langsung mengikuti setelan sebelum
disimpan.

Satu perbedaan yang disengaja: **tidak ada slider efek suara.** Video tutorial
hanya punya dua lapisan audio, narasi dan musik. Jalur ketiga tetap dikirim
karena pemutar mengharapkan tiga, tetapi isinya senyap dan slidernya tidak
ditampilkan — menyediakan pengatur untuk lapisan yang tidak ada hanya
membingungkan.

Kolomnya terpisah dari kolom video edukasi (`tutorial_video_*` vs
`edu_video_*`) supaya mematikan salah satunya tidak ikut mematikan yang lain.

## Isi videonya

**Tutorial Pengisian**, sebelas bagian: sebelum mulai, Data Umum, CEE (1a-1d),
Risiko Strategis Pemda, Risiko Strategis PD, Risiko Operasional PD, monitoring
dan evaluasi, form cetak, laporan, membaca data dan mengambil keputusan,
penutup.

Bagian V.2 adalah intinya — satu risiko dikerjakan pelan dari kolom pertama
sampai skala target, setiap kolom dijelaskan alasannya, termasuk mengapa pada
skala target dampaknya tidak turun sementara kemungkinannya turun.

Bagian X dikerjakan dengan akun peninjau yang hanya-baca, dan membaca data
2025 yang sungguhan lewat penyaring tahun Dasbor — terpisah dari Tahun Aktif,
jadi tidak ada setelan global yang perlu diubah demi merekam.

**Tutorial Lapor**, enam bagian. Yang paling perlu dipahami bagian V: Formulir
10 menolak dicatat tanpa risiko terdaftar, sehingga kejadian yang risikonya
belum pernah didaftarkan memaksa PIC membuat risikonya dulu lengkap dengan
rencana tindaknya. Urutannya tidak bisa dibalik.
