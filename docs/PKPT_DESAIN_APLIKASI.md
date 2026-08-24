# Desain Aplikasi: PKPT Berbasis Risiko

Desain fitur **Miscellaneous → PKPT Berbasis Risiko**.

> **SUDAH DIBANGUN, 23 Agustus 2026.** 14 tabel, 13 model, 10 controller, 3 service,
> 40 rute, 12 halaman React, dan 14 formulir cetak. Diuji dengan 71 uji baru (suite
> 199 → 242), termasuk empat contoh perhitungan Perdep sendiri. Bagian yang berubah
> dari desain awal ditandai di tempatnya masing-masing.

Metodenya sudah ditetapkan lebih dahulu dalam rancangan **Keputusan Inspektur
Kabupaten Aceh Barat tentang Pedoman Perencanaan Pengawasan Berbasis Risiko**
(`Desktop/MR Kabar/PKPT Berbasis Risiko`), yang menurunkan Perdep PPKD BPKP Nomor 08
Tahun 2020. Aplikasi ini **melaksanakan** naskah itu, bukan menafsirkannya ulang:
setiap tabel, bobot, dan formulir di bawah menunjuk ke Tabel atau Formulir tertentu
dalam Lampiran Keputusan.

Rencana kesenjangan datanya ada di [PKPT_BERBASIS_RISIKO_PLAN.md](PKPT_BERBASIS_RISIKO_PLAN.md).

---

## 0. Enam keputusan desain yang menentukan sisanya

**1. PKPT bukan modul risiko, dan tidak boleh menumpang di menu risiko.**
Seluruh menu Form Input/Monitoring/Cetak MR Kabar bersifat *fail-open*
(`permission_name` kosong) karena setiap PIC OPD memang harus bisa membukanya.
PKPT kebalikannya: isinya penilaian Inspektorat atas OPD lain, termasuk temuan dan
potensi kecurangan. Seluruh menu PKPT **wajib berpagar permission**, dan itu satu-
satunya kelompok menu data di aplikasi ini yang begitu.

**2. Periode PKPT bukan tahun penilaian risiko.** MR Kabar memakai satu sumbu waktu:
`PengaturanPemda.tahun_penilaian`. PKPT butuh dua — PKPT tahun 2027 disusun dari data
risiko tahun 2026. Karena itu ada `pkpt_periode` dengan `tahun_pkpt` **dan**
`tahun_dasar_risiko`. Memaksakan satu sumbu akan membuat PKPT tahun depan menimpa
kertas kerja tahun ini.

**3. Hasil hitungan disimpan, bukan dihitung ulang tiap kali dibuka.** Kertas kerja
PKPT melekat pada Keputusan yang ditandatangani. Kalau bobot di Pengaturan diubah
tahun depan, dokumen yang sudah ditetapkan tidak boleh ikut berubah diam-diam. Maka
`pkpt_penilaian` menyimpan hasil, dan `pkpt_kematangan_mr` menyimpan bobot yang
berlaku saat itu — bukan hanya level-nya.

**4. Periode bisa dikunci.** Status `rancangan → ditetapkan → arsip`. Begitu
`ditetapkan`, seluruh tulis ditolak untuk periode itu. Tanpa ini, angka pada lampiran
Keputusan Inspektur dan angka di layar akan berbeda suatu hari, dan tidak ada yang
tahu kapan mulai berbeda.

**5. Kunci asing eksplisit, bukan kolom polimorfik.** `program_bupati_risiko` memakai
`risiko_tipe`/`risiko_id`, dan itu sebabnya barisnya tidak bisa dijaga kunci asing —
persoalan yang sudah terdata pada temuan R-08. Tabel baru memakai tiga kolom FK
nullable (`irs_pemda_id`, `irs_pd_id`, `iro_pd_id`) dengan CHECK "tepat satu terisi",
sehingga `cascadeOnDelete()` bekerja dan risiko yang dihapus tidak meninggalkan
evaluasi yatim.

**6. Data yang belum ada ditampilkan sebagai belum ada.** Pagu anggaran (FR 1, bobot
25%) memang tidak ada di basis data mana pun. Aplikasi tidak boleh mengarang nol atau
diam-diam memberi skala 1 — kolomnya kosong, skalanya null, dan panel Kesiapan Data
menyebut berapa persen bobot yang belum terpakai. Lihat Bagian 12.

---

## 1. Pohon menu

Diletakkan di bawah `Miscellaneous` (top-level order 7, `route '#'`, ikon
`MoreHorizontal`), sesudah dua menu Program Bupati yang sudah ada.

