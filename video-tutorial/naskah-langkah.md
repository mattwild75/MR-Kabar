# Naskah Langkah — Video Tutorial Pengisian MR Kabar

Rancangan untuk ditinjau **sebelum** ada satu pun yang direkam. Isinya bukan
naskah narasi, melainkan daftar tindakan: menu mana dibuka, kolom mana diisi,
apa yang diketik, dan **alasan** tiap isian — karena alasan itulah yang
dinarasikan, bukan sekadar "ketik ini lalu klik simpan".

## Keputusan yang sudah ditetapkan pemilik aplikasi

| Hal | Ketetapan |
|---|---|
| Akun perekam | `PIC_INSPEKTORAT` (OPD id 33, user id 13) |
| Tahun | 2026 |
| Sesudah rekaman | seluruh data yang dibuat **dihapus lagi** |
| Isi | realistis, bertolak dari data 2025 yang sudah ada, diperkuat rujukan nyata |
| Bentuk | **satu** video panjang, pemutar sama dengan video edukasi |
| Letak pemutar | **paling bawah** halaman `/panduan` |
| Suara | narasi campur laki-laki dan perempuan |
| Gerak | kursor, gulir, dan zoom seperti orang sungguhan |
| Musik | instrumen tersampel, bukan sintesis digital |

## Keadaan awal yang sudah diperiksa

- **Tahun 2026 masih kosong seluruhnya.** `tbl_irs_pemda`, `tbl_irs_pd`,
  `tbl_iro_pd`, `cee_jawaban`, dan `data_umum` semuanya hanya berisi 2025.
  Tahun aktif aplikasi sudah 2026. Jadi merekam ke 2026 tidak menimpa apa pun.
- **Inspektorat 2025** berisi 5 Risiko Strategis PD, 6 Risiko Operasional PD,
  1 baris KRS PD, 3 baris KRO PD, dan 74 jawaban CEE. Semuanya menjadi bahan.
- **Kuesioner CEE 37 pertanyaan** tersebar pada 8 unsur (4, 4, 8, 4, 3, 7, 5, 2).
- **I_a KRS_Pemda hanya bisa diisi admin**, bukan PIC. Di video ia ditampilkan
  sebagai bacaan, bukan diisi.

### Dua hal yang perlu Anda ketahui sebelum menyetujui

1. **Tabel konteks tidak bersekat tahun.** `tbl_krs_pd` dan `tbl_kro_pd` tidak
   punya kolom tahun. Jadi baris konteks yang dibuat saat merekam akan tampak
   berdampingan dengan baris 2025 selama rekaman berlangsung — bukan terpisah
   di tahun sendiri seperti data risiko. Ini hilang begitu barisnya dihapus,
   tetapi selama perekaman memang begitu keadaannya.
2. **Perekaman dilakukan di `mrkabar.test`** — basis data lokal di komputer
   ini, bukan yang dipakai para PIC. Kalau yang Anda maksud justru merekam di
   pemasangan yang dipakai bersama, tolong beri tahu; caranya sama, tetapi
   penghapusan sesudahnya jadi jauh lebih berisiko.

---

# Bagian I — Pembuka dan orientasi (±3 menit)

| # | Tindakan di layar | Yang dinarasikan |
|---|---|---|
| 1 | Halaman masuk `mrkabar.test`, versi aplikasi terlihat di kaki halaman | Video ini mengikuti satu OPD sungguhan mengisi satu tahun penuh, dari nol sampai laporan tercetak |
| 2 | Masuk sebagai `PIC_INSPEKTORAT` | Tiga jenis akun: PIC mengisi OPD-nya sendiri, Admin melihat semua OPD, peninjau hanya membaca |
| 3 | Dasbor terbuka, masih kosong untuk 2026 | Angka-angka ini akan terisi sendiri — tidak ada satu pun yang diketik langsung ke Dasbor |
| 4 | Penunjuk Tahun Aktif di kepala halaman | Semua yang diisi hari ini masuk ke tahun 2026; mengganti tahun aktif memindahkan seluruh tampilan, bukan menghapus |
| 5 | Gulir sidebar perlahan dari atas ke bawah | Urutan menu sidebar **adalah** urutan kerjanya: Form Input, lalu Monitoring, lalu Cetak. Ikuti dari atas ke bawah dan tidak akan ada yang terlewat |

Zoom pertama dipakai di langkah 4 — merapat ke penunjuk tahun supaya angkanya terbaca.

---

# Bagian II — Data Umum (±4 menit)

**Menu:** Form Input → Data Umum (`/data-umum`)

Diisi lebih dulu karena isinya menjadi kepala setiap Form Cetak dan blok tanda
tangan. Mengisinya belakangan berarti mencetak formulir tanpa identitas.

| Kolom | Diisi | Alasan yang dinarasikan |
|---|---|---|
| Pemerintah Kab/Kota | PEMERINTAH KABUPATEN ACEH BARAT | tetap untuk seluruh OPD |
| Nama Urusan | UNSUR PENGAWASAN URUSAN PEMERINTAHAN (PENUNJANG) | ditunjukkan bahwa kolom ini punya daftar usulan, tetapi tetap boleh diketik sendiri mengikuti dokumen resmi OPD |
| Nama Sub Urusan | INSPEKTORAT DAERAH | sama, daftar usulan hanya membantu |
| Nama Dinas/OPD | INSPEKTORAT KABUPATEN ACEH BARAT | ditulis lengkap karena inilah yang tercetak di kepala formulir |
| Periode Penilaian | 2025-2029 | **kesalahan tersering**: yang diminta periode **Renstra**, bukan tahun berjalan |
| Tahun Penilaian | 2026 | inilah yang tahunan, dan inilah yang menyekat data antar tahun |
| Kepala Daerah | TARMIZI, S.P., M.M — BUPATI ACEH BARAT | dipakai pada laporan tingkat Pemda |
| Kepala Dinas | ZAKARIA, S.E., CGCAE — INSPEKTUR KABUPATEN ACEH BARAT, NIP 19720504 200112 1 002 | penanda tangan formulir OPD |
| PIC | JUPRI FEBRIAN, A.Md. — AUDITOR TERAMPIL, NIP 19940207 202203 1 005 | yang mengisi, bukan yang menandatangani — dua hal berbeda |
| Dokumen sumber RSP | RPJMD Kabupaten Aceh Barat 2025-2029 | **satu-satunya bagian yang paling perlu dijelaskan**: tiga kolom dokumen sumber ini menandai tiga tingkatan risiko |
| Dokumen sumber RSO | Renstra Inspektorat 2025-2029 | risiko strategis OPD berasal dari Renstra, bukan RPJMD |
| Dokumen sumber ROO | Renja dan DPA Inspektorat Tahun 2026 | risiko operasional berasal dari kegiatan tahun berjalan |
| Tempat & Tanggal | MEULABOH, tanggal perekaman | tercetak di atas blok tanda tangan |
| Penandatangan | Sekretaris Inspektorat dan satu Irban | daftar penanda tangan per-PIC, bukan satu untuk seluruh Pemda |

**Gerak:** gulir halus mengikuti kolom yang sedang diisi; zoom pada tiga kolom
dokumen sumber saat menjelaskan pemetaan tiga tingkatan.

---

# Bagian III — CEE, empat formulir (±14 menit)

Ditempatkan sebelum penilaian risiko karena begitulah urutan Bab III Perdep:
kelemahan lingkungan pengendalian dikenali dulu, baru risiko dinilai.

## III.1 — 1a Kuesioner CEE (±5 menit) `/cee/1a`

37 pertanyaan pada 8 unsur. **Tidak semua ditunjukkan.** Empat dijawab pelan
dengan alasannya, sisanya dipercepat sambil narasi berjalan terus.