```
Miscellaneous
└── PKPT Berbasis Risiko                  #                       ClipboardList
    ├── Ikhtisar dan Periode              /pkpt                   LayoutDashboard
    ├── Form Input                        #                       PencilLine
    │   ├── 1_Peta Auditan                /pkpt/peta-auditan      Map
    │   ├── 2_Evaluasi Register Risiko    /pkpt/evaluasi-register SearchCheck
    │   ├── 3_Kematangan MR dan Bobot     /pkpt/kematangan-mr     Gauge
    │   ├── 4_Faktor Risiko               /pkpt/faktor-risiko     SlidersHorizontal
    │   └── 5_Penugasan Wajib             /pkpt/penugasan-wajib   Gavel
    ├── Form Perhitungan                  #                       Calculator
    │   ├── 6_Total Nilai Risiko          /pkpt/total-nilai       Sigma
    │   └── 7_Peringkat dan Frekuensi     /pkpt/peringkat         ListOrdered
    ├── Form Rencana                      #                       CalendarRange
    │   ├── 8_Kebijakan Pengawasan        /pkpt/jakwas            Compass
    │   └── 9_Program Kerja Tahunan       /pkpt/program-kerja     CalendarCheck
    ├── Form Cetak                        #                       Printer
    │   ├── Perencanaan Strategis         #                       Milestone
    │   │   ├── F1_Peta Auditan           /cetak/pkpt/f1
    │   │   ├── F2_Evaluasi Register      /cetak/pkpt/f2
    │   │   └── F3_Kematangan dan Bobot   /cetak/pkpt/f3
    │   ├── Faktor Risiko                 #                       SlidersHorizontal
    │   │   ├── F4_Anggaran               /cetak/pkpt/f4
    │   │   ├── F5_RPJMD, RPJMN, Unggulan /cetak/pkpt/f5
    │   │   ├── F6_Temuan dan Tindak Lanjut /cetak/pkpt/f6
    │   │   ├── F7_Isu Terkini            /cetak/pkpt/f7
    │   │   └── F8_Pertimbangan Lain      /cetak/pkpt/f8
    │   └── Prioritas dan Rencana         #                       Trophy
    │       ├── F9_Total Nilai Risiko     /cetak/pkpt/f9
    │       ├── F10_Peringkat 5 Tahun     /cetak/pkpt/f10
    │       ├── F11_Penugasan Wajib       /cetak/pkpt/f11
    │       ├── F12_Tidak Dimuat          /cetak/pkpt/f12
    │       ├── F13_Usulan Jakwas         /cetak/pkpt/f13
    │       └── F14_PKPT                  /cetak/pkpt/f14
    └── Pengaturan PPBR                   /pkpt/pengaturan        Settings2
```

29 baris menu. Pola Form Input / Form Cetak persis mengikuti MR Kabar, termasuk
penomoran di depan judul (`1_`, `F4_`) yang membuat urutan kerja terbaca dari sidebar
saja. Ikon dipilih yang benar-benar mendeskripsikan menunya, bukan generik.

Perhatikan **Form Perhitungan** — kelompok yang tidak ada padanannya di MR Kabar.
Isinya bukan tempat mengetik melainkan tempat melihat hasil dan menekan "Hitung
Ulang". Dipisahkan supaya jelas mana yang diisi orang dan mana yang dihitung mesin.

`MenuSeeder` diperluas dengan blok baru. Ingat catatan yang sudah ada di berkas itu:
nilai `order` top-level harus tetap sinkron; PKPT masuk sebagai anak `Miscellaneous`
(order 3 dan seterusnya), jadi tidak menyentuh urutan top-level sama sekali.

---

## 2. Alur kerja

Dua tahap Perdep, dipetakan ke menu:

```
TAHAP 1 — Perencanaan Pengawasan Strategis (sekali, dimutakhirkan tahunan)

  Ikhtisar → buat Periode PKPT (tahun_pkpt, tahun_dasar_risiko)
      │
      ├─ 1_Peta Auditan ........... tarik otomatis dari opd + tbl_krs_pemda +
      │                             program_pembangunan_bupati, lalu disunting
      ├─ 2_Evaluasi Register ...... baca risiko MR Kabar tahun dasar, Irban menilai
      │                             keandalannya, boleh mengoreksi skala
      └─ 3_Kematangan MR .......... tetapkan level 1-5 per SKPK; bobot terisi sendiri

TAHAP 2 — Perencanaan Pengawasan Tahunan

      ├─ 4_Faktor Risiko .......... FR1-FR5 per Area Pengawasan (5 tab)
      ├─ 5_Penugasan Wajib ........ yang wajib masuk & yang tidak dimuat
      │
      ├─ [Hitung Ulang] ........... PkptPerhitunganService menulis pkpt_penilaian
      │
      ├─ 6_Total Nilai Risiko ..... hasil per Area, bisa ditelusuri per komponen
      ├─ 7_Peringkat .............. urut, zona, frekuensi, centang rencana 5 tahun
      │
      ├─ 8_Jakwas ................. usulan kebijakan pengawasan
      └─ 9_Program Kerja Tahunan .. PKPT: jadwal, HP, anggaran, laporan
                    │
                    └─ Tetapkan Periode → seluruhnya terkunci, siap dilampirkan
```

Pembagian peran mengikuti Diktum KEEMPAT Keputusan: Sekretaris mengoordinasikan,
Subbagian Analisis dan Evaluasi menghimpun data faktor, Inspektur Pembantu I–IV dan
Khusus mengevaluasi register pada wilayah kerjanya, Inspektur menetapkan.

---

## 3. Skema basis data

Seluruh tabel baru memakai **`snake_case` standar** (gaya #3 pada
[KONVENSI_PENAMAAN_KOLOM.md](KONVENSI_PENAMAAN_KOLOM.md)) — ini tabel infrastruktur
baru, bukan tiruan sheet Excel/VBA, jadi tidak ada alasan memakai gaya "SPASI DAN
KAPITAL". Semua berawalan `pkpt_`. Semua punya `timestamps`; yang disunting orang
punya `deleted_at` (soft delete + masuk menu Data Terhapus).

### 3.1 Tabel operasional

| Tabel | Isi | Kolom pokok |
|---|---|---|
| `pkpt_periode` | satu siklus perencanaan | `tahun_pkpt`, `tahun_dasar_risiko`, `status` enum(rancangan/ditetapkan/arsip), `total_belanja_langsung` bigint null, `nomor_keputusan`, `tanggal_penetapan`, `ditetapkan_oleh` FK users |
| `pkpt_area_pengawasan` | Peta Auditan — **F1** | `periode_id`, `kelompok` enum(program_prioritas/skpk/unit_lain), `nama`, `tujuan_sasaran`, `opd_id` FK null, `opd_pendukung` text, `urusan`, `pagu_anggaran` bigint null, `irban` enum(I/II/III/IV/Khusus) null, `tahun_terakhir_diawasi` null, `jenis_penugasan_terakhir`, `keterangan`, `krs_pemda_id` FK null, `program_bupati_id` FK null |
| `pkpt_evaluasi_risiko` | hasil evaluasi register — **F2** | `periode_id`, `irs_pemda_id`/`irs_pd_id`/`iro_pd_id` FK null (CHECK tepat satu), `skala_dampak_evaluasi`, `skala_kemungkinan_evaluasi`, `nilai_risiko_evaluasi`, `simpulan` enum(andal/perlu_perbaikan), `catatan`, `dinilai_oleh` FK users |
| `pkpt_kematangan_mr` | level & bobot per SKPK — **F3** | `periode_id`, `opd_id` FK, `level_mr` tinyint null, `sumber_penetapan` enum, `skor_spip` decimal(3,2) null, `strategi_pengawasan` text, `bobot_register` tinyint, `bobot_faktor` tinyint, `keterangan`; unique(`periode_id`,`opd_id`) |
| `pkpt_faktor_risiko` | FR1–FR5 — **F4–F8** | satu baris per Area; lihat 3.2 |
| `pkpt_penilaian` | hasil hitung — **F9, F10** | `periode_id`, `area_id` unique, `level_mr`, `rld`, `rlk`, `nilai_komposit`, `skala_inheren`, `bobot_register`, `skala_fpm`, `bobot_faktor`, `total_nilai_risiko` decimal(4,2), `tingkat_risiko`, `zona`, `frekuensi`, `rencana_tahun` json, `dihitung_pada` |
| `pkpt_penugasan_wajib` | **F11 + F12** | `periode_id`, `jenis` enum(wajib/tidak_dimuat), `area_id` FK null, `nama_area`, `alasan`, `dasar_hukum`, `keterangan` |
| `pkpt_rencana` | **F13 + F14** | `periode_id`, `area_id` FK null, `nama_area`, `jenis_pengawasan`, `tujuan_sasaran`, `ruang_lingkup`, `rmp`, `rpl`, `hp_pj`, `hp_wpj`, `hp_kt`, `hp_at`, `hp_jumlah`, `anggaran` bigint, `jumlah_laporan`, `sarana_prasarana`, `tingkat_risiko`, `sumber` enum(risiko/wajib/permintaan) |

**F11 dan F12 satu tabel** karena bentuknya identik dan bedanya hanya alasan; begitu
pula **F13 dan F14** — Jakwas adalah PKPT tanpa kolom jadwal dan sumber daya, bukan
daftar yang berbeda. Menyimpannya terpisah akan membuat dua daftar yang harus
disinkronkan tangan.

`nama_area` sengaja ada di samping `area_id`: penugasan wajib seperti "Reviu LKPD"
adalah amanat peraturan, bukan Area Pengawasan hasil pemeringkatan, jadi tidak selalu
ada barisnya di Peta Auditan.

### 3.2 `pkpt_faktor_risiko` — lima formulir, satu tabel

F4–F8 semuanya satu baris per Area Pengawasan dengan kolom berbeda. Menyimpannya di
lima tabel berarti lima join hanya untuk menghitung satu angka di F9, dan lima
peluang baris hilang. Satu tabel, satu baris per Area:

```
periode_id, area_id (unique)

FR1  pagu_anggaran bigint null, persen_belanja_langsung decimal(6,3) null,
     skala_fr1 tinyint null
FR2  terkait_rpjmd bool, mendukung_rpjmn bool, sektor_unggulan bool,
     indikator_kinerja_skpk int null, indikator_kinerja_pemda int null,
     nilai_fr2 tinyint, skala_fr2 tinyint null
FR3  temuan_internal_kurang bool, temuan_eksternal_kurang bool,
     potensi_fraud bool, kasus_hukum bool, nilai_fr3, skala_fr3
FR4  sorotan_masyarakat bool, isu_nasional bool, layanan_publik bool,
     hajat_hidup bool, nilai_fr4, skala_fr4, sumber_isu text
FR5  tahun_terakhir_diawasi int null, skala_tahun_terakhir tinyint null,
     jumlah_penugasan_sejenis int null, skala_pengalaman tinyint null,
     skala_fr5 decimal(3,2) null

catatan_profesional text null
```

`skala_*` **nullable**, dan itu disengaja: null berarti "datanya belum ada", berbeda
dari 1 yang berarti "sudah dinilai, hasilnya terendah". Perbedaan itu yang dipakai
panel Kesiapan Data.

`catatan_profesional` wajib diisi kalau ada skala yang ditetapkan tanpa data
pendukung — persis yang dituntut BAB V huruf A Lampiran Keputusan. Ditegakkan di
`PkptFaktorRisikoController::update()`, bukan hanya diingatkan di layar.

Keadaan itu ternyata hanya SATU: FR2 Area kelompok SKPK yang rasio indikator
kinerjanya belum ada, sehingga dinilai dari kombinasi centang. Faktor lain tidak
menuntut catatan karena cara penilaiannya memang yang diminta Tabel 9, bukan
pengganti. Predikatnya hidup di `PkptPerhitunganService::fr2LewatCadangan()` supaya
controller dan layar memakai satu rumusan yang sama.

### 3.3 Tabel acuan (Pengaturan PPBR)

Mengikuti pola `RiskLevel`/`RiskMatrixCell` yang sudah ada: tabel acuan sungguhan
dengan `CACHE_KEY` dan `Cache::forget()` pada `saved`/`deleted`.

| Tabel | Menurunkan | Baris |
|---|---|---|
| `pkpt_bobot_kematangan` | Tabel 3, 5, 6 | 5 (+1 untuk "belum ada MR") — `level_mr`, `sebutan`, `karakteristik`, `strategi_assurance`, `strategi_consulting`, `bobot_register`, `bobot_faktor` |
| `pkpt_konversi_inheren` | Tabel 7 | 5 — `skala`, `nilai_min`, `nilai_max` |
| `pkpt_faktor` | Tabel 8 + 9 | 5 — `kode` FR1–FR5, `nama`, `bobot_persen`, `tipe_penilaian` enum(persentase/centang/tahun), `kriteria` json (uraian skala 1–5) |
| `pkpt_zona_frekuensi` | Tabel 10 | 3 — `zona`, `batas_bawah`, `batas_atas`, `tingkat_risiko`, `frekuensi`, `warna` |
| `pkpt_sektor_unggulan` | penetapan daerah | n — `periode_id`, `nama` |

**Kenapa bisa disunting sama sekali?** Karena Keputusan Inspektur yang menetapkan
angkanya, dan Keputusan bisa diubah. Yang tidak boleh adalah perubahan itu merambat
mundur ke periode yang sudah ditetapkan — dicegah oleh keputusan desain nomor 3.

Peringatan yang sama seperti pada migrasi kontras warna: perubahan lewat query builder
**tidak** memicu event model, jadi setiap seeder atau migrasi yang menyentuh tabel ini
harus memanggil `Cache::forget()` sendiri.

---

## 4. Rute

Di dalam grup `Route::middleware(['auth', 'menu.permission'])` yang sudah ada.

```php
// Periode & ikhtisar
GET    pkpt                              PkptPeriodeController@index
POST   pkpt/periode                      PkptPeriodeController@store
PUT    pkpt/periode/{periode}            PkptPeriodeController@update
POST   pkpt/periode/{periode}/tetapkan   PkptPeriodeController@tetapkan
POST   pkpt/periode/{periode}/buka       PkptPeriodeController@bukaKembali   // super-admin

// Form Input
GET    pkpt/peta-auditan                 PkptPetaAuditanController@index
POST   pkpt/peta-auditan                 @store
PUT    pkpt/peta-auditan/{area}          @update
DELETE pkpt/peta-auditan/{area}          @destroy
POST   pkpt/peta-auditan/tarik           @tarik      // hasilkan dari data yang ada

GET    pkpt/evaluasi-register            PkptEvaluasiRisikoController@index
PUT    pkpt/evaluasi-register/{risiko}   @update
POST   pkpt/evaluasi-register/terima     @terimaSemua  // tandai andal massal

GET    pkpt/kematangan-mr                PkptKematanganController@index
PUT    pkpt/kematangan-mr/{opd}          @update
POST   pkpt/kematangan-mr/adopsi-spip    @adopsiSpip

GET    pkpt/faktor-risiko                PkptFaktorRisikoController@index
PUT    pkpt/faktor-risiko/{area}         @update

GET    pkpt/penugasan-wajib              PkptPenugasanWajibController@index
POST|PUT|DELETE ...                      @store @update @destroy

// Perhitungan
POST   pkpt/hitung                       PkptPenilaianController@hitung
GET    pkpt/total-nilai                  PkptPenilaianController@totalNilai
GET    pkpt/peringkat                    PkptPenilaianController@peringkat
PUT    pkpt/peringkat/{penilaian}/tahun  PkptPenilaianController@simpanRencanaTahun

// Rencana
GET    pkpt/jakwas                       PkptRencanaController@jakwas
GET    pkpt/program-kerja                PkptRencanaController@programKerja
POST   pkpt/rencana                      @store
POST   pkpt/rencana/tarik-peringkat      @tarikDariPeringkat
PUT    pkpt/rencana/{rencana}            @update
DELETE pkpt/rencana/{rencana}            @destroy

// Pengaturan
GET    pkpt/pengaturan                   PkptPengaturanController@index
POST   pkpt/pengaturan                   @update

// Cetak — 14 pasang, pola sama persis dengan cetak/laporan/*
GET    cetak/pkpt/f{n}                   CetakPkptController@cetak{n}
GET    cetak/pkpt/f{n}/pdf               CetakPkptController@pdf{n}
```