Empat yang dijelaskan, dipilih karena jawabannya tidak gamblang:

1. Satu butir **Penegakan Integritas dan Nilai Etika** — dijelaskan bahwa
   "ada aturannya" tidak sama dengan "dijalankan"; yang dinilai yang kedua.
2. Satu butir **Kepemimpinan yang Kondusif** (unsur terbanyak, 8 butir) —
   dijelaskan mengapa unsur ini paling berat bobotnya.
3. Satu butir **Perwujudan Peran APIP yang Efektif** — jujur bahwa Inspektorat
   sedang menilai dirinya sendiri di sini, dan justru karena itu harus hati-hati.
4. Satu butir **Hubungan Kerja dengan Instansi Terkait** (hanya 2 butir) —
   sedikit bukan berarti tidak penting.

**Gerak:** setelah butir keempat, kecepatan dinaikkan sampai akhir; narasi
tetap berjalan menjelaskan bahwa kuesioner ini diisi banyak responden, bukan
satu orang.

## III.2 — 1b CEE Berdasarkan Dokumen (±3 menit) `/cee/1b`

Tiga kelemahan dicatat, masing-masing dengan dokumen bukti:

| Kelemahan | Dari dokumen | Alasan |
|---|---|---|
| Belum ada penetapan berkala atas kode etik APIP kepada seluruh pegawai | dokumen kepegawaian dan notula rapat | menunjukkan kelemahan yang **terlihat di berkas** walau kuesioner menjawab "sudah ada" |
| Rasio auditor terhadap objek pengawasan belum ideal | Renstra dan data kepegawaian | ini yang nanti muncul lagi sebagai penyebab risiko — dan itu memang seharusnya |
| Tindak lanjut hasil pengawasan belum terjadwal dan terpantau | laporan TLHP tahun sebelumnya | menghubungkan langsung ke risiko strategis yang akan diisi nanti |

**Narasi utama:** 1b bukan pengulangan 1a. 1a menanyakan persepsi orang, 1b
memeriksa berkas. Keduanya sengaja dipisah supaya pertentangannya kelihatan.

## III.3 — 1c Simpulan Survei Persepsi (±3 menit) `/cee/1c`

Simpulan per unsur. Satu unsur sengaja dijadikan contoh **pertentangan**:
kuesioner menilai baik, dokumen menunjukkan lemah.

**Narasi utama:** kalau dua sumber bertentangan, yang diambil bukan yang lebih
enak dibaca. Bukti dokumen menang atas persepsi, dan alasan memilihnya ditulis
di kolom simpulan supaya penilai berikutnya tahu mengapa.

## III.4 — 1d RTP CEE (±3 menit) `/cee/1d`

Dua rencana tindak atas kelemahan yang disimpulkan:

1. Menyusun dan mensosialisasikan kode etik APIP disertai pernyataan tahunan —
   penanggung jawab Sekretaris Inspektorat, target Triwulan II 2026.
2. Menyusun jadwal pemantauan tindak lanjut hasil pengawasan berkala —
   penanggung jawab Irban Wilayah, target Triwulan III 2026.

**Narasi utama:** RTP CEE memperbaiki **lingkungan pengendalian**, bukan risiko
tertentu. RTP atas risiko datang belakangan di Form 7 dan tidak boleh sama —
kalau isinya sama persis, salah satu di antaranya pasti salah tempat.

---

# Bagian IV — Risiko Strategis Pemda (±5 menit)

## IV.1 — I_a KRS Pemda, dibaca saja `/krs_pemda`

**Tidak diisi.** Ditampilkan, digulir, dijelaskan bahwa tingkat ini diisi
Admin karena isinya lintas-OPD, dan PIC hanya membacanya sebagai acuan.

## IV.2 — I_b IRS Pemda, diisi satu baris `/irs_pemda`

Satu risiko strategis Pemda yang Inspektorat ikut memikulnya:

| Kolom | Isi |
|---|---|
| Sasaran RPJMD | Meningkatnya Transparansi Pengelolaan Anggaran |
| Uraian Risiko | Maturitas SPIP terintegrasi Pemerintah Kabupaten Aceh Barat tidak naik ke tingkat yang ditargetkan |
| Jenis Risiko | 35 - Pembinaan dan Pengawasan |
| Pemilik Risiko | Sekretaris Daerah |
| Penyebab | Men - Int (pemahaman SPIP berbasis risiko belum merata di seluruh OPD); Method - Int (penilaian mandiri belum berjalan berkala) |
| Dampak | Nilai maturitas SPIP dan kapabilitas APIP tertahan, kepercayaan atas pengelolaan anggaran menurun |

**Narasi utama:** mengapa yang tampak "urusan Inspektorat" justru diletakkan di
tingkat Pemda — karena pemilik risikonya Sekretaris Daerah, sedangkan
Inspektorat hanya salah satu pelaksana pengendaliannya. Di sinilah tiga peran
yang sering tertukar dijelaskan sambil menunjuk kolomnya: Pemilik Risiko,
Penanggung Jawab Pengendalian, dan Penanggung Jawab Pengelolaan Risiko.

---

# Bagian V — Risiko Strategis PD (±12 menit)

## V.1 — II_a KRS PD, konteks (±4 menit) `/krs_pd`

Satu baris hierarki penuh, mengikuti Renstra Inspektorat 2025-2029 dengan
angka 2026:

| Tingkat | Isi | Indikator | Baseline → Target |
|---|---|---|---|
| Sasaran RPJMD | Meningkatnya Transparansi Pengelolaan Anggaran | — | — |
| Tujuan Strategis PD | Terwujudnya Pengawasan Internal yang Efektif untuk Mendorong Transparansi dan Akuntabilitas Pengelolaan Keuangan Daerah | Skor Maturitas SPIP dan Level Kapabilitas APIP | Level 3 → Level 3+ |
| Sasaran Strategis PD | Meningkatnya Transparansi Pengelolaan Anggaran | Persentase Tindak Lanjut Rekomendasi Hasil Pengawasan | 72% → 90% |
| Program PD | Program Penyelenggaraan Pengawasan | Persentase OPD dengan Tingkat Kepatuhan Pengawasan Baik | 68% → 90% |
| Kegiatan PD | Penyelenggaraan Pengawasan Internal | Jumlah LHP Diselesaikan Sesuai PKPT | 42 LHP → 55 LHP |
| Subkegiatan PD | Pelaksanaan Pengawasan Internal secara Berkala | Jumlah OPD Diaudit Sesuai PKPT | 31 OPD → 49 OPD |

**Narasi utama:** baseline 2026 **bukan** baseline 2025 — ia realisasi 2025.
Ditunjukkan berdampingan dengan baris 2025 supaya kenaikannya terlihat, dan
dijelaskan bahwa menyalin baseline lama adalah kekeliruan yang paling sering
lolos karena tidak ada yang menolaknya.

Dijelaskan pula bahwa konteks **tidak bersekat tahun**: yang berganti tiap
tahun adalah risikonya, bukan hierarki Renstra-nya.

## V.2 — II_b IRS PD, satu risiko ditelusuri utuh (±8 menit) `/irs_pd`

**Inilah bagian terpenting dari seluruh video.** Satu risiko dikerjakan pelan
dari kolom pertama sampai skala target, dan setiap kolom dijelaskan alasannya.

Risiko yang dipakai — lanjutan sungguhan dari 2025 yang belum tuntas:

| Kolom | Isi | Alasan yang dinarasikan |
|---|---|---|
| Sasaran Renstra | Meningkatnya Transparansi Pengelolaan Anggaran | diambil dari baris konteks tadi, bukan diketik bebas — inilah yang menyambungkan dua formulir |
| Uraian Risiko | Rendahnya kepatuhan perangkat daerah dalam menindaklanjuti rekomendasi hasil pengawasan | ditulis sebagai **peristiwa yang bisa terjadi**, bukan sebagai keluhan atau sebagai penyebab. Ditunjukkan tiga rumusan salah yang sering dipakai, lalu mengapa yang ini benar |
| Tingkat Risiko | Risiko Strategis OPD | karena ia mengancam sasaran Renstra, bukan satu kegiatan |
| Jenis Risiko | 35 - Pembinaan dan Pengawasan | mengikuti nomenklatur urusan, bukan selera |
| Pemilik Risiko | Inspektur | yang sasarannya terancam, bukan yang mengerjakan |
| Uraian Penyebab | Men - Int (komitmen pimpinan PD belum merata); Method - Int (pemantauan TLHP belum terjadwal, sanksi atas keterlambatan belum ada) | dijelaskan penggolongan Men/Method/Machine dan Internal/Eksternal, lalu **mengapa penyebab harus bisa dikendalikan** kalau ingin ada RTP-nya |
| Sumber Sebab | Internal | konsekuensi dari dua penyebab di atas |
| C / UC | C | terkendali — inilah yang membuat RTP masuk akal disusun |
| Uraian Dampak | Transparansi dan akuntabilitas pengelolaan anggaran tidak meningkat; nilai MCP dan maturitas SPIP tertahan | dampak ditulis pada **sasaran**, bukan pada pekerjaan sehari-hari |
| Pihak Terkena Dampak | Inspektorat, Perangkat Daerah, Bupati, Publik | dipakai nanti untuk menentukan skala dampak |
| Pengendalian yang Sudah Ada | Pemantauan TLHP periodik dan penyampaian LHP kepada PD | ditulis apa adanya — melebih-lebihkannya membuat seluruh analisis meleset |
| Kategori Existing Control | KE — Kurang Efektif | dijelaskan TE / KE / E dan mengapa "sudah ada SOP" tidak otomatis berarti Efektif |
| Celah Pengendalian | e. Pengendalian sudah berjalan namun masih lemah | dijelaskan kelima kriteria celah, lalu mengapa yang dipilih huruf e |
| **Skala Inheren** | Dampak 4, Kemungkinan 5 → 23 | dinilai **seolah tidak ada pengendalian sama sekali**. Matriks dibuka, sel ditunjuk |
| **Skala Sekarang** | Dampak 3, Kemungkinan 4 → 16 | selisih inheren dan sekarang **adalah** nilai pengendalian yang sudah ada — kalau tidak ada selisihnya, pengendaliannya memang tidak bekerja |
| Skala Prioritas | terisi sendiri | tidak diketik; ditunjukkan bahwa aplikasi yang menghitung |
| RTP | Abate — menyusun mekanisme monev TLHP terjadwal, ekspose TLHP kepada Bupati, integrasi TLHP dalam penilaian kinerja PD | dijelaskan empat pilihan perlakuan dan mengapa Abate, bukan Accept |
| Kategori Proyeksi RTP | CE — Cukup Efektif | jujur: bukan "sangat efektif", karena kepatuhan OPD tidak sepenuhnya dalam kendali Inspektorat |
| Penanggung Jawab Pengendalian | Irban Wilayah | **bukan** Inspektur — di sinilah bedanya dengan Pemilik Risiko, ditunjuk berdampingan |
| Target | Triwulan IV 2026 | |
| **Skala Target** | Dampak 3, Kemungkinan 3 → 14 | dijelaskan mengapa **dampaknya tidak turun**: RTP ini menurunkan peluang kejadian, bukan akibatnya kalau tetap terjadi. Ini salah kaprah yang paling sering |

Sesudah Simpan: kembali ke daftar, tunjukkan barisnya muncul, warna
peringkatnya, dan kedudukannya terhadap Selera Risiko.