Periode aktif dibawa lewat query `?periode=` dengan cadangan periode
`rancangan` terbaru, seperti `?tahun=` pada Form Cetak yang sudah ada.

---

## 5. Controller dan Service

```
app/Http/Controllers/
  PkptPeriodeController          ikhtisar, buat/kunci periode
  PkptPetaAuditanController      F1
  PkptEvaluasiRisikoController   F2
  PkptKematanganController       F3
  PkptFaktorRisikoController     F4-F8
  PkptPenugasanWajibController   F11-F12
  PkptPenilaianController        hitung, F9, F10
  PkptRencanaController          F13-F14
  PkptPengaturanController       tabel acuan
  CetakPkptController            14 cetak + 14 pdf

app/Http/Controllers/Concerns/
  MenjagaPeriodePkpt             satu tempat penolakan tulis ke periode terkunci

app/Services/
  PkptPerhitunganService         seluruh rumus (Bagian 9)
  PkptPetaAuditanService         penarikan Peta Auditan dari data yang ada
  PkptKesiapanService            hitung kelengkapan data (Bagian 12)
```

`CetakPkptController` memakai `SharesCetakContext` yang sudah ada untuk kepala
naskah dan blok tanda tangan dari Data Umum, dan `PdfPrintService::downloadFromUrl()`
untuk PDF-nya — **tidak** membuat Blade `pdf-*.blade.php` baru. Preset itu keputusan
permanen yang sudah tercatat.

`PkptPerhitunganService` sengaja dipisah dari controller dengan alasan yang sama
seperti `RiskReferenceDataService`: aturannya dipakai di banyak tempat (halaman
hitung, tiga halaman cetak, panel kesiapan), dan menyalinnya sebelas kali adalah
persis cacat yang ditemukan sebagai temuan R-16.

---

## 6. Halaman React

```
resources/js/pages/pkpt/
  Ikhtisar.tsx           kartu periode, panel Kesiapan Data, tombol Hitung Ulang
  PetaAuditan.tsx        tabel sunting-di-tempat + tombol "Tarik dari data"
  EvaluasiRegister.tsx   dua kolom: register MR Kabar | penilaian Inspektorat
  KematanganMr.tsx       49 SKPK, level, bobot terisi sendiri
  FaktorRisiko.tsx       5 tab (FR1..FR5), satu tabel per tab
  PenugasanWajib.tsx     2 tab (Wajib | Tidak Dimuat)
  TotalNilaiRisiko.tsx   hasil + penelusuran komponen per Area
  Peringkat.tsx          urut + zona berwarna + centang rencana 5 tahun
  Jakwas.tsx             usulan kebijakan
  ProgramKerja.tsx       PKPT
  Pengaturan.tsx         4 tabel acuan + sektor unggulan
  cetak/F1.tsx .. F14.tsx
```

Komponen yang dipakai ulang apa adanya: `sortable-th`, `highlight-text`,
`tahun-aktif-badge` (varian periode), `opd-fill-status-panel` (pola panel kesiapan),
dan seluruh primitif shadcn.

Halaman cetak wajib mengikuti preset yang sudah berlaku: toolbar dibungkus
`print:hidden`, dan gaya cetaknya sendiri di dalam komponen —

```css
@media print { @page { size: 216mm 330mm landscape; margin: 22mm 20mm 22mm 25mm; } }
```

Ukuran itu bukan pilihan bebas: F4 bentang dengan margin 25/20/22/22 adalah persis
seksi Lampiran Keputusan, sehingga hasil cetak aplikasi bisa langsung disandingkan
dengan naskahnya tanpa perbedaan lebar kolom.

---

## 7. Hak akses

Kelompok permission baru pada `RolePermissionSeeder`:

| Permission | Untuk |
|---|---|
| `pkpt-view` | membuka seluruh menu PKPT, membaca |
| `pkpt-input` | mengisi F1–F8, F11–F12 |
| `pkpt-hitung` | menekan Hitung Ulang |
| `pkpt-rencana` | menyusun Jakwas dan PKPT |
| `pkpt-tetapkan` | mengunci periode |
| `pkpt-pengaturan` | mengubah bobot dan kriteria |

Peran baru **`apip`** — pegawai Inspektorat — memperoleh `pkpt-view`, `pkpt-input`,
`pkpt-hitung`, `pkpt-rencana`. `pkpt-tetapkan` dan `pkpt-pengaturan` hanya untuk
`admin` dan `super-admin`, karena keduanya menyangkut angka yang tercantum dalam
Keputusan Inspektur.

**Perubahan dari desain awal.** Peran `apip` semula hanya dapat membuka menu PKPT.
Atas permintaan pemilik aplikasi, cakupan bacanya diperluas menjadi sama dengan akun
peninjau: seluruh data risiko lintas-OPD, Dasbor, Form Input, Monitoring, Cetak,
Visualisasi, Keterangan Pendukung, File Manager, dan Users. Alasannya masuk akal —
bahan perencanaan pengawasan adalah register risiko itu sendiri, dan APIP yang hanya
bisa membuka menu PKPT akan menyusun peringkat tanpa pernah melihat register yang
diperingkatnya.

Yang menahan hak tulisnya bukan permission melainkan middleware `ViewerReadOnly`
yang sudah ada, diperluas mencakup `apip` dengan satu pengecualian: rute bernama
`pkpt.*`. Satu penjaga, satu titik — sesuai alasan yang sudah tertulis di kepala
berkas itu, bahwa aturan yang tersebar akan bocor pada rute baru yang lupa diperiksa.

`admin` dan `super-admin` membuka seluruh menu PKPT tanpa tambahan apa pun:
super-admin lewat `Gate::before`, admin lewat perannya.

`MembatasiAksesOpd` **tidak** dipakai di sini. Pembatasan per-OPD adalah inti
keamanan modul risiko, tetapi PKPT memang lintas-OPD menurut sifatnya — pagarnya
permission, bukan kepemilikan baris. Diuji tersendiri: `PkptAksesTest` membuktikan
PIC OPD biasa mendapat 403 di setiap rute `pkpt/*`, dan peran `eksekutif` tetap
ditolak menulis di PKPT meski menumpang penjaga yang sama dengan `apip`.

### Berkas MR Kabar yang akhirnya tersentuh

Modul ini dirancang tidak mengubah berkas MR Kabar mana pun, dan sampai perluasan
cakupan baca `apip` memang begitu. Sesudahnya, lima berkas tersentuh — seluruhnya
karena permintaan itu, bukan karena PKPT-nya:

| Berkas | Perubahan |
|---|---|
| `routes/web.php` | satu baris `require __DIR__.'/pkpt.php'` |
| `app/Models/User.php` | `canViewAllOpd()` dan `isViewerOnly()` mencakup `apip`; tambah `isApip()` |
| `app/Http/Middleware/ViewerReadOnly.php` | mencakup `apip`, mengecualikan rute `pkpt.*` |
| `app/Http/Middleware/HandleInertiaRequests.php` | membagikan penanda `isApip` |
| `resources/js/app.tsx`, `hooks/use-viewer.ts`, `layouts/app/app-sidebar-layout.tsx` | pita "Mode APIP" dan pengecualian penjaga sisi klien |

`MenuSeeder.php` dan `RolePermissionSeeder.php` **tidak** disentuh: menu dan
permission PKPT punya seeder sendiri.

---

## 8. Penyambungan ke data MR Kabar

Ini bagian yang paling mudah salah, jadi aturannya ditulis eksplisit.

**Sumber nilai risiko inheren.** `SKALA DAMPAK INHEREN` dan `SKALA KEMUNGKINAN
INHEREN` pada `tbl_irs_pemda`, `tbl_irs_pd`, `tbl_iro_pd`, disaring
`TAHUN DINILAI RISIKO = periode.tahun_dasar_risiko` dan `deleted_at IS NULL`.
Terukur 22 Agustus 2026: 258 baris, seluruhnya terisi.

**Risiko mana milik Area Pengawasan mana:**

| Kelompok Area | Aturan |
|---|---|
| `skpk` | seluruh risiko yang `users.opd_id = area.opd_id` |
| `program_prioritas` dari `krs_pemda_id` | risiko `tbl_irs_pemda` yang `SASARAN RPJMD` cocok dengan baris KRS Pemda itu |
| `program_prioritas` dari `program_bupati_id` | lewat pivot `program_bupati_risiko` yang sudah ada (307 baris) |
| `unit_lain` | ditetapkan tangan pada Peta Auditan |

Pencocokan teks **wajib case-insensitive**. Ini bukan kehati-hatian berlebihan:
risiko pernah benar-benar hilang dari tabel gabungan karena Sasaran/Kegiatan berbeda
kapitalisasi, dan perbaikannya adalah `matchKey` yang menormalkan sebelum
membandingkan. Pakai ulang pola itu, jangan `=` biasa.