**Satu risiko kedua** diisi dengan kecepatan dinaikkan, narasi hanya menyebut
yang berbeda — untuk menunjukkan bahwa yang kedua jauh lebih cepat setelah
polanya dipahami.

---

# Bagian VI — Risiko Operasional PD (±9 menit)

## VI.1 — III_a KRO PD, konteks operasional (±3 menit) `/kro_pd`

Dua baris kegiatan dari DPA 2026:

1. Penyelenggaraan Pengawasan Internal → Pelaksanaan Pengawasan Internal
   secara Berkala
2. Penyelenggaraan Pengawasan dengan Tujuan Tertentu → Pelaksanaan Audit dengan
   Tujuan Tertentu dan Monitoring Tindak Lanjut

**Narasi utama:** beda KRS PD dan KRO PD dalam satu kalimat — KRS berhenti di
sasaran, KRO turun sampai kegiatan yang ada uangnya di DPA.

## VI.2 — III_b IRO PD, tiga risiko (±6 menit) `/iro_pd`

Satu dijelaskan pelan, dua dipercepat.

Yang dijelaskan pelan:

| Kolom | Isi |
|---|---|
| Kegiatan PD | Penyelenggaraan Pengawasan Internal |
| Tahap | Tahap Pengawasan / Monitoring |
| Uraian Risiko | Pelaksanaan pengawasan internal tidak sesuai dengan PKPT |
| Pemilik Risiko | Irban Wilayah I–IV |
| Penyebab | Men - Int (jumlah auditor terbatas); Method - Int (jadwal penugasan padat dan berbenturan) |
| C / UC | UC |
| Dampak | Ada OPD yang tidak terawasi sehingga peluang penyimpangan meningkat |
| Inheren | Dampak 5, Kemungkinan 5 → 25 |
| Sekarang | Dampak 5, Kemungkinan 4 → 24 |

**Narasi utama, dua hal:**

1. **Kolom Tahap** hanya ada di tingkat operasional. Dijelaskan mengapa: risiko
   operasional melekat pada langkah kegiatan, jadi perlu diketahui langkah
   mana.
2. **UC — tidak terkendali.** Ditunjukkan bahwa penyebabnya bukan sesuatu yang
   bisa diputuskan sendiri oleh Inspektorat, dan konsekuensinya RTP-nya bukan
   "menambah auditor" melainkan menyusun prioritas berbasis risiko. Ini
   pembeda paling berguna antara C dan UC, dan paling sering diisi asal.

---

# Bagian VII — Monitoring dan Evaluasi (±7 menit)

## VII.1 — Form 8-9 Monitoring RTP (±4 menit) `/monitoring-evaluasi/8-9`

RTP yang tadi disusun muncul di sini **tanpa diketik ulang**. Diisi realisasi
pengkomunikasian dan realisasi pemantauan untuk satu RTP.

**Narasi utama:** inilah alasan RTP tidak boleh ditulis sebagai kalimat niat
yang kabur. Kalau RTP-nya "meningkatkan koordinasi", tidak ada yang bisa
dilaporkan realisasinya di halaman ini.

## VII.2 — Form 10 Pencatatan Kejadian Risiko (±3 menit) `/monitoring-evaluasi/10`

Satu kejadian dicatat: keterlambatan penyelesaian LHP pada satu penugasan.

**Narasi utama:** bedanya risiko dan kejadian — yang satu belum terjadi, yang
satu sudah. Ditunjukkan juga menu Lapor Kejadian Risiko sebagai jalur bagi
pegawai yang tidak punya akun PIC.

---

# Bagian VIII — Form Cetak (±5 menit)

Dibuka berurutan, hanya yang kini berisi:

`2b` konteks strategis OPD → `3b` identifikasi strategis OPD → `4` hasil
analisis → `5` daftar risiko prioritas → `7` RTP atas risiko → `9` realisasi
pemantauan.

**Narasi utama:** tidak ada satu pun kolom di halaman ini yang diketik. Semua
berasal dari yang tadi diisi. Kalau ada yang kosong di sini, yang diperbaiki
adalah formulir asalnya, bukan halaman cetaknya.

Pada Form 5 dijelaskan mengapa sebagian risiko tidak muncul: Selera Risiko
Kabupaten Aceh Barat ditetapkan sampai dengan peringkat Sedang, sehingga hanya
Tinggi dan Sangat Tinggi yang masuk daftar prioritas.

Satu berkas diunduh sebagai PDF untuk menunjukkan hasil akhirnya.

---

# Bagian IX — Laporan (±4 menit)

Form 11 sampai 14 dibuka berurutan, dengan penjelasan **siapa** menyusun dan
**kapan** masing-masing:

| Form | Penyusun | Waktu |
|---|---|---|
| 11 Laporan Pelaksanaan Penilaian Risiko | OPD | sesudah penilaian risiko selesai |
| 12 Laporan Berkala Pengelolaan Risiko | OPD | berkala |
| 13 Laporan Pemantauan Unit Kepatuhan | unit kepatuhan | berkala |
| 14 Laporan Pembinaan Komite Pengelolaan Risiko | komite | berkala |

**Narasi utama:** Form 14 sering terlewat karena penyusunnya bukan OPD.

---

# Bagian X — Penutup (±5 menit)

1. **Dasbor** dibuka lagi. Angka yang tadi kosong kini terisi. Ditelusuri satu
   angka sampai ke barisnya.
2. **Visualisasi Hirarki** — hubungan Sasaran sampai Risiko sebagai bagan.
3. **Data Risiko Gabungan** — ketiga tingkat dalam satu tabel, dicari dengan
   kotak pencarian, lalu "Lihat Data" melompat ke barisnya dan menyorotinya.
4. **Data Terhapus** — ditunjukkan bahwa menghapus tidak berarti hilang, dan
   satu baris dipulihkan.
5. Kalimat penutup: urutan menu sidebar adalah urutan kerjanya.

---

# Perkiraan durasi

| Bagian | Menit |
|---|---|
| I Pembuka | 3 |
| II Data Umum | 4 |
| III CEE (empat formulir) | 14 |
| IV Risiko Strategis Pemda | 5 |
| V Risiko Strategis PD | 12 |
| VI Risiko Operasional PD | 9 |
| VII Monitoring dan Evaluasi | 7 |
| VIII Form Cetak | 5 |
| IX Laporan | 4 |
| X Penutup | 5 |
| **Jumlah** | **±68 menit** |

Lebih dari dua kali panjang video edukasi. Kalau terlalu panjang, yang paling
masuk akal dipangkas adalah Bagian III (kuesioner CEE dipercepat lebih awal)
dan Bagian IX — bisa turun ke sekitar 55 menit tanpa kehilangan satu langkah
pun.

---

# Cara merekamnya

## Kursor, gerak, dan zoom

Puppeteer menggerakkan tetikus sungguhan di dalam peramban, tetapi **kursornya
tidak ikut terekam** — perekam layar peramban hanya memotret isi halaman. Jadi
kursornya digambar sendiri sebagai lapisan di atas halaman, lalu digerakkan
mengikuti koordinat yang sama.

| Yang diminta | Cara |
|---|---|
| Gerak seperti tangan manusia | lintasan lengkung Bezier, bukan garis lurus; dipercepat di tengah dan diperlambat di ujung; sedikit melewati sasaran lalu dikoreksi; getaran halus beberapa piksel |
| Klik | lingkaran yang mengembang dan memudar di titik klik |
| Mengetik | jeda antar huruf berubah-ubah 40–140 milidetik, lebih lama sesudah tanda baca; sesekali salah ketik lalu dihapus |
| Menggulir | gulir bertahap dengan perlambatan di ujung, bukan lompat |
| Zoom | direkam pada 3840×2160, dikeluarkan 1080p — jadi merapat sampai dua kali lipat tetap tajam, dan zoom-nya dikerjakan saat penyuntingan bukan saat merekam |
| Sorotan kolom | cincin lembut di sekeliling kolom yang sedang diisi, pada lapisan yang sama dengan kursor |