**Skala mana yang dipakai.** Kalau ada baris `pkpt_evaluasi_risiko` untuk risiko itu,
pakai `skala_*_evaluasi`; kalau tidak, pakai skala inheren apa adanya. Perdep
mengizinkan pemakaian langsung hanya untuk satuan kerja Level 4–5; untuk di bawahnya
aplikasi menandai Area yang registernya belum dievaluasi supaya tidak lolos diam-diam.

**Yang tidak boleh.** PKPT hanya membaca tabel risiko. Tidak ada satu pun jalur tulis
dari modul PKPT ke `tbl_*`, dan `tbl_krs_pemda` tetap tidak boleh disentuh seeder
mana pun.

---

## 9. Perhitungan

Seluruhnya di `PkptPerhitunganService`, sesuai BAB IV Lampiran Keputusan.

```
1. Nilai risiko komposit per Area
      RLD = rata-rata skala dampak seluruh risiko Area
      RLK = rata-rata skala kemungkinan seluruh risiko Area
      nilai_komposit = RLD x RLK                             (Formulir 9 kolom f)

2. Skala risiko inheren                                      (Tabel 7)
      1-5 → 1   6-10 → 2   11-15 → 3   16-20 → 4   21-25 → 5

3. Skala tiap faktor                                         (Tabel 9)
      FR1  dari persen anggaran terhadap belanja langsung
      FR2  dari jumlah centang (0-3), atau rasio indikator kinerja untuk SKPK
      FR3  dari jumlah kondisi terpenuhi (0-4)
      FR4  dari jumlah kondisi terpenuhi (0-4)
      FR5  gabungan skala tahun terakhir (10%) dan pengalaman SDM (5%)

4. Skala gabungan Faktor Pertimbangan Manajemen              (Tabel 8)
      skala_fpm = Σ (skala_FRi x bobot_FRi)
                  bobot 25 / 25 / 20 / 15 / 15 persen

5. Total Nilai Risiko                                        (Tabel 6)
      total = (skala_inheren x bobot_register)
            + (skala_fpm     x bobot_faktor)
      bobot menurut level kematangan MR:
            Level 1-2 → 40 : 60      Level 4-5 → 90 : 10
            Level 3   → 70 : 30      belum ada →  0 : 100

6. Zona dan frekuensi                                        (Tabel 10)
      > 3,00 s.d 5,00  Merah   setiap tahun
      > 2,00 s.d 3,00  Kuning  setiap 2 sampai 3 tahun
        1,00 s.d 2,00  Hijau   setiap 4 sampai 5 tahun
```

**Faktor yang datanya belum ada.** Skala null tidak dihitung sebagai nol. Bobotnya
dikeluarkan dari pembagi dan skala_fpm dinormalkan terhadap bobot yang benar-benar
terisi, lalu porsi bobot yang hilang dicatat pada `pkpt_penilaian` dan ditampilkan di
kolom keterangan. Memperlakukan data yang belum ada sebagai risiko terendah akan
membuat OPD yang datanya paling tidak lengkap tampak paling aman — kebalikan dari
yang benar.

**Penugasan atas permintaan.** Area yang punya baris `pkpt_penugasan_wajib`
berjenis `wajib` langsung masuk `pkpt_rencana` tanpa memperhatikan Total Nilai
Risikonya, sesuai Diktum KELIMA. Ia tetap diberi nilai dan peringkat, tetapi
peringkatnya tidak menentukan apakah ia dikerjakan.

---

## 10. Form Cetak

14 halaman, satu per formulir, memakai preset Browsershot yang sudah berlaku.
Susunannya persis Lampiran Keputusan: baris kepala berlatar abu-abu yang berulang tiap
halaman, baris huruf kolom (a, b, c, …), lalu isi. Baris contoh **tidak** ikut dicetak
di aplikasi — di naskah Keputusan ia contoh pengisian, di sini datanya sungguhan.

Kepala kertas kerja tiap formulir memuat nama Pemerintah Kabupaten, nama kertas kerja,
periode PKPT, dan blok tanda tangan penyusun serta penelaah — sumbernya Data Umum
Inspektorat yang sudah ada, lewat `SharesCetakContext`.

Ingat batas yang sudah terukur: `PdfPrintService` hanya melayani **satu** pencetakan
pada satu waktu dan menolak cepat sisanya. F10 dan F14 berpotensi puluhan baris; itu
masih jauh di bawah beban yang pernah membuat Chromium gagal, tetapi tetap harus lewat
kunci yang sama, jangan dilewati.

**Sudah masuk dasar ukur `php artisan volume:periksa` — dan dugaan di paragraf ini
ternyata keliru.** Perkiraan semula: Peta Auditan dan F9 akan menjadi halaman
terberat aplikasi karena barisnya paling banyak. Setelah diukur pada data sungguhan
(23 Agustus 2026), yang terjadi sebaliknya:

| Halaman | Baris | Perkiraan | % ambang |
|---|---|---|---|
| Monitoring 8-9 (lama) | 258 | 1.530 KB | 50% |
| KRS/IRS Pemda (lama) | 372 | 975 KB | 32% |
| PKPT Total Nilai | 300 | 377 KB | 12% |
| PKPT Peta Auditan | 300 | 264 KB | 9% |
| PKPT Cetak F9 | 300 | 105 KB | 3% |

Tiga ratus baris berkolom pendek jauh lebih ringan daripada 258 baris register risiko
yang berkolom teks panjang. Yang memegang rekor tetap Monitoring 8-9. Kelima halaman
PKPT sudah tercatat di `PeriksaVolumeHalaman::DASAR` supaya tetap terukur ulang.

---

## 11. Penguncian periode

`MenjagaPeriodePkpt` dipanggil di setiap method tulis:

```php
if ($periode->status !== 'rancangan') {
    abort(423, 'Periode PKPT ... sudah ditetapkan dan tidak dapat diubah.');
}
```

Membuka kembali periode yang sudah ditetapkan hanya boleh `super-admin`, tercatat di
Audit Log, dan mengharuskan alasan — karena artinya dokumen yang sudah ditandatangani
akan berubah.

`GlobalActivityLogger` dipasang pada seluruh model PKPT, seperti model risiko.

---

## 12. Panel Kesiapan Data

Di halaman Ikhtisar, satu tabel yang menjawab satu pertanyaan: **berapa persen bobot
yang benar-benar terpakai?**

```
Register Risiko             30 dari  49 SKPK punya register      61%
Kematangan MR                0 dari  49 SKPK ditetapkan           0%  <- memblokir hitung
FR1 Anggaran     bobot 25%    0 dari 200 Area terisi              0%
FR2 RPJMD/RPJMN  bobot 25%   belum ada penanda sektor unggulan     -
FR3 Temuan       bobot 20%    0 dari 200 Area terisi              0%
FR4 Isu Terkini  bobot 15%    0 dari 200 Area terisi              0%
FR5 Pertimbangan bobot 15%    0 dari 200 Area terisi              0%
                             ------------------------------------------
                             bobot faktor yang terpakai:          0%
```

Angka 200 itu perkiraan cakupan Peta Auditan pada saat penarikan pertama: 49 SKPK
ditambah 151 Program Prioritas unik pada `tbl_krs_pemda`, sebagian beririsan dengan
100 Program Pembangunan Bupati sehingga hasil akhirnya sedikit di bawah 200.

Panel ini bukan hiasan. Tanpa `pkpt_kematangan_mr` tidak ada bobot sama sekali,
sehingga tombol Hitung Ulang harus **dinonaktifkan** sampai kolom itu terisi — dengan
alasan yang tertulis, bukan tombol mati tanpa penjelasan.

---

## 13. Tahapan pengerjaan

| Tahap | Isi | Bisa dipakai setelahnya |
|---|---|---|
| A | migrasi 13 tabel, model, seeder tabel acuan, `MenuSeeder`, permission, peran `apip` | belum |
| B | Ikhtisar + Periode + Pengaturan PPBR | mengatur bobot |
| C | F1 Peta Auditan + penarikan otomatis | daftar auditan tersusun |
| D | F3 Kematangan MR + F2 Evaluasi Register | bobot per SKPK tertetapkan |
| E | F4–F8 Faktor Risiko + panel Kesiapan | seluruh masukan lengkap |
| F | `PkptPerhitunganService` + F9 + F10 | **peringkat berbasis risiko jadi** |
| G | F11–F12, F13 Jakwas, F14 PKPT | PKPT tersusun |
| H | 14 halaman cetak + PDF | siap dilampirkan Keputusan |

Tahap F adalah titik ketika fiturnya mulai berguna; A–E semuanya prasyarat. Tahap H
bisa ditunda tanpa memblokir apa pun — hasilnya sudah bisa dilihat di layar.

Uji yang wajib ada, bukan pelengkap: penolakan 403 untuk PIC OPD di seluruh rute
`pkpt/*`; penolakan 423 untuk tulis ke periode terkunci; pencocokan Area–risiko yang
tidak peka kapitalisasi; dan perhitungan Total Nilai Risiko yang cocok dengan contoh
pada BAB IV huruf C Lampiran Keputusan — (4 × 70%) + (3,0 × 30%) = 3,70.

---

## 14. Yang sengaja tidak dibangun

- **Integrasi otomatis temuan dan tindak lanjut.** FR3 diisi tangan. Sumbernya sistem
  pengawasan yang terpisah; menyambungnya adalah keputusan tersendiri, bukan bagian
  fitur ini.
- **Penilaian maturitas SPIP di dalam aplikasi.** Yang disimpan skornya, bukan
  prosesnya. Penilaian maturitas punya pedomannya sendiri dan bukan lingkup MR Kabar.
- **Kertas kerja pelaksanaan penugasan.** PKPT berhenti di *rencana*. Surat tugas,
  program kerja penugasan, dan laporan hasil pengawasan ada di ranah aplikasi
  administrasi Inspektorat, bukan di sini.
- **Impor Excel.** Belum ada bentuk bakunya. Ditunda sampai ada permintaan nyata.