## Musik instrumen sungguhan

Musik video edukasi memang sintesis murni `numpy` — sinus, FM, Karplus-Strong.
Tidak ada satu pun bunyi instrumen di dalamnya.

Untuk tutorial ini jalannya berbeda dan **sudah saya pastikan bisa**:
FluidSynth 2.5.7 untuk Windows tersedia sebagai berkas siap pakai, dan
dipasangkan dengan *soundfont* — pustaka berisi **rekaman instrumen sungguhan**,
satu contoh bunyi per nada, diambil dari piano, gitar, dawai, dan tiup yang
benar-benar dimainkan orang. Saya menulis nada-nadanya, FluidSynth
membunyikannya memakai rekaman itu.

Terus terang batasnya: ini rekaman instrumen sungguhan yang dimainkan ulang,
**bukan** sesi rekaman musisi. Frasa dan dinamikanya tetap saya yang susun.
Bedanya dengan musik video edukasi sangat terdengar — warna bunyinya nyata —
tetapi ia bukan musik yang dimainkan langsung.

Kalau yang Anda maksud benar-benar musik yang dimainkan orang, jalannya lain:
musik bebas royalti hasil rekaman studio. Itu bisa, hanya perlu Anda menyetujui
ketentuan lisensinya lebih dulu karena aplikasi ini milik pemerintah daerah.

## Suara narasi

Sama seperti video edukasi: dua suara Indonesia berganti-ganti, laki-laki dan
perempuan. Pembagiannya mengikuti isi — suara pertama membawa langkah, suara
kedua masuk pada penjelasan "mengapa".

## Pemutar di halaman panduan

Bagian baru di **paling bawah** `/panduan`, sesudah seluruh bagian panduan,
memakai pemutar yang sama dengan video edukasi berikut daftar bab, subtitle,
dan tombol unduh. Daftar babnya adalah sepuluh bagian di atas.

---

# Urutan kerja

| # | Tahap | Perlu keputusan Anda? |
|---|---|---|
| 1 | Naskah langkah ini disetujui atau dikoreksi | **ya, sekarang** |
| 2 | Naskah narasi ditulis lengkap per langkah | ya, ditinjau sebelum disuarakan |
| 3 | Skrip pengendali peramban ditulis dan diuji tanpa merekam | tidak |
| 4 | Perekaman per bagian, diulang kalau ada yang meleset | tidak |
| 5 | Narasi disuarakan, musik instrumen dibuat | tidak |
| 6 | Penyuntingan: zoom, sorotan, percepatan, judul bab | tidak |
| 7 | Render, gabung, pasang di `/panduan` | tidak |
| 8 | **Seluruh data 2026 hasil rekaman dihapus** | tidak, tetapi dilaporkan |
| 9 | Diperiksa di peramban | tidak |

Perkiraan waktu keseluruhan **10–14 jam**, sebagian besar tidak bisa
ditinggal berjalan sendiri seperti render video edukasi.

---

# Yang perlu Anda putuskan sebelum tahap 2

1. **Naskah langkah ini** — ada bagian yang salah, kurang, atau tidak perlu?
2. **Durasi 68 menit** diterima, atau dipangkas ke sekitar 55 menit?
3. **Musik** — soundfont instrumen tersampel, atau musik rekaman berlisensi?
4. **Isi 2026** — angka baseline yang saya naikkan (72%, 68%, 42 LHP, 31 OPD)
   adalah dugaan yang masuk akal, bukan realisasi 2025 yang sebenarnya. Kalau
   Anda punya angka realisasi 2025 yang benar, itu jauh lebih baik dipakai.
